import { useState } from "react";
import { 
  Wand2, 
  Expand, 
  Minimize2, 
  RefreshCw, 
  ListOrdered,
  Image,
  Sparkles,
  MessageSquare,
  Lock,
  Unlock,
  ChevronDown,
  PlusCircle,
  Loader2,
  GitBranch,
  LayoutGrid
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
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
import type { DBSlide } from "@/hooks/usePresentations";

interface AISlideActionsProps {
  currentSlide: DBSlide | null;
  isImproving: boolean;
  isGeneratingImage: boolean;
  structureLocked: boolean;
  onStructureLockChange: (locked: boolean) => void;
  onImproveSlide: (action: 'improve' | 'expand' | 'simplify' | 'regenerate' | 'bullets' | 'diagram') => void;
  onGenerateImage: () => void;
  onAIInsert: (position: 'before' | 'after', prompt: string) => void;
}

export function AISlideActions({
  currentSlide,
  isImproving,
  isGeneratingImage,
  structureLocked,
  onStructureLockChange,
  onImproveSlide,
  onGenerateImage,
  onAIInsert,
}: AISlideActionsProps) {
  const [insertPrompt, setInsertPrompt] = useState("");
  const [insertPosition, setInsertPosition] = useState<'before' | 'after'>('after');
  const [contentActionsOpen, setContentActionsOpen] = useState(true);
  const [insertActionsOpen, setInsertActionsOpen] = useState(false);

  const handleInsert = () => {
    if (!insertPrompt.trim()) return;
    onAIInsert(insertPosition, insertPrompt);
    setInsertPrompt("");
  };

  return (
    <div className="space-y-4">
      {/* Structure Lock Toggle */}
      <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
        <div className="flex items-center gap-2">
          {structureLocked ? (
            <Lock className="h-4 w-4 text-amber-500" />
          ) : (
            <Unlock className="h-4 w-4 text-muted-foreground" />
          )}
          <div>
            <p className="text-sm font-medium">Structure Lock</p>
            <p className="text-xs text-muted-foreground">
              {structureLocked 
                ? "AI edits content only, preserving layout" 
                : "AI can modify structure"}
            </p>
          </div>
        </div>
        <Switch 
          checked={structureLocked}
          onCheckedChange={onStructureLockChange}
        />
      </div>

      {/* Content Actions */}
      <Collapsible open={contentActionsOpen} onOpenChange={setContentActionsOpen}>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="w-full justify-between">
            <span className="flex items-center gap-2">
              <Wand2 className="h-4 w-4" />
              Content Actions
            </span>
            <ChevronDown className={cn(
              "h-4 w-4 transition-transform",
              contentActionsOpen && "rotate-180"
            )} />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-2 pt-2">
          <div className="grid grid-cols-2 gap-2">
            <Button 
              variant="outline" 
              size="sm"
              className="justify-start"
              onClick={() => onImproveSlide('improve')}
              disabled={isImproving || !currentSlide}
            >
              {isImproving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Wand2 className="h-4 w-4 mr-2" />
              )}
              Rewrite
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              className="justify-start"
              onClick={() => onImproveSlide('simplify')}
              disabled={isImproving || !currentSlide}
            >
              {isImproving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Minimize2 className="h-4 w-4 mr-2" />
              )}
              Simplify
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              className="justify-start"
              onClick={() => onImproveSlide('expand')}
              disabled={isImproving || !currentSlide}
            >
              {isImproving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Expand className="h-4 w-4 mr-2" />
              )}
              Expand
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              className="justify-start"
              onClick={() => onImproveSlide('bullets')}
              disabled={isImproving || !currentSlide}
            >
              {isImproving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <ListOrdered className="h-4 w-4 mr-2" />
              )}
              To Bullets
            </Button>
          </div>

          <Button 
            variant="outline" 
            size="sm"
            className="w-full justify-start"
            onClick={() => onImproveSlide('diagram')}
            disabled={isImproving || !currentSlide}
          >
            {isImproving ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <GitBranch className="h-4 w-4 mr-2" />
            )}
            Generate Diagram Suggestion
          </Button>

          <Button 
            variant="outline" 
            size="sm"
            className="w-full justify-start"
            onClick={() => onImproveSlide('regenerate')}
            disabled={isImproving || !currentSlide}
          >
            {isImproving ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Regenerate Entire Slide
          </Button>
        </CollapsibleContent>
      </Collapsible>

      {/* Image Generation */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Visual Generation</Label>
        <Button 
          variant="gradient" 
          size="sm"
          className="w-full"
          onClick={onGenerateImage}
          disabled={isGeneratingImage || !currentSlide?.image_prompt}
        >
          {isGeneratingImage ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4 mr-2" />
          )}
          {currentSlide?.image_url ? 'Regenerate Image' : 'Generate AI Image'}
        </Button>
        {!currentSlide?.image_prompt && (
          <p className="text-xs text-muted-foreground">
            Add an image prompt in the Design tab first
          </p>
        )}
      </div>

      {/* AI Insert Slides */}
      <Collapsible open={insertActionsOpen} onOpenChange={setInsertActionsOpen}>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="w-full justify-between">
            <span className="flex items-center gap-2">
              <PlusCircle className="h-4 w-4" />
              AI Insert Slide
            </span>
            <ChevronDown className={cn(
              "h-4 w-4 transition-transform",
              insertActionsOpen && "rotate-180"
            )} />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-3 pt-2">
          <div className="space-y-2">
            <Label className="text-xs">Insert Position</Label>
            <Select value={insertPosition} onValueChange={(v) => setInsertPosition(v as 'before' | 'after')}>
              <SelectTrigger className="h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="before">Before current slide</SelectItem>
                <SelectItem value="after">After current slide</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-xs">Describe the slide to generate</Label>
            <Textarea
              value={insertPrompt}
              onChange={(e) => setInsertPrompt(e.target.value)}
              placeholder="e.g., Add a comparison slide comparing our solution vs competitors..."
              className="min-h-[80px] text-sm"
            />
          </div>

          <Button 
            variant="outline" 
            size="sm"
            className="w-full"
            onClick={handleInsert}
            disabled={!insertPrompt.trim() || isImproving}
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Generate & Insert
          </Button>

          {/* Quick Insert Options */}
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Quick Insert:</Label>
            <div className="flex flex-wrap gap-1">
              {[
                { label: 'Summary', prompt: 'Create a summary slide' },
                { label: 'Comparison', prompt: 'Create a comparison slide' },
                { label: 'Timeline', prompt: 'Create a timeline slide' },
                { label: 'Key Points', prompt: 'Create a key takeaways slide' },
              ].map((option) => (
                <Badge
                  key={option.label}
                  variant="outline"
                  className="cursor-pointer hover:bg-secondary transition-colors"
                  onClick={() => setInsertPrompt(option.prompt)}
                >
                  {option.label}
                </Badge>
              ))}
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
