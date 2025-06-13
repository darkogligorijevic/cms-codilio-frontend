// lib/settings-context.tsx
'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
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
  uploadFile: (key: string, file: File) => Promise<void>;
  resetSettings: (category?: SettingCategory) => Promise<void>;
  exportSettings: () => Promise<Record<string, string>>;
  importSettings: (data: Record<string, string>) => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [rawSettings, setRawSettings] = useState<Setting[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSettings = useCallback(async () => {
    try {
      setIsLoading(true);
      const [structured, raw] = await Promise.all([
        settingsApi.getStructured(),
        settingsApi.getAll()
      ]);
      setSettings(structured);
      setRawSettings(raw);
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('Greška pri učitavanju podešavanja');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const refreshSettings = async () => {
    await fetchSettings();
  };

  const updateSetting = async (key: string, value: string) => {
    try {
      await settingsApi.update(key, { value });
      await refreshSettings();
      toast.success('Podešavanje je uspešno ažurirano');
    } catch (error) {
      console.error('Error updating setting:', error);
      toast.error('Greška pri ažuriranju podešavanja');
      throw error;
    }
  };

  const updateMultipleSettings = async (updates: UpdateMultipleSettingsDto) => {
    try {
      await settingsApi.updateMultiple(updates);
      await refreshSettings();
      toast.success('Podešavanja su uspešno ažurirana');
    } catch (error) {
      console.error('Error updating settings:', error);
      toast.error('Greška pri ažuriranju podešavanja');
      throw error;
    }
  };

  const uploadFile = async (key: string, file: File) => {
    try {
      await settingsApi.uploadFile(key, file);
      await refreshSettings();
      toast.success('Fajl je uspešno učitan');
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Greška pri učitavanju fajla');
      throw error;
    }
  };

  const resetSettings = async (category?: SettingCategory) => {
    try {
      await settingsApi.reset(category);
      await refreshSettings();
      toast.success(category 
        ? `Podešavanja kategorije su resetovana na podrazumevane vrednosti`
        : 'Sva podešavanja su resetovana na podrazumevane vrednosti'
      );
    } catch (error) {
      console.error('Error resetting settings:', error);
      toast.error('Greška pri resetovanju podešavanja');
      throw error;
    }
  };

  const exportSettings = async () => {
    try {
      const data = await settingsApi.export();
      return data;
    } catch (error) {
      console.error('Error exporting settings:', error);
      toast.error('Greška pri eksportovanju podešavanja');
      throw error;
    }
  };

  const importSettings = async (data: Record<string, string>) => {
    try {
      await settingsApi.import({ settings: data });
      await refreshSettings();
      toast.success('Podešavanja su uspešno importovana');
    } catch (error) {
      console.error('Error importing settings:', error);
      toast.error('Greška pri importovanju podešavanja');
      throw error;
    }
  };

  return (
    <SettingsContext.Provider value={{
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
    }}>
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