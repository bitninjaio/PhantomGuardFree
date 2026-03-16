<?php

if (! defined('ABSPATH')) {
    exit; // Exit if accessed directly
}

/**
 * Hardening rule to hide WordPress version.
 *
 * @link       https://phantomguard.io
 * @since      1.0.0
 *
 * @package    PhGuard
 * @subpackage PhGuard/includes/hardening
 */
class PhGuard_Hardening_Rule_Hide_Version extends PhGuard_Hardening_Rule_Base
{
    /**
     * Rule key identifier.
     *
     * @var string
     */
    protected $rule_key = 'hide_wp_version';

    /**
     * Register hooks for this rule.
     *
     * @param PhGuard_Loader $loader Plugin loader instance.
     * @return void
     */
    public function register(PhGuard_Loader $loader)
    {
        if ($this->enabled) {
            $loader->add_action('init', $this, 'hide_wp_version', 0);
        }
    }

    /**
     * Remove generator meta tag from wp_head.
     *
     * @return void
     */
    public function hide_wp_version()
    {
        remove_action('wp_head', 'wp_generator');
        add_filter('the_generator', '__return_empty_string');
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
            'name' => did_action('init') ? __('Hide WordPress version meta tag', 'phantom-guard') : 'Hide WordPress version meta tag',
            'enabled' => true,
            'value' => '',
        );
    }
}
