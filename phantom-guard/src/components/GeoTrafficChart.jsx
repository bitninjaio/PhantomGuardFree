import React from 'react';
import { useTranslation } from 'react-i18next';
import { Lock, Maximize2, Minimize2 } from 'lucide-react';

/**
 * Free tier: geographic traffic is always unavailable (Pro feature).
 * Static placeholder only — no chart library or remote loaders.
 */
const GeoTrafficChart = (props) => {
  const { containerRef, expandedChart, onToggleExpand } = props;
  const { t } = useTranslation();
  const isExpanded = expandedChart === 'map';

  return (
    <div
      ref={containerRef}
      className={`transition-all ease-in-out min-w-[300px] phguard-card overflow-hidden relative ${
        isExpanded ? 'flex-[0.75]' : expandedChart === 'traffic' ? 'flex-[0.35]' : 'flex-[0.6]'
      }`}
    >
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">{t('dashboard.trafficDistribution')}</h3>
        <div className="flex items-center gap-2">
          <div className="text-xs text-gray-500 dark:text-gray-400">{t('dashboard.globalCdnTraffic')}</div>
          <button
            type="button"
            onClick={onToggleExpand}
            disabled
            className="cursor-not-allowed rounded p-1.5 text-gray-400 opacity-50 dark:text-gray-500"
            title={isExpanded ? 'Minimize chart' : 'Expand chart'}
          >
            {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
        </div>
      </div>

      <section
        aria-label={t('dashboard.trafficDistribution')}
        className="phguard-placeholder-panel flex min-h-[400px] flex-col items-center justify-center px-6 py-12 text-center"
      >
        <div className="mb-4 flex justify-center">
          <div className="rounded-full bg-indigo-100 p-3 dark:bg-indigo-900/40">
            <Lock className="h-8 w-8 text-indigo-600 dark:text-indigo-300" aria-hidden />
          </div>
        </div>
        <h4 className="mb-2 text-lg font-semibold text-gray-900 dark:text-gray-100">{t('dashboard.trafficDistribution')}</h4>
        <p className="phguard-placeholder-desc max-w-sm text-sm text-gray-600 dark:text-gray-300">
          {t('dashboard.geoTrafficLocked', {
            defaultValue:
              'Geographic traffic distribution is available in PhantomGuard Pro. Upgrade to view traffic analytics by location.',
          })}
        </p>
      </section>
    </div>
  );
};

export default GeoTrafficChart;
