import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { analyticsData } = await req.json()

    if (!analyticsData) {
      throw new Error('Missing analyticsData in request body.')
    }

    // Initialize Supabase Client (Service Role for backend insertion)
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Call OpenAI to generate new variants
    const openAiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openAiKey) {
      throw new Error('OPENAI_API_KEY is not configured.')
    }

    const systemPrompt = `
Act as a Senior Conversion Rate Optimizer (CRO) and Brand Strategist. Analyze the provided CTR and Conversion data. Identify which emotional hooks (Privacy, Ease of Use, or Legacy) are resonating.
Task: Propose 2 new 'Challenger' Hero Titles and Subheadings.
Constraint: No UPL (Unauthorized Practice of Law). Use administrative and logistical terminology only. Avoid terms like "Legal Advice", "Attorney-Client", "Lawsuit-Proof".

Return the response STRICTLY as a JSON array of objects, with each object containing "headline", "subheading", and "target_sentiment". Do not include any markdown formatting, just the raw JSON.
`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4-turbo-preview', // Or whichever model is preferred
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: JSON.stringify(analyticsData) }
        ],
        temperature: 0.7,
      }),
    });

    const aiData = await response.json();
    if (aiData.error) {
       throw new Error(`OpenAI API Error: ${aiData.error.message}`);
    }

    const content = aiData.choices[0].message.content.trim();
    
    // Attempt to parse the JSON array
    let variants;
    try {
        // Strip out triple backticks if they sneak in
        const cleanContent = content.replace(/```json/g, '').replace(/```/g, '');
        variants = JSON.parse(cleanContent);
    } catch (e) {
        throw new Error(`Failed to parse AI response as JSON: ${content}`);
    }

    if (!Array.isArray(variants)) {
        throw new Error('AI did not return an array of variants.');
    }

    // Insert the generated variants into Supabase with status = 'PENDING'
    const inserts = variants.map((v, index) => ({
        variant_code: `GEN-${Date.now()}-${index}`,
        headline: v.headline,
        subheading: v.subheading,
        target_sentiment: v.target_sentiment || 'AI Generated',
        status: 'PENDING'
    }));

    const { data: insertedVariants, error: insertError } = await supabase
        .from('hero_variants')
        .insert(inserts)
        .select();

    if (insertError) {
        throw new Error(`Supabase Insert Error: ${insertError.message}`);
    }

    return new Response(
      JSON.stringify({ 
          success: true, 
          message: 'Variants generated and queued for review.',
          variants: insertedVariants
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
