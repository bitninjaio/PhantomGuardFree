import React from 'react';
import { useTranslation } from 'react-i18next';
import { Chart } from 'react-google-charts';
import { Activity, AlertCircle, Lock } from 'lucide-react';
import { DateRangePicker } from 'react-date-range';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import { format } from 'date-fns';
import { CalendarSearch, X, Maximize2, Minimize2 } from 'lucide-react';

const OriginTrafficChart = ({ 
  originTrafficChartData, 
  isDarkMode, 
  containerRef,
  expandedChart,
  trafficChartRef,
  bunnyStartDate,
  bunnyEndDate,
  bunnyDateRange,
  onBunnyDateRangeChange,
  onApplyBunnyDateRange,
  onClearBunnyDateFilter,
  showBunnyDatePicker,
  setShowBunnyDatePicker,
  bunnyDatePickerRef,
  onToggleExpand,
  hasError = false,
  isLoaded = false,
  premiumLabel
}) => {
  const { t } = useTranslation();
  const chartData = originTrafficChartData.length > 1 ? originTrafficChartData : [];
  const isExpanded = expandedChart === 'traffic';

  return (
    <div 
      ref={containerRef}
      className={`transition-all ease-in-out min-w-[300px] phguard-card overflow-hidden relative ${
        isExpanded ? 'flex-[0.75]' : expandedChart === 'map' ? 'flex-[0.35]' : 'flex-[0.4]'
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">{t('dashboard.originTrafficDistribution')}</h3>
        <div className="flex items-center gap-2">
          {bunnyDatePickerRef && (
            <div className="relative" ref={bunnyDatePickerRef}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowBunnyDatePicker(!showBunnyDatePicker);
                }}
                disabled
                className={`p-1.5 rounded opacity-50 cursor-not-allowed ${
                  bunnyStartDate && bunnyEndDate ? 'text-gray-400 dark:text-gray-500' : 'text-gray-400 dark:text-gray-500'
                }`}
                title={
                  bunnyStartDate && bunnyEndDate
                    ? `${format(new Date(bunnyDateRange[0].startDate), 'MMM dd')} - ${format(new Date(bunnyDateRange[0].endDate), 'MMM dd')} (Click to change)`
                    : bunnyDateRange[0] && bunnyDateRange[0].startDate && bunnyDateRange[0].endDate
                    ? `${format(bunnyDateRange[0].startDate, 'MMM dd')} - ${format(bunnyDateRange[0].endDate, 'MMM dd')} (Click to filter)`
                    : 'Select date range'
                }
              >
                <div className="flex items-center gap-2">
                  <CalendarSearch size={16} />
                  <span className="text-xs text-gray-500 dark:text-gray-400">{t('dashboard.trafficOverTime')}</span>
                </div>
              </button>

              {showBunnyDatePicker && (
                <div className="absolute top-full right-0 mt-2 z-50 shadow-xl rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                  <DateRangePicker
                    ranges={bunnyDateRange}
                    onChange={onBunnyDateRangeChange}
                    moveRangeOnFirstSelection={false}
                    months={2}
                    direction="horizontal"
                    showDateDisplay={false}
                    rangeColors={['#6366f1']}
                  />
                  <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
                    {(bunnyStartDate || bunnyEndDate) && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onClearBunnyDateFilter();
                        }}
                        className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 flex items-center gap-1"
                      >
                        <X size={14} />
                        {t('common.delete')}
                      </button>
                    )}
                    <div className="flex gap-2 ml-auto">
                      <button
                        onClick={() => setShowBunnyDatePicker(false)}
                        className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
                      >
                        {t('common.cancel')}
                      </button>
                      <button
                        onClick={onApplyBunnyDateRange}
                        className="px-4 py-2 text-sm bg-indigo-600 dark:bg-indigo-500 text-white rounded hover:bg-indigo-700 dark:hover:bg-indigo-600"
                      >
                        {t('components.dateRangePicker.apply')}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
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
        <div className="h-[400px] relative w-full max-w-full overflow-hidden">
          <Chart
            chartType="AreaChart"
            data={chartData}
            options={{
              chartArea: { left: 60, top: 20, right: 20, bottom: 50, width: '100%', height: '85%' },
              hAxis: {
                title: t('dashboard.date'),
                textStyle: { color: isDarkMode ? '#9ca3af' : '#6b7280', fontSize: 11 },
                titleTextStyle: { color: isDarkMode ? '#e5e7eb' : '#374151', fontSize: 12, bold: true }
              },
              vAxis: {
                title: t('dashboard.trafficAxis'),
                textStyle: { color: isDarkMode ? '#9ca3af' : '#6b7280', fontSize: 11 },
                titleTextStyle: { color: isDarkMode ? '#e5e7eb' : '#374151', fontSize: 12, bold: true },
                format: 'short'
              },
              legend: {
                position: 'none'
              },
              colors: ['#6366f1'],
              lineWidth: 2,
              pointSize: 2,
              backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
              curveType: 'function',
              areaOpacity: 1,
              enableInteractivity: true,
              tooltip: {
                trigger: 'focus',
              },
              pointShape: 'circle',
              pointFillColor: '#6366f1',
              pointStrokeColor: '#ffffff',
              pointStrokeWidth: 2
            }}
            width="100%"
            height="400px"
            loader={<div className="text-gray-500 dark:text-gray-400">{t('dashboard.loadingChart')}</div>}
            chartEvents={[
              {
                eventName: 'ready',
                callback: ({ chartWrapper }) => {
                  if (trafficChartRef) {
                    trafficChartRef.current = chartWrapper;
                  }
                  const container = chartWrapper.getContainer();
                  const svg = container.querySelector('svg');
                  if (svg) {
                    const defs = svg.querySelector('defs') || document.createElementNS('http://www.w3.org/2000/svg', 'defs');
                    if (!svg.querySelector('defs')) {
                      svg.insertBefore(defs, svg.firstChild);
                    }
                    
                    const existingGradient = defs.querySelector('#areaGradient');
                    if (existingGradient) {
                      existingGradient.remove();
                    }
                    
                    const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
                    gradient.setAttribute('id', 'areaGradient');
                    gradient.setAttribute('x1', '0%');
                    gradient.setAttribute('y1', '0%');
                    gradient.setAttribute('x2', '0%');
                    gradient.setAttribute('y2', '100%');
                    
                    const stop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
                    stop1.setAttribute('offset', '0%');
                    stop1.setAttribute('stop-color', '#6366f1');
                    stop1.setAttribute('stop-opacity', '0.6');
                    
                    const stop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
                    stop2.setAttribute('offset', '100%');
                    stop2.setAttribute('stop-color', '#6366f1');
                    stop2.setAttribute('stop-opacity', '0.1');
                    
                    gradient.appendChild(stop1);
                    gradient.appendChild(stop2);
                    defs.appendChild(gradient);
                    
                    const paths = svg.querySelectorAll('path');
                    paths.forEach((path, index) => {
                      const fill = path.getAttribute('fill');
                      const stroke = path.getAttribute('stroke');
                      if (fill && fill !== 'none' && fill !== 'transparent') {
                        if (fill === '#6366f1' || fill === 'rgb(99, 102, 241)' || 
                            (index < 2 && !stroke)) {
                          path.setAttribute('fill', 'url(#areaGradient)');
                        }
                      }
                    });
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
              {t('dashboard.originTrafficDistribution')}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 max-w-sm">
              {t('dashboard.originTrafficLocked', { 
                defaultValue: 'Origin traffic distribution is available in PhantomGuard Pro. Upgrade to view traffic analytics over time.' 
              })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OriginTrafficChart;

