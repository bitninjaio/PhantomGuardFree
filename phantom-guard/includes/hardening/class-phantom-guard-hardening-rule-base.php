<?php

if (! defined('ABSPATH')) {
    exit; // Exit if accessed directly
}

/**
 * Base class for hardening rules.
 *
 * @link       https://phantomguard.io
 * @since      1.0.0
 *
 * @package    PhGuard
 * @subpackage PhGuard/includes/hardening
 */
abstract class PhGuard_Hardening_Rule_Base
{
    /**
     * Rule key identifier.
     *
     * @var string
     */
    protected $rule_key;

    /**
     * Whether the rule is enabled.
     *
     * @var bool
     */
    protected $enabled = false;

    /**
     * Rule value (if applicable).
     *
     * @var string
     */
    protected $value = '';

    /**
     * Reference to the main hardening manager.
     *
     * @var PhGuard_Hardening
     */
    protected $hardening_manager;

    /**
     * Constructor.
     *
     * @param PhGuard_Hardening $hardening_manager Main hardening manager instance.
     * @param bool               $enabled           Whether the rule is enabled.
     * @param string             $value             Rule value.
     */
    public function __construct($hardening_manager, $enabled = false, $value = '')
    {
        $this->hardening_manager = $hardening_manager;
        $this->enabled = $enabled;
        $this->value = $value;
    }

    /**
     * Get the rule key.
     *
     * @return string
     */
    public function get_rule_key()
    {
        return $this->rule_key;
    }

    /**
     * Check if the rule is enabled.
     *
     * @return bool
     */
    public function is_enabled()
    {
        return $this->enabled;
    }

    /**
     * Set whether the rule is enabled.
     *
     * @param bool $enabled Whether the rule should be enabled.
     * @return void
     */
    public function set_enabled($enabled)
    {
        $this->enabled = (bool) $enabled;
    }

    /**
     * Get the rule value.
     *
     * @return string
     */
    public function get_value()
    {
        return $this->value;
    }

    /**
     * Set the rule value.
     *
     * @param string $value Rule value.
     * @return void
     */
    public function set_value($value)
    {
        $this->value = $value;
    }

    /**
     * Get WP_Filesystem instance.
     *
     * @since 1.0.0
     * @return \WP_Filesystem_Base|null
     */
    protected function get_wp_filesystem()
    {
        global $wp_filesystem;
        if (! $wp_filesystem) {
            require_once ABSPATH . 'wp-admin/includes/file.php';
            WP_Filesystem();
        }
        return $wp_filesystem;
    }

    /**
     * Register hooks for this rule.
     *
     * @param PhGuard_Loader $loader Plugin loader instance.
     * @return void
     */
    abstract public function register(PhGuard_Loader $loader);

    /**
     * Get rule configuration for default rules.
     *
     * @param string|null $rule_key Optional rule key (for classes that handle multiple rules).
     * @return array<string, mixed>
     */
    abstract public static function get_default_config($rule_key = null);
}
