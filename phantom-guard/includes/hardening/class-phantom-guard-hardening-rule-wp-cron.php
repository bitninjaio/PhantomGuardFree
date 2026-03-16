<?php

if (! defined('ABSPATH')) {
    exit; // Exit if accessed directly
}

/**
 * Placeholder hardening rule to disable wp-cron.php access.
 * Not functional in basic version - stored in DB only.
 *
 * @package    PhGuard
 * @subpackage PhGuard/includes/hardening
 */
class PhGuard_Hardening_Rule_WP_Cron extends PhGuard_Hardening_Rule_Base
{
    protected $rule_key = 'disable_wp_cron';

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
            'name' => did_action('init') ? __('Disable wp-cron.php access', 'phantom-guard') : 'Disable wp-cron.php access',
            'enabled' => false,
            'value' => '',
        );
    }
}
