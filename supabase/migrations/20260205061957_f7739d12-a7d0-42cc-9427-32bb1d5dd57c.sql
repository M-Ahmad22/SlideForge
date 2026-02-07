-- Create presentation_shares table for Google Slides-like sharing
CREATE TABLE public.presentation_shares (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  presentation_id UUID NOT NULL REFERENCES public.presentations(id) ON DELETE CASCADE,
  share_token TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  permission TEXT NOT NULL DEFAULT 'view' CHECK (permission IN ('view', 'edit')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.presentation_shares ENABLE ROW LEVEL SECURITY;

-- Policy: Owners can manage their shares
CREATE POLICY "Owners can manage presentation shares"
ON public.presentation_shares
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM presentations
    WHERE presentations.id = presentation_shares.presentation_id
    AND presentations.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM presentations
    WHERE presentations.id = presentation_shares.presentation_id
    AND presentations.user_id = auth.uid()
  )
);

-- Policy: Anyone can view active shares (for viewing shared presentations)
CREATE POLICY "Anyone can view active shares by token"
ON public.presentation_shares
FOR SELECT
USING (is_active = true);

-- Create index for fast token lookups
CREATE INDEX idx_presentation_shares_token ON public.presentation_shares(share_token);
CREATE INDEX idx_presentation_shares_presentation ON public.presentation_shares(presentation_id);

-- Function to get shared presentation by token
CREATE OR REPLACE FUNCTION public.get_shared_presentation(share_token_param TEXT)
RETURNS TABLE (
  presentation_id UUID,
  permission TEXT,
  title TEXT,
  theme_id TEXT
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    ps.presentation_id,
    ps.permission,
    p.title,
    p.theme_id
  FROM presentation_shares ps
  JOIN presentations p ON p.id = ps.presentation_id
  WHERE ps.share_token = share_token_param
    AND ps.is_active = true
    AND (ps.expires_at IS NULL OR ps.expires_at > now());
$$;

-- Add policy for shared presentations viewing
CREATE POLICY "Anyone can view shared presentations"
ON public.presentations
FOR SELECT
USING (
  auth.uid() = user_id OR
  EXISTS (
    SELECT 1 FROM presentation_shares ps
    WHERE ps.presentation_id = presentations.id
    AND ps.is_active = true
    AND (ps.expires_at IS NULL OR ps.expires_at > now())
  )
);

-- Add policy for shared slides viewing
CREATE POLICY "Anyone can view shared slides"
ON public.slides
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM presentations p
    WHERE p.id = slides.presentation_id
    AND (
      p.user_id = auth.uid() OR
      EXISTS (
        SELECT 1 FROM presentation_shares ps
        WHERE ps.presentation_id = p.id
        AND ps.is_active = true
        AND (ps.expires_at IS NULL OR ps.expires_at > now())
      )
    )
  )
);

-- Add policy for editors to update shared slides
CREATE POLICY "Editors can update shared slides"
ON public.slides
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM presentations p
    WHERE p.id = slides.presentation_id
    AND (
      p.user_id = auth.uid() OR
      EXISTS (
        SELECT 1 FROM presentation_shares ps
        WHERE ps.presentation_id = p.id
        AND ps.permission = 'edit'
        AND ps.is_active = true
        AND (ps.expires_at IS NULL OR ps.expires_at > now())
      )
    )
  )
);

-- Add policy for editors to insert slides on shared presentations
CREATE POLICY "Editors can insert shared slides"
ON public.slides
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM presentations p
    WHERE p.id = slides.presentation_id
    AND (
      p.user_id = auth.uid() OR
      EXISTS (
        SELECT 1 FROM presentation_shares ps
        WHERE ps.presentation_id = p.id
        AND ps.permission = 'edit'
        AND ps.is_active = true
        AND (ps.expires_at IS NULL OR ps.expires_at > now())
      )
    )
  )
);

-- Trigger for updated_at
CREATE TRIGGER update_presentation_shares_updated_at
BEFORE UPDATE ON public.presentation_shares
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();