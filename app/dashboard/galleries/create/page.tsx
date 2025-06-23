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
  EyeOff
} from 'lucide-react';
import { 
  galleryApi, 
  mediaApi,
  pagesApi,
} from '@/lib/api';
import { CreateGalleryDto, GalleryStatus, GalleryType, Media, Page } from '@/lib/types';
import { toast } from 'sonner';
import { useTheme } from 'next-themes';

interface FormData extends CreateGalleryDto {
  selectedImages: string[];
  assignToPages: number[];
}

export default function CreateGalleryPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [galleryTypes, setGalleryTypes] = useState<Array<{ value: GalleryType; label: string; description: string }>>([]);
  const [availableImages, setAvailableImages] = useState<Media[]>([]);
  const [availablePages, setAvailablePages] = useState<Page[]>([]);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [isImageSelectorOpen, setIsImageSelectorOpen] = useState(false);
  const [imageSearchTerm, setImageSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  
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
      assignToPages: []
    }
  });

  const watchedTitle = form.watch('title');

  useEffect(() => {
    fetchInitialData();
  }, []);

  // Auto-generate slug from title
  useEffect(() => {
    if (watchedTitle && !form.formState.dirtyFields.slug) {
      const slug = watchedTitle
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
        galleryApi.getImageMedia(), // This will get only images from media
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

  const handleImageToggle = (imageFilename: string) => {
    setSelectedImages(prev => {
      if (prev.includes(imageFilename)) {
        return prev.filter(filename => filename !== imageFilename);
      } else {
        return [...prev, imageFilename];
      }
    });
  };

  const filteredImages = availableImages.filter(image => 
    image.originalName.toLowerCase().includes(imageSearchTerm.toLowerCase()) ||
    image.description?.toLowerCase().includes(imageSearchTerm.toLowerCase())
  );

  const handleSubmit = async (data: FormData) => {
    try {
      setIsSubmitting(true);
      
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
      
      // If images are selected, we need to upload them to the gallery
      // Since they're already in media, we'll need to copy them to gallery
      if (selectedImages.length > 0) {
        // This would require a new API endpoint to add existing media files to gallery
        // For now, we'll note this in the success message
        console.log('Selected images:', selectedImages);
      }

      toast.success('Galerija je uspešno kreirana');
      router.push(`/dashboard/galleries/${gallery.id}`);
    } catch (error: any) {
      console.error('Error creating gallery:', error);
      toast.error(error.response?.data?.message || 'Greška pri kreiranju galerije');
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmImageSelection = () => {
    form.setValue('selectedImages', selectedImages);
    setIsImageSelectorOpen(false);
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
            <CardTitle>Izbor slika</CardTitle>
            <CardDescription>
              Izaberite slike iz medijske biblioteke za ovu galeriju
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Izabrano: {selectedImages.length} slika
                </p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsImageSelectorOpen(true)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Dodaj slike
                </Button>
              </div>

              {selectedImages.length > 0 && (
                <div className="grid gap-2 grid-cols-2 md:grid-cols-4 lg:grid-cols-6">
                  {selectedImages.map((filename) => {
                    const image = availableImages.find(img => img.filename === filename);
                    if (!image) return null;
                    
                    return (
                      <div key={filename} className="relative group">
                        <img
                          src={mediaApi.getFileUrl(image.filename)}
                          alt={image.alt || image.originalName}
                          className="w-full aspect-square object-cover rounded border"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleImageToggle(filename)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}

              {selectedImages.length === 0 && (
                <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
                  <ImageIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-gray-500 mb-2">Nema izabranih slika</p>
                  <p className="text-sm text-gray-400">Kliknite "Dodaj slike" da biste dodali slike u galeriju</p>
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
            <DialogTitle>Izaberi slike za galeriju</DialogTitle>
            <DialogDescription>
              Kliknite na slike da ih dodate ili uklonite iz galerije
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
              {filteredImages.map((image) => (
                <div
                  key={image.id}
                  className={`relative cursor-pointer border-2 rounded-lg overflow-hidden transition-all ${
                    selectedImages.includes(image.filename)
                      ? 'border-blue-500 ring-2 ring-blue-200'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleImageToggle(image.filename)}
                >
                  <img
                    src={mediaApi.getFileUrl(image.filename)}
                    alt={image.alt || image.originalName}
                    className="w-full aspect-square object-cover"
                  />
                  
                  {/* Selection indicator */}
                  {selectedImages.includes(image.filename) && (
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
              ))}
            </div>

            {filteredImages.length === 0 && (
              <div className="text-center py-8">
                <ImageIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-500">
                  {imageSearchTerm ? 'Nema slika koje odgovaraju pretrazi' : 'Nema dostupnih slika'}
                </p>
                {!imageSearchTerm && (
                  <p className="text-sm text-gray-400 mt-2">
                    Prvo učitajte slike u medijsku biblioteku
                  </p>
                )}
              </div>
            )}
          </div>

          <DialogFooter>
            <div className="flex items-center justify-between w-full">
              <p className="text-sm text-muted-foreground">
                Izabrano: {selectedImages.length} slika
              </p>
              <div className="space-x-2">
                <Button variant="outline" onClick={() => setIsImageSelectorOpen(false)}>
                  Otkaži
                </Button>
                <Button onClick={confirmImageSelection} variant={theme === "light" ? "default" : "secondaryDefault"}>
                  Potvrdi izbor
                </Button>
              </div>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}