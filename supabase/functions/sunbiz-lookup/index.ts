import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from '../_shared/cors.ts'

console.log("Sunbiz Lookup Function Initialized")

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { documentNumber } = await req.json()

    if (!documentNumber) {
      return new Response(
        JSON.stringify({ error: 'documentNumber is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // POST to Sunbiz server-side — no CORS issues from Deno edge runtime
    const formData = new URLSearchParams()
    formData.append('SearchTerm', documentNumber)
    formData.append('InquiryType', 'DocumentNumber')
    formData.append('SearchNameOrder', '')

    const sunbizRes = await fetch(
      'https://search.sunbiz.org/Inquiry/CorporationSearch/ByDocumentNumber',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'Mozilla/5.0 (compatible; Charter-Legacy/1.0)',
          'Referer': 'https://search.sunbiz.org/',
        },
        body: formData.toString(),
        redirect: 'follow',
      }
    )

    // Return the final URL after any redirects (this is the detail page URL)
    const finalUrl = sunbizRes.url

    // Also parse the HTML to extract key status fields
    const html = await sunbizRes.text()

    // Extract entity status from the HTML (Sunbiz uses "ACTIVE" in a specific span)
    const statusMatch = html.match(/Filing\s+Information[\s\S]*?Document\s+Number[\s\S]*?Status<\/label>\s*<span[^>]*>([^<]+)<\/span>/i)
    const entityStatus = statusMatch ? statusMatch[1].trim() : null

    // Extract entity name
    const nameMatch = html.match(/<div class="detailSection corporationName">\s*<span[^>]*>([^<]+)<\/span>/i)
    const entityName = nameMatch ? nameMatch[1].trim() : null

    return new Response(
      JSON.stringify({
        success: true,
        detailUrl: finalUrl,
        entityStatus,
        entityName,
        documentNumber,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
