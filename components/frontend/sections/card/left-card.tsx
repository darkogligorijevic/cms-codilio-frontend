// components/frontend/sections/card/left-card.tsx
import { SectionData } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface CardLeftSectionProps {
  data: SectionData;
  className?: string;
}

export function CardLeftSection({ data, className }: CardLeftSectionProps) {
  return (
    <section className={cn('', className)}>
      <div className="space-y-12">
        {/* Section Header */}
        {(data.title || data.subtitle || data.description) && (
          <div className="text-center space-y-4">
            {data.title && (
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
                {data.title}
              </h2>
            )}
            
            {data.subtitle && (
              <h3 className="text-xl sm:text-2xl font-medium text-gray-600 dark:text-gray-300">
                {data.subtitle}
              </h3>
            )}
            
            {data.description && (
              <p className="text-lg text-gray-700 dark:text-gray-200 max-w-3xl mx-auto">
                {data.description}
              </p>
            )}
          </div>
        )}

        {/* Cards Grid - Left Image Layout */}
        {data.cards && data.cards.length > 0 && (
          <div className="space-y-8">
            {data.cards.map((card, index) => (
              <div 
                key={index} 
                className={cn(
                  "grid gap-8 lg:grid-cols-2 items-center",
                  index % 2 === 1 && "lg:grid-flow-dense"
                )}
              >
                {card.image && (
                  <div className={cn(
                    "aspect-video rounded-lg overflow-hidden",
                    index % 2 === 1 && "lg:col-start-2"
                  )}>
                    <img
                      src={card.image}
                      alt={card.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                
                <div className={cn(
                  "space-y-4",
                  index % 2 === 1 && "lg:col-start-1"
                )}>
                  <h3 className="text-2xl font-bold tracking-tight">
                    {card.title}
                  </h3>
                  
                  <p className="text-lg text-gray-700 dark:text-gray-200">
                    {card.description}
                  </p>
                  
                  {card.link && (
                    <div className="pt-2">
                      <Button variant="outline" asChild>
                        <a href={card.link}>Сазнај више</a>
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Section CTA */}
        {data.buttonText && data.buttonLink && (
          <div className="text-center">
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
    </section>
  );
}