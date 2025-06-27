// components/frontend/sections/card/bottom-card.tsx
import { SectionData } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface CardBottomSectionProps {
  data: SectionData;
  className?: string;
}

export function CardBottomSection({ data, className }: CardBottomSectionProps) {
  return (
    <section className={cn('', className)}>
      <div className="space-y-12">
        {/* Cards Grid */}
        {data.cards && data.cards.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {data.cards.map((card, index) => (
              <Card key={index} className="h-full">
                <CardHeader>
                  <CardTitle>{card.title}</CardTitle>
                </CardHeader>
                <CardContent className="flex-1">
                  <CardDescription className="text-base">
                    {card.description}
                  </CardDescription>
                  {card.link && (
                    <div className="mt-4">
                      <Button variant="outline" asChild>
                        <a href={card.link}>Saznaj više</a>
                      </Button>
                    </div>
                  )}
                </CardContent>
                {card.image && (
                  <div className="aspect-video overflow-hidden rounded-b-lg">
                    <img
                      src={card.image}
                      alt={card.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}

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