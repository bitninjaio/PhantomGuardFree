// WordPress Admin-AJAX API utilities

// Admin-AJAX helper for WordPress endpoints
export async function adminAjax(action, payload = {}, nonce) {
  // 1. Get the WordPress Admin-AJAX URL
  const ajaxUrl = window.phguardData?.ajaxUrl || '/wp-admin/admin-ajax.php';
  
  // 2. Create URLSearchParams for form-encoded data
  const params = new URLSearchParams();
  params.append('action', action);  // Required: tells WordPress which PHP function to call
  
  // 3. Add security nonce if provided
  if (nonce) params.append('nonce', nonce);
  
  // 4. Convert payload object to form data
  Object.entries(payload || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      params.append(key, String(value));
    }
  });

  // 5. Make the request with proper headers
  const response = await fetch(ajaxUrl, {
    method: 'POST',
    credentials: 'same-origin',  // Include cookies for WordPress authentication
    headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
    body: params.toString()  // Form-encoded string, not JSON
  });

  // 6. Handle WordPress response format
  const data = await response.json().catch(() => ({}));
  
  if (!response.ok) {
    throw new Error(data?.data?.message || 'Admin AJAX error');
  }
  return data;
}


