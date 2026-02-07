-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create presentations table
CREATE TABLE public.presentations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'Untitled Presentation',
  topic TEXT,
  notes TEXT,
  audience TEXT DEFAULT 'general',
  tone TEXT DEFAULT 'professional',
  content_depth TEXT DEFAULT 'detailed',
  language TEXT DEFAULT 'en',
  visual_density TEXT DEFAULT 'balanced',
  animation_style TEXT DEFAULT 'subtle',
  theme_id TEXT DEFAULT 'modern-dark',
  slide_count INTEGER DEFAULT 10,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'generating', 'ready', 'error')),
  thumbnail_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create slides table
CREATE TABLE public.slides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  presentation_id UUID NOT NULL REFERENCES public.presentations(id) ON DELETE CASCADE,
  order_index INTEGER NOT NULL DEFAULT 0,
  slide_type TEXT DEFAULT 'content' CHECK (slide_type IN ('title', 'content', 'section', 'comparison', 'timeline', 'process', 'summary', 'references', 'infographic')),
  title TEXT NOT NULL DEFAULT '',
  subtitle TEXT,
  bullets JSONB DEFAULT '[]'::jsonb,
  speaker_notes TEXT,
  image_url TEXT,
  image_prompt TEXT,
  layout TEXT DEFAULT 'full' CHECK (layout IN ('full', 'split', 'grid', 'centered', 'image-left', 'image-right')),
  animation TEXT DEFAULT 'fade',
  background_color TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create resources table for uploaded files
CREATE TABLE public.resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  presentation_id UUID NOT NULL REFERENCES public.presentations(id) ON DELETE CASCADE,
  resource_type TEXT NOT NULL CHECK (resource_type IN ('text', 'pdf', 'docx', 'url', 'notes')),
  name TEXT NOT NULL,
  content TEXT,
  file_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.presentations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.slides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Presentations policies
CREATE POLICY "Users can view own presentations" ON public.presentations
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own presentations" ON public.presentations
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own presentations" ON public.presentations
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own presentations" ON public.presentations
  FOR DELETE USING (auth.uid() = user_id);

-- Slides policies
CREATE POLICY "Users can view slides of own presentations" ON public.slides
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.presentations WHERE id = slides.presentation_id AND user_id = auth.uid())
  );
CREATE POLICY "Users can create slides for own presentations" ON public.slides
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.presentations WHERE id = slides.presentation_id AND user_id = auth.uid())
  );
CREATE POLICY "Users can update slides of own presentations" ON public.slides
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.presentations WHERE id = slides.presentation_id AND user_id = auth.uid())
  );
CREATE POLICY "Users can delete slides of own presentations" ON public.slides
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.presentations WHERE id = slides.presentation_id AND user_id = auth.uid())
  );

-- Resources policies
CREATE POLICY "Users can view resources of own presentations" ON public.resources
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.presentations WHERE id = resources.presentation_id AND user_id = auth.uid())
  );
CREATE POLICY "Users can create resources for own presentations" ON public.resources
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.presentations WHERE id = resources.presentation_id AND user_id = auth.uid())
  );
CREATE POLICY "Users can delete resources of own presentations" ON public.resources
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.presentations WHERE id = resources.presentation_id AND user_id = auth.uid())
  );

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for auto-update timestamps
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_presentations_updated_at BEFORE UPDATE ON public.presentations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_slides_updated_at BEFORE UPDATE ON public.slides
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for auto-profile creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create storage bucket for generated images
INSERT INTO storage.buckets (id, name, public) VALUES ('slide-images', 'slide-images', true);

-- Storage policies
CREATE POLICY "Anyone can view slide images" ON storage.objects
  FOR SELECT USING (bucket_id = 'slide-images');
CREATE POLICY "Authenticated users can upload slide images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'slide-images' AND auth.role() = 'authenticated');
CREATE POLICY "Users can delete own slide images" ON storage.objects
  FOR DELETE USING (bucket_id = 'slide-images' AND auth.role() = 'authenticated');