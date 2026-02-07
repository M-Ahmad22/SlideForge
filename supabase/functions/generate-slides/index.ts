import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GenerateRequest {
  topic: string;
  notes?: string;
  slideCount: number;
  audience: string;
  tone: string;
  contentDepth: string;
  contentDensity: string;
  genre: string;
  language: string;
  themeId?: string;
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

    const { 
      topic, 
      notes, 
      slideCount, 
      audience, 
      tone, 
      contentDepth, 
      contentDensity = 'medium',
      genre = 'business',
      language 
    }: GenerateRequest = await req.json();

    console.log('Generating slides for topic:', topic, 'with', slideCount, 'slides');
    console.log('Config: density=', contentDensity, 'genre=', genre, 'tone=', tone);

    // Build content density instructions
    const densityInstructions = {
      'minimal': 'Use very minimal text - 2-3 key words per point. Maximum 3 bullet points per slide. Focus on visual impact.',
      'medium': 'Use balanced text - 5-10 words per bullet. Maximum 4 bullet points per slide.',
      'detailed': 'Use comprehensive text - up to 15 words per bullet with explanations. Maximum 5 bullet points per slide.',
      'bullets-only': 'Use ONLY concise bullet points - 3-8 words each. No paragraphs. Maximum 5 bullets per slide.',
      'mixed': 'Use a mix of headings, sub-bullets, and brief explanations. Varied formatting for engagement.',
    };

    // Build genre-specific instructions
    const genreInstructions = {
      'business': 'Use professional business vocabulary. Focus on ROI, metrics, and actionable outcomes. Structure for executive decision-making.',
      'academic': 'Use scholarly language and proper citations format. Include methodology references. Structure for educational clarity.',
      'technical': 'Use precise technical terminology. Include specifications and technical details. Structure for technical audiences.',
      'startup-pitch': 'Use compelling, investor-focused language. Highlight problem, solution, market size, traction. Create urgency and vision.',
      'research': 'Use scientific methodology structure. Include hypothesis, methodology, findings format. Cite theoretical frameworks.',
      'training': 'Use instructional language with clear learning objectives. Include exercises and key takeaways. Progressive skill building.',
      'custom': 'Adapt style based on topic and audience. Maintain professional quality.',
    };

    // Smart image decision logic - determine which slide types benefit from images
    const imageDecisionPrompt = `
CRITICAL IMAGE GENERATION RULES:
- Only include imagePrompt when an image ADDS VALUE to the slide
- DO NOT include images for:
  * Definition slides (text-heavy explanations)
  * Pure bullet point slides with >4 bullets
  * Code or technical specification slides
  * List-heavy slides (timelines as lists, process steps as lists)
  * Summary/conclusion slides with text recap
- DO include images for:
  * Title slides (hero/banner image)
  * Concept visualization slides
  * Comparison slides (side-by-side visual)
  * Single-focus slides (one main idea)
  * Slides with ≤3 bullets where visual aids comprehension
- Set imagePrompt to null/empty when no image is needed
- When including images, describe professional, relevant visuals (not generic stock photos)
`;

    const systemPrompt = `You are an expert presentation designer specializing in ${genre} presentations. Generate professional slide content in JSON format.

CONTENT DENSITY: ${densityInstructions[contentDensity as keyof typeof densityInstructions] || densityInstructions['medium']}

GENRE STYLE: ${genreInstructions[genre as keyof typeof genreInstructions] || genreInstructions['business']}

${imageDecisionPrompt}

RULES:
1. Generate exactly ${slideCount} slides
2. First slide MUST be a title slide with slideType "title"
3. Last slide MUST be a summary or conclusion slide with slideType "summary"
4. Use bullet points, NOT paragraphs (unless mixed density)
5. Each bullet point should follow the content density guidelines
6. Include speaker notes for each slide
7. SMARTLY decide if each slide needs an image (see image rules above)
8. Vary layouts: "full" (no image), "split", "image-left", "image-right"
9. Use "full" layout when no image is needed

Slide types to use:
- "title" - For the opening slide (MUST be first)
- "content" - Standard bullet point slides
- "section" - Section dividers with bold headers
- "comparison" - For comparing two things (images useful here)
- "timeline" - For chronological content (usually no image needed)
- "process" - For step-by-step processes
- "summary" - For conclusions (MUST be last, usually no image)

OUTPUT FORMAT (strict JSON):
{
  "slides": [
    {
      "slideType": "title",
      "title": "Presentation Title",
      "subtitle": "Subtitle or tagline",
      "bullets": [],
      "speakerNotes": "Welcome notes",
      "imagePrompt": "A professional hero image showing...",
      "layout": "full",
      "needsImage": true
    },
    {
      "slideType": "content",
      "title": "Key Points",
      "subtitle": "",
      "bullets": ["Point 1", "Point 2", "Point 3"],
      "speakerNotes": "Key talking points...",
      "imagePrompt": null,
      "layout": "full",
      "needsImage": false
    }
  ]
}`;

    const userPrompt = `Create a ${slideCount}-slide ${genre} presentation about: "${topic}"

Target Audience: ${audience}
Tone: ${tone}
Content Depth: ${contentDepth}
Content Density: ${contentDensity}
Language: ${language}

${notes ? `Additional context/notes from the user:\n${notes}` : ''}

IMPORTANT REMINDERS:
- Apply the content density setting strictly
- Match the ${genre} genre style
- Only add imagePrompt where images truly add value
- Use "full" layout for slides without images
- Return ONLY valid JSON, no markdown code blocks.`;

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
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'AI credits exhausted. Please add credits to continue.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    console.log('AI response received, content length:', content?.length);

    if (!content) {
      throw new Error('No content generated');
    }

    // Parse JSON from response (handle markdown code blocks)
    let jsonContent = content;
    if (content.includes('```json')) {
      jsonContent = content.split('```json')[1].split('```')[0].trim();
    } else if (content.includes('```')) {
      jsonContent = content.split('```')[1].split('```')[0].trim();
    }

    const slides = JSON.parse(jsonContent);
    
    // Post-process: filter out empty imagePrompts and adjust layouts
    if (slides.slides) {
      slides.slides = slides.slides.map((slide: { imagePrompt?: string | null; needsImage?: boolean; layout?: string }) => {
        const hasValidImage = slide.imagePrompt && slide.imagePrompt.trim() !== '' && slide.imagePrompt !== 'null';
        return {
          ...slide,
          imagePrompt: hasValidImage ? slide.imagePrompt : null,
          layout: hasValidImage ? (slide.layout || 'split') : 'full',
        };
      });
    }
    
    console.log('Successfully parsed', slides.slides?.length, 'slides');

    return new Response(JSON.stringify(slides), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-slides:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Failed to generate slides' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
