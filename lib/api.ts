// lib/api.ts - Updated API functions
import axios, { AxiosResponse } from 'axios';
import type {
  Post,
  Page,
  Category,
  Media,
  User,
  PostsResponse,
  AuthResponse,
  LoginCredentials,
  CreatePostDto,
  UpdatePostDto,
  CreatePageDto,
  UpdatePageDto,
  CreateCategoryDto,
  UpdateCategoryDto,
  CreateMediaDto,
  Contact,
  CreateContactDto,
  UpdateContactDto,
  SubscribeToNewsletterDto,
  NewsletterSubscribe,
  SendNewsletterDto,
  CreateEmailTemplateDto,
  EmailTemplate,
  UpdateEmailTemplateDto
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

  updateContact: async (id:number, data: UpdateContactDto): Promise<Contact> => {
    const response: AxiosResponse<Contact> = await api.patch(`/mailer/contacts/${id}`, data);
    return response.data;
  },

  deleteContact: async (id: number): Promise<Contact> => {
    const response: AxiosResponse<Contact> = await api.delete(`/mailer/contacts/${id}`);
    return response.data;
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

  // ovo moze biti i patch (vise mi ima smisla)
  unsubscribeToNewsletter: async (token: string): Promise<NewsletterSubscribe> => {
    const response: AxiosResponse<NewsletterSubscribe> = await api.post(`/mailer/newsletter/unsubscribe/${token}`);
    return response.data;
  },
 
  getAllSubscribers: async (): Promise<NewsletterSubscribe> => {
    const response: AxiosResponse<NewsletterSubscribe> = await api.get('/mailer/newsletter/subscribers');
    return response.data;
  },

  getAllActiveSubscribers: async (): Promise<NewsletterSubscribe> => {
    const response: AxiosResponse<NewsletterSubscribe> = await api.get('/mailer/newsletter/subscribers/active');
    return response.data;
  },

  // Ovo me zbunilo jer koristi podatke kao kod templates a spada pod newsletter
  sendNewsletter: async (data: SendNewsletterDto): Promise<NewsletterSubscribe> => {
    const response: AxiosResponse<NewsletterSubscribe> = await api.post('mailer/newsletter/send', data);
    return response.data;
  },

  // TEMPLATES
  createEmailTemplate: async (data: CreateEmailTemplateDto): Promise<EmailTemplate> => {
    const response: AxiosResponse<EmailTemplate> = await api.post('/mailer/templates', data);
    return response.data;
  },

  getAllEmailTemplates: async (): Promise<EmailTemplate> => {
    const response: AxiosResponse<EmailTemplate> = await api.get('/mailer/templates');
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

  deleteEmailTemplate: async (id: number): Promise<EmailTemplate> => {
    const response: AxiosResponse<EmailTemplate> = await api.delete(`/mailer/templates/${id}`);
    return response.data;
  }

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