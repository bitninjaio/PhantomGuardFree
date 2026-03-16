# Hardening Rules Architecture

This directory contains the refactored hardening rule classes. Each rule is now in its own class file for better maintainability and readability.

## Structure

- `class-wp-ninja-hardening-rule-base.php` - Base class for all hardening rules
- `class-wp-ninja-hardening-rule-constants.php` - Constants-based rules (DISALLOW_FILE_EDIT, DISALLOW_FILE_MODS, FORCE_SSL_ADMIN)
- `class-wp-ninja-hardening-rule-hide-version.php` - Hide WordPress version
- `class-wp-ninja-hardening-rule-xml-rpc.php` - Disable XML-RPC
- `class-wp-ninja-hardening-rule-rest-api.php` - Disable REST API for anonymous users
- `class-wp-ninja-hardening-rule-obscure-login.php` - Obscure login feedback
- `class-wp-ninja-hardening-rule-wp-cron.php` - Disable wp-cron.php access
- `class-wp-ninja-hardening-rule-ip-restriction.php` - Restrict login by IP address
- `class-wp-ninja-hardening-rule-rename-login.php` - Rename login URL (complex)
- `class-wp-ninja-hardening-audit-log.php` - Audit logging functionality
- `class-wp-ninja-hardening-rule-2fa.php` - Two-factor authentication

## Usage

The main `Wp_Ninja_Hardening` class instantiates and manages these rule classes. Each rule class extends `Wp_Ninja_Hardening_Rule_Base` and implements the `register()` method to hook into WordPress.

