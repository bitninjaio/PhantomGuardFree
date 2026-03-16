import React from 'react';
import { useTranslation } from 'react-i18next';
import { Chart } from 'react-google-charts';
import { Activity, Maximize2, Minimize2, AlertCircle, Lock } from 'lucide-react';

const GeoTrafficChart = ({ geoChartData, isDarkMode, containerRef, expandedChart, mapChartRef, onToggleExpand, hasError = false, isLoaded = false, premiumLabel }) => {
  const { t } = useTranslation();
  const chartData = geoChartData.length > 1 ? geoChartData : [];
  const isExpanded = expandedChart === 'map';

  return (
    <div 
      ref={containerRef}
      className={`transition-all ease-in-out min-w-[300px] phguard-card overflow-hidden relative ${
        isExpanded ? 'flex-[0.75]' : expandedChart === 'traffic' ? 'flex-[0.35]' : 'flex-[0.6]'
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">{t('dashboard.trafficDistribution')}</h3>
        <div className="flex items-center gap-2">
          <div className="text-xs text-gray-500 dark:text-gray-400">{t('dashboard.globalCdnTraffic')}</div>
          <button
            onClick={onToggleExpand}
            disabled
            className="p-1.5 rounded opacity-50 cursor-not-allowed text-gray-400 dark:text-gray-500"
            title={isExpanded ? 'Minimize chart' : 'Expand chart'}
          >
            {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
        </div>
      </div>
              
      <div className="relative" style={{ minHeight: '400px' }}>
        <div className="blur-sm opacity-75 pointer-events-none">
          {chartData.length > 1 ? (
            <div className="w-full overflow-hidden">
              <Chart
                chartType="GeoChart"
                data={chartData}
                options={{
                  region: 'world',
                  displayMode: 'regions',
                  colorAxis: {
                    colors: isDarkMode ? ['#433db8', '#818cf8'] : ['#e0e7ff', '#4f46e5'],
                    minValue: 0
                  },
                  backgroundColor: isDarkMode ? '#1f2937' : '#f8fafc',
                  datalessRegionColor: isDarkMode ? '#374151' : '#e2e8f0',
                  defaultColor: isDarkMode ? '#374151' : '#e2e8f0',
                  tooltip: {
                    isHtml: true,
                    trigger: 'focus'
                  },
                  legend: 'none',
                  keepAspectRatio: true,
                  width: '100%',
                  height: '400px', 
                  enableRegionInteractivity: true,
                  resolution: 'countries',
                  sizeAxis: { minValue: 0, maxValue: 100 },
                  chartArea: { left: 10, top: 10, right: 10, bottom: 10 }
                }}
                width="100%"
                height="400px"
                loader={<div className="text-gray-500 dark:text-gray-400">{t('dashboard.loadingMap')}</div>}
                chartEvents={[
                  {
                    eventName: 'ready',
                    callback: ({ chartWrapper }) => {
                      if (mapChartRef) {
                        mapChartRef.current = chartWrapper;
                      }
                    }
                  }
                ]}
              />
            </div>
          ) : (
            <div className="flex h-full items-center justify-center text-gray-500 dark:text-gray-400 pb-10">
              <div className="text-center">
                {premiumLabel || hasError ? (
                  <>
                    <AlertCircle className="mx-auto mb-2 opacity-50" />
                    <div>{premiumLabel || t('dashboard.noStatisticsAvailable', { defaultValue: 'No statistics available' })}</div>
                  </>
                ) : (
                  <>
                    <Activity className="mx-auto mb-2 opacity-50" />
                    <div>{t('dashboard.loadingTrafficData')}</div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-lg z-10">
          <div className="text-center p-6" style={{ filter: 'none' }}>
            <div className="flex justify-center mb-3">
              <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-full">
                <Lock className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              {t('dashboard.trafficDistribution')}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 max-w-sm">
              {t('dashboard.geoTrafficLocked', { 
                defaultValue: 'Geographic traffic distribution is available in PhantomGuard Pro. Upgrade to view traffic analytics by location.' 
              })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeoTrafficChart;

