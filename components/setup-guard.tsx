'use client';

import { useSetup } from '@/lib/setup-context';
import { SetupWizard } from './setup-wizard';
import { useEffect, useState } from 'react';

interface SetupGuardProps {
  children: React.ReactNode;
}

export function SetupGuard({ children }: SetupGuardProps) {
  const { isSetupCompleted, isLoading, checkSetupStatus } = useSetup();
  const [showSetup, setShowSetup] = useState(false);

  useEffect(() => {
    // Check if we're in a browser environment
    if (typeof window !== 'undefined') {
      // Check for setup completion
      if (!isLoading && !isSetupCompleted) {
        setShowSetup(true);
      } else {
        setShowSetup(false);
      }
    }
  }, [isLoading, isSetupCompleted]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Proverava se status aplikacije...</p>
        </div>
      </div>
    );
  }

  // Show setup wizard if setup is not completed
  if (showSetup) {
    return <SetupWizard />;
  }

  // Show normal app if setup is completed
  return <>{children}</>;
}
