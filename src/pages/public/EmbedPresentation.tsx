import { useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Loader2, AlertCircle, ExternalLink } from "lucide-react";
import { getThemeById } from "@/lib/themes";
import { usePublicPresentation } from "@/hooks/usePublicPresentation";
import { PublicSlideViewer } from "@/components/public";
import { cn } from "@/lib/utils";

/**
 * Embeddable Presentation Component
 * Route: /embed/:token
 * 
 * Designed specifically for:
 * - iframe embedding in Notion, blogs, portfolios
 * - Clean minimal UI
 * - No header/branding (optional via query param)
 * - Responsive sizing
 */
const EmbedPresentation = () => {
  const { token } = useParams<{ token: string }>();
  const [searchParams] = useSearchParams();
  
  // Embed options via query params
  const startSlide = parseInt(searchParams.get('slide') || '0', 10);
  const showBranding = searchParams.get('branding') !== 'false';
  const autoPlay = searchParams.get('autoplay') === 'true';
  const autoPlayInterval = parseInt(searchParams.get('interval') || '5000', 10);
  
  const { presentationInfo, slides, isLoading, error } = usePublicPresentation(token);
  const [currentIndex, setCurrentIndex] = useState(startSlide);

  const theme = presentationInfo ? getThemeById(presentationInfo.theme_id) : getThemeById('modern-blue');

  // Loading
  if (isLoading) {
    return (
      <div 
        className="w-full h-full min-h-[200px] flex items-center justify-center"
        style={{ backgroundColor: `#${theme.pptx.background}` }}
      >
        <Helmet>
          <title>Loading... | SlideForge</title>
        </Helmet>
        <Loader2 
          className="h-8 w-8 animate-spin"
          style={{ color: `#${theme.pptx.accentColor}` }}
        />
      </div>
    );
  }

  // Error
  if (error || !presentationInfo) {
    return (
      <div className="w-full h-full min-h-[200px] flex items-center justify-center bg-slate-900 text-white p-4">
        <Helmet>
          <title>Error | SlideForge</title>
        </Helmet>
        <div className="text-center">
          <AlertCircle className="h-8 w-8 text-slate-500 mx-auto mb-2" />
          <p className="text-sm text-slate-400">
            {error?.includes('expired') ? 'This embed link has expired' : 'Presentation unavailable'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full min-h-[200px] flex flex-col">
      <Helmet>
        <title>{presentationInfo.title} | SlideForge Embed</title>
      </Helmet>
      
      {/* Optional Branding */}
      {showBranding && (
        <div className="h-8 px-3 flex items-center justify-between bg-slate-900 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="h-5 w-5 rounded bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
              <span className="text-white text-xs font-bold">S</span>
            </div>
            <span className="text-xs text-slate-400 truncate max-w-[150px]">
              {presentationInfo.title}
            </span>
          </div>
          <a
            href={`/p/${token}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-slate-500 hover:text-violet-400 transition-colors flex items-center gap-1"
          >
            <ExternalLink className="h-3 w-3" />
            Open
          </a>
        </div>
      )}

      {/* Slide Viewer */}
      <div className="flex-1">
        <PublicSlideViewer
          slides={slides}
          theme={theme}
          initialIndex={currentIndex}
          autoPlay={autoPlay}
          autoPlayInterval={autoPlayInterval}
          showControls={true}
          embedded={true}
          onSlideChange={setCurrentIndex}
        />
      </div>
    </div>
  );
};

export default EmbedPresentation;
