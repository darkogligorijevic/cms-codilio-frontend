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

export enum MediaCategory {
  PROCUREMENT = 'procurement', // Javne Nabavke
  FINANCIAL = 'financial',     // Finansijski izveštaji
  DECISIONS = 'decisions',     // Odluke sa sastanaka
  PLANS = 'plans',             // Godišnji planovi
  REPORTS = 'reports',         // Izveštaji o radu
  OTHER = 'other'              // Ostalo
}


export interface User {
  id: number;
  email: string;
  name: string;
  role: UserRole; 
  isActive?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserDto {
  email?: string;
  name?: string;
  password?: string;
  role?: UserRole;
  isActive?: boolean;
}

export interface UserWithStats extends User {
  postsCount: number;
  lastPostDate?: string;
  recentPosts: Array<{
    id: number;
    title: string;
    slug: string;
    createdAt: string;
    status: string;
  }>;
}

export interface UsersStatistics {
  totalUsers: number;
  activeUsers: number;
  admins: number;
  authors: number;
  totalPosts: number;
  recentPosts: number;
}

export interface UpdateUserDto extends CreateUserDto {
  isActive?: boolean;
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
  category: MediaCategory;
  description?: string;
  isPublic: boolean;
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

export interface ReplyToContactDto {
  subject: string;
  message: string;
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
  viewCount?: number;
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
  name?: string;
  title?: string;
  type?: ContactType;
  phone?: string;
  email?: string;
  office?: string;
  order?: number;
  subject?: string;
  message?: string;
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
  category?: MediaCategory;
  description?: string;
  isPublic?: boolean;
}


export interface UpdateMediaDto extends CreateMediaDto {}


export interface MediaCategoryInfo {
  value: MediaCategory;
  label: string;
  description: string;
}


export interface FindMediaOptions {
  category?: MediaCategory;
  isPublic?: boolean;
  search?: string;
}


export interface MediaCategoryStats {
  category: MediaCategory;
  count: number;
  totalSize: number;
}


export interface PageSelectionOption {
  id: number;
  title: string;
  slug: string;
}

// Add to lib/types.ts

export enum SettingType {
  TEXT = 'text',
  NUMBER = 'number',
  BOOLEAN = 'boolean',
  JSON = 'json',
  FILE = 'file',
  COLOR = 'color',
  SELECT = 'select'
}

export enum SettingCategory {
  GENERAL = 'general',
  CONTACT = 'contact',
  SOCIAL = 'social',
  SEO = 'seo',
  EMAIL = 'email',
  APPEARANCE = 'appearance',
  ADVANCED = 'advanced'
}

export interface Setting {
  id: number;
  key: string;
  value: string;
  type: SettingType;
  category: SettingCategory;
  label: string;
  description?: string;
  options?: string[]; // For select type
  validation?: {
    required?: boolean;
    min?: number;
    max?: number;
    pattern?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface SettingsGroup {
  category: SettingCategory;
  settings: Setting[];
}

// DTOs
export interface UpdateSettingDto {
  value: string;
}

export interface UpdateMultipleSettingsDto {
  settings: {
    key: string;
    value: string;
  }[];
}

export interface ImportSettingsDto {
  settings: Record<string, string>;
}

// Predefined setting keys
export const SETTING_KEYS = {
  // General
  SITE_NAME: 'site_name',
  SITE_TAGLINE: 'site_tagline',
  SITE_LOGO: 'site_logo',
  SITE_FAVICON: 'site_favicon',
  SITE_LANGUAGE: 'site_language',
  TIMEZONE: 'timezone',
  
  // Contact
  CONTACT_ADDRESS: 'contact_address',
  CONTACT_PHONE: 'contact_phone',
  CONTACT_EMAIL: 'contact_email',
  CONTACT_WORKING_HOURS: 'contact_working_hours',
  CONTACT_MAP_URL: 'contact_map_url',
  
  // Social
  SOCIAL_FACEBOOK: 'social_facebook',
  SOCIAL_TWITTER: 'social_twitter',
  SOCIAL_INSTAGRAM: 'social_instagram',
  SOCIAL_LINKEDIN: 'social_linkedin',
  SOCIAL_YOUTUBE: 'social_youtube',
  
  // SEO
  SEO_TITLE: 'seo_title',
  SEO_DESCRIPTION: 'seo_description',
  SEO_KEYWORDS: 'seo_keywords',
  SEO_GOOGLE_ANALYTICS: 'seo_google_analytics',
  SEO_GOOGLE_TAG_MANAGER: 'seo_google_tag_manager',
  
  // Email
  EMAIL_SMTP_HOST: 'email_smtp_host',
  EMAIL_SMTP_PORT: 'email_smtp_port',
  EMAIL_SMTP_USER: 'email_smtp_user',
  EMAIL_SMTP_PASS: 'email_smtp_pass',
  EMAIL_FROM_NAME: 'email_from_name',
  EMAIL_FROM_ADDRESS: 'email_from_address',
  
  // Appearance
  THEME_PRIMARY_COLOR: 'theme_primary_color',
  THEME_SECONDARY_COLOR: 'theme_secondary_color',
  THEME_FONT_FAMILY: 'theme_font_family',
  THEME_DARK_MODE: 'theme_dark_mode',
  
  // Advanced
  MAINTENANCE_MODE: 'maintenance_mode',
  MAINTENANCE_MESSAGE: 'maintenance_message',
  API_KEY_GOOGLE_MAPS: 'api_key_google_maps',
  POSTS_PER_PAGE: 'posts_per_page',
  ALLOW_COMMENTS: 'allow_comments',
  ALLOW_REGISTRATION: 'allow_registration'
} as const;

// Settings structure for the frontend
export interface SiteSettings {
  // General
  siteName: string;
  siteTagline: string;
  siteLogo?: string;
  siteFavicon?: string;
  siteLanguage: string;
  timezone: string;
  
  // Contact
  contactAddress: string;
  contactPhone: string;
  contactEmail: string;
  contactWorkingHours: string;
  contactMapUrl?: string;
  
  // Social
  socialFacebook?: string;
  socialTwitter?: string;
  socialInstagram?: string;
  socialLinkedin?: string;
  socialYoutube?: string;
  
  // SEO
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  seoGoogleAnalytics?: string;
  seoGoogleTagManager?: string;
  
  // Email
  emailSmtpHost?: string;
  emailSmtpPort?: number;
  emailSmtpUser?: string;
  emailFromName?: string;
  emailFromAddress?: string;
  
  // Appearance
  themePrimaryColor?: string;
  themeSecondaryColor?: string;
  themeFontFamily?: string;
  themeDarkMode?: boolean;
  
  // Advanced
  maintenanceMode?: boolean;
  maintenanceMessage?: string;
  postsPerPage?: number;
  allowComments?: boolean;
  allowRegistration?: boolean;
}
// Add these interfaces to lib/types.ts:
export interface SetupStatusResponse {
  isSetupCompleted: boolean;
  hasAdminUser: boolean;
}

export interface CompleteSetupDto {
  siteName: string;
  siteTagline: string;
  adminName: string;
  adminEmail: string;
  adminPassword: string;
  contactEmail: string;
}

export interface CompleteSetupResponse {
  success: boolean;
  access_token: string;
  user: User;
  message: string;
}

export interface UserWithStats extends User {
  postsCount: number;
  lastPostDate?: string;
  recentPosts: Array<{
    id: number;
    title: string;
    slug: string;
    createdAt: string;
    status: string;
  }>;
}


export interface UsersStatistics {
  totalUsers: number;
  activeUsers: number;
  admins: number;
  authors: number;
  totalPosts: number;
  recentPosts: number;
}

// Profile update DTO
export interface UpdateProfileDto {
  name?: string;
  email?: string;
  currentPassword?: string;
  newPassword?: string;
}

// Security settings interface
export interface SecuritySettings {
  twoFactorEnabled: boolean;
  activeSessions: SessionInfo[];
  lastPasswordChange?: string;
  loginAttempts?: number;
}

// Session information interface
export interface SessionInfo {
  id: string;
  device: string;
  browser: string;
  ip: string;
  location?: string;
  lastActivity: string;
  current: boolean;
}

export enum UnitType {
  DEPARTMENT = 'department',
  DIVISION = 'division',
  SECTOR = 'sector',
  SERVICE = 'service',
  OFFICE = 'office',
  COMMITTEE = 'committee',
  OTHER = 'other'
}

export enum ContactType {
  MANAGER = 'manager',
  DEPUTY = 'deputy',
  SECRETARY = 'secretary',
  COORDINATOR = 'coordinator',
  SPECIALIST = 'specialist',
  OTHER = 'other'
}

export interface ContactInfo {
  id: number;
  name: string;
  title: string;
  type: ContactType;
  phone?: string;
  email?: string;
  office?: string;
  order: number;
  unitId: number;
  createdAt: string;
  updatedAt: string;
}

export interface OrganizationalUnit {
  id: number;
  name: string;
  code: string;
  type: UnitType;
  description?: string;
  managerName?: string;
  managerTitle?: string;
  phone?: string;
  email?: string;
  location?: string;
  employeeCount: number;
  isActive: boolean;
  parentId?: number;
  parent?: OrganizationalUnit;
  children?: OrganizationalUnit[];
  contacts?: ContactInfo[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrganizationalUnitDto {
  name: string;
  code: string;
  type: UnitType;
  description?: string;
  managerName?: string;
  managerTitle?: string;
  phone?: string;
  email?: string;
  location?: string;
  employeeCount?: number;
  parentId?: number;
  contacts?: CreateContactDto[];
}

export interface UpdateOrganizationalUnitDto extends Partial<CreateOrganizationalUnitDto> {}

export interface MoveUnitDto {
  newParentId: number | null;
}

export interface OrganizationalStatistics {
  totalUnits: number;
  activeUnits: number;
  unitsByType: Array<{
    type: UnitType;
    count: number;
  }>;
  totalEmployees: number;
}



