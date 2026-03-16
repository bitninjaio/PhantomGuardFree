import React, { createContext, useContext, useState, useCallback, useMemo, useRef } from 'react';

const LicenseContext = createContext(null);

export const LicenseProvider = ({ children }) => {
  const [isLicenseActive, setIsLicenseActive] = useState(true); // Default to true, will be updated by API calls
  const [licenseError, setLicenseError] = useState(null);

  // Use refs to store stable function references
  const checkLicenseErrorRef = useRef((response) => {
    if (!response) {
      return false;
    }

    // Check license validation status from license info response
    // Only check this for phantom_guard_get_license_info responses
    if (response?.success && response?.data?.validation !== undefined) {
      const validation = response.data.validation;
      const hasLicense = response.data.has_license;
      
      // Check if license is actually valid
      // License is active if: has_license is true AND validation.status is 'valid'
      const isLicenseValid = hasLicense === true && validation?.status === 'valid';
      
      // Update state based on license validity
      setIsLicenseActive(prev => {
        if (isLicenseValid !== prev) {
          if (isLicenseValid) {
            setLicenseError(null);
            return true;
          } else {
            // License is not valid - set appropriate error message
            const status = validation?.status || 'missing';
            const errorMessage = validation?.message || 'License is not active';
            setLicenseError(errorMessage);
            return false;
          }
        }
        return prev;
      });
      
      return !isLicenseValid; // Return true if license error detected
    }
    
    // Check for license token errors in error responses
    // Only check for specific license-related error messages
    if (!response.success) {
      const message = response?.data?.message || '';
      const lowerMessage = message.toLowerCase();
      
      // Only treat these specific messages as license inactive errors
      if (lowerMessage.includes('license token not found') || 
          lowerMessage.includes('license token not configured') ||
          lowerMessage === 'license token not found' ||
          lowerMessage === 'license token not configured') {
        // Only update if state is actually changing
        setIsLicenseActive(prev => {
          if (prev) {
            setLicenseError(message);
            return false;
          }
          return prev;
        });
        return true;
      }
      
      // Don't treat other errors (like "Pull Zone ID not found") as license inactive
      // These are API-specific errors, not license status errors
    }
    
    return false;
  });

  const resetLicenseStateRef = useRef(() => {
    setIsLicenseActive(prev => {
      if (!prev) {
        setLicenseError(null);
        return true;
      }
      return prev;
    });
  });

  // Wrapper functions that use the refs - these are stable
  const checkLicenseError = useCallback((response) => {
    return checkLicenseErrorRef.current(response);
  }, []);

  const resetLicenseState = useCallback(() => {
    resetLicenseStateRef.current();
  }, []);

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    isLicenseActive,
    licenseError,
    checkLicenseError,
    resetLicenseState,
  }), [isLicenseActive, licenseError, checkLicenseError, resetLicenseState]);

  return (
    <LicenseContext.Provider value={contextValue}>
      {children}
    </LicenseContext.Provider>
  );
};

export const useLicense = () => {
  const context = useContext(LicenseContext);
  if (!context) {
    // Return default values if context is not available (for backward compatibility)
    return {
      isLicenseActive: true,
      licenseError: null,
      checkLicenseError: () => false,
      resetLicenseState: () => {},
    };
  }
  return context;
};
