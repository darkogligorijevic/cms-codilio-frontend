// app/dashboard/posts/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  Filter, 
  Eye, 
  Edit, 
  Trash2, 
  Calendar,
  User,
  Tag,
  ExternalLink,
  FileText,
  TrendingUp,
  Clock,
  MoreHorizontal
} from 'lucide-react';
import Link from 'next/link';
import { postsApi, categoriesApi } from '@/lib/api';
import type { Post, Category, PostStatus } from '@/lib/types';
import { toast } from 'sonner';
import { useTheme } from 'next-themes';

export default function PostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<PostStatus | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPosts, setTotalPosts] = useState(0);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const {theme} = useTheme();
  const postsPerPage = 10;

  useEffect(() => {
    fetchPosts();
    fetchCategories();
  }, [currentPage]);

  useEffect(() => {
    // Reset to page 1 when filters change
    if (currentPage !== 1) {
      setCurrentPage(1);
    } else {
      fetchPosts();
    }
  }, [statusFilter, categoryFilter, searchTerm]);

  const fetchPosts = async () => {
    try {
      setIsLoading(true);
      const response = await postsApi.getAll(currentPage, postsPerPage);
      let filteredPosts = response.posts;

      // Apply filters
      if (statusFilter !== 'all') {
        filteredPosts = filteredPosts.filter(post => post.status === statusFilter);
      }
      if (categoryFilter !== 'all') {
        filteredPosts = filteredPosts.filter(post => post.categoryId === parseInt(categoryFilter));
      }
      if (searchTerm) {
        filteredPosts = filteredPosts.filter(post => 
          post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          post.excerpt?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          post.content.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      setPosts(filteredPosts);
      setTotalPages(response.totalPages);
      setTotalPosts(response.total);
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast.error('Грешка при учитавању објава');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await categoriesApi.getAll();
      setCategories(response);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleDeletePost = async () => {
    if (!selectedPost) return;

    try {
      await postsApi.delete(selectedPost.id);
      toast.success('Објава је успешно обрисана');
      fetchPosts();
      setIsDeleteDialogOpen(false);
      setSelectedPost(null);
    } catch (error) {
      console.error('Error deleting post:', error);
      toast.error('Грешка при брисању објаве');
    }
  };

    const handleToggleStatus = async (post: Post) => {
    try {
        const newStatus: PostStatus = post.status === 'published' 
        ? 'draft' as PostStatus 
        : 'published' as PostStatus;
        
        await postsApi.update(post.id, { status: newStatus });
        toast.success(`Објава је ${newStatus === 'published' ? 'објављена' : 'пребачена у драфт'}`);
        fetchPosts();
    } catch (error) {
        console.error('Error updating post status:', error);
        toast.error('Грешка при ажурирању статуса објаве');
    }
    };

  const getStatusBadge = (status: PostStatus) => {
    return status === 'published' ? (
      <Badge variant="default" className="bg-green-100 text-green-800">
        <Eye className="mr-1 h-3 w-3" />
        Објављено
      </Badge>
    ) : (
      <Badge variant="secondary">
        <FileText className="mr-1 h-3 w-3" />
        Драфт
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

  const getCategoryName = (categoryId?: number) => {
    if (!categoryId) return 'Без категорије';
    const category = categories.find(cat => cat.id === categoryId);
    return category?.name || 'Непозната категорија';
  };

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'пре неколико секунди';
    if (diffInSeconds < 3600) return `пре ${Math.floor(diffInSeconds / 60)} мин`;
    if (diffInSeconds < 86400) return `пре ${Math.floor(diffInSeconds / 3600)} сати`;
    if (diffInSeconds < 604800) return `пре ${Math.floor(diffInSeconds / 86400)} дана`;
    return formatDate(dateString);
  };

  const filteredPostsCount = posts.length;
  const publishedCount = posts.filter(post => post.status === 'published').length;
  const draftCount = posts.filter(post => post.status === 'draft').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Објаве</h1>
          <p className="text-muted-foreground">
            Управљајте објавама на порталу институције
          </p>
        </div>
        <Button asChild variant={theme === "light" ? "default" : "secondaryDefault"}>
          <Link href="/dashboard/posts/new">
            <Plus className="mr-2 h-4 w-4" />
            Нова објава
          </Link>
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Укупно објава
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPosts}</div>
            <p className="text-xs text-muted-foreground">
              Све објаве у систему
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
              Драфт
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
              Укупни прегледи
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {posts.reduce((sum, post) => sum + post.viewCount, 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Транспарентност у акцији
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Претрага и филтери</CardTitle>
          <CardDescription>
            Пронађите објаве помоћу претраге и филтера
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
                  placeholder="Претражи објаве..."
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
                  <SelectItem value="published">
                    <div className="flex items-center">
                      <Eye className="mr-2 h-4 w-4" />
                      Објављено
                    </div>
                  </SelectItem>
                  <SelectItem value="draft">
                    <div className="flex items-center">
                      <FileText className="mr-2 h-4 w-4" />
                      Драфт
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Категорија</Label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Све категорије" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Све категорије</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      <div className="flex items-center">
                        <Tag className="mr-2 h-4 w-4" />
                        {category.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <div className="text-sm text-muted-foreground">
                Приказује се {filteredPostsCount} од {totalPosts} објава
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Posts Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Листа објава</CardTitle>
              <CardDescription>
                Укупно {filteredPostsCount} објава на страни {currentPage}
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
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Наслов</TableHead>
                    <TableHead>Категорија</TableHead>
                    <TableHead>Аутор</TableHead>
                    <TableHead>Статус</TableHead>
                    <TableHead>Прегледи</TableHead>
                    <TableHead>Датум</TableHead>
                    <TableHead className="text-right">Акције</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {posts.map((post) => (
                    <TableRow key={post.id} className="group">
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium group-hover:text-blue-600 transition-colors">
                            {post.title}
                          </div>
                          {post.excerpt && (
                            <div className="text-xs text-muted-foreground line-clamp-2 max-w-md">
                              {post.excerpt}
                            </div>
                          )}
                          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span>{getTimeAgo(post.updatedAt)}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Tag className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm">{getCategoryName(post.categoryId)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <User className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm">{post.author.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <button
                          onClick={() => handleToggleStatus(post)}
                          className="hover:opacity-80 transition-opacity"
                          title={`Промени статус на ${post.status === 'published' ? 'драфт' : 'објављено'}`}
                        >
                          {getStatusBadge(post.status)}
                        </button>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Eye className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm font-medium">{post.viewCount.toLocaleString()}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          <span>{formatDate(post.createdAt)}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-1">
                          {post.status === 'published' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              asChild
                              title="Погледај на сајту"
                            >
                              <Link href={`/objave/${post.slug}`} target="_blank">
                                <ExternalLink className="h-4 w-4" />
                              </Link>
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            asChild
                            title="Уреди објаву"
                          >
                            <Link href={`/dashboard/posts/${post.id}`}>
                              <Edit className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedPost(post);
                              setIsDeleteDialogOpen(true);
                            }}
                            title="Обриши објаву"
                            className="text-red-600 hover:text-red-800 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {posts.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-12">
                        <div className="text-muted-foreground space-y-2">
                          {searchTerm || statusFilter !== 'all' || categoryFilter !== 'all' ? (
                            <>
                              <Search className="mx-auto h-12 w-12 mb-4 opacity-50" />
                              <h3 className="text-lg font-medium">Нема резултата</h3>
                              <p>Нема објава које одговарају филтерима</p>
                              <Button
                                variant="outline"
                                onClick={() => {
                                  setSearchTerm('');
                                  setStatusFilter('all');
                                  setCategoryFilter('all');
                                }}
                                className="mt-2"
                              >
                                Очисти филтере
                              </Button>
                            </>
                          ) : (
                            <>
                              <FileText className="mx-auto h-12 w-12 mb-4 opacity-50" />
                              <h3 className="text-lg font-medium">Нема објава</h3>
                              <p>Почните креирањем прве објаве за вашу институцију</p>
                              <Button className="mt-4" asChild>
                                <Link href="/dashboard/posts/new">
                                  <Plus className="mr-2 h-4 w-4" />
                                  Креирај прву објаву
                                </Link>
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 pt-4 border-t">
                  <div className="text-sm text-muted-foreground">
                    Страна {currentPage} од {totalPages} • Укупно {totalPosts} објава
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                    >
                      Претходна
                    </Button>
                    
                    <div className="flex items-center space-x-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }

                        return (
                          <Button
                            key={pageNum}
                            variant={currentPage === pageNum ? "default" : "outline"}
                            size="sm"
                            onClick={() => setCurrentPage(pageNum)}
                            className="w-8 h-8 p-0"
                          >
                            {pageNum}
                          </Button>
                        );
                      })}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Следећа
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Потврди брисање</DialogTitle>
            <DialogDescription>
              Да ли сте сигурни да желите да обришете објаву "{selectedPost?.title}"?
              Ова акција се не може поништити.
            </DialogDescription>
          </DialogHeader>
          
          {selectedPost && (
            <div className="py-4 space-y-2 text-sm border rounded-lg p-4 bg-gray-50">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Наслов:</span>
                <span className="font-medium">{selectedPost.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Статус:</span>
                {getStatusBadge(selectedPost.status)}
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Аутор:</span>
                <span>{selectedPost.author.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Прегледи:</span>
                <span>{selectedPost.viewCount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Креирана:</span>
                <span>{formatDate(selectedPost.createdAt)}</span>
              </div>
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
              onClick={handleDeletePost}
            >
              Обриши објаву
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}