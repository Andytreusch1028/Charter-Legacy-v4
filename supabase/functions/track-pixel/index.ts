// @ts-nocheck
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const TRANSPARENT_GIF = new Uint8Array([
  0x47, 0x49, 0x46, 0x38, 0x39, 0x61, 0x01, 0x00, 0x01, 0x00, 0x80, 0x00, 0x00, 0xff, 0xff, 0xff,
  0x00, 0x00, 0x00, 0x21, 0xf9, 0x04, 0x01, 0x00, 0x00, 0x00, 0x00, 0x2c, 0x00, 0x00, 0x00, 0x00,
  0x01, 0x00, 0x01, 0x00, 0x00, 0x02, 0x02, 0x44, 0x01, 0x00, 0x3b
]);

serve(async (req) => {
  // Always return the GIF, even on error, to prevent broken image icon in email clients
  const responseHeaders = {
    "Content-Type": "image/gif",
    "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
    "Pragma": "no-cache",
    "Expires": "0",
    "Surrogate-Control": "no-store"
  };

  try {
    const url = new URL(req.url);
    const docId = url.searchParams.get("id");

    if (docId) {
      const supabase = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
      );

      // Only update if not already opened? Or every open?
      // Let's update every open to track engagement, but maybe only set first opened?
      // The schema has `email_opened_at` (singular timestamp). 
      // Usually signifies "first opened". 
      // Let's update it ONLY if it's null, to preserve the "first read" time.

      const { data: doc } = await supabase
        .from("registered_agent_documents")
        .select("email_opened_at")
        .eq("id", docId)
        .single();

      if (doc && !doc.email_opened_at) {
        await supabase
          .from("registered_agent_documents")
          .update({ email_opened_at: new Date().toISOString() })
          .eq("id", docId);
          
        // Optional: Audit log the open event?
        // Might be too noisy. Let's skip audit for now, or log only first open.
        /*
        await supabase.from("ra_document_audit").insert({
            user_id: "system", // or associated user if known? We don't have user_id here easily without lookup
            document_id: docId,
            action: "EMAIL_OPENED",
            actor_type: "SYSTEM",
            outcome: "SUCCESS"
        });
        */
      }
    }
  } catch (err) {
    console.error("Pixel track error:", err);
  }

  return new Response(TRANSPARENT_GIF, { headers: responseHeaders });
});
