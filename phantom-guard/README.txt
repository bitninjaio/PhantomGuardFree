=== PhantomGuard ===
Contributors: phantomguard
Requires at least: 6.8
Tested up to: 6.9
Stable tag: 1.0.0
Requires PHP: 7.4
License: GPLv2 or later
License URI: http://www.gnu.org/licenses/gpl-2.0.html

PhantomGuard provides WordPress security hardening with a React-based admin UI.
Malware scanning and advanced features require PhantomGuard Pro.

== Source Code ==
The admin UI uses React and webpack; the distributed assets (assets/js/*.js, assets/css/*.css) are minified. The full, human-readable source code is available at:
https://github.com/bitninjaio/PhantomGuardFree

To build from source: npm install && npm run build (or npm run build:dev for unminified output). See README.md for details.

== Description ==
PhantomGuard provides essential WordPress security hardening with a
modern React-based admin interface. Protect your site with configurable
security rules, audit logging, and presets. Upgrade to PhantomGuard Pro for
malware scanning, DNS management, and additional hardening options.

== Terms & Privacy ==
By using PhantomGuard, you agree to:
- Terms of Service: https://phantomguard.io/terms
- Privacy Policy: https://phantomguard.io/privacy

== Highlights ==
– Security hardening with Basic, Recommended, and Advanced presets
– Four functional rules: Force HTTPS for admin, Hide WP version, Audit logging, Obscure login feedback
– React admin app with i18n support (English, German, Italian)
– Dashboard overview and onboarding flow
– Settings and Support pages
– License key configuration (Pro features require valid license)

== Structure ==
– phantom-guard.php: Plugin bootstrap
– includes/: Core classes, hardening rules
– admin/: WP admin integration and AJAX
– public/: Public-facing hooks
– src/: React admin app source
– assets/: Built JS/CSS
– webpack.config.js: Frontend build config

== Requirements ==
– WordPress
– PHP 7.4+
– Node.js + npm (for building the admin UI)

== Setup (Dev) ==
cd phantom-guard
npm install
npm run build:dev  (or: npm run build / npm run dev)

== Usage ==
WordPress Admin -> PhantomGuard

== Configuration ==
– includes/class-phantom-guard-config.php

== Key Components ==
– includes/class-phantom-guard.php
– includes/hardening/
– src/App.jsx

== Premium Features (PhantomGuard Pro) ==

The following features are available in PhantomGuard Pro and require a valid license:

= Malware Scanning =
* Two-phase malware scanning with background processing
* Manual and scheduled scans
* Quarantine, restore, and file cleanup workflows
* File content preview for infected files
* Scan history and results

= Security Hardening (Extended) =
* Advanced hardening rules: Disallow file edit, Disallow file mods
* XML-RPC and REST API disable options
* Rename admin/login URL
* Disable WP-Cron
* Restrict login by IP address
* Two-Factor Authentication (2FA) with TOTP

= DNS Management =
* Bunny CDN integration
* Pull Zone management
* DNS record management
* Free SSL certificate provisioning
* Traffic and geo charts

= Dashboard (Extended) =
* Cache purge
* Bunny CDN statistics
* Next scheduled scan info
* Traffic statistics

== External Services ==

PhantomGuard communicates with the following external services:

= Google Fonts (fonts.googleapis.com) =
* Function: Mulish font for the admin UI.
* Data sent: None (font file request only; Google may log IP per their policy).
* When: Loading PhantomGuard admin pages.
* Terms: https://developers.google.com/fonts/faq
* Privacy: https://policies.google.com/privacy

PhantomGuard Pro additionally uses these services:

= BitNinja API (api.bitninja.io) =
* Function: Malware scanning, quarantine, license validation, settings, CDN/DNS management.
* Data sent: File MD5 hashes, file content (for Phase 2 scan), license key, site domain, server IP address.
* When: Manual scan, scheduled scan, file restore, license check, settings save, DNS/Pull Zone operations.
* Terms: https://bitninja.com/terms-and-conditions/
* Privacy: https://bitninja.com/privacy-policy/

= GoQR API (api.qrserver.com) =
* Function: 2FA QR code image generation for TOTP setup.
* Data sent: OTP Auth URI (site name, username, TOTP secret) – encoded in URL only; no account data.
* When: User enables Two-Factor Authentication in Security Hardening.
* Terms: https://goqr.me/legal/tos-api.html
* Privacy: https://goqr.me/privacy-safety-security/

= Google Charts (www.gstatic.com) =
* Function: Chart rendering (traffic, geo) in Dashboard and DNS Management.
* Data sent: Chart data (traffic stats, country codes) – used only for visualization.
* When: Viewing Dashboard or DNS Management with charts.
* Terms: https://developers.google.com/chart/terms
* Privacy: https://policies.google.com/privacy

= IPify (api.ipify.org) =
* Function: Detect server external IP for license validation.
* Data sent: None (returns public IP only).
* When: License validation.
* Terms: https://geo.ipify.org/terms-of-service
* Privacy: https://geo.ipify.org/privacy-policy

= WordPress.org (api.wordpress.org, downloads.wordpress.org) =
* Function: Core and plugin checksum verification for integrity checks.
* Data sent: WordPress version, plugin slug.
* When: Integrity verification during scan.
* Terms: https://wordpress.com/tos/
* Privacy: https://wordpress.org/about/privacy/

= AG Grid Community (ag-grid-community, ag-grid-react) =
* Function: Data grid component for tables (DNS records, infected files list).
* Source: Bundled locally in the plugin via npm; no CDN or remote requests.
* Where used: DNS Management page (Pro), Malware Scanner infected files table (Pro).
* License: MIT (https://github.com/ag-grid/ag-grid/blob/master/LICENSE.txt).
* Note: PhantomGuard uses the Community edition only; no Enterprise features or external calls.

= JavaScript and CSS Resources =
* react-google-charts: Loads Google Charts loader from www.gstatic.com when charts are displayed (Pro only).

= User Consent =
License activation and malware scanning require a valid PhantomGuard license. By activating the license, you consent to the data flows described above. No additional opt-in is required for these core features.

== Frequently Asked Questions ==
= Does this plugin require a BitNinja account? =
A PhantomGuard license is required for malware scanning and advanced features. The free version provides security hardening without a license.

= Does it run scans automatically? =
Scans can be triggered manually or scheduled via the plugin settings. This feature requires PhantomGuard Pro.

= What security rules work in the free version? =
Four rules are functional in the free version: Force HTTPS for admin, Hide WP version, Audit logging, and Obscure login feedback. Additional rules are available in PhantomGuard Pro.

== Screenshots ==
1. Dashboard overview
2. Malware scanner and results (Pro)
3. Security hardening rules
4. DNS management (Pro)
5. Settings

== Changelog ==
= 1.0.0 =
* Initial release.

== Upgrade Notice ==
= 1.0.0 =
Initial release.
