import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

async function testConnection() {
    console.log("Testing Supabase Administrative Pulse...");
    console.log("URL:", process.env.SUPABASE_URL);
    
    try {
        const { data, error } = await supabase.from('profiles').select('count', { count: 'exact', head: true });
        
        if (error) {
            console.error("❌ Pulse Failed:", error.message);
            if (error.message.includes("relation \"public.profiles\" does not exist")) {
                console.log("💡 Tip: You likely haven't run the SQL schema in Step 3 of SUPABASE-SETUP.md yet.");
            }
        } else {
            console.log("✅ Pulse Successful! High-security Administrative link established.");
        }
    } catch (err) {
        console.error("❌ Unexpected Error:", err);
    }
}

testConnection();
