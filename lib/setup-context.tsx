'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { SetupStatusResponse } from './types';
import { setupApi } from './api';

interface SetupContextType {
  isSetupCompleted: boolean;
  isLoading: boolean;
  checkSetupStatus: () => Promise<void>;
}

const SetupContext = createContext<SetupContextType | undefined>(undefined);

export function SetupProvider({ children }: { children: React.ReactNode }) {
  const [isSetupCompleted, setIsSetupCompleted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const checkSetupStatus = async () => {
    try {
      setIsLoading(true);
      const status = await setupApi.getStatus();
      setIsSetupCompleted(status.isSetupCompleted);
    } catch (error: any) {
      console.error('Error checking setup status:', error);
      // Ako je greška 412 ili setup related greška, tretira kao nije setup završen
      if (error.response?.status === 412 || error.response?.data?.setupRequired) {
        setIsSetupCompleted(false);
      } else {
        // Za ostale greške, možda je network problem, ostavi kao nije završeno
        setIsSetupCompleted(false);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Add a small delay to prevent hydration issues
    const timer = setTimeout(() => {
      checkSetupStatus();
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  return (
    <SetupContext.Provider value={{
      isSetupCompleted,
      isLoading,
      checkSetupStatus
    }}>
      {children}
    </SetupContext.Provider>
  );
}

export function useSetup() {
  const context = useContext(SetupContext);
  if (context === undefined) {
    throw new Error('useSetup must be used within a SetupProvider');
  }
  return context;
}