// components/ui/media-selector-modal.tsx
'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Upload,
  ImageIcon,
  FileText,
  File,
  Check
} from 'lucide-react';
import { mediaApi } from '@/lib/api';
import type { Media } from '@/lib/types';

interface MediaSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (media: Media) => void;
  selectedImageUrl?: string;
  filter?: 'all' | 'images' | 'documents';
}

export function MediaSelectorModal({ 
  isOpen, 
  onClose, 
  onSelect, 
  selectedImageUrl,
  filter = 'images' 
}: MediaSelectorModalProps) {
  const [media, setMedia] = useState<Media[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMedia, setSelectedMedia] = useState<Media | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchMedia();
    }
  }, [isOpen]);

  const fetchMedia = async () => {
    try {
      setIsLoading(true);
      const response = await mediaApi.getAll();
      let filteredMedia = response;
      
      if (filter === 'images') {
        filteredMedia = response.filter(item => item.mimetype?.startsWith('image/'));
      } else if (filter === 'documents') {
        filteredMedia = response.filter(item => !item.mimetype?.startsWith('image/'));
      }
      
      setMedia(filteredMedia);
    } catch (error) {
      console.error('Error fetching media:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredMedia = media.filter(item => 
    item.originalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.alt?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getFileIcon = (mimetype: string) => {
    if (mimetype?.startsWith('image/')) {
      return <ImageIcon className="h-4 w-4" />;
    } else if (mimetype?.includes('pdf')) {
      return <FileText className="h-4 w-4" />;
    } else {
      return <File className="h-4 w-4" />;
    }
  };

  const getFileTypeLabel = (mimetype: string) => {
    if (mimetype?.startsWith('image/')) return 'Slika';
    if (mimetype?.includes('pdf')) return 'PDF';
    return 'Fajl';
  };

  const handleSelect = () => {
    if (selectedMedia) {
      onSelect(selectedMedia);
      onClose();
    }
  };

  const isSelected = (item: Media) => {
    return selectedImageUrl === item.filename || selectedMedia?.id === item.id;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Izaberite medijski fajl</DialogTitle>
          <DialogDescription>
            Kliknite na fajl da ga izaberete kao glavnu sliku objave
          </DialogDescription>
        </DialogHeader>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Pretraži fajlove..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Media Grid */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-square bg-gray-200 rounded-lg mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          ) : filteredMedia.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
              {filteredMedia.map((item) => (
                <div
                  key={item.id}
                  className={`relative border-2 rounded-lg overflow-hidden cursor-pointer transition-all hover:shadow-md ${
                    isSelected(item) 
                      ? 'border-blue-500 ring-2 ring-blue-200' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedMedia(item)}
                >
                  <div className="aspect-square bg-gray-50 flex items-center justify-center relative">
                    {item.mimetype?.startsWith('image/') ? (
                      <img
                        src={mediaApi.getFileUrl(item.filename)}
                        alt={item.alt || item.originalName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex flex-col items-center space-y-2 p-4">
                        <div className="bg-gray-100 p-3 rounded-lg">
                          {getFileIcon(item.mimetype)}
                        </div>
                        <span className="text-xs text-center truncate max-w-full">
                          {item.originalName}
                        </span>
                      </div>
                    )}

                    {/* Selection indicator */}
                    {isSelected(item) && (
                      <div className="absolute top-2 right-2 bg-blue-500 text-white rounded-full p-1">
                        <Check className="h-3 w-3" />
                      </div>
                    )}

                    {/* File type badge */}
                    <Badge
                      variant="secondary"
                      className="absolute top-2 left-2 text-xs"
                    >
                      {getFileTypeLabel(item.mimetype)}
                    </Badge>
                  </div>

                  <div className="p-2">
                    <h4 className="font-medium text-sm truncate" title={item.originalName}>
                      {item.originalName}
                    </h4>
                    {item.alt && (
                      <p className="text-xs text-muted-foreground truncate" title={item.alt}>
                        {item.alt}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <ImageIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium mb-2">Nema fajlova</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm ? 'Nema rezultata za pretragu' : 'Učitajte prvi fajl'}
              </p>
              <Button variant="outline" onClick={onClose}>
                <Upload className="mr-2 h-4 w-4" />
                Zatvori i učitaj fajlove
              </Button>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Otkaži
          </Button>
          <Button 
            onClick={handleSelect} 
            disabled={!selectedMedia}
          >
            Izaberi fajl
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}