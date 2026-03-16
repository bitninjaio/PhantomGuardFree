<?php

if (! defined('ABSPATH')) {
    exit; // Exit if accessed directly
}

/**
 * Hardening rule for logging admin events.
 *
 * @link       https://phantomguard.io
 * @since      1.0.0
 *
 * @package    PhGuard
 * @subpackage PhGuard/includes/hardening
 */
class PhGuard_Hardening_Rule_Audit_Log extends PhGuard_Hardening_Rule_Base
{
    /**
     * Rule key identifier.
     *
     * @var string
     */
    protected $rule_key = 'log_admin_events';

    /**
     * Register hooks for this rule.
     *
     * @param PhGuard_Loader $loader Plugin loader instance.
     * @return void
     */
    public function register(PhGuard_Loader $loader)
    {
        if ($this->enabled) {
            // Ensure audit log table exists when rule is enabled
            PhGuard_Hardening_Audit_Log::ensure_table();

            $loader->add_action('wp_login', $this, 'log_admin_login', 10, 2);
            $loader->add_action('wp_login_failed', $this, 'log_failed_login', 10, 1);
            $loader->add_action('password_reset', $this, 'log_password_reset', 10, 2);
            $loader->add_action('user_register', $this, 'log_user_register', 10, 1);
            $loader->add_action('profile_update', $this, 'log_profile_update', 10, 2);
        }
    }

    /**
     * Log admin login event.
     *
     * @param string  $user_login Username.
     * @param WP_User $user       User object.
     * @return void
     */
    public function log_admin_login($user_login, $user)
    {
        if (! $user instanceof WP_User) {
            return;
        }

        // Only log if user has admin capabilities.
        if (! $user->has_cap('administrator')) {
            return;
        }

        PhGuard_Hardening_Audit_Log::write(
            'admin_login',
            $user->ID,
            $user_login,
            $user->user_email
        );
    }

    /**
     * Log failed login attempt.
     *
     * @param string $username Username that attempted to login.
     * @return void
     */
    public function log_failed_login($username)
    {
        // Check if the username exists and is an admin.
        $user = get_user_by('login', $username);
        if (! $user) {
            // Also check by email.
            $user = get_user_by('email', $username);
        }

        // Only log if user exists and has admin capabilities.
        if ($user && $user->has_cap('administrator')) {
            PhGuard_Hardening_Audit_Log::write(
                'failed_login',
                $user->ID,
                $username,
                $user->user_email,
                array('reason' => 'Invalid credentials')
            );
        } else {
            // Log failed login attempt even if user doesn't exist (brute force attempt).
            // Use 0 as user_id for non-existent users.
            PhGuard_Hardening_Audit_Log::write(
                'failed_login',
                0,
                $username,
                '',
                array('reason' => 'User not found or invalid credentials')
            );
        }
    }

    /**
     * Log password reset event (via Lost Password).
     *
     * @param WP_User $user     User object.
     * @param string  $new_pass New password (not used, but required by hook).
     * @return void
     */
    public function log_password_reset($user, $new_pass)
    {
        if (! $user instanceof WP_User) {
            return;
        }

        // Only log if user has admin capabilities.
        if (! $user->has_cap('administrator')) {
            return;
        }

        PhGuard_Hardening_Audit_Log::write(
            'password_reset',
            $user->ID,
            $user->user_login,
            $user->user_email
        );
    }

    /**
     * Log user registration event (only for admin users).
     *
     * @param int $user_id User ID.
     * @return void
     */
    public function log_user_register($user_id)
    {
        $user = get_userdata($user_id);

        if (! $user) {
            return;
        }

        // Only log if user has admin capabilities.
        if (! $user->has_cap('administrator')) {
            return;
        }

        PhGuard_Hardening_Audit_Log::write(
            'admin_user_created',
            $user_id,
            $user->user_login,
            $user->user_email,
            array('created_by' => get_current_user_id())
        );
    }

    /**
     * Log profile update event (only for password changes on admin users).
     *
     * @param int     $user_id       User ID.
     * @param WP_User $old_user_data Old user data.
     * @return void
     */
    public function log_profile_update($user_id, $old_user_data)
    {
        $user = get_userdata($user_id);

        if (! $user || ! $old_user_data instanceof WP_User) {
            return;
        }

        // Only log if user has admin capabilities.
        if (! $user->has_cap('administrator')) {
            return;
        }

        // Only process when coming from profile form with valid nonce.
        if (isset($_POST['pass1'])) {
            $nonce = isset($_POST['_wpnonce']) ? sanitize_text_field(wp_unslash($_POST['_wpnonce'])) : '';
            if (! wp_verify_nonce($nonce, 'update-user_' . $user_id)) {
                return;
            }
        }

        // Check if password was changed.
        if (isset($_POST['pass1']) && ! empty($_POST['pass1']) && (! isset($_POST['pass2']) || $_POST['pass1'] !== $_POST['pass2'])) {
            // Password mismatch, don't log.
            return;
        }

        if (isset($_POST['pass1']) && ! empty($_POST['pass1'])) {
            PhGuard_Hardening_Audit_Log::write(
                'password_changed',
                $user_id,
                $user->user_login,
                $user->user_email,
                array('changed_by' => get_current_user_id())
            );
        }
    }

    /**
     * Get rule configuration for default rules.
     *
     * @return array<string, mixed>
     */
    public static function get_default_config($rule_key = null)
    {
        return array(
            'type' => 'basic',
            'name' => did_action('init') ? __('Log admin events', 'phantom-guard') : 'Log admin events',
            'enabled' => true,
            'value' => '',
        );
    }
}
