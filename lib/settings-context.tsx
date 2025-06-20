// lib/settings-context.tsx - Complete with Dark Mode Fix
'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { SiteSettings, Setting, SettingCategory, UpdateMultipleSettingsDto } from './types';
import { settingsApi } from './api';
import { toast } from 'sonner';

interface SettingsContextType {
  settings: SiteSettings | null;
  rawSettings: Setting[];
  isLoading: boolean;
  refreshSettings: () => Promise<void>;
  updateSetting: (key: string, value: string) => Promise<void>;
  updateMultipleSettings: (updates: UpdateMultipleSettingsDto) => Promise<void>;
  uploadFile: (key: string, file: File) => Promise<Setting>;
  resetSettings: (category?: SettingCategory) => Promise<void>;
  exportSettings: () => Promise<Record<string, string>>;
  importSettings: (data: Record<string, string>) => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

// Utility function to convert hex color to HSL
function hexToHsl(hex: string) {
  if (!hex || typeof hex !== 'string' || !hex.startsWith('#') || hex.length !== 7) {
    console.warn('🎨 Invalid hex color:', hex);
    return '220 100% 50%'; // default blue
  }

  try {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
        default: h = 0;
      }
      h /= 6;
    }

    h = Math.round(h * 360);
    s = Math.round(s * 100);
    l = Math.round(l * 100);

    const result = `${h} ${s}% ${l}%`;
    console.log('🎨 Converted', hex, 'to HSL:', result);
    return result;
  } catch (error) {
    console.warn('🎨 Error converting hex to HSL:', hex, error);
    return '220 100% 50%';
  }
}

// FIXED: Function to apply theme to CSS variables without interfering with next-themes
function applyThemeToDocument(settings: SiteSettings) {
  if (typeof document === 'undefined') return;

  console.log('🎨 =================================');
  console.log('🎨 APPLYING THEME TO DOCUMENT');
  console.log('🎨 Settings:', settings);
  console.log('🎨 =================================');

  const root = document.documentElement;

  // Apply colors if they exist
  if (settings.themePrimaryColor) {
    const primaryHsl = hexToHsl(settings.themePrimaryColor);
    root.style.setProperty('--primary-dynamic', primaryHsl);
    root.style.setProperty('--primary-hex', settings.themePrimaryColor);
    console.log('✅ Applied primary color:', settings.themePrimaryColor, '→', primaryHsl);
  }

  if (settings.themeSecondaryColor) {
    const secondaryHsl = hexToHsl(settings.themeSecondaryColor);
    root.style.setProperty('--secondary-dynamic', secondaryHsl);
    root.style.setProperty('--secondary-hex', settings.themeSecondaryColor);
    console.log('✅ Applied secondary color:', settings.themeSecondaryColor, '→', secondaryHsl);
  }

  // Apply font family
  if (settings.themeFontFamily) {
    root.style.setProperty('--font-family', settings.themeFontFamily);
    console.log('✅ Applied font family:', settings.themeFontFamily);
  }

  // CRITICAL FIX: Don't force light mode, let next-themes handle it
  console.log('🌙 Theme dark mode setting:', settings.themeDarkMode);
  
  if (settings.themeDarkMode) {
    root.setAttribute('data-dark-mode-enabled', 'true');
    console.log('✅ Dark mode is AVAILABLE');
  } else {
    root.setAttribute('data-dark-mode-enabled', 'false');
    // Only remove dark class if dark mode is disabled in settings
    const currentTheme = localStorage.getItem('codilio-theme');
    if (!currentTheme || currentTheme === 'dark') {
      root.classList.remove('dark');
      console.log('❌ Dark mode DISABLED - forcing light mode');
    }
  }

  console.log('🎨 =================================');
}

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [rawSettings, setRawSettings] = useState<Setting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const hasInitiallyFetched = useRef(false);
  
  const fetchSettings = useCallback(async (showToastOnError = false) => {
    if (isLoading && hasInitiallyFetched.current) {
      return;
    }
    
    try {
      setIsLoading(true);
      console.log('🔄 Fetching settings...');
      
      const [structured, raw] = await Promise.all([
        settingsApi.getStructured(),
        settingsApi.getAll()
      ]);
      
      console.log('📦 Fetched settings:', structured);
      
      setSettings(structured);
      setRawSettings(raw);
      
      // Apply theme immediately after fetching
      if (structured) {
        console.log('🎨 About to apply theme...');
        applyThemeToDocument(structured);
      }
      
      hasInitiallyFetched.current = true;
      
    } catch (error) {
      console.error('❌ Error fetching settings:', error);
      
      if (showToastOnError) {
        toast.error('Greška pri učitavanju podešavanja');
      }
      
      if (!hasInitiallyFetched.current) {
        setSettings({} as SiteSettings);
        setRawSettings([]);
        hasInitiallyFetched.current = true;
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    if (!hasInitiallyFetched.current) {
      console.log('🚀 Initial settings fetch...');
      fetchSettings(false);
    }
  }, []);

  // Apply theme when settings change
  useEffect(() => {
    if (settings && hasInitiallyFetched.current) {
      console.log('🔄 Settings changed, reapplying theme...');
      requestAnimationFrame(() => {
        applyThemeToDocument(settings);
      });
    }
  }, [settings]);

  const refreshSettings = useCallback(async () => {
    await fetchSettings(true);
  }, [fetchSettings]);

  const updateSetting = useCallback(async (key: string, value: string) => {
    try {
      await settingsApi.update(key, { value });
      await refreshSettings();
    } catch (error) {
      console.error('Error updating setting:', error);
      throw error;
    }
  }, [refreshSettings]);

  const updateMultipleSettings = useCallback(async (updates: UpdateMultipleSettingsDto) => {
    try {
      const updatedSettings = await settingsApi.updateMultiple(updates);
      
      setRawSettings(prevSettings => {
        const newSettings = [...prevSettings];
        updates.settings.forEach(update => {
          const index = newSettings.findIndex(s => s.key === update.key);
          if (index !== -1) {
            newSettings[index] = { ...newSettings[index], value: update.value };
          }
        });
        return newSettings;
      });

      const newStructured = await settingsApi.getStructured();
      setSettings(newStructured);
      
      if (newStructured) {
        applyThemeToDocument(newStructured);
      }
      
    } catch (error) {
      console.error('Error updating settings:', error);
      throw error;
    }
  }, []);

  const uploadFile = useCallback(async (key: string, file: File) => {
    try {
      const uploadedSetting = await settingsApi.uploadFile(key, file);
      
      setRawSettings(prevSettings => {
        const newSettings = [...prevSettings];
        const index = newSettings.findIndex(s => s.key === key);
        if (index !== -1) {
          newSettings[index] = { ...newSettings[index], value: uploadedSetting.value };
        }
        return newSettings;
      });
      
      const newStructured = await settingsApi.getStructured();
      setSettings(newStructured);
      
      if (newStructured) {
        applyThemeToDocument(newStructured);
      }
      
      return uploadedSetting;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  }, []);

  const resetSettings = useCallback(async (category?: SettingCategory) => {
    try {
      await settingsApi.reset(category);
      await refreshSettings();
    } catch (error) {
      console.error('Error resetting settings:', error);
      throw error;
    }
  }, [refreshSettings]);

  const exportSettings = useCallback(async () => {
    try {
      const data = await settingsApi.export();
      return data;
    } catch (error) {
      console.error('Error exporting settings:', error);
      throw error;
    }
  }, []);

  const importSettings = useCallback(async (data: Record<string, string>) => {
    try {
      await settingsApi.import({ settings: data });
      await refreshSettings();
    } catch (error) {
      console.error('Error importing settings:', error);
      throw error;
    }
  }, [refreshSettings]);

  const contextValue = React.useMemo(() => ({
    settings,
    rawSettings,
    isLoading,
    refreshSettings,
    updateSetting,
    updateMultipleSettings,
    uploadFile,
    resetSettings,
    exportSettings,
    importSettings
  }), [
    settings,
    rawSettings,
    isLoading,
    refreshSettings,
    updateSetting,
    updateMultipleSettings,
    uploadFile,
    resetSettings,
    exportSettings,
    importSettings
  ]);

  return (
    <SettingsContext.Provider value={contextValue}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}

export { applyThemeToDocument };