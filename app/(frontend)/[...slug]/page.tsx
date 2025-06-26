// app/(frontend)/[...slug]/page.tsx - Updated to support Page Builder
'use client';

import { use, useEffect, useState } from 'react';
import { useSettings } from '@/lib/settings-context';
import { Button } from '@/components/ui/button';
import { 
  Building,
  ArrowLeft,
  FileText
} from 'lucide-react';
import Link from 'next/link';
import { pagesApi, postsApi, mediaApi, galleryApi, servicesApi } from '@/lib/api';
import { type Page, type Post, type Gallery, Service, PageSection } from '@/lib/types';
import { getTemplate, type TemplateProps } from '@/templates/template-registry';
import { SingleGalleryTemplate } from '@/templates/gallery/single-gallery-template';
import { SingleServiceTemplate } from '@/templates/services/single-service-template';
import { PageBuilderRenderer } from '@/components/frontend/section-renderer';

interface DynamicPageProps {
  params: Promise<{ slug: string[] }>;
}

export default function DynamicPage({ params }: DynamicPageProps) {
  const resolvedParams = use(params);
  const { settings } = useSettings();
  const [posts, setPosts] = useState<Post[]>([]);
  const [page, setPage] = useState<Page | null>(null);
  const [sections, setSections] = useState<PageSection[]>([]); // Add sections state
  const [gallery, setGallery] = useState<Gallery | null>(null);
  const [service, setService] = useState<Service | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Parse the slug array
  const slugArray = resolvedParams.slug || [];
  const pageSlug = slugArray[0];
  const subSlug = slugArray[1]; // Gallery/Service slug if present

  // Use settings for institution data with fallbacks
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
    if (pageSlug) {
      fetchPage();
    }
  }, [pageSlug, subSlug]);

  const fetchPage = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // First, try to get the main page
      const pageData = await pagesApi.getBySlug(pageSlug);
      setPage(pageData);

      // If page uses page builder, fetch sections
      if (pageData.usePageBuilder) {
        try {
          const sectionsData = await pagesApi.getSections(pageData.id);
          setSections(sectionsData);
        } catch (sectionsError) {
          console.error('Error fetching sections:', sectionsError);
          setSections([]);
        }
      }

      // If this is a gallery page and we have a sub-slug, try to get the gallery
      if (pageData.template === 'gallery' && subSlug) {
        try {
          const galleryData = await galleryApi.getBySlug(subSlug);
          setGallery(galleryData);
        } catch (galleryError) {
          console.error('Gallery not found:', galleryError);
          // Gallery not found, but page exists - this will show 404 in template
          setGallery(null);
        }
      }

      // If this is a services page and we have a sub-slug, try to get the service
      if (pageData.template === 'services' && subSlug) {
        try {
          const serviceData = await servicesApi.getBySlug(subSlug);
          setService(serviceData);
        } catch (serviceError) {
          console.error('Service not found:', serviceError);
          setService(null);
        }
      }

    } catch (error) {
      console.error('Error fetching page:', error);
      setError('Страница није пронађена');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch posts specific to this page
  const fetchPosts = async () => {
    if (!page?.id) return;
    
    try {
      setIsLoadingPosts(true);
      console.log('Fetching posts for page:', page.id);

      // Get posts that are assigned to this specific page
      const allPosts = await postsApi.getPublished(1, 50);
      const pageSpecificPosts = allPosts.posts.filter(post => 
        post.pages && post.pages.some(p => p.id === page.id))
      
      console.log('Posts for this page:', pageSpecificPosts);
      setPosts(pageSpecificPosts.slice(0, 6));

    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setIsLoadingPosts(false);
    }
  };

  // Fetch posts after page is loaded
  useEffect(() => {
    if (page?.id) {
      fetchPosts();
    }
  }, [page?.id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </main>
      </div>
    );
  }

  if (error || !page) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <Link href="/" className="flex items-center space-x-3">
                {settings?.siteLogo ? (
                  <img 
                    src={mediaApi.getFileUrl(settings.siteLogo)} 
                    alt={settings.siteName || 'Лого'} 
                    className="h-8 object-contain"
                  />
                ) : (
                  <Building className="h-8 w-8 text-primary-dynamic" />
                )}
                <span className="text-lg font-bold text-gray-900">{institutionData.name}</span>
              </Link>
              <Button variant="outline" size="sm" asChild>
                <Link href="/">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Назад на почетну
                </Link>
              </Button>
            </div>
          </div>
        </header>
        
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Страница није пронађена</h1>
            <p className="text-gray-600 mb-6">
              Страница коју тражите не постоји или је уклоњена.
            </p>
            <Button variant="primary" asChild>
              <Link href="/">Назад на почетну</Link>
            </Button>
          </div>
        </main>
      </div>
    );
  }

  // If this is a gallery page with a sub-slug, use SingleGalleryTemplate
  if (page.template === 'gallery' && subSlug) {
    if (gallery) {
      return (
        <SingleGalleryTemplate 
          gallery={gallery} 
          institutionData={institutionData}
          settings={settings}
          parentPageSlug={page.slug}
        />
      ); 
    } else {
      // Gallery not found, show 404
      return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center">
              <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Галерија није пронађена</h1>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Галерија коју тражите не постоји или је уклоњена.
              </p>
              <Button variant="primary" asChild>
                <Link href={`/${page.slug}`}>Назад на галерије</Link>
              </Button>
            </div>
          </main>
        </div>
      );
    }
  }

  // If this is a services page with a sub-slug, use SingleServiceTemplate
  if (page.template === 'services' && subSlug) {
    if (service) {
      return (
        <SingleServiceTemplate 
          service={service} 
          institutionData={institutionData}
          settings={settings}
          parentPageSlug={page.slug}
        />
      ); 
    } else {
      // Service not found, show 404
      return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center">
              <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Услуга није пронађена</h1>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Услугу коју тражите не постоји или је уклоњена.
              </p>
              <Button variant="primary" asChild>
                <Link href={`/${page.slug}`}>Назад на услуге</Link>
              </Button>
            </div>
          </main>
        </div>
      );
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Page Header - Only show if not using page builder or if sections don't have hero */}
      {!page.usePageBuilder && (
        <div className="bg-white border-b dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{page.title}</h1>
              <Button variant="outline" asChild>
                <Link href="/">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Назад на почетну
                </Link>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
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
              posts,
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