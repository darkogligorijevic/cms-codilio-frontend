// components/theme-provider.tsx - Complete Dark Mode Implementation
"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { useSettings } from "@/lib/settings-context"

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  const { settings } = useSettings();

  // DEBUG: Log theme provider state
  React.useEffect(() => {
    console.log('🎨 ThemeProvider - Settings changed:', {
      themeDarkMode: settings?.themeDarkMode,
      primaryColor: settings?.themePrimaryColor,
      secondaryColor: settings?.themeSecondaryColor
    });
  }, [settings]);

  // Only enable system theme detection if dark mode is enabled in settings
  const enableSystem = settings?.themeDarkMode ?? false;
  const defaultTheme = "light"; // Always start with light theme
  
  console.log('🎨 ThemeProvider config:', {
    enableSystem,
    defaultTheme,
    themeDarkModeEnabled: settings?.themeDarkMode
  });

  return (
    <NextThemesProvider 
      {...props}
      enableSystem={enableSystem}
      defaultTheme={defaultTheme}
      forcedTheme={!settings?.themeDarkMode ? "light" : undefined} // Force light if dark mode disabled
      disableTransitionOnChange={false}
      attribute="class"
      themes={settings?.themeDarkMode ? ['light', 'dark', 'system'] : ['light']}
      storageKey="codilio-theme"
      >{children}</NextThemesProvider>
  )
}