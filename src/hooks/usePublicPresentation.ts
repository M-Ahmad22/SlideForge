import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { PublicSlide } from '@/components/public/PublicSlideViewer';

interface SharedPresentationInfo {
  presentation_id: string;
  permission: 'view' | 'edit';
  title: string;
  theme_id: string;
}

interface UsePublicPresentationResult {
  presentationInfo: SharedPresentationInfo | null;
  slides: PublicSlide[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  updateSlide: (slideId: string, updates: Partial<PublicSlide>) => Promise<void>;
}

export function usePublicPresentation(shareToken: string | undefined): UsePublicPresentationResult {
  const [presentationInfo, setPresentationInfo] = useState<SharedPresentationInfo | null>(null);
  const [slides, setSlides] = useState<PublicSlide[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPresentation = useCallback(async () => {
    if (!shareToken) {
      setError('Invalid share link');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Get share info using RPC function (SECURITY DEFINER bypasses RLS)
      const { data: shareData, error: shareError } = await supabase
        .rpc('get_shared_presentation', { share_token_param: shareToken });

      if (shareError) throw shareError;

      if (!shareData || shareData.length === 0) {
        setError('This presentation link is invalid or has expired');
        setIsLoading(false);
        return;
      }

      const info = shareData[0] as SharedPresentationInfo;
      setPresentationInfo(info);

      // Fetch slides using SECURITY DEFINER function (bypasses RLS for public access)
      const { data: slidesData, error: slidesError } = await supabase
        .rpc('get_shared_slides', { share_token_param: shareToken });

      if (slidesError) throw slidesError;

      // Map the response to PublicSlide format
      const mappedSlides: PublicSlide[] = (slidesData || []).map((s: any) => ({
        id: s.id,
        order_index: s.order_index,
        slide_type: s.slide_type,
        title: s.title,
        subtitle: s.subtitle,
        bullets: s.bullets,
        image_url: s.image_url,
        layout: s.layout,
      }));

      setSlides(mappedSlides);
    } catch (err) {
      console.error('Error fetching shared presentation:', err);
      setError('Failed to load presentation. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [shareToken]);

  const updateSlide = useCallback(async (slideId: string, updates: Partial<PublicSlide>) => {
    if (!presentationInfo || presentationInfo.permission !== 'edit') {
      throw new Error('No edit permission');
    }

    // Cast to match database schema
    const dbUpdates: Record<string, unknown> = { ...updates };

    const { error } = await supabase
      .from('slides')
      .update(dbUpdates)
      .eq('id', slideId);

    if (error) throw error;

    setSlides(prev => prev.map(s => s.id === slideId ? { ...s, ...updates } : s));
  }, [presentationInfo]);

  useEffect(() => {
    fetchPresentation();
  }, [fetchPresentation]);

  return {
    presentationInfo,
    slides,
    isLoading,
    error,
    refetch: fetchPresentation,
    updateSlide,
  };
}
