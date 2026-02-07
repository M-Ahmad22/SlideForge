import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { 
  ArrowLeft, 
  Save, 
  Download, 
  Play, 
  Plus, 
  Trash2, 
  Copy,
  MoreVertical,
  Type,
  Image,
  Layout,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Zap,
  Loader2,
  RefreshCw,
  Expand,
  Minimize2,
  Wand2,
  Settings,
  FileText,
  Eye,
  EyeOff,
  LayoutGrid,
  Palette,
  PanelLeftClose,
  PanelLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useSlides, usePresentations, DBSlide } from "@/hooks/usePresentations";
import { SlidePreview, SlideCanvas } from "@/components/SlidePreview";
import { SlidePanel } from "@/components/editor/SlidePanel";
import { SlideshowMode } from "@/components/editor/SlideshowMode";
import { AISlideActions } from "@/components/editor/AISlideActions";
import { ThemeManager } from "@/components/editor/ThemeManager";
 import { InteractiveCanvas } from "@/components/editor/InteractiveCanvas";
 import { ShareDialog } from "@/components/editor/ShareDialog";
import { downloadPptx, SlideData, PresentationData } from "@/lib/pptxGenerator";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

const Editor = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user, isLoading: authLoading } = useAuth();
  const { presentations, updatePresentation } = usePresentations();
  const { slides, isLoading, updateSlide, addSlide, deleteSlide, duplicateSlide, fetchSlides, setSlides } = useSlides(id);
  
  const [selectedSlideId, setSelectedSlideId] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [rightPanelTab, setRightPanelTab] = useState("properties");
  const [isSaving, setIsSaving] = useState(false);
  const [isImproving, setIsImproving] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [presentationTitle, setPresentationTitle] = useState("Untitled");
  const [themeId, setThemeId] = useState("modern-blue");
  const [currentFont, setCurrentFont] = useState("Calibri");
  const [hiddenSlides, setHiddenSlides] = useState<Set<string>>(new Set());
  const [structureLocked, setStructureLocked] = useState(false);
  const [themeApplyTo, setThemeApplyTo] = useState<'slide' | 'all'>('all');
  const [slideshowMode, setSlideshowMode] = useState(false);

  const presentation = presentations.find(p => p.id === id);
  
  useEffect(() => {
    if (presentation) {
      setPresentationTitle(presentation.title);
      if (presentation.theme_id) {
        setThemeId(presentation.theme_id);
      }
    }
  }, [presentation]);

  useEffect(() => {
    if (slides.length > 0 && !selectedSlideId) {
      setSelectedSlideId(slides[0].id);
    }
  }, [slides, selectedSlideId]);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  const currentSlide = slides.find((s) => s.id === selectedSlideId) || slides[0];
  const currentIndex = slides.findIndex((s) => s.id === selectedSlideId);

  const handleSlideUpdate = async (updates: Partial<DBSlide>) => {
    if (!currentSlide) return;
    await updateSlide(currentSlide.id, updates);
  };

  const handleAddSlide = async (afterIndex: number) => {
    await addSlide(afterIndex);
  };

  const handleDeleteSlide = async (slideId: string) => {
    await deleteSlide(slideId);
    if (selectedSlideId === slideId && slides.length > 1) {
      const newIndex = Math.max(0, currentIndex - 1);
      setSelectedSlideId(slides[newIndex]?.id || null);
    }
  };

  const handleDuplicateSlide = async (slideId: string) => {
    await duplicateSlide(slideId);
  };

  const handleToggleHidden = (slideId: string) => {
    setHiddenSlides(prev => {
      const next = new Set(prev);
      if (next.has(slideId)) {
        next.delete(slideId);
      } else {
        next.add(slideId);
      }
      return next;
    });
  };

  const handleReorderSlides = async (startIndex: number, endIndex: number) => {
    // Optimistic update
    const reorderedSlides = [...slides];
    const [removed] = reorderedSlides.splice(startIndex, 1);
    reorderedSlides.splice(endIndex, 0, removed);
    
    // Update order_index for all affected slides
    const updatedSlides = reorderedSlides.map((slide, index) => ({
      ...slide,
      order_index: index
    }));
    
    setSlides(updatedSlides);

    // Persist to database
    try {
      for (let i = 0; i < updatedSlides.length; i++) {
        await supabase
          .from('slides')
          .update({ order_index: i })
          .eq('id', updatedSlides[i].id);
      }
    } catch (error) {
      console.error("Reorder error:", error);
      toast.error("Failed to reorder slides");
      fetchSlides(); // Revert
    }
  };

  const handleImproveSlide = async (action: 'improve' | 'expand' | 'simplify' | 'regenerate' | 'bullets' | 'diagram') => {
    if (!currentSlide) return;
    
    setIsImproving(true);
    try {
      const { data, error } = await supabase.functions.invoke('improve-slide', {
        body: {
          action,
          title: currentSlide.title,
          bullets: currentSlide.bullets || [],
          speakerNotes: currentSlide.speaker_notes,
          structureLocked,
        },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      await updateSlide(currentSlide.id, {
        title: data.title,
        bullets: data.bullets,
        speaker_notes: data.speakerNotes,
      });

      toast.success(`Slide ${action === 'bullets' ? 'converted to bullets' : action + 'd'} successfully!`);
    } catch (error) {
      console.error("Improve error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to improve slide");
    } finally {
      setIsImproving(false);
    }
  };

  const handleAIInsert = async (position: 'before' | 'after', prompt: string) => {
    if (!currentSlide) return;
    
    setIsImproving(true);
    try {
      const { data, error } = await supabase.functions.invoke('improve-slide', {
        body: {
          action: 'generate',
          prompt,
          context: {
            currentSlideTitle: currentSlide.title,
            presentationTitle,
            position,
          },
        },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      // Insert the new slide
      const insertIndex = position === 'before' ? currentIndex : currentIndex + 1;
      
      // Update order indices
      const slidesToUpdate = slides.filter(s => s.order_index >= insertIndex);
      for (const slide of slidesToUpdate) {
        await supabase
          .from('slides')
          .update({ order_index: slide.order_index + 1 })
          .eq('id', slide.id);
      }

      // Insert new slide
      await supabase.from('slides').insert({
        presentation_id: id,
        order_index: insertIndex,
        slide_type: data.slideType || 'content',
        title: data.title,
        bullets: data.bullets,
        speaker_notes: data.speakerNotes,
        layout: data.layout || 'full',
        image_prompt: data.imagePrompt,
      });

      await fetchSlides();
      toast.success("AI slide generated and inserted!");
    } catch (error) {
      console.error("AI insert error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to generate slide");
    } finally {
      setIsImproving(false);
    }
  };

  const handleGenerateImage = async () => {
    if (!currentSlide || !currentSlide.image_prompt) {
      toast.error("No image prompt available for this slide");
      return;
    }

    setIsGeneratingImage(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-image', {
        body: {
          prompt: currentSlide.image_prompt,
          slideId: currentSlide.id,
          presentationId: id,
        },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      await updateSlide(currentSlide.id, {
        image_url: data.imageUrl,
      });

      toast.success("Image generated!");
    } catch (error) {
      console.error("Image generation error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to generate image");
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleThemeChange = async (newThemeId: string) => {
    setThemeId(newThemeId);
    if (themeApplyTo === 'all' && id) {
      await updatePresentation(id, { theme_id: newThemeId });
    }
  };

  const handleExport = async () => {
    if (slides.length === 0) {
      toast.error("No slides to export");
      return;
    }

    setIsSaving(true);
    try {
      const visibleSlides = slides.filter(s => !hiddenSlides.has(s.id));
      
      const slideData: SlideData[] = visibleSlides.map(slide => ({
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
        title: presentationTitle,
        themeId: themeId,
        slides: slideData,
        animationStyle: presentation?.animation_style || 'professional',
      };

      await downloadPptx(presentationData);
      toast.success("Presentation exported successfully!");
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export presentation");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSave = async () => {
    if (!id) return;
    
    setIsSaving(true);
    try {
      await supabase
        .from('presentations')
        .update({ 
          title: presentationTitle,
          theme_id: themeId,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);
      
      toast.success("Saved!");
    } catch (error) {
      toast.error("Failed to save");
    } finally {
      setIsSaving(false);
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!id) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Presentation not found</h1>
          <Button onClick={() => navigate("/dashboard")}>Go to Dashboard</Button>
        </div>
      </div>
    );
  }

  // Slideshow Mode
  if (slideshowMode) {
    return (
      <SlideshowMode
        slides={slides}
        hiddenSlides={hiddenSlides}
        themeId={themeId}
        initialSlideIndex={currentIndex}
        onExit={() => setSlideshowMode(false)}
      />
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {/* Top Toolbar */}
      <header className="h-14 border-b border-border bg-card flex items-center px-4 gap-4 shrink-0">
        <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-primary flex items-center justify-center">
            <Zap className="h-4 w-4 text-primary-foreground" />
          </div>
          <Input 
            value={presentationTitle} 
            className="w-64 font-semibold bg-transparent border-none focus-visible:ring-1"
            onChange={(e) => setPresentationTitle(e.target.value)}
            onBlur={handleSave}
          />
        </div>

        <div className="flex-1" />

        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setSlideshowMode(true)}
          >
            <Play className="h-4 w-4 mr-2" />
            Present
          </Button>
           {id && (
             <ShareDialog 
               presentationId={id} 
               presentationTitle={presentationTitle}
             />
           )}
          <Button variant="ghost" size="sm" onClick={handleSave} disabled={isSaving}>
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
            Save
          </Button>
          <Button variant="gradient" size="sm" onClick={handleExport} disabled={isSaving}>
            <Download className="h-4 w-4 mr-2" />
            Export PPTX
          </Button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Slide Panel */}
        <aside 
          className={cn(
            "border-r border-border transition-all duration-300 shrink-0",
            sidebarCollapsed ? "w-0" : "w-60"
          )}
        >
          {!sidebarCollapsed && (
            <SlidePanel
              slides={slides}
              selectedSlideId={selectedSlideId}
              themeId={themeId}
              hiddenSlides={hiddenSlides}
              onSelectSlide={setSelectedSlideId}
              onAddSlide={handleAddSlide}
              onDuplicateSlide={handleDuplicateSlide}
              onDeleteSlide={handleDeleteSlide}
              onToggleHidden={handleToggleHidden}
              onReorderSlides={handleReorderSlides}
            />
          )}
        </aside>

        {/* Sidebar Toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 h-8 w-6 rounded-l-none bg-card border border-l-0 border-border"
          style={{ left: sidebarCollapsed ? 0 : "239px" }}
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
        >
          {sidebarCollapsed ? (
            <PanelLeft className="h-4 w-4" />
          ) : (
            <PanelLeftClose className="h-4 w-4" />
          )}
        </Button>

        {/* Main Canvas */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Slide Navigation */}
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
              {hiddenSlides.has(currentSlide?.id || '') && (
                <Badge variant="secondary" className="ml-2 text-xs">
                  <EyeOff className="h-3 w-3 mr-1" />
                  Hidden
                </Badge>
              )}
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

          {/* Canvas Area */}
          <div className="flex-1 p-8 overflow-auto bg-muted/30">
            <div className="max-w-4xl mx-auto">
              {currentSlide && (
                <InteractiveCanvas 
                  slide={currentSlide} 
                  themeId={themeId}
                  onUpdate={handleSlideUpdate}
                />
              )}
            </div>
          </div>
        </main>

        {/* Right Sidebar - Properties */}
        <aside className="w-80 border-l border-border bg-card shrink-0 overflow-hidden flex flex-col">
          <Tabs value={rightPanelTab} onValueChange={setRightPanelTab} className="flex-1 flex flex-col">
            <TabsList className="w-full justify-start rounded-none border-b border-border bg-transparent h-11 p-0">
              <TabsTrigger value="properties" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary text-xs">
                <FileText className="h-4 w-4 mr-1" />
                Content
              </TabsTrigger>
              <TabsTrigger value="design" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary text-xs">
                <Palette className="h-4 w-4 mr-1" />
                Design
              </TabsTrigger>
              <TabsTrigger value="ai" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary text-xs">
                <Sparkles className="h-4 w-4 mr-1" />
                AI
              </TabsTrigger>
            </TabsList>

            <ScrollArea className="flex-1">
              <TabsContent value="properties" className="p-4 space-y-6 mt-0">
                {currentSlide && (
                  <>
                    {/* Slide Type */}
                    <div className="space-y-2">
                      <Label>Slide Type</Label>
                      <Badge className="capitalize">{currentSlide.slide_type}</Badge>
                    </div>

                    {/* Title */}
                    <div className="space-y-2">
                      <Label>Title</Label>
                      <Input
                        value={currentSlide.title}
                        onChange={(e) => handleSlideUpdate({ title: e.target.value })}
                      />
                    </div>

                    {/* Subtitle (for title slides) */}
                    {currentSlide.slide_type === 'title' && (
                      <div className="space-y-2">
                        <Label>Subtitle</Label>
                        <Input
                          value={currentSlide.subtitle || ''}
                          onChange={(e) => handleSlideUpdate({ subtitle: e.target.value })}
                          placeholder="Add a subtitle..."
                        />
                      </div>
                    )}

                    {/* Content */}
                    {currentSlide.bullets && currentSlide.bullets.length > 0 && (
                      <div className="space-y-2">
                        <Label>Content (one bullet per line)</Label>
                        <Textarea
                          value={currentSlide.bullets.map(b => 
                            typeof b === 'string' ? b : (b as any)?.text || ''
                          ).join("\n")}
                          onChange={(e) =>
                            handleSlideUpdate({
                              bullets: e.target.value.split("\n").filter(b => b.trim()),
                            })
                          }
                          className="min-h-[150px] font-mono text-sm"
                          placeholder="One bullet point per line"
                        />
                      </div>
                    )}

                    {/* Speaker Notes */}
                    <div className="space-y-2">
                      <Label>Speaker Notes</Label>
                      <Textarea
                        value={currentSlide.speaker_notes || ""}
                        onChange={(e) => handleSlideUpdate({ speaker_notes: e.target.value })}
                        placeholder="Add notes for the presenter..."
                        className="min-h-[100px]"
                      />
                    </div>
                  </>
                )}
              </TabsContent>

              <TabsContent value="design" className="p-4 space-y-6 mt-0">
                {currentSlide && (
                  <>
                    {/* Layout */}
                    <div className="space-y-3">
                      <Label>Layout</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {["full", "split", "image-left", "image-right"].map((layout) => (
                          <button
                            key={layout}
                            onClick={() => handleSlideUpdate({ layout })}
                            className={cn(
                              "p-3 rounded-lg border-2 transition-all",
                              currentSlide.layout === layout 
                                ? "border-primary bg-primary/10" 
                                : "border-border hover:border-primary/50"
                            )}
                          >
                            <Layout className="h-5 w-5 mx-auto mb-1" />
                            <span className="text-xs capitalize">{layout}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Theme Manager */}
                    <ThemeManager
                      currentThemeId={themeId}
                      currentFont={currentFont}
                      onThemeChange={handleThemeChange}
                      onFontChange={setCurrentFont}
                      applyTo={themeApplyTo}
                      onApplyToChange={setThemeApplyTo}
                    />

                    {/* Image Prompt */}
                    <div className="space-y-2">
                      <Label>Image Prompt</Label>
                      <Textarea
                        value={currentSlide.image_prompt || ""}
                        onChange={(e) => handleSlideUpdate({ image_prompt: e.target.value })}
                        className="min-h-[80px] text-sm"
                        placeholder="Describe the image you want AI to generate..."
                      />
                    </div>

                    {/* Current Image */}
                    {currentSlide.image_url && (
                      <div className="space-y-2">
                        <Label>Current Image</Label>
                        <img 
                          src={currentSlide.image_url} 
                          alt="Slide" 
                          className="w-full aspect-video object-cover rounded-lg border"
                        />
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full"
                          onClick={() => handleSlideUpdate({ image_url: null })}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Remove Image
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </TabsContent>

              <TabsContent value="ai" className="p-4 mt-0">
                <AISlideActions
                  currentSlide={currentSlide}
                  isImproving={isImproving}
                  isGeneratingImage={isGeneratingImage}
                  structureLocked={structureLocked}
                  onStructureLockChange={setStructureLocked}
                  onImproveSlide={handleImproveSlide}
                  onGenerateImage={handleGenerateImage}
                  onAIInsert={handleAIInsert}
                />
              </TabsContent>
            </ScrollArea>
          </Tabs>
        </aside>
      </div>
    </div>
  );
};

export default Editor;
