// components/frontend/sections/hero/video-hero.tsx
import { SectionData } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { Play, Pause } from 'lucide-react';

interface HeroVideoSectionProps {
  data: SectionData;
  className?: string;
}

export function HeroVideoSection({ data, className }: HeroVideoSectionProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  // Extract video ID from various YouTube URL formats
  const getYouTubeId = (url: string) => {
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[7].length === 11) ? match[7] : null;
  };

  const videoId = data.videoUrl ? getYouTubeId(data.videoUrl) : null;
  const embedUrl = videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=${isPlaying ? 1 : 0}&rel=0&showinfo=0` : null;

  return (
    <section className={cn('relative min-h-[70vh] flex items-center justify-center', className)}>
      {/* Video Background */}
      {embedUrl && (
        <div className="absolute inset-0 w-full h-full">
          <iframe
            src={embedUrl}
            title="Background Video"
            className="w-full h-full object-cover"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
          {/* Dark overlay for better text readability */}
          <div className="absolute inset-0 bg-opacity-50"></div>
        </div>
      )}

      {/* Fallback background if no video */}
      {!embedUrl && (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-gray-700"></div>
      )}
      
      {/* Content */}
      <div className="relative z-10 text-center max-w-4xl px-4 sm:px-6 lg:px-8 text-white">
        <div className="space-y-6">
          {data.title && (
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight drop-shadow-lg">
              {data.title}
            </h1>
          )}
          
          {data.subtitle && (
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-medium text-gray-100 drop-shadow-md">
              {data.subtitle}
            </h2>
          )}
          
          {data.description && (
            <p className="text-lg text-gray-200 max-w-2xl mx-auto drop-shadow-md">
              {data.description}
            </p>
          )}

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            {/* Video Play/Pause Button */}
            {videoId && (
              <Button
                size="lg"
                variant="outline"
                onClick={() => setIsPlaying(!isPlaying)}
                className="bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-sm"
              >
                {isPlaying ? (
                  <>
                    <Pause className="mr-2 h-5 w-5" />
                    Паузирај видео
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-5 w-5" />
                    Пусти видео
                  </>
                )}
              </Button>
            )}

            {/* CTA Button */}
            {data.buttonText && data.buttonLink && (
              <Button 
                asChild
                size="lg"
                variant={data.buttonStyle === 'secondary' ? 'secondary' : 
                        data.buttonStyle === 'outline' ? 'outline' : 'primary'}
                className="shadow-lg"
              >
                <a href={data.buttonLink}>
                  {data.buttonText}
                </a>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>
    </section>
  );
}