import { useState, useEffect, useCallback } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Loader2, Lock, AlertCircle, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { getThemeById } from "@/lib/themes";
import { usePublicPresentation } from "@/hooks/usePublicPresentation";
import { PublicSlideViewer, SlideForgeHeader, SlideThumbnails } from "@/components/public";
import { downloadPptx, SlideData, PresentationData } from "@/lib/pptxGenerator";
import { cn } from "@/lib/utils";

/**
 * Standalone Public Presentation Viewer
 * Routes: /p/:token, /view/:token
 * 
 * This is a completely standalone viewer that:
 * - Does NOT require authentication
 * - Does NOT load dashboard/admin components
 * - Provides a clean, fast, professional viewing experience
 * - Supports SEO with OG meta tags
 */
const PublicPresentation = () => {
  const { token } = useParams<{ token: string }>();
  const [searchParams] = useSearchParams();
  const startSlide = parseInt(searchParams.get('slide') || '0', 10);
  
  const { presentationInfo, slides, isLoading, error } = usePublicPresentation(token);
  const [currentIndex, setCurrentIndex] = useState(startSlide);
  const [showThumbnails, setShowThumbnails] = useState(true);
  const [isFullscreenMode, setIsFullscreenMode] = useState(false);

  const theme = presentationInfo ? getThemeById(presentationInfo.theme_id) : getThemeById('modern-blue');
  
  // Get first slide image for OG preview
  const firstSlideWithImage = slides.find(s => s.image_url);
  const ogImage = firstSlideWithImage?.image_url || '/placeholder.svg';

  const handleExport = useCallback(async () => {
    if (slides.length === 0 || !presentationInfo) return;

    try {
      const slideData: SlideData[] = slides.map(slide => ({
        id: slide.id,
        slideType: slide.slide_type || 'content',
        title: slide.title,
        subtitle: slide.subtitle || undefined,
        bullets: (slide.bullets || []) as string[],
        imageUrl: slide.image_url || undefined,
        layout: slide.layout || 'full',
      }));

      const presentationData: PresentationData = {
        title: presentationInfo.title,
        themeId: presentationInfo.theme_id,
        slides: slideData,
        animationStyle: 'professional',
      };

      await downloadPptx(presentationData);
      toast.success('Presentation downloaded!');
    } catch (err) {
      console.error('Export error:', err);
      toast.error('Failed to export presentation');
    }
  }, [slides, presentationInfo]);

  const handlePresent = useCallback(() => {
    setIsFullscreenMode(true);
    setShowThumbnails(false);
  }, []);

  // Exit fullscreen with Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreenMode) {
        setIsFullscreenMode(false);
        setShowThumbnails(true);
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isFullscreenMode]);

  // Loading State
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Helmet>
          <title>Loading Presentation... | SlideForge</title>
        </Helmet>
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-violet-500 mx-auto mb-4" />
          <p className="text-slate-400 text-lg">Loading presentation...</p>
        </div>
      </div>
    );
  }

  // Error State
  if (error || !presentationInfo) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <Helmet>
          <title>Presentation Not Found | SlideForge</title>
          <meta name="robots" content="noindex" />
        </Helmet>
        <div className="text-center max-w-md mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto mb-6">
            {error?.includes('expired') ? (
              <Lock className="h-8 w-8 text-slate-500" />
            ) : (
              <AlertCircle className="h-8 w-8 text-slate-500" />
            )}
          </div>
          <h1 className="text-2xl font-bold text-white mb-3">
            {error?.includes('expired') ? 'Link Expired' : 'Presentation Not Found'}
          </h1>
          <p className="text-slate-400 mb-8">
            {error || 'This presentation link is invalid or has been removed.'}
          </p>
          <a 
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-violet-600 hover:bg-violet-500 text-white font-medium transition-colors"
          >
            <ExternalLink className="h-4 w-4" />
            Go to SlideForge
          </a>
        </div>
      </div>
    );
  }

  // Fullscreen Presentation Mode
  if (isFullscreenMode) {
    return (
      <div className="fixed inset-0 z-50 bg-black">
        <Helmet>
          <title>{presentationInfo.title} | SlideForge</title>
        </Helmet>
        <PublicSlideViewer
          slides={slides}
          theme={theme}
          initialIndex={currentIndex}
          showControls={true}
          onSlideChange={setCurrentIndex}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      {/* SEO Meta Tags */}
      <Helmet>
        <title>{presentationInfo.title} | SlideForge</title>
        <meta name="description" content={`View "${presentationInfo.title}" - A presentation created with SlideForge`} />
        
        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content={presentationInfo.title} />
        <meta property="og:description" content={`View this presentation created with SlideForge`} />
        <meta property="og:image" content={ogImage} />
        <meta property="og:site_name" content="SlideForge" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={presentationInfo.title} />
        <meta name="twitter:description" content={`View this presentation created with SlideForge`} />
        <meta name="twitter:image" content={ogImage} />
      </Helmet>

      {/* Header */}
      <SlideForgeHeader
        title={presentationInfo.title}
        permission={presentationInfo.permission}
        showBranding={true}
        onExport={handleExport}
        onPresent={handlePresent}
      />

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Thumbnails Sidebar */}
        {showThumbnails && (
          <aside className="w-40 md:w-48 border-r border-slate-800 bg-slate-900/50 hidden sm:block">
            <SlideThumbnails
              slides={slides}
              theme={theme}
              currentIndex={currentIndex}
              onSelectSlide={setCurrentIndex}
              orientation="vertical"
            />
          </aside>
        )}

        {/* Slide Viewer */}
        <main className="flex-1 flex items-center justify-center p-4 md:p-8">
          <div className="w-full max-w-5xl aspect-video rounded-xl overflow-hidden shadow-2xl shadow-black/50">
            <PublicSlideViewer
              slides={slides}
              theme={theme}
              initialIndex={currentIndex}
              showControls={true}
              onSlideChange={setCurrentIndex}
            />
          </div>
        </main>
      </div>

      {/* Mobile Thumbnails */}
      <div className="sm:hidden border-t border-slate-800">
        <SlideThumbnails
          slides={slides}
          theme={theme}
          currentIndex={currentIndex}
          onSelectSlide={setCurrentIndex}
          orientation="horizontal"
          compact
        />
      </div>
    </div>
  );
};

export default PublicPresentation;
