// lib/types.ts - Updated with page assignment support
export enum PostStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published'
}

export enum PageStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published'
}

export enum UserRole {
  ADMIN = 'admin',
  AUTHOR = 'author'
}

export interface User {
  id: number;
  email: string;
  name: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  posts?: Post[];
}

export interface Page {
  id: number;
  title: string;
  slug: string;
  content: string;
  status: PageStatus;
  template: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  authorId: number;
  author: User;
  posts?: Post[]; // Many-to-many relationship with posts
}

export interface Post {
  id: number;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  status: PostStatus;
  featuredImage?: string;
  viewCount: number;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  authorId: number;
  categoryId?: number;
  author: User;
  category?: Category;
  pages?: Page[]; // Many-to-many relationship with pages
}

export interface Media {
  id: number;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  path: string;
  alt?: string;
  caption?: string;
  createdAt: string;
  updatedAt: string;
}

// API Response types
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
}

export interface PostsResponse {
  posts: Post[];
  total: number;
  page: number;
  totalPages: number;
}

// Auth types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

// Contact status enum
export enum ContactStatus {
  NEW = 'new',
  READ = 'read',
  REPLIED = 'replied',
  ARCHIVED = 'archived'
}

export enum SubscriberStatus {
  ACTIVE = 'active',
  UNSUBSCRIBED = 'unsubscribed',
  BOUNCED = 'bounced'
}

export enum TemplateType {
  CONTACT_CONFIRMATION = 'contact_confirmation',
  CONTACT_NOTIFICATION = 'contact_notification',
  NEWSLETTER_WELCOME = 'newsletter_welcome',
  NEWSLETTER_UNSUBSCRIBE = 'newsletter_unsubscribe',
  CUSTOM = 'custom',
}

// Contact Interface
export interface Contact {
  id: number;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  status: ContactStatus;
  isRead: boolean;
  createdAt: Date;
}

// Newsletter Subscribe Interface
export interface NewsletterSubscribe {
  id: number;
  email: string;
  name: string;
  status: SubscriberStatus;
  unsubscribeToken: string;
  subscribedAt: Date;
  updatedAt: Date;
}

// Email Template
export interface EmailTemplate {
  id: number;
  name: string;
  type: TemplateType;
  subject: string;
  htmlContent: string;
  textContent: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// DTO types with page assignment support
export interface CreatePostDto {
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  status?: PostStatus;
  categoryId?: number;
  featuredImage?: string;
  pageIds?: number[]; // Array of page IDs to assign the post to
  publishedAt?: Date;
}

export interface CreateEmailTemplateDto {
  name: string;
  type: TemplateType;
  subject: string;
  htmlContent: string;
  textContent: string;
  isActive: boolean;
}

export interface SendNewsletterDto {
  subject: string;
  htmlContent: string;
  textContent: string;
  testEmails: string[];
}

export interface SubscribeToNewsletterDto {
  email: string;
  name: string;
}

export interface CreateContactDto {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

export interface UpdateEmailTemplateDto extends CreateEmailTemplateDto {}

export interface UpdateContactDto extends Partial<CreateContactDto> {
  status: ContactStatus;
}

export interface UpdatePostDto extends Partial<CreatePostDto> {
  pageIds?: number[]; // Array of page IDs to assign the post to
}

export interface CreatePageDto {
  title: string;
  slug: string;
  content: string;
  status?: PageStatus;
  template?: string;
  sortOrder?: number;
}

export interface UpdatePageDto extends Partial<CreatePageDto> {}

export interface CreateCategoryDto {
  name: string;
  slug: string;
  description?: string;
}

export interface UpdateCategoryDto extends Partial<CreateCategoryDto> {}

export interface CreateMediaDto {
  alt?: string;
  caption?: string;
}

// Page selection interface for dropdown
export interface PageSelectionOption {
  id: number;
  title: string;
  slug: string;
}