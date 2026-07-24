=== PhantomGuard ===
Contributors: phantomguard
Requires at least: 6.5
Tested up to: 7.0.2
Stable tag: 1.0.1
Requires PHP: 7.4
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-3.0.html

WordPress security suite: malware scanning, hardening, CDN/DNS, Under Attack Mode, and a modern React admin UI.

== Description ==

**PhantomGuard** is a full WordPress security suite—malware scanning, hardening, CDN/DNS protection, and a clear admin dashboard—so you can lock down and monitor your site without editing code by hand.

Enter a **PhantomGuard Pro** license in the plugin to unlock the complete toolkit.

== Highlights ==

* Two-phase malware scanning with background processing
* Quarantine, restore, and file cleanup workflows
* Security hardening rules (2FA, XML-RPC, REST API, rename login, and more)
* Dashboard plugin vulnerability check (WPVulnerability API)
* Under Attack Mode: one-click DDoS shield sensitivity level 4 (CDN) from the PhantomGuard Dashboard, the WordPress Dashboard widget, and the admin toolbar; optional email to the site admin when this mode is enabled
* Audit logging and scan history
* React admin app with i18n support (English, German, Italian)

**Also included with Pro**

* Security presets (Basic, Recommended, Advanced) plus fine-grained rule control
* DNS/CDN management and traffic analytics
* Extended hardening beyond the essentials

**Legal**

By using PhantomGuard you agree to our [Terms of Service](https://phantomguard.io/terms) and [Privacy Policy](https://phantomguard.io/privacy).

== Installation ==

1. Upload the plugin folder to `/wp-content/plugins/`, or install **PhantomGuard** from the WordPress.org plugin directory.
2. Activate the plugin through the **Plugins** screen in WordPress.
3. Open **PhantomGuard** in the admin menu to configure hardening and explore the dashboard.

No extra configuration file is required—everything is managed in the plugin screens. Add your Pro license under Settings to unlock the full suite.

== Frequently Asked Questions ==

= Does the free version need a license? =

No. Hardening and the rules listed above work without a license. A PhantomGuard license is only required for Pro features such as malware scanning and advanced tools.

= Where do I change security rules? =

Go to **WordPress Admin → PhantomGuard** and use **Security Hardening** (and other tabs as labeled). Presets and individual rules are explained in the interface.

= What about malware scanning and Pro features? =

Those require **PhantomGuard Pro** and a valid license. The free plugin still shows where those features live so you can upgrade when you want full protection.

= Does PhantomGuard replace my security plugin? =

PhantomGuard focuses on **hardening and logging** in the free tier. Pro adds scanning and related tools. You can use it alongside other plugins if their features don’t overlap in a conflicting way.

= Does PhantomGuard connect to external services? =

Yes. PhantomGuard loads **Google Fonts** (Mulish) for the admin UI. Loading fonts may involve a request to Google; see their terms and privacy policy linked below.

**PhantomGuard Pro** may connect to additional services when you use a license (scanning, 2FA QR, license checks, CDN/DNS, etc.). Details:

**WPVulnerability API (www.wpvulnerability.net)**
* **What it does:** Supplies vulnerability metadata used to flag plugins that may need updates on the dashboard.
* **Data sent:** For each installed plugin, the plugin slug is requested in the URL path (no WordPress content or credentials).
* **When:** When you open the PhantomGuard dashboard (or when the dashboard requests a refresh of this data).
* **Terms:** See the service operator’s site for current terms.
* **Privacy:** See the service operator’s site for their privacy policy.

**Google Fonts (fonts.googleapis.com)**
* **What it does:** Loads the Mulish font for the plugin’s admin screens.
* **Data sent:** No site content—only font requests (Google may log IP per their policy).
* **When:** While using PhantomGuard in the WordPress admin.
* **Terms:** https://developers.google.com/fonts/faq
* **Privacy:** https://policies.google.com/privacy

**BitNinja API (api.bitninja.io) — Pro only**
* **What it does:** Malware scanning, quarantine, license validation, and related Pro features.
* **Data sent:** May include file hashes, file content for deep scans, license key, site domain, and server IP as needed for the feature you use.
* **When:** While using Pro features that rely on the API.
* **Terms:** https://bitninja.com/terms-and-conditions/
* **Privacy:** https://bitninja.com/privacy-policy/

**GoQR API (api.qrserver.com) — Pro only**
* **What it does:** Generates QR codes for two-factor authentication setup.
* **Data sent:** OTP Auth URI in the request URL only (no separate account with GoQR required for basic use).
* **When:** Enabling 2FA in Pro hardening options.
* **Terms:** https://goqr.me/legal/tos-api.html
* **Privacy:** https://goqr.me/privacy-safety-security/

**IPify (api.ipify.org) — Pro only**
* **What it does:** Helps determine the server’s public IP for license validation.
* **Data sent:** Minimal request; response is your public IP.
* **When:** License validation in Pro.
* **Terms:** https://geo.ipify.org/terms-of-service
* **Privacy:** https://geo.ipify.org/privacy-policy/

**WordPress.org (api.wordpress.org, downloads.wordpress.org) — Pro only**
* **What it does:** Core/plugin checksum checks during scanning workflows.
* **Data sent:** WordPress version and plugin slug as needed for the check.
* **When:** During relevant Pro scan steps.
* **Terms:** https://wordpress.com/tos/
* **Privacy:** https://wordpress.org/about/privacy/

= Do I consent to those services by using the plugin? =

The dashboard plugin check uses WPVulnerability as described above. Using a PhantomGuard Pro license and Pro features means those additional services may process data as described above. Core free hardening does not require a license.

= Where can I find the source code? =

The admin area is built with **React** and **webpack**. The files shipped in this plugin (`assets/js/*.js`, `assets/css/*.css`) are minified for performance.

**Full source code** (readable and forkable) is here:
https://github.com/bitninjaio/PhantomGuardFree

**Build from source (developers)**

1. Clone the repository and `cd` into the plugin directory.
2. Run `npm install`
3. Run `npm run build` for production assets, or `npm run build:dev` / `npm run dev` for development builds.

See **README.md** in the repository for more detail.

== Screenshots ==

1. Dashboard overview and stats (some areas show Pro features when unlocked)
2. Malware scanner (Pro)
3. Security hardening rules and presets
4. CDN / DNS management (Pro)
5. Settings and license
6. Plugin vulnerability checker and patcher

== Changelog ==

= 1.0.1 =
* Dashboard: plugin vulnerability check (WPVulnerability API) with update links via WordPress core update flow.

= 1.0.0 =
* Initial release of PhantomGuard on WordPress.org.

== Upgrade Notice ==

= 1.0.1 =
Adds the dashboard plugin vulnerability overview and WPVulnerability disclosure in the readme.

= 1.0.0 =
First public release. Install and activate, then open PhantomGuard from the admin menu to get started.
