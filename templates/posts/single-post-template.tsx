// templates/posts/single-post-template.tsx - Enhanced version with sidebar and hero section
'use client';

import { useEffect, useRef, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Calendar,
  Eye,
  User,
  ArrowLeft,
  Share2,
  FileText,
  ChevronRight,
  Clock,
  TrendingUp
} from 'lucide-react';
import Link from 'next/link';
import { postsApi, mediaApi } from '@/lib/api';
import type { Post } from '@/lib/types';
import { useTheme } from 'next-themes';
import { useThemeColors } from '@/lib/theme-hooks';

interface SinglePostTemplateProps {
  post: Post;
  institutionData: any;
  settings?: any;
}

export function SinglePostTemplate({ post, institutionData, settings }: SinglePostTemplateProps) {
  const [recentPosts, setRecentPosts] = useState<Post[]>([]);
  const [relatedPosts, setRelatedPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { theme } = useTheme();
  const themeColors = useThemeColors();
  const hasIncrementedRef = useRef<string | null>(null);

  useEffect(() => {
    if (post.slug && hasIncrementedRef.current !== post.slug) {
      fetchSidebarPosts();
      incrementViewCount();
      hasIncrementedRef.current = post.slug;
    }
  }, [post.slug]);

  const fetchSidebarPosts = async () => {
    try {
      setIsLoading(true);
      
      // Fetch recent posts for sidebar
      const recentPostsResponse = await postsApi.getPublished(1, 6);
      const recent = recentPostsResponse.posts
        .filter(p => p.id !== post.id)
        .slice(0, 5);
      setRecentPosts(recent);

      // Fetch related posts from the same category
      if (post.categoryId) {
        const related = recentPostsResponse.posts
          .filter(p => p.categoryId === post.categoryId && p.id !== post.id)
          .slice(0, 3);
        setRelatedPosts(related);
      }
    } catch (error) {
      console.error('Error fetching sidebar posts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const incrementViewCount = async () => {
    try {
      await postsApi.incrementView(post.slug);
    } catch (error) {
      console.error('Грешка приликом повећања прегледа', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('sr-RS', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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

  const sharePost = () => {
    if (navigator.share && post) {
      navigator.share({
        title: post.title,
        text: post.excerpt || post.title,
        url: window.location.href,
      });
    } else {
      // Fallback to copying URL
      navigator.clipboard.writeText(window.location.href);
      alert('Линк је копиран у clipboard');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <div 
        className="py-16 lg:py-24 text-white relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${themeColors.primary} 0%, ${themeColors.secondary} 100%)`
        }}
      >
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl">
            {/* Breadcrumb */}
            <nav className="flex items-center space-x-2 text-sm text-blue-100 mb-6">
              <Link href="/" className="hover:text-white transition-colors">Почетна</Link>
              <ChevronRight className="h-4 w-4" />
              <Link href="/objave" className="hover:text-white transition-colors">Објаве</Link>
              <ChevronRight className="h-4 w-4" />
              {post.category && (
                <>
                  <Link href={`/kategorije/${post.category.slug}`} className="hover:text-white transition-colors">
                    {post.category.name}
                  </Link>
                  <ChevronRight className="h-4 w-4" />
                </>
              )}
              <span className="text-white">{post.title}</span>
            </nav>

            {/* Category Badge */}
            {post.category && (
              <Badge variant="secondary" className="mb-4 bg-white/20 text-white border-white/30">
                {post.category.name}
              </Badge>
            )}

            {/* Title */}
            <h1 className="text-3xl lg:text-5xl font-bold mb-6 leading-tight">
              {post.title}
            </h1>

            {/* Excerpt */}
            {post.excerpt && (
              <div 
                className="text-lg lg:text-xl text-blue-100 mb-8 leading-relaxed max-w-3xl"
                dangerouslySetInnerHTML={{ __html: post.excerpt }}
              />
            )}

            {/* Meta Information */}
            <div className="flex flex-wrap items-center gap-6 text-blue-200">
              <div className="flex items-center">
                <User className="mr-2 h-5 w-5" />
                <span className="font-medium">{post.author.name}</span>
              </div>
              <div className="flex items-center">
                <Calendar className="mr-2 h-5 w-5" />
                <span>{formatDate(post.publishedAt || post.createdAt)}</span>
              </div>
              <div className="flex items-center">
                <Eye className="mr-2 h-5 w-5" />
                <span>{post.viewCount + 1} прегледa</span>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={sharePost}
                className="bg-white/10 border-white/30 text-white hover:bg-white/20"
              >
                <Share2 className="mr-2 h-4 w-4" />
                Подели
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content Column */}
          <div className="lg:col-span-2">
            <article className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
              {/* Featured Image */}
              {post.featuredImage && (
                <div className="aspect-video overflow-hidden">
                  <img
                    src={mediaApi.getFileUrl(post.featuredImage)}
                    alt={post.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Content */}
              <div className="p-8 lg:p-12">
                <div
                  className="[&>p]:mb-6 [&>h2]:mt-10 [&>h2]:mb-4 [&>ul]:ml-5 [&>ul]:list-disc dark:[&>code]:bg-muted prose-dynamic [&>h1]:my-6 [&>h2]:my-5 [&>h3]:my-"
                  dangerouslySetInnerHTML={{ __html: post.content }}
                />


                {/* Share Section */}
                <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Поделите ову објаву</h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">
                        Помозите другима да виде ову информацију
                      </p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Button onClick={sharePost} size="sm" className="bg-primary-dynamic hover:bg-primary-dynamic/90">
                        <Share2 className="mr-2 h-4 w-4" />
                        Подели
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          navigator.clipboard.writeText(window.location.href);
                          alert('Линк је копиран у clipboard');
                        }}
                      >
                        Копирај линк
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </article>

            {/* Related Posts */}
            {relatedPosts.length > 0 && (
              <section className="mt-12">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  Повезане објаве из категорије "{post.category?.name}"
                </h2>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {relatedPosts.map((relatedPost) => (
                    <Card key={relatedPost.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        {relatedPost.featuredImage && (
                          <img
                            src={mediaApi.getFileUrl(relatedPost.featuredImage)}
                            alt={relatedPost.title}
                            className="w-full h-32 object-cover rounded-lg mb-4"
                          />
                        )}

                        <h3 className="font-semibold text-gray-900 dark:text-gray-200 mb-2 hover:text-primary-dynamic">
                          <Link href={`/objave/${relatedPost.slug}`}>
                            {relatedPost.title}
                          </Link>
                        </h3>

                        {relatedPost.excerpt && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                            {relatedPost.excerpt}
                          </p>
                        )}

                        <div className="flex items-center text-xs text-gray-500">
                          <Calendar className="mr-1 h-3 w-3" />
                          <span>{getTimeAgo(relatedPost.publishedAt || relatedPost.createdAt)}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-8">
              {/* Recent Posts */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2 mb-6">
                    <div className="p-2 bg-primary-dynamic/10 rounded-lg">
                      <TrendingUp className="h-5 w-5 text-primary-dynamic" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Последње објаве
                    </h3>
                  </div>

                  {isLoading ? (
                    <div className="space-y-4">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="animate-pulse">
                          <div className="flex space-x-3">
                            <div className="h-16 w-16 bg-gray-200 rounded-lg"></div>
                            <div className="flex-1 space-y-2">
                              <div className="h-4 bg-gray-200 rounded w-full"></div>
                              <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {recentPosts.map((recentPost) => (
                        <div key={recentPost.id} className="group">
                          <Link href={`/objave/${recentPost.slug}`} className="flex space-x-3 hover:bg-gray-50 dark:hover:bg-gray-700 p-2 -m-2 rounded-lg transition-colors">
                            {recentPost.featuredImage ? (
                              <img
                                src={mediaApi.getFileUrl(recentPost.featuredImage)}
                                alt={recentPost.title}
                                className="h-16 w-16 object-cover rounded-lg"
                              />
                            ) : (
                              <div className="h-16 w-16 bg-gray-200 dark:bg-gray-600 rounded-lg flex items-center justify-center">
                                <FileText className="h-6 w-6 text-gray-400" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-gray-900 dark:text-white group-hover:text-primary-dynamic line-clamp-2 text-sm leading-5">
                                {recentPost.title}
                              </h4>
                              <div className="flex items-center text-xs text-gray-500 mt-2">
                                <Clock className="mr-1 h-3 w-3" />
                                <span>{getTimeAgo(recentPost.publishedAt || recentPost.createdAt)}</span>
                              </div>
                            </div>
                          </Link>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <Button variant="outline" className="w-full" asChild>
                      <Link href="/objave">
                        <FileText className="mr-2 h-4 w-4" />
                        Све објаве
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Categories */}
              {post.category && (
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Категорија
                    </h3>
                    <Button variant="outline" className="w-full justify-start" asChild>
                      <Link href={`/kategorije/${post.category.slug}`}>
                        <Badge variant="secondary" className="mr-2 badge-primary-dynamic">
                          {post.category.name}
                        </Badge>
                        Више из ове категорије
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Navigation */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Навигација
                  </h3>
                  <div className="space-y-3">
                    <Button variant="outline" className="w-full justify-start" asChild>
                      <Link href="/objave">
                        <FileText className="mr-2 h-4 w-4" />
                        Све објаве
                      </Link>
                    </Button>
                    <Button variant="outline" className="w-full justify-start" asChild>
                      <Link href="/kategorije">
                        <TrendingUp className="mr-2 h-4 w-4" />
                        Категорије
                      </Link>
                    </Button>
                    <Button variant="outline" className="w-full justify-start" asChild>
                      <Link href="/">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Почетна страна
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}