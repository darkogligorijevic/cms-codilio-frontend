// components/ui/rich-text-editor.tsx
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  Type,
  Heading1,
  Heading2,
  Heading3,
  Maximize2,
} from 'lucide-react';
import { useState, useCallback } from 'react';
import { MediaPicker } from '@/components/ui/media-picker';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  className?: string;
}

export function RichTextEditor({
  content,
  onChange,
  placeholder = "Počnite da kucate...",
  className
}: RichTextEditorProps) {
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [textColor, setTextColor] = useState('#000000');
  const [highlightColor, setHighlightColor] = useState('#ffff00');

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
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[200px] p-4',
      },
    },
  });

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
        full: null // null for 100% width
      };
      
      const selectedSize = sizes[size];
      if (selectedSize) {
        editor.chain().focus().updateAttributes('imageResize', {
          width: selectedSize
        }).run();
      } else {
        // For full width, remove width constraint
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

        {/* Alignment */}
        <div className="flex items-center border-r pr-2 mr-2">
          <Button
            type="button"
            variant={editor.isActive({ textAlign: 'left' }) ? 'default' : 'ghost'}
            size="sm"
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            title="Align Left"
          >
            <AlignLeft className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant={editor.isActive({ textAlign: 'center' }) ? 'default' : 'ghost'}
            size="sm"
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            title="Align Center"
          >
            <AlignCenter className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant={editor.isActive({ textAlign: 'right' }) ? 'default' : 'ghost'}
            size="sm"
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            title="Align Right"
          >
            <AlignRight className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant={editor.isActive({ textAlign: 'justify' }) ? 'default' : 'ghost'}
            size="sm"
            onClick={() => editor.chain().focus().setTextAlign('justify').run()}
            title="Justify"
          >
            <AlignJustify className="h-4 w-4" />
          </Button>
        </div>

        {/* Lists */}
        <div className="flex items-center border-r pr-2 mr-2">
          <Button
            type="button"
            variant={editor.isActive('bulletList') ? 'default' : 'ghost'}
            size="sm"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            title="Bullet List"
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant={editor.isActive('orderedList') ? 'default' : 'ghost'}
            size="sm"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            title="Numbered List"
          >
            <ListOrdered className="h-4 w-4" />
          </Button>
        </div>

        {/* Misc */}
        <div className="flex items-center border-r pr-2 mr-2">
          <Button
            type="button"
            variant={editor.isActive('blockquote') ? 'default' : 'ghost'}
            size="sm"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            title="Quote"
          >
            <Quote className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant={editor.isActive('code') ? 'default' : 'ghost'}
            size="sm"
            onClick={() => editor.chain().focus().toggleCode().run()}
            title="Code"
          >
            <Code className="h-4 w-4" />
          </Button>
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

          <Dialog open={isImageDialogOpen} onOpenChange={setIsImageDialogOpen}>
            <DialogTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                title="Add Image"
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

          {/* Image Size Controls - only show when image is selected */}
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

      {/* Editor Content */}
      <div className="min-h-[300px]">
        <EditorContent 
          editor={editor} 
          className="prose max-w-none"
          style={{ 
            minHeight: '300px',
            outline: 'none'
          }}
        />
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