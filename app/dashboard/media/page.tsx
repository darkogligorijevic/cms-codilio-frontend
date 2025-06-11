// app/dashboard/media/page.tsx
'use client';

import { useEffect, useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
  Check  // Dodato za selection
} from 'lucide-react';
import { mediaApi } from '@/lib/api';
import type { Media, CreateMediaDto } from '@/lib/types';
import { toast } from 'sonner';

interface MediaFormData {
  alt: string;
  caption: string;
}

interface UploadFile {
  file: File;
  id: string;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
}

export default function MediaPage() {
  const [media, setMedia] = useState<Media[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [selectedMedia, setSelectedMedia] = useState<Media | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Selection mode states
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<MediaFormData>({
    defaultValues: {
      alt: '',
      caption: ''
    }
  });

  useEffect(() => {
    fetchMedia();
    
    // Check if page opened in selection mode
    const urlParams = new URLSearchParams(window.location.search);
    const selectMode = urlParams.get('select');
    if (selectMode === 'true') {
      setSelectionMode(true);
    }
  }, []);

  const fetchMedia = async () => {
    try {
      setIsLoading(true);
      const response = await mediaApi.getAll();
      setMedia(response);
    } catch (error) {
      console.error('Error fetching media:', error);
      toast.error('Greška pri učitavanju medijskih fajlova');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const newUploadFiles: UploadFile[] = files.map(file => ({
      file,
      id: Math.random().toString(36).substr(2, 9),
      progress: 0,
      status: 'pending'
    }));
    
    setUploadFiles(prev => [...prev, ...newUploadFiles]);
    
    newUploadFiles.forEach(uploadFile => {
      handleUpload(uploadFile);
    });
    
    if (event.target) {
      event.target.value = '';
    }
  };

  const handleUpload = async (uploadFile: UploadFile) => {
    try {
      setUploadFiles(prev => prev.map(f => 
        f.id === uploadFile.id ? { ...f, status: 'uploading', progress: 0 } : f
      ));

      const progressInterval = setInterval(() => {
        setUploadFiles(prev => prev.map(f => {
          if (f.id === uploadFile.id && f.status === 'uploading' && f.progress < 90) {
            return { ...f, progress: Math.min(f.progress + Math.random() * 15, 90) };
          }
          return f;
        }));
      }, 300);

      const response = await mediaApi.upload(uploadFile.file);
      console.log('Upload response:', response);

      clearInterval(progressInterval);
      setUploadFiles(prev => prev.map(f => 
        f.id === uploadFile.id ? { ...f, status: 'success', progress: 100 } : f
      ));

      toast.success(`Fajl "${uploadFile.file.name}" je uspešno učitan`);
      await fetchMedia();

      setTimeout(() => {
        setUploadFiles(prev => prev.filter(f => f.id !== uploadFile.id));
      }, 2000);

    } catch (error) {
      console.error('Error uploading file:', error);
      setUploadFiles(prev => prev.map(f => 
        f.id === uploadFile.id ? { 
          ...f, 
          status: 'error', 
          progress: 0,
          error: error instanceof Error ? error.message : 'Greška pri učitavanju fajla'
        } : f
      ));
      toast.error(`Greška pri učitavanju fajla "${uploadFile.file.name}"`);
    }
  };

  const removeUploadFile = (id: string) => {
    setUploadFiles(prev => prev.filter(f => f.id !== id));
  };

  const onSubmit = async (data: MediaFormData) => {
    if (!selectedMedia) return;

    try {
      await mediaApi.update(selectedMedia.id, undefined, {
        alt: data.alt || undefined,
        caption: data.caption || undefined
      });
      
      toast.success('Medijski fajl je uspešno ažuriran');
      fetchMedia();
      setIsEditDialogOpen(false);
      setSelectedMedia(null);
      reset();
    } catch (error) {
      console.error('Error updating media:', error);
      toast.error('Greška pri ažuriranju medijskog fajla');
    }
  };

  const handleEditMedia = (mediaItem: Media) => {
    setSelectedMedia(mediaItem);
    setValue('alt', mediaItem.alt || '');
    setValue('caption', mediaItem.caption || '');
    setIsEditDialogOpen(true);
  };

  const handleDeleteMedia = async () => {
    if (!selectedMedia) return;

    try {
      await mediaApi.delete(selectedMedia.id);
      toast.success('Medijski fajl je uspešno obrisan');
      fetchMedia();
      setIsDeleteDialogOpen(false);
      setSelectedMedia(null);
    } catch (error) {
      console.error('Error deleting media:', error);
      toast.error('Greška pri brisanju medijskog fajla');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('URL je kopiran u clipboard');
  };

  // Selection mode functions
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
      return <ImageIcon className="h-4 w-4" />;
    } else if (mimeType?.includes('pdf')) {
      return <FileText className="h-4 w-4" />;
    } else {
      return <File className="h-4 w-4" />;
    }
  };

  const getFileTypeLabel = (mimeType: string) => {
    if (mimeType?.startsWith('image/')) return 'Slika';
    if (mimeType?.includes('pdf')) return 'PDF';
    if (mimeType?.includes('document')) return 'Dokument';
    if (mimeType?.includes('spreadsheet')) return 'Tabela';
    return 'Fajl';
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
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

  const filteredMedia = media.filter(item => {
    const matchesSearch = item.originalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.alt?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.caption?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = typeFilter === 'all' || 
                       (typeFilter === 'images' && item.mimeType?.startsWith('image/')) ||
                       (typeFilter === 'documents' && !item.mimeType?.startsWith('image/'));
    
    console.log(item.mimeType);
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Medijski fajlovi</h1>
          <p className="text-muted-foreground">
            Upravljajte slikama, dokumentima i ostalim fajlovima
          </p>
        </div>
        {!selectionMode && (
          <Button onClick={() => fileInputRef.current?.click()}>
            <Upload className="mr-2 h-4 w-4" />
            Učitaj fajlove
          </Button>
        )}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* Selection Mode Toolbar */}
      {selectionMode && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <p className="text-sm font-medium text-blue-800">
                  Režim selekcije - Izabrano: {selectedItems.length}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedItems([])}
                  disabled={selectedItems.length === 0}
                >
                  Poništi selekciju
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
                  Otkaži
                </Button>
                <Button
                  size="sm"
                  onClick={confirmSelection}
                  disabled={selectedItems.length === 0}
                >
                  Potvrdi selekciju ({selectedItems.length})
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upload Progress */}
      {uploadFiles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Učitavanje fajlova</CardTitle>
            <CardDescription>
              Status učitavanja fajlova
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {uploadFiles.map((uploadFile) => (
                <div key={uploadFile.id} className="flex items-center space-x-3">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">{uploadFile.file.name}</span>
                      <div className="flex items-center space-x-2">
                        {uploadFile.status === 'success' && (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        )}
                        {uploadFile.status === 'error' && (
                          <AlertCircle className="h-4 w-4 text-red-600" />
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeUploadFile(uploadFile.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${
                          uploadFile.status === 'success' ? 'bg-green-600' :
                          uploadFile.status === 'error' ? 'bg-red-600' : 'bg-blue-600'
                        }`}
                        style={{ width: `${uploadFile.progress}%` }}
                      ></div>
                    </div>
                    {uploadFile.error && (
                      <p className="text-xs text-red-600 mt-1">{uploadFile.error}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Pretraga i filteri</CardTitle>
          <CardDescription>
            Pronađite fajlove pomoću pretrage i filtera
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="search">Pretraga</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Pretraži fajlove..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Tip fajla</Label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Svi tipovi" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Svi tipovi</SelectItem>
                  <SelectItem value="images">Slike</SelectItem>
                  <SelectItem value="documents">Dokumenti</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <div className="text-sm text-muted-foreground">
                Prikazuje se {filteredMedia.length} od {media.length} fajlova
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Media Grid */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Lista fajlova</CardTitle>
              <CardDescription>
                Ukupno {filteredMedia.length} fajlova
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
              {filteredMedia.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {filteredMedia.map((item) => (
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
                            toggleSelection(item);
                          } else {
                            toast.error("Mozete izabrati samo slike!")
                          }
                        }
                      }}
                    >
                      <div className="aspect-square bg-gray-50 flex items-center justify-center relative group">
                        {item.mimeType?.startsWith('image/') ? (
                          <img
                            crossOrigin="anonymous"
                            src={mediaApi.getFileUrl(item.filename)}
                            alt={item.alt || item.originalName}
                            className="w-full h-full object-cover"
                          />
                        ) : item.mimeType?.includes('pdf') ? (
                          <div className="flex flex-col items-center space-y-3 text-center p-4">
                            <div className="bg-red-100 p-4 rounded-lg">
                              <FileText className="h-8 w-8 text-red-600" />
                            </div>
                            <div>
                              <div className="font-medium text-sm mb-1">PDF Dokument</div>
                              <div className="text-xs text-muted-foreground truncate max-w-full">
                                {item.originalName}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center space-y-3 text-center p-4">
                            <div className="bg-gray-100 p-4 rounded-lg">
                              <File className="h-8 w-8 text-gray-600" />
                            </div>
                            <div>
                              <div className="font-medium text-sm mb-1">Fajl</div>
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
                        
                        {/* Overlay actions - only show when NOT in selection mode */}
                        {!selectionMode && (
                          <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                window.open(mediaApi.getFileUrl(item.filename), '_blank');
                              }}
                              title="Otvori fajl"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                copyToClipboard(mediaApi.getFileUrl(item.filename));
                              }}
                              title="Kopiraj URL"
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditMedia(item);
                              }}
                              title="Uredi"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedMedia(item);
                                setIsDeleteDialogOpen(true);
                              }}
                              title="Obriši"
                              className="text-red-600 hover:text-red-800"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        )}

                        {/* File type badge */}
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
                              Alt: {item.alt}
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
                    {searchTerm || typeFilter !== 'all' ? (
                      <>
                        <Search className="mx-auto h-12 w-12 mb-4" />
                        <h3 className="text-lg font-medium mb-2">Nema rezultata</h3>
                        <p>Nema fajlova koji odgovaraju filterima</p>
                        <Button
                          variant="outline"
                          className="mt-4"
                          onClick={() => {
                            setSearchTerm('');
                            setTypeFilter('all');
                          }}
                        >
                          Očisti filtere
                        </Button>
                      </>
                    ) : (
                      <>
                        <ImageIcon className="mx-auto h-12 w-12 mb-4" />
                        <h3 className="text-lg font-medium mb-2">Nema fajlova</h3>
                        <p className="mb-4">Počnite učitavanjem prvog fajla</p>
                        {!selectionMode && (
                          <Button onClick={() => fileInputRef.current?.click()}>
                            <Upload className="mr-2 h-4 w-4" />
                            Učitaj fajlove
                          </Button>
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

      {/* Media Statistics */}
      {media.length > 0 && !selectionMode && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Ukupno fajlova
              </CardTitle>
              <HardDrive className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{media.length}</div>
              <p className="text-xs text-muted-foreground">
                Medijski fajlovi
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Slike
              </CardTitle>
              <ImageIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {media.filter(item => item.mimeType?.startsWith('image/')).length}
              </div>
              <p className="text-xs text-muted-foreground">
                Slikovni fajlovi
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Dokumenti
              </CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {media.filter(item => !item.mimeType?.startsWith('image/')).length}
              </div>
              <p className="text-xs text-muted-foreground">
                PDF i ostali dokumenti
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Ukupna veličina
              </CardTitle>
              <HardDrive className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatFileSize(media.reduce((sum, item) => sum + item.size, 0))}
              </div>
              <p className="text-xs text-muted-foreground">
                Zauzeto prostora
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Edit Media Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>Uredi medijski fajl</DialogTitle>
              <DialogDescription>
                Uredite informacije o fajlu "{selectedMedia?.originalName}"
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {selectedMedia?.mimeType?.startsWith('image/') && (
                <div className="space-y-2">
                  <Label htmlFor="alt">Alt tekst (za slike)</Label>
                  <Input
                    id="alt"
                    placeholder="Opisni tekst slike..."
                    {...register('alt')}
                  />
                  <p className="text-xs text-muted-foreground">
                    Koristi se za accessibility i SEO
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="caption">Opis fajla</Label>
                <Textarea
                  id="caption"
                  placeholder="Kratki opis fajla..."
                  rows={3}
                  {...register('caption')}
                />
              </div>

              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex justify-between">
                  <span>Ime fajla:</span>
                  <span className="font-mono">{selectedMedia?.filename}</span>
                </div>
                <div className="flex justify-between">
                  <span>Originalno ime:</span>
                  <span>{selectedMedia?.originalName}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tip:</span>
                  <span>{selectedMedia?.mimeType}</span>
                </div>
                <div className="flex justify-between">
                  <span>Veličina:</span>
                  <span>{selectedMedia ? formatFileSize(selectedMedia.size) : ''}</span>
                </div>
                <div className="flex justify-between">
                  <span>Datum:</span>
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
                Otkaži
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Čuva se...' : 'Sačuvaj izmene'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Potvrdi brisanje</DialogTitle>
            <DialogDescription>
              Da li ste sigurni da želite da obrišete fajl "{selectedMedia?.originalName}"?
              Ova akcija se ne može poništiti i fajl će biti uklonjen sa servera.
            </DialogDescription>
          </DialogHeader>
          
          {selectedMedia?.mimeType?.startsWith('image/') && (
            <div className="py-4">
              <img
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
              Otkaži
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteMedia}
            >
              Obriši fajl
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}