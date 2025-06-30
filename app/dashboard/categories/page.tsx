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
import { useTheme } from 'next-themes';

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
  const {theme} = useTheme();

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
      toast.error('Грешка при учитавању категорија');
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
        toast.success('Категорија је успешно ажурирана');
      } else {
        await categoriesApi.create(categoryData as CreateCategoryDto);
        toast.success('Категорија је успешно креирана');
      }

      fetchCategories();
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving category:', error);
      toast.error('Грешка при чувању категорије');
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
      toast.success('Категорија је успешно обрисана');
      fetchCategories();
      setIsDeleteDialogOpen(false);
      setCategoryToDelete(null);
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error('Грешка при брисању категорије. Можда се користи у објавама.');
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
          <h1 className="text-3xl font-bold tracking-tight">Категорије</h1>
          <p className="text-muted-foreground">
            Организујте објаве по категоријама за лакше навигирање грађана
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant={theme === "light" ? "default" : "secondaryDefault"}>
              <Plus className="mr-2 h-4 w-4" />
              Нова категорија
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <form onSubmit={handleSubmit(onSubmit)}>
              <DialogHeader>
                <DialogTitle>
                  {editingCategory ? 'Уреди категорију' : 'Нова категорија'}
                </DialogTitle>
                <DialogDescription>
                  {editingCategory 
                    ? 'Уредите информације о категорији' 
                    : 'Креирајте нову категорију за организовање објава'
                  }
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Назив категорије</Label>
                  <Input
                    id="name"
                    placeholder="Нпр. Градски пројекти"
                    {...register('name', { required: 'Назив је обавезан' })}
                  />
                  {errors.name && (
                    <p className="text-sm text-red-600 flex items-center">
                      <AlertCircle className="mr-1 h-3 w-3" />
                      {errors.name.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slug">УРЛ слуг</Label>
                  <Input
                    id="slug"
                    placeholder="gradski-projekti"
                    {...register('slug', { required: 'Слуг је обавезан' })}
                  />
                  {errors.slug && (
                    <p className="text-sm text-red-600 flex items-center">
                      <AlertCircle className="mr-1 h-3 w-3" />
                      {errors.slug.message}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    УРЛ: /categories/{watch('slug')}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Опис (опционо)</Label>
                  <Textarea
                    id="description"
                    placeholder="Кратки опис категорије..."
                    rows={3}
                    {...register('description')}
                  />
                  <p className="text-xs text-muted-foreground">
                    Опис ће бити приказан грађанима на страници категорије
                  </p>
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleCloseDialog}>
                  Откажи
                </Button>
                <Button type="submit" disabled={isSubmitting} variant={theme === "light" ? "default" : "secondaryDefault"}>
                  {isSubmitting ? 'Чува се...' : (editingCategory ? 'Сачувај измене' : 'Креирај категорију')}
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
              Укупно категорија
            </CardTitle>
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categories.length}</div>
            <p className="text-xs text-muted-foreground">
              Активне категорије
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Категоризоване објаве
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPosts}</div>
            <p className="text-xs text-muted-foreground">
              Објаве у категоријама
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Најактивнија категорија
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mostActiveCategory?.name.substring(0, 12) || 'Н/А'}
              {mostActiveCategory?.name.length > 12 && '...'}
            </div>
            <p className="text-xs text-muted-foreground">
              {mostActiveCategory?.posts?.length || 0} објава
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Просек по категорији
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {categories.length > 0 ? Math.round(totalPosts / categories.length) : 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Објава по категорији
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle>Претрага категорија</CardTitle>
          <CardDescription>
            Пронађите категорије по називу, слугу или опису
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Претражи категорије..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          {searchTerm && (
            <div className="mt-2 text-sm text-muted-foreground">
              Пронађено {filteredCategories.length} од {categories.length} категорија
            </div>
          )}
        </CardContent>
      </Card>

      {/* Categories Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Листа категорија</CardTitle>
              <CardDescription>
                Укупно {filteredCategories.length} категорија
              </CardDescription>
            </div>
            {categories.length > 0 && (
              <Button variant="outline" size="sm" asChild>
                <Link href="/categories" target="_blank">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Погледај на сајту
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
                  <TableHead>Категорија</TableHead>
                  <TableHead>Слуг</TableHead>
                  <TableHead>Опис</TableHead>
                  <TableHead>Број објава</TableHead>
                  <TableHead>Креирана</TableHead>
                  <TableHead className="text-right">Акције</TableHead>
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
                            ИД: {category.id}
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
                            Нема описа
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
                              Погледај
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
                          title="Уреди категорију"
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
                          title="Обриши категорију"
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
                            <h3 className="text-lg font-medium">Нема резултата</h3>
                            <p>Нема категорија које одговарају претрази "{searchTerm}"</p>
                            <Button
                              variant="outline"
                              onClick={() => setSearchTerm('')}
                              className="mt-2"
                            >
                              Очисти претрагу
                            </Button>
                          </>
                        ) : (
                          <>
                            <FolderOpen className="mx-auto h-12 w-12 mb-4 opacity-50" />
                            <h3 className="text-lg font-medium">Нема категорија</h3>
                            <p>Почните креирањем прве категорије за организовање садржаја</p>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button className="mt-4">
                                  <Plus className="mr-2 h-4 w-4" />
                                  Креирај прву категорију
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="sm:max-w-md">
                                <form onSubmit={handleSubmit(onSubmit)}>
                                  <DialogHeader>
                                    <DialogTitle>Нова категорија</DialogTitle>
                                    <DialogDescription>
                                      Креирајте прву категорију за организовање објава
                                    </DialogDescription>
                                  </DialogHeader>
                                  
                                  <div className="space-y-4 py-4">
                                    <div className="space-y-2">
                                      <Label htmlFor="name">Назив категорије</Label>
                                      <Input
                                        id="name"
                                        placeholder="Нпр. Обавештења"
                                        {...register('name', { required: 'Назив је обавезан' })}
                                      />
                                      {errors.name && (
                                        <p className="text-sm text-red-600 flex items-center">
                                          <AlertCircle className="mr-1 h-3 w-3" />
                                          {errors.name.message}
                                        </p>
                                      )}
                                    </div>

                                    <div className="space-y-2">
                                      <Label htmlFor="slug">УРЛ слуг</Label>
                                      <Input
                                        id="slug"
                                        placeholder="obavestenja"
                                        {...register('slug', { required: 'Слуг је обавезан' })}
                                      />
                                      {errors.slug && (
                                        <p className="text-sm text-red-600 flex items-center">
                                          <AlertCircle className="mr-1 h-3 w-3" />
                                          {errors.slug.message}
                                        </p>
                                      )}
                                    </div>

                                    <div className="space-y-2">
                                      <Label htmlFor="description">Опис (опционо)</Label>
                                      <Textarea
                                        id="description"
                                        placeholder="Кратки опис категорије..."
                                        rows={3}
                                        {...register('description')}
                                      />
                                    </div>
                                  </div>

                                  <DialogFooter>
                                    <Button type="submit" disabled={isSubmitting}>
                                      {isSubmitting ? 'Креира се...' : 'Креирај категорију'}
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
            <CardTitle>Најпопуларније категорије</CardTitle>
            <CardDescription>
              Категорије са највише објава
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {categories
                .sort((a, b) => (b.posts?.length || 0) - (a.posts?.length || 0))
                .slice(0, 5)
                .map((category, index) => (
                  <div key={category.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
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
                        {category.posts?.length || 0} објава
                      </Badge>
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/kategorije/${category.slug}`} target="_blank">
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
            <DialogTitle>Потврди брисање</DialogTitle>
            <DialogDescription>
              Да ли сте сигурни да желите да обришете категорију "{categoryToDelete?.name}"?
              {(categoryToDelete?.posts?.length || 0) > 0 && (
                <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <AlertCircle className="inline h-4 w-4 mr-2 text-yellow-600" />
                  <span className="text-sm text-yellow-800">
                    <strong>Упозорење:</strong> Ова категорија садржи {categoryToDelete?.posts?.length} објав(а). 
                    Прво пребаците објаве у другу категорију или их означите као "без категорије".
                  </span>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          
          {categoryToDelete && (
            <div className="py-4 space-y-2 text-sm border rounded-lg p-4 bg-gray-50">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Назив:</span>
                <span className="font-medium">{categoryToDelete.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Слуг:</span>
                <Badge variant="outline" className="font-mono text-xs">
                  {categoryToDelete.slug}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Број објава:</span>
                <span className="font-medium">{categoryToDelete.posts?.length || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Креирана:</span>
                <span>{formatDate(categoryToDelete.createdAt)}</span>
              </div>
              {categoryToDelete.description && (
                <div className="pt-2 border-t">
                  <span className="text-muted-foreground text-xs">Опис:</span>
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
              Откажи
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteCategory}
              disabled={(categoryToDelete?.posts?.length || 0) > 0}
            >
              {(categoryToDelete?.posts?.length || 0) > 0 ? 'Категорија се користи' : 'Обриши категорију'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}