<?php

if (! defined('ABSPATH')) {
    exit; // Exit if accessed directly
}

/**
 * Placeholder hardening rule to disable XML-RPC.
 * Not functional in basic version - stored in DB only.
 *
 * @package    PhGuard
 * @subpackage PhGuard/includes/hardening
 */
class PhGuard_Hardening_Rule_XML_RPC extends PhGuard_Hardening_Rule_Base
{
    protected $rule_key = 'disable_xml_rpc';

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
            'name' => did_action('init') ? __('Disable XML-RPC endpoint', 'phantom-guard') : 'Disable XML-RPC endpoint',
            'enabled' => false,
            'value' => '',
        );
    }
}
