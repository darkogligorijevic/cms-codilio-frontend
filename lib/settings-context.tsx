// lib/settings-context.tsx - FIXED VERSION
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
  // Dodaj validaciju za hex string
  if (!hex || typeof hex !== 'string' || !hex.startsWith('#') || hex.length !== 7) {
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
      h = s = 0; // achromatic
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

    return `${h} ${s}% ${l}%`;
  } catch (error) {
    console.warn('Error converting hex to HSL:', hex, error);
    return '220 100% 50%'; // default blue
  }
}

// Function to apply theme to CSS variables
function applyThemeToDocument(settings: SiteSettings) {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;

  // Apply colors if they exist
  if (settings.themePrimaryColor) {
    const primaryHsl = hexToHsl(settings.themePrimaryColor);
    root.style.setProperty('--primary', primaryHsl);
    root.style.setProperty('--primary-hex', settings.themePrimaryColor);
    
    // Create variations for hover states
    const [h, s, l] = primaryHsl.split(' ');
    const hNum = parseInt(h) || 220;
    const sNum = parseInt(s.replace('%', '')) || 100;
    const lNum = parseInt(l.replace('%', '')) || 50;
    
    // Primary foreground (contrasting color)
    const primaryForeground = lNum > 50 ? '0 0% 0%' : '0 0% 100%';
    root.style.setProperty('--primary-foreground', primaryForeground);
    
    // Hover state (slightly darker/lighter)
    const hoverL = lNum > 50 ? Math.max(lNum - 10, 0) : Math.min(lNum + 10, 100);
    root.style.setProperty('--primary-hover', `${hNum} ${sNum}% ${hoverL}%`);
  }

  if (settings.themeSecondaryColor) {
    const secondaryHsl = hexToHsl(settings.themeSecondaryColor);
    root.style.setProperty('--secondary', secondaryHsl);
    root.style.setProperty('--secondary-hex', settings.themeSecondaryColor);
    
    const [h, s, l] = secondaryHsl.split(' ');
    const lNum = parseInt(l.replace('%', '')) || 50;
    const secondaryForeground = lNum > 50 ? '0 0% 0%' : '0 0% 100%';
    root.style.setProperty('--secondary-foreground', secondaryForeground);
  }

  // Apply font family
  if (settings.themeFontFamily) {
    root.style.setProperty('--font-family', settings.themeFontFamily);
    document.body.style.fontFamily = settings.themeFontFamily;
  }

  // Apply dark mode class if enabled
  if (settings.themeDarkMode) {
    root.classList.add('dark-mode-available');
  } else {
    root.classList.remove('dark-mode-available');
  }

  // Custom properties for site branding
  if (settings.siteName) {
    root.style.setProperty('--site-name', `"${settings.siteName}"`);
  }
}

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [rawSettings, setRawSettings] = useState<Setting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Ref to track if initial fetch is done
  const hasInitiallyFetched = useRef(false);
  
  // Memoized fetch function to prevent recreation on every render
  const fetchSettings = useCallback(async (showToastOnError = false) => {
    // Prevent multiple simultaneous fetches
    if (isLoading && hasInitiallyFetched.current) {
      return;
    }
    
    try {
      setIsLoading(true);
      
      const [structured, raw] = await Promise.all([
        settingsApi.getStructured(),
        settingsApi.getAll()
      ]);
      
      setSettings(structured);
      setRawSettings(raw);
      
      // Apply theme only if values actually changed
      if (structured) {
        applyThemeToDocument(structured);
      }
      
      hasInitiallyFetched.current = true;
      
    } catch (error) {
      console.error('Error fetching settings:', error);
      
      // Only show toast error if explicitly requested (not during initial load)
      if (showToastOnError) {
        toast.error('Greška pri učitavanju podešavanja');
      }
      
      // Set empty defaults to prevent infinite retries
      if (!hasInitiallyFetched.current) {
        setSettings({} as SiteSettings);
        setRawSettings([]);
        hasInitiallyFetched.current = true;
      }
    } finally {
      setIsLoading(false);
    }
  }, []); // Empty dependency array - function is stable

  // Initial fetch - only runs once
  useEffect(() => {
    if (!hasInitiallyFetched.current) {
      fetchSettings(false);
    }
  }, []); // Empty dependency array - only run once on mount

  // Separate effect for applying theme when settings change
  useEffect(() => {
    if (settings && hasInitiallyFetched.current) {
      // Use requestAnimationFrame to avoid blocking rendering
      requestAnimationFrame(() => {
        applyThemeToDocument(settings);
      });
    }
  }, [settings]); // Only depend on settings

  const refreshSettings = useCallback(async () => {
    await fetchSettings(true);
  }, [fetchSettings]);

  const updateSetting = useCallback(async (key: string, value: string) => {
    try {
      await settingsApi.update(key, { value });
      await refreshSettings();
      // Ne prikazuj toast ovde jer će se pozvati iz komponente
    } catch (error) {
      console.error('Error updating setting:', error);
      throw error;
    }
  }, [refreshSettings]);

  const updateMultipleSettings = useCallback(async (updates: UpdateMultipleSettingsDto) => {
    try {
      const updatedSettings = await settingsApi.updateMultiple(updates);
      
      // Immediately update local state with new values
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

      // Update structured settings
      const newStructured = await settingsApi.getStructured();
      setSettings(newStructured);
      
      // Apply theme immediately
      if (newStructured) {
        applyThemeToDocument(newStructured);
      }
      
      // Don't show toast here, let component handle it
    } catch (error) {
      console.error('Error updating settings:', error);
      throw error;
    }
  }, []);

  const uploadFile = useCallback(async (key: string, file: File) => {
    try {
      const uploadedSetting = await settingsApi.uploadFile(key, file);
      
      // Immediately update local state with new value
      setRawSettings(prevSettings => {
        const newSettings = [...prevSettings];
        const index = newSettings.findIndex(s => s.key === key);
        if (index !== -1) {
          newSettings[index] = { ...newSettings[index], value: uploadedSetting.value };
        }
        return newSettings;
      });
      
      // Update structured settings
      const newStructured = await settingsApi.getStructured();
      setSettings(newStructured);
      
      // Apply theme if needed
      if (newStructured) {
        applyThemeToDocument(newStructured);
      }
      
      // Return the uploaded setting for use in component
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
      // Ne prikazuj toast ovde jer će se pozvati iz komponente
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
      // Ne prikazuj toast ovde jer će se pozvati iz komponente
    } catch (error) {
      console.error('Error importing settings:', error);
      throw error;
    }
  }, [refreshSettings]);

  // Memoize context value to prevent unnecessary re-renders
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

// Export the theme application function for manual use if needed
export { applyThemeToDocument };