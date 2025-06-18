// app/kategorije/[slug]/page.tsx - Ažurirano za dinamičke dugmiće
'use client';

import { use, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Calendar,
  Eye,
  Search,
  Building,
  Tag,
  FileText,
  User,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Hash
} from 'lucide-react';
import Link from 'next/link';
import { categoriesApi, postsApi, mediaApi } from '@/lib/api';
import type { Category, Post } from '@/lib/types';

interface CategoryArchiveProps {
  params: Promise<{ slug: string }>;
}

export default function CategoryArchivePage({ params }: CategoryArchiveProps) {
  const resolvedParams = use(params);
  const [category, setCategory] = useState<Category | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 9;

  useEffect(() => {
    fetchCategoryData();
  }, [resolvedParams.slug]);

  useEffect(() => {
    // Apply search filter
    if (!posts || !Array.isArray(posts)) {
      setFilteredPosts([]);
      return;
    }

    if (searchTerm.trim()) {
      const filtered = posts.filter(post =>
        post?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post?.excerpt?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post?.content?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredPosts(filtered);
    } else {
      setFilteredPosts(posts);
    }
    setCurrentPage(1); // Reset to first page when searching
  }, [searchTerm, posts]);

  const fetchCategoryData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Fetch category by slug
      const categoryData = await categoriesApi.getBySlug(resolvedParams.slug);
      
      if (!categoryData) {
        setError('Kategorija nije pronađena');
        return;
      }
      
      setCategory(categoryData);

      // Fetch all posts from this category
      if (categoryData.posts && Array.isArray(categoryData.posts)) {
        // Posts are already included in category response with relations
        setPosts(categoryData.posts);
      } else {
        // Fallback: fetch posts separately and filter by category
        try {
          const postsResponse = await postsApi.getPublished(1, 100);
          const categoryPosts = postsResponse.posts.filter(post => 
            post.categoryId === categoryData.id
          );
          setPosts(categoryPosts);
        } catch (postsError) {
          console.error('Error fetching posts:', postsError);
          setPosts([]);
        }
      }
    } catch (error) {
      console.error('Error fetching category data:', error);
      setError('Kategorija nije pronađena');
      setCategory(null);
      setPosts([]);
    } finally {
      setIsLoading(false);
    }
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
    
    if (diffInHours < 24) return `pre ${diffInHours} sati`;
    if (diffInHours < 168) return `pre ${Math.floor(diffInHours / 24)} dana`;
    return formatDate(dateString);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search is handled by useEffect
  };

  // Pagination logic
  const totalPages = Math.ceil((filteredPosts?.length || 0) / postsPerPage);
  const startIndex = (currentPage - 1) * postsPerPage;
  const paginatedPosts = filteredPosts?.slice(startIndex, startIndex + postsPerPage).filter(post => post.status === "published") || [];

  const getCategoryIcon = (categoryName?: string) => {
    if (!categoryName) return <Tag className="h-8 w-8" />;
    
    const name = categoryName.toLowerCase();
    if (name.includes('obav') || name.includes('vest') || name.includes('inf')) {
      return <FileText className="h-8 w-8" />;
    }
    if (name.includes('promet') || name.includes('saobraćaj') || name.includes('infrastruktur')) {
      return <Building className="h-8 w-8" />;
    }
    if (name.includes('sport') || name.includes('kultura') || name.includes('događaj')) {
      return <Calendar className="h-8 w-8" />;
    }
    return <Tag className="h-8 w-8" />;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <Link href="/" className="flex items-center space-x-3">
                <Building className="h-8 w-8 text-primary-dynamic" />
                <span className="text-lg font-bold text-gray-900">Opština Mladenovac</span>
              </Link>
            </div>
          </div>
        </header>
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error || !category) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <Link href="/" className="flex items-center space-x-3">
                <Building className="h-8 w-8 text-primary-dynamic" />
                <span className="text-lg font-bold text-gray-900">Opština Mladenovac</span>
              </Link>
              <Button variant="outline" size="sm" asChild>
                <Link href="/kategorije">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Nazad na kategorije
                </Link>
              </Button>
            </div>
          </div>
        </header>
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <Tag className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Kategorija nije pronađena</h1>
            <p className="text-gray-600 mb-6">
              Kategorija koju tražite ne postoji ili je uklonjena.
            </p>
            <div className="space-x-4">
              <Button variant="primary" asChild>
                <Link href="/kategorije">Sve kategorije</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/objave">Sve objave</Link>
              </Button>
            </div>
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
              <Building className="h-8 w-8 text-primary-dynamic" />
              <span className="text-lg font-bold text-gray-900">Opština Mladenovac</span>
            </Link>
            <nav className="flex items-center space-x-6">
              <Link href="/" className="text-gray-700 hover:text-primary-dynamic transition-colors">
                Početna
              </Link>
              <Link href="/objave" className="text-gray-700 hover:text-primary-dynamic transition-colors">
                Objave
              </Link>
              <Link href="/kategorije" className="text-primary-dynamic font-medium">
                Kategorije
              </Link>
              <Link href="/kontakt" className="text-gray-700 hover:text-primary-dynamic transition-colors">
                Kontakt
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Category Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="bg-white/20 p-4 rounded-lg">
                {getCategoryIcon(category?.name)}
              </div>
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold mb-2">{category?.name || 'Kategorija'}</h1>
                {category?.description && (
                  <p className="text-lg text-blue-100 mb-2">{category.description}</p>
                )}
                <div className="flex items-center space-x-4 text-blue-200">
                  <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                    <Hash className="mr-1 h-3 w-3" />
                    {category?.slug || ''}
                  </Badge>
                  <span className="flex items-center">
                    <FileText className="mr-2 h-4 w-4" />
                    {filteredPosts?.length || 0} objav{(filteredPosts?.length || 0) === 1 ? 'a' : ((filteredPosts?.length || 0) % 10 >= 2 && (filteredPosts?.length || 0) % 10 <= 4 && ((filteredPosts?.length || 0) % 100 < 10 || (filteredPosts?.length || 0) % 100 >= 20) ? 'e' : 'a')}
                  </span>
                  {category?.createdAt && (
                    <span className="flex items-center">
                      <Calendar className="mr-2 h-4 w-4" />
                      Kreirana {formatDate(category.createdAt)}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <Button variant="outline" className="bg-white/10 border-white/30 text-white hover:bg-white/20" asChild>
              <Link href="/kategorije">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Sve kategorije
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <form onSubmit={handleSearch} className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Pretraži objave u ovoj kategoriji..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 w-80"
                />
              </form>
              {searchTerm && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSearchTerm('')}
                >
                  Očisti pretragu
                </Button>
              )}
            </div>
            <div className="text-sm text-gray-600">
              {searchTerm ? (
                <>Pronađeno {paginatedPosts?.length || 0} rezultata za "{searchTerm}"</>
              ) : (
                <>Prikazuje se {paginatedPosts?.length || 0} objav{(paginatedPosts?.length || 0) === 1 ? 'a' : 'a'}</>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {paginatedPosts && paginatedPosts.length > 0 ? (
          <>
            {/* Posts Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {paginatedPosts.map((post) => (
                <Card key={post.id} className="hover:shadow-lg transition-shadow overflow-hidden">
                  {/* Featured Image */}
                  {post.featuredImage && (
                    <div className="h-48 overflow-hidden">
                      <img
                        src={mediaApi.getFileUrl(post.featuredImage)}
                        alt={post.title}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  
                  <CardContent className="p-6">
                    {/* Title */}
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 hover:text-primary-dynamic">
                      <Link href={`/objave/${post.slug}`}>
                        {post.title || 'Naslov objave'}
                      </Link>
                    </h3>

                    {/* Excerpt */}
                    {post.excerpt && (
                      <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                        {post.excerpt}
                      </p>
                    )}

                    {/* Meta Information */}
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center space-x-3">
                        <span className="flex items-center">
                          <User className="mr-1 h-3 w-3" />
                          {post.author?.name || 'Nepoznat autor'}
                        </span>
                        <span className="flex items-center">
                          <Eye className="mr-1 h-3 w-3" />
                          {post.viewCount || 0}
                        </span>
                      </div>
                      <span className="flex items-center">
                        <Calendar className="mr-1 h-3 w-3" />
                        {post.publishedAt || post.createdAt ? getTimeAgo(post.publishedAt || post.createdAt) : 'Nepoznat datum'}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center mt-12 space-x-4">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="flex items-center"
                >
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Prethodna
                </Button>

                <div className="flex items-center space-x-2">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }

                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "primary" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(pageNum)}
                        className="w-10"
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>

                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="flex items-center"
                >
                  Sledeća
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            )}
          </>
        ) : (
          /* No Posts Found */
          <div className="text-center py-16">
            <FileText className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {searchTerm ? 'Nema rezultata' : 'Nema objava u ovoj kategoriji'}
            </h2>
            <p className="text-gray-600 mb-6">
              {searchTerm 
                ? `Nema objava koje odgovaraju pretrazi "${searchTerm}" u kategoriji "${category?.name || 'ova kategorija'}".`
                : `U kategoriji "${category?.name || 'ova kategorija'}" trenutno nema objavljenih objava.`
              }
            </p>
            <div className="space-x-4">
              {searchTerm && (
                <Button variant="primary" onClick={() => setSearchTerm('')}>
                  Prikaži sve objave iz kategorije
                </Button>
              )}
              <Button variant="outline" asChild>
                <Link href="/objave">Sve objave</Link>
              </Button>
            </div>
          </div>
        )}

        {/* Category Stats */}
        {filteredPosts && filteredPosts.length > 0 && (
          <div className="mt-16">
            <Card>
              <CardHeader>
                <CardTitle>Statistike kategorije</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary-dynamic">{posts?.length || 0}</div>
                    <div className="text-sm text-gray-600">Ukupno objava</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-secondary-dynamic">
                      {posts?.reduce((sum, post) => sum + (post?.viewCount || 0), 0).toLocaleString() || '0'}
                    </div>
                    <div className="text-sm text-gray-600">Ukupno pregleda</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {posts && posts.length > 0 ? Math.round(posts.reduce((sum, post) => sum + (post?.viewCount || 0), 0) / posts.length) : 0}
                    </div>
                    <div className="text-sm text-gray-600">Prosek pregleda</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {posts && posts.length > 0 ? getTimeAgo(posts.sort((a, b) => 
                        new Date(b?.publishedAt || b?.createdAt || 0).getTime() - 
                        new Date(a?.publishedAt || a?.createdAt || 0).getTime()
                      )[0]?.publishedAt || posts[0]?.createdAt || '') : 'N/A'}
                    </div>
                    <div className="text-sm text-gray-600">Poslednja objava</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Related Categories */}
        <div className="mt-16">
          <Card>
            <CardHeader>
              <CardTitle>Možda vas zanima</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" asChild>
                  <Link href="/kategorije">
                    <Tag className="mr-2 h-4 w-4" />
                    Sve kategorije
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/objave">
                    <FileText className="mr-2 h-4 w-4" />
                    Sve objave
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/">
                    <TrendingUp className="mr-2 h-4 w-4" />
                    Najnovije objave
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm text-gray-400">
            © 2025 Opština Mladenovac. Sva prava zadržana.
          </p>
        </div>
      </footer>
    </div>
  );
}