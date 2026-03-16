<?php

if (! defined('ABSPATH')) {
    exit; // Exit if accessed directly
}

/**
 * Placeholder hardening rule to restrict login by IP address.
 * Not functional in basic version - stored in DB only.
 *
 * @package    PhGuard
 * @subpackage PhGuard/includes/hardening
 */
class PhGuard_Hardening_Rule_IP_Restriction extends PhGuard_Hardening_Rule_Base
{
    protected $rule_key = 'restrict_login_by_ip';

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
            'name' => did_action('init') ? __('Restrict login by IP address', 'phantom-guard') : 'Restrict login by IP address',
            'enabled' => false,
            'value' => '',
        );
    }
}
