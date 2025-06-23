'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Plus,
  MoreVertical,
  Star,
  Download,
  Calendar,
  Users,
  Grid3X3,
  Upload,
  X,
  Move,
  Settings,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import { 
  galleryApi
} from '@/lib/api';
import { Gallery, GalleryImage, GalleryStatus, CreateGalleryImageDto, UpdateGalleryImageDto } from '@/lib/types';
import { toast } from 'sonner';
import { useTheme } from 'next-themes';

export default function GalleryViewPage() {
  const [gallery, setGallery] = useState<Gallery | null>(null);
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [isEditImageDialogOpen, setIsEditImageDialogOpen] = useState(false);
  const [isDeleteImageDialogOpen, setIsDeleteImageDialogOpen] = useState(false);
  const [imageToDelete, setImageToDelete] = useState<GalleryImage | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [editingImage, setEditingImage] = useState<{
    title: string;
    description: string;
    alt: string;
    isVisible: boolean;
  }>({
    title: '',
    description: '',
    alt: '',
    isVisible: true
  });

  const router = useRouter();
  const params = useParams();
  const { theme } = useTheme();
  const galleryId = parseInt(params.id as string);

  useEffect(() => {
    if (galleryId) {
      fetchGalleryData();
    }
  }, [galleryId]);

  const fetchGalleryData = async () => {
    try {
      setIsLoading(true);
      const [galleryData, imagesData] = await Promise.all([
        galleryApi.getById(galleryId),
        galleryApi.getImages(galleryId)
      ]);
      
      setGallery(galleryData);
      setImages(imagesData);
    } catch (error) {
      console.error('Error fetching gallery data:', error);
      toast.error('Greška pri učitavanju galerije');
      router.push('/dashboard/galleries');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    try {
      setIsUploading(true);
      const fileArray = Array.from(files);
      
      const uploadedImages = await galleryApi.uploadImages(galleryId, fileArray);
      
      toast.success(`Uspešno učitano ${uploadedImages.length} slika`);
      await fetchGalleryData();
    } catch (error) {
      console.error('Error uploading images:', error);
      toast.error('Greška pri učitavanju slika');
    } finally {
      setIsUploading(false);
      // Reset file input
      event.target.value = '';
    }
  };

  const handleEditImage = (image: GalleryImage) => {
    setSelectedImage(image);
    setEditingImage({
      title: image.title || '',
      description: image.description || '',
      alt: image.alt || '',
      isVisible: image.isVisible
    });
    setIsEditImageDialogOpen(true);
  };

  const handleUpdateImage = async () => {
    if (!selectedImage) return;

    try {
      const updateData: UpdateGalleryImageDto = {
        title: editingImage.title || undefined,
        description: editingImage.description || undefined,
        alt: editingImage.alt || undefined,
        isVisible: editingImage.isVisible
      };

      await galleryApi.updateImage(galleryId, selectedImage.id, updateData);
      
      toast.success('Slika je uspešno ažurirana');
      setIsEditImageDialogOpen(false);
      setSelectedImage(null);
      await fetchGalleryData();
    } catch (error) {
      console.error('Error updating image:', error);
      toast.error('Greška pri ažuriranju slike');
    }
  };

  const handleDeleteImage = async () => {
    if (!imageToDelete) return;

    try {
      await galleryApi.deleteImage(galleryId, imageToDelete.id);
      toast.success('Slika je uspešno obrisana');
      setIsDeleteImageDialogOpen(false);
      setImageToDelete(null);
      await fetchGalleryData();
    } catch (error) {
      console.error('Error deleting image:', error);
      toast.error('Greška pri brisanju slike');
    }
  };

  const handleSetCoverImage = async (image: GalleryImage) => {
    try {
      await galleryApi.setCoverImage(galleryId, image.id);
      toast.success('Slika je postavljena kao naslovna');
      await fetchGalleryData();
    } catch (error) {
      console.error('Error setting cover image:', error);
      toast.error('Greška pri postavljanju naslovne slike');
    }
  };

  const handleMoveImage = async (imageId: number, direction: 'up' | 'down') => {
    const currentIndex = images.findIndex(img => img.id === imageId);
    if (currentIndex === -1) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= images.length) return;

    const newImages = Array.from(images);
    const [movedItem] = newImages.splice(currentIndex, 1);
    newImages.splice(newIndex, 0, movedItem);

    // Update local state immediately for better UX
    setImages(newImages);

    try {
      // Create the new order array
      const imageOrders = newImages.map((image, index) => ({
        id: image.id,
        sortOrder: index
      }));

      await galleryApi.reorderImages(galleryId, imageOrders);
      toast.success('Redosled slika je ažuriran');
    } catch (error) {
      console.error('Error reordering images:', error);
      toast.error('Greška pri promenama redosleda');
      // Revert to original order on error
      await fetchGalleryData();
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
        <EyeOff className="h-3 w-3 mr-1" />
        Draft
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
          <div className="grid gap-4 md:grid-cols-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="aspect-square bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!gallery) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold mb-2">Galerija nije pronađena</h1>
        <Button onClick={() => router.push('/dashboard/galleries')}>
          Nazad na galerije
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => router.push('/dashboard/galleries')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-3xl font-bold tracking-tight">{gallery.title}</h1>
              {getStatusBadge(gallery.status)}
            </div>
            <p className="text-muted-foreground">
              {gallery.description || 'Nema opisa'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={() => router.push(`/dashboard/galleries/${gallery.id}/edit`)}>
            <Edit className="mr-2 h-4 w-4" />
            Uredi galeriju
          </Button>
          <input
            type="file"
            id="upload-images"
            multiple
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
          <Button 
            onClick={() => document.getElementById('upload-images')?.click()}
            disabled={isUploading}
            variant={theme === "light" ? "default" : "secondaryDefault"}
          >
            <Upload className="mr-2 h-4 w-4" />
            {isUploading ? 'Učitava se...' : 'Dodaj slike'}
          </Button>
        </div>
      </div>

      {/* Gallery Info */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Ukupno slika
            </CardTitle>
            <ImageIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{images.length}</div>
            <p className="text-xs text-muted-foreground">
              {images.filter(img => img.isVisible).length} vidljivo
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Ukupna veličina
            </CardTitle>
            <Grid3X3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatFileSize(images.reduce((sum, img) => sum + img.size, 0))}
            </div>
            <p className="text-xs text-muted-foreground">
              Sve slike
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Broj pregleda
            </CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{gallery.viewCount}</div>
            <p className="text-xs text-muted-foreground">
              Ukupno pregleda
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Kreirana
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">{formatDate(gallery.createdAt)}</div>
            <p className="text-xs text-muted-foreground">
              {gallery.author.name}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Images Grid */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Slike u galeriji</CardTitle>
              <CardDescription>
                Koristite dugmića za pomeranje redosleda. Kliknite za opcije.
              </CardDescription>
            </div>
            <Badge variant="outline">
              <Move className="h-3 w-3 mr-1" />
              Upravljanje redosledom
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {images.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {images.map((image, index) => (
                <div
                  key={image.id}
                  className="relative group border rounded-lg overflow-hidden transition-all hover:shadow-md"
                >
                  <div className="aspect-square relative">
                    <img
                      src={galleryApi.getImageUrl(image.filename)}
                      alt={image.alt || image.originalName}
                      className="w-full h-full object-cover"
                    />
                    
                    {/* Overlay with image info */}
                    <div className="absolute inset-0 bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="secondary" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEditImage(image)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Uredi
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleSetCoverImage(image)}>
                              <Star className="mr-2 h-4 w-4" />
                              Postavi kao naslovnu
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => window.open(galleryApi.getImageUrl(image.filename), '_blank')}
                            >
                              <Download className="mr-2 h-4 w-4" />
                              Preuzmi
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleMoveImage(image.id, 'up')}
                              disabled={index === 0}
                            >
                              <ChevronUp className="mr-2 h-4 w-4" />
                              Pomeri gore
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleMoveImage(image.id, 'down')}
                              disabled={index === images.length - 1}
                            >
                              <ChevronDown className="mr-2 h-4 w-4" />
                              Pomeri dole
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => {
                                setImageToDelete(image);
                                setIsDeleteImageDialogOpen(true);
                              }}
                              className="text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Obriši
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>

                    {/* Status indicators */}
                    <div className="absolute top-2 left-2 flex space-x-1">
                      {gallery.coverImage === image.filename && (
                        <Badge variant="default" className="text-xs bg-yellow-600">
                          <Star className="h-3 w-3 mr-1" />
                          Naslovna
                        </Badge>
                      )}
                      {!image.isVisible && (
                        <Badge variant="secondary" className="text-xs">
                          <EyeOff className="h-3 w-3 mr-1" />
                          Skriveno
                        </Badge>
                      )}
                    </div>

                    {/* Sort order indicator and move controls */}
                    <div className="absolute top-2 right-2 flex items-center space-x-1">
                      <Badge variant="outline" className="text-xs">
                        #{index + 1}
                      </Badge>
                      
                      {/* Quick move buttons */}
                      <div className="flex flex-col opacity-0 group-hover:opacity-100 transition-opacity bg-white rounded">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-5 w-5 p-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMoveImage(image.id, 'up');
                          }}
                          disabled={index === 0}
                          title="Pomeri gore"
                        >
                          <ChevronUp className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-5 w-5 p-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMoveImage(image.id, 'down');
                          }}
                          disabled={index === images.length - 1}
                          title="Pomeri dole"
                        >
                          <ChevronDown className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Image info */}
                  <div className="p-2 bg-white dark:bg-gray-800">
                    <p className="text-xs font-medium truncate" title={image.title || image.originalName}>
                      {image.title || image.originalName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(image.size)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <ImageIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium mb-2">Nema slika u galeriji</h3>
              <p className="text-muted-foreground mb-4">
                Dodajte slike da biste kreirali galeriju
              </p>
              <Button 
                onClick={() => document.getElementById('upload-images')?.click()}
                disabled={isUploading}
                variant={theme === "light" ? "default" : "secondaryDefault"}
              >
                <Upload className="mr-2 h-4 w-4" />
                Dodaj prve slike
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Image Dialog */}
      <Dialog open={isEditImageDialogOpen} onOpenChange={setIsEditImageDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Uredi sliku</DialogTitle>
            <DialogDescription>
              Ažurirajte informacije o slici
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {selectedImage && (
              <div className="aspect-video w-full max-w-sm mx-auto">
                <img
                  src={galleryApi.getImageUrl(selectedImage.filename)}
                  alt={selectedImage.alt || selectedImage.originalName}
                  className="w-full h-full object-cover rounded border"
                />
              </div>
            )}

            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-title">Naslov slike</Label>
                <Input
                  id="edit-title"
                  value={editingImage.title}
                  onChange={(e) => setEditingImage(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Unesite naslov slike..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-alt">Alt tekst</Label>
                <Input
                  id="edit-alt"
                  value={editingImage.alt}
                  onChange={(e) => setEditingImage(prev => ({ ...prev, alt: e.target.value }))}
                  placeholder="Opisni tekst za pristupačnost..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-description">Opis</Label>
                <Input
                  id="edit-description"
                  value={editingImage.description}
                  onChange={(e) => setEditingImage(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Detaljniji opis slike..."
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="edit-visible"
                  checked={editingImage.isVisible}
                  onChange={(e) => setEditingImage(prev => ({ ...prev, isVisible: e.target.checked }))}
                  className="rounded"
                />
                <Label htmlFor="edit-visible">Slika je vidljiva u galeriji</Label>
              </div>
            </div>

            {selectedImage && (
              <div className="text-sm text-muted-foreground space-y-1">
                <p><strong>Originalno ime:</strong> {selectedImage.originalName}</p>
                <p><strong>Veličina:</strong> {formatFileSize(selectedImage.size)}</p>
                <p><strong>Tip:</strong> {selectedImage.mimeType}</p>
                <p><strong>Učitano:</strong> {formatDate(selectedImage.uploadedAt)}</p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditImageDialogOpen(false)}
            >
              Otkaži
            </Button>
            <Button 
              onClick={handleUpdateImage}
              variant={theme === "light" ? "default" : "secondaryDefault"}
            >
              Ažuriraj sliku
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Image Confirmation Dialog */}
      <Dialog open={isDeleteImageDialogOpen} onOpenChange={setIsDeleteImageDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Potvrdi brisanje slike</DialogTitle>
            <DialogDescription>
              Da li ste sigurni da želite da obrišete sliku "{imageToDelete?.title || imageToDelete?.originalName}"?
              Ova akcija se ne može poništiti.
            </DialogDescription>
          </DialogHeader>

          {imageToDelete && (
            <div className="py-4">
              <img
                src={galleryApi.getImageUrl(imageToDelete.filename)}
                alt={imageToDelete.alt || imageToDelete.originalName}
                className="w-full h-32 object-cover rounded border"
              />
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteImageDialogOpen(false)}
            >
              Otkaži
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteImage}
            >
              Obriši sliku
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}