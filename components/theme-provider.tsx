// components/theme-provider.tsx - Enhanced with better dark mode support and debugging
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
    >
      {children}
    </NextThemesProvider>
  )
}

// Utility function to convert hex color to HSL
function hexToHsl(hex: string): string {
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