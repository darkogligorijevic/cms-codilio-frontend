// templates/services/single-service-template.tsx
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft,
  Clock,
  MapPin,
  Phone,
  Mail,
  User,
  Building,
  Globe,
  Calendar,
  DollarSign,
  FileText,
  Download,
  CheckCircle,
  AlertCircle,
  Users,
  Eye,
  Star,
  Share2,
  Bookmark,
  ExternalLink,
  Zap,
  Shield,
  Award,
  X
} from 'lucide-react';
import Link from 'next/link';
import { Service, ServiceDocument } from '@/lib/types';
import { servicesApi } from '@/lib/api';

interface SingleServiceTemplateProps {
  service: Service;
  institutionData?: any;
  settings?: any;
  parentPageSlug: string;
}

export function SingleServiceTemplate({ 
  service, 
  institutionData, 
  settings,
  parentPageSlug 
}: SingleServiceTemplateProps) {
  const [documents, setDocuments] = useState<ServiceDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDocuments();
    // Increment view count
    servicesApi.incrementRequestCount(service.slug);
  }, [service.id]);

  const fetchDocuments = async () => {
    try {
      setIsLoading(true);
      const serviceDocuments = await servicesApi.getPublicDocuments(service.id);
      setDocuments(serviceDocuments);
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatPrice = (price: number, currency: string = 'RSD') => {
    return new Intl.NumberFormat('sr-RS', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(price);
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

  const downloadDocument = (document: ServiceDocument) => {
    servicesApi.downloadDocument(service.id, document.id);
  };

  const shareService = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: service.name,
          text: service.shortDescription || service.description,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      // You could show a toast here
    }
  };

  const priorityColors = {
    low: 'bg-gray-100 text-gray-800',
    medium: 'bg-blue-100 text-blue-800',
    high: 'bg-orange-100 text-orange-800',
    urgent: 'bg-red-100 text-red-800'
  };

  const priorityLabels = {
    low: 'Низак приоритет',
    medium: 'Средњи приоритет',
    high: 'Висок приоритет',
    urgent: 'Хитне услуге'
  };

  const typeLabels = {
    administrative: 'Административне услуге',
    consulting: 'Саветодавне услуге',
    technical: 'Техничке услуге',
    legal: 'Правне услуге',
    educational: 'Образовне услуге',
    health: 'Здравствене услуге',
    social: 'Социјалне услуге',
    cultural: 'Културне услуге',
    other: 'Остало'
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <div className="relative bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 dark:from-blue-800 dark:via-blue-900 dark:to-indigo-900 text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-6">
            <Link href={`/${parentPageSlug}`}>
              <Button variant="secondary" className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border-white/30">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Назад на услуге
              </Button>
            </Link>
            
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={shareService}
                className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border-white/30"
              >
                <Share2 className="h-4 w-4" />
              </Button>
              <Button
                variant="secondary"
                size="sm"
                className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border-white/30"
              >
                <Bookmark className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <Badge className={`${priorityColors[service.priority]} text-sm font-medium`}>
                  {priorityLabels[service.priority as keyof typeof priorityLabels]}
                </Badge>
                <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                  {typeLabels[service.type as keyof typeof typeLabels]}
                </Badge>
                {service.isOnline && (
                  <Badge className="bg-green-500 text-white">
                    <Globe className="h-3 w-3 mr-1" />
                    Онлајн услуга
                  </Badge>
                )}
                {service.requiresAppointment && (
                  <Badge className="bg-blue-500 text-white">
                    <Calendar className="h-3 w-3 mr-1" />
                    Потребно заказивање
                  </Badge>
                )}
              </div>

              <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
                {service.name}
              </h1>
              
              {service.shortDescription && (
                <p className="text-xl text-blue-100 mb-6 leading-relaxed">
                  {service.shortDescription}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-6 text-blue-100">
                <div className="flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  <span>{service.requestCount} захтева</span>
                </div>
                <div className="flex items-center">
                  <Eye className="h-5 w-5 mr-2" />
                  <span>{service.viewCount} прегледа</span>
                </div>
                {documents.length > 0 && (
                  <div className="flex items-center">
                    <FileText className="h-5 w-5 mr-2" />
                    <span>{documents.length} докумената</span>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Info Card */}
            <div className="lg:col-span-1">
              <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
                <CardHeader>
                  <CardTitle className="text-white">Кључне информације</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {service.duration && (
                    <div className="flex items-center">
                      <Clock className="h-5 w-5 mr-3 text-blue-200" />
                      <div>
                        <div className="text-sm text-blue-200">Време реализације</div>
                        <div className="font-medium">{service.duration}</div>
                      </div>
                    </div>
                  )}

                  {service.price && (
                    <div className="flex items-center">
                      <DollarSign className="h-5 w-5 mr-3 text-green-200" />
                      <div>
                        <div className="text-sm text-blue-200">Цена</div>
                        <div className="font-medium text-green-200">
                          {formatPrice(service.price, service.currency)}
                        </div>
                      </div>
                    </div>
                  )}

                  {service.responsibleDepartment && (
                    <div className="flex items-center">
                      <Building className="h-5 w-5 mr-3 text-blue-200" />
                      <div>
                        <div className="text-sm text-blue-200">Надлежно одељење</div>
                        <div className="font-medium">{service.responsibleDepartment}</div>
                      </div>
                    </div>
                  )}

                  {service.location && (
                    <div className="flex items-center">
                      <MapPin className="h-5 w-5 mr-3 text-blue-200" />
                      <div>
                        <div className="text-sm text-blue-200">Локација</div>
                        <div className="font-medium">{service.location}</div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid gap-12 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="description" className="space-y-8">
              <TabsList className="grid w-full grid-cols-4 bg-white dark:bg-gray-800 shadow-lg rounded-xl p-1">
                <TabsTrigger value="description" className="rounded-lg">Опис</TabsTrigger>
                <TabsTrigger value="requirements" className="rounded-lg">Услови</TabsTrigger>
                <TabsTrigger value="process" className="rounded-lg">Поступак</TabsTrigger>
                <TabsTrigger value="documents" className="rounded-lg">Документи</TabsTrigger>
              </TabsList>

              {/* Description Tab */}
              <TabsContent value="description" className="space-y-6">
                <Card className="border-0 shadow-xl">
                  <CardHeader>
                    <CardTitle className="flex items-center text-2xl">
                      <FileText className="h-6 w-6 mr-3 text-blue-600" />
                      Детаљан опис услуге
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="prose prose-lg max-w-none text-gray-700 dark:text-gray-300">
                      <div dangerouslySetInnerHTML={{ __html: service.description }} />
                    </div>

                    {service.additionalInfo && (
                      <div className="mt-8 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                        <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-3 flex items-center">
                          <AlertCircle className="h-5 w-5 mr-2" />
                          Додатне информације
                        </h4>
                        <div className="text-blue-800 dark:text-blue-200">
                          <div dangerouslySetInnerHTML={{ __html: service.additionalInfo }} />
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Requirements Tab */}
              <TabsContent value="requirements" className="space-y-6">
                <Card className="border-0 shadow-xl">
                  <CardHeader>
                    <CardTitle className="flex items-center text-2xl">
                      <CheckCircle className="h-6 w-6 mr-3 text-green-600" />
                      Потребна документа
                    </CardTitle>
                    <CardDescription>
                      Документа која треба да приложите за оставривање ове услуге
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {service.requirements && service.requirements.length > 0 ? (
                      <div className="space-y-4">
                        {service.requirements.map((requirement, index) => (
                          <div key={index} className="flex items-start p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                            <div className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded-full flex items-center justify-center text-sm font-semibold mr-4 mt-1">
                              {index + 1}
                            </div>
                            <div className="flex-1">
                              <p className="text-gray-900 dark:text-gray-100 font-medium">
                                {requirement}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                          Нема посебних захтева
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">
                          За ову услугу нису потребни посебни документи или услови.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Process Tab */}
              <TabsContent value="process" className="space-y-6">
                <Card className="border-0 shadow-xl">
                  <CardHeader>
                    <CardTitle className="flex items-center text-2xl">
                      <Zap className="h-6 w-6 mr-3 text-orange-600" />
                      Кораци за оставривање
                    </CardTitle>
                    <CardDescription>
                      Следите ове кораке да бисте успешно остварили услугу
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {service.steps && service.steps.length > 0 ? (
                      <div className="space-y-6">
                        {service.steps.map((step, index) => (
                          <div key={index} className="relative">
                            {index < service.steps!.length - 1 && (
                              <div className="absolute left-4 top-10 h-full w-0.5 bg-gradient-to-b from-blue-500 to-blue-300"></div>
                            )}
                            <div className="flex items-start">
                              <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-lg">
                                {index + 1}
                              </div>
                              <div className="ml-6 flex-1">
                                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-100 dark:border-gray-700">
                                  <p className="text-gray-900 dark:text-gray-100 font-medium leading-relaxed">
                                    {step}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <Zap className="mx-auto h-12 w-12 text-orange-500 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                          Једноставан поступак
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">
                          Контактирајте нас директно за више информација о поступку.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Documents Tab */}
              <TabsContent value="documents" className="space-y-6">
                <Card className="border-0 shadow-xl">
                  <CardHeader>
                    <CardTitle className="flex items-center text-2xl">
                      <Download className="h-6 w-6 mr-3 text-purple-600" />
                      Документи за преузимање ({documents.length})
                    </CardTitle>
                    <CardDescription>
                      Преузмите потребне обрасце и документе
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="space-y-4">
                        {[...Array(3)].map((_, i) => (
                          <div key={i} className="animate-pulse flex items-center space-x-4 p-4 border rounded-lg">
                            <div className="w-10 h-10 bg-gray-200 rounded"></div>
                            <div className="flex-1 space-y-2">
                              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : documents.length > 0 ? (
                      <div className="grid gap-4 md:grid-cols-2">
                        {documents.map((document) => (
                          <Card key={document.id} className="hover:shadow-lg transition-shadow cursor-pointer border border-gray-200 dark:border-gray-700">
                            <CardContent className="p-6">
                              <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 line-clamp-2">
                                    {document.title}
                                  </h4>
                                  <Badge variant="outline" className="text-xs">
                                    {getDocumentTypeLabel(document.type)}
                                  </Badge>
                                </div>
                                <FileText className="h-6 w-6 text-blue-500 ml-3 flex-shrink-0" />
                              </div>

                              {document.description && (
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                                  {document.description}
                                </p>
                              )}

                              <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                                <span>{formatFileSize(document.size)}</span>
                                <span>{document.downloadCount} преузимања</span>
                              </div>

                              <Button 
                                onClick={() => downloadDocument(document)}
                                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                              >
                                <Download className="h-4 w-4 mr-2" />
                                Преузми
                              </Button>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                          Нема докумената
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">
                          Тренутно нема доступних докумената за ову услугу.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Contact Card */}
            <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
              <CardHeader>
                <CardTitle className="flex items-center text-xl">
                  <Phone className="h-5 w-5 mr-3 text-blue-600" />
                  Контакт информације
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {service.contactPerson && (
                  <div className="flex items-center p-3 bg-white dark:bg-gray-800 rounded-lg">
                    <User className="h-5 w-5 mr-3 text-gray-400" />
                    <div>
                      <div className="text-sm text-gray-500">Контакт особа</div>
                      <div className="font-medium">{service.contactPerson}</div>
                    </div>
                  </div>
                )}

                {service.contactPhone && (
                  <div className="flex items-center p-3 bg-white dark:bg-gray-800 rounded-lg">
                    <Phone className="h-5 w-5 mr-3 text-green-500" />
                    <div>
                      <div className="text-sm text-gray-500">Телефон</div>
                      <a href={`tel:${service.contactPhone}`} className="font-medium text-green-600 hover:text-green-700">
                        {service.contactPhone}
                      </a>
                    </div>
                  </div>
                )}

                {service.contactEmail && (
                  <div className="flex items-center p-3 bg-white dark:bg-gray-800 rounded-lg">
                    <Mail className="h-5 w-5 mr-3 text-blue-500" />
                    <div>
                      <div className="text-sm text-gray-500">Email</div>
                      <a href={`mailto:${service.contactEmail}`} className="font-medium text-blue-600 hover:text-blue-700 break-all">
                        {service.contactEmail}
                      </a>
                    </div>
                  </div>
                )}

                {service.workingHours && (
                  <div className="flex items-center p-3 bg-white dark:bg-gray-800 rounded-lg">
                    <Clock className="h-5 w-5 mr-3 text-orange-500" />
                    <div>
                      <div className="text-sm text-gray-500">Радно време</div>
                      <div className="font-medium">{service.workingHours}</div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Features Card */}
            <Card className="border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center text-xl">
                  <Award className="h-5 w-5 mr-3 text-yellow-600" />
                  Карактеристике услуге
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center">
                    <Globe className="h-4 w-4 mr-2 text-green-500" />
                    <span className="text-sm">Онлајн доступност</span>
                  </div>
                  {service.isOnline ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <X className="h-4 w-4 text-red-500" />
                  )}
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-blue-500" />
                    <span className="text-sm">Заказивање термина</span>
                  </div>
                  {service.requiresAppointment ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <X className="h-4 w-4 text-red-500" />
                  )}
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center">
                    <Shield className="h-4 w-4 mr-2 text-purple-500" />
                    <span className="text-sm">Јавна услуга</span>
                  </div>
                  {service.isPublic ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <X className="h-4 w-4 text-red-500" />
                  )}
                </div>
              </CardContent>
            </Card>

            {/* CTA Card */}
            <Card className="border-0 shadow-xl bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
              <CardContent className="p-6 text-center">
                <div className="mb-4">
                  <Star className="h-12 w-12 mx-auto text-yellow-500 mb-3" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    Потребна помоћ?
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Контактирајте нас за додатне информације о овој услузи
                  </p>
                </div>
                
                <div className="space-y-3">
                  {service.contactPhone && (
                    <Button 
                      asChild 
                      className="w-full bg-green-600 hover:bg-green-700"
                    >
                      <a href={`tel:${service.contactPhone}`}>
                        <Phone className="h-4 w-4 mr-2" />
                        Позовите нас
                      </a>
                    </Button>
                  )}
                  
                  {service.contactEmail && (
                    <Button 
                      asChild 
                      variant="outline" 
                      className="w-full"
                    >
                      <a href={`mailto:${service.contactEmail}`}>
                        <Mail className="h-4 w-4 mr-2" />
                        Пошаљите email
                      </a>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}