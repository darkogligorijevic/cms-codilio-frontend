// app/(frontend)/page.tsx - Updated to load "pocetna" page content
'use client';

import { useEffect, useState } from 'react';
import { useSettings } from '@/lib/settings-context';
import { pagesApi } from '@/lib/api';
import type { Page, PageSection } from '@/lib/types';
import { PageBuilderRenderer } from '@/components/frontend/section-renderer';
import { getTemplate, type TemplateProps } from '@/templates/template-registry';

export default function HomePage() {
  const { settings, isLoading: settingsLoading } = useSettings();
  const [page, setPage] = useState<Page | null>(null);
  const [sections, setSections] = useState<PageSection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Use settings for institution data
  const institutionData = {
    name: settings?.siteName || "Локална институција",
    description: settings?.siteTagline || "Службени портал локалне самоуправе",
    address: settings?.contactAddress || "Адреса институције",
    phone: settings?.contactPhone || "+381 11 123 4567",
    email: settings?.contactEmail || "info@institucija.rs",
    workingHours: settings?.contactWorkingHours || "Понедељак - Петак: 07:30 - 15:30",
    mapUrl: settings?.contactMapUrl,
    citizens: "53.096",
    villages: "32",
    area: "339 km²"
  };

  useEffect(() => {
    fetchHomepageContent();
  }, []);

  const fetchHomepageContent = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Try to load the "pocetna" page first
      let homePage: Page;
      try {
        homePage = await pagesApi.getBySlug('pocetna');
      } catch (pocetnaError) {
        console.log('Pocetna page not found, trying fallback...');
        
        // Fallback: try to find any page that could be a homepage
        try {
          homePage = await pagesApi.getBySlug('home');
        } catch (homeError) {
          // If no homepage found, create a basic fallback
          throw new Error('No homepage found');
        }
      }
      
      setPage(homePage);

      // If page uses page builder, fetch sections
      if (homePage.usePageBuilder) {
        try {
          const sectionsData = await pagesApi.getSections(homePage.id);
          setSections(sectionsData);
        } catch (sectionsError) {
          console.error('Error fetching sections:', sectionsError);
          setSections([]);
        }
      }

    } catch (error) {
      console.error('Error fetching homepage:', error);
      setError('Грешка при учитавању почетне странице');
    } finally {
      setIsLoading(false);
    }
  };

  if (settingsLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error && !page) {
    // Fallback content if no homepage is found
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900">
        <section className="py-24 lg:py-32 bg-gradient-to-r from-primary to-secondary text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl lg:text-6xl font-bold mb-6">
              Добродошли у {institutionData.name}
            </h1>
            <p className="text-xl lg:text-2xl text-blue-100 mb-8">
              {institutionData.description}
            </p>
            <div className="text-center">
              <p className="text-red-100 mb-4">
                Почетна страница се учитава...
              </p>
            </div>
          </div>
        </section>
      </div>
    );
  }

  if (!page) {
    return null;
  }


  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 ${!page.usePageBuilder && 'py-16'}`}>
      <main className={page.usePageBuilder ? "" : "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"}>
        {page.usePageBuilder ? (
          // Render sections using Page Builder
          <PageBuilderRenderer sections={sections} />
        ) : (
          // Render with traditional template
          (() => {
            const TemplateComponent = getTemplate(page.template);
            const templateProps: TemplateProps = {
              page,
              posts: [], 
              institutionData,
              settings
            };
            return <TemplateComponent {...templateProps} />;
          })()
        )}
      </main>
    </div>
  );
}