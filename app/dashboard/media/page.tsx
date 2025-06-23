// app/dashboard/media/page.tsx - Ažurirana verzija sa kategorijama
'use client';

import { useEffect, useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Upload, 
  Image as ImageIcon, 
  FileText, 
  File, 
  Search, 
  Filter,
  Download,
  Edit,
  Trash2,
  Copy,
  ExternalLink,
  AlertCircle,
  CheckCircle,
  X,
  Calendar,
  HardDrive,
  Check,
  Eye,
  EyeOff,
  Building,
  DollarSign,
  FileCheck,
  Clipboard,
  BarChart3,
  Folder
} from 'lucide-react';
import { DragDropUpload } from '@/components/ui/drag-drop-upload';
import { mediaApi } from '@/lib/api';
import { MediaCategory, type Media, type CreateMediaDto, type FindMediaOptions, type MediaCategoryInfo } from '@/lib/types';
import { toast } from 'sonner';
import { useTheme } from 'next-themes';

interface MediaFormData {
  alt: string;
  caption: string;
  category: MediaCategory;
  description: string;
  isPublic: boolean;
}

export default function MediaPage() {
  const [media, setMedia] = useState<Media[]>([]);
  const [categories, setCategories] = useState<MediaCategoryInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<MediaCategory | 'all'>('all');
  const [publicFilter, setPublicFilter] = useState<'all' | 'public' | 'private'>('all');
  const [selectedMedia, setSelectedMedia] = useState<Media | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  // Selection mode states
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const {theme} = useTheme();

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<MediaFormData>({
    defaultValues: {
      alt: '',
      caption: '',
      category: MediaCategory.OTHER,
      description: '',
      isPublic: false
    }
  });

  const watchedCategory = watch('category');
  const watchedIsPublic = watch('isPublic');

  useEffect(() => {
    fetchMediaAndCategories();
    
    // Check if page opened in selection mode
    const urlParams = new URLSearchParams(window.location.search);
    const selectMode = urlParams.get('select');
    if (selectMode === 'true') {
      setSelectionMode(true);
    }
  }, []);

  const fetchMediaAndCategories = async () => {
    try {
      setIsLoading(true);
      
      const [mediaResponse, categoriesResponse] = await Promise.all([
        mediaApi.getAll(),
        mediaApi.getCategories()
      ]);
      
      setMedia(mediaResponse);
      setCategories(categoriesResponse);
    } catch (error) {
      console.error('Error fetching media:', error);
      toast.error('Greška pri učitavanju medijskih fajlova');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFilteredMedia = async () => {
    try {
      setIsLoading(true);
      
      const options: FindMediaOptions = {};
      
      if (categoryFilter !== 'all') {
        options.category = categoryFilter as MediaCategory;
      }
      
      if (publicFilter === 'public') {
        options.isPublic = true;
      } else if (publicFilter === 'private') {
        options.isPublic = false;
      }
      
      if (searchTerm) {
        options.search = searchTerm;
      }
      
      const response = await mediaApi.getAll(options);
      setMedia(response);
    } catch (error) {
      console.error('Error fetching filtered media:', error);
      toast.error('Greška pri filtriranju medijskih fajlova');
    } finally {
      setIsLoading(false);
    }
  };

  // Trigger filtering when filters change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchFilteredMedia();
    }, 300); // Debounce search

    return () => clearTimeout(timeoutId);
  }, [searchTerm, categoryFilter, publicFilter]);

  const handleFileUpload = async (file: File) => {
    try {
      setIsUploading(true);
      
      const uploadData: CreateMediaDto = {
        category: MediaCategory.OTHER,
        isPublic: false
      };
      
      const response = await mediaApi.upload(file, uploadData);
      console.log('Upload response:', response);

      toast.success(`Fajl "${file.name}" je uspešno učitan`);
      await fetchFilteredMedia();

    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error(`Greška pri učitavanju fajla "${file.name}"`);
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  const onSubmit = async (data: MediaFormData) => {
    if (!selectedMedia) return;

    try {
      await mediaApi.updateMetadata(selectedMedia.id, data);
      
      toast.success('Medijski fajl je uspešno ažuriran');
      await fetchFilteredMedia();
      setIsEditDialogOpen(false);
      setSelectedMedia(null);
      reset();
    } catch (error) {
      console.error('Error updating media:', error);
      toast.error('Greška pri ažuriranju medijskog fajla');
    }
  };

  const handleEditMedia = (mediaItem: Media) => {
    setSelectedMedia(mediaItem);
    setValue('alt', mediaItem.alt || '');
    setValue('caption', mediaItem.caption || '');
    setValue('category', mediaItem.category || MediaCategory.OTHER);
    setValue('description', mediaItem.description || '');
    setValue('isPublic', mediaItem.isPublic || false);
    setIsEditDialogOpen(true);
  };

  const handleDeleteMedia = async () => {
    if (!selectedMedia) return;

    try {
      await mediaApi.delete(selectedMedia.id);
      toast.success('Medijski fajl je uspešno obrisan');
      await fetchFilteredMedia();
      setIsDeleteDialogOpen(false);
      setSelectedMedia(null);
    } catch (error) {
      console.error('Error deleting media:', error);
      toast.error('Greška pri brisanju medijskog fajla');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('URL je kopiran u clipboard');
  };

  const toggleSelection = (filename: any) => {
    setSelectedItems(prev => {
      if (prev.includes(filename)) {
        return prev.filter(item => item !== filename);
      } else {
        return [...prev, filename];
      }
    });
  };

  const confirmSelection = () => {
    if (selectedItems.length > 0) {
      if (window.opener) {
        window.opener.postMessage({
          type: 'MEDIA_SELECTED',
          data: selectedItems
        }, '*');
        window.close();
      } else {
        localStorage.setItem('selectedMedia', JSON.stringify(selectedItems));
        window.close();
      }
    }
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType?.startsWith('image/')) {
      return <ImageIcon className="h-6 w-6 dark:invert-100" />;
    } else if (mimeType?.includes('pdf')) {
      return <FileText className="h-6 w-6 dark:invert-100" />;
    } else {
      return <File className="h-6 w-6 dark:invert-100" />;
    }
  };

  const getFileTypeLabel = (mimeType: string) => {
    if (mimeType?.startsWith('image/')) return 'Slika';
    if (mimeType?.includes('pdf')) return 'PDF';
    if (mimeType?.includes('document')) return 'Dokument';
    if (mimeType?.includes('spreadsheet')) return 'Tabela';
    return 'Fajl';
  };

  const getCategoryLabel = (category: MediaCategory) => {
    const categoryInfo = categories.find(cat => cat.value === category);
    return categoryInfo?.label || 'Ostalo';
  };

  const getCategoryIcon = (category: MediaCategory) => {
    switch (category) {
      case MediaCategory.PROCUREMENT:
        return <Building className="h-6 w-6" />;
      case MediaCategory.FINANCIAL:
        return <DollarSign className="h-6 w-6" />;
      case MediaCategory.DECISIONS:
        return <FileCheck className="h-6 w-6" />;
      case MediaCategory.PLANS:
        return <Clipboard className="h-6 w-6" />;
      case MediaCategory.REPORTS:
        return <BarChart3 className="h-6 w-6" />;
      default:
        return <Folder className="h-6 w-6" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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
    setCategoryFilter('all');
    setPublicFilter('all');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Medijski fajlovi</h1>
          <p className="text-muted-foreground">
            Upravljajte dokumentima, slikama i ostalim fajlovima po kategorijama
          </p>
        </div>
      </div>

      {/* Selection Mode Toolbar */}
      {selectionMode && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <p className="text-sm font-medium text-blue-800">
                  Režim selekcije - Izabrano: {selectedItems.length}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedItems([])}
                  disabled={selectedItems.length === 0}
                >
                  Poništi selekciju
                </Button>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectionMode(false);
                    setSelectedItems([]);
                  }}
                >
                  Otkaži
                </Button>
                <Button
                  size="sm"
                  onClick={confirmSelection}
                  disabled={selectedItems.length === 0}
                >
                  Potvrdi selekciju ({selectedItems.length})
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Drag & Drop Upload Area */}
      {!selectionMode && (
        <DragDropUpload
          onFileUpload={handleFileUpload}
          accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
          maxSize={10}
          multiple={true}
          disabled={isUploading}
        />
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Pretraga i filteri</CardTitle>
          <CardDescription>
            Pronađite fajlove pomoću pretrage i filtera po kategorijama
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="search">Pretraga</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Pretraži fajlove..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Kategorija</Label>
              <Select value={categoryFilter} onValueChange={(value) => setCategoryFilter(value as MediaCategory | 'all')}>
                <SelectTrigger>
                  <SelectValue placeholder="Sve kategorije" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Sve kategorije</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      <div className="flex items-center space-x-2">
                        {getCategoryIcon(category.value)}
                        <span>{category.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Dostupnost</Label>
              <Select value={publicFilter} onValueChange={(value) => setPublicFilter(value as any)}>
                <SelectTrigger>
                  <SelectValue placeholder="Sve" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Sve</SelectItem>
                  <SelectItem value="public">
                    <div className="flex items-center space-x-2">
                      <Eye className="h-4 w-4" />
                      <span>Javno dostupno</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="private">
                    <div className="flex items-center space-x-2">
                      <EyeOff className="h-4 w-4" />
                      <span>Interno</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              {(searchTerm || categoryFilter !== 'all' || publicFilter !== 'all') && (
                <Button variant="outline" onClick={clearFilters} className="w-full">
                  <X className="mr-2 h-4 w-4" />
                  Očisti filtere
                </Button>
              )}
            </div>
          </div>
          
          <div className="mt-4 text-sm text-muted-foreground">
            Prikazuje se {media.length} fajlova
          </div>
        </CardContent>
      </Card>

      {/* Media Grid */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Lista fajlova</CardTitle>
              <CardDescription>
                Ukupno {media.length} fajlova
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-square bg-gray-200 rounded-lg mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : (
            <>
              {media.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {media.map((item) => (
                    <Card 
                      key={item.id} 
                      className={`overflow-hidden transition-all ${
                        selectionMode 
                          ? `cursor-pointer ${
                              selectedItems.includes(item.filename)
                                ? 'ring-2 ring-blue-500 border-blue-500'
                                : 'hover:ring-2 hover:ring-blue-200'
                            }`
                          : ''
                      }`}
                      onClick={() => {
                        if (selectionMode) {
                          if (item.mimeType.startsWith('image/')) {
                            toggleSelection(item.filename);
                          } else {
                            toast.error("Možete izabrati samo slike!")
                          }
                        }
                      }}
                    >
                      <div className="aspect-square bg-gray-50 dark:bg-gray-900 flex items-center justify-center relative group">
                        {item.mimeType?.startsWith('image/') ? (
                          <img
                            crossOrigin="anonymous"
                            src={mediaApi.getFileUrl(item.filename)}
                            alt={item.alt || item.originalName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="flex flex-col items-center space-y-3 text-center p-4">
                            <div className="bg-gray-100 p-4 rounded-lg">
                              {getFileIcon(item.mimeType)}
                            </div>
                            <div>
                              <div className="font-medium text-sm mb-1">{getFileTypeLabel(item.mimeType)}</div>
                              <div className="text-xs text-muted-foreground truncate max-w-full">
                                {item.originalName}
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {/* Selection indicator */}
                        {selectionMode && selectedItems.includes(item.filename) && (
                          <div className="absolute top-2 right-2 bg-blue-500 text-white rounded-full p-1">
                            <Check className="h-4 w-4" />
                          </div>
                        )}
                        
                        {/* Category badge */}
                        <Badge
                          variant="secondary"
                          className="absolute top-2 left-2 text-xs border-none font-bold text-gray-900 px-2 py-1 bg-primary-dynamic flex items-center space-x-1"
                        >
                          {getCategoryIcon(item.category)}
                          <span>{getCategoryLabel(item.category)}</span>
                        </Badge>

                        {/* Public/Private indicator */}
                        <div className="absolute bottom-2 left-2">
                          {item.isPublic ? (
                            <Badge variant="default" className="text-xs bg-green-600">
                              <Eye className="h-3 w-3 mr-1" />
                              Javno
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="text-xs">
                              <EyeOff className="h-3 w-3 mr-1" />
                              Interno
                            </Badge>
                          )}
                        </div>
                        
                        {/* Overlay actions - only show when NOT in selection mode */}
                        {!selectionMode && (
                          <div className="absolute inset-0 backdrop-blur-xl bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                            <Button
                              variant="secondaryDefault"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                window.open(mediaApi.getFileUrl(item.filename), '_blank');
                              }}
                              title="Otvori fajl"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="secondaryDefault"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                copyToClipboard(mediaApi.getFileUrl(item.filename));
                              }}
                              title="Kopiraj URL"
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="secondaryDefault"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditMedia(item);
                              }}
                              title="Uredi"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="secondaryDefault"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedMedia(item);
                                setIsDeleteDialogOpen(true);
                              }}
                              title="Obriši"
                              className="text-red-600 hover:text-red-800"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>

                      <CardContent className="p-3">
                        <div className="space-y-1">
                          <h4 className="font-medium text-sm truncate" title={item.originalName}>
                            {item.originalName}
                          </h4>
                          
                          {item.description && (
                            <p className="text-xs text-muted-foreground truncate" title={item.description}>
                              {item.description}
                            </p>
                          )}
                          
                          {item.alt && (
                            <p className="text-xs text-muted-foreground truncate" title={item.alt}>
                              Alt: {item.alt}
                            </p>
                          )}
                          
                          {item.caption && (
                            <p className="text-xs text-muted-foreground truncate" title={item.caption}>
                              {item.caption}
                            </p>
                          )}

                          <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
                            <span>{formatFileSize(item.size)}</span>
                            <span className="flex items-center">
                              <Calendar className="mr-1 h-3 w-3" />
                              {formatDate(item.createdAt)}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-muted-foreground">
                    {searchTerm || categoryFilter !== 'all' || publicFilter !== 'all' ? (
                      <>
                        <Search className="mx-auto h-12 w-12 mb-4" />
                        <h3 className="text-lg font-medium mb-2">Nema rezultata</h3>
                        <p>Nema fajlova koji odgovaraju filterima</p>
                        <Button
                          variant="outline"
                          className="mt-4"
                          onClick={clearFilters}
                        >
                          Očisti filtere
                        </Button>
                      </>
                    ) : (
                      <>
                        <ImageIcon className="mx-auto h-12 w-12 mb-4" />
                        <h3 className="text-lg font-medium mb-2">Nema fajlova</h3>
                        <p className="mb-4">Počnite učitavanjem prvog fajla</p>
                        {!selectionMode && (
                          <div className="mt-4">
                            <p className="text-sm text-gray-500 mb-4">
                              Prevucite fajlove ovde ili koristite dugme za učitavanje
                            </p>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Media Statistics by Category */}
      {media.length > 0 && !selectionMode && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => {
            const categoryMedia = media.filter(item => item.category === category.value);
            const totalSize = categoryMedia.reduce((sum, item) => sum + item.size, 0);
            
            return (
              <Card key={category.value}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium flex items-center space-x-2">
                    {getCategoryIcon(category.value)}
                    <span>{category.label}</span>
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCategoryFilter(category.value)}
                    title={`Prikaži samo ${category.label}`}
                  >
                    <Filter className="h-4 w-4" />
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{categoryMedia.length}</div>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(totalSize)} • {category.description}
                  </p>
                  
                  {categoryMedia.length > 0 && (
                    <div className="mt-2 text-xs text-muted-foreground">
                      Javno: {categoryMedia.filter(item => item.isPublic).length} • 
                      Interno: {categoryMedia.filter(item => !item.isPublic).length}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Edit Media Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>Uredi medijski fajl</DialogTitle>
              <DialogDescription>
                Uredite informacije o fajlu "{selectedMedia?.originalName}"
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="category">Kategorija *</Label>
                <Select value={watchedCategory} onValueChange={(value) => setValue('category', value as MediaCategory)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Izaberite kategoriju" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        <div className="flex items-center space-x-2">
                          {getCategoryIcon(category.value)}
                          <div>
                            <div className="font-medium">{category.label}</div>
                            <div className="text-xs text-muted-foreground">{category.description}</div>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Opis dokumenta</Label>
                <Textarea
                  id="description"
                  placeholder="Detaljan opis dokumenta..."
                  rows={3}
                  {...register('description')}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isPublic"
                  checked={watchedIsPublic}
                  onCheckedChange={(checked) => setValue('isPublic', !!checked)}
                />
                <Label htmlFor="isPublic" className="flex items-center space-x-2">
                  {watchedIsPublic ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  <span>Javno dostupan dokument</span>
                </Label>
              </div>

              {selectedMedia?.mimeType?.startsWith('image/') && (
                <div className="space-y-2">
                  <Label htmlFor="alt">Alt tekst (za slike)</Label>
                  <Input
                    id="alt"
                    placeholder="Opisni tekst slike..."
                    {...register('alt')}
                  />
                  <p className="text-xs text-muted-foreground">
                    Koristi se za accessibility i SEO
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="caption">Naslov/Potpis</Label>
                <Input
                  id="caption"
                  placeholder="Kratki naslov ili potpis..."
                  {...register('caption')}
                />
              </div>

              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex justify-between">
                  <span>Ime fajla:</span>
                  <span className="font-mono">{selectedMedia?.filename}</span>
                </div>
                <div className="flex justify-between">
                  <span>Originalno ime:</span>
                  <span>{selectedMedia?.originalName}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tip:</span>
                  <span>{selectedMedia?.mimeType}</span>
                </div>
                <div className="flex justify-between">
                  <span>Veličina:</span>
                  <span>{selectedMedia ? formatFileSize(selectedMedia.size) : ''}</span>
                </div>
                <div className="flex justify-between">
                  <span>Datum:</span>
                  <span>{selectedMedia ? formatDate(selectedMedia.createdAt) : ''}</span>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsEditDialogOpen(false);
                  setSelectedMedia(null);
                  reset();
                }}
              >
                Otkaži
              </Button>
              <Button 
                type="submit" 
                variant={theme === "light" ? "default" : "secondaryDefault"}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Čuva se...' : 'Sačuvaj izmene'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Potvrdi brisanje</DialogTitle>
            <DialogDescription>
              Da li ste sigurni da želite da obrišete fajl "{selectedMedia?.originalName}"?
              Ova akcija se ne može poništiti i fajl će biti uklonjen sa servera.
            </DialogDescription>
          </DialogHeader>
          
          {selectedMedia?.mimeType?.startsWith('image/') && (
            <div className="py-4">
              <img
                crossOrigin='anonymous'
                src={mediaApi.getFileUrl(selectedMedia.filename)}
                alt={selectedMedia.alt || selectedMedia.originalName}
                className="w-full h-32 object-cover rounded border"
              />
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setSelectedMedia(null);
              }}
            >
              Otkaži
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteMedia}
            >
              Obriši fajl
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}