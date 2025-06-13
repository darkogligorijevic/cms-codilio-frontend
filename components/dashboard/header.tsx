// components/dashboard/header.tsx
'use client';

import { useAuth } from '../../lib/auth-context';
import { useSettings } from '../../lib/settings-context';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { LogOut, User, Eye, Settings } from 'lucide-react';
import Link from 'next/link';
import { mediaApi } from '@/lib/api';

export function DashboardHeader() {
  const { user, logout } = useAuth();
  const { settings } = useSettings();

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  return (
    <header className="h-16 bg-white border-b flex items-center justify-between px-6">
      <div className="flex items-center space-x-4">
        {settings?.siteLogo && (
          <img 
            src={mediaApi.getFileUrl(settings.siteLogo)} 
            alt={settings.siteName || 'Logo'} 
            className="h-8 object-contain"
          />
        )}
        <div>
          <h1 className="text-lg font-semibold text-gray-900">
            {settings?.siteName || 'Administracioni panel'}
          </h1>
          {settings?.siteTagline && (
            <p className="text-xs text-gray-500">{settings.siteTagline}</p>
          )}
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <Button variant="outline" asChild>
          <Link href="/" target="_blank" className="flex items-center space-x-2">
            <Eye className="h-4 w-4" />
            <span>Pogledaj sajt</span>
          </Link>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-blue-500 text-white">
                  {user?.name?.charAt(0).toUpperCase() || 'A'}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user?.name}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user?.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              <span>Profil</span>
            </DropdownMenuItem>
            {user?.role === 'admin' && (
              <DropdownMenuItem asChild>
                <Link href="/dashboard/settings">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Podešavanja</span>
                </Link>
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Odjavite se</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}