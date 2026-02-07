-- Fix the permissive INSERT policy on api_usage_logs
-- Drop the existing permissive policy
DROP POLICY IF EXISTS "System inserts api logs" ON public.api_usage_logs;

-- Create a more restrictive policy - users can only insert their own logs
CREATE POLICY "Users can insert own api logs"
ON public.api_usage_logs
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid() OR public.is_admin(auth.uid()));