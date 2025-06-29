import { SectionData } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ContactOneSectionProps {
  data: SectionData;
  className?: string;
}

export function ContactOneSection({ data, className }: ContactOneSectionProps) {
  return (
    <section className={cn('', className)}>
      <div className="grid gap-12 lg:grid-cols-2">
        {/* Contact Form */}
        <div className="space-y-6">
          {data.title && (
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              {data.title}
            </h2>
          )}
          
          {data.description && (
            <p className="text-lg text-gray-700 dark:text-gray-200">
              {data.description}
            </p>
          )}

          <form className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Име и презиме</Label>
                <Input id="name" placeholder="Vaše ime" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Имејл</Label>
                <Input id="email" type="email" placeholder="vas@email.com" />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="subject">Наслов</Label>
              <Input id="subject" placeholder="Naslov poruke" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="message">Порука</Label>
              <Textarea id="message" placeholder="Vaša poruka..." rows={5} />
            </div>
            
            <Button type="submit" size="lg" className="w-full sm:w-auto">
              Пошаљите поруку
            </Button>
          </form>
        </div>

        {/* Contact Information */}
        <div className="space-y-6">
          {data.subtitle && (
            <h3 className="text-2xl font-bold">
              {data.subtitle}
            </h3>
          )}

          {data.contactInfo && (
            <div className="space-y-4">
              {data.contactInfo.address && (
                <div className="flex items-start space-x-3">
                  <MapPin className="h-5 w-5 text-gray-600 dark:text-gray-300 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Адреса</p>
                    <p className="text-gray-600 dark:text-gray-300">{data.contactInfo.address}</p>
                  </div>
                </div>
              )}

              {data.contactInfo.phone && (
                <div className="flex items-start space-x-3">
                  <Phone className="h-5 w-5 text-gray-600 dark:text-gray-300 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Телефон</p>
                    <p className="text-gray-600 dark:text-gray-300">{data.contactInfo.phone}</p>
                  </div>
                </div>
              )}

              {data.contactInfo.email && (
                <div className="flex items-start space-x-3">
                  <Mail className="h-5 w-5 text-gray-600 dark:text-gray-300 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Имејл</p>
                    <p className="text-gray-600 dark:text-gray-300">{data.contactInfo.email}</p>
                  </div>
                </div>
              )}

              {data.contactInfo.workingHours && (
                <div className="flex items-start space-x-3">
                  <Clock className="h-5 w-5 text-gray-600 dark:text-gray-300 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Радно време</p>
                    <p className="text-gray-600 dark:text-gray-300">{data.contactInfo.workingHours}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Map */}
          {data.contactInfo?.mapUrl && (
            <div className="aspect-video rounded-lg overflow-hidden">
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
          )}
        </div>
      </div>
    </section>
  );
}