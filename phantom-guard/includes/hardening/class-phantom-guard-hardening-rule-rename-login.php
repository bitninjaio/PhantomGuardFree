<?php

if (! defined('ABSPATH')) {
    exit; // Exit if accessed directly
}

/**
 * Placeholder hardening rule to rename the login URL.
 * Not functional in basic version - stored in DB only.
 *
 * @package    PhGuard
 * @subpackage PhGuard/includes/hardening
 */
class PhGuard_Hardening_Rule_Rename_Login extends PhGuard_Hardening_Rule_Base
{
    protected $rule_key = 'rename_admin_url';

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
            'name' => did_action('init') ? __('Rename the login URL', 'phantom-guard') : 'Rename the login URL',
            'enabled' => false,
            'value' => '',
        );
    }
}
