// app/page.tsx
'use client';

import { useEffect, useState, useRef } from 'react';
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
  X
} from 'lucide-react';
import Link from 'next/link';
import { postsApi, pagesApi, categoriesApi, mediaApi } from '@/lib/api';
import type { Post, Page, Category } from '@/lib/types';

export default function HomePage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [pages, setPages] = useState<Page[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<{posts: Post[], pages: Page[]}>({posts: [], pages: []});
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchHomeData();
  }, []);

  // Debounced search effect
  useEffect(() => {
    if (searchTerm.length > 2) {
      const timeoutId = setTimeout(() => {
        performSearch(searchTerm);
      }, 300);
      return () => clearTimeout(timeoutId);
    } else {
      setShowSearchResults(false);
      setSearchResults({posts: [], pages: []});
    }
  }, [searchTerm]);

  // Click outside handler
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
      
      // Fetch real data from backend
      const [postsResponse, pagesResponse, categoriesResponse] = await Promise.all([
        postsApi.getPublished(1, 6), // Get first 6 published posts
        pagesApi.getPublished(), // Get all published pages
        categoriesApi.getAll() // Get all categories
      ]);

      setPosts(postsResponse.posts);
      setPages(pagesResponse);
      setCategories(categoriesResponse);
    } catch (error) {
      console.error('Error fetching home data:', error);
      
      // Fallback to empty arrays if API fails
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
      
      // Fetch search results from API
      const [postsResponse, pagesResponse] = await Promise.all([
        postsApi.getPublished(1, 20), // Get more posts for search
        pagesApi.getPublished()
      ]);

      // Client-side filtering - u realnoj aplikaciji bi ovo bio backend search endpoint
      const searchLower = query.toLowerCase();
      
      const filteredPosts = postsResponse.posts.filter(post => 
        post.title.toLowerCase().includes(searchLower) ||
        post.excerpt?.toLowerCase().includes(searchLower) ||
        post.content.toLowerCase().includes(searchLower) ||
        post.category?.name.toLowerCase().includes(searchLower)
      ).slice(0, 5); // Limit to 5 results

      const filteredPages = pagesResponse.filter(page => 
        page.title.toLowerCase().includes(searchLower) ||
        page.content.toLowerCase().includes(searchLower)
      ).slice(0, 3); // Limit to 3 results

      setSearchResults({
        posts: filteredPosts,
        pages: filteredPages
      });
      
      setShowSearchResults(true);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults({posts: [], pages: []});
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
    setSearchResults({posts: [], pages: []});
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
    
    if (diffInHours < 24) return `pre ${diffInHours} sati`;
    if (diffInHours < 168) return `pre ${Math.floor(diffInHours / 24)} dana`;
    return formatDate(dateString);
  };

  // Mock institutional data - ovo će kasnije doći iz settings/wizard-a
  const institutionData = {
    name: "Opština Mladenovac",
    description: "Službeni portal lokalne samouprave",
    address: "Trg Oslobođenja 1, 11400 Mladenovac",
    phone: "+381 11 823 4567",
    email: "info@mladenovac.rs",
    workingHours: "Ponedeljak - Petak: 07:30 - 15:30",
    citizens: "53.096",
    villages: "32",
    area: "339 km²"
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-3">
              <Building className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-lg font-bold text-gray-900">{institutionData.name}</h1>
                <p className="text-xs text-gray-500 hidden sm:block">{institutionData.description}</p>
              </div>
            </Link>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              <Link href="/objave" className="text-gray-700 hover:text-blue-600 transition-colors">
                Objave
              </Link>
              <Link href="/dokumenti" className="text-gray-700 hover:text-blue-600 transition-colors">
                Dokumenti
              </Link>
              {pages.slice(0, 3).map((page) => (
                <Link
                  key={page.id}
                  href={`/${page.slug}`}
                  className="text-gray-700 hover:text-blue-600 transition-colors"
                >
                  {page.title}
                </Link>
              ))}
              <Button variant="outline" size="sm" asChild>
                <Link href="/dashboard">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  CMS
                </Link>
              </Button>
            </nav>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>

          {/* Mobile Navigation */}
          {isMobileMenuOpen && (
            <div className="md:hidden py-4 border-t">
              <div className="space-y-2">
                <Link href="/objave" className="block px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-md">
                  Objave
                </Link>
                <Link href="/dokumenti" className="block px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-md">
                  Dokumenti
                </Link>
                {pages.slice(0, 3).map((page) => (
                  <Link
                    key={page.id}
                    href={`/${page.slug}`}
                    className="block px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-md"
                  >
                    {page.title}
                  </Link>
                ))}
                <Link href="/login" className="block px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-md">
                  CMS Login
                </Link>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold mb-4">
                Dobrodošli u {institutionData.name}
              </h2>
              <p className="text-lg lg:text-xl text-blue-100 mb-6">
                Transparentnost, dostupnost i efikasnost u službi građana. 
                Ovde možete pronaći sve važne informacije o radu naše institucije.
              </p>
              
              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-4 mt-8">
                <div className="text-center">
                  <div className="text-xl lg:text-2xl font-bold">{institutionData.citizens}</div>
                  <div className="text-sm text-blue-200">Građana</div>
                </div>
                <div className="text-center">
                  <div className="text-xl lg:text-2xl font-bold">{institutionData.villages}</div>
                  <div className="text-sm text-blue-200">Naselja</div>
                </div>
                <div className="text-center">
                  <div className="text-xl lg:text-2xl font-bold">{institutionData.area}</div>
                  <div className="text-sm text-blue-200">Površina</div>
                </div>
              </div>
            </div>
            
            <div>
              {/* Search Card */}
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardHeader>
                  <CardTitle className="text-white">Pretraži sadržaj</CardTitle>
                  <CardDescription className="text-blue-100">
                    Pronađite objave, dokumente i informacije
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div ref={searchRef}>
                    <form onSubmit={handleSearchSubmit} className="space-y-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Unesite ključne reči..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9 bg-white/90"
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
                        <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border z-50 max-h-96 overflow-y-auto">
                          {/* Posts Results */}
                          {searchResults.posts.length > 0 && (
                            <div className="p-3">
                              <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                                <FileText className="mr-2 h-4 w-4" />
                                Objave ({searchResults.posts.length})
                              </h4>
                              <div className="space-y-2">
                                {searchResults.posts.map((post) => (
                                  <Link
                                    key={post.id}
                                    href={`/objave/${post.slug}`}
                                    onClick={clearSearch}
                                    className="block p-2 hover:bg-gray-50 rounded-md transition-colors"
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
                                        <div className="text-sm font-medium text-gray-900 line-clamp-1">
                                          {highlightText(post.title, searchTerm)}
                                        </div>
                                        {post.excerpt && (
                                          <div className="text-xs text-gray-600 line-clamp-2 mt-1">
                                            {highlightText(post.excerpt.substring(0, 100), searchTerm)}
                                          </div>
                                        )}
                                        <div className="flex items-center space-x-2 mt-1">
                                          {post.category && (
                                            <Badge variant="secondary" className="text-xs">
                                              {post.category.name}
                                            </Badge>
                                          )}
                                          <span className="text-xs text-gray-500">
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
                            <div className="p-3 border-t">
                              <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                                <Building className="mr-2 h-4 w-4" />
                                Stranice ({searchResults.pages.length})
                              </h4>
                              <div className="space-y-2">
                                {searchResults.pages.map((page) => (
                                  <Link
                                    key={page.id}
                                    href={`/${page.slug}`}
                                    onClick={clearSearch}
                                    className="block p-2 hover:bg-gray-50 rounded-md transition-colors"
                                  >
                                    <div className="text-sm font-medium text-gray-900">
                                      {highlightText(page.title, searchTerm)}
                                    </div>
                                    <div className="text-xs text-gray-600 line-clamp-2 mt-1">
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
                            <div className="p-4 text-center text-gray-500">
                              <Search className="mx-auto h-8 w-8 text-gray-300 mb-2" />
                              <p className="text-sm">Nema rezultata za "{searchTerm}"</p>
                              <p className="text-xs text-gray-400 mt-1">
                                Pokušajte sa drugim ključnim rečima
                              </p>
                            </div>
                          )}
                          
                          {/* Loading */}
                          {isSearching && (
                            <div className="p-4 text-center">
                              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                              <p className="text-sm text-gray-500 mt-2">Pretraživanje...</p>
                            </div>
                          )}
                          
                          {/* Show more results link */}
                          {(searchResults.posts.length > 0 || searchResults.pages.length > 0) && (
                            <div className="p-3 border-t bg-gray-50">
                              <Link
                                href={`/pretraga?q=${encodeURIComponent(searchTerm)}`}
                                onClick={clearSearch}
                                className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center justify-center"
                              >
                                Prikaži sve rezultate
                                <ChevronRight className="ml-1 h-4 w-4" />
                              </Link>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    <Button 
                      type="submit"
                      className="w-full bg-white text-blue-600 hover:bg-blue-50"
                    >
                      <Search className="mr-2 h-4 w-4" />
                      Pretraži
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
              <h3 className="text-2xl font-bold text-gray-900">Najnovije objave</h3>
              <Button variant="outline" asChild>
                <Link href="/objave">
                  Sve objave
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>

            {isLoading ? (
              <div className="space-y-6">
                {[...Array(3)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-6">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
                      <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : posts.length > 0 ? (
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
                            <p className="text-gray-600 mb-3 text-sm lg:text-base">
                              {post.excerpt}
                            </p>
                          )}
                          
                          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
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
                  <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Nema objava</h3>
                  <p className="text-gray-500">Trenutno nema objavljenih objava.</p>
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
                  <CardTitle>Brzi linkovi</CardTitle>
                  <CardDescription>
                    Najčešće tražene informacije
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {pages.map((page) => (
                    <Link
                      key={page.id}
                      href={`/${page.slug}`}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                    >
                      <span className="text-sm font-medium">{page.title}</span>
                      <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600" />
                    </Link>
                  ))}
                  
                  <div className="pt-2 border-t">
                    <Link
                      href="/dokumenti"
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-blue-50 transition-colors text-blue-600 group"
                    >
                      <span className="text-sm font-medium flex items-center">
                        <Download className="mr-2 h-4 w-4" />
                        Svi dokumenti
                      </span>
                      <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Contact Info */}
            <Card>
              <CardHeader>
                <CardTitle>Kontakt informacije</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start space-x-3">
                  <MapPin className="h-4 w-4 text-gray-500 mt-0.5" />
                  <div className="text-sm">
                    <div className="font-medium text-gray-900">Adresa</div>
                    <div className="text-gray-600">{institutionData.address}</div>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <Phone className="h-4 w-4 text-gray-500 mt-0.5" />
                  <div className="text-sm">
                    <div className="font-medium text-gray-900">Telefon</div>
                    <div className="text-gray-600">{institutionData.phone}</div>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <Mail className="h-4 w-4 text-gray-500 mt-0.5" />
                  <div className="text-sm">
                    <div className="font-medium text-gray-900">Email</div>
                    <div className="text-gray-600">{institutionData.email}</div>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <Clock className="h-4 w-4 text-gray-500 mt-0.5" />
                  <div className="text-sm">
                    <div className="font-medium text-gray-900">Radno vreme</div>
                    <div className="text-gray-600">{institutionData.workingHours}</div>
                  </div>
                </div>
                
                <Button className="w-full mt-4" asChild>
                  <Link href="/kontakt">Kontaktiraj nas</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Categories */}
            {categories.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Kategorije objava</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((category) => (
                      <Badge
                        key={category.id}
                        variant="outline"
                        className="hover:bg-blue-50 hover:border-blue-200 cursor-pointer transition-colors"
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
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle className="text-blue-900">Transparentnost</CardTitle>
                <CardDescription className="text-blue-700">
                  Pristup informacijama od javnog značaja
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button variant="outline" size="sm" className="w-full justify-start hover:bg-blue-100" asChild>
                    <Link href="/budzet">
                      <TrendingUp className="mr-2 h-4 w-4" />
                      Budžet i finansije
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start hover:bg-blue-100" asChild>
                    <Link href="/javne-nabavke">
                      <FileText className="mr-2 h-4 w-4" />
                      Javne nabavke
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start hover:bg-blue-100" asChild>
                    <Link href="/sednice">
                      <Users className="mr-2 h-4 w-4" />
                      Zapisnici sa sednica
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Building className="h-6 w-6" />
                <span className="text-lg font-bold">{institutionData.name}</span>
              </div>
              <p className="text-gray-300 mb-4 text-sm">
                Službeni portal lokalne samouprave posvećen transparentnosti 
                i dostupnosti informacija građanima.
              </p>
              <p className="text-sm text-gray-400">
                © 2024 {institutionData.name}. Sva prava zadržana.
              </p>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Korisni linkovi</h4>
              <div className="space-y-2">
                {pages.map((page) => (
                  <Link
                    key={page.id}
                    href={`/${page.slug}`}
                    className="block text-gray-300 hover:text-white transition-colors text-sm"
                  >
                    {page.title}
                  </Link>
                ))}
                <Link href="/dokumenti" className="block text-gray-300 hover:text-white transition-colors text-sm">
                  Dokumenti
                </Link>
                <Link href="/sitemap" className="block text-gray-300 hover:text-white transition-colors text-sm">
                  Mapa sajta
                </Link>
              </div>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Kontakt</h4>
              <div className="space-y-2 text-gray-300 text-sm">
                <p>{institutionData.address}</p>
                <p>{institutionData.phone}</p>
                <p>{institutionData.email}</p>
                <p>{institutionData.workingHours}</p>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}