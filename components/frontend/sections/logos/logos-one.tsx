// components/frontend/sections/logos/logos-one.tsx
import { SectionData } from '@/lib/types';
import { cn } from '@/lib/utils';

interface LogosOneSectionProps {
  data: SectionData;
  className?: string;
}

export function LogosOneSection({ data, className }: LogosOneSectionProps) {
  return (
    <section className={cn('', className)}>
      <div className="space-y-12">
        {/* Section Header */}
        {(data.title || data.description) && (
          <div className="text-center space-y-4">
            {data.title && (
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
                {data.title}
              </h2>
            )}
            
            {data.description && (
              <p className="text-lg text-gray-700 dark:text-gray-200 max-w-3xl mx-auto">
                {data.description}
              </p>
            )}
          </div>
        )}

        {/* Logos Grid */}
        {data.logos && data.logos.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-8 items-center">
            {data.logos.map((logo, index) => (
              <div key={index} className="flex items-center justify-center">
                {logo.link ? (
                  <a
                    href={logo.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group block p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    title={logo.name}
                  >
                    <img
                      src={logo.image}
                      alt={logo.name}
                      className="max-h-16 w-auto mx-auto filter grayscale group-hover:grayscale-0 transition-all duration-300 group-hover:scale-110"
                    />
                  </a>
                ) : (
                  <div className="p-4 rounded-lg" title={logo.name}>
                    <img
                      src={logo.image}
                      alt={logo.name}
                      className="max-h-16 w-auto mx-auto filter grayscale hover:grayscale-0 transition-all duration-300"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Infinite scroll animation for many logos */}
        {data.logos && data.logos.length > 8 && (
          <div className="overflow-hidden whitespace-nowrap">
            <div className="animate-scroll inline-block">
              {/* Duplicate logos for seamless scroll */}
              {[...data.logos, ...data.logos].map((logo, index) => (
                <div key={index} className="inline-block mx-8">
                  {logo.link ? (
                    <a
                      href={logo.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group inline-block"
                      title={logo.name}
                    >
                      <img
                        src={logo.image}
                        alt={logo.name}
                        className="h-12 w-auto filter grayscale group-hover:grayscale-0 transition-all duration-300"
                      />
                    </a>
                  ) : (
                    <img
                      src={logo.image}
                      alt={logo.name}
                      className="h-12 w-auto filter grayscale hover:grayscale-0 transition-all duration-300"
                      title={logo.name}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Custom CSS for infinite scroll animation */}
      <style jsx>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-scroll {
          animation: scroll 30s linear infinite;
        }
      `}</style>
    </section>
  );
}