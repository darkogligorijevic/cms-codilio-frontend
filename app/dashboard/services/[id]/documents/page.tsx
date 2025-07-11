// app/dashboard/services/[id]/documents/page.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { DragDropUpload } from '@/components/ui/drag-drop-upload';
import { 
  ArrowLeft,
  Upload,
  FileText,
  Download,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  MoreVertical,
  Plus,
  X,
  CheckCircle,
  AlertCircle,
  File,
  Calendar
} from 'lucide-react';
import { servicesApi } from '@/lib/api';
import {
  Service,
  ServiceDocument,
  ServiceDocumentType,
  CreateServiceDocumentDto,
  UpdateServiceDocumentDto
} from '@/lib/types';
import { toast } from 'sonner';
import { useTheme } from 'next-themes';

interface DocumentFormData extends CreateServiceDocumentDto {}

export default function ServiceDocumentsPage() {
  const [service, setService] = useState<Service | null>(null);
  const [documents, setDocuments] = useState<ServiceDocument[]>([]);
  const [documentTypes, setDocumentTypes] = useState<Array<{ value: ServiceDocumentType; label: string; description: string }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<ServiceDocument | null>(null);
  const [documentToDelete, setDocumentToDelete] = useState<ServiceDocument | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  const router = useRouter();
  const params = useParams();
  const { theme } = useTheme();
  const serviceId = params?.id as string;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadForm = useForm<DocumentFormData>({
    defaultValues: {
      title: '',
      type: ServiceDocumentType.FORM,
      description: '',
      sortOrder: 0,
      isActive: true,
      isPublic: true,
    }
  });

  const editForm = useForm<UpdateServiceDocumentDto>({
    defaultValues: {
      title: '',
      type: ServiceDocumentType.FORM,
      description: '',
      sortOrder: 0,
      isActive: true,
      isPublic: true,
    }
  });

  useEffect(() => {
    if (serviceId) {
      fetchService();
      fetchDocuments();
      fetchDocumentTypes();
    }
  }, [serviceId]);

  const fetchService = async () => {
    if (!serviceId) return;

    try {
      const serviceData = await servicesApi.getById(parseInt(serviceId));
      setService(serviceData);
    } catch (error) {
      console.error('Error fetching service:', error);
      toast.error('Грешка при учитавању услуге');
      router.push('/dashboard/services');
    }
  };

  const fetchDocuments = async () => {
    if (!serviceId) return;

    try {
      setIsLoading(true);
      const documentsData = await servicesApi.getDocuments(parseInt(serviceId));
      setDocuments(documentsData);
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast.error('Грешка при учитавању докумената');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDocumentTypes = async () => {
    try {
      const types = await servicesApi.getDocumentTypes();
      setDocumentTypes(types);
    } catch (error) {
      console.error('Error fetching document types:', error);
    }
  };

  const handleFileUpload = async (file: File, metadata?: any) => {
    if (!serviceId) return;

    try {
      setIsUploading(true);
      
      const documentMetadata: CreateServiceDocumentDto = {
        title: metadata?.title || file.name,
        type: metadata?.type || ServiceDocumentType.OTHER,
        description: metadata?.description || '',
        sortOrder: metadata?.sortOrder || 0,
        isActive: metadata?.isActive ?? true,
        isPublic: metadata?.isPublic ?? true,
      };

      await servicesApi.uploadDocument(parseInt(serviceId), file, documentMetadata);
      
      toast.success('Документ је успешно учитан');
      fetchDocuments();
    } catch (error: any) {
      console.error('Error uploading document:', error);
      toast.error(error.response?.data?.message || 'Грешка при учитавању документа');
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  const handleManualUpload = async (data: DocumentFormData) => {
    const file = fileInputRef.current?.files?.[0];
    if (!file) {
      toast.error('Молимо изаберите фајл');
      return;
    }

    try {
      setIsUploading(true);
      await servicesApi.uploadDocument(parseInt(serviceId!), file, data);
      
      toast.success('Документ је успешно учитан');
      setIsUploadDialogOpen(false);
      uploadForm.reset();
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      fetchDocuments();
    } catch (error: any) {
      console.error('Error uploading document:', error);
      toast.error(error.response?.data?.message || 'Грешка при учитавању документа');
    } finally {
      setIsUploading(false);
    }
  };

  const handleEdit = (document: ServiceDocument) => {
    setSelectedDocument(document);
    editForm.reset({
      title: document.title,
      type: document.type,
      description: document.description || '',
      sortOrder: document.sortOrder,
      isActive: document.isActive,
      isPublic: document.isPublic,
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdate = async (data: UpdateServiceDocumentDto) => {
    if (!selectedDocument || !serviceId) return;

    try {
      await servicesApi.updateDocument(parseInt(serviceId), selectedDocument.id, data);
      toast.success('Документ је успешно ажуриран');
      setIsEditDialogOpen(false);
      setSelectedDocument(null);
      fetchDocuments();
    } catch (error: any) {
      console.error('Error updating document:', error);
      toast.error(error.response?.data?.message || 'Грешка при ажурирању документа');
    }
  };

  const handleDelete = (document: ServiceDocument) => {
    setDocumentToDelete(document);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!documentToDelete || !serviceId) return;

    try {
      await servicesApi.deleteDocument(parseInt(serviceId), documentToDelete.id);
      toast.success('Документ је успешно обрисан');
      setIsDeleteDialogOpen(false);
      setDocumentToDelete(null);
      fetchDocuments();
    } catch (error: any) {
      console.error('Error deleting document:', error);
      toast.error(error.response?.data?.message || 'Грешка при брисању документа');
    }
  };

  const handleDownload = (document: ServiceDocument) => {
    if (!serviceId) return;
    servicesApi.downloadDocument(parseInt(serviceId), document.id);
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

  if (!service) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button 
            variant="outline" 
            onClick={() => router.push(`/dashboard/services/${serviceId}`)}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Назад на услугу
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Документи услуге</h1>
            <p className="text-muted-foreground">
              Управљање документима за услугу "{service.name}"
            </p>
          </div>
        </div>
        <Button 
          onClick={() => setIsUploadDialogOpen(true)}
          variant={theme === "light" ? "default" : "secondaryDefault"}
        >
          <Plus className="mr-2 h-4 w-4" />
          Додај документ
        </Button>
      </div>

      {/* Drag & Drop Upload */}
      <Card>
        <CardHeader>
          <CardTitle>Брзо учитавање</CardTitle>
          <CardDescription>
            Превуците фајлове овде за брзо учитавање или користите дугме испод за детаљно подешавање
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DragDropUpload
            onFileUpload={handleFileUpload}
            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.rtf,.odt,.ods,.odp,.csv,.jpg,.jpeg,.png,.gif,.webp,.svg"
            maxSize={10}
            multiple={true}
            disabled={isUploading}
          />
        </CardContent>
      </Card>

      {/* Documents List */}
      <Card>
        <CardHeader>
          <CardTitle>Листа докумената ({documents.length})</CardTitle>
          <CardDescription>
            Сви документи повезани са овом услугом
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse flex items-center space-x-4 p-4 border rounded-lg">
                  <div className="w-10 h-10 bg-gray-200 rounded"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : documents.length > 0 ? (
            <div className="space-y-4">
              {documents.map((document) => (
                <div key={document.id} className="flex items-start justify-between p-4 border rounded-lg hover:shadow-md transition-shadow">
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
                        {!document.isActive && (
                          <Badge variant="destructive" className="text-xs">
                            Неактиван
                          </Badge>
                        )}
                      </div>
                      
                      <div className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
                        <p>Име фајла: {document.originalName}</p>
                        {document.description && (
                          <p>Опис: {document.description}</p>
                        )}
                        <div className="flex items-center space-x-4 text-xs">
                          <span>Величина: {formatFileSize(document.size)}</span>
                          <span>Преузимања: {document.downloadCount}</span>
                          <span>Редни број: {document.sortOrder}</span>
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
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Нема докумената</h3>
              <p className="text-gray-500 mb-4">
                Додајте први документ за ову услугу
              </p>
              <Button 
                onClick={() => setIsUploadDialogOpen(true)}
                variant={theme === "light" ? "default" : "secondaryDefault"}
              >
                <Plus className="mr-2 h-4 w-4" />
                Додај документ
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Manual Upload Dialog */}
      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Додај нови документ</DialogTitle>
            <DialogDescription>
              Учитајте документ са детаљним подешавањима
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={uploadForm.handleSubmit(handleManualUpload)} className="space-y-4">
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
                  {uploadForm.watch('title') || 'Изаберите фајл'}
                </Button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    uploadForm.setValue('title', file.name.replace(/\.[^/.]+$/, ''));
                  }
                }}
                className="hidden"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.rtf,.odt,.ods,.odp,.csv,.jpg,.jpeg,.png,.gif,.webp,.svg"
              />
              <p className="text-xs text-gray-500">
                Максимална величина: 10MB
              </p>
            </div>

            {/* Document Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="upload-title">Назив документа *</Label>
                <Input
                  id="upload-title"
                  placeholder="Образац за пријаву..."
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
                  onValueChange={(value) => uploadForm.setValue('type', value as ServiceDocumentType)}
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
                <Label htmlFor="upload-sort">Редни број</Label>
                <Input
                  id="upload-sort"
                  type="number"
                  placeholder="0"
                  {...uploadForm.register('sortOrder', {
                    setValueAs: (value) => parseInt(value) || 0
                  })}
                />
              </div>

              <div className="space-y-4 pt-6">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="upload-active"
                    checked={uploadForm.watch('isActive')}
                    onCheckedChange={(checked) => uploadForm.setValue('isActive', !!checked)}
                  />
                  <Label htmlFor="upload-active">Активно</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="upload-public"
                    checked={uploadForm.watch('isPublic')}
                    onCheckedChange={(checked) => uploadForm.setValue('isPublic', !!checked)}
                  />
                  <Label htmlFor="upload-public">Јавно доступно</Label>
                </div>
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
                disabled={isUploading}
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
                  placeholder="Образац за пријаву..."
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
                  onValueChange={(value) => editForm.setValue('type', value as ServiceDocumentType)}
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
                <Label htmlFor="edit-sort">Редни број</Label>
                <Input
                  id="edit-sort"
                  type="number"
                  placeholder="0"
                  {...editForm.register('sortOrder', {
                    setValueAs: (value) => parseInt(value) || 0
                  })}
                />
              </div>

              <div className="space-y-4 pt-6">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="edit-active"
                    checked={editForm.watch('isActive')}
                    onCheckedChange={(checked) => editForm.setValue('isActive', !!checked)}
                  />
                  <Label htmlFor="edit-active">Активно</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="edit-public"
                    checked={editForm.watch('isPublic')}
                    onCheckedChange={(checked) => editForm.setValue('isPublic', !!checked)}
                  />
                  <Label htmlFor="edit-public">Јавно доступно</Label>
                </div>
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