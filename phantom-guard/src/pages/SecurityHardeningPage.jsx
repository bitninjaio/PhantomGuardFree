import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Shield, ChevronDown, ChevronUp, QrCode, LayoutGrid, LayoutList, ShieldCheck, Layers, Settings, Lock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { useConfirm } from '../hooks/useConfirm';
import { useHardening } from '../hooks/useHardening';
const SecurityHardeningPage = () => {
  const { t } = useTranslation();
  const { confirm, ConfirmDialog } = useConfirm();
  const {
    rules: hardeningRules,
    preset: hardeningPreset,
    isLoading: hardeningLoading,
    pending: hardeningPending,
    error: hardeningError,
    successMessage: hardeningSuccess,
    updateRule: updateHardeningRule,
  } = useHardening();
  
  const [adminSlug, setAdminSlug] = useState('');
  const [allowedIps, setAllowedIps] = useState('');
  const [twoFactorStatus, setTwoFactorStatus] = useState(null);
  const [twoFactorLoading, setTwoFactorLoading] = useState(false);
  const [twoFactorSecret, setTwoFactorSecret] = useState('');
  const [twoFactorQrUrl, setTwoFactorQrUrl] = useState('');
  const [twoFactorVerifyCode, setTwoFactorVerifyCode] = useState('');
  const [twoFactorSetupVisible, setTwoFactorSetupVisible] = useState(false);
  const [expandedRuleTypes, setExpandedRuleTypes] = useState({
    basic: true,
    recommended: true,
    advanced: true,
  });
  const [layoutMode, setLayoutMode] = useState('columns'); // 'stacked' or 'columns'

  const baseUrl = (typeof window !== 'undefined' && window.location?.origin) ? window.location.origin : '';

  const renameRule = useMemo(
    () => hardeningRules?.find((rule) => rule.key === 'rename_admin_url'),
    [hardeningRules]
  );

  const restrictIpRule = useMemo(
    () => hardeningRules?.find((rule) => rule.key === 'restrict_login_by_ip'),
    [hardeningRules]
  );

  const enable2faRule = useMemo(
    () => hardeningRules?.find((rule) => rule.key === 'enable_2fa'),
    [hardeningRules]
  );

  useEffect(() => {
    if (renameRule) {
      setAdminSlug(renameRule.value || '');
    }
  }, [renameRule]);

  useEffect(() => {
    if (restrictIpRule) {
      setAllowedIps(restrictIpRule.value || '');
    }
  }, [restrictIpRule]);

  // Fetch current user's 2FA status
  useEffect(() => {
    if (enable2faRule?.enabled) {
      fetchCurrentUser2FAStatus();
    } else {
      setTwoFactorStatus(null);
    }
  }, [enable2faRule?.enabled]);

  const fetchCurrentUser2FAStatus = async () => {
    setTwoFactorLoading(true);
    setTwoFactorStatus(null);
    setTwoFactorLoading(false);
  };

  const handleGenerate2FASecret = async () => {
    toast.info(t('hardening.2fa.premiumFeature', { defaultValue: 'Two-Factor Authentication is available in PhantomGuard Pro.' }));
  };

  const handleVerify2FASetup = async () => {
    toast.info(t('hardening.2fa.premiumFeature', { defaultValue: 'Two-Factor Authentication is available in PhantomGuard Pro.' }));
  };

  const handleDisable2FA = async () => {
    toast.info(t('hardening.2fa.premiumFeature', { defaultValue: 'Two-Factor Authentication is available in PhantomGuard Pro.' }));
  };

  // Show toasts for hardening errors and success messages
  useEffect(() => {
    if (hardeningError) {
      toast.error(hardeningError);
    }
  }, [hardeningError]);

  useEffect(() => {
    if (hardeningSuccess) {
      toast.success(hardeningSuccess);
    }
  }, [hardeningSuccess]);

  const handleBookmarkClick = useCallback((url) => {
    if (!url) {
      return;
    }

    try {
      if (window.sidebar && typeof window.sidebar.addPanel === 'function') {
        window.sidebar.addPanel(document.title, url, '');
        return;
      }

      if (window.external && typeof window.external.AddFavorite === 'function') {
        window.external.AddFavorite(url, document.title);
        return;
      }
    } catch (error) {
      // Ignore and fallback to opening in new tab.
    }

    window.open(url, '_blank', 'noopener,noreferrer');
  }, []);

  const hardeningDescriptions = {
    disallow_file_edit: t('settings.hardening.descriptions.disallowFileEdit', { defaultValue: 'Prevents editing plugin and theme files directly from wp-admin.' }),
    disallow_file_mods: t('settings.hardening.descriptions.disallowFileMods', { defaultValue: 'Blocks installing or updating plugins and themes from the dashboard.' }),
    disable_xml_rpc: t('settings.hardening.descriptions.disableXmlRpc', { defaultValue: 'Disables the XML-RPC endpoint to reduce brute-force and spam attacks.' }),
    rename_admin_url: t('settings.hardening.descriptions.renameAdminUrl', { defaultValue: 'Require a custom login URL so bots can\'t find wp-login.php.' }),
    hide_wp_version: t('settings.hardening.descriptions.hideWpVersion', { defaultValue: 'Removes WordPress version metadata from public pages.' }),
    force_ssl_admin: t('settings.hardening.descriptions.forceSslAdmin', { defaultValue: 'Forces wp-admin to load over HTTPS only.' }),
    restrict_login_by_ip: t('settings.hardening.descriptions.restrictLoginByIp', { defaultValue: 'Restricts login attempts to specific IP addresses only.' }),
    log_admin_events: t('settings.hardening.descriptions.logAdminEvents', { defaultValue: 'Logs admin logins, password changes, and admin user creation events.' }),
    enable_2fa: t('settings.hardening.descriptions.enable2fa', { defaultValue: 'Adds an extra layer of security by requiring a time-based code from an authenticator app during login.' }),
  };

  // Group rules by type
  const rulesByType = useMemo(() => {
    const grouped = {
      basic: [],
      recommended: [],
      advanced: [],
    };

    hardeningRules.forEach((rule) => {
      const type = rule.type || 'basic';
      if (grouped[type]) {
        grouped[type].push(rule);
      }
    });

    return grouped;
  }, [hardeningRules]);

  const toggleRuleType = (type) => {
    setExpandedRuleTypes((prev) => ({
      ...prev,
      [type]: !prev[type],
    }));
  };

  const renderRule = (rule, isLocked = false) => {
    const isPending = !!hardeningPending[rule.key];
    const ruleDescription = hardeningDescriptions[rule.key] || '';
    const isRenameRule = rule.key === 'rename_admin_url';
    const isRestrictIpRule = rule.key === 'restrict_login_by_ip';

    return (
      <div
        key={rule.key}
        className={`border border-gray-200 dark:border-gray-700 rounded-lg p-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between relative ${
          isLocked ? 'opacity-50 pointer-events-none' : ''
        }`}
      >
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            {rule.enabled && (
              <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                {t('settings.hardening.activeLabel', { defaultValue: 'Active' })}
              </span>
            )}
          </div>
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{rule.name}</p>
          {ruleDescription && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{ruleDescription}</p>
          )}

          {isRenameRule && (
            <div className="mt-3 space-y-2">
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                {t('settings.hardening.rename.slugLabel', { defaultValue: 'Custom login slug' })}
              </label>
              <div className="flex flex-col gap-2 sm:flex-row">
                <input
                  type="text"
                  value={adminSlug}
                  onChange={(event) => setAdminSlug(event.target.value)}
                  placeholder={t('settings.hardening.rename.slugPlaceholder', { defaultValue: 'e.g. ninja-login' })}
                  className="phguard-input sm:flex-1"
                  disabled={isPending}
                />
                <button
                  type="button"
                  onClick={handleSaveAdminSlug}
                  disabled={
                    isPending
                    || hardeningLoading
                    || !rule.enabled
                    || !adminSlug.trim()
                  }
                  className="px-4 py-2 rounded-lg border border-indigo-200 text-indigo-600 hover:bg-indigo-50 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isPending ? t('settings.hardening.rename.saving', { defaultValue: 'Saving...' }) : t('settings.hardening.rename.save', { defaultValue: 'Save slug' })}
                </button>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {t('settings.hardening.rename.slugHint', { defaultValue: 'Your login page will be available at:' })} {' '}
                <code className="bg-gray-100 dark:bg-gray-900/40 px-1 py-0.5 rounded">{`${baseUrl}/${(adminSlug || rule.value || '').replace(/^\/+|\/+$/g, '') || 'your-slug'}`}</code>
              </p>
            </div>
          )}

          {isRestrictIpRule && (
            <div className="mt-3 space-y-2">
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                {t('settings.hardening.restrictIp.label', { defaultValue: 'Allowed IP addresses' })}
              </label>
              <div className="flex flex-col gap-2 sm:flex-row">
                <input
                  type="text"
                  value={allowedIps}
                  onChange={(event) => setAllowedIps(event.target.value)}
                  placeholder={t('settings.hardening.restrictIp.placeholder', { defaultValue: 'e.g. 192.168.1.100, 10.0.0.0/24' })}
                  className="phguard-input sm:flex-1"
                  disabled={isPending || !rule.enabled}
                />
                <button
                  type="button"
                  onClick={handleSaveAllowedIps}
                  disabled={
                    isPending
                    || hardeningLoading
                    || !rule.enabled
                  }
                  className="px-4 py-2 rounded-lg border border-indigo-200 text-indigo-600 hover:bg-indigo-50 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isPending ? t('settings.hardening.restrictIp.saving', { defaultValue: 'Saving...' }) : t('settings.hardening.restrictIp.save', { defaultValue: 'Save IPs' })}
                </button>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {t('settings.hardening.restrictIp.hint', { defaultValue: 'Enter IP addresses separated by commas. Supports CIDR notation (e.g., 192.168.1.0/24). If empty, all IPs are allowed.' })}
              </p>
              {!rule.enabled && (
                <p className="text-xs text-amber-600 dark:text-amber-400">
                  {t('settings.hardening.restrictIp.enableFirst', { defaultValue: 'Enable this rule first to configure IP addresses.' })}
                </p>
              )}
            </div>
          )}

          {rule.key === 'enable_2fa' && rule.enabled && (
            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <QrCode className="w-4 h-4" />
                  {t('settings.hardening.2fa.setupTitle', { defaultValue: 'Your Two-Factor Authentication' })}
                </h4>
                {twoFactorLoading && (
                  <span className="text-xs text-gray-500">Loading...</span>
                )}
              </div>

              {twoFactorStatus?.has_2fa ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                      ✓ {t('settings.hardening.2fa.enabled', { defaultValue: '2FA is enabled for your account' })}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleDisable2FA}
                    disabled={twoFactorLoading}
                    className="px-3 py-1.5 text-sm border border-red-300 text-red-600 dark:text-red-400 rounded hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {t('settings.hardening.2fa.disable', { defaultValue: 'Disable 2FA' })}
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {!twoFactorSetupVisible ? (
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        {t('settings.hardening.2fa.notConfigured', { defaultValue: 'Two-factor authentication is not configured for your account. Set it up to add an extra layer of security.' })}
                      </p>
                      <button
                        type="button"
                        onClick={handleGenerate2FASecret}
                        disabled={twoFactorLoading}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                      >
                        {twoFactorLoading ? t('settings.hardening.2fa.generating', { defaultValue: 'Generating...' }) : t('settings.hardening.2fa.setup', { defaultValue: 'Set up Two-Factor Authentication' })}
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <h5 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                          {t('settings.hardening.2fa.step1', { defaultValue: 'Step 1: Scan QR Code' })}
                        </h5>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                          {t('settings.hardening.2fa.scanInstructions', { defaultValue: 'Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.):' })}
                        </p>
                        {twoFactorQrUrl && (
                          <div className="mb-3">
                            <img src={twoFactorQrUrl} alt="QR Code" className="border border-gray-300 dark:border-gray-600 rounded" />
                          </div>
                        )}
                        <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                          {t('settings.hardening.2fa.manualEntry', { defaultValue: 'Or enter this code manually:' })}
                        </p>
                        <code className="block text-xs p-2 bg-gray-100 dark:bg-gray-800 rounded border border-gray-300 dark:border-gray-600 font-mono">
                          {twoFactorSecret}
                        </code>
                      </div>

                      <div>
                        <h5 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                          {t('settings.hardening.2fa.step2', { defaultValue: 'Step 2: Verify Setup' })}
                        </h5>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                          {t('settings.hardening.2fa.verifyInstructions', { defaultValue: 'Enter the 6-digit code from your authenticator app to verify:' })}
                        </p>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={twoFactorVerifyCode}
                            onChange={(e) => setTwoFactorVerifyCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                            placeholder="000000"
                            maxLength={6}
                            className="phguard-input w-32 text-center text-lg tracking-widest font-mono"
                            disabled={twoFactorLoading}
                          />
                          <button
                            type="button"
                            onClick={handleVerify2FASetup}
                            disabled={twoFactorLoading || twoFactorVerifyCode.length !== 6}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                          >
                            {t('settings.hardening.2fa.verify', { defaultValue: 'Verify & Enable' })}
                          </button>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setTwoFactorSetupVisible(false);
                          setTwoFactorVerifyCode('');
                          setTwoFactorSecret('');
                          setTwoFactorQrUrl('');
                        }}
                        className="text-xs text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                      >
                        {t('settings.hardening.2fa.cancel', { defaultValue: 'Cancel' })}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between sm:flex-col sm:items-end sm:gap-2">
          <span className="text-sm text-gray-500 dark:text-gray-400 sm:order-2">
            {rule.enabled ? t('settings.hardening.status.enabled', { defaultValue: 'Enabled' }) : t('settings.hardening.status.disabled', { defaultValue: 'Disabled' })}
          </span>
          <button
            type="button"
            onClick={() => handleHardeningToggle(rule)}
            disabled={isPending || hardeningLoading || isLocked}
            className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 dark:focus:ring-offset-gray-800 ${
              rule.enabled ? 'bg-indigo-600 dark:bg-indigo-500' : 'bg-gray-200 dark:bg-gray-600'
            } ${isPending || hardeningLoading || isLocked ? 'opacity-60 cursor-not-allowed' : ''}`}
            role="switch"
            aria-checked={rule.enabled}
          >
            <span
              className={`absolute top-[1px] pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                rule.enabled ? 'translate-x-4' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>
    );
  };


  // Helper function to render a rule type section
  const renderRuleTypeSection = (type, label, rules) => {
    if (rules.length === 0) return null;
    
    const isExpanded = layoutMode === 'columns' ? true : expandedRuleTypes[type];
    const isLocked = type === 'recommended' || type === 'advanced';
    
    // Determine if this rule type is part of the current preset
    const currentPreset = hardeningPreset?.current || 'default';
    let isPartOfPreset = false;
    
    if (currentPreset === 'advanced') {
      // Advanced includes all rule types
      isPartOfPreset = true;
    } else if (currentPreset === 'recommended') {
      // Recommended includes basic and recommended
      isPartOfPreset = type === 'basic' || type === 'recommended';
    } else if (currentPreset === 'default') {
      // Default only includes basic
      isPartOfPreset = type === 'basic';
    }
    // Custom preset doesn't highlight any specific sections
    
    return (
      <div className={`border rounded-lg overflow-hidden transition-all duration-200 relative ${
        isPartOfPreset 
          ? 'border-indigo-200 dark:border-indigo-800/50 bg-indigo-50/30 dark:bg-indigo-950/20' 
          : 'border-gray-200 dark:border-gray-700'
      } ${isLocked ? 'opacity-75' : ''}`}>
        {layoutMode === 'stacked' && (
          <button
            type="button"
            onClick={() => !isLocked && toggleRuleType(type)}
            disabled={isLocked}
            className={`w-full flex items-center justify-between p-4 transition-colors ${
              isPartOfPreset
                ? 'bg-indigo-50/50 dark:bg-indigo-950/30 hover:bg-indigo-50 dark:hover:bg-indigo-950/40'
                : 'bg-gray-100 dark:bg-gray-900/50 hover:bg-gray-100 dark:hover:bg-gray-900/70'
            } ${isLocked ? 'cursor-not-allowed opacity-75' : ''}`}
          >
            <div className="flex items-center gap-3">
              <span className={`uppercase tracking-wide text-sm font-semibold px-3 py-1.5 rounded flex items-center gap-2 ${
                isLocked 
                  ? 'text-gray-500 dark:text-gray-500 bg-gray-100 dark:bg-gray-800' 
                  : 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30'
              }`}>
                {isLocked && <Lock className="w-3 h-3" />}
                {label}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                ({rules.length} {rules.length === 1 ? 'rule' : 'rules'})
              </span>
            </div>
            {expandedRuleTypes[type] ? (
              <ChevronUp className={`w-5 h-5 ${isLocked ? 'text-gray-400 opacity-50' : 'text-gray-400'}`} />
            ) : (
              <ChevronDown className={`w-5 h-5 ${isLocked ? 'text-gray-400 opacity-50' : 'text-gray-400'}`} />
            )}
          </button>
        )}
        {layoutMode === 'columns' && (
          <div className={`p-4 transition-colors ${
            isPartOfPreset
              ? 'bg-indigo-50/50 dark:bg-indigo-950/30'
              : 'bg-gray-100 dark:bg-gray-900/50'
          }`}>
            <div className="flex items-center gap-3">
              <span className={`uppercase tracking-wide text-sm font-semibold px-3 py-1.5 rounded flex items-center gap-2 ${
                isLocked 
                  ? 'text-gray-500 dark:text-gray-500 bg-gray-100 dark:bg-gray-800' 
                  : 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30'
              }`}>
                {isLocked && <Lock className="w-3 h-3" />}
                {label}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                ({rules.length} {rules.length === 1 ? 'rule' : 'rules'})
              </span>
            </div>
          </div>
        )}
        {isExpanded && (
          <div className="h-full p-4 border-t border-gray-200 dark:border-gray-700 relative">
            <div className={`space-y-4 ${isLocked ? 'blur-sm' : ''}`}>
              {rules.map((rule) => renderRule(rule, isLocked))}
            </div>
            {isLocked && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-lg z-10">
                <div className="text-center p-6" style={{ filter: 'none' }}>
                  <div className="flex justify-center mb-3">
                    <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-full">
                      <Lock className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    {t('settings.hardening.locked.title', { defaultValue: 'Premium Feature' })}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 max-w-sm">
                    {t('settings.hardening.locked.description', { 
                      defaultValue: 'This feature is available in PhantomGuard Pro. Upgrade to unlock advanced security options.' 
                    })}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const handleHardeningToggle = async (rule) => {
    const nextEnabled = !rule.enabled;

    if (rule.key === 'rename_admin_url') {
      const slug = (adminSlug || '').trim();
      if (nextEnabled && !slug) {
        toast.error(t('settings.hardening.messages.slugRequired', { defaultValue: 'Set a custom login slug before enabling this protection.' }));
        return;
      }

      const displaySlug = slug.replace(/^\/+|\/+$/g, '');
      const bookmarkUrl = `${baseUrl}/${displaySlug}`;

      const successText = nextEnabled
        ? t('settings.hardening.messages.enabledRename', { defaultValue: 'Custom login URL protection enabled.' })
        : t('settings.hardening.messages.disabledRename', { defaultValue: 'Custom login URL protection disabled.' });

      // For rename_admin_url, include bookmark URL in success message
      const finalSuccessText = nextEnabled
        ? `${successText} ${t('settings.hardening.messages.bookmarkUrl', { defaultValue: 'Bookmark:' })} ${bookmarkUrl}`
        : successText;

      const result = await updateHardeningRule({
        ruleKey: rule.key,
        enabled: nextEnabled,
        value: slug,
        successText: finalSuccessText,
      });

      // Error handling - hook's useEffect will handle success via hardeningSuccess
      if (!result.success && result.message) {
        toast.error(result.message);
      }
      return;
    }

    const successText = nextEnabled
      ? t('settings.hardening.messages.ruleEnabled', { defaultValue: '{{name}} enabled.', name: rule.name })
      : t('settings.hardening.messages.ruleDisabled', { defaultValue: '{{name}} disabled.', name: rule.name });

    const result = await updateHardeningRule({
      ruleKey: rule.key,
      enabled: nextEnabled,
      successText,
    });

    // Error handling - hook's useEffect will handle success via hardeningSuccess
    if (!result.success && result.message) {
      toast.error(result.message);
    }
  };

  const handleSaveAdminSlug = async () => {
    const slug = (adminSlug || '').trim();

    if (!slug) {
      toast.error(t('settings.hardening.messages.slugRequired', { defaultValue: 'Set a custom login slug before enabling this protection.' }));
      return;
    }

    if (!renameRule?.enabled) {
      toast.error(t('settings.hardening.messages.renameMustBeEnabled', { defaultValue: 'Enable the custom login protection before saving the slug.' }));
      return;
    }

    const displaySlug = slug.replace(/^\/+|\/+$/g, '') || (renameRule?.value || '').replace(/^\/+|\/+$/g, '') || 'your-slug';
    const fullUrl = `${baseUrl}/${displaySlug}`;
    const successText = t('settings.hardening.messages.slugSaved', {
      defaultValue: 'Custom login URL saved. Bookmark: {{url}}',
      url: fullUrl,
    });

    const result = await updateHardeningRule({
      ruleKey: 'rename_admin_url',
      value: slug,
      successText,
    });

    // Error handling - hook's useEffect will handle success via hardeningSuccess
    if (!result.success && result.message) {
      toast.error(result.message);
    }
  };

  const handleSaveAllowedIps = async () => {
    const ips = (allowedIps || '').trim();

    if (!restrictIpRule?.enabled) {
      toast.error(t('settings.hardening.messages.restrictIpMustBeEnabled', { defaultValue: 'Enable the IP restriction before saving IP addresses.' }));
      return;
    }

    const successText = ips
      ? t('settings.hardening.messages.ipsSaved', {
          defaultValue: 'Allowed IP addresses saved.',
        })
      : t('settings.hardening.messages.ipsCleared', {
          defaultValue: 'IP addresses cleared. All IPs are now allowed.',
        });

    const result = await updateHardeningRule({
      ruleKey: 'restrict_login_by_ip',
      value: ips,
      successText,
    });

    // Error handling - hook's useEffect will handle success via hardeningSuccess
    if (!result.success && result.message) {
      toast.error(result.message);
    }
  };

  return (
    <div className="space-y-6">
      {ConfirmDialog}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center space-x-2">
          <Shield className="w-5 h-5" />
          <span>{t('settings.hardening.title', { defaultValue: 'Security Hardening' })}</span>
        </h2>
        <button
          onClick={() => setLayoutMode(layoutMode === 'stacked' ? 'columns' : 'stacked')}
          className="phguard-button dark:!bg-gray-800 dark:!hover:bg-gray-700 dark:!border-gray-600 dark:!text-gray-300 dark:border dark:!shadow-none"
          title={layoutMode === 'stacked' ? 'Switch to column layout' : 'Switch to stacked layout'}
        >
          {layoutMode === 'stacked' ? (
            <>
              <LayoutGrid className="w-4 h-4 mr-2" />
              <span>Columns</span>
            </>
          ) : (
            <>
              <LayoutList className="w-4 h-4 mr-2" />
              <span>Stacked</span>
            </>
          )}
        </button>
      </div>
      
      <div className="phguard-card space-y-4">
        {/* Current preset (read-only) */}
        {hardeningPreset && hardeningPreset.descriptions && (
          <div className="mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('settings.hardening.preset.label', { defaultValue: 'Security Preset' })}
            </label>
            <p className="text-gray-600 dark:text-gray-400">
              {hardeningPreset.descriptions[hardeningPreset.current] || hardeningPreset.available?.[hardeningPreset.current] || hardeningPreset.current}
            </p>
          </div>
        )}
        {/* Hardening Rules */}
        <div>
        {hardeningLoading ? (
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {t('settings.hardening.loading', { defaultValue: 'Loading hardening rules...' })}
          </div>
        ) : layoutMode === 'columns' ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {renderRuleTypeSection('basic', t('settings.hardening.labels.basic', { defaultValue: 'Basic' }), rulesByType.basic)}
            {renderRuleTypeSection('recommended', t('settings.hardening.labels.recommended', { defaultValue: 'Recommended' }), rulesByType.recommended)}
            {renderRuleTypeSection('advanced', t('settings.hardening.labels.advanced', { defaultValue: 'Advanced' }), rulesByType.advanced)}
          </div>
        ) : (
          <div className="space-y-4">
            {renderRuleTypeSection('basic', t('settings.hardening.labels.basic', { defaultValue: 'Basic' }), rulesByType.basic)}
            {renderRuleTypeSection('recommended', t('settings.hardening.labels.recommended', { defaultValue: 'Recommended' }), rulesByType.recommended)}
            {renderRuleTypeSection('advanced', t('settings.hardening.labels.advanced', { defaultValue: 'Advanced' }), rulesByType.advanced)}
          </div>
        )}
        </div>
      </div>

    </div>
  );
};

export default SecurityHardeningPage;

