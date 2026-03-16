<?php

if (! defined('ABSPATH')) {
	exit; // Exit if accessed directly
}

/**
 * The plugin bootstrap file
 *
 * This file is read by WordPress to generate the plugin information in the plugin
 * admin area. This file also includes all of the dependencies used by the plugin,
 * registers the activation and deactivation functions, and defines a function
 * that starts the plugin.
 *
 * @link              https://phantomguard.io
 * @since             1.0.0
 * @package           PhantomGuard
 *
 * @wordpress-plugin
 * Plugin Name:       PhantomGuard
 * Plugin URI:        https://phantomguard.io
 * Description:       WordPress security hardening with automated rules. Protect your site with essential security measures.
 * Version:           1.0.0
 * Author:            PhantomGuard
 * Author URI:        https://phantomguard.io/
 * License:           GPL-2.0+
 * License URI:       http://www.gnu.org/licenses/gpl-2.0.txt
 * Text Domain:       phantom-guard
 */

// If this file is called directly, abort.
if (! defined('WPINC')) {
	die;
}

/**
 * Currently plugin version.
 * Start at version 1.0.0 and use SemVer - https://semver.org
 * Rename this for your plugin and update it as you release new versions.
 */
define('PHGUARD_VERSION', '1.0.0');
define('PHGUARD_PLUGIN_FILE', __FILE__);

/**
 * The code that runs during plugin activation.
 * This action is documented in includes/class-phantom-guard-activator.php
 */
function phguard_activate(): void
{
	require_once plugin_dir_path(PHGUARD_PLUGIN_FILE) . 'includes/class-phantom-guard-activator.php';
	PhGuard_Activator::activate();
}

/**
 * The code that runs during plugin deactivation.
 * This action is documented in includes/class-phantom-guard-deactivator.php
 */
function phguard_deactivate(): void
{
	require_once plugin_dir_path(PHGUARD_PLUGIN_FILE) . 'includes/class-phantom-guard-deactivator.php';
	PhGuard_Deactivator::deactivate();
}

register_activation_hook(PHGUARD_PLUGIN_FILE, 'phguard_activate');
register_deactivation_hook(PHGUARD_PLUGIN_FILE, 'phguard_deactivate');

/**
 * The core plugin class that is used to define internationalization,
 * admin-specific hooks, and public-facing site hooks.
 */
require plugin_dir_path(PHGUARD_PLUGIN_FILE) . 'includes/class-phantom-guard.php';

/**
 * Begins execution of the plugin.
 *
 * Since everything within the plugin is registered via hooks,
 * then kicking off the plugin from this point in the file does
 * not affect the page life cycle.
 *
 * @since 1.0.0
 */
function phguard_run(): void
{

	$plugin = new PhGuard();
	$plugin->run();
}
phguard_run();
