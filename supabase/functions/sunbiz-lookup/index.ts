import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { name } = await req.json();

    if (!name) {
      return new Response(
        JSON.stringify({ error: "Name parameter is required" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    console.log(`[SUNBIZ BRIDGE] Scoping Registry for: "${name}"`);

    const scraperApiKey = Deno.env.get("SCRAPER_API_KEY");
    let effectiveUrl = "";

    // PRO-TIP: Direct Results Path bypasses the initial search form WAF check.
    const searchPath = `https://search.sunbiz.org/Inquiry/CorporationSearch/SearchResults/EntityName/${encodeURIComponent(name.toUpperCase())}/Page1?searchNameOrder=${encodeURIComponent(name.toUpperCase())}`;

    if (scraperApiKey) {
      console.log(`[SUNBIZ BRIDGE] Using Managed Scraper Proxy for "${name}"`);
      effectiveUrl = `https://api.scraperapi.com/?api_key=${scraperApiKey}&url=${encodeURIComponent(searchPath)}&render=false`;
    } else {
      console.log(`[SUNBIZ BRIDGE] Stealth-GET Protocol for: "${name}"`);
      effectiveUrl = searchPath;
    }

    const response = await fetch(effectiveUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9,es;q=0.8",
        "Referer": "https://search.sunbiz.org/Inquiry/CorporationSearch/ByName",
        "Sec-Ch-Ua": '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
        "Sec-Ch-Ua-Mobile": "?0",
        "Sec-Ch-Ua-Platform": '"Windows"',
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "same-origin",
        "Sec-Fetch-User": "?1",
        "Upgrade-Insecure-Requests": "1"
      }
    });

    if (response.status === 403 || response.status === 429) {
      console.warn(`[SUNBIZ BRIDGE] Registry Restricted (Status: ${response.status}).`);
      return new Response(
        JSON.stringify({ 
          available: null, 
          error: "Registry connection restricted (Busy)",
          matches: [],
          status: 'BUSY',
          upgrade_ready: !scraperApiKey
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    if (!response.ok) {
      throw new Error(`Registry connection failed with status: ${response.status}`);
    }

    const html = await response.text();

    // Verification: Does the HTML contain the expected Sunbiz search results header or table?
    // If it's a challenge page or empty, it won't have the "search-results" ID or common result headers.
    const isRealResultsPage = html.includes('search-results') || 
                              html.includes('Go to Detail Screen') || 
                              html.includes('No records were found');

    if (!isRealResultsPage) {
      console.warn(`[SUNBIZ BRIDGE] Received Non-Standard Page (Challenge or Empty). Potential Soft-Block.`);
      return new Response(
        JSON.stringify({ 
          available: null, 
          error: "Registry connection restricted (Challenge Page)",
          matches: [],
          status: 'BUSY'
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    // Logic: If the page contains "No records were found", the name is available at the state level.
    const noResultsFound = html.includes("No records were found") || html.includes("No results found");
    
    // Parser: Extract entity names from the results table if they exist
    const nameMatches = [];
    const nameRegex = /<a [^>]*title=["']Go to Detail Screen["'][^>]*>([\s\S]*?)<\/a>/gi;
    let match;
    while ((match = nameRegex.exec(html)) !== null && nameMatches.length < 10) {
      const cleanedName = match[1].replace(/\s+/g, ' ').trim().toUpperCase();
      if (!nameMatches.includes(cleanedName)) {
        nameMatches.push(cleanedName);
      }
    }

    const normalizedName = name.replace(/\s+/g, ' ').toUpperCase().trim();
    const exactConflict = nameMatches.some(m => m === normalizedName);
    
    // Final Decision Logic:
    // Only set available: true IF it's a real results page AND no names were found.
    const isAvailable = noResultsFound || (nameMatches.length === 0 && !exactConflict);

    console.log(`[SUNBIZ BRIDGE] Result for "${name}": ${isAvailable ? "AVAILABLE" : "CONFLICT FOUND"} (${nameMatches.length} matches)`);

    return new Response(
      JSON.stringify({ 
        available: isAvailable, 
        matches: nameMatches,
        source: 'Florida Department of State (Sunbiz)',
        timestamp: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );

  } catch (error) {
    console.error(`[SUNBIZ BRIDGE ERROR]`, error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        available: null, // Fail conclusively: do NOT suggest availability if we can't reach the registry
        matches: [],
        status: 'ERROR'
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 } // Return 200 to allow app to handle fallback
    );
  }
});
