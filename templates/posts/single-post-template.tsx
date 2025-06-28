// templates/posts/single-post-template.tsx
'use client';

import { useEffect, useState } from 'react';
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
  ChevronRight
} from 'lucide-react';
import Link from 'next/link';
import { postsApi, mediaApi } from '@/lib/api';
import type { Post } from '@/lib/types';
import { useTheme } from 'next-themes';

interface SinglePostTemplateProps {
  post: Post;
  institutionData: any;
  settings?: any;
}

export function SinglePostTemplate({ post, institutionData, settings }: SinglePostTemplateProps) {
  const [relatedPosts, setRelatedPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { theme } = useTheme();

  useEffect(() => {
    fetchRelatedPosts();
    incrementViewCount();
  }, [post.slug]);

  const fetchRelatedPosts = async () => {
    try {
      setIsLoading(true);
      
      // Fetch related posts from the same category
      if (post.categoryId) {
        const postsResponse = await postsApi.getPublished(1, 4);
        const related = postsResponse.posts
          .filter(p => p.categoryId === post.categoryId && p.id !== post.id)
          .slice(0, 3);
        setRelatedPosts(related);
      }
    } catch (error) {
      console.error('Error fetching related posts:', error);
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
    <div className="space-y-8">
      {/* Breadcrumb */}
      <div className="bg-white border-b dark:bg-gray-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
            <Link href="/" className="hover:text-primary-dynamic">Почетна</Link>
            <ChevronRight className="h-4 w-4" />
            <Link href="/objave" className="hover:text-primary-dynamic">Објаве</Link>
            <ChevronRight className="h-4 w-4" />
            {post.category && (
              <>
                <Link href={`/kategorije/${post.category.slug}`} className="hover:text-primary-dynamic">
                  {post.category.name}
                </Link>
                <ChevronRight className="h-4 w-4" />
              </>
            )}
            <span className="text-gray-900 dark:text-white">{post.title}</span>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <article>
          {/* Post Header */}
          <div className="mb-8">
            {post.category && (
              <Badge variant="secondary" className="mb-4 badge-primary-dynamic">
                {post.category.name}
              </Badge>
            )}

            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {post.title}
            </h1>

            {post.excerpt && (
              <div
                className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3 prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: post.excerpt }}
              />
            )}

            {/* Featured Image */}
            {post.featuredImage && (
              <div className="mb-6">
                <img
                  src={mediaApi.getFileUrl(post.featuredImage)}
                  alt={post.title}
                  className="w-full h-64 lg:h-96 object-cover rounded-lg"
                />
              </div>
            )}

            {/* Meta Information */}
            <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500 py-4 border-t border-b">
              <div className="flex items-center">
                <User className="mr-2 h-4 w-4" />
                <span>{post.author.name}</span>
              </div>
              <div className="flex items-center">
                <Calendar className="mr-2 h-4 w-4" />
                <span>{formatDate(post.publishedAt || post.createdAt)}</span>
              </div>
              <div className="flex items-center">
                <Eye className="mr-2 h-4 w-4" />
                {/* +1 када se udje da ga odma racuna */}
                <span>{post.viewCount + 1} прегледa</span> 
              </div>
            </div>
          </div>

          {/* Post Content */}
          <div
            className="prose prose-lg prose-gray max-w-none mb-12 dark:text-black"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* Share Section */}
          <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-semibold mb-4">Поделите ову објаву</h3>
            <div className="flex items-center space-x-4">
              <Button variant="primary" onClick={sharePost} size="sm">
                <Share2 className="mr-2 h-4 w-4" />
                Подели
              </Button>
              <Button
                variant={theme === "light" ? "outline" : "default"}
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
        </article>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <section className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Повезане објаве</h2>
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

                    {relatedPost.category && (
                      <Badge variant="secondary" className="mb-2 badge-primary-dynamic">
                        {relatedPost.category.name}
                      </Badge>
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
                      <span>{formatDate(relatedPost.publishedAt || relatedPost.createdAt)}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Back to Posts */}
        <div className="mt-12 text-center">
          <Button variant="outline" asChild>
            <Link href="/objave">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Назад на све објаве
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}