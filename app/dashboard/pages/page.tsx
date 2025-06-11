// app/dashboard/pages/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
  Clock
} from 'lucide-react';
import Link from 'next/link';
import { pagesApi } from '@/lib/api';
import type { Page, PageStatus } from '@/lib/types';
import { toast } from 'sonner';

interface PageFormData {
  title: string;
  slug: string;
  content: string;
  status: PageStatus;
  template: string;
  sortOrder: number;
}

const PAGE_TEMPLATES = [
  { value: 'default', label: 'Standardna stranica', description: 'Obična stranica sa sadržajem' },
  { value: 'contact', label: 'Kontakt stranica', description: 'Stranica sa kontakt informacijama' },
  { value: 'about', label: 'O nama', description: 'Stranica o instituciji' },
  { value: 'services', label: 'Usluge', description: 'Lista usluga institucije' },
  { value: 'transparency', label: 'Transparentnost', description: 'Dokumenti i transparentnost' }
];

export default function PagesPage() {
  const [pages, setPages] = useState<Page[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<PageStatus | 'all'>('all');
  const [templateFilter, setTemplateFilter] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPage, setEditingPage] = useState<Page | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [pageToDelete, setPageToDelete] = useState<Page | null>(null);

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
      sortOrder: 0
    }
  });

  const watchedTitle = watch('title');

  useEffect(() => {
    fetchPages();
  }, []);

  // Auto-generate slug from title
  useEffect(() => {
    if (watchedTitle && !editingPage) {
      const slug = watchedTitle
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
      // Sort by sortOrder
      const sortedPages = response.sort((a, b) => a.sortOrder - b.sortOrder);
      setPages(sortedPages);
    } catch (error) {
      console.error('Error fetching pages:', error);
      toast.error('Greška pri učitavanju stranica');
    } finally {
      setIsLoading(false);
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
        sortOrder: data.sortOrder
      };

      console.log(pageData)

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
    setValue('content', page.content);
    setValue('status', page.status);
    setValue('template', page.template);
    setValue('sortOrder', page.sortOrder);
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
    } catch (error) {
      console.error('Error deleting page:', error);
      toast.error('Greška pri brisanju stranice');
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

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingPage(null);
    reset();
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
                         page.content.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || page.status === statusFilter;
    const matchesTemplate = templateFilter === 'all' || page.template === templateFilter;
    
    return matchesSearch && matchesStatus && matchesTemplate;
  });

  const publishedCount = pages.filter(page => page.status === 'published').length;
  const draftCount = pages.filter(page => page.status === 'draft').length;

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
            <Button>
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
                      {...register('slug')}
                    />
                    {errors.slug && (
                      <p className="text-sm text-red-600 flex items-center">
                        <AlertCircle className="mr-1 h-3 w-3" />
                        {errors.slug.message}
                      </p>
                    )}
                  </div>
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
                        min: { value: 0, message: 'Redosled mora biti pozitivan broj' }
                      })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content">Sadržaj stranice</Label>
                  <Textarea
                    id="content"
                    placeholder="Napišite sadržaj stranice..."
                    rows={8}
                    {...register('content', { required: 'Sadržaj je obavezan' })}
                  />
                  {errors.content && (
                    <p className="text-sm text-red-600 flex items-center">
                      <AlertCircle className="mr-1 h-3 w-3" />
                      {errors.content.message}
                    </p>
                  )}
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleCloseDialog}>
                  Otkaži
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Čuva se...' : (editingPage ? 'Sačuvaj izmene' : 'Kreiraj stranicu')}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-4">
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
              Statičke stranice
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

      {/* Filters - FIXED: No empty values in SelectItems */}
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
                  <TableHead>Autor</TableHead>
                  <TableHead>Redosled</TableHead>
                  <TableHead>Datum</TableHead>
                  <TableHead className="text-right">Akcije</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPages.map((page) => (
                  <TableRow key={page.id} className="group">
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium group-hover:text-blue-600 transition-colors">
                          {page.title}
                        </div>
                        <div className="text-xs text-muted-foreground flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {getTimeAgo(page.updatedAt)}
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
                    <TableCell colSpan={7} className="text-center py-12">
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
                                <Button className="mt-4">
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
            <div className="py-4 space-y-2 text-sm border rounded-lg p-4 bg-gray-50">
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
                <span className="text-muted-foreground">Redosled:</span>
                <span>{pageToDelete.sortOrder}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Kreirana:</span>
                <span>{formatDate(pageToDelete.createdAt)}</span>
              </div>
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
            >
              Obriši stranicu
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}