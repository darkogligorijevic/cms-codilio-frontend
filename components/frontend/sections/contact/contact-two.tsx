// components/frontend/sections/contact/contact-two.tsx
import { SectionData } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Phone, Mail, Clock, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ContactTwoSectionProps {
  data: SectionData;
  className?: string;
}

export function ContactTwoSection({ data, className }: ContactTwoSectionProps) {
  return (
    <section className={cn('', className)}>
      <div className="space-y-12">
        {/* Section Header */}
        {(data.title || data.description) && (
          <div className="text-center space-y-4">
            {data.title && (
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
                {data.title}
              </h2>
            )}
            
            {data.description && (
              <p className="text-lg text-gray-700 dark:text-gray-200 max-w-3xl mx-auto">
                {data.description}
              </p>
            )}
          </div>
        )}

        {/* Contact Cards Grid */}
        {data.contactInfo && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {/* Address Card */}
            {data.contactInfo.address && (
              <Card className="text-center">
                <CardHeader>
                  <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                    <MapPin className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">Adresa</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-300">
                    {data.contactInfo.address}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Phone Card */}
            {data.contactInfo.phone && (
              <Card className="text-center">
                <CardHeader>
                  <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                    <Phone className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">Telefon</CardTitle>
                </CardHeader>
                <CardContent>
                  <a 
                    href={`tel:${data.contactInfo.phone}`}
                    className="text-gray-600 dark:text-gray-300 hover:text-primary transition-colors"
                  >
                    {data.contactInfo.phone}
                  </a>
                </CardContent>
              </Card>
            )}

            {/* Email Card */}
            {data.contactInfo.email && (
              <Card className="text-center">
                <CardHeader>
                  <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                    <Mail className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">Email</CardTitle>
                </CardHeader>
                <CardContent>
                  <a 
                    href={`mailto:${data.contactInfo.email}`}
                    className="text-gray-600 dark:text-gray-300 hover:text-primary transition-colors break-all"
                  >
                    {data.contactInfo.email}
                  </a>
                </CardContent>
              </Card>
            )}

            {/* Working Hours Card */}
            {data.contactInfo.workingHours && (
              <Card className="text-center">
                <CardHeader>
                  <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                    <Clock className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">Radno vreme</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-300">
                    {data.contactInfo.workingHours}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Map Section */}
        {data.contactInfo?.mapUrl && (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-2xl font-bold mb-2">Lokacija</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Pronađite nas na mapi
              </p>
            </div>
            
            <div className="relative">
              <div className="aspect-video rounded-lg overflow-hidden shadow-lg">
                <iframe
                  src={data.contactInfo.mapUrl}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Mapa lokacije"
                />
              </div>
              
              {/* Map Overlay Link */}
              <a
                href={data.contactInfo.mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute top-4 right-4 bg-white dark:bg-gray-800 p-2 rounded-lg shadow-md hover:shadow-lg transition-shadow group"
                title="Otvori u Google Maps"
              >
                <ExternalLink className="h-5 w-5 text-gray-600 dark:text-gray-300 group-hover:text-primary" />
              </a>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}