// tailwind.config.ts - Updated for Next.js 15
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
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: "var(--primary)",
        secondary: "var(--secondary)"
      },
      // Custom typography configuration for rich text content
      typography: {
        DEFAULT: {
          css: {
            maxWidth: 'none', // Remove prose max-width constraint
            color: '#374151', // text-gray-700
            lineHeight: '1.7',
            // Custom heading styles
            h1: {
              fontSize: '2.25rem', // 36px
              fontWeight: '800',
              lineHeight: '1.2',
              marginTop: '2rem',
              marginBottom: '1rem',
              color: '#111827', // text-gray-900
            },
            h2: {
              fontSize: '1.875rem', // 30px
              fontWeight: '700',
              lineHeight: '1.25',
              marginTop: '1.75rem',
              marginBottom: '0.875rem',
              color: '#111827',
            },
            h3: {
              fontSize: '1.5rem', // 24px
              fontWeight: '600',
              lineHeight: '1.3',
              marginTop: '1.5rem',
              marginBottom: '0.75rem',
              color: '#111827',
            },
            h4: {
              fontSize: '1.25rem', // 20px
              fontWeight: '600',
              lineHeight: '1.4',
              marginTop: '1.25rem',
              marginBottom: '0.625rem',
              color: '#111827',
            },
            h5: {
              fontSize: '1.125rem', // 18px
              fontWeight: '600',
              lineHeight: '1.4',
              marginTop: '1rem',
              marginBottom: '0.5rem',
              color: '#111827',
            },
            h6: {
              fontSize: '1rem', // 16px
              fontWeight: '600',
              lineHeight: '1.4',
              marginTop: '1rem',
              marginBottom: '0.5rem',
              color: '#111827',
            },
            // Enhanced text styles
            p: {
              marginBottom: '1rem',
            },
            strong: {
              fontWeight: '700',
              color: '#111827',
            },
            em: {
              fontStyle: 'italic',
            },
            // List styles
            'ul, ol': {
              marginBottom: '1rem',
              paddingLeft: '1.5rem',
            },
            li: {
              marginBottom: '0.25rem',
            },
            // Blockquote styles
            blockquote: {
              borderLeftColor: '#e5e7eb',
              borderLeftWidth: '4px',
              paddingLeft: '1rem',
              margin: '1rem 0',
              fontStyle: 'italic',
              color: '#6b7280',
            },
            // Code styles
            code: {
              backgroundColor: '#f3f4f6',
              padding: '0.25rem 0.5rem',
              borderRadius: '0.25rem',
              fontSize: '0.875rem',
              fontFamily: 'Monaco, Menlo, Ubuntu Mono, monospace',
            },
            pre: {
              backgroundColor: '#1f2937',
              color: '#f9fafb',
              padding: '1rem',
              borderRadius: '0.5rem',
              overflow: 'auto',
              margin: '1rem 0',
            },
            'pre code': {
              backgroundColor: 'transparent',
              padding: '0',
              color: 'inherit',
            },
            // Link styles
            a: {
              color: '#3b82f6',
              textDecoration: 'underline',
              '&:hover': {
                color: '#1d4ed8',
              },
            },
            // Image styles
            img: {
              maxWidth: '100%',
              height: 'auto',
              borderRadius: '0.5rem',
              margin: '1rem 0',
            },
            // Table styles (if you use tables in rich text)
            table: {
              borderCollapse: 'collapse',
              margin: '1rem 0',
              overflow: 'hidden',
              width: '100%',
            },
            'th, td': {
              border: '1px solid #e5e7eb',
              padding: '0.5rem',
              textAlign: 'left',
            },
            th: {
              backgroundColor: '#f9fafb',
              fontWeight: '600',
            },
          },
        },
        // Smaller typography for excerpts and previews
        sm: {
          css: {
            fontSize: '0.875rem',
            lineHeight: '1.6',
            h1: {
              fontSize: '1.5rem', // 24px
              fontWeight: '700',
              lineHeight: '1.3',
              marginTop: '1rem',
              marginBottom: '0.5rem',
              color: '#111827',
            },
            h2: {
              fontSize: '1.25rem', // 20px
              fontWeight: '600',
              lineHeight: '1.35',
              marginTop: '0.875rem',
              marginBottom: '0.5rem',
              color: '#111827',
            },
            h3: {
              fontSize: '1.125rem', // 18px
              fontWeight: '600',
              lineHeight: '1.4',
              marginTop: '0.75rem',
              marginBottom: '0.375rem',
              color: '#111827',
            },
            'h4, h5, h6': {
              fontSize: '1rem',
              fontWeight: '600',
              lineHeight: '1.4',
              marginTop: '0.75rem',
              marginBottom: '0.375rem',
              color: '#111827',
            },
            p: {
              marginBottom: '0.75rem',
            },
          },
        },
        // Large typography for featured content
        lg: {
          css: {
            fontSize: '1.125rem',
            lineHeight: '1.8',
            h1: {
              fontSize: '2.75rem', // 44px
              fontWeight: '800',
              lineHeight: '1.1',
              marginTop: '2.5rem',
              marginBottom: '1.25rem',
              color: '#111827',
            },
            h2: {
              fontSize: '2.25rem', // 36px
              fontWeight: '700',
              lineHeight: '1.2',
              marginTop: '2rem',
              marginBottom: '1rem',
              color: '#111827',
            },
            h3: {
              fontSize: '1.875rem', // 30px
              fontWeight: '600',
              lineHeight: '1.25',
              marginTop: '1.75rem',
              marginBottom: '0.875rem',
              color: '#111827',
            },
          },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};

export default config;