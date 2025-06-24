// templates/template-registry.tsx - Updated with Documentation Template
import { Page, Post } from '@/lib/types';

// Import all templates
import { AboutTemplate } from './about/about-template';
import { ContactTemplate } from './contact/contact-template';
import { ServicesTemplate } from './services/services-template';
import { TransparencyTemplate } from './transparency/transparency-template';
import { OrganizationalStructureTemplate } from './organizational-structure/organizationa-structure-template';
import { DirectorsTemplate } from './directors/directors-template';
import { DocumentationTemplate } from './documentation/documentation-template';
import { DefaultTemplate } from './default/default-template';

// Template registry interface
export interface TemplateProps {
  page: Page;
  posts: Post[];
  institutionData: any; // Required, not optional
  settings?: any;
}

// Template registry type
export type TemplateComponent = React.ComponentType<TemplateProps>;

// Registry of all available templates
export const TEMPLATE_REGISTRY: Record<string, TemplateComponent> = {
  about: AboutTemplate,
  contact: ContactTemplate,
  services: ServicesTemplate,
  transparency: TransparencyTemplate,
  organizationalStructure: OrganizationalStructureTemplate,
  directors: DirectorsTemplate,
  documentation: DocumentationTemplate,
  default: DefaultTemplate,
} as const;

// Available template keys for type safety
export type TemplateKey = keyof typeof TEMPLATE_REGISTRY;

// Template metadata for admin interface
export interface TemplateMetadata {
  key: string;
  name: string;
  description: string;
  category: 'institutional' | 'service' | 'information';
  features: string[];
  preview?: string;
}

// Template metadata registry
export const TEMPLATE_METADATA: Record<TemplateKey, TemplateMetadata> = {
  about: {
    key: 'about',
    name: 'О институцији',
    description: 'Шаблон за представљање институције са статистикама и основним информацијама',
    category: 'institutional',
    features: ['Hero sekcija', 'Статистике', 'Objave sekcija', 'Респонзиван дизајн'],
  },
  contact: {
    key: 'contact',
    name: 'Контакт',
    description: 'Контакт страница са формом за слање поруке и основним информацијама',
    category: 'service',
    features: ['Контакт форма', 'Контакт информације', 'Валидација', 'Email интеграција'],
  },
  services: {
    key: 'services',
    name: 'Услуге',
    description: 'Приказ услуга које пружа институција',
    category: 'service',
    features: ['Листа услуга', 'Објаве sekcija', 'Прегледан layout'],
  },
  transparency: {
    key: 'transparency',
    name: 'Транспарентност',
    description: 'Страница за приступ информацијама од јавног значаја',
    category: 'information',
    features: ['Документи', 'Објаве', 'Јавне набавке', 'Буџет'],
  },
  organizationalStructure: {
    key: 'organizationalStructure',
    name: 'Организациона структура',
    description: 'Интерактивни приказ организационе структуре у облику стабла са детаљним информацијама',
    category: 'institutional',
    features: ['Стабло јединица', 'Интерактивни приказ', 'Претрага и филтери', 'Детаљне информације', 'Статистике'],
  },
  directors: {
    key: 'directors',
    name: 'Директори',
    description: 'Модеран приказ тренутног и бивших директора са документима и детаљним информацијама',
    category: 'institutional',
    features: ['Тренутни директор', 'Историја директора', 'Јавни документи', 'Биографије', 'Контакт информације', 'Статистике'],
  },
  documentation: {
    key: 'documentation',
    name: 'Документација',
    description: 'Приказ јавних докумената организованих по категоријама са претрагом и могућношћу преузимања',
    category: 'information',
    features: ['Категоризовани документи', 'Претрага докумената', 'Филтрирање по категорији', 'Преузимање фајлова', 'Статистике', 'Ауто-креирање подстраница'],
  },
  default: {
    key: 'default',
    name: 'Основни',
    description: 'Основни шаблон за стандардне странице',
    category: 'information',
    features: ['Флексибилан садржај', 'Објаве sekcija', 'Минималан дизајн'],
  },
};

// Function to get template component by key
export function getTemplate(templateKey: string | undefined): TemplateComponent {
  if (!templateKey || !(templateKey in TEMPLATE_REGISTRY)) {
    return TEMPLATE_REGISTRY.default;
  }
  return TEMPLATE_REGISTRY[templateKey as TemplateKey];
}

// Function to get all available templates
export function getAllTemplates(): TemplateMetadata[] {
  return Object.values(TEMPLATE_METADATA);
}

// Function to get templates by category
export function getTemplatesByCategory(category: TemplateMetadata['category']): TemplateMetadata[] {
  return Object.values(TEMPLATE_METADATA).filter(template => template.category === category);
}

// Function to check if template exists
export function templateExists(templateKey: string): boolean {
  return templateKey in TEMPLATE_REGISTRY;
}