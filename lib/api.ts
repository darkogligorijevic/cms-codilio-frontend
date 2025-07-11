// lib/api.ts - Updated API functions with docker-compose compatible URLs
import axios, { Axios, AxiosResponse } from 'axios';
import { AuthResponse, AvailableParentPage, Category, CategorySelectionOption, CompleteSetupDto, CompleteSetupResponse, Contact, CreateCategoryDto, CreateContactDto, CreateEmailTemplateDto, CreateGalleryDto, CreateGalleryImageDto, CreateMediaDto, CreateOrganizationalUnitDto, CreatePageDto, CreatePageSectionDto, CreatePostDto, CreateServiceDocumentDto, CreateServiceDto, CreateUserDto, EmailTemplate, FindMediaOptions, Gallery, GalleryImage, GalleryStatistics, GalleryStatus, GalleryType, ImportSettingsDto, LoginCredentials, Media, MediaCategory, MediaCategoryInfo, MediaCategoryStats, NewsletterSubscribe, OrganizationalStatistics, OrganizationalUnit, Page, PageSection, Post, PostsResponse, ReorderSectionsDto, ReplyToContactDto, SectionTypeInfo, SendNewsletterDto, Service, ServiceDocument, ServiceDocumentTypeInfo, ServicePriority, ServicePriorityInfo, ServicesResponse, ServiceStatistics, ServiceStatus, ServiceType, ServiceTypeInfo, Setting, SettingCategory, SettingType, SetupStatusResponse, SiteSettings, SubscribeToNewsletterDto, UpdateCategoryDto, UpdateContactDto, UpdateEmailTemplateDto, UpdateGalleryDto, UpdateGalleryImageDto, UpdateMediaDto, UpdateMultipleSettingsDto, UpdateOrganizationalUnitDto, UpdatePageBuilderDto, UpdatePageDto, UpdatePageSectionDto, UpdatePostDto, UpdateServiceDocumentDto, UpdateServiceDto, UpdateSettingDto, UpdateUserDto, User, UsersStatistics, UserWithStats } from './types';
import { InstitutionType } from './institution-templates';

const getApiBaseUrl = (): string => {
  // Server-side rendering (Next.js) - koristi environment varijable
  if (typeof window === 'undefined') {
    // Prioritet: specifični env -> fallback env -> hardcoded fallback
    return process.env.API_URL || 
           process.env.NEXT_PUBLIC_API_URL || 
           'https://api-codilio.sbugarin.com/api';
  }

  // Client-side detection
  const hostname = window.location.hostname;
  
  console.log('🔍 Detecting API URL for hostname:', hostname);
  
  // Production URLs - glavna logika
  if (hostname === 'codilio2.sbugarin.com' || hostname === 'codilio.sbugarin.com') {
    const apiUrl = 'https://api-codilio.sbugarin.com/api';
    console.log('✅ Detected production domain - using main API:', apiUrl);
    return apiUrl;
  }

  // Local development
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    const localApiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
    console.log('✅ Detected localhost - using API URL:', localApiUrl);
    return localApiUrl;
  }

  // Docker container environment - koristi env varijable
  if (process.env.NODE_ENV === 'production') {
    const dockerApiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api-codilio.sbugarin.com/api';
    console.log('🐳 Docker production environment - using API URL:', dockerApiUrl);
    return dockerApiUrl;
  }

  // Fallback - prioritizuj environment varijable
  const fallbackUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api-codilio.sbugarin.com/api';
  console.log('⚠️ Using fallback API URL:', fallbackUrl);
  return fallbackUrl;
};

export const API_BASE_URL = getApiBaseUrl();

console.log('🔗 API Base URL configured:', API_BASE_URL);

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, 
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Response interceptor for error handling with better Docker support
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Handle network errors in Docker environment
    if (error.code === 'ECONNREFUSED' || error.code === 'ENETUNREACH') {
      console.error('🚨 Network error detected, checking alternative URLs...');
      
      // Try alternative API URL if primary fails
      const currentUrl = api.defaults.baseURL;
      const fallbackUrl = process.env.NEXT_PUBLIC_API_URL_FALLBACK || 'https://api-codilio2.sbugarin.com/api';
      
      if (currentUrl !== fallbackUrl && typeof window !== 'undefined') {
        console.log('🔄 Switching to fallback API URL:', fallbackUrl);
        
        // Update base URL and retry
        api.defaults.baseURL = fallbackUrl;
        return api.request(error.config);
      }
    }

    if (error.response?.status === 401) {
      // Handle unauthorized - redirect to login
      if (typeof window !== 'undefined') {
        localStorage.removeItem('access_token');
        // Proverava da li nije setup stranica
        if (!window.location.pathname.includes('/setup')) {
          window.location.href = '/login';
        }
      }
    } else if (error.response?.status === 412 && error.response?.data?.setupRequired) {
      // Handle setup required - samo loguj, SetupGuard će hendlovati
      console.log('Setup required, будет обработано SetupGuard-ом');
    }
    return Promise.reject(error);
  }
);

// Helper function to check API connectivity
export const checkApiConnectivity = async (): Promise<{
  isConnected: boolean;
  url: string;
  responseTime: number;
}> => {
  const startTime = Date.now();
  try {
    await api.get('/');
    const responseTime = Date.now() - startTime;
    return {
      isConnected: true,
      url: API_BASE_URL,
      responseTime
    };
  } catch (error) {
    const responseTime = Date.now() - startTime;
    return {
      isConnected: false,
      url: API_BASE_URL,
      responseTime
    };
  }
};

// Auth API
export const authApi = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response: AxiosResponse<AuthResponse> = await api.post('/auth/login', credentials);
    return response.data;
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
    }
  }
};

// Users API
export const usersApi = {
  create: async (data: CreateUserDto): Promise<User> => {
    const response: AxiosResponse<User> = await api.post('/users', data);
    return response.data;
  },

  getAll: async (withStats = false): Promise<User[] | UserWithStats[]> => {
    const response = await api.get(`/users${withStats ? '?withStats=true' : ''}`);
    return response.data;
  },

  getAllWithStats: async (): Promise<UserWithStats[]> => {
    const response: AxiosResponse<UserWithStats[]> = await api.get('/users?withStats=true');
    return response.data;
  },

  getStatistics: async (): Promise<UsersStatistics> => {
    const response: AxiosResponse<UsersStatistics> = await api.get('/users/statistics');
    return response.data;
  },

  getById: async (id: string, withStats = false): Promise<User | UserWithStats> => {
    const response = await api.get(`/users/${id}${withStats ? '?withStats=true' : ''}`);
    return response.data;
  },

  getByIdWithStats: async (id: string): Promise<UserWithStats> => {
    const response: AxiosResponse<UserWithStats> = await api.get(`/users/${id}?withStats=true`);
    return response.data;
  },

  toggleStatus: async (id: string): Promise<User> => {
    const response: AxiosResponse<User> = await api.patch(`/users/${id}/toggle-status`);
    return response.data;
  },

  setStatus: async (id: string, isActive: boolean): Promise<User> => {
    const response: AxiosResponse<User> = await api.patch(`/users/${id}/status`, { isActive });
    return response.data;
  },

  update: async (id: string, data: UpdateUserDto): Promise<User> => {
    const response: AxiosResponse<User> = await api.patch(`/users/${id}`, data);
    return response.data;
  },
  getCurrentUser: async (): Promise<UserWithStats> => {
    const response: AxiosResponse<UserWithStats> = await api.get('/users/me?withStats=true');
    return response.data;
  },

  updateProfile: async (data: UpdateUserDto): Promise<User> => {
    const response: AxiosResponse<User> = await api.patch('/users/me', data);
    return response.data;
  },
  delete: async (id: string): Promise<void> => {
    return await api.delete(`/users/${id}`);
  }
};

// Posts API
export const postsApi = {
  getAll: async (page = 1, limit = 10): Promise<PostsResponse> => {
    const response: AxiosResponse<PostsResponse> = await api.get(`/posts?page=${page}&limit=${limit}`);
    return response.data;
  },

  getPublished: async (page = 1, limit = 10): Promise<PostsResponse> => {
    const response: AxiosResponse<PostsResponse> = await api.get(`/posts/published?page=${page}&limit=${limit}`);
    return response.data;
  },

  getById: async (id: number): Promise<Post> => {
    const response: AxiosResponse<Post> = await api.get(`/posts/${id}`);
    return response.data;
  },

  getBySlug: async (slug: string): Promise<Post> => {
    const response: AxiosResponse<Post> = await api.get(`/posts/slug/${slug}`);
    return response.data;
  },

  // New method to get posts by page ID
  getByPageId: async (pageId: number, limit = 10): Promise<Post[]> => {
    const response: AxiosResponse<Post[]> = await api.get(`/posts/by-page/${pageId}?limit=${limit}`);
    return response.data;
  },

  // New method to get posts by page slug
  getByPageSlug: async (pageSlug: string, limit = 10): Promise<Post[]> => {
    const response: AxiosResponse<Post[]> = await api.get(`/posts/by-page-slug/${pageSlug}?limit=${limit}`);
    return response.data;
  },

  // New method to get posts for homepage
  getForHomePage: async (limit = 6): Promise<Post[]> => {
    const response: AxiosResponse<Post[]> = await api.get(`/posts/homepage?limit=${limit}`);
    return response.data;
  },

  // АЖУРИРАНО: Подршка за "all" категорију за Page Builder
  getByCategoryId: async (categoryId: number | string, limit = 6): Promise<Post[]> => {
    console.log('🔗 API call for category:', categoryId, 'limit:', limit);
    
    // ВАЖНО: Не конвертуј у број ако је "all"
    const categoryParam = categoryId === 'all' ? 'all' : categoryId;
    
    const response: AxiosResponse<Post[]> = await api.get(`/posts/by-category-id/${categoryParam}?limit=${limit}`);
    console.log('✅ API response:', response.data.length, 'posts');
    return response.data;
  },

  create: async (data: CreatePostDto): Promise<Post> => {
    const response: AxiosResponse<Post> = await api.post('/posts', data);
    return response.data;
  },

  update: async (id: number, data: UpdatePostDto): Promise<Post> => {
    const response: AxiosResponse<Post> = await api.patch(`/posts/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/posts/${id}`);
  },

  incrementView: async (slug: string): Promise<void> => {
    await api.patch(`/posts/${slug}/increment-view`);
  }
};

// Interface for page selection options
interface PageSelectionOption {
  isHomepage: boolean;
  id: number;
  title: string;
  slug: string;
}

// Pages API
export const pagesApi = {
  create: async (data: CreatePageDto): Promise<Page> => {
    const response: AxiosResponse<Page> = await api.post('/pages', data);
    return response.data;
  },

  getAll: async (): Promise<Page[]> => {
    const response: AxiosResponse<Page[]> = await api.get('/pages');
    return response.data;
  },

  getPublished: async (): Promise<Page[]> => {
    const response: AxiosResponse<Page[]> = await api.get('/pages/published');
    return response.data;
  },

  getHierarchical: async (): Promise<Page[]> => {
    const response: AxiosResponse<Page[]> = await api.get('/pages/hierarchical');
    return response.data;
  },

  getById: async (id: number): Promise<Page> => {
    const response: AxiosResponse<Page> = await api.get(`/pages/${id}`);
    return response.data;
  },

  getBySlug: async (slug: string): Promise<Page> => {
    const response: AxiosResponse<Page> = await api.get(`/pages/slug/${slug}`);
    return response.data;
  },

  update: async (id: number, data: UpdatePageDto): Promise<Page> => {
    const response: AxiosResponse<Page> = await api.patch(`/pages/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/pages/${id}`);
  },

  getAvailableParents: async (excludeId?: number): Promise<AvailableParentPage[]> => {
    let url = '/pages/available-parents';
    if (excludeId) {
      url += `?excludeId=${excludeId}`;
    }
    const response: AxiosResponse<AvailableParentPage[]> = await api.get(url);
    return response.data;
  },

  getAllForSelection: async (): Promise<Array<{ id: number; title: string; slug: string; parentId?: number }>> => {
    const response = await api.get('/pages/for-selection');
    return response.data;
  },

  // PAGE BUILDER METHODS
  getSectionTypes: async (): Promise<SectionTypeInfo[]> => {
    const response: AxiosResponse<SectionTypeInfo[]> = await api.get('/pages/section-types');
    return response.data;
  },

  updatePageBuilder: async (pageId: number, data: UpdatePageBuilderDto): Promise<Page> => {
    const response: AxiosResponse<Page> = await api.patch(`/pages/${pageId}/page-builder`, data);
    return response.data;
  },

  // SECTION MANAGEMENT
  getSections: async (pageId: number): Promise<PageSection[]> => {
    const response: AxiosResponse<PageSection[]> = await api.get(`/pages/${pageId}/sections`);
    return response.data;
  },

  createSection: async (pageId: number, data: CreatePageSectionDto): Promise<PageSection> => {
    const response: AxiosResponse<PageSection> = await api.post(`/pages/${pageId}/sections`, data);
    return response.data;
  },

  getSectionById: async (sectionId: number): Promise<PageSection> => {
    const response: AxiosResponse<PageSection> = await api.get(`/pages/sections/${sectionId}`);
    return response.data;
  },

  updateSection: async (sectionId: number, data: UpdatePageSectionDto): Promise<PageSection> => {
    const response: AxiosResponse<PageSection> = await api.patch(`/pages/sections/${sectionId}`, data);
    return response.data;
  },

  deleteSection: async (sectionId: number): Promise<void> => {
    await api.delete(`/pages/sections/${sectionId}`);
  },

  reorderSections: async (pageId: number, data: ReorderSectionsDto): Promise<PageSection[]> => {
    const response: AxiosResponse<PageSection[]> = await api.patch(`/pages/${pageId}/sections/reorder`, data);
    return response.data;
  },

  duplicateSection: async (sectionId: number): Promise<PageSection> => {
    const response: AxiosResponse<PageSection> = await api.post(`/pages/sections/${sectionId}/duplicate`);
    return response.data;
  },

  toggleSectionVisibility: async (sectionId: number): Promise<PageSection> => {
    const response: AxiosResponse<PageSection> = await api.patch(`/pages/sections/${sectionId}/toggle-visibility`);
    return response.data;
  },
};

export const mailerApi = {
  // Kontakti (forma)
  getAllContacts: async (): Promise<Contact[]> => {
    const response: AxiosResponse<Contact[]> = await api.get('/mailer/contacts');
    return response.data;
  },

  getByContactId: async (id: number): Promise<Contact> => {
    const response: AxiosResponse<Contact> = await api.get(`/mailer/contacts/${id}`);
    return response.data;
  },

  createContact: async (data: CreateContactDto): Promise<Contact> => {
    const response: AxiosResponse<Contact> = await api.post('/mailer/contact', data);
    return response.data;
  },

  updateContact: async (id: number, data: UpdateContactDto): Promise<Contact> => {
    const response: AxiosResponse<Contact> = await api.patch(`/mailer/contacts/${id}`, data);
    return response.data;
  },

  deleteContact: async (id: number): Promise<void> => {
    await api.delete(`/mailer/contacts/${id}`);
  },

  markAsRead: async (id: number): Promise<Contact> => {
    const response: AxiosResponse<Contact> = await api.patch(`/mailer/contacts/${id}/mark-read`);
    return response.data;
  },

  // NEWSLETTER
  subscribeToNewsletter: async (data: SubscribeToNewsletterDto): Promise<NewsletterSubscribe> => {
    const response: AxiosResponse<NewsletterSubscribe> = await api.post('/mailer/newsletter/subscribe', data);
    return response.data;
  },

  unsubscribeToNewsletter: async (token: string): Promise<NewsletterSubscribe> => {
    const response: AxiosResponse<NewsletterSubscribe> = await api.post(`/mailer/newsletter/unsubscribe/${token}`);
    return response.data;
  },

  getAllSubscribers: async (): Promise<NewsletterSubscribe[]> => {
    const response: AxiosResponse<NewsletterSubscribe[]> = await api.get('/mailer/newsletter/subscribers');
    return response.data;
  },

  getAllActiveSubscribers: async (): Promise<NewsletterSubscribe[]> => {
    const response: AxiosResponse<NewsletterSubscribe[]> = await api.get('/mailer/newsletter/subscribers/active');
    return response.data;
  },

  sendNewsletter: async (data: SendNewsletterDto): Promise<{ sent: number, failed: number }> => {
    const response: AxiosResponse<{ sent: number, failed: number }> = await api.post('/mailer/newsletter/send', data);
    return response.data;
  },

  // TEMPLATES
  createEmailTemplate: async (data: CreateEmailTemplateDto): Promise<EmailTemplate> => {
    const response: AxiosResponse<EmailTemplate> = await api.post('/mailer/templates', data);
    return response.data;
  },

  getAllEmailTemplates: async (): Promise<EmailTemplate[]> => {
    const response: AxiosResponse<EmailTemplate[]> = await api.get('/mailer/templates');
    return response.data;
  },

  getEmailTemplateById: async (id: number): Promise<EmailTemplate> => {
    const response: AxiosResponse<EmailTemplate> = await api.get(`/mailer/templates/${id}`);
    return response.data;
  },

  updateEmailTemplate: async (id: number, data: UpdateEmailTemplateDto): Promise<EmailTemplate> => {
    const response: AxiosResponse<EmailTemplate> = await api.patch(`/mailer/templates/${id}`, data);
    return response.data;
  },

  deleteEmailTemplate: async (id: number): Promise<void> => {
    await api.delete(`/mailer/templates/${id}`);
  },

  // NEW: Reply to contact
  sendReply: async (contactId: number, data: ReplyToContactDto): Promise<void> => {
    await api.post(`/mailer/contacts/${contactId}/reply`, data);
  },
}

// Categories API
export const categoriesApi = {
  getAll: async (): Promise<Category[]> => {
    const response: AxiosResponse<Category[]> = await api.get('/categories');
    return response.data;
  },

  // АЖУРИРАНО: Сада враћа CategorySelectionOption[] уместо неправилног типа
  getAllForSelection: async (): Promise<CategorySelectionOption[]> => {
    const response = await api.get('/categories/for-selection');
    return response.data;
  },

  getById: async (id: number): Promise<Category> => {
    const response: AxiosResponse<Category> = await api.get(`/categories/${id}`);
    return response.data;
  },

  getBySlug: async (slug: string): Promise<Category> => {
    const response: AxiosResponse<Category> = await api.get(`/categories/slug/${slug}`);
    return response.data;
  },

  create: async (data: CreateCategoryDto): Promise<Category> => {
    const response: AxiosResponse<Category> = await api.post('/categories', data);
    return response.data;
  },

  update: async (id: number, data: UpdateCategoryDto): Promise<Category> => {
    const response: AxiosResponse<Category> = await api.patch(`/categories/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/categories/${id}`);
  }
};

// Media API
export const mediaApi = {
  getAll: async (options?: FindMediaOptions): Promise<Media[]> => {
    let url = '/media';
    const params = new URLSearchParams();

    if (options?.category) params.append('category', options.category);
    if (options?.isPublic !== undefined) params.append('isPublic', options.isPublic.toString());
    if (options?.search) params.append('search', options.search);

    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    const response: AxiosResponse<Media[]> = await api.get(url);
    return response.data;
  },

  getPublic: async (options?: Omit<FindMediaOptions, 'isPublic'>): Promise<Media[]> => {
    let url = '/media/public';
    const params = new URLSearchParams();

    if (options?.category) params.append('category', options.category);
    if (options?.search) params.append('search', options.search);

    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    const response: AxiosResponse<Media[]> = await api.get(url);
    return response.data;
  },

  getCategories: async (): Promise<MediaCategoryInfo[]> => {
    const response: AxiosResponse<MediaCategoryInfo[]> = await api.get('/media/categories');
    return response.data;
  },

  getByCategory: async (category: MediaCategory): Promise<Media[]> => {
    const response: AxiosResponse<Media[]> = await api.get(`/media/category/${category}`);
    return response.data;
  },

  getCategoriesStats: async (): Promise<MediaCategoryStats[]> => {
    const response: AxiosResponse<MediaCategoryStats[]> = await api.get('/media/categories/stats');
    return response.data;
  },

  getById: async (id: number): Promise<Media> => {
    const response: AxiosResponse<Media> = await api.get(`/media/${id}`);
    return response.data;
  },

  upload: async (file: File, data?: CreateMediaDto): Promise<Media> => {
    const formData = new FormData();
    formData.append('file', file);

    if (data?.alt) formData.append('alt', data.alt);
    if (data?.caption) formData.append('caption', data.caption);
    if (data?.category) formData.append('category', data.category);
    if (data?.description) formData.append('description', data.description);
    if (data?.isPublic !== undefined) formData.append('isPublic', data.isPublic.toString());

    const response: AxiosResponse<Media> = await api.post('/media/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  update: async (id: number, file?: File, data?: UpdateMediaDto): Promise<Media> => {
    const formData = new FormData();

    if (file) formData.append('file', file);
    if (data?.alt) formData.append('alt', data.alt);
    if (data?.caption) formData.append('caption', data.caption);
    if (data?.category) formData.append('category', data.category);
    if (data?.description) formData.append('description', data.description);
    if (data?.isPublic !== undefined) formData.append('isPublic', data.isPublic.toString());

    const response: AxiosResponse<Media> = await api.patch(`/media/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  updateMetadata: async (id: number, data: UpdateMediaDto): Promise<Media> => {
    const response: AxiosResponse<Media> = await api.patch(`/media/${id}/metadata`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/media/${id}`);
  },

  getFileUrl: (filename: string): string => {
    const cleanFilename = filename.startsWith('uploads/')
      ? filename.replace('uploads/', '')
      : filename;

    return `${API_BASE_URL}/media/file/${cleanFilename}`;
  },

  findPublicByCategory: async (category: MediaCategory): Promise<Media[]> => {
    const response: AxiosResponse<Media[]> = await api.get(`/media/public/category/${category}`);
    return response.data;
  },
};
export { api };

export const settingsApi = {
  getAll: async (): Promise<Setting[]> => {
    const response: AxiosResponse<Setting[]> = await api.get('/settings');
    return response.data;
  },

  getByCategory: async (category: SettingCategory): Promise<Setting[]> => {
    const response: AxiosResponse<Setting[]> = await api.get(`/settings/category/${category}`);
    return response.data;
  },

  getByKey: async (key: string): Promise<Setting> => {
    const response: AxiosResponse<Setting> = await api.get(`/settings/${key}`);
    return response.data;
  },

  update: async (key: string, data: UpdateSettingDto): Promise<Setting> => {
    const response: AxiosResponse<Setting> = await api.put(`/settings/${key}`, data);
    return response.data;
  },

  updateMultiple: async (data: UpdateMultipleSettingsDto): Promise<Setting[]> => {
    const response: AxiosResponse<Setting[]> = await api.put('/settings', data);
    return response.data;
  },

  uploadFile: async (key: string, file: File): Promise<Setting> => {
    const formData = new FormData();
    formData.append('file', file);
    const response: AxiosResponse<Setting> = await api.post(`/settings/${key}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  reset: async (category?: SettingCategory): Promise<Setting[]> => {
    const response: AxiosResponse<Setting[]> = await api.post('/settings/reset', { category });
    return response.data;
  },

  export: async (): Promise<Record<string, string>> => {
    const response: AxiosResponse<Record<string, string>> = await api.get('/settings/export');
    return response.data;
  },

  import: async (data: ImportSettingsDto): Promise<Setting[]> => {
    const response: AxiosResponse<Setting[]> = await api.post('/settings/import', data);
    return response.data;
  },

  // Helper method to get all settings as a structured object
  getStructured: async (): Promise<SiteSettings> => {
    const settings = await settingsApi.getAll();
    const structured: any = {};

    settings.forEach(setting => {
      // Convert key format from snake_case to camelCase
      const camelKey = setting.key.replace(/_([a-z])/g, (g) => g[1].toUpperCase());

      // Parse value based on type
      let value: any = setting.value;
      if (setting.type === SettingType.NUMBER) {
        value = parseInt(setting.value, 10);
      } else if (setting.type === SettingType.BOOLEAN) {
        value = setting.value === 'true';
      } else if (setting.type === SettingType.JSON) {
        try {
          value = JSON.parse(setting.value);
        } catch {
          value = setting.value;
        }
      }

      structured[camelKey] = value;
    });

    return structured as SiteSettings;
  }
};
export const setupApi = {
  getStatus: async (): Promise<SetupStatusResponse> => {
    const response: AxiosResponse<SetupStatusResponse> = await api.get('/setup/status');
    return response.data;
  },

  completeSetup: async (data: CompleteSetupDto): Promise<CompleteSetupResponse> => {
    const response: AxiosResponse<CompleteSetupResponse> = await api.post('/setup/complete', data);
    return response.data;
  },

  checkAdminExists: async (): Promise<{ exists: boolean }> => {
    const response: AxiosResponse<{ exists: boolean }> = await api.get('/setup/check-admin');
    return response.data;
  },
  
  createHomepageTemplate: async (institutionType: InstitutionType): Promise<{ 
    success: boolean; 
    pageId: number;
    sectionsCreated: number;
    aboutPageId: number;
    aboutSectionsCreated: number;
    message: string;
  }> => {
    const response = await api.post('/setup/create-homepage-template', {
      institutionType
    });
    return response.data;
  },
};

// Updated interface for the response
export interface CreateHomepageTemplateResponse {
  success: boolean;
  pageId: number;
  sectionsCreated: number;
  aboutPageId: number;
  aboutSectionsCreated: number;
  message: string;
}

export const organizationalApi = {
  // Get all units
  getAll: async (): Promise<OrganizationalUnit[]> => {
    const response: AxiosResponse<OrganizationalUnit[]> = await api.get('/organizational-structure/units');
    return response.data;
  },

  // Get units as tree structure
  getTree: async (): Promise<OrganizationalUnit[]> => {
    const response: AxiosResponse<OrganizationalUnit[]> = await api.get('/organizational-structure/units?tree=true');
    return response.data;
  },

  // Get root units (top level)
  getRoots: async (): Promise<OrganizationalUnit[]> => {
    const response: AxiosResponse<OrganizationalUnit[]> = await api.get('/organizational-structure/units/roots');
    return response.data;
  },

  // Get unit by ID
  getById: async (id: number): Promise<OrganizationalUnit> => {
    const response: AxiosResponse<OrganizationalUnit> = await api.get(`/organizational-structure/units/${id}`);
    return response.data;
  },

  // Get unit by code
  getByCode: async (code: string): Promise<OrganizationalUnit> => {
    const response: AxiosResponse<OrganizationalUnit> = await api.get(`/organizational-structure/units/code/${code}`);
    return response.data;
  },

  // Get descendants (sub-units)
  getDescendants: async (id: number): Promise<OrganizationalUnit[]> => {
    const response: AxiosResponse<OrganizationalUnit[]> = await api.get(`/organizational-structure/units/${id}/descendants`);
    return response.data;
  },

  // Get ancestors (parent units)
  getAncestors: async (id: number): Promise<OrganizationalUnit[]> => {
    const response: AxiosResponse<OrganizationalUnit[]> = await api.get(`/organizational-structure/units/${id}/ancestors`);
    return response.data;
  },

  // Create new unit
  create: async (data: CreateOrganizationalUnitDto): Promise<OrganizationalUnit> => {
    const response: AxiosResponse<OrganizationalUnit> = await api.post('/organizational-structure/units', data);
    return response.data;
  },

  // Update unit
  update: async (id: number, data: UpdateOrganizationalUnitDto): Promise<OrganizationalUnit> => {
    const response: AxiosResponse<OrganizationalUnit> = await api.patch(`/organizational-structure/units/${id}`, data);
    return response.data;
  },

  // Move unit to new parent
  moveUnit: async (id: number, newParentId: number | null): Promise<OrganizationalUnit> => {
    const response: AxiosResponse<OrganizationalUnit> = await api.patch(`/organizational-structure/units/${id}/move`, {
      newParentId
    });
    return response.data;
  },

  // Delete unit
  delete: async (id: number): Promise<void> => {
    await api.delete(`/organizational-structure/units/${id}`);
  },

  // Get statistics
  getStatistics: async (): Promise<OrganizationalStatistics> => {
    const response: AxiosResponse<OrganizationalStatistics> = await api.get('/organizational-structure/statistics');
    return response.data;
  },

  // Export structure
  exportStructure: async (): Promise<any> => {
    const response = await api.get('/organizational-structure/export');
    return response.data;
  }
};

export interface Director {
  id: number;
  fullName: string;
  degree?: string;
  phone?: string;
  email?: string;
  office?: string;
  biography?: string;
  biographyFile?: string;
  profileImage?: string;
  appointmentDate: string;
  terminationDate?: string;
  isCurrent: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  documents?: DirectorDocument[];
}

export interface DirectorDocument {
  id: number;
  title: string;
  type: DocumentType;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  path: string;
  description?: string;
  documentDate?: string;
  isPublic: boolean;
  uploadedAt: string;
  directorId: number;
}

export enum DocumentType {
  APPOINTMENT = 'appointment',        
  DECREE = 'decree',                 
  DECISION = 'decision',           
  CONTRACT = 'contract',            
  TERMINATION = 'termination',      
  CV = 'cv',                      
  DIPLOMA = 'diploma',            
  CERTIFICATE = 'certificate',      
  OTHER = 'other'                   
}

export interface CreateDirectorDto {
  fullName?: string;
  degree?: string;
  phone?: string;
  email?: string;
  office?: string;
  biography?: string;
  appointmentDate: string;
  terminationDate?: string | null;
  isCurrent?: boolean;
  isActive?: boolean;
}

export interface UpdateDirectorDto extends Partial<CreateDirectorDto> { }

export interface CreateDirectorDocumentDto {
  title: string;
  type: DocumentType;
  description?: string;
  documentDate?: string;
  isPublic?: boolean;
}

export interface DirectorStatistics {
  totalDirectors: number;
  hasCurrentDirector: boolean;
  currentDirector?: {
    id: number;
    fullName: string;
    appointmentDate: string;
  };
  totalDocuments: number;
  publicDocuments: number;
  documentsByType: Array<{
    type: DocumentType;
    count: number;
  }>;
}

// Directors API
export const directorsApi = {
  // Directors CRUD
  getAll: async (): Promise<Director[]> => {
    const response: AxiosResponse<Director[]> = await api.get('/organizational-structure/directors');
    return response.data;
  },

  getCurrent: async (): Promise<Director | null> => {
    const response: AxiosResponse<Director | null> = await api.get('/organizational-structure/directors/current');
    return response.data;
  },

  getById: async (id: number): Promise<Director> => {
    const response: AxiosResponse<Director> = await api.get(`/organizational-structure/directors/${id}`);
    return response.data;
  },

  create: async (data: CreateDirectorDto): Promise<Director> => {
    const response: AxiosResponse<Director> = await api.post('/organizational-structure/directors', data);
    return response.data;
  },

  update: async (id: number, data: UpdateDirectorDto): Promise<Director> => {
    const response: AxiosResponse<Director> = await api.patch(`/organizational-structure/directors/${id}`, data);
    return response.data;
  },

  setAsCurrent: async (id: number): Promise<Director> => {
    const response: AxiosResponse<Director> = await api.patch(`/organizational-structure/directors/${id}/set-current`);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/organizational-structure/directors/${id}`);
  },

  getStatistics: async (): Promise<DirectorStatistics> => {
    const response: AxiosResponse<DirectorStatistics> = await api.get('/organizational-structure/directors/statistics');
    return response.data;
  },

  // Document management
  uploadDocument: async (
    directorId: number,
    file: File,
    metadata: CreateDirectorDocumentDto
  ): Promise<DirectorDocument> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', metadata.title);
    formData.append('type', metadata.type);
    if (metadata.description) formData.append('description', metadata.description);
    if (metadata.documentDate) formData.append('documentDate', metadata.documentDate);
    if (metadata.isPublic !== undefined) formData.append('isPublic', metadata.isPublic.toString());

    const response: AxiosResponse<DirectorDocument> = await api.post(
      `/organizational-structure/directors/${directorId}/documents`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  getDocuments: async (directorId: number): Promise<DirectorDocument[]> => {
    const response: AxiosResponse<DirectorDocument[]> = await api.get(
      `/organizational-structure/directors/${directorId}/documents`
    );
    return response.data;
  },

  getPublicDocuments: async (directorId: number): Promise<DirectorDocument[]> => {
    const response: AxiosResponse<DirectorDocument[]> = await api.get(
      `/organizational-structure/directors/${directorId}/documents/public`
    );
    return response.data;
  },

  updateDocument: async (
    directorId: number,
    documentId: number,
    updateData: Partial<CreateDirectorDocumentDto>
  ): Promise<DirectorDocument> => {
    const response: AxiosResponse<DirectorDocument> = await api.patch(
      `/organizational-structure/directors/${directorId}/documents/${documentId}`,
      updateData
    );
    return response.data;
  },

  deleteDocument: async (directorId: number, documentId: number): Promise<void> => {
    await api.delete(`/organizational-structure/directors/${directorId}/documents/${documentId}`);
  },

  // File uploads
  uploadBiography: async (directorId: number, file: File): Promise<Director> => {
    const formData = new FormData();
    formData.append('file', file);

    const response: AxiosResponse<Director> = await api.post(
      `/organizational-structure/directors/${directorId}/biography`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  uploadProfileImage: async (directorId: number, file: File): Promise<Director> => {
    const formData = new FormData();
    formData.append('file', file);

    const response: AxiosResponse<Director> = await api.post(
      `/organizational-structure/directors/${directorId}/profile-image`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  // Utility functions
  getDocumentTypes: async (): Promise<Array<{ value: DocumentType; label: string; description: string }>> => {
    const response = await api.get('/organizational-structure/directors/document-types');
    return response.data;
  },

  getFileUrl: (filename: string): string => {
    // Уклањамо "uploads/" префикс ако постоји да избегнемо дуплирање
    const cleanFilename = filename.startsWith('uploads/')
      ? filename.replace('uploads/', '')
      : filename;

    return `${API_BASE_URL}/organizational-structure/directors/files/${cleanFilename}`;
  }
};

export const galleryApi = {
  // Gallery management
  create: async (data: CreateGalleryDto): Promise<Gallery> => {
    const response: AxiosResponse<Gallery> = await api.post('/galleries', data);
    return response.data;
  },

  getAll: async (params?: {
    status?: GalleryStatus;
    type?: GalleryType;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    galleries: Gallery[];
    total: number;
    page: number;
    totalPages: number;
  }> => {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.append('status', params.status);
    if (params?.type) searchParams.append('type', params.type);
    if (params?.search) searchParams.append('search', params.search);
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());

    const url = `/galleries${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    const response = await api.get(url);
    return response.data;
  },

  getPublished: async (params?: {
    type?: GalleryType;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    galleries: Gallery[];
    total: number;
    page: number;
    totalPages: number;
  }> => {
    const searchParams = new URLSearchParams();
    if (params?.type) searchParams.append('type', params.type);
    if (params?.search) searchParams.append('search', params.search);
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());

    const url = `/galleries/published${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    const response = await api.get(url);
    return response.data;
  },

  getById: async (id: number): Promise<Gallery> => {
    const response: AxiosResponse<Gallery> = await api.get(`/galleries/${id}`);
    return response.data;
  },

  getBySlug: async (slug: string): Promise<Gallery> => {
    const response: AxiosResponse<Gallery> = await api.get(`/galleries/slug/${slug}`);
    return response.data;
  },

  update: async (id: number, data: UpdateGalleryDto): Promise<Gallery> => {
    const response: AxiosResponse<Gallery> = await api.patch(`/galleries/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/galleries/${id}`);
  },

  getStatistics: async (): Promise<GalleryStatistics> => {
    const response: AxiosResponse<GalleryStatistics> = await api.get('/galleries/statistics');
    return response.data;
  },

  getTypes: async (): Promise<Array<{ value: GalleryType; label: string; description: string }>> => {
    const response = await api.get('/galleries/types');
    return response.data;
  },

  // Image management within galleries - FIXED SECTION
  uploadImages: async (galleryId: number, files: File[], imageData?: CreateGalleryImageDto): Promise<GalleryImage[]> => {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });

    if (imageData?.title) formData.append('title', imageData.title);
    if (imageData?.description) formData.append('description', imageData.description);
    if (imageData?.alt) formData.append('alt', imageData.alt);
    if (imageData?.sortOrder !== undefined) formData.append('sortOrder', imageData.sortOrder.toString());

    console.log('Uploading to gallery:', galleryId);
    console.log('Files to upload:', files.map(f => f.name));

    const response: AxiosResponse<GalleryImage[]> = await api.post(`/galleries/${galleryId}/images`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getImages: async (galleryId: number): Promise<GalleryImage[]> => {
    const response: AxiosResponse<GalleryImage[]> = await api.get(`/galleries/${galleryId}/images`);
    return response.data;
  },

  updateImage: async (galleryId: number, imageId: number, data: UpdateGalleryImageDto): Promise<GalleryImage> => {
    const response: AxiosResponse<GalleryImage> = await api.patch(`/galleries/${galleryId}/images/${imageId}`, data);
    return response.data;
  },

  deleteImage: async (galleryId: number, imageId: number): Promise<void> => {
    await api.delete(`/galleries/${galleryId}/images/${imageId}`);
  },

  setCoverImage: async (galleryId: number, imageId: number): Promise<Gallery> => {
    const response: AxiosResponse<Gallery> = await api.patch(`/galleries/${galleryId}/cover/${imageId}`);
    return response.data;
  },

  reorderImages: async (galleryId: number, imageOrders: Array<{ id: number; sortOrder: number }>): Promise<GalleryImage[]> => {
    console.log('Reordering images for gallery:', galleryId);
    console.log('Image orders:', imageOrders);

    const response: AxiosResponse<GalleryImage[]> = await api.put(`/galleries/${galleryId}/images/reorder`, {
      imageOrders
    });
    return response.data;
  },
  addExistingMediaToGallery: async (galleryId: number, mediaIds: number[]): Promise<GalleryImage[]> => {
    const response: AxiosResponse<GalleryImage[]> = await api.post(`/galleries/${galleryId}/add-existing-media`, {
      mediaIds
    });
    return response.data;
  },

  getImageUrl: (filename: string): string => {
    // Remove any existing path prefixes to avoid duplication
    const cleanFilename = filename
      .replace('uploads/', '')
      .replace('gallery-', '')
      .replace(/^.*[\\\/]/, ''); // Remove any directory path

    return `${API_BASE_URL}/galleries/images/${cleanFilename}`;
  },

  // Get only image media files for gallery creation
  getImageMedia: async (): Promise<Media[]> => {
    const allMedia = await mediaApi.getAll();
    return allMedia.filter(media => media.mimeType.startsWith('image/'));
  },


  // Alternative method - copy media files by filename  
  addExistingMediaByFilename: async (galleryId: number, filenames: string[]): Promise<GalleryImage[]> => {
    const response: AxiosResponse<GalleryImage[]> = await api.post(`/galleries/${galleryId}/add-existing-media-by-filename`, {
      filenames
    });
    return response.data;
  },
};

export const servicesApi = {
  // Services CRUD
  getAll: async (params?: {
    status?: ServiceStatus;
    type?: ServiceType;
    priority?: ServicePriority;
    search?: string;
    isOnline?: boolean;
    requiresAppointment?: boolean;
    page?: number;
    limit?: number;
  }): Promise<ServicesResponse> => {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.append('status', params.status);
    if (params?.type) searchParams.append('type', params.type);
    if (params?.priority) searchParams.append('priority', params.priority);
    if (params?.search) searchParams.append('search', params.search);
    if (params?.isOnline !== undefined) searchParams.append('isOnline', params.isOnline.toString());
    if (params?.requiresAppointment !== undefined) searchParams.append('requiresAppointment', params.requiresAppointment.toString());
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());

    const url = `/services${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    const response: AxiosResponse<ServicesResponse> = await api.get(url);
    return response.data;
  },

  getPublished: async (params?: {
    type?: ServiceType;
    priority?: ServicePriority;
    search?: string;
    isOnline?: boolean;
    requiresAppointment?: boolean;
    page?: number;
    limit?: number;
  }): Promise<ServicesResponse> => {
    const searchParams = new URLSearchParams();
    if (params?.type) searchParams.append('type', params.type);
    if (params?.priority) searchParams.append('priority', params.priority);
    if (params?.search) searchParams.append('search', params.search);
    if (params?.isOnline !== undefined) searchParams.append('isOnline', params.isOnline.toString());
    if (params?.requiresAppointment !== undefined) searchParams.append('requiresAppointment', params.requiresAppointment.toString());
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());

    const url = `/services/published${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    const response: AxiosResponse<ServicesResponse> = await api.get(url);
    return response.data;
  },

  getById: async (id: number): Promise<Service> => {
    const response: AxiosResponse<Service> = await api.get(`/services/${id}`);
    return response.data;
  },

  getBySlug: async (slug: string): Promise<Service> => {
    const response: AxiosResponse<Service> = await api.get(`/services/slug/${slug}`);
    return response.data;
  },

  getByType: async (type: ServiceType): Promise<Service[]> => {
    const response: AxiosResponse<Service[]> = await api.get(`/services/by-type/${type}`);
    return response.data;
  },

  create: async (data: CreateServiceDto): Promise<Service> => {
    const response: AxiosResponse<Service> = await api.post('/services', data);
    return response.data;
  },

  update: async (id: number, data: UpdateServiceDto): Promise<Service> => {
    const response: AxiosResponse<Service> = await api.patch(`/services/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/services/${id}`);
  },

  incrementRequestCount: async (slug: string): Promise<void> => {
    await api.patch(`/services/${slug}/request`);
  },
  
  // Statistics
  getStatistics: async (): Promise<ServiceStatistics> => {
    const response: AxiosResponse<ServiceStatistics> = await api.get('/services/statistics');
    return response.data;
  },

  // Metadata
  getServiceTypes: async (): Promise<ServiceTypeInfo[]> => {
    const response: AxiosResponse<ServiceTypeInfo[]> = await api.get('/services/types');
    return response.data;
  },

  getServicePriorities: async (): Promise<ServicePriorityInfo[]> => {
    const response: AxiosResponse<ServicePriorityInfo[]> = await api.get('/services/priorities');
    return response.data;
  },

  getDocumentTypes: async (): Promise<ServiceDocumentTypeInfo[]> => {
    const response: AxiosResponse<ServiceDocumentTypeInfo[]> = await api.get('/services/document-types');
    return response.data;
  },

  // Document management
  uploadDocument: async (
    serviceId: number,
    file: File,
    metadata: CreateServiceDocumentDto
  ): Promise<ServiceDocument> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', metadata.title);
    formData.append('type', metadata.type);
    if (metadata.description) formData.append('description', metadata.description);
    if (metadata.sortOrder !== undefined) formData.append('sortOrder', metadata.sortOrder.toString());
    if (metadata.isActive !== undefined) formData.append('isActive', metadata.isActive.toString());
    if (metadata.isPublic !== undefined) formData.append('isPublic', metadata.isPublic.toString());

    const response: AxiosResponse<ServiceDocument> = await api.post(
      `/services/${serviceId}/documents`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  getDocuments: async (serviceId: number): Promise<ServiceDocument[]> => {
    const response: AxiosResponse<ServiceDocument[]> = await api.get(`/services/${serviceId}/documents`);
    return response.data;
  },

  getPublicDocuments: async (serviceId: number): Promise<ServiceDocument[]> => {
    const response: AxiosResponse<ServiceDocument[]> = await api.get(`/services/${serviceId}/documents/public`);
    return response.data;
  },

  updateDocument: async (
    serviceId: number,
    documentId: number,
    data: UpdateServiceDocumentDto
  ): Promise<ServiceDocument> => {
    const response: AxiosResponse<ServiceDocument> = await api.patch(
      `/services/${serviceId}/documents/${documentId}`,
      data
    );
    return response.data;
  },

  deleteDocument: async (serviceId: number, documentId: number): Promise<void> => {
    await api.delete(`/services/${serviceId}/documents/${documentId}`);
  },

  downloadDocument: async (serviceId: number, documentId: number): Promise<void> => {
    // This will increment download count and redirect to file
    window.open(`${API_BASE_URL}/services/${serviceId}/documents/${documentId}/download`, '_blank');
  },

  // Utility functions
  getFileUrl: (filename: string): string => {
    const cleanFilename = filename.startsWith('uploads/')
      ? filename.replace('uploads/', '')
      : filename;

    return `${API_BASE_URL}/services/files/${cleanFilename}`;
  }
};

export interface RelofIndexScore {
  id: number;
  totalScore: number;
  categoryScores: Record<string, {
    score: number;
    maxScore: number;
    percentage: number;
  }>;
  requirements: RequirementResult[];
  recommendations: Recommendation[];
  summary: string;
  notificationSent: boolean;
  lastNotificationSent?: string;
  calculatedAt: string;
  updatedAt: string;
}

export interface RequirementResult {
  id: string;
  category: string;
  name: string;
  description: string;
  status: 'fulfilled' | 'partial' | 'missing' | 'outdated';
  priority: 'critical' | 'high' | 'medium' | 'low';
  points: number;
  lastChecked: string;
  daysOverdue?: number;
  specificIssues?: string[];
}

export interface Recommendation {
  category: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  estimatedImpact: number;
  actionItems: string[];
}

export interface DashboardData {
  score: {
    current: number;
    previous: number | null; // NEW: Previous score for comparison
    change: number | null;   // NEW: Score change from previous
    grade: string;
    calculatedAt: string;
  };
  quickStats: {
    totalRequirements: number;
    fulfilledRequirements: number;
    criticalIssues: number;
    pendingRecommendations: number;
  };
  documentStats: {           // NEW: Document-specific statistics
    total: number;
    fulfilled: number;
    critical: number;
  };
  alerts: {
    critical: RequirementResult[];
    recommendations: Recommendation[];
  };
  trends: {
    history: Array<{
      date: string;
      score: number;
      change: number | null;    // NEW: Change for each history point
      isImproving: boolean;     // NEW: Improvement flag for each point
    }>;
    isImproving: boolean | null; // Now reliably calculated from DB
  };
  system: {
    totalConnections?: number;
    subscribedClients?: number;
    timestamp?: string;
    serverReady?: boolean;
    lastCalculation: string;
    autoCalculationEnabled: boolean;
  };
}

export interface StatisticsData {
  period: string;
  current: {
    score: number;
    calculatedAt: string;
  };
  trends: {
    averageScore: number;
    trend: number;
    improvementRate: number;
    isImproving: boolean;
  };
  extremes: {
    bestScore: {
      score: number;
      date: string;
    };
    worstScore: {
      score: number;
      date: string;
    };
  };
  dataPoints: number;
  lastUpdated: string;
}

export interface CategoryBreakdown {
  categories: Array<{
    category: string;
    displayName: string;
    scores: {
      score: number;
      maxScore: number;
      percentage: number;
    };
    requirements: {
      total: number;
      fulfilled: number;
      partial: number;
      missing: number;
    };
    topIssues: Array<{
      name: string;
      status: string;
      priority: string;
      issues: string[];
    }>;
  }>;
  lastUpdated: string;
  totalScore: number;
}

// Add this to your existing API exports
export const relofIndexApi = {
  // Get current score
  getCurrentScore: async (): Promise<RelofIndexScore> => {
    const response: AxiosResponse<RelofIndexScore> = await api.get('/relof-index/current');
    return response.data;
  },

  // Get score history
  getScoreHistory: async (days: number = 30): Promise<RelofIndexScore[]> => {
    const response: AxiosResponse<RelofIndexScore[]> = await api.get(`/relof-index/history?days=${days}`);
    return response.data;
  },

  // Trigger recalculation
  recalculateScore: async (reason?: string): Promise<{
    message: string;
    reason: string;
    newScore: RelofIndexScore;
    calculationTime: number;
    timestamp: string;
  }> => {
    const response = await api.post('/relof-index/recalculate', { reason });
    return response.data;
  },

  // Get requirements with filters
  getRequirements: async (filters?: {
    category?: string;
    status?: string;
    priority?: string;
  }): Promise<{
    total: number;
    filtered: {
      category?: string;
      status?: string;
      priority?: string;
    };
    requirements: Record<string, RequirementResult[]>;
    lastUpdated: string;
  }> => {
    const params = new URLSearchParams();
    if (filters?.category) params.append('category', filters.category);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.priority) params.append('priority', filters.priority);

    const response = await api.get(`/relof-index/requirements?${params.toString()}`);
    return response.data;
  },

  // Get recommendations
  getRecommendations: async (filters?: {
    priority?: string;
    limit?: number;
  }): Promise<{
    total: number;
    totalEstimatedImpact: number;
    recommendations: Recommendation[];
    lastUpdated: string;
  }> => {
    const params = new URLSearchParams();
    if (filters?.priority) params.append('priority', filters.priority);
    if (filters?.limit) params.append('limit', filters.limit.toString());

    const response = await api.get(`/relof-index/recommendations?${params.toString()}`);
    return response.data;
  },

  // Get category breakdown
  getCategoryBreakdown: async (): Promise<CategoryBreakdown> => {
    const response: AxiosResponse<CategoryBreakdown> = await api.get('/relof-index/categories');
    return response.data;
  },

  // Get statistics and trends
  getStatistics: async (period: string = '30d'): Promise<StatisticsData> => {
    const response: AxiosResponse<StatisticsData> = await api.get(`/relof-index/statistics?period=${period}`);
    return response.data;
  },

  // Get dashboard data
  getDashboardData: async (): Promise<DashboardData> => {
    const response: AxiosResponse<DashboardData> = await api.get('/relof-index/dashboard');
    console.log(response);
    return response.data;
  },

  // Trigger notification
  triggerNotification: async (): Promise<{
    success: boolean;
    message: string;
    data?: {
      score: number;
      issuesCount: number;
      criticalIssuesCount?: number;
      recommendationsCount?: number;
      allRequirementsFulfilled?: boolean;
    };
    timestamp: string;
  }> => {
    const response = await api.post('/relof-index/trigger-notification');
    return response.data;
  }
};
