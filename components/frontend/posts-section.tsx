// Templates/Common/PostsSection.tsx
'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Eye, 
  Calendar, 
  ChevronRight,
  User
} from 'lucide-react';
import Link from 'next/link';
import { Post } from '@/lib/types';
import { mediaApi } from '@/lib/api';

interface PostsSectionProps {
  posts: Post[];
  title?: string;
}

export function PostsSection({ posts, title = "Објаве за ову страницу" }: PostsSectionProps) {
  // Don't render section if no posts
  if (!posts || posts.length === 0) {
    return null;
  }

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

  return (
    <div className="mt-12">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-600 mt-1">
            Приказује се {posts.length} објав{posts.length === 1 ? 'а' : 'а'}
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/objave">
            Све објаве
            <ChevronRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>

      <div className="space-y-6">
        {posts.map((post) => (
          <Card key={post.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    {post.category && (
                      <Badge variant="secondary">
                        {post.category.name}
                      </Badge>
                    )}
                    <span className="text-sm text-gray-500">
                      {getTimeAgo(post.publishedAt || post.createdAt)}
                    </span>
                  </div>
                  
                  <h4 className="text-lg font-semibold text-gray-900 mb-2 hover:text-blue-600">
                    <Link href={`/objave/${post.slug}`}>
                      {post.title}
                    </Link>
                  </h4>
                  
                  {post.excerpt && (
                    <div
                      className="text-gray-600 mb-3 text-sm lg:text-base prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: post.excerpt }}
                    />
                  )}
                  
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center">
                      <User className="mr-1 h-3 w-3" />
                      {post.author.name}
                    </span>
                    <span className="flex items-center">
                      <Eye className="mr-1 h-3 w-3" />
                      {post.viewCount}
                    </span>
                    <span className="flex items-center">
                      <Calendar className="mr-1 h-3 w-3" />
                      {formatDate(post.publishedAt || post.createdAt)}
                    </span>
                  </div>
                </div>
                
                {post.featuredImage && (
                  <div className="ml-4 flex-shrink-0 hidden sm:block">
                    <img
                      src={mediaApi.getFileUrl(post.featuredImage)}
                      alt={post.title}
                      className="w-24 h-16 object-cover rounded-lg"
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}