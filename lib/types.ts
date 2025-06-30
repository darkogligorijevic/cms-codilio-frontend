// lib/types.ts - Updated with page assignment support
import { InstitutionType } from './institution-templates';

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
  content?: string | null;
  status: PageStatus;
  template: string;
  sortOrder: number;
  usePageBuilder: boolean; // Add this field
  createdAt: string;
  updatedAt: string;
  authorId: number;
  author: User;
  parentId?: number;
  parent?: Page;
  children?: Page[];
  posts?: Post[];
  sections?: PageSection[]; // Add this field
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
  pages?: Page[]; 
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
  parentId?: number; 
}

export interface UpdatePageDto extends Partial<CreatePageDto> {}

export interface CreateCategoryDto {
  name: string;
  slug: string;
  description?: string;
}

export interface AvailableParentPage {
  id: number;
  title: string;
  slug: string;
  level: number;
}

export interface NavigationPage {
  id: number;
  title: string;
  slug: string;
  children: NavigationPage[];
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
  parentId?: number;
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
  fullName: string;
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

export interface UpdateDirectorDto extends Partial<CreateDirectorDto> {}

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

export interface Gallery {
  id: number;
  title: string;
  slug: string;
  description?: string;
  status: GalleryStatus;
  type: GalleryType;
  coverImage?: string;
  viewCount: number;
  sortOrder: number;
  eventDate?: string;
  createdAt: string;
  updatedAt: string;
  authorId: number;
  author: User;
  images: GalleryImage[];
}

export interface GalleryImage {
  id: number;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  path: string;
  title?: string;
  description?: string;
  alt?: string;
  sortOrder: number;
  isVisible: boolean;
  uploadedAt: string;
  galleryId: number;
}

export enum GalleryStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published'
}

export enum GalleryType {
  GENERAL = 'general',
  EVENT = 'event',
  PROJECT = 'project',
  ARCHIVE = 'archive'
}

export interface CreateGalleryDto {
  title: string;
  slug: string;
  description?: string;
  status?: GalleryStatus;
  type?: GalleryType;
  sortOrder?: number;
  eventDate?: string;
}

export interface UpdateGalleryDto extends Partial<CreateGalleryDto> {}

export interface CreateGalleryImageDto {
  title?: string;
  description?: string;
  alt?: string;
  sortOrder?: number;
}

export interface UpdateGalleryImageDto extends CreateGalleryImageDto {
  isVisible?: boolean;
}

export interface GalleryStatistics {
  totalGalleries: number;
  publishedGalleries: number;
  totalImages: number;
  galleriesByType: Array<{
    type: GalleryType;
    count: number;
  }>;
  topGalleries: Array<{
    id: number;
    title: string;
    slug: string;
    viewCount: number;
  }>;
}

// Page assignment for galleries (if you want to assign galleries to specific pages)
export interface PageGalleryAssignment {
  pageId: number;
  galleryId: number;
  sortOrder: number;
}
export enum ServiceType {
  ADMINISTRATIVE = 'administrative',
  CONSULTING = 'consulting', 
  TECHNICAL = 'technical',
  LEGAL = 'legal',
  EDUCATIONAL = 'educational',
  HEALTH = 'health',
  SOCIAL = 'social',
  CULTURAL = 'cultural',
  OTHER = 'other'
}

export enum ServiceStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published'
}

export enum ServicePriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

export enum ServiceDocumentType {
  FORM = 'form',
  REGULATION = 'regulation',
  INSTRUCTION = 'instruction',
  EXAMPLE = 'example',
  REQUIREMENT = 'requirement',
  PRICE_LIST = 'price_list',
  TEMPLATE = 'template',
  OTHER = 'other'
}

export interface Service {
  id: number;
  name: string;
  slug: string;
  shortDescription?: string;
  description: string;
  type: ServiceType;
  status: ServiceStatus;
  priority: ServicePriority;
  price?: number;
  currency?: string;
  requirements?: string[];
  steps?: string[];
  duration?: string;
  responsibleDepartment?: string;
  contactPerson?: string;
  contactPhone?: string;
  contactEmail?: string;
  workingHours?: string;
  location?: string;
  additionalInfo?: string;
  sortOrder: number;
  isActive: boolean;
  isPublic: boolean;
  requiresAppointment: boolean;
  isOnline: boolean;
  viewCount: number;
  requestCount: number;
  featuredImage?: string;
  createdAt: string;
  updatedAt: string;
  authorId: number;
  author: User;
  documents?: ServiceDocument[];
}

export interface ServiceDocument {
  id: number;
  title: string;
  type: ServiceDocumentType;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  path: string;
  description?: string;
  sortOrder: number;
  isActive: boolean;
  isPublic: boolean;
  downloadCount: number;
  uploadedAt: string;
  serviceId: number;
}

export interface CreateServiceDto {
  name: string;
  slug: string;
  shortDescription?: string;
  description: string;
  type: ServiceType;
  status?: ServiceStatus;
  priority?: ServicePriority;
  price?: number;
  currency?: string;
  requirements?: string[];
  steps?: string[];
  duration?: string;
  responsibleDepartment?: string;
  contactPerson?: string;
  contactPhone?: string;
  contactEmail?: string;
  workingHours?: string;
  location?: string;
  additionalInfo?: string;
  sortOrder?: number;
  isActive?: boolean;
  isPublic?: boolean;
  requiresAppointment?: boolean;
  isOnline?: boolean;
}

export interface UpdateServiceDto extends Partial<CreateServiceDto> {}

export interface CreateServiceDocumentDto {
  title: string;
  type: ServiceDocumentType;
  description?: string;
  sortOrder?: number;
  isActive?: boolean;
  isPublic?: boolean;
}

export interface UpdateServiceDocumentDto extends Partial<CreateServiceDocumentDto> {}

export interface ServicesResponse {
  services: Service[];
  total: number;
  page: number;
  totalPages: number;
}

export interface ServiceStatistics {
  totalServices: number;
  publishedServices: number;
  totalDocuments: number;
  totalViews: number;
  totalRequests: number;
  servicesByType: Array<{
    type: ServiceType;
    count: number;
  }>;
  servicesByPriority: Array<{
    priority: ServicePriority;
    count: number;
  }>;
  topServices: Array<{
    id: number;
    name: string;
    slug: string;
    viewCount: number;
    requestCount: number;
  }>;
}

export interface ServiceTypeInfo {
  value: ServiceType;
  label: string;
  description: string;
}

export interface ServicePriorityInfo {
  value: ServicePriority;
  label: string;
  description: string;
}

export interface ServiceDocumentTypeInfo {
  value: ServiceDocumentType;
  label: string;
  description: string;
}

export enum SectionType {
  HERO_STACK = 'hero_stack',
  HERO_LEFT = 'hero_left', 
  HERO_IMAGE = 'hero_image',
  HERO_VIDEO = 'hero_video',
  CARD_TOP = 'card_top',
  CARD_BOTTOM = 'card_bottom',
  CARD_LEFT = 'card_left',
  CARD_RIGHT = 'card_right',
  CONTACT_ONE = 'contact_one',
  CONTACT_TWO = 'contact_two',
  CTA_ONE = 'cta_one',
  LOGOS_ONE = 'logos_one',
  TEAM_ONE = 'team_one',
  CUSTOM_HTML = 'custom_html'
}

export interface SectionData {
  // Allow dynamic indexing
  [key: string]: any;
  
  // Common fields
  title?: string;
  subtitle?: string;
  description?: string;
  image?: string;
  backgroundImage?: string;
  backgroundColor?: string;
  textColor?: string;
  
  // Button fields
  buttonText?: string;
  buttonLink?: string;
  buttonStyle?: 'primary' | 'secondary' | 'outline';
  
  // Hero specific
  heroText?: string;
  heroSubtext?: string;
  videoUrl?: string;
  
  // Card specific
  cards?: Array<{
    title: string;
    description: string;
    image?: string;
    link?: string;
  }>;
  
  // Contact specific
  contactInfo?: {
    address?: string;
    phone?: string;
    email?: string;
    workingHours?: string;
    mapUrl?: string;
  };
  
  // Team specific
  teamMembers?: Array<{
    name: string;
    position: string;
    image?: string;
    bio?: string;
  }>;
  
  // Logos specific
  logos?: Array<{
    name: string;
    image: string;
    link?: string;
  }>;
  
  // Custom HTML
  htmlContent?: string;
  
  // Layout options
  layout?: 'full-width' | 'contained' | 'narrow';
  height?: '100%' | '75%' | '50%' | '25%';
}

export interface PageSection {
  id: number;
  type: SectionType;
  name: string;
  data: SectionData;
  sortOrder: number;
  isVisible: boolean;
  cssClasses?: string;
  createdAt: string;
  updatedAt: string;
  layout?: string | null;
  height?: string | null;
  pageId: number;
}

export interface CreatePageSectionDto {
  type: SectionType;
  name: string;
  data: SectionData;
  sortOrder?: number;
  isVisible?: boolean;
  cssClasses?: string;
}

export interface UpdatePageSectionDto extends Partial<CreatePageSectionDto> {}

export interface ReorderSectionsDto {
  sections: Array<{
    id: number;
    sortOrder: number;
  }>;
}

export interface UpdatePageBuilderDto {
  usePageBuilder: boolean;
  content?: string;
}

export interface SectionTypeInfo {
  value: SectionType;
  label: string;
  description: string;
}

export interface FieldOption {
  value: string;
  label: string;
}

export interface BaseFieldConfig {
  key: string;
  type: 'text' | 'email' | 'textarea' | 'select' | 'image' | 'code' | 'array' | 'object' | 'color';
  label: string;
  placeholder?: string;
  required?: boolean;
  language?: string;
  rows?: number;
}

export interface SelectFieldConfig extends BaseFieldConfig {
  type: 'select';
  options: FieldOption[];
}

export interface ArrayFieldConfig extends BaseFieldConfig {
  type: 'array';
  itemSchema: Record<string, FieldConfig>;
}

export interface ObjectFieldConfig extends BaseFieldConfig {
  type: 'object';
  schema: Record<string, FieldConfig>;
}

export type FieldConfig = BaseFieldConfig | SelectFieldConfig | ArrayFieldConfig | ObjectFieldConfig;

export interface SectionFieldConfig {
  required?: string[];
  fields: FieldConfig[];
}