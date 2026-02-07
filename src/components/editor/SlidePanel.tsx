import { useState } from "react";
import { 
  Plus, 
  MoreVertical, 
  Copy, 
  Trash2, 
  EyeOff, 
  Eye,
  GripVertical,
  ChevronDown,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { SlidePreview } from "@/components/SlidePreview";
import type { DBSlide } from "@/hooks/usePresentations";

interface SlidePanelProps {
  slides: DBSlide[];
  selectedSlideId: string | null;
  themeId: string;
  hiddenSlides: Set<string>;
  onSelectSlide: (id: string) => void;
  onAddSlide: (afterIndex: number) => void;
  onDuplicateSlide: (id: string) => void;
  onDeleteSlide: (id: string) => void;
  onToggleHidden: (id: string) => void;
  onReorderSlides: (startIndex: number, endIndex: number) => void;
}

export function SlidePanel({
  slides,
  selectedSlideId,
  themeId,
  hiddenSlides,
  onSelectSlide,
  onAddSlide,
  onDuplicateSlide,
  onDeleteSlide,
  onToggleHidden,
  onReorderSlides,
}: SlidePanelProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dropTargetIndex, setDropTargetIndex] = useState<number | null>(null);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== index) {
      setDropTargetIndex(index);
    }
  };

  const handleDragEnd = () => {
    if (draggedIndex !== null && dropTargetIndex !== null && draggedIndex !== dropTargetIndex) {
      onReorderSlides(draggedIndex, dropTargetIndex);
    }
    setDraggedIndex(null);
    setDropTargetIndex(null);
  };

  const handleDragLeave = () => {
    setDropTargetIndex(null);
  };

  return (
    <div className="h-full flex flex-col bg-card/50">
      {/* Header */}
      <div className="p-3 border-b border-border flex items-center justify-between shrink-0">
        <span className="text-sm font-medium">Slides ({slides.length})</span>
        <Button variant="ghost" size="icon" onClick={() => onAddSlide(slides.length - 1)}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* Slides List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {slides.map((slide, index) => {
          const isHidden = hiddenSlides.has(slide.id);
          const isSelected = selectedSlideId === slide.id;
          const isDragging = draggedIndex === index;
          const isDropTarget = dropTargetIndex === index;

          return (
            <div
              key={slide.id}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
              onDragLeave={handleDragLeave}
              className={cn(
                "group relative rounded-lg transition-all cursor-pointer",
                isDragging && "opacity-50",
                isDropTarget && "ring-2 ring-primary ring-offset-2"
              )}
            >
              {/* Drop indicator */}
              {isDropTarget && draggedIndex !== null && draggedIndex < index && (
                <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary rounded-full" />
              )}
              {isDropTarget && draggedIndex !== null && draggedIndex > index && (
                <div className="absolute -top-1 left-0 right-0 h-0.5 bg-primary rounded-full" />
              )}

              <div 
                className={cn(
                  "flex items-start gap-2 p-1.5 rounded-lg border-2 transition-all",
                  isSelected 
                    ? "border-primary bg-primary/5 shadow-sm" 
                    : "border-transparent hover:border-border hover:bg-secondary/30",
                  isHidden && "opacity-50"
                )}
                onClick={() => onSelectSlide(slide.id)}
              >
                {/* Drag Handle */}
                <div className="mt-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing">
                  <GripVertical className="h-4 w-4 text-muted-foreground" />
                </div>

                {/* Slide Number */}
                <div className="text-xs font-medium text-muted-foreground w-5 text-right mt-1 shrink-0">
                  {index + 1}
                </div>

                {/* Thumbnail */}
                <div className="flex-1 relative">
                  <SlidePreview 
                    slide={slide} 
                    themeId={themeId}
                    className="border rounded"
                  />
                  
                  {/* Hidden indicator */}
                  {isHidden && (
                    <div className="absolute inset-0 bg-background/80 flex items-center justify-center rounded">
                      <EyeOff className="h-5 w-5 text-muted-foreground" />
                    </div>
                  )}
                </div>

                {/* Actions */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreVertical className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onAddSlide(index); }}>
                      <Plus className="h-4 w-4 mr-2" />
                      Insert After
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onDuplicateSlide(slide.id); }}>
                      <Copy className="h-4 w-4 mr-2" />
                      Duplicate
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onToggleHidden(slide.id); }}>
                      {isHidden ? (
                        <>
                          <Eye className="h-4 w-4 mr-2" />
                          Show Slide
                        </>
                      ) : (
                        <>
                          <EyeOff className="h-4 w-4 mr-2" />
                          Hide Slide
                        </>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      className="text-destructive"
                      onClick={(e) => { e.stopPropagation(); onDeleteSlide(slide.id); }}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
