// components/frontend/sections/posts/posts-carousel.tsx
import { SectionData } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, Calendar, User, Eye, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';
import { categoriesApi, postsApi, mediaApi } from '@/lib/api';
import Link from 'next/link';

interface PostsCarouselSectionProps {
  data: SectionData;
  className?: string;
}

export function PostsCarouselSection({ data, className }: PostsCarouselSectionProps) {
  const [posts, setPosts] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [category, setCategory] = useState<any>(null);

  // Responsive slides per view
  const [slidesPerView, setSlidesPerView] = useState(3);

  useEffect(() => {
    const updateSlidesPerView = () => {
      if (window.innerWidth < 768) {
        setSlidesPerView(1);
      } else if (window.innerWidth < 1024) {
        setSlidesPerView(2);
      } else {
        setSlidesPerView(3);
      }
    };

    updateSlidesPerView();
    window.addEventListener('resize', updateSlidesPerView);
    return () => window.removeEventListener('resize', updateSlidesPerView);
  }, []);

  useEffect(() => {
    const fetchPosts = async () => {
      if (!data.categoryId) return;
      
      try {
        setIsLoading(true);
        
        // Fetch category details
        const categoryData = await categoriesApi.getById(Number(data.categoryId));
        setCategory(categoryData);
        
        // Fetch posts from this category
        const postsResponse = await postsApi.getPublished(1, data.postsLimit || 6);
        const filteredPosts = postsResponse.posts.filter(
          post => post.categoryId === Number(data.categoryId)
        );
        
        setPosts(filteredPosts);
      } catch (error) {
        console.error('Error fetching posts:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosts();
  }, [data.categoryId, data.postsLimit]);

  const nextSlide = () => {
    setCurrentIndex(prev => 
      prev + slidesPerView >= posts.length ? 0 : prev + 1
    );
  };

  const prevSlide = () => {
    setCurrentIndex(prev => 
      prev === 0 ? Math.max(0, posts.length - slidesPerView) : prev - 1
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('sr-RS', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 24) return `пре ${diffInHours} сати`;
    if (diffInHours < 168) return `пре ${Math.floor(diffInHours / 24)} дана`;
    return formatDate(dateString);
  };

  const visiblePosts = posts.slice(currentIndex, currentIndex + slidesPerView);

  if (isLoading) {
    return (
      <section className={cn('py-16', className)}>
        <div className="space-y-8">
          {/* Header skeleton */}
          <div className="text-center space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3 mx-auto animate-pulse"></div>
          </div>
          
          {/* Posts skeleton */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!posts.length) {
    return (
      <section className={cn('py-16 text-center', className)}>
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Нема објава у категорији "{category?.name}"
          </h3>
          <p className="text-gray-600 dark:text-gray-300">
            Објаве ће се приказати када буду додане у ову категорију.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className={cn('py-16', className)}>
      <div className="space-y-8">
        {/* Section Header */}
        <div className="text-center space-y-4">
          {data.title && (
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              {data.title}
            </h2>
          )}
          
          {data.description && (
            <p className="text-lg text-gray-700 dark:text-gray-200 max-w-3xl mx-auto">
              {data.description}
            </p>
          )}

          {category && (
            <div className="flex items-center justify-center space-x-2">
              <Badge className="bg-primary/10 text-primary border-primary/20">
                {category.name}
              </Badge>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {posts.length} {posts.length === 1 ? 'објава' : 'објава'}
              </span>
            </div>
          )}
        </div>

        {/* Carousel Container */}
        <div className="relative">
          {/* Navigation Buttons */}
          {posts.length > slidesPerView && (
            <>
              <Button
                variant="outline"
                size="icon"
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 bg-white/80 backdrop-blur-sm hover:bg-white shadow-lg"
                onClick={prevSlide}
                disabled={currentIndex === 0}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <Button
                variant="outline"
                size="icon"
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 bg-white/80 backdrop-blur-sm hover:bg-white shadow-lg"
                onClick={nextSlide}
                disabled={currentIndex + slidesPerView >= posts.length}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </>
          )}

          {/* Posts Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {visiblePosts.map((post, index) => (
              <Card key={post.id} className="group hover:shadow-lg transition-all duration-300 overflow-hidden">
                {/* Featured Image */}
                {post.featuredImage && (
                  <div className="aspect-video overflow-hidden">
                    <img
                      src={mediaApi.getFileUrl(post.featuredImage)}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}

                <CardContent className="p-6">
                  {/* Category Badge */}
                  {post.category && (
                    <Badge variant="secondary" className="mb-3 text-xs">
                      {post.category.name}
                    </Badge>
                  )}

                  {/* Title */}
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                    <Link href={`/objave/${post.slug}`}>
                      {post.title}
                    </Link>
                  </h3>

                  {/* Excerpt */}
                  {post.excerpt && (
                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">
                      {post.excerpt}
                    </p>
                  )}

                  {/* Meta Information */}
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-4">
                    <div className="flex items-center space-x-4">
                      <span className="flex items-center">
                        <Calendar className="mr-1 h-3 w-3" />
                        {getTimeAgo(post.publishedAt || post.createdAt)}
                      </span>
                      <span className="flex items-center">
                        <Eye className="mr-1 h-3 w-3" />
                        {post.viewCount}
                      </span>
                    </div>
                    {post.author && (
                      <span className="flex items-center">
                        <User className="mr-1 h-3 w-3" />
                        {post.author.name}
                      </span>
                    )}
                  </div>

                  {/* Read More Link */}
                  <Link 
                    href={`/objave/${post.slug}`}
                    className="inline-flex items-center text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                  >
                    Прочитај више
                    <ArrowRight className="ml-1 h-3 w-3" />
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Indicators */}
          {posts.length > slidesPerView && (
            <div className="flex justify-center mt-6 space-x-2">
              {Array.from({ 
                length: Math.ceil(posts.length / slidesPerView) 
              }).map((_, index) => (
                <button
                  key={index}
                  className={cn(
                    "w-2 h-2 rounded-full transition-colors",
                    Math.floor(currentIndex / slidesPerView) === index
                      ? "bg-primary"
                      : "bg-gray-300"
                  )}
                  onClick={() => setCurrentIndex(index * slidesPerView)}
                />
              ))}
            </div>
          )}
        </div>

        {/* View All Button */}
        {data.showViewAll && category && (
          <div className="text-center">
            <Button variant="outline" asChild>
              <Link href={`/kategorije/${category.slug}`}>
                Погледај све у категорији "{category.name}"
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}