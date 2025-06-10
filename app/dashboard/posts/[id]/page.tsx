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
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { postsApi, categoriesApi, mediaApi } from '@/lib/api';
import type { Post, Category, Media, CreatePostDto, UpdatePostDto, PostStatus } from '@/lib/types';
import { toast } from 'sonner';

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
  const [isLoading, setIsLoading] = useState(!isNewPost);
  const [isSaving, setSaving] = useState(false);
  const [formInitialized, setFormInitialized] = useState(false);

  // Memoized default values
  const defaultFormValues = useMemo(() => ({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    status: 'draft' as PostStatus,
    categoryId: '',
    featuredImage: ''
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

  useEffect(() => {
    const initializeForm = async () => {
      await fetchCategories();
      await fetchMedia();
      
      if (!isNewPost) {
        await fetchPost();
      } else {
        // For new posts, explicitly set default values
        setValue('status', 'draft' as PostStatus);
        setValue('categoryId', '');
        setValue('featuredImage', '');
        setFormInitialized(true);
      }
    };

    initializeForm();
  }, [isNewPost, resolvedParams.id, setValue]);

  // Auto-generate slug from title
  useEffect(() => {
    if (watchedTitle && isNewPost && formInitialized) {
      const slug = watchedTitle
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      setValue('slug', slug);
    }
  }, [watchedTitle, isNewPost, formInitialized, setValue]);

  // Listener za poruke iz media page-a (popup komunikacija)
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Proveriti da li je poruka iz naše media page
      if (event.data && event.data.type === 'MEDIA_SELECTED') {
        const selectedFiles = event.data.data;
        if (selectedFiles && selectedFiles.length > 0) {
          // Uzeti prvi izabrani fajl
          setValue('featuredImage', selectedFiles[0], { shouldDirty: true });
          toast.success('Slika je uspešno izabrana');
        }
      }
    };

    // Dodati event listener
    window.addEventListener('message', handleMessage);

    // Cleanup
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [setValue]);

  // Listener za localStorage (backup metoda)
  useEffect(() => {
    const checkForSelectedMedia = () => {
      const selectedMedia = localStorage.getItem('selectedMedia');
      if (selectedMedia) {
        try {
          const parsedMedia = JSON.parse(selectedMedia);
          if (parsedMedia && parsedMedia.length > 0) {
            setValue('featuredImage', parsedMedia[0], { shouldDirty: true });
            toast.success('Slika je uspešno izabrana');
            // Očisti localStorage
            localStorage.removeItem('selectedMedia');
          }
        } catch (error) {
          console.error('Error parsing selected media:', error);
        }
      }
    };

    // Proveravaj localStorage svake sekunde dok je komponenta mounted
    const interval = setInterval(checkForSelectedMedia, 1000);

    // Proveraj odmah kada se komponenta mount-uje
    checkForSelectedMedia();

    // Cleanup
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
      toast.error('Greška pri učitavanju objave');
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
      setMedia(response.filter(item => item.mimetype?.startsWith('image/')));
    } catch (error) {
      console.error('Error fetching media:', error);
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
        featuredImage: data.featuredImage || undefined
      };

      if (isNewPost) {
        const newPost = await postsApi.create(postData as CreatePostDto);
        toast.success('Objava je uspešno kreirana');
        router.push(`/dashboard/posts/${newPost.id}`);
      } else {
        await postsApi.update(parseInt(resolvedParams.id), postData as UpdatePostDto);
        toast.success('Objava je uspešno ažurirana');
        fetchPost();
      }
    } catch (error) {
      console.error('Error saving post:', error);
      toast.error('Greška pri čuvanju objave');
    } finally {
      setSaving(false);
    }
  };

  const getStatusBadge = (status: PostStatus) => {
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

  // Funkcija za otvaranje media page u popup-u
  const openMediaSelector = () => {
    const mediaWindow = window.open(
      '/dashboard/media?select=true',
      'mediaSelector',
      'width=1200,height=800,scrollbars=yes,resizable=yes'
    );

    // Fokusiraj popup
    if (mediaWindow) {
      mediaWindow.focus();
    }
  };

  const handleImageSelect = (filename: string) => {
    setValue('featuredImage', filename, { shouldDirty: true });
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
              Nazad na objave
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {isNewPost ? 'Nova objava' : 'Uredi objavu'}
            </h1>
            <p className="text-muted-foreground">
              {isNewPost ? 'Kreirajte novu objavu za portal' : `Uredite objavu: ${post?.title}`}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {!isNewPost && post?.status === 'published' && (
            <Button variant="outline" size="sm" asChild>
              <Link href={`/posts/${post.slug}`} target="_blank">
                <Eye className="mr-2 h-4 w-4" />
                Pogledaj
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
                <CardTitle>Osnovne informacije</CardTitle>
                <CardDescription>
                  Unesite osnovne podatke o objavi
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Naslov objave</Label>
                  <Input
                    id="title"
                    placeholder="Unesite naslov objave..."
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
                    placeholder="url-slug-objave"
                    {...register('slug', { required: 'Slug je obavezan' })}
                  />
                  {errors.slug && (
                    <p className="text-sm text-red-600 flex items-center">
                      <AlertCircle className="mr-1 h-3 w-3" />
                      {errors.slug.message}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    URL adresa objave će biti: /posts/{watch('slug')}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="excerpt">Kratak opis (opciono)</Label>
                  <textarea
                    id="excerpt"
                    placeholder="Kratak opis objave koji će se prikazati u pregledu..."
                    rows={3}
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    {...register('excerpt')}
                  />
                  <p className="text-xs text-muted-foreground">
                    Ovaj tekst će se prikazati kao pregled objave na listi
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Rich Text Editor */}
            <Card>
              <CardHeader>
                <CardTitle>Sadržaj objave</CardTitle>
                <CardDescription>
                  Koristite rich text editor za kreiranje profesionalnog sadržaja
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RichTextEditor
                  content={watchedContent || ''}
                  onChange={(content) => setValue('content', content, { shouldDirty: true })}
                  placeholder="Napišite sadržaj objave ovde... Koristite toolbar za formatiranje teksta, dodavanje linkova, slika i tabela."
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
                <CardTitle>Objavi objavu</CardTitle>
                <CardDescription>
                  Kontrolišite vidljivost objave
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Status objave</Label>
                  {formInitialized && watchedStatus ? (
                    <Select
                      value={watchedStatus}
                      onValueChange={(value: PostStatus) => setValue('status', value, { shouldDirty: true })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Izaberite status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">
                          <div className="flex items-center">
                            <FileText className="mr-2 h-4 w-4" />
                            Draft (nije vidljivo)
                          </div>
                        </SelectItem>
                        <SelectItem value="published">
                          <div className="flex items-center">
                            <Eye className="mr-2 h-4 w-4" />
                            Objavljeno (javno dostupno)
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
                      Autor: {post.author.name}
                    </div>
                    <div className="flex items-center">
                      <Calendar className="mr-2 h-3 w-3" />
                      Kreirana: {new Date(post.createdAt).toLocaleDateString('sr-RS')}
                    </div>
                    {post.publishedAt && (
                      <div className="flex items-center">
                        <Eye className="mr-2 h-3 w-3" />
                        Objavljena: {new Date(post.publishedAt).toLocaleDateString('sr-RS')}
                      </div>
                    )}
                  </div>
                )}

                <div className="pt-4 border-t">
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isSaving || !isDirty || !formInitialized}
                  >
                    <Save className="mr-2 h-4 w-4" />
                    {isSaving ? 'Čuva se...' : (isNewPost ? 'Kreiraj objavu' : 'Sačuvaj izmene')}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Category */}
            <Card>
              <CardHeader>
                <CardTitle>Kategorija</CardTitle>
                <CardDescription>
                  Izaberite kategoriju objave
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                <Label>Kategorija</Label>
                <Select
                    value={watchedCategoryId || ''}
                    onValueChange={(value) => setValue('categoryId', value, { shouldDirty: true })}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Izaberite kategoriju" />
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
                <CardTitle>Glavna slika</CardTitle>
                <CardDescription>
                  Izaberite sliku koja će predstavljati objavu
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
                        Promeni sliku
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setValue('featuredImage', '', { shouldDirty: true })}
                        className="flex-1"
                      >
                        Ukloni sliku
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-md">
                    <ImageIcon className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500 mb-4">Nema izabrane slike</p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={openMediaSelector}
                      className="mb-2"
                    >
                      <ImageIcon className="mr-2 h-4 w-4" />
                      Izaberi sliku
                    </Button>
                    <p className="text-xs text-muted-foreground">ili</p>
                    <Button
                      type="button"
                      variant="link"
                      size="sm"
                      onClick={() => {
                        // Otvori media page za upload u novom tabu
                        window.open('/dashboard/media', '_blank');
                      }}
                      className="text-xs"
                    >
                      <Upload className="mr-1 h-3 w-3" />
                      Učitaj novu sliku
                    </Button>
                  </div>
                )}

                {/* Quick preview grid */}
                {media.length > 0 && !watchedFeaturedImage && (
                  <div>
                    <Label className="text-sm font-medium mb-2 block">
                      Brza selekcija:
                    </Label>
                    <div className="grid grid-cols-3 gap-2">
                      {media.slice(0, 6).map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => {
                            console.log('Quick selecting image:', item.filename);
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
                        Prikaži sve slike ({media.length})
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