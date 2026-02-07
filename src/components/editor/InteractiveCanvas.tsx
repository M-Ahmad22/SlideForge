import { useState, useRef, useEffect, useCallback } from "react";
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

interface InteractiveCanvasProps {
  slide: DBSlide;
  themeId: string;
  onUpdate: (updates: Partial<DBSlide>) => void;
}

type EditingField = 'title' | 'subtitle' | `bullet-${number}` | null;

export function InteractiveCanvas({ slide, themeId, onUpdate }: InteractiveCanvasProps) {
  const theme = getThemeById(themeId);
  const [editingField, setEditingField] = useState<EditingField>(null);
  const [editValue, setEditValue] = useState("");
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  const isImageLayout = slide.layout === 'split' || slide.layout === 'image-left' || slide.layout === 'image-right';
  const imageOnRight = slide.layout === 'split' || slide.layout === 'image-right';

  // Focus input when editing starts
  useEffect(() => {
    if (editingField && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingField]);

  const startEditing = useCallback((field: EditingField, currentValue: string) => {
    setEditingField(field);
    setEditValue(currentValue);
  }, []);

  const finishEditing = useCallback(() => {
    if (!editingField) return;

    if (editingField === 'title') {
      if (editValue.trim() !== slide.title) {
        onUpdate({ title: editValue.trim() || slide.title });
      }
    } else if (editingField === 'subtitle') {
      if (editValue.trim() !== (slide.subtitle || '')) {
        onUpdate({ subtitle: editValue.trim() || null });
      }
    } else if (editingField.startsWith('bullet-')) {
      const index = parseInt(editingField.replace('bullet-', ''));
      const bullets = [...(slide.bullets || [])];
      const currentBullet = bullets[index];
      const currentText = getBulletText(currentBullet as BulletItem);
      
      if (editValue.trim() !== currentText) {
        bullets[index] = editValue.trim() || currentText;
        onUpdate({ bullets });
      }
    }

    setEditingField(null);
    setEditValue("");
  }, [editingField, editValue, slide, onUpdate]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      finishEditing();
    } else if (e.key === 'Escape') {
      setEditingField(null);
      setEditValue("");
    }
  };

  const EditableText = ({ 
    field, 
    value, 
    className, 
    style,
    placeholder = "Click to edit",
    multiline = false,
  }: { 
    field: EditingField;
    value: string;
    className?: string;
    style?: React.CSSProperties;
    placeholder?: string;
    multiline?: boolean;
  }) => {
    const isEditing = editingField === field;

    if (isEditing) {
      const Component = multiline ? 'textarea' : 'input';
      return (
        <Component
          ref={inputRef as any}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={finishEditing}
          onKeyDown={handleKeyDown}
          className={cn(
            "bg-transparent border-2 border-primary rounded px-2 py-1 outline-none resize-none w-full",
            className
          )}
          style={style}
          rows={multiline ? 2 : undefined}
        />
      );
    }

    return (
      <div
        onClick={() => startEditing(field, value)}
        className={cn(
          "cursor-text rounded px-2 py-1 -mx-2 -my-1 transition-colors",
          "hover:bg-white/10 hover:ring-2 hover:ring-primary/30",
          !value && "text-muted-foreground italic",
          className
        )}
        style={style}
      >
        {value || placeholder}
      </div>
    );
  };

  return (
    <div 
      className="aspect-video rounded-xl overflow-hidden shadow-elevated relative"
      style={{ backgroundColor: `#${theme.pptx.background}` }}
    >
      <div className="h-full p-12 flex flex-col">
        {slide.slide_type === 'title' ? (
          // Title Slide
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <EditableText
              field="title"
              value={slide.title}
              className="text-4xl font-bold mb-4 text-center"
              style={{ color: `#${theme.pptx.titleColor}` }}
              placeholder="Enter slide title"
            />
            <EditableText
              field="subtitle"
              value={slide.subtitle || ""}
              className="text-xl opacity-70 text-center"
              style={{ color: `#${theme.pptx.textColor}` }}
              placeholder="Enter subtitle"
            />
            <div 
              className="w-24 h-1 mt-6 rounded"
              style={{ backgroundColor: `#${theme.pptx.accentColor}` }}
            />
          </div>
        ) : (
          // Content Slide
          <div className={cn("flex-1 flex flex-col", isImageLayout && "flex-row gap-8")}>
            <div className={cn("flex flex-col", isImageLayout && "flex-1", imageOnRight ? "order-1" : "order-2")}>
              <EditableText
                field="title"
                value={slide.title}
                className="text-3xl font-bold mb-4"
                style={{ color: `#${theme.pptx.titleColor}` }}
                placeholder="Enter slide title"
              />
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
                      <EditableText
                        field={`bullet-${i}`}
                        value={getBulletText(bullet as BulletItem)}
                        className="text-lg flex-1"
                        style={{ color: `#${theme.pptx.textColor}` }}
                        placeholder="Enter bullet point"
                      />
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
                      Click to add image
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Editing Mode Indicator */}
      {editingField && (
        <div className="absolute bottom-2 right-2 px-2 py-1 bg-primary text-primary-foreground text-xs rounded">
          Press Enter to save, Esc to cancel
        </div>
      )}
    </div>
  );
}
