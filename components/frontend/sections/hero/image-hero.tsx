// components/frontend/sections/hero/image-hero.tsx
import { SectionData } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { SearchComponent } from '../../search/search-component';

interface HeroImageSectionProps {
  data: SectionData;
  className?: string;
}

export function HeroImageSection({ data, className }: HeroImageSectionProps) {
  return (
    <div
      className={cn(
        `relative w-full flex items-center justify-center text-white`,
        // Use after pseudo-element to ensure it covers padding too
        'after:absolute after:inset-0 after:bg-black after:opacity-60 after:z-0',
        // Apply height from data or default
        data.height === '100%' ? 'min-h-screen' :
        data.height === '75%' ? 'min-h-[75vh]' :
        data.height === '50%' ? 'min-h-[50vh]' :
        data.height === '25%' ? 'min-h-[25vh]' :
        'min-h-[60vh]', // default height
        className
      )}
      style={{
        background: `
          linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)),
          url(${data.backgroundImage})
        `,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Content */}
      <div className="relative z-10 text-center max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className='space-y-6'>
          {data.title && (
            <h1 className="text-6xl sm:text-5xl lg:text-6xl font-black tracking-tight text-secondary-static drop-shadow-lg">
              {data.title}
            </h1>
          )}
          
          {data.subtitle && (
            <p className="text-md sm:text-lg lg:text-xl font-medium text-gray-400 drop-shadow-md">
              {data.subtitle}
            </p>
          )}
          
          {data.description && (
            <p className="text-md text-gray-200 max-w-2xl mx-auto drop-shadow-md">
              {data.description}
            </p>
          )}

          <SearchComponent className='text-left'/>

        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce z-10">
        <div className="w-6 h-10 border-2 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white dark:bg-white rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>
    </div>
  );
}