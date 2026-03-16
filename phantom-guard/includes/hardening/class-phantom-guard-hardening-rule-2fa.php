<?php

if (! defined('ABSPATH')) {
    exit; // Exit if accessed directly
}

/**
 * Placeholder hardening rule for Two-Factor Authentication (2FA).
 * Not functional in basic version - stored in DB only.
 *
 * @package    PhGuard
 * @subpackage PhGuard/includes/hardening
 */
class PhGuard_Hardening_Rule_2FA extends PhGuard_Hardening_Rule_Base
{
    protected $rule_key = 'enable_2fa';

    /**
     * Placeholder - no functionality.
     */
    public function register(PhGuard_Loader $loader)
    {
        // Placeholder only - no hooks registered
    }

    public static function get_default_config($rule_key = null)
    {
        return array(
            'type' => 'advanced',
            'name' => did_action('init') ? __('Enable Two-Factor Authentication (2FA)', 'phantom-guard') : 'Enable Two-Factor Authentication (2FA)',
            'enabled' => false,
            'value' => '',
        );
    }
}
