import React, { useMemo, useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Shield, AlertTriangle, Lock, Clock, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { useConfirm } from '../hooks/useConfirm';
import { useHistory } from '../hooks/useHistory';
import { useHardening } from '../hooks/useHardening';
import StatCard from '../components/StatCard';
import GeoTrafficChart from '../components/GeoTrafficChart';
import OriginTrafficChart from '../components/OriginTrafficChart';
import PremiumFeatureBanner from '../components/PremiumFeatureBanner';

const PRO_FEATURE_LABEL = 'Available in Pro';

const DashboardPage = ({ onNavigate, onboardingStep }) => {
  const { t } = useTranslation();
  const { ConfirmDialog } = useConfirm();
  const { loadHistory, loadInfectedFiles, scanTotal, infectedTotal, scanMeta } = useHistory();
  const { rules: hardeningRules, preset: hardeningPreset, isLoading: hardeningLoading } = useHardening();
  const [geoChartData, setGeoChartData] = useState([]);
  const [originTrafficChartData, setOriginTrafficChartData] = useState([]);
  const [cacheHitRate, setCacheHitRate] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [nextScanInfo, setNextScanInfo] = useState({ value: PRO_FEATURE_LABEL, enabled: false });
  const [bunnyStatsError, setBunnyStatsError] = useState(PRO_FEATURE_LABEL);
  const [bunnyStatsLoaded, setBunnyStatsLoaded] = useState(true);

  useEffect(() => {
    const checkDarkMode = () => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    };
    checkDarkMode();
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });
    return () => observer.disconnect();
  }, []);

  const [expandedChart, setExpandedChart] = useState(null);
  const mapChartRef = React.useRef(null);
  const trafficChartRef = React.useRef(null);
  const mapContainerRef = React.useRef(null);
  const trafficContainerRef = React.useRef(null);
  const isTransitioningRef = React.useRef(false);
  const pendingResizeRef = React.useRef(false);
  const transitionTimeoutRef = React.useRef(null);

  const [bunnyStartDate, setBunnyStartDate] = useState('');
  const [bunnyEndDate, setBunnyEndDate] = useState('');
  const [showBunnyDatePicker, setShowBunnyDatePicker] = useState(false);
  const getLast30DaysRange = () => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);
    return { startDate, endDate, key: 'selection' };
  };
  const [bunnyDateRange, setBunnyDateRange] = useState([getLast30DaysRange()]);
  const bunnyDatePickerRef = useRef(null);

  React.useEffect(() => {
    loadHistory(1, 10);
    loadInfectedFiles(1, 6);
  }, [loadHistory, loadInfectedFiles]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (bunnyDatePickerRef.current && !bunnyDatePickerRef.current.contains(event.target)) {
        setShowBunnyDatePicker(false);
      }
    };
    if (showBunnyDatePicker) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showBunnyDatePicker]);

  const handleBunnyDateRangeChange = (item) => {
    setBunnyDateRange([item.selection]);
  };

  const applyBunnyDateRange = () => {
    const start = bunnyDateRange[0].startDate;
    const end = bunnyDateRange[0].endDate;
    const startDate = new Date(start);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(end);
    endDate.setHours(23, 59, 59, 999);
    const formatDateForAPI = (date) => {
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, '0');
      const d = String(date.getDate()).padStart(2, '0');
      const h = String(date.getHours()).padStart(2, '0');
      const min = String(date.getMinutes()).padStart(2, '0');
      const s = String(date.getSeconds()).padStart(2, '0');
      return `${y}-${m}-${d}T${h}:${min}:${s}Z`;
    };
    setBunnyStartDate(formatDateForAPI(startDate));
    setBunnyEndDate(formatDateForAPI(endDate));
    setShowBunnyDatePicker(false);
  };

  const clearBunnyDateFilter = () => {
    setBunnyStartDate('');
    setBunnyEndDate('');
    setBunnyDateRange([getLast30DaysRange()]);
    setShowBunnyDatePicker(false);
  };

  const resizeCharts = () => {
    requestAnimationFrame(() => {
      if (mapChartRef.current) {
        try { mapChartRef.current.draw(); } catch (e) { window.dispatchEvent(new Event('resize')); }
      }
      if (trafficChartRef.current) {
        try { trafficChartRef.current.draw(); } catch (e) { window.dispatchEvent(new Event('resize')); }
      }
    });
  };

  const completeTransition = () => {
    isTransitioningRef.current = false;
    if (transitionTimeoutRef.current) {
      clearTimeout(transitionTimeoutRef.current);
      transitionTimeoutRef.current = null;
    }
    if (pendingResizeRef.current) {
      pendingResizeRef.current = false;
      resizeCharts();
    }
  };

  const handleToggleMapExpand = () => setExpandedChart(expandedChart === 'map' ? null : 'map');
  const handleToggleTrafficExpand = () => setExpandedChart(expandedChart === 'traffic' ? null : 'traffic');

  React.useEffect(() => {
    isTransitioningRef.current = true;
    pendingResizeRef.current = false;
    if (transitionTimeoutRef.current) clearTimeout(transitionTimeoutRef.current);
    transitionTimeoutRef.current = setTimeout(completeTransition, 200);
  }, [expandedChart]);

  React.useEffect(() => {
    if (!mapContainerRef.current || !trafficContainerRef.current) return;
    const triggerResize = () => {
      if (isTransitioningRef.current) {
        pendingResizeRef.current = true;
        return;
      }
      resizeCharts();
    };
    const handleTransitionEnd = (e) => {
      if (['flex', 'flex-basis', 'width', 'max-width'].includes(e.propertyName)) completeTransition();
    };
    const resizeObserver = new ResizeObserver(triggerResize);
    const containers = [mapContainerRef.current, trafficContainerRef.current];
    containers.forEach(c => {
      c.addEventListener('transitionend', handleTransitionEnd);
      resizeObserver.observe(c);
    });
    return () => {
      resizeObserver.disconnect();
      if (transitionTimeoutRef.current) clearTimeout(transitionTimeoutRef.current);
      containers.forEach(c => c.removeEventListener('transitionend', handleTransitionEnd));
    };
  }, [geoChartData.length, originTrafficChartData.length]);

  const totalScans = scanTotal || scanMeta?.total || 0;
  const totalMalware = infectedTotal || 0;

  const hardeningStatus = useMemo(() => {
    if (hardeningLoading || !hardeningPreset || !hardeningRules) {
      return {
        presetName: null,
        enabledCount: 0,
        totalCount: 0,
        subtitle: t('dashboard.loading', { defaultValue: 'Loading...' }),
        value: '--',
        tone: 'default',
        state: '',
      };
    }
    const currentPreset = hardeningPreset.current || 'default';
    const presetLabel = hardeningPreset.available?.[currentPreset] || currentPreset;
    const enabledRules = hardeningRules.filter(rule => rule.enabled);
    const enabledCount = enabledRules.length;
    const totalCount = hardeningRules.length;
    let subtitle = '';
    let value = '';
    if (currentPreset === 'advanced') {
      subtitle = t('dashboard.hardening.advanced', { defaultValue: 'Maximum security enabled' });
      value = presetLabel;
    } else if (currentPreset === 'recommended') {
      subtitle = t('dashboard.hardening.recommended', { defaultValue: 'Enhanced protection active' });
      value = presetLabel;
    } else if (currentPreset === 'default') {
      subtitle = t('dashboard.hardening.basic', { defaultValue: 'Basic security enabled' });
      value = presetLabel;
    } else {
      subtitle = t('dashboard.hardening.custom', { defaultValue: 'Custom configuration' });
      value = `${enabledCount}/${totalCount} ${t('dashboard.hardening.rules', { defaultValue: 'rules' })}`;
    }
    let tone = 'default';
    let state = '';
    if (currentPreset === 'advanced') { tone = 'success'; state = 'excellent'; }
    else if (currentPreset === 'recommended') { tone = 'success'; state = 'good'; }
    else if (currentPreset === 'default') { tone = 'warning'; state = 'basic'; }
    else {
      const basicRulesCount = hardeningRules.filter(r => r.type === 'basic').length;
      tone = enabledCount >= basicRulesCount ? 'success' : 'warning';
      state = enabledCount >= basicRulesCount ? 'good' : 'basic';
    }
    return { presetName: presetLabel, enabledCount, totalCount, subtitle, value, tone, state };
  }, [hardeningPreset, hardeningRules, hardeningLoading, t]);

  return (
    <div className="space-y-6">
      {ConfirmDialog}
      <PremiumFeatureBanner
        description={t('dashboard.premiumDescription', { defaultValue: 'Dashboard analytics and statistics are available in PhantomGuard Pro.' })}
      />
      <div className="flex flex-wrap md:flex-nowrap gap-4 items-stretch" data-onboarding="dashboard-stats">
        <div className="flex-1 min-w-[200px] flex">
            <StatCard
              title={t('dashboard.wpHardening')}
              subtitle={hardeningStatus.subtitle}
              value={hardeningStatus.value}
              icon={Lock}
              tone={hardeningStatus.tone}
              state={hardeningStatus.state}
              isLocked={true}
            />
        </div>

        <div className="flex-1 min-w-[200px] flex">
          <StatCard
            title={t('dashboard.cacheHitRate') || 'Cache Hit Rate'}
            subtitle={PRO_FEATURE_LABEL}
            value={cacheHitRate !== null ? `${cacheHitRate.toFixed(1)}%` : '--'}
            icon={Shield}
            tone="default"
            state=""
            isLocked={true}
          />
        </div>

        <div className="flex-1 min-w-[200px] flex">
            <StatCard
              title={t('dashboard.foundTotalMalwares')}
              subtitle={PRO_FEATURE_LABEL}
              value={totalMalware}
              icon={AlertTriangle}
              tone={totalMalware === 0 ? 'success' : 'danger'}
              state={totalMalware === 0 ? 'clean' : totalMalware <= 2 ? 'detected' : 'critical'}
              isLocked={true}
            />
        </div>

        <div className="flex-1 min-w-[200px] flex">
          <StatCard
            title="Next scan in:"
            /* subtitle={PRO_FEATURE_LABEL} */
            value={nextScanInfo.value}
            icon={Clock}
            tone="default"
            state=""
            isLocked={true}
          />
        </div>

        <div className="flex-1 min-w-[200px] flex">
            <StatCard
              title={t('dashboard.purgeCache', { defaultValue: 'Purge Cache' }) || 'Purge Cache'}
              subtitle={PRO_FEATURE_LABEL}
              value={t('dashboard.clickToPurge', { defaultValue: 'Click to purge' })}
              icon={Zap}
              tone="default"
              state=""
              isLocked={true}
            />
        </div>
      </div>

      <div className="flex flex-wrap gap-6">
        <GeoTrafficChart
          geoChartData={geoChartData}
          isDarkMode={isDarkMode}
          containerRef={mapContainerRef}
          expandedChart={expandedChart}
          mapChartRef={mapChartRef}
          onToggleExpand={handleToggleMapExpand}
          hasError={!!bunnyStatsError}
          isLoaded={bunnyStatsLoaded}
          premiumLabel={PRO_FEATURE_LABEL}
        />

        <OriginTrafficChart
          originTrafficChartData={originTrafficChartData}
          isDarkMode={isDarkMode}
          containerRef={trafficContainerRef}
          expandedChart={expandedChart}
          trafficChartRef={trafficChartRef}
          bunnyStartDate={bunnyStartDate}
          bunnyEndDate={bunnyEndDate}
          bunnyDateRange={bunnyDateRange}
          onBunnyDateRangeChange={handleBunnyDateRangeChange}
          onApplyBunnyDateRange={applyBunnyDateRange}
          onClearBunnyDateFilter={clearBunnyDateFilter}
          showBunnyDatePicker={showBunnyDatePicker}
          setShowBunnyDatePicker={setShowBunnyDatePicker}
          bunnyDatePickerRef={bunnyDatePickerRef}
          onToggleExpand={handleToggleTrafficExpand}
          hasError={!!bunnyStatsError}
          isLoaded={bunnyStatsLoaded}
          premiumLabel={PRO_FEATURE_LABEL}
        />
      </div>
    </div>
  );
};

export default DashboardPage;
