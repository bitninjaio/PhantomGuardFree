import React from 'react';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, AlertCircle, Info } from 'lucide-react';

const LicenseNotice = ({ licenseInfo, onNavigateToSettings, currentTab }) => {
  const { t } = useTranslation();

  // Don't show notice on settings page (they'll see it there anyway)
  if (currentTab === 'settings') {
    return null;
  }

  if (!licenseInfo?.validation) {
    return null;
  }

  const { status } = licenseInfo.validation;

  // Only show notices for problematic license statuses
  if (status === 'valid') {
    return null;
  }

  const handleSettingsClick = (e) => {
    e.preventDefault();
    if (onNavigateToSettings) {
      onNavigateToSettings('settings');
    }
  };

  const getNoticeConfig = () => {
    switch (status) {
      case 'missing':
        return {
          type: 'warning',
          icon: AlertTriangle,
          title: t('licenseNotice.missing.title', { defaultValue: 'PhantomGuard: No license key configured.' }),
          message: t('licenseNotice.missing.message', { defaultValue: 'Add your license key' }),
          actionText: t('licenseNotice.missing.action', { defaultValue: 'Add your license key' }),
        };
      case 'invalid':
      case 'not_found':
        return {
          type: 'error',
          icon: AlertCircle,
          title: t('licenseNotice.invalid.title', { defaultValue: 'PhantomGuard: Invalid license key.' }),
          message: t('licenseNotice.invalid.message', { defaultValue: 'Check your license key' }),
          actionText: t('licenseNotice.invalid.action', { defaultValue: 'Check your license key' }),
        };
      case 'ip_mismatch':
        return {
          type: 'warning',
          icon: AlertTriangle,
          title: t('licenseNotice.ipMismatch.title', { defaultValue: 'PhantomGuard: Your server IP address has changed.' }),
          message: t('licenseNotice.ipMismatch.message', { defaultValue: 'Please contact' }),
          actionText: t('licenseNotice.ipMismatch.action', { defaultValue: 'BitNinja support' }),
          actionUrl: 'https://bitninja.io/support',
          footerText: t('licenseNotice.ipMismatch.footer', { defaultValue: 'to update your license registration.' }),
        };
      case 'error':
        return {
          type: 'info',
          icon: Info,
          title: t('licenseNotice.error.title', { defaultValue: 'PhantomGuard: Unable to validate license at this time. You may continue using the scanner.' }),
        };
      default:
        return null;
    }
  };

  const config = getNoticeConfig();
  if (!config) {
    return null;
  }

  const Icon = config.icon;
  const bgColorClass = {
    warning: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800',
    error: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
    info: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
  }[config.type];

  const textColorClass = {
    warning: 'text-yellow-800 dark:text-yellow-200',
    error: 'text-red-800 dark:text-red-200',
    info: 'text-blue-800 dark:text-blue-200',
  }[config.type];

  const iconColorClass = {
    warning: 'text-yellow-600 dark:text-yellow-400',
    error: 'text-red-600 dark:text-red-400',
    info: 'text-blue-600 dark:text-blue-400',
  }[config.type];

  return (
    <div className={`mx-24 mb-6 p-4 rounded-lg border ${bgColorClass}`}>
      <div className="flex items-start gap-3">
        <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${iconColorClass}`} />
        <div className="flex-1">
          <p className={`text-sm font-medium ${textColorClass}`}>
            <strong>{config.title}</strong>
            {config.message && (
              <>
                {' '}
                {config.actionUrl ? (
                  <>
                    {config.message}{' '}
                    <a
                      href={config.actionUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline hover:opacity-80"
                    >
                      {config.actionText}
                    </a>
                    {config.footerText && ` ${config.footerText}`}
                  </>
                ) : (
                  <>
                    <button
                      onClick={handleSettingsClick}
                      className="underline hover:opacity-80 font-medium"
                    >
                      {config.actionText}
                    </button>
                    {config.footerText && ` ${config.footerText}`}
                  </>
                )}
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

export default LicenseNotice;
