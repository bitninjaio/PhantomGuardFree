import React from 'react';
import { useTranslation } from 'react-i18next';

const RecentScansList = ({ scans, formatDateTime }) => {
  const { t } = useTranslation();
  
  if (!scans || scans.length === 0) {
    return (
      <div className="py-3 text-sm text-gray-500 dark:text-gray-400">{t('components.recentScans.noScansAvailable')}</div>
    );
  }

  return (
    <div className="flex flex-col gap-3 h-full">
      {scans.slice(0, 5).map((scan, i) => {
        const malwareCount = Number(scan.cnt_malicious) || 0;
        const isClean = malwareCount === 0;
        
        return (
          <div key={i} className="flex-1 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 flex flex-col justify-between">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <div className="text-xs font-medium text-gray-900 dark:text-gray-100">
                  {t('components.recentScans.scanNumber')}{scan.id || i + 1}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  {malwareCount} {malwareCount === 1 ? t('components.recentScans.threat') : t('components.recentScans.threats')} {t('components.recentScans.threatsDetected')}
                </div>
              </div>
              <span className={`ml-2 px-2 py-0.5 text-xs font-medium rounded shrink-0 ${
                isClean
                  ? 'bg-green-600 text-white'
                  : 'bg-red-600 text-white'
              }`}>
                {isClean ? t('components.recentScans.clean') : t('components.recentScans.threatsLabel')}
              </span>
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              <span className="font-medium">{t('components.recentScans.date')}</span> {formatDateTime(scan.created_at)}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default RecentScansList;

