// app/dashboard/services/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft,
  Edit,
  Trash2,
  Eye,
  Users,
  FileText,
  Phone,
  Mail,
  MapPin,
  Clock,
  Building,
  DollarSign,
  Globe,
  Calendar,
  User,
  BarChart3,
  Download,
  ExternalLink
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { servicesApi } from '@/lib/api';
import {
  Service,
  ServiceStatus,
  ServiceType,
  ServicePriority,
  ServiceDocument
} from '@/lib/types';
import { toast } from 'sonner';
import { useTheme } from 'next-themes';

export default function ServiceDetailPage() {
  const [service, setService] = useState<Service | null>(null);
  const [documents, setDocuments] = useState<ServiceDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  const router = useRouter();
  const params = useParams();
  const { theme } = useTheme();
  const serviceId = params?.id as string;

  useEffect(() => {
    if (serviceId) {
      fetchService();
      fetchDocuments();
    }
  }, [serviceId]);

  const fetchService = async () => {
    if (!serviceId) return;

    try {
      setIsLoading(true);
      const serviceData = await servicesApi.getById(parseInt(serviceId));
      setService(serviceData);
    } catch (error) {
      console.error('Error fetching service:', error);
      toast.error('Greška pri učitavanju usluge');
      router.push('/dashboard/services');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDocuments = async () => {
    if (!serviceId) return;

    try {
      const documentsData = await servicesApi.getDocuments(parseInt(serviceId));
      setDocuments(documentsData);
    } catch (error) {
      console.error('Error fetching documents:', error);
    }
  };

  const handleDelete = async () => {
    if (!service) return;

    try {
      await servicesApi.delete(service.id);
      toast.success('Usluga je uspešno obrisana');
      router.push('/dashboard/services');
    } catch (error) {
      console.error('Error deleting service:', error);
      toast.error('Greška pri brisanju usluge');
    }
  };

  const getStatusBadge = (status: ServiceStatus) => {
    return status === ServiceStatus.PUBLISHED ? (
      <Badge variant="default" className="bg-green-600">
        Objavljeno
      </Badge>
    ) : (
      <Badge variant="secondary">
        Nacrt
      </Badge>
    );
  };

  const getPriorityBadge = (priority: ServicePriority) => {
    const variants = {
      [ServicePriority.LOW]: 'secondary',
      [ServicePriority.MEDIUM]: 'default',
      [ServicePriority.HIGH]: 'destructive',
      [ServicePriority.URGENT]: 'destructive'
    };

    const labels = {
      [ServicePriority.LOW]: 'Nizak',
      [ServicePriority.MEDIUM]: 'Srednji',
      [ServicePriority.HIGH]: 'Visok',
      [ServicePriority.URGENT]: 'Hitan'
    };

    return (
      <Badge variant={variants[priority] as any}>
        {labels[priority]}
      </Badge>
    );
  };

  const getTypeLabel = (type: ServiceType) => {
    const labels = {
      [ServiceType.ADMINISTRATIVE]: 'Administrativne usluge',
      [ServiceType.CONSULTING]: 'Savetodavne usluge',
      [ServiceType.TECHNICAL]: 'Tehničke usluge',
      [ServiceType.LEGAL]: 'Pravne usluge',
      [ServiceType.EDUCATIONAL]: 'Obrazovne usluge',
      [ServiceType.HEALTH]: 'Zdravstvene usluge',
      [ServiceType.SOCIAL]: 'Socijalne usluge',
      [ServiceType.CULTURAL]: 'Kulturne usluge',
      [ServiceType.OTHER]: 'Ostalo'
    };
    return labels[type] || type;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getDocumentTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'form': 'Obrazac/Formular',
      'regulation': 'Pravilnik',
      'instruction': 'Upustvo',
      'example': 'Primer',
      'requirement': 'Uslov/Zahtev',
      'price_list': 'Cenovnik',
      'template': 'Šablon',
      'other': 'Ostalo'
    };
    return labels[type] || type;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium mb-2">Usluga nije pronađena</h3>
        <Button onClick={() => router.push('/dashboard/services')}>
          Nazad na listu usluga
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button 
            variant="outline" 
            onClick={() => router.push('/dashboard/services')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Nazad
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{service.name}</h1>
            <div className="flex items-center space-x-2 mt-1">
              {getStatusBadge(service.status)}
              {getPriorityBadge(service.priority)}
              <Badge variant="outline">{getTypeLabel(service.type)}</Badge>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={() => router.push(`/dashboard/services/${service.id}/documents`)}
          >
            <FileText className="mr-2 h-4 w-4" />
            Dokumenti ({documents.length})
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push(`/dashboard/services/${service.id}/edit`)}
          >
            <Edit className="mr-2 h-4 w-4" />
            Uredi
          </Button>
          <Button
            variant="destructive"
            onClick={() => setDeleteDialogOpen(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Obriši
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pregledi</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{service.viewCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Zahtevi</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{service.requestCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dokumenti</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{documents.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Redni broj</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{service.sortOrder}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Building className="h-5 w-5" />
              <span>Osnovne informacije</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-1">URL skraćenica</h4>
              <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-sm">
                {service.slug}
              </code>
            </div>
            
            {service.shortDescription && (
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-1">Kratki opis</h4>
                <p className="text-sm">{service.shortDescription}</p>
              </div>
            )}
            
            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-1">Opis</h4>
              <p className="text-sm whitespace-pre-wrap">{service.description}</p>
            </div>

            {service.price && (
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-1">Cena</h4>
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium">
                    {service.price} {service.currency || 'RSD'}
                  </span>
                </div>
              </div>
            )}

            {service.duration && (
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-1">Vreme realizacije</h4>
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-blue-600" />
                  <span className="text-sm">{service.duration}</span>
                </div>
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              {service.isOnline && (
                <Badge variant="outline" className="text-xs">
                  <Globe className="h-3 w-3 mr-1" />
                  Online usluga
                </Badge>
              )}
              {service.requiresAppointment && (
                <Badge variant="outline" className="text-xs">
                  <Calendar className="h-3 w-3 mr-1" />
                  Potrebno zakazivanje
                </Badge>
              )}
              {!service.isActive && (
                <Badge variant="destructive" className="text-xs">
                  Neaktivna
                </Badge>
              )}
              {!service.isPublic && (
                <Badge variant="secondary" className="text-xs">
                  Interni
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Contact & Location */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>Kontakt i lokacija</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {service.responsibleDepartment && (
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-1">Nadležno odeljenje</h4>
                <div className="flex items-center space-x-2">
                  <Building className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">{service.responsibleDepartment}</span>
                </div>
              </div>
            )}

            {service.contactPerson && (
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-1">Kontakt osoba</h4>
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">{service.contactPerson}</span>
                </div>
              </div>
            )}

            {service.contactPhone && (
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-1">Telefon</h4>
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-green-600" />
                  <a href={`tel:${service.contactPhone}`} className="text-sm text-blue-600 hover:underline">
                    {service.contactPhone}
                  </a>
                </div>
              </div>
            )}

            {service.contactEmail && (
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-1">Email</h4>
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-blue-600" />
                  <a href={`mailto:${service.contactEmail}`} className="text-sm text-blue-600 hover:underline">
                    {service.contactEmail}
                  </a>
                </div>
              </div>
            )}

            {service.location && (
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-1">Lokacija</h4>
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-red-500" />
                  <span className="text-sm">{service.location}</span>
                </div>
              </div>
            )}

            {service.workingHours && (
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-1">Radno vreme</h4>
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-orange-500" />
                  <span className="text-sm">{service.workingHours}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Requirements and Steps */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Requirements */}
        {service.requirements && service.requirements.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>Potrebna dokumenta</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {service.requirements.map((requirement, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-xs font-medium mt-0.5">
                      {index + 1}
                    </span>
                    <span className="text-sm">{requirement}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Steps */}
        {service.steps && service.steps.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5" />
                <span>Koraci za ostvarivanje</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {service.steps.map((step, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <span className="flex-shrink-0 w-6 h-6 bg-green-100 text-green-800 rounded-full flex items-center justify-center text-xs font-medium mt-0.5">
                      {index + 1}
                    </span>
                    <span className="text-sm">{step}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Documents Preview */}
      {documents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>Dokumenti ({documents.length})</span>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => router.push(`/dashboard/services/${service.id}/documents`)}
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                Upravljaj dokumentima
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2">
              {documents.slice(0, 4).map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-4 w-4 text-blue-600" />
                    <div>
                      <h4 className="font-medium text-sm">{doc.title}</h4>
                      <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                        <span>{getDocumentTypeLabel(doc.type)}</span>
                        <span>•</span>
                        <span>{formatFileSize(doc.size)}</span>
                        {doc.isPublic && (
                          <>
                            <span>•</span>
                            <Badge variant="outline" className="text-xs">Javno</Badge>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => servicesApi.downloadDocument(service.id, doc.id)}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
            {documents.length > 4 && (
              <div className="text-center mt-4">
                <Button 
                  variant="outline" 
                  onClick={() => router.push(`/dashboard/services/${service.id}/documents`)}
                >
                  Prikaži još {documents.length - 4} dokumenata
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Additional Info */}
      {service.additionalInfo && (
        <Card>
          <CardHeader>
            <CardTitle>Dodatne informacije</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">{service.additionalInfo}</p>
          </CardContent>
        </Card>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Potvrdi brisanje</DialogTitle>
            <DialogDescription>
              Da li ste sigurni da želite da obrišete uslugu{' '}
              <strong>{service.name}</strong>? Ova akcija će obrisati i sve
              povezane dokumente i ne može se poništiti.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setDeleteDialogOpen(false)}
            >
              Otkaži
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDelete}
            >
              Obriši uslugu
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}