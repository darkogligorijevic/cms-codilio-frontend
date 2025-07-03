// app/dashboard/posts/[id]/page.tsx
'use client';

import { use } from 'react';
import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, SubmitHandler } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  Save,
  Eye,
  Calendar,
  Tag,
  User as UserIcon,
  FileText,
  Upload,
  Image as ImageIcon,
  AlertCircle,
  Globe,
  Layout,
  CheckCircle2,
  Home
} from 'lucide-react';
import Link from 'next/link';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { postsApi, categoriesApi, mediaApi, pagesApi } from '@/lib/api';
import type { Post, Category, Media, Page, CreatePostDto, UpdatePostDto, PostStatus } from '@/lib/types';
import { toast } from 'sonner';
import { transliterate } from '@/lib/transliterate';
import { useTheme } from 'next-themes';

interface PostEditorProps {
  params: Promise<{
    id: string;
  }>;
}

interface PostFormData {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  status: PostStatus;
  categoryId: string;
  featuredImage: string;
  pageIds: number[];
}

interface PageOption {
  id: number;
  title: string;
  slug: string;
  isHomepage?: boolean; // ADDED: Flag to identify homepage
}

export default function PostEditor({ params }: PostEditorProps) {
  const resolvedParams = use(params);
  const isNewPost = resolvedParams.id === 'new';
  
  console.log('🔍 PostEditor params:', resolvedParams);
  console.log('🔍 Is new post:', isNewPost);
  console.log('🔍 Post ID:', resolvedParams.id);

  const router = useRouter();

  const [post, setPost] = useState<Post | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [media, setMedia] = useState<Media[]>([]);
  const [pages, setPages] = useState<PageOption[]>([]);
  const [isLoading, setIsLoading] = useState(!isNewPost);
  const [isSaving, setSaving] = useState(false);
  const [formInitialized, setFormInitialized] = useState(false);
  const [defaultPageId, setDefaultPageId] = useState<number | null>(null); // ADDED: Dynamic default page
  const {theme} = useTheme();

  // FIXED: Dynamic default values based on available pages
  const defaultFormValues = useMemo(() => ({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    status: 'draft' as PostStatus,
    categoryId: '',
    featuredImage: '',
    pageIds: [] as number[] // FIXED: Start with empty array
  }), []);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isDirty }
  } = useForm<PostFormData>({
    defaultValues: defaultFormValues
  });

  const watchedTitle = watch('title');
  const watchedStatus = watch('status');
  const watchedContent = watch('content');
  const watchedCategoryId = watch('categoryId');
  const watchedFeaturedImage = watch('featuredImage');
  const watchedPageIds = watch('pageIds');

  useEffect(() => {
    const initializeForm = async () => {
      await fetchCategories();
      await fetchMedia();
      await fetchPages();
      
      if (!isNewPost) {
        await fetchPost();
      } else {
        // For new posts, set default values after pages are loaded
        setValue('status', 'draft' as PostStatus);
        setValue('categoryId', '');
        setValue('featuredImage', '');
        // pageIds will be set after fetchPages completes
        setFormInitialized(true);
      }
    };

    initializeForm();
  }, [isNewPost, resolvedParams.id, setValue]);

  // ADDED: Set default page when pages are loaded and it's a new post
  useEffect(() => {
    if (defaultPageId !== null && isNewPost && formInitialized && watchedPageIds.length === 0) {
      setValue('pageIds', [defaultPageId]);
    }
  }, [defaultPageId, isNewPost, formInitialized, watchedPageIds.length, setValue]);


  useEffect(() => {
    if (watchedTitle && isNewPost && formInitialized) {
      const latinTitle = transliterate(watchedTitle);
      const slug = latinTitle
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      setValue('slug', slug);
    }
  }, [watchedTitle, isNewPost, formInitialized, setValue]);

  // Message listener for media selection
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Proveriti da li je poruka iz naše media page
      if (event.data && event.data.type === 'MEDIA_SELECTED') {
        const selectedFiles = event.data.data;
        if (selectedFiles && selectedFiles.length > 0) {
          // Uzeti prvi izabrani fajl
          setValue('featuredImage', selectedFiles[0], { shouldDirty: true });
          toast.success('Слика је успешно изабрана');
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [setValue]);

  // LocalStorage backup listener
  useEffect(() => {
    const checkForSelectedMedia = () => {
      const selectedMedia = localStorage.getItem('selectedMedia');
      if (selectedMedia) {
        try {
          const parsedMedia = JSON.parse(selectedMedia);
          if (parsedMedia && parsedMedia.length > 0) {
            setValue('featuredImage', parsedMedia[0], { shouldDirty: true });
            toast.success('Слика је успешно изабрана');
            localStorage.removeItem('selectedMedia');
          }
        } catch (error) {
          console.error('Error parsing selected media:', error);
        }
      }
    };

    const interval = setInterval(checkForSelectedMedia, 1000);
    checkForSelectedMedia();

    return () => {
      clearInterval(interval);
    };
  }, [setValue]);

  const fetchPost = async () => {
    try {
      setIsLoading(true);
      const response = await postsApi.getById(parseInt(resolvedParams.id));
      setPost(response);

      // Populate form with fetched data
      setValue('title', response.title);
      setValue('slug', response.slug);
      setValue('excerpt', response.excerpt || '');
      setValue('content', response.content);
      setValue('status', response.status);
      setValue('categoryId', response.categoryId?.toString() || '');
      setValue('featuredImage', response.featuredImage || '');
      
      setFormInitialized(true);
    } catch (error) {
      console.error('Error fetching post:', error);
      toast.error('Грешка при учитавању објаве');
      router.push('/dashboard/posts');
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

  const fetchMedia = async () => {
    try {
      const response = await mediaApi.getAll();
      console.log(response)
      setMedia(response.filter(item => item.mimeType?.startsWith('image/')));
    } catch (error) {
      console.error('Error fetching media:', error);
    }
  };

  const fetchPages = async () => {
    try {
      const response = await pagesApi.getAllForSelection();
      setPages(response);
      
    } catch (error) {
      console.error('Error fetching pages:', error);
      // FIXED: Better fallback handling
      const fallbackPages = [
        { id: 1, title: 'Почетна страна', slug: '', isHomepage: true }
      ];
      setPages(fallbackPages);
      setDefaultPageId(1);
    }
  };

  const onSubmit: SubmitHandler<PostFormData> = async (data) => {
    try {
      setSaving(true);
      
      const postData = {
        title: data.title,
        slug: data.slug,
        excerpt: data.excerpt || undefined,
        content: data.content,
        status: data.status,
        categoryId: data.categoryId ? parseInt(data.categoryId) : undefined,
        featuredImage: data.featuredImage || undefined,
        pageIds: data.pageIds
      };

      if (isNewPost) {
        const newPost = await postsApi.create(postData as CreatePostDto);
        toast.success('Објава је успешно креирана');
        router.push(`/dashboard/posts/${newPost.id}`);
      } else {
        await postsApi.update(parseInt(resolvedParams.id), postData as UpdatePostDto);
        toast.success('Објава је успешно ажурирана');
        fetchPost();
      }
    } catch (error) {
      console.error('Error saving post:', error);
      toast.error('Грешка при чувању објаве');
    } finally {
      setSaving(false);
    }
  };

  const getStatusBadge = (status: PostStatus) => {
    return status === 'published' ? (
      <Badge className="bg-green-100 text-green-800">
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

  const openMediaSelector = () => {
    const mediaWindow = window.open(
      '/dashboard/media?select=true',
      'mediaSelector',
      'width=1200,height=800,scrollbars=yes,resizable=yes'
    );

    if (mediaWindow) {
      mediaWindow.focus();
    }
  };

  const handlePageToggle = (pageId: number, checked: boolean) => {
    const currentPageIds = watchedPageIds || [];
    
    if (checked) {
      // Add page ID if not already present
      if (!currentPageIds.includes(pageId)) {
        setValue('pageIds', [...currentPageIds, pageId], { shouldDirty: true });
      }
    } else {
      // Remove page ID, but ensure at least one page is selected
      const newPageIds = currentPageIds.filter(id => id !== pageId);
      if (newPageIds.length === 0) {
        // FIXED: Use dynamic default page instead of hardcoded 0
        const fallbackPageId = defaultPageId || (pages.length > 0 ? pages[0].id : pageId);
        setValue('pageIds', [fallbackPageId], { shouldDirty: true });
        const fallbackPageName = pages.find(p => p.id === fallbackPageId)?.title || 'почетна страна';
        toast.info(`Објава мора бити додељена барем једној страни. ${fallbackPageName} остаје изабрана.`);
      } else {
        setValue('pageIds', newPageIds, { shouldDirty: true });
      }
    }
  };

  const getSelectedPagesText = () => {
    if (!watchedPageIds || watchedPageIds.length === 0) return 'Ниједна страница није изабрана';
    
    const selectedPages = pages.filter(page => watchedPageIds.includes(page.id));
    if (selectedPages.length === 0) return 'Ниједна страница није изабрана';
    
    if (selectedPages.length === 1) {
      return `Приказује се на: ${selectedPages[0].title}`;
    }
    
    return `Приказује се на ${selectedPages.length} страница`;
  };

  // ADDED: Helper function to check if page is homepage
  const isHomepage = (page: PageOption) => {
    return page.id === defaultPageId || 
           page.isHomepage === true ||
           page.slug === '' || 
           page.slug === 'home' || 
           page.slug === 'pocetna' ||
           page.title.toLowerCase().includes('почетна') ||
           page.title.toLowerCase().includes('home');
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-32 bg-gray-200 rounded w-full"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/posts">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Назад на објаве
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {isNewPost ? 'Нова објава' : 'Уреди објаву'}
            </h1>
            <p className="text-muted-foreground">
              {isNewPost ? 'Креирајте нову објаву за портал' : `Уредите објаву: ${post?.title}`}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {!isNewPost && post?.status === 'published' && (
            <Button variant="outline" size="sm" asChild>
              <Link href={`/objave/${post.slug}`} target="_blank">
                <Eye className="mr-2 h-4 w-4" />
                Погледај
              </Link>
            </Button>
          )}
          {!isNewPost && watchedStatus && (
            <div className="flex items-center space-x-2">
              {getStatusBadge(watchedStatus)}
            </div>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <Card>
              <CardHeader>
                <CardTitle>Основне информације</CardTitle>
                <CardDescription>
                  Унесите основне податке о објави
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Наслов објаве</Label>
                  <Input
                    id="title"
                    placeholder="Унесите наслов објаве..."
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
                    placeholder="url-slug-objave"
                    {...register('slug', { required: 'Slug је обавезан' })}
                  />
                  {errors.slug && (
                    <p className="text-sm text-red-600 flex items-center">
                      <AlertCircle className="mr-1 h-3 w-3" />
                      {errors.slug.message}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    URL адреса објаве ће бити: /objave/{watch('slug')}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="excerpt">Кратак опис (опционо)</Label>
                  <textarea
                    id="excerpt"
                    placeholder="Кратак опис објаве који ће се приказати у прегледу..."
                    rows={3}
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    {...register('excerpt')}
                  />
                  <p className="text-xs text-muted-foreground">
                    Овај текст ће се приказати као преглед објаве на листи
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Rich Text Editor */}
            <Card>
              <CardHeader>
                <CardTitle>Садржај објаве</CardTitle>
                <CardDescription>
                  Користите rich text editor за креирање професионалног садржаја
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RichTextEditor
                  content={watchedContent || ''}
                  onChange={(content) => setValue('content', content, { shouldDirty: true })}
                  placeholder="Напишите садржај објаве овде... Користите toolbar за форматирање текста, додавање линкова, слика и табела."
                />
                {errors.content && (
                  <p className="text-sm text-red-600 flex items-center mt-2">
                    <AlertCircle className="mr-1 h-3 w-3" />
                    {errors.content.message}
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Publish Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Објави објаву</CardTitle>
                <CardDescription>
                  Контролишите видљивост објаве
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Статус објаве</Label>
                  {formInitialized && watchedStatus ? (
                    <Select
                      value={watchedStatus}
                      onValueChange={(value: PostStatus) => setValue('status', value, { shouldDirty: true })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Изаберите статус" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">
                          <div className="flex items-center">
                            <FileText className="mr-2 h-4 w-4" />
                            Драфт (није видљиво)
                          </div>
                        </SelectItem>
                        <SelectItem value="published">
                          <div className="flex items-center">
                            <Eye className="mr-2 h-4 w-4" />
                            Објављено (јавно доступно)
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="h-10 bg-gray-100 rounded-md animate-pulse"></div>
                  )}
                </div>

                {!isNewPost && post && (
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center">
                      <UserIcon className="mr-2 h-3 w-3" />
                      Аутор: {post.author.name}
                    </div>
                    <div className="flex items-center">
                      <Calendar className="mr-2 h-3 w-3" />
                      Креирана: {new Date(post.createdAt).toLocaleDateString('sr-RS')}
                    </div>
                    {post.publishedAt && (
                      <div className="flex items-center">
                        <Eye className="mr-2 h-3 w-3" />
                        Објављена: {new Date(post.publishedAt).toLocaleDateString('sr-RS')}
                      </div>
                    )}
                  </div>
                )}

                <div className="pt-4 border-t">
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isSaving || !isDirty || !formInitialized}
                    variant={theme === "light" ? "default" : "secondaryDefault"}
                  >
                    <Save className="mr-2 h-4 w-4" />
                    {isSaving ? 'Чува се...' : (isNewPost ? 'Креирај објаву' : 'Сачувај измене')}
                  </Button>
                </div>
              </CardContent>
            </Card>


            {/* Category */}
            <Card>
              <CardHeader>
                <CardTitle>Категорија</CardTitle>
                <CardDescription>
                  Изаберите категорију објаве
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                <Label>Категорија</Label>
                <Select
                    value={watchedCategoryId || ''}
                    onValueChange={(value) => setValue('categoryId', value, { shouldDirty: true })}
                >
                    <SelectTrigger>
                      <SelectValue placeholder="Изаберите категорију" />
                    </SelectTrigger>
                    <SelectContent>
                    {categories.map((cat) => (
                        <SelectItem key={cat.id} value={String(cat.id)}>
                        {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.categoryId && (
                    <p className="text-sm text-red-600 flex items-center">
                      <AlertCircle className="mr-1 h-3 w-3" />
                      {errors.categoryId.message}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Featured Image */}
            <Card>
              <CardHeader>
                <CardTitle>Главна слика</CardTitle>
                <CardDescription>
                  Изаберите слику која ће представљати објаву
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {watchedFeaturedImage && watchedFeaturedImage !== '' ? (
                  <div className="space-y-2">
                    <img
                      src={mediaApi.getFileUrl(watchedFeaturedImage)}
                      alt="Featured image"
                      className="w-full h-32 object-cover rounded-md border"
                    />
                    <div className="flex space-x-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={openMediaSelector}
                        className="flex-1"
                      >
                        <ImageIcon className="mr-2 h-4 w-4" />
                        Промени слику
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setValue('featuredImage', '', { shouldDirty: true })}
                        className="flex-1"
                      >
                        Уклони слику
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-md">
                    <ImageIcon className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500 mb-4">Нема изабране слике</p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={openMediaSelector}
                      className="mb-2"
                    >
                      <ImageIcon className="mr-2 h-4 w-4" />
                      Изабери слику
                    </Button>
                    <p className="text-xs text-muted-foreground">или</p>
                    <Button
                      type="button"
                      variant="link"
                      size="sm"
                      onClick={() => {
                        window.open('/dashboard/media', '_blank');
                      }}
                      className="text-xs"
                    >
                      <Upload className="mr-1 h-3 w-3" />
                      Учитај нову слику
                    </Button>
                  </div>
                )}

                {/* Quick preview grid */}
                {media.length > 0 && !watchedFeaturedImage && (
                  <div>
                    <Label className="text-sm font-medium mb-2 block">
                      Брза селекција:
                    </Label>
                    <div className="grid grid-cols-3 gap-2">
                      {media.slice(0, 6).map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => {
                            setValue('featuredImage', item.filename, { shouldDirty: true });
                          }}
                          className="aspect-square border-2 border-gray-200 rounded-md overflow-hidden hover:border-blue-500 transition-colors"
                        >
                          <img
                            src={mediaApi.getFileUrl(item.filename)}
                            alt={item.alt || item.originalName}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                    {media.length > 6 && (
                      <Button
                        type="button"
                        variant="link"
                        size="sm"
                        onClick={openMediaSelector}
                        className="w-full mt-2 text-xs"
                      >
                        Прикажи све слике ({media.length})
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}