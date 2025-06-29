// components/frontend/header.tsx - Transparent header with scroll background
'use client';

import { useState, useEffect } from 'react';
import { useSettings } from '@/lib/settings-context';
import { Button } from '@/components/ui/button';
import { 
  Menu,
  X,
  Building,
  ExternalLink,
  ChevronDown
} from 'lucide-react';
import Link from 'next/link';
import { mediaApi } from '@/lib/api';
import { ModeToggle } from '@/components/ui/mode-toggle';
import type { Page } from '@/lib/types';
import { useAuth } from '@/lib/auth-context';
import { cn } from '@/lib/utils';

interface HeaderProps {
  pages: Page[];
}

export function Header({ pages }: HeaderProps) {
  const { settings } = useSettings();
  const context = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [hoveredDropdown, setHoveredDropdown] = useState<number | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 10); // Change background after 10px scroll
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const institutionData = {
    name: settings?.siteName || "Локална институција",
    description: settings?.siteTagline || "Службени портал локалне самоуправе",
  };

  // Helper function to check if a page has children
  const hasChildren = (page: Page): boolean => {
    return !!(page.children && page.children.length > 0);
  };

  // Helper function to get root pages
  const getRootPages = (pageList: Page[]): Page[] => {
    return pageList.filter(page => !page.parentId);
  };

  // Custom Hover Dropdown Component
  const HoverDropdown = ({ page, isMobile = false }: { page: Page; isMobile?: boolean }) => {
    const pageHasChildren = hasChildren(page);

    if (pageHasChildren) {
      return (
        <div 
          className="relative group"
          onMouseEnter={() => !isMobile && setHoveredDropdown(page.id)}
          onMouseLeave={() => !isMobile && setHoveredDropdown(null)}
        >
          <Link
            href={`/${page.slug}`}
            className={cn(
              "flex items-center space-x-1 transition-colors duration-200",
              isMobile 
                ? "w-full px-3 py-2 text-left hover:bg-white/10 rounded-md" 
                : "px-3 py-2",
              // Dynamic text colors based on scroll state
              isScrolled || isMobile 
                ? "text-gray-700 dark:text-gray-300 hover:text-primary-dynamic" 
                : "text-white hover:text-gray-200"
            )}
            onClick={() => isMobile && setIsMobileMenuOpen(false)}
          >
            <span>{page.title}</span>
            <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${
              hoveredDropdown === page.id || isMobile ? 'rotate-180' : ''
            }`} />
          </Link>
          
          {/* Desktop Hover Dropdown */}
          {!isMobile && (
            <div className={`
              absolute top-full left-0 min-w-[250px] bg-white dark:bg-gray-800 shadow-xl border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden z-50
              transition-all duration-300 ease-out
              ${hoveredDropdown === page.id 
                ? 'opacity-100 visible transform translate-y-0' 
                : 'opacity-0 invisible transform -translate-y-2'
              }
            `}>
              {/* Parent Page Link */}
              <Link
                href={`/${page.slug}`}
                className="block px-4 py-3 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150 border-b border-gray-100 dark:border-gray-600 font-medium"
              >
                <div className="flex items-center">
                  {page.title}
                </div>
              </Link>
              
              {/* Children Pages */}
              <div className="py-2">
                {page.children?.map((child, index) => (
                  <Link
                    key={`${page.id}-child-${child.id}-${index}`}
                    href={`/${child.slug}`}
                    className="flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-primary-dynamic transition-colors duration-150"
                  >
                    <span className="w-6 h-4 flex items-center justify-start text-gray-400 mr-2">└─</span>
                    <span>{child.title}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Mobile Dropdown */}
          {isMobile && hoveredDropdown === page.id && (
            <div className="ml-4 mt-2 space-y-1">
              {page.children?.map((child, index) => (
                <Link
                  key={`mobile-${page.id}-child-${child.id}-${index}`}
                  href={`/${child.slug}`}
                  className="flex items-center px-3 py-2 text-white/80 hover:bg-white/10 rounded-md text-sm"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <span className="text-white/60 mr-2">└─</span>
                  {child.title}
                </Link>
              ))}
            </div>
          )}
        </div>
      );
    }

    // Simple link for pages without children
    return (
      <Link
        href={`/${page.slug}`}
        className={cn(
          "transition-colors duration-200",
          isMobile ? "block px-3 py-2 hover:bg-white/10 rounded-md" : "px-3 py-2",
          // Dynamic text colors based on scroll state
          isScrolled || isMobile 
            ? "text-gray-700 dark:text-gray-300 hover:text-primary-dynamic" 
            : "text-white hover:text-gray-200"
        )}
        onClick={() => isMobile && setIsMobileMenuOpen(false)}
      >
        {page.title}
      </Link>
    );
  };

  // Mobile Navigation Item with Click Toggle
  const MobileNavigationItem = ({ page }: { page: Page }) => {
    const pageHasChildren = hasChildren(page);
    const [isOpen, setIsOpen] = useState(false);

    if (pageHasChildren) {
      return (
        <div>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="w-full flex items-center justify-between px-3 py-2 text-white hover:bg-white/10 rounded-md"
          >
            <span>{page.title}</span>
            <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
          </button>
          
          {isOpen && (
            <div className="ml-4 mt-2 space-y-1">
              <Link
                href={`/${page.slug}`}
                className="block px-3 py-2 text-white hover:bg-white/10 rounded-md text-sm font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <div className="flex items-center">
                  {page.title}
                </div>
              </Link>
              {page.children?.map((child, index) => (
                <Link
                  key={`mobile-nav-${page.id}-child-${child.id}-${index}`}
                  href={`/${child.slug}`}
                  className="flex items-center px-3 py-2 text-white/80 hover:bg-white/10 rounded-md text-sm"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <span className="text-white/60 mr-2">└─</span>
                  {child.title}
                </Link>
              ))}
            </div>
          )}
        </div>
      );
    }

    return (
      <Link
        href={`/${page.slug}`}
        className="block px-3 py-2 text-white hover:bg-white/10 rounded-md"
        onClick={() => setIsMobileMenuOpen(false)}
      >
        {page.title}
      </Link>
    );
  };

  // Get root pages and limit for display
  const rootPages = getRootPages(pages);
  const desktopPages = rootPages.slice(0, 3);
  const mobilePages = rootPages;

  return (
    <header className={cn(
      "fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out",
      isScrolled 
        ? "bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-lg " 
        : "bg-black/15 backdrop-blur-sm "
    )}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3">
            {settings?.siteLogo ? (
              <img 
                src={mediaApi.getFileUrl(settings.siteLogo)} 
                alt={settings.siteName || 'Лого'} 
                className="h-16 w-16 object-contain"
              />
            ) : (
              <div className='flex items-center gap-2'>
                <Building className={cn(
                  "h-8 w-8 transition-colors duration-200",
                  isScrolled ? "text-primary-dynamic" : "text-white"
                )}
                />
                        
                <h1 
                  className={cn(
                    "text-lg font-bold transition-colors duration-200",
                    isScrolled ? "text-gray-900 dark:text-white" : "text-white"
                  )}
                  style={{ fontFamily: settings?.themeFontFamily || 'Inter' }}
                >
                  {institutionData.name}
                </h1>
              </div>
              
            )}

          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-2">
            
            {/* Dynamic pages navigation */}
            {desktopPages.map((page, index) => (
              <HoverDropdown key={`desktop-${page.id}-${index}`} page={page} />
            ))}

            
            <div className="flex items-center space-x-4 ml-4">
              {settings?.themeDarkMode && (
                <ModeToggle />
              )}
              {context?.isAuthenticated && (
                <Button 
                  variant={isScrolled ? "outline" : "secondary"} 
                  size="sm" 
                  asChild
                  className={cn(
                    "transition-all duration-200",
                    !isScrolled && "bg-white/20 border-white/30 text-white hover:bg-white/30"
                  )}
                >
                  <Link href="/dashboard">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    CMS
                  </Link>
                </Button>
              )}
            </div>
          </nav>

          {/* Mobile Controls */}
          <div className='justify-end gap-2 items-center md:hidden flex'>
            {settings?.themeDarkMode && (
              <ModeToggle />
            )}
            
            {/* Mobile menu button */}
            <button
              className={cn(
                "md:hidden p-2 transition-colors duration-200",
                isScrolled 
                  ? "text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white" 
                  : "text-white hover:text-gray-200"
              )}
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
          <div className="md:hidden py-4 border-t border-white/30 bg-black/70 backdrop-blur-lg rounded-b-lg mx-4">
            <div className="space-y-2">
              
              {/* Dynamic pages navigation for mobile */}
              {mobilePages.map((page, index) => (
                <MobileNavigationItem key={`mobile-main-${page.id}-${index}`} page={page} />
              ))}
              <Link 
                href="/objave" 
                className="block px-3 py-2 text-white hover:bg-white/10 rounded-md"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Објаве
              </Link>
              
              <Link 
                href="/dashboard" 
                className="block px-3 py-2 text-blue-300 hover:bg-white/10 rounded-md"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                CMS пријава
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}