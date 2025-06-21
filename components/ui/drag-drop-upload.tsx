// components/ui/drag-drop-upload.tsx
'use client';

import { useState, useRef, DragEvent, ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  Image as ImageIcon, 
  FileText, 
  File,
  X,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface UploadFile {
  file: File;
  id: string;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
  preview?: string;
}

interface DragDropUploadProps {
  onFileUpload: (file: File) => Promise<void>;
  accept?: string;
  maxSize?: number; // in MB
  multiple?: boolean;
  className?: string;
  disabled?: boolean;
}

export function DragDropUpload({
  onFileUpload,
  accept = 'image/*,.pdf,.doc,.docx,.xls,.xlsx',
  maxSize = 10, // 10MB default
  multiple = true,
  className,
  disabled = false
}: DragDropUploadProps) {
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
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
    if (file.type.startsWith('image/')) return 'Slika';
    if (file.type.includes('pdf')) return 'PDF';
    if (file.type.includes('document')) return 'Dokument';
    if (file.type.includes('spreadsheet')) return 'Tabela';
    return 'Fajl';
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
      return `Fajl je prevelik. Maksimalna veličina je ${maxSize}MB.`;
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
      return `Nepodržan tip fajla. Dozvoljena su sledeća proširenja: ${accept}`;
    }

    return null;
  };

  const createFilePreview = (file: File): string | undefined => {
    if (file.type.startsWith('image/')) {
      return URL.createObjectURL(file);
    }
    return undefined;
  };

  const processFiles = async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    
    for (const file of fileArray) {
      const error:any = validateFile(file);
      const uploadFile: UploadFile = {
        file,
        id: Math.random().toString(36).substr(2, 9),
        progress: 0,
        status: error ? 'error' : 'pending',
        error,
        preview: error ? undefined : createFilePreview(file)
      };

      setUploadFiles(prev => [...prev, uploadFile]);

      if (!error) {
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

      // Actual upload
      await onFileUpload(uploadFile.file);

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
          error: error instanceof Error ? error.message : 'Greška pri učitavanju fajla'
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

  return (
    <div className={cn("space-y-4", className)}>
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
              ? "border-blue-500 bg-blue-50 border-solid" 
              : "border-gray-300 hover:border-gray-400 hover:bg-gray-50 dark:hover:bg-transparent cursor-pointer"
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
            isDragOver ? "bg-blue-100" : "bg-gray-100"
          )}>
            <Upload className={cn(
              "h-8 w-8",
              isDragOver ? "text-blue-600" : "text-gray-400"
            )} />
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-1 dark:text-white">
              {isDragOver ? 'Otpustite fajlove ovde' : 'Prevucite fajlove ovde'}
            </h3>
            <p className="text-sm text-gray-500 mb-2">
              ili kliknite da izaberete fajlove
            </p>
            <p className="text-xs text-gray-400">
              Maksimalna veličina: {maxSize}MB • Dozvoljeni tipovi: {accept}
            </p>
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
              Izaberi fajlove
            </Button>
          )}
        </div>
      </div>

      {/* Upload Progress */}
      {uploadFiles.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <h4 className="text-sm font-medium mb-4">Učitavanje fajlova ({uploadFiles.length})</h4>
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
                        <Badge variant="outline" className="text-xs">
                          {getFileTypeLabel(uploadFile.file)}
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
                            <span className="text-xs text-blue-600">Učitava se... {Math.round(uploadFile.progress)}%</span>
                          </>
                        )}
                        {uploadFile.status === 'success' && (
                          <>
                            <CheckCircle className="h-3 w-3 text-green-600" />
                            <span className="text-xs text-green-600">Uspešno učitano</span>
                          </>
                        )}
                        {uploadFile.status === 'error' && (
                          <>
                            <AlertCircle className="h-3 w-3 text-red-600" />
                            <span className="text-xs text-red-600">
                              {uploadFile.error || 'Greška pri učitavanju'}
                            </span>
                          </>
                        )}
                        {uploadFile.status === 'pending' && (
                          <span className="text-xs text-gray-500">U redu za učitavanje...</span>
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