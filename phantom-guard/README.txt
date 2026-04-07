=== PhantomGuard ===
Contributors: phantomguard
Requires at least: 6.5
Tested up to: 6.9
Stable tag: 1.0.0
Requires PHP: 7.4
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

WordPress hardening: presets, audit log, modern UI. Free core rules; Pro adds scanning & CDN/DNS.

== Description ==

**PhantomGuard** helps you harden WordPress without editing code by hand. Pick a preset (Basic, Recommended, or Advanced), turn rules on or off, and review activity in the audit log—all from a modern admin interface.

**What you get in the free version**

* **Security presets** — Start with Basic, Recommended, or Advanced and adjust as needed.
* **Core hardening rules** — Force HTTPS for the admin area, hide the WordPress version, enable audit logging, and obscure login feedback to reduce information leaks.
* **Clear dashboard** — Overview, onboarding, settings, and support in one place.
* **Translations** — Admin UI available in English, German, and Italian.

**PhantomGuard Pro** (optional license) adds malware scanning, extended hardening rules, DNS/CDN management, traffic analytics, and more. You can enter a license key in the plugin when you’re ready.

**Legal**

By using PhantomGuard you agree to our [Terms of Service](https://phantomguard.io/terms) and [Privacy Policy](https://phantomguard.io/privacy).

== Installation ==

1. Upload the plugin folder to `/wp-content/plugins/`, or install **PhantomGuard** from the WordPress.org plugin directory.
2. Activate the plugin through the **Plugins** screen in WordPress.
3. Open **PhantomGuard** in the admin menu to configure hardening and explore the dashboard.

No extra configuration file is required for the free version—everything is managed in the plugin screens.

== Frequently Asked Questions ==

= Does the free version need a license? =

No. Hardening and the rules listed above work without a license. A PhantomGuard license is only required for Pro features such as malware scanning and advanced tools.

= Where do I change security rules? =

Go to **WordPress Admin → PhantomGuard** and use **Security Hardening** (and other tabs as labeled). Presets and individual rules are explained in the interface.

= What about malware scanning and Pro features? =

Those require **PhantomGuard Pro** and a valid license. The free plugin still shows where those features live so you can upgrade when you want full protection.

= Does PhantomGuard replace my security plugin? =

PhantomGuard focuses on **hardening and logging** in the free tier. Pro adds scanning and related tools. You can use it alongside other plugins if their features don’t overlap in a conflicting way.

== Screenshots ==

1. Dashboard overview and stats (some areas show Pro features when unlocked)
2. Malware scanner (Pro)
3. Security hardening rules and presets
4. CDN / DNS management (Pro)
5. Settings and license

== Changelog ==

= 1.0.0 =
* Initial release of PhantomGuard on WordPress.org.

== Upgrade Notice ==

= 1.0.0 =
First public release. Install and activate, then open PhantomGuard from the admin menu to get started.

== Source code ==

The admin area is built with **React** and **webpack**. The files shipped in this plugin (`assets/js/*.js`, `assets/css/*.css`) are minified for performance.

**Full source code** (readable and forkable) is here:
https://github.com/bitninjaio/PhantomGuardFree

**Build from source (developers)**

1. Clone the repository and `cd` into the plugin directory.
2. Run `npm install`
3. Run `npm run build` for production assets, or `npm run build:dev` / `npm run dev` for development builds.

See **README.md** in the repository for more detail.

== External services ==

PhantomGuard loads **Google Fonts** (Mulish) for the admin UI. Loading fonts may involve a request to Google; see their terms and privacy policy linked below.

**PhantomGuard Pro** may connect to additional services when you use a license (scanning, 2FA QR, license checks, CDN/DNS, etc.). Details:

= Google Fonts (fonts.googleapis.com) =
* **What it does:** Loads the Mulish font for the plugin’s admin screens.
* **Data sent:** No site content—only font requests (Google may log IP per their policy).
* **When:** While using PhantomGuard in the WordPress admin.
* **Terms:** https://developers.google.com/fonts/faq
* **Privacy:** https://policies.google.com/privacy

= BitNinja API (api.bitninja.io) — Pro only =
* **What it does:** Malware scanning, quarantine, license validation, and related Pro features.
* **Data sent:** May include file hashes, file content for deep scans, license key, site domain, and server IP as needed for the feature you use.
* **When:** While using Pro features that rely on the API.
* **Terms:** https://bitninja.com/terms-and-conditions/
* **Privacy:** https://bitninja.com/privacy-policy/

= GoQR API (api.qrserver.com) — Pro only =
* **What it does:** Generates QR codes for two-factor authentication setup.
* **Data sent:** OTP Auth URI in the request URL only (no separate account with GoQR required for basic use).
* **When:** Enabling 2FA in Pro hardening options.
* **Terms:** https://goqr.me/legal/tos-api.html
* **Privacy:** https://goqr.me/privacy-safety-security/

= IPify (api.ipify.org) — Pro only =
* **What it does:** Helps determine the server’s public IP for license validation.
* **Data sent:** Minimal request; response is your public IP.
* **When:** License validation in Pro.
* **Terms:** https://geo.ipify.org/terms-of-service
* **Privacy:** https://geo.ipify.org/privacy-policy/

= WordPress.org (api.wordpress.org, downloads.wordpress.org) — Pro only =
* **What it does:** Core/plugin checksum checks during scanning workflows.
* **Data sent:** WordPress version and plugin slug as needed for the check.
* **When:** During relevant Pro scan steps.
* **Terms:** https://wordpress.com/tos/
* **Privacy:** https://wordpress.org/about/privacy/

= Consent (Pro) =
Using a PhantomGuard Pro license and Pro features means those services may process data as described above. Core free hardening does not require a license.
