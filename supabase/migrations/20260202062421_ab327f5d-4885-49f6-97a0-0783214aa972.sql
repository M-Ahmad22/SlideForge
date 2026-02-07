-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Create enum for subscription plans
CREATE TYPE public.subscription_plan AS ENUM ('free', 'pro', 'enterprise');

-- Create user_roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create user_subscriptions table for plan management
CREATE TABLE public.user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  plan subscription_plan NOT NULL DEFAULT 'free',
  max_slides INTEGER NOT NULL DEFAULT 12,
  max_presentations_per_month INTEGER DEFAULT NULL,
  features JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Create system_settings table for admin configuration
CREATE TABLE public.system_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key TEXT NOT NULL UNIQUE,
  setting_value JSONB NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'general',
  updated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- Create api_usage_logs table for tracking
CREATE TABLE public.api_usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  api_name TEXT NOT NULL,
  model_name TEXT,
  request_type TEXT,
  status TEXT NOT NULL DEFAULT 'success',
  tokens_used INTEGER DEFAULT 0,
  response_time_ms INTEGER,
  error_message TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.api_usage_logs ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = 'admin'
  )
$$;

-- Create function to get user's subscription
CREATE OR REPLACE FUNCTION public.get_user_max_slides(_user_id UUID)
RETURNS INTEGER
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT max_slides FROM public.user_subscriptions WHERE user_id = _user_id),
    12
  )
$$;

-- RLS Policies for user_roles
-- Only admins can see all roles
CREATE POLICY "Admins can view all roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (public.is_admin(auth.uid()) OR user_id = auth.uid());

-- Only admins can manage roles
CREATE POLICY "Admins can manage roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

-- RLS Policies for user_subscriptions
-- Users can view their own subscription
CREATE POLICY "Users can view own subscription"
ON public.user_subscriptions
FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR public.is_admin(auth.uid()));

-- Only admins can manage subscriptions
CREATE POLICY "Admins can manage subscriptions"
ON public.user_subscriptions
FOR ALL
TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

-- RLS Policies for system_settings
-- Admins can read and write settings
CREATE POLICY "Admins can manage system settings"
ON public.system_settings
FOR ALL
TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

-- RLS Policies for api_usage_logs
-- Admins can see all logs, users can see their own
CREATE POLICY "Users can view own api logs"
ON public.api_usage_logs
FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR public.is_admin(auth.uid()));

-- Only system can insert logs (no user modification)
CREATE POLICY "System inserts api logs"
ON public.api_usage_logs
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Insert default system settings
INSERT INTO public.system_settings (setting_key, setting_value, description, category) VALUES
  ('free_slide_limit', '12', 'Maximum slides for free tier users', 'subscription'),
  ('pro_slide_limit', '50', 'Maximum slides for pro tier users', 'subscription'),
  ('enterprise_slide_limit', '999', 'Maximum slides for enterprise tier users', 'subscription'),
  ('image_generation_enabled', 'true', 'Enable/disable AI image generation', 'features'),
  ('default_font', '"Calibri"', 'Default font for presentations', 'presentation'),
  ('max_presentations_free', '10', 'Max presentations per month for free users', 'subscription');

-- Create triggers for updated_at
CREATE TRIGGER update_user_roles_updated_at
BEFORE UPDATE ON public.user_roles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_subscriptions_updated_at
BEFORE UPDATE ON public.user_subscriptions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_system_settings_updated_at
BEFORE UPDATE ON public.system_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();