import React from 'react';
import { useTranslation } from 'react-i18next';
import { AlertTriangle } from 'lucide-react';

const ScanResults = ({ scanResults, maliciousFound, injectedFound }) => {
  const { t } = useTranslation();
  
  if (!scanResults) {
    return null;
  }

  const hasThreats = maliciousFound + injectedFound > 0;

  return (
    <div className="space-y-4">
      <div className={`p-4 rounded-lg ${hasThreats ? 'bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800' : 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800'}`}>
        <p className={`text-sm ${hasThreats ? 'text-amber-800 dark:text-amber-200' : 'text-emerald-800 dark:text-emerald-200'}`}>
          {t('components.scanResults.scanFinished')} {hasThreats ? t('components.scanResults.threatsDetected') : t('components.scanResults.noThreatsDetected')}
        </p>
      </div>

      {scanResults.threats && scanResults.threats.length > 0 && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={20} className="text-red-600 dark:text-red-400" />
            <h4 className="font-semibold text-red-900 dark:text-red-200">{scanResults.threats.length} {t('components.scanResults.threatsFound')}</h4>
          </div>
          <div className="space-y-2">
            {scanResults.threats.map((threat, index) => (
              <div key={index} className="p-3 bg-white dark:bg-gray-800 border border-red-100 dark:border-red-900/40 rounded-md">
                <p className="text-sm text-red-900 dark:text-red-200">
                  <strong>{t('components.scanResults.file')}</strong> {threat.file}
                </p>
                <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                  <strong>{t('components.scanResults.threat')}</strong> {threat.type}
                </p>
                <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                  {threat.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ScanResults;

