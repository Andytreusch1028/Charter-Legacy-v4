import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

async function seedUser() {
    console.log("🚀 Seeding Live Founder Account...");
    
    const email = 'test@charterlegacy.com';
    const password = 'CharterPassword123!'; // Passwords are required for admin creation, but we will still use Magic Link for login
    
    try {
        // 1. Create the User in Supabase Auth
        console.log(`Checking if ${email} exists...`);
        const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
        let user = users.find(u => u.email === email);
        
        if (!user) {
            console.log("Creating new Auth user...");
            const { data: { user: newUser }, error: createError } = await supabase.auth.admin.createUser({
                email,
                password,
                email_confirm: true
            });
            if (createError) throw createError;
            user = newUser;
            console.log("✅ Auth User Created.");
        } else {
            console.log("ℹ️ User already exists.");
        }

        // 2. Create the Profile
        console.log("Updating Founder Profile...");
        const { error: profileError } = await supabase
            .from('profiles')
            .upsert({
                id: user.id,
                first_name: 'Charter',
                last_name: 'Founder',
                user_type: 'llc'
            });
        if (profileError) throw profileError;

        // 3. Create a Sample LLC (Founder's Shield)
        console.log("Seeding Sample LLC...");
        const { error: llcError } = await supabase
            .from('llcs')
            .upsert({
                user_id: user.id,
                llc_name: 'Phoenix Vanguard LLC',
                product_type: 'founders_shield',
                llc_status: 'active',
                next_deadline: '2026-05-01',
                deadline_type: 'Annual Report'
            });
        if (llcError) throw llcError;

        console.log("\n✨ SEEDING COMPLETE ✨");
        console.log("--------------------------------");
        console.log(`User: ${email}`);
        console.log(`Profile: Charter Founder (LLC)`);
        console.log(`Entity: Phoenix Vanguard LLC`);
        console.log("--------------------------------");
        console.log("👉 ACTION: Go to auth.html and sign in with this email to see the logic in action.");
        
    } catch (err) {
        console.error("❌ Seeding FAILED:", err.message);
    }
}

seedUser();
