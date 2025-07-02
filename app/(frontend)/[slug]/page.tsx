// app/(frontend)/[slug]/page.tsx - Complete implementation with single post and category archive support
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
import { pagesApi, postsApi, mediaApi, galleryApi, servicesApi, categoriesApi } from '@/lib/api';
import { type Page, type Post, type Gallery, Service, PageSection, Category } from '@/lib/types';
import { getTemplate, type TemplateProps } from '@/templates/template-registry';
import { SingleGalleryTemplate } from '@/templates/gallery/single-gallery-template';
import { SingleServiceTemplate } from '@/templates/services/single-service-template';
import { SinglePostTemplate } from '@/templates/posts/single-post-template';
import { CategoryArchiveTemplate } from '@/templates/categories/category-archive-template';
import { PageBuilderRenderer } from '@/components/frontend/section-renderer';

interface DynamicPageProps {
  params: Promise<{ slug: string }>;
}

export default function DynamicPage({ params }: DynamicPageProps) {
  const resolvedParams = use(params);
  const { settings } = useSettings();
  const [posts, setPosts] = useState<Post[]>([]);
  const [page, setPage] = useState<Page | null>(null);
  const [sections, setSections] = useState<PageSection[]>([]);
  const [gallery, setGallery] = useState<Gallery | null>(null);
  const [service, setService] = useState<Service | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [category, setCategory] = useState<Category | null>(null);
  const [singlePost, setSinglePost] = useState<Post | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const pageSlug = resolvedParams.slug;

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
      fetchContent();
    }
  }, [pageSlug]);

  const fetchContent = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // FIRST: Try to get a single post by slug
      try {
        const postData = await postsApi.getBySlug(pageSlug);
        setSinglePost(postData);
        return; // Exit early if post found
      } catch (postError) {
        console.log('Post not found, checking for category...');
      }
      
      // SECOND: Try to get a category by slug
      try {
        const categoryData = await categoriesApi.getBySlug(pageSlug);
        setCategory(categoryData);
        return; // Exit early if category found
      } catch (categoryError) {
        console.log('Category not found, checking for page...');
      }
      
      // THIRD: Try to get a regular page
      try {
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
        
        // For categories template, fetch categories data
        if (pageData.template === 'categories') {
          try {
            const categoriesData = await categoriesApi.getAll();
            setCategories(categoriesData);
          } catch (categoriesError) {
            console.error('Error fetching categories:', categoriesError);
            setCategories([]);
          }
        }
        
        // For posts template, fetch posts data
        if (pageData.template === 'posts') {
          try {
            const postsData = await postsApi.getPublished(1, 50);
            setPosts(postsData.posts);
          } catch (postsError) {
            console.error('Error fetching posts:', postsError);
            setPosts([]);
          }
        }
        
        // If it's a regular page or template page, fetch related posts
        fetchPagePosts(pageData);
        return; // Exit early if page found
        
      } catch (pageError) {
        console.log('Page not found, checking for gallery or service...');
        
        // FOURTH: Try to find a gallery with this slug
        try {
          const galleryData = await galleryApi.getBySlug(pageSlug);
          setGallery(galleryData);
          return; // Exit early if gallery found
          
        } catch (galleryError) {
          console.log('Gallery not found, checking for service...');
          
    
          try {
            const serviceData = await servicesApi.getBySlug(pageSlug);
            setService(serviceData);
            return; // Exit early if service found
            
          } catch (serviceError) {
            console.error('Nothing found for slug:', pageSlug);
            setError('Страница није пронађена');
          }
        }
      }
      
    } catch (error) {
      console.error('Error fetching content:', error);
      setError('Грешка при учитавању садржаја');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch posts specific to this page
  const fetchPagePosts = async (pageData: Page) => {
    if (!pageData?.id) return;
    
    try {
      setIsLoadingPosts(true);
      console.log('Fetching posts for page:', pageData.id);

      // Get posts that are assigned to this specific page
      const allPosts = await postsApi.getPublished(1, 50);
      const pageSpecificPosts = allPosts.posts.filter(post => 
        post.pages && post.pages.some(p => p.id === pageData.id));
      
      console.log('Posts for this page:', pageSpecificPosts);
      setPosts(pageSpecificPosts.slice(0, 6));

    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setIsLoadingPosts(false);
    }
  };

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

  // If single post found, render single post template
  if (singlePost) {
    return (
      <SinglePostTemplate 
        post={singlePost} 
        institutionData={institutionData}
        settings={settings}
      />
    );
  }

  // If category found, render category archive template
  if (category) {
    return (
      <CategoryArchiveTemplate 
        category={category}
        institutionData={institutionData}
        settings={settings}
      />
    );
  }

  // If gallery found, render gallery template
  if (gallery) {
    return (
      <SingleGalleryTemplate 
        gallery={gallery} 
        institutionData={institutionData}
        settings={settings}
        parentPageSlug="galerija"
      />
    );
  }

  // If service found, render service template
  if (service) {
    return (
      <SingleServiceTemplate 
        service={service}
        institutionData={institutionData}
        settings={settings}
        parentPageSlug="usluge"
      />
    );
  }

  // If error or nothing found
  if (error || (!page && !gallery && !service && !singlePost && !category)) {
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

  // Regular page rendering
  if (page) {
    return (
      <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 ${!page.usePageBuilder && 'py-16'}`}>
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
                posts: page.template === 'categories' ? [] : posts,
                institutionData,
                settings
              };
              
              // For categories template, pass categories instead of posts
              if (page.template === 'categories') {
                return <TemplateComponent {...templateProps} />;
              }
              
              return <TemplateComponent {...templateProps} />;
            })()
          )}
        </main>
      </div>
    );
  }

  return null;
}