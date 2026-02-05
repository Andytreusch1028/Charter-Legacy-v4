import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

async function checkUsers() {
    console.log("Auditing Live Identity Pulse...");
    
    try {
        // List users via Auth Admin API (requires service role)
        const { data: { users }, error } = await supabase.auth.admin.listUsers();
        
        if (error) {
            console.error("❌ Auth Audit Failed:", error.message);
            return;
        }

        if (users.length === 0) {
            console.log("ℹ️ No users found. The platform is a clean slate.");
            console.log("👉 ACTION: Go to http://localhost:8080/app/auth.html and sign in to create your first live account.");
        } else {
            console.log(`✅ Found ${users.length} live user(s).`);
            users.forEach(u => console.log(`- ${u.email} (ID: ${u.id})`));
        }
    } catch (err) {
        console.error("❌ Unexpected Error:", err);
    }
}

checkUsers();
