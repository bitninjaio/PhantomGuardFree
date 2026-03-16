<?php

if (! defined('ABSPATH')) {
	exit; // Exit if accessed directly
}

/**
 * Fired during plugin deactivation.
 *
 * @since      1.0.0
 * @package    PhGuard
 * @subpackage PhGuard/includes
 */
class PhGuard_Deactivator
{

	public static function deactivate(): void
	{
		self::drop_tables();
		self::delete_options();
	}

	private static function drop_tables(): void
	{
		global $wpdb;

		$tables = array(
			$wpdb->prefix . 'phguard_hardening_rules',
			$wpdb->prefix . 'phguard_audit_log',
		);

		foreach ($tables as $table) {
			$wpdb->query("DROP TABLE IF EXISTS {$table}");
		}
	}

	private static function delete_options(): void
	{
		delete_option('phguard_hardening_db_version');
		delete_option('phguard_audit_log_db_version');
		delete_option('phguard_hardening_preset');
		delete_option('phguard_db_version');
		delete_option('phguard_hardening_rules');
		delete_option('phguard_hardening_admin_slug');
	}
}
