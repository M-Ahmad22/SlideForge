-- Drop the problematic policy that causes infinite recursion
DROP POLICY IF EXISTS "Anyone can view shared presentations" ON public.presentations;

-- The sharing functionality works via the get_shared_presentation function which uses SECURITY DEFINER
-- No additional policy needed - shared access is handled securely through the function