// app/dashboard/services/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  Plus,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  FileText,
  Users,
  Clock,
  MapPin,
  Phone,
  Mail,
  Globe,
  Calendar,
  Building,
  BarChart3,
  TrendingUp,
  ArrowUpRight,
  Filter,
  X,
  Copy
} from 'lucide-react';
import { servicesApi } from '@/lib/api';
import {
  Service,
  ServiceStatus,
  ServiceType,
  ServicePriority,
  ServicesResponse,
  ServiceStatistics
} from '@/lib/types';
import { toast } from 'sonner';
import { useTheme } from 'next-themes';

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [statistics, setStatistics] = useState<ServiceStatistics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ServiceStatus | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<ServiceType | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<ServicePriority | 'all'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState<Service | null>(null);
  
  const router = useRouter();
  const { theme } = useTheme();
  const itemsPerPage = 10;

  useEffect(() => {
    fetchServices();
    fetchStatistics();
  }, [currentPage, searchTerm, statusFilter, typeFilter, priorityFilter]);

  const fetchServices = async () => {
    try {
      setIsLoading(true);
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter !== 'all' && { status: statusFilter as ServiceStatus }),
        ...(typeFilter !== 'all' && { type: typeFilter as ServiceType }),
        ...(priorityFilter !== 'all' && { priority: priorityFilter as ServicePriority }),
      };

      const response = await servicesApi.getAll(params);
      setServices(response.services);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error('Error fetching services:', error);
      toast.error('Грешка при учитавању услуга');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const stats = await servicesApi.getStatistics();
      setStatistics(stats);
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  const handleDelete = async () => {
    if (!serviceToDelete) return;

    try {
      await servicesApi.delete(serviceToDelete.id);
      toast.success('Услуга је успешно обрисана');
      setDeleteDialogOpen(false);
      setServiceToDelete(null);
      fetchServices();
      fetchStatistics();
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
      [ServiceType.ADMINISTRATIVE]: 'Административне',
      [ServiceType.CONSULTING]: 'Саветодавне',
      [ServiceType.TECHNICAL]: 'Техничке',
      [ServiceType.LEGAL]: 'Правне',
      [ServiceType.EDUCATIONAL]: 'Образовне',
      [ServiceType.HEALTH]: 'Здравствене',
      [ServiceType.SOCIAL]: 'Социјалне',
      [ServiceType.CULTURAL]: 'Културне',
      [ServiceType.OTHER]: 'Остало'
    };
    return labels[type] || type;
  };

  const hasActiveFilters = searchTerm || statusFilter !== 'all' || typeFilter !== 'all' || priorityFilter !== 'all';

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setTypeFilter('all');
    setPriorityFilter('all');
    setCurrentPage(1);
  };

  const copyServiceSlug = (slug: string) => {
    navigator.clipboard.writeText(slug);
    toast.success('Слуг је копиран у клипборд');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Услуге</h1>
          <p className="text-muted-foreground">
            Управљање услугама локалне институције
          </p>
        </div>
        <Button 
          onClick={() => router.push('/dashboard/services/create')}
          variant={theme === "light" ? "default" : "secondaryDefault"}
        >
          <Plus className="mr-2 h-4 w-4" />
          Нова услуга
        </Button>
      </div>

      {/* Statistics Cards */}
      {statistics && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Укупно услуга
              </CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.totalServices}</div>
              <p className="text-xs text-muted-foreground">
                {statistics.publishedServices} објављено
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Укупни прегледи
              </CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.totalViews.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                <TrendingUp className="inline h-3 w-3 mr-1" />
                Интерес грађана
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Захтеви за услугама
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.totalRequests.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Активни захтеви
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Документи
              </CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.totalDocuments}</div>
              <p className="text-xs text-muted-foreground">
                Пратећи документи
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Филтери</span>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="ml-auto"
              >
                <X className="mr-2 h-4 w-4" />
                Очисти филтере
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Претрага</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Претражи услуге..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Статус</label>
              <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as ServiceStatus | 'all')}>
                <SelectTrigger>
                  <SelectValue placeholder="Све статуси" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Сви статуси</SelectItem>
                  <SelectItem value={ServiceStatus.PUBLISHED}>Објављено</SelectItem>
                  <SelectItem value={ServiceStatus.DRAFT}>Нацрт</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Тип услуге</label>
              <Select value={typeFilter} onValueChange={(value) => setTypeFilter(value as ServiceType | 'all')}>
                <SelectTrigger>
                  <SelectValue placeholder="Сви типови" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Сви типови</SelectItem>
                  <SelectItem value={ServiceType.ADMINISTRATIVE}>Административне</SelectItem>
                  <SelectItem value={ServiceType.CONSULTING}>Саветодавне</SelectItem>
                  <SelectItem value={ServiceType.TECHNICAL}>Техничке</SelectItem>
                  <SelectItem value={ServiceType.LEGAL}>Правне</SelectItem>
                  <SelectItem value={ServiceType.EDUCATIONAL}>Образовне</SelectItem>
                  <SelectItem value={ServiceType.HEALTH}>Здравствене</SelectItem>
                  <SelectItem value={ServiceType.SOCIAL}>Социјалне</SelectItem>
                  <SelectItem value={ServiceType.CULTURAL}>Културне</SelectItem>
                  <SelectItem value={ServiceType.OTHER}>Остало</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Приоритет</label>
              <Select value={priorityFilter} onValueChange={(value) => setPriorityFilter(value as ServicePriority | 'all')}>
                <SelectTrigger>
                  <SelectValue placeholder="Сви приоритети" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Сви приоритети</SelectItem>
                  <SelectItem value={ServicePriority.LOW}>Низак</SelectItem>
                  <SelectItem value={ServicePriority.MEDIUM}>Средњи</SelectItem>
                  <SelectItem value={ServicePriority.HIGH}>Висок</SelectItem>
                  <SelectItem value={ServicePriority.URGENT}>Хитан</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Services Table */}
      <Card>
        <CardHeader>
          <CardTitle>Листа услуга</CardTitle>
          <CardDescription>
            Преглед свих услуга у систему
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse flex space-x-4">
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : services.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Назив услуге</TableHead>
                    <TableHead>Тип</TableHead>
                    <TableHead>Статус</TableHead>
                    <TableHead>Приоритет</TableHead>
                    <TableHead>Прегледи</TableHead>
                    <TableHead>Захтеви</TableHead>
                    <TableHead className="text-right">Акције</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {services.map((service) => (
                    <TableRow key={service.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">{service.name}</div>
                          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                            <code 
                              className="bg-gray-100 px-2 py-1 rounded text-xs cursor-pointer hover:bg-gray-200"
                              onClick={() => copyServiceSlug(service.slug)}
                              title="Кликните да копирате слуг"
                            >
                              {service.slug}
                            </code>
                            {service.isOnline && (
                              <Badge variant="outline" className="text-xs">
                                <Globe className="h-3 w-3 mr-1" />
                                Онлајн
                              </Badge>
                            )}
                            {service.requiresAppointment && (
                              <Badge variant="outline" className="text-xs">
                                <Calendar className="h-3 w-3 mr-1" />
                                Заказивање
                              </Badge>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {getTypeLabel(service.type)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(service.status)}
                      </TableCell>
                      <TableCell>
                        {getPriorityBadge(service.priority)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Eye className="h-4 w-4 text-muted-foreground" />
                          <span>{service.viewCount}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span>{service.requestCount}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => router.push(`/dashboard/services/${service.id}`)}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              Прегледај
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => router.push(`/dashboard/services/${service.id}/edit`)}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Уреди
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => router.push(`/dashboard/services/${service.id}/documents`)}
                            >
                              <FileText className="mr-2 h-4 w-4" />
                              Документи ({service.documents?.length || 0})
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => copyServiceSlug(service.slug)}
                            >
                              <Copy className="mr-2 h-4 w-4" />
                              Копирај слуг
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => {
                                setServiceToDelete(service);
                                setDeleteDialogOpen(true);
                              }}
                              className="text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Обриши
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12">
              <Building className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                {hasActiveFilters ? 'Нема резултата' : 'Нема услуга'}
              </h3>
              <p className="text-gray-500 mb-4">
                {hasActiveFilters 
                  ? 'Пробајте са другим филтерима за претрагу' 
                  : 'Додајте прву услугу за грађане'
                }
              </p>
              {hasActiveFilters ? (
                <Button variant="outline" onClick={clearFilters}>
                  <X className="mr-2 h-4 w-4" />
                  Очисти филтере
                </Button>
              ) : (
                <Button 
                  onClick={() => router.push('/dashboard/services/create')}
                  variant={theme === "light" ? "default" : "secondaryDefault"}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Додај прву услугу
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Страница {currentPage} од {totalPages}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              Претходна
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              Следећа
            </Button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className='max-w-4xl'>
          <DialogHeader>
            <DialogTitle>Потврди брисање</DialogTitle>
            <DialogDescription>
              Да ли сте сигурни да желите да обришете услугу{' '}
              <strong>{serviceToDelete?.name}</strong>? Ова акција ће обрисати и све
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