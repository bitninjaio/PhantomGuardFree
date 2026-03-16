import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import i18n from '../i18n/config';

const SettingsContext = createContext(null);

const defaultSettings = {
  autoScanInterval: 'yearly',
  scanDepth: 'standard',
  emailNotifications: false,
  dashboardNotifications: true,
  excludedDirs: '',
  excludedExtensions: 'jpg,jpg,png,gif,pdf,zip',
  auto_clean: true,
  auto_quarantine: true,
  dark_mode: localStorage.getItem('phguard-dark-mode') !== 'false',
  language: localStorage.getItem('phguard-language') || 'en',
  scheduled_scan_enabled: true,
  scheduled_scan_day: 1,
  scheduled_scan_hour: 12,
};

const SETTINGS_STORAGE_KEY = 'phguard-settings';

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const loadSettings = useCallback(async () => {
    try {
      setIsLoading(true);
      const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setSettings({ ...defaultSettings, ...parsed });
        } catch {
          setSettings(defaultSettings);
        }
      } else {
        setSettings(defaultSettings);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      setSettings(defaultSettings);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveSettings = useCallback(async (newSettings) => {
    try {
      setIsLoading(true);
      setSettings(prev => {
        const updated = { ...prev, ...newSettings };
        localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(updated));
        if (newSettings.hasOwnProperty('dark_mode')) {
          localStorage.setItem('phguard-dark-mode', newSettings.dark_mode ? 'true' : 'false');
          document.documentElement.classList.toggle('dark', !!newSettings.dark_mode);
        }
        if (newSettings.hasOwnProperty('language')) {
          localStorage.setItem('phguard-language', newSettings.language);
          i18n.changeLanguage(newSettings.language);
        }
        return updated;
      });
      return { success: true, message: 'Settings saved successfully' };
    } catch (error) {
      console.error('Error saving settings:', error);
      return { success: false, error: error.message || 'Failed to save settings' };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateSettings = useCallback((updates) => {
    setSettings(prev => ({ ...prev, ...updates }));
  }, []);

  const resetSettings = useCallback(async () => {
    try {
      setIsLoading(true);
      setSettings(defaultSettings);
      localStorage.removeItem(SETTINGS_STORAGE_KEY);
      return { success: true };
    } catch (error) {
      console.error('Error resetting settings:', error);
      return { success: false, error: 'Failed to reset settings' };
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  useEffect(() => {
    const darkModeSetting = localStorage.getItem('phguard-dark-mode');
    const darkMode = darkModeSetting === null || darkModeSetting === 'true';
    document.documentElement.classList.toggle('dark', darkMode);
  }, []);

  useEffect(() => {
    if (settings?.dark_mode !== undefined) {
      document.documentElement.classList.toggle('dark', !!settings.dark_mode);
    }
  }, [settings?.dark_mode]);

  const value = {
    settings,
    isLoading,
    loadSettings,
    saveSettings,
    updateSettings,
    resetSettings,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within SettingsProvider');
  }
  return context;
};
