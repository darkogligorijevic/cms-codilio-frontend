// components/frontend/sections/cta/cta-one.tsx
import { SectionData } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface CTAOneSectionProps {
  data: SectionData;
  className?: string;
}

export function CTAOneSection({ data, className }: CTAOneSectionProps) {
  return (
    <section 
      className={cn('py-16 px-4 sm:px-6 lg:px-8 dark:text-black', className)}
      style={{
        backgroundColor: data.backgroundColor || '#f3f4f6'
      }}
    >
      <div className="max-w-4xl mx-auto">
        <div className="text-center space-y-6">
          {data.title && (
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
              {data.title}
            </h2>
          )}
          
          {data.description && (
            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
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
                className="text-lg px-8 py-4 h-auto shadow-lg hover:shadow-xl transition-shadow text-black"
              >
                <a href={data.buttonLink}>
                  {data.buttonText}
                </a>
              </Button>
            </div>
          )}
        </div>

      </div>
    </section>
  );
}