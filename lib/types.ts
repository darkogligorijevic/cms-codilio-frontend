// lib/types.ts
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
}

export interface Media {
  id: number;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
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

// DTO types
export interface CreatePostDto {
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  status?: PostStatus;
  categoryId?: number;
  featuredImage?: string;
}

export interface UpdatePostDto extends Partial<CreatePostDto> {}

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