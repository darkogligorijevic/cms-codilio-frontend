// components/dashboard/sidebar.tsx - Updated with Mailer
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
  Mail
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

  return (
    <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg">
      <div className="flex h-16 items-center px-6 border-b">
        <Link href="/dashboard" className="text-xl font-bold text-gray-900">
          CMS Codilio
        </Link>
      </div>
      
      <nav className="mt-6 px-3">
        <div className="space-y-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.href || 
              (item.href !== '/dashboard' && pathname.startsWith(item.href));
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                  isActive
                    ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                )}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.title}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}