// components/frontend/sections/hero/video-hero.tsx - Updated with search component instead of buttons
import { SectionData } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useState, useRef, useEffect } from 'react';
import { SearchComponent } from '../../search/search-component';

interface HeroVideoSectionProps {
  data: SectionData;
  className?: string;
}

export function HeroVideoSection({ data, className }: HeroVideoSectionProps) {
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  
  // Extract video ID from various YouTube URL formats
  const getYouTubeId = (url: string) => {
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[7].length === 11) ? match[7] : null;
  };

  // Check if it's a direct video file URL
  const isDirectVideoUrl = (url: string) => {
    return url.match(/\.(mp4|webm|ogg)$/i);
  };

  const videoId = data.videoUrl ? getYouTubeId(data.videoUrl) : null;
  const isDirectVideo = data.videoUrl ? isDirectVideoUrl(data.videoUrl) : false;

  // Handle video loading events
  useEffect(() => {
    if (videoRef.current) {
      const video = videoRef.current;
      
      const handleLoadedData = () => {
        setIsVideoLoaded(true);
        setIsVideoReady(true);
      };

      const handleCanPlay = () => {
        setIsVideoReady(true);
        video.play().catch(console.error);
      };

      video.addEventListener('loadeddata', handleLoadedData);
      video.addEventListener('canplay', handleCanPlay);

      return () => {
        video.removeEventListener('loadeddata', handleLoadedData);
        video.removeEventListener('canplay', handleCanPlay);
      };
    }
  }, []);

  // Handle iframe load for YouTube videos
  useEffect(() => {
    if (iframeRef.current && videoId) {
      const timer = setTimeout(() => {
        setIsVideoLoaded(true);
        setIsVideoReady(true);
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [videoId]);

  return (
    <div
      className={cn(
        `relative w-full flex items-center justify-center text-white overflow-hidden`,
        data.height === '100%' ? 'min-h-screen' :
        data.height === '75%' ? 'min-h-[75vh]' :
        data.height === '50%' ? 'min-h-[50vh]' :
        data.height === '25%' ? 'min-h-[25vh]' :
        'min-h-[60vh]',
        className
      )}
    >
      {/* Loading State */}
      {!isVideoReady && (videoId || isDirectVideo) && (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-gray-700 flex items-center justify-center z-5">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-gray-300">Учитава се видео...</p>
          </div>
        </div>
      )}

      {/* YouTube Video Background */}
      {videoId && (
        <div className={cn(
          "absolute inset-0 w-full h-full transition-opacity duration-1000",
          isVideoReady ? "opacity-100" : "opacity-0"
        )}>
          <iframe
            ref={iframeRef}
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&showinfo=0&rel=0&iv_load_policy=3&modestbranding=1&disablekb=1&fs=0&cc_load_policy=0&playsinline=1&autohide=1&start=0`}
            title="Background Video"
            className="absolute top-1/2 left-1/2 w-[300%] h-[300%] -translate-x-1/2 -translate-y-1/2 pointer-events-none"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      )}

      {/* Direct Video File Background */}
      {isDirectVideo && data.videoUrl && (
        <div className={cn(
          "absolute inset-0 w-full h-full transition-opacity duration-1000",
          isVideoReady ? "opacity-100" : "opacity-0"
        )}>
          <video
            ref={videoRef}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            className="absolute top-1/2 left-1/2 min-w-full min-h-full w-auto h-auto -translate-x-1/2 -translate-y-1/2 object-cover pointer-events-none"
          >
            <source src={data.videoUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      )}

      {/* Fallback background if no video */}
      {!videoId && !isDirectVideo && (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-gray-700"></div>
      )}

      {/* Dark Overlay */}
      <div className={cn(
        "absolute inset-0 bg-black opacity-60 z-0 transition-opacity duration-1000",
        isVideoReady || (!videoId && !isDirectVideo) ? "opacity-60" : "opacity-0"
      )}></div>
      
      {/* Content */}
      <div className="relative z-10 text-center max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="space-y-6">
          {data.title && (
            <h1 className="text-6xl sm:text-5xl lg:text-6xl font-black tracking-tight text-primary-dynamic drop-shadow-lg">
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

          {/* Search Component instead of buttons */}
          <div className="max-w-md mx-auto">
            <SearchComponent 
              variant="compact"
              placeholder="Претражите наш садржај..."
              className="text-left shadow-2xl"
            />
          </div>
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