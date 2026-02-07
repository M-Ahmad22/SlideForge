import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ImproveRequest {
  action: 'improve' | 'expand' | 'simplify' | 'regenerate' | 'bullets' | 'diagram' | 'generate';
  title?: string;
  bullets?: string[];
  speakerNotes?: string;
  structureLocked?: boolean;
  prompt?: string;
  context?: {
    currentSlideTitle?: string;
    presentationTitle?: string;
    position?: 'before' | 'after';
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const body: ImproveRequest = await req.json();
    const { action, title, bullets, speakerNotes, structureLocked, prompt, context } = body;

    console.log('Slide AI action:', action, 'for title:', title || prompt);

    // Handle generate action for inserting new slides
    if (action === 'generate') {
      const systemPrompt = `You are an expert presentation designer. Generate a new slide based on the user's prompt.

Return ONLY valid JSON in this exact format:
{
  "slideType": "content",
  "title": "Slide title",
  "bullets": ["Point 1", "Point 2", "Point 3", "Point 4"],
  "speakerNotes": "Speaker notes for the presenter",
  "layout": "full",
  "imagePrompt": "A professional image prompt for this slide (optional, only if visual would help)"
}

Rules:
- slideType can be: "content", "title", "section", "comparison", "timeline", "summary"
- Maximum 5 bullet points
- Each bullet under 15 words
- layout can be: "full", "split", "image-left", "image-right"
- Only include imagePrompt if a visual would genuinely enhance the slide
- Make content relevant to the presentation context`;

      const userPrompt = `Presentation: "${context?.presentationTitle || 'Untitled'}"
Current slide: "${context?.currentSlideTitle || 'None'}"
Position: Insert ${context?.position || 'after'} current slide

User request: ${prompt}

Generate a professional slide that fits this context.`;

      const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('AI gateway error:', response.status, errorText);
        throw new Error(`AI gateway error: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;

      if (!content) {
        throw new Error('No content generated');
      }

      let jsonContent = content;
      if (content.includes('```json')) {
        jsonContent = content.split('```json')[1].split('```')[0].trim();
      } else if (content.includes('```')) {
        jsonContent = content.split('```')[1].split('```')[0].trim();
      }

      const generated = JSON.parse(jsonContent);
      console.log('Successfully generated new slide');

      return new Response(JSON.stringify(generated), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Action prompts for existing slide modifications
    const actionPrompts: Record<string, string> = {
      improve: 'Improve this slide content to be more professional, clear, and impactful. Keep the same structure but enhance the wording and flow.',
      expand: 'Expand this slide with more details and additional bullet points. Add 2-3 more relevant points while keeping existing ones.',
      simplify: 'Simplify this slide to be more concise. Reduce bullet points to the essential 3-4 key points with shorter text.',
      regenerate: 'Completely regenerate this slide content with a fresh perspective. Create new bullet points that cover the same topic differently.',
      bullets: 'Convert this slide content into clear, concise bullet points. Transform any paragraphs or verbose content into scannable bullet points.',
      diagram: 'Suggest how this slide could be visualized as a diagram. Describe a diagram concept and provide an image prompt for AI generation.',
    };

    const structureLockNote = structureLocked 
      ? '\n\nIMPORTANT: The user has locked the slide structure. Do NOT change the number of bullet points or the layout. Only modify the text content within the existing structure.'
      : '';

    let systemPrompt = `You are an expert presentation designer. ${actionPrompts[action] || actionPrompts.improve}${structureLockNote}

Return ONLY valid JSON in this exact format:
{
  "title": "Updated slide title",
  "bullets": ["Point 1", "Point 2", "Point 3"],
  "speakerNotes": "Updated speaker notes for the presenter"${action === 'diagram' ? ',\n  "diagramDescription": "Description of suggested diagram",\n  "imagePrompt": "Detailed prompt for AI image generation"' : ''}
}

Rules:
- Maximum 5 bullet points${structureLocked ? ' (keep same count as original)' : ''}
- Each bullet under 15 words
- Speaker notes should be helpful for presenting
- Keep language professional but engaging`;

    const userPrompt = `Current slide:
Title: ${title}
Bullets:
${(bullets || []).map((b, i) => `${i + 1}. ${typeof b === 'string' ? b : (b as any)?.text || b}`).join('\n')}
${speakerNotes ? `\nSpeaker Notes: ${speakerNotes}` : ''}

${actionPrompts[action] || actionPrompts.improve}`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      
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
      
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('No content generated');
    }

    // Parse JSON from response
    let jsonContent = content;
    if (content.includes('```json')) {
      jsonContent = content.split('```json')[1].split('```')[0].trim();
    } else if (content.includes('```')) {
      jsonContent = content.split('```')[1].split('```')[0].trim();
    }

    const improved = JSON.parse(jsonContent);
    console.log('Successfully processed slide action:', action);

    return new Response(JSON.stringify(improved), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in improve-slide:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Failed to improve slide' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
