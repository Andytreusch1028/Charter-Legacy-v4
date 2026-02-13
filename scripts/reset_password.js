import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
config({ path: '.env' });

const supabaseAdmin = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY    
);

const email = 'imalivenowwhat@gmail.com';
const newPassword = 'password123';

async function resetPassword() {
    console.log(`Attempting to reset password for ${email}...`);
    
    // First, find the user to get ID (optional, updateUser works with ID usually, but let's see)
    // Actually admin.updateUserById needs ID.
    // admin.createUser can upsert? 
    // Let's list users to find ID.
    
    const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (listError) {
        console.error("List users failed:", listError);
        return;
    }

    const user = users.find(u => u.email === email);

    if (!user) {
        console.error(`User ${email} not found! Creating new user...`);
        const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
            email: email,
            password: newPassword,
            email_confirm: true
        });
        if (createError) console.error("Failed to create user:", createError);
        else console.log("User created successfully.");
    } else {
        console.log(`User found:
        ID: ${user.id}
        Role: ${user.role}
        Confirmed At: ${user.email_confirmed_at}
        Banned: ${user.banned_until}
        `);

        // Force confirm email just in case
        const { error: confirmError } = await supabaseAdmin.auth.admin.updateUserById(
            user.id, 
            { email_confirm: true }
        );
        if (confirmError) console.error("Error confirming email:", confirmError);
        else console.log("Email confirmed.");

        // Update Password
        const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
            user.id,
            { password: newPassword }
        );

        if (updateError) {
             console.error("Failed to update password:", updateError);
        } else {
             console.log(`SUCCESS: Password updated to: ${newPassword}`);
        }
    }
}

resetPassword();
