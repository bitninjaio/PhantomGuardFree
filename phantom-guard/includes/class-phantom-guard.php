<?php

if (! defined('ABSPATH')) {
	exit; // Exit if accessed directly
}

/**
 * The file that defines the core plugin class
 *
 * A class definition that includes attributes and functions used across both the
 * public-facing side of the site and the admin area.
 *
 * @link       https://phantomguard.io
 * @since      1.0.0
 *
 * @package    PhGuard
 * @subpackage PhGuard/includes
 */

/**
 * The core plugin class.
 *
 * This is used to define internationalization, admin-specific hooks, and
 * public-facing site hooks.
 *
 * Also maintains the unique identifier of this plugin as well as the current
 * version of the plugin.
 *
 * @since      1.0.0
 * @package    PhGuard
 * @subpackage PhGuard/includes
 */
class PhGuard
{

	/**
	 * The loader that's responsible for maintaining and registering all hooks that power
	 * the plugin.
	 *
	 * @since    1.0.0
	 * @access   protected
	 * @var      PhGuard_Loader    $loader    Maintains and registers all hooks for the plugin.
	 */
	protected $loader;

	/**
	 * The unique identifier of this plugin.
	 *
	 * @since    1.0.0
	 * @access   protected
	 * @var      string    $plugin_name    The string used to uniquely identify this plugin.
	 */
	protected $plugin_name;

	/**
	 * The current version of the plugin.
	 *
	 * @since    1.0.0
	 * @access   protected
	 * @var      string    $version    The current version of the plugin.
	 */
	protected $version;

	/**
	 * Hardening manager instance.
	 *
	 * @since    1.0.0
	 * @access   protected
	 * @var      PhGuard_Hardening|null
	 */
	protected $hardening;

	/**
	 * Define the core functionality of the plugin.
	 *
	 * Set the plugin name and the plugin version that can be used throughout the plugin.
	 * Load the dependencies, define the locale, and set the hooks for the admin area and
	 * the public-facing side of the site.
	 *
	 * @since    1.0.0
	 */
	public function __construct()
	{
		if (defined('PHGUARD_VERSION')) {
			$this->version = PHGUARD_VERSION;
		} else {
			$this->version = '1.0.0';
		}
		$this->plugin_name = 'phguard';

		$this->load_dependencies();
		$this->check_database_version();
		$this->setup_hardening();
		$this->define_admin_hooks();
	}

	/**
	 * Load the required dependencies for this plugin.
	 *
	 * Include the following files that make up the plugin:
	 *
	 * - PhGuard_Loader. Orchestrates the hooks of the plugin.
	 * - PhGuard_Admin. Defines all hooks for the admin area.
	 * - PhGuard_Public. Defines all hooks for the public side of the site.
	 *
	 * Create an instance of the loader which will be used to register the hooks
	 * with WordPress.
	 *
	 * @since 1.0.0
	 *
	 * @access private
	 */
	private function load_dependencies(): void
	{

		/**
		 * The class responsible for orchestrating the actions and filters of the
		 * core plugin.
		 */
		$plugin_dir = plugin_dir_path(PHGUARD_PLUGIN_FILE);

		require_once $plugin_dir . 'includes/class-phantom-guard-loader.php';

		/**
		 * The class responsible for security hardening functionality.
		 */
		require_once $plugin_dir . 'includes/class-phantom-guard-hardening.php';

		// Load hardening rule classes
		require_once $plugin_dir . 'includes/hardening/class-phantom-guard-hardening-rule-base.php';
		require_once $plugin_dir . 'includes/hardening/class-phantom-guard-hardening-audit-log.php';
		require_once $plugin_dir . 'includes/hardening/class-phantom-guard-hardening-rule-constants.php';
		require_once $plugin_dir . 'includes/hardening/class-phantom-guard-hardening-rule-hide-version.php';
		require_once $plugin_dir . 'includes/hardening/class-phantom-guard-hardening-rule-xml-rpc.php';
		require_once $plugin_dir . 'includes/hardening/class-phantom-guard-hardening-rule-rest-api.php';
		require_once $plugin_dir . 'includes/hardening/class-phantom-guard-hardening-rule-obscure-login.php';
		require_once $plugin_dir . 'includes/hardening/class-phantom-guard-hardening-rule-wp-cron.php';
		require_once $plugin_dir . 'includes/hardening/class-phantom-guard-hardening-rule-ip-restriction.php';
		require_once $plugin_dir . 'includes/hardening/class-phantom-guard-hardening-rule-audit-log.php';
		require_once $plugin_dir . 'includes/hardening/class-phantom-guard-hardening-rule-rename-login.php';
		require_once $plugin_dir . 'includes/hardening/class-phantom-guard-hardening-rule-2fa.php';
		require_once $plugin_dir . 'includes/hardening/class-phantom-guard-hardening-rule-admin-login-email.php';

		/**
		 * The class responsible for defining all actions that occur in the admin area.
		 */
		require_once $plugin_dir . 'admin/class-phantom-guard-admin.php';

		$this->loader = new PhGuard_Loader();
	}

	/**
	 * Check and update database schema if needed
	 *
	 * @since 1.0.0
	 *
	 * @access private
	 */
	private function check_database_version(): void
	{
		$current_db_version = get_option('phguard_db_version', '0.0.0');
		$required_db_version = '1.0.0';

		if (version_compare($current_db_version, $required_db_version, '<')) {
			require_once plugin_dir_path(PHGUARD_PLUGIN_FILE) . 'includes/class-phantom-guard-activator.php';

			global $wpdb;
			$charset_collate = $wpdb->get_charset_collate();
			$hardening_table = $wpdb->prefix . 'phguard_hardening_rules';

			$sql_hardening = "CREATE TABLE $hardening_table (
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

			if (class_exists('PhGuard_Hardening')) {
				PhGuard_Hardening::ensure_default_rules();
			}

			// Update database version
			update_option('phguard_db_version', $required_db_version);
		}
	}

	/**
	 * Initialize the security hardening manager.
	 *
	 * @since    1.0.0
	 * @access   private
	 *
	 * @return void
	 */
	private function setup_hardening()
	{
		if (! class_exists('PhGuard_Hardening')) {
			return;
		}

		$this->hardening = new PhGuard_Hardening();
		$this->hardening->register($this->loader);
	}

	/**
	 * Register all of the hooks related to the admin area functionality
	 * of the plugin.
	 *
	 * @since 1.0.0
	 *
	 * @access private
	 */
	private function define_admin_hooks(): void
	{

		$plugin_admin = new PhGuard_Admin($this->get_plugin_name());

		$this->loader->add_action('admin_enqueue_scripts', $plugin_admin, 'enqueue_styles');
		$this->loader->add_action('admin_enqueue_scripts', $plugin_admin, 'enqueue_scripts');
		$this->loader->add_action('admin_enqueue_scripts', $plugin_admin, 'localize_scripts');
		$this->loader->add_action('admin_menu', $plugin_admin, 'add_admin_menu');

		$this->loader->add_action('wp_ajax_phguard_get_hardening_rules', $plugin_admin, 'ajax_get_hardening_rules');
		$this->loader->add_action('wp_ajax_phguard_update_hardening_rule', $plugin_admin, 'ajax_update_hardening_rule');
	}

	/**
	 * Run the loader to execute all of the hooks with WordPress.
	 *
	 * @since 1.0.0
	 */
	public function run(): void
	{
		$this->loader->run();
	}

	/**
	 * The name of the plugin used to uniquely identify it within the context of
	 * WordPress and to define internationalization functionality.
	 *
	 * @since     1.0.0
	 * @return    string    The name of the plugin.
	 */
	public function get_plugin_name()
	{
		return $this->plugin_name;
	}

	/**
	 * Retrieve the version number of the plugin.
	 *
	 * @since     1.0.0
	 * @return    string    The version number of the plugin.
	 */
	public function get_version()
	{
		return $this->version;
	}
}
