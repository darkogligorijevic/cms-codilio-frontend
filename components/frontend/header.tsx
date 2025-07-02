// components/frontend/header.tsx - Updated with structured navigation
"use client";

import { useState, useEffect } from "react";
import { useSettings } from "@/lib/settings-context";
import { Button } from "@/components/ui/button";
import { Menu, X, Building, ExternalLink, ChevronDown } from "lucide-react";
import Link from "next/link";
import { mediaApi } from "@/lib/api";
import { ModeToggle } from "@/components/ui/mode-toggle";
import type { Page } from "@/lib/types";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";

interface HeaderProps {
  pages: Page[];
}

// Define the navigation structure we want
const NAVIGATION_STRUCTURE = [
  {
    id: 'o-nama',
    title: 'О нама',
    slug: 'o-nama',
    type: 'page',
    sortOrder: 1,
    children: [
      { slug: 'direktori', title: 'Директори' },
      { slug: 'organizaciona-struktura', title: 'Организациона структура' }
    ]
  },
  {
    id: 'usluge',
    title: 'Услуге',
    slug: 'usluge',
    type: 'page',
    sortOrder: 2,
    // Auto-populated from subpages of 'usluge'
    hasAutoSubpages: true
  },
  {
    id: 'dokumentacija',
    title: 'Документација',
    slug: 'dokumentacija',
    type: 'page',
    sortOrder: 3,
    // Auto-populated from subpages of 'dokumentacija'
    hasAutoSubpages: true
  },
  {
    id: 'objave',
    title: 'Објаве',
    slug: 'objave',
    type: 'page',
    sortOrder: 4,
    // Just link directly to posts page - categories are handled within the posts page
  },
  {
    id: 'galerija',
    title: 'Галерија',
    slug: 'galerija',
    type: 'page',
    sortOrder: 5,
    // Auto-populated from subpages of 'galerija'
    hasAutoSubpages: true
  }
];

export function Header({ pages }: HeaderProps) {
  const { settings } = useSettings();
  const context = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [hoveredDropdown, setHoveredDropdown] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const institutionData = {
    name: settings?.siteName || "Локална институција",
    description: settings?.siteTagline || "Службени портал локалне самоуправе",
  };

  // Helper function to find a page by slug
  const findPageBySlug = (slug: string): Page | undefined => {
    return pages.find(page => page.slug === slug);
  };

  // Helper function to get subpages for a parent page
  const getSubpages = (parentSlug: string): Page[] => {
    const parentPage = findPageBySlug(parentSlug);
    if (!parentPage) return [];
    
    return pages.filter(page => page.parentId === parentPage.id)
      .sort((a, b) => a.sortOrder - b.sortOrder);
  };

  // Build navigation items based on our structure
  const buildNavigationItems = () => {
    return NAVIGATION_STRUCTURE.map(navItem => {
      let children: Page[] = [];

      if (navItem.hasAutoSubpages) {
        // Get auto-generated subpages
        children = getSubpages(navItem.slug);
      } else if (navItem.children) {
        // Use predefined children, but check if pages exist
        children = navItem.children
          .map(child => findPageBySlug(child.slug))
          .filter((page): page is Page => page !== undefined);
      }

      return {
        ...navItem,
        page: findPageBySlug(navItem.slug),
        children
      };
    }).filter(item => {
      // Only include items that have a corresponding page
      return item.page;
    });
  };

  const navigationItems = buildNavigationItems();

  // Desktop Navigation Item Component
  const DesktopNavigationItem = ({ item }: { item: any }) => {
    const hasChildren = item.children && item.children.length > 0;

    if (!hasChildren) {
      // Simple link
      const href = `/${item.slug}`;
      return (
        <Link
          href={href}
          className={cn(
            "px-3 py-2 transition-colors duration-200",
            isScrolled
              ? "text-gray-700 dark:text-gray-300 hover:text-primary-dynamic"
              : "text-white hover:text-gray-200"
          )}
        >
          {item.title}
        </Link>
      );
    }

    // Dropdown with children
    return (
      <div
        className="relative group"
        onMouseEnter={() => setHoveredDropdown(item.id)}
        onMouseLeave={() => setHoveredDropdown(null)}
      >
        <Link
          href={`/${item.slug}`}
          className={cn(
            "flex items-center space-x-1 px-3 py-2 transition-colors duration-200 font-medium",
            isScrolled
              ? "text-gray-800 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400"
              : "text-white hover:text-blue-200 drop-shadow-sm"
          )}
        >
          <span>{item.title}</span>
          <ChevronDown
            className={`h-4 w-4 transition-transform duration-200 ${
              hoveredDropdown === item.id ? "rotate-180" : ""
            }`}
          />
        </Link>

        {/* Desktop Dropdown */}
        <div
          className={`
            absolute top-full left-0 min-w-[250px] bg-white dark:bg-gray-800 shadow-xl border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden z-50
            transition-all duration-300 ease-out
            ${
              hoveredDropdown === item.id
                ? "opacity-100 visible transform translate-y-0"
                : "opacity-0 invisible transform -translate-y-2"
            }
          `}
        >
          {/* Parent Page Link */}
          <Link
            href={`/${item.slug}`}
            className="block px-4 py-3 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150 border-b border-gray-100 dark:border-gray-600 font-semibold"
          >
            <div className="flex items-center">{item.title}</div>
          </Link>

          {/* Children Pages */}
          <div className="py-2">
            {item.children.map((child: Page) => (
              <Link
                key={child.id}
                href={`/${child.slug}`}
                className="flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-150"
              >
                <span className="w-6 h-4 flex items-center justify-start text-gray-400 mr-2">
                  └─
                </span>
                <span>{child.title}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Mobile Navigation Item Component
  const MobileNavigationItem = ({ item }: { item: any }) => {
    const [isOpen, setIsOpen] = useState(false);
    const hasChildren = item.children && item.children.length > 0;

    if (!hasChildren) {
      const href = `/${item.slug}`;
      return (
        <Link
          href={href}
          className="block px-3 py-3 text-white hover:bg-gray-800/50 rounded-lg transition-colors duration-200 font-medium"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          {item.title}
        </Link>
      );
    }

    return (
      <div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between px-3 py-3 text-white hover:bg-gray-800/50 rounded-lg transition-colors duration-200 font-medium"
        >
          <span>{item.title}</span>
          <ChevronDown
            className={`h-4 w-4 transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {isOpen && (
          <div className="ml-3 mt-1 space-y-1 border-l-2 border-gray-700/50 pl-3">
            {/* Parent link */}
            <Link
              href={`/${item.slug}`}
              className="block px-3 py-2 text-gray-300 hover:bg-gray-800/50 hover:text-white rounded-md text-sm font-medium transition-colors duration-200"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {item.title}
            </Link>
            
            {/* Children links */}
            {item.children.map((child: Page) => (
              <Link
                key={child.id}
                href={`/${child.slug}`}
                className="flex items-center px-3 py-2 text-gray-300 hover:bg-gray-800/50 hover:text-white rounded-md text-sm transition-colors duration-200"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <span className="text-gray-500 mr-2">└─</span>
                {child.title}
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out",
        isScrolled
          ? "bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl shadow-lg border-b border-gray-200/20 dark:border-gray-700/50"
          : "bg-gradient-to-r from-black/60 via-black/40 to-black/60 backdrop-blur-md shadow-lg"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3">
            {settings?.siteLogo ? (
              <img
                src={mediaApi.getFileUrl(settings.siteLogo)}
                alt={settings.siteName || "Лого"}
                className="h-16 w-16 object-contain"
              />
            ) : (
              <div className="flex items-center gap-2">
                <Building
                  className={cn(
                    "h-8 w-8 transition-colors duration-200",
                    isScrolled ? "text-blue-600 dark:text-blue-400" : "text-white drop-shadow-sm"
                  )}
                />
                <h1
                  className={cn(
                    "text-lg font-bold transition-colors duration-200",
                    isScrolled ? "text-gray-900 dark:text-white" : "text-white drop-shadow-sm"
                  )}
                  style={{ fontFamily: settings?.themeFontFamily || "Inter" }}
                >
                  {institutionData.name}
                </h1>
              </div>
            )}
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-2">
            {navigationItems.map((item) => (
              <DesktopNavigationItem key={item.id} item={item} />
            ))}

            <div className="flex items-center space-x-4 ml-4">
              {settings?.themeDarkMode && <ModeToggle />}
              {context?.isAuthenticated && (
                <Button
                  variant={isScrolled ? "outline" : "secondary"}
                  size="sm"
                  asChild
                  className={cn(
                    "transition-all duration-200",
                    !isScrolled &&
                      "bg-white/20 border-white/30 text-white hover:bg-white/30"
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
          <div className="justify-end gap-2 items-center md:hidden flex">
            {settings?.themeDarkMode && <ModeToggle />}

            {/* Mobile menu button */}
            <button
              className={cn(
                "md:hidden p-2 transition-colors duration-200 rounded-md",
                isScrolled
                  ? "text-gray-800 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
                  : "text-white hover:text-blue-200 hover:bg-white/10 drop-shadow-sm"
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
          <div className="md:hidden absolute top-full left-0 right-0 bg-gray-900/95 backdrop-blur-lg border-t border-gray-700/50">
            <div className="px-4 py-4 space-y-1">
              {navigationItems.map((item) => (
                <MobileNavigationItem key={item.id} item={item} />
              ))}

              {context?.isAuthenticated && (
                <div className="pt-3 border-t border-gray-700/50 mt-3">
                  <Link
                    href="/dashboard"
                    className="flex items-center px-3 py-2 text-blue-400 hover:bg-gray-800/50 rounded-md font-medium"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    CMS пријава
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}