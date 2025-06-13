// components/meta-tags.tsx
'use client';

import { useSettings } from '@/lib/settings-context';
import { mediaApi } from '@/lib/api';
import Head from 'next/head';

interface MetaTagsProps {
  title?: string;
  description?: string;
  keywords?: string;
}

export function MetaTags({ title, description, keywords }: MetaTagsProps) {
  const { settings } = useSettings();

  const siteTitle = title 
    ? `${title} | ${settings?.siteName || 'CMS Codilio'}`
    : settings?.seoTitle || settings?.siteName || 'CMS Codilio';

  const siteDescription = description || settings?.seoDescription || settings?.siteTagline || '';
  const siteKeywords = keywords || settings?.seoKeywords || '';

  return (
    <Head>
      <title>{siteTitle}</title>
      <meta name="description" content={siteDescription} />
      {siteKeywords && <meta name="keywords" content={siteKeywords} />}
      
      {/* Favicon */}
      {settings?.siteFavicon && (
        <link rel="icon" href={mediaApi.getFileUrl(settings.siteFavicon)} />
      )}
      
      {/* Open Graph */}
      <meta property="og:title" content={siteTitle} />
      <meta property="og:description" content={siteDescription} />
      <meta property="og:site_name" content={settings?.siteName || 'CMS Codilio'} />
      {settings?.siteLogo && (
        <meta property="og:image" content={mediaApi.getFileUrl(settings.siteLogo)} />
      )}
      
      {/* Google Analytics */}
      {settings?.seoGoogleAnalytics && (
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
      {settings?.seoGoogleTagManager && (
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
      )}
    </Head>
  );
}

// Hook for dynamic theme colors
export function useThemeColors() {
  const { settings } = useSettings();
  
  if (typeof window !== 'undefined' && settings) {
    const root = document.documentElement;
    
    if (settings.themePrimaryColor) {
      root.style.setProperty('--primary', settings.themePrimaryColor);
    }
    
    if (settings.themeSecondaryColor) {
      root.style.setProperty('--secondary', settings.themeSecondaryColor);
    }
    
    if (settings.themeFontFamily) {
      root.style.setProperty('--font-family', settings.themeFontFamily);
    }
  }
}