<?php

if (! defined('ABSPATH')) {
    exit; // Exit if accessed directly
}

/**
 * Hardening rule for WordPress constants (FORCE_SSL_ADMIN).
 *
 * @link       https://phantomguard.io
 * @since      1.0.0
 *
 * @package    PhGuard
 * @subpackage PhGuard/includes/hardening
 */
class PhGuard_Hardening_Rule_Constants extends PhGuard_Hardening_Rule_Base
{
    /**
     * Rule key identifier.
     *
     * @var string
     */
    protected $rule_key = '';

    /**
     * Which constant this rule manages.
     *
     * @var string
     */
    protected $constant_name = '';

    /**
     * Constructor.
     *
     * @param PhGuard_Hardening $hardening_manager Main hardening manager instance.
     * @param string             $rule_key         Rule key (force_ssl_admin).
     * @param bool               $enabled          Whether the rule is enabled.
     * @param string             $value            Rule value (not used for constants).
     */
    public function __construct($hardening_manager, $rule_key, $enabled = false, $value = '')
    {
        $this->rule_key = $rule_key;
        $this->constant_name = $this->get_constant_name($rule_key);
        parent::__construct($hardening_manager, $enabled, $value);
    }

    /**
     * Get the constant name for a rule key.
     *
     * @param string $rule_key Rule key.
     * @return string
     */
    private function get_constant_name($rule_key)
    {
        $map = array(
            'force_ssl_admin' => 'FORCE_SSL_ADMIN',
        );

        return isset($map[$rule_key]) ? $map[$rule_key] : '';
    }

    /**
     * Register hooks for this rule.
     *
     * @param PhGuard_Loader $loader Plugin loader instance.
     * @return void
     */
    public function register(PhGuard_Loader $loader)
    {
        if ($this->enabled) {
            $loader->add_action('plugins_loaded', $this, 'apply_constant', 1);
        }
    }

    /**
     * Apply the constant definition.
     *
     * @return void
     */
    public function apply_constant()
    {
        if (empty($this->constant_name) || defined($this->constant_name)) {
            return;
        }

        define($this->constant_name, true);
    }

    /**
     * Get rule configuration for default rules.
     *
     * @param string|null $rule_key Rule key (required for this class).
     * @return array<string, mixed>
     */
    public static function get_default_config($rule_key = null)
    {
        if (empty($rule_key)) {
            return array();
        }

        $configs = array(
            'force_ssl_admin' => array(
                'type' => 'basic',
                'name' => did_action('init') ? __('Force HTTPS for admin area', 'phantom-guard') : 'Force HTTPS for admin area',
                'enabled' => true,
                'value' => '',
            ),
        );

        return isset($configs[$rule_key]) ? $configs[$rule_key] : array();
    }
}
