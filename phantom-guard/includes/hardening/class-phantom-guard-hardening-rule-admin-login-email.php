<?php

if (! defined('ABSPATH')) {
    exit; // Exit if accessed directly
}

/**
 * Hardening rule for sending email notifications on admin login.
 * This rule is always enabled and cannot be disabled.
 *
 * @link       https://phantomguard.io
 * @since      1.0.0
 *
 * @package    PhGuard
 * @subpackage PhGuard/includes/hardening
 */
class PhGuard_Hardening_Rule_Admin_Login_Email extends PhGuard_Hardening_Rule_Base
{
    /**
     * Rule key identifier.
     *
     * @var string
     */
    protected $rule_key = 'admin_login_email_notification';

    /**
     * Constructor.
     * Force enabled to true - this rule cannot be disabled.
     *
     * @param PhGuard_Hardening $hardening_manager Main hardening manager instance.
     * @param bool                    $enabled           Whether the rule is enabled (ignored, always true).
     * @param string                  $value             Rule value.
     */
    public function __construct($hardening_manager, $enabled = false, $value = '')
    {
        parent::__construct($hardening_manager, true, $value); // Always enabled
    }

    /**
     * Register hooks for this rule.
     * Always registers regardless of enabled state (which is always true).
     *
     * @param PhGuard_Loader $loader Plugin loader instance.
     * @return void
     */
    public function register(PhGuard_Loader $loader)
    {
        // Always register - this rule cannot be disabled
        $loader->add_action('wp_login', $this, 'send_admin_login_email', 10, 2);
    }

    /**
     * Send email notification on successful admin login.
     *
     * @param string  $user_login Username.
     * @param WP_User $user       User object.
     * @return void
     */
    public function send_admin_login_email($user_login, $user)
    {
        if (! $user instanceof WP_User) {
            return;
        }

        // Only send email if user has admin capabilities.
        if (! $user->has_cap('administrator')) {
            return;
        }

        $admin_email = get_option('admin_email');
        if (empty($admin_email)) {
            return;
        }

        // Get site information
        $site_name = get_bloginfo('name');
        $site_url = home_url();
        $login_time = current_time('mysql', true);
        $user_display_name = $user->display_name ? $user->display_name : $user_login;
        $user_email = $user->user_email;
        $ip_address = $this->get_client_ip();
        $user_agent = isset($_SERVER['HTTP_USER_AGENT']) ? sanitize_text_field(wp_unslash($_SERVER['HTTP_USER_AGENT'])) : __('Unknown', 'phantom-guard');

        // Email subject
        $subject = sprintf(
            /* translators: 1: Site name, 2: Username */
            __('[%1$s] Admin Login Notification - %2$s', 'phantom-guard'),
            $site_name,
            $user_display_name
        );

        // Email body
        $message = sprintf(
            /* translators: 1: Site name, 2: Site URL, 3: Username, 4: Display name, 5: User email, 6: Login time, 7: IP address, 8: User agent */
            __('A new administrator login has been detected on your site:

Site: %1$s (%2$s)

Login Details:
- Username: %3$s
- Display Name: %4$s
- Email: %5$s
- Login Time: %6$s
- IP Address: %7$s
- User Agent: %8$s

If you did not perform this login, please secure your account immediately.

This is an automated security notification from PhantomGuard.', 'phantom-guard'),
            esc_html($site_name),
            esc_url($site_url),
            esc_html($user_login),
            esc_html($user_display_name),
            esc_html($user_email),
            esc_html($login_time),
            esc_html($ip_address),
            esc_html($user_agent)
        );

        // Send email
        wp_mail(
            $admin_email,
            $subject,
            $message,
            array('Content-Type: text/plain; charset=UTF-8')
        );
    }

    /**
     * Get client IP address.
     *
     * @return string
     */
    private function get_client_ip()
    {
        $ip_keys = array(
            'HTTP_CF_CONNECTING_IP', // Cloudflare
            'HTTP_X_REAL_IP',        // Nginx proxy
            'HTTP_X_FORWARDED_FOR',  // Proxy/Load balancer
            'REMOTE_ADDR',           // Standard
        );

        foreach ($ip_keys as $key) {
            if (! empty($_SERVER[$key])) {
                $ip = sanitize_text_field(wp_unslash($_SERVER[$key]));

                // Handle comma-separated IPs (X-Forwarded-For can contain multiple IPs).
                if (false !== strpos($ip, ',')) {
                    $ips = explode(',', $ip);
                    $ip = trim($ips[0]);
                }

                // Validate IP address.
                if (filter_var($ip, FILTER_VALIDATE_IP)) {
                    return $ip;
                }
            }
        }

        return '0.0.0.0';
    }

    /**
     * Get rule configuration for default rules.
     * This rule doesn't appear in the UI, but we need this method for compatibility.
     *
     * @return array<string, mixed>
     */
    public static function get_default_config($rule_key = null)
    {
        return array(
            'type' => 'basic',
            'name' => __('Admin Login Email Notification', 'phantom-guard'),
            'enabled' => true, // Always enabled
            'value' => '',
        );
    }
}
