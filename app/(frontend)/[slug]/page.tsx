// app/[slug]/page.tsx - Ažurirano sa template sistemom
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
import { pagesApi, postsApi, mediaApi } from '@/lib/api';
import type { Page, Post } from '@/lib/types';
import { getTemplate, type TemplateProps } from '@/templates/template-registry';

interface DynamicPageProps {
  params: Promise<{ slug: string }>;
}

export default function DynamicPage({ params }: DynamicPageProps) {
  const resolvedParams = use(params);
  const { settings } = useSettings();
  const [posts, setPosts] = useState<Post[]>([]);
  const [page, setPage] = useState<Page | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    fetchPage();
  }, [resolvedParams.slug]);

  const fetchPage = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const pageData = await pagesApi.getBySlug(resolvedParams.slug);
      setPage(pageData);
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

  // Get the appropriate template component
  const TemplateComponent = getTemplate(page?.template);

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

  // Prepare template props
  const templateProps: TemplateProps = {
    page,
    posts,
    institutionData,
    settings
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
    
      {/* Page Header */}
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

      {/* Main Content - Render with selected template */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <TemplateComponent {...templateProps} />
      </main>

    </div>
  );
}