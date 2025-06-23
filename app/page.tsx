// app/page.tsx - Updated with Dark Mode Support
'use client';

import { useEffect, useState, useRef } from 'react';
import { useSettings } from '@/lib/settings-context';
import { useDynamicStyles, useThemeColors } from '@/lib/theme-hooks';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DarkModeToggle } from '@/components/ui/dark-mode-toggle';
import {
  Calendar,
  Eye,
  Search,
  FileText,
  Download,
  MapPin,
  Phone,
  Mail,
  Clock,
  TrendingUp,
  Users,
  Building,
  ChevronRight,
  ExternalLink,
  Menu,
  X,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Youtube
} from 'lucide-react';
import Link from 'next/link';
import { postsApi, pagesApi, categoriesApi, mediaApi } from '@/lib/api';
import type { Post, Page, Category } from '@/lib/types';

export default function HomePage() {
  const { settings, isLoading: settingsLoading, isDarkMode } = useSettings();
  const { getButtonStyles, getTextStyles, getGradientStyles } = useDynamicStyles();
  const themeColors = useThemeColors();
  
  const [posts, setPosts] = useState<Post[]>([]);
  const [pages, setPages] = useState<Page[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<{ posts: Post[], pages: Page[] }>({ posts: [], pages: [] });
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Use settings for institution data
  const institutionData = {
    name: settings?.siteName || "Локална институција",
    description: settings?.siteTagline || "Службени портал локалне самоуправе",
    address: settings?.contactAddress || "Адреса институције",
    phone: settings?.contactPhone || "+381 11 123 4567",
    email: settings?.contactEmail || "info@institucija.rs",
    workingHours: settings?.contactWorkingHours || "Понедељак - Петак: 07:30 - 15:30",
    mapUrl: settings?.contactMapUrl,
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
        page.content.toLowerCase().includes(searchLower)
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
        <span key={index} className="bg-yellow-200 dark:bg-yellow-800 px-1 rounded font-semibold">
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
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2" style={{ borderColor: themeColors.primary }}></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      {/* Header */}
      <header className="bg-card shadow-sm border-b border-border z-50 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-3">
              {settings?.siteLogo ? (
                <img 
                  src={mediaApi.getFileUrl(settings.siteLogo)} 
                  alt={settings.siteName || 'Лого'} 
                  className="h-8 object-contain"
                />
              ) : (
                <Building className="h-8 w-8 text-primary-dynamic" />
              )}
              <div>
                <h1 className="text-lg font-bold text-foreground" style={{ fontFamily: settings?.themeFontFamily || 'Inter' }}>
                  {institutionData.name}
                </h1>
                <p className="text-xs text-muted-foreground hidden sm:block" style={{ fontFamily: settings?.themeFontFamily || 'Inter' }}>
                  {institutionData.description}
                </p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              <Link href="/objave" className="text-muted-foreground hover:text-foreground transition-colors">
                Објаве
              </Link>
              <Link href="/dokumenti" className="text-muted-foreground hover:text-foreground transition-colors">
                Документи
              </Link>
              {pages.slice(0, 3).map((page) => (
                <Link
                  key={page.id}
                  href={`/${page.slug}`}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {page.title}
                </Link>
              ))}
              
              {/* Dark Mode Toggle */}
              <DarkModeToggle />
              
              <Button variant="outline" size="sm" asChild>
                <Link href="/dashboard">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  CMS
                </Link>
              </Button>
            </nav>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center space-x-2">
              <DarkModeToggle />
              <button
                className="p-2"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-border">
              <div className="space-y-2">
                <Link href="/objave" className="block px-3 py-2 text-muted-foreground hover:bg-muted hover:text-foreground rounded-md transition-colors">
                  Објаве
                </Link>
                <Link href="/dokumenti" className="block px-3 py-2 text-muted-foreground hover:bg-muted hover:text-foreground rounded-md transition-colors">
                  Документи
                </Link>
                {pages.slice(0, 3).map((page) => (
                  <Link
                    key={page.id}
                    href={`/${page.slug}`}
                    className="block px-3 py-2 text-muted-foreground hover:bg-muted hover:text-foreground rounded-md transition-colors"
                  >
                    {page.title}
                  </Link>
                ))}
                <Link href="/dashboard" className="block px-3 py-2 text-primary-dynamic hover:bg-primary-dynamic/10 rounded-md transition-colors">
                  CMS пријава
                </Link>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section with Dynamic Colors */}
      <section 
        className="text-white py-12 lg:py-16 transition-all duration-300"
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
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
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
                          className="pl-9 bg-white/90 focus-primary-dynamic text-gray-900"
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
                          <div className="absolute top-full left-0 right-0 mt-1 bg-card rounded-lg shadow-lg border border-border z-50 max-h-96 overflow-y-auto">
                            {/* Posts Results */}
                            {searchResults.posts.length > 0 && (
                              <div className="p-3">
                                <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center">
                                  <FileText className="mr-2 h-4 w-4 text-primary-dynamic" />
                                  Објаве ({searchResults.posts.length})
                                </h4>
                                <div className="space-y-2">
                                  {searchResults.posts.map((post) => (
                                    <Link
                                      key={post.id}
                                      href={`/objave/${post.slug}`}
                                      onClick={clearSearch}
                                      className="block p-2 hover:bg-muted rounded-md transition-colors"
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
                                          <div className="text-sm font-medium text-foreground line-clamp-1">
                                            {highlightText(post.title, searchTerm)}
                                          </div>
                                          {post.excerpt && (
                                            <div className="text-xs text-muted-foreground line-clamp-2 mt-1">
                                              {highlightText(post.excerpt.substring(0, 100), searchTerm)}
                                            </div>
                                          )}
                                          <div className="flex items-center space-x-2 mt-1">
                                            {post.category && (
                                              <Badge variant="secondary" className="text-xs badge-primary-dynamic">
                                                {post.category.name}
                                              </Badge>
                                            )}
                                            <span className="text-xs text-muted-foreground">
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
                              <div className="p-3 border-t border-border">
                                <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center">
                                  <Building className="mr-2 h-4 w-4 text-secondary-dynamic" />
                                  Странице ({searchResults.pages.length})
                                </h4>
                                <div className="space-y-2">
                                  {searchResults.pages.map((page) => (
                                    <Link
                                      key={page.id}
                                      href={`/${page.slug}`}
                                      onClick={clearSearch}
                                      className="block p-2 hover:bg-muted rounded-md transition-colors"
                                    >
                                      <div className="text-sm font-medium text-foreground">
                                        {highlightText(page.title, searchTerm)}
                                      </div>
                                      <div className="text-xs text-muted-foreground line-clamp-2 mt-1">
                                        {highlightText(
                                          page.content.replace(/<[^>]*>/g, '').substring(0, 100),
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
                              <div className="p-4 text-center text-muted-foreground">
                                <Search className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                                <p className="text-sm">Нема резултата за "{searchTerm}"</p>
                                <p className="text-xs text-muted-foreground mt-1">
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
                                <p className="text-sm text-muted-foreground mt-2">Претражује се...</p>
                              </div>
                            )}

                            {/* Show more results link */}
                            {(searchResults.posts.length > 0 || searchResults.pages.length > 0) && (
                              <div className="p-3 border-t border-border bg-muted/50">
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
                        className="w-full bg-white hover:bg-blue-50 text-primary-dynamic"
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

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Latest News */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-bold text-foreground" style={{ fontFamily: settings?.themeFontFamily || 'Inter' }}>
                  Најновије објаве
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
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
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-6">
                      <div className="h-4 bg-muted rounded w-3/4 mb-3"></div>
                      <div className="h-3 bg-muted rounded w-full mb-2"></div>
                      <div className="h-3 bg-muted rounded w-2/3"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : posts.length > 0 ? (
              <div className="space-y-6">
                {posts.map((post) => (
                  <Card key={post.id} className="hover:shadow-md transition-all duration-300">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            {post.category && (
                              <Badge variant="secondary" className="badge-primary-dynamic">
                                {post.category.name}
                              </Badge>
                            )}
                            <span className="text-sm text-muted-foreground">
                              {getTimeAgo(post.publishedAt || post.createdAt)}
                            </span>
                            {post.pages && post.pages.length > 0 && (
                              <div className="flex items-center space-x-1">
                                <span className="text-xs text-muted-foreground">•</span>
                                <span className="text-xs text-muted-foreground">
                                  Приказује се на: {post.pages.map(p => p.title).join(', ')}
                                </span>
                              </div>
                            )}
                          </div>

                          <h4 className="text-lg font-semibold text-foreground mb-2 hover:text-primary-dynamic transition-colors">
                            <Link href={`/objave/${post.slug}`}>
                              {post.title}
                            </Link>
                          </h4>

                          {post.excerpt && (
                            <div
                              className="text-muted-foreground mb-3 text-sm lg:text-base prose prose-sm max-w-none dark:prose-invert"
                              dangerouslySetInnerHTML={{ __html: post.excerpt }}
                            />
                          )}

                          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
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
              <Card>
                <CardContent className="p-12 text-center">
                  <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">Нема објава на почетној страни</h3>
                  <p className="text-muted-foreground mb-4">
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
              <Card>
                <CardHeader>
                  <CardTitle>Брзи линкови</CardTitle>
                  <CardDescription>
                    Најчешће тражене информације
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {pages.map((page) => (
                    <Link
                      key={page.id}
                      href={`/${page.slug}`}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors group"
                    >
                      <span className="text-sm font-medium">{page.title}</span>
                      <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary-dynamic transition-colors" />
                    </Link>
                  ))}

                  <div className="pt-2 border-t border-border">
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

            {/* Contact Info */}
            <Card>
              <CardHeader>
                <CardTitle>Контакт информације</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start space-x-3">
                  <MapPin className="h-4 w-4 text-primary-dynamic mt-0.5" />
                  <div className="text-sm">
                    <div className="font-medium text-foreground">Адреса</div>
                    <div className="text-muted-foreground">{institutionData.address}</div>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Phone className="h-4 w-4 text-primary-dynamic mt-0.5" />
                  <div className="text-sm">
                    <div className="font-medium text-foreground">Телефон</div>
                    <div className="text-muted-foreground">{institutionData.phone}</div>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Mail className="h-4 w-4 text-primary-dynamic mt-0.5" />
                  <div className="text-sm">
                    <div className="font-medium text-foreground">Емаил</div>
                    <div className="text-muted-foreground">{institutionData.email}</div>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Clock className="h-4 w-4 text-primary-dynamic mt-0.5" />
                  <div className="text-sm">
                    <div className="font-medium text-foreground">Радно време</div>
                    <div className="text-muted-foreground">{institutionData.workingHours}</div>
                  </div>
                </div>

                <Button 
                  variant="primary"
                  asChild
                  className='w-full'
                >
                  <Link href="/kontakt">Контактирај нас</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Categories */}
            {categories.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Категорије објава</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((category) => (
                      <Badge
                        key={category.id}
                        variant="outline"
                        className="hover:bg-primary-dynamic/10 hover:border-primary-dynamic cursor-pointer transition-colors badge-primary-dynamic"
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
            <Card className="card-primary-dynamic">
              <CardHeader>
                <CardTitle className="text-primary-dynamic">Транспарентност</CardTitle>
                <CardDescription className="text-primary-dynamic opacity-80">
                  Приступ информацијама од јавног значаја
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button variant="outline" size="sm" className="w-full justify-start hover:bg-primary-dynamic/5" asChild>
                    <Link href="/budzet">
                      <TrendingUp className="mr-2 h-4 w-4" />
                      Буџет и финансије
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start hover:bg-primary-dynamic/5" asChild>
                    <Link href="/javne-nabavke">
                      <FileText className="mr-2 h-4 w-4" />
                      Јавне набавке
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start hover:bg-primary-dynamic/5" asChild>
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

      {/* Footer */}
      <footer className="bg-card border-t border-border py-12 mt-16 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                {settings?.siteLogo ? (
                  <img 
                    src={mediaApi.getFileUrl(settings.siteLogo)} 
                    alt={settings.siteName || 'Лого'} 
                    className="h-6 object-contain"
                  />
                ) : (
                  <Building className="h-6 w-6 text-foreground" />
                )}
                <span 
                  className="text-lg font-bold text-foreground"
                  style={{ fontFamily: settings?.themeFontFamily || 'Inter' }}
                >
                  {institutionData.name}
                </span>
              </div>
              <p 
                className="text-muted-foreground mb-4 text-sm"
                style={{ fontFamily: settings?.themeFontFamily || 'Inter' }}
              >
                Службени портал локалне самоуправе посвећен транспарентности
                и доступности информација грађанима.
              </p>
              
              {/* Social Media Links */}
              <div className="flex items-center space-x-4">
                {settings?.socialFacebook && (
                  <a 
                    href={settings.socialFacebook} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-muted-foreground hover:text-primary-dynamic transition-colors"
                    title="Facebook"
                  >
                    <Facebook className="h-5 w-5" />
                  </a>
                )}
                {settings?.socialTwitter && (
                  <a 
                    href={settings.socialTwitter} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-muted-foreground hover:text-primary-dynamic transition-colors"
                    title="Twitter"
                  >
                    <Twitter className="h-5 w-5" />
                  </a>
                )}
                {settings?.socialInstagram && (
                  <a 
                    href={settings.socialInstagram} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-muted-foreground hover:text-primary-dynamic transition-colors"
                    title="Instagram"
                  >
                    <Instagram className="h-5 w-5" />
                  </a>
                )}
                {settings?.socialLinkedin && (
                  <a 
                    href={settings.socialLinkedin} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-muted-foreground hover:text-primary-dynamic transition-colors"
                    title="LinkedIn"
                  >
                    <Linkedin className="h-5 w-5" />
                  </a>
                )}
                {settings?.socialYoutube && (
                  <a 
                    href={settings.socialYoutube} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-muted-foreground hover:text-primary-dynamic transition-colors"
                    title="YouTube"
                  >
                    <Youtube className="h-5 w-5" />
                  </a>
                )}
              </div>
              
              <p 
                className="text-sm text-muted-foreground mt-4"
                style={{ fontFamily: settings?.themeFontFamily || 'Inter' }}
              >
                © 2025 {institutionData.name}. Сва права задржана.
              </p>
            </div>

            <div>
              <h4 
                className="text-lg font-semibold mb-4 text-primary-dynamic"
                style={{ fontFamily: settings?.themeFontFamily || 'Inter' }}
              >
                Корисни линкови
              </h4>
              <div className="space-y-2">
                {pages.map((page) => (
                  <Link
                    key={page.id}
                    href={`/${page.slug}`}
                    className="block text-muted-foreground hover:text-primary-dynamic transition-colors text-sm"
                    style={{ fontFamily: settings?.themeFontFamily || 'Inter' }}
                  >
                    {page.title}
                  </Link>
                ))}
                <Link 
                  href="/dokumenti" 
                  className="block text-muted-foreground hover:text-primary-dynamic transition-colors text-sm"
                  style={{ fontFamily: settings?.themeFontFamily || 'Inter' }}
                >
                  Документи
                </Link>
                <Link 
                  href="/sitemap" 
                  className="block text-muted-foreground hover:text-primary-dynamic transition-colors text-sm"
                  style={{ fontFamily: settings?.themeFontFamily || 'Inter' }}
                >
                  Мапа сајта
                </Link>
              </div>
            </div>

            <div>
              <h4 
                className="text-lg font-semibold mb-4 text-primary-dynamic"
                style={{ fontFamily: settings?.themeFontFamily || 'Inter' }}
              >
                Контакт
              </h4>
              <div 
                className="space-y-2 text-muted-foreground text-sm"
                style={{ fontFamily: settings?.themeFontFamily || 'Inter' }}
              >
                <p>{institutionData.address}</p>
                <p>{institutionData.phone}</p>
                <p>{institutionData.email}</p>
                <p>{institutionData.workingHours}</p>
              </div>
              {institutionData.mapUrl && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-4 border-primary-dynamic text-primary-dynamic hover:bg-primary-dynamic hover:text-white"
                  asChild
                >
                  <a 
                    href={institutionData.mapUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    <MapPin className="mr-2 h-4 w-4" />
                    Прикажи на мапи
                  </a>
                </Button>
              )}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}