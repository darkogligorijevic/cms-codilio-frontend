// app/dashboard/media/page.tsx - Ažurirana verzija sa kategorijama
'use client';

import { useEffect, useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Upload, 
  Image as ImageIcon, 
  FileText, 
  File, 
  Search, 
  Filter,
  Download,
  Edit,
  Trash2,
  Copy,
  ExternalLink,
  AlertCircle,
  CheckCircle,
  X,
  Calendar,
  HardDrive,
  Check,
  Eye,
  EyeOff,
  Building,
  DollarSign,
  FileCheck,
  Clipboard,
  BarChart3,
  Folder
} from 'lucide-react';
import { DragDropUpload } from '@/components/ui/drag-drop-upload';
import { mediaApi } from '@/lib/api';
import { MediaCategory, type Media, type CreateMediaDto, type FindMediaOptions, type MediaCategoryInfo } from '@/lib/types';
import { toast } from 'sonner';
import { useTheme } from 'next-themes';

interface MediaFormData {
  alt: string;
  caption: string;
  category: MediaCategory;
  description: string;
  isPublic: boolean;
}

export default function MediaPage() {
  const [media, setMedia] = useState<Media[]>([]);
  const [categories, setCategories] = useState<MediaCategoryInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<MediaCategory | 'all'>('all');
  const [publicFilter, setPublicFilter] = useState<'all' | 'public' | 'private'>('all');
  const [selectedMedia, setSelectedMedia] = useState<Media | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  // Selection mode states
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const {theme} = useTheme();

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<MediaFormData>({
    defaultValues: {
      alt: '',
      caption: '',
      category: MediaCategory.OTHER,
      description: '',
      isPublic: false
    }
  });

  const watchedCategory = watch('category');
  const watchedIsPublic = watch('isPublic');

  useEffect(() => {
    fetchMediaAndCategories();
    
    // Check if page opened in selection mode
    const urlParams = new URLSearchParams(window.location.search);
    const selectMode = urlParams.get('select');
    if (selectMode === 'true') {
      setSelectionMode(true);
    }
  }, []);

  const fetchMediaAndCategories = async () => {
    try {
      setIsLoading(true);
      
      const [mediaResponse, categoriesResponse] = await Promise.all([
        mediaApi.getAll(),
        mediaApi.getCategories()
      ]);
      
      setMedia(mediaResponse);
      setCategories(categoriesResponse);
    } catch (error) {
      console.error('Error fetching media:', error);
      toast.error('Грешка при учитавању медијских фајлова');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFilteredMedia = async () => {
    try {
      setIsLoading(true);
      
      const options: FindMediaOptions = {};
      
      if (categoryFilter !== 'all') {
        options.category = categoryFilter as MediaCategory;
      }
      
      if (publicFilter === 'public') {
        options.isPublic = true;
      } else if (publicFilter === 'private') {
        options.isPublic = false;
      }
      
      if (searchTerm) {
        options.search = searchTerm;
      }
      
      const response = await mediaApi.getAll(options);
      setMedia(response);
    } catch (error) {
      console.error('Error fetching filtered media:', error);
      toast.error('Грешка при филтрирању медијских фајлова');
    } finally {
      setIsLoading(false);
    }
  };

  // Trigger filtering when filters change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchFilteredMedia();
    }, 300); // Debounce search

    return () => clearTimeout(timeoutId);
  }, [searchTerm, categoryFilter, publicFilter]);


  const handleFileUpload = async (file: File, metadata?: CreateMediaDto) => {
    try {
      setIsUploading(true);
      
      // Use the provided metadata, or fallback to default for images
      const uploadData: CreateMediaDto = metadata || {
        category: MediaCategory.OTHER,
        isPublic: false
      };
      
      console.log('Uploading file with metadata:', uploadData);
      
      const response = await mediaApi.upload(file, uploadData);
      console.log('Upload response:', response);

      toast.success(`Фајл "${file.name}" је успешно учитан`);
      await fetchFilteredMedia();

    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error(`Грешка при учитавању фајла "${file.name}"`);
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  const onSubmit = async (data: MediaFormData) => {
    if (!selectedMedia) return;

    try {
      await mediaApi.updateMetadata(selectedMedia.id, data);
      
      toast.success('Медијски фајл је успешно ажуриран');
      await fetchFilteredMedia();
      setIsEditDialogOpen(false);
      setSelectedMedia(null);
      reset();
    } catch (error) {
      console.error('Error updating media:', error);
      toast.error('Грешка при ажурирању медијског фајла');
    }
  };

  const handleEditMedia = (mediaItem: Media) => {
    setSelectedMedia(mediaItem);
    setValue('alt', mediaItem.alt || '');
    setValue('caption', mediaItem.caption || '');
    setValue('category', mediaItem.category || MediaCategory.OTHER);
    setValue('description', mediaItem.description || '');
    setValue('isPublic', mediaItem.isPublic || false);
    setIsEditDialogOpen(true);
  };

  const handleDeleteMedia = async () => {
    if (!selectedMedia) return;

    try {
      await mediaApi.delete(selectedMedia.id);
      toast.success('Медијски фајл је успешно обрисан');
      await fetchFilteredMedia();
      setIsDeleteDialogOpen(false);
      setSelectedMedia(null);
    } catch (error) {
      console.error('Error deleting media:', error);
      toast.error('Грешка при брисању медијског фајла');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('УРЛ је копиран у клипборд');
  };

  const toggleSelection = (filename: any) => {
    setSelectedItems(prev => {
      if (prev.includes(filename)) {
        return prev.filter(item => item !== filename);
      } else {
        return [...prev, filename];
      }
    });
  };

  const confirmSelection = () => {
    if (selectedItems.length > 0) {
      if (window.opener) {
        window.opener.postMessage({
          type: 'MEDIA_SELECTED',
          data: selectedItems
        }, '*');
        window.close();
      } else {
        localStorage.setItem('selectedMedia', JSON.stringify(selectedItems));
        window.close();
      }
    }
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType?.startsWith('image/')) {
      return <ImageIcon className="h-6 w-6 dark:invert-100" />;
    } else if (mimeType?.includes('pdf')) {
      return <FileText className="h-6 w-6 dark:invert-100" />;
    } else {
      return <File className="h-6 w-6 dark:invert-100" />;
    }
  };

  const getFileTypeLabel = (mimeType: string) => {
    if (mimeType?.startsWith('image/')) return 'Слика';
    if (mimeType?.includes('pdf')) return 'ПДФ';
    if (mimeType?.includes('document')) return 'Документ';
    if (mimeType?.includes('spreadsheet')) return 'Табела';
    return 'Фајл';
  };

  const getCategoryLabel = (category: MediaCategory) => {
    const categoryInfo = categories.find(cat => cat.value === category);
    return categoryInfo?.label || 'Остало';
  };

  const getCategoryIcon = (category: MediaCategory) => {
    switch (category) {
      case MediaCategory.PROCUREMENT:
        return <Building className="h-6 w-6" />;
      case MediaCategory.FINANCIAL:
        return <DollarSign className="h-6 w-6" />;
      case MediaCategory.DECISIONS:
        return <FileCheck className="h-6 w-6" />;
      case MediaCategory.PLANS:
        return <Clipboard className="h-6 w-6" />;
      case MediaCategory.REPORTS:
        return <BarChart3 className="h-6 w-6" />;
      default:
        return <Folder className="h-6 w-6" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Б';
    const k = 1024;
    const sizes = ['Б', 'КБ', 'МБ', 'ГБ'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('sr-RS', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const clearFilters = () => {
    setSearchTerm('');
    setCategoryFilter('all');
    setPublicFilter('all');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Медијски фајлови</h1>
          <p className="text-muted-foreground">
            Управљајте документима, сликама и осталим фајловима по категоријама
          </p>
        </div>
      </div>

      {/* Selection Mode Toolbar */}
      {selectionMode && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <p className="text-sm font-medium text-blue-800">
                  Режим селекције - Изабрано: {selectedItems.length}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedItems([])}
                  disabled={selectedItems.length === 0}
                >
                  Поништи селекцију
                </Button>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectionMode(false);
                    setSelectedItems([]);
                  }}
                >
                  Откажи
                </Button>
                <Button
                  size="sm"
                  onClick={confirmSelection}
                  disabled={selectedItems.length === 0}
                >
                  Потврди селекцију ({selectedItems.length})
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Drag & Drop Upload Area */}
      {!selectionMode && (
        <DragDropUpload
          onFileUpload={handleFileUpload}
          accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
          maxSize={10}
          multiple={true}
          disabled={isUploading}
        />
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Претрага и филтери</CardTitle>
          <CardDescription>
            Пронађите фајлове помоћу претраге и филтера по категоријама
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="search">Претрага</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Претражи фајлове..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Категорија</Label>
              <Select value={categoryFilter} onValueChange={(value) => setCategoryFilter(value as MediaCategory | 'all')}>
                <SelectTrigger>
                  <SelectValue placeholder="Све категорије" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Све категорије</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      <div className="flex items-center space-x-2">
                        {getCategoryIcon(category.value)}
                        <span>{category.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Доступност</Label>
              <Select value={publicFilter} onValueChange={(value) => setPublicFilter(value as any)}>
                <SelectTrigger>
                  <SelectValue placeholder="Све" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Све</SelectItem>
                  <SelectItem value="public">
                    <div className="flex items-center space-x-2">
                      <Eye className="h-4 w-4" />
                      <span>Јавно доступно</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="private">
                    <div className="flex items-center space-x-2">
                      <EyeOff className="h-4 w-4" />
                      <span>Интерно</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              {(searchTerm || categoryFilter !== 'all' || publicFilter !== 'all') && (
                <Button variant="outline" onClick={clearFilters} className="w-full">
                  <X className="mr-2 h-4 w-4" />
                  Очисти филтере
                </Button>
              )}
            </div>
          </div>
          
          <div className="mt-4 text-sm text-muted-foreground">
            Приказује се {media.length} фајлова
          </div>
        </CardContent>
      </Card>

      {/* Media Grid */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Листа фајлова</CardTitle>
              <CardDescription>
                Укупно {media.length} фајлова
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-square bg-gray-200 rounded-lg mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : (
            <>
              {media.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {media.map((item) => (
                    <Card 
                      key={item.id} 
                      className={`overflow-hidden transition-all ${
                        selectionMode 
                          ? `cursor-pointer ${
                              selectedItems.includes(item.filename)
                                ? 'ring-2 ring-blue-500 border-blue-500'
                                : 'hover:ring-2 hover:ring-blue-200'
                            }`
                          : ''
                      }`}
                      onClick={() => {
                        if (selectionMode) {
                          if (item.mimeType.startsWith('image/')) {
                            toggleSelection(item.filename);
                          } else {
                            toast.error("Можете изабрати само слике!")
                          }
                        }
                      }}
                    >
                      <div className="aspect-square bg-gray-50 dark:bg-gray-900 flex items-center justify-center relative group">
                        {item.mimeType?.startsWith('image/') ? (
                          <img
                            crossOrigin="anonymous"
                            src={mediaApi.getFileUrl(item.filename)}
                            alt={item.alt || item.originalName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="flex flex-col items-center space-y-3 text-center p-4">
                            <div className="bg-gray-100 p-4 rounded-lg">
                              {getFileIcon(item.mimeType)}
                            </div>
                            <div>
                              <div className="font-medium text-sm mb-1">{getFileTypeLabel(item.mimeType)}</div>
                              <div className="text-xs text-muted-foreground truncate max-w-full">
                                {item.originalName}
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {/* Selection indicator */}
                        {selectionMode && selectedItems.includes(item.filename) && (
                          <div className="absolute top-2 right-2 bg-blue-500 text-white rounded-full p-1">
                            <Check className="h-4 w-4" />
                          </div>
                        )}
                        
                        {/* Category badge */}
                        <Badge
                          variant="secondary"
                          className="absolute top-2 left-2 text-xs border-none font-bold text-gray-900 px-2 py-1 bg-primary-dynamic flex items-center space-x-1"
                        >
                          {getCategoryIcon(item.category)}
                          <span>{getCategoryLabel(item.category)}</span>
                        </Badge>

                        {/* Public/Private indicator */}
                        <div className="absolute bottom-2 left-2">
                          {item.isPublic ? (
                            <Badge variant="default" className="text-xs bg-green-600">
                              <Eye className="h-3 w-3 mr-1" />
                              Јавно
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="text-xs">
                              <EyeOff className="h-3 w-3 mr-1" />
                              Интерно
                            </Badge>
                          )}
                        </div>
                        
                        {/* Overlay actions - only show when NOT in selection mode */}
                        {!selectionMode && (
                          <div className="absolute inset-0 backdrop-blur-xl bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                            <Button
                              variant="secondaryDefault"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                window.open(mediaApi.getFileUrl(item.filename), '_blank');
                              }}
                              title="Отвори фајл"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="secondaryDefault"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                copyToClipboard(mediaApi.getFileUrl(item.filename));
                              }}
                              title="Копирај УРЛ"
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="secondaryDefault"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditMedia(item);
                              }}
                              title="Уреди"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="secondaryDefault"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedMedia(item);
                                setIsDeleteDialogOpen(true);
                              }}
                              title="Обриши"
                              className="text-red-600 hover:text-red-800"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
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
                          
                          {item.alt && (
                            <p className="text-xs text-muted-foreground truncate" title={item.alt}>
                              Алт: {item.alt}
                            </p>
                          )}
                          
                          {item.caption && (
                            <p className="text-xs text-muted-foreground truncate" title={item.caption}>
                              {item.caption}
                            </p>
                          )}

                          <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
                            <span>{formatFileSize(item.size)}</span>
                            <span className="flex items-center">
                              <Calendar className="mr-1 h-3 w-3" />
                              {formatDate(item.createdAt)}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-muted-foreground">
                    {searchTerm || categoryFilter !== 'all' || publicFilter !== 'all' ? (
                      <>
                        <Search className="mx-auto h-12 w-12 mb-4" />
                        <h3 className="text-lg font-medium mb-2">Нема резултата</h3>
                        <p>Нема фајлова који одговарају филтерима</p>
                        <Button
                          variant="outline"
                          className="mt-4"
                          onClick={clearFilters}
                        >
                          Очисти филтере
                        </Button>
                      </>
                    ) : (
                      <>
                        <ImageIcon className="mx-auto h-12 w-12 mb-4" />
                        <h3 className="text-lg font-medium mb-2">Нема фајлова</h3>
                        <p className="mb-4">Почните учитавањем првог фајла</p>
                        {!selectionMode && (
                          <div className="mt-4">
                            <p className="text-sm text-gray-500 mb-4">
                              Превуците фајлове овде или користите дугме за учитавање
                            </p>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Media Statistics by Category */}
      {media.length > 0 && !selectionMode && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => {
            const categoryMedia = media.filter(item => item.category === category.value);
            const totalSize = categoryMedia.reduce((sum, item) => sum + item.size, 0);
            
            return (
              <Card key={category.value}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium flex items-center space-x-2">
                    {getCategoryIcon(category.value)}
                    <span>{category.label}</span>
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCategoryFilter(category.value)}
                    title={`Прикажи само ${category.label}`}
                  >
                    <Filter className="h-4 w-4" />
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{categoryMedia.length}</div>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(totalSize)} • {category.description}
                  </p>
                  
                  {categoryMedia.length > 0 && (
                    <div className="mt-2 text-xs text-muted-foreground">
                      Јавно: {categoryMedia.filter(item => item.isPublic).length} • 
                      Интерно: {categoryMedia.filter(item => !item.isPublic).length}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Edit Media Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>Уреди медијски фајл</DialogTitle>
              <DialogDescription>
                Уредите информације о фајлу "{selectedMedia?.originalName}"
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="category">Категорија *</Label>
                <Select value={watchedCategory} onValueChange={(value) => setValue('category', value as MediaCategory)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Изаберите категорију" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        <div className="flex items-center space-x-2">
                          {getCategoryIcon(category.value)}
                          <div>
                            <div className="font-medium">{category.label}</div>
                            <div className="text-xs text-muted-foreground">{category.description}</div>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Опис документа</Label>
                <Textarea
                  id="description"
                  placeholder="Детаљан опис документа..."
                  rows={3}
                  {...register('description')}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isPublic"
                  checked={watchedIsPublic}
                  onCheckedChange={(checked) => setValue('isPublic', !!checked)}
                />
                <Label htmlFor="isPublic" className="flex items-center space-x-2">
                  {watchedIsPublic ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  <span>Јавно доступан документ</span>
                </Label>
              </div>

              {selectedMedia?.mimeType?.startsWith('image/') && (
                <div className="space-y-2">
                  <Label htmlFor="alt">Алт текст (за слике)</Label>
                  <Input
                    id="alt"
                    placeholder="Описни текст слике..."
                    {...register('alt')}
                  />
                  <p className="text-xs text-muted-foreground">
                    Користи се за приступачност и СЕО
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="caption">Наслов/Потпис</Label>
                <Input
                  id="caption"
                  placeholder="Кратки наслов или потпис..."
                  {...register('caption')}
                />
              </div>

              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex justify-between">
                  <span>Име фајла:</span>
                  <span className="font-mono">{selectedMedia?.filename}</span>
                </div>
                <div className="flex justify-between">
                  <span>Оригинално име:</span>
                  <span>{selectedMedia?.originalName}</span>
                </div>
                <div className="flex justify-between">
                  <span>Тип:</span>
                  <span>{selectedMedia?.mimeType}</span>
                </div>
                <div className="flex justify-between">
                  <span>Величина:</span>
                  <span>{selectedMedia ? formatFileSize(selectedMedia.size) : ''}</span>
                </div>
                <div className="flex justify-between">
                  <span>Датум:</span>
                  <span>{selectedMedia ? formatDate(selectedMedia.createdAt) : ''}</span>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsEditDialogOpen(false);
                  setSelectedMedia(null);
                  reset();
                }}
              >
                Откажи
              </Button>
              <Button 
                type="submit" 
                variant={theme === "light" ? "default" : "secondaryDefault"}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Чува се...' : 'Сачувај измене'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className='max-w-4xl'>
          <DialogHeader>
            <DialogTitle>Потврди брисање</DialogTitle>
            <DialogDescription>
              Да ли сте сигурни да желите да обришете фајл "{selectedMedia?.originalName}"?
              Ова акција се не може поништити и фајл ће бити уклоњен са сервера.
            </DialogDescription>
          </DialogHeader>
          
          {selectedMedia?.mimeType?.startsWith('image/') && (
            <div className="py-4">
              <img
                crossOrigin='anonymous'
                src={mediaApi.getFileUrl(selectedMedia.filename)}
                alt={selectedMedia.alt || selectedMedia.originalName}
                className="w-full h-32 object-cover rounded border"
              />
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setSelectedMedia(null);
              }}
            >
              Откажи
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteMedia}
            >
              Обриши фајл
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}