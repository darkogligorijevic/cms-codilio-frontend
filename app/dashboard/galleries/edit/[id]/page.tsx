// Fixed Gallery Edit Page - app/dashboard/galleries/edit/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  ArrowLeft,
  Save,
  Eye,
  EyeOff,
  Calendar
} from 'lucide-react';
import { 
  galleryApi
} from '@/lib/api';
import { Gallery, UpdateGalleryDto, GalleryStatus, GalleryType } from '@/lib/types';
import { toast } from 'sonner';
import { useTheme } from 'next-themes';
import { transliterate } from '@/lib/transliterate';

interface FormData extends UpdateGalleryDto {
  // Add any additional fields if needed
}

export default function EditGalleryPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [gallery, setGallery] = useState<Gallery | null>(null);
  const [galleryTypes, setGalleryTypes] = useState<Array<{ value: GalleryType; label: string; description: string }>>([]);
  
  const router = useRouter();
  const params = useParams();
  const { theme } = useTheme();
  const galleryId = parseInt(params.id as string);

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

  const watchedTitle = form.watch('title');

  useEffect(() => {
    if (galleryId && !isNaN(galleryId)) {
      fetchGalleryData();
      fetchGalleryTypes();
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
        eventDate: galleryData.eventDate ? galleryData.eventDate.split('T')[0] : '' // Format date for input
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
      router.push(`/dashboard/galleries/${updatedGallery.id}`);
    } catch (error: any) {
      console.error('Error updating gallery:', error);
      const errorMessage = error.response?.data?.message || 'Грешка при ажурирању галерије';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
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
                <p className="text-2xl font-bold">{gallery.images?.length || 0}</p>
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
  );
}