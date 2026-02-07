import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Type, Sparkles, Zap, Loader2, Check, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { audiences, tones, contentDepths, contentDensities, presentationGenres, visualDensities, animationStyles, languages } from "@/lib/constants";
import { themes, themeCategories, getThemesByCategory, PptxTheme } from "@/lib/themes";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { usePresentations, useSlides } from "@/hooks/usePresentations";
import { SlidePreview } from "@/components/SlidePreview";
import { supabase } from "@/integrations/supabase/client";
import { 
  CreationModeSelector, 
  ManualContentEditor, 
  SlideReviewEditor,
  type CreationMode,
  type ParsedSlide 
} from "@/components/create";

interface GeneratedSlide {
  slideType: string;
  title: string;
  subtitle?: string;
  bullets: string[];
  speakerNotes?: string;
  imagePrompt?: string;
  layout?: string;
}

const CreatePresentation = () => {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const { createPresentation: createPresentationDB } = usePresentations();
  
  // Step management
  const [step, setStep] = useState(1);
  
  // Creation mode
  const [creationMode, setCreationMode] = useState<CreationMode | null>(null);
  
  // AI mode fields
  const [title, setTitle] = useState("");
  const [topic, setTopic] = useState("");
  const [textInput, setTextInput] = useState("");
  const [notes, setNotes] = useState("");
  
  // Manual mode fields
  const [manualContent, setManualContent] = useState("");
  const [parsedSlides, setParsedSlides] = useState<ParsedSlide[]>([]);
  
  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedSlides, setGeneratedSlides] = useState<GeneratedSlide[]>([]);
  const [presentationId, setPresentationId] = useState<string | null>(null);
  const [selectedThemeCategory, setSelectedThemeCategory] = useState<PptxTheme['category']>('professional');
  
  const [config, setConfig] = useState({
    audience: "professional",
    tone: "simple",
    depth: "moderate",
    contentDensity: "medium",
    genre: "business",
    language: "en",
    visualDensity: "balanced",
    animationStyle: "professional",
    theme: "executive-blue",
    slideCount: 12,
  });

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      toast.error("Please sign in to create presentations");
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  const handleAddNotes = () => {
    if (textInput.trim()) {
      setNotes(prev => prev ? `${prev}\n\n${textInput}` : textInput);
      setTextInput("");
      toast.success("Notes added");
    }
  };

  // Handle parsed slides from manual content
  const handleParsedSlides = (slides: ParsedSlide[]) => {
    setParsedSlides(slides);
    // Auto-set title from first slide if not set
    if (!title && slides.length > 0) {
      setTitle(slides[0].title || "My Presentation");
    }
    // Move to slide review step
    setStep(1.5); // Special step for manual slide review
    toast.success(`Parsed ${slides.length} slides`);
  };

  // Generate image prompt suggestion for a slide
  const handleGenerateImagePrompt = async (slideId: string) => {
    const slide = parsedSlides.find(s => s.id === slideId);
    if (!slide) return;

    // Simple logic: only suggest images for slides that would benefit
    const contentHint = `${slide.title} - ${slide.bullets.join(", ")}`;
    
    // Heuristic: Skip image for definition-heavy or text-dense slides
    const isTextHeavy = slide.bullets.length > 5 || 
      slide.bullets.some(b => b.length > 100);
    
    if (isTextHeavy) {
      toast.info("This slide is text-heavy. Consider skipping images.");
      return;
    }

    // Generate a simple prompt based on content
    const imagePrompt = `Professional illustration for: ${slide.title}. Context: ${slide.bullets.slice(0, 2).join(", ")}`;
    
    setParsedSlides(prev => 
      prev.map(s => s.id === slideId ? { ...s, imagePrompt } : s)
    );
    toast.success("Image suggestion added");
  };

  // Generate from AI mode
  const handleGenerateAI = async () => {
    if (!title.trim()) {
      toast.error("Please enter a presentation title");
      return;
    }
    if (!topic.trim()) {
      toast.error("Please enter a topic or description");
      return;
    }
    
    setIsGenerating(true);
    setStep(5); // Generation step
    
    try {
      const presentation = await createPresentationDB({
        title,
        topic,
        notes: notes || undefined,
        slideCount: config.slideCount,
        themeId: config.theme,
        audience: config.audience,
        tone: config.tone,
        contentDepth: config.depth,
        language: config.language,
        visualDensity: config.visualDensity,
        animationStyle: config.animationStyle,
      });

      if (!presentation) {
        throw new Error("Failed to create presentation");
      }

      setPresentationId(presentation.id);

      const { data, error } = await supabase.functions.invoke('generate-slides', {
        body: {
          topic,
          notes: notes || undefined,
          slideCount: config.slideCount,
          audience: config.audience,
          tone: config.tone,
          contentDepth: config.depth,
          contentDensity: config.contentDensity,
          genre: config.genre,
          language: config.language,
        },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      const slides = data.slides as GeneratedSlide[];
      setGeneratedSlides(slides);

      const slidesToInsert = slides.map((slide, index) => ({
        presentation_id: presentation.id,
        order_index: index,
        slide_type: slide.slideType,
        title: slide.title,
        subtitle: slide.subtitle || null,
        bullets: slide.bullets,
        speaker_notes: slide.speakerNotes || null,
        image_prompt: slide.imagePrompt || null,
        layout: slide.layout || 'full',
      }));

      const { error: slidesError } = await supabase
        .from('slides')
        .insert(slidesToInsert);

      if (slidesError) throw slidesError;

      await supabase
        .from('presentations')
        .update({ status: 'ready', slide_count: slides.length })
        .eq('id', presentation.id);

      toast.success(`Generated ${slides.length} slides!`);
      
    } catch (error) {
      console.error("Generation error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to generate slides");
      setStep(4);
    } finally {
      setIsGenerating(false);
    }
  };

  // Generate from Manual mode
  const handleGenerateManual = async () => {
    if (parsedSlides.length === 0) {
      toast.error("Please add at least one slide");
      return;
    }
    
    setIsGenerating(true);
    setStep(5); // Generation step
    
    try {
      const presentation = await createPresentationDB({
        title: title || "My Presentation",
        topic: parsedSlides.map(s => s.title).join(", "),
        slideCount: parsedSlides.length,
        themeId: config.theme,
        audience: config.audience,
        tone: config.tone,
        contentDepth: config.depth,
        language: config.language,
        visualDensity: config.visualDensity,
        animationStyle: config.animationStyle,
      });

      if (!presentation) {
        throw new Error("Failed to create presentation");
      }

      setPresentationId(presentation.id);

      // Convert parsed slides to generated slides format
      const slides: GeneratedSlide[] = parsedSlides.map((slide, index) => ({
        slideType: index === 0 ? "title" : "content",
        title: slide.title,
        bullets: slide.bullets,
        speakerNotes: slide.speakerNotes,
        imagePrompt: slide.imagePrompt,
        layout: "full",
      }));

      setGeneratedSlides(slides);

      const slidesToInsert = slides.map((slide, index) => ({
        presentation_id: presentation.id,
        order_index: index,
        slide_type: slide.slideType,
        title: slide.title,
        subtitle: null,
        bullets: slide.bullets,
        speaker_notes: slide.speakerNotes || null,
        image_prompt: slide.imagePrompt || null,
        layout: slide.layout || 'full',
      }));

      const { error: slidesError } = await supabase
        .from('slides')
        .insert(slidesToInsert);

      if (slidesError) throw slidesError;

      await supabase
        .from('presentations')
        .update({ status: 'ready', slide_count: slides.length })
        .eq('id', presentation.id);

      toast.success(`Created presentation with ${slides.length} slides!`);
      
    } catch (error) {
      console.error("Generation error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to create presentation");
      setStep(1.5);
    } finally {
      setIsGenerating(false);
    }
  };

  const goToEditor = () => {
    if (presentationId) {
      navigate(`/editor/${presentationId}`);
    }
  };

  // Calculate total steps based on mode
  const getTotalSteps = () => {
    if (creationMode === "manual") return 3; // Mode + Content/Review + Theme
    return 3; // Mode/Topic + Config + Theme
  };

  const getCurrentStepNumber = () => {
    if (step === 1.5) return 2; // Slide review is step 2 in manual mode
    if (step >= 5) return getTotalSteps();
    return Math.min(step, getTotalSteps());
  };

  const categoryThemes = getThemesByCategory(selectedThemeCategory);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Navigation logic
  const canProceed = () => {
    if (step === 1) {
      if (!creationMode) return false;
      if (creationMode === "ai") return title.trim() && topic.trim();
      if (creationMode === "manual") return manualContent.trim();
    }
    return true;
  };

  const handleNext = () => {
    if (step === 1 && creationMode === "manual" && manualContent.trim()) {
      // Parse content and go to review
      return; // Let the ManualContentEditor handle this via onParse
    }
    if (step === 1.5) {
      setStep(4); // Go to theme selection
      return;
    }
    setStep(step + 1);
  };

  const handleBack = () => {
    if (step === 1.5) {
      setStep(1);
      return;
    }
    if (step === 4 && creationMode === "manual") {
      setStep(1.5);
      return;
    }
    if (step > 1) {
      setStep(step - 1);
    } else {
      navigate("/dashboard");
    }
  };

  const handleGenerate = () => {
    if (creationMode === "ai") {
      handleGenerateAI();
    } else {
      handleGenerateManual();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 sticky top-0 z-50 backdrop-blur-xl">
        <div className="container mx-auto px-6">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-primary">
                  <Zap className="h-4 w-4 text-primary-foreground" />
                </div>
                <span className="font-semibold">Create Presentation</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge variant="outline">
                Step {getCurrentStepNumber()} of {getTotalSteps()}
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8 max-w-4xl">
        {/* Progress */}
        {step < 5 && (
          <div className="flex items-center gap-2 mb-8">
            {Array.from({ length: getTotalSteps() }).map((_, i) => (
              <div key={i} className="flex-1 flex items-center gap-2">
                <div 
                  className={`h-2 flex-1 rounded-full transition-colors ${
                    i < getCurrentStepNumber() ? "bg-primary" : "bg-secondary"
                  }`}
                />
              </div>
            ))}
          </div>
        )}

        {/* Step 1: Mode Selection + Content Input */}
        {step === 1 && (
          <div className="space-y-8 animate-fade-in">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-2">Create Your Presentation</h1>
              <p className="text-muted-foreground">
                Choose how you want to build your presentation
              </p>
            </div>

            {/* Mode Selection */}
            <CreationModeSelector 
              value={creationMode} 
              onChange={setCreationMode} 
            />

            {/* AI Mode Fields */}
            {creationMode === "ai" && (
              <div className="space-y-6 pt-6 border-t border-border animate-fade-in">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-lg font-medium">Presentation Title</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Introduction to Machine Learning, Q4 Business Review..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="text-lg h-12"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="topic" className="text-lg font-medium">Topic & Description</Label>
                  <Textarea
                    id="topic"
                    placeholder="Describe what you want your presentation to cover. Be as specific as you like - include key points, focus areas, or any specific requirements..."
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="min-h-[150px] text-base"
                  />
                  <p className="text-sm text-muted-foreground">
                    The more detail you provide, the better the AI can generate relevant content.
                  </p>
                </div>

                <Card className="border-border">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Type className="h-5 w-5 text-primary" />
                      Additional Notes (Optional)
                    </CardTitle>
                    <CardDescription>Add any extra context, research notes, or bullet points</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Textarea
                      placeholder="Paste your notes, research, or key points here..."
                      value={textInput}
                      onChange={(e) => setTextInput(e.target.value)}
                      className="min-h-[100px]"
                    />
                    <Button onClick={handleAddNotes} variant="secondary" size="sm" disabled={!textInput.trim()}>
                      Add Notes
                    </Button>
                    {notes && (
                      <div className="p-3 bg-secondary rounded-lg">
                        <p className="text-sm text-muted-foreground mb-1">Added notes:</p>
                        <p className="text-sm line-clamp-3">{notes}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Manual Mode Fields */}
            {creationMode === "manual" && (
              <div className="pt-6 border-t border-border animate-fade-in">
                <div className="space-y-4 mb-6">
                  <Label htmlFor="manual-title" className="text-lg font-medium">Presentation Title</Label>
                  <Input
                    id="manual-title"
                    placeholder="e.g., My Sales Pitch, Team Meeting Notes..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="text-lg h-12"
                  />
                </div>
                
                <ManualContentEditor
                  value={manualContent}
                  onChange={setManualContent}
                  onParse={handleParsedSlides}
                />
              </div>
            )}
          </div>
        )}

        {/* Step 1.5: Slide Review (Manual Mode Only) */}
        {step === 1.5 && (
          <div className="space-y-8 animate-fade-in">
            <SlideReviewEditor
              slides={parsedSlides}
              onChange={setParsedSlides}
              onGenerateImagePrompt={handleGenerateImagePrompt}
            />
          </div>
        )}

        {/* Step 2: Configuration (AI Mode) */}
        {step === 2 && creationMode === "ai" && (
          <div className="space-y-8 animate-fade-in">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-2">Configure Your Presentation</h1>
              <p className="text-muted-foreground">
                Customize the style, audience, and depth
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Genre */}
              <div className="space-y-3">
                <Label className="flex items-center gap-1">
                  Presentation Genre
                  <span className="text-destructive">*</span>
                </Label>
                <Select 
                  value={config.genre} 
                  onValueChange={(v) => setConfig({ ...config, genre: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {presentationGenres.map((g) => (
                      <SelectItem key={g.value} value={g.value}>
                        <div className="flex flex-col">
                          <span>{g.label}</span>
                          <span className="text-xs text-muted-foreground">{g.description}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Content Density */}
              <div className="space-y-3">
                <Label className="flex items-center gap-1">
                  Content Density
                  <span className="text-destructive">*</span>
                </Label>
                <Select 
                  value={config.contentDensity} 
                  onValueChange={(v) => setConfig({ ...config, contentDensity: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {contentDensities.map((d) => (
                      <SelectItem key={d.value} value={d.value}>
                        <div className="flex flex-col">
                          <span>{d.label}</span>
                          <span className="text-xs text-muted-foreground">{d.description}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Audience */}
              <div className="space-y-3">
                <Label>Target Audience</Label>
                <Select 
                  value={config.audience} 
                  onValueChange={(v) => setConfig({ ...config, audience: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {audiences.map((a) => (
                      <SelectItem key={a.value} value={a.value}>
                        {a.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Tone */}
              <div className="space-y-3">
                <Label>Presentation Tone</Label>
                <Select 
                  value={config.tone} 
                  onValueChange={(v) => setConfig({ ...config, tone: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {tones.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Content Depth */}
              <div className="space-y-3">
                <Label>Content Depth</Label>
                <Select 
                  value={config.depth} 
                  onValueChange={(v) => setConfig({ ...config, depth: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {contentDepths.map((d) => (
                      <SelectItem key={d.value} value={d.value}>
                        {d.label} ({d.slides})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Language */}
              <div className="space-y-3">
                <Label>Language</Label>
                <Select 
                  value={config.language} 
                  onValueChange={(v) => setConfig({ ...config, language: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map((l) => (
                      <SelectItem key={l.value} value={l.value}>
                        {l.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Slide Count */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Number of Slides</Label>
                <span className="text-2xl font-bold text-primary">{config.slideCount}</span>
              </div>
              <Slider
                value={[config.slideCount]}
                onValueChange={([v]) => setConfig({ ...config, slideCount: v })}
                min={5}
                max={30}
                step={1}
                className="py-4"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>5 slides</span>
                <span>30 slides</span>
              </div>
            </div>
          </div>
        )}

        {/* Step 3/4: Theme Selection */}
        {(step === 3 || step === 4) && (
          <div className="space-y-8 animate-fade-in">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-2">Choose Your Theme</h1>
              <p className="text-muted-foreground">
                Select a professional theme for your presentation
              </p>
            </div>

            {/* Theme Category Tabs */}
            <div className="flex flex-wrap gap-2 justify-center">
              {themeCategories.map((cat) => (
                <Button
                  key={cat.value}
                  variant={selectedThemeCategory === cat.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedThemeCategory(cat.value)}
                >
                  {cat.label}
                </Button>
              ))}
            </div>

            {/* Theme Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {categoryThemes.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => setConfig({ ...config, theme: theme.id })}
                  className={`p-3 rounded-xl border-2 transition-all text-left ${
                    config.theme === theme.id 
                      ? "border-primary shadow-glow" 
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <div 
                    className="aspect-video rounded-lg mb-3 flex items-center justify-center overflow-hidden"
                    style={{ backgroundColor: theme.preview.background }}
                  >
                    <div className="text-center p-2 w-full">
                      <div 
                        className="text-[10px] font-bold truncate"
                        style={{ color: theme.preview.primary }}
                      >
                        Sample Title
                      </div>
                      <div 
                        className="w-6 h-0.5 mx-auto my-1 rounded"
                        style={{ backgroundColor: theme.preview.accent }}
                      />
                      <div 
                        className="text-[8px] opacity-70"
                        style={{ color: theme.preview.text }}
                      >
                        Subtitle text
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium truncate">{theme.name}</span>
                    <div className="flex gap-0.5">
                      <div 
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: theme.preview.primary }}
                      />
                      <div 
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: theme.preview.accent }}
                      />
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Summary */}
            <Card className="bg-secondary/50">
              <CardContent className="pt-6">
                <div className="flex flex-wrap gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Title:</span>{" "}
                    <span className="font-medium">{title || "Untitled"}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Slides:</span>{" "}
                    <span className="font-medium">
                      {creationMode === "manual" ? parsedSlides.length : config.slideCount}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Mode:</span>{" "}
                    <span className="font-medium capitalize">
                      {creationMode === "ai" ? "AI Generated" : "Manual Content"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 5: Generation */}
        {step === 5 && (
          <div className="space-y-8 animate-fade-in">
            <div className="text-center mb-8">
              {isGenerating ? (
                <>
                  <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
                  <h1 className="text-3xl font-bold mb-2">
                    {creationMode === "ai" ? "Generating Your Presentation" : "Creating Your Presentation"}
                  </h1>
                  <p className="text-muted-foreground">
                    {creationMode === "ai" 
                      ? `AI is creating ${config.slideCount} slides about "${topic.slice(0, 50)}..."`
                      : `Building ${parsedSlides.length} slides from your content...`
                    }
                  </p>
                </>
              ) : generatedSlides.length > 0 ? (
                <>
                  <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center mx-auto mb-4">
                    <Check className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <h1 className="text-3xl font-bold mb-2">Presentation Ready!</h1>
                  <p className="text-muted-foreground">
                    Successfully created {generatedSlides.length} slides
                  </p>
                </>
              ) : null}
            </div>

            {/* Generated Slides Preview */}
            {generatedSlides.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {generatedSlides.map((slide, index) => (
                  <div 
                    key={index} 
                    className="animate-fade-in"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <SlidePreview
                      slide={{
                        id: String(index),
                        presentation_id: presentationId || '',
                        order_index: index,
                        slide_type: slide.slideType,
                        title: slide.title,
                        subtitle: slide.subtitle || null,
                        bullets: slide.bullets,
                        speaker_notes: slide.speakerNotes || null,
                        image_url: null,
                        image_prompt: slide.imagePrompt || null,
                        layout: slide.layout || 'full',
                        animation: null,
                        background_color: null,
                        created_at: null,
                        updated_at: null,
                      }}
                      themeId={config.theme}
                      showIndex={index}
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Action Buttons */}
            {generatedSlides.length > 0 && (
              <div className="flex justify-center gap-4">
                <Button variant="outline" onClick={() => {
                  if (creationMode === "manual") {
                    setStep(1.5);
                  } else {
                    setStep(3);
                  }
                  setGeneratedSlides([]);
                }}>
                  Start Over
                </Button>
                <Button variant="gradient" size="lg" onClick={goToEditor}>
                  <Sparkles className="h-5 w-5 mr-2" />
                  Edit Presentation
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Navigation */}
        {step < 5 && (
          <div className="flex justify-between mt-12">
            <Button
              variant="outline"
              onClick={handleBack}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {step === 1 ? "Cancel" : "Back"}
            </Button>
            
            {/* Show Continue for steps before theme */}
            {step === 1 && creationMode === "ai" && (
              <Button
                onClick={() => setStep(2)}
                disabled={!title.trim() || !topic.trim()}
              >
                Continue
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            )}

            {/* Manual mode: only show continue if content needs parsing */}
            {step === 1 && creationMode === "manual" && (
              <div className="text-sm text-muted-foreground flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Click "Parse & Preview" above to continue
              </div>
            )}

            {/* Slide review to theme */}
            {step === 1.5 && (
              <Button
                onClick={() => setStep(4)}
                disabled={parsedSlides.length === 0}
              >
                Choose Theme
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            )}

            {/* Config to theme (AI mode) */}
            {step === 2 && (
              <Button onClick={() => setStep(3)}>
                Continue
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            )}

            {/* Theme to generate */}
            {(step === 3 || step === 4) && (
              <Button
                variant="gradient"
                onClick={handleGenerate}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {creationMode === "ai" ? "Generating..." : "Creating..."}
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    {creationMode === "ai" ? "Generate Presentation" : "Create Presentation"}
                  </>
                )}
              </Button>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default CreatePresentation;
