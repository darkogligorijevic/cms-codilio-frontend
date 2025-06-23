// lib/settings-context.tsx - Enhanced with Dark Mode Support
'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { SiteSettings, Setting, SettingCategory, UpdateMultipleSettingsDto } from './types';
import { settingsApi } from './api';
import { toast } from 'sonner';

interface SettingsContextType {
  settings: SiteSettings | null;
  rawSettings: Setting[];
  isLoading: boolean;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  refreshSettings: () => Promise<void>;
  updateSetting: (key: string, value: string) => Promise<void>;
  updateMultipleSettings: (updates: UpdateMultipleSettingsDto) => Promise<void>;
  uploadFile: (key: string, file: File) => Promise<Setting>;
  resetSettings: (category?: SettingCategory) => Promise<void>;
  exportSettings: () => Promise<Record<string, string>>;
  importSettings: (data: Record<string, string>) => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

// Utility function to convert hex color to RGB values
function hexToRgb(hex: string) {
  if (!hex || typeof hex !== 'string' || !hex.startsWith('#') || hex.length !== 7) {
    return '59 130 246'; // default blue
  }

  try {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `${r} ${g} ${b}`;
  } catch (error) {
    console.warn('Error converting hex to RGB:', hex, error);
    return '59 130 246'; // default blue
  }
}

// Function to calculate a darker/lighter variant of a color
function createColorVariant(rgb: string, adjustment: number = -10) {
  try {
    const [r, g, b] = rgb.split(' ').map(Number);
    const newR = Math.max(0, Math.min(255, r + adjustment));
    const newG = Math.max(0, Math.min(255, g + adjustment));
    const newB = Math.max(0, Math.min(255, b + adjustment));
    return `${newR} ${newG} ${newB}`;
  } catch (error) {
    return rgb;
  }
}

// Function to determine if a color is light or dark
function isLightColor(rgb: string): boolean {
  try {
    const [r, g, b] = rgb.split(' ').map(Number);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5;
  } catch (error) {
    return true;
  }
}

// Function to apply theme to CSS variables and dark mode
function applyThemeToDocument(settings: SiteSettings, isDarkMode: boolean) {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;
  const body = document.body;

  // Apply or remove dark mode class
  if (isDarkMode && settings.themeDarkMode) {
    body.classList.add('dark', 'dark-mode');
    root.classList.add('dark');
  } else {
    body.classList.remove('dark', 'dark-mode');
    root.classList.remove('dark');
  }

  // Apply colors if they exist
  if (settings.themePrimaryColor) {
    const primaryRgb = hexToRgb(settings.themePrimaryColor);
    root.style.setProperty('--primary', primaryRgb);
    root.style.setProperty('--primary-hex', settings.themePrimaryColor);
    
    // Create hover variant
    const primaryHover = createColorVariant(primaryRgb, -15);
    root.style.setProperty('--primary-hover', primaryHover);
    
    // Primary foreground (contrasting color)
    const primaryForeground = isLightColor(primaryRgb) ? '15 23 42' : '248 250 252';
    root.style.setProperty('--primary-foreground', primaryForeground);
  }

  if (settings.themeSecondaryColor) {
    const secondaryRgb = hexToRgb(settings.themeSecondaryColor);
    root.style.setProperty('--secondary', secondaryRgb);
    root.style.setProperty('--secondary-hex', settings.themeSecondaryColor);
    
    // Secondary foreground (contrasting color)
    const secondaryForeground = isLightColor(secondaryRgb) ? '15 23 42' : '248 250 252';
    root.style.setProperty('--secondary-foreground', secondaryForeground);
  }

  // Apply font family
  if (settings.themeFontFamily) {
    root.style.setProperty('--font-family', settings.themeFontFamily);
    document.body.style.fontFamily = settings.themeFontFamily;
  }

  // Custom properties for site branding
  if (settings.siteName) {
    root.style.setProperty('--site-name', `"${settings.siteName}"`);
  }

  // Add smooth transition class for theme switching
  body.classList.add('theme-switching');
  setTimeout(() => {
    body.classList.remove('theme-switching');
  }, 300);
}

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [rawSettings, setRawSettings] = useState<Setting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // Ref to track if initial fetch is done
  const hasInitiallyFetched = useRef(false);
  
  // Initialize dark mode from localStorage or system preference
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme');
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      
      if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
        setIsDarkMode(true);
      }
    }
  }, []);

  // Memoized fetch function to prevent recreation on every render
  const fetchSettings = useCallback(async (showToastOnError = false) => {
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
        applyThemeToDocument(structured, isDarkMode);
      }
      
      hasInitiallyFetched.current = true;
      
    } catch (error) {
      console.error('Error fetching settings:', error);
      
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
  }, [isDarkMode]);

  // Initial fetch - only runs once
  useEffect(() => {
    if (!hasInitiallyFetched.current) {
      fetchSettings(false);
    }
  }, [fetchSettings]);

  // Apply theme when settings or dark mode changes
  useEffect(() => {
    if (settings && hasInitiallyFetched.current) {
      requestAnimationFrame(() => {
        applyThemeToDocument(settings, isDarkMode);
      });
    }
  }, [settings, isDarkMode]);

  // Toggle dark mode function
  const toggleDarkMode = useCallback(() => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    
    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme', newDarkMode ? 'dark' : 'light');
    }
    
    // Apply immediately if settings are loaded
    if (settings) {
      applyThemeToDocument(settings, newDarkMode);
    }
    
    toast.success(newDarkMode ? 'Uključen tamni režim' : 'Uključen svetli režim');
  }, [isDarkMode, settings]);

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
        applyThemeToDocument(newStructured, isDarkMode);
      }
      
    } catch (error) {
      console.error('Error updating settings:', error);
      throw error;
    }
  }, [isDarkMode]);

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
        applyThemeToDocument(newStructured, isDarkMode);
      }
      
      return uploadedSetting;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  }, [isDarkMode]);

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

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = React.useMemo(() => ({
    settings,
    rawSettings,
    isLoading,
    isDarkMode,
    toggleDarkMode,
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
    isDarkMode,
    toggleDarkMode,
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