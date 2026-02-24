import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
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
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // The payload from the Resend webhook
    const payload = await req.json()
    const { type, data } = payload; // Type is something like "email.sent" or "email.delivered"

    // Resend allows attaching custom tags to emails. 
    // We expect { entity_id: '...', client_id: '...' } in the tags.
    const tags = data?.tags || {};
    const entityId = tags.entity_id;
    const clientId = tags.client_id;

    if (!entityId) {
        return new Response(JSON.stringify({ error: 'Missing entity_id in email tags' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400
        });
    }

    let severity = 'INFO';
    let message = null;

    if (type === 'email.delivered') {
        severity = 'SUCCESS';
        message = `Communication delivered to ${data.to[0]}: "${data.subject}"`;
    } else if (type === 'email.bounced' || type === 'email.complained') {
        severity = 'WARNING';
        message = `Communication failed to deliver to ${data.to[0]}.`;
    } else if (type === 'email.sent') {
        severity = 'INFO';
        message = `Secure communication dispatched: "${data.subject}"`;
    } else {
        // Ignore other events for now to prevent noise
        return new Response(JSON.stringify({ message: 'Ignored event type' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200
        });
    }

    // Insert into Immutable Ledger
    const { error: insertError } = await supabaseClient
      .from('system_events_ledger')
      .insert({
        entity_id: entityId,
        client_id: clientId || null,
        actor_id: 'RESEND_WEBHOOK',
        actor_type: 'SYSTEM',
        event_category: 'COMMUNICATION',
        event_type: type.toUpperCase(), // e.g., EMAIL.DELIVERED
        severity: severity,
        customer_facing_message: message,
        internal_payload: data // Store the raw Resend webhook payload for debugging
      })

    if (insertError) throw insertError;

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    console.error(error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
