// components/dashboard/director-documents.tsx - Fixed version
'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Upload,
  FileText,
  Download,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  MoreVertical,
  Calendar,
  File,
  Plus,
  X,
  AlertCircle
} from 'lucide-react';
import { directorsApi } from '@/lib/api';
import { Director, DirectorDocument, DocumentType, CreateDirectorDocumentDto } from '@/lib/types';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { useTheme } from 'next-themes';

interface DirectorDocumentsProps {
  director: Director;
  onDocumentsUpdate: () => void;
}

interface DocumentFormData extends CreateDirectorDocumentDto {
  file?: File;
}

export function DirectorDocuments({ director, onDocumentsUpdate }: DirectorDocumentsProps) {
  const [documents, setDocuments] = useState<DirectorDocument[]>([]);
  const [documentTypes, setDocumentTypes] = useState<Array<{ value: DocumentType; label: string; description: string }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<DirectorDocument | null>(null);
  const [documentToDelete, setDocumentToDelete] = useState<DirectorDocument | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { theme } = useTheme();

  const uploadForm = useForm<DocumentFormData>({
    defaultValues: {
      title: '',
      type: DocumentType.OTHER,
      description: '',
      documentDate: '',
      isPublic: false,
    }
  });

  const editForm = useForm<Partial<CreateDirectorDocumentDto>>({
    defaultValues: {
      title: '',
      type: DocumentType.OTHER,
      description: '',
      documentDate: '',
      isPublic: false,
    }
  });

  useEffect(() => {
    fetchDocuments();
    fetchDocumentTypes();
  }, [director.id]);

  const fetchDocuments = async () => {
    try {
      setIsLoading(true);
      const documentsData = await directorsApi.getDocuments(director.id);
      setDocuments(documentsData);
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast.error('Greška pri učitavanju dokumenata');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDocumentTypes = async () => {
    try {
      const types = await directorsApi.getDocumentTypes();
      setDocumentTypes(types);
    } catch (error) {
      console.error('Error fetching document types:', error);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Fajl je prevelik. Maksimalna veličina je 10MB.');
        return;
      }
      uploadForm.setValue('file', file);
    }
  };

  const handleUpload = async (data: DocumentFormData) => {
    if (!data.file) {
      toast.error('Molimo izaberite fajl');
      return;
    }

    try {
      setIsUploading(true);
      
      const documentMetadata: CreateDirectorDocumentDto = {
        title: data.title,
        type: data.type,
        description: data.description,
        documentDate: data.documentDate,
        isPublic: data.isPublic,
      };

      await directorsApi.uploadDocument(director.id, data.file, documentMetadata);
      
      toast.success('Dokument je uspešno učitan');
      setIsUploadDialogOpen(false);
      uploadForm.reset();
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      await fetchDocuments();
      onDocumentsUpdate();
    } catch (error: any) {
      console.error('Error uploading document:', error);
      toast.error(error.response?.data?.message || 'Greška pri učitavanju dokumenta');
    } finally {
      setIsUploading(false);
    }
  };

  const handleEdit = (document: DirectorDocument) => {
    setSelectedDocument(document);
    editForm.reset({
      title: document.title,
      type: document.type,
      description: document.description || '',
      documentDate: document.documentDate ? document.documentDate.split('T')[0] : '',
      isPublic: document.isPublic,
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdate = async (data: Partial<CreateDirectorDocumentDto>) => {
    if (!selectedDocument) return;

    try {
      await directorsApi.updateDocument(director.id, selectedDocument.id, data);
      toast.success('Dokument je uspešno ažuriran');
      setIsEditDialogOpen(false);
      setSelectedDocument(null);
      await fetchDocuments();
      onDocumentsUpdate();
    } catch (error: any) {
      console.error('Error updating document:', error);
      toast.error(error.response?.data?.message || 'Greška pri ažuriranju dokumenta');
    }
  };

  const handleDelete = (document: DirectorDocument) => {
    setDocumentToDelete(document);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!documentToDelete) return;

    try {
      await directorsApi.deleteDocument(director.id, documentToDelete.id);
      toast.success('Dokument je uspešno obrisan');
      setIsDeleteDialogOpen(false);
      setDocumentToDelete(null);
      await fetchDocuments();
      onDocumentsUpdate();
    } catch (error: any) {
      console.error('Error deleting document:', error);
      toast.error(error.response?.data?.message || 'Greška pri brisanju dokumenta');
    }
  };

  // Fixed download function - use DOM API directly instead of document property
  const handleDownload = (document: DirectorDocument) => {
    const url = directorsApi.getFileUrl(document.filename);
    const link = window.document.createElement('a'); // Use window.document explicitly
    link.href = url;
    link.download = document.originalName;
    link.click();
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
      month: 'long',
      day: 'numeric'
    });
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.includes('pdf')) return <FileText className="h-4 w-4 text-red-500" />;
    if (mimeType.includes('word')) return <FileText className="h-4 w-4 text-blue-500" />;
    if (mimeType.includes('image')) return <FileText className="h-4 w-4 text-green-500" />;
    return <File className="h-4 w-4 text-gray-500" />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Документи</h3>
          <p className="text-sm text-gray-600">
            Управљање документима директора {director.fullName}
          </p>
        </div>
        <Button onClick={() => setIsUploadDialogOpen(true)} variant={theme === "light" ? "default" : "secondaryDefault"}>
          <Plus className="mr-2 h-4 w-4" />
          Додај документ
        </Button>
      </div>

      {/* Documents List */}
      <div className="grid gap-4">
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gray-200 rounded"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : documents.length > 0 ? (
          documents.map((document) => (
            <Card key={document.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className="flex-shrink-0 mt-1">
                      {getFileIcon(document.mimeType)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="font-medium text-gray-900 dark:text-gray-100 truncate">
                          {document.title}
                        </h4>
                        <Badge variant={document.isPublic ? "default" : "secondary"} className="text-xs">
                          {document.isPublic ? (
                            <>
                              <Eye className="h-3 w-3 mr-1" />
                              Јавно
                            </>
                          ) : (
                            <>
                              <EyeOff className="h-3 w-3 mr-1" />
                              Интерно
                            </>
                          )}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {documentTypes.find(type => type.value === document.type)?.label || document.type}
                        </Badge>
                      </div>
                      
                      <div className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
                        <p>Оригинални назив: {document.originalName}</p>
                        {document.description && (
                          <p>Опис: {document.description}</p>
                        )}
                        <div className="flex items-center space-x-4">
                          <span>Величина: {formatFileSize(document.size)}</span>
                          {document.documentDate && (
                            <span>Датум документа: {formatDate(document.documentDate)}</span>
                          )}
                          <span>Учитано: {formatDate(document.uploadedAt)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleDownload(document)}>
                        <Download className="mr-2 h-4 w-4" />
                        Преузми
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleEdit(document)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Уреди
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleDelete(document)}
                        className="text-red-600"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Обриши
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <FileText className="mx-auto h-12 w-12 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Нема докумената</h3>
              <p className="text-gray-500 mb-4">
                Додајте први документ за овог директора
              </p>
              <Button onClick={() => setIsUploadDialogOpen(true)} variant={theme === "light" ? "default" : "secondaryDefault"}>
                <Plus className="mr-2 h-4 w-4" />
                Додај документ
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Upload Dialog */}
      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Додај нови документ</DialogTitle>
            <DialogDescription>
              Учитајте документ за директора {director.fullName}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={uploadForm.handleSubmit(handleUpload)} className="space-y-4">
            {/* File Upload */}
            <div className="space-y-2">
              <Label>Фајл *</Label>
              <div className="flex items-center space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  {uploadForm.watch('file') ? uploadForm.watch('file')?.name : 'Изаберите фајл'}
                </Button>
                {uploadForm.watch('file') && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      uploadForm.setValue('file', undefined);
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileSelect}
                className="hidden"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif"
              />
              <p className="text-xs text-gray-500">
                Дозвољени формати: PDF, DOC, DOCX, JPG, PNG, GIF (макс. 10MB)
              </p>
            </div>

            {/* Document Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="upload-title">Назив документа *</Label>
                <Input
                  id="upload-title"
                  placeholder="Решење о именовању..."
                  {...uploadForm.register('title', { required: 'Назив је обавезан' })}
                />
                {uploadForm.formState.errors.title && (
                  <p className="text-sm text-red-600">{uploadForm.formState.errors.title.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="upload-type">Тип документа</Label>
                <Select 
                  value={uploadForm.watch('type')} 
                  onValueChange={(value) => uploadForm.setValue('type', value as DocumentType)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Изаберите тип" />
                  </SelectTrigger>
                  <SelectContent>
                    {documentTypes.map((type) => (
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
            </div>

            <div className="space-y-2">
              <Label htmlFor="upload-description">Опис</Label>
              <Textarea
                id="upload-description"
                placeholder="Краћи опис документа..."
                rows={3}
                {...uploadForm.register('description')}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="upload-date">Датум документа</Label>
                <Input
                  id="upload-date"
                  type="date"
                  {...uploadForm.register('documentDate')}
                />
              </div>

              <div className="flex items-center space-x-2 pt-8">
                <Checkbox
                  id="upload-public"
                  checked={uploadForm.watch('isPublic')}
                  onCheckedChange={(checked) => uploadForm.setValue('isPublic', !!checked)}
                />
                <Label htmlFor="upload-public">Јавно доступан документ</Label>
              </div>
            </div>

            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsUploadDialogOpen(false)}
                disabled={isUploading}
              >
                Откажи
              </Button>
              <Button 
                type="submit" 
                disabled={isUploading || !uploadForm.watch('file')}
                variant={theme === "light" ? "default" : "secondaryDefault"}
              >
                {isUploading ? 'Учитава се...' : 'Учитај документ'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Уреди документ</DialogTitle>
            <DialogDescription>
              Ажурирајте информације о документу
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={editForm.handleSubmit(handleUpdate)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-title">Назив документа *</Label>
                <Input
                  id="edit-title"
                  placeholder="Решење о именовању..."
                  {...editForm.register('title', { required: 'Назив је обавезан' })}
                />
                {editForm.formState.errors.title && (
                  <p className="text-sm text-red-600">{editForm.formState.errors.title.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-type">Тип документа</Label>
                <Select 
                  value={editForm.watch('type')} 
                  onValueChange={(value) => editForm.setValue('type', value as DocumentType)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Изаберите тип" />
                  </SelectTrigger>
                  <SelectContent>
                    {documentTypes.map((type) => (
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
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">Опис</Label>
              <Textarea
                id="edit-description"
                placeholder="Краћи опис документа..."
                rows={3}
                {...editForm.register('description')}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-date">Датум документа</Label>
                <Input
                  id="edit-date"
                  type="date"
                  {...editForm.register('documentDate')}
                />
              </div>

              <div className="flex items-center space-x-2 pt-8">
                <Checkbox
                  id="edit-public"
                  checked={editForm.watch('isPublic')}
                  onCheckedChange={(checked) => editForm.setValue('isPublic', !!checked)}
                />
                <Label htmlFor="edit-public">Јавно доступан документ</Label>
              </div>
            </div>

            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsEditDialogOpen(false)}
              >
                Откажи
              </Button>
              <Button 
                type="submit"
                variant={theme === "light" ? "default" : "secondaryDefault"}
              >
                Ажурирај
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Потврди брисање</DialogTitle>
            <DialogDescription>
              Да ли сте сигурни да желите да обришете документ{' '}
              <strong>{documentToDelete?.title}</strong>? Ова акција се не може поништити.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Откажи
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmDelete}
            >
              Обриши
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}