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
      toast.error('Greška pri učitavanju usluga');
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
      toast.success('Usluga je uspešno obrisana');
      setDeleteDialogOpen(false);
      setServiceToDelete(null);
      fetchServices();
      fetchStatistics();
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
      [ServiceType.ADMINISTRATIVE]: 'Administrativne',
      [ServiceType.CONSULTING]: 'Savetodavne',
      [ServiceType.TECHNICAL]: 'Tehničke',
      [ServiceType.LEGAL]: 'Pravne',
      [ServiceType.EDUCATIONAL]: 'Obrazovne',
      [ServiceType.HEALTH]: 'Zdravstvene',
      [ServiceType.SOCIAL]: 'Socijalne',
      [ServiceType.CULTURAL]: 'Kulturne',
      [ServiceType.OTHER]: 'Ostalo'
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
    toast.success('Slug je kopiran u clipboard');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Usluge</h1>
          <p className="text-muted-foreground">
            Upravljanje uslugama lokalne institucije
          </p>
        </div>
        <Button 
          onClick={() => router.push('/dashboard/services/create')}
          variant={theme === "light" ? "default" : "secondaryDefault"}
        >
          <Plus className="mr-2 h-4 w-4" />
          Nova usluga
        </Button>
      </div>

      {/* Statistics Cards */}
      {statistics && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Ukupno usluga
              </CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.totalServices}</div>
              <p className="text-xs text-muted-foreground">
                {statistics.publishedServices} objavljeno
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Ukupni pregledi
              </CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.totalViews.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                <TrendingUp className="inline h-3 w-3 mr-1" />
                Interes građana
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Zahtevi za uslugama
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.totalRequests.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Aktivni zahtevi
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Dokumenti
              </CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.totalDocuments}</div>
              <p className="text-xs text-muted-foreground">
                Prateći dokumenti
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
            <span>Filteri</span>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="ml-auto"
              >
                <X className="mr-2 h-4 w-4" />
                Očisti filtere
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Pretraga</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Pretraži usluge..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as ServiceStatus | 'all')}>
                <SelectTrigger>
                  <SelectValue placeholder="Sve statusи" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Svi statusi</SelectItem>
                  <SelectItem value={ServiceStatus.PUBLISHED}>Objavljeno</SelectItem>
                  <SelectItem value={ServiceStatus.DRAFT}>Nacrt</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Tip usluge</label>
              <Select value={typeFilter} onValueChange={(value) => setTypeFilter(value as ServiceType | 'all')}>
                <SelectTrigger>
                  <SelectValue placeholder="Svi tipovi" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Svi tipovi</SelectItem>
                  <SelectItem value={ServiceType.ADMINISTRATIVE}>Administrativne</SelectItem>
                  <SelectItem value={ServiceType.CONSULTING}>Savetodavne</SelectItem>
                  <SelectItem value={ServiceType.TECHNICAL}>Tehničke</SelectItem>
                  <SelectItem value={ServiceType.LEGAL}>Pravne</SelectItem>
                  <SelectItem value={ServiceType.EDUCATIONAL}>Obrazovne</SelectItem>
                  <SelectItem value={ServiceType.HEALTH}>Zdravstvene</SelectItem>
                  <SelectItem value={ServiceType.SOCIAL}>Socijalne</SelectItem>
                  <SelectItem value={ServiceType.CULTURAL}>Kulturne</SelectItem>
                  <SelectItem value={ServiceType.OTHER}>Ostalo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Prioritet</label>
              <Select value={priorityFilter} onValueChange={(value) => setPriorityFilter(value as ServicePriority | 'all')}>
                <SelectTrigger>
                  <SelectValue placeholder="Svi prioriteti" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Svi prioriteti</SelectItem>
                  <SelectItem value={ServicePriority.LOW}>Nizak</SelectItem>
                  <SelectItem value={ServicePriority.MEDIUM}>Srednji</SelectItem>
                  <SelectItem value={ServicePriority.HIGH}>Visok</SelectItem>
                  <SelectItem value={ServicePriority.URGENT}>Hitan</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Services Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista usluga</CardTitle>
          <CardDescription>
            Pregled svih usluga u sistemu
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
                    <TableHead>Naziv usluge</TableHead>
                    <TableHead>Tip</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Prioritet</TableHead>
                    <TableHead>Pregledi</TableHead>
                    <TableHead>Zahtevi</TableHead>
                    <TableHead className="text-right">Akcije</TableHead>
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
                              title="Kliknite da kopirate slug"
                            >
                              {service.slug}
                            </code>
                            {service.isOnline && (
                              <Badge variant="outline" className="text-xs">
                                <Globe className="h-3 w-3 mr-1" />
                                Online
                              </Badge>
                            )}
                            {service.requiresAppointment && (
                              <Badge variant="outline" className="text-xs">
                                <Calendar className="h-3 w-3 mr-1" />
                                Zakazivanje
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
                              Pregledaj
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => router.push(`/dashboard/services/${service.id}/edit`)}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Uredi
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => router.push(`/dashboard/services/${service.id}/documents`)}
                            >
                              <FileText className="mr-2 h-4 w-4" />
                              Dokumenti ({service.documents?.length || 0})
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => copyServiceSlug(service.slug)}
                            >
                              <Copy className="mr-2 h-4 w-4" />
                              Kopiraj slug
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
                              Obriši
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
                {hasActiveFilters ? 'Nema rezultata' : 'Nema usluga'}
              </h3>
              <p className="text-gray-500 mb-4">
                {hasActiveFilters 
                  ? 'Probajte sa drugim filterima za pretragu' 
                  : 'Dodajte prvu uslugu za građane'
                }
              </p>
              {hasActiveFilters ? (
                <Button variant="outline" onClick={clearFilters}>
                  <X className="mr-2 h-4 w-4" />
                  Očisti filtere
                </Button>
              ) : (
                <Button 
                  onClick={() => router.push('/dashboard/services/create')}
                  variant={theme === "light" ? "default" : "secondaryDefault"}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Dodaj prvu uslugu
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
            Stranica {currentPage} od {totalPages}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              Prethodna
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              Sledeća
            </Button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Potvrdi brisanje</DialogTitle>
            <DialogDescription>
              Da li ste sigurni da želite da obrišete uslugu{' '}
              <strong>{serviceToDelete?.name}</strong>? Ova akcija će obrisati i sve
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