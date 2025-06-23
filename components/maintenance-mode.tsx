// components/maintenance-mode.tsx - Updated with Dark Mode Support
'use client';

import { useSettings } from '@/lib/settings-context';
import { Building, Wrench, Clock, Mail, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DarkModeToggle } from '@/components/ui/dark-mode-toggle';

interface MaintenanceModeWrapperProps {
  children: React.ReactNode;
}

export function MaintenanceModeWrapper({ children }: MaintenanceModeWrapperProps) {
  const { settings, isLoading } = useSettings();

  // Show loading while settings are being fetched
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-dynamic"></div>
      </div>
    );
  }

  // Check if maintenance mode is enabled
  const isMaintenanceMode = settings?.maintenanceMode;
  const maintenanceMessage = settings?.maintenanceMessage || 'Sajt je trenutno u održavanju. Molimo vas pokušajte ponovo za nekoliko minuta.';

  // If not in maintenance mode, render children normally
  if (!isMaintenanceMode) {
    return <>{children}</>;
  }

  // Render maintenance mode page
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 transition-colors duration-300">
      {/* Dark mode toggle in top right corner */}
      <div className="fixed top-4 right-4 z-50">
        <DarkModeToggle />
      </div>

      <div className="max-w-2xl w-full text-center">
        {/* Header with logo/branding */}
        <div className="flex items-center justify-center space-x-3 mb-8">
          {settings?.siteLogo ? (
            <img 
              src={`http://localhost:3001/api/media/file/${settings.siteLogo}`} 
              alt={settings.siteName || 'Лого'} 
              className="h-12 object-contain"
            />
          ) : (
            <Building className="h-12 w-12 text-primary-dynamic" />
          )}
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {settings?.siteName || 'CodilioCMS'}
            </h1>
            <p className="text-sm text-muted-foreground">
              {settings?.siteTagline || 'Content Management System'}
            </p>
          </div>
        </div>

        {/* Maintenance icon and animation */}
        <div className="relative mb-8">
          <div 
            className="mx-auto w-32 h-32 rounded-full flex items-center justify-center shadow-lg transition-all duration-300"
            style={{
              background: `linear-gradient(135deg, ${settings?.themePrimaryColor || '#3B82F6'}, ${settings?.themeSecondaryColor || '#10B981'})`
            }}
          >
            <Wrench className="h-16 w-16 text-white animate-pulse" />
          </div>
          
          {/* Animated circles */}
          <div className="absolute inset-0 rounded-full border-2 border-primary-dynamic animate-ping opacity-20"></div>
          <div className="absolute inset-4 rounded-full border-2 border-secondary-dynamic animate-ping opacity-30 animation-delay-1000"></div>
        </div>

        {/* Main maintenance card */}
        <Card className="shadow-lg border-0 bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-foreground mb-2">
              Sajt je u održavanju
            </CardTitle>
            <CardDescription className="text-lg text-muted-foreground">
              Radimo na poboljšanjima sistema
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Custom maintenance message */}
            <div className="bg-muted/50 rounded-lg p-4 border border-border">
              <p className="text-foreground leading-relaxed">
                {maintenanceMessage}
              </p>
            </div>

            {/* Expected completion time (if configured) */}
            <div className="flex items-center justify-center space-x-2 text-muted-foreground">
              <Clock className="h-5 w-5" />
              <span className="text-sm">
                Očekivano vreme završetka: uskoro
              </span>
            </div>

            {/* Contact information for urgent matters */}
            {(settings?.contactEmail || settings?.contactPhone) && (
              <div className="border-t border-border pt-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">
                  Za hitne slučajeve kontaktirajte nas:
                </h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  {settings?.contactEmail && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={`mailto:${settings.contactEmail}`}>
                        <Mail className="mr-2 h-4 w-4" />
                        Email
                      </a>
                    </Button>
                  )}
                  {settings?.contactPhone && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={`tel:${settings.contactPhone}`}>
                        <Phone className="mr-2 h-4 w-4" />
                        Telefon
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            )}

            {/* Admin login link */}
            <div className="border-t border-border pt-4">
              <Button variant="ghost" size="sm" asChild>
                <a href="/dashboard" className="text-muted-foreground hover:text-foreground">
                  Administratorski pristup →
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            © 2025 {settings?.siteName || 'CodilioCMS'}. Sva prava zadržana.
          </p>
        </div>
      </div>

      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-5">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-dynamic rounded-full animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary-dynamic rounded-full animate-pulse animation-delay-2000"></div>
      </div>

      {/* Custom animation delay utilities */}
      <style jsx>{`
        .animation-delay-1000 {
          animation-delay: 1s;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
    </div>
  );
}