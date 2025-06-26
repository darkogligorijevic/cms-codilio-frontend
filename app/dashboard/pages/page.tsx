// app/dashboard/pages/page.tsx - Updated with Page Builder support
'use client';

import { useEffect, useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
  Search, 
  Edit, 
  Trash2, 
  FileText,
  Eye,
  Calendar,
  User as UserIcon,
  ArrowUpDown,
  ExternalLink,
  Layout,
  BarChart3,
  AlertCircle,
  Clock,
  ChevronRight,
  Folder,
  FolderOpen,
  Settings,
  Code
} from 'lucide-react';
import Link from 'next/link';
import { pagesApi } from '@/lib/api';
import { PageBuilder } from '@/components/ui/page-builder';
import type { Page, PageStatus, AvailableParentPage, UpdatePageBuilderDto } from '@/lib/types';
import { toast } from 'sonner';
import { transliterate } from '@/lib/transliterate';
import { useTheme } from 'next-themes';

interface PageFormData {
  title: string;
  slug: string;
  content: string;
  status: PageStatus;
  template: string;
  sortOrder: number;
  parentId?: number;
  usePageBuilder: boolean;
}

const PAGE_TEMPLATES = [
  { value: 'default', label: 'Standardna stranica', description: 'Obična stranica sa sadržajem' },
  { value: 'contact', label: 'Kontakt stranica', description: 'Stranica sa kontakt informacijama' },
  { value: 'about', label: 'O nama', description: 'Stranica o instituciji' },
  { value: 'services', label: 'Usluge', description: 'Lista usluga institucije' },
  { value: 'organizationalStructure', label: 'Organizaciona struktura', description: "Stablo organizacione strukture"},
  { value: 'transparency', label: 'Transparentnost', description: 'Dokumenti i transparentnost' },
  { value: 'directors', label: 'Direktori', description: 'Cela dokumentacija i biografija direktora'},
  { value: 'gallery', label: 'Galerija', description: 'Prikaz svih galerija sa mogucnoscu pretrage, filtriranja i pregleda pojedinacnih galerija' },
];

export default function PagesPage() {
  const [pages, setPages] = useState<Page[]>([]);
  const [availableParents, setAvailableParents] = useState<AvailableParentPage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<PageStatus | 'all'>('all');
  const [templateFilter, setTemplateFilter] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPage, setEditingPage] = useState<Page | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [pageToDelete, setPageToDelete] = useState<Page | null>(null);
  const [selectedPageForBuilder, setSelectedPageForBuilder] = useState<Page | null>(null);
  const [isPageBuilderOpen, setIsPageBuilderOpen] = useState(false);
  const {theme} = useTheme();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<PageFormData>({
    defaultValues: {
      title: '',
      slug: '',
      content: '',
      status: 'draft' as PageStatus,
      template: 'default',
      sortOrder: 0,
      parentId: undefined,
      usePageBuilder: false
    }
  });

  const watchedTitle = watch('title');
  const watchUsePageBuilder = watch('usePageBuilder');

  useEffect(() => {
    fetchPages();
  }, []);

  // Auto-generate slug from title
  useEffect(() => {
    if (watchedTitle && !editingPage) {
      const slug = transliterate(watchedTitle)
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      setValue('slug', slug);
    }
  }, [watchedTitle, editingPage, setValue]);

  const fetchPages = async () => {
    try {
      setIsLoading(true);
      const response = await pagesApi.getAll();
      
      // Sort pages hierarchically
      const buildHierarchicalOrder = (pages: Page[]): Page[] => {
        const result: Page[] = [];
        const processedIds = new Set<number>();
        
        const addPageWithChildren = (page: Page) => {
          if (processedIds.has(page.id)) return;
          
          result.push(page);
          processedIds.add(page.id);
          
          const children = pages
            .filter(p => p.parentId === page.id)
            .sort((a, b) => a.sortOrder - b.sortOrder);
          
          children.forEach(child => addPageWithChildren(child));
        };
        
        const rootPages = pages
          .filter(page => !page.parentId)
          .sort((a, b) => a.sortOrder - b.sortOrder);
        
        rootPages.forEach(rootPage => addPageWithChildren(rootPage));
        
        return result;
      };
      
      const hierarchicallyOrderedPages = buildHierarchicalOrder(response);
      setPages(hierarchicallyOrderedPages);
    } catch (error) {
      console.error('Error fetching pages:', error);
      toast.error('Greška pri učitavanju stranica');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAvailableParents = async (excludeId?: number) => {
    try {
      const response = await pagesApi.getAvailableParents(excludeId);
      setAvailableParents(response);
    } catch (error) {
      console.error('Error fetching available parents:', error);
      toast.error('Greška pri učitavanju dostupnih stranica');
    }
  };

  const onSubmit: SubmitHandler<PageFormData> = async (data) => {
    try {
      const pageData = {
        title: data.title,
        slug: data.slug,
        content: data.content,
        status: data.status,
        template: data.template,
        sortOrder: data.sortOrder,
        parentId: data.parentId || undefined,
        usePageBuilder: data.usePageBuilder
      };

      console.log('Submitting page data:', pageData);

      if (editingPage) {
        await pagesApi.update(editingPage.id, pageData);
        toast.success('Stranica je uspešno ažurirana');
      } else {
        await pagesApi.create(pageData);
        toast.success('Stranica je uspešno kreirana');
      }

      fetchPages();
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving page:', error);
      toast.error('Greška pri čuvanju stranice');
    }
  };

  const handleEditPage = (page: Page) => {
    setEditingPage(page);
    setValue('title', page.title);
    setValue('slug', page.slug);
    setValue('content', page.content || '');
    setValue('status', page.status);
    setValue('template', page.template);
    setValue('sortOrder', page.sortOrder);
    setValue('parentId', page.parentId || undefined);
    setValue('usePageBuilder', page.usePageBuilder || false);
    fetchAvailableParents(page.id);
    setIsDialogOpen(true);
  };

  const handleDeletePage = async () => {
    if (!pageToDelete) return;

    try {
      await pagesApi.delete(pageToDelete.id);
      toast.success('Stranica je uspešno obrisana');
      fetchPages();
      setIsDeleteDialogOpen(false);
      setPageToDelete(null);
    } catch (error: any) {
      console.error('Error deleting page:', error);
      if (error.response?.status === 400) {
        toast.error('Ne možete obrisati stranicu koja ima podstranice. Prvo obrišite ili premestite podstranice.');
      } else {
        toast.error('Greška pri brisanju stranice');
      }
    }
  };

  const handleToggleStatus = async (page: Page) => {
    try {
      const newStatus: PageStatus = page.status === 'published' ? 'draft' as PageStatus : 'published' as PageStatus;
      await pagesApi.update(page.id, { status: newStatus });
      toast.success(`Stranica je ${newStatus === 'published' ? 'objavljena' : 'prebačena u draft'}`);
      fetchPages();
    } catch (error) {
      console.error('Error updating page status:', error);
      toast.error('Greška pri ažuriranju statusa stranice');
    }
  };

  const handleTogglePageBuilder = async (page: Page) => {
    try {
      const updateData: UpdatePageBuilderDto = {
        usePageBuilder: !page.usePageBuilder,
        content: page.content as string
      };
      
      await pagesApi.updatePageBuilder(page.id, updateData);
      toast.success(`Page Builder je ${!page.usePageBuilder ? 'uključen' : 'isključen'}`);
      fetchPages();
    } catch (error) {
      console.error('Error toggling page builder:', error);
      toast.error('Greška pri prebacivanju Page Builder-a');
    }
  };

  const handleOpenPageBuilder = (page: Page) => {
    setSelectedPageForBuilder(page);
    setIsPageBuilderOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingPage(null);
    reset({
      title: '',
      slug: '',
      content: '',
      status: 'draft' as PageStatus,
      template: 'default',
      sortOrder: 0,
      parentId: undefined,
      usePageBuilder: false
    });
  };

  const handleOpenDialog = () => {
    fetchAvailableParents();
    setIsDialogOpen(true);
  };

  const getStatusBadge = (status: PageStatus) => {
    return status === 'published' ? (
      <Badge className="bg-green-100 text-green-800">
        <Eye className="mr-1 h-3 w-3" />
        Objavljeno
      </Badge>
    ) : (
      <Badge variant="secondary">
        <FileText className="mr-1 h-3 w-3" />
        Draft
      </Badge>
    );
  };

  const getTemplateBadge = (template: string) => {
    const templateInfo = PAGE_TEMPLATES.find(t => t.value === template);
    return (
      <Badge variant="outline" className="text-xs">
        <Layout className="mr-1 h-3 w-3" />
        {templateInfo?.label || template}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('sr-RS', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'pre nekoliko sekundi';
    if (diffInSeconds < 3600) return `pre ${Math.floor(diffInSeconds / 60)} min`;
    if (diffInSeconds < 86400) return `pre ${Math.floor(diffInSeconds / 3600)} h`;
    if (diffInSeconds < 604800) return `pre ${Math.floor(diffInSeconds / 86400)} dana`;
    return formatDate(dateString);
  };

  const filteredPages = pages.filter(page => {
    const matchesSearch = page.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (page.content && page.content.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || page.status === statusFilter;
    const matchesTemplate = templateFilter === 'all' || page.template === templateFilter;
    
    return matchesSearch && matchesStatus && matchesTemplate;
  });

  const publishedCount = pages.filter(page => page.status === 'published').length;
  const draftCount = pages.filter(page => page.status === 'draft').length;
  const parentPagesCount = pages.filter(page => !page.parentId).length;
  const subPagesCount = pages.filter(page => page.parentId).length;
  const pageBuilderCount = pages.filter(page => page.usePageBuilder).length;

  const getPageIndentation = (page: Page) => {
    return page.parentId ? 'pl-8' : '';
  };

  const getPageIcon = (page: Page) => {
    if (page.children && page.children.length > 0) {
      return <FolderOpen className="h-4 w-4 text-blue-600" />;
    } else if (page.parentId) {
      return <FileText className="h-4 w-4 text-gray-500" />;
    } else {
      return <Folder className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Stranice</h1>
          <p className="text-muted-foreground">
            Upravljajte statičkim stranicama vašeg portala
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              variant={theme === "light" ? "default" : "secondaryDefault"}
              onClick={handleOpenDialog}
            >
              <Plus className="mr-2 h-4 w-4" />
              Nova stranica
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl">
            <form onSubmit={handleSubmit(onSubmit)}>
              <DialogHeader>
                <DialogTitle>
                  {editingPage ? 'Uredi stranicu' : 'Nova stranica'}
                </DialogTitle>
                <DialogDescription>
                  {editingPage 
                    ? 'Uredite informacije o stranici' 
                    : 'Kreirajte novu statičku stranicu'
                  }
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Naslov stranice</Label>
                    <Input
                      id="title"
                      placeholder="O našoj instituciji"
                      {...register('title', { required: 'Naslov je obavezan' })}
                    />
                    {errors.title && (
                      <p className="text-sm text-red-600 flex items-center">
                        <AlertCircle className="mr-1 h-3 w-3" />
                        {errors.title.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="slug">URL slug</Label>
                    <Input
                      id="slug"
                      placeholder="o-nama"
                      {...register('slug', { required: 'URL slug je obavezan' })}
                    />
                    {errors.slug && (
                      <p className="text-sm text-red-600 flex items-center">
                        <AlertCircle className="mr-1 h-3 w-3" />
                        {errors.slug.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Nadređena stranica (opciono)</Label>
                  <Select 
                    value={watch('parentId')?.toString() || 'none'} 
                    onValueChange={(value) => setValue('parentId', value === 'none' ? undefined : parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Bez nadređene stranice - glavna stranica" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">
                        <div className="flex items-center">
                          <Folder className="mr-2 h-4 w-4" />
                          Bez nadređene stranice - glavna stranica
                        </div>
                      </SelectItem>
                      {availableParents.map((page) => (
                        <SelectItem key={page.id} value={page.id.toString()}>
                          <div className="flex items-center" style={{ paddingLeft: `${page.level * 16}px` }}>
                            {page.level > 0 && <ChevronRight className="mr-1 h-3 w-3 text-gray-400" />}
                            <FileText className="mr-2 h-4 w-4" />
                            {page.title}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Izaberite nadređenu stranicu da kreirate podstranicu
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select 
                      value={watch('status')} 
                      onValueChange={(value: PageStatus) => setValue('status', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="published">Objavljeno</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Template</Label>
                    <Select 
                      value={watch('template')} 
                      onValueChange={(value) => setValue('template', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PAGE_TEMPLATES.map((template) => (
                          <SelectItem key={template.value} value={template.value}>
                            {template.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sortOrder">Redosled</Label>
                    <Input
                      id="sortOrder"
                      type="number"
                      placeholder="0"
                      {...register('sortOrder', { 
                        required: 'Redosled je obavezan',
                        min: { value: 0, message: 'Redosled mora biti pozitivan broj' },
                        valueAsNumber: true
                      })}
                    />
                    {errors.sortOrder && (
                      <p className="text-sm text-red-600 flex items-center">
                        <AlertCircle className="mr-1 h-3 w-3" />
                        {errors.sortOrder.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Page Builder Toggle */}
                <div className="flex items-center space-x-2 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <Switch
                    id="usePageBuilder"
                    checked={watchUsePageBuilder}
                    onCheckedChange={(checked) => setValue('usePageBuilder', checked)}
                  />
                  <div>
                    <Label htmlFor="usePageBuilder" className="font-medium">
                      Koristi Page Builder
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Omogućava vizuelno uređivanje stranice pomoću sekcija
                    </p>
                  </div>
                </div>

                {/* Content field - only show if page builder is not enabled */}
                {!watchUsePageBuilder && (
                  <div className="space-y-2">
                    <Label htmlFor="content">Sadržaj stranice</Label>
                    <Textarea
                      id="content"
                      placeholder="Napišite sadržaj stranice..."
                      rows={8}
                      {...register('content')}
                    />
                    {errors.content && (
                      <p className="text-sm text-red-600 flex items-center">
                        <AlertCircle className="mr-1 h-3 w-3" />
                        {errors.content.message}
                      </p>
                    )}
                  </div>
                )}

                {watchUsePageBuilder && (
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Layout className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                        Page Builder je uključen
                      </span>
                    </div>
                    <p className="text-xs text-blue-600 dark:text-blue-300 mt-1">
                      Sadržaj stranice ćete urediti preko Page Builder-a nakon što sačuvate stranicu.
                    </p>
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleCloseDialog}>
                  Otkaži
                </Button>
                <Button type="submit" disabled={isSubmitting} variant={theme === "light" ? "default" : "secondaryDefault"}>
                  {isSubmitting ? 'Čuva se...' : (editingPage ? 'Sačuvaj izmene' : 'Kreiraj stranicu')}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Ukupno stranica
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pages.length}</div>
            <p className="text-xs text-muted-foreground">
              {parentPagesCount} glavnih, {subPagesCount} podstranica
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Objavljeno
            </CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{publishedCount}</div>
            <p className="text-xs text-muted-foreground">
              Javno dostupno
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Draft
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{draftCount}</div>
            <p className="text-xs text-muted-foreground">
              U pripremi
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Page Builder
            </CardTitle>
            <Layout className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{pageBuilderCount}</div>
            <p className="text-xs text-muted-foreground">
              Koristi sekcije
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Template tipovi
            </CardTitle>
            <Layout className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{PAGE_TEMPLATES.length}</div>
            <p className="text-xs text-muted-foreground">
              Dostupni templati
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Pretraga i filteri</CardTitle>
          <CardDescription>
            Pronađite stranice pomoću pretrage i filtera
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="search">Pretraga</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Pretraži stranice..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Svi statusi" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Svi statusi</SelectItem>
                  <SelectItem value="published">Objavljeno</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Template</Label>
              <Select value={templateFilter} onValueChange={setTemplateFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Svi templati" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Svi templati</SelectItem>
                  {PAGE_TEMPLATES.map((template) => (
                    <SelectItem key={template.value} value={template.value}>
                      {template.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <div className="text-sm text-muted-foreground">
                Prikazuje se {filteredPages.length} od {pages.length} stranica
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pages Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Lista stranica</CardTitle>
              <CardDescription>
                Ukupno {filteredPages.length} stranica
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="flex items-center space-x-4">
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/6"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/6"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/8"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Stranica</TableHead>
                  <TableHead>Template</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Builder</TableHead>
                  <TableHead>Autor</TableHead>
                  <TableHead>Redosled</TableHead>
                  <TableHead>Datum</TableHead>
                  <TableHead className="text-right">Akcije</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPages.map((page) => (
                  <TableRow key={page.id} className="group">
                    <TableCell className={getPageIndentation(page)}>
                      <div className="space-y-1">
                        <div className="font-medium group-hover:text-blue-600 transition-colors flex items-center">
                          <div className="flex items-center mr-2">
                            {getPageIcon(page)}
                          </div>
                          <span>
                            {page.parentId && (
                              <span className="text-muted-foreground mr-2">└─</span>
                            )}
                            {page.title}
                          </span>
                          {page.children && page.children.length > 0 && (
                            <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                              {page.children.length} podstranica
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {getTimeAgo(page.updatedAt)}
                          {page.parent && (
                            <>
                              <span className="mx-2">•</span>
                              <span>Pod: {page.parent.title}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getTemplateBadge(page.template)}
                    </TableCell>
                    <TableCell>
                      <button
                        onClick={() => handleToggleStatus(page)}
                        className="hover:opacity-80 transition-opacity"
                        title={`Promeni status na ${page.status === 'published' ? 'draft' : 'objavljeno'}`}
                      >
                        {getStatusBadge(page.status)}
                      </button>
                    </TableCell>
                    <TableCell>
                      <button
                        onClick={() => handleTogglePageBuilder(page)}
                        className="hover:opacity-80 transition-opacity"
                        title={`${page.usePageBuilder ? 'Isključi' : 'Uključi'} Page Builder`}
                      >
                        <Badge 
                          variant={page.usePageBuilder ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {page.usePageBuilder ? (
                            <>
                              <Layout className="mr-1 h-3 w-3" />
                              Uključen
                            </>
                          ) : (
                            <>
                              <Code className="mr-1 h-3 w-3" />
                              Isključen
                            </>
                          )}
                        </Badge>
                      </button>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <UserIcon className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm">{page.author.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <ArrowUpDown className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm font-medium">{page.sortOrder}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(page.createdAt)}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-1">
                        {page.usePageBuilder && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenPageBuilder(page)}
                            title="Otvori Page Builder"
                          >
                            <Layout className="h-4 w-4" />
                          </Button>
                        )}
                        {page.status === 'published' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            asChild
                            title="Pogledaj na sajtu"
                          >
                            <Link href={`/${page.slug}`} target="_blank">
                              <ExternalLink className="h-4 w-4" />
                            </Link>
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditPage(page)}
                          title="Uredi stranicu"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setPageToDelete(page);
                            setIsDeleteDialogOpen(true);
                          }}
                          title="Obriši stranicu"
                          className="text-red-600 hover:text-red-800 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredPages.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-12">
                      <div className="text-muted-foreground space-y-2">
                        {searchTerm || statusFilter !== 'all' || templateFilter !== 'all' ? (
                          <>
                            <Search className="mx-auto h-12 w-12 mb-4 opacity-50" />
                            <h3 className="text-lg font-medium">Nema rezultata</h3>
                            <p>Nema stranica koje odgovaraju filterima</p>
                            <Button
                              variant="outline"
                              onClick={() => {
                                setSearchTerm('');
                                setStatusFilter('all');
                                setTemplateFilter('all');
                              }}
                              className="mt-2"
                            >
                              Očisti filtere
                            </Button>
                          </>
                        ) : (
                          <>
                            <FileText className="mx-auto h-12 w-12 mb-4 opacity-50" />
                            <h3 className="text-lg font-medium">Nema stranica</h3>
                            <p>Počnite kreiranjem prve stranice za vašu instituciju</p>
                            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                              <DialogTrigger asChild>
                                <Button className="mt-4" onClick={handleOpenDialog}>
                                  <Plus className="mr-2 h-4 w-4" />
                                  Kreiraj prvu stranicu
                                </Button>
                              </DialogTrigger>
                            </Dialog>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Page Builder Dialog */}
      <Dialog open={isPageBuilderOpen} onOpenChange={setIsPageBuilderOpen}>
        <DialogContent className="sm:max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Layout className="h-5 w-5" />
              <span>Page Builder - {selectedPageForBuilder?.title}</span>
            </DialogTitle>
            <DialogDescription>
              Dodajte i uredite sekcije na vašoj stranici pomoću drag & drop funkcionalnosti
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 overflow-hidden">
            {selectedPageForBuilder && (
              <PageBuilder 
                pageId={selectedPageForBuilder.id}
                className="h-full overflow-y-auto"
              />
            )}
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsPageBuilderOpen(false)}
            >
              Zatvori
            </Button>
            {selectedPageForBuilder?.status === 'published' && (
              <Button asChild>
                <Link 
                  href={`/${selectedPageForBuilder.slug}`} 
                  target="_blank"
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Pregledaj stranicu
                </Link>
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Potvrdi brisanje</DialogTitle>
            <DialogDescription>
              Da li ste sigurni da želite da obrišete stranicu "{pageToDelete?.title}"?
              Ova akcija se ne može poništiti.
            </DialogDescription>
          </DialogHeader>
          
          {pageToDelete && (
            <div className="py-4 space-y-2 text-sm border rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Naslov:</span>
                <span className="font-medium">{pageToDelete.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status:</span>
                {getStatusBadge(pageToDelete.status)}
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Template:</span>
                {getTemplateBadge(pageToDelete.template)}
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Page Builder:</span>
                <Badge variant={pageToDelete.usePageBuilder ? "default" : "secondary"}>
                  {pageToDelete.usePageBuilder ? 'Uključen' : 'Isključen'}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Redosled:</span>
                <span>{pageToDelete.sortOrder}</span>
              </div>
              {pageToDelete.parentId && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tip:</span>
                  <Badge variant="outline">Podstranica</Badge>
                </div>
              )}
              {pageToDelete.children && pageToDelete.children.length > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Podstranice:</span>
                  <Badge variant="destructive">{pageToDelete.children.length} podstranica</Badge>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Kreirana:</span>
                <span>{formatDate(pageToDelete.createdAt)}</span>
              </div>
            </div>
          )}

          {pageToDelete?.children && pageToDelete.children.length > 0 && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="flex items-center space-x-2 text-red-800 dark:text-red-300">
                <AlertCircle className="h-4 w-4" />
                <span className="font-medium">Upozorenje</span>
              </div>
              <p className="text-sm text-red-700 dark:text-red-400 mt-1">
                Ova stranica ima {pageToDelete.children.length} podstranica. 
                Prvo morate obrisati ili premestiti sve podstranice.
              </p>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Otkaži
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeletePage}
              disabled={pageToDelete?.children && pageToDelete.children.length > 0}
            >
              {pageToDelete?.children && pageToDelete.children.length > 0 
                ? 'Ne može se obrisati' 
                : 'Obriši stranicu'
              }
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}