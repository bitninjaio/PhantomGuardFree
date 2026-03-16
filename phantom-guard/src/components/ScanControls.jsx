import React from 'react';
import { useTranslation } from 'react-i18next';
import { Play, Lock } from 'lucide-react';

const ScanControls = ({ scanTarget, onTargetChange, onStartScan, onStopScan, isLoading, scanStatus, isLicenseActive = true }) => {
  const { t } = useTranslation();
  
  return (
    <div className="flex gap-3 items-center" data-onboarding="scanner-controls">
      {scanStatus !== 'scanning' && (
        <button
          onClick={() => onStartScan(scanTarget)}
          disabled={true}
          className="flex items-center gap-2 px-4 py-2 bg-gray-400 dark:bg-gray-600 text-white rounded-lg transition-colors cursor-not-allowed opacity-60"
        >
          <Lock size={16} />
          {t('components.scanControls.startScan')}
        </button>
      )}
      {scanStatus === 'scanning' && onStopScan && (
        <button
          onClick={onStopScan}
          className="phguard-button-danger"
        >
          {t('components.scanControls.stopScan')}
        </button>
      )}
    </div>
  );
};

export default ScanControls;

