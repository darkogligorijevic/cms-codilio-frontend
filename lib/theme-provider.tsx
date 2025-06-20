// components/theme-provider.tsx - Za buduće dark mode implementacije
"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { useSettings } from "@/lib/settings-context"

interface ThemeProviderProps extends React.ComponentProps<typeof NextThemesProvider> {
  forceLightMode?: boolean; // Nova opcija za forsiranje svetle teme
}

export function ThemeProvider({
  children,
  forceLightMode = true, // Trenutno forsiramo svetlu temu
  ...props
}: ThemeProviderProps) {
  const { settings } = useSettings();

  // Ako forsiramo svetlu temu, ignoriši dark mode settings
  const enableSystem = !forceLightMode && (settings?.themeDarkMode ?? false);
  const defaultTheme = "light";
  const forcedTheme = forceLightMode ? "light" : undefined;
  
  // Debug logs
  React.useEffect(() => {
    console.log('🎨 ThemeProvider config:', {
      forceLightMode,
      enableSystem,
      defaultTheme,
      forcedTheme,
      themeDarkModeEnabled: settings?.themeDarkMode
    });
  }, [forceLightMode, enableSystem, defaultTheme, forcedTheme, settings]);

  return (
    <NextThemesProvider 
      {...props}
      enableSystem={enableSystem}
      defaultTheme={defaultTheme}
      forcedTheme={forcedTheme}
      disableTransitionOnChange={false}
      attribute="class"
      themes={settings?.themeDarkMode && !forceLightMode ? ['light', 'dark', 'system'] : ['light']}
      storageKey="codilio-theme"
    >
      {children}
    </NextThemesProvider>
  )
}

// Helper komponenta za buduće dark mode implementacije
export function ThemeProviderWithDarkMode({ children, ...props }: React.ComponentProps<typeof NextThemesProvider>) {
  return (
    <ThemeProvider forceLightMode={false} {...props}>
      {children}
    </ThemeProvider>
  );
}