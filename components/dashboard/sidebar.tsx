// components/dashboard/sidebar.tsx
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
  Briefcase,
  BarChart3
} from 'lucide-react';

const menuItems = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Релоф Индекс',
    href: '/dashboard/relof-index',
    icon: BarChart3,
  },
  {
    title: 'Објаве',
    href: '/dashboard/posts',
    icon: PenTool,
  },
  {
    title: 'Странице',
    href: '/dashboard/pages',
    icon: FileText,
  },
  {
    title: 'Категорије',
    href: '/dashboard/categories',
    icon: FolderOpen,
  },
  {
    title: 'Услуге',
    href: '/dashboard/services',
    icon: Briefcase,
  },
  {
    title: 'Галерије',
    href: '/dashboard/galleries',
    icon: Grid3X3,
  },
  {
    title: 'Медији',
    href: '/dashboard/media',
    icon: Image,
  },
  {
    title: 'Mailer',
    href: '/dashboard/mailer',
    icon: Mail,
  },
  {
    title: 'Орг. структура',
    href: '/dashboard/organizational-structure',
    icon: Building2,
  },
  {
    title: 'Корисници',
    href: '/dashboard/users',
    icon: Users,
  },
  {
    title: 'Подешавања',
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