import { SectionType, SectionData } from "./types";

// lib/institution-templates.ts
export enum InstitutionType {
  MUSEUM = 'museum',
  MUNICIPALITY = 'municipality',
  SCHOOL = 'school',
  CULTURAL_CENTER = 'cultural_center',
  HOSPITAL = 'hospital',
  LIBRARY = 'library'
}

export interface InstitutionTemplate {
  type: InstitutionType;
  name: string;
  description: string;
  predefinedSections: PredefinedSection[];
  allowedSectionTypes: SectionType[];
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
}

export interface PredefinedSection {
  type: SectionType;
  name: string;
  data: SectionData;
  sortOrder: number;
  isVisible: boolean;
  isLocked?: boolean; // Da li može da se briše/menja tip
  isRequired?: boolean; // Da li je obavezna sekcija
}

// Museum Template Definition
export const MUSEUM_TEMPLATE: InstitutionTemplate = {
  type: InstitutionType.MUSEUM,
  name: 'Музеј',
  description: 'Темплејт за музеје, галерије и културне институције',
  primaryColor: '#8B4513', // Saddle Brown
  secondaryColor: '#DAA520', // Goldenrod
  fontFamily: 'Playfair Display',
  
  // Predefined sections that will be created automatically
  predefinedSections: [
    {
      type: SectionType.HERO_IMAGE,
      name: 'Главни банер',
      sortOrder: 0,
      isVisible: true,
      isLocked: true, // Cannot change type
      isRequired: true, // Cannot be deleted
      data: {
        title: 'Добродошли у наш музеј',
        subtitle: 'Откријте богату историју и културно наслеђе',
        description: 'Истражите наше збирке и изложбе које говоре о прошлости, садашњости и будућности.',
        buttonText: 'Планирајте посету',
        buttonLink: '/info-za-posetioce',
        buttonStyle: 'primary',
        backgroundImage: '/images/museum-hero.jpg',
        height: '75%',
        layout: 'full-width',
        textColor: '#FFFFFF'
      }
    },
    
    {
      type: SectionType.CARD_TOP,
      name: 'Тренутне изложбе',
      sortOrder: 1,
      isVisible: true,
      isLocked: false,
      data: {
        title: 'Тренутне изложбе',
        subtitle: 'Откријте наше најновије збирке',
        description: 'Проширите своје знање кроз наше пажљиво одабране изложбе које покривају различите периоде и теме.',
        layout: 'contained',
        cards: [
          {
            title: 'Археолошка збирка',
            description: 'Артефакти из античког периода који откривају живот наших предака.',
            image: '/images/archaeology-exhibit.jpg',
            link: '/izlozbe/arheoloska-zbirka'
          },
          {
            title: 'Уметничка галерија',
            description: 'Ремек-дела локалних и међународних уметника кроз векове.',
            image: '/images/art-gallery.jpg',
            link: '/izlozbe/umetnicka-galerija'
          },
          {
            title: 'Историјска поставка',
            description: 'Хронолошки приказ кључних догађаја и личности из наше историје.',
            image: '/images/history-exhibit.jpg',
            link: '/izlozbe/istorijska-postavka'
          }
        ]
      }
    },

    {
      type: SectionType.CTA_ONE,
      name: 'Позив за посету',
      sortOrder: 2,
      isVisible: true,
      isLocked: false,
      data: {
        title: 'Планирајте своју посету',
        description: 'Резервишите карте унапред и обезбедите најбоље искуство у музеју. Доступне су групне посете и едукативни програми.',
        buttonText: 'Резервиши карте',
        buttonLink: '/karte',
        buttonStyle: 'primary',
        backgroundColor: '#8B4513',
        layout: 'contained'
      }
    },

    {
      type: SectionType.CARD_LEFT,
      name: 'Услуге музеја',
      sortOrder: 3,
      isVisible: true,
      isLocked: false,
      data: {
        title: 'Наше услуге',
        subtitle: 'Више од обичне посете',
        description: 'Понудимо разноврсне услуге које чине ваше искуство незаборавним.',
        layout: 'contained',
        cards: [
          {
            title: 'Водичке туре',
            description: 'Стручни водичи ће вас провести кроз најзанимљивије делове музеја са детаљним објашњењима.',
            image: '/images/guided-tours.jpg',
            link: '/usluge/vodicke-ture'
          },
          {
            title: 'Едукативни програми',
            description: 'Специјални програми за школске групе, студенте и одрасле посетиоце.',
            image: '/images/education.jpg',
            link: '/usluge/edukativni-programi'
          },
          {
            title: 'Истраживачки центар',
            description: 'Приступ архивама и збиркама за истраживаче и научне раднике.',
            image: '/images/research.jpg',
            link: '/usluge/istrazivacki-centar'
          }
        ]
      }
    },

    {
      type: SectionType.LOGOS_ONE,
      name: 'Партнери',
      sortOrder: 4,
      isVisible: true,
      isLocked: false,
      data: {
        title: 'Наши партнери',
        description: 'Сарађујемо са водећим културним институцијама и организацијама.',
        layout: 'contained',
        logos: [
          {
            name: 'Министарство културе',
            image: '/images/ministry-culture.png',
            link: 'https://kultura.gov.rs'
          },
          {
            name: 'Народна библиотека Србије',
            image: '/images/national-library.png',
            link: 'https://nb.rs'
          },
          {
            name: 'Универзитет у Београду',
            image: '/images/university-belgrade.png',
            link: 'https://bg.ac.rs'
          }
        ]
      }
    },

    {
      type: SectionType.CONTACT_TWO,
      name: 'Контакт и локација',
      sortOrder: 5,
      isVisible: true,
      isLocked: false,
      data: {
        title: 'Посетите нас',
        description: 'Лако нас пронађите и планирајте своју посету',
        layout: 'contained',
        contactInfo: {
          address: 'Музејска улица 1, 11000 Београд',
          phone: '+381 11 123 4567',
          email: 'info@muzej.rs',
          workingHours: 'Уторак - Недеља: 10:00 - 18:00\nПонедељак: Затворено',
          mapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2830.123...'
        }
      }
    }
  ],

  // Additional section types that can be added through page builder
  allowedSectionTypes: [
    SectionType.HERO_STACK,
    SectionType.HERO_LEFT,
    SectionType.HERO_VIDEO,
    SectionType.CARD_BOTTOM,
    SectionType.CARD_RIGHT,
    SectionType.TEAM_ONE,
    SectionType.CUSTOM_HTML,
    SectionType.CONTACT_ONE
  ]
};

// Template registry for all institution types
export const INSTITUTION_TEMPLATES: Record<InstitutionType, InstitutionTemplate> = {
  [InstitutionType.MUSEUM]: MUSEUM_TEMPLATE,
  
  // Add other templates here as needed
  [InstitutionType.MUNICIPALITY]: {
    type: InstitutionType.MUNICIPALITY,
    name: 'Општина/Град',
    description: 'Темплејт за општине, градове и локалне самоуправе',
    primaryColor: '#003366',
    secondaryColor: '#0066CC',
    fontFamily: 'Inter',
    predefinedSections: [], // Will be defined later
    allowedSectionTypes: Object.values(SectionType)
  },
  
  [InstitutionType.SCHOOL]: {
    type: InstitutionType.SCHOOL,
    name: 'Школа/Универзитет',
    description: 'Темплејт за образовне институције',
    primaryColor: '#1E3A8A',
    secondaryColor: '#3B82F6',
    fontFamily: 'Open Sans',
    predefinedSections: [],
    allowedSectionTypes: Object.values(SectionType)
  },

  [InstitutionType.CULTURAL_CENTER]: {
    type: InstitutionType.CULTURAL_CENTER,
    name: 'Културни центар',
    description: 'Темплејт за културне центре и установе',
    primaryColor: '#7C2D92',
    secondaryColor: '#A855F7',
    fontFamily: 'Poppins',
    predefinedSections: [],
    allowedSectionTypes: Object.values(SectionType)
  },

  [InstitutionType.HOSPITAL]: {
    type: InstitutionType.HOSPITAL,
    name: 'Болница/Клиника',
    description: 'Темплејт за здравствене установе',
    primaryColor: '#DC2626',
    secondaryColor: '#EF4444',
    fontFamily: 'Roboto',
    predefinedSections: [],
    allowedSectionTypes: Object.values(SectionType)
  },

  [InstitutionType.LIBRARY]: {
    type: InstitutionType.LIBRARY,
    name: 'Библиотека',
    description: 'Темплејт за библиотеке и информационе центре',
    primaryColor: '#059669',
    secondaryColor: '#10B981',
    fontFamily: 'Lora',
    predefinedSections: [],
    allowedSectionTypes: Object.values(SectionType)
  }
};

// Helper functions
export function getInstitutionTemplate(type: InstitutionType): InstitutionTemplate {
  return INSTITUTION_TEMPLATES[type];
}

export function getAllInstitutionTypes(): Array<{value: InstitutionType, label: string, description: string}> {
  return Object.values(INSTITUTION_TEMPLATES).map(template => ({
    value: template.type,
    label: template.name,
    description: template.description
  }));
}
