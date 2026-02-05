import { createClient } from '@supabase/supabase-js';
import { fileLLCWithSunbiz } from './sunbiz-filing-engine.js';
import dotenv from 'dotenv';
dotenv.config();

// TURBO: Force Visual & Persistent Mode
process.env.HEADLESS = 'false';
process.env.STAY_OPEN = 'true';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

async function launchVisualTest() {
    console.log("🎬 INITIALIZING VISUAL SMOKE TEST...");
    
    try {
        // 1. Get Test User
        const { data: { users } } = await supabase.auth.admin.listUsers();
        const user = users.find(u => u.email === 'test@charterlegacy.com');
        
        if (!user) throw new Error("Test user not found. Please run seed-live-user.js first.");

        // 2. Seed a 'PENDING' intent with full statutory data
        const testLLCName = `VISUAL TEST LLC ${Math.floor(Math.random() * 1000)}`;
        console.log(`📡 Seeding intent: ${testLLCName}`);
        
        const { data: llc, error: llcError } = await supabase
            .from('llcs')
            .upsert({
                user_id: user.id,
                llc_name: testLLCName,
                principal_address: '123 Innovation Way, DeLand, FL 32720',
                statutory_purpose: 'Any and all lawful business.',
                organizer_name: 'Charter Scrivener',
                filing_status: 'PENDING',
                product_type: 'founders_shield'
            })
            .select()
            .single();

        if (llcError) throw llcError;

        console.log("✅ Intent Registered. Launching Scrivener Robot in 3 seconds...");
        console.log("👉 GET READY: A browser window will open automatically.");
        
        setTimeout(async () => {
            await fileLLCWithSunbiz(llc.id);
            console.log("\n🏁 SMOKE TEST COMPLETE.");
            console.log("Check the browser window and your Supabase Vault for evidence.");
        }, 3000);

    } catch (err) {
        console.error("❌ Smoke Test FAILED:", err.message);
        if (err.message.includes("principal_address")) {
            console.log("\n💡 BLOCKER DETECTED: You haven't run the migration-phase-9.sql yet!");
            console.log("Please run the SQL migration in your Supabase Editor before testing.");
        }
    }
}

launchVisualTest();
