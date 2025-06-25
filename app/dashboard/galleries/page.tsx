'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Plus,
  Search,
  Filter,
  Image as ImageIcon,
  Eye,
  Edit,
  Trash2,
  MoreVertical,
  Calendar,
  Users,
  Grid3X3,
  X,
  Settings
} from 'lucide-react';
import { galleryApi } from '@/lib/api';
import { Gallery, GalleryStatus, GalleryType, GalleryStatistics } from '@/lib/types';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';

export default function GalleriesPage() {
  const [galleries, setGalleries] = useState<Gallery[]>([]);
  const [statistics, setStatistics] = useState<GalleryStatistics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<GalleryStatus | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<GalleryType | 'all'>('all');
  const [selectedGallery, setSelectedGallery] = useState<Gallery | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [galleryToDelete, setGalleryToDelete] = useState<Gallery | null>(null);
  const [galleryTypes, setGalleryTypes] = useState<Array<{ value: GalleryType; label: string; description: string }>>([]);
  
  const router = useRouter();
  const { theme } = useTheme();

  useEffect(() => {
    fetchData();
  }, [searchTerm, statusFilter, typeFilter]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      
      const [galleriesResponse, statsResponse, typesResponse] = await Promise.all([
        galleryApi.getAll({
          status: statusFilter !== 'all' ? statusFilter as GalleryStatus : undefined,
          type: typeFilter !== 'all' ? typeFilter as GalleryType : undefined,
          search: searchTerm || undefined,
          limit: 50
        }),
        galleryApi.getStatistics(),
        galleryApi.getTypes()
      ]);
      
      setGalleries(galleriesResponse.galleries);
      setStatistics(statsResponse);
      setGalleryTypes(typesResponse);
    } catch (error) {
      console.error('Error fetching galleries:', error);
      toast.error('Greška pri učitavanju galerija');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteGallery = async () => {
    if (!galleryToDelete) return;

    try {
      await galleryApi.delete(galleryToDelete.id);
      toast.success('Galerija je uspešno obrisana');
      setIsDeleteDialogOpen(false);
      setGalleryToDelete(null);
      await fetchData();
    } catch (error) {
      console.error('Error deleting gallery:', error);
      toast.error('Greška pri brisanju galerije');
    }
  };

  const getStatusBadge = (status: GalleryStatus) => {
    return status === GalleryStatus.PUBLISHED ? (
      <Badge variant="default" className="bg-green-100 text-green-800">
        <Eye className="h-3 w-3 mr-1" />
        Objavljeno
      </Badge>
    ) : (
      <Badge variant="secondary">
        Draft
      </Badge>
    );
  };

  const getTypeBadge = (type: GalleryType) => {
    const typeInfo = galleryTypes.find(t => t.value === type);
    return (
      <Badge variant="outline" className="text-xs">
        {typeInfo?.label || type}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('sr-RS', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setTypeFilter('all');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Galerije</h1>
          <p className="text-muted-foreground">
            Upravljajte galerije slika i organizujte ih po kategorijama
          </p>
        </div>
        <Button 
          onClick={() => router.push('/dashboard/galleries/create')}
          variant={theme === "light" ? "default" : "secondaryDefault"}
        >
          <Plus className="mr-2 h-4 w-4" />
          Nova galerija
        </Button>
      </div>

      {/* Statistics Cards */}
      {statistics && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Ukupno galerija
              </CardTitle>
              <Grid3X3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.totalGalleries}</div>
              <p className="text-xs text-muted-foreground">
                {statistics.publishedGalleries} objavljeno
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Ukupno slika
              </CardTitle>
              <ImageIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.totalImages}</div>
              <p className="text-xs text-muted-foreground">
                Sve slike u galerijama
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Najpopularnija
              </CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold">
                {statistics.topGalleries[0]?.title || 'Nema podataka'}
              </div>
              <p className="text-xs text-muted-foreground">
                {statistics.topGalleries[0]?.viewCount || 0} pregleda
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Po tipovima
              </CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                {statistics.galleriesByType.slice(0, 2).map((item) => (
                  <div key={item.type} className="flex justify-between text-xs">
                    <span>{galleryTypes.find(t => t.value === item.type)?.label || item.type}:</span>
                    <span className="font-medium">{item.count}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Pretraga i filteri</CardTitle>
          <CardDescription>
            Pronađite galerije pomoću pretrage i filtera
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <label htmlFor="search">Pretraga</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Pretraži galerije..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label>Status</label>
              <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as GalleryStatus | 'all')}>
                <SelectTrigger>
                  <SelectValue placeholder="Svi statusi" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Svi statusi</SelectItem>
                  <SelectItem value={GalleryStatus.PUBLISHED}>Objavljeno</SelectItem>
                  <SelectItem value={GalleryStatus.DRAFT}>Draft</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label>Tip</label>
              <Select value={typeFilter} onValueChange={(value) => setTypeFilter(value as GalleryType | 'all')}>
                <SelectTrigger>
                  <SelectValue placeholder="Svi tipovi" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Svi tipovi</SelectItem>
                  {galleryTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              {(searchTerm || statusFilter !== 'all' || typeFilter !== 'all') && (
                <Button variant="outline" onClick={clearFilters} className="w-full">
                  <X className="mr-2 h-4 w-4" />
                  Očisti filtere
                </Button>
              )}
            </div>
          </div>
          
          <div className="mt-4 text-sm text-muted-foreground">
            Prikazuje se {galleries.length} galerija
          </div>
        </CardContent>
      </Card>

      {/* Galleries Grid */}
      <Card>
        <CardHeader>
          <CardTitle>Lista galerija</CardTitle>
          <CardDescription>
            Sve galerije i njihovi osnovni podaci
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-video bg-gray-200 rounded-lg mb-3"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : galleries.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {galleries.map((gallery) => (
                <Card key={gallery.id} className="overflow-hidden hover:shadow-md transition-shadow">
                  <div className="aspect-video bg-gray-100 dark:bg-gray-800 relative">
                    {gallery.coverImage ? (
                      <img
                        src={galleryApi.getImageUrl(gallery.coverImage)}
                        alt={gallery.title}
                        className="w-full h-full object-cover"
                      />
                    ) : gallery.images && gallery.images.length > 0 ? (
                      <img
                        src={galleryApi.getImageUrl(gallery.images[0].filename)}
                        alt={gallery.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="h-12 w-12 text-gray-400" />
                      </div>
                    )}
                    
                    {/* Status and Type badges */}
                    <div className="absolute top-2 left-2 flex space-x-2">
                      {getStatusBadge(gallery.status)}
                      {getTypeBadge(gallery.type)}
                    </div>

                    {/* Actions */}
                    <div className="absolute top-2 right-2">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="secondary" size="sm" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => router.push(`/dashboard/galleries/${gallery.id}`)}>
                            <Eye className="mr-2 h-4 w-4" />
                            Prikaži
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => router.push(`/dashboard/galleries/edit/${gallery.id}`)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Uredi
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => {
                              setGalleryToDelete(gallery);
                              setIsDeleteDialogOpen(true);
                            }}
                            className="text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Obriši
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {/* Images count */}
                    <div className="absolute bottom-2 right-2">
                      <Badge variant="secondary" className="text-xs">
                        <ImageIcon className="h-3 w-3 mr-1" />
                        {gallery.images?.length || 0}
                      </Badge>
                    </div>
                  </div>

                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <h3 className="font-semibold text-lg line-clamp-1" title={gallery.title}>
                        {gallery.title}
                      </h3>
                      
                      {gallery.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2" title={gallery.description}>
                          {gallery.description}
                        </p>
                      )}

                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3" />
                          <span>{formatDate(gallery.createdAt)}</span>
                        </div>
                        
                        <div className="flex items-center space-x-1">
                          <Eye className="h-3 w-3" />
                          <span>{gallery.viewCount}</span>
                        </div>
                      </div>

                      {gallery.eventDate && (
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3 mr-1" />
                          Događaj: {formatDate(gallery.eventDate)}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <ImageIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium mb-2">Nema galerija</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || statusFilter !== 'all' || typeFilter !== 'all' 
                  ? 'Nema galerija koje odgovaraju filterima'
                  : 'Kreirajte prvu galeriju da biste počeli'
                }
              </p>
              {searchTerm || statusFilter !== 'all' || typeFilter !== 'all' ? (
                <Button variant="outline" onClick={clearFilters}>
                  Očisti filtere
                </Button>
              ) : (
                <Button 
                  onClick={() => router.push('/dashboard/galleries/create')}
                  variant={theme === "light" ? "default" : "secondaryDefault"}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Kreiraj galeriju
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Potvrdi brisanje</DialogTitle>
            <DialogDescription>
              Da li ste sigurni da želite da obrišete galeriju "{galleryToDelete?.title}"?
              Ova akcija će takođe obrisati sve slike u galeriji i ne može se poništiti.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Otkaži
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteGallery}
            >
              Obriši galeriju
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}