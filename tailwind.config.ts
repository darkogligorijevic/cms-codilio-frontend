// tailwind.config.ts - Updated for Tailwind CSS 4 + Next.js 15
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: "hsl(var(--primary))",
        secondary: "hsl(var(--secondary))",
          
        // Dark mode specific colors
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        
        // Dynamic theme colors from settings
        'primary-dynamic': "hsl(var(--primary-dynamic))",
        'secondary-dynamic': "hsl(var(--secondary-dynamic))",
        'primary-static': "hsl(var(--primary-static))",
        'secondary-static': "hsl(var(--secondary-static))",
      },
      
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      
      fontFamily: {
        sans: ['var(--font-family)', 'Inter', 'system-ui', 'sans-serif'],
        'dynamic': ['var(--font-family)', 'Inter', 'system-ui', 'sans-serif'],
      },
      
      animation: {
        "fade-in": "fade-in 0.5s ease-out",
        "fade-in-up": "fade-in-up 0.5s ease-out",
        "slide-in-right": "slide-in-right 0.3s ease-out",
        "pulse-slow": "pulse 3s infinite",
      },
      
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in-right": {
          "0%": { opacity: "0", transform: "translateX(20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
      },

      // Custom typography configuration for rich text content
      typography: {
        DEFAULT: {
          css: {
            maxWidth: 'none',
            color: '#374151',
            lineHeight: '1.7',
            
            // Dark mode support
            '--tw-prose-body': '#374151',
            '--tw-prose-headings': '#111827',
            '--tw-prose-lead': '#4b5563',
            '--tw-prose-links': 'hsl(var(--primary-dynamic))',
            '--tw-prose-bold': '#111827',
            '--tw-prose-counters': '#6b7280',
            '--tw-prose-bullets': '#d1d5db',
            '--tw-prose-hr': '#e5e7eb',
            '--tw-prose-quotes': '#111827',
            '--tw-prose-quote-borders': '#e5e7eb',
            '--tw-prose-captions': '#6b7280',
            '--tw-prose-code': '#111827',
            '--tw-prose-pre-code': '#e5e7eb',
            '--tw-prose-pre-bg': '#1f2937',
            '--tw-prose-th-borders': '#d1d5db',
            '--tw-prose-td-borders': '#e5e7eb',
            
            // Dark mode values
            '--tw-prose-invert-body': '#d1d5db',
            '--tw-prose-invert-headings': '#ffffff',
            '--tw-prose-invert-lead': '#9ca3af',
            '--tw-prose-invert-links': 'hsl(var(--primary-dynamic))',
            '--tw-prose-invert-bold': '#ffffff',
            '--tw-prose-invert-counters': '#9ca3af',
            '--tw-prose-invert-bullets': '#4b5563',
            '--tw-prose-invert-hr': '#374151',
            '--tw-prose-invert-quotes': '#f3f4f6',
            '--tw-prose-invert-quote-borders': '#374151',
            '--tw-prose-invert-captions': '#9ca3af',
            '--tw-prose-invert-code': '#ffffff',
            '--tw-prose-invert-pre-code': '#d1d5db',
            '--tw-prose-invert-pre-bg': 'rgb(0 0 0 / 50%)',
            '--tw-prose-invert-th-borders': '#4b5563',
            '--tw-prose-invert-td-borders': '#374151',

            // Enhanced heading styles
            h1: {
              fontSize: '2.25rem',
              fontWeight: '800',
              lineHeight: '1.2',
              marginTop: '2rem',
              marginBottom: '1rem',
              color: 'var(--tw-prose-headings)',
            },
            h2: {
              fontSize: '1.875rem',
              fontWeight: '700',
              lineHeight: '1.25',
              marginTop: '1.75rem',
              marginBottom: '0.875rem',
              color: 'var(--tw-prose-headings)',
            },
            h3: {
              fontSize: '1.5rem',
              fontWeight: '600',
              lineHeight: '1.3',
              marginTop: '1.5rem',
              marginBottom: '0.75rem',
              color: 'var(--tw-prose-headings)',
            },
            h4: {
              fontSize: '1.25rem',
              fontWeight: '600',
              lineHeight: '1.4',
              marginTop: '1.25rem',
              marginBottom: '0.625rem',
              color: 'var(--tw-prose-headings)',
            },
            h5: {
              fontSize: '1.125rem',
              fontWeight: '600',
              lineHeight: '1.4',
              marginTop: '1rem',
              marginBottom: '0.5rem',
              color: 'var(--tw-prose-headings)',
            },
            h6: {
              fontSize: '1rem',
              fontWeight: '600',
              lineHeight: '1.4',
              marginTop: '1rem',
              marginBottom: '0.5rem',
              color: 'var(--tw-prose-headings)',
            },
            
            // Enhanced link styles
            a: {
              color: 'var(--tw-prose-links)',
              textDecoration: 'underline',
              fontWeight: '500',
              transition: 'color 0.2s ease-in-out',
              '&:hover': {
                color: 'hsl(var(--primary-dynamic) / 0.8)',
                textDecoration: 'none',
              },
            },
            
            // Image styles
            img: {
              maxWidth: '100%',
              height: 'auto',
              borderRadius: '0.5rem',
              margin: '1rem 0',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
            },
            
            // Table styles
            table: {
              borderCollapse: 'collapse',
              margin: '1rem 0',
              overflow: 'hidden',
              width: '100%',
              borderRadius: '0.5rem',
              boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
            },
            'th, td': {
              border: '1px solid var(--tw-prose-th-borders)',
              padding: '0.75rem',
              textAlign: 'left',
            },
            th: {
              backgroundColor: '#f9fafb',
              fontWeight: '600',
              color: 'var(--tw-prose-headings)',
            },
            
            // Code styles
            code: {
              backgroundColor: '#f3f4f6',
              padding: '0.25rem 0.5rem',
              borderRadius: '0.25rem',
              fontSize: '0.875rem',
              fontFamily: 'Monaco, Menlo, Ubuntu Mono, monospace',
              color: 'var(--tw-prose-code)',
              fontWeight: '600',
            },
            'code::before': {
              content: '""',
            },
            'code::after': {
              content: '""',
            },
            pre: {
              backgroundColor: 'var(--tw-prose-pre-bg)',
              color: 'var(--tw-prose-pre-code)',
              padding: '1rem',
              borderRadius: '0.5rem',
              overflow: 'auto',
              margin: '1rem 0',
              fontSize: '0.875rem',
              lineHeight: '1.7',
            },
            'pre code': {
              backgroundColor: 'transparent',
              padding: '0',
              color: 'inherit',
              fontSize: 'inherit',
              fontWeight: 'inherit',
            },
            
            // Blockquote styles
            blockquote: {
              borderLeftColor: 'var(--tw-prose-quote-borders)',
              borderLeftWidth: '4px',
              paddingLeft: '1rem',
              margin: '1.5rem 0',
              fontStyle: 'italic',
              color: 'var(--tw-prose-quotes)',
              backgroundColor: '#f9fafb',
              padding: '1rem',
              borderRadius: '0 0.5rem 0.5rem 0',
            },
          },
        },
        
        // Dark mode prose
        invert: {
          css: {
            '--tw-prose-body': 'var(--tw-prose-invert-body)',
            '--tw-prose-headings': 'var(--tw-prose-invert-headings)',
            '--tw-prose-lead': 'var(--tw-prose-invert-lead)',
            '--tw-prose-links': 'var(--tw-prose-invert-links)',
            '--tw-prose-bold': 'var(--tw-prose-invert-bold)',
            '--tw-prose-counters': 'var(--tw-prose-invert-counters)',
            '--tw-prose-bullets': 'var(--tw-prose-invert-bullets)',
            '--tw-prose-hr': 'var(--tw-prose-invert-hr)',
            '--tw-prose-quotes': 'var(--tw-prose-invert-quotes)',
            '--tw-prose-quote-borders': 'var(--tw-prose-invert-quote-borders)',
            '--tw-prose-captions': 'var(--tw-prose-invert-captions)',
            '--tw-prose-code': 'var(--tw-prose-invert-code)',
            '--tw-prose-pre-code': 'var(--tw-prose-invert-pre-code)',
            '--tw-prose-pre-bg': 'var(--tw-prose-invert-pre-bg)',
            '--tw-prose-th-borders': 'var(--tw-prose-invert-th-borders)',
            '--tw-prose-td-borders': 'var(--tw-prose-invert-td-borders)',
            
            // Dark mode specific overrides
            code: {
              backgroundColor: '#374151',
              color: 'var(--tw-prose-invert-code)',
            },
            th: {
              backgroundColor: '#374151',
              color: 'var(--tw-prose-invert-headings)',
            },
            blockquote: {
              backgroundColor: '#1f2937',
              borderLeftColor: 'var(--tw-prose-invert-quote-borders)',
            },
          },
        },
        
        // Smaller typography for excerpts
        sm: {
          css: {
            fontSize: '0.875rem',
            lineHeight: '1.6',
            h1: { fontSize: '1.5rem', fontWeight: '700', lineHeight: '1.3', marginTop: '1rem', marginBottom: '0.5rem' },
            h2: { fontSize: '1.25rem', fontWeight: '600', lineHeight: '1.35', marginTop: '0.875rem', marginBottom: '0.5rem' },
            h3: { fontSize: '1.125rem', fontWeight: '600', lineHeight: '1.4', marginTop: '0.75rem', marginBottom: '0.375rem' },
            'h4, h5, h6': { fontSize: '1rem', fontWeight: '600', lineHeight: '1.4', marginTop: '0.75rem', marginBottom: '0.375rem' },
            p: { marginBottom: '0.75rem' },
          },
        },
        
        // Large typography for featured content
        lg: {
          css: {
            fontSize: '1.125rem',
            lineHeight: '1.8',
            h1: { fontSize: '2.75rem', fontWeight: '800', lineHeight: '1.1', marginTop: '2.5rem', marginBottom: '1.25rem' },
            h2: { fontSize: '2.25rem', fontWeight: '700', lineHeight: '1.2', marginTop: '2rem', marginBottom: '1rem' },
            h3: { fontSize: '1.875rem', fontWeight: '600', lineHeight: '1.25', marginTop: '1.75rem', marginBottom: '0.875rem' },
          },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography')
  ],
};

export default config;