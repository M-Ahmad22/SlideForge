import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import type { Json } from "@/integrations/supabase/types";

export interface DBPresentation {
  id: string;
  title: string;
  topic: string | null;
  notes: string | null;
  status: string | null;
  slide_count: number | null;
  theme_id: string | null;
  audience: string | null;
  tone: string | null;
  content_depth: string | null;
  language: string | null;
  visual_density: string | null;
  animation_style: string | null;
  thumbnail_url: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface DBSlide {
  id: string;
  presentation_id: string;
  order_index: number;
  slide_type: string | null;
  title: string;
  subtitle: string | null;
  bullets: string[] | null;
  speaker_notes: string | null;
  image_url: string | null;
  image_prompt: string | null;
  layout: string | null;
  animation: string | null;
  background_color: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export function usePresentations() {
  const { user } = useAuth();
  const [presentations, setPresentations] = useState<DBPresentation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPresentations = useCallback(async () => {
    if (!user) {
      setPresentations([]);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('presentations')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setPresentations(data || []);
    } catch (error) {
      console.error('Error fetching presentations:', error);
      toast.error('Failed to load presentations');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchPresentations();
  }, [fetchPresentations]);

  const createPresentation = async (data: {
    title: string;
    topic: string;
    notes?: string;
    slideCount: number;
    themeId: string;
    audience: string;
    tone: string;
    contentDepth: string;
    language: string;
    visualDensity: string;
    animationStyle: string;
  }) => {
    if (!user) {
      toast.error('Please sign in to create presentations');
      return null;
    }

    try {
      const { data: presentation, error } = await supabase
        .from('presentations')
        .insert({
          user_id: user.id,
          title: data.title,
          topic: data.topic,
          notes: data.notes || null,
          slide_count: data.slideCount,
          theme_id: data.themeId,
          audience: data.audience,
          tone: data.tone,
          content_depth: data.contentDepth,
          language: data.language,
          visual_density: data.visualDensity,
          animation_style: data.animationStyle,
          status: 'generating',
        })
        .select()
        .single();

      if (error) throw error;
      
      setPresentations(prev => [presentation, ...prev]);
      return presentation;
    } catch (error) {
      console.error('Error creating presentation:', error);
      toast.error('Failed to create presentation');
      return null;
    }
  };

  const updatePresentation = async (id: string, updates: Partial<DBPresentation>) => {
    try {
      const { error } = await supabase
        .from('presentations')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
      
      setPresentations(prev =>
        prev.map(p => p.id === id ? { ...p, ...updates } : p)
      );
    } catch (error) {
      console.error('Error updating presentation:', error);
      toast.error('Failed to update presentation');
    }
  };

  const deletePresentation = async (id: string) => {
    try {
      // Delete slides first
      await supabase.from('slides').delete().eq('presentation_id', id);
      
      // Delete presentation
      const { error } = await supabase
        .from('presentations')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setPresentations(prev => prev.filter(p => p.id !== id));
      toast.success('Presentation deleted');
    } catch (error) {
      console.error('Error deleting presentation:', error);
      toast.error('Failed to delete presentation');
    }
  };

  const duplicatePresentation = async (id: string) => {
    if (!user) {
      toast.error('Please sign in');
      return null;
    }

    try {
      // Get the original presentation
      const original = presentations.find(p => p.id === id);
      if (!original) {
        toast.error('Presentation not found');
        return null;
      }

      // Create duplicate presentation
      const { data: newPresentation, error: presError } = await supabase
        .from('presentations')
        .insert({
          user_id: user.id,
          title: `${original.title} (Copy)`,
          topic: original.topic,
          notes: original.notes,
          slide_count: original.slide_count,
          theme_id: original.theme_id,
          audience: original.audience,
          tone: original.tone,
          content_depth: original.content_depth,
          language: original.language,
          visual_density: original.visual_density,
          animation_style: original.animation_style,
          status: original.status,
        })
        .select()
        .single();

      if (presError) throw presError;

      // Get original slides
      const { data: originalSlides, error: slidesError } = await supabase
        .from('slides')
        .select('*')
        .eq('presentation_id', id)
        .order('order_index', { ascending: true });

      if (slidesError) throw slidesError;

      // Duplicate slides
      if (originalSlides && originalSlides.length > 0) {
        const newSlides = originalSlides.map(slide => ({
          presentation_id: newPresentation.id,
          order_index: slide.order_index,
          slide_type: slide.slide_type,
          title: slide.title,
          subtitle: slide.subtitle,
          bullets: slide.bullets,
          speaker_notes: slide.speaker_notes,
          image_url: slide.image_url,
          image_prompt: slide.image_prompt,
          layout: slide.layout,
          animation: slide.animation,
          background_color: slide.background_color,
        }));

        await supabase.from('slides').insert(newSlides);
      }

      setPresentations(prev => [newPresentation, ...prev]);
      return newPresentation;
    } catch (error) {
      console.error('Error duplicating presentation:', error);
      toast.error('Failed to duplicate presentation');
      return null;
    }
  };

  return {
    presentations,
    isLoading,
    fetchPresentations,
    createPresentation,
    updatePresentation,
    deletePresentation,
    duplicatePresentation,
  };
}

export function useSlides(presentationId: string | undefined) {
  const [slides, setSlides] = useState<DBSlide[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSlides = useCallback(async () => {
    if (!presentationId) {
      setSlides([]);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('slides')
        .select('*')
        .eq('presentation_id', presentationId)
        .order('order_index', { ascending: true });

      if (error) throw error;
      
      // Parse bullets from Json to string[]
      const parsedSlides = (data || []).map(slide => ({
        ...slide,
        bullets: Array.isArray(slide.bullets) 
          ? slide.bullets as string[]
          : slide.bullets 
            ? JSON.parse(slide.bullets as string)
            : null
      }));
      
      setSlides(parsedSlides);
    } catch (error) {
      console.error('Error fetching slides:', error);
      toast.error('Failed to load slides');
    } finally {
      setIsLoading(false);
    }
  }, [presentationId]);

  useEffect(() => {
    fetchSlides();
  }, [fetchSlides]);

  const saveSlides = async (slidesData: Array<{
    slideType: string;
    title: string;
    subtitle?: string;
    bullets: string[];
    speakerNotes?: string;
    imagePrompt?: string;
    layout?: string;
  }>) => {
    if (!presentationId) return;

    try {
      const slidesToInsert = slidesData.map((slide, index) => ({
        presentation_id: presentationId,
        order_index: index,
        slide_type: slide.slideType,
        title: slide.title,
        subtitle: slide.subtitle || null,
        bullets: slide.bullets as unknown as Json,
        speaker_notes: slide.speakerNotes || null,
        image_prompt: slide.imagePrompt || null,
        layout: slide.layout || 'full',
      }));

      const { error } = await supabase
        .from('slides')
        .insert(slidesToInsert);

      if (error) throw error;
      
      await fetchSlides();
    } catch (error) {
      console.error('Error saving slides:', error);
      toast.error('Failed to save slides');
    }
  };

  const updateSlide = async (slideId: string, updates: Partial<DBSlide>) => {
    try {
      const updateData: Record<string, unknown> = { ...updates };
      if (updates.bullets) {
        updateData.bullets = updates.bullets as unknown as Json;
      }
      
      const { error } = await supabase
        .from('slides')
        .update({ ...updateData, updated_at: new Date().toISOString() })
        .eq('id', slideId);

      if (error) throw error;
      
      setSlides(prev =>
        prev.map(s => s.id === slideId ? { ...s, ...updates } : s)
      );
    } catch (error) {
      console.error('Error updating slide:', error);
      toast.error('Failed to update slide');
    }
  };

  const addSlide = async (afterIndex: number) => {
    if (!presentationId) return;

    try {
      const newSlide = {
        presentation_id: presentationId,
        order_index: afterIndex + 1,
        slide_type: 'content',
        title: 'New Slide',
        bullets: ['Add your content here'] as unknown as Json,
        layout: 'full',
      };

      // First, update order_index of all slides after the insertion point
      const slidesToUpdate = slides.filter(s => s.order_index > afterIndex);
      for (const slide of slidesToUpdate) {
        await supabase
          .from('slides')
          .update({ order_index: slide.order_index + 1 })
          .eq('id', slide.id);
      }

      const { error } = await supabase
        .from('slides')
        .insert(newSlide);

      if (error) throw error;
      
      await fetchSlides();
      toast.success('Slide added');
    } catch (error) {
      console.error('Error adding slide:', error);
      toast.error('Failed to add slide');
    }
  };

  const deleteSlide = async (slideId: string) => {
    if (slides.length <= 1) {
      toast.error('Cannot delete the last slide');
      return;
    }

    try {
      const slideToDelete = slides.find(s => s.id === slideId);
      if (!slideToDelete) return;

      const { error } = await supabase
        .from('slides')
        .delete()
        .eq('id', slideId);

      if (error) throw error;

      // Update order_index of remaining slides
      const slidesToUpdate = slides.filter(s => s.order_index > slideToDelete.order_index);
      for (const slide of slidesToUpdate) {
        await supabase
          .from('slides')
          .update({ order_index: slide.order_index - 1 })
          .eq('id', slide.id);
      }

      await fetchSlides();
      toast.success('Slide deleted');
    } catch (error) {
      console.error('Error deleting slide:', error);
      toast.error('Failed to delete slide');
    }
  };

  const duplicateSlide = async (slideId: string) => {
    const slideToDuplicate = slides.find(s => s.id === slideId);
    if (!slideToDuplicate) return;

    try {
      const newSlide = {
        presentation_id: presentationId,
        order_index: slideToDuplicate.order_index + 1,
        slide_type: slideToDuplicate.slide_type,
        title: `${slideToDuplicate.title} (Copy)`,
        subtitle: slideToDuplicate.subtitle,
        bullets: slideToDuplicate.bullets as unknown as Json,
        speaker_notes: slideToDuplicate.speaker_notes,
        image_prompt: slideToDuplicate.image_prompt,
        image_url: slideToDuplicate.image_url,
        layout: slideToDuplicate.layout,
        animation: slideToDuplicate.animation,
        background_color: slideToDuplicate.background_color,
      };

      // Update order_index of slides after
      const slidesToUpdate = slides.filter(s => s.order_index > slideToDuplicate.order_index);
      for (const slide of slidesToUpdate) {
        await supabase
          .from('slides')
          .update({ order_index: slide.order_index + 1 })
          .eq('id', slide.id);
      }

      const { error } = await supabase.from('slides').insert(newSlide);
      if (error) throw error;

      await fetchSlides();
      toast.success('Slide duplicated');
    } catch (error) {
      console.error('Error duplicating slide:', error);
      toast.error('Failed to duplicate slide');
    }
  };

  return {
    slides,
    isLoading,
    fetchSlides,
    saveSlides,
    updateSlide,
    addSlide,
    deleteSlide,
    duplicateSlide,
    setSlides,
  };
}
