<?php

if (! defined('ABSPATH')) {
    exit; // Exit if accessed directly
}

/**
 * Audit logging functionality for PhantomGuard hardening.
 *
 * @link       https://phantomguard.io
 * @since      1.0.0
 *
 * @package    PhGuard
 * @subpackage PhGuard/includes/hardening
 */
class PhGuard_Hardening_Audit_Log
{
    const AUDIT_LOG_TABLE = 'phguard_audit_log';

    /**
     * Ensure audit log table exists.
     *
     * @since 1.0.0
     * @return bool True if table exists or was created successfully, false otherwise.
     */
    public static function ensure_table()
    {
        global $wpdb;

        if (! isset($wpdb) || ! property_exists($wpdb, 'prefix')) {
            return false;
        }

        $table = $wpdb->prefix . self::AUDIT_LOG_TABLE;

        // Check if table actually exists
        $table_exists = $wpdb->get_var("SHOW TABLES LIKE '{$table}'") === $table;

        // If table exists, verify it has the correct schema version
        if ($table_exists) {
            $schema_version = get_option('phguard_audit_log_db_version', '0.0.0');
            if (version_compare($schema_version, '1.0.0', '>=')) {
                return true;
            }
        }

        // Table doesn't exist or needs update - create/update it
        $schema_version = get_option('phguard_audit_log_db_version', '0.0.0');
        if (version_compare($schema_version, '1.0.0', '<') || ! $table_exists) {
            $charset_collate = $wpdb->get_charset_collate();
            $sql_audit_log = "CREATE TABLE {$table} (
				id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
				event_type varchar(50) NOT NULL,
				user_id bigint(20) UNSIGNED NOT NULL,
				username varchar(255) NOT NULL,
				user_email varchar(255) DEFAULT '',
				ip_address varchar(45) DEFAULT '',
				user_agent text,
				details text,
				created_at datetime DEFAULT NULL,
				PRIMARY KEY (id),
				KEY event_type (event_type),
				KEY user_id (user_id),
				KEY created_at (created_at)
			) {$charset_collate};";

            require_once ABSPATH . 'wp-admin/includes/upgrade.php';
            dbDelta($sql_audit_log);

            // Verify table was created
            $table_exists = $wpdb->get_var("SHOW TABLES LIKE '{$table}'") === $table;
            if ($table_exists) {
                update_option('phguard_audit_log_db_version', '1.0.0');
                return true;
            }

            return false;
        }

        return true;
    }

    /**
     * Write an entry to the audit log.
     *
     * @since 1.0.0
     *
     * @param string                $event_type Event type (admin_login, password_reset, etc.).
     * @param int                   $user_id    User ID.
     * @param string                $username   Username.
     * @param string                $user_email User email.
     * @param array<string, mixed>  $details    Additional details.
     * @return bool
     */
    public static function write($event_type, $user_id, $username, $user_email = '', array $details = array())
    {
        global $wpdb;

        if (! isset($wpdb) || ! property_exists($wpdb, 'prefix')) {
            return false;
        }

        $table = $wpdb->prefix . self::AUDIT_LOG_TABLE;

        // Ensure table exists before writing
        if (! self::ensure_table()) {
            return false;
        }

        // Double-check table exists (safety check)
        if ($wpdb->get_var("SHOW TABLES LIKE '{$table}'") !== $table) {
            return false;
        }

        $ip_address = self::get_client_ip();
        $user_agent = isset($_SERVER['HTTP_USER_AGENT']) ? sanitize_text_field(wp_unslash($_SERVER['HTTP_USER_AGENT'])) : '';
        $details_json = ! empty($details) ? wp_json_encode($details) : '';

        $result = $wpdb->insert(
            $table,
            array(
                'event_type' => sanitize_key($event_type),
                'user_id' => (int) $user_id,
                'username' => sanitize_user($username),
                'user_email' => sanitize_email($user_email),
                'ip_address' => sanitize_text_field($ip_address),
                'user_agent' => $user_agent,
                'details' => $details_json,
                'created_at' => current_time('mysql', true),
            ),
            array('%s', '%d', '%s', '%s', '%s', '%s', '%s', '%s')
        );

        return false !== $result;
    }

    /**
     * Get client IP address.
     *
     * @return string
     */
    private static function get_client_ip()
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
}
