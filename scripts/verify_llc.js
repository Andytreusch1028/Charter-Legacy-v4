import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
config({ path: '.env' });

const supabaseAdmin = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY,
    {
        auth: {
            persistSession: false,
            autoRefreshToken: false,
            detectSessionInUrl: false
        }
    }
);

const email = 'imalivenowwhat@gmail.com';

async function checkLLC() {
    console.log(`Checking LLCs for ${email}...`);
    
    // 1. Get User ID
    const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    if (listError) {
        console.error("Error listing users:", listError);
        return;
    }
    
    const user = users.find(u => u.email === email);
    if (!user) {
        console.error("User not found!");
        return;
    }
    
    console.log(`User ID: ${user.id}`);

    // 2. Query LLCs
    const { data: llcs, error: llcError } = await supabaseAdmin
        .from('llcs')
        .select('*')
        .eq('user_id', user.id);

    if (llcError) {
        console.error("Error fetching LLCs:", llcError);
    } else {
        console.log(`\nFound ${llcs.length} LLC(s):`);
        llcs.forEach(llc => {
            console.log(`- ID: ${llc.id}`);
            console.log(`  Name: ${llc.llc_name}`);
            console.log(`  Status: ${llc.llc_status}`);
            console.log(`  Created: ${llc.created_at}`);
            console.log('---');
        });
    }
}

checkLLC();
