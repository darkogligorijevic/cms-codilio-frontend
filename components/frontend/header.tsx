'use client';

import { useState } from 'react';
import { useSettings } from '@/lib/settings-context';
import { Button } from '@/components/ui/button';
import { 
  Menu,
  X,
  Building,
  ExternalLink
} from 'lucide-react';
import Link from 'next/link';
import { mediaApi } from '@/lib/api';
import { ModeToggle } from '@/components/ui/mode-toggle';

interface Page {
  id: number;
  title: string;
  slug: string;
}

interface HeaderProps {
  pages: Page[];
}

export function Header({ pages }: HeaderProps) {
  const { settings } = useSettings();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const institutionData = {
    name: settings?.siteName || "Локална институција",
    description: settings?.siteTagline || "Службени портал локалне самоуправе",
  };

  return (
    <header className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 flex-shrink-0">
            {settings?.siteLogo ? (
              <img 
                src={mediaApi.getFileUrl(settings.siteLogo)} 
                alt={settings.siteName || 'Лого'} 
                className="h-8 object-contain dark:brightness-110"
              />
            ) : (
              <Building className="h-8 w-8 text-primary-dynamic" />
            )}
            <div className="hidden sm:block">
              <h1 
                className="text-lg font-bold text-gray-900 dark:text-white leading-tight" 
                style={{ fontFamily: settings?.themeFontFamily || 'Inter' }}
              >
                {institutionData.name}
              </h1>
              <p 
                className="text-xs text-gray-500 dark:text-gray-400 hidden md:block truncate max-w-[200px]" 
                style={{ fontFamily: settings?.themeFontFamily || 'Inter' }}
              >
                {institutionData.description}
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-6">
            <Link 
              href="/objave" 
              className="text-gray-700 dark:text-gray-200 hover:text-primary-dynamic dark:hover:text-primary-dynamic transition-colors font-medium"
            >
              Објаве
            </Link>
            <Link 
              href="/dokumenti" 
              className="text-gray-700 dark:text-gray-200 hover:text-primary-dynamic dark:hover:text-primary-dynamic transition-colors font-medium"
            >
              Документи
            </Link>
            {pages.slice(0, 3).map((page) => (
              <Link
                key={page.id}
                href={`/${page.slug}`}
                className="text-gray-700 dark:text-gray-200 hover:text-primary-dynamic dark:hover:text-primary-dynamic transition-colors font-medium"
              >
                {page.title}
              </Link>
            ))}
          </nav>

          {/* Desktop Controls */}
          <div className="hidden lg:flex items-center space-x-3">
            {settings?.themeDarkMode && (
              <ModeToggle />
            )}
            
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard" className="flex items-center">
                <ExternalLink className="mr-2 h-4 w-4" />
                CMS
              </Link>
            </Button>
          </div>

          {/* Mobile Controls */}
          <div className="flex lg:hidden items-center space-x-2">
            {settings?.themeDarkMode && (
              <ModeToggle />
            )}
            
            {/* Mobile menu button */}
            <button
              className="p-2 text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle navigation menu"
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
          <div className="lg:hidden py-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
            <div className="space-y-1">
              <Link 
                href="/objave" 
                className="block px-3 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-primary-dynamic rounded-md transition-colors font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Објаве
              </Link>
              <Link 
                href="/dokumenti" 
                className="block px-3 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-primary-dynamic rounded-md transition-colors font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Документи
              </Link>
              {pages.slice(0, 3).map((page) => (
                <Link
                  key={page.id}
                  href={`/${page.slug}`}
                  className="block px-3 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-primary-dynamic rounded-md transition-colors font-medium"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {page.title}
                </Link>
              ))}
              <div className="pt-2 border-t border-gray-200 dark:border-gray-700 mt-2">
                <Link 
                  href="/dashboard" 
                  className="block px-3 py-2 text-primary-dynamic hover:bg-primary-dynamic/10 dark:hover:bg-primary-dynamic/20 rounded-md transition-colors font-medium"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  CMS пријава
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}