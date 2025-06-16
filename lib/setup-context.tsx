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
    } catch (error) {
      console.error('Error checking setup status:', error);
      // If we can't check setup status, assume it's not completed
      setIsSetupCompleted(false);
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