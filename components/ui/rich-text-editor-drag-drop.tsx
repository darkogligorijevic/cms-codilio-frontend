// components/ui/rich-text-editor-drag-drop.tsx
// Enhancement for the existing RichTextEditor to support drag and drop for images
'use client';

import { useCallback, DragEvent } from 'react';
import { Editor } from '@tiptap/react';
import { mediaApi } from '@/lib/api';
import { toast } from 'sonner';

interface RichTextDragDropProps {
  editor: Editor | null;
  children: React.ReactNode;
  className?: string;
}

export function RichTextDragDrop({ editor, children, className }: RichTextDragDropProps) {
  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(async (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!editor) return;

    const files = Array.from(e.dataTransfer.files);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));

    if (imageFiles.length === 0) {
      toast.error('Možete postaviti samo slike u editor');
      return;
    }

    for (const file of imageFiles) {
      try {
        // Show uploading toast
        const uploadingToast = toast.loading(`Učitava se ${file.name}...`);
        
        // Upload file to media library
        const uploadedMedia = await mediaApi.upload(file);
        
        // Get the URL and insert into editor
        const imageUrl = mediaApi.getFileUrl(uploadedMedia.filename);
        
        // Insert image at cursor position
        editor.chain().focus().setImage({ 
          src: imageUrl,
          alt: uploadedMedia.alt || file.name
        }).run();

        // Dismiss loading toast and show success
        toast.dismiss(uploadingToast);
        toast.success(`${file.name} je uspešno dodato`);
        
      } catch (error) {
        console.error('Error uploading image:', error);
        toast.error(`Greška pri učitavanju ${file.name}`);
      }
    }
  }, [editor]);

  return (
    <div 
      className={className}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {children}
    </div>
  );
}

// Hook to add drag and drop functionality to existing RichTextEditor
export function useRichTextDragDrop(editor: Editor | null) {
  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Add visual feedback
    const editorElement = e.currentTarget as HTMLElement;
    editorElement.classList.add('drag-over');
  }, []);

  const handleDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Remove visual feedback
    const editorElement = e.currentTarget as HTMLElement;
    editorElement.classList.remove('drag-over');
  }, []);

  const handleDrop = useCallback(async (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Remove visual feedback
    const editorElement = e.currentTarget as HTMLElement;
    editorElement.classList.remove('drag-over');

    if (!editor) return;

    const files = Array.from(e.dataTransfer.files);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));

    if (imageFiles.length === 0) {
      toast.error('Možete postaviti samo slike u editor');
      return;
    }

    for (const file of imageFiles) {
      try {
        // Show uploading toast
        const uploadingToast = toast.loading(`Učitava se ${file.name}...`);
        
        // Upload file to media library
        const uploadedMedia = await mediaApi.upload(file);
        
        // Get the URL and insert into editor
        const imageUrl = mediaApi.getFileUrl(uploadedMedia.filename);
        
        // Insert image at cursor position
        editor.chain().focus().setImage({ 
          src: imageUrl,
          alt: uploadedMedia.alt || file.name
        }).run();

        // Dismiss loading toast and show success
        toast.dismiss(uploadingToast);
        toast.success(`${file.name} je uspešno dodato`);
        
      } catch (error) {
        console.error('Error uploading image:', error);
        toast.error(`Greška pri učitavanju ${file.name}`);
      }
    }
  }, [editor]);

  return {
    handleDragOver,
    handleDragLeave,
    handleDrop
  };
}