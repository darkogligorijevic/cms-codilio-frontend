// components/maintenance-mode.tsx
'use client';

import { useSettings } from '@/lib/settings-context';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle, Mail, Phone, Clock } from 'lucide-react';
import { mediaApi } from '@/lib/api';

export function MaintenanceMode() {
  const { settings } = useSettings();

  if (!settings?.maintenanceMode) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full">
        <CardContent className="p-12 text-center">
          {/* Logo */}
          {settings.siteLogo && (
            <img 
              src={mediaApi.getFileUrl(settings.siteLogo)} 
              alt={settings.siteName || 'Logo'} 
              className="h-16 mx-auto mb-8 object-contain"
            />
          )}

          {/* Icon */}
          <div className="mx-auto w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mb-6">
            <AlertTriangle className="h-10 w-10 text-yellow-600" />
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Sajt je u režimu održavanja
          </h1>

          {/* Message */}
          <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
            {settings.maintenanceMessage || 
             'Trenutno vršimo održavanje sistema. Molimo vas pokušajte ponovo za nekoliko minuta.'}
          </p>

          {/* Contact Info */}
          {(settings.contactPhone || settings.contactEmail) && (
            <div className="border-t pt-8">
              <p className="text-sm text-gray-500 mb-4">
                Za hitne slučajeve kontaktirajte nas:
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                {settings.contactPhone && (
                  <a 
                    href={`tel:${settings.contactPhone}`}
                    className="flex items-center text-blue-600 hover:text-blue-800"
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    {settings.contactPhone}
                  </a>
                )}
                
                {settings.contactEmail && (
                  <a 
                    href={`mailto:${settings.contactEmail}`}
                    className="flex items-center text-blue-600 hover:text-blue-800"
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    {settings.contactEmail}
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Working Hours */}
          {settings.contactWorkingHours && (
            <div className="mt-6 text-sm text-gray-500">
              <div className="flex items-center justify-center">
                <Clock className="h-4 w-4 mr-2" />
                Radno vreme: {settings.contactWorkingHours}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Middleware component to check maintenance mode
export function MaintenanceModeWrapper({ children }: { children: React.ReactNode }) {
  const { settings, isLoading } = useSettings();

  // Don't show maintenance mode in dashboard
  if (typeof window !== 'undefined' && window.location.pathname.startsWith('/dashboard')) {
    return <>{children}</>;
  }

  if (isLoading) {
    return null;
  }

  if (settings?.maintenanceMode) {
    return <MaintenanceMode />;
  }

  return <>{children}</>;
}