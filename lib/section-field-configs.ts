// lib/section-field-configs.ts
import { SectionType, SectionFieldConfig } from '@/lib/types';

export const SECTION_FIELD_CONFIGS: Record<SectionType, SectionFieldConfig> = {
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
      ]},
      { key: 'backgroundColor', type: 'text', label: 'Boja pozadine', placeholder: '#f3f4f6' }
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