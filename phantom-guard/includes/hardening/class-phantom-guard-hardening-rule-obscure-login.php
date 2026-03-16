<?php

if (! defined('ABSPATH')) {
    exit; // Exit if accessed directly
}

/**
 * Hardening rule to obscure login feedback.
 *
 * @link       https://phantomguard.io
 * @since      1.0.0
 *
 * @package    PhGuard
 * @subpackage PhGuard/includes/hardening
 */
class PhGuard_Hardening_Rule_Obscure_Login extends PhGuard_Hardening_Rule_Base
{
    /**
     * Rule key identifier.
     *
     * @var string
     */
    protected $rule_key = 'obscure_login_feedback';

    /**
     * Register hooks for this rule.
     *
     * @param PhGuard_Loader $loader Plugin loader instance.
     * @return void
     */
    public function register(PhGuard_Loader $loader)
    {
        if ($this->enabled) {
            $loader->add_filter('login_errors', $this, 'filter_login_errors_message');
            $loader->add_action('login_enqueue_scripts', $this, 'enqueue_login_form_script');
            $this->ensure_theme_login_snippet();
        }
    }

    /**
     * Filter login errors to return a generic message.
     *
     * @return string
     */
    public function filter_login_errors_message()
    {
        return __('An error occurred. Please try again.', 'phantom-guard');
    }

    /**
     * Enqueue login form script via wp_add_inline_script (WordPress best practice).
     * Clears the username field on DOMContentLoaded.
     *
     * @return void
     */
    public function enqueue_login_form_script()
    {
        wp_register_script('phguard-obscure-login', false, array(), PHGUARD_VERSION, true);
        wp_enqueue_script('phguard-obscure-login');
        $inline = "document.addEventListener('DOMContentLoaded',function(){var userInput=document.getElementById('user_login');if(userInput){userInput.value='';}});";
        wp_add_inline_script('phguard-obscure-login', $inline);
    }

    /**
     * Ensure the login feedback snippet exists in the active theme functions.php file.
     *
     * @return bool
     */
    private function ensure_theme_login_snippet()
    {
        $path = $this->get_theme_functions_path();
        if (! $path || ! file_exists($path)) {
            return false;
        }

        $fs = $this->get_wp_filesystem();
        if (! $fs || ! $fs->is_writable($path)) {
            return false;
        }

        $contents = file_get_contents($path);
        if (false === $contents) {
            return false;
        }

        $snippet = $this->get_login_snippet();
        $snippet_with_open = "<?php\n" . $snippet;

        if (false !== strpos($contents, $snippet) || false !== strpos($contents, $snippet_with_open)) {
            return true;
        }

        $contents = $this->get_legacy_login_snippet($contents);

        $trimmed = rtrim($contents);
        $needs_open = (substr($trimmed, -2) === '?>');
        $block = $needs_open ? $snippet_with_open : $snippet;

        if ($trimmed !== '') {
            $trimmed .= "\n\n";
        }

        $trimmed .= $block . "\n";

        return false !== file_put_contents($path, $trimmed, LOCK_EX);
    }

    /**
     * Remove the login feedback snippet from the theme functions.php file.
     *
     * @return bool
     */
    public function remove_theme_login_snippet()
    {
        $path = $this->get_theme_functions_path();
        if (! $path || ! file_exists($path)) {
            return false;
        }

        $fs = $this->get_wp_filesystem();
        if (! $fs || ! $fs->is_writable($path)) {
            return false;
        }

        $contents = file_get_contents($path);
        if (false === $contents) {
            return false;
        }

        $snippet = $this->get_login_snippet();
        $snippet_with_open = "<?php\n" . $snippet;

        $updated = $this->get_legacy_login_snippet($contents);
        $updated = str_replace($snippet_with_open, '', $updated);
        $updated = str_replace($snippet, '', $updated);

        if ($updated === $contents) {
            return true;
        }

        $updated = rtrim($updated);
        if ($updated !== '') {
            $updated .= "\n";
        }

        return false !== file_put_contents($path, $updated, LOCK_EX);
    }

    /**
     * Get the full snippet inserted into the theme functions.php file.
     * Uses wp_add_inline_script (WordPress best practice) instead of inline <script>.
     *
     * @return string
     */
    private function get_login_snippet()
    {
        $version = defined('PHGUARD_VERSION') ? PHGUARD_VERSION : '1.0.0';
        $inline_js = "document.addEventListener('DOMContentLoaded',function(){var userInput=document.getElementById('user_login');if(userInput){userInput.value='';}});";

        $lines = array(
            '/**',
            ' * PhantomGuard Hardening snippet: obscure login feedback.',
            ' */',
            "add_filter('login_errors', function() {",
            "    return 'An error occurred. Please try again.';",
            '});',
            '',
            "add_action('login_enqueue_scripts', function() {",
            "    wp_register_script('phguard-obscure-login', false, array(), '" . $version . "', true);",
            "    wp_enqueue_script('phguard-obscure-login');",
            "    wp_add_inline_script('phguard-obscure-login', " . var_export($inline_js, true) . ");",
            '});',
            '/**',
            ' * End PhantomGuard Hardening snippet.',
            ' */',
        );

        return implode("\n", $lines);
    }

    /**
     * The current snippet uses wp_add_inline_script() via login_enqueue_scripts.
     *
     * @param string $contents Theme functions.php content.
     * @return string Content with legacy snippet removed.
     */
    private function get_legacy_login_snippet($contents)
    {
        $pattern = '#/\*\*\s*\*\s*PhantomGuard Free Hardening snippet: obscure login feedback\.\s*\*/\s*'
            . "add_filter\('login_errors',\s*function\s*\(\)\s*\{\s*"
            . "return\s+'An error occurred\. Please try again\.';\s*"
            . '\}\);\s*'
            . "add_action\('login_form',\s*function\s*\(\)\s*\{\s*"
            . '\?\>\s*'
            . '[\s\S]*?'
            . '\<\?php\s*'
            . '\}\);\s*'
            . '/\*\*\s*\*\s*End PhantomGuard Free Hardening snippet\.\s*\*/\s*#';

        return preg_replace($pattern, '', $contents);
    }

    /**
     * Determine the path to the active theme functions.php file.
     *
     * @return string|false
     */
    private function get_theme_functions_path()
    {
        if (! function_exists('get_stylesheet_directory')) {
            return false;
        }

        return trailingslashit(get_stylesheet_directory()) . 'functions.php';
    }

    /**
     * Get rule configuration for default rules.
     *
     * @return array<string, mixed>
     */
    public static function get_default_config($rule_key = null)
    {
        return array(
            'type' => 'basic',
            'name' => did_action('init') ? __('Obscure login error details', 'phantom-guard') : 'Obscure login error details',
            'enabled' => true,
            'value' => '',
        );
    }
}
