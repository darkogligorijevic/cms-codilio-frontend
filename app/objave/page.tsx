// app/objave/page.tsx
'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Calendar,
  Eye,
  Search,
  Filter,
  Building,
  ChevronLeft,
  ChevronRight,
  FileText,
  User
} from 'lucide-react';
import Link from 'next/link';
import { postsApi, categoriesApi, mediaApi } from '@/lib/api';
import type { Post, Category } from '@/lib/types';

// Separatna komponenta koja koristi useSearchParams
function PostsContent() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get('category');
  
  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPosts, setTotalPosts] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>(categoryParam || '');
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);

  const postsPerPage = 12;

  useEffect(() => {
    fetchData();
  }, [currentPage]);

  useEffect(() => {
    // Apply client-side filtering when search term or category changes
    applyFilters();
  }, [posts, searchTerm, selectedCategory]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      
      const [postsResponse, categoriesResponse] = await Promise.all([
        postsApi.getPublished(currentPage, postsPerPage),
        categoriesApi.getAll()
      ]);

      setPosts(postsResponse.posts);
      setTotalPages(Math.ceil(postsResponse.total / postsPerPage));
      setTotalPosts(postsResponse.total);
      setCategories(categoriesResponse);
    } catch (error) {
      console.error('Error fetching data:', error);
      setPosts([]);
      setCategories([]);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...posts];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(post => 
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.excerpt?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.content.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter(post => 
        post.categoryId === parseInt(selectedCategory)
      );
    }

    setFilteredPosts(filtered);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilters();
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
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

  const selectedCategoryName = categories.find(cat => cat.id === parseInt(selectedCategory))?.name;
  const displayPosts = searchTerm || selectedCategory ? filteredPosts : posts;

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
            <nav className="flex items-center space-x-6">
              <Link href="/" className="text-gray-700 hover:text-blue-600 transition-colors">
                Početna
              </Link>
              <Link href="/dokumenti" className="text-gray-700 hover:text-blue-600 transition-colors">
                Dokumenti
              </Link>
              <Link href="/kontakt" className="text-gray-700 hover:text-blue-600 transition-colors">
                Kontakt
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Page Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {selectedCategoryName ? `Objave iz kategorije: ${selectedCategoryName}` : 'Sve objave'}
              </h1>
              <p className="text-gray-600 mt-2">
                {totalPosts > 0 ? `Ukupno ${totalPosts} objava` : 'Nema objava za prikaz'}
              </p>
            </div>
            <Button variant="outline" asChild>
              <Link href="/">
                Nazad na početnu
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
            {/* Search */}
            <form onSubmit={handleSearch} className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Pretraži objave..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </form>

            {/* Category Filter */}
            <div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">Sve kategorije</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id.toString()}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Clear Filters */}
            {(searchTerm || selectedCategory) && (
              <div className="flex items-center">
                <Button variant="outline" onClick={clearFilters} size="sm">
                  <Filter className="mr-2 h-4 w-4" />
                  Očisti filtere
                </Button>
              </div>
            )}
          </div>

          {/* Active Filters Display */}
          {(searchTerm || selectedCategory) && (
            <div className="mt-4 flex flex-wrap gap-2">
              {searchTerm && (
                <Badge variant="secondary">
                  Pretraga: "{searchTerm}"
                </Badge>
              )}
              {selectedCategoryName && (
                <Badge variant="secondary">
                  Kategorija: {selectedCategoryName}
                </Badge>
              )}
              <span className="text-sm text-gray-500">
                Pronađeno {displayPosts.length} rezultata
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="h-48 bg-gray-200 rounded-t-lg"></div>
                <CardContent className="p-6">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-full mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : displayPosts.length > 0 ? (
          <>
            {/* Posts Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {displayPosts.map((post) => (
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
                    {/* Category Badge */}
                    {post.category && (
                      <Badge variant="secondary" className="mb-3">
                        {post.category.name}
                      </Badge>
                    )}

                    {/* Title */}
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 hover:text-blue-600">
                      <Link href={`/objave/${post.slug}`}>
                        {post.title}
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
                          {post.author.name}
                        </span>
                        <span className="flex items-center">
                          <Eye className="mr-1 h-3 w-3" />
                          {post.viewCount}
                        </span>
                      </div>
                      <span className="flex items-center">
                        <Calendar className="mr-1 h-3 w-3" />
                        {getTimeAgo(post.publishedAt || post.createdAt)}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && !searchTerm && !selectedCategory && (
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
                        variant={currentPage === pageNum ? "default" : "outline"}
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
              {searchTerm || selectedCategory ? 'Nema rezultata' : 'Nema objava'}
            </h2>
            <p className="text-gray-600 mb-6">
              {searchTerm || selectedCategory 
                ? 'Pokušajte sa drugačijim kriterijumima pretrage.'
                : 'Trenutno nema objavljenih objava.'
              }
            </p>
            {(searchTerm || selectedCategory) && (
              <Button onClick={clearFilters}>
                Prikaži sve objave
              </Button>
            )}
          </div>
        )}
      </main>

      {/* Sidebar with Categories */}
      {categories.length > 0 && (
        <aside className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
          <Card>
            <CardHeader>
              <CardTitle>Kategorije objava</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <Badge
                  variant={selectedCategory === '' ? 'default' : 'outline'}
                  className="cursor-pointer hover:bg-blue-50"
                  onClick={() => setSelectedCategory('')}
                >
                  Sve ({totalPosts})
                </Badge>
                {categories.map((category) => (
                  <Badge
                    key={category.id}
                    variant={selectedCategory === category.id.toString() ? 'default' : 'outline'}
                    className="cursor-pointer hover:bg-blue-50"
                    onClick={() => setSelectedCategory(category.id.toString())}
                  >
                    {category.name}
                    {category.posts && (
                      <span className="ml-1">({category.posts.length})</span>
                    )}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </aside>
      )}

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

// Loading komponenta
function PostsLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <Building className="h-8 w-8 text-blue-600" />
              <span className="text-lg font-bold text-gray-900">Opština Mladenovac</span>
            </div>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
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

// Glavna komponenta
export default function PostsListingPage() {
  return (
    <Suspense fallback={<PostsLoading />}>
      <PostsContent />
    </Suspense>
  );
}