// components/meta-tags.tsx - Optimized version
'use client';

import { useSettings } from '@/lib/settings-context';
import { mediaApi } from '@/lib/api';
import { useEffect, useRef } from 'react';

interface MetaTagsProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
}

export function MetaTags({ title, description, keywords, image }: MetaTagsProps) {
  const { settings } = useSettings();
  const lastAppliedSettings = useRef<string>('');

  useEffect(() => {
    if (typeof document === 'undefined' || !settings) return;

    // Create a hash of settings to avoid unnecessary DOM manipulations
    const settingsHash = JSON.stringify({
      siteName: settings.siteName,
      seoTitle: settings.seoTitle,
      seoDescription: settings.seoDescription,
      seoKeywords: settings.seoKeywords,
      siteLogo: settings.siteLogo,
      siteFavicon: settings.siteFavicon,
      themePrimaryColor: settings.themePrimaryColor,
      seoGoogleAnalytics: settings.seoGoogleAnalytics,
      seoGoogleTagManager: settings.seoGoogleTagManager,
      title,
      description,
      keywords,
      image
    });

    // Skip if nothing changed
    if (lastAppliedSettings.current === settingsHash) {
      return;
    }

    lastAppliedSettings.current = settingsHash;

    const siteTitle = title 
      ? `${title} | ${settings?.siteName || 'CMS Codilio'}`
      : settings?.seoTitle || settings?.siteName || 'CMS Codilio';

    const siteDescription = description || settings?.seoDescription || settings?.siteTagline || '';
    const siteKeywords = keywords || settings?.seoKeywords || '';

    // Batch DOM updates
    requestAnimationFrame(() => {
      // Update document title
      document.title = siteTitle;

      // Update or create meta tags
      const updateMetaTag = (name: string, content: string) => {
        if (!content) return;
        
        let metaTag = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement;
        if (!metaTag) {
          metaTag = document.createElement('meta');
          metaTag.name = name;
          document.head.appendChild(metaTag);
        }
        metaTag.content = content;
      };

      const updateMetaProperty = (property: string, content: string) => {
        if (!content) return;
        
        let metaTag = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement;
        if (!metaTag) {
          metaTag = document.createElement('meta');
          metaTag.setAttribute('property', property);
          document.head.appendChild(metaTag);
        }
        metaTag.content = content;
      };

      // Basic meta tags
      updateMetaTag('description', siteDescription);
      if (siteKeywords) updateMetaTag('keywords', siteKeywords);

      // Open Graph tags
      updateMetaProperty('og:title', siteTitle);
      updateMetaProperty('og:description', siteDescription);
      updateMetaProperty('og:site_name', settings?.siteName || 'CMS Codilio');
      updateMetaProperty('og:type', 'website');

      // Image for social sharing
      const socialImage = image || (settings?.siteLogo ? mediaApi.getFileUrl(settings.siteLogo) : '');
      if (socialImage) {
        updateMetaProperty('og:image', socialImage);
        updateMetaTag('twitter:image', socialImage);
      }

      // Twitter Card tags
      updateMetaTag('twitter:card', 'summary_large_image');
      updateMetaTag('twitter:title', siteTitle);
      updateMetaTag('twitter:description', siteDescription);

      // Favicon
      if (settings?.siteFavicon) {
        let favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
        if (!favicon) {
          favicon = document.createElement('link');
          favicon.rel = 'icon';
          document.head.appendChild(favicon);
        }
        favicon.href = mediaApi.getFileUrl(settings.siteFavicon);
      }

      // Theme color for mobile browsers
      if (settings?.themePrimaryColor) {
        let themeColor = document.querySelector('meta[name="theme-color"]') as HTMLMetaElement;
        if (!themeColor) {
          themeColor = document.createElement('meta');
          themeColor.name = 'theme-color';
          document.head.appendChild(themeColor);
        }
        themeColor.content = settings.themePrimaryColor;
      }
    });

    // Google Analytics - only add if not already present
    if (settings?.seoGoogleAnalytics) {
      const existingGA = document.querySelector(`script[src*="${settings.seoGoogleAnalytics}"]`);
      if (!existingGA) {
        // Remove old GA scripts
        const oldGA = document.querySelectorAll('script[src*="googletagmanager.com/gtag"]');
        oldGA.forEach(script => script.remove());

        // Add new GA script
        const gaScript = document.createElement('script');
        gaScript.async = true;
        gaScript.src = `https://www.googletagmanager.com/gtag/js?id=${settings.seoGoogleAnalytics}`;
        document.head.appendChild(gaScript);

        // Add GA config script
        const gaConfig = document.createElement('script');
        gaConfig.innerHTML = `
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${settings.seoGoogleAnalytics}');
        `;
        document.head.appendChild(gaConfig);
      }
    }

    // Google Tag Manager - only add if not already present
    if (settings?.seoGoogleTagManager) {
      const existingGTM = document.querySelector(`script[src*="${settings.seoGoogleTagManager}"]`);
      if (!existingGTM) {
        // Remove old GTM scripts
        const oldGTM = document.querySelectorAll('script[src*="googletagmanager.com/gtm"]');
        oldGTM.forEach(script => script.remove());

        // Add new GTM script
        const gtmScript = document.createElement('script');
        gtmScript.innerHTML = `
          (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
          new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
          j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
          'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
          })(window,document,'script','dataLayer','${settings.seoGoogleTagManager}');
        `;
        document.head.appendChild(gtmScript);

        // Add GTM noscript fallback to body
        const gtmNoscript = document.createElement('noscript');
        gtmNoscript.innerHTML = `
          <iframe src="https://www.googletagmanager.com/ns.html?id=${settings.seoGoogleTagManager}"
          height="0" width="0" style="display:none;visibility:hidden"></iframe>
        `;
        if (document.body && !document.querySelector('noscript[src*="googletagmanager"]')) {
          document.body.prepend(gtmNoscript);
        }
      }
    }

  }, [settings, title, description, keywords, image]);

  return null; // This component doesn't render anything visible
}

// Hook for dynamic font loading - optimized
export function useDynamicFonts() {
  const { settings } = useSettings();
  const lastLoadedFont = useRef<string>('');

  useEffect(() => {
    if (!settings?.themeFontFamily || typeof document === 'undefined') return;

    const fontFamily = settings.themeFontFamily;

    // Skip if same font is already loaded
    if (lastLoadedFont.current === fontFamily) return;

    // Font loading map
    const fontMap: Record<string, string> = {
      'Inter': 'https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500;600;700;800;900&display=swap',
      'Roboto': 'https://fonts.googleapis.com/css2?family=Roboto:wght@100;300;400;500;700;900&display=swap',
      'Open Sans': 'https://fonts.googleapis.com/css2?family=Open+Sans:wght@300;400;500;600;700;800&display=swap',
      'Lato': 'https://fonts.googleapis.com/css2?family=Lato:wght@100;300;400;700;900&display=swap',
      'Poppins': 'https://fonts.googleapis.com/css2?family=Poppins:wght@100;200;300;400;500;600;700;800;900&display=swap'
    };

    const fontUrl = fontMap[fontFamily];
    if (!fontUrl) return;

    // Check if font is already loaded
    const existingLink = document.querySelector(`link[href="${fontUrl}"]`);
    if (existingLink) {
      lastLoadedFont.current = fontFamily;
      return;
    }

    // Remove old font links (except the current one)
    const oldFontLinks = document.querySelectorAll('link[href*="fonts.googleapis.com"]');
    oldFontLinks.forEach(link => {
      if (link.getAttribute('href') !== fontUrl) {
        link.remove();
      }
    });

    // Add new font link
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = fontUrl;
    link.crossOrigin = 'anonymous';
    
    // Add load event listener to track when font is loaded
    link.onload = () => {
      lastLoadedFont.current = fontFamily;
    };
    
    document.head.appendChild(link);

  }, [settings?.themeFontFamily]);
}

// Component that applies fonts to body
export function DynamicFontLoader() {
  useDynamicFonts();
  return null;
}