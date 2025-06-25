// lib/api.ts - Updated API functions
import axios, { Axios, AxiosResponse } from 'axios';
import {
  type Post,
  type Page,
  type Category,
  type Media,
  type User,
  type PostsResponse,
  type AuthResponse,
  type LoginCredentials,
  type CreatePostDto,
  type UpdatePostDto,
  type CreatePageDto,
  type UpdatePageDto,
  type CreateCategoryDto,
  type UpdateCategoryDto,
  type CreateMediaDto,
  type Contact,
  type CreateContactDto,
  type UpdateContactDto,
  type SubscribeToNewsletterDto,
  type NewsletterSubscribe,
  type SendNewsletterDto,
  type CreateEmailTemplateDto,
  type EmailTemplate,
  type UpdateEmailTemplateDto,
  type ReplyToContactDto,
  ImportSettingsDto,
  Setting,
  SettingCategory,
  SettingType,
  SiteSettings,
  UpdateMultipleSettingsDto,
  UpdateSettingDto,
  CreateUserDto,
  UpdateUserDto,
  UsersStatistics,
  UserWithStats,
  CompleteSetupDto,
  CompleteSetupResponse,
  SetupStatusResponse,
  UpdateMediaDto,
  FindMediaOptions,
  MediaCategory,
  MediaCategoryInfo,
  MediaCategoryStats,
  CreateOrganizationalUnitDto,
  OrganizationalStatistics,
  OrganizationalUnit,
  UpdateOrganizationalUnitDto,
  CreateGalleryDto,
  CreateGalleryImageDto,
  Gallery,
  GalleryImage,
  GalleryStatistics,
  GalleryStatus,
  GalleryType,
  UpdateGalleryDto,
  UpdateGalleryImageDto,
  AvailableParentPage
} from './types';

const API_BASE_URL = 'http://localhost:3001/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
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

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
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
  getAll: async (): Promise<Page[]> => {
    const response: AxiosResponse<Page[]> = await api.get('/pages');
    return response.data;
  },

  getPublished: async (): Promise<Page[]> => {
    const response: AxiosResponse<Page[]> = await api.get('/pages/published');
    return response.data;
  },

  // New method for hierarchical structure
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

  // Updated method for getting pages for selection dropdown
  getAllForSelection: async (): Promise<PageSelectionOption[]> => {
    const response: AxiosResponse<PageSelectionOption[]> = await api.get('/pages/for-selection');
    return response.data;
  },

  // New method for getting available parent pages
  getAvailableParents: async (excludeId?: number): Promise<AvailableParentPage[]> => {
    let url = '/pages/available-parents';
    if (excludeId) {
      url += `?excludeId=${excludeId}`;
    }
    const response: AxiosResponse<AvailableParentPage[]> = await api.get(url);
    return response.data;
  },

  create: async (data: CreatePageDto): Promise<Page> => {
    const response: AxiosResponse<Page> = await api.post('/pages', data);
    return response.data;
  },

  update: async (id: number, data: UpdatePageDto): Promise<Page> => {
    const response: AxiosResponse<Page> = await api.patch(`/pages/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/pages/${id}`);
  }
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
};

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
  APPOINTMENT = 'appointment',        // Решење о именовању
  DECREE = 'decree',                 // Указ
  DECISION = 'decision',             // Одлука
  CONTRACT = 'contract',             // Уговор
  TERMINATION = 'termination',       // Решење о разрешењу
  CV = 'cv',                         // Биографија/CV
  DIPLOMA = 'diploma',               // Диплома
  CERTIFICATE = 'certificate',       // Сертификат
  OTHER = 'other'                    // Остало
}

export interface CreateDirectorDto {
  fullName?: string;
  degree?: string;
  phone?: string;
  email?: string;
  office?: string;
  biography?: string;
  appointmentDate: string;
  terminationDate?: string;
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