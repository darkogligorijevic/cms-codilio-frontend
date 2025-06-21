// app/login/page.tsx - Ажуриран за ћирилицу
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/auth-context';
import { useSettings } from '@/lib/settings-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Building } from 'lucide-react';
import { mediaApi } from '@/lib/api';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { login } = useAuth();
  const { settings } = useSettings();
  const router = useRouter();

  // Use settings for branding
  const siteName = settings?.siteName || "CMS Codilio";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await login({ email, password });
      toast("Успешно сте се пријавили", {
        description: `Добродошли у ${siteName} dashboard`,
      });
      router.push('/dashboard');
    } catch (error) {
      console.error('Login failed:', error);
      toast("Грешка при пријави", {
        description: "Молимо проверите емаил и лозинку и покушајте поново"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          {/* Logo */}
          {settings?.siteLogo ? (
            <div className="flex justify-center mb-4">
              <img 
                src={mediaApi.getFileUrl(settings.siteLogo)} 
                alt={settings.siteName || 'Лого'} 
                className="h-12 object-contain"
              />
            </div>
          ) : (
            <div className="flex justify-center mb-4">
              <Building className="h-12 w-12 text-primary-dynamic" />
            </div>
          )}
          
          <CardTitle className="text-2xl font-bold">{siteName}</CardTitle>
          <CardDescription>
            Пријавите се у администрациони панел
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Емаил</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isSubmitting}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Лозинка</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isSubmitting}
              />
            </div>
            
            <Button 
              variant="primary"
              type="submit" 
              className="w-full" 
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Пријављивање...' : 'Пријавите се'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}