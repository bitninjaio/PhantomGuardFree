<?php

if (! defined('ABSPATH')) {
	exit; // Exit if accessed directly
}

/**
 * Admin functionality for PhantomGuard hardening plugin.
 *
 * @package    PhGuard
 * @subpackage PhGuard/admin
 */
class PhGuard_Admin
{

	private $plugin_name;

	public function __construct($plugin_name)
	{
		$this->plugin_name = $plugin_name;
	}

	/**
	 * Register the admin menu.
	 */
	public function add_admin_menu(): void
	{
		add_menu_page(
			__('PhantomGuard', 'phantom-guard'),
			__('PhantomGuard', 'phantom-guard'),
			'manage_options',
			'phguard',
			array($this, 'display_react_app'),
			'dashicons-shield',
			100
		);
	}

	/**
	 * Display the React app.
	 */
	public function display_react_app(): void
	{
?>
		<div class="wrap">
			<div id="phguard-react-app"></div>
		</div>
<?php
	}

	/**
	 * Enqueue admin styles.
	 */
	public function enqueue_styles(): void
	{
		$screen = get_current_screen();
		if ($screen && strpos($screen->id, 'phguard') !== false) {
			wp_enqueue_style(
				'phguard-fonts-mulish',
				'https://fonts.googleapis.com/css2?family=Mulish:ital,wght@0,200..1000;1,200..1000&display=swap',
				array(),
				null
			);
			$plugin_dir = plugin_dir_path(PHGUARD_PLUGIN_FILE);
			$css_rel_path = 'assets/css/phguard-admin.css';
			$css_path = $plugin_dir . $css_rel_path;
			$css_url = plugins_url($css_rel_path, PHGUARD_PLUGIN_FILE);
			$version = file_exists($css_path) ? filemtime($css_path) : (defined('PHGUARD_VERSION') ? PHGUARD_VERSION : '1.0.0');
			wp_enqueue_style($this->plugin_name, $css_url, array(), $version, 'all');
		}
	}

	/**
	 * Enqueue admin scripts.
	 */
	public function enqueue_scripts(): void
	{
		$screen = get_current_screen();
		if ($screen && strpos($screen->id, 'phguard') !== false) {
			$plugin_dir = plugin_dir_path(PHGUARD_PLUGIN_FILE);
			$js_rel_path = 'assets/js/phguard-admin.js';
			$js_path = $plugin_dir . $js_rel_path;
			$js_url = plugins_url($js_rel_path, PHGUARD_PLUGIN_FILE);
			$version = file_exists($js_path) ? filemtime($js_path) : (defined('PHGUARD_VERSION') ? PHGUARD_VERSION : '1.0.0');
			wp_enqueue_script($this->plugin_name, $js_url, array(), $version, true);
		}
	}

	public function localize_scripts(): void
	{
		$page = isset($_GET['page']) ? sanitize_text_field(wp_unslash($_GET['page'])) : '';

		if ($page === 'phguard') {
			wp_localize_script(
				$this->plugin_name,
				'phguardData',
				array(
					'ajaxUrl' => admin_url('admin-ajax.php'),
					'nonce' => wp_create_nonce('PhGuard_scan'),
					'historyNonce' => wp_create_nonce('PhGuard_history'),
					'i18n' => array()
				)
			);
		}
	}

	/**
	 * AJAX: Get hardening rules
	 */
	public function ajax_get_hardening_rules(): void
	{
		check_ajax_referer('PhGuard_scan', 'nonce');
		if (! current_user_can('manage_options')) {
			wp_send_json_error(array('message' => __('Unauthorized', 'phantom-guard')));
			return;
		}
		$hardening = new PhGuard_Hardening();
		wp_send_json_success(array(
			'rules' => $hardening->get_rules_for_response(),
			'preset' => $hardening->get_preset_for_response(),
		), 200);
	}

	/**
	 * AJAX: Update a hardening rule (enable/disable or update value)
	 */
	public function ajax_update_hardening_rule(): void
	{
		check_ajax_referer('PhGuard_scan', 'nonce');
		if (! current_user_can('manage_options')) {
			wp_send_json_error(array('message' => __('Unauthorized', 'phantom-guard')));
			return;
		}
		$rule_key = isset($_POST['rule_key']) ? sanitize_key(wp_unslash($_POST['rule_key'])) : '';
		if ('' === $rule_key) {
			wp_send_json_error(array('message' => __('Missing rule key.', 'phantom-guard')));
			return;
		}
		$enabled = null;
		if (isset($_POST['enabled'])) {
			$enabled_input = sanitize_text_field(wp_unslash($_POST['enabled']));
			$enabled = filter_var($enabled_input, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE);
		}
		$value = isset($_POST['value']) ? sanitize_text_field(wp_unslash($_POST['value'])) : null;
		$hardening = new PhGuard_Hardening();
		if (true === $enabled && 'rename_admin_url' === $rule_key) {
			if (null === $value || '' === trim($value)) {
				wp_send_json_error(array('message' => __('Please provide a custom login URL slug before enabling this rule.', 'phantom-guard')));
				return;
			}
		}
		if (null !== $value) {
			if (! $hardening->update_rule_value($rule_key, $value)) {
				wp_send_json_error(array('message' => __('Failed to update rule value.', 'phantom-guard')));
				return;
			}
		}
		if (null !== $enabled) {
			if (! $hardening->set_rule_state($rule_key, $enabled)) {
				wp_send_json_error(array('message' => __('Failed to update rule state.', 'phantom-guard')));
				return;
			}
		}
		wp_send_json_success(array(
			'rules' => $hardening->get_rules_for_response(),
			'preset' => $hardening->get_preset_for_response(),
		), 200);
	}
}
