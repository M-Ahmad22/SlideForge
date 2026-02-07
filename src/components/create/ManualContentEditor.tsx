 import { useState, useCallback, useMemo } from "react";
 import { FileText, HelpCircle, List, AlignLeft, Hash, Info } from "lucide-react";
 import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

 // Content block types for mixed content
 export interface ContentBlock {
   type: 'bullet' | 'paragraph' | 'subBullet';
   text: string;
   indent?: number;
 }
 
 export interface ParsedSlide {
  id: string;
  title: string;
   content: ContentBlock[];
   bullets: string[]; // Legacy support - derived from content
   rawText?: string; // Preserve original input
  speakerNotes?: string;
  imagePrompt?: string;
}

interface ManualContentEditorProps {
  value: string;
  onChange: (value: string) => void;
  onParse: (slides: ParsedSlide[]) => void;
}

 const exampleContent = `Slide 1: Introduction to AI
 
 Artificial Intelligence (AI) represents one of the most transformative technologies of our time. It encompasses systems that can learn, reason, and make decisions.
 
 Key characteristics:
 - Ability to learn from data
 - Pattern recognition
 - Automated decision-making
 
 Slide 2: Types of AI
 
 There are three main categories of AI systems:
 
 • Narrow AI (ANI) - Specialized for single tasks
 • General AI (AGI) - Human-level intelligence
 • Super AI (ASI) - Beyond human capabilities

 Slide 3: Real-World Applications
 
 AI is already transforming multiple industries:
 
 Healthcare
 - Diagnostic imaging analysis
 - Drug discovery acceleration
 - Personalized treatment plans
 
 Business
 - Predictive analytics
 - Customer service automation
 - Fraud detection
 
 Slide 4: Conclusion
 
 As AI continues to evolve, understanding its capabilities and limitations becomes crucial for professionals across all fields.
 
 • Key takeaways from this presentation
 • Future outlook and emerging trends
 • Questions for discussion`;

export const ManualContentEditor = ({
  value,
  onChange,
  onParse,
}: ManualContentEditorProps) => {
  const [showExample, setShowExample] = useState(false);

   // Intelligent content parsing that preserves structure
   const parseSlideContent = useCallback((rawContent: string): ParsedSlide[] => {
    const slides: ParsedSlide[] = [];
     const lines = rawContent.split("\n");

    let currentSlide: ParsedSlide | null = null;
     // Patterns for detection
     const bulletPatterns = [
       /^[-•*]\s+(.+)/, // Standard bullets: -, •, *
       /^\d+[.)]\s+(.+)/, // Numbered lists: 1. or 1)
     ];
     
     const subBulletPattern = /^(\s{2,})[-•*]\s+(.+)/; // Indented bullets
     const headingPatterns = [
       /^(?:Slide\s*\d+\s*[:.\-]?\s*)(.+)/i, // Slide 1:, Slide 1 -
       /^#{1,3}\s+(.+)/, // Markdown headings
       /^>\s*(.+)/, // Block quotes as titles
     ];
     
     // Detect if a line is a potential heading (short, capitalized, standalone)
     const isLikelyHeading = (line: string, nextLine: string | undefined): boolean => {
       const trimmed = line.trim();
       if (!trimmed || trimmed.length > 60) return false;
       if (bulletPatterns.some(p => p.test(trimmed))) return false;
       
       // Check for heading patterns
       for (const pattern of headingPatterns) {
         if (pattern.test(trimmed)) return true;
       }
       
       // Short line followed by content might be a heading
       const isShortLine = trimmed.length < 50;
       const startsWithCapital = /^[A-Z]/.test(trimmed);
       const hasNoPunctuation = !/[.!?,;:]$/.test(trimmed);
       const nextLineIsContent = nextLine && (
         bulletPatterns.some(p => p.test(nextLine.trim())) ||
         nextLine.trim().length > 0
       );
       
       return isShortLine && startsWithCapital && hasNoPunctuation && !!nextLineIsContent;
     };
     
     // Parse content blocks
     const parseContentBlock = (line: string): ContentBlock | null => {
       const trimmed = line.trim();
       if (!trimmed) return null;
       
       // Check for sub-bullets first
       const subBulletMatch = subBulletPattern.exec(line);
       if (subBulletMatch) {
         return {
           type: 'subBullet',
           text: subBulletMatch[2].trim(),
           indent: Math.floor(subBulletMatch[1].length / 2)
         };
       }
       
       // Check for bullets
       for (const pattern of bulletPatterns) {
         const match = pattern.exec(trimmed);
         if (match) {
           return {
             type: 'bullet',
             text: match[1].trim()
           };
         }
       }
       
       // It's a paragraph
       return {
         type: 'paragraph',
         text: trimmed
       };
     };

     let i = 0;
     let paragraphBuffer: string[] = [];
     
     const flushParagraph = () => {
       if (paragraphBuffer.length > 0 && currentSlide) {
         const text = paragraphBuffer.join(' ').trim();
         if (text) {
           currentSlide.content.push({
             type: 'paragraph',
             text
           });
         }
         paragraphBuffer = [];
       }
     };

     while (i < lines.length) {
       const line = lines[i];
       const trimmed = line.trim();
       const nextLine = lines[i + 1];
       
       // Check for slide header
       let isNewSlide = false;
       let slideTitle = '';
       
       for (const pattern of headingPatterns) {
         const match = pattern.exec(trimmed);
         if (match) {
           isNewSlide = true;
           slideTitle = match[1].trim();
           break;
         }
       }
       
       // Also check if it looks like a new section heading
       if (!isNewSlide && isLikelyHeading(trimmed, nextLine) && slides.length > 0) {
         // This might be a section within a slide, not a new slide
         // Only create new slide if followed by empty line or bullet
         const prevWasEmpty = i > 0 && !lines[i - 1].trim();
         if (prevWasEmpty) {
           isNewSlide = true;
           slideTitle = trimmed;
         }
       }
       
       if (isNewSlide) {
         flushParagraph();
        if (currentSlide) {
          slides.push(currentSlide);
        }
         
        currentSlide = {
          id: `slide-${slides.length + 1}`,
           title: slideTitle,
           content: [],
           bullets: [],
           rawText: ''
        };
         i++;
         continue;
       }
       
       // Handle empty lines - they separate paragraphs
       if (!trimmed) {
         flushParagraph();
         i++;
         continue;
       }
       
       // No current slide yet - create first slide
       if (!currentSlide) {
         currentSlide = {
           id: 'slide-1',
           title: trimmed.length > 60 ? trimmed.slice(0, 60) + '...' : trimmed,
           content: [],
           bullets: [],
           rawText: ''
         };
         i++;
         continue;
       }
       
       // Parse the content block
       const block = parseContentBlock(line);
       if (block) {
         if (block.type === 'paragraph') {
           // Check if this continues the previous paragraph
           paragraphBuffer.push(block.text);
         } else {
           flushParagraph();
           currentSlide.content.push(block);
         }
       }
       
       i++;
     }
     
     // Flush final paragraph
     flushParagraph();
     
     // Don't forget last slide
     if (currentSlide) {
       slides.push(currentSlide);
     }
     
     // Generate legacy bullets array from content
     slides.forEach(slide => {
       slide.bullets = slide.content
         .filter(c => c.type === 'bullet' || c.type === 'subBullet')
         .map(c => c.type === 'subBullet' ? `  ${c.text}` : c.text);
       
       // If no bullets but has paragraphs, don't force convert
       if (slide.bullets.length === 0 && slide.content.length > 0) {
         // Keep paragraphs as-is, create bullet summary for legacy
         slide.bullets = slide.content
           .filter(c => c.type === 'paragraph')
           .slice(0, 4)
           .map(c => c.text.length > 80 ? c.text.slice(0, 80) + '...' : c.text);
       }
     });
     
     // Fallback: create single slide if nothing parsed
     if (slides.length === 0 && rawContent.trim()) {
       const allLines = rawContent.split('\n').filter(l => l.trim());
       slides.push({
         id: 'slide-1',
         title: 'Untitled Slide',
         content: allLines.map(l => ({ type: 'paragraph' as const, text: l.trim() })),
         bullets: allLines.slice(0, 6).map(l => l.replace(/^[-•*]\s*/, '').trim()),
         rawText: rawContent
      });
    }

    return slides;
  }, []);
   
   // Content analysis for preview
   const contentAnalysis = useMemo(() => {
     if (!value.trim()) return null;
     
     const lines = value.split('\n');
     const bulletLines = lines.filter(l => /^[\s]*[-•*]\s/.test(l) || /^\d+[.)]\s/.test(l)).length;
     const paragraphLines = lines.filter(l => l.trim() && !/^[\s]*[-•*]\s/.test(l) && !/^\d+[.)]\s/.test(l) && !/^Slide\s*\d+/i.test(l)).length;
     const slideHeaders = lines.filter(l => /^Slide\s*\d+/i.test(l)).length;
     
     return {
       bulletLines,
       paragraphLines,
       slideHeaders,
       estimatedSlides: Math.max(1, slideHeaders || Math.ceil(lines.length / 8))
     };
   }, [value]);

  const handleParse = () => {
    const parsed = parseSlideContent(value);
    onParse(parsed);
  };

  const loadExample = () => {
    onChange(exampleContent);
    setShowExample(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
           <Label className="text-lg font-medium">Enter Your Slide Content</Label>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <HelpCircle className="h-4 w-4 text-muted-foreground" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="max-w-xs">
                <p className="font-medium mb-1">Formatting Tips:</p>
                <ul className="text-xs space-y-1">
                   <li>• Start slides with "Slide 1:", "Slide 2:", etc.</li>
                   <li>• Use -, •, * for bullet points</li>
                   <li>• Write paragraphs naturally - they stay as paragraphs</li>
                   <li>• Mix bullets and paragraphs freely</li>
                   <li>• Indent with spaces for sub-bullets</li>
                </ul>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <Button variant="link" size="sm" onClick={() => setShowExample(!showExample)}>
          {showExample ? "Hide example" : "Show example"}
        </Button>
      </div>

      <Collapsible open={showExample} onOpenChange={setShowExample}>
        <CollapsibleContent>
          <div className="p-4 bg-secondary/50 rounded-lg mb-4 border border-border">
            <p className="text-sm text-muted-foreground mb-2">
              Here's an example of how to structure your content:
            </p>
            <pre className="text-xs bg-background p-3 rounded-md overflow-auto max-h-48 font-mono">
              {exampleContent}
            </pre>
            <Button variant="secondary" size="sm" className="mt-3" onClick={loadExample}>
              Use this example
            </Button>
          </div>
        </CollapsibleContent>
      </Collapsible>

       <div className="relative">
         <Textarea
           placeholder={`Enter your presentation content here...

 Slide 1: Introduction

 Write your introduction as a paragraph. The system will preserve your formatting exactly as you write it.

 Key points to cover:
 - First important point
 - Second important point
   - Sub-point with indent

 Slide 2: Main Topic

 Continue with more content...`}
           value={value}
           onChange={(e) => onChange(e.target.value)}
           className="min-h-[350px] font-mono text-sm pr-24"
         />
         
         {/* Content analysis badge */}
         {contentAnalysis && (
           <div className="absolute top-2 right-2 flex flex-col gap-1">
             <Badge variant="outline" className="text-xs gap-1">
               <Hash className="h-3 w-3" />
               {contentAnalysis.slideHeaders || contentAnalysis.estimatedSlides} slides
             </Badge>
             {contentAnalysis.paragraphLines > 0 && (
               <Badge variant="secondary" className="text-xs gap-1">
                 <AlignLeft className="h-3 w-3" />
                 {contentAnalysis.paragraphLines} paragraphs
               </Badge>
             )}
             {contentAnalysis.bulletLines > 0 && (
               <Badge variant="secondary" className="text-xs gap-1">
                 <List className="h-3 w-3" />
                 {contentAnalysis.bulletLines} bullets
               </Badge>
             )}
           </div>
         )}
       </div>
       
       {/* Info about structure preservation */}
       <div className="flex items-start gap-2 p-3 bg-secondary/50 rounded-lg text-sm">
         <Info className="h-4 w-4 mt-0.5 text-primary shrink-0" />
         <div className="text-muted-foreground">
           <span className="font-medium text-foreground">Your formatting is preserved.</span>{" "}
           Paragraphs stay as paragraphs, bullets stay as bullets. We won't automatically convert your content.
         </div>
       </div>

      <div className="flex items-center justify-between text-sm text-muted-foreground">
         <div className="flex items-center gap-4">
           {value.trim() ? (
             <>
               <span className="font-medium text-foreground">
                 ~{contentAnalysis?.estimatedSlides || 1} slides detected
               </span>
               <span className="text-xs">
                 {contentAnalysis?.bulletLines || 0} bullets • {contentAnalysis?.paragraphLines || 0} paragraphs
               </span>
             </>
           ) : (
             <span>Start typing or paste your content</span>
           )}
         </div>
        <Button
          onClick={handleParse}
          disabled={!value.trim()}
          className="min-w-32"
        >
          Parse & Preview
        </Button>
      </div>
    </div>
  );
};
