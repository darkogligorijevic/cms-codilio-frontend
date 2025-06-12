// Step 1: Update your existing rich-text-editor.tsx file
// Replace the existing file with this enhanced version

'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextStyle from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import ImageResize from 'tiptap-extension-resize-image';
import Highlight from '@tiptap/extension-highlight';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableHeader from '@tiptap/extension-table-header';
import TableCell from '@tiptap/extension-table-cell';
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
  DialogTrigger,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  Quote,
  Code,
  Undo,
  Redo,
  Link as LinkIcon,
  Unlink,
  Image as ImageIcon,
  Table as TableIcon,
  Palette,
  Highlighter,
  Heading1,
  Heading2,
  Heading3,
  Maximize2,
  Upload,
  Loader2,
  X,
  CheckCircle
} from 'lucide-react';
import { useState, useCallback, DragEvent, useRef } from 'react';
import { MediaPicker } from '@/components/ui/media-picker';
import { mediaApi } from '@/lib/api';
import { toast } from 'sonner';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  className?: string;
}

interface UploadingFile {
  id: string;
  name: string;
  progress: number;
  status: 'uploading' | 'success' | 'error';
}

export function RichTextEditor({
  content,
  onChange,
  placeholder = "Počnite da kucate ili prevucite slike ovde...",
  className
}: RichTextEditorProps) {
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [textColor, setTextColor] = useState('#000000');
  const [highlightColor, setHighlightColor] = useState('#ffff00');
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      TextStyle,
      Color,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 underline hover:text-blue-800',
        },
      }),
      ImageResize.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg',
        },
        allowBase64: true,
      }),
      Highlight.configure({
        multicolor: true,
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: cn(
          'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[200px] p-4',
          'drag-drop-editor' // Add custom class for styling
        ),
      },
      // Handle paste events for images
      handlePaste: (view, event, slice) => {
        const items = Array.from(event.clipboardData?.items || []);
        const imageItems = items.filter(item => item.type.startsWith('image/'));
        
        if (imageItems.length > 0) {
          event.preventDefault();
          imageItems.forEach(item => {
            const file = item.getAsFile();
            if (file) {
              handleFileUpload(file);
            }
          });
          return true;
        }
        return false;
      },
    },
  });

  // File upload handler
  const handleFileUpload = useCallback(async (file: File) => {
    if (!editor) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Možete dodati samo slike u editor');
      return;
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Slika je prevelika. Maksimalna veličina je 10MB.');
      return;
    }

    const uploadId = Math.random().toString(36).substr(2, 9);
    
    // Add to uploading files list
    setUploadingFiles(prev => [...prev, {
      id: uploadId,
      name: file.name,
      progress: 0,
      status: 'uploading'
    }]);

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setUploadingFiles(prev => prev.map(f => 
          f.id === uploadId && f.progress < 90 
            ? { ...f, progress: Math.min(f.progress + Math.random() * 20, 90) }
            : f
        ));
      }, 200);

      // Upload file to media library
      const uploadedMedia = await mediaApi.upload(file);
      
      // Clear progress interval
      clearInterval(progressInterval);
      
      // Update progress to 100%
      setUploadingFiles(prev => prev.map(f => 
        f.id === uploadId ? { ...f, progress: 100, status: 'success' } : f
      ));

      // Get the URL and insert into editor
      const imageUrl = mediaApi.getFileUrl(uploadedMedia.filename);
      
      // Insert image at current cursor position
      editor.chain().focus().setImage({ 
        src: imageUrl,
        alt: uploadedMedia.alt || file.name
      }).run();

      toast.success(`${file.name} je uspešno dodato`);
      
      // Remove from uploading files after 2 seconds
      setTimeout(() => {
        setUploadingFiles(prev => prev.filter(f => f.id !== uploadId));
      }, 2000);
      
    } catch (error) {
      console.error('Error uploading image:', error);
      
      // Update status to error
      setUploadingFiles(prev => prev.map(f => 
        f.id === uploadId ? { ...f, status: 'error' } : f
      ));
      
      toast.error(`Greška pri učitavanju ${file.name}`);
      
      // Remove from uploading files after 3 seconds
      setTimeout(() => {
        setUploadingFiles(prev => prev.filter(f => f.id !== uploadId));
      }, 3000);
    }
  }, [editor]);

  // Drag and Drop handlers
  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Check if dragged items contain images
    const hasImages = Array.from(e.dataTransfer.items).some(item => 
      item.type.startsWith('image/')
    );
    
    if (hasImages) {
      setIsDragOver(true);
    }
  }, []);

  const handleDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Only hide drag overlay if we're actually leaving the editor area
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setIsDragOver(false);
    }
  }, []);

  const handleDrop = useCallback(async (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));

    if (imageFiles.length === 0) {
      toast.error('Možete postaviti samo slike u editor');
      return;
    }

    // Upload all image files
    for (const file of imageFiles) {
      await handleFileUpload(file);
    }
  }, [handleFileUpload]);

  // Handle file input change
  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach(handleFileUpload);
    
    // Clear input
    if (e.target) {
      e.target.value = '';
    }
  }, [handleFileUpload]);

  // Other editor functions (same as before)
  const addLink = useCallback(() => {
    if (linkUrl && editor) {
      editor.chain().focus().extendMarkRange('link').setLink({ href: linkUrl }).run();
      setLinkUrl('');
      setIsLinkDialogOpen(false);
    }
  }, [editor, linkUrl]);

  const addImageFromUrl = useCallback(() => {
    if (imageUrl && editor) {
      editor.chain().focus().setImage({ 
        src: imageUrl
      }).run();
      setImageUrl('');
      setIsImageDialogOpen(false);
    }
  }, [editor, imageUrl]);

  const addImageFromMedia = useCallback((url: string) => {
    if (editor) {
      editor.chain().focus().setImage({ 
        src: url
      }).run();
    }
  }, [editor]);

  const insertTable = useCallback(() => {
    if (editor) {
      editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
    }
  }, [editor]);

  const setColor = useCallback((color: string) => {
    if (editor) {
      editor.chain().focus().setColor(color).run();
    }
  }, [editor]);

  const setHighlight = useCallback((color: string) => {
    if (editor) {
      editor.chain().focus().setHighlight({ color }).run();
    }
  }, [editor]);

  const setImageSize = useCallback((size: 'small' | 'medium' | 'large' | 'full') => {
    if (editor && editor.isActive('imageResize')) {
      const sizes = {
        small: 200,
        medium: 400, 
        large: 600,
        full: null
      };
      
      const selectedSize = sizes[size];
      if (selectedSize) {
        editor.chain().focus().updateAttributes('imageResize', {
          width: selectedSize
        }).run();
      } else {
        editor.chain().focus().updateAttributes('imageResize', {
          width: null,
          style: 'width: 100%;'
        }).run();
      }
    }
  }, [editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className={cn("border rounded-lg", className)}>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileInputChange}
        className="hidden"
      />

      {/* Toolbar */}
      <div className="border-b p-2 flex flex-wrap gap-1">
        {/* Text Formatting */}
        <div className="flex items-center border-r pr-2 mr-2">
          <Button
            type="button"
            variant={editor.isActive('bold') ? 'default' : 'ghost'}
            size="sm"
            onClick={() => editor.chain().focus().toggleBold().run()}
            title="Bold"
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant={editor.isActive('italic') ? 'default' : 'ghost'}
            size="sm"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            title="Italic"
          >
            <Italic className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant={editor.isActive('underline') ? 'default' : 'ghost'}
            size="sm"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            title="Underline"
          >
            <UnderlineIcon className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant={editor.isActive('strike') ? 'default' : 'ghost'}
            size="sm"
            onClick={() => editor.chain().focus().toggleStrike().run()}
            title="Strikethrough"
          >
            <Strikethrough className="h-4 w-4" />
          </Button>
        </div>

        {/* Headings */}
        <div className="flex items-center border-r pr-2 mr-2">
          <Button
            type="button"
            variant={editor.isActive('heading', { level: 1 }) ? 'default' : 'ghost'}
            size="sm"
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            title="Heading 1"
          >
            <Heading1 className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant={editor.isActive('heading', { level: 2 }) ? 'default' : 'ghost'}
            size="sm"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            title="Heading 2"
          >
            <Heading2 className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant={editor.isActive('heading', { level: 3 }) ? 'default' : 'ghost'}
            size="sm"
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            title="Heading 3"
          >
            <Heading3 className="h-4 w-4" />
          </Button>
        </div>

        {/* Colors */}
        <div className="flex items-center border-r pr-2 mr-2">
          <div className="flex items-center space-x-1">
            <Palette className="h-4 w-4 text-gray-500" />
            <input
              type="color"
              value={textColor}
              onChange={(e) => {
                setTextColor(e.target.value);
                setColor(e.target.value);
              }}
              className="w-8 h-8 rounded cursor-pointer"
              title="Text Color"
            />
          </div>
          <div className="flex items-center space-x-1">
            <Highlighter className="h-4 w-4 text-gray-500" />
            <input
              type="color"
              value={highlightColor}
              onChange={(e) => {
                setHighlightColor(e.target.value);
                setHighlight(e.target.value);
              }}
              className="w-8 h-8 rounded cursor-pointer"
              title="Highlight Color"
            />
          </div>
        </div>

        {/* Media & Links */}
        <div className="flex items-center border-r pr-2 mr-2">
          <Dialog open={isLinkDialogOpen} onOpenChange={setIsLinkDialogOpen}>
            <DialogTrigger asChild>
              <Button
                type="button"
                variant={editor.isActive('link') ? 'default' : 'ghost'}
                size="sm"
                title="Add Link"
              >
                <LinkIcon className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Dodaj link</DialogTitle>
                <DialogDescription>
                  Unesite URL koji želite da linkujete
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-2">
                <Label htmlFor="link-url">URL</Label>
                <Input
                  id="link-url"
                  placeholder="https://example.com"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsLinkDialogOpen(false)}>
                  Otkaži
                </Button>
                <Button type="button" onClick={addLink}>
                  Dodaj link
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().unsetLink().run()}
            disabled={!editor.isActive('link')}
            title="Remove Link"
          >
            <Unlink className="h-4 w-4" />
          </Button>

          {/* Image Upload Button */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            title="Upload Image"
          >
            <Upload className="h-4 w-4" />
          </Button>

          <Dialog open={isImageDialogOpen} onOpenChange={setIsImageDialogOpen}>
            <DialogTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                title="Add Image URL"
              >
                <ImageIcon className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Dodaj sliku</DialogTitle>
                <DialogDescription>
                  Unesite URL slike ili izaberite iz medija
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="image-url">URL slike</Label>
                  <Input
                    id="image-url"
                    placeholder="https://example.com/image.jpg"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                  />
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-2">ili</p>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsImageDialogOpen(false);
                      setIsMediaPickerOpen(true);
                    }}
                    className="w-full"
                  >
                    <ImageIcon className="mr-2 h-4 w-4" />
                    Izaberi iz medija
                  </Button>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsImageDialogOpen(false)}>
                  Otkaži
                </Button>
                <Button type="button" onClick={addImageFromUrl} disabled={!imageUrl}>
                  Dodaj sliku
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={insertTable}
            title="Insert Table"
          >
            <TableIcon className="h-4 w-4" />
          </Button>

          {/* Image Size Controls */}
          {editor.isActive('imageResize') && (
            <>
              <div className="h-4 w-px bg-gray-300 mx-1" />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setImageSize('small')}
                title="Small Image (200px)"
              >
                <Maximize2 className="h-3 w-3" />
                <span className="text-xs ml-1">S</span>
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setImageSize('medium')}
                title="Medium Image (400px)"
              >
                <Maximize2 className="h-4 w-4" />
                <span className="text-xs ml-1">M</span>
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setImageSize('large')}
                title="Large Image (600px)"
              >
                <Maximize2 className="h-5 w-5" />
                <span className="text-xs ml-1">L</span>
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setImageSize('full')}
                title="Full Width"
              >
                <Maximize2 className="h-4 w-4" />
                <span className="text-xs ml-1">100%</span>
              </Button>
            </>
          )}
        </div>

        {/* Undo/Redo */}
        <div className="flex items-center">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            title="Undo"
          >
            <Undo className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            title="Redo"
          >
            <Redo className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Upload Progress Display */}
      {uploadingFiles.length > 0 && (
        <div className="border-b p-3 bg-gray-50">
          <div className="space-y-2">
            {uploadingFiles.map((file) => (
              <div key={file.id} className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  {file.status === 'uploading' && (
                    <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                  )}
                  {file.status === 'success' && (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  )}
                  {file.status === 'error' && (
                    <X className="h-4 w-4 text-red-600" />
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium truncate">{file.name}</span>
                    <span className="text-xs text-gray-500">
                      {file.status === 'uploading' && `${Math.round(file.progress)}%`}
                      {file.status === 'success' && 'Završeno'}
                      {file.status === 'error' && 'Greška'}
                    </span>
                  </div>
                  
                  {file.status === 'uploading' && (
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div
                        className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${file.progress}%` }}
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Editor Content with Drag & Drop */}
      <div 
        className={cn(
          "relative min-h-[300px]",
          isDragOver && "bg-blue-50"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <EditorContent 
          editor={editor} 
          className="prose max-w-none"
          style={{ 
            minHeight: '300px',
            outline: 'none'
          }}
        />
        
        {/* Drag Overlay */}
        {isDragOver && (
          <div className="absolute inset-0 bg-blue-100 bg-opacity-90 flex items-center justify-center border-2 border-dashed border-blue-400 rounded-b-lg z-10">
            <div className="text-center p-6">
              <Upload className="h-12 w-12 text-blue-600 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-blue-800 mb-1">
                Otpustite slike ovde
              </h3>
              <p className="text-blue-600 text-sm">
                Slike će biti automatski učitane i ubačene u tekst
              </p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!content && !isDragOver && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center text-gray-400">
              <ImageIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">{placeholder}</p>
            </div>
          </div>
        )}
      </div>

      {/* Media Picker */}
      <MediaPicker
        isOpen={isMediaPickerOpen}
        onClose={() => setIsMediaPickerOpen(false)}
        onSelect={addImageFromMedia}
        title="Izaberite sliku"
        description="Izaberite sliku iz medijske biblioteke"
        allowedTypes={['image/*']}
      />
    </div>
  );
}