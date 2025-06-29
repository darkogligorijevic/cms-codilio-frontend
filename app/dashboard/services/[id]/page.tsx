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
      toast.error('Грешка при учитавању услуге');
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
      toast.success('Услуга је успешно обрисана');
      router.push('/dashboard/services');
    } catch (error) {
      console.error('Error deleting service:', error);
      toast.error('Грешка при брисању услуге');
    }
  };

  const getStatusBadge = (status: ServiceStatus) => {
    return status === ServiceStatus.PUBLISHED ? (
      <Badge variant="default" className="bg-green-600">
        Објављено
      </Badge>
    ) : (
      <Badge variant="secondary">
        Нацрт
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
      [ServicePriority.LOW]: 'Низак',
      [ServicePriority.MEDIUM]: 'Средњи',
      [ServicePriority.HIGH]: 'Висок',
      [ServicePriority.URGENT]: 'Хитан'
    };

    return (
      <Badge variant={variants[priority] as any}>
        {labels[priority]}
      </Badge>
    );
  };

  const getTypeLabel = (type: ServiceType) => {
    const labels = {
      [ServiceType.ADMINISTRATIVE]: 'Административне услуге',
      [ServiceType.CONSULTING]: 'Саветодавне услуге',
      [ServiceType.TECHNICAL]: 'Техничке услуге',
      [ServiceType.LEGAL]: 'Правне услуге',
      [ServiceType.EDUCATIONAL]: 'Образовне услуге',
      [ServiceType.HEALTH]: 'Здравствене услуге',
      [ServiceType.SOCIAL]: 'Социјалне услуге',
      [ServiceType.CULTURAL]: 'Културне услуге',
      [ServiceType.OTHER]: 'Остало'
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
      'form': 'Образац/Формулар',
      'regulation': 'Правилник',
      'instruction': 'Упутство',
      'example': 'Пример',
      'requirement': 'Услов/Захтев',
      'price_list': 'Ценовник',
      'template': 'Шаблон',
      'other': 'Остало'
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
        <h3 className="text-lg font-medium mb-2">Услуга није пронађена</h3>
        <Button onClick={() => router.push('/dashboard/services')}>
          Назад на листу услуга
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
            Назад
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
            Документи ({documents.length})
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push(`/dashboard/services/${service.id}/edit`)}
          >
            <Edit className="mr-2 h-4 w-4" />
            Уреди
          </Button>
          <Button
            variant="destructive"
            onClick={() => setDeleteDialogOpen(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Обриши
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Прегледи</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{service.viewCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Захтеви</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{service.requestCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Документи</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{documents.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Редни број</CardTitle>
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
              <span>Основне информације</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-1">URL скраћеница</h4>
              <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-sm">
                {service.slug}
              </code>
            </div>
            
            {service.shortDescription && (
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-1">Кратки опис</h4>
                <p className="text-sm">{service.shortDescription}</p>
              </div>
            )}
            
            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-1">Опис</h4>
              <p className="text-sm whitespace-pre-wrap">{service.description}</p>
            </div>

            {service.price && (
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-1">Цена</h4>
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
                <h4 className="font-medium text-sm text-muted-foreground mb-1">Време реализације</h4>
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
                  Онлајн услуга
                </Badge>
              )}
              {service.requiresAppointment && (
                <Badge variant="outline" className="text-xs">
                  <Calendar className="h-3 w-3 mr-1" />
                  Потребно заказивање
                </Badge>
              )}
              {!service.isActive && (
                <Badge variant="destructive" className="text-xs">
                  Неактивна
                </Badge>
              )}
              {!service.isPublic && (
                <Badge variant="secondary" className="text-xs">
                  Интерни
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
              <span>Контакт и локација</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {service.responsibleDepartment && (
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-1">Надлежно одељење</h4>
                <div className="flex items-center space-x-2">
                  <Building className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">{service.responsibleDepartment}</span>
                </div>
              </div>
            )}

            {service.contactPerson && (
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-1">Контакт особа</h4>
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">{service.contactPerson}</span>
                </div>
              </div>
            )}

            {service.contactPhone && (
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-1">Телефон</h4>
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
                <h4 className="font-medium text-sm text-muted-foreground mb-1">Емаил</h4>
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
                <h4 className="font-medium text-sm text-muted-foreground mb-1">Локација</h4>
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-red-500" />
                  <span className="text-sm">{service.location}</span>
                </div>
              </div>
            )}

            {service.workingHours && (
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-1">Радно време</h4>
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
                <span>Потребна документа</span>
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
                <span>Кораци за остваривање</span>
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
                <span>Документи ({documents.length})</span>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => router.push(`/dashboard/services/${service.id}/documents`)}
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                Управљај документима
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
                            <Badge variant="outline" className="text-xs">Јавно</Badge>
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
                  Прикажи још {documents.length - 4} докумената
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
            <CardTitle>Додатне информације</CardTitle>
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
            <DialogTitle>Потврди брисање</DialogTitle>
            <DialogDescription>
              Да ли сте сигурни да желите да обришете услугу{' '}
              <strong>{service.name}</strong>? Ова акција ће обрисати и све
              повезане документе и не може се поништити.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setDeleteDialogOpen(false)}
            >
              Откажи
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDelete}
            >
              Обриши услугу
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}