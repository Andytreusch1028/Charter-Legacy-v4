import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { llc_id } = await req.json()

    if (!llc_id) {
      throw new Error('llc_id is required')
    }

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Phase A: Intent Calibration pre-checks
    // Fetch the LLC to ensure it exists and isn't already transmitted
    const { data: llc, error: fetchError } = await supabaseClient
      .from('llcs')
      .select('filing_status, principal_address')
      .eq('id', llc_id)
      .single()

    if (fetchError || !llc) {
      throw new Error('LLC not found or unauthorized')
    }

    if (llc.filing_status === 'TRANSMITTED') {
      throw new Error('LLC has already been transmitted to Sunbiz.')
    }

    // UPL/Statutory Calibration Check
    const poBoxRegex = /(P\.?O\.?\s*Box|PMB|Post Office Box)/i
    if (llc.principal_address && poBoxRegex.test(llc.principal_address)) {
      throw new Error('Calibration Failed: Principal office cannot be a P.O. Box per FL-605.0113.')
    }

    // Since Playwright requires Chromium binaries not natively bundled in standard Deno Edge runtime,
    // we instruct the local Node/Playwright 'Scrivener Engine' to pick this up from the queue.
    // Phase B & C orchestration is handed off to the headless robot.
    const { error: updateError } = await supabaseClient
      .from('llcs')
      .update({ filing_status: 'PENDING' })
      .eq('id', llc_id)

    if (updateError) {
      throw updateError
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Calibration successful. Added to Sunbiz Scrivener execution queue.' 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})
