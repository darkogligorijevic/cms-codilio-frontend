// components/ui/media-picker.tsx - Updated with Drag & Drop
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
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
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  Search, 
  Image as ImageIcon, 
  FileText, 
  File,
  CheckCircle,
  X
} from 'lucide-react';
import { DragDropUpload } from '@/components/ui/drag-drop-upload';
import { mediaApi } from '@/lib/api';
import type { Media } from '@/lib/types';
import { toast } from 'sonner';

interface MediaPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
  title?: string;
  description?: string;
  allowedTypes?: string[];
}

export function MediaPicker({
  isOpen,
  onClose,
  onSelect,
  title = "Izaberite medijski fajl",
  description = "Izaberite postojeći fajl ili učitajte novi",
  allowedTypes = ['image/*']
}: MediaPickerProps) {
  const [media, setMedia] = useState<Media[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<Media | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchMedia();
    }
  }, [isOpen]);

  const fetchMedia = async () => {
    try {
      setIsLoading(true);
      const response = await mediaApi.getAll();
      
      // Filter by allowed types
      const filteredMedia = response.filter(item => 
        allowedTypes.some(type => {
          if (type === 'image/*') return item.mimeType.startsWith('image/');
          if (type === 'video/*') return item.mimeType.startsWith('video/');
          if (type === 'audio/*') return item.mimeType.startsWith('audio/');
          return item.mimeType === type;
        })
      );
      
      setMedia(filteredMedia);
    } catch (error) {
      console.error('Error fetching media:', error);
      toast.error('Greška pri učitavanju medijskih fajlova');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    try {
      setIsUploading(true);
      const newMedia = await mediaApi.upload(file);
      setMedia(prev => [newMedia, ...prev]);
      toast.success('Fajl je uspešno učitan');
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Greška pri učitavanju fajla');
      throw error; // Re-throw to handle in DragDropUpload component
    } finally {
      setIsUploading(false);
    }
  };

  const handleSelect = () => {
    if (selectedFile) {
      onSelect(mediaApi.getFileUrl(selectedFile.filename));
      setSelectedFile(null);
      onClose();
    }
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return <ImageIcon className="h-4 w-4" />;
    if (mimeType.includes('pdf')) return <FileText className="h-4 w-4" />;
    return <File className="h-4 w-4" />;
  };

  const getFileTypeLabel = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return 'Slika';
    if (mimeType.includes('pdf')) return 'PDF';
    if (mimeType.includes('document')) return 'Dokument';
    return 'Fajl';
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const filteredMedia = media.filter(item =>
    item.originalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.alt?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="flex-1 flex flex-col space-y-4 overflow-hidden">
          {/* Drag & Drop Upload Section */}
          <DragDropUpload
            onFileUpload={handleFileUpload}
            accept={allowedTypes.join(',')}
            maxSize={10}
            multiple={false}
            disabled={isUploading}
            className="border-dashed border-2 border-gray-300 rounded-lg p-4"
          />

          {/* Search */}
          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Pretraži postojeće fajlove..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            {searchTerm && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSearchTerm('')}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Media Grid */}
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="aspect-square bg-gray-200 rounded-lg mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-1"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : filteredMedia.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
                {filteredMedia.map((item) => (
                  <Card 
                    key={item.id} 
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      selectedFile?.id === item.id ? 'ring-2 ring-blue-500 border-blue-500' : ''
                    }`}
                    onClick={() => setSelectedFile(item)}
                  >
                    <div className="aspect-square bg-gray-50 flex items-center justify-center relative overflow-hidden rounded-t-lg">
                      {item.mimeType.startsWith('image/') ? (
                        <img
                          src={mediaApi.getFileUrl(item.filename)}
                          alt={item.alt || item.originalName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex flex-col items-center space-y-2">
                          <div className="bg-gray-100 p-3 rounded-lg">
                            {getFileIcon(item.mimeType)}
                          </div>
                          <span className="text-xs text-center px-2 line-clamp-2">
                            {item.originalName}
                          </span>
                        </div>
                      )}
                      
                      {selectedFile?.id === item.id && (
                        <div className="absolute inset-0 bg-blue-500 bg-opacity-20 flex items-center justify-center">
                          <CheckCircle className="h-8 w-8 text-blue-600 bg-white rounded-full" />
                        </div>
                      )}

                      <Badge
                        variant="secondary"
                        className="absolute top-2 left-2 text-xs"
                      >
                        {getFileTypeLabel(item.mimeType)}
                      </Badge>
                    </div>

                    <CardContent className="p-3">
                      <div className="space-y-1">
                        <h4 className="font-medium text-sm truncate" title={item.originalName}>
                          {item.originalName}
                        </h4>
                        
                        {item.alt && (
                          <p className="text-xs text-muted-foreground truncate" title={item.alt}>
                            {item.alt}
                          </p>
                        )}

                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{formatFileSize(item.size)}</span>
                          <span>{new Date(item.createdAt).toLocaleDateString('sr-RS')}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <ImageIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchTerm ? 'Nema rezultata' : 'Nema fajlova'}
                </h3>
                <p className="text-gray-500 mb-4">
                  {searchTerm 
                    ? `Nema fajlova koji odgovaraju pretrazi "${searchTerm}"`
                    : 'Učitajte prvi fajl koristeći drag & drop ili dugme za učitavanje'
                  }
                </p>
                {searchTerm && (
                  <Button
                    variant="outline"
                    onClick={() => setSearchTerm('')}
                  >
                    Očisti pretragu
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Otkaži
          </Button>
          <Button 
            onClick={handleSelect} 
            disabled={!selectedFile}
          >
            Izaberi fajl
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}