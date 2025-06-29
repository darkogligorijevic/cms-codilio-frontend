// app/(frontend)/page.tsx - FINALNA VERZIJA SA SVETLOM TEMOM
'use client';

import { useEffect, useState, useRef } from 'react';
import { useSettings } from '@/lib/settings-context';
import { useDynamicStyles, useThemeColors } from '@/lib/theme-hooks';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Calendar,
  Eye,
  Search,
  FileText,
  Download,
  ChevronRight,
  TrendingUp,
  Users,
  Building,
  X,
  User
} from 'lucide-react';
import Link from 'next/link';
import { postsApi, pagesApi, categoriesApi, mediaApi } from '@/lib/api';
import type { Post, Page, Category } from '@/lib/types';

export default function HomePage() {
  const { settings, isLoading: settingsLoading } = useSettings();
  const { getButtonStyles, getTextStyles, getGradientStyles } = useDynamicStyles();
  const themeColors = useThemeColors();
  
  const [posts, setPosts] = useState<Post[]>([]);
  const [pages, setPages] = useState<Page[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<{ posts: Post[], pages: Page[] }>({ posts: [], pages: [] });
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    if (searchTerm.length > 2) {
      const timeoutId = setTimeout(() => {
        performSearch(searchTerm);
      }, 300);
      return () => clearTimeout(timeoutId);
    } else {
      setShowSearchResults(false);
      setSearchResults({ posts: [], pages: [] });
    }
  }, [searchTerm]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
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

  const performSearch = async (query: string) => {
    if (!query.trim() || query.length < 3) return;

    try {
      setIsSearching(true);
      const [postsResponse, pagesResponse] = await Promise.all([
        postsApi.getPublished(1, 20),
        pagesApi.getPublished()
      ]);

      const searchLower = query.toLowerCase();
      const filteredPosts = postsResponse.posts.filter(post =>
        post.title.toLowerCase().includes(searchLower) ||
        post.excerpt?.toLowerCase().includes(searchLower) ||
        post.content.toLowerCase().includes(searchLower) ||
        post.category?.name.toLowerCase().includes(searchLower)
      ).slice(0, 5);

      const filteredPages = pagesResponse.filter(page =>
        page.title.toLowerCase().includes(searchLower) ||
        String(page.content).toLowerCase().includes(searchLower)
      ).slice(0, 3);

      setSearchResults({
        posts: filteredPosts,
        pages: filteredPages
      });

      setShowSearchResults(true);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults({ posts: [], pages: [] });
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      performSearch(searchTerm);
    }
  };

  const clearSearch = () => {
    setSearchTerm('');
    setSearchResults({ posts: [], pages: [] });
    setShowSearchResults(false);
  };

  const highlightText = (text: string, query: string) => {
    if (!query) return text;
    const regex = new RegExp(`(${query})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, index) =>
      regex.test(part) ? (
        <span key={index} className="bg-yellow-200 px-1 rounded font-semibold">
          {part}
        </span>
      ) : part
    );
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
              {/* Search Card */}
              <Card className="bg-white/10 backdrop-blur-sm border-none">
                <CardHeader>
                  <CardTitle className="text-white">Претражи садржај</CardTitle>
                  <CardDescription className="text-blue-100">
                    Пронађите објаве, документе и информације
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div ref={searchRef}>
                    <form onSubmit={handleSearchSubmit} className="space-y-3">
                      <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="Унесите кључне речи..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-9 bg-white/90 text-gray-500 dark:bg-gray-800/90 focus-primary-dynamic"
                          autoComplete="off"
                        />
                        {searchTerm && (
                          <button
                            type="button"
                            onClick={clearSearch}
                            className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}

                        {/* Search Results Dropdown */}
                        {showSearchResults && (searchResults.posts.length > 0 || searchResults.pages.length > 0) && (
                          <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg border dark:border-gray-600 z-50 max-h-96 overflow-y-auto">
                            {/* Posts Results */}
                            {searchResults.posts.length > 0 && (
                              <div className="p-3">
                                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                                  <FileText className="mr-2 h-4 w-4 text-primary-dynamic" />
                                  Објаве ({searchResults.posts.length})
                                </h4>
                                <div className="space-y-2">
                                  {searchResults.posts.map((post) => (
                                    <Link
                                      key={post.id}
                                      href={`/objave/${post.slug}`}
                                      onClick={clearSearch}
                                      className="block p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-colors"
                                    >
                                      <div className="flex items-start space-x-3">
                                        {post.featuredImage && (
                                          <img
                                            src={mediaApi.getFileUrl(post.featuredImage)}
                                            alt=""
                                            className="w-12 h-8 object-cover rounded flex-shrink-0"
                                          />
                                        )}
                                        <div className="flex-1 min-w-0">
                                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100 line-clamp-1">
                                            {highlightText(post.title, searchTerm)}
                                          </div>
                                          {post.excerpt && (
                                            <div className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mt-1">
                                              {highlightText(post.excerpt.substring(0, 100), searchTerm)}
                                            </div>
                                          )}
                                          <div className="flex items-center space-x-2 mt-1">
                                            {post.category && (
                                              <Badge variant="secondary" className="text-xs badge-primary-dynamic">
                                                {post.category.name}
                                              </Badge>
                                            )}
                                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                              {getTimeAgo(post.publishedAt || post.createdAt)}
                                            </span>
                                          </div>
                                        </div>
                                      </div>
                                    </Link>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Pages Results */}
                            {searchResults.pages.length > 0 && (
                              <div className="p-3 border-t dark:border-gray-600">
                                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                                  <Building className="mr-2 h-4 w-4 text-secondary-dynamic" />
                                  Странице ({searchResults.pages.length})
                                </h4>
                                <div className="space-y-2">
                                  {searchResults.pages.map((page) => (
                                    <Link
                                      key={page.id}
                                      href={`/${page.slug}`}
                                      onClick={clearSearch}
                                      className="block p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-colors"
                                    >
                                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                        {highlightText(page.title, searchTerm)}
                                      </div>
                                      <div className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mt-1">
                                        {highlightText(
                                          String(page.content).replace(/<[^>]*>/g, '').substring(0, 100),
                                          searchTerm
                                        )}
                                      </div>
                                    </Link>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* No Results */}
                            {searchResults.posts.length === 0 && searchResults.pages.length === 0 && !isSearching && (
                              <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                                <Search className="mx-auto h-8 w-8 text-gray-300 dark:text-gray-600 mb-2" />
                                <p className="text-sm">Нема резултата за "{searchTerm}"</p>
                                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                  Покушајте са другим кључним речима
                                </p>
                              </div>
                            )}

                            {/* Loading */}
                            {isSearching && (
                              <div className="p-4 text-center">
                                <div 
                                  className="animate-spin rounded-full h-6 w-6 border-b-2 mx-auto"
                                  style={{ borderColor: themeColors.primary }}
                                ></div>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Претражује се...</p>
                              </div>
                            )}

                            {/* Show more results link */}
                            {(searchResults.posts.length > 0 || searchResults.pages.length > 0) && (
                              <div className="p-3 border-t dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50">
                                <Link
                                  href={`/pretraga?q=${encodeURIComponent(searchTerm)}`}
                                  onClick={clearSearch}
                                  className="text-sm font-medium flex items-center justify-center text-primary-dynamic hover:text-primary-dynamic/80 transition-colors"
                                >
                                  Прикажи све резултате
                                  <ChevronRight className="ml-1 h-4 w-4" />
                                </Link>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      <Button
                        type="submit"
                        className="w-full bg-white hover:bg-blue-50 text-primary-dynamic dark:bg-gray-800 dark:hover:bg-gray-700"
                      >
                        <Search className="mr-2 h-4 w-4" />
                        Претражи
                      </Button>
                    </form>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content - SVETLA POZADINA */}
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