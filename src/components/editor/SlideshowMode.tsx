import { useState, useEffect, useCallback } from "react";
import { X, ChevronLeft, ChevronRight, Maximize2, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getThemeById } from "@/lib/themes";
import type { DBSlide } from "@/hooks/usePresentations";

// Helper to extract text from bullet
type BulletItem = string | { text: string; subBullets?: string[] };
const getBulletText = (bullet: BulletItem): string => {
  if (typeof bullet === 'string') return bullet;
  if (typeof bullet === 'object' && bullet !== null && 'text' in bullet) {
    return bullet.text;
  }
  return String(bullet);
};

interface SlideshowModeProps {
  slides: DBSlide[];
  hiddenSlides: Set<string>;
  themeId: string;
  initialSlideIndex?: number;
  onExit: () => void;
}

export function SlideshowMode({
  slides,
  hiddenSlides,
  themeId,
  initialSlideIndex = 0,
  onExit,
}: SlideshowModeProps) {
  // Filter out hidden slides
  const visibleSlides = slides.filter(s => !hiddenSlides.has(s.id));
  const [currentIndex, setCurrentIndex] = useState(initialSlideIndex);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showControls, setShowControls] = useState(true);

  const theme = getThemeById(themeId);
  const currentSlide = visibleSlides[currentIndex];

  // Auto-hide controls
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    const handleMouseMove = () => {
      setShowControls(true);
      clearTimeout(timeout);
      timeout = setTimeout(() => setShowControls(false), 3000);
    };

    window.addEventListener('mousemove', handleMouseMove);
    handleMouseMove(); // Initial show

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      clearTimeout(timeout);
    };
  }, []);

  const goToSlide = useCallback((index: number) => {
    if (index < 0 || index >= visibleSlides.length || isTransitioning) return;
    
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex(index);
      setIsTransitioning(false);
    }, 300);
  }, [visibleSlides.length, isTransitioning]);

  const nextSlide = useCallback(() => {
    goToSlide(currentIndex + 1);
  }, [currentIndex, goToSlide]);

  const prevSlide = useCallback(() => {
    goToSlide(currentIndex - 1);
  }, [currentIndex, goToSlide]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowRight':
        case 'ArrowDown':
        case ' ':
        case 'Enter':
          e.preventDefault();
          nextSlide();
          break;
        case 'ArrowLeft':
        case 'ArrowUp':
          e.preventDefault();
          prevSlide();
          break;
        case 'Escape':
          onExit();
          break;
        case 'Home':
          goToSlide(0);
          break;
        case 'End':
          goToSlide(visibleSlides.length - 1);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextSlide, prevSlide, goToSlide, visibleSlides.length, onExit]);

  // Request fullscreen on mount
  useEffect(() => {
    const elem = document.documentElement;
    if (elem.requestFullscreen) {
      elem.requestFullscreen().catch(() => {});
    }
    
    return () => {
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
    };
  }, []);

  if (!currentSlide) {
    return (
      <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
        <p className="text-white">No slides to display</p>
        <Button variant="outline" onClick={onExit} className="ml-4">Exit</Button>
      </div>
    );
  }

  return (
    <div 
      className="fixed inset-0 z-50 overflow-hidden"
      style={{ backgroundColor: `#${theme.pptx.background}` }}
      onClick={(e) => {
        // Click on left side = prev, right side = next
        const rect = (e.target as HTMLElement).getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        if (clickX < rect.width / 3) {
          prevSlide();
        } else if (clickX > (rect.width * 2) / 3) {
          nextSlide();
        }
      }}
    >
      {/* Slide Content */}
      <div 
        className={cn(
          "h-full w-full flex items-center justify-center transition-opacity duration-300",
          isTransitioning && "opacity-0"
        )}
      >
        <div className="w-full max-w-7xl mx-auto px-16 py-12">
          {currentSlide.slide_type === 'title' ? (
            // Title Slide
            <div className="flex flex-col items-center justify-center text-center min-h-[60vh]">
              <h1 
                className="text-6xl md:text-7xl font-bold mb-6 leading-tight"
                style={{ color: `#${theme.pptx.titleColor}` }}
              >
                {currentSlide.title}
              </h1>
              {currentSlide.subtitle && (
                <p 
                  className="text-2xl md:text-3xl opacity-80"
                  style={{ color: `#${theme.pptx.textColor}` }}
                >
                  {currentSlide.subtitle}
                </p>
              )}
              <div 
                className="w-32 h-1 mt-8 rounded"
                style={{ backgroundColor: `#${theme.pptx.accentColor}` }}
              />
            </div>
          ) : (
            // Content Slide
            <div className="flex flex-col md:flex-row gap-12 items-start min-h-[60vh]">
              <div className={cn(
                "flex-1",
                currentSlide.image_url && (currentSlide.layout === 'split' || currentSlide.layout === 'image-right') && "md:w-1/2"
              )}>
                <h2 
                  className="text-4xl md:text-5xl font-bold mb-6"
                  style={{ color: `#${theme.pptx.titleColor}` }}
                >
                  {currentSlide.title}
                </h2>
                <div 
                  className="w-24 h-1 mb-8 rounded"
                  style={{ backgroundColor: `#${theme.pptx.accentColor}` }}
                />
                {currentSlide.bullets && currentSlide.bullets.length > 0 && (
                  <ul className="space-y-4">
                    {currentSlide.bullets.map((bullet, i) => (
                      <li 
                        key={i}
                        className="flex items-start gap-4 text-xl md:text-2xl"
                        style={{ color: `#${theme.pptx.textColor}` }}
                      >
                        <span 
                          className="w-3 h-3 rounded-full mt-2 shrink-0"
                          style={{ backgroundColor: `#${theme.pptx.accentColor}` }}
                        />
                        <span>{getBulletText(bullet as BulletItem)}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Image */}
              {currentSlide.image_url && (
                <div className="flex-1 flex items-center justify-center">
                  <img 
                    src={currentSlide.image_url} 
                    alt={currentSlide.title}
                    className="max-w-full max-h-[60vh] object-contain rounded-xl shadow-2xl"
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Controls Overlay */}
      <div 
        className={cn(
          "absolute inset-0 pointer-events-none transition-opacity duration-300",
          !showControls && "opacity-0"
        )}
      >
        {/* Exit Button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 pointer-events-auto bg-black/20 hover:bg-black/40 text-white"
          onClick={(e) => { e.stopPropagation(); onExit(); }}
        >
          <X className="h-5 w-5" />
        </Button>

        {/* Navigation Arrows */}
        {currentIndex > 0 && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-auto bg-black/20 hover:bg-black/40 text-white h-12 w-12"
            onClick={(e) => { e.stopPropagation(); prevSlide(); }}
          >
            <ChevronLeft className="h-8 w-8" />
          </Button>
        )}
        {currentIndex < visibleSlides.length - 1 && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-auto bg-black/20 hover:bg-black/40 text-white h-12 w-12"
            onClick={(e) => { e.stopPropagation(); nextSlide(); }}
          >
            <ChevronRight className="h-8 w-8" />
          </Button>
        )}

        {/* Progress Bar */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/20">
          <div 
            className="h-full transition-all duration-300"
            style={{ 
              width: `${((currentIndex + 1) / visibleSlides.length) * 100}%`,
              backgroundColor: `#${theme.pptx.accentColor}` 
            }}
          />
        </div>

        {/* Slide Counter */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 pointer-events-auto">
          <div className="bg-black/50 text-white px-4 py-2 rounded-full text-sm font-medium">
            {currentIndex + 1} / {visibleSlides.length}
          </div>
        </div>

        {/* Slide Thumbnails */}
        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 pointer-events-auto">
          <div className="flex gap-2 bg-black/50 p-2 rounded-lg max-w-[80vw] overflow-x-auto">
            {visibleSlides.map((slide, index) => (
              <button
                key={slide.id}
                onClick={(e) => { e.stopPropagation(); goToSlide(index); }}
                className={cn(
                  "w-16 h-10 rounded overflow-hidden border-2 transition-all shrink-0",
                  index === currentIndex ? "border-white" : "border-transparent opacity-60 hover:opacity-100"
                )}
                style={{ backgroundColor: `#${theme.pptx.background}` }}
              >
                <div 
                  className="w-full h-full flex items-center justify-center text-xs font-medium"
                  style={{ color: `#${theme.pptx.titleColor}` }}
                >
                  {index + 1}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
