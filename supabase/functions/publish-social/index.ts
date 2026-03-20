import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { channel, content, apiKey } = await req.json();

    if (!channel || !content) {
      throw new Error("Missing channel or content");
    }

    let apiResponse = null;

    if (channel.toLowerCase() === 'twitter') {
      const key = apiKey || Deno.env.get('TWITTER_API_KEY');
      if (!key) {
         throw new Error("TWITTER_API_KEY is not configured in local payload or Supabase.");
      }
      // Placeholder for actual Twitter v2 API Post logic
      console.log(`[Twitter Simulation with Key ${key.substring(0,4)}...] Posting: ${content.substring(0, 50)}...`);
      apiResponse = { status: "success", platform: "Twitter", message: "Post pushed to Twitter API." };
      
    } else if (channel.toLowerCase() === 'linkedin') {
      const key = apiKey || Deno.env.get('LINKEDIN_CLIENT_SECRET');
      if (!key) {
         throw new Error("LINKEDIN_CLIENT_SECRET is not configured in local payload or Supabase.");
      }
      // Placeholder for actual LinkedIn UGC Post logic
      console.log(`[LinkedIn Simulation with Key ${key.substring(0,4)}...] Posting: ${content.substring(0, 50)}...`);
      apiResponse = { status: "success", platform: "LinkedIn", message: "Post pushed to LinkedIn API." };
      
    } else if (channel.toLowerCase() === 'blog') {
      const key = apiKey || Deno.env.get('BLOG_API_KEY');
      if (!key) {
         throw new Error("BLOG_API_KEY is not configured in local payload or Supabase.");
      }
      // Placeholder for actual WordPress/Ghost API logic
      console.log(`[Blog CMS Simulation with Key ${key.substring(0,4)}...] Posting Draft: ${content.substring(0, 50)}...`);
      apiResponse = { status: "success", platform: "Blog CMS", message: "Article drafted in CMS." };
      
    } else {
       throw new Error(`Unsupported publishing channel: ${channel}`);
    }

    return new Response(
      JSON.stringify({ success: true, data: apiResponse }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (err) {
    return new Response(
      JSON.stringify({ success: false, error: err.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
