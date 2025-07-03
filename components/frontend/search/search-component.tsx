// components/frontend/search/search-component.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Search,
  X,
  FileText,
  Building,
  User,
  Eye,
  Calendar,
  ChevronRight
} from 'lucide-react';
import Link from 'next/link';
import { postsApi, pagesApi, mediaApi } from '@/lib/api';
import { transliterate } from '@/lib/transliterate';
import type { Post, Page } from '@/lib/types';
import { cn } from '@/lib/utils';

interface SearchComponentProps {
  placeholder?: string;
  buttonText?: string;
  showDescription?: boolean;
  variant?: 'default' | 'compact' | 'inline';
  className?: string;
  onSearchSubmit?: (query: string) => void;
}

interface SearchResults {
  posts: Post[];
  pages: Page[];
}

// Function to convert Latin to Cyrillic
const latinToCyrillic = (text: string): string => {
  const map: Record<string, string> = {
    'A': 'А', 'B': 'Б', 'V': 'В', 'G': 'Г', 'D': 'Д',
    'Dj': 'Ђ', 'DJ': 'Ђ', 'E': 'Е', 'Ž': 'Ж', 'Z': 'З', 'I': 'И',
    'J': 'Ј', 'K': 'К', 'L': 'Л', 'Lj': 'Љ', 'LJ': 'Љ', 'M': 'М',
    'N': 'Н', 'Nj': 'Њ', 'NJ': 'Њ', 'O': 'О', 'P': 'П', 'R': 'Р',
    'S': 'С', 'T': 'Т', 'Ć': 'Ћ', 'C': 'Ц', 'U': 'У', 'F': 'Ф',
    'H': 'Х', 'Č': 'Ч', 'Dž': 'Џ', 'DŽ': 'Џ', 'Š': 'Ш',
    'a': 'а', 'b': 'б', 'v': 'в', 'g': 'г', 'd': 'д',
    'dj': 'ђ', 'e': 'е', 'ž': 'ж', 'z': 'з', 'i': 'и',
    'j': 'ј', 'k': 'к', 'l': 'л', 'lj': 'љ', 'm': 'м',
    'n': 'н', 'nj': 'њ', 'o': 'о', 'p': 'п', 'r': 'р',
    's': 'с', 't': 'т', 'ć': 'ћ', 'c': 'ц', 'u': 'у', 'f': 'ф',
    'h': 'х', 'č': 'ч', 'dž': 'џ', 'š': 'ш'
  };

  // First handle multi-character combinations
  let result = text;
  
  // Handle two-letter combinations first (order matters)
  const twoLetterCombos = ['Dj', 'DJ', 'Lj', 'LJ', 'Nj', 'NJ', 'Dž', 'DŽ', 'dj', 'lj', 'nj', 'dž'];
  twoLetterCombos.forEach(combo => {
    const regex = new RegExp(combo, 'g');
    result = result.replace(regex, map[combo] || combo);
  });

  // Then handle single characters
  result = result.split('').map(char => map[char] || char).join('');

  return result;
};

// Enhanced search function that handles both Cyrillic and Latin input
const enhancedSearch = (content: string, query: string): boolean => {
  const queryLower = query.toLowerCase();
  const contentLower = content.toLowerCase();
  
  // Search in original form
  if (contentLower.includes(queryLower)) {
    return true;
  }
  
  // Convert query from Latin to Cyrillic and search
  const cyrillicQuery = latinToCyrillic(queryLower);
  if (contentLower.includes(cyrillicQuery)) {
    return true;
  }
  
  // Convert content from Cyrillic to Latin and search with original query
  const latinContent = transliterate(contentLower);
  if (latinContent.includes(queryLower)) {
    return true;
  }
  
  return false;
};

export function SearchComponent({
  placeholder = "Унесите кључне речи...",
  buttonText = "Претражи",
  showDescription = true,
  variant = 'default',
  className,
  onSearchSubmit
}: SearchComponentProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResults>({ posts: [], pages: [] });
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

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

  const performSearch = async (query: string) => {
    if (!query.trim() || query.length < 3) return;

    try {
      setIsSearching(true);
      const [postsResponse, pagesResponse] = await Promise.all([
        postsApi.getPublished(1, 20),
        pagesApi.getPublished()
      ]);

      // Enhanced filtering using the new search function
      const filteredPosts = postsResponse.posts.filter(post =>
        enhancedSearch(post.title, query) ||
        enhancedSearch(post.excerpt || '', query) ||
        enhancedSearch(post.content, query) ||
        enhancedSearch(post.category?.name || '', query)
      ).slice(0, 5);

      const filteredPages = pagesResponse.filter(page =>
        enhancedSearch(page.title, query) ||
        enhancedSearch(String(page.content), query)
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
      if (onSearchSubmit) {
        onSearchSubmit(searchTerm);
      } else {
        // Default behavior - just perform search and show results
        performSearch(searchTerm);
      }
    }
  };

  const clearSearch = () => {
    setSearchTerm('');
    setSearchResults({ posts: [], pages: [] });
    setShowSearchResults(false);
  };

  // Enhanced highlight function that works with both scripts
  const highlightText = (text: string, query: string) => {
    if (!query) return text;
    
    // Create patterns for both original query and transliterated versions
    const patterns = [
      query,
      latinToCyrillic(query),
      transliterate(query)
    ].filter((pattern, index, arr) => 
      pattern && pattern !== query || index === 0
    );
    
    let result = text;
    patterns.forEach(pattern => {
      if (pattern && pattern !== text) {
        const regex = new RegExp(`(${pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
        result = result.replace(regex, (match) => 
          `<mark class="bg-yellow-200 px-1 rounded font-semibold">${match}</mark>`
        );
      }
    });
    
    return <span dangerouslySetInnerHTML={{ __html: result }} />;
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

  // Compact variant for hero sections
  if (variant === 'compact') {
    return (
      <div ref={searchRef} className={cn("relative max-w-md", className)}>
        <form onSubmit={handleSearchSubmit} className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400 z-10" />
          <Input
            placeholder={placeholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 pr-10 bg-white/90 text-gray-500 dark:bg-gray-800/90 focus-primary-dynamic"
            autoComplete="off"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 z-10"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </form>

        {/* Compact Search Results */}
        {showSearchResults && (searchResults.posts.length > 0 || searchResults.pages.length > 0) && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg border dark:border-gray-600 z-50 max-h-80 overflow-y-auto">
            {/* Quick results for compact view */}
            {searchResults.posts.slice(0, 3).map((post) => (
              <Link
                key={post.id}
                href={`/objave/${post.slug}`}
                onClick={clearSearch}
                className="block p-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-b last:border-b-0"
              >
                <div className="text-sm font-medium text-gray-900 dark:text-gray-100 line-clamp-1">
                  {highlightText(post.title, searchTerm)}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {getTimeAgo(post.publishedAt || post.createdAt)}
                </div>
              </Link>
            ))}
            
            {(searchResults.posts.length > 3 || searchResults.pages.length > 0) && (
              <div className="p-3 border-t dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50">
                <button
                  onClick={() => setShowSearchResults(false)}
                  className="text-sm font-medium flex items-center justify-center text-primary-dynamic hover:text-primary-dynamic/80 transition-colors w-full"
                >
                  Затвори резултате
                  <X className="ml-1 h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // Inline variant (just the search input)
  if (variant === 'inline') {
    return (
      <div ref={searchRef} className={cn("relative", className)}>
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder={placeholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 pr-10"
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
        </div>
      </div>
    );
  }

  // Default variant (full card)
  return (
    <Card className={cn("bg-white/10 backdrop-blur-sm border-none", className)}>
      <CardHeader>
        <CardTitle className="text-white">Претражи садржај</CardTitle>
        {showDescription && (
          <CardDescription className="text-blue-100">
            Пронађите објаве, документе и информације
          </CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <div ref={searchRef}>
          <form onSubmit={handleSearchSubmit} className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder={placeholder}
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
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 mx-auto border-primary-dynamic"></div>
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
              {buttonText}
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  );
}