import React, { useMemo, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Shield, AlertTriangle, Lock, Clock, Zap } from 'lucide-react';
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
  const [cacheHitRate, setCacheHitRate] = useState(null);
  const [nextScanInfo, setNextScanInfo] = useState({ value: PRO_FEATURE_LABEL, enabled: false });

  const [expandedChart, setExpandedChart] = useState(null);
  const mapContainerRef = React.useRef(null);
  const trafficContainerRef = React.useRef(null);
  const isTransitioningRef = React.useRef(false);
  const pendingResizeRef = React.useRef(false);
  const transitionTimeoutRef = React.useRef(null);

  React.useEffect(() => {
    loadHistory(1, 10);
    loadInfectedFiles(1, 6);
  }, [loadHistory, loadInfectedFiles]);

  const resizeCharts = () => {
    requestAnimationFrame(() => {
      window.dispatchEvent(new Event('resize'));
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
  }, []);

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
          containerRef={mapContainerRef}
          expandedChart={expandedChart}
          onToggleExpand={handleToggleMapExpand}
        />

        <OriginTrafficChart
          containerRef={trafficContainerRef}
          expandedChart={expandedChart}
          onToggleExpand={handleToggleTrafficExpand}
        />
      </div>
    </div>
  );
};

export default DashboardPage;
