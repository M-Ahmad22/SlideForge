-- Create function to get slides for shared presentations
-- This uses SECURITY DEFINER to bypass RLS for unauthenticated public access
CREATE OR REPLACE FUNCTION public.get_shared_slides(share_token_param text)
RETURNS TABLE(
  id uuid,
  order_index integer,
  slide_type text,
  title text,
  subtitle text,
  bullets jsonb,
  image_url text,
  layout text,
  speaker_notes text,
  animation text
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT 
    s.id,
    s.order_index,
    s.slide_type,
    s.title,
    s.subtitle,
    s.bullets,
    s.image_url,
    s.layout,
    s.speaker_notes,
    s.animation
  FROM slides s
  JOIN presentation_shares ps ON ps.presentation_id = s.presentation_id
  WHERE ps.share_token = share_token_param
    AND ps.is_active = true
    AND (ps.expires_at IS NULL OR ps.expires_at > now())
  ORDER BY s.order_index;
$$;