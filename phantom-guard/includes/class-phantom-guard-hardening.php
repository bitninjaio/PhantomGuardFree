<?php

if (! defined('ABSPATH')) {
    exit; // Exit if accessed directly
}

/**
 * Security hardening features for PhantomGuard.
 *
 * @link       https://phantomguard.io
 * @since      1.0.0
 *
 * @package    PhGuard
 * @subpackage PhGuard/includes
 */
class PhGuard_Hardening
{
    const LEGACY_OPTION_RULES = 'phguard_hardening_rules';
    const LEGACY_OPTION_ADMIN_SLUG = 'phguard_hardening_admin_slug';
    const SCHEMA_VERSION_OPTION = 'phguard_hardening_db_version';
    const SCHEMA_VERSION = '1.0.0';
    const AUDIT_LOG_TABLE = 'phguard_audit_log';
    const OPTION_PRESET = 'phguard_hardening_preset';
    const PRESET_DEFAULT = 'default';
    const PRESET_RECOMMENDED = 'recommended';
    const PRESET_ADVANCED = 'advanced';
    const PRESET_CUSTOM = 'custom';

    /**
     * Track whether default rules and schema have been ensured in this request.
     *
     * @var bool
     */
    private static $defaults_ensured = false;

    /**
     * Loaded hardening rules keyed by rule identifier.
     *
     * @var array<string, array<string, mixed>>
     */
    private $rules = array();

    /**
     * Rule class instances keyed by rule identifier.
     *
     * @var array<string, PhGuard_Hardening_Rule_Base>
     */
    private $rule_instances = array();

    /**
     * Cached custom admin/login slug.
     *
     * @var string
     */
    private $admin_slug = '';

    /**
     * Name of the hardening table including the WordPress table prefix.
     *
     * @var string
     */
    private $table_name = '';

    /**
     * Constructor.
     */
    public function __construct()
    {
        if (! self::$defaults_ensured) {
            self::ensure_default_rules();
            self::$defaults_ensured = true;
        }

        global $wpdb;

        if (isset($wpdb) && property_exists($wpdb, 'prefix')) {
            $this->table_name = $wpdb->prefix . 'phguard_hardening_rules';
        }

        $this->rules = $this->load_rules();
        $this->initialize_rule_instances();
    }

    /**
     * Get WP_Filesystem instance.
     *
     * @since 1.0.0
     * @return \WP_Filesystem_Base|null
     */
    private function get_wp_filesystem()
    {
        global $wp_filesystem;
        if (! $wp_filesystem) {
            require_once ABSPATH . 'wp-admin/includes/file.php';
            WP_Filesystem();
        }
        return $wp_filesystem;
    }

    /**
     * Initialize rule class instances.
     *
     * @return void
     */
    private function initialize_rule_instances()
    {
        foreach ($this->rules as $key => $rule_data) {
            $this->get_rule_instance($key);
        }
    }

    /**
     * Get or create a rule class instance.
     *
     * @param string $rule_key Rule key.
     * @return PhGuard_Hardening_Rule_Base|null
     */
    private function get_rule_instance($rule_key)
    {
        if (isset($this->rule_instances[$rule_key])) {
            return $this->rule_instances[$rule_key];
        }

        if (! isset($this->rules[$rule_key])) {
            return null;
        }

        $rule_data = $this->rules[$rule_key];
        $enabled = ! empty($rule_data['enabled']);
        $value = isset($rule_data['value']) ? $rule_data['value'] : '';

        $instance = null;

        switch ($rule_key) {
            case 'force_ssl_admin':
                $instance = new PhGuard_Hardening_Rule_Constants($this, $rule_key, $enabled, $value);
                break;

            case 'hide_wp_version':
                $instance = new PhGuard_Hardening_Rule_Hide_Version($this, $enabled, $value);
                break;

            case 'disable_xml_rpc':
                $instance = new PhGuard_Hardening_Rule_XML_RPC($this, $enabled, $value);
                break;

            case 'disable_rest_api':
                $instance = new PhGuard_Hardening_Rule_REST_API($this, $enabled, $value);
                break;

            case 'obscure_login_feedback':
                $instance = new PhGuard_Hardening_Rule_Obscure_Login($this, $enabled, $value);
                break;

            case 'disable_wp_cron':
                $instance = new PhGuard_Hardening_Rule_WP_Cron($this, $enabled, $value);
                break;

            case 'restrict_login_by_ip':
                $instance = new PhGuard_Hardening_Rule_IP_Restriction($this, $enabled, $value);
                break;

            case 'log_admin_events':
                $instance = new PhGuard_Hardening_Rule_Audit_Log($this, $enabled, $value);
                break;

            case 'rename_admin_url':
                $instance = new PhGuard_Hardening_Rule_Rename_Login($this, $enabled, $value);
                break;

            case 'enable_2fa':
                $instance = new PhGuard_Hardening_Rule_2FA($this, $enabled, $value);
                break;
        }

        if ($instance) {
            $this->rule_instances[$rule_key] = $instance;
        }

        return $instance;
    }

    /**
     * Ensure default hardening rules exist during activation.
     *
     * @since 1.0.0
     * @return void
     */
    public static function ensure_default_rules()
    {
        global $wpdb;

        if (! isset($wpdb) || ! property_exists($wpdb, 'prefix')) {
            return;
        }

        $table = $wpdb->prefix . 'phguard_hardening_rules';

        // Check if table exists before proceeding
        $table_exists = $wpdb->get_var("SHOW TABLES LIKE '{$table}'") === $table;

        $schema_version = get_option(self::SCHEMA_VERSION_OPTION, '0.0.0');
        if (! $table_exists || version_compare($schema_version, self::SCHEMA_VERSION, '<')) {
            $charset_collate = $wpdb->get_charset_collate();
            $sql_hardening = "CREATE TABLE {$table} (
				id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
				rule_key varchar(100) NOT NULL,
				type varchar(50) NOT NULL DEFAULT 'basic',
				name varchar(255) NOT NULL,
				enabled tinyint(1) NOT NULL DEFAULT 0,
				value varchar(255) DEFAULT '',
				created_at datetime DEFAULT NULL,
				updated_at datetime DEFAULT NULL,
				PRIMARY KEY (id),
				UNIQUE KEY rule_key (rule_key)
			) {$charset_collate};";

            require_once ABSPATH . 'wp-admin/includes/upgrade.php';
            dbDelta($sql_hardening);

            update_option(self::SCHEMA_VERSION_OPTION, self::SCHEMA_VERSION);

            // Re-check table existence after creation attempt
            $table_exists = $wpdb->get_var("SHOW TABLES LIKE '{$table}'") === $table;
        }

        // If table still doesn't exist, return early to avoid query errors
        if (! $table_exists) {
            return;
        }

        $defaults = self::get_default_rules();
        $now = current_time('mysql', true);

        foreach ($defaults as $key => $default) {
            $row = $wpdb->get_row(
                $wpdb->prepare(
                    "SELECT rule_key FROM {$table} WHERE rule_key = %s LIMIT 1",
                    $key
                ),
                'ARRAY_A'
            );

            if (null === $row) {
                $wpdb->insert(
                    $table,
                    array(
                        'rule_key' => $key,
                        'type' => $default['type'],
                        'name' => $default['name'],
                        'enabled' => self::to_flag($default['enabled']),
                        'value' => isset($default['value']) ? $default['value'] : '',
                        'created_at' => $now,
                        'updated_at' => $now,
                    ),
                    array('%s', '%s', '%s', '%d', '%s', '%s', '%s')
                );
            }
        }

        self::migrate_legacy_options($table, $defaults);

        // Ensure audit log table exists.
        PhGuard_Hardening_Audit_Log::ensure_table();

        // Apply default preset if no preset is stored
        $stored_preset = get_option(self::OPTION_PRESET, null);
        if (null === $stored_preset) {
            update_option(self::OPTION_PRESET, self::PRESET_DEFAULT);
            // Apply default preset rules
            $hardening_instance = new self();
            $hardening_instance->apply_preset(self::PRESET_DEFAULT);
        }
    }

    /**
     * Basic rules that have functional code. Other rules remain in DB only (no execution).
     */
    const FUNCTIONAL_RULE_KEYS = array(
        'force_ssl_admin',        // Force HTTPS for admin area
        'hide_wp_version',        // Hide WordPress version meta tag
        'log_admin_events',       // Log admin events
        'obscure_login_feedback', // Obscure login error details
    );

    /**
     * Register WordPress hooks for the enabled hardening rules.
     * Only the 4 basic rules in FUNCTIONAL_RULE_KEYS execute; others are DB-only.
     *
     * @param PhGuard_Loader $loader Plugin loader instance.
     * @return void
     */
    public function register(PhGuard_Loader $loader)
    {
        // Only register the 4 basic rules that have functional code
        foreach (self::FUNCTIONAL_RULE_KEYS as $rule_key) {
            if ($this->is_enabled($rule_key)) {
                $rule = $this->get_rule_instance($rule_key);
                if ($rule) {
                    $rule->register($loader);
                }
            }
        }
    }

    /**
     * Enable or disable a rule.
     *
     * @since 1.0.0
     *
     * @param string $key Rule key.
     * @param bool   $enabled Whether the rule should be enabled.
     * @return bool True on success.
     */
    public function set_rule_state($key, $enabled)
    {
        $key = sanitize_key($key);

        if (! isset($this->rules[$key])) {
            return false;
        }

        $success = true;

        if ($this->has_table()) {
            global $wpdb;

            $result = $wpdb->update(
                $this->table_name,
                array(
                    'enabled' => self::to_flag($enabled),
                    'updated_at' => current_time('mysql', true),
                ),
                array('rule_key' => $key),
                array('%d', '%s'),
                array('%s')
            );

            $success = false !== $result;
        }

        if ($success) {
            $this->rules[$key]['enabled'] = (bool) $enabled;

            // Handle special rules that need additional actions (only for functional rules)
            if ('obscure_login_feedback' === $key && in_array($key, self::FUNCTIONAL_RULE_KEYS, true)) {
                $rule = $this->get_rule_instance($key);
                if ($rule instanceof PhGuard_Hardening_Rule_Obscure_Login && ! $enabled) {
                    $rule->remove_theme_login_snippet();
                }
            }

            // Detect preset after rule change
            $detected_preset = $this->detect_preset();
            update_option(self::OPTION_PRESET, $detected_preset);
        }

        return $success;
    }

    /**
     * Update the stored value for a rule (if supported).
     *
     * @since 1.0.0
     *
     * @param string $key   Rule key.
     * @param mixed  $value Raw value.
     * @return bool
     */
    public function update_rule_value($key, $value)
    {
        $key = sanitize_key($key);

        if (! isset($this->rules[$key])) {
            return false;
        }

        // Get current value before change
        $current_value = isset($this->rules[$key]['value']) ? $this->rules[$key]['value'] : '';
        $sanitized_value = $this->sanitize_rule_value($key, $value);
        $value_changed = $current_value !== $sanitized_value;

        $success = true;

        if ($this->has_table()) {
            global $wpdb;

            $result = $wpdb->update(
                $this->table_name,
                array(
                    'value' => $sanitized_value,
                    'updated_at' => current_time('mysql', true),
                ),
                array('rule_key' => $key),
                array('%s', '%s'),
                array('%s')
            );

            $success = false !== $result;
        }

        if ($success) {
            $this->rules[$key]['value'] = $sanitized_value;

            if ('rename_admin_url' === $key) {
                $this->admin_slug = $sanitized_value;
            }

            // Detect preset after value change (if it affects enabled state indirectly)
            // Note: value changes don't usually affect preset, but we check anyway
            $detected_preset = $this->detect_preset();
            update_option(self::OPTION_PRESET, $detected_preset);
        }

        return $success;
    }

    /**
     * Check whether a rule is enabled.
     *
     * @since 1.0.0
     *
     * @param string $key Rule key.
     * @return bool
     */
    public function is_enabled($key)
    {
        return isset($this->rules[$key]) && ! empty($this->rules[$key]['enabled']);
    }

    /**
     * Get available preset configurations.
     *
     * @since 1.0.0
     *
     * @return array<string, array<string, array<string, bool>>>
     */
    private static function get_preset_configurations()
    {
        $defaults = self::get_default_rules();
        $presets = array();

        // Default preset: only basic rules enabled
        $presets[self::PRESET_DEFAULT] = array();
        foreach ($defaults as $key => $rule) {
            $presets[self::PRESET_DEFAULT][$key] = $rule['type'] === 'basic';
        }

        // Recommended preset: basic + recommended rules enabled
        $presets[self::PRESET_RECOMMENDED] = array();
        foreach ($defaults as $key => $rule) {
            $presets[self::PRESET_RECOMMENDED][$key] = in_array($rule['type'], array('basic', 'recommended'), true);
        }

        // Advanced preset: all rules enabled
        $presets[self::PRESET_ADVANCED] = array();
        foreach ($defaults as $key => $rule) {
            $presets[self::PRESET_ADVANCED][$key] = true;
        }

        return $presets;
    }

    /**
     * Get the current preset or detect it from rules.
     *
     * @since 1.0.0
     *
     * @return string
     */
    public function get_current_preset()
    {
        $stored_preset = get_option(self::OPTION_PRESET, null);

        // If preset is explicitly set to custom, return it
        if (self::PRESET_CUSTOM === $stored_preset) {
            return self::PRESET_CUSTOM;
        }

        // Try to detect preset from current rule states
        $detected = $this->detect_preset();

        // If detected preset matches stored preset, return it
        if ($detected === $stored_preset && null !== $stored_preset) {
            return $stored_preset;
        }

        // If no stored preset or mismatch, update to detected preset
        if (null === $stored_preset) {
            // First time: default to default preset
            update_option(self::OPTION_PRESET, self::PRESET_DEFAULT);
            return self::PRESET_DEFAULT;
        }

        // If detected preset is custom or different, update stored preset
        update_option(self::OPTION_PRESET, $detected);
        return $detected;
    }

    /**
     * Detect which preset matches the current rule configuration.
     *
     * @since 1.0.0
     *
     * @return string
     */
    public function detect_preset()
    {
        $presets = self::get_preset_configurations();
        $current_states = array();

        // Get current enabled states for all rules
        foreach ($this->rules as $key => $rule) {
            $current_states[$key] = ! empty($rule['enabled']);
        }

        // Check each preset (in reverse order: advanced, recommended, default)
        $check_order = array(self::PRESET_ADVANCED, self::PRESET_RECOMMENDED, self::PRESET_DEFAULT);

        foreach ($check_order as $preset_name) {
            $preset_config = $presets[$preset_name];
            $matches = true;

            foreach ($preset_config as $key => $expected_enabled) {
                $current_enabled = isset($current_states[$key]) ? $current_states[$key] : false;

                // Only check rules that exist in both
                if (isset($this->rules[$key]) && $current_enabled !== $expected_enabled) {
                    $matches = false;
                    break;
                }
            }

            if ($matches) {
                return $preset_name;
            }
        }

        // If no preset matches, it's custom
        return self::PRESET_CUSTOM;
    }

    /**
     * Apply a preset configuration to the rules.
     *
     * @since 1.0.0
     *
     * @param string $preset_name Preset name (default, recommended, advanced).
     * @return bool True on success.
     */
    public function apply_preset($preset_name)
    {
        $preset_name = sanitize_key($preset_name);
        $presets = self::get_preset_configurations();

        if (! isset($presets[$preset_name])) {
            return false;
        }

        $preset_config = $presets[$preset_name];
        $success = true;

        // First, set all rule states without preset detection
        foreach ($preset_config as $key => $enabled) {
            if (isset($this->rules[$key])) {
                $current_enabled = ! empty($this->rules[$key]['enabled']);

                // Only update if state is different
                if ($current_enabled !== $enabled) {
                    if ($this->has_table()) {
                        global $wpdb;

                        $result = $wpdb->update(
                            $this->table_name,
                            array(
                                'enabled' => self::to_flag($enabled),
                                'updated_at' => current_time('mysql', true),
                            ),
                            array('rule_key' => $key),
                            array('%d', '%s'),
                            array('%s')
                        );

                        if (false === $result) {
                            $success = false;
                            continue;
                        }
                    }

                    $this->rules[$key]['enabled'] = (bool) $enabled;

                    // Handle special rules that need additional actions (only for functional rules)
                    if ('obscure_login_feedback' === $key && in_array($key, self::FUNCTIONAL_RULE_KEYS, true)) {
                        $rule = $this->get_rule_instance($key);
                        if ($rule instanceof PhGuard_Hardening_Rule_Obscure_Login && ! $enabled) {
                            $rule->remove_theme_login_snippet();
                        }
                    }
                }
            }
        }

        // After all rules are updated, set the preset option
        if ($success) {
            update_option(self::OPTION_PRESET, $preset_name);
        }

        return $success;
    }

    /**
     * Default hardening rules.
     *
     * @since 1.0.0
     *
     * @return array<string, array<string, mixed>>
     */
    private static function get_default_rules()
    {
        return array(
            'force_ssl_admin' => PhGuard_Hardening_Rule_Constants::get_default_config('force_ssl_admin'),
            'disable_xml_rpc' => PhGuard_Hardening_Rule_XML_RPC::get_default_config(),
            'disable_rest_api' => PhGuard_Hardening_Rule_REST_API::get_default_config(),
            'rename_admin_url' => PhGuard_Hardening_Rule_Rename_Login::get_default_config(),
            'hide_wp_version' => PhGuard_Hardening_Rule_Hide_Version::get_default_config(),
            'obscure_login_feedback' => PhGuard_Hardening_Rule_Obscure_Login::get_default_config(),
            'disable_wp_cron' => PhGuard_Hardening_Rule_WP_Cron::get_default_config(),
            'restrict_login_by_ip' => PhGuard_Hardening_Rule_IP_Restriction::get_default_config(),
            'log_admin_events' => PhGuard_Hardening_Rule_Audit_Log::get_default_config(),
            'enable_2fa' => PhGuard_Hardening_Rule_2FA::get_default_config(),
        );
    }

    /**
     * Load hardening rules from the database merged with defaults.
     *
     * @since 1.0.0
     *
     * @return array<string, array<string, mixed>>
     */
    private function load_rules()
    {
        $defaults = self::get_default_rules();

        if (! $this->has_table()) {
            return $defaults;
        }

        global $wpdb;

        $rows = $wpdb->get_results(
            "SELECT rule_key, type, name, enabled, value FROM {$this->table_name}",
            'ARRAY_A'
        );

        $rules = array();

        if ($rows) {
            foreach ($rows as $row) {
                $key = isset($row['rule_key']) ? sanitize_key($row['rule_key']) : '';

                if ('' === $key) {
                    continue;
                }

                $rules[$key] = array(
                    'type' => isset($row['type']) && '' !== $row['type'] ? sanitize_key($row['type']) : (isset($defaults[$key]) ? $defaults[$key]['type'] : 'basic'),
                    'name' => isset($row['name']) && '' !== $row['name'] ? sanitize_text_field($row['name']) : (isset($defaults[$key]) ? $defaults[$key]['name'] : ucfirst(str_replace('_', ' ', $key))),
                    'enabled' => self::to_bool(isset($row['enabled']) ? $row['enabled'] : 0),
                    'value' => $this->sanitize_rule_value($key, isset($row['value']) ? $row['value'] : ''),
                );
            }
        }

        foreach ($defaults as $key => $default) {
            if (! isset($rules[$key])) {
                $rules[$key] = $default;
                continue;
            }

            if (! isset($rules[$key]['type']) || '' === $rules[$key]['type']) {
                $rules[$key]['type'] = $default['type'];
            }

            if (! isset($rules[$key]['name']) || '' === $rules[$key]['name']) {
                $rules[$key]['name'] = $default['name'];
            }

            if (! array_key_exists('value', $rules[$key])) {
                $rules[$key]['value'] = $default['value'];
            }
        }

        return $rules;
    }

    /**
     * Sanitize rule-specific value.
     *
     * @since 1.0.0
     *
     * @param string $key   Rule key.
     * @param mixed  $value Raw value.
     * @return string
     */
    private function sanitize_rule_value($key, $value)
    {
        return sanitize_text_field($value);
    }


    /**
     * Determine if the hardening table is available.
     *
     * @since 1.0.0
     *
     * @return bool
     */
    private function has_table()
    {
        if ('' === $this->table_name) {
            return false;
        }

        global $wpdb;
        if (! isset($wpdb) || ! property_exists($wpdb, 'prefix')) {
            return false;
        }

        // Check if table actually exists in the database
        return $wpdb->get_var("SHOW TABLES LIKE '{$this->table_name}'") === $this->table_name;
    }

    /**
     * Convert a mixed value to boolean.
     *
     * @since 1.0.0
     *
     * @param mixed $value Raw value.
     * @return bool
     */
    private static function to_bool($value)
    {
        return (bool) (int) $value;
    }

    /**
     * Convert boolean to integer flag.
     *
     * @since 1.0.0
     *
     * @param mixed $value Raw value.
     * @return int 1 or 0.
     */
    private static function to_flag($value)
    {
        return self::to_bool($value) ? 1 : 0;
    }

    /**
     * Migrate legacy option-based storage to the dedicated table.
     *
     * @since 1.0.0
     *
     * @param string                              $table    Hardening table name.
     * @param array<string, array<string, mixed>> $defaults Default rules.
     * @return void
     */
    private static function migrate_legacy_options($table, array $defaults)
    {
        global $wpdb;

        if (! isset($wpdb) || ! property_exists($wpdb, 'prefix')) {
            return;
        }

        // Check if table exists before attempting to update
        if ($wpdb->get_var("SHOW TABLES LIKE '{$table}'") !== $table) {
            return;
        }

        $legacy_rules = get_option(self::LEGACY_OPTION_RULES, null);

        if (is_array($legacy_rules)) {
            foreach ($legacy_rules as $key => $rule) {
                if (! isset($defaults[$key])) {
                    continue;
                }

                $type = isset($rule['type']) ? sanitize_key($rule['type']) : $defaults[$key]['type'];
                $name = isset($rule['name']) ? sanitize_text_field($rule['name']) : $defaults[$key]['name'];
                $enabled = isset($rule['enabled']) ? self::to_flag($rule['enabled']) : self::to_flag($defaults[$key]['enabled']);

                $wpdb->update(
                    $table,
                    array(
                        'type' => $type,
                        'name' => $name,
                        'enabled' => $enabled,
                        'updated_at' => current_time('mysql', true),
                    ),
                    array('rule_key' => $key),
                    array('%s', '%s', '%d', '%s'),
                    array('%s')
                );
            }

            delete_option(self::LEGACY_OPTION_RULES);
        }
    }

    /**
     * Retrieve a formatted list of rules for API responses.
     *
     * @since 1.0.0
     *
     * @return array<int, array<string, mixed>>
     */
    public function get_rules_for_response()
    {
        $rules = array();

        foreach ($this->rules as $key => $rule) {
            $rules[] = array(
                'key' => $key,
                'type' => isset($rule['type']) ? $rule['type'] : 'basic',
                'name' => isset($rule['name']) ? $rule['name'] : ucfirst(str_replace('_', ' ', $key)),
                'enabled' => ! empty($rule['enabled']),
                'value' => isset($rule['value']) ? $rule['value'] : '',
                'requires_value' => ('rename_admin_url' === $key),
            );
        }

        usort(
            $rules,
            static function ($a, $b) {
                if ($a['type'] === $b['type']) {
                    return strcmp($a['name'], $b['name']);
                }

                return strcmp($a['type'], $b['type']);
            }
        );

        return $rules;
    }

    /**
     * Get preset information for API responses.
     *
     * @since 1.0.0
     *
     * @return array<string, mixed>
     */
    public function get_preset_for_response()
    {
        $current_preset = $this->get_current_preset();

        return array(
            'current' => $current_preset,
            'available' => array(
                self::PRESET_DEFAULT => did_action('init') ? __('Basic', 'phantom-guard') : 'Basic',
                self::PRESET_RECOMMENDED => did_action('init') ? __('Recommended', 'phantom-guard') : 'Recommended',
                self::PRESET_ADVANCED => did_action('init') ? __('Advanced', 'phantom-guard') : 'Advanced',
                self::PRESET_CUSTOM => did_action('init') ? __('Custom', 'phantom-guard') : 'Custom',
            ),
            'descriptions' => array(
                self::PRESET_DEFAULT => did_action('init') ? __('Only basic security rules enabled', 'phantom-guard') : 'Only basic security rules enabled',
                self::PRESET_RECOMMENDED => did_action('init') ? __('Basic and recommended security rules enabled', 'phantom-guard') : 'Basic and recommended security rules enabled',
                self::PRESET_ADVANCED => did_action('init') ? __('All security rules enabled (including advanced)', 'phantom-guard') : 'All security rules enabled (including advanced)',
                self::PRESET_CUSTOM => did_action('init') ? __('Custom configuration (rules have been modified)', 'phantom-guard') : 'Custom configuration (rules have been modified)',
            ),
        );
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
    private function write_audit_log($event_type, $user_id, $username, $user_email = '', array $details = array())
    {
        global $wpdb;

        if (! isset($wpdb) || ! property_exists($wpdb, 'prefix')) {
            return false;
        }

        $table = $wpdb->prefix . self::AUDIT_LOG_TABLE;

        // Check if table exists.
        if ($wpdb->get_var("SHOW TABLES LIKE '{$table}'") !== $table) {
            return false;
        }

        $ip_address = $this->get_client_ip();
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
     * @since 1.0.0
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
}
