import { Zap, Sparkles, FileText, Layers, Download, Palette } from "lucide-react";

export const features = [
  {
    icon: FileText,
    title: "Multi-Source Upload",
    description: "Import PDFs, DOCX, URLs, or paste your notes. Our AI extracts and organizes everything.",
  },
  {
    icon: Sparkles,
    title: "AI-Powered Generation",
    description: "Advanced AI creates structured slides with titles, bullet points, and speaker notes.",
  },
  {
    icon: Layers,
    title: "Smart Infographics",
    description: "Transform complex data into beautiful timelines, flowcharts, and comparison charts.",
  },
  {
    icon: Palette,
    title: "Theme System",
    description: "Choose from academic, modern, tech, and minimal themes. Customize colors and fonts.",
  },
  {
    icon: Zap,
    title: "Canvas Editor",
    description: "Drag, resize, and customize every element. Full control over your presentation.",
  },
  {
    icon: Download,
    title: "Real PPTX Export",
    description: "Download professional PowerPoint files ready for your presentation.",
  },
];

export const audiences = [
  { value: "student", label: "Student", description: "Academic focus, detailed explanations" },
  { value: "teacher", label: "Teacher/Professor", description: "Teaching materials, clear structure" },
  { value: "investor", label: "Investor/Pitch", description: "Compelling narrative, key metrics" },
  { value: "professional", label: "Professional", description: "Business context, actionable insights" },
];

export const tones = [
  { value: "academic", label: "Academic", description: "Formal, research-based" },
  { value: "simple", label: "Simple", description: "Easy to understand, minimal jargon" },
  { value: "pitch", label: "Pitch/Persuasive", description: "Compelling, action-oriented" },
  { value: "technical", label: "Technical", description: "Detailed, precise" },
];

export const contentDepths = [
  { value: "basic", label: "Basic", slides: "5-8 slides" },
  { value: "moderate", label: "Moderate", slides: "10-15 slides" },
  { value: "detailed", label: "Detailed", slides: "15-25 slides" },
  { value: "research", label: "Research-Level", slides: "25+ slides" },
];

// Content density - controls how much text per slide
export const contentDensities = [
  { value: "minimal", label: "Minimal Text", description: "Few key words, highly visual" },
  { value: "medium", label: "Medium Text", description: "Balanced text and whitespace" },
  { value: "detailed", label: "Detailed Text", description: "More comprehensive explanations" },
  { value: "bullets-only", label: "Bullet Points Only", description: "Concise bullet points" },
  { value: "mixed", label: "Mixed Content", description: "Headings + bullets + short explanations" },
];

// Presentation genres - affects structure and vocabulary
export const presentationGenres = [
  { value: "business", label: "Business", description: "Professional business context" },
  { value: "academic", label: "Academic", description: "Research and educational" },
  { value: "technical", label: "Technical", description: "Engineering and tech focus" },
  { value: "startup-pitch", label: "Startup Pitch", description: "Investor presentations" },
  { value: "research", label: "Research", description: "Scientific research papers" },
  { value: "training", label: "Training / Workshop", description: "Educational workshops" },
  { value: "custom", label: "Custom", description: "Flexible format" },
];

// PC-safe fonts that work across all systems
export const safeFonts = [
  { value: "Calibri", label: "Calibri", description: "Modern, clean (Windows default)" },
  { value: "Arial", label: "Arial", description: "Universal, highly compatible" },
  { value: "Times New Roman", label: "Times New Roman", description: "Classic, formal" },
  { value: "Segoe UI", label: "Segoe UI", description: "Modern Windows font" },
];

export const visualDensities = [
  { value: "minimal", label: "Minimal", description: "Clean, lots of whitespace" },
  { value: "balanced", label: "Balanced", description: "Mix of text and visuals" },
  { value: "rich", label: "Rich", description: "Data-heavy, more visuals" },
];

export const animationStyles = [
  { value: "none", label: "None", description: "Static slides" },
  { value: "subtle", label: "Subtle", description: "Gentle fade transitions" },
  { value: "professional", label: "Professional", description: "Smooth animations" },
  { value: "dynamic", label: "Dynamic", description: "Engaging motion" },
];

export const themes = [
  { value: "modern", label: "Modern", colors: ["#0ea5e9", "#1e293b", "#f8fafc"] },
  { value: "academic", label: "Academic", colors: ["#1e40af", "#1e3a8a", "#f1f5f9"] },
  { value: "tech", label: "Tech", colors: ["#22c55e", "#0f172a", "#f0fdf4"] },
  { value: "minimal", label: "Minimal", colors: ["#18181b", "#71717a", "#ffffff"] },
  { value: "creative", label: "Creative", colors: ["#a855f7", "#7c3aed", "#faf5ff"] },
];

export const languages = [
  { value: "en", label: "English" },
  { value: "es", label: "Spanish" },
  { value: "fr", label: "French" },
  { value: "de", label: "German" },
  { value: "zh", label: "Chinese" },
  { value: "ja", label: "Japanese" },
];

export const infographicTypes = [
  { value: "timeline", label: "Timeline", icon: "📅" },
  { value: "comparison", label: "Comparison", icon: "⚖️" },
  { value: "process", label: "Process Flow", icon: "🔄" },
  { value: "hierarchy", label: "Hierarchy", icon: "📊" },
  { value: "diagram", label: "Diagram", icon: "🔗" },
];
