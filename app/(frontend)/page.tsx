// app/(frontend)/page.tsx - UPDATED VERSION using SearchComponent
'use client';

import { useEffect, useState } from 'react';
import { useSettings } from '@/lib/settings-context';
import { useDynamicStyles, useThemeColors } from '@/lib/theme-hooks';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  FileText,
  Download,
  ChevronRight,
  TrendingUp,
  Users,
  Building,
  User,
  Calendar,
  Eye
} from 'lucide-react';
import Link from 'next/link';
import { postsApi, pagesApi, categoriesApi, mediaApi } from '@/lib/api';
import type { Post, Page, Category } from '@/lib/types';
import { SearchComponent } from '@/components/frontend/search/search-component'; // NEW IMPORT

export default function HomePage() {
  const { settings, isLoading: settingsLoading } = useSettings();
  const { getButtonStyles, getTextStyles, getGradientStyles } = useDynamicStyles();
  const themeColors = useThemeColors();
  
  const [posts, setPosts] = useState<Post[]>([]);
  const [pages, setPages] = useState<Page[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Use settings for institution data
  const institutionData = {
    name: settings?.siteName || "Локална институција",
    description: settings?.siteTagline || "Службени портал локалне самоуправе",
    citizens: "53.096",
    villages: "32",
    area: "339 km²"
  };

  useEffect(() => {
    fetchHomeData();
  }, []);

  const fetchHomeData = async () => {
    try {
      setIsLoading(true);
      const [homepagePosts, pagesResponse, categoriesResponse] = await Promise.all([
        postsApi.getForHomePage(6),
        pagesApi.getPublished(),
        categoriesApi.getAll()
      ]);

      setPosts(homepagePosts);
      setPages(pagesResponse);
      setCategories(categoriesResponse);
    } catch (error) {
      console.error('Error fetching home data:', error);
      setPosts([]);
      setPages([]);
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

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 24) return `пре ${diffInHours} сати`;
    if (diffInHours < 168) return `пре ${Math.floor(diffInHours / 24)} дана`;
    return formatDate(dateString);
  };

  if (settingsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2" style={{ borderColor: themeColors.primary }}></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Hero Section with Dynamic Colors */}
      <section 
        className="text-white py-24 lg:py-32"
        style={{
          background: `linear-gradient(135deg, ${themeColors.primary} 0%, ${themeColors.secondary} 100%)`
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold mb-4" style={{ fontFamily: settings?.themeFontFamily || 'Inter' }}>
                Добродошли у {institutionData.name}
              </h2>
              <p className="text-lg lg:text-xl text-blue-100 mb-6" style={{ fontFamily: settings?.themeFontFamily || 'Inter' }}>
                Транспарентност, доступност и ефикасност у служби грађана.
                Овде можете пронаћи све важне информације о раду наше институције.
              </p>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-4 mt-8">
                <div className="text-center">
                  <div className="text-xl lg:text-2xl font-bold">{institutionData.citizens}</div>
                  <div className="text-sm text-blue-200">Грађана</div>
                </div>
                <div className="text-center">
                  <div className="text-xl lg:text-2xl font-bold">{institutionData.villages}</div>
                  <div className="text-sm text-blue-200">Насеља</div>
                </div>
                <div className="text-center">
                  <div className="text-xl lg:text-2xl font-bold">{institutionData.area}</div>
                  <div className="text-sm text-blue-200">Површина</div>
                </div>
              </div>
            </div>

            <div>
              {/* UPDATED: Use SearchComponent instead of inline search */}
              <SearchComponent
                placeholder="Унесите кључне речи..."
                buttonText="Претражи"
                showDescription={true}
                variant="default"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Main Content - СВЕТЛА ПОЗАДИНА */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 bg-white dark:bg-gray-900">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Latest News */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white" style={{ fontFamily: settings?.themeFontFamily || 'Inter' }}>
                  Најновије објаве
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {posts.length > 0 ? `Приказује се ${posts.length} најновијих објава` : 'Нема објава за приказивање'}
                </p>
              </div>
              <Button variant="outline" asChild>
                <Link href="/objave">
                  Све објаве
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>

            {isLoading ? (
              <div className="space-y-6">
                {[...Array(3)].map((_, i) => (
                  <Card key={i} className="animate-pulse bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                    <CardContent className="p-6">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-3"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : posts.length > 0 ? (
              <div className="space-y-6">
                {posts.map((post) => (
                  <Card key={post.id} className="hover:shadow-md transition-shadow bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            {post.category && (
                              <Badge variant="secondary" className="badge-primary-dynamic">
                                {post.category.name}
                              </Badge>
                            )}
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              {getTimeAgo(post.publishedAt || post.createdAt)}
                            </span>
                            {post.pages && post.pages.length > 0 && (
                              <div className="flex items-center space-x-1">
                                <span className="text-xs text-gray-400">•</span>
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  Приказује се на: {post.pages.map(p => p.title).join(', ')}
                                </span>
                              </div>
                            )}
                          </div>

                          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 hover:text-primary-dynamic transition-colors">
                            <Link href={`/objave/${post.slug}`}>
                              {post.title}
                            </Link>
                          </h4>

                          {post.excerpt && (
                            <div
                              className="text-gray-600 dark:text-gray-300 mb-3 text-sm lg:text-base prose prose-sm max-w-none dark:prose-invert"
                              dangerouslySetInnerHTML={{ __html: post.excerpt }}
                            />
                          )}

                          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
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
            ) : (
              <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                <CardContent className="p-12 text-center">
                  <FileText className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Нема објава на почетној страни</h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-4">
                    Тренутно нема објава додељених почетној страни.
                    Администратор може доделити објаве овој страни из CMS-а.
                  </p>
                  <Button variant="outline" asChild>
                    <Link href="/objave">Погледај све објаве</Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Links */}
            {pages.length > 0 && (
              <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="text-gray-900 dark:text-white">Брзи линкови</CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400">
                    Најчешће тражене информације
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {pages.map((page) => (
                    <Link
                      key={page.id}
                      href={`/${page.slug}`}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                    >
                      <span className="text-sm font-medium dark:text-gray-500 text-gray-700">{page.title}</span>
                      <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-primary-dynamic transition-colors" />
                    </Link>
                  ))}

                  <div className="pt-2 border-t border-gray-100 dark:border-gray-600">
                    <Link
                      href="/dokumenti"
                      className="flex items-center justify-between p-3 rounded-lg transition-colors group hover:bg-primary-dynamic/5"
                    >
                      <span className="text-sm font-medium flex items-center text-primary-dynamic">
                        <Download className="mr-2 h-4 w-4" />
                        Сви документи
                      </span>
                      <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform text-primary-dynamic" />
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Categories */}
            {categories.length > 0 && (
              <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="text-gray-900 dark:text-white">Категорије објава</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((category) => (
                      <Badge
                        key={category.id}
                        variant="outline"
                        className="hover:bg-primary-dynamic/10 hover:border-primary-dynamic cursor-pointer transition-colors badge-primary-dynamic border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:text-primary-dynamic dark:hover:bg-primary-dynamic/20"
                        asChild
                      >
                        <Link href={`/kategorije/${category.slug}`}>
                          {category.name}
                          {category.posts && category.posts.length > 0 && (
                            <span className="ml-1 text-xs">
                              ({category.posts.length})
                            </span>
                          )}
                        </Link>
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Transparency */}
            <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 card-primary-dynamic">
              <CardHeader>
                <CardTitle className="text-primary-dynamic">Транспарентност</CardTitle>
                <CardDescription className="text-primary-dynamic opacity-80 dark:text-primary-dynamic/80">
                  Приступ информацијама од јавног значаја
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button variant="outline" size="sm" className="w-full justify-start hover:bg-primary-dynamic/5 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:text-primary-dynamic dark:hover:bg-primary-dynamic/10" asChild>
                    <Link href="/budzet">
                      <TrendingUp className="mr-2 h-4 w-4" />
                      Буџет и финансије
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start hover:bg-primary-dynamic/5 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:text-primary-dynamic dark:hover:bg-primary-dynamic/10" asChild>
                    <Link href="/javne-nabavke">
                      <FileText className="mr-2 h-4 w-4" />
                      Јавне набавке
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start hover:bg-primary-dynamic/5 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:text-primary-dynamic dark:hover:bg-primary-dynamic/10" asChild>
                    <Link href="/sednice">
                      <Users className="mr-2 h-4 w-4" />
                      Записници са седница
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}