// 30+ Professional PPTX Themes
// Each theme includes: name, category, colors, fonts, and PPTX-compatible styles

export interface PptxTheme {
  id: string;
  name: string;
  category: 'professional' | 'academic' | 'corporate' | 'formal' | 'minimal' | 'modern' | 'dark' | 'light' | 'creative';
  preview: {
    primary: string;
    secondary: string;
    background: string;
    text: string;
    accent: string;
  };
  pptx: {
    background: string;
    titleColor: string;
    textColor: string;
    accentColor: string;
    titleFont: string;
    bodyFont: string;
    titleSize: number;
    bodySize: number;
  };
}

export const themes: PptxTheme[] = [
  // === PROFESSIONAL ===
  {
    id: 'executive-blue',
    name: 'Executive Blue',
    category: 'professional',
    preview: { primary: '#1e40af', secondary: '#3b82f6', background: '#ffffff', text: '#1e293b', accent: '#0ea5e9' },
    pptx: { background: 'FFFFFF', titleColor: '1e40af', textColor: '1e293b', accentColor: '0ea5e9', titleFont: 'Arial', bodyFont: 'Arial', titleSize: 44, bodySize: 18 }
  },
  {
    id: 'classic-navy',
    name: 'Classic Navy',
    category: 'professional',
    preview: { primary: '#0f172a', secondary: '#334155', background: '#f8fafc', text: '#0f172a', accent: '#2563eb' },
    pptx: { background: 'F8FAFC', titleColor: '0f172a', textColor: '334155', accentColor: '2563eb', titleFont: 'Georgia', bodyFont: 'Arial', titleSize: 40, bodySize: 16 }
  },
  {
    id: 'slate-professional',
    name: 'Slate Professional',
    category: 'professional',
    preview: { primary: '#475569', secondary: '#64748b', background: '#ffffff', text: '#1e293b', accent: '#0284c7' },
    pptx: { background: 'FFFFFF', titleColor: '475569', textColor: '1e293b', accentColor: '0284c7', titleFont: 'Calibri', bodyFont: 'Calibri', titleSize: 42, bodySize: 18 }
  },

  // === ACADEMIC ===
  {
    id: 'academic-classic',
    name: 'Academic Classic',
    category: 'academic',
    preview: { primary: '#1e3a8a', secondary: '#3b82f6', background: '#fefce8', text: '#1c1917', accent: '#b91c1c' },
    pptx: { background: 'FFFEF5', titleColor: '1e3a8a', textColor: '1c1917', accentColor: 'b91c1c', titleFont: 'Times New Roman', bodyFont: 'Times New Roman', titleSize: 40, bodySize: 16 }
  },
  {
    id: 'university-green',
    name: 'University Green',
    category: 'academic',
    preview: { primary: '#14532d', secondary: '#166534', background: '#f0fdf4', text: '#14532d', accent: '#ca8a04' },
    pptx: { background: 'F0FDF4', titleColor: '14532d', textColor: '1e293b', accentColor: 'ca8a04', titleFont: 'Georgia', bodyFont: 'Arial', titleSize: 38, bodySize: 16 }
  },
  {
    id: 'research-burgundy',
    name: 'Research Burgundy',
    category: 'academic',
    preview: { primary: '#7f1d1d', secondary: '#991b1b', background: '#fef2f2', text: '#1c1917', accent: '#1d4ed8' },
    pptx: { background: 'FFFFFF', titleColor: '7f1d1d', textColor: '1c1917', accentColor: '1d4ed8', titleFont: 'Palatino', bodyFont: 'Palatino', titleSize: 40, bodySize: 16 }
  },
  {
    id: 'scholarly-sepia',
    name: 'Scholarly Sepia',
    category: 'academic',
    preview: { primary: '#78350f', secondary: '#92400e', background: '#fffbeb', text: '#451a03', accent: '#0369a1' },
    pptx: { background: 'FFF8E1', titleColor: '78350f', textColor: '451a03', accentColor: '0369a1', titleFont: 'Cambria', bodyFont: 'Cambria', titleSize: 38, bodySize: 16 }
  },

  // === CORPORATE ===
  {
    id: 'corporate-blue',
    name: 'Corporate Blue',
    category: 'corporate',
    preview: { primary: '#1d4ed8', secondary: '#3b82f6', background: '#ffffff', text: '#1e293b', accent: '#f59e0b' },
    pptx: { background: 'FFFFFF', titleColor: '1d4ed8', textColor: '1e293b', accentColor: 'f59e0b', titleFont: 'Arial', bodyFont: 'Arial', titleSize: 44, bodySize: 18 }
  },
  {
    id: 'business-gray',
    name: 'Business Gray',
    category: 'corporate',
    preview: { primary: '#374151', secondary: '#6b7280', background: '#f9fafb', text: '#111827', accent: '#2563eb' },
    pptx: { background: 'F9FAFB', titleColor: '374151', textColor: '111827', accentColor: '2563eb', titleFont: 'Segoe UI', bodyFont: 'Segoe UI', titleSize: 42, bodySize: 18 }
  },
  {
    id: 'enterprise-steel',
    name: 'Enterprise Steel',
    category: 'corporate',
    preview: { primary: '#1f2937', secondary: '#4b5563', background: '#f3f4f6', text: '#111827', accent: '#0891b2' },
    pptx: { background: 'F3F4F6', titleColor: '1f2937', textColor: '111827', accentColor: '0891b2', titleFont: 'Arial Black', bodyFont: 'Arial', titleSize: 40, bodySize: 18 }
  },

  // === FORMAL ===
  {
    id: 'formal-black',
    name: 'Formal Black',
    category: 'formal',
    preview: { primary: '#18181b', secondary: '#27272a', background: '#ffffff', text: '#18181b', accent: '#a855f7' },
    pptx: { background: 'FFFFFF', titleColor: '18181b', textColor: '27272a', accentColor: 'a855f7', titleFont: 'Garamond', bodyFont: 'Arial', titleSize: 44, bodySize: 18 }
  },
  {
    id: 'elegant-gold',
    name: 'Elegant Gold',
    category: 'formal',
    preview: { primary: '#78350f', secondary: '#b45309', background: '#fffbeb', text: '#1c1917', accent: '#d97706' },
    pptx: { background: 'FFFBEB', titleColor: '78350f', textColor: '1c1917', accentColor: 'd97706', titleFont: 'Didot', bodyFont: 'Georgia', titleSize: 42, bodySize: 16 }
  },
  {
    id: 'regal-purple',
    name: 'Regal Purple',
    category: 'formal',
    preview: { primary: '#581c87', secondary: '#7e22ce', background: '#faf5ff', text: '#1e1b4b', accent: '#c026d3' },
    pptx: { background: 'FAF5FF', titleColor: '581c87', textColor: '1e1b4b', accentColor: 'c026d3', titleFont: 'Palatino', bodyFont: 'Palatino', titleSize: 40, bodySize: 16 }
  },

  // === MINIMAL ===
  {
    id: 'minimal-white',
    name: 'Minimal White',
    category: 'minimal',
    preview: { primary: '#18181b', secondary: '#71717a', background: '#ffffff', text: '#18181b', accent: '#18181b' },
    pptx: { background: 'FFFFFF', titleColor: '18181b', textColor: '3f3f46', accentColor: '18181b', titleFont: 'Helvetica', bodyFont: 'Helvetica', titleSize: 48, bodySize: 18 }
  },
  {
    id: 'minimal-gray',
    name: 'Minimal Gray',
    category: 'minimal',
    preview: { primary: '#52525b', secondary: '#a1a1aa', background: '#fafafa', text: '#27272a', accent: '#3f3f46' },
    pptx: { background: 'FAFAFA', titleColor: '52525b', textColor: '27272a', accentColor: '3f3f46', titleFont: 'Arial', bodyFont: 'Arial', titleSize: 44, bodySize: 18 }
  },
  {
    id: 'clean-mono',
    name: 'Clean Mono',
    category: 'minimal',
    preview: { primary: '#0f0f0f', secondary: '#525252', background: '#ffffff', text: '#171717', accent: '#404040' },
    pptx: { background: 'FFFFFF', titleColor: '0f0f0f', textColor: '171717', accentColor: '404040', titleFont: 'SF Pro Display', bodyFont: 'SF Pro Text', titleSize: 46, bodySize: 18 }
  },
  {
    id: 'swiss-design',
    name: 'Swiss Design',
    category: 'minimal',
    preview: { primary: '#000000', secondary: '#666666', background: '#ffffff', text: '#000000', accent: '#ff0000' },
    pptx: { background: 'FFFFFF', titleColor: '000000', textColor: '333333', accentColor: 'ff0000', titleFont: 'Helvetica Neue', bodyFont: 'Helvetica Neue', titleSize: 50, bodySize: 18 }
  },

  // === MODERN ===
  {
    id: 'modern-blue',
    name: 'Modern Blue',
    category: 'modern',
    preview: { primary: '#0ea5e9', secondary: '#38bdf8', background: '#f0f9ff', text: '#0c4a6e', accent: '#06b6d4' },
    pptx: { background: 'F0F9FF', titleColor: '0ea5e9', textColor: '0c4a6e', accentColor: '06b6d4', titleFont: 'Inter', bodyFont: 'Inter', titleSize: 44, bodySize: 18 }
  },
  {
    id: 'modern-gradient',
    name: 'Modern Gradient',
    category: 'modern',
    preview: { primary: '#7c3aed', secondary: '#a78bfa', background: '#ffffff', text: '#1e1b4b', accent: '#ec4899' },
    pptx: { background: 'FFFFFF', titleColor: '7c3aed', textColor: '1e1b4b', accentColor: 'ec4899', titleFont: 'Poppins', bodyFont: 'Open Sans', titleSize: 42, bodySize: 18 }
  },
  {
    id: 'vibrant-teal',
    name: 'Vibrant Teal',
    category: 'modern',
    preview: { primary: '#0d9488', secondary: '#14b8a6', background: '#f0fdfa', text: '#134e4a', accent: '#f59e0b' },
    pptx: { background: 'F0FDFA', titleColor: '0d9488', textColor: '134e4a', accentColor: 'f59e0b', titleFont: 'Montserrat', bodyFont: 'Lato', titleSize: 44, bodySize: 18 }
  },
  {
    id: 'fresh-green',
    name: 'Fresh Green',
    category: 'modern',
    preview: { primary: '#16a34a', secondary: '#22c55e', background: '#f0fdf4', text: '#14532d', accent: '#0ea5e9' },
    pptx: { background: 'F0FDF4', titleColor: '16a34a', textColor: '14532d', accentColor: '0ea5e9', titleFont: 'Nunito', bodyFont: 'Nunito', titleSize: 42, bodySize: 18 }
  },

  // === DARK ===
  {
    id: 'dark-midnight',
    name: 'Dark Midnight',
    category: 'dark',
    preview: { primary: '#0ea5e9', secondary: '#38bdf8', background: '#0f172a', text: '#f1f5f9', accent: '#a855f7' },
    pptx: { background: '0f172a', titleColor: '38bdf8', textColor: 'e2e8f0', accentColor: 'a855f7', titleFont: 'Arial', bodyFont: 'Arial', titleSize: 44, bodySize: 18 }
  },
  {
    id: 'dark-slate',
    name: 'Dark Slate',
    category: 'dark',
    preview: { primary: '#22d3ee', secondary: '#67e8f9', background: '#1e293b', text: '#f8fafc', accent: '#f472b6' },
    pptx: { background: '1e293b', titleColor: '22d3ee', textColor: 'f8fafc', accentColor: 'f472b6', titleFont: 'Segoe UI', bodyFont: 'Segoe UI', titleSize: 42, bodySize: 18 }
  },
  {
    id: 'dark-carbon',
    name: 'Dark Carbon',
    category: 'dark',
    preview: { primary: '#f97316', secondary: '#fb923c', background: '#18181b', text: '#fafafa', accent: '#84cc16' },
    pptx: { background: '18181b', titleColor: 'f97316', textColor: 'fafafa', accentColor: '84cc16', titleFont: 'Roboto', bodyFont: 'Roboto', titleSize: 44, bodySize: 18 }
  },
  {
    id: 'neon-dark',
    name: 'Neon Dark',
    category: 'dark',
    preview: { primary: '#a855f7', secondary: '#c084fc', background: '#0c0a09', text: '#fafaf9', accent: '#22d3ee' },
    pptx: { background: '0c0a09', titleColor: 'a855f7', textColor: 'fafaf9', accentColor: '22d3ee', titleFont: 'Arial Black', bodyFont: 'Arial', titleSize: 46, bodySize: 18 }
  },
  {
    id: 'deep-ocean',
    name: 'Deep Ocean',
    category: 'dark',
    preview: { primary: '#06b6d4', secondary: '#22d3ee', background: '#082f49', text: '#e0f2fe', accent: '#f43f5e' },
    pptx: { background: '082f49', titleColor: '06b6d4', textColor: 'e0f2fe', accentColor: 'f43f5e', titleFont: 'Georgia', bodyFont: 'Arial', titleSize: 42, bodySize: 18 }
  },

  // === LIGHT ===
  {
    id: 'light-sky',
    name: 'Light Sky',
    category: 'light',
    preview: { primary: '#0284c7', secondary: '#0ea5e9', background: '#f0f9ff', text: '#0c4a6e', accent: '#f59e0b' },
    pptx: { background: 'F0F9FF', titleColor: '0284c7', textColor: '0c4a6e', accentColor: 'f59e0b', titleFont: 'Calibri', bodyFont: 'Calibri', titleSize: 44, bodySize: 18 }
  },
  {
    id: 'light-cream',
    name: 'Light Cream',
    category: 'light',
    preview: { primary: '#92400e', secondary: '#b45309', background: '#fffbeb', text: '#451a03', accent: '#0891b2' },
    pptx: { background: 'FFFBEB', titleColor: '92400e', textColor: '451a03', accentColor: '0891b2', titleFont: 'Georgia', bodyFont: 'Arial', titleSize: 40, bodySize: 16 }
  },
  {
    id: 'light-rose',
    name: 'Light Rose',
    category: 'light',
    preview: { primary: '#be185d', secondary: '#db2777', background: '#fdf2f8', text: '#831843', accent: '#7c3aed' },
    pptx: { background: 'FDF2F8', titleColor: 'be185d', textColor: '831843', accentColor: '7c3aed', titleFont: 'Segoe UI', bodyFont: 'Segoe UI', titleSize: 42, bodySize: 18 }
  },
  {
    id: 'soft-lavender',
    name: 'Soft Lavender',
    category: 'light',
    preview: { primary: '#7c3aed', secondary: '#8b5cf6', background: '#faf5ff', text: '#3b0764', accent: '#0d9488' },
    pptx: { background: 'FAF5FF', titleColor: '7c3aed', textColor: '3b0764', accentColor: '0d9488', titleFont: 'Trebuchet MS', bodyFont: 'Arial', titleSize: 42, bodySize: 18 }
  },

  // === CREATIVE ===
  {
    id: 'creative-sunset',
    name: 'Creative Sunset',
    category: 'creative',
    preview: { primary: '#f97316', secondary: '#fb923c', background: '#fff7ed', text: '#431407', accent: '#ec4899' },
    pptx: { background: 'FFF7ED', titleColor: 'f97316', textColor: '431407', accentColor: 'ec4899', titleFont: 'Comic Sans MS', bodyFont: 'Arial', titleSize: 44, bodySize: 18 }
  },
  {
    id: 'creative-neon',
    name: 'Creative Neon',
    category: 'creative',
    preview: { primary: '#10b981', secondary: '#34d399', background: '#f0fdf4', text: '#064e3b', accent: '#f43f5e' },
    pptx: { background: 'F0FDF4', titleColor: '10b981', textColor: '064e3b', accentColor: 'f43f5e', titleFont: 'Impact', bodyFont: 'Verdana', titleSize: 46, bodySize: 18 }
  },
  {
    id: 'pop-art',
    name: 'Pop Art',
    category: 'creative',
    preview: { primary: '#dc2626', secondary: '#fbbf24', background: '#ffffff', text: '#000000', accent: '#2563eb' },
    pptx: { background: 'FFFFFF', titleColor: 'dc2626', textColor: '000000', accentColor: '2563eb', titleFont: 'Arial Black', bodyFont: 'Arial', titleSize: 48, bodySize: 18 }
  },
  {
    id: 'pastel-dream',
    name: 'Pastel Dream',
    category: 'creative',
    preview: { primary: '#f472b6', secondary: '#a78bfa', background: '#fdf4ff', text: '#701a75', accent: '#67e8f9' },
    pptx: { background: 'FDF4FF', titleColor: 'f472b6', textColor: '701a75', accentColor: '67e8f9', titleFont: 'Bradley Hand', bodyFont: 'Arial', titleSize: 42, bodySize: 18 }
  },
];

export const getThemeById = (id: string): PptxTheme => {
  return themes.find(t => t.id === id) || themes[0];
};

export const getThemesByCategory = (category: PptxTheme['category']): PptxTheme[] => {
  return themes.filter(t => t.category === category);
};

export const themeCategories: { value: PptxTheme['category']; label: string }[] = [
  { value: 'professional', label: 'Professional' },
  { value: 'academic', label: 'Academic' },
  { value: 'corporate', label: 'Corporate' },
  { value: 'formal', label: 'Formal' },
  { value: 'minimal', label: 'Minimal' },
  { value: 'modern', label: 'Modern' },
  { value: 'dark', label: 'Dark' },
  { value: 'light', label: 'Light' },
  { value: 'creative', label: 'Creative' },
];
