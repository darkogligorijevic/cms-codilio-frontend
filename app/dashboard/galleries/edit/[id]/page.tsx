'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  ArrowLeft,
  Save,
  Eye,
  EyeOff,
  Calendar,
  Upload,
  Plus,
  X,
  MoreVertical,
  Edit,
  Trash2,
  Image as ImageIcon,
  Star,
  Move,
  Grid3X3,
  CheckCircle,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { 
  galleryApi,
  mediaApi
} from '@/lib/api';
import { 
  Gallery, 
  GalleryImage,
  UpdateGalleryDto, 
  GalleryStatus, 
  GalleryType,
  CreateGalleryImageDto,
  UpdateGalleryImageDto,
  Media
} from '@/lib/types';
import { toast } from 'sonner';
import { useTheme } from 'next-themes';
import { transliterate } from '@/lib/transliterate';
import { DragDropUpload } from '@/components/ui/drag-drop-upload';

interface FormData extends UpdateGalleryDto {
  // Add any additional fields if needed
}

interface UploadingFile {
  id: string;
  name: string;
  progress: number;
  status: 'uploading' | 'success' | 'error';
  error?: string;
}

export default function EditGalleryPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [gallery, setGallery] = useState<Gallery | null>(null);
  const [galleryTypes, setGalleryTypes] = useState<Array<{ value: GalleryType; label: string; description: string }>>([]);
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [isLoadingImages, setIsLoadingImages] = useState(false);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isAddMediaDialogOpen, setIsAddMediaDialogOpen] = useState(false);
  const [isEditImageDialogOpen, setIsEditImageDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [imageToDelete, setImageToDelete] = useState<GalleryImage | null>(null);
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const [availableMedia, setAvailableMedia] = useState<Media[]>([]);
  const [selectedMediaIds, setSelectedMediaIds] = useState<number[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  
  const router = useRouter();
  const params = useParams();
  const { theme } = useTheme();
  const galleryId = parseInt(params.id as string);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<FormData>({
    defaultValues: {
      title: '',
      slug: '',
      description: '',
      status: GalleryStatus.DRAFT,
      type: GalleryType.GENERAL,
      sortOrder: 0,
      eventDate: ''
    }
  });

  const imageEditForm = useForm<UpdateGalleryImageDto>({
    defaultValues: {
      title: '',
      description: '',
      alt: '',
      isVisible: true
    }
  });

  const watchedTitle = form.watch('title');

  useEffect(() => {
    if (galleryId && !isNaN(galleryId)) {
      fetchGalleryData();
      fetchGalleryTypes();
      fetchGalleryImages();
      fetchAvailableMedia();
    } else {
      console.error('Invalid gallery ID:', params.id);
      toast.error('Неважећи ID галерије');
      router.push('/dashboard/galleries');
    }
  }, [galleryId]);

  // Auto-generate slug from title if slug field is being edited
  useEffect(() => {
    if (watchedTitle && gallery && !form.formState.dirtyFields.slug) {
      const slug = transliterate(watchedTitle)
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      form.setValue('slug', slug);
    }
  }, [watchedTitle, form, gallery]);

  const fetchGalleryData = async () => {
    try {
      setIsLoading(true);
      console.log('Fetching gallery data for edit, ID:', galleryId);
      
      const galleryData = await galleryApi.getById(galleryId);
      
      console.log('Gallery data for edit:', galleryData);
      setGallery(galleryData);
      
      // Populate form with existing data
      form.reset({
        title: galleryData.title,
        slug: galleryData.slug,
        description: galleryData.description || '',
        status: galleryData.status,
        type: galleryData.type,
        sortOrder: galleryData.sortOrder,
        eventDate: galleryData.eventDate ? galleryData.eventDate.split('T')[0] : ''
      });
      
    } catch (error: any) {
      console.error('Error fetching gallery data:', error);
      const errorMessage = error.response?.data?.message || 'Грешка при учитавању галерије';
      toast.error(errorMessage);
      router.push('/dashboard/galleries');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchGalleryTypes = async () => {
    try {
      const typesResponse = await galleryApi.getTypes();
      setGalleryTypes(typesResponse);
    } catch (error) {
      console.error('Error fetching gallery types:', error);
      toast.error('Грешка при учитавању типова галерија');
    }
  };

  const fetchGalleryImages = async () => {
    try {
      setIsLoadingImages(true);
      const imagesData = await galleryApi.getImages(galleryId);
      setImages(imagesData);
    } catch (error) {
      console.error('Error fetching gallery images:', error);
      toast.error('Грешка при учитавању слика');
    } finally {
      setIsLoadingImages(false);
    }
  };

  const fetchAvailableMedia = async () => {
    try {
      const mediaData = await galleryApi.getImageMedia();
      setAvailableMedia(mediaData);
    } catch (error) {
      console.error('Error fetching available media:', error);
    }
  };

  const handleSubmit = async (data: FormData) => {
    if (!gallery) return;

    try {
      setIsSubmitting(true);
      console.log('Updating gallery with data:', data);
      
      // Prepare update data
      const updateData: UpdateGalleryDto = {
        title: data.title,
        slug: data.slug,
        description: data.description,
        status: data.status,
        type: data.type,
        sortOrder: data.sortOrder,
        eventDate: data.eventDate || undefined
      };

      const updatedGallery = await galleryApi.update(galleryId, updateData);
      
      console.log('Gallery updated:', updatedGallery);
      toast.success('Галерија је успешно ажурирана');
      setGallery(updatedGallery);
    } catch (error: any) {
      console.error('Error updating gallery:', error);
      const errorMessage = error.response?.data?.message || 'Грешка при ажурирању галерије';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Image upload handling
  const handleFileUpload = async (file: File, metadata?: CreateGalleryImageDto) => {
    const uploadId = Math.random().toString(36).substr(2, 9);
    
    setUploadingFiles(prev => [...prev, {
      id: uploadId,
      name: file.name,
      progress: 0,
      status: 'uploading'
    }]);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadingFiles(prev => prev.map(f => 
          f.id === uploadId && f.progress < 90 
            ? { ...f, progress: Math.min(f.progress + Math.random() * 20, 90) }
            : f
        ));
      }, 300);

      const uploadedImages = await galleryApi.uploadImages(galleryId, [file], metadata);
      
      clearInterval(progressInterval);
      
      setUploadingFiles(prev => prev.map(f => 
        f.id === uploadId ? { ...f, progress: 100, status: 'success' } : f
      ));

      // Refresh images
      await fetchGalleryImages();
      
      toast.success(`${file.name} је успешно додата`);
      
      // Remove from uploading files after delay
      setTimeout(() => {
        setUploadingFiles(prev => prev.filter(f => f.id !== uploadId));
      }, 2000);

    } catch (error: any) {
      console.error('Error uploading image:', error);
      
      setUploadingFiles(prev => prev.map(f => 
        f.id === uploadId 
          ? { ...f, status: 'error', error: error.response?.data?.message || 'Грешка при учитавању' }
          : f
      ));
      
      toast.error(`Грешка при учитавању ${file.name}`);
      
      setTimeout(() => {
        setUploadingFiles(prev => prev.filter(f => f.id !== uploadId));
      }, 3000);
    }
  };

  // Handle multiple file upload
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach(file => handleFileUpload(file));
    
    if (e.target) {
      e.target.value = '';
    }
  };

  // Add existing media to gallery
  const handleAddExistingMedia = async () => {
    if (selectedMediaIds.length === 0) {
      toast.error('Изаберите најмање једну слику');
      return;
    }

    try {
      await galleryApi.addExistingMediaToGallery(galleryId, selectedMediaIds);
      await fetchGalleryImages();
      setSelectedMediaIds([]);
      setIsAddMediaDialogOpen(false);
      toast.success(`Додато је ${selectedMediaIds.length} слика у галерију`);
    } catch (error: any) {
      console.error('Error adding existing media:', error);
      toast.error(error.response?.data?.message || 'Грешка при додавању слика');
    }
  };

  // Edit image
  const handleEditImage = (image: GalleryImage) => {
    setSelectedImage(image);
    imageEditForm.reset({
      title: image.title || '',
      description: image.description || '',
      alt: image.alt || '',
      isVisible: image.isVisible
    });
    setIsEditImageDialogOpen(true);
  };

  const handleUpdateImage = async (data: UpdateGalleryImageDto) => {
    if (!selectedImage) return;

    try {
      await galleryApi.updateImage(galleryId, selectedImage.id, data);
      await fetchGalleryImages();
      setIsEditImageDialogOpen(false);
      setSelectedImage(null);
      toast.success('Слика је успешно ажурирана');
    } catch (error: any) {
      console.error('Error updating image:', error);
      toast.error(error.response?.data?.message || 'Грешка при ажурирању слике');
    }
  };

  // Delete image
  const handleDeleteImage = (image: GalleryImage) => {
    setImageToDelete(image);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteImage = async () => {
    if (!imageToDelete) return;

    try {
      await galleryApi.deleteImage(galleryId, imageToDelete.id);
      await fetchGalleryImages();
      setIsDeleteDialogOpen(false);
      setImageToDelete(null);
      toast.success('Слика је успешно обрисана');
    } catch (error: any) {
      console.error('Error deleting image:', error);
      toast.error(error.response?.data?.message || 'Грешка при брисању слике');
    }
  };

  // Set cover image
  const handleSetCoverImage = async (image: GalleryImage) => {
    try {
      await galleryApi.setCoverImage(galleryId, image.id);
      await fetchGalleryData(); // Refresh gallery data to get new cover
      await fetchGalleryImages(); // Refresh images
      toast.success('Слика је постављена као насловна');
    } catch (error: any) {
      console.error('Error setting cover image:', error);
      toast.error(error.response?.data?.message || 'Грешка при постављању насловне слике');
    }
  };

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!gallery) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold mb-2">Галерија није пронађена</h1>
        <Button onClick={() => router.push('/dashboard/galleries')}>
          Назад на галерије
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button variant="ghost" onClick={() => router.push(`/dashboard/galleries/${gallery.id}`)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Уреди галерију</h1>
          <p className="text-muted-foreground">
            Ажурирајте информације о галерији "{gallery.title}"
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Gallery Form - 2/3 width */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Основни подаци</CardTitle>
                  <CardDescription>
                    Ажурирајте основне информације о галерији
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Наслов галерије *</Label>
                    <Input
                      id="title"
                      placeholder="нпр. Отварање новог парка"
                      {...form.register('title', { 
                        required: 'Наслов је обавезан',
                        minLength: { value: 3, message: 'Наслов мора имати најмање 3 карактера' }
                      })}
                    />
                    {form.formState.errors.title && (
                      <p className="text-sm text-red-600">{form.formState.errors.title.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="slug">URL скраћеница *</Label>
                    <Input
                      id="slug"
                      placeholder="otvaranje-novog-parka"
                      {...form.register('slug', {
                        required: 'URL скраћеница је обавезна',
                        pattern: {
                          value: /^[a-z0-9-]+$/,
                          message: 'Може садржати само мала слова, бројеве и цртице'
                        }
                      })}
                    />
                    {form.formState.errors.slug && (
                      <p className="text-sm text-red-600">{form.formState.errors.slug.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Опис галерије</Label>
                    <Textarea
                      id="description"
                      placeholder="Кратак опис галерије..."
                      rows={3}
                      {...form.register('description')}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Gallery Settings */}
              <Card>
                <CardHeader>
                  <CardTitle>Подешавања галерије</CardTitle>
                  <CardDescription>
                    Конфигурисање типа и статуса галерије
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="type">Тип галерије</Label>
                    <Select value={form.watch('type')} onValueChange={(value) => form.setValue('type', value as GalleryType)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Изаберите тип" />
                      </SelectTrigger>
                      <SelectContent>
                        {galleryTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            <div>
                              <div className="font-medium">{type.label}</div>
                              <div className="text-xs text-gray-500">{type.description}</div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="status">Статус</Label>
                    <Select value={form.watch('status')} onValueChange={(value) => form.setValue('status', value as GalleryStatus)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Изаберите статус" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={GalleryStatus.DRAFT}>
                          <div className="flex items-center space-x-2">
                            <EyeOff className="h-4 w-4" />
                            <span>Draft</span>
                          </div>
                        </SelectItem>
                        <SelectItem value={GalleryStatus.PUBLISHED}>
                          <div className="flex items-center space-x-2">
                            <Eye className="h-4 w-4" />
                            <span>Објављено</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="sortOrder">Редослед</Label>
                      <Input
                        id="sortOrder"
                        type="number"
                        min="0"
                        placeholder="0"
                        {...form.register('sortOrder', {
                          setValueAs: (value) => parseInt(value) || 0
                        })}
                      />
                    </div>

                    {form.watch('type') === GalleryType.EVENT && (
                      <div className="space-y-2">
                        <Label htmlFor="eventDate">Датум догађаја</Label>
                        <Input
                          id="eventDate"
                          type="date"
                          {...form.register('eventDate')}
                        />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Current Gallery Info */}
            <Card>
              <CardHeader>
                <CardTitle>Тренутне информације</CardTitle>
                <CardDescription>
                  Преглед тренутних података о галерији
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Број слика</p>
                    <p className="text-2xl font-bold">{images.length || 0}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Број прегледа</p>
                    <p className="text-2xl font-bold">{gallery.viewCount}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Креирано</p>
                    <p className="text-sm text-muted-foreground">
                      <Calendar className="h-3 w-3 inline mr-1" />
                      {new Date(gallery.createdAt).toLocaleDateString('sr-RS')}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Form Actions */}
            <div className="flex items-center justify-end space-x-2 pt-6 border-t">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => router.push(`/dashboard/galleries/${gallery.id}`)}
                disabled={isSubmitting}
              >
                Откажи
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
                variant={theme === "light" ? "default" : "secondaryDefault"}
              >
                {isSubmitting ? 'Чува се...' : 'Сачувај измене'}
                <Save className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </form>
        </div>

        {/* Image Management - 1/3 width */}
        <div className="space-y-6">
          {/* Upload Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <ImageIcon className="h-5 w-5" />
                <span>Управљање сликама</span>
              </CardTitle>
              <CardDescription>
                Додајте нове слике или управљајте постојећима
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Button 
                  onClick={() => fileInputRef.current?.click()}
                  variant={theme === "light" ? "default" : "secondaryDefault"}
                  className="w-full"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Учитај нове слике
                </Button>
                
                <Button 
                  onClick={() => setIsAddMediaDialogOpen(true)}
                  variant="outline"
                  className="w-full"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Додај постојеће
                </Button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileInputChange}
                className="hidden"
              />

              {uploadingFiles.length > 0 && (
                <div className="space-y-2 pt-4 border-t">
                  <h4 className="text-sm font-medium">Учитавање слика</h4>
                  {uploadingFiles.map((file) => (
                    <div key={file.id} className="flex items-center space-x-2 text-sm">
                      {file.status === 'uploading' && <Loader2 className="h-4 w-4 animate-spin" />}
                      {file.status === 'success' && <CheckCircle className="h-4 w-4 text-green-600" />}
                      {file.status === 'error' && <AlertCircle className="h-4 w-4 text-red-600" />}
                      
                      <div className="flex-1 min-w-0">
                        <p className="truncate">{file.name}</p>
                        {file.status === 'uploading' && (
                          <div className="w-full bg-gray-200 rounded-full h-1">
                            <div
                              className="bg-blue-600 h-1 rounded-full transition-all"
                              style={{ width: `${file.progress}%` }}
                            />
                          </div>
                        )}
                        {file.status === 'error' && file.error && (
                          <p className="text-red-600 text-xs">{file.error}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Current Images */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Grid3X3 className="h-5 w-5" />
                  <span>Тренутне слике ({images.length})</span>
                </div>
                {isLoadingImages && <Loader2 className="h-4 w-4 animate-spin" />}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingImages ? (
                <div className="grid gap-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="aspect-square bg-gray-200 rounded mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded"></div>
                    </div>
                  ))}
                </div>
              ) : images.length > 0 ? (
                <div className="grid gap-3">
                  {images.map((image) => (
                    <div key={image.id} className="relative group">
                      <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                        <img
                          src={galleryApi.getImageUrl(image.filename)}
                          alt={image.alt || image.title || image.originalName}
                          className="w-full h-full object-cover"
                        />
                        
                        {/* Overlay with actions */}
                        <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="secondary" size="sm">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEditImage(image)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Уреди
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleSetCoverImage(image)}>
                                <Star className="mr-2 h-4 w-4" />
                                Постави као насловну
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => handleDeleteImage(image)}
                                className="text-red-600"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Обриши
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                        {/* Cover image indicator */}
                        {gallery.coverImage === image.filename && (
                          <div className="absolute top-2 left-2">
                            <Badge className="bg-yellow-500 text-yellow-900">
                              <Star className="h-3 w-3 mr-1" />
                              Насловна
                            </Badge>
                          </div>
                        )}

                        {/* Visibility indicator */}
                        {!image.isVisible && (
                          <div className="absolute top-2 right-2">
                            <Badge variant="secondary">
                              <EyeOff className="h-3 w-3 mr-1" />
                              Скривена
                            </Badge>
                          </div>
                        )}
                      </div>
                      
                      <div className="mt-2 space-y-1">
                        <h4 className="text-sm font-medium truncate">
                          {image.title || image.originalName}
                        </h4>
                        <p className="text-xs text-gray-500">
                          {formatFileSize(image.size)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <ImageIcon className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                    Нема слика
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Додајте прву слику у ову галерију
                  </p>
                  <Button 
                    onClick={() => fileInputRef.current?.click()}
                    variant={theme === "light" ? "default" : "secondaryDefault"}
                    size="sm"
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Учитај слике
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Add Existing Media Dialog */}
      <Dialog open={isAddMediaDialogOpen} onOpenChange={setIsAddMediaDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Додај постојеће слике</DialogTitle>
            <DialogDescription>
              Изаберите слике из медијске библиотеке за додавање у галерију
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto">
            {availableMedia.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
                {availableMedia.map((media) => {
                  const isSelected = selectedMediaIds.includes(media.id);
                  
                  return (
                    <div
                      key={media.id}
                      className={`relative cursor-pointer border-2 rounded-lg overflow-hidden transition-all ${
                        isSelected 
                          ? 'border-blue-500 ring-2 ring-blue-200' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => {
                        setSelectedMediaIds(prev => 
                          isSelected 
                            ? prev.filter(id => id !== media.id)
                            : [...prev, media.id]
                        );
                      }}
                    >
                      <div className="aspect-square bg-gray-100">
                        <img
                          src={mediaApi.getFileUrl(media.filename)}
                          alt={media.alt || media.originalName}
                          className="w-full h-full object-cover"
                        />
                        
                        {isSelected && (
                          <div className="absolute inset-0 bg-blue-500 bg-opacity-20 flex items-center justify-center">
                            <CheckCircle className="h-8 w-8 text-blue-600 bg-white rounded-full" />
                          </div>
                        )}
                      </div>
                      
                      <div className="p-2">
                        <h4 className="font-medium text-sm truncate">
                          {media.originalName}
                        </h4>
                        <p className="text-xs text-gray-500">
                          {formatFileSize(media.size)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <ImageIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium mb-2">Нема доступних слика</h3>
                <p className="text-gray-500">
                  Прво учитајте слике у медијску библиотеку
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <div className="flex items-center justify-between w-full">
              <p className="text-sm text-gray-500">
                Изабрано: {selectedMediaIds.length} слика
              </p>
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsAddMediaDialogOpen(false);
                    setSelectedMediaIds([]);
                  }}
                >
                  Откажи
                </Button>
                <Button 
                  onClick={handleAddExistingMedia}
                  disabled={selectedMediaIds.length === 0}
                  variant={theme === "light" ? "default" : "secondaryDefault"}
                >
                  Додај изабране слике
                </Button>
              </div>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Image Dialog */}
      <Dialog open={isEditImageDialogOpen} onOpenChange={setIsEditImageDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Уреди слику</DialogTitle>
            <DialogDescription>
              Ажурирајте информације о слици
            </DialogDescription>
          </DialogHeader>

          {selectedImage && (
            <div className="space-y-4">
              {/* Image preview */}
              <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                <img
                  src={galleryApi.getImageUrl(selectedImage.filename)}
                  alt={selectedImage.alt || selectedImage.title || selectedImage.originalName}
                  className="w-full h-full object-contain"
                />
              </div>

              <form onSubmit={imageEditForm.handleSubmit(handleUpdateImage)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="image-title">Наслов слике</Label>
                    <Input
                      id="image-title"
                      placeholder="Наслов слике..."
                      {...imageEditForm.register('title')}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="image-alt">Alt текст</Label>
                    <Input
                      id="image-alt"
                      placeholder="Опис слике за приступачност..."
                      {...imageEditForm.register('alt')}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="image-description">Опис</Label>
                  <Textarea
                    id="image-description"
                    placeholder="Детаљан опис слике..."
                    rows={3}
                    {...imageEditForm.register('description')}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="image-visible"
                    {...imageEditForm.register('isVisible')}
                    className="rounded"
                  />
                  <Label htmlFor="image-visible">Слика је видљива</Label>
                </div>

                <DialogFooter>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsEditImageDialogOpen(false)}
                  >
                    Откажи
                  </Button>
                  <Button 
                    type="submit"
                    variant={theme === "light" ? "default" : "secondaryDefault"}
                  >
                    Сачувај измене
                  </Button>
                </DialogFooter>
              </form>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Image Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Потврди брисање слике</DialogTitle>
            <DialogDescription>
              Да ли сте сигурни да желите да обришете слику{' '}
              <strong>{imageToDelete?.title || imageToDelete?.originalName}</strong>? 
              Ова акција се не може поништити.
            </DialogDescription>
          </DialogHeader>
          
          {imageToDelete && (
            <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden my-4">
              <img
                src={galleryApi.getImageUrl(imageToDelete.filename)}
                alt={imageToDelete.alt || imageToDelete.title || imageToDelete.originalName}
                className="w-full h-full object-contain"
              />
            </div>
          )}
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Откажи
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmDeleteImage}
            >
              Обриши слику
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}