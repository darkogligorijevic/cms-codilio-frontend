// templates/categories/category-archive-template.tsx - Enhanced version with hero section
'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
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
import { mediaApi } from '@/lib/api';
import type { Category, Post } from '@/lib/types';
import { useThemeColors } from '@/lib/theme-hooks';

interface CategoryArchiveTemplateProps {
  category: Category;
  institutionData: any;
  settings?: any;
}

export function CategoryArchiveTemplate({ 
  category, 
  institutionData, 
  settings 
}: CategoryArchiveTemplateProps) {
  const themeColors = useThemeColors();
  const [posts, setPosts] = useState<Post[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 9;

  useEffect(() => {
    if (category?.posts) {
      const publishedPosts = category.posts.filter(post => post.status === "published");
      setPosts(publishedPosts);
      setFilteredPosts(publishedPosts);
    }
  }, [category]);

  useEffect(() => {
    // Apply search filter
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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search is handled by useEffect
  };

  // Pagination logic
  const totalPages = Math.ceil((filteredPosts?.length || 0) / postsPerPage);
  const startIndex = (currentPage - 1) * postsPerPage;
  const paginatedPosts = filteredPosts?.slice(startIndex, startIndex + postsPerPage) || [];

  const getCategoryIcon = (categoryName?: string) => {
    if (!categoryName) return <Tag className="h-8 w-8" />;
    
    const name = categoryName.toLowerCase();
    if (name.includes('обав') || name.includes('вест') || name.includes('инф') || 
        name.includes('obav') || name.includes('vest') || name.includes('inf')) {
      return <FileText className="h-8 w-8" />;
    }
    if (name.includes('промет') || name.includes('саобраћај') || name.includes('инфраструктур') ||
        name.includes('promet') || name.includes('saobraćaj') || name.includes('infrastruktur')) {
      return <Building className="h-8 w-8" />;
    }
    if (name.includes('спорт') || name.includes('култура') || name.includes('догађај') ||
        name.includes('sport') || name.includes('kultura') || name.includes('događaj')) {
      return <Calendar className="h-8 w-8" />;
    }
    return <Tag className="h-8 w-8" />;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Category Header */}
      <div 
        className="text-white py-16 lg:py-24 relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${themeColors.primary} 0%, ${themeColors.secondary} 100%)`
        }}
      >
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="bg-white/20 p-4 rounded-lg">
                {getCategoryIcon(category?.name)}
              </div>
              <div>
                <h1 className="text-3xl lg:text-5xl font-bold mb-4">{category?.name || 'Категорија'}</h1>
                {category?.description && (
                  <p className="text-lg lg:text-xl text-blue-100 mb-4 max-w-2xl">{category.description}</p>
                )}
                <div className="flex items-center space-x-6 text-blue-200">
                  <Badge variant="secondary" className="bg-white/20 text-white border-white/30 dark:border-none">
                    <Hash className="mr-1 h-4 w-4" />
                    {category?.slug || ''}
                  </Badge>
                  <span className="flex items-center">
                    <FileText className="mr-2 h-5 w-5" />
                    {filteredPosts?.length || 0} објав{(filteredPosts?.length || 0) === 1 ? 'а' : 'а'}
                  </span>
                  {category?.createdAt && (
                    <span className="flex items-center">
                      <Calendar className="mr-2 h-5 w-5" />
                      Креирана {formatDate(category.createdAt)}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <Button variant="outline" className="bg-white/10 border-white/30 text-white hover:bg-white/20 dark:border-none" asChild>
              <Link href="/kategorije">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Све категорије
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <form onSubmit={handleSearch} className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400 dark:text-gray-200" />
                <Input
                  placeholder="Претражи објаве у овој категорији..."
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
                  Очисти претрагу
                </Button>
              )}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {searchTerm ? (
                <>Пронађено {paginatedPosts?.length || 0} резултата за "{searchTerm}"</>
              ) : (
                <>Приказује се {paginatedPosts?.length || 0} објав{(paginatedPosts?.length || 0) === 1 ? 'а' : 'а'}</>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {paginatedPosts && paginatedPosts.length > 0 ? (
          <>
            {/* Posts Grid */}
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {paginatedPosts.map((post) => (
                <Card key={post.id} className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden">
                  {/* Featured Image */}
                  {post.featuredImage && (
                    <div className="aspect-video overflow-hidden">
                      <img
                        src={mediaApi.getFileUrl(post.featuredImage)}
                        alt={post.title}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  
                  <CardContent className="p-6">
                    {/* Title */}
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-200 mb-3 hover:text-primary-dynamic">
                      <Link href={`/objave/${post.slug}`}>
                        {post.title || 'Наслов објаве'}
                      </Link>
                    </h3>

                    {/* Excerpt */}
                    {post.excerpt && (
                      <div 
                        className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3"
                        dangerouslySetInnerHTML={{ __html: post.excerpt }}
                      />
                    )}

                    {/* Meta Information */}
                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                      <div className="flex items-center space-x-3">
                        <span className="flex items-center">
                          <User className="mr-1 h-3 w-3" />
                          {post.author?.name || 'Непознат аутор'}
                        </span>
                        <span className="flex items-center">
                          <Eye className="mr-1 h-3 w-3" />
                          {post.viewCount || 0}
                        </span>
                      </div>
                      <span className="flex items-center">
                        <Calendar className="mr-1 h-3 w-3" />
                        {post.publishedAt || post.createdAt ? getTimeAgo(post.publishedAt || post.createdAt) : 'Непознат датум'}
                      </span>
                    </div>

                    {/* Read More Button */}
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <Button variant="outline" size="sm" className="w-full hover:bg-primary-dynamic hover:text-white transition-colors" asChild>
                        <Link href={`/objave/${post.slug}`}>
                          Прочитај више
                        </Link>
                      </Button>
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
                  Претходна
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
                  Следећа
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            )}
          </>
        ) : (
          /* No Posts Found */
          <div className="text-center py-16">
            <FileText className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {searchTerm ? 'Нема резултата' : 'Нема објава у овој категорији'}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {searchTerm 
                ? `Нема објава које одговарају претрази "${searchTerm}" у категорији "${category?.name || 'ова категорија'}".`
                : `У категорији "${category?.name || 'ова категорија'}" тренутно нема објављених објава.`
              }
            </p>
            <div className="space-x-4">
              {searchTerm && (
                <Button variant="primary" onClick={() => setSearchTerm('')}>
                  Прикажи све објаве из категорије
                </Button>
              )}
              <Button variant="outline" asChild>
                <Link href="/objave">Све објаве</Link>
              </Button>
            </div>
          </div>
        )}

        {/* Category Stats */}
        {filteredPosts && filteredPosts.length > 0 && (
          <div className="mt-16">
            <Card>
              <CardContent className="p-8">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Статистике категорије</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary-dynamic">{posts?.length || 0}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Укупно објава</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-secondary-dynamic">
                      {posts?.reduce((sum, post) => sum + (post?.viewCount || 0), 0).toLocaleString() || '0'}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Укупно прегледа</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600">
                      {posts && posts.length > 0 ? Math.round(posts.reduce((sum, post) => sum + (post?.viewCount || 0), 0) / posts.length) : 0}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Просек прегледа</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-orange-600">
                      {posts && posts.length > 0 ? getTimeAgo(posts.sort((a, b) => 
                        new Date(b?.publishedAt || b?.createdAt || 0).getTime() - 
                        new Date(a?.publishedAt || a?.createdAt || 0).getTime()
                      )[0]?.publishedAt || posts[0]?.createdAt || '') : 'N/A'}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Последња објава</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Related Categories */}
        <div className="mt-16">
          <Card>
            <CardContent className="p-8">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Можда вас занима</h3>
              <div className="flex flex-wrap gap-3">
                <Button variant="outline" asChild className='hover:bg-primary-dynamic hover:text-white duration-200 ease-in-out'>
                  <Link href="/kategorije">
                    <Tag className="mr-2 h-4 w-4" />
                    Све категорије
                  </Link>
                </Button>
                <Button variant="outline" asChild className='hover:bg-primary-dynamic hover:text-white duration-200 ease-in-out'>
                  <Link href="/objave">
                    <FileText className="mr-2 h-4 w-4" />
                    Све објаве
                  </Link>
                </Button>
                <Button variant="outline" asChild className='hover:bg-primary-dynamic hover:text-white duration-200 ease-in-out'>
                  <Link href="/">
                    <TrendingUp className="mr-2 h-4 w-4" />
                    Најновије објаве
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}