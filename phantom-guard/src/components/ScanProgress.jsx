import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

const ScanProgress = ({ progress, filesScanned, totalFiles, maliciousFound, injectedFound, elapsedSeconds, phase }) => {
  const { t } = useTranslation();
  const formattedDuration = useMemo(() => {
    const s = Number(elapsedSeconds) || 0;
    if (s < 60) return `${s}s`;
    const m = Math.floor(s / 60);
    const r = s % 60;
    return `${m}m ${r}s`;
  }, [elapsedSeconds]);

  if (!progress && progress !== 0) {
    return null;
  }

  // Show deep scan message when phase is 2
  if (phase === '2' || phase === 2) {
    return (
      <div className="space-y-3">
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            {t('components.scanProgress.deepScanRunning')}
          </p>
        </div>
        <div className="flex gap-4 flex-wrap text-xs text-gray-600 dark:text-gray-400">
          <div>
            {t('components.scanProgress.filesScanned')} <span className="font-medium text-gray-900 dark:text-gray-100">{filesScanned}{totalFiles ? ` / ${totalFiles}` : ''}</span>
          </div>
          <div>
            {t('components.scanProgress.malicious')} <span className="font-medium text-red-600 dark:text-red-400">{maliciousFound}</span>
          </div>
          <div>
            {t('components.scanProgress.injected')} <span className="font-medium text-yellow-600 dark:text-yellow-400">{injectedFound}</span>
          </div>
          <div>
            {t('components.scanProgress.time')} <span className="font-medium text-gray-900 dark:text-gray-100">{formattedDuration}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-indigo-600 dark:bg-indigo-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, Math.max(0, Number(progress) || 0))}%` }}
            />
          </div>
        </div>
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 min-w-[42px]">
          {Math.round(Number(progress) || 0)}%
        </span>
      </div>
      <div className="flex gap-4 flex-wrap text-xs text-gray-600 dark:text-gray-400">
        <div>
          {t('components.scanProgress.filesScanned')} <span className="font-medium text-gray-900 dark:text-gray-100">{filesScanned}{totalFiles ? ` / ${totalFiles}` : ''}</span>
        </div>
        <div>
          {t('components.scanProgress.malicious')} <span className="font-medium text-red-600 dark:text-red-400">{maliciousFound}</span>
        </div>
        <div>
          {t('components.scanProgress.injected')} <span className="font-medium text-yellow-600 dark:text-yellow-400">{injectedFound}</span>
        </div>
        <div>
          {t('components.scanProgress.time')} <span className="font-medium text-gray-900 dark:text-gray-100">{formattedDuration}</span>
        </div>
      </div>
    </div>
  );
};

export default ScanProgress;

