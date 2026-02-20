// @ts-nocheck
// supabase/functions/ra-document-ingest/index.ts
// Called by Charter Legacy staff (or webhook) when a new document
// arrives at the DeLand Hub. Handles the full ingest lifecycle and
// writes the complete audit chain as contemporaneous evidence.

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" },
  });
}

async function writeAudit(
  supabase: ReturnType<typeof createClient>,
  row: {
    user_id: string;
    document_id?: string | null;
    action: string;
    actor_type: "USER" | "SYSTEM" | "CHARTER_ADMIN";
    actor_email?: string | null;
    outcome: "SUCCESS" | "FAILURE" | "PENDING";
    metadata?: Record<string, unknown>;
  }
) {
  const { error } = await supabase.from("ra_document_audit").insert(row);
  if (error) console.error("Audit write error:", error.message);
}

async function sendViaResend(payload: {
  to: string;
  subject: string;
  html: string;
}) {
  const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
  if (!RESEND_API_KEY) throw new Error("RESEND_API_KEY not configured");

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Charter Legacy <noreply@charterlegacy.com>",
      to: [payload.to],
      subject: payload.subject,
      html: payload.html,
    }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "Resend error");
  return data;
}

function buildAvailabilityEmailHtml(docTitle: string, docType: string, isUrgent: boolean) {
  const urgentBanner = isUrgent
    ? `<div style="background:#FEF2F2;border:1px solid #FECACA;border-radius:8px;padding:12px 16px;margin-bottom:20px">
         <p style="color:#DC2626;font-weight:900;font-size:13px;margin:0">⚠️ URGENT — Legal Document Received</p>
         <p style="color:#DC2626;font-size:12px;margin:4px 0 0">This document may require immediate action. Please review it now.</p>
       </div>`
    : "";

  return `
    <div style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto;padding:32px">
      <img src="https://charterlegacy.com/assets/logo.png" alt="Charter Legacy" style="height:32px;margin-bottom:24px" />
      ${urgentBanner}
      <h2 style="font-size:20px;font-weight:900;color:#1D1D1F;margin:0 0 8px">
        New Document Available in Your Vault
      </h2>
      <p style="color:#6B7280;font-size:14px;margin:0 0 4px">
        A new document has been received at your DeLand Hub address and is now available in your Document Vault.
      </p>
      <div style="background:#F9FAFB;border:1px solid #E5E7EB;border-radius:8px;padding:16px;margin:20px 0">
        <p style="margin:0 0 4px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#9CA3AF">Document</p>
        <p style="margin:0;font-size:15px;font-weight:700;color:#1D1D1F">${docTitle}</p>
        <p style="margin:4px 0 0;font-size:12px;color:#6B7280">${docType}</p>
      </div>
      <a href="https://app.charterlegacy.com/dashboard" 
         style="display:inline-block;background:#007AFF;color:white;font-weight:900;font-size:13px;text-decoration:none;padding:12px 24px;border-radius:10px;margin-bottom:24px">
        View in Document Vault →
      </a>
      <p style="color:#9CA3AF;font-size:11px;border-top:1px solid #F3F4F6;padding-top:16px;margin-top:8px">
        This notification was sent automatically by Charter Legacy upon receipt of a document at your registered agent address.
        Receipt timestamp: ${new Date().toISOString()}.
        This email and its delivery are logged as part of your audit record.
      </p>
    </div>
  `;
}

// ── Main handler ──────────────────────────────────────────────────────────────

serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });

  // This endpoint requires either the Service Role Key (Admin/CLI) 
  // OR a valid JWT from a Staff member.
  const authHeader = req.headers.get("Authorization");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    serviceKey!
  );

  // Check for Service Key first
  const isServiceKey = authHeader && authHeader.includes(serviceKey!);
  
  if (!isServiceKey) {
    // If not service key, check if it's a valid staff member JWT
    const jwt = authHeader?.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(jwt);
    
    if (authError || !user) {
        return json({ error: "Unauthorized: Invalid Session" }, 401);
    }
    
    // Check if user has staff metadata
    const role = user.app_metadata?.staff_role;
    if (!role || !['master_admin', 'ra_agent', 'formation_clerk', 'legacy_clerk'].includes(role)) {
        return json({ error: "Forbidden: Staff access only" }, 403);
    }
  }

  let body: {
    user_id: string;
    title: string;
    doc_type: string;
    file_path?: string;
    file_size_kb?: number;
    urgent?: boolean;
    admin_email?: string;
    source?: string; // e.g. "DeLand Hub — Physical Mail"
    content_hash?: string;
    override?: boolean;
    additional_recipients?: Array<{ email: string; name?: string }>;
  };

  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid JSON" }, 400);
  }

  const { 
    user_id, title, doc_type, file_path, file_size_kb, 
    urgent = false, admin_email, source, content_hash, 
    override = false, additional_recipients = [] 
  } = body;
  if (!user_id || !title || !doc_type) {
    return json({ error: "Missing required fields: user_id, title, doc_type" }, 400);
  }

  // ── Step 0: Deduplication Check ──────────────────────────────────────────
  if (content_hash) {
    const { data: existing } = await supabase
      .from("registered_agent_documents")
      .select("id, title, created_at")
      .eq("content_hash", content_hash)
      .limit(1)
      .maybeSingle();

    if (existing) {
      if (!override) {
        // Audit Blocked Duplicate
        await writeAudit(supabase, {
          user_id,
          action: "DOC_DUPLICATE_BLOCKED",
          actor_type: "SYSTEM",
          outcome: "FAILURE",
          metadata: { doc_title: title, content_hash, original_doc_id: existing.id },
        });

        return json({ 
          error: "Duplicate document detected", 
          code: "DUPLICATE_DETECTED",
          original_doc: existing 
        }, 409);
      } else {
        // Audit Override
        await writeAudit(supabase, {
          user_id,
          action: "DOC_DUPLICATE_OVERRIDDEN",
          actor_type: "CHARTER_ADMIN", // Assumed override comes from staff
          actor_email: admin_email ?? "system@charterlegacy.com",
          outcome: "SUCCESS",
          metadata: { doc_title: title, content_hash, original_doc_id: existing.id },
        });
      }
    }
  }

  const now = new Date().toISOString();

  // ── Step 1: Create document record ────────────────────────────────────────
  const { data: newDoc, error: insertError } = await supabase
    .from("registered_agent_documents")
    .insert({
      user_id,
      title,
      type: doc_type,
      date: now.split("T")[0],
      received_at: now,
      file_path: file_path ?? null,
      file_size_kb: file_size_kb ?? null,
      urgent,
      status: "Forwarded",
      viewed: false,
      content_hash: content_hash ?? null, // Save hash for future deduping
    })
    .select()
    .single();

  if (insertError || !newDoc) {
    return json({ error: "Failed to create document record", detail: insertError?.message }, 500);
  }

  const docId = newDoc.id;

  // ── Step 2: Audit — DOC_RECEIVED ─────────────────────────────────────────
  await writeAudit(supabase, {
    user_id,
    document_id: docId,
    action: "DOC_RECEIVED",
    actor_type: "CHARTER_ADMIN",
    actor_email: admin_email ?? "system@charterlegacy.com",
    outcome: "SUCCESS",
    metadata: { doc_title: title, doc_type, source: source ?? "DeLand Hub", urgent, content_hash },
  });

  // ── Step 3: Audit — DOC_SCANNED (if file_path provided) ──────────────────
  if (file_path) {
    await writeAudit(supabase, {
      user_id,
      document_id: docId,
      action: "DOC_SCANNED",
      actor_type: "SYSTEM",
      outcome: "SUCCESS",
      metadata: { doc_title: title, file_size_kb, storage_path: file_path },
    });
  }

  // ── Step 4: Audit — DOC_MADE_AVAILABLE ───────────────────────────────────
  await writeAudit(supabase, {
    user_id,
    document_id: docId,
    action: "DOC_MADE_AVAILABLE",
    actor_type: "SYSTEM",
    outcome: "SUCCESS",
    metadata: { doc_title: title, doc_id: docId },
  });

  // ── Step 5: Look up user email and send availability notification ─────────
  const { data: userData } = await supabase.auth.admin.getUserById(user_id);
  const userEmail = userData?.user?.email;

  if (userEmail) {
    try {
      // Construct Pixel URL
      const projectUrl = Deno.env.get("SUPABASE_URL") ?? "https://api.charterlegacy.com";
      // Assuming functions live at /functions/v1/track-pixel
      // If SUPABASE_URL is 'https://<project>.supabase.co', directly append functions path
      const pixelUrl = `${projectUrl}/functions/v1/track-pixel?id=${docId}`;
      const trackingHtml = `<img src="${pixelUrl}" alt="" width="1" height="1" style="display:none;" />`;

      const resendResult = await sendViaResend({
        to: userEmail,
        subject: urgent
          ? `⚠️ URGENT: New Legal Document Received — ${title}`
          : `[Charter Legacy] New Document Available: ${title}`,
        html: buildAvailabilityEmailHtml(title, doc_type, urgent) + trackingHtml,
      });

      // Update document record with email sent timestamp
      await supabase
        .from("registered_agent_documents")
        .update({ availability_email_sent_at: now, email_notification_id: resendResult.id })
        .eq("id", docId);

      // Audit — AVAILABILITY_EMAIL_SENT
      await writeAudit(supabase, {
        user_id,
        document_id: docId,
        action: "AVAILABILITY_EMAIL_SENT",
        actor_type: "SYSTEM",
        outcome: "SUCCESS",
        metadata: {
          email_to: userEmail,
          email_subject: urgent ? `URGENT: ${title}` : title,
          provider_message_id: resendResult.id,
          urgent,
        },
      });

      // If urgent, also audit URGENT_SMS_SENT (placeholder — wire to Twilio later)
      if (urgent) {
        await writeAudit(supabase, {
          user_id,
          document_id: docId,
          action: "URGENT_SMS_QUEUED",
          actor_type: "SYSTEM",
          outcome: "PENDING",
          metadata: { doc_title: title, note: "SMS provider not yet configured" },
        });
      }

    } catch (emailErr) {
      await writeAudit(supabase, {
        user_id,
        document_id: docId,
        action: "AVAILABILITY_EMAIL_SENT",
        actor_type: "SYSTEM",
        outcome: "FAILURE",
        metadata: { email_to: userEmail, reason: (emailErr as Error).message },
      });
    }
  }

  // ── Step 6: Process Additional Recipients ─────────────────────────────────
  const emailResults = [];
  for (const recipient of additional_recipients) {
    if (!recipient.email || recipient.email === userEmail) continue;

    try {
      const resendResult = await sendViaResend({
        to: recipient.email,
        subject: urgent
          ? `⚠️ URGENT: New Legal Document Received — ${title}`
          : `[Charter Legacy] New Document Available: ${title}`,
        html: buildAvailabilityEmailHtml(title, doc_type, urgent), // No tracking pixel for CCs for now to keep it simple
      });

      emailResults.push({ email: recipient.email, success: true, id: resendResult.id });

      // Audit — AVAILABILITY_EMAIL_SENT (CC)
      await writeAudit(supabase, {
        user_id,
        document_id: docId,
        action: "AVAILABILITY_EMAIL_SENT",
        actor_type: "SYSTEM",
        outcome: "SUCCESS",
        metadata: {
          email_to: recipient.email,
          email_subject: urgent ? `URGENT: ${title}` : title,
          provider_message_id: resendResult.id,
          urgent,
          note: "Additional recipient (CC)"
        },
      });
    } catch (err) {
      emailResults.push({ email: recipient.email, success: false, error: err.message });
      await writeAudit(supabase, {
        user_id,
        document_id: docId,
        action: "AVAILABILITY_EMAIL_SENT",
        actor_type: "SYSTEM",
        outcome: "FAILURE",
        metadata: { email_to: recipient.email, reason: err.message, note: "CC failed" },
      });
    }
  }

  return json({
    success: true,
    document_id: docId,
    audit_chain: [
      "DOC_RECEIVED",
      ...(file_path ? ["DOC_SCANNED"] : []),
      "DOC_MADE_AVAILABLE",
      userEmail ? "AVAILABILITY_EMAIL_SENT" : "EMAIL_SKIPPED_NO_ADDRESS",
      ...(urgent ? ["URGENT_SMS_QUEUED"] : []),
    ],
  });
});
