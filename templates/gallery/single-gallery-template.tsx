// templates/gallery/single-gallery-template.tsx - Single Gallery Template
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  ArrowLeft,
  ArrowRight,
  Calendar,
  Eye,
  User,
  Download,
  Share2,
  Grid3X3,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  X,
  ImageIcon
} from 'lucide-react';
import Link from 'next/link';
import { Gallery, GalleryImage, GalleryType } from '@/lib/types';
import { galleryApi } from '@/lib/api';
import { toast } from 'sonner';

interface SingleGalleryTemplateProps {
  gallery: Gallery;
  institutionData: any;
  settings?: any;
  parentPageSlug?: string; // Add this to know which gallery page to go back to
}

export function SingleGalleryTemplate({ gallery, institutionData, settings, parentPageSlug }: SingleGalleryTemplateProps) {
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [viewMode, setViewMode] = useState<'grid' | 'masonry'>('grid');

  const visibleImages = gallery.images?.filter(img => img.isVisible) || [];

  const getTypeBadge = (type: GalleryType) => {
    const typeLabels = {
      'general': 'Општа галерија',
      'event': 'Догађај',
      'project': 'Пројекат',
      'archive': 'Архива'
    };
    
    return (
      <Badge variant="outline" className="text-xs">
        {typeLabels[type] || type}
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

  const openLightbox = (image: GalleryImage, index: number) => {
    setSelectedImage(image);
    setCurrentImageIndex(index);
    setIsLightboxOpen(true);
  };

  const closeLightbox = () => {
    setIsLightboxOpen(false);
    setSelectedImage(null);
  };

  const navigateImage = (direction: 'prev' | 'next') => {
    const newIndex = direction === 'prev' 
      ? (currentImageIndex - 1 + visibleImages.length) % visibleImages.length
      : (currentImageIndex + 1) % visibleImages.length;
    
    setCurrentImageIndex(newIndex);
    setSelectedImage(visibleImages[newIndex]);
  };

  const handleDownload = async (image: GalleryImage) => {
    try {
      const imageUrl = galleryApi.getImageUrl(image.filename);
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = image.originalName || image.filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success('Слика је преузета');
    } catch (error) {
      toast.error('Грешка при преузимању слике');
    }
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: gallery.title,
          text: gallery.description || '',
          url: window.location.href,
        });
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(window.location.href);
        toast.success('Линк је копиран у клипборд');
      }
    } catch (error) {
      toast.error('Грешка при дељењу');
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isLightboxOpen) {
        switch (e.key) {
          case 'ArrowLeft':
            navigateImage('prev');
            break;
          case 'ArrowRight':
            navigateImage('next');
            break;
          case 'Escape':
            closeLightbox();
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLightboxOpen, currentImageIndex]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center space-x-4 mb-6">
            <Button variant="outline" asChild>
              <Link href={parentPageSlug ? `/${parentPageSlug}` : "/galerija"}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Назад на галерије
              </Link>
            </Button>
            <div className="flex items-center space-x-2">
              {getTypeBadge(gallery.type)}
              <Badge variant="secondary">
                <ImageIcon className="h-3 w-3 mr-1" />
                {visibleImages.length} слика
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <h1 
                className="text-4xl font-bold text-gray-900 dark:text-white mb-4"
                style={{ fontFamily: settings?.themeFontFamily || 'Inter' }}
              >
                {gallery.title}
              </h1>
              
              {gallery.description && (
                <p 
                  className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed"
                  style={{ fontFamily: settings?.themeFontFamily || 'Inter' }}
                >
                  {gallery.description}
                </p>
              )}
            </div>

            <div className="space-y-4">
              <Card>
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Објављено:</span>
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {gallery.eventDate 
                          ? formatDate(gallery.eventDate)
                          : formatDate(gallery.createdAt)
                        }
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Аутор:</span>
                    <div className="flex items-center space-x-1">
                      <User className="h-4 w-4" />
                      <span>{gallery.author.name}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Прегледа:</span>
                    <div className="flex items-center space-x-1">
                      <Eye className="h-4 w-4" />
                      <span>{gallery.viewCount}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleShare}
                  className="flex-1"
                >
                  <Share2 className="mr-2 h-4 w-4" />
                  Подели
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setViewMode(viewMode === 'grid' ? 'masonry' : 'grid')}
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Gallery */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {visibleImages.length > 0 ? (
          <div className={`${
            viewMode === 'grid' 
              ? 'grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
              : 'columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4'
          }`}>
            {visibleImages.map((image, index) => (
              <div
                key={image.id}
                className={`${
                  viewMode === 'grid' ? 'aspect-square' : 'break-inside-avoid mb-4'
                } relative group cursor-pointer overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800`}
                onClick={() => openLightbox(image, index)}
              >
                <img
                  src={galleryApi.getImageUrl(image.filename)}
                  alt={image.alt || image.title || image.originalName}
                  className={`${
                    viewMode === 'grid' 
                      ? 'w-full h-full object-cover' 
                      : 'w-full h-auto'
                  } group-hover:scale-105 transition-transform duration-300`}
                  loading="lazy"
                />
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 flex items-center justify-center">
                  <Button 
                    variant="secondary" 
                    size="sm"
                    className="opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  >
                    <Maximize2 className="h-4 w-4" />
                  </Button>
                </div>

                {/* Title overlay */}
                {image.title && (
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
                    <p className="text-white text-sm font-medium line-clamp-2">
                      {image.title}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <ImageIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Нема слика у галерији
              </h3>
              <p className="text-muted-foreground">
                Ова галерија тренутно не садржи видљиве слике
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Lightbox */}
      <Dialog open={isLightboxOpen} onOpenChange={setIsLightboxOpen}>
        <DialogContent className="max-w-6xl w-full h-[90vh] p-0 bg-black border-none">
          <DialogHeader className="absolute top-4 left-4 z-10">
            <DialogTitle className="text-white">
              {selectedImage?.title || selectedImage?.originalName}
            </DialogTitle>
          </DialogHeader>

          {/* Close button */}
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-4 right-4 z-10 text-white hover:bg-white/20"
            onClick={closeLightbox}
          >
            <X className="h-4 w-4" />
          </Button>

          {/* Navigation buttons */}
          {visibleImages.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="sm"
                className="absolute left-4 top-1/2 -translate-y-1/2 z-10 text-white hover:bg-white/20"
                onClick={() => navigateImage('prev')}
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-4 top-1/2 -translate-y-1/2 z-10 text-white hover:bg-white/20"
                onClick={() => navigateImage('next')}
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            </>
          )}

          {/* Image */}
          <div className="w-full h-full flex items-center justify-center p-4">
            {selectedImage && (
              <img
                src={galleryApi.getImageUrl(selectedImage.filename)}
                alt={selectedImage.alt || selectedImage.title || selectedImage.originalName}
                className="max-w-full max-h-full object-contain"
              />
            )}
          </div>

          {/* Bottom info */}
          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white">
            <div>
              {selectedImage?.description && (
                <p className="text-sm text-gray-300 mb-1">
                  {selectedImage.description}
                </p>
              )}
              <p className="text-xs text-gray-400">
                {currentImageIndex + 1} од {visibleImages.length}
              </p>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20"
              onClick={() => selectedImage && handleDownload(selectedImage)}
            >
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}