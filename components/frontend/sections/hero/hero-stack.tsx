// components/frontend/sections/hero/hero-stack.tsx
import { SectionData } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface HeroStackSectionProps {
  data: SectionData;
  className?: string;
}

export function HeroStackSection({ data, className }: HeroStackSectionProps) {
  return (
    <section className={cn('text-center', className)}>
      <div className="space-y-6">
        {data.title && (
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
            {data.title}
          </h1>
        )}
        
        {data.subtitle && (
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-medium text-gray-600 dark:text-gray-300">
            {data.subtitle}
          </h2>
        )}
        
        {data.description && (
          <p className="text-lg text-gray-700 dark:text-gray-200 max-w-3xl mx-auto">
            {data.description}
          </p>
        )}

        {data.buttonText && data.buttonLink && (
          <div className="pt-4">
            <Button 
              asChild
              size="lg"
              variant={data.buttonStyle === 'secondary' ? 'secondary' : 
                      data.buttonStyle === 'outline' ? 'outline' : 'primary'}
            >
              <a href={data.buttonLink}>
                {data.buttonText}
              </a>
            </Button>
          </div>
        )}

        {data.image && (
          <div className="pt-8">
            <img
              src={data.image}
              alt={data.title || 'Hero image'}
              className="mx-auto max-w-full h-auto rounded-lg shadow-lg"
            />
          </div>
        )}
      </div>
    </section>
  );
}

// components/frontend/sections/card/top-card.tsx