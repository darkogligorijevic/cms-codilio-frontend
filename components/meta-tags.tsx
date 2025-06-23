// components/meta-tags.tsx - Enhanced with Dark Mode Support
'use client';

import { useEffect } from 'react';
import { useSettings } from '@/lib/settings-context';
import Head from 'next/head';

export function MetaTags() {
  const { settings } = useSettings();

  useEffect(() => {
    // Update meta theme-color based on current theme
    const updateThemeColor = () => {
      const isDark = document.documentElement.classList.contains('dark');
      const themeColorLight = settings?.themePrimaryColor || '#ffffff';
      const themeColorDark = '#020617'; // slate-950
      
      // Update existing theme-color meta tags
      const lightMetaTag = document.querySelector('meta[media="(prefers-color-scheme: light)"]');
      const darkMetaTag = document.querySelector('meta[media="(prefers-color-scheme: dark)"]');
      
      if (lightMetaTag) {
        lightMetaTag.setAttribute('content', themeColorLight);
      }
      if (darkMetaTag) {
        darkMetaTag.setAttribute('content', themeColorDark);
      }

      // Update the current theme-color meta tag
      let currentThemeTag = document.querySelector('meta[name="theme-color"]:not([media])');
      if (!currentThemeTag) {
        currentThemeTag = document.createElement('meta');
        currentThemeTag.setAttribute('name', 'theme-color');
        document.head.appendChild(currentThemeTag);
      }
      currentThemeTag.setAttribute('content', isDark ? themeColorDark : themeColorLight);
    };

    // Initial update
    updateThemeColor();

    // Listen for theme changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          updateThemeColor();
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => observer.disconnect();
  }, [settings?.themePrimaryColor]);

  if (!settings) return null;

  return (
    <Head>
      {/* Basic Meta Tags */}
      {settings.siteName && (
        <title>{settings.siteName}</title>
      )}
      
      {settings.siteTagline && (
        <meta name="description" content={settings.siteTagline} />
      )}

      {/* SEO Meta Tags */}
      {settings.seoTitle && (
        <meta property="og:title" content={settings.seoTitle} />
      )}
      
      {settings.seoDescription && (
        <>
          <meta name="description" content={settings.seoDescription} />
          <meta property="og:description" content={settings.seoDescription} />
          <meta name="twitter:description" content={settings.seoDescription} />
        </>
      )}

      {settings.seoKeywords && (
        <meta name="keywords" content={settings.seoKeywords} />
      )}

      {/* Open Graph Meta Tags */}
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={settings.siteName || 'CodilioCMS'} />
      
      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      {settings.siteName && (
        <meta name="twitter:title" content={settings.siteName} />
      )}

      {/* Favicon */}
      {settings.siteFavicon && (
        <>
          <link rel="icon" href={`/api/media/file/${settings.siteFavicon}`} />
          <link rel="apple-touch-icon" href={`/api/media/file/${settings.siteFavicon}`} />
        </>
      )}

      {/* Language and locale */}
      <meta httpEquiv="content-language" content={settings.siteLanguage || 'sr'} />
      <meta property="og:locale" content={settings.siteLanguage === 'en' ? 'en_US' : 'sr_RS'} />

      {/* Viewport for responsive design */}
      <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />

      {/* Color scheme and theme support */}
      <meta name="color-scheme" content="light dark" />
      <meta name="supported-color-schemes" content="light dark" />

      {/* PWA Meta Tags */}
      <meta name="application-name" content={settings.siteName || 'CodilioCMS'} />
      <meta name="apple-mobile-web-app-title" content={settings.siteName || 'CodilioCMS'} />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />

      {/* Additional SEO */}
      <meta name="robots" content="index, follow" />
      <meta name="googlebot" content="index, follow" />
      
      {/* Contact Information */}
      {settings.contactEmail && (
        <meta name="contact" content={settings.contactEmail} />
      )}

      {/* Analytics */}
      {settings.seoGoogleAnalytics && (
        <>
          <script
            async
            src={`https://www.googletagmanager.com/gtag/js?id=${settings.seoGoogleAnalytics}`}
          />
          <script
            dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${settings.seoGoogleAnalytics}');
              `,
            }}
          />
        </>
      )}

      {/* Google Tag Manager */}
      {settings.seoGoogleTagManager && (
        <>
          <script
            dangerouslySetInnerHTML={{
              __html: `
                (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
                new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
                j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
                'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
                })(window,document,'script','dataLayer','${settings.seoGoogleTagManager}');
              `,
            }}
          />
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${settings.seoGoogleTagManager}`}
              height="0"
              width="0"
              style={{ display: 'none', visibility: 'hidden' }}
            />
          </noscript>
        </>
      )}
    </Head>
  );
}

export function DynamicFontLoader() {
  const { settings } = useSettings();

  useEffect(() => {
    if (!settings?.themeFontFamily || typeof window === 'undefined') return;

    const fontFamily = settings.themeFontFamily;

    // Skip if font is already loaded or is a system font
    if (fontFamily === 'Inter' || fontFamily.includes('system-ui')) return;

    // Create font link element
    const linkElement = document.createElement('link');
    linkElement.rel = 'preload';
    linkElement.as = 'style';
    linkElement.onload = function() {
      // @ts-ignore
      this.onload = null;
      // @ts-ignore
      this.rel = 'stylesheet';
    };

    // Generate Google Fonts URL based on font family
    let fontUrl = '';
    switch (fontFamily) {
      case 'Roboto':
        fontUrl = 'https://fonts.googleapis.com/css2?family=Roboto:wght@100;300;400;500;700;900&display=swap';
        break;
      case 'Open Sans':
        fontUrl = 'https://fonts.googleapis.com/css2?family=Open+Sans:wght@300;400;500;600;700;800&display=swap';
        break;
      case 'Lato':
        fontUrl = 'https://fonts.googleapis.com/css2?family=Lato:wght@100;300;400;700;900&display=swap';
        break;
      case 'Poppins':
        fontUrl = 'https://fonts.googleapis.com/css2?family=Poppins:wght@100;200;300;400;500;600;700;800;900&display=swap';
        break;
      default:
        // For custom fonts, try to construct a Google Fonts URL
        const fontName = fontFamily.replace(/\s+/g, '+');
        fontUrl = `https://fonts.googleapis.com/css2?family=${fontName}:wght@300;400;500;600;700&display=swap`;
    }

    linkElement.href = fontUrl;

    // Check if font link already exists
    const existingLink = document.querySelector(`link[href="${fontUrl}"]`);
    if (!existingLink) {
      document.head.appendChild(linkElement);
    }

    // Apply font to body immediately
    document.body.style.fontFamily = `${fontFamily}, system-ui, -apple-system, sans-serif`;

    // Cleanup function
    return () => {
      // Don't remove the link on unmount as it might be used by other components
    };
  }, [settings?.themeFontFamily]);

  return null;
}