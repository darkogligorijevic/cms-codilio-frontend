// templates/services/services-template.tsx - Updated with correct routing
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Search, 
  Filter,
  Clock,
  MapPin,
  Phone,
  Mail,
  User,
  Building,
  Globe,
  Calendar,
  ChevronRight,
  ArrowRight,
  Star,
  Users,
  FileText,
  X,
  Zap,
  DollarSign,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import { servicesApi } from '@/lib/api';
import { 
  Service, 
  ServiceType, 
  ServicePriority, 
  ServiceStatus,
  Page, 
  Post 
} from '@/lib/types';
import { PostsSection } from '@/components/frontend/posts-section';

interface ServicesTemplateProps {
  page: Page;
  posts: Post[];
  institutionData?: any;
  settings?: any;
}

const serviceTypeLabels = {
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

const servicePriorityLabels = {
  [ServicePriority.LOW]: 'Низак приоритет',
  [ServicePriority.MEDIUM]: 'Средњи приоритет',
  [ServicePriority.HIGH]: 'Висок приоритет',
  [ServicePriority.URGENT]: 'Хитне услуге'
};

const priorityColors = {
  [ServicePriority.LOW]: 'bg-gray-100 text-gray-800',
  [ServicePriority.MEDIUM]: 'bg-blue-100 text-blue-800',
  [ServicePriority.HIGH]: 'bg-orange-100 text-orange-800',
  [ServicePriority.URGENT]: 'bg-red-100 text-red-800'
};

export function ServicesTemplate({ page, posts }: ServicesTemplateProps) {
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<ServiceType | 'all'>('all');
  const [selectedPriority, setSelectedPriority] = useState<ServicePriority | 'all'>('all');
  const [onlineOnly, setOnlineOnly] = useState(false);
  const [appointmentOnly, setAppointmentOnly] = useState(false);
  
  useEffect(() => {
    fetchServices();
  }, [searchTerm, selectedType, selectedPriority, onlineOnly, appointmentOnly]);

  const fetchServices = async () => {
    try {
      setIsLoading(true);
      const params: any = {
        page: 1,
        limit: 50,
      };

      if (searchTerm) params.search = searchTerm;
      if (selectedType !== 'all') params.type = selectedType;
      if (selectedPriority !== 'all') params.priority = selectedPriority;
      if (onlineOnly) params.isOnline = true;
      if (appointmentOnly) params.requiresAppointment = true;

      const response = await servicesApi.getPublished(params);
      setServices(response.services);
    } catch (error) {
      console.error('Error fetching services:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedType('all');
    setSelectedPriority('all');
    setOnlineOnly(false);
    setAppointmentOnly(false);
  };

  const hasActiveFilters = searchTerm || selectedType !== 'all' || selectedPriority !== 'all' || onlineOnly || appointmentOnly;

  const handleServiceRequest = async (slug: string) => {
    try {
      await servicesApi.incrementRequestCount(slug);
    } catch (error) {
      console.error('Error incrementing request count:', error);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 dark:from-blue-800 dark:via-blue-900 dark:to-indigo-900 text-white py-20">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm mb-6">
            <Building className="h-5 w-5 mr-2" />
            <span className="text-sm font-medium">Услуге за грађане</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Све услуге на једном месту
          </h1>
          
          <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto mb-8 leading-relaxed">
            Пружамо широк спектар квалитетних услуга за наше грађане. 
            Све услуге можете обавити лично или онлајн, брзо и ефикасно.
          </p>

          <div className="flex flex-wrap justify-center gap-4 text-sm text-blue-100">
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 mr-2" />
              <span>Бесплатне консултације</span>
            </div>
            <div className="flex items-center">
              <Globe className="h-4 w-4 mr-2" />
              <span>Онлајн доступност</span>
            </div>
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-2" />
              <span>Брза обрада</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* CMS Content */}
        {page?.content && (
          <div className="mb-12">
            <div className="prose prose-lg max-w-none text-gray-700 dark:text-gray-300">
              <div dangerouslySetInnerHTML={{ __html: page.content }} />
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-8 border border-gray-100 dark:border-gray-700">
          <div className="flex flex-col lg:flex-row gap-4 items-end">
            {/* Search */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Претрага услуга
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <Input
                  placeholder="Унесите назив услуге..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-12 text-lg"
                />
              </div>
            </div>

            {/* Type Filter */}
            <div className="w-full lg:w-64">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Тип услуге
              </label>
              <Select value={selectedType} onValueChange={(value: any) => setSelectedType(value)}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Сви типови" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Сви типови</SelectItem>
                  {Object.entries(serviceTypeLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Priority Filter */}
            <div className="w-full lg:w-64">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Приоритет
              </label>
              <Select value={selectedPriority} onValueChange={(value: any) => setSelectedPriority(value)}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Сви приоритети" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Сви приоритети</SelectItem>
                  {Object.entries(servicePriorityLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Additional Filters */}
            <div className="flex gap-4">
              <Button
                variant={onlineOnly ? "default" : "outline"}
                onClick={() => setOnlineOnly(!onlineOnly)}
                className="h-12"
              >
                <Globe className="h-4 w-4 mr-2" />
                Онлајн
              </Button>
              <Button
                variant={appointmentOnly ? "default" : "outline"}
                onClick={() => setAppointmentOnly(!appointmentOnly)}
                className="h-12"
              >
                <Calendar className="h-4 w-4 mr-2" />
                Заказивање
              </Button>
            </div>
          </div>

          {/* Active Filters */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
              <span className="text-sm text-gray-500 mr-2">Активни филтери:</span>
              {searchTerm && (
                <Badge variant="secondary" className="gap-1">
                  <Search className="h-3 w-3" />
                  {searchTerm}
                </Badge>
              )}
              {selectedType !== 'all' && (
                <Badge variant="secondary">
                  {serviceTypeLabels[selectedType as ServiceType]}
                </Badge>
              )}
              {selectedPriority !== 'all' && (
                <Badge variant="secondary">
                  {servicePriorityLabels[selectedPriority as ServicePriority]}
                </Badge>
              )}
              {onlineOnly && <Badge variant="secondary">Онлајн</Badge>}
              {appointmentOnly && <Badge variant="secondary">Заказивање</Badge>}
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="ml-2"
              >
                <X className="h-4 w-4 mr-1" />
                Очисти све
              </Button>
            </div>
          )}
        </div>

        {/* Services Grid */}
        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                    <div className="h-4 bg-gray-200 rounded w-4/6"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : services.length > 0 ? (
          <>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Доступне услуге ({services.length})
              </h2>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {services.map((service) => (
                <Card 
                  key={service.id} 
                  className="group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 bg-white dark:bg-gray-800 border-0 shadow-lg overflow-hidden"
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between mb-3">
                      <Badge 
                        variant="secondary" 
                        className={`${priorityColors[service.priority]} text-xs font-medium`}
                      >
                        {servicePriorityLabels[service.priority]}
                      </Badge>
                      <div className="flex gap-1">
                        {service.isOnline && (
                          <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                            <Globe className="h-3 w-3 mr-1" />
                            Онлајн
                          </Badge>
                        )}
                        {service.requiresAppointment && (
                          <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                            <Calendar className="h-3 w-3 mr-1" />
                            Термин
                          </Badge>
                        )}
                      </div>
                    </div>

                    <CardTitle className="text-xl group-hover:text-blue-600 transition-colors line-clamp-2">
                      {service.name}
                    </CardTitle>
                    
                    <CardDescription className="text-gray-600 dark:text-gray-300 line-clamp-3">
                      {service.shortDescription || service.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="pt-0">
                    <div className="space-y-4">
                      {/* Service Details */}
                      <div className="space-y-2">
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                          <Building className="h-4 w-4 mr-2 text-gray-400" />
                          <span>{serviceTypeLabels[service.type]}</span>
                        </div>

                        {service.duration && (
                          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                            <Clock className="h-4 w-4 mr-2 text-gray-400" />
                            <span>{service.duration}</span>
                          </div>
                        )}

                        {service.price && (
                          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                            <DollarSign className="h-4 w-4 mr-2 text-gray-400" />
                            <span className="font-medium text-green-600">
                              {formatPrice(service.price, service.currency)}
                            </span>
                          </div>
                        )}

                        {service.responsibleDepartment && (
                          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                            <User className="h-4 w-4 mr-2 text-gray-400" />
                            <span className="line-clamp-1">{service.responsibleDepartment}</span>
                          </div>
                        )}
                      </div>

                      {/* Contact Info */}
                      {(service.contactPhone || service.contactEmail) && (
                        <div className="border-t border-gray-100 dark:border-gray-700 pt-3 space-y-1">
                          {service.contactPhone && (
                            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                              <Phone className="h-4 w-4 mr-2 text-gray-400" />
                              <span>{service.contactPhone}</span>
                            </div>
                          )}
                          {service.contactEmail && (
                            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                              <Mail className="h-4 w-4 mr-2 text-gray-400" />
                              <span className="line-clamp-1">{service.contactEmail}</span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Action Button - Updated routing */}
                      <div className="pt-2">
                        <Link href={`/${service.slug}`}>
                          <Button 
                            className="w-full group/btn bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                            onClick={() => handleServiceRequest(service.slug)}
                          >
                            <span>Више детаља</span>
                            <ArrowRight className="h-4 w-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                          </Button>
                        </Link>
                      </div>

                      {/* Statistics */}
                      <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100 dark:border-gray-700">
                        <div className="flex items-center">
                          <Users className="h-3 w-3 mr-1" />
                          <span>{service.requestCount} захтева</span>
                        </div>
                        {service.documents && service.documents.length > 0 && (
                          <div className="flex items-center">
                            <FileText className="h-3 w-3 mr-1" />
                            <span>{service.documents.length} докумената</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-16">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 shadow-lg">
              <AlertCircle className="mx-auto h-16 w-16 text-gray-400 mb-6" />
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                {hasActiveFilters ? 'Нема резултата' : 'Нема доступних услуга'}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-md mx-auto">
                {hasActiveFilters 
                  ? 'Покушајте са другачијим критеријумима претраге или уклоните неке филтере.' 
                  : 'Тренутно нема објављених услуга за грађане.'
                }
              </p>
              {hasActiveFilters && (
                <Button onClick={clearFilters} variant="outline">
                  <X className="h-4 w-4 mr-2" />
                  Очисти све филтере
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Posts Section */}
        {posts && posts.length > 0 && (
          <div className="mt-16">
            <PostsSection posts={posts} />
          </div>
        )}
      </div>
    </div>
  );
}