// app/kategorije/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Building,
  Tag,
  FileText,
  ChevronRight,
  Calendar,
  TrendingUp,
  Hash,
  Eye
} from 'lucide-react';
import Link from 'next/link';
import { categoriesApi } from '@/lib/api';
import type { Category } from '@/lib/types';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      const response = await categoriesApi.getAll();
      
      // Filtriramo kategorije koje imaju objavljene postove i sortiramo po broju objavljenih postova
      const categoriesWithPublishedPosts = response.filter(category => {
        const publishedPosts = category?.posts?.filter(post => post.status === "published") ?? [];
        return publishedPosts.length > 0;
      });

      const sortedCategories = categoriesWithPublishedPosts.sort((a, b) => {
        const aPublishedCount = a.posts?.filter(post => post.status === "published")?.length || 0;
        const bPublishedCount = b.posts?.filter(post => post.status === "published")?.length || 0;
        if (aPublishedCount !== bPublishedCount) {
          return bPublishedCount - aPublishedCount;
        }
        return a.name.localeCompare(b.name);
      });
      
      setCategories(sortedCategories);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]);
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

  const getTotalPublishedPosts = () => {
    return categories.reduce((sum, cat) => {
      const publishedPosts = cat.posts?.filter(post => post.status === "published") || [];
      return sum + publishedPosts.length;
    }, 0);
  };

  const getMostActiveCategory = () => {
    if (categories.length === 0) return null;
    return categories.reduce((max, cat) => {
      const maxPublishedCount = max.posts?.filter(post => post.status === "published")?.length || 0;
      const catPublishedCount = cat.posts?.filter(post => post.status === "published")?.length || 0;
      return catPublishedCount > maxPublishedCount ? cat : max;
    }, categories[0]);
  };

  const getCategoryIcon = (categoryName?: string) => {
    if (!categoryName) return <Tag className="h-6 w-6" />;
    
    const name = categoryName.toLowerCase();
    if (name.includes('obav') || name.includes('vest') || name.includes('inf')) {
      return <FileText className="h-6 w-6" />;
    }
    if (name.includes('promet') || name.includes('saobraćaj') || name.includes('infrastruktur')) {
      return <Building className="h-6 w-6" />;
    }
    if (name.includes('sport') || name.includes('kultura') || name.includes('događaj')) {
      return <Calendar className="h-6 w-6" />;
    }
    return <Tag className="h-6 w-6" />;
  };

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
              <Link href="/objave" className="text-gray-700 hover:text-blue-600 transition-colors">
                Objave
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
              <h1 className="text-3xl font-bold text-gray-900">Kategorije objava</h1>
              <p className="text-gray-600 mt-2">
                Organizovano po temama za lakše pronalaženje sadržaja
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

      {/* Statistics */}
      {!isLoading && categories.length > 0 && (
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{categories.length}</div>
                <div className="text-sm text-gray-600">Aktivne kategorije</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{getTotalPublishedPosts()}</div>
                <div className="text-sm text-gray-600">Objavljene objave</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {categories.length > 0 ? Math.round(getTotalPublishedPosts() / categories.length) : 0}
                </div>
                <div className="text-sm text-gray-600">Prosek po kategoriji</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {getMostActiveCategory()?.posts?.filter(post => post.status === "published")?.length || 0}
                </div>
                <div className="text-sm text-gray-600">Najaktivnija kategorija</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="h-6 w-6 bg-gray-200 rounded"></div>
                    <div className="h-5 bg-gray-200 rounded w-24"></div>
                  </div>
                  <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : categories.length > 0 ? (
          <>
            {/* Categories Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {categories.map((category) => {
                // Filtriramo samo objavljene postove
                const publishedPosts = category?.posts?.filter(post => post.status === "published") ?? [];

                return (
                  <Card key={category.id} className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                    <CardContent className="p-6">
                      {/* Category Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                            {getCategoryIcon(category.name)}
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600">
                              <Link href={`/kategorije/${category.slug}`}>
                                {category.name}
                              </Link>
                            </h3>
                            <div className="flex items-center space-x-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                <Hash className="mr-1 h-3 w-3" />
                                {category.slug}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <Badge variant="secondary" className="text-sm">
                          {publishedPosts.length} objava
                        </Badge>
                      </div>

                      {/* Description */}
                      {category.description ? (
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                          {category.description}
                        </p>
                      ) : (
                        <p className="text-gray-400 text-sm mb-4 italic">
                          Nema opisa kategorije
                        </p>
                      )}

                      {/* Recent Posts Preview */}
                      {publishedPosts.length > 0 && (
                        <div className="mb-4">
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Poslednje objave:</h4>
                          <div className="space-y-1">
                            {publishedPosts.slice(0, 3).map((post) => (
                              <Link
                                key={post.id}
                                href={`/objave/${post.slug}`}
                                className="block text-sm text-gray-600 hover:text-blue-600 transition-colors line-clamp-1"
                              >
                                • {post.title}
                              </Link>
                            ))}
                            {publishedPosts.length > 3 && (
                              <p className="text-xs text-gray-500">
                                i još {publishedPosts.length - 3} objava...
                              </p>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Meta Information */}
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                        <span className="flex items-center">
                          <Calendar className="mr-1 h-3 w-3" />
                          Kreirana {formatDate(category.createdAt)}
                        </span>
                        <span className="flex items-center">
                          <TrendingUp className="mr-1 h-3 w-3" />
                          Aktivna
                        </span>
                      </div>

                      {/* Action Button */}
                      <Button 
                        variant="outline" 
                        className="w-full group" 
                        asChild
                      >
                        <Link href={`/kategorije/${category.slug}`}>
                          Pogledaj objave
                          <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Popular Categories Section */}
            <div className="mt-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Najpopularnije kategorije</h2>
              <div className="grid gap-4 md:grid-cols-2">
                {categories
                  .sort((a, b) => {
                    const aPublishedCount = a.posts?.filter(post => post.status === "published")?.length || 0;
                    const bPublishedCount = b.posts?.filter(post => post.status === "published")?.length || 0;
                    return bPublishedCount - aPublishedCount;
                  })
                  .slice(0, 4)
                  .map((category, index) => {
                    const publishedPosts = category.posts?.filter(post => post.status === "published") || [];
                    return (
                      <Card key={category.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-full text-sm font-bold">
                                {index + 1}
                              </div>
                              <div>
                                <h3 className="font-medium text-gray-900">{category.name}</h3>
                                <p className="text-sm text-gray-500">
                                  {publishedPosts.length} objav • Kreirana {formatDate(category.createdAt)}
                                </p>
                              </div>
                            </div>
                            <Button variant="ghost" size="sm" asChild>
                              <Link href={`/kategorije/${category.slug}`}>
                                <Eye className="h-4 w-4" />
                              </Link>
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
              </div>
            </div>
          </>
        ) : (
          /* No Categories */
          <div className="text-center py-16">
            <Tag className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Nema aktivnih kategorija</h2>
            <p className="text-gray-600 mb-6">
              Trenutno nema kategorija sa objavljenim objavama.
            </p>
            <Button asChild>
              <Link href="/objave">Pogledaj sve objave</Link>
            </Button>
          </div>
        )}

        {/* Quick Navigation */}
        {categories.length > 0 && (
          <div className="mt-12">
            <Card>
              <CardHeader>
                <CardTitle>Brza navigacija</CardTitle>
                <CardDescription>
                  Kliknite na kategoriju da vidite sve objave iz te oblasti
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => {
                    const publishedPosts = category.posts?.filter(post => post.status === "published") || [];
                    return (
                      <Badge
                        key={category.id}
                        variant="outline"
                        className="hover:bg-blue-50 hover:border-blue-200 cursor-pointer transition-colors py-2 px-3"
                        asChild
                      >
                        <Link href={`/kategorije/${category.slug}`}>
                          {category.name}
                          <span className="ml-2 text-xs">({publishedPosts.length})</span>
                        </Link>
                      </Badge>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
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