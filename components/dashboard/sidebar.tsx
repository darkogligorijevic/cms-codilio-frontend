'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  FolderOpen, 
  Image, 
  Settings,
  PenTool,
  Mail,
  Building2,
  Crown,
  Grid3X3,
  Briefcase  // Add Services icon
} from 'lucide-react';

const menuItems = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Objave',
    href: '/dashboard/posts',
    icon: PenTool,
  },
  {
    title: 'Stranice',
    href: '/dashboard/pages',
    icon: FileText,
  },
  {
    title: 'Kategorije',
    href: '/dashboard/categories',
    icon: FolderOpen,
  },
  {
    title: 'Usluge',  // Add Services menu item
    href: '/dashboard/services',
    icon: Briefcase,
  },
  {
    title: 'Galerije',
    href: '/dashboard/galleries',
    icon: Grid3X3,
  },
  {
    title: 'Mediji',
    href: '/dashboard/media',
    icon: Image,
  },
  {
    title: 'Mailer',
    href: '/dashboard/mailer',
    icon: Mail,
  },
  {
    title: 'Org. struktura',
    href: '/dashboard/organizational-structure',
    icon: Building2,
  },
  {
    title: 'Korisnici',
    href: '/dashboard/users',
    icon: Users,
  },
  {
    title: 'Podešavanja',
    href: '/dashboard/settings',
    icon: Settings,
  },
];

export function DashboardSidebar() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-900 dark:border-r shadow-lg">
      <div className="flex h-16 items-center px-6 border-b">
        <Link href="/dashboard" className="text-xl font-bold text-gray-900 dark:text-white">
          CMS Codilio
        </Link>
      </div>
      
      <nav className="mt-6 px-3">
        <div className="space-y-1">
          {menuItems.map((item) => {
            const isItemActive = isActive(item.href);
            
            return (
              <div key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors hover:bg-blue-50 hover:text-primary-dynamic',
                    isItemActive && 'bg-blue-50 text-primary-dynamic border-r-2 border-primary-dynamic'
                  )}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.title}
                </Link>
              </div>
            );
          })}
        </div>
      </nav>
    </div>
  );
}