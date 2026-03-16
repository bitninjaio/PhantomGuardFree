import React from 'react';
import { useTranslation } from 'react-i18next';

const RecentScans = ({ scans, formatDate, isLoading, onShowMore, hasMore, isLoadingMore }) => {
  const { t } = useTranslation();
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-gray-500 dark:text-gray-400">{t('components.recentScans.loadingScanHistory')}</p>
      </div>
    );
  }

  if (!scans || scans.length === 0) {
    return (
      <p className="text-gray-500 dark:text-gray-400">
        {t('components.recentScans.noScansYet')}
      </p>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {scans.map((scan, idx) => {
          const threatCount = Number(scan.cnt_malicious) + Number(scan.cnt_injected) || 0;
          return (
            <div key={scan.id || idx} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800/50">
              <div className="space-y-2">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-600 dark:text-gray-200 mb-1">
                      {t('components.recentScans.scanNumber')}{scan.id} • {formatDate(scan.finish_time || scan.start_time || scan.created_at)}
                    </p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded flex-shrink-0 ${threatCount > 0
                    ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                    : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300'
                    }`}>
                    {threatCount > 0 ? `${threatCount} ${threatCount === 1 ? t('components.recentScans.threat') : t('components.recentScans.threats')}` : t('components.recentScans.clean')}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 dark:text-gray-400">
                  <div>
                    <span className="font-medium">{t('components.recentScans.files')}</span> {scan.files_scanned}
                  </div>
                  <div className="text-end">
                    <span className="font-medium">{t('components.recentScans.target')}</span> {scan.scan_target}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {hasMore && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-center">
          <button
            onClick={onShowMore}
            disabled={isLoadingMore}
            className="phguard-button-secondary disabled:opacity-50 disabled:cursor-not-allowed py-2"
          >
            {isLoadingMore ? t('common.loading') : t('components.recentScans.showMore')}
          </button>
        </div>
      )}
    </>
  );
};

export default RecentScans;

