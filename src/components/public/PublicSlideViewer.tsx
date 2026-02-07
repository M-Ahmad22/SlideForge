import { memo, useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Maximize2, Minimize2, Pause, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { getThemeById, PptxTheme } from "@/lib/themes";

// Lightweight slide type for public viewer
export interface PublicSlide {
  id: string;
  order_index: number;
  slide_type: string | null;
  title: string;
  subtitle: string | null;
  bullets: unknown[] | null;
  image_url: string | null;
  layout: string | null;
}

// Helper to extract text from bullet
type BulletItem = string | { text: string; subBullets?: string[] };
const getBulletText = (bullet: BulletItem): string => {
  if (typeof bullet === 'string') return bullet;
  if (typeof bullet === 'object' && bullet !== null && 'text' in bullet) {
    return bullet.text;
  }
  return String(bullet);
};

interface PublicSlideViewerProps {
  slides: PublicSlide[];
  theme: PptxTheme;
  initialIndex?: number;
  autoPlay?: boolean;
  autoPlayInterval?: number;
  showControls?: boolean;
  embedded?: boolean;
  onSlideChange?: (index: number) => void;
}

export const PublicSlideViewer = memo(function PublicSlideViewer({
  slides,
  theme,
  initialIndex = 0,
  autoPlay = false,
  autoPlayInterval = 5000,
  showControls = true,
  embedded = false,
  onSlideChange,
}: PublicSlideViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [controlsVisible, setControlsVisible] = useState(true);

  const currentSlide = slides[currentIndex];

  // Auto-hide controls
  useEffect(() => {
    if (embedded) return;
    
    let timeout: NodeJS.Timeout;
    const handleMouseMove = () => {
      setControlsVisible(true);
      clearTimeout(timeout);
      timeout = setTimeout(() => setControlsVisible(false), 3000);
    };

    window.addEventListener('mousemove', handleMouseMove);
    handleMouseMove();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      clearTimeout(timeout);
    };
  }, [embedded]);

  // Auto-play
  useEffect(() => {
    if (!isPlaying) return;
    
    const interval = setInterval(() => {
      setCurrentIndex(prev => {
        if (prev >= slides.length - 1) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [isPlaying, autoPlayInterval, slides.length]);

  // Preload next images
  useEffect(() => {
    const nextSlide = slides[currentIndex + 1];
    const prevSlide = slides[currentIndex - 1];
    
    [nextSlide, prevSlide].forEach(slide => {
      if (slide?.image_url) {
        const img = new Image();
        img.src = slide.image_url;
      }
    });
  }, [currentIndex, slides]);

  const goToSlide = useCallback((index: number) => {
    if (index < 0 || index >= slides.length || isTransitioning) return;
    
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex(index);
      setIsTransitioning(false);
      onSlideChange?.(index);
    }, 200);
  }, [slides.length, isTransitioning, onSlideChange]);

  const nextSlide = useCallback(() => goToSlide(currentIndex + 1), [currentIndex, goToSlide]);
  const prevSlide = useCallback(() => goToSlide(currentIndex - 1), [currentIndex, goToSlide]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowRight':
        case 'ArrowDown':
        case ' ':
          e.preventDefault();
          nextSlide();
          break;
        case 'ArrowLeft':
        case 'ArrowUp':
          e.preventDefault();
          prevSlide();
          break;
        case 'Home':
          goToSlide(0);
          break;
        case 'End':
          goToSlide(slides.length - 1);
          break;
        case 'f':
        case 'F':
          toggleFullscreen();
          break;
      }
    };

    if (!embedded) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [nextSlide, prevSlide, goToSlide, slides.length, embedded]);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  }, []);

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  if (!currentSlide) {
    return (
      <div 
        className="flex items-center justify-center h-full"
        style={{ backgroundColor: `#${theme.pptx.background}` }}
      >
        <p style={{ color: `#${theme.pptx.textColor}` }}>No slides available</p>
      </div>
    );
  }

  return (
    <div 
      className={cn(
        "relative w-full h-full overflow-hidden select-none",
        embedded && "rounded-lg"
      )}
      style={{ backgroundColor: `#${theme.pptx.background}` }}
      onClick={(e) => {
        if (embedded) return;
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        if (clickX < rect.width / 3) prevSlide();
        else if (clickX > (rect.width * 2) / 3) nextSlide();
      }}
    >
      {/* Slide Content */}
      <div 
        className={cn(
          "w-full h-full flex items-center justify-center transition-opacity duration-200",
          isTransitioning && "opacity-0"
        )}
      >
        <div className="w-full max-w-6xl mx-auto px-8 md:px-16 py-8 md:py-12">
          {currentSlide.slide_type === 'title' ? (
            <div className="flex flex-col items-center justify-center text-center min-h-[50vh]">
              <h1 
                className="text-4xl md:text-6xl lg:text-7xl font-bold mb-4 md:mb-6 leading-tight"
                style={{ 
                  color: `#${theme.pptx.titleColor}`,
                  fontFamily: theme.pptx.titleFont 
                }}
              >
                {currentSlide.title}
              </h1>
              {currentSlide.subtitle && (
                <p 
                  className="text-xl md:text-2xl lg:text-3xl opacity-80"
                  style={{ 
                    color: `#${theme.pptx.textColor}`,
                    fontFamily: theme.pptx.bodyFont 
                  }}
                >
                  {currentSlide.subtitle}
                </p>
              )}
              <div 
                className="w-24 md:w-32 h-1 mt-6 md:mt-8 rounded"
                style={{ backgroundColor: `#${theme.pptx.accentColor}` }}
              />
            </div>
          ) : (
            <div className={cn(
              "flex flex-col gap-6 md:gap-8 min-h-[50vh]",
              currentSlide.image_url && (currentSlide.layout === 'split' || currentSlide.layout === 'image-right') 
                && "md:flex-row md:items-start"
            )}>
              <div className={cn(
                "flex-1",
                currentSlide.image_url && (currentSlide.layout === 'split' || currentSlide.layout === 'image-right') && "md:w-1/2"
              )}>
                <h2 
                  className="text-2xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6"
                  style={{ 
                    color: `#${theme.pptx.titleColor}`,
                    fontFamily: theme.pptx.titleFont 
                  }}
                >
                  {currentSlide.title}
                </h2>
                <div 
                  className="w-16 md:w-24 h-1 mb-6 md:mb-8 rounded"
                  style={{ backgroundColor: `#${theme.pptx.accentColor}` }}
                />
                {currentSlide.bullets && currentSlide.bullets.length > 0 && (
                  <ul className="space-y-3 md:space-y-4">
                    {currentSlide.bullets.map((bullet, i) => (
                      <li 
                        key={i}
                        className="flex items-start gap-3 md:gap-4 text-base md:text-xl lg:text-2xl"
                        style={{ 
                          color: `#${theme.pptx.textColor}`,
                          fontFamily: theme.pptx.bodyFont 
                        }}
                      >
                        <span 
                          className="w-2 h-2 md:w-3 md:h-3 rounded-full mt-2 shrink-0"
                          style={{ backgroundColor: `#${theme.pptx.accentColor}` }}
                        />
                        <span>{getBulletText(bullet as BulletItem)}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {currentSlide.image_url && (
                <div className="flex-1 flex items-center justify-center">
                  <img 
                    src={currentSlide.image_url} 
                    alt={currentSlide.title}
                    className="max-w-full max-h-[50vh] object-contain rounded-xl shadow-xl"
                    loading="lazy"
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Controls Overlay */}
      {showControls && (
        <div 
          className={cn(
            "absolute inset-0 pointer-events-none transition-opacity duration-300",
            !controlsVisible && !embedded && "opacity-0"
          )}
        >
          {/* Navigation Arrows */}
          {currentIndex > 0 && (
            <button
              className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 pointer-events-auto bg-black/30 hover:bg-black/50 text-white p-2 md:p-3 rounded-full transition-colors"
              onClick={(e) => { e.stopPropagation(); prevSlide(); }}
              aria-label="Previous slide"
            >
              <ChevronLeft className="h-5 w-5 md:h-6 md:w-6" />
            </button>
          )}
          {currentIndex < slides.length - 1 && (
            <button
              className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 pointer-events-auto bg-black/30 hover:bg-black/50 text-white p-2 md:p-3 rounded-full transition-colors"
              onClick={(e) => { e.stopPropagation(); nextSlide(); }}
              aria-label="Next slide"
            >
              <ChevronRight className="h-5 w-5 md:h-6 md:w-6" />
            </button>
          )}

          {/* Bottom Controls */}
          <div className="absolute bottom-0 left-0 right-0 p-3 md:p-4 flex items-center justify-between pointer-events-auto">
            {/* Progress */}
            <div className="flex items-center gap-3">
              <div className="bg-black/50 text-white px-3 py-1.5 rounded-full text-xs md:text-sm font-medium">
                {currentIndex + 1} / {slides.length}
              </div>
              {!embedded && (
                <button
                  className="bg-black/50 hover:bg-black/70 text-white p-1.5 md:p-2 rounded-full transition-colors"
                  onClick={(e) => { e.stopPropagation(); setIsPlaying(!isPlaying); }}
                  aria-label={isPlaying ? "Pause" : "Play"}
                >
                  {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </button>
              )}
            </div>

            {/* Fullscreen */}
            {!embedded && (
              <button
                className="bg-black/50 hover:bg-black/70 text-white p-1.5 md:p-2 rounded-full transition-colors"
                onClick={(e) => { e.stopPropagation(); toggleFullscreen(); }}
                aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
              >
                {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </button>
            )}
          </div>

          {/* Progress Bar */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/20">
            <div 
              className="h-full transition-all duration-200"
              style={{ 
                width: `${((currentIndex + 1) / slides.length) * 100}%`,
                backgroundColor: `#${theme.pptx.accentColor}` 
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
});

export default PublicSlideViewer;
