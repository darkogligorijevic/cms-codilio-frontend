// lib/api.ts - Updated API functions
import axios, { AxiosResponse } from 'axios';
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
  UserWithStats
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
        window.location.href = '/login';
      }
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
  
  getById: async (id: number): Promise<Page> => {
    const response: AxiosResponse<Page> = await api.get(`/pages/${id}`);
    return response.data;
  },
  
  getBySlug: async (slug: string): Promise<Page> => {
    const response: AxiosResponse<Page> = await api.get(`/pages/slug/${slug}`);
    return response.data;
  },
  
  // New method for getting pages for selection dropdown
  getAllForSelection: async (): Promise<PageSelectionOption[]> => {
    const response: AxiosResponse<PageSelectionOption[]> = await api.get('/pages/for-selection');
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
  getAll: async (): Promise<Media[]> => {
    const response: AxiosResponse<Media[]> = await api.get('/media');
    console.log(response);
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
    
    const response: AxiosResponse<Media> = await api.post('/media/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  
  update: async (id: number, file?: File, data?: CreateMediaDto): Promise<Media> => {
    const formData = new FormData();
    
    if (file) formData.append('file', file);
    if (data?.alt) formData.append('alt', data.alt);
    if (data?.caption) formData.append('caption', data.caption);
    
    const response: AxiosResponse<Media> = await api.patch(`/media/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  
  delete: async (id: number): Promise<void> => {
    await api.delete(`/media/${id}`);
  },
  
  getFileUrl: (filename: string): string => {
    return `${API_BASE_URL}/media/file/${filename}`;
  }
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