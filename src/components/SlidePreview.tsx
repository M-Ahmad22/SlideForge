import { cn } from "@/lib/utils";
import type { DBSlide } from "@/hooks/usePresentations";
import { getThemeById, PptxTheme } from "@/lib/themes";

// Helper to extract text from bullet (handles both string and object formats)
type BulletItem = string | { text: string; subBullets?: string[] };

const getBulletText = (bullet: BulletItem): string => {
  if (typeof bullet === 'string') return bullet;
  if (typeof bullet === 'object' && bullet !== null && 'text' in bullet) {
    return bullet.text;
  }
  return String(bullet);
};

interface SlidePreviewProps {
  slide: DBSlide;
  themeId?: string;
  className?: string;
  showIndex?: number;
}

export function SlidePreview({ slide, themeId, className, showIndex }: SlidePreviewProps) {
  const theme = themeId ? getThemeById(themeId) : getThemeById('modern-blue');

  return (
    <div 
      className={cn(
        "aspect-video rounded-lg overflow-hidden relative shadow-card",
        className
      )}
      style={{ backgroundColor: `#${theme.pptx.background}` }}
    >
      {/* Slide number badge */}
      {showIndex !== undefined && (
        <div className="absolute top-2 left-2 text-xs font-medium px-1.5 py-0.5 rounded bg-background/80 text-foreground z-10">
          {showIndex + 1}
        </div>
      )}

      <div className="h-full p-4 flex flex-col">
        {slide.slide_type === 'title' ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <h1 
              className="text-lg font-bold mb-2 line-clamp-2"
              style={{ color: `#${theme.pptx.titleColor}` }}
            >
              {slide.title}
            </h1>
            {slide.subtitle && (
              <p 
                className="text-sm opacity-70 line-clamp-1"
                style={{ color: `#${theme.pptx.textColor}` }}
              >
                {slide.subtitle}
              </p>
            )}
            <div 
              className="w-12 h-0.5 mt-3 rounded"
              style={{ backgroundColor: `#${theme.pptx.accentColor}` }}
            />
          </div>
        ) : (
          <div className="flex-1 flex flex-col">
            <h2 
              className="text-sm font-semibold mb-2 line-clamp-1"
              style={{ color: `#${theme.pptx.titleColor}` }}
            >
              {slide.title}
            </h2>
            <div 
              className="w-6 h-0.5 mb-2 rounded"
              style={{ backgroundColor: `#${theme.pptx.accentColor}` }}
            />
            {slide.bullets && slide.bullets.length > 0 && (
              <ul className="space-y-1 flex-1 overflow-hidden">
                {slide.bullets.slice(0, 4).map((bullet, i) => (
                  <li 
                    key={i} 
                    className="flex items-start gap-1.5 text-xs line-clamp-1"
                    style={{ color: `#${theme.pptx.textColor}` }}
                  >
                    <span 
                      className="w-1 h-1 rounded-full mt-1.5 shrink-0"
                      style={{ backgroundColor: `#${theme.pptx.accentColor}` }}
                    />
                    <span className="truncate">{getBulletText(bullet as BulletItem)}</span>
                  </li>
                ))}
                {slide.bullets.length > 4 && (
                  <li 
                    className="text-xs opacity-50"
                    style={{ color: `#${theme.pptx.textColor}` }}
                  >
                    +{slide.bullets.length - 4} more...
                  </li>
                )}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

interface SlideCanvasProps {
  slide: DBSlide;
  themeId?: string;
  className?: string;
}

export function SlideCanvas({ slide, themeId, className }: SlideCanvasProps) {
  const theme = themeId ? getThemeById(themeId) : getThemeById('modern-blue');
  
  const isImageLayout = slide.layout === 'split' || slide.layout === 'image-left' || slide.layout === 'image-right';
  const imageOnRight = slide.layout === 'split' || slide.layout === 'image-right';

  return (
    <div 
      className={cn(
        "aspect-video rounded-xl overflow-hidden shadow-elevated",
        className
      )}
      style={{ backgroundColor: `#${theme.pptx.background}` }}
    >
      <div className="h-full p-12 flex flex-col">
        {slide.slide_type === 'title' ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <h1 
              className="text-4xl font-bold mb-4"
              style={{ color: `#${theme.pptx.titleColor}` }}
            >
              {slide.title}
            </h1>
            {slide.subtitle && (
              <p 
                className="text-xl opacity-70"
                style={{ color: `#${theme.pptx.textColor}` }}
              >
                {slide.subtitle}
              </p>
            )}
            <div 
              className="w-24 h-1 mt-6 rounded"
              style={{ backgroundColor: `#${theme.pptx.accentColor}` }}
            />
          </div>
        ) : (
          <div className={cn("flex-1 flex flex-col", isImageLayout && "flex-row gap-8")}>
            <div className={cn("flex flex-col", isImageLayout && "flex-1", imageOnRight ? "order-1" : "order-2")}>
              <h2 
                className="text-3xl font-bold mb-4"
                style={{ color: `#${theme.pptx.titleColor}` }}
              >
                {slide.title}
              </h2>
              <div 
                className="w-16 h-1 mb-6 rounded"
                style={{ backgroundColor: `#${theme.pptx.accentColor}` }}
              />
              {slide.bullets && slide.bullets.length > 0 && (
                <ul className="space-y-4 flex-1">
                  {slide.bullets.map((bullet, i) => (
                    <li 
                      key={i} 
                      className="flex items-start gap-3"
                      style={{ color: `#${theme.pptx.textColor}` }}
                    >
                      <span 
                        className="w-2 h-2 rounded-full mt-2 shrink-0"
                        style={{ backgroundColor: `#${theme.pptx.accentColor}` }}
                      />
                      <span className="text-lg">{getBulletText(bullet as BulletItem)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            
            {isImageLayout && (
              <div className={cn("flex-1 flex items-center justify-center", imageOnRight ? "order-2" : "order-1")}>
                {slide.image_url ? (
                  <img 
                    src={slide.image_url} 
                    alt={slide.title}
                    className="max-w-full max-h-full object-contain rounded-lg"
                  />
                ) : (
                  <div 
                    className="w-full h-full rounded-lg border-2 border-dashed flex items-center justify-center"
                    style={{ 
                      borderColor: `#${theme.pptx.accentColor}40`,
                      backgroundColor: `#${theme.pptx.accentColor}10`
                    }}
                  >
                    <span 
                      className="text-sm opacity-50"
                      style={{ color: `#${theme.pptx.textColor}` }}
                    >
                      Image placeholder
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
