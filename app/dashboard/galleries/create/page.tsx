'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
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
  ArrowLeft,
  Save,
  Image as ImageIcon,
  Plus,
  X,
  Search,
  Calendar,
  Upload,
  Check,
  Grid3X3,
  Eye,
  EyeOff,
  Trash2,
} from 'lucide-react';
import { 
  galleryApi, 
  mediaApi,
  pagesApi,
} from '@/lib/api';
import { CreateGalleryDto, GalleryStatus, GalleryType, Media, Page } from '@/lib/types';
import { toast } from 'sonner';
import { useTheme } from 'next-themes';
import { transliterate } from '@/lib/transliterate';

interface FormData extends CreateGalleryDto {
  selectedImages: string[];
  assignToPages: number[];
  newImages: File[];
}

interface SelectedImage {
  type: 'existing' | 'new';
  id?: string;
  file?: File;
  filename?: string;
  preview?: string;
  name: string;
}

export default function CreateGalleryPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [galleryTypes, setGalleryTypes] = useState<Array<{ value: GalleryType; label: string; description: string }>>([]);
  const [availableImages, setAvailableImages] = useState<Media[]>([]);
  const [availablePages, setAvailablePages] = useState<Page[]>([]);
  const [selectedImages, setSelectedImages] = useState<SelectedImage[]>([]);
  const [isImageSelectorOpen, setIsImageSelectorOpen] = useState(false);
  const [imageSearchTerm, setImageSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [draggedOver, setDraggedOver] = useState(false);
  
  const router = useRouter();
  const { theme } = useTheme();

  const form = useForm<FormData>({
    defaultValues: {
      title: '',
      slug: '',
      description: '',
      status: GalleryStatus.DRAFT,
      type: GalleryType.GENERAL,
      sortOrder: 0,
      eventDate: '',
      selectedImages: [],
      assignToPages: [],
      newImages: []
    }
  });

  const watchedTitle = form.watch('title');

  useEffect(() => {
    fetchInitialData();
  }, []);

  // Auto-generate slug from title
  useEffect(() => {
    if (watchedTitle && !form.formState.dirtyFields.slug) {
      const slug = transliterate(watchedTitle)
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      form.setValue('slug', slug);
    }
  }, [watchedTitle, form]);

  const fetchInitialData = async () => {
    try {
      setIsLoading(true);
      
      const [typesResponse, imagesResponse, pagesResponse] = await Promise.all([
        galleryApi.getTypes(),
        galleryApi.getImageMedia(),
        pagesApi.getAll()
      ]);
      
      setGalleryTypes(typesResponse);
      setAvailableImages(imagesResponse);
      setAvailablePages(pagesResponse);
    } catch (error) {
      console.error('Error fetching initial data:', error);
      toast.error('Greška pri učitavanju podataka');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle existing image selection from media library
  const handleExistingImageToggle = (image: Media) => {
    const existingIndex = selectedImages.findIndex(
      img => img.type === 'existing' && img.filename === image.filename
    );

    if (existingIndex >= 0) {
      setSelectedImages(prev => prev.filter((_, index) => index !== existingIndex));
    } else {
      const newImage: SelectedImage = {
        type: 'existing',
        filename: image.filename,
        name: image.originalName,
        preview: mediaApi.getFileUrl(image.filename)
      };
      setSelectedImages(prev => [...prev, newImage]);
    }
  };

  // Handle new file uploads
  const handleFileUpload = (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    
    fileArray.forEach(file => {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} nije slika i neće biti dodana`);
        return;
      }

      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name} je prevelika (maksimalno 10MB)`);
        return;
      }

      // Check if file already selected
      const exists = selectedImages.some(
        img => img.type === 'new' && img.file?.name === file.name
      );

      if (exists) {
        toast.warning(`${file.name} je već izabrana`);
        return;
      }

      // Create preview URL
      const preview = URL.createObjectURL(file);
      
      const newImage: SelectedImage = {
        type: 'new',
        id: Math.random().toString(36).substr(2, 9),
        file,
        name: file.name,
        preview
      };

      setSelectedImages(prev => [...prev, newImage]);
    });
  };

  // File input change handler
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files);
    }
    // Clear input
    e.target.value = '';
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDraggedOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDraggedOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDraggedOver(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files);
    }
  };

  // Remove selected image
  const removeSelectedImage = (index: number) => {
    const image = selectedImages[index];
    
    // Revoke object URL for new images to prevent memory leaks
    if (image.type === 'new' && image.preview) {
      URL.revokeObjectURL(image.preview);
    }
    
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  const filteredImages = availableImages.filter(image => 
    image.originalName.toLowerCase().includes(imageSearchTerm.toLowerCase()) ||
    image.description?.toLowerCase().includes(imageSearchTerm.toLowerCase())
  );

  const handleSubmit = async (data: FormData) => {
    try {
      setIsSubmitting(true);
      
      // Validate that we have at least one image
      if (selectedImages.length === 0) {
        toast.error('Molimo dodajte barem jednu sliku u galeriju');
        return;
      }
      
      // Create gallery first
      const galleryData: CreateGalleryDto = {
        title: data.title,
        slug: data.slug,
        description: data.description,
        status: data.status,
        type: data.type,
        sortOrder: data.sortOrder,
        eventDate: data.eventDate || undefined
      };

      const gallery = await galleryApi.create(galleryData);
      
      let successCount = 0;
      let totalImages = selectedImages.length;
      
      // Upload new images to the gallery
      const newImages = selectedImages.filter(img => img.type === 'new' && img.file);
      if (newImages.length > 0) {
        try {
          const files = newImages.map(img => img.file!);
          await galleryApi.uploadImages(gallery.id, files, {
            title: 'Gallery Image',
            description: `Image for gallery: ${gallery.title}`,
            sortOrder: 0
          });
          successCount += newImages.length;
          console.log(`Uploaded ${newImages.length} new images to gallery`);
        } catch (error) {
          console.error('Error uploading new images:', error);
          toast.error('Greška pri otpremanju novih slika');
        }
      }

      // Add existing images from media library to the gallery
      const existingImages = selectedImages.filter(img => img.type === 'existing');
      if (existingImages.length > 0) {
        try {
          const filenames = existingImages.map(img => img.filename!);
          await galleryApi.addExistingMediaByFilename(gallery.id, filenames);
          successCount += existingImages.length;
          console.log(`Added ${filenames.length} existing images to gallery`);
        } catch (error) {
          console.error('Error adding existing media to gallery:', error);
          toast.warning('Nove slike su otpremljene, ali greška pri dodavanju postojećih slika');
        }
      }

      // Show appropriate success message
      if (successCount === totalImages) {
        toast.success(`Galerija je uspešno kreirana sa ${successCount} slika`);
      } else if (successCount > 0) {
        toast.warning(`Galerija je kreirana sa ${successCount} od ${totalImages} slika`);
      } else {
        toast.error('Galerija je kreirana, ali nijedna slika nije dodana');
      }
      
      router.push(`/dashboard/galleries/${gallery.id}`);
    } catch (error: any) {
      console.error('Error creating gallery:', error);
      toast.error(error.response?.data?.message || 'Greška pri kreiranju galerije');
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmImageSelection = () => {
    setIsImageSelectorOpen(false);
  };

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      selectedImages.forEach(image => {
        if (image.type === 'new' && image.preview) {
          URL.revokeObjectURL(image.preview);
        }
      });
    };
  }, []);

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Kreiraj novu galeriju</h1>
          <p className="text-muted-foreground">
            Organizujte slike u galerije i predstavite ih publici
          </p>
        </div>
      </div>

      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Osnovni podaci</CardTitle>
              <CardDescription>
                Unesite osnovne informacije o galeriji
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Naziv galerije *</Label>
                <Input
                  id="title"
                  placeholder="npr. Otvaranje novog parka"
                  {...form.register('title', { 
                    required: 'Naziv je obavezan',
                    minLength: { value: 3, message: 'Naziv mora imati najmanje 3 karaktera' }
                  })}
                />
                {form.formState.errors.title && (
                  <p className="text-sm text-red-600">{form.formState.errors.title.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">URL skraćenica *</Label>
                <Input
                  id="slug"
                  placeholder="otvaranje-novog-parka"
                  {...form.register('slug', {
                    required: 'URL skraćenica je obavezna',
                    pattern: {
                      value: /^[a-z0-9-]+$/,
                      message: 'Može sadržati samo mala slova, brojeve i crtice'
                    }
                  })}
                />
                {form.formState.errors.slug && (
                  <p className="text-sm text-red-600">{form.formState.errors.slug.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Opis galerije</Label>
                <Textarea
                  id="description"
                  placeholder="Kratki opis galerije..."
                  rows={3}
                  {...form.register('description')}
                />
              </div>
            </CardContent>
          </Card>

          {/* Gallery Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Podešavanja galerije</CardTitle>
              <CardDescription>
                Konfigurisanje tipa i statusa galerije
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="type">Tip galerije</Label>
                <Select value={form.watch('type')} onValueChange={(value) => form.setValue('type', value as GalleryType)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Izaberite tip" />
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
                <Label htmlFor="status">Status</Label>
                <Select value={form.watch('status')} onValueChange={(value) => form.setValue('status', value as GalleryStatus)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Izaberite status" />
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
                        <span>Objavljeno</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sortOrder">Redosled</Label>
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
                    <Label htmlFor="eventDate">Datum događaja</Label>
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

        {/* Image Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Slike galerije</CardTitle>
            <CardDescription>
              Otpremite nove slike ili izaberite postojeće iz medijske biblioteke
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Upload Area */}
              <div
                className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                  draggedOver 
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-950' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <ImageIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  {draggedOver ? 'Otpustite slike ovde' : 'Otpremite nove slike'}
                </h3>
                <p className="text-gray-500 mb-4">
                  Prevucite slike ovde ili kliknite da izaberete fajlove
                </p>
                <div className="flex items-center justify-center space-x-4">
                  <label htmlFor="file-upload">
                    <Button type="button" variant="outline" asChild>
                      <span>
                        <Upload className="mr-2 h-4 w-4" />
                        Izaberi fajlove
                      </span>
                    </Button>
                  </label>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsImageSelectorOpen(true)}
                  >
                    <Grid3X3 className="mr-2 h-4 w-4" />
                    Medijska biblioteka
                  </Button>
                </div>
                <input
                  id="file-upload"
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileInputChange}
                />
                <p className="text-xs text-gray-400 mt-2">
                  Podržani formati: JPG, PNG, GIF, WebP (maksimalno 10MB po slici)
                </p>
              </div>

              {/* Selected Images Preview */}
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Izabrano: {selectedImages.length} slika
                </p>
                {selectedImages.length > 0 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      selectedImages.forEach(image => {
                        if (image.type === 'new' && image.preview) {
                          URL.revokeObjectURL(image.preview);
                        }
                      });
                      setSelectedImages([]);
                    }}
                  >
                    <X className="mr-2 h-3 w-3" />
                    Ukloni sve
                  </Button>
                )}
              </div>

              {selectedImages.length > 0 && (
                <div className="grid gap-3 grid-cols-2 md:grid-cols-4 lg:grid-cols-6">
                  {selectedImages.map((image, index) => (
                    <div key={`${image.type}-${image.filename || image.id}`} className="relative group">
                      <img
                        src={image.preview}
                        alt={image.name}
                        className="w-full aspect-square object-cover rounded border"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeSelectedImage(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                      {/* Type indicator */}
                      <div className="absolute bottom-1 left-1">
                        <span className={`text-xs px-1 py-0.5 rounded text-white ${
                          image.type === 'new' ? 'bg-green-600' : 'bg-blue-600'
                        }`}>
                          {image.type === 'new' ? 'Nova' : 'Postojeća'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {selectedImages.length === 0 && (
                <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
                  <ImageIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-gray-500 mb-2">Nema izabranih slika</p>
                  <p className="text-sm text-gray-400">Otpremite nove slike ili izaberite postojeće</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Page Assignment */}
        <Card>
          <CardHeader>
            <CardTitle>Dodeli stranicama</CardTitle>
            <CardDescription>
              Izaberite stranice na kojima će se galerija prikazivati
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {availablePages.map((page) => (
                <div key={page.id} className="flex items-center space-x-3">
                  <Checkbox
                    id={`page-${page.id}`}
                    checked={form.watch('assignToPages')?.includes(page.id) || false}
                    onCheckedChange={(checked) => {
                      const currentPages = form.watch('assignToPages') || [];
                      if (checked) {
                        form.setValue('assignToPages', [...currentPages, page.id]);
                      } else {
                        form.setValue('assignToPages', currentPages.filter(id => id !== page.id));
                      }
                    }}
                  />
                  <Label htmlFor={`page-${page.id}`} className="flex-1 cursor-pointer">
                    <div>
                      <div className="font-medium">{page.title}</div>
                      <div className="text-xs text-gray-500">/{page.slug}</div>
                    </div>
                  </Label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Form Actions */}
        <div className="flex items-center justify-end space-x-2 pt-6 border-t">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => router.back()}
            disabled={isSubmitting}
          >
            Otkaži
          </Button>
          <Button 
            type="submit" 
            disabled={isSubmitting}
            variant={theme === "light" ? "default" : "secondaryDefault"}
          >
            {isSubmitting ? 'Kreira se...' : 'Kreiraj galeriju'}
            <Save className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </form>

      {/* Image Selection Dialog */}
      <Dialog open={isImageSelectorOpen} onOpenChange={setIsImageSelectorOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Izaberi slike iz medijske biblioteke</DialogTitle>
            <DialogDescription>
              Kliknite na slike da ih dodate u galeriju
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Pretraži slike..."
                value={imageSearchTerm}
                onChange={(e) => setImageSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Images Grid */}
            <div className="grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {filteredImages.map((image) => {
                const isSelected = selectedImages.some(
                  img => img.type === 'existing' && img.filename === image.filename
                );
                
                return (
                  <div
                    key={image.id}
                    className={`relative cursor-pointer border-2 rounded-lg overflow-hidden transition-all ${
                      isSelected
                        ? 'border-blue-500 ring-2 ring-blue-200'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handleExistingImageToggle(image)}
                  >
                    <img
                      src={mediaApi.getFileUrl(image.filename)}
                      alt={image.alt || image.originalName}
                      className="w-full aspect-square object-cover"
                    />
                    
                    {/* Selection indicator */}
                    {isSelected && (
                      <div className="absolute top-2 right-2 bg-blue-500 text-white rounded-full p-1">
                        <Check className="h-3 w-3" />
                      </div>
                    )}

                    {/* Image info */}
                    <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-2">
                      <p className="text-xs truncate" title={image.originalName}>
                        {image.originalName}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {filteredImages.length === 0 && (
              <div className="text-center py-8">
                <ImageIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-500">
                  {imageSearchTerm ? 'Nema slika koje odgovaraju pretrazi' : 'Nema dostupnih slika'}
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <div className="flex items-center justify-between w-full">
              <p className="text-sm text-muted-foreground">
                Izabrano iz biblioteke: {selectedImages.filter(img => img.type === 'existing').length} slika
              </p>
              <div className="space-x-2">
                <Button variant="outline" onClick={() => setIsImageSelectorOpen(false)}>
                  Zatvori
                </Button>
              </div>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}