import { supabase } from '../lib/supabase';

// Dev-mode UUIDs — credit check is always bypassed for these
const DEV_LLC_IDS = [
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000003',
];

/**
 * NotaryProvider
 *
 * Mock service for Remote Online Notary (RON) sealing.
 * Integrated with Charter Legacy Sovereign Succession protocols.
 */
export const NotaryProvider = {
  /**
   * verifyCredits
   * Validates that the LLC has remaining notary credits.
   * Credits live on `public.llcs.notary_credits`.
   * Dev-mode UUIDs and null user IDs are always granted access.
   */
  verifyCredits: async (llcId) => {
    // Bypass for dev/demo LLCs
    if (!llcId || DEV_LLC_IDS.includes(llcId)) {
      console.log('[Notary] Dev mode — credit check bypassed.');
      return true;
    }

    try {
      const { data, error } = await supabase
        .from('llcs')
        .select('notary_credits')
        .eq('id', llcId)
        .single();

      if (error) {
        // Graceful fallback: if we can't read the record, allow the action
        console.warn('[Notary] Could not verify credits, defaulting to allow.', error.message);
        return true;
      }

      return (data?.notary_credits ?? 0) > 0;
    } catch (err) {
      console.error('[Notary] Credit verification exception:', err);
      return false;
    }
  },

  /**
   * sealDocument
   * Simulates the legal sealing of a Private Certificate of Incumbency.
   * Triggers the "handle-private-transfer" edge function for PDF generation.
   */
  sealDocument: async (payload) => {
    console.log('[Notary] Initializing Remote Online Notary Session...');

    // Protocol Step 1: Biometric Check & Identity Verification (Mock)
    await new Promise((r) => setTimeout(r, 1500));
    console.log('[Notary] Identity Verified. Securing Digital Seal...');

    // Protocol Step 2: Call Edge Function
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      // Emergency Override / dev mode has no real JWT — fall back to anon key
      const bearerToken = session?.access_token ?? import.meta.env.VITE_SUPABASE_ANON_KEY;

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/handle-private-transfer`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${bearerToken}`,
            apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Execution Bridge Failed');
      }

      // Read the Vault Access Token from the response header (shown once, at sealing)
      const vatCode = response.headers.get('X-Vault-Token');
      const blob = await response.blob();

      return {
        success: true,
        blob,
        vatCode,  // e.g. "CL-7K3X-A9QP-2M4R" — the physical token to give to the heir
        sealId: `RON-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        timestamp: new Date().toISOString(),
      };
    } catch (err) {
      console.error('[Notary] Sealing Protocol Interrupt:', err);
      return { success: false, error: err.message };
    }
  },
};
