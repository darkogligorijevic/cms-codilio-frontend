// components/dashboard/sidebar.tsx - Updated with Directors
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
  Crown
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
    submenu: [
      {
        title: 'Struktura',
        href: '/dashboard/organizational-structure',
        icon: Building2,
      },
      {
        title: 'Direktori',
        href: '/dashboard/organizational-structure/directors',
        icon: Crown,
      }
    ]
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

  const isSubmenuActive = (item: any) => {
    if (item.submenu) {
      return item.submenu.some((subItem: any) => isActive(subItem.href));
    }
    return false;
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
            const hasActiveSubmenu = isSubmenuActive(item);
            
            return (
              <div key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                    isItemActive && !item.submenu
                      ? 'bg-blue-50 text-primary-dynamic border-r-2 border-primary-dynamic'
                      : hasActiveSubmenu
                        ? 'bg-blue-25 text-primary-dynamic'
                        : 'text-gray-600 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100'
                  )}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.title}
                </Link>
                
                {/* Submenu */}
                {item.submenu && hasActiveSubmenu && (
                  <div className="ml-6 mt-1 space-y-1">
                    {item.submenu.map((subItem) => (
                      <Link
                        key={subItem.href}
                        href={subItem.href}
                        className={cn(
                          'flex items-center px-3 py-2 text-sm rounded-md transition-colors',
                          isActive(subItem.href)
                            ? 'bg-blue-100 dark:bg-blue-900/30 text-primary-dynamic font-medium'
                            : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-700 dark:hover:text-gray-300'
                        )}
                      >
                        <subItem.icon className="mr-2 h-4 w-4" />
                        {subItem.title}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </nav>
    </div>
  );
}