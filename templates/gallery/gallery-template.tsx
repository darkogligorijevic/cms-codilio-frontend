// templates/gallery/gallery-template.tsx - Complete updated template
'use client';

import { useState, useEffect } from 'react';
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
  Search,
  Filter,
  Image as ImageIcon,
  Eye,
  Calendar,
  Grid3X3,
  X,
  ChevronRight,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';
import { galleryApi } from '@/lib/api';
import { Gallery, GalleryStatus, GalleryType } from '@/lib/types';
import { TemplateProps } from '../template-registry';
import { toast } from 'sonner';

export function GalleryTemplate({ page, institutionData, settings }: TemplateProps) {
  const [galleries, setGalleries] = useState<Gallery[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<GalleryType | 'all'>('all');
  const [galleryTypes, setGalleryTypes] = useState<Array<{ value: GalleryType; label: string; description: string }>>([]);

  useEffect(() => {
    fetchGalleries();
    fetchGalleryTypes();
  }, [searchTerm, typeFilter]);

  const fetchGalleries = async () => {
    try {
      setIsLoading(true);
      const response = await galleryApi.getPublished({
        type: typeFilter !== 'all' ? typeFilter : undefined,
        search: searchTerm || undefined,
        limit: 50
      });
      setGalleries(response.galleries);
    } catch (error) {
      console.error('Error fetching galleries:', error);
      toast.error('Greška pri učitavanju galerija');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchGalleryTypes = async () => {
    try {
      const types = await galleryApi.getTypes();
      setGalleryTypes(types);
    } catch (error) {
      console.error('Error fetching gallery types:', error);
    }
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
      month: 'long',
      day: 'numeric'
    });
  };

  const clearFilters = () => {
    setSearchTerm('');
    setTypeFilter('all');
  };

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <h1 
          className="text-4xl font-bold text-gray-900 dark:text-white"
          style={{ fontFamily: settings?.themeFontFamily || 'Inter' }}
        >
          {page.title}
        </h1>
        {page.content && (
          <div 
            className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto prose prose-lg dark:prose-invert"
            style={{ fontFamily: settings?.themeFontFamily || 'Inter' }}
            dangerouslySetInnerHTML={{ __html: page.content }}
          />
        )}
        <div className="flex items-center justify-center space-x-8 text-sm text-gray-500">
          <div className="flex items-center space-x-2">
            <Grid3X3 className="h-5 w-5" />
            <span>{galleries.length} галерија</span>
          </div>
          <div className="flex items-center space-x-2">
            <ImageIcon className="h-5 w-5" />
            <span>Високи квалитет слика</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Претрага галерија</CardTitle>
          <CardDescription>
            Пронађите галерије према вашим потребама
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <label htmlFor="search">Претрага</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Претражи галерије..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label>Тип галерије</label>
              <Select value={typeFilter} onValueChange={(value) => setTypeFilter(value as GalleryType | 'all')}>
                <SelectTrigger>
                  <SelectValue placeholder="Сви типови" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Сви типови</SelectItem>
                  {galleryTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              {(searchTerm || typeFilter !== 'all') && (
                <Button variant="outline" onClick={clearFilters} className="w-full">
                  <X className="mr-2 h-4 w-4" />
                  Очисти филтере
                </Button>
              )}
            </div>
          </div>
          
          <div className="mt-4 text-sm text-muted-foreground">
            Приказује се {galleries.length} галерија
          </div>
        </CardContent>
      </Card>

      {/* Galleries Grid */}
      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <div className="aspect-video bg-gray-200 dark:bg-gray-700 rounded-t-lg"></div>
              <CardContent className="p-4">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : galleries.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {galleries.map((gallery) => (
            <Card key={gallery.id} className="overflow-hidden hover:shadow-lg transition-shadow group">
              <div className="aspect-video bg-gray-100 dark:bg-gray-800 relative overflow-hidden">
                {gallery.coverImage ? (
                  <img
                    src={galleryApi.getImageUrl(gallery.coverImage)}
                    alt={gallery.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : gallery.images && gallery.images.length > 0 ? (
                  <img
                    src={galleryApi.getImageUrl(gallery.images[0].filename)}
                    alt={gallery.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="h-16 w-16 text-gray-400" />
                  </div>
                )}
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                  <Button 
                    className="opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    asChild
                  >
                    <Link href={`/${page.slug}/${gallery.slug}`}>
                      <Eye className="mr-2 h-4 w-4" />
                      Погледај галерију
                    </Link>
                  </Button>
                </div>

                {/* Type Badge */}
                <div className="absolute top-3 left-3">
                  {getTypeBadge(gallery.type)}
                </div>

                {/* Images Count */}
                <div className="absolute top-3 right-3">
                  <Badge variant="secondary" className="bg-black bg-opacity-50 text-white border-none">
                    <ImageIcon className="h-3 w-3 mr-1" />
                    {gallery.images?.length || 0}
                  </Badge>
                </div>
              </div>

              <CardContent className="p-6">
                <div className="space-y-3">
                  <div>
                    <h3 
                      className="font-semibold text-lg line-clamp-2 group-hover:text-primary-dynamic transition-colors"
                      style={{ fontFamily: settings?.themeFontFamily || 'Inter' }}
                    >
                      <Link href={`/${page.slug}/${gallery.slug}`}>
                        {gallery.title}
                      </Link>
                    </h3>
                    
                    {gallery.description && (
                      <p 
                        className="text-sm text-muted-foreground line-clamp-2 mt-2"
                        style={{ fontFamily: settings?.themeFontFamily || 'Inter' }}
                      >
                        {gallery.description}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-3 w-3" />
                      <span>
                        {gallery.eventDate 
                          ? formatDate(gallery.eventDate)
                          : formatDate(gallery.createdAt)
                        }
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      <Eye className="h-3 w-3" />
                      <span>{gallery.viewCount} прегледа</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t">
                    <Button 
                      variant="ghost" 
                      className="w-full justify-between p-0 h-auto text-primary-dynamic hover:text-primary-dynamic/80"
                      asChild
                    >
                      <Link href={`/${page.slug}/${gallery.slug}`}>
                        <span>Погледај све слике</span>
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <ImageIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {searchTerm || typeFilter !== 'all' 
                ? 'Нема резултата' 
                : 'Нема галерија'
              }
            </h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || typeFilter !== 'all'
                ? 'Нема галерија које одговарају филтерима'
                : 'Тренутно нема доступних галерија'
              }
            </p>
            {(searchTerm || typeFilter !== 'all') && (
              <Button variant="outline" onClick={clearFilters}>
                <Filter className="mr-2 h-4 w-4" />
                Очисти филтере
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Back to Main */}
      <div className="text-center">
        <Button variant="outline" asChild>
          <Link href="/">
            <ChevronRight className="mr-2 h-4 w-4 rotate-180" />
            Назад на почетну
          </Link>
        </Button>
      </div>
    </div>
  );
}