// components/ui/dark-mode-toggle.tsx
'use client';

import { Button } from '@/components/ui/button';
import { Sun, Moon } from 'lucide-react';
import { useSettings } from '@/lib/settings-context';
import { cn } from '@/lib/utils';

interface DarkModeToggleProps {
  className?: string;
  variant?: 'default' | 'ghost' | 'outline';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  showLabel?: boolean;
}

export function DarkModeToggle({ 
  className, 
  variant = 'ghost', 
  size = 'icon',
  showLabel = false 
}: DarkModeToggleProps) {
  const { isDarkMode, toggleDarkMode, settings } = useSettings();

  // Check if dark mode is enabled in settings
  const darkModeEnabled = settings?.themeDarkMode;

  // Don't render if dark mode is not enabled in settings
  if (!darkModeEnabled) {
    return null;
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={toggleDarkMode}
      className={cn(
        'dark-mode-toggle transition-all duration-300',
        showLabel ? 'space-x-2' : '',
        className
      )}
      title={isDarkMode ? 'Prebaci na svetli režim' : 'Prebaci na tamni režim'}
    >
      {isDarkMode ? (
        <>
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          {showLabel && <span className="hidden sm:inline">Svetli režim</span>}
        </>
      ) : (
        <>
          <Moon className="h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          {showLabel && <span className="hidden sm:inline">Tamni režim</span>}
        </>
      )}
      <span className="sr-only">
        {isDarkMode ? 'Prebaci na svetli režim' : 'Prebaci na tamni režim'}
      </span>
    </Button>
  );
}

// Alternative compact version for headers/navbars
export function DarkModeToggleCompact({ className }: { className?: string }) {
  const { isDarkMode, toggleDarkMode, settings } = useSettings();

  if (!settings?.themeDarkMode) {
    return null;
  }

  return (
    <button
      onClick={toggleDarkMode}
      className={cn(
        'relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-dynamic focus:ring-offset-2',
        isDarkMode ? 'bg-primary-dynamic' : 'bg-gray-200 dark:bg-gray-700',
        className
      )}
      title={isDarkMode ? 'Prebaci na svetli režim' : 'Prebaci na tamni režim'}
    >
      <span
        className={cn(
          'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
          isDarkMode ? 'translate-x-6' : 'translate-x-1'
        )}
      >
        <span className="flex items-center justify-center h-full w-full">
          {isDarkMode ? (
            <Moon className="h-2.5 w-2.5 text-primary-dynamic" />
          ) : (
            <Sun className="h-2.5 w-2.5 text-gray-400" />
          )}
        </span>
      </span>
      <span className="sr-only">
        {isDarkMode ? 'Prebaci na svetli režim' : 'Prebaci na tamni režim'}
      </span>
    </button>
  );
}

// Floating action button version
export function DarkModeToggleFAB({ className }: { className?: string }) {
  const { isDarkMode, toggleDarkMode, settings } = useSettings();

  if (!settings?.themeDarkMode) {
    return null;
  }

  return (
    <button
      onClick={toggleDarkMode}
      className={cn(
        'fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full shadow-lg transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary-dynamic focus:ring-offset-2',
        isDarkMode 
          ? 'bg-gray-800 text-yellow-400 hover:bg-gray-700' 
          : 'bg-white text-gray-800 hover:bg-gray-50 border border-gray-200',
        'shadow-dynamic-lg',
        className
      )}
      title={isDarkMode ? 'Prebaci na svetli režim' : 'Prebaci na tamni režim'}
    >
      {isDarkMode ? (
        <Sun className="h-5 w-5 transition-transform hover:rotate-12" />
      ) : (
        <Moon className="h-5 w-5 transition-transform hover:-rotate-12" />
      )}
      <span className="sr-only">
        {isDarkMode ? 'Prebaci na svetli režim' : 'Prebaci na tamni režim'}
      </span>
    </button>
  );
}