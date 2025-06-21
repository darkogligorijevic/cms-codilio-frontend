// components/frontend/header.tsx
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
    <header className="bg-gray-100 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50 dark:bg-gray-900">
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
              <h1 
                className="text-lg font-bold text-gray-900 dark:text-white" 
                style={{ fontFamily: settings?.themeFontFamily || 'Inter' }}
              >
                {institutionData.name}
              </h1>
              <p 
                className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block" 
                style={{ fontFamily: settings?.themeFontFamily || 'Inter' }}
              >
                {institutionData.description}
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link 
              href="/objave" 
              className="text-gray-700 dark:text-gray-300 hover:text-primary-dynamic transition-colors"
            >
              Објаве
            </Link>
            <Link 
              href="/dokumenti" 
              className="text-gray-700 dark:text-gray-300 hover:text-primary-dynamic transition-colors"
            >
              Документи
            </Link>
            {pages.slice(0, 3).map((page) => (
              <Link
                key={page.id}
                href={`/${page.slug}`}
                className="text-gray-700 dark:text-gray-300 hover:text-primary-dynamic transition-colors"
              >
                {page.title}
              </Link>
            ))}
            
            {settings?.themeDarkMode && (
              <ModeToggle />
            )}
            
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard">
                <ExternalLink className="mr-2 h-4 w-4" />
                CMS
              </Link>
            </Button>
          </nav>

          {/* Mobile Controls */}
          <div className='justify-end gap-2 items-center md:hidden flex'>
            {settings?.themeDarkMode && (
              <ModeToggle />
            )}
            
            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
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
          <div className="md:hidden py-4 border-t border-gray-200 dark:border-gray-700">
            <div className="space-y-2">
              <Link 
                href="/objave" 
                className="block px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Објаве
              </Link>
              <Link 
                href="/dokumenti" 
                className="block px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Документи
              </Link>
              {pages.slice(0, 3).map((page) => (
                <Link
                  key={page.id}
                  href={`/${page.slug}`}
                  className="block px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {page.title}
                </Link>
              ))}
              <Link 
                href="/dashboard" 
                className="block px-3 py-2 text-primary-dynamic hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md"
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