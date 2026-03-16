import React, { useState, useEffect } from 'react';
import { Save, Moon, Sun, Shield, ChevronUp, ChevronDown, Lock, Download, ShoppingCart } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useSettings } from '../hooks/useSettings';

const SettingsPage = ({ onboardingStep }) => {
  const { t } = useTranslation();
  const { 
    settings, 
    saveSettings,
  } = useSettings();
  const [localSettings, setLocalSettings] = useState({});
  const [isSavingScheduledScan, setIsSavingScheduledScan] = useState(false);
  const [scheduledScanMessage, setScheduledScanMessage] = useState(null);

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'de', name: 'Deutsch' },
    { code: 'it', name: 'Italiano' }
  ];

  useEffect(() => {
    if (settings) {
      setLocalSettings(settings);
    }
  }, [settings]);


  const handleSettingChange = (key, value) => {
    setLocalSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleLanguageChange = async (languageCode) => {
    handleSettingChange('language', languageCode);
    await saveSettings({ language: languageCode });
  };

  const handleSaveScheduledScanToggle = async (newEnabled) => {
    setIsSavingScheduledScan(true);
    setScheduledScanMessage(null);

    try {
      // When toggling, send current day/hour values but only modify enabled state
      const scheduledScanSettings = {
        scheduled_scan_enabled: newEnabled,
        scheduled_scan_day: localSettings.scheduled_scan_day || 1,
        scheduled_scan_hour: localSettings.scheduled_scan_hour !== undefined ? localSettings.scheduled_scan_hour : 12,
      };

      const result = await saveSettings(scheduledScanSettings);
      
      if (result.success) {
        setScheduledScanMessage({ 
          type: 'success', 
          text: result.message || t('settings.messages.scheduledScanSaved')
        });
      } else {
        setScheduledScanMessage({ 
          type: 'error', 
          text: result.error || t('settings.messages.scheduledScanSaveFailed')
        });
      }
    } catch (error) {
      setScheduledScanMessage({ 
        type: 'error', 
        text: error.message || t('settings.messages.scheduledScanSaveFailed')
      });
    } finally {
      setIsSavingScheduledScan(false);
      // Clear message after 5 seconds
      setTimeout(() => setScheduledScanMessage(null), 5000);
    }
  };

  const handleSaveScheduledScan = async () => {
    setIsSavingScheduledScan(true);
    setScheduledScanMessage(null);

    try {
      // Only send scheduled scan settings
      const scheduledScanSettings = {
        scheduled_scan_enabled: localSettings.scheduled_scan_enabled !== false,
        scheduled_scan_day: localSettings.scheduled_scan_day || 1,
        scheduled_scan_hour: localSettings.scheduled_scan_hour !== undefined ? localSettings.scheduled_scan_hour : 12,
      };

      const result = await saveSettings(scheduledScanSettings);
      
      if (result.success) {
        setScheduledScanMessage({ 
          type: 'success', 
          text: result.message || t('settings.messages.scheduledScanSaved')
        });
      } else {
        setScheduledScanMessage({ 
          type: 'error', 
          text: result.error || t('settings.messages.scheduledScanSaveFailed')
        });
      }
    } catch (error) {
      setScheduledScanMessage({ 
        type: 'error', 
        text: error.message || t('settings.messages.scheduledScanSaveFailed')
      });
    } finally {
      setIsSavingScheduledScan(false);
      // Clear message after 5 seconds
      setTimeout(() => setScheduledScanMessage(null), 5000);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{t('settings.title')}</h2>
      </div>

      {/* License Section */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            {t('settings.license.title', { defaultValue: "Don't have a license?" })}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
            {t('settings.license.description', { defaultValue: 'Download or purchase one to get started.' })}
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={() => {
                window.open('https://data.phantomguard.io/phguard-pro.zip', '_blank');
              }}
              className="flex items-center gap-3 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors text-base font-medium shadow-sm hover:shadow-md"
            >
              <Download className="w-5 h-5" />
              {t('settings.license.download', { defaultValue: 'Download the PRO plugin' })}
            </button>
            <button
              onClick={() => {
                window.open('https://phantomguard.io/activate', '_blank');
              }}
              className="flex items-center gap-3 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-base font-medium shadow-sm hover:shadow-md"
            >
              <ShoppingCart className="w-5 h-5" />
              {t('settings.license.purchase', { defaultValue: 'Purchase the PRO license' })}
            </button>
          </div>
        </div>
      </div>

      {/* Appearance Settings */}
      <div className="space-y-4" data-onboarding="settings-appearance">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 flex items-center space-x-2">
          <Moon className="w-5 h-5" />
          <span>{t('settings.appearance.title')}</span>
        </h3>
        
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          {/* Dark Mode */}
          <div className="flex items-start justify-between py-3 border-b border-gray-200 dark:border-gray-700">
            <div className="flex-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">
                {t('settings.appearance.darkMode.label')}
              </label>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t('settings.appearance.darkMode.description')}
              </p>
            </div>
            <div className="flex items-center ml-4">
              <button
                type="button"
                onClick={async () => {
                  // Ensure we have a boolean value (default to true if undefined)
                  const currentDarkMode = localSettings.dark_mode !== undefined ? localSettings.dark_mode : true;
                  const newDarkMode = !currentDarkMode;
                  // Update local state first
                  handleSettingChange('dark_mode', newDarkMode);
                  // Save immediately without requiring Save Settings button
                  // Only pass dark_mode to saveSettings since it's a frontend-only setting
                  await saveSettings({ dark_mode: newDarkMode });
                }}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 dark:focus:ring-offset-gray-800 ${
                  localSettings.dark_mode ? 'bg-indigo-600 dark:bg-indigo-500' : 'bg-gray-200 dark:bg-gray-600'
                }`}
                role="switch"
                aria-checked={localSettings.dark_mode}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    localSettings.dark_mode ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
              {localSettings.dark_mode ? (
                <Moon className="w-5 h-5 ml-3 text-indigo-600 dark:text-indigo-400" />
              ) : (
                <Sun className="w-5 h-5 ml-3 text-gray-400" />
              )}
            </div>
          </div>

          {/* Language Selector */}
          <div className="flex items-start justify-between py-3">
            <div className="flex-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">
                {t('settings.appearance.language.label')}
              </label>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t('settings.appearance.language.description')}
              </p>
            </div>
            <div className="flex items-center ml-4">
              <div className="relative">
                <select
                  value={localSettings.language || 'en'}
                  onChange={(e) => handleLanguageChange(e.target.value)}
                  className="phguard-input pr-10 appearance-none bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 dark:focus:ring-indigo-500"
                >
                  {languages.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scanning Options */}
      <div className="space-y-4" data-onboarding="phguard-settings-scanning">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 flex items-center space-x-2">
          <Shield className="w-5 h-5" />
          <span>{t('settings.scanning.title')}</span>
        </h3>
        
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 relative">
          <div className="relative">
            <div className="blur-sm opacity-75 pointer-events-none">
            <div 
              className="border border-blue-200 dark:border-purple-700 rounded-lg p-4 mb-4 text-white"
              style={{
                background: localSettings.dark_mode 
                  ? 'linear-gradient(90deg, rgba(55, 48, 163, 1) 0%, rgba(126, 34, 206, 1) 100%)'
                  : 'linear-gradient(90deg, rgba(79, 70, 229, 1) 0%, rgba(168, 85, 247, 1) 100%)'
              }}
            >
              <p className="text-sm font-medium mb-1 text-white">{t('settings.scanning.howItWorks')}</p>
              <p className="text-sm text-purple-100 dark:text-purple-200">{t('settings.scanning.checkedEnabled')}</p>
              <p className="text-sm text-purple-100 dark:text-purple-200">{t('settings.scanning.uncheckedDisabled')}</p>
            </div>

            {/* Scheduled Scan Settings */}
            <div className="py-3 border-gray-200 dark:border-gray-700 mt-4">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">
                    {t('settings.scanning.scheduledScans.label')}
                  </label>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {t('settings.scanning.scheduledScans.description')}
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={localSettings.scheduled_scan_enabled !== false}
                  onChange={async (e) => {
                    const newEnabled = e.target.checked;
                    handleSettingChange('scheduled_scan_enabled', newEnabled);
                    // Auto-save when toggling the checkbox
                    await handleSaveScheduledScanToggle(newEnabled);
                  }}
                  disabled={true}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-600 border-gray-300 rounded ml-4 mt-1 disabled:opacity-50"
                />
              </div>

              {localSettings.scheduled_scan_enabled !== false && (
                <div className="ml-0 mt-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
                  {/* Day and Hour Selectors */}
                  <div className="flex flex-wrap gap-6 items-start mb-4">
                    {/* Day Selector - Segmented Control */}
                    <div className="flex-1 min-w-[200px]">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {t('settings.scanning.scheduledScans.day')}
                      </label>
                      <div className="inline-flex rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 p-1 shadow-sm">
                        {[
                          { value: 1, label: 'Mon' },
                          { value: 2, label: 'Tue' },
                          { value: 3, label: 'Wed' },
                          { value: 4, label: 'Thu' }
                        ].map((day, index) => (
                          <button
                            key={day.value}
                            type="button"
                            onClick={() => handleSettingChange('scheduled_scan_day', day.value)}
                            disabled
                            className={`px-4 py-2 text-sm font-medium transition-all opacity-50 cursor-not-allowed ${
                              index === 0 ? 'rounded-l-md' : ''
                            } ${
                              index === 3 ? 'rounded-r-md' : ''
                            } ${
                              (localSettings.scheduled_scan_day || 1) === day.value
                                ? 'bg-indigo-600 dark:bg-indigo-500 text-white shadow-sm'
                                : 'text-gray-700 dark:text-gray-300'
                            }`}
                          >
                            {day.label}
                          </button>
                        ))}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                        {t('settings.scanning.scheduledScans.dayNote')}
                      </p>
                    </div>

                    {/* Hour Selector - Number Input with Slider */}
                    <div className="flex-1 min-w-[200px]">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {t('settings.scanning.scheduledScans.hour')}
                      </label>
                      <div className="space-y-3">
                        {/* Number Input with +/- Buttons */}
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              const currentHour = localSettings.scheduled_scan_hour !== undefined ? localSettings.scheduled_scan_hour : 12;
                              const newHour = currentHour > 0 ? currentHour - 1 : 23;
                              handleSettingChange('scheduled_scan_hour', newHour);
                            }}
                            disabled
                            className="flex items-center justify-center w-10 h-10 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 opacity-50 cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-600 dark:focus:ring-indigo-500"
                          >
                            <ChevronDown className="w-4 h-4" />
                          </button>
                          <div className="flex-1">
                            <div className="relative">
                              <input
                                type="number"
                                min="0"
                                max="23"
                                value={localSettings.scheduled_scan_hour !== undefined ? localSettings.scheduled_scan_hour : 12}
                                onChange={(e) => {
                                  const value = parseInt(e.target.value) || 0;
                                  const clampedValue = Math.max(0, Math.min(23, value));
                                  handleSettingChange('scheduled_scan_hour', clampedValue);
                                }}
                                onWheel={(e) => e.target.blur()}
                                disabled
                                className="w-full px-4 py-2 pr-12 text-center text-lg font-semibold rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 opacity-50 cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-indigo-600 dark:focus:ring-indigo-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                              />
                              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-500 dark:text-gray-400 font-medium pointer-events-none">
                                :00
                              </div>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              const currentHour = localSettings.scheduled_scan_hour !== undefined ? localSettings.scheduled_scan_hour : 12;
                              const newHour = currentHour < 23 ? currentHour + 1 : 0;
                              handleSettingChange('scheduled_scan_hour', newHour);
                            }}
                            disabled
                            className="flex items-center justify-center w-10 h-10 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 opacity-50 cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-600 dark:focus:ring-indigo-500"
                          >
                            <ChevronUp className="w-4 h-4" />
                          </button>
                        </div>
                        
                        {/* Visual Slider */}
                        <div className="relative">
                          <input
                            type="range"
                            min="0"
                            max="23"
                            value={localSettings.scheduled_scan_hour !== undefined ? localSettings.scheduled_scan_hour : 12}
                            onChange={(e) => handleSettingChange('scheduled_scan_hour', parseInt(e.target.value))}
                            disabled
                            className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-not-allowed opacity-50 slider-custom"
                            style={{
                              background: localSettings.dark_mode
                                ? `linear-gradient(to right, rgb(99, 102, 241) 0%, rgb(99, 102, 241) ${((localSettings.scheduled_scan_hour !== undefined ? localSettings.scheduled_scan_hour : 12) / 23) * 100}%, rgb(55, 65, 81) ${((localSettings.scheduled_scan_hour !== undefined ? localSettings.scheduled_scan_hour : 12) / 23) * 100}%, rgb(55, 65, 81) 100%)`
                                : `linear-gradient(to right, rgb(99, 102, 241) 0%, rgb(99, 102, 241) ${((localSettings.scheduled_scan_hour !== undefined ? localSettings.scheduled_scan_hour : 12) / 23) * 100}%, rgb(229, 231, 235) ${((localSettings.scheduled_scan_hour !== undefined ? localSettings.scheduled_scan_hour : 12) / 23) * 100}%, rgb(229, 231, 235) 100%)`
                            }}
                          />
                          <style>{`
                            .slider-custom::-webkit-slider-thumb {
                              appearance: none;
                              width: 18px;
                              height: 18px;
                              border-radius: 50%;
                              background: rgb(99, 102, 241);
                              cursor: pointer;
                              border: 2px solid white;
                              box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
                            }
                            .slider-custom::-moz-range-thumb {
                              width: 18px;
                              height: 18px;
                              border-radius: 50%;
                              background: rgb(99, 102, 241);
                              cursor: pointer;
                              border: 2px solid white;
                              box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
                            }
                            .dark .slider-custom::-webkit-slider-thumb {
                              border-color: rgb(55, 65, 81);
                            }
                            .dark .slider-custom::-moz-range-thumb {
                              border-color: rgb(55, 65, 81);
                            }
                          `}</style>
                          <div className="flex justify-between mt-1 text-xs text-gray-500 dark:text-gray-400">
                            <span>00:00</span>
                            <span>12:00</span>
                            <span>23:00</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Save Button in bottom right */}
                  <div className="flex justify-end">
                    <button
                      onClick={handleSaveScheduledScan}
                      disabled={true}
                      className="phguard-button flex items-center space-x-2 whitespace-nowrap opacity-50 cursor-not-allowed"
                    >
                      {isSavingScheduledScan ? (
                        <>
                          <span className="animate-spin">⏳</span>
                          <span>{t('settings.scanning.scheduledScans.saving')}</span>
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          <span>{t('settings.scanning.scheduledScans.save')}</span>
                        </>
                      )}
                    </button>
                  </div>
                  
                  {/* Scheduled Scan Message */}
                  {scheduledScanMessage && (
                    <div className={`mt-3 p-3 rounded-lg border ${
                      scheduledScanMessage.type === 'success' 
                        ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300'
                        : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300'
                    }`}>
                      {scheduledScanMessage.text}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-full flex items-center justify-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-lg z-10">
              <div className="text-center p-6" style={{ filter: 'none' }}>
                <div className="flex justify-center mb-3">
                  <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-full">
                    <Lock className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  {t('settings.scanning.title')}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 max-w-sm">
                  {t('settings.scanning.locked', { 
                    defaultValue: 'Scheduled scanning options are available in PhantomGuard Pro. Upgrade to configure automated malware scans.' 
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default SettingsPage;
