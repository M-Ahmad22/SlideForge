export interface Presentation {
  id: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  slides: Slide[];
  config: PresentationConfig;
  status: "draft" | "generating" | "ready";
}

export interface Slide {
  id: string;
  order: number;
  type: SlideType;
  title: string;
  content: SlideContent;
  speakerNotes?: string;
  animation?: string;
  layout: SlideLayout;
}

export type SlideType = 
  | "title" 
  | "content" 
  | "section" 
  | "comparison" 
  | "timeline" 
  | "process" 
  | "summary" 
  | "references"
  | "infographic";

export interface SlideContent {
  bullets?: string[];
  subtitle?: string;
  image?: string;
  chart?: ChartData;
  infographic?: InfographicData;
}

export interface ChartData {
  type: "bar" | "pie" | "line";
  data: Record<string, number>;
  title?: string;
}

export interface InfographicData {
  type: "timeline" | "comparison" | "process" | "hierarchy" | "diagram";
  items: InfographicItem[];
}

export interface InfographicItem {
  id: string;
  title: string;
  description?: string;
  icon?: string;
  position?: number;
}

export type SlideLayout = "full" | "split" | "grid" | "centered";

export interface PresentationConfig {
  audience: string;
  tone: string;
  depth: string;
  language: string;
  visualDensity: string;
  animationStyle: string;
  theme: string;
  slideCount: number;
}

export interface Resource {
  id: string;
  type: "text" | "pdf" | "docx" | "url" | "notes";
  name: string;
  content: string;
  file?: File;
}

export interface Project {
  id: string;
  title: string;
  description?: string;
  thumbnail?: string;
  createdAt: Date;
  updatedAt: Date;
  status: "draft" | "generating" | "ready";
  slideCount: number;
}
