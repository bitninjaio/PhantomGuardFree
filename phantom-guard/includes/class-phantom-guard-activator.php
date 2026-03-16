<?php

if (! defined('ABSPATH')) {
	exit; // Exit if accessed directly
}

/**
 * Fired during plugin activation.
 *
 * @since      1.0.0
 * @package    PhGuard
 * @subpackage PhGuard/includes
 */
class PhGuard_Activator
{

	public static function activate(): void
	{
		self::create_tables();
		self::set_default_options();
	}

	private static function create_tables(): void
	{
		global $wpdb;

		$charset_collate = $wpdb->get_charset_collate();
		$hardening_table = $wpdb->prefix . 'phguard_hardening_rules';

		$sql_hardening = "CREATE TABLE IF NOT EXISTS $hardening_table (
			id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
			rule_key varchar(100) NOT NULL,
			type varchar(50) NOT NULL DEFAULT 'basic',
			name varchar(255) NOT NULL,
			enabled tinyint(1) NOT NULL DEFAULT 0,
			value varchar(255) DEFAULT '',
			created_at datetime DEFAULT NULL,
			updated_at datetime DEFAULT NULL,
			PRIMARY KEY (id),
			UNIQUE KEY rule_key (rule_key)
		) $charset_collate;";

		require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
		dbDelta($sql_hardening);
		update_option('phguard_db_version', '1.0.0');
	}

	private static function set_default_options(): void
	{
		require_once plugin_dir_path(PHGUARD_PLUGIN_FILE) . 'includes/class-phantom-guard-hardening.php';
		PhGuard_Hardening::ensure_default_rules();
	}
}
