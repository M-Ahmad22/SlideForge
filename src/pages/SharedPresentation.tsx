 import { useState, useEffect, useCallback } from "react";
 import { useParams, useNavigate } from "react-router-dom";
 import { 
   ArrowLeft, 
   Play, 
   Download, 
   Loader2, 
   Eye, 
   Edit,
   Lock,
   Save,
   ChevronLeft,
   ChevronRight,
   Zap,
 } from "lucide-react";
 import { Button } from "@/components/ui/button";
 import { Badge } from "@/components/ui/badge";
 import { Input } from "@/components/ui/input";
 import { ScrollArea } from "@/components/ui/scroll-area";
 import { toast } from "sonner";
 import { supabase } from "@/integrations/supabase/client";
 import { SlidePreview, SlideCanvas } from "@/components/SlidePreview";
 import { SlideshowMode } from "@/components/editor/SlideshowMode";
 import { InteractiveCanvas } from "@/components/editor/InteractiveCanvas";
 import { downloadPptx, SlideData, PresentationData } from "@/lib/pptxGenerator";
 import { cn } from "@/lib/utils";
 
 interface SharedInfo {
   presentation_id: string;
   permission: 'view' | 'edit';
   title: string;
   theme_id: string;
 }
 
 interface DBSlide {
   id: string;
   presentation_id: string;
   order_index: number;
   slide_type: string | null;
   title: string;
   subtitle: string | null;
   bullets: string[] | null;
   speaker_notes: string | null;
   image_url: string | null;
   image_prompt: string | null;
   layout: string | null;
   animation: string | null;
   background_color: string | null;
   created_at: string | null;
   updated_at: string | null;
 }
 
 const SharedPresentation = () => {
   const { token } = useParams();
   const navigate = useNavigate();
   
   const [isLoading, setIsLoading] = useState(true);
   const [error, setError] = useState<string | null>(null);
   const [sharedInfo, setSharedInfo] = useState<SharedInfo | null>(null);
   const [slides, setSlides] = useState<DBSlide[]>([]);
   const [selectedSlideId, setSelectedSlideId] = useState<string | null>(null);
   const [slideshowMode, setSlideshowMode] = useState(false);
   const [isSaving, setIsSaving] = useState(false);
   
   const currentSlide = slides.find(s => s.id === selectedSlideId) || slides[0];
   const currentIndex = slides.findIndex(s => s.id === selectedSlideId);
   
   // Fetch shared presentation info
   useEffect(() => {
     const fetchSharedPresentation = async () => {
       if (!token) {
         setError('Invalid share link');
         setIsLoading(false);
         return;
       }
       
       try {
         // Get share info using RPC function
         const { data: shareData, error: shareError } = await supabase
           .rpc('get_shared_presentation', { share_token_param: token });
         
         if (shareError) throw shareError;
         if (!shareData || shareData.length === 0) {
           setError('Share link not found or expired');
           setIsLoading(false);
           return;
         }
         
         const info = shareData[0] as SharedInfo;
         setSharedInfo(info);
         
         // Fetch slides
         const { data: slidesData, error: slidesError } = await supabase
           .from('slides')
           .select('*')
           .eq('presentation_id', info.presentation_id)
           .order('order_index');
         
         if (slidesError) throw slidesError;
         
         setSlides(slidesData as DBSlide[]);
         if (slidesData.length > 0) {
           setSelectedSlideId(slidesData[0].id);
         }
       } catch (err) {
         console.error('Error fetching shared presentation:', err);
         setError('Failed to load presentation');
       } finally {
         setIsLoading(false);
       }
     };
     
     fetchSharedPresentation();
   }, [token]);
   
   // Update slide (for edit mode)
   const handleSlideUpdate = async (updates: Partial<DBSlide>) => {
     if (!currentSlide || sharedInfo?.permission !== 'edit') return;
     
     setIsSaving(true);
     try {
       const { error } = await supabase
         .from('slides')
         .update(updates)
         .eq('id', currentSlide.id);
       
       if (error) throw error;
       
       setSlides(slides.map(s => 
         s.id === currentSlide.id ? { ...s, ...updates } : s
       ));
     } catch (err) {
       console.error('Error updating slide:', err);
       toast.error('Failed to save changes');
     } finally {
       setIsSaving(false);
     }
   };
   
   // Export PPTX
   const handleExport = async () => {
     if (slides.length === 0) return;
     
     try {
       const slideData: SlideData[] = slides.map(slide => ({
         id: slide.id,
         slideType: slide.slide_type || 'content',
         title: slide.title,
         subtitle: slide.subtitle || undefined,
         bullets: slide.bullets || [],
         speakerNotes: slide.speaker_notes || undefined,
         imageUrl: slide.image_url || undefined,
         layout: slide.layout || 'full',
         animation: slide.animation || undefined,
       }));
 
       const presentationData: PresentationData = {
         title: sharedInfo?.title || 'Presentation',
         themeId: sharedInfo?.theme_id || 'modern-blue',
         slides: slideData,
         animationStyle: 'professional',
       };
 
       await downloadPptx(presentationData);
       toast.success('Presentation exported!');
     } catch (error) {
       console.error('Export error:', error);
       toast.error('Failed to export presentation');
     }
   };
   
   if (isLoading) {
     return (
       <div className="min-h-screen bg-background flex items-center justify-center">
         <div className="text-center">
           <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-4" />
           <p className="text-muted-foreground">Loading presentation...</p>
         </div>
       </div>
     );
   }
   
   if (error || !sharedInfo) {
     return (
       <div className="min-h-screen bg-background flex items-center justify-center">
         <div className="text-center max-w-md mx-auto px-4">
           <Lock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
           <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
           <p className="text-muted-foreground mb-6">
             {error || 'This share link is invalid or has expired.'}
           </p>
           <Button onClick={() => navigate('/')}>
             Go to Homepage
           </Button>
         </div>
       </div>
     );
   }
   
   // Slideshow Mode
   if (slideshowMode) {
     return (
       <SlideshowMode
         slides={slides}
         hiddenSlides={new Set()}
         themeId={sharedInfo.theme_id}
         initialSlideIndex={currentIndex}
         onExit={() => setSlideshowMode(false)}
       />
     );
   }
   
   return (
     <div className="h-screen flex flex-col bg-background overflow-hidden">
       {/* Header */}
       <header className="h-14 border-b border-border bg-card flex items-center px-4 gap-4 shrink-0">
         <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
           <ArrowLeft className="h-5 w-5" />
         </Button>
         
         <div className="flex items-center gap-2">
           <div className="h-8 w-8 rounded-lg bg-gradient-primary flex items-center justify-center">
             <Zap className="h-4 w-4 text-primary-foreground" />
           </div>
           <span className="font-semibold">{sharedInfo.title}</span>
         </div>
         
         <Badge variant="secondary" className="gap-1">
           {sharedInfo.permission === 'edit' ? (
             <>
               <Edit className="h-3 w-3" />
               Can Edit
             </>
           ) : (
             <>
               <Eye className="h-3 w-3" />
               View Only
             </>
           )}
         </Badge>
 
         <div className="flex-1" />
 
         <div className="flex items-center gap-2">
           {isSaving && (
             <Badge variant="outline" className="gap-1">
               <Loader2 className="h-3 w-3 animate-spin" />
               Saving...
             </Badge>
           )}
           <Button 
             variant="outline" 
             size="sm" 
             onClick={() => setSlideshowMode(true)}
           >
             <Play className="h-4 w-4 mr-2" />
             Present
           </Button>
           <Button variant="gradient" size="sm" onClick={handleExport}>
             <Download className="h-4 w-4 mr-2" />
             Export PPTX
           </Button>
         </div>
       </header>
 
       <div className="flex-1 flex overflow-hidden">
         {/* Slide Thumbnails */}
         <aside className="w-48 border-r border-border bg-card/50">
           <ScrollArea className="h-full p-2">
             <div className="space-y-2">
               {slides.map((slide, index) => (
                 <button
                   key={slide.id}
                   onClick={() => setSelectedSlideId(slide.id)}
                   className={cn(
                     "w-full text-left p-1 rounded-lg transition-all",
                     selectedSlideId === slide.id 
                       ? "ring-2 ring-primary" 
                       : "hover:bg-secondary/50"
                   )}
                 >
                   <div className="aspect-video bg-muted rounded overflow-hidden">
                   <SlidePreview
                     slide={slide}
                     themeId={sharedInfo.theme_id}
                     showIndex={index}
                   />
                   </div>
                 </button>
               ))}
             </div>
           </ScrollArea>
         </aside>
 
         {/* Main Canvas */}
         <main className="flex-1 flex flex-col overflow-hidden">
           {/* Navigation */}
           <div className="h-10 border-b border-border bg-secondary/30 flex items-center justify-center gap-4 shrink-0">
             <Button 
               variant="ghost" 
               size="icon"
               className="h-8 w-8"
               disabled={currentIndex === 0}
               onClick={() => setSelectedSlideId(slides[currentIndex - 1]?.id)}
             >
               <ChevronLeft className="h-4 w-4" />
             </Button>
             <span className="text-sm font-medium">
               Slide {currentIndex + 1} of {slides.length}
             </span>
             <Button 
               variant="ghost" 
               size="icon"
               className="h-8 w-8"
               disabled={currentIndex === slides.length - 1}
               onClick={() => setSelectedSlideId(slides[currentIndex + 1]?.id)}
             >
               <ChevronRight className="h-4 w-4" />
             </Button>
           </div>
 
           {/* Slide View */}
           <div className="flex-1 p-6 flex items-center justify-center overflow-auto bg-secondary/20">
             <div className="w-full max-w-5xl aspect-video">
               {currentSlide && (
                 sharedInfo.permission === 'edit' ? (
                   <InteractiveCanvas
                     slide={currentSlide}
                     themeId={sharedInfo.theme_id}
                     onUpdate={handleSlideUpdate}
                   />
                 ) : (
                   <SlideCanvas
                     slide={currentSlide}
                     themeId={sharedInfo.theme_id}
                   />
                 )
               )}
             </div>
           </div>
         </main>
       </div>
     </div>
   );
 };
 
 export default SharedPresentation;