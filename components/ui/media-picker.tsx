// components/ui/media-picker.tsx - Ажурирана верзија са категоријама
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  Search, 
  Image as ImageIcon, 
  FileText, 
  File,
  CheckCircle,
  X,
  Eye,
  EyeOff,
  Building,
  DollarSign,
  FileCheck,
  Clipboard,
  BarChart3,
  Folder,
  Filter
} from 'lucide-react';
import { DragDropUpload } from '@/components/ui/drag-drop-upload';
import { mediaApi } from '@/lib/api';
import { MediaCategory, type Media, type FindMediaOptions } from '@/lib/types';
import { toast } from 'sonner';

interface MediaPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
  title?: string;
  description?: string;
  allowedTypes?: string[];
  allowedCategories?: MediaCategory[];
  showPublicOnly?: boolean;
}

const categories = [
  { value: MediaCategory.PROCUREMENT, label: 'Јавне набавке', icon: Building },
  { value: MediaCategory.FINANCIAL, label: 'Финансијски извештаји', icon: DollarSign },
  { value: MediaCategory.DECISIONS, label: 'Одлуке', icon: FileCheck },
  { value: MediaCategory.PLANS, label: 'Планови', icon: Clipboard },
  { value: MediaCategory.REPORTS, label: 'Извештаји', icon: BarChart3 },
  { value: MediaCategory.OTHER, label: 'Остало', icon: Folder }
];

export function MediaPicker({
  isOpen,
  onClose,
  onSelect,
  title = "Изаберите медијски фајл",
  description = "Изаберите постојећи фајл или учитајте нови",
  allowedTypes = ['image/*'],
  allowedCategories,
  showPublicOnly = false
}: MediaPickerProps) {
  const [media, setMedia] = useState<Media[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<MediaCategory | 'all'>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<Media | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchMedia();
    }
  }, [isOpen, searchTerm, categoryFilter]);

  const fetchMedia = async () => {
    try {
      setIsLoading(true);
      
      const options: FindMediaOptions = {};
      
      if (categoryFilter !== 'all') {
        options.category = categoryFilter as MediaCategory;
      }
      
      if (showPublicOnly) {
        options.isPublic = true;
      }
      
      if (searchTerm) {
        options.search = searchTerm;
      }
      
      const response = await mediaApi.getAll(options);
      
      // Filter by allowed types
      let filteredMedia = response.filter(item => 
        allowedTypes.some(type => {
          if (type === 'image/*') return item.mimeType.startsWith('image/');
          if (type === 'video/*') return item.mimeType.startsWith('video/');
          if (type === 'audio/*') return item.mimeType.startsWith('audio/');
          if (type.startsWith('.')) return item.originalName.toLowerCase().endsWith(type.toLowerCase());
          return item.mimeType === type;
        })
      );

      // Filter by allowed categories if specified
      if (allowedCategories && allowedCategories.length > 0) {
        filteredMedia = filteredMedia.filter(item => 
          allowedCategories.includes(item.category)
        );
      }
      
      setMedia(filteredMedia);
    } catch (error) {
      console.error('Error fetching media:', error);
      toast.error('Грешка при учитавању медијских фајлова');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (file: File, metadata?: any) => {
    try {
      setIsUploading(true);
      const newMedia = await mediaApi.upload(file, metadata);
      
      // Check if uploaded file matches our filters
      const matchesType = allowedTypes.some(type => {
        if (type === 'image/*') return newMedia.mimeType.startsWith('image/');
        if (type === 'video/*') return newMedia.mimeType.startsWith('video/');
        if (type === 'audio/*') return newMedia.mimeType.startsWith('audio/');
        if (type.startsWith('.')) return newMedia.originalName.toLowerCase().endsWith(type.toLowerCase());
        return newMedia.mimeType === type;
      });

      const matchesCategory = !allowedCategories || allowedCategories.includes(newMedia.category);
      const matchesPublic = !showPublicOnly || newMedia.isPublic;

      if (matchesType && matchesCategory && matchesPublic) {
        setMedia(prev => [newMedia, ...prev]);
      }
      
      toast.success('Фајл је успешно учитан');
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Грешка при учитавању фајла');
      throw error;
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
    if (mimeType.startsWith('image/')) return 'Слика';
    if (mimeType.includes('pdf')) return 'PDF';
    if (mimeType.includes('document')) return 'Документ';
    return 'Фајл';
  };

  const getCategoryIcon = (category: MediaCategory) => {
    const categoryInfo = categories.find(cat => cat.value === category);
    const IconComponent = categoryInfo?.icon || Folder;
    return <IconComponent className="h-4 w-4" />;
  };

  const getCategoryLabel = (category: MediaCategory) => {
    const categoryInfo = categories.find(cat => cat.value === category);
    return categoryInfo?.label || 'Остало';
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const availableCategories = allowedCategories || categories.map(cat => cat.value);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="flex-1 flex flex-col space-y-4 overflow-hidden">
          {/* Upload Section */}
          <DragDropUpload
            onFileUpload={handleFileUpload}
            accept={allowedTypes.join(',')}
            maxSize={10}
            multiple={false}
            disabled={isUploading}
            className="border-dashed border-2 border-gray-300 rounded-lg p-4"
            showMetadataForm={true}
            defaultCategory={allowedCategories?.[0] || MediaCategory.OTHER}
            defaultIsPublic={showPublicOnly}
          />

          {/* Filters */}
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Претражи постојеће фајлове..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            
            {availableCategories.length > 1 && (
              <Select value={categoryFilter} onValueChange={(value) => setCategoryFilter(value as MediaCategory | 'all')}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Све категорије" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Све категорије</SelectItem>
                  {categories
                    .filter(cat => availableCategories.includes(cat.value))
                    .map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        <div className="flex items-center space-x-2">
                          <category.icon className="h-4 w-4" />
                          <span>{category.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            )}

            {(searchTerm || categoryFilter !== 'all') && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchTerm('');
                  setCategoryFilter('all');
                }}
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
            ) : media.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
                {media.map((item) => (
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

                      {/* Category badge */}
                      <Badge
                        variant="secondary"
                        className="absolute top-2 left-2 text-xs flex items-center space-x-1"
                      >
                        {getCategoryIcon(item.category)}
                        <span>{getCategoryLabel(item.category)}</span>
                      </Badge>

                      {/* Public/Private indicator */}
                      <div className="absolute top-2 right-2">
                        {item.isPublic ? (
                          <Badge variant="default" className="text-xs bg-green-600">
                            <Eye className="h-3 w-3" />
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-xs">
                            <EyeOff className="h-3 w-3" />
                          </Badge>
                        )}
                      </div>
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
                  {searchTerm || categoryFilter !== 'all' ? 'Нема резултата' : 'Нема фајлова'}
                </h3>
                <p className="text-gray-500 mb-4">
                  {searchTerm || categoryFilter !== 'all'
                    ? `Нема фајлова који одговарају филтерима`
                    : 'Учитајте први фајл користећи drag & drop или дугме за учитавање'
                  }
                </p>
                {(searchTerm || categoryFilter !== 'all') && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchTerm('');
                      setCategoryFilter('all');
                    }}
                  >
                    <Filter className="mr-2 h-4 w-4" />
                    Очисти филтере
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Откажи
          </Button>
          <Button 
            onClick={handleSelect} 
            disabled={!selectedFile}
          >
            Изабери фајл
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}