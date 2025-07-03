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
  { value: 'default', label: 'Стандардна страница', description: 'Обична страница са садржајем' },
  { value: 'contact', label: 'Контакт страница', description: 'Страница са контакт информацијама' },
  { value: 'about', label: 'О нама', description: 'Страница о институцији' },
  { value: 'services', label: 'Услуге', description: 'Листа услуга институције' },
  { value: 'organizationalStructure', label: 'Организациона структура', description: "Стабло организационе структуре"},
  { value: 'transparency', label: 'Транспарентност', description: 'Документи и транспарентност' },
  { value: 'directors', label: 'Директори', description: 'Цела документација и биографија директора'},
  { value: 'gallery', label: 'Галерија', description: 'Приказ свих галерија са могућношћу претраге, филтрирања и прегледа појединачних галерија' },
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
      toast.error('Грешка при учитавању страница');
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
      toast.error('Грешка при учитавању доступних страница');
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
        toast.success('Страница је успешно ажурирана');
      } else {
        await pagesApi.create(pageData);
        toast.success('Страница је успешно креирана');
      }

      fetchPages();
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving page:', error);
      toast.error('Грешка при чувању странице');
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
      toast.success('Страница је успешно обрисана');
      fetchPages();
      setIsDeleteDialogOpen(false);
      setPageToDelete(null);
    } catch (error: any) {
      console.error('Error deleting page:', error);
      if (error.response?.status === 400) {
        toast.error('Не можете обрисати страницу која има подстранице. Прво обришите или преместите подстранице.');
      } else {
        toast.error('Грешка при брисању странице');
      }
    }
  };

  const handleToggleStatus = async (page: Page) => {
    try {
      const newStatus: PageStatus = page.status === 'published' ? 'draft' as PageStatus : 'published' as PageStatus;
      await pagesApi.update(page.id, { status: newStatus });
      toast.success(`Страница је ${newStatus === 'published' ? 'објављена' : 'пребачена у draft'}`);
      fetchPages();
    } catch (error) {
      console.error('Error updating page status:', error);
      toast.error('Грешка при ажурирању статуса странице');
    }
  };

  const handleTogglePageBuilder = async (page: Page) => {
    try {
      const updateData: UpdatePageBuilderDto = {
        usePageBuilder: !page.usePageBuilder,
        content: page.content as string
      };
      
      await pagesApi.updatePageBuilder(page.id, updateData);
      toast.success(`Page Builder је ${!page.usePageBuilder ? 'укључен' : 'искључен'}`);
      fetchPages();
    } catch (error) {
      console.error('Error toggling page builder:', error);
      toast.error('Грешка при пребацивању Page Builder-а');
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
        Објављено
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
    
    if (diffInSeconds < 60) return 'пре неколико секунди';
    if (diffInSeconds < 3600) return `пре ${Math.floor(diffInSeconds / 60)} мин`;
    if (diffInSeconds < 86400) return `пре ${Math.floor(diffInSeconds / 3600)} ч`;
    if (diffInSeconds < 604800) return `пре ${Math.floor(diffInSeconds / 86400)} дана`;
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
          <h1 className="text-3xl font-bold tracking-tight">Странице</h1>
          <p className="text-muted-foreground">
            Управљајте статичким страницама вашег портала
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              variant={theme === "light" ? "default" : "secondaryDefault"}
              onClick={handleOpenDialog}
            >
              <Plus className="mr-2 h-4 w-4" />
              Нова страница
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl">
            <form onSubmit={handleSubmit(onSubmit)}>
              <DialogHeader>
                <DialogTitle>
                  {editingPage ? 'Уреди страницу' : 'Нова страница'}
                </DialogTitle>
                <DialogDescription>
                  {editingPage 
                    ? 'Уредите информације о страници' 
                    : 'Креирајте нову статичку страницу'
                  }
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Наслов странице</Label>
                    <Input
                      id="title"
                      placeholder="О нашој институцији"
                      {...register('title', { required: 'Наслов је обавезан' })}
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
                      {...register('slug', { required: 'URL slug је обавезан' })}
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
                  <Label>Надређена страница (опционо)</Label>
                  <Select 
                    value={watch('parentId')?.toString() || 'none'} 
                    onValueChange={(value) => setValue('parentId', value === 'none' ? undefined : parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Без надређене странице - главна страница" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">
                        <div className="flex items-center">
                          <Folder className="mr-2 h-4 w-4" />
                          Без надређене странице - главна страница
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
                    Изаберите надређену страницу да креирате подстраницу
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Статус</Label>
                    <Select 
                      value={watch('status')} 
                      onValueChange={(value: PageStatus) => setValue('status', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="published">Објављено</SelectItem>
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
                    <Label htmlFor="sortOrder">Редослед</Label>
                    <Input
                      id="sortOrder"
                      type="number"
                      placeholder="0"
                      {...register('sortOrder', { 
                        required: 'Редослед је обавезан',
                        min: { value: 0, message: 'Редослед мора бити позитиван број' },
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
                      Користи Page Builder
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Омогућава визуелно уређивање странице помоћу секција
                    </p>
                  </div>
                </div>

                {/* Content field - only show if page builder is not enabled */}
                {!watchUsePageBuilder && (
                  <div className="space-y-2">
                    <Label htmlFor="content">Садржај странице</Label>
                    <Textarea
                      id="content"
                      placeholder="Напишите садржај странице..."
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
                        Page Builder је укључен
                      </span>
                    </div>
                    <p className="text-xs text-blue-600 dark:text-blue-300 mt-1">
                      Садржај странице ћете уредити преко Page Builder-а након што сачувате страницу.
                    </p>
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleCloseDialog}>
                  Откажи
                </Button>
                <Button type="submit" disabled={isSubmitting} variant={theme === "light" ? "default" : "secondaryDefault"}>
                  {isSubmitting ? 'Чува се...' : (editingPage ? 'Сачувај измене' : 'Креирај страницу')}
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
              Укупно страница
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pages.length}</div>
            <p className="text-xs text-muted-foreground">
              {parentPagesCount} главних, {subPagesCount} подстраница
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Објављено
            </CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{publishedCount}</div>
            <p className="text-xs text-muted-foreground">
              Јавно доступно
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
              У припреми
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
              Користи секције
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Template типови
            </CardTitle>
            <Layout className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{PAGE_TEMPLATES.length}</div>
            <p className="text-xs text-muted-foreground">
              Доступни темплати
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Претрага и филтери</CardTitle>
          <CardDescription>
            Пронађите странице помоћу претраге и филтера
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="search">Претрага</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Претражи странице..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Статус</Label>
              <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Сви статуси" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Сви статуси</SelectItem>
                  <SelectItem value="published">Објављено</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Template</Label>
              <Select value={templateFilter} onValueChange={setTemplateFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Сви темплати" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Сви темплати</SelectItem>
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
                Приказује се {filteredPages.length} од {pages.length} страница
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
              <CardTitle>Листа страница</CardTitle>
              <CardDescription>
                Укупно {filteredPages.length} страница
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
                  <TableHead>Страница</TableHead>
                  <TableHead>Template</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead>Builder</TableHead>
                  <TableHead>Аутор</TableHead>
                  <TableHead>Редослед</TableHead>
                  <TableHead>Датум</TableHead>
                  <TableHead className="text-right">Акције</TableHead>
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
                              {page.children.length} подстраница
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {getTimeAgo(page.updatedAt)}
                          {page.parent && (
                            <>
                              <span className="mx-2">•</span>
                              <span>Под: {page.parent.title}</span>
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
                        title={`Промени статус на ${page.status === 'published' ? 'draft' : 'објављено'}`}
                      >
                        {getStatusBadge(page.status)}
                      </button>
                    </TableCell>
                    <TableCell>
                      <button
                        onClick={() => handleTogglePageBuilder(page)}
                        className="hover:opacity-80 transition-opacity"
                        title={`${page.usePageBuilder ? 'Искључи' : 'Укључи'} Page Builder`}
                      >
                        <Badge 
                          variant={page.usePageBuilder ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {page.usePageBuilder ? (
                            <>
                              <Layout className="mr-1 h-3 w-3" />
                              Укључен
                            </>
                          ) : (
                            <>
                              <Code className="mr-1 h-3 w-3" />
                              Искључен
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
                            title="Отвори Page Builder"
                          >
                            <Layout className="h-4 w-4" />
                          </Button>
                        )}
                        {page.status === 'published' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            asChild
                            title="Погледај на сајту"
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
                          title="Уреди страницу"
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
                          title="Обриши страницу"
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
                            <h3 className="text-lg font-medium">Нема резултата</h3>
                            <p>Нема страница које одговарају филтерима</p>
                            <Button
                              variant="outline"
                              onClick={() => {
                                setSearchTerm('');
                                setStatusFilter('all');
                                setTemplateFilter('all');
                              }}
                              className="mt-2"
                            >
                              Очисти филтере
                            </Button>
                          </>
                        ) : (
                          <>
                            <FileText className="mx-auto h-12 w-12 mb-4 opacity-50" />
                            <h3 className="text-lg font-medium">Нема страница</h3>
                            <p>Почните креирањем прве странице за вашу институцију</p>
                            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                              <DialogTrigger asChild>
                                <Button className="mt-4" onClick={handleOpenDialog}>
                                  <Plus className="mr-2 h-4 w-4" />
                                  Креирај прву страницу
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
              Додајте и уредите секције на вашој страници помоћу drag & drop функционалности
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
              Затвори
            </Button>
            {selectedPageForBuilder?.status === 'published' && (
              <Button asChild>
                <Link 
                  href={`/${selectedPageForBuilder.slug}`} 
                  target="_blank"
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Прегледај страницу
                </Link>
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className='max-w-4xl'>
          <DialogHeader>
            <DialogTitle>Потврди брисање</DialogTitle>
            <DialogDescription>
              Да ли сте сигурни да желите да обришете страницу "{pageToDelete?.title}"?
              Ова акција се не може поништити.
            </DialogDescription>
          </DialogHeader>
          
          {pageToDelete && (
            <div className="py-4 space-y-2 text-sm border rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Наслов:</span>
                <span className="font-medium">{pageToDelete.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Статус:</span>
                {getStatusBadge(pageToDelete.status)}
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Template:</span>
                {getTemplateBadge(pageToDelete.template)}
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Page Builder:</span>
                <Badge variant={pageToDelete.usePageBuilder ? "default" : "secondary"}>
                  {pageToDelete.usePageBuilder ? 'Укључен' : 'Искључен'}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Редослед:</span>
                <span>{pageToDelete.sortOrder}</span>
              </div>
              {pageToDelete.parentId && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Тип:</span>
                  <Badge variant="outline">Подстраница</Badge>
                </div>
              )}
              {pageToDelete.children && pageToDelete.children.length > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Подстранице:</span>
                  <Badge variant="destructive">{pageToDelete.children.length} подстраница</Badge>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Креирана:</span>
                <span>{formatDate(pageToDelete.createdAt)}</span>
              </div>
            </div>
          )}

          {pageToDelete?.children && pageToDelete.children.length > 0 && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="flex items-center space-x-2 text-red-800 dark:text-red-300">
                <AlertCircle className="h-4 w-4" />
                <span className="font-medium">Упозорење</span>
              </div>
              <p className="text-sm text-red-700 dark:text-red-400 mt-1">
                Ова страница има {pageToDelete.children.length} подстраница. 
                Прво морате обрисати или преместити све подстранице.
              </p>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Откажи
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeletePage}
              disabled={pageToDelete?.children && pageToDelete.children.length > 0}
            >
              {pageToDelete?.children && pageToDelete.children.length > 0 
                ? 'Не може се обрисати' 
                : 'Обриши страницу'
              }
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}