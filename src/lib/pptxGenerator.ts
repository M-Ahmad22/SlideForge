import PptxGenJS from 'pptxgenjs';
import { getThemeById, PptxTheme } from './themes';

// PC-safe fonts that work across all Windows/Mac systems
const SAFE_FONTS = {
  title: 'Calibri',
  body: 'Calibri',
  fallback: 'Arial',
};

// Helper to extract text from bullet (handles both string and object formats)
type BulletItem = string | { text: string; subBullets?: string[] };

const getBulletText = (bullet: BulletItem): string => {
  if (typeof bullet === 'string') return bullet;
  if (typeof bullet === 'object' && bullet !== null && 'text' in bullet) {
    return bullet.text;
  }
  return String(bullet);
};

export interface SlideData {
  id: string;
  slideType: string;
  title: string;
  subtitle?: string;
  bullets: (string | BulletItem)[];
  speakerNotes?: string;
  imageUrl?: string;
  layout: string;
  animation?: string;
}

export interface PresentationData {
  title: string;
  themeId: string;
  slides: SlideData[];
  animationStyle: string;
}

export const generatePptx = async (presentation: PresentationData): Promise<Blob> => {
  const pptx = new PptxGenJS();
  const theme = getThemeById(presentation.themeId);
  
  pptx.author = 'SlideForge';
  pptx.title = presentation.title;
  pptx.subject = presentation.title;
  pptx.company = 'SlideForge AI';
  
  pptx.defineLayout({ name: 'LAYOUT_16x9', width: 10, height: 5.625 });
  pptx.layout = 'LAYOUT_16x9';

  for (const slideData of presentation.slides) {
    const slide = pptx.addSlide();
    slide.background = { color: theme.pptx.background };
    
    if (slideData.slideType === 'title') {
      addTitleSlide(slide, slideData, theme);
    } else if (slideData.layout === 'split' || slideData.layout === 'image-right') {
      addSplitSlide(slide, slideData, theme, 'right');
    } else if (slideData.layout === 'image-left') {
      addSplitSlide(slide, slideData, theme, 'left');
    } else {
      addContentSlide(slide, slideData, theme);
    }
    
    if (slideData.speakerNotes) {
      slide.addNotes(slideData.speakerNotes);
    }
  }

  const blob = await pptx.write({ outputType: 'blob' }) as Blob;
  return blob;
};

const addTitleSlide = (slide: PptxGenJS.Slide, data: SlideData, theme: PptxTheme) => {
  slide.addText(data.title, {
    x: 0.5, y: 2, w: 9, h: 1.2,
    fontSize: 44,
    fontFace: SAFE_FONTS.title,
    color: theme.pptx.titleColor,
    align: 'center',
    bold: true,
  });
  
  if (data.subtitle) {
    slide.addText(data.subtitle, {
      x: 0.5, y: 3.3, w: 9, h: 0.8,
      fontSize: 22,
      fontFace: SAFE_FONTS.body,
      color: theme.pptx.textColor,
      align: 'center',
    });
  }
  
  slide.addShape('rect', {
    x: 3.5, y: 4.2, w: 3, h: 0.05,
    fill: { color: theme.pptx.accentColor },
  });
};

const addContentSlide = (slide: PptxGenJS.Slide, data: SlideData, theme: PptxTheme) => {
  // Title
  slide.addText(data.title, {
    x: 0.5, y: 0.3, w: 9, h: 0.7,
    fontSize: 32,
    fontFace: SAFE_FONTS.title,
    color: theme.pptx.titleColor,
    bold: true,
  });
  
  // Accent line
  slide.addShape('rect', {
    x: 0.5, y: 1, w: 2, h: 0.04,
    fill: { color: theme.pptx.accentColor },
  });
  
  // Determine if we should show image based on imageUrl presence
  const hasImage = data.imageUrl && !data.imageUrl.startsWith('data:');
  const contentWidth = hasImage ? 4.5 : 9;
  
  if (data.bullets && data.bullets.length > 0) {
    const bulletText = data.bullets.map(bullet => ({
      text: getBulletText(bullet),
      options: {
        bullet: { type: 'bullet' as const, color: theme.pptx.accentColor },
        fontSize: 18,
        color: theme.pptx.textColor,
        breakLine: true,
        fontFace: SAFE_FONTS.body,
      },
    }));
    
    slide.addText(bulletText, {
      x: 0.5, y: 1.3, w: contentWidth, h: 3.8,
      fontFace: SAFE_FONTS.body,
      valign: 'top',
      paraSpaceAfter: 12,
    });
  }
  
  if (hasImage) {
    try {
      slide.addImage({
        path: data.imageUrl!,
        x: 5.2, y: 1.3, w: 4.3, h: 3.8,
        sizing: { type: 'contain', w: 4.3, h: 3.8 },
      });
    } catch (e) {
      console.warn('Failed to add image:', e);
      // Add placeholder shape if image fails
      slide.addShape('rect', {
        x: 5.2, y: 1.3, w: 4.3, h: 3.8,
        fill: { color: theme.pptx.accentColor, transparency: 90 },
        line: { color: theme.pptx.accentColor, width: 1, dashType: 'dash' },
      });
    }
  }
};

const addSplitSlide = (slide: PptxGenJS.Slide, data: SlideData, theme: PptxTheme, imagePosition: 'left' | 'right') => {
  const textX = imagePosition === 'left' ? 5.2 : 0.5;
  const imageX = imagePosition === 'left' ? 0.5 : 5.2;
  
  // Title spans full width
  slide.addText(data.title, {
    x: 0.5, y: 0.3, w: 9, h: 0.7,
    fontSize: 32,
    fontFace: SAFE_FONTS.title,
    color: theme.pptx.titleColor,
    bold: true,
  });
  
  if (data.bullets && data.bullets.length > 0) {
    const bulletText = data.bullets.map(bullet => ({
      text: getBulletText(bullet),
      options: {
        bullet: { type: 'bullet' as const, color: theme.pptx.accentColor },
        fontSize: 18,
        color: theme.pptx.textColor,
        breakLine: true,
        fontFace: SAFE_FONTS.body,
      },
    }));
    
    slide.addText(bulletText, {
      x: textX, y: 1.3, w: 4.3, h: 3.8,
      fontFace: SAFE_FONTS.body,
      valign: 'top',
      paraSpaceAfter: 10,
    });
  }
  
  if (data.imageUrl && !data.imageUrl.startsWith('data:')) {
    try {
      slide.addImage({
        path: data.imageUrl,
        x: imageX, y: 1.3, w: 4.3, h: 3.8,
        sizing: { type: 'contain', w: 4.3, h: 3.8 },
      });
    } catch (e) {
      console.warn('Failed to add image:', e);
      slide.addShape('rect', {
        x: imageX, y: 1.3, w: 4.3, h: 3.8,
        fill: { color: theme.pptx.accentColor, transparency: 90 },
        line: { color: theme.pptx.accentColor, width: 1, dashType: 'dash' },
      });
    }
  } else {
    // No image - still add placeholder for split layout
    slide.addShape('rect', {
      x: imageX, y: 1.3, w: 4.3, h: 3.8,
      fill: { color: theme.pptx.accentColor, transparency: 90 },
      line: { color: theme.pptx.accentColor, width: 1, dashType: 'dash' },
    });
  }
};

export const downloadPptx = async (presentation: PresentationData) => {
  const blob = await generatePptx(presentation);
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${presentation.title.replace(/[^a-z0-9]/gi, '_')}.pptx`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
