import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

// 1. Connect using ANON key (representing the user in the browser)
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function testRPC() {
    // 2. Fetch pending variants
    const { data: pending, error: fetchErr } = await supabase.from('hero_variants').select('*').eq('status', 'PENDING');
    if (fetchErr) {
        console.error("Fetch Error:", fetchErr);
        return;
    }
    
    console.log(`Found ${pending?.length || 0} pending variants.`);
    if (pending && pending.length > 0) {
        const targetId = pending[0].id;
        console.log(`Targeting ID: ${targetId}`);
        
        // 3. Invoke the RPC
        const { data: rpcData, error: rpcErr } = await supabase.rpc('update_hero_variant_status', { p_id: targetId, p_status: 'ACTIVE' });
        console.log("RPC Response - Data:", rpcData, "Error:", rpcErr);
        
        // 4. Verify if it actually changed
        const { data: verifyData } = await supabase.from('hero_variants').select('status').eq('id', targetId);
        console.log("Post-RPC Status from DB:", verifyData);
    }
}
testRPC();
