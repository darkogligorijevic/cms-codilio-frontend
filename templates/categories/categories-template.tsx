// templates/categories/categories-template.tsx
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
import { TemplateProps } from '../template-registry';

export function CategoriesTemplate({ page, institutionData }: TemplateProps) {
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
      console.log(sortedCategories)
      
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
    if (name.includes('обав') || name.includes('вест') || name.includes('инф') || 
        name.includes('obav') || name.includes('vest') || name.includes('inf')) {
      return <FileText className="h-6 w-6" />;
    }
    if (name.includes('промет') || name.includes('саобраћај') || name.includes('инфраструктур') ||
        name.includes('promet') || name.includes('saobraćaj') || name.includes('infrastruktur')) {
      return <Building className="h-6 w-6" />;
    }
    if (name.includes('спорт') || name.includes('култура') || name.includes('догађај') ||
        name.includes('sport') || name.includes('kultura') || name.includes('događaj')) {
      return <Calendar className="h-6 w-6" />;
    }
    return <Tag className="h-6 w-6" />;
  };

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center py-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
          {page.title}
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          {page.content || 'Организовано по темама за лакше проналажење садржаја'}
        </p>
      </div>

      {/* Statistics */}
      {!isLoading && categories.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-dynamic">{categories.length}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Активне категорије</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-secondary-dynamic">{getTotalPublishedPosts()}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Објављене објаве</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {categories.length > 0 ? Math.round(getTotalPublishedPosts() / categories.length) : 0}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Просек по категорији</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {getMostActiveCategory()?.posts?.filter(post => post.status === "published")?.length || 0}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Најактивнија категорија</div>
            </div>
          </div>
        </div>
      )}

      {/* Categories Grid */}
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
        <div className="space-y-8">
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
                        <div className="bg-blue-100 p-2 rounded-lg text-primary-dynamic">
                          {getCategoryIcon(category.name)}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-200 hover:text-primary-dynamic ">
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
                      <Badge variant="secondary" className="text-sm badge-primary-dynamic">
                        {publishedPosts.length} објав{publishedPosts.length === 1 ? 'а' : 'а'}
                      </Badge>
                    </div>

                    {/* Description */}
                    {category.description ? (
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {category.description}
                      </p>
                    ) : (
                      <p className="text-gray-400 text-sm mb-4 italic">
                        Нема описа категорије
                      </p>
                    )}

                    {/* Recent Posts Preview */}
                    {publishedPosts.length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Последње објаве:</h4>
                        <div className="space-y-1">
                          {publishedPosts.slice(0, 3).map((post) => (
                            <Link
                              key={post.id}
                              href={`/objave/${post.slug}`}
                              className="block text-sm text-gray-600 hover:text-primary-dynamic transition-colors line-clamp-1"
                            >
                              • {post.title}
                            </Link>
                          ))}
                          {publishedPosts.length > 3 && (
                            <p className="text-xs text-gray-500">
                              и још {publishedPosts.length - 3} објав{publishedPosts.length - 3 === 1 ? 'а' : 'а'}...
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Meta Information */}
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                      <span className="flex items-center">
                        <Calendar className="mr-1 h-3 w-3" />
                        Креирана {formatDate(category.createdAt)}
                      </span>
                      <span className="flex items-center">
                        <TrendingUp className="mr-1 h-3 w-3" />
                        Активна
                      </span>
                    </div>

                    {/* Action Button */}
                    <Button 
                      variant="outline" 
                      className="w-full group" 
                      asChild
                    >
                      <Link href={`/kategorije/${category.slug}`}>
                        Погледај објаве
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
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-200 mb-6">Најпопуларније категорије</h2>
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
                            <div 
                              className="flex items-center justify-center w-8 h-8 text-white rounded-full text-sm font-bold"
                              style={{
                                background: `linear-gradient(135deg, hsl(var(--primary)), hsl(var(--secondary)))`
                              }}
                            >
                              {index + 1}
                            </div>
                            <div>
                              <h3 className="font-medium text-gray-900 dark:text-gray-200 hover:text-primary-dynamic">
                                <Link href={`/kategorije/${category.slug}`}>
                                  {category.name}
                                </Link>
                              </h3>
                              <p className="text-sm text-gray-500">
                                {publishedPosts.length} објав{publishedPosts.length === 1 ? 'а' : 'а'} • Креирана {formatDate(category.createdAt)}
                              </p>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/kategorije/${category.slug}`}>
                              <Eye className="h-4 w-4 text-primary-dynamic" />
                            </Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
            </div>
          </div>
        </div>
      ) : (
        /* No Categories */
        <div className="text-center py-16">
          <Tag className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Нема активних категорија</h2>
          <p className="text-gray-600 mb-6">
            Тренутно нема категорија са објављеним објавама.
          </p>
          <Button variant="primary" asChild>
            <Link href="/objave">Погледај све објаве</Link>
          </Button>
        </div>
      )}

      {/* Quick Navigation */}
      {categories.length > 0 && (
        <div className="mt-12">
          <Card>
            <CardHeader>
              <CardTitle>Брза навигација</CardTitle>
              <CardDescription>
                Кликните на категорију да видите све објаве из те области
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
                      className="hover:bg-primary-dynamic/10 hover:border-primary-dynamic cursor-pointer transition-colors py-2 px-3"
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
    </div>
  );
}