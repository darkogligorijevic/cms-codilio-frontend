// app/dashboard/categories/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
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
  Plus, 
  Edit, 
  Trash2, 
  Tag,
  FileText,
  AlertCircle,
  FolderOpen,
  Search,
  Calendar,
  TrendingUp,
  Hash,
  BarChart3,
  ExternalLink
} from 'lucide-react';
import Link from 'next/link';
import { categoriesApi } from '@/lib/api';
import type { Category, CreateCategoryDto, UpdateCategoryDto } from '@/lib/types';
import { toast } from 'sonner';
import { transliterate } from '@/lib/transliterate';

interface CategoryFormData {
  name: string;
  slug: string;
  description: string;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<CategoryFormData>({
    defaultValues: {
      name: '',
      slug: '',
      description: ''
    }
  });

  const watchedName = watch('name');

  useEffect(() => {
    fetchCategories();
  }, []);

  // Auto-generate slug from name
  useEffect(() => {
    if (watchedName && !editingCategory) {
      const slug = transliterate(watchedName)
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      setValue('slug', slug);
    }
  }, [watchedName, editingCategory, setValue]);

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      const response = await categoriesApi.getAll();
      setCategories(response);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Greška pri učitavanju kategorija');
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: CategoryFormData) => {
    try {
      const categoryData = {
        name: data.name,
        slug: data.slug,
        description: data.description || undefined
      };

      if (editingCategory) {
        await categoriesApi.update(editingCategory.id, categoryData as UpdateCategoryDto);
        toast.success('Kategorija je uspešno ažurirana');
      } else {
        await categoriesApi.create(categoryData as CreateCategoryDto);
        toast.success('Kategorija je uspešno kreirana');
      }

      fetchCategories();
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving category:', error);
      toast.error('Greška pri čuvanju kategorije');
    }
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setValue('name', category.name);
    setValue('slug', category.slug);
    setValue('description', category.description || '');
    setIsDialogOpen(true);
  };

  const handleDeleteCategory = async () => {
    if (!categoryToDelete) return;

    try {
      await categoriesApi.delete(categoryToDelete.id);
      toast.success('Kategorija je uspešno obrisana');
      fetchCategories();
      setIsDeleteDialogOpen(false);
      setCategoryToDelete(null);
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error('Greška pri brisanju kategorije. Možda se koristi u objavama.');
    }
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingCategory(null);
    reset();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('sr-RS', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPosts = categories.reduce((sum, cat) => sum + (cat.posts?.length || 0), 0);
  const mostActiveCategory = categories.reduce((max, cat) => 
    (cat.posts?.length || 0) > (max.posts?.length || 0) ? cat : max, 
    categories[0]
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Kategorije</h1>
          <p className="text-muted-foreground">
            Organizujte objave po kategorijama za lakše navigiranje građana
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nova kategorija
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <form onSubmit={handleSubmit(onSubmit)}>
              <DialogHeader>
                <DialogTitle>
                  {editingCategory ? 'Uredi kategoriju' : 'Nova kategorija'}
                </DialogTitle>
                <DialogDescription>
                  {editingCategory 
                    ? 'Uredite informacije o kategoriji' 
                    : 'Kreirajte novu kategoriju za organizovanje objava'
                  }
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Naziv kategorije</Label>
                  <Input
                    id="name"
                    placeholder="Npr. Gradski projekti"
                    {...register('name', { required: 'Naziv je obavezan' })}
                  />
                  {errors.name && (
                    <p className="text-sm text-red-600 flex items-center">
                      <AlertCircle className="mr-1 h-3 w-3" />
                      {errors.name.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slug">URL slug</Label>
                  <Input
                    id="slug"
                    placeholder="gradski-projekti"
                    {...register('slug', { required: 'Slug je obavezan' })}
                  />
                  {errors.slug && (
                    <p className="text-sm text-red-600 flex items-center">
                      <AlertCircle className="mr-1 h-3 w-3" />
                      {errors.slug.message}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    URL: /categories/{watch('slug')}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Opis (opciono)</Label>
                  <Textarea
                    id="description"
                    placeholder="Kratki opis kategorije..."
                    rows={3}
                    {...register('description')}
                  />
                  <p className="text-xs text-muted-foreground">
                    Opis će biti prikazan građanima na stranici kategorije
                  </p>
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleCloseDialog}>
                  Otkaži
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Čuva se...' : (editingCategory ? 'Sačuvaj izmene' : 'Kreiraj kategoriju')}
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
              Ukupno kategorija
            </CardTitle>
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categories.length}</div>
            <p className="text-xs text-muted-foreground">
              Aktivne kategorije
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Kategorizovane objave
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPosts}</div>
            <p className="text-xs text-muted-foreground">
              Objave u kategorijama
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Najaktivnija kategorija
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mostActiveCategory?.name.substring(0, 12) || 'N/A'}
              {mostActiveCategory?.name.length > 12 && '...'}
            </div>
            <p className="text-xs text-muted-foreground">
              {mostActiveCategory?.posts?.length || 0} objava
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Prosek po kategoriji
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {categories.length > 0 ? Math.round(totalPosts / categories.length) : 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Objava po kategoriji
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle>Pretraga kategorija</CardTitle>
          <CardDescription>
            Pronađite kategorije po nazivu, slug-u ili opisu
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Pretraži kategorije..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          {searchTerm && (
            <div className="mt-2 text-sm text-muted-foreground">
              Pronađeno {filteredCategories.length} od {categories.length} kategorija
            </div>
          )}
        </CardContent>
      </Card>

      {/* Categories Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Lista kategorija</CardTitle>
              <CardDescription>
                Ukupno {filteredCategories.length} kategorija
              </CardDescription>
            </div>
            {categories.length > 0 && (
              <Button variant="outline" size="sm" asChild>
                <Link href="/categories" target="_blank">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Pogledaj na sajtu
                </Link>
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="flex items-center space-x-4">
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
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
                  <TableHead>Kategorija</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Opis</TableHead>
                  <TableHead>Broj objava</TableHead>
                  <TableHead>Kreirana</TableHead>
                  <TableHead className="text-right">Akcije</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCategories.map((category) => (
                  <TableRow key={category.id} className="group">
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg">
                          <Tag className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-medium group-hover:text-blue-600 transition-colors">
                            {category.name}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            ID: {category.id}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-mono text-xs">
                        <Hash className="mr-1 h-3 w-3" />
                        {category.slug}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs">
                        {category.description ? (
                          <p className="text-sm text-gray-600 line-clamp-2" title={category.description}>
                            {category.description}
                          </p>
                        ) : (
                          <span className="text-xs text-muted-foreground italic">
                            Nema opisa
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center space-x-1">
                          <FileText className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm font-medium">
                            {category.posts?.length || 0}
                          </span>
                        </div>
                        {(category.posts?.length || 0) > 0 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            asChild
                            className="h-6 px-2 text-xs"
                          >
                            <Link href={`/dashboard/posts?category=${category.id}`}>
                              Pogledaj
                            </Link>
                          </Button>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(category.createdAt)}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditCategory(category)}
                          title="Uredi kategoriju"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setCategoryToDelete(category);
                            setIsDeleteDialogOpen(true);
                          }}
                          title="Obriši kategoriju"
                          className="text-red-600 hover:text-red-800 hover:bg-red-50"
                          disabled={(category.posts?.length || 0) > 0}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredCategories.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12">
                      <div className="text-muted-foreground space-y-2">
                        {searchTerm ? (
                          <>
                            <Search className="mx-auto h-12 w-12 mb-4 opacity-50" />
                            <h3 className="text-lg font-medium">Nema rezultata</h3>
                            <p>Nema kategorija koje odgovaraju pretrazi "{searchTerm}"</p>
                            <Button
                              variant="outline"
                              onClick={() => setSearchTerm('')}
                              className="mt-2"
                            >
                              Očisti pretragu
                            </Button>
                          </>
                        ) : (
                          <>
                            <FolderOpen className="mx-auto h-12 w-12 mb-4 opacity-50" />
                            <h3 className="text-lg font-medium">Nema kategorija</h3>
                            <p>Počnite kreiranjem prve kategorije za organizovanje sadržaja</p>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button className="mt-4">
                                  <Plus className="mr-2 h-4 w-4" />
                                  Kreiraj prvu kategoriju
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="sm:max-w-md">
                                <form onSubmit={handleSubmit(onSubmit)}>
                                  <DialogHeader>
                                    <DialogTitle>Nova kategorija</DialogTitle>
                                    <DialogDescription>
                                      Kreirajte prvu kategoriju za organizovanje objava
                                    </DialogDescription>
                                  </DialogHeader>
                                  
                                  <div className="space-y-4 py-4">
                                    <div className="space-y-2">
                                      <Label htmlFor="name">Naziv kategorije</Label>
                                      <Input
                                        id="name"
                                        placeholder="Npr. Obaveštenja"
                                        {...register('name', { required: 'Naziv je obavezan' })}
                                      />
                                      {errors.name && (
                                        <p className="text-sm text-red-600 flex items-center">
                                          <AlertCircle className="mr-1 h-3 w-3" />
                                          {errors.name.message}
                                        </p>
                                      )}
                                    </div>

                                    <div className="space-y-2">
                                      <Label htmlFor="slug">URL slug</Label>
                                      <Input
                                        id="slug"
                                        placeholder="obavestenja"
                                        {...register('slug', { required: 'Slug je obavezan' })}
                                      />
                                      {errors.slug && (
                                        <p className="text-sm text-red-600 flex items-center">
                                          <AlertCircle className="mr-1 h-3 w-3" />
                                          {errors.slug.message}
                                        </p>
                                      )}
                                    </div>

                                    <div className="space-y-2">
                                      <Label htmlFor="description">Opis (opciono)</Label>
                                      <Textarea
                                        id="description"
                                        placeholder="Kratki opis kategorije..."
                                        rows={3}
                                        {...register('description')}
                                      />
                                    </div>
                                  </div>

                                  <DialogFooter>
                                    <Button type="submit" disabled={isSubmitting}>
                                      {isSubmitting ? 'Kreira se...' : 'Kreiraj kategoriju'}
                                    </Button>
                                  </DialogFooter>
                                </form>
                              </DialogContent>
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

      {/* Popular Categories */}
      {categories.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Najpopularnije kategorije</CardTitle>
            <CardDescription>
              Kategorije sa najviše objava
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {categories
                .sort((a, b) => (b.posts?.length || 0) - (a.posts?.length || 0))
                .slice(0, 5)
                .map((category, index) => (
                  <div key={category.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center justify-center w-6 h-6 bg-blue-100 rounded text-xs font-medium text-blue-600">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-medium">{category.name}</div>
                        {category.description && (
                          <div className="text-xs text-muted-foreground max-w-md truncate">
                            {category.description}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary">
                        {category.posts?.length || 0} objava
                      </Badge>
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/categories/${category.slug}`} target="_blank">
                          <ExternalLink className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Potvrdi brisanje</DialogTitle>
            <DialogDescription>
              Da li ste sigurni da želite da obrišete kategoriju "{categoryToDelete?.name}"?
              {(categoryToDelete?.posts?.length || 0) > 0 && (
                <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <AlertCircle className="inline h-4 w-4 mr-2 text-yellow-600" />
                  <span className="text-sm text-yellow-800">
                    <strong>Upozorenje:</strong> Ova kategorija sadrži {categoryToDelete?.posts?.length} objav(a). 
                    Prvo prebacite objave u drugu kategoriju ili ih označite kao "bez kategorije".
                  </span>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          
          {categoryToDelete && (
            <div className="py-4 space-y-2 text-sm border rounded-lg p-4 bg-gray-50">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Naziv:</span>
                <span className="font-medium">{categoryToDelete.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Slug:</span>
                <Badge variant="outline" className="font-mono text-xs">
                  {categoryToDelete.slug}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Broj objava:</span>
                <span className="font-medium">{categoryToDelete.posts?.length || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Kreirana:</span>
                <span>{formatDate(categoryToDelete.createdAt)}</span>
              </div>
              {categoryToDelete.description && (
                <div className="pt-2 border-t">
                  <span className="text-muted-foreground text-xs">Opis:</span>
                  <p className="text-sm mt-1">{categoryToDelete.description}</p>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setCategoryToDelete(null);
              }}
            >
              Otkaži
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteCategory}
              disabled={(categoryToDelete?.posts?.length || 0) > 0}
            >
              {(categoryToDelete?.posts?.length || 0) > 0 ? 'Kategorija se koristi' : 'Obriši kategoriju'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}