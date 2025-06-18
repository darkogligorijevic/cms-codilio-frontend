// lib/theme-hooks.ts - Optimized to prevent unnecessary renders
'use client';

import { useSettings } from './settings-context';
import { useEffect, useState, useMemo, useCallback } from 'react';

// Hook for getting current theme colors - memoized
export function useThemeColors() {
  const { settings } = useSettings();
  
  return useMemo(() => ({
    primary: settings?.themePrimaryColor || '#3B82F6',
    secondary: settings?.themeSecondaryColor || '#10B981',
    primaryHsl: settings?.themePrimaryColor ? hexToHsl(settings.themePrimaryColor) : '220 100% 50%',
    secondaryHsl: settings?.themeSecondaryColor ? hexToHsl(settings.themeSecondaryColor) : '160 84% 39%',
  }), [settings?.themePrimaryColor, settings?.themeSecondaryColor]);
}

// Hook for getting current font family - memoized
export function useThemeFont() {
  const { settings } = useSettings();
  
  return useMemo(() => 
    settings?.themeFontFamily || 'Inter'
  , [settings?.themeFontFamily]);
}

// Hook for getting all theme settings - memoized
export function useTheme() {
  const { settings } = useSettings();
  
  return useMemo(() => ({
    colors: {
      primary: settings?.themePrimaryColor || '#3B82F6',
      secondary: settings?.themeSecondaryColor || '#10B981',
    },
    font: settings?.themeFontFamily || 'Inter',
    darkMode: settings?.themeDarkMode || false,
    siteName: settings?.siteName || 'CodilioCMS',
  }), [
    settings?.themePrimaryColor, 
    settings?.themeSecondaryColor, 
    settings?.themeFontFamily, 
    settings?.themeDarkMode, 
    settings?.siteName
  ]);
}

// Hook for applying dynamic styles to elements - memoized functions
export function useDynamicStyles() {
  const theme = useTheme();
  
  const getButtonStyles = useCallback((variant: 'primary' | 'secondary' = 'primary') => {
    const color = variant === 'primary' ? theme.colors.primary : theme.colors.secondary;
    
    return {
      backgroundColor: color,
      borderColor: color,
      fontFamily: theme.font,
      transition: 'all 0.2s ease-in-out',
      color: 'white'
    };
  }, [theme.colors.primary, theme.colors.secondary, theme.font]);
  
  const getTextStyles = useCallback((variant: 'primary' | 'secondary' = 'primary') => {
    const color = variant === 'primary' ? theme.colors.primary : theme.colors.secondary;
    
    return {
      color: color,
      fontFamily: theme.font,
    };
  }, [theme.colors.primary, theme.colors.secondary, theme.font]);
  
  const getGradientStyles = useCallback(() => {
    return {
      background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})`,
      fontFamily: theme.font,
    };
  }, [theme.colors.primary, theme.colors.secondary, theme.font]);
  
  const getLinkStyles = useCallback((variant: 'primary' | 'secondary' = 'primary') => {
    const color = variant === 'primary' ? theme.colors.primary : theme.colors.secondary;
    
    return {
      color: color,
      fontFamily: theme.font,
      textDecoration: 'none',
      transition: 'color 0.2s ease-in-out',
    };
  }, [theme.colors.primary, theme.colors.secondary, theme.font]);
  
  return useMemo(() => ({
    getButtonStyles,
    getTextStyles,
    getGradientStyles,
    getLinkStyles,
    theme,
  }), [getButtonStyles, getTextStyles, getGradientStyles, getLinkStyles, theme]);
}

// Utility function to convert hex to HSL - stable function
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

// Hook for real-time CSS variable updates - optimized
export function useLiveTheme() {
  const { settings } = useSettings();
  const [cssVars, setCssVars] = useState<Record<string, string>>({});
  
  useEffect(() => {
    if (!settings) return;
    
    const vars: Record<string, string> = {};
    
    if (settings.themePrimaryColor) {
      vars['--primary'] = hexToHsl(settings.themePrimaryColor);
      vars['--primary-hex'] = settings.themePrimaryColor;
    }
    
    if (settings.themeSecondaryColor) {
      vars['--secondary'] = hexToHsl(settings.themeSecondaryColor);
      vars['--secondary-hex'] = settings.themeSecondaryColor;
    }
    
    if (settings.themeFontFamily) {
      vars['--font-family'] = settings.themeFontFamily;
    }
    
    setCssVars(vars);
  }, [
    settings?.themePrimaryColor, 
    settings?.themeSecondaryColor, 
    settings?.themeFontFamily
  ]); // Only specific dependencies
  
  return cssVars;
}

// Hook for dynamic CSS class names based on theme - memoized
export function useThemeClasses() {
  const { settings } = useSettings();
  
  return useMemo(() => ({
    primaryText: 'text-primary-dynamic',
    secondaryText: 'text-secondary-dynamic',
    primaryBg: 'bg-primary-dynamic',
    secondaryBg: 'bg-secondary-dynamic',
    primaryBorder: 'border-primary-dynamic',
    secondaryBorder: 'border-secondary-dynamic',
    primaryHover: 'hover:bg-primary-dynamic hover:text-white',
    secondaryHover: 'hover:bg-secondary-dynamic hover:text-white',
    gradient: 'gradient-primary-secondary-dynamic',
    fontFamily: settings?.themeFontFamily || 'Inter',
  }), [settings?.themeFontFamily]);
}

// Custom hook for handling theme-aware inline styles - optimized
export function useInlineThemeStyles() {
  const theme = useTheme();
  
  const getInlineStyles = useCallback((
    styleType: 'primary' | 'secondary' | 'gradient' | 'font', 
    additionalStyles?: React.CSSProperties
  ) => {
    let baseStyles: React.CSSProperties = {};
    
    switch (styleType) {
      case 'primary':
        baseStyles = {
          color: theme.colors.primary,
          fontFamily: theme.font,
        };
        break;
      case 'secondary':
        baseStyles = {
          color: theme.colors.secondary,
          fontFamily: theme.font,
        };
        break;
      case 'gradient':
        baseStyles = {
          background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})`,
          fontFamily: theme.font,
        };
        break;
      case 'font':
        baseStyles = {
          fontFamily: theme.font,
        };
        break;
    }
    
    return { ...baseStyles, ...additionalStyles };
  }, [theme]);
  
  return useMemo(() => ({ 
    getInlineStyles, 
    theme 
  }), [getInlineStyles, theme]);
}