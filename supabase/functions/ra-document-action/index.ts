// @ts-nocheck
// supabase/functions/ra-document-action/index.ts
// Handles all user-initiated document vault actions.
// Writes immutable audit rows for every action + outcome.

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ── Helpers ──────────────────────────────────────────────────────────────────

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
    ip_address?: string | null;
    user_agent?: string | null;
    outcome: "SUCCESS" | "FAILURE" | "PENDING";
    metadata?: Record<string, unknown>;
  }
) {
  const { error } = await supabase.from("ra_document_audit").insert(row);
  if (error) console.error("Audit write error:", error.message);
}

// ── Email via Resend ──────────────────────────────────────────────────────────

async function sendViaResend(payload: {
  to: string;
  subject: string;
  html: string;
  attachments?: Array<{ filename: string; content: string }>; // base64
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
      attachments: payload.attachments,
    }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "Resend error");
  return data; // { id: "resend_message_id" }
}

// ── Email HTML template ───────────────────────────────────────────────────────

function buildEmailHtml(docTitle: string, isZip = false) {
  return `
    <div style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto;padding:32px">
      <img src="https://charterlegacy.com/assets/logo.png" alt="Charter Legacy" style="height:32px;margin-bottom:24px" />
      <h2 style="font-size:20px;font-weight:900;color:#1D1D1F;margin:0 0 8px">
        ${isZip ? "Your Document Archive" : "Your Requested Document"}
      </h2>
      <p style="color:#6B7280;font-size:14px;margin:0 0 24px">
        ${isZip
          ? "Your requested documents have been packaged into a ZIP archive and are attached below."
          : `<strong>${docTitle}</strong> is attached to this email as a PDF.`}
      </p>
      <p style="color:#9CA3AF;font-size:12px;border-top:1px solid #F3F4F6;padding-top:16px;margin-top:24px">
        This email was sent by Charter Legacy in response to your request from the Document Vault.
        This transmission is logged and timestamped as part of our audit record.
        If you did not request this, contact support@charterlegacy.com immediately.
      </p>
    </div>
  `;
}

// ── Main handler ──────────────────────────────────────────────────────────────

serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });

  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  // Auth: verify the calling user
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) return json({ error: "Unauthorized" }, 401);

  const supabaseUser = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader } } }
  );

  const { data: { user }, error: authError } = await supabaseUser.auth.getUser();
  if (authError || !user) return json({ error: "Unauthorized" }, 401);

  const ip = req.headers.get("x-forwarded-for") ?? req.headers.get("cf-connecting-ip") ?? null;
  const ua = req.headers.get("user-agent") ?? null;

  let body: {
    action: string;
    document_ids: string[];
    email_to?: string;
  };

  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }

  const { action, document_ids = [], email_to } = body;

  // ── Fetch documents ───────────────────────────────────────────────────────
  const { data: docs, error: docsError } = await supabaseAdmin
    .from("registered_agent_documents")
    .select("id, title, file_path, file_size_kb, type")
    .in("id", document_ids)
    .eq("user_id", user.id);

  if (docsError || !docs) return json({ error: "Documents not found" }, 404);

  // ── DOWNLOAD (single doc) ─────────────────────────────────────────────────
  if (action === "download") {
    const doc = docs[0];
    if (!doc) return json({ error: "Document not found" }, 404);

    // Write DOWNLOAD_REQUESTED audit
    await writeAudit(supabaseAdmin, {
      user_id: user.id,
      document_id: doc.id,
      action: "DOWNLOAD_REQUESTED",
      actor_type: "USER",
      actor_email: user.email,
      ip_address: ip,
      user_agent: ua,
      outcome: "SUCCESS",
      metadata: { doc_title: doc.title, file_size_kb: doc.file_size_kb },
    });

    if (!doc.file_path) {
      await writeAudit(supabaseAdmin, {
        user_id: user.id,
        document_id: doc.id,
        action: "DOWNLOAD_URL_ISSUED",
        actor_type: "SYSTEM",
        actor_email: null,
        ip_address: ip,
        user_agent: ua,
        outcome: "FAILURE",
        metadata: { reason: "file_not_yet_available" },
      });
      return json({ error: "Document file not yet available for download." }, 404);
    }

    // Generate signed URL (60 min)
    const { data: signedData, error: signedError } = await supabaseAdmin
      .storage
      .from("ra-documents")
      .createSignedUrl(doc.file_path, 3600);

    if (signedError || !signedData?.signedUrl) {
      await writeAudit(supabaseAdmin, {
        user_id: user.id,
        document_id: doc.id,
        action: "DOWNLOAD_URL_ISSUED",
        actor_type: "SYSTEM",
        outcome: "FAILURE",
        metadata: { reason: signedError?.message },
      });
      return json({ error: "Could not generate download link." }, 500);
    }

    await writeAudit(supabaseAdmin, {
      user_id: user.id,
      document_id: doc.id,
      action: "DOWNLOAD_URL_ISSUED",
      actor_type: "SYSTEM",
      outcome: "SUCCESS",
      metadata: { doc_title: doc.title, url_expiry_mins: 60 },
    });

    return json({ url: signedData.signedUrl });
  }

  // ── EMAIL (single doc) ────────────────────────────────────────────────────
  if (action === "email") {
    const doc = docs[0];
    if (!doc || !email_to) return json({ error: "Missing doc or email_to" }, 400);

    await writeAudit(supabaseAdmin, {
      user_id: user.id,
      document_id: doc.id,
      action: "EMAIL_REQUESTED",
      actor_type: "USER",
      actor_email: user.email,
      ip_address: ip,
      user_agent: ua,
      outcome: "SUCCESS",
      metadata: { doc_title: doc.title, email_to },
    });

    let attachmentContent: string | null = null;

    if (doc.file_path) {
      const { data: fileData, error: fileError } = await supabaseAdmin
        .storage.from("ra-documents").download(doc.file_path);

      if (!fileError && fileData) {
        const buf = await fileData.arrayBuffer();
        attachmentContent = btoa(String.fromCharCode(...new Uint8Array(buf)));
      }
    }

    try {
      const resendResult = await sendViaResend({
        to: email_to,
        subject: `[Charter Legacy] Document: ${doc.title}`,
        html: buildEmailHtml(doc.title),
        attachments: attachmentContent
          ? [{ filename: `${doc.title}.pdf`, content: attachmentContent }]
          : undefined,
      });

      await writeAudit(supabaseAdmin, {
        user_id: user.id,
        document_id: doc.id,
        action: "EMAIL_SENT",
        actor_type: "SYSTEM",
        outcome: "SUCCESS",
        metadata: {
          email_to,
          doc_title: doc.title,
          provider_message_id: resendResult.id,
          has_attachment: !!attachmentContent,
        },
      });

      return json({ success: true, message_id: resendResult.id });
    } catch (err) {
      await writeAudit(supabaseAdmin, {
        user_id: user.id,
        document_id: doc.id,
        action: "EMAIL_SENT",
        actor_type: "SYSTEM",
        outcome: "FAILURE",
        metadata: { email_to, reason: (err as Error).message },
      });
      return json({ error: "Email delivery failed." }, 500);
    }
  }

  // ── ZIP DOWNLOAD ──────────────────────────────────────────────────────────
  if (action === "zip_download" || action === "zip_email") {
    const isEmail = action === "zip_email";

    await writeAudit(supabaseAdmin, {
      user_id: user.id,
      document_id: null,
      action: isEmail ? "ZIP_EMAIL_REQUESTED" : "ZIP_DOWNLOAD_REQUESTED",
      actor_type: "USER",
      actor_email: user.email,
      ip_address: ip,
      user_agent: ua,
      outcome: "SUCCESS",
      metadata: {
        doc_count: docs.length,
        doc_ids: docs.map((d) => d.id),
        ...(isEmail ? { email_to } : {}),
      },
    });

    // Fetch all files and build zip using fflate (available via CDN in Deno)
    const { default: fflate } = await import("https://esm.sh/fflate@0.8.2");

    const zipFiles: Record<string, Uint8Array> = {};
    let totalSizeKb = 0;

    for (const doc of docs) {
      if (!doc.file_path) continue;
      const { data: fileData } = await supabaseAdmin.storage
        .from("ra-documents").download(doc.file_path);
      if (!fileData) continue;
      const buf = new Uint8Array(await fileData.arrayBuffer());
      zipFiles[`${doc.title}.pdf`] = buf;
      totalSizeKb += Math.round(buf.byteLength / 1024);
    }

    if (Object.keys(zipFiles).length === 0) {
      return json({ error: "No downloadable files available yet." }, 404);
    }

    const zipBuffer = fflate.zipSync(zipFiles);

    await writeAudit(supabaseAdmin, {
      user_id: user.id,
      document_id: null,
      action: "ZIP_GENERATED",
      actor_type: "SYSTEM",
      outcome: "SUCCESS",
      metadata: { doc_count: Object.keys(zipFiles).length, zip_size_kb: totalSizeKb },
    });

    if (isEmail) {
      if (!email_to) return json({ error: "Missing email_to" }, 400);
      const zipBase64 = btoa(String.fromCharCode(...zipBuffer));

      try {
        const resendResult = await sendViaResend({
          to: email_to,
          subject: `[Charter Legacy] Your Document Archive (${docs.length} files)`,
          html: buildEmailHtml("", true),
          attachments: [{ filename: "charter-legacy-documents.zip", content: zipBase64 }],
        });

        await writeAudit(supabaseAdmin, {
          user_id: user.id,
          document_id: null,
          action: "ZIP_EMAIL_SENT",
          actor_type: "SYSTEM",
          outcome: "SUCCESS",
          metadata: {
            email_to,
            zip_size_kb: totalSizeKb,
            doc_count: Object.keys(zipFiles).length,
            provider_message_id: resendResult.id,
          },
        });

        return json({ success: true, message_id: resendResult.id });
      } catch (err) {
        await writeAudit(supabaseAdmin, {
          user_id: user.id,
          document_id: null,
          action: "ZIP_EMAIL_SENT",
          actor_type: "SYSTEM",
          outcome: "FAILURE",
          metadata: { email_to, reason: (err as Error).message },
        });
        return json({ error: "ZIP email failed." }, 500);
      }
    }

    // ZIP download — return as binary
    await writeAudit(supabaseAdmin, {
      user_id: user.id,
      document_id: null,
      action: "ZIP_DOWNLOAD_URL_ISSUED",
      actor_type: "SYSTEM",
      outcome: "SUCCESS",
      metadata: { zip_size_kb: totalSizeKb, doc_count: Object.keys(zipFiles).length },
    });

    return new Response(zipBuffer, {
      headers: {
        ...CORS,
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="charter-legacy-documents.zip"`,
      },
    });
  }

  return json({ error: "Unknown action" }, 400);
});
