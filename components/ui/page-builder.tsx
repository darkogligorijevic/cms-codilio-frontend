// components/ui/page-builder.tsx - Complete enhanced version with tabs
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  Plus, 
  Edit, 
  Trash2, 
  Copy, 
  Eye, 
  EyeOff,
  GripVertical,
  Save,
  Settings,
  Layout,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { pagesApi } from '@/lib/api';
import { 
  PageSection, 
  SectionType, 
  SectionData, 
  CreatePageSectionDto, 
  UpdatePageSectionDto,
  SectionTypeInfo 
} from '@/lib/types';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { 
  BASE_SECTION_CONFIGS, 
  getLayoutFieldsForSection, 
  COMMON_LAYOUT_FIELDS 
} from '@/lib/section-field-configs';
import { DynamicField } from '@/components/ui/dynamic-field';
import { SectionFieldConfig } from '@/lib/types';

interface PageBuilderProps {
  pageId: number;
  className?: string;
}

export function PageBuilder({ pageId, className }: PageBuilderProps) {
  const [sections, setSections] = useState<PageSection[]>([]);
  const [sectionTypes, setSectionTypes] = useState<SectionTypeInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSection, setSelectedSection] = useState<PageSection | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<Partial<PageSection>>({});

  useEffect(() => {
    fetchSections();
    fetchSectionTypes();
  }, [pageId]);

  const fetchSections = async () => {
    try {
      const data = await pagesApi.getSections(pageId);
      setSections(data);
    } catch (error) {
      console.error('Error fetching sections:', error);
      toast.error('Greška pri učitavanju sekcija');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSectionTypes = async () => {
    try {
      const data = await pagesApi.getSectionTypes();
      setSectionTypes(data);
    } catch (error) {
      console.error('Error fetching section types:', error);
    }
  };

  const handleAddSection = async (data: CreatePageSectionDto) => {
    try {
      const newSection = await pagesApi.createSection(pageId, data);
      setSections(prev => [...prev, newSection]);
      setIsAddDialogOpen(false);
      toast.success('Sekcija je uspešno dodana');
    } catch (error) {
      console.error('Error adding section:', error);
      toast.error('Greška pri dodavanju sekcije');
    }
  };

  const handleUpdateSection = async (sectionId: number, data: UpdatePageSectionDto) => {
    try {
      const updatedSection = await pagesApi.updateSection(sectionId, data);
      setSections(prev => prev.map(s => s.id === sectionId ? updatedSection : s));
      setIsEditDialogOpen(false);
      setSelectedSection(null);
      toast.success('Sekcija je uspešno ažurirana');
    } catch (error) {
      console.error('Error updating section:', error);
      toast.error('Greška pri ažuriranju sekcije');
    }
  };

  const handleDeleteSection = async (sectionId: number) => {
    if (!confirm('Da li ste sigurni da želite da obrišete ovu sekciju?')) return;

    try {
      await pagesApi.deleteSection(sectionId);
      setSections(prev => prev.filter(s => s.id !== sectionId));
      toast.success('Sekcija je uspešno obrisana');
    } catch (error) {
      console.error('Error deleting section:', error);
      toast.error('Greška pri brisanju sekcije');
    }
  };

  const handleDuplicateSection = async (sectionId: number) => {
    try {
      const duplicatedSection = await pagesApi.duplicateSection(sectionId);
      setSections(prev => [...prev, duplicatedSection]);
      toast.success('Sekcija je uspešno duplikovana');
    } catch (error) {
      console.error('Error duplicating section:', error);
      toast.error('Greška pri dupliranju sekcije');
    }
  };

  const handleToggleVisibility = async (sectionId: number) => {
    try {
      const updatedSection = await pagesApi.toggleSectionVisibility(sectionId);
      setSections(prev => prev.map(s => s.id === sectionId ? updatedSection : s));
      toast.success(`Sekcija je ${updatedSection.isVisible ? 'prikazana' : 'sakrivena'}`);
    } catch (error) {
      console.error('Error toggling visibility:', error);
      toast.error('Greška pri menjanju vidljivosti');
    }
  };

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(sections);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update local state immediately
    setSections(items);

    // Update sort orders
    const reorderData = {
      sections: items.map((section, index) => ({
        id: section.id,
        sortOrder: index
      }))
    };

    try {
      await pagesApi.reorderSections(pageId, reorderData);
      toast.success('Redosled sekcija je ažuriran');
    } catch (error) {
      console.error('Error reordering sections:', error);
      toast.error('Greška pri menjanju redosleda');
      // Revert on error
      fetchSections();
    }
  };

  const handleEditSection = (section: PageSection) => {
    setSelectedSection(section);
    setEditingSection({ ...section });
    setIsEditDialogOpen(true);
  };

  const openAddDialog = () => {
    setEditingSection({
      type: SectionType.HERO_STACK,
      name: '',
      data: {},
      isVisible: true,
      sortOrder: sections.length
    });
    setIsAddDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className={cn("space-y-4", className)}>
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Page Builder</h3>
          <p className="text-sm text-muted-foreground">
            Dodajte i uredite sekcije na vašoj stranici
          </p>
        </div>
        <Button onClick={openAddDialog}>
          <Plus className="mr-2 h-4 w-4" />
          Dodaj sekciju
        </Button>
      </div>

      {/* Sections List */}
      {sections.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Layout className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nema sekcija
            </h3>
            <p className="text-gray-500 mb-4">
              Počnite dodavanjem prve sekcije na vašu stranicu
            </p>
            <Button onClick={openAddDialog}>
              <Plus className="mr-2 h-4 w-4" />
              Dodaj prvu sekciju
            </Button>
          </CardContent>
        </Card>
      ) : (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="sections">
            {(provided: any) => (
              <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
                {sections.map((section, index) => (
                  <Draggable 
                    key={section.id} 
                    draggableId={section.id.toString()} 
                    index={index}
                  >
                    {(provided: any, snapshot: any) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={cn(
                          "transition-all",
                          snapshot.isDragging && "rotate-3 shadow-lg"
                        )}
                      >
                        <SectionCard
                          section={section}
                          dragHandleProps={provided.dragHandleProps}
                          onEdit={() => handleEditSection(section)}
                          onDelete={() => handleDeleteSection(section.id)}
                          onDuplicate={() => handleDuplicateSection(section.id)}
                          onToggleVisibility={() => handleToggleVisibility(section.id)}
                        />
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      )}

      {/* Add Section Dialog */}
      <AddSectionDialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onSave={handleAddSection}
        sectionTypes={sectionTypes}
        initialData={editingSection}
      />

      {/* Edit Section Dialog */}
      <EditSectionDialog
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        onSave={(data) => selectedSection && handleUpdateSection(selectedSection.id, data)}
        sectionTypes={sectionTypes}
        section={selectedSection}
        initialData={editingSection}
      />
    </div>
  );
}

// Section Card Component
interface SectionCardProps {
  section: PageSection;
  dragHandleProps: any;
  onEdit: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onToggleVisibility: () => void;
}

function SectionCard({ 
  section, 
  dragHandleProps, 
  onEdit, 
  onDelete, 
  onDuplicate, 
  onToggleVisibility 
}: SectionCardProps) {
  const getSectionTypeLabel = (type: SectionType) => {
    const typeMap = {
      [SectionType.HERO_STACK]: 'Hero Stack',
      [SectionType.HERO_LEFT]: 'Hero Left',
      [SectionType.HERO_IMAGE]: 'Hero Image',
      [SectionType.HERO_VIDEO]: 'Hero Video',
      [SectionType.CARD_TOP]: 'Cards Top',
      [SectionType.CARD_BOTTOM]: 'Cards Bottom',
      [SectionType.CARD_LEFT]: 'Cards Left',
      [SectionType.CARD_RIGHT]: 'Cards Right',
      [SectionType.CONTACT_ONE]: 'Contact Form',
      [SectionType.CONTACT_TWO]: 'Contact Info',
      [SectionType.CTA_ONE]: 'Call to Action',
      [SectionType.LOGOS_ONE]: 'Logos',
      [SectionType.TEAM_ONE]: 'Team',
      [SectionType.CUSTOM_HTML]: 'Custom HTML',
    };
    return typeMap[type] || type;
  };

  return (
    <Card className={cn(
      "transition-all hover:shadow-md",
      !section.isVisible && "opacity-60"
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div 
              {...dragHandleProps} 
              className="cursor-grab hover:cursor-grabbing p-1 hover:bg-gray-100 rounded"
            >
              <GripVertical className="h-4 w-4 text-gray-400" />
            </div>
            <div>
              <CardTitle className="text-base">{section.name}</CardTitle>
              <div className="flex items-center space-x-2 mt-1">
                <Badge variant="outline">{getSectionTypeLabel(section.type)}</Badge>
                {!section.isVisible && (
                  <Badge variant="secondary">Sakrivena</Badge>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleVisibility}
              title={section.isVisible ? 'Sakrij sekciju' : 'Prikaži sekciju'}
            >
              {section.isVisible ? (
                <Eye className="h-4 w-4" />
              ) : (
                <EyeOff className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onEdit}
              title="Uredi sekciju"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onDuplicate}
              title="Dupliraj sekciju"
            >
              <Copy className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onDelete}
              title="Obriši sekciju"
              className="text-red-600 hover:text-red-800"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="text-sm text-muted-foreground">
          {section.data.title && (
            <p><strong>Naslov:</strong> {section.data.title}</p>
          )}
          {section.data.description && (
            <p><strong>Opis:</strong> {section.data.description.substring(0, 100)}...</p>
          )}
          {section.cssClasses && (
            <p><strong>CSS klase:</strong> {section.cssClasses}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Add Section Dialog Component
interface AddSectionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CreatePageSectionDto) => void;
  sectionTypes: SectionTypeInfo[];
  initialData: Partial<PageSection>;
}

function AddSectionDialog({ 
  isOpen, 
  onClose, 
  onSave, 
  sectionTypes, 
  initialData 
}: AddSectionDialogProps) {
  const [formData, setFormData] = useState<CreatePageSectionDto>({
    type: initialData.type || SectionType.HERO_STACK,
    name: initialData.name || '',
    data: initialData.data || {},
    isVisible: initialData.isVisible ?? true,
    sortOrder: initialData.sortOrder || 0
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Dodaj novu sekciju</DialogTitle>
            <DialogDescription>
              Izaberite tip sekcije i unesite osnovne informacije
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="type">Tip sekcije</Label>
              <Select 
                value={formData.type} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, type: value as SectionType }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Izaberite tip sekcije" />
                </SelectTrigger>
                <SelectContent>
                  {sectionTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div>
                        <div className="font-medium">{type.label}</div>
                        <div className="text-xs text-muted-foreground">{type.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Naziv sekcije</Label>
              <Input
                id="name"
                placeholder="Hero sekcija, O nama, itd."
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="isVisible"
                checked={formData.isVisible}
                onCheckedChange={(checked: boolean) => setFormData(prev => ({ ...prev, isVisible: checked }))}
              />
              <Label htmlFor="isVisible">Prikaži sekciju</Label>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                💡 <strong>Tip:</strong> Nakon dodavanja sekcije, moći ćete da uredite njen sadržaj, layout opcije i napredne postavke.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Otkaži
            </Button>
            <Button type="submit" disabled={!formData.name.trim()}>
              Dodaj sekciju
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Edit Section Dialog Component - WITH TABS
interface EditSectionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: UpdatePageSectionDto) => void;
  sectionTypes: SectionTypeInfo[];
  section: PageSection | null;
  initialData: Partial<PageSection>;
}

function EditSectionDialog({ 
  isOpen, 
  onClose, 
  onSave, 
  sectionTypes, 
  section,
  initialData 
}: EditSectionDialogProps) {
  const [formData, setFormData] = useState<UpdatePageSectionDto>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (section) {
      setFormData({
        type: section.type,
        name: section.name,
        data: { ...section.data },
        isVisible: section.isVisible,
        cssClasses: section.cssClasses
      });
    }
  }, [section]);

  // Get field configuration for current section type
  const fieldConfig: SectionFieldConfig | undefined = formData.type ? BASE_SECTION_CONFIGS[formData.type] : undefined;
  const layoutFields = formData.type ? getLayoutFieldsForSection(formData.type) : COMMON_LAYOUT_FIELDS;

  const updateSectionData = (key: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      data: {
        ...prev.data,
        [key]: value
      }
    }));
    
    // Clear error for this field
    if (errors[key]) {
      setErrors(prev => ({ ...prev, [key]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    // Validate name
    if (!formData.name?.trim()) {
      newErrors.name = 'Naziv sekcije je obavezan';
    }
    
    // Validate required fields for section type
    fieldConfig?.required?.forEach(fieldKey => {
      if (!formData.data?.[fieldKey]) {
        const field = fieldConfig.fields.find(f => f.key === fieldKey);
        newErrors[fieldKey] = `${field?.label} je obavezno polje`;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSave(formData);
    }
  };

  if (!section) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Uredi sekciju</DialogTitle>
            <DialogDescription>
              Uredite sadržaj i postavke sekcije
            </DialogDescription>
          </DialogHeader>

          <div className="max-h-[60vh] overflow-y-auto py-4">
            <Tabs defaultValue="content" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="content">Sadržaj</TabsTrigger>
                <TabsTrigger value="layout">Layout & Stil</TabsTrigger>
                <TabsTrigger value="advanced">Napredno</TabsTrigger>
              </TabsList>

              {/* Content Tab */}
              <TabsContent value="content" className="space-y-6 mt-6">
                {/* Basic Settings */}
                <div className="space-y-4">
                  <h4 className="font-medium">Osnovne postavke</h4>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <DynamicField
                      field={{ key: 'name', type: 'text', label: 'Naziv sekcije', required: true }}
                      value={formData.name}
                      onChange={(value) => setFormData(prev => ({ ...prev, name: value }))}
                      error={errors.name}
                    />

                    <div className="space-y-2">
                      <Label>Tip sekcije</Label>
                      <Select 
                        value={formData.type} 
                        onValueChange={(value) => setFormData(prev => ({ ...prev, type: value as SectionType }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {sectionTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={formData.isVisible}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isVisible: checked }))}
                    />
                    <Label>Prikaži sekciju</Label>
                  </div>
                </div>

                {/* Dynamic Content Fields */}
                {fieldConfig && (
                  <div className="space-y-4">
                    <h4 className="font-medium">Sadržaj sekcije</h4>
                    
                    {fieldConfig.fields.map((field) => (
                      <DynamicField
                        key={field.key}
                        field={field}
                        value={formData.data?.[field.key]}
                        onChange={(value) => updateSectionData(field.key, value)}
                        error={errors[field.key]}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Layout & Style Tab */}
              <TabsContent value="layout" className="space-y-6 mt-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Layout opcije</h4>
                  <p className="text-sm text-muted-foreground">
                    Kontrolišite kako se sekcija prikazuje na stranici
                  </p>
                  
                  {layoutFields.map((field) => (
                    <DynamicField
                      key={field.key}
                      field={field}
                      value={formData.data?.[field.key]}
                      onChange={(value) => updateSectionData(field.key, value)}
                      error={errors[field.key]}
                    />
                  ))}
                </div>

                {/* Preview */}
                <div className="space-y-4 border-t pt-4">
                  <h4 className="font-medium">Preview stilizovanja</h4>
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                    <div className="text-sm space-y-2">
                      <div><strong>Layout:</strong> {formData.data?.layout || 'contained'}</div>
                      {formData.data?.backgroundColor && (
                        <div className="flex items-center space-x-2">
                          <strong>Pozadina:</strong>
                          <div 
                            className="w-6 h-6 rounded border"
                            style={{ backgroundColor: formData.data.backgroundColor }}
                          ></div>
                          <span>{formData.data.backgroundColor}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Advanced Tab */}
              <TabsContent value="advanced" className="space-y-6 mt-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Napredne opcije</h4>
                  <p className="text-sm text-muted-foreground">
                    Dodatne opcije za developere i napredne korisnike
                  </p>
                  
                  <div className="space-y-2">
                    <Label>CSS klase (opciono)</Label>
                    <Input
                      placeholder="custom-class another-class"
                      value={formData.cssClasses || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, cssClasses: e.target.value }))}
                    />
                    <p className="text-xs text-muted-foreground">
                      Dodajte custom CSS klase odvojene razmakom
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>JSON data (readonly)</Label>
                    <Textarea
                      value={JSON.stringify(formData.data, null, 2)}
                      readOnly
                      rows={8}
                      className="font-mono text-xs"
                    />
                    <p className="text-xs text-muted-foreground">
                      Preview podataka koji će biti sačuvani
                    </p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Otkaži
            </Button>
            <Button type="submit">
              <Save className="mr-2 h-4 w-4" />
              Sačuvaj
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}