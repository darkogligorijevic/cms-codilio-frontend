// components/ui/drag-drop-upload.tsx - Fixed version
'use client';

import { useState, useRef, DragEvent, ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
  X,
  CheckCircle,
  AlertCircle,
  Loader2,
  Eye,
  EyeOff,
  Building,
  DollarSign,
  FileCheck,
  Clipboard,
  BarChart3,
  Folder,
  Settings
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { MediaCategory, type CreateMediaDto } from '@/lib/types';

interface UploadFile {
  file: File;
  id: string;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
  preview?: string;
  metadata: CreateMediaDto;
}

interface FileMetadataDialog {
  isOpen: boolean;
  file: File | null;
  metadata: CreateMediaDto;
}

interface DragDropUploadProps {
  onFileUpload: (file: File, metadata?: CreateMediaDto) => Promise<void>;
  accept?: string;
  maxSize?: number; // in MB
  multiple?: boolean;
  className?: string;
  disabled?: boolean;
  defaultCategory?: MediaCategory;
  defaultIsPublic?: boolean;
}

const categories = [
  {
    value: MediaCategory.PROCUREMENT,
    label: 'Јавне набавке',
    icon: Building,
    description: 'Документи везани за јавне набавке и тендере'
  },
  {
    value: MediaCategory.FINANCIAL,
    label: 'Финансијски извештаји',
    icon: DollarSign,
    description: 'Буџети, финансијски планови и извештаји'
  },
  {
    value: MediaCategory.DECISIONS,
    label: 'Одлуке',
    icon: FileCheck,
    description: 'Одлуке донесене на састанцима и седницама'
  },
  {
    value: MediaCategory.PLANS,
    label: 'Планови',
    icon: Clipboard,
    description: 'Годишњи планови рада и развоја'
  },
  {
    value: MediaCategory.REPORTS,
    label: 'Извештаји',
    icon: BarChart3,
    description: 'Извештаји о раду управе и других органа'
  },
  {
    value: MediaCategory.OTHER,
    label: 'Остало',
    icon: Folder,
    description: 'Остали документи и медији'
  }
];

export function DragDropUpload({
  onFileUpload,
  accept = 'image/*,.pdf,.doc,.docx,.xls,.xlsx',
  maxSize = 10, // 10MB default
  multiple = true,
  className,
  disabled = false,
  defaultCategory = MediaCategory.OTHER,
  defaultIsPublic = false
}: DragDropUploadProps) {
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [globalMetadata, setGlobalMetadata] = useState<CreateMediaDto>({
    category: defaultCategory,
    isPublic: defaultIsPublic,
    description: '',
    alt: '',
    caption: ''
  });
  const [metadataDialog, setMetadataDialog] = useState<FileMetadataDialog>({
    isOpen: false,
    file: null,
    metadata: { ...globalMetadata }
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <ImageIcon className="h-4 w-4" />;
    } else if (file.type.includes('pdf')) {
      return <FileText className="h-4 w-4" />;
    } else {
      return <File className="h-4 w-4" />;
    }
  };

  const getFileTypeLabel = (file: File) => {
    if (file.type.startsWith('image/')) return 'Слика';
    if (file.type.includes('pdf')) return 'PDF';
    if (file.type.includes('document')) return 'Документ';
    if (file.type.includes('spreadsheet')) return 'Табела';
    return 'Фајл';
  };

  const getCategoryIcon = (category: MediaCategory) => {
    const categoryInfo = categories.find(cat => cat.value === category);
    const IconComponent = categoryInfo?.icon || Folder;
    return <IconComponent className="h-4 w-4" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const validateFile = (file: File): string | null => {
    // Check file size
    if (file.size > maxSize * 1024 * 1024) {
      return `Фајл је превелик. Масксимална величина је ${maxSize}MB.`;
    }

    // Check file type
    const acceptedTypes = accept.split(',').map(type => type.trim());
    const isValidType = acceptedTypes.some(acceptedType => {
      if (acceptedType === 'image/*') {
        return file.type.startsWith('image/');
      }
      if (acceptedType.startsWith('.')) {
        return file.name.toLowerCase().endsWith(acceptedType.toLowerCase());
      }
      return file.type === acceptedType;
    });

    if (!isValidType) {
      return `Неподржан тип фајла. Дозвољена су следећа проширења: ${accept}`;
    }

    return null;
  };

  const createFilePreview = (file: File): string | undefined => {
    if (file.type.startsWith('image/')) {
      return URL.createObjectURL(file);
    }
    return undefined;
  };

  const isDocumentFile = (file: File): boolean => {
    return !file.type.startsWith('image/');
  };

  const openMetadataDialog = (file: File) => {
    setMetadataDialog({
      isOpen: true,
      file,
      metadata: { ...globalMetadata }
    });
  };

  const handleMetadataConfirm = async () => {
    if (!metadataDialog.file) return;

    const uploadFile: UploadFile = {
      file: metadataDialog.file,
      id: Math.random().toString(36).substr(2, 9),
      progress: 0,
      status: 'pending',
      preview: createFilePreview(metadataDialog.file),
      metadata: { ...metadataDialog.metadata }
    };

    setUploadFiles(prev => [...prev, uploadFile]);
    setMetadataDialog({ isOpen: false, file: null, metadata: { ...globalMetadata } });

    await handleFileUpload(uploadFile);
  };

  const processFiles = async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    
    for (const file of fileArray) {
      const error = validateFile(file);
      
      if (error) {
        toast.error(error);
        continue;
      }

      // For documents, always show metadata dialog
      if (isDocumentFile(file)) {
        openMetadataDialog(file);
      } else {
        // For images, use global metadata directly
        const uploadFile: UploadFile = {
          file,
          id: Math.random().toString(36).substr(2, 9),
          progress: 0,
          status: 'pending',
          preview: createFilePreview(file),
          metadata: { ...globalMetadata }
        };

        setUploadFiles(prev => [...prev, uploadFile]);
        await handleFileUpload(uploadFile);
      }
    }
  };

  const handleFileUpload = async (uploadFile: UploadFile) => {
    try {
      // Update status to uploading
      setUploadFiles(prev => prev.map(f => 
        f.id === uploadFile.id ? { ...f, status: 'uploading', progress: 0 } : f
      ));

      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadFiles(prev => prev.map(f => {
          if (f.id === uploadFile.id && f.status === 'uploading' && f.progress < 90) {
            return { ...f, progress: Math.min(f.progress + Math.random() * 15, 90) };
          }
          return f;
        }));
      }, 300);

      // Actual upload with the file's specific metadata
      await onFileUpload(uploadFile.file, uploadFile.metadata);

      // Clear progress interval and mark as successful
      clearInterval(progressInterval);
      setUploadFiles(prev => prev.map(f => 
        f.id === uploadFile.id ? { ...f, status: 'success', progress: 100 } : f
      ));

      // Auto-remove successful uploads after 3 seconds
      setTimeout(() => {
        setUploadFiles(prev => prev.filter(f => f.id !== uploadFile.id));
      }, 3000);

    } catch (error) {
      console.error('Error uploading file:', error);
      setUploadFiles(prev => prev.map(f => 
        f.id === uploadFile.id ? { 
          ...f, 
          status: 'error', 
          progress: 0,
          error: error instanceof Error ? error.message : 'Грешка при учитавању фајла'
        } : f
      ));
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (disabled) return;

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      processFiles(files);
    }
  };

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFiles(files);
    }
    
    // Clear the input
    if (e.target) {
      e.target.value = '';
    }
  };

  const removeUploadFile = (id: string) => {
    setUploadFiles(prev => {
      const fileToRemove = prev.find(f => f.id === id);
      if (fileToRemove?.preview) {
        URL.revokeObjectURL(fileToRemove.preview);
      }
      return prev.filter(f => f.id !== id);
    });
  };

  const updateFileMetadata = (id: string, metadata: Partial<CreateMediaDto>) => {
    setUploadFiles(prev => prev.map(f => 
      f.id === id ? { ...f, metadata: { ...f.metadata, ...metadata } } : f
    ));
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Global Metadata Form */}


      {/* Drag & Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "relative border-2 border-dashed rounded-lg transition-colors",
          "flex flex-col items-center justify-center p-8 text-center",
          disabled 
            ? "border-gray-200 bg-gray-50 cursor-not-allowed" 
            : isDragOver 
              ? "border-gray-600 bg-gray-100 dark:bg-card border-solid" 
              : "border-gray-300 hover:border-gray-200 hover:bg-gray-50 dark:hover:bg-transparent cursor-pointer"
        )}
        onClick={() => !disabled && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileSelect}
          className="hidden"
          disabled={disabled}
        />

        <div className={cn(
          "space-y-4",
          disabled ? "opacity-50" : ""
        )}>
          <div className={cn(
            "mx-auto rounded-full p-4",
            isDragOver ? "bg-white dark:bg-gray-600" : "bg-gray-100 dark:bg-gray-600"
          )}>
            <Upload className={cn(
              "h-8 w-8",
              isDragOver ? "text-gray-600 dark:text-gray-200" : "text-gray-400"
            )} />
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-1 dark:text-white">
              {isDragOver ? 'Отпустите фајлове овде' : 'Превуците фајлове овде'}
            </h3>
            <p className="text-sm text-gray-500 mb-2">
              или кликните да изаберете фајлове
            </p>
            <p className="text-xs text-gray-400">
              Масксимална величина: {maxSize}MB • Дозвољени типови: {accept}
            </p>
          </div>

          <div className="text-xs text-muted-foreground bg-gray-50 dark:bg-gray-800 p-3 rounded">
            <div className="flex items-center space-x-2 mb-2">
              <ImageIcon className="h-4 w-4" />
              <span className="font-medium">Слике:</span>
              <span>Користите подешавања одозго</span>
            </div>
            <div className="flex items-center space-x-2">
              <FileText className="h-4 w-4" />
              <span className="font-medium">Документи:</span>
              <span>Отварају дијалог за подешавање</span>
            </div>
          </div>

          {!disabled && (
            <Button 
              type="button" 
              variant="outline" 
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
            >
              <Upload className="mr-2 h-4 w-4" />
              Изабери фајлове
            </Button>
          )}
        </div>
      </div>

      {/* File Metadata Dialog */}
      <Dialog open={metadataDialog.isOpen} onOpenChange={(open) => {
        if (!open) {
          setMetadataDialog({ isOpen: false, file: null, metadata: { ...globalMetadata } });
        }
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Подешавања документа</DialogTitle>
            <DialogDescription>
              {metadataDialog.file && (
                <>
                  Подешавања за фајл: <strong>{metadataDialog.file.name}</strong>
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="category">Категорија *</Label>
              <Select 
                value={metadataDialog.metadata.category} 
                onValueChange={(value) => setMetadataDialog(prev => ({ 
                  ...prev, 
                  metadata: { ...prev.metadata, category: value as MediaCategory } 
                }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Izaberite kategoriju" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      <div className="flex items-center space-x-2">
                        <category.icon className="h-4 w-4" />
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
                value={metadataDialog.metadata.description || ''}
                onChange={(e) => setMetadataDialog(prev => ({ 
                  ...prev, 
                  metadata: { ...prev.metadata, description: e.target.value } 
                }))}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="isPublic"
                checked={metadataDialog.metadata.isPublic}
                onCheckedChange={(checked) => setMetadataDialog(prev => ({ 
                  ...prev, 
                  metadata: { ...prev.metadata, isPublic: !!checked } 
                }))}
              />
              <Label htmlFor="isPublic" className="flex items-center space-x-2">
                {metadataDialog.metadata.isPublic ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                <span>Јавно доступан документ</span>
              </Label>
            </div>

            {metadataDialog.file && (
              <div className="space-y-2 text-sm text-muted-foreground bg-gray-50 dark:bg-gray-800 p-3 rounded">
                <div className="flex justify-between">
                  <span>Tip:</span>
                  <span>{getFileTypeLabel(metadataDialog.file)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Величина:</span>
                  <span>{formatFileSize(metadataDialog.file.size)}</span>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setMetadataDialog({ isOpen: false, file: null, metadata: { ...globalMetadata } })}
            >
              Откажи
            </Button>
            <Button 
              type="button" 
              onClick={handleMetadataConfirm}
            >
              Учитај документ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Upload Progress */}
      {uploadFiles.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <h4 className="text-sm font-medium mb-4">Учитавање фајлова ({uploadFiles.length})</h4>
            <div className="space-y-3">
              {uploadFiles.map((uploadFile) => (
                <div key={uploadFile.id} className="flex items-center space-x-3">
                  {/* File Preview/Icon */}
                  <div className="flex-shrink-0">
                    {uploadFile.preview ? (
                      <img
                        src={uploadFile.preview}
                        alt={uploadFile.file.name}
                        className="w-12 h-12 object-cover rounded border"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gray-100 rounded border flex items-center justify-center">
                        {getFileIcon(uploadFile.file)}
                      </div>
                    )}
                  </div>

                  {/* File Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {uploadFile.file.name}
                      </p>
                      <div className="flex items-center space-x-2 ml-2">
                        <Badge variant="outline" className="text-xs flex items-center space-x-1">
                          {getCategoryIcon(uploadFile.metadata.category as MediaCategory)}
                          <span>{categories.find(cat => cat.value === uploadFile.metadata.category)?.label}</span>
                        </Badge>
                        <Badge variant={uploadFile.metadata.isPublic ? "default" : "secondary"} className="text-xs">
                          {uploadFile.metadata.isPublic ? (
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
                        <span className="text-xs text-gray-500">
                          {formatFileSize(uploadFile.file.size)}
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                      <div
                        className={cn(
                          "h-2 rounded-full transition-all duration-300",
                          uploadFile.status === 'success' ? 'bg-green-600' :
                          uploadFile.status === 'error' ? 'bg-red-600' :
                          uploadFile.status === 'uploading' ? 'bg-blue-600' : 'bg-gray-400'
                        )}
                        style={{ width: `${uploadFile.progress}%` }}
                      />
                    </div>

                    {/* Status */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1">
                        {uploadFile.status === 'uploading' && (
                          <>
                            <Loader2 className="h-3 w-3 animate-spin text-blue-600" />
                            <span className="text-xs text-blue-600">Учитава се... {Math.round(uploadFile.progress)}%</span>
                          </>
                        )}
                        {uploadFile.status === 'success' && (
                          <>
                            <CheckCircle className="h-3 w-3 text-green-600" />
                            <span className="text-xs text-green-600">Успешно учитано</span>
                          </>
                        )}
                        {uploadFile.status === 'error' && (
                          <>
                            <AlertCircle className="h-3 w-3 text-red-600" />
                            <span className="text-xs text-red-600">
                              {uploadFile.error || 'Грешка при учитавању'}
                            </span>
                          </>
                        )}
                        {uploadFile.status === 'pending' && (
                          <span className="text-xs text-gray-500">У реду за учитавање...</span>
                        )}
                      </div>

                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeUploadFile(uploadFile.id)}
                        className="h-6 w-6 p-0"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>

                    {/* Show metadata info */}
                    {uploadFile.metadata.description && (
                      <div className="mt-1 text-xs text-muted-foreground">
                        {uploadFile.metadata.description}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}