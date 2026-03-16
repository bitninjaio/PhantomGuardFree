<?php

if (! defined('ABSPATH')) {
    exit; // Exit if accessed directly
}

/**
 * Placeholder hardening rule to disable REST API for anonymous users.
 * Not functional in basic version - stored in DB only.
 *
 * @package    PhGuard
 * @subpackage PhGuard/includes/hardening
 */
class PhGuard_Hardening_Rule_REST_API extends PhGuard_Hardening_Rule_Base
{
    protected $rule_key = 'disable_rest_api';

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
            'type' => 'recommended',
            'name' => did_action('init') ? __('Disable REST API for anonymous users', 'phantom-guard') : 'Disable REST API for anonymous users',
            'enabled' => false,
            'value' => '',
        );
    }
}
