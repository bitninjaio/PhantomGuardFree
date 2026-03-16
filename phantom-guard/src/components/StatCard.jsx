import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Lock } from 'lucide-react';

const StatCard = ({ title, subtitle, value, icon: Icon, tone = 'default', state = 'healthy' }) => {
  const { t } = useTranslation();
  const toneClasses = useMemo(() => {
    switch (tone) {
      case 'success':
        return 'text-green-700 dark:text-green-400';
      case 'warning':
        return 'text-amber-600 dark:text-amber-400';
      case 'danger':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-gray-700 dark:text-gray-300';
    }
  }, [tone]);

  const stateColor = (state, tone) => {
    // If state is empty, use tone to determine colors
    if (!state) {
      switch (tone) {
        case 'success':
          return "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 ring-emerald-200 dark:ring-emerald-800";
        case 'warning':
          return "bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 ring-amber-200 dark:ring-amber-800";
        case 'danger':
          return "bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 ring-red-200 dark:ring-red-800";
        default:
          return "bg-gray-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 ring-indigo-200 dark:ring-indigo-700";
      }
    }
    
    switch (state) {
      case "healthy":
      case "secure":
      case "excellent":
      case "clean":
        return "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 ring-emerald-200 dark:ring-emerald-800";
      case "degraded":
      case "at risk":
      case "warning":
      case "detected":
        return "bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 ring-amber-200 dark:ring-amber-800";
      case "error":
      case "critical":
      case "high risk":
      case "poor":
        return "bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 ring-red-200 dark:ring-red-800";
      default:
        return "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 ring-slate-200 dark:ring-slate-700";
    }
  };

  return (
    <div className="rounded-2xl font-bold bg-white dark:bg-gray-800 shadow-sm ring-1 ring-slate-100 dark:ring-slate-700 p-4 flex items-center gap-4 w-full h-full relative">
      <div className={`p-3 rounded-xl ${stateColor(state, tone)} shrink-0 opacity-75 blur-xs`}>
        <Icon size={24} />
      </div>
      <div className="flex-1 opacity-75 pointer-events-none blur-xs">
        <div className="flex items-center justify-between">
          <div className="text-sm text-slate-800 dark:text-slate-200">{title}</div>
          {state && <div className={`text-xs text-slate-500 dark:text-slate-400 capitalize ${toneClasses}`}>{state}</div>}
        </div>
        {subtitle && <div className="text-xs font-normal text-slate-400 dark:text-slate-500">{subtitle}</div>}
        <div className={`text-2xl ${toneClasses}`}>{value}</div>
      </div>
      <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-gray-900/80 rounded-2xl z-10">
        <div className="text-center p-4" style={{ filter: 'none' }}>
          <div className="flex justify-center">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-full">
              <Lock className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            </div>
          </div>
          <p className="text-base font-bold text-gray-900 dark:text-gray-100">
            {t('dashboard.premiumFeature', { defaultValue: 'Premium Feature' })}
          </p>
        </div>
      </div>
    </div>
  );
};

export default StatCard;

