import { useState, useCallback } from "react";
import {
  GripVertical,
  Plus,
  Trash2,
  Image as ImageIcon,
  ChevronUp,
  ChevronDown,
  Copy,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { ParsedSlide } from "./ManualContentEditor";

interface SlideReviewEditorProps {
  slides: ParsedSlide[];
  onChange: (slides: ParsedSlide[]) => void;
  onGenerateImagePrompt?: (slideId: string) => void;
}

export const SlideReviewEditor = ({
  slides,
  onChange,
  onGenerateImagePrompt,
}: SlideReviewEditorProps) => {
  const [expandedSlide, setExpandedSlide] = useState<string | null>(
    slides[0]?.id || null
  );

  const updateSlide = useCallback(
    (slideId: string, updates: Partial<ParsedSlide>) => {
      onChange(
        slides.map((s) => (s.id === slideId ? { ...s, ...updates } : s))
      );
    },
    [slides, onChange]
  );

  const deleteSlide = useCallback(
    (slideId: string) => {
      if (slides.length <= 1) return;
      const newSlides = slides.filter((s) => s.id !== slideId);
      onChange(newSlides);
      if (expandedSlide === slideId) {
        setExpandedSlide(newSlides[0]?.id || null);
      }
    },
    [slides, onChange, expandedSlide]
  );

  const duplicateSlide = useCallback(
    (slideId: string) => {
      const index = slides.findIndex((s) => s.id === slideId);
      if (index === -1) return;

      const original = slides[index];
      const newSlide: ParsedSlide = {
        ...original,
        id: `slide-${Date.now()}`,
        title: `${original.title} (Copy)`,
      };

      const newSlides = [
        ...slides.slice(0, index + 1),
        newSlide,
        ...slides.slice(index + 1),
      ];
      onChange(newSlides);
      setExpandedSlide(newSlide.id);
    },
    [slides, onChange]
  );

  const moveSlide = useCallback(
    (slideId: string, direction: "up" | "down") => {
      const index = slides.findIndex((s) => s.id === slideId);
      if (index === -1) return;
      if (direction === "up" && index === 0) return;
      if (direction === "down" && index === slides.length - 1) return;

      const newSlides = [...slides];
      const targetIndex = direction === "up" ? index - 1 : index + 1;
      [newSlides[index], newSlides[targetIndex]] = [
        newSlides[targetIndex],
        newSlides[index],
      ];
      onChange(newSlides);
    },
    [slides, onChange]
  );

  const addNewSlide = useCallback(
    (afterIndex?: number) => {
      const newSlide: ParsedSlide = {
        id: `slide-${Date.now()}`,
        title: "New Slide",
         content: [{ type: 'bullet', text: 'Add your content here' }],
        bullets: ["Add your content here"],
      };

      if (typeof afterIndex === "number") {
        const newSlides = [
          ...slides.slice(0, afterIndex + 1),
          newSlide,
          ...slides.slice(afterIndex + 1),
        ];
        onChange(newSlides);
      } else {
        onChange([...slides, newSlide]);
      }
      setExpandedSlide(newSlide.id);
    },
    [slides, onChange]
  );

  const updateBullet = useCallback(
    (slideId: string, bulletIndex: number, value: string) => {
      const slide = slides.find((s) => s.id === slideId);
      if (!slide) return;

      const newBullets = [...slide.bullets];
      newBullets[bulletIndex] = value;
      updateSlide(slideId, { bullets: newBullets });
    },
    [slides, updateSlide]
  );

  const addBullet = useCallback(
    (slideId: string) => {
      const slide = slides.find((s) => s.id === slideId);
      if (!slide) return;
      updateSlide(slideId, { bullets: [...slide.bullets, ""] });
    },
    [slides, updateSlide]
  );

  const removeBullet = useCallback(
    (slideId: string, bulletIndex: number) => {
      const slide = slides.find((s) => s.id === slideId);
      if (!slide || slide.bullets.length <= 1) return;

      const newBullets = slide.bullets.filter((_, i) => i !== bulletIndex);
      updateSlide(slideId, { bullets: newBullets });
    },
    [slides, updateSlide]
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Review & Edit Your Slides</h2>
          <p className="text-sm text-muted-foreground">
            Edit each slide before generating your presentation
          </p>
        </div>
        <Badge variant="secondary">{slides.length} slides</Badge>
      </div>

      <div className="space-y-3">
        {slides.map((slide, index) => {
          const isExpanded = expandedSlide === slide.id;

          return (
            <Card
              key={slide.id}
              className={cn(
                "transition-all duration-200",
                isExpanded ? "ring-2 ring-primary/50" : ""
              )}
            >
              <CardContent className="p-0">
                {/* Slide Header */}
                <div
                  className={cn(
                    "flex items-center gap-3 p-4 cursor-pointer",
                    "hover:bg-secondary/50 transition-colors",
                    isExpanded ? "border-b border-border" : ""
                  )}
                  onClick={() =>
                    setExpandedSlide(isExpanded ? null : slide.id)
                  }
                >
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <GripVertical className="h-4 w-4" />
                    <Badge variant="outline" className="font-mono text-xs">
                      {index + 1}
                    </Badge>
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium truncate">{slide.title}</h3>
                    <p className="text-xs text-muted-foreground">
                      {slide.bullets.length} bullet points
                      {slide.imagePrompt && " • Has image"}
                    </p>
                  </div>

                  <TooltipProvider>
                    <div className="flex items-center gap-1">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={(e) => {
                              e.stopPropagation();
                              moveSlide(slide.id, "up");
                            }}
                            disabled={index === 0}
                          >
                            <ChevronUp className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Move up</TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={(e) => {
                              e.stopPropagation();
                              moveSlide(slide.id, "down");
                            }}
                            disabled={index === slides.length - 1}
                          >
                            <ChevronDown className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Move down</TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={(e) => {
                              e.stopPropagation();
                              duplicateSlide(slide.id);
                            }}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Duplicate</TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteSlide(slide.id);
                            }}
                            disabled={slides.length <= 1}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Delete</TooltipContent>
                      </Tooltip>
                    </div>
                  </TooltipProvider>
                </div>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="p-4 space-y-4 bg-secondary/30">
                    {/* Title */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Slide Title</label>
                      <Input
                        value={slide.title}
                        onChange={(e) =>
                          updateSlide(slide.id, { title: e.target.value })
                        }
                        className="font-medium"
                        placeholder="Enter slide title..."
                      />
                    </div>

                    {/* Bullets */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Bullet Points
                      </label>
                      <div className="space-y-2">
                        {slide.bullets.map((bullet, bulletIndex) => (
                          <div
                            key={bulletIndex}
                            className="flex items-start gap-2"
                          >
                            <span className="mt-2.5 text-muted-foreground">•</span>
                            <Input
                              value={bullet}
                              onChange={(e) =>
                                updateBullet(slide.id, bulletIndex, e.target.value)
                              }
                              placeholder="Enter bullet point..."
                              className="flex-1"
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-9 w-9 shrink-0"
                              onClick={() => removeBullet(slide.id, bulletIndex)}
                              disabled={slide.bullets.length <= 1}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => addBullet(slide.id)}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add bullet
                      </Button>
                    </div>

                    {/* Speaker Notes */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Speaker Notes (optional)
                      </label>
                      <Textarea
                        value={slide.speakerNotes || ""}
                        onChange={(e) =>
                          updateSlide(slide.id, { speakerNotes: e.target.value })
                        }
                        placeholder="Add notes for the presenter..."
                        className="min-h-[80px]"
                      />
                    </div>

                    {/* Image Prompt */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium">
                          Image Suggestion (optional)
                        </label>
                        {onGenerateImagePrompt && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onGenerateImagePrompt(slide.id)}
                          >
                            <Sparkles className="h-4 w-4 mr-1" />
                            Auto-suggest
                          </Button>
                        )}
                      </div>
                      <div className="flex items-start gap-2">
                        <ImageIcon className="h-4 w-4 mt-2.5 text-muted-foreground" />
                        <Input
                          value={slide.imagePrompt || ""}
                          onChange={(e) =>
                            updateSlide(slide.id, { imagePrompt: e.target.value })
                          }
                          placeholder="Describe an image for this slide (or leave empty)"
                          className="flex-1"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Images will only be generated where they add value
                      </p>
                    </div>

                    {/* Add slide after */}
                    <div className="pt-2 border-t border-border">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => addNewSlide(index)}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add slide after this
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Add New Slide at End */}
      <Button
        variant="outline"
        className="w-full border-dashed border-2"
        onClick={() => addNewSlide()}
      >
        <Plus className="h-4 w-4 mr-2" />
        Add New Slide
      </Button>
    </div>
  );
};
