import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const resendApiKey = Deno.env.get('RESEND_API_KEY')

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

    const { action_type, entity_id, user_id, details } = await req.json()

    if (!action_type || !entity_id || !user_id) {
        throw new Error('Missing required fields: action_type, entity_id, user_id');
    }

    // 1. Fetch user email
    const { data: userData, error: userError } = await supabaseClient.auth.admin.getUserById(user_id);
    if (userError || !userData?.user?.email) {
        throw new Error('Failed to fetch user email');
    }
    const userEmail = userData.user.email;

    // 2. Fetch entity details
    const { data: entityData, error: entityError } = await supabaseClient
        .from('llcs')
        .select('llc_name')
        .eq('id', entity_id)
        .single();
        
    if (entityError) throw entityError;
    const entityName = entityData?.llc_name || 'Your Entity';

    // 3. Construct Email Content based on Action Type
    let subject = '';
    let htmlContent = '';

    const baseStyles = `
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        color: #1a1a1a;
        line-height: 1.6;
        max-width: 600px;
        margin: 0 auto;
        padding: 20px;
    `;

    if (action_type === 'SUNBIZ_FILING_COMPLETE') {
        subject = `Filing Complete: ${entityName}`;
        htmlContent = `
            <div style="${baseStyles}">
                <h2 style="color: #0A0A0B;">Charter Legacy Action Audit</h2>
                <p>An automated filing has been successfully completed for <strong>${entityName}</strong>.</p>
                <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; border: 1px solid #e9ecef; margin: 20px 0;">
                    <p style="margin: 0; font-family: monospace; font-size: 14px;">
                        <strong>Action:</strong> Formation / Initial Filing<br/>
                        <strong>Status:</strong> Submitted to State<br/>
                        <strong>Reference:</strong> ${details?.tracking_number || 'N/A'}
                    </p>
                </div>
                <p>You can view the full unredacted ledger of this transaction within your Zenith Console.</p>
                <hr style="border: none; border-top: 1px solid #eaeaea; margin: 30px 0;" />
                <p style="font-size: 12px; color: #666;">This is an automated operational receipt. Do not reply to this email.</p>
            </div>
        `;
    } else {
        throw new Error(`Unsupported action type: ${action_type}`);
    }

    // 4. Send via Resend
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: 'Charter Legacy System <audit@charterlegacy.com>',
        to: [userEmail],
        subject: subject,
        html: htmlContent,
        tags: [
            { name: 'entity_id', value: entity_id },
            { name: 'client_id', value: user_id },
            { name: 'action_type', value: action_type }
        ]
      }),
    })

    const resendData = await res.json()

    if (!res.ok) {
        throw new Error(`Resend Error: ${JSON.stringify(resendData)}`);
    }

    // Note: The 'resend-webhook' edge function currently handles the ledger insertion 
    // ONCE the email is actually delivered. We just dispatch it here.

    return new Response(JSON.stringify({ success: true, resendId: resendData.id }), {
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
