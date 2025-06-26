// components/frontend/sections/custom-html-section.tsx
import { SectionData } from '@/lib/types';
import { cn } from '@/lib/utils';

interface CustomHTMLSectionProps {
  data: SectionData;
  className?: string;
}

export function CustomHTMLSection({ data, className }: CustomHTMLSectionProps) {
  if (!data.htmlContent) {
    return (
      <section className={cn('text-center py-8', className)}>
        <p className="text-gray-500">Nema HTML sadržaja za prikaz.</p>
      </section>
    );
  }

  return (
    <section 
      className={cn('', className)}
      dangerouslySetInnerHTML={{ __html: data.htmlContent }}
    />
  );
}