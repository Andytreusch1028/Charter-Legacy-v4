
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

const tables = [
    'profiles',
    'llcs',
    'wills',
    'alerts',
    'ledger_entries',
    'registered_agent_config',
    'registered_agent_documents',
    'ra_inquiry_threads',
    'ra_inquiry_messages'
];

async function checkTables() {
    console.log("--- TABLE INITIALIZATION CHECK ---");
    for (const table of tables) {
        try {
            const { error } = await supabase.from(table).select('*').limit(1);
            if (error) {
                if (error.message.includes('does not exist')) {
                    console.log(`[❌] ${table}: MISSING`);
                } else {
                    console.log(`[⚠️] ${table}: ERROR (${error.message})`);
                }
            } else {
                console.log(`[✅] ${table}: EXISTS`);
            }
        } catch (err) {
            console.log(`[⚠️] ${table}: FAILED TO CHECK`);
        }
    }
}

checkTables();
