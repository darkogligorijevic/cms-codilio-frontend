// components/frontend/sections/hero/left-hero.tsx
import { SectionData } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface HeroLeftSectionProps {
  data: SectionData;
  className?: string;
}

export function HeroLeftSection({ data, className }: HeroLeftSectionProps) {
  return (
    <section className={cn('', className)}>
      <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
        <div className="space-y-6">
          {data.title && (
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
              {data.title}
            </h1>
          )}
          
          {data.subtitle && (
            <h2 className="text-xl sm:text-2xl font-medium text-gray-600 dark:text-gray-300">
              {data.subtitle}
            </h2>
          )}
          
          {data.description && (
            <p className="text-lg text-gray-700 dark:text-gray-200">
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
        </div>

        {data.image && (
          <div className="lg:order-last">
            <img
              src={data.image}
              alt={data.title || 'Hero image'}
              className="w-full h-auto rounded-lg shadow-lg"
            />
          </div>
        )}
      </div>
    </section>
  );
}