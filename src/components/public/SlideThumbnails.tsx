import { memo } from "react";
import { cn } from "@/lib/utils";
import { PptxTheme } from "@/lib/themes";
import type { PublicSlide } from "./PublicSlideViewer";

interface SlideThumbnailsProps {
  slides: PublicSlide[];
  theme: PptxTheme;
  currentIndex: number;
  onSelectSlide: (index: number) => void;
  orientation?: 'horizontal' | 'vertical';
  compact?: boolean;
}

export const SlideThumbnails = memo(function SlideThumbnails({
  slides,
  theme,
  currentIndex,
  onSelectSlide,
  orientation = 'vertical',
  compact = false,
}: SlideThumbnailsProps) {
  return (
    <div 
      className={cn(
        "flex gap-2 p-2 bg-slate-900/95 backdrop-blur-sm",
        orientation === 'vertical' 
          ? "flex-col overflow-y-auto" 
          : "flex-row overflow-x-auto"
      )}
    >
      {slides.map((slide, index) => (
        <button
          key={slide.id}
          onClick={() => onSelectSlide(index)}
          className={cn(
            "shrink-0 rounded-lg overflow-hidden transition-all duration-200 group",
            orientation === 'vertical' 
              ? (compact ? "w-20 h-12" : "w-32 h-20") 
              : (compact ? "w-16 h-10" : "w-24 h-16"),
            currentIndex === index 
              ? "ring-2 ring-violet-500 ring-offset-2 ring-offset-slate-900" 
              : "ring-1 ring-slate-700 hover:ring-slate-500"
          )}
        >
          <div 
            className="w-full h-full flex flex-col items-center justify-center p-1"
            style={{ backgroundColor: `#${theme.pptx.background}` }}
          >
            <span 
              className={cn(
                "font-medium text-center line-clamp-1",
                compact ? "text-[6px]" : "text-[8px]"
              )}
              style={{ color: `#${theme.pptx.titleColor}` }}
            >
              {slide.title}
            </span>
            <span 
              className={cn(
                "absolute bottom-0.5 right-1 font-bold opacity-60",
                compact ? "text-[8px]" : "text-[10px]"
              )}
              style={{ color: `#${theme.pptx.textColor}` }}
            >
              {index + 1}
            </span>
          </div>
        </button>
      ))}
    </div>
  );
});

export default SlideThumbnails;
