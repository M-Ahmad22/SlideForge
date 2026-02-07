import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const { prompt, slideId, presentationId } = await req.json();

    if (!prompt) {
      throw new Error('Image prompt is required');
    }

    // Generate image using Lovable AI (Gemini image generation)
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash-image-preview',
        messages: [
          {
            role: 'user',
            content: `Generate a professional, high-quality presentation slide image: ${prompt}. Make it clean, modern, and suitable for a business/academic presentation. No text in the image.`
          }
        ],
        modalities: ['image', 'text'],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Image generation error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'AI credits exhausted.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      throw new Error(`Image generation failed: ${response.status}`);
    }

    const data = await response.json();
    const imageData = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!imageData) {
      throw new Error('No image generated');
    }

    // If we have Supabase credentials, upload to storage
    if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY && presentationId) {
      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
      
      // Convert base64 to blob
      const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
      const buffer = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
      
      const fileName = `${presentationId}/${slideId || Date.now()}.png`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('slide-images')
        .upload(fileName, buffer, {
          contentType: 'image/png',
          upsert: true,
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        // Return base64 as fallback
        return new Response(JSON.stringify({ imageUrl: imageData }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const { data: publicUrl } = supabase.storage
        .from('slide-images')
        .getPublicUrl(fileName);

      return new Response(JSON.stringify({ imageUrl: publicUrl.publicUrl }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Return base64 directly if no storage available
    return new Response(JSON.stringify({ imageUrl: imageData }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-image:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Failed to generate image' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
