// lib/section-field-configs.ts - Much better approach
import { SectionType, SectionFieldConfig } from '@/lib/types';

// Common layout fields that all sections can use
const COMMON_LAYOUT_FIELDS = [
  {
    key: 'layout',
    type: 'select' as const,
    label: 'Layout širina',
    options: [
      { value: 'contained', label: 'Стандардни (max-width)' },
      { value: 'full-width', label: 'Пуна ширина' }
    ]
  },
  {
    key: 'height',
    type: 'select' as const,
    label: 'Visina',
    options: [
      { value: '100%', label: 'Преко целог екрана' },
      { value: '75%', label: '75% екрана' },
      { value: '50%', label: '50% екрана' },
      { value: '25%', label: '25% екрана' },
    ]
  },
  {
    key: 'backgroundColor',
    type: 'text' as const,
    label: 'Boja pozadine',
    placeholder: '#f3f4f6 ili transparent'
  },
  {
    key: 'textColor',
    type: 'text' as const,
    label: 'Boja teksta',
    placeholder: '#000000 ili inherit'
  }
];

// Specific fields for each section type (WITHOUT layout fields)
const BASE_SECTION_CONFIGS: Record<SectionType, Omit<SectionFieldConfig, 'commonFields'>> = {
  [SectionType.HERO_STACK]: {
    required: ['title'],
    fields: [
      { key: 'title', type: 'text', label: 'Naslov', placeholder: 'Glavni naslov' },
      { key: 'subtitle', type: 'text', label: 'Podnaslov', placeholder: 'Podnaslov' },
      { key: 'description', type: 'textarea', label: 'Opis', rows: 4 },
      { key: 'buttonText', type: 'text', label: 'Tekst dugmeta', placeholder: 'Saznaj više' },
      { key: 'buttonLink', type: 'text', label: 'Link dugmeta', placeholder: '/o-nama' },
      { key: 'buttonStyle', type: 'select', label: 'Stil dugmeta', options: [
        { value: 'primary', label: 'Glavni' },
        { value: 'secondary', label: 'Sekundarni' },
        { value: 'outline', label: 'Obrub' }
      ]},
      { key: 'image', type: 'image', label: 'Slika' }
    ]
  },

  [SectionType.HERO_LEFT]: {
    required: ['title'],
    fields: [
      { key: 'title', type: 'text', label: 'Naslov', placeholder: 'Glavni naslov' },
      { key: 'subtitle', type: 'text', label: 'Podnaslov', placeholder: 'Podnaslov' },
      { key: 'description', type: 'textarea', label: 'Opis', rows: 4 },
      { key: 'buttonText', type: 'text', label: 'Tekst dugmeta', placeholder: 'Saznaj više' },
      { key: 'buttonLink', type: 'text', label: 'Link dugmeta', placeholder: '/o-nama' },
      { key: 'buttonStyle', type: 'select', label: 'Stil dugmeta', options: [
        { value: 'primary', label: 'Glavni' },
        { value: 'secondary', label: 'Sekundarni' },
        { value: 'outline', label: 'Obrub' }
      ]},
      { key: 'image', type: 'image', label: 'Slika' }
    ]
  },

  [SectionType.HERO_IMAGE]: {
    required: ['title', 'backgroundImage'],
    fields: [
      { key: 'title', type: 'text', label: 'Naslov', placeholder: 'Glavni naslov' },
      { key: 'subtitle', type: 'text', label: 'Podnaslov', placeholder: 'Podnaslov' },
      { key: 'description', type: 'textarea', label: 'Opis', rows: 3 },
      { key: 'backgroundImage', type: 'image', label: 'Pozadinska slika' },
      { key: 'buttonText', type: 'text', label: 'Tekst dugmeta', placeholder: 'Saznaj više' },
      { key: 'buttonLink', type: 'text', label: 'Link dugmeta', placeholder: '/o-nama' },
      { key: 'buttonStyle', type: 'select', label: 'Stil dugmeta', options: [
        { value: 'primary', label: 'Glavni' },
        { value: 'secondary', label: 'Sekundarni' },
        { value: 'outline', label: 'Obrub' }
      ]}
    ]
  },

  [SectionType.HERO_VIDEO]: {
    required: ['title', 'videoUrl'],
    fields: [
      { key: 'title', type: 'text', label: 'Naslov', placeholder: 'Glavni naslov' },
      { key: 'subtitle', type: 'text', label: 'Podnaslov' },
      { key: 'description', type: 'textarea', label: 'Opis', rows: 3 },
      { key: 'videoUrl', type: 'text', label: 'URL videa', placeholder: 'https://youtube.com/watch?v=...' },
      { key: 'buttonText', type: 'text', label: 'Tekst dugmeta' },
      { key: 'buttonLink', type: 'text', label: 'Link dugmeta' }
    ]
  },

  [SectionType.CARD_TOP]: {
    required: ['title'],
    fields: [
      { key: 'title', type: 'text', label: 'Naslov sekcije' },
      { key: 'subtitle', type: 'text', label: 'Podnaslov' },
      { key: 'description', type: 'textarea', label: 'Opis sekcije', rows: 3 },
      { key: 'buttonText', type: 'text', label: 'Tekst dugmeta sekcije' },
      { key: 'buttonLink', type: 'text', label: 'Link dugmeta sekcije' },
      { 
        key: 'cards', 
        type: 'array', 
        label: 'Kartice', 
        itemSchema: {
          title: { key: 'title', type: 'text', label: 'Naslov kartice', required: true },
          description: { key: 'description', type: 'textarea', label: 'Opis kartice', rows: 3, required: true },
          image: { key: 'image', type: 'image', label: 'Slika kartice' },
          link: { key: 'link', type: 'text', label: 'Link kartice', placeholder: '/stranica' }
        }
      }
    ]
  },

  [SectionType.CARD_BOTTOM]: {
    required: ['title'],
    fields: [
      { key: 'title', type: 'text', label: 'Naslov sekcije' },
      { key: 'subtitle', type: 'text', label: 'Podnaslov' },
      { key: 'description', type: 'textarea', label: 'Opis sekcije', rows: 3 },
      { key: 'buttonText', type: 'text', label: 'Tekst dugmeta sekcije' },
      { key: 'buttonLink', type: 'text', label: 'Link dugmeta sekcije' },
      { 
        key: 'cards', 
        type: 'array', 
        label: 'Kartice', 
        itemSchema: {
          title: { key: 'title', type: 'text', label: 'Naslov kartice', required: true },
          description: { key: 'description', type: 'textarea', label: 'Opis kartice', rows: 3, required: true },
          image: { key: 'image', type: 'image', label: 'Slika kartice' },
          link: { key: 'link', type: 'text', label: 'Link kartice', placeholder: '/stranica' }
        }
      }
    ]
  },

  [SectionType.CARD_LEFT]: {
    required: ['title'],
    fields: [
      { key: 'title', type: 'text', label: 'Naslov sekcije' },
      { key: 'subtitle', type: 'text', label: 'Podnaslov' },
      { key: 'description', type: 'textarea', label: 'Opis sekcije', rows: 3 },
      { key: 'buttonText', type: 'text', label: 'Tekst dugmeta sekcije' },
      { key: 'buttonLink', type: 'text', label: 'Link dugmeta sekcije' },
      { 
        key: 'cards', 
        type: 'array', 
        label: 'Kartice', 
        itemSchema: {
          title: { key: 'title', type: 'text', label: 'Naslov kartice', required: true },
          description: { key: 'description', type: 'textarea', label: 'Opis kartice', rows: 3, required: true },
          image: { key: 'image', type: 'image', label: 'Slika kartice' },
          link: { key: 'link', type: 'text', label: 'Link kartice', placeholder: '/stranica' }
        }
      }
    ]
  },

  [SectionType.CARD_RIGHT]: {
    required: ['title'],
    fields: [
      { key: 'title', type: 'text', label: 'Naslov sekcije' },
      { key: 'subtitle', type: 'text', label: 'Podnaslov' },
      { key: 'description', type: 'textarea', label: 'Opis sekcije', rows: 3 },
      { key: 'buttonText', type: 'text', label: 'Tekst dugmeta sekcije' },
      { key: 'buttonLink', type: 'text', label: 'Link dugmeta sekcije' },
      { 
        key: 'cards', 
        type: 'array', 
        label: 'Kartice', 
        itemSchema: {
          title: { key: 'title', type: 'text', label: 'Naslov kartice', required: true },
          description: { key: 'description', type: 'textarea', label: 'Opis kartice', rows: 3, required: true },
          image: { key: 'image', type: 'image', label: 'Slika kartice' },
          link: { key: 'link', type: 'text', label: 'Link kartice', placeholder: '/stranica' }
        }
      }
    ]
  },

  [SectionType.CONTACT_ONE]: {
    required: ['title'],
    fields: [
      { key: 'title', type: 'text', label: 'Naslov kontakt forme' },
      { key: 'subtitle', type: 'text', label: 'Naslov kontakt informacija' },
      { key: 'description', type: 'textarea', label: 'Opis', rows: 3 },
      { 
        key: 'contactInfo', 
        type: 'object', 
        label: 'Kontakt informacije', 
        schema: {
          address: { key: 'address', type: 'text', label: 'Adresa' },
          phone: { key: 'phone', type: 'text', label: 'Telefon' },
          email: { key: 'email', type: 'email', label: 'Email' },
          workingHours: { key: 'workingHours', type: 'text', label: 'Radno vreme' },
          mapUrl: { key: 'mapUrl', type: 'text', label: 'URL mape' }
        }
      }
    ]
  },

  [SectionType.CONTACT_TWO]: {
    required: ['title'],
    fields: [
      { key: 'title', type: 'text', label: 'Naslov' },
      { key: 'description', type: 'textarea', label: 'Opis', rows: 3 },
      { 
        key: 'contactInfo', 
        type: 'object', 
        label: 'Kontakt informacije', 
        schema: {
          address: { key: 'address', type: 'text', label: 'Adresa' },
          phone: { key: 'phone', type: 'text', label: 'Telefon' },
          email: { key: 'email', type: 'email', label: 'Email' },
          workingHours: { key: 'workingHours', type: 'text', label: 'Radno vreme' },
          mapUrl: { key: 'mapUrl', type: 'text', label: 'URL mape' }
        }
      }
    ]
  },

  [SectionType.CTA_ONE]: {
    required: ['title', 'buttonText', 'buttonLink'],
    fields: [
      { key: 'title', type: 'text', label: 'Naslov' },
      { key: 'description', type: 'textarea', label: 'Opis', rows: 3 },
      { key: 'buttonText', type: 'text', label: 'Tekst dugmeta', placeholder: 'Kontaktiraj nas' },
      { key: 'buttonLink', type: 'text', label: 'Link dugmeta', placeholder: '/kontakt' },
      { key: 'buttonStyle', type: 'select', label: 'Stil dugmeta', options: [
        { value: 'primary', label: 'Glavni' },
        { value: 'secondary', label: 'Sekundarni' },
        { value: 'outline', label: 'Obrub' }
      ]}
    ]
  },

  [SectionType.LOGOS_ONE]: {
    required: ['title'],
    fields: [
      { key: 'title', type: 'text', label: 'Naslov sekcije' },
      { key: 'description', type: 'textarea', label: 'Opis sekcije', rows: 2 },
      { 
        key: 'logos', 
        type: 'array', 
        label: 'Logotipi', 
        itemSchema: {
          name: { key: 'name', type: 'text', label: 'Naziv organizacije', required: true },
          image: { key: 'image', type: 'image', label: 'Logo', required: true },
          link: { key: 'link', type: 'text', label: 'Website link' }
        }
      }
    ]
  },

  [SectionType.TEAM_ONE]: {
    required: ['title'],
    fields: [
      { key: 'title', type: 'text', label: 'Naslov sekcije' },
      { key: 'description', type: 'textarea', label: 'Opis sekcije', rows: 3 },
      { 
        key: 'teamMembers', 
        type: 'array', 
        label: 'Članovi tima', 
        itemSchema: {
          name: { key: 'name', type: 'text', label: 'Ime i prezime', required: true },
          position: { key: 'position', type: 'text', label: 'Pozicija', required: true },
          image: { key: 'image', type: 'image', label: 'Fotografija' },
          bio: { key: 'bio', type: 'textarea', label: 'Biografija', rows: 3 }
        }
      }
    ]
  },

  [SectionType.CUSTOM_HTML]: {
    required: ['htmlContent'],
    fields: [
      { key: 'htmlContent', type: 'code', label: 'HTML sadržaj', language: 'html', rows: 10 }
    ]
  }
};

// Special cases for sections that don't need all layout options
const SECTION_LAYOUT_OVERRIDES: Partial<Record<SectionType, typeof COMMON_LAYOUT_FIELDS>> = {
  [SectionType.HERO_IMAGE]: [
    // Hero image doesn't need layout, just height
    {
    key: 'layout',
    type: 'select' as const,
    label: 'Layout širina',
    options: [
      { value: 'contained', label: 'Standardni (max-width)' },
      { value: 'full-width', label: 'Puna širina' }
    ]
    },
    {
    key: 'height',
    type: 'select' as const,
    label: 'Visina',
    options: [
      { value: '100%', label: 'Преко целог екрана' },
      { value: '75%', label: '75% екрана' },
      { value: '50%', label: '50% екрана' },
      { value: '25%', label: '25% екрана' },
    ]
    },
    {
      key: 'textColor',
      type: 'text' as const,
      label: 'Boja teksta',
      placeholder: 'white (default) ili custom'
    },
  ],
  [SectionType.HERO_VIDEO]: [
    {
    key: 'height',
    type: 'select' as const,
    label: 'Visina',
    options: [
      { value: '100%', label: 'Преко целог екрана' },
      { value: '75%', label: '75% екрана' },
      { value: '50%', label: '50% екрана' },
      { value: '25%', label: '25% екрана' },
    ]
    },
    {
      key: 'textColor',
      type: 'text' as const,
      label: 'Boja teksta',
      placeholder: 'white (default) ili custom'
    }
  ],
  [SectionType.CTA_ONE]: [
    // CTA needs special background handling
    ...COMMON_LAYOUT_FIELDS.filter(field => field.key !== 'backgroundColor'),
    {
      key: 'backgroundColor',
      type: 'text' as const,
      label: 'Boja pozadine',
      placeholder: '#f3f4f6 (obavezno za CTA)'
    }
  ]
};

// Helper function to get layout fields for a section
function getLayoutFieldsForSection(sectionType: SectionType) {
  return SECTION_LAYOUT_OVERRIDES[sectionType] || COMMON_LAYOUT_FIELDS;
}

// Helper function to combine base config with layout fields
function combineConfig(sectionType: SectionType): SectionFieldConfig {
  const baseConfig = BASE_SECTION_CONFIGS[sectionType];
  const layoutFields = getLayoutFieldsForSection(sectionType);
  
  return {
    required: baseConfig.required,
    fields: [...baseConfig.fields, ...layoutFields]
  };
}

// Export the final configurations (automatically combines base + layout)
export const SECTION_FIELD_CONFIGS: Record<SectionType, SectionFieldConfig> = Object.keys(BASE_SECTION_CONFIGS).reduce((acc, sectionType) => {
  acc[sectionType as SectionType] = combineConfig(sectionType as SectionType);
  return acc;
}, {} as Record<SectionType, SectionFieldConfig>);

// Export utilities for advanced usage
export { 
  COMMON_LAYOUT_FIELDS, 
  BASE_SECTION_CONFIGS, 
  getLayoutFieldsForSection,
  combineConfig 
};