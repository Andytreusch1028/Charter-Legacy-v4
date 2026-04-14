import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Respond to CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { llcId, keyUsed, eventType } = await req.json()

    if (!llcId) {
      throw new Error('llcId is required')
    }

    // Initialize Supabase Admin Client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 1. Fetch LLC to get user_id & contact info
    const { data: llc, error: llcError } = await supabaseAdmin
      .from('llcs')
      .select('llc_name, user_id, notify_heirs_on_succession_change')
      .eq('id', llcId)
      .single()

    if (llcError || !llc) throw new Error('LLC not found')

    // 2. Fetch Owner profile to get email/phone
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('first_name, last_name, email, phone')
      .eq('id', llc.user_id)
      .single()

    // 3. Log to audit ledger
    await supabaseAdmin.from('succession_audit_ledger').insert({
      llc_id: llcId,
      event_type: eventType || 'SUCCESSOR_KEY_TURNED',
      details: { key_used: keyUsed, timestamp: new Date().toISOString() }
    })

    // 4. Send the actual notifications (Mocked architecture for now)
    console.log(`[SENTINEL ALERT] SMS dispatched to Founder (${profile?.phone})`)
    console.log(`[SENTINEL ALERT] Email dispatched to Founder (${profile?.email})`)
    console.log(`[SENTINEL ALERT] Push notification queued for Founder ID: ${llc.user_id}`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Succession event triggered, founder notified, 10-day buffer active.' 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})
