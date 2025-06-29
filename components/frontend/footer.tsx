// components/frontend/footer.tsx - Complete hierarchical footer
'use client';

import { useSettings } from '@/lib/settings-context';
import { Button } from '@/components/ui/button';
import { 
  Building,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Youtube,
  MapPin
} from 'lucide-react';
import Link from 'next/link';
import { mediaApi } from '@/lib/api';
import type { Page } from '@/lib/types';

interface FooterProps {
  pages: Page[];
}

export function Footer({ pages }: FooterProps) {
  const { settings } = useSettings();

  const institutionData = {
    name: settings?.siteName || "Локална институција",
    address: settings?.contactAddress || "Адреса институције",
    phone: settings?.contactPhone || "+381 11 123 4567",
    email: settings?.contactEmail || "info@institucija.rs",
    workingHours: settings?.contactWorkingHours || "Понедељак - Петак: 07:30 - 15:30",
    mapUrl: settings?.contactMapUrl,
  };

  // Flatten the hierarchical pages for footer display and remove duplicates
  const flattenPages = (pageList: Page[]): Page[] => {
    const result: Page[] = [];
    const addedIds = new Set<number>();
    
    const addPage = (page: Page) => {
      if (!addedIds.has(page.id)) {
        result.push(page);
        addedIds.add(page.id);
      }
    };
    
    pageList.forEach(page => {
      addPage(page);
      if (page.children && page.children.length > 0) {
        page.children.forEach(child => addPage(child));
      }
    });
    
    return result;
  };

  const allPages = flattenPages(pages);

  return (
    <footer className="bg-footer text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              {settings?.siteLogo ? (
                <img 
                  src={mediaApi.getFileUrl(settings.siteLogo)} 
                  alt={settings.siteName || 'Лого'} 
                  className="h-14 w-14 object-cover filter dark:brightness-0 dark:invert"
                />
              ) : (
                <div>
                <Building className="h-6 w-6" />
                <span 
                  className="text-lg font-bold"
                  style={{ fontFamily: settings?.themeFontFamily || 'Inter' }}
                >
                  {institutionData.name}
                </span>
              </div>
              )}
            </div>
            <p 
              className="text-gray-300 mb-4 text-sm"
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
                  className="text-gray-400 hover:text-white hover:text-primary-dynamic transition-colors"
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
                  className="text-gray-400 hover:text-white hover:text-primary-dynamic transition-colors"
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
                  className="text-gray-400 hover:text-white hover:text-primary-dynamic transition-colors"
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
                  className="text-gray-400 hover:text-white hover:text-primary-dynamic transition-colors"
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
                  className="text-gray-400 hover:text-white hover:text-primary-dynamic transition-colors"
                  title="YouTube"
                >
                  <Youtube className="h-5 w-5" />
                </a>
              )}
            </div>
            
            <p 
              className="text-sm text-gray-400 mt-4"
              style={{ fontFamily: settings?.themeFontFamily || 'Inter' }}
            >
              © 2025 {institutionData.name}. Сва права задржана.
            </p>
          </div>

          {/* Useful Links */}
          <div>
            <h4 
              className="text-lg font-semibold mb-4 text-primary-dynamic"
              style={{ fontFamily: settings?.themeFontFamily || 'Inter' }}
            >
              Корисни линкови
            </h4>
            <div className="space-y-2">
              {allPages.slice(0, 8).map((page) => (
                <Link
                  key={`footer-${page.id}`}
                  href={`/${page.slug}`}
                  className="block text-gray-300 hover:text-white hover:text-primary-dynamic transition-colors text-sm"
                  style={{ fontFamily: settings?.themeFontFamily || 'Inter' }}
                >
                  {page.parentId && (
                    <span className="text-gray-500 mr-2">└─</span>
                  )}
                  {page.title}
                </Link>
              ))}
              <Link 
                href="/sitemap" 
                className="block text-gray-300 hover:text-white hover:text-primary-dynamic transition-colors text-sm"
                style={{ fontFamily: settings?.themeFontFamily || 'Inter' }}
              >
                Мапа сајта
              </Link>
            </div>
          </div>

          {/* Contact Information */}
          <div>
            <h4 
              className="text-lg font-semibold mb-4 text-primary-dynamic"
              style={{ fontFamily: settings?.themeFontFamily || 'Inter' }}
            >
              Контакт
            </h4>
            <div 
              className="space-y-2 text-gray-300 text-sm"
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
  );
}