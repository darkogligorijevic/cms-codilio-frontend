// app/objave/[slug]/page.tsx
'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Calendar,
  Eye,
  User,
  ArrowLeft,
  Share2,
  FileText,
  Building,
  ChevronRight
} from 'lucide-react';
import Link from 'next/link';
import { postsApi, mediaApi } from '@/lib/api';
import type { Post } from '@/lib/types';

interface SinglePostProps {
  params: Promise<{ slug: string }>;
}

export default function SinglePostPage({ params }: SinglePostProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [post, setPost] = useState<Post | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPost();
  }, [resolvedParams.slug]);

  const fetchPost = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Fetch the post by slug
      const postData = await postsApi.getBySlug(resolvedParams.slug);
      setPost(postData);

      // Fetch related posts from the same category
      if (postData.categoryId) {
        const postsResponse = await postsApi.getPublished(1, 4);
        const related = postsResponse.posts
          .filter(p => p.categoryId === postData.categoryId && p.id !== postData.id)
          .slice(0, 3);
        setRelatedPosts(related);
      }
    } catch (error) {
      console.error('Error fetching post:', error);
      setError('Objava nije pronađena');
    } finally {
      setIsLoading(false);
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
      alert('Link je kopiran u clipboard');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <Link href="/" className="flex items-center space-x-3">
                <Building className="h-8 w-8 text-blue-600" />
                <span className="text-lg font-bold text-gray-900">Opština Mladenovac</span>
              </Link>
              <Button variant="outline" size="sm" asChild>
                <Link href="/">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Nazad na početnu
                </Link>
              </Button>
            </div>
          </div>
        </header>

        {/* Loading Content */}
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <Link href="/" className="flex items-center space-x-3">
                <Building className="h-8 w-8 text-blue-600" />
                <span className="text-lg font-bold text-gray-900">Opština Mladenovac</span>
              </Link>
              <Button variant="outline" size="sm" asChild>
                <Link href="/">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Nazad na početnu
                </Link>
              </Button>
            </div>
          </div>
        </header>

        {/* Error Content */}
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Objava nije pronađena</h1>
            <p className="text-gray-600 mb-6">
              Objava koju tražite ne postoji ili je uklonjena.
            </p>
            <Button asChild>
              <Link href="/objave">
                Pogledaj sve objave
              </Link>
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center space-x-3">
              <Building className="h-8 w-8 text-blue-600" />
              <span className="text-lg font-bold text-gray-900">Opština Mladenovac</span>
            </Link>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm" onClick={sharePost}>
                <Share2 className="mr-2 h-4 w-4" />
                Podeli
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link href="/">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Nazad na početnu
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex items-center space-x-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-blue-600">Početna</Link>
            <ChevronRight className="h-4 w-4" />
            <Link href="/objave" className="hover:text-blue-600">Objave</Link>
            <ChevronRight className="h-4 w-4" />
            {post.category && (
              <>
                <Link href={`/kategorije/${post.category.slug}`} className="hover:text-blue-600">
                  {post.category.name}
                </Link>
                <ChevronRight className="h-4 w-4" />
              </>
            )}
            <span className="text-gray-900">{post.title}</span>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <article>
          {/* Post Header */}
          <header className="mb-8">
            {post.category && (
              <Badge variant="secondary" className="mb-4">
                {post.category.name}
              </Badge>
            )}
            
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              {post.title}
            </h1>
            
            {post.excerpt && (
              <p className="text-lg text-gray-600 mb-6">
                {post.excerpt}
              </p>
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
                <span>{post.viewCount} pregleda</span>
              </div>
            </div>
          </header>

          {/* Post Content */}
          <div 
            className="prose prose-lg max-w-none mb-12"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* Share Section */}
          <div className="bg-gray-100 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-semibold mb-4">Podelite ovu objavu</h3>
            <div className="flex items-center space-x-4">
              <Button onClick={sharePost} size="sm">
                <Share2 className="mr-2 h-4 w-4" />
                Podeli
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  alert('Link je kopiran u clipboard');
                }}
              >
                Kopiraj link
              </Button>
            </div>
          </div>
        </article>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <section className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Povezane objave</h2>
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
                      <Badge variant="secondary" className="mb-2">
                        {relatedPost.category.name}
                      </Badge>
                    )}
                    
                    <h3 className="font-semibold text-gray-900 mb-2 hover:text-blue-600">
                      <Link href={`/objave/${relatedPost.slug}`}>
                        {relatedPost.title}
                      </Link>
                    </h3>
                    
                    {relatedPost.excerpt && (
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
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
              Nazad na sve objave
            </Link>
          </Button>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm text-gray-400">
            © 2024 Opština Mladenovac. Sva prava zadržana.
          </p>
        </div>
      </footer>
    </div>
  );
}