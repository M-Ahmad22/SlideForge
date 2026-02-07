import { useState } from "react";
import { Check, Palette, Type, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { themes, themeCategories, getThemeById, getThemesByCategory, PptxTheme } from "@/lib/themes";
import { safeFonts } from "@/lib/constants";

interface ThemeManagerProps {
  currentThemeId: string;
  currentFont: string;
  onThemeChange: (themeId: string) => void;
  onFontChange: (font: string) => void;
  applyTo: 'slide' | 'all';
  onApplyToChange: (value: 'slide' | 'all') => void;
}

export function ThemeManager({
  currentThemeId,
  currentFont,
  onThemeChange,
  onFontChange,
  applyTo,
  onApplyToChange,
}: ThemeManagerProps) {
  const [selectedCategory, setSelectedCategory] = useState<PptxTheme['category'] | 'all'>('all');
  const [themeOpen, setThemeOpen] = useState(true);
  const [fontOpen, setFontOpen] = useState(false);

  const currentTheme = getThemeById(currentThemeId);
  
  const filteredThemes = selectedCategory === 'all' 
    ? themes 
    : getThemesByCategory(selectedCategory);

  return (
    <div className="space-y-4">
      {/* Apply To */}
      <div className="flex items-center gap-2 p-2 bg-secondary/30 rounded-lg">
        <Label className="text-xs">Apply to:</Label>
        <Select value={applyTo} onValueChange={(v) => onApplyToChange(v as 'slide' | 'all')}>
          <SelectTrigger className="h-7 text-xs flex-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="slide">Current Slide</SelectItem>
            <SelectItem value="all">All Slides</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Theme Selection */}
      <Collapsible open={themeOpen} onOpenChange={setThemeOpen}>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="w-full justify-between">
            <span className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              Theme
              <Badge variant="secondary" className="text-xs">{currentTheme.name}</Badge>
            </span>
            <ChevronDown className={cn(
              "h-4 w-4 transition-transform",
              themeOpen && "rotate-180"
            )} />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-3 pt-2">
          {/* Category Filter */}
          <div className="flex flex-wrap gap-1">
            <Badge
              variant={selectedCategory === 'all' ? 'default' : 'outline'}
              className="cursor-pointer text-xs"
              onClick={() => setSelectedCategory('all')}
            >
              All
            </Badge>
            {themeCategories.map((cat) => (
              <Badge
                key={cat.value}
                variant={selectedCategory === cat.value ? 'default' : 'outline'}
                className="cursor-pointer text-xs"
                onClick={() => setSelectedCategory(cat.value)}
              >
                {cat.label}
              </Badge>
            ))}
          </div>

          {/* Theme Grid */}
          <ScrollArea className="h-[280px]">
            <div className="grid grid-cols-2 gap-2 pr-2">
              {filteredThemes.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => onThemeChange(theme.id)}
                  className={cn(
                    "relative rounded-lg border-2 overflow-hidden transition-all text-left",
                    currentThemeId === theme.id 
                      ? "border-primary ring-2 ring-primary/20" 
                      : "border-border hover:border-primary/50"
                  )}
                >
                  {/* Theme Preview */}
                  <div 
                    className="aspect-video p-2"
                    style={{ backgroundColor: theme.preview.background }}
                  >
                    <div 
                      className="text-[8px] font-bold truncate"
                      style={{ color: theme.preview.primary }}
                    >
                      Title
                    </div>
                    <div className="flex gap-0.5 mt-1">
                      <div 
                        className="w-1 h-1 rounded-full"
                        style={{ backgroundColor: theme.preview.accent }}
                      />
                      <div 
                        className="text-[6px] flex-1 truncate"
                        style={{ color: theme.preview.text }}
                      >
                        Content preview
                      </div>
                    </div>
                  </div>

                  {/* Theme Name */}
                  <div className="p-1.5 bg-secondary/50">
                    <p className="text-[10px] font-medium truncate">{theme.name}</p>
                  </div>

                  {/* Selected Check */}
                  {currentThemeId === theme.id && (
                    <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                      <Check className="h-2.5 w-2.5 text-primary-foreground" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </ScrollArea>
        </CollapsibleContent>
      </Collapsible>

      {/* Font Selection */}
      <Collapsible open={fontOpen} onOpenChange={setFontOpen}>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="w-full justify-between">
            <span className="flex items-center gap-2">
              <Type className="h-4 w-4" />
              Font Family
              <Badge variant="secondary" className="text-xs">{currentFont}</Badge>
            </span>
            <ChevronDown className={cn(
              "h-4 w-4 transition-transform",
              fontOpen && "rotate-180"
            )} />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-2 pt-2">
          <p className="text-xs text-muted-foreground">
            PC-safe fonts for consistent cross-platform display
          </p>
          <div className="grid grid-cols-1 gap-1">
            {safeFonts.map((font) => (
              <button
                key={font.value}
                onClick={() => onFontChange(font.value)}
                className={cn(
                  "flex items-center justify-between p-2 rounded-lg border transition-all",
                  currentFont === font.value 
                    ? "border-primary bg-primary/5" 
                    : "border-border hover:border-primary/50"
                )}
              >
                <span 
                  className="text-sm"
                  style={{ fontFamily: font.value }}
                >
                  {font.label}
                </span>
                {currentFont === font.value && (
                  <Check className="h-4 w-4 text-primary" />
                )}
              </button>
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Current Theme Colors Preview */}
      <div className="p-3 border rounded-lg space-y-2">
        <Label className="text-xs text-muted-foreground">Current Theme Colors</Label>
        <div className="flex gap-2">
          <div className="flex flex-col items-center gap-1">
            <div 
              className="w-8 h-8 rounded-lg border"
              style={{ backgroundColor: `#${currentTheme.pptx.background}` }}
            />
            <span className="text-[10px] text-muted-foreground">BG</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <div 
              className="w-8 h-8 rounded-lg"
              style={{ backgroundColor: `#${currentTheme.pptx.titleColor}` }}
            />
            <span className="text-[10px] text-muted-foreground">Title</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <div 
              className="w-8 h-8 rounded-lg"
              style={{ backgroundColor: `#${currentTheme.pptx.textColor}` }}
            />
            <span className="text-[10px] text-muted-foreground">Text</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <div 
              className="w-8 h-8 rounded-lg"
              style={{ backgroundColor: `#${currentTheme.pptx.accentColor}` }}
            />
            <span className="text-[10px] text-muted-foreground">Accent</span>
          </div>
        </div>
      </div>
    </div>
  );
}
