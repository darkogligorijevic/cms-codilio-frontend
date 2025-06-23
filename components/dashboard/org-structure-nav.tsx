// components/dashboard/org-structure-nav.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Building2, Crown } from 'lucide-react';

const navItems = [
  {
    title: 'Структура',
    href: '/dashboard/organizational-structure',
    icon: Building2,
    description: 'Организационе јединице и контакти'
  },
  {
    title: 'Директори',
    href: '/dashboard/organizational-structure/directors',
    icon: Crown,
    description: 'Управљање директорима и документима'
  }
];

export function OrgStructureNav() {
  const pathname = usePathname();

  return (
    <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
      <nav className="-mb-px flex space-x-8">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors',
                isActive
                  ? 'border-primary-dynamic text-primary-dynamic'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200'
              )}
            >
              <item.icon 
                className={cn(
                  'mr-2 h-5 w-5',
                  isActive
                    ? 'text-primary-dynamic'
                    : 'text-gray-400 group-hover:text-gray-500 dark:group-hover:text-gray-300'
                )} 
              />
              <div>
                <div>{item.title}</div>
                <div className="text-xs text-gray-400 dark:text-gray-500">
                  {item.description}
                </div>
              </div>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}