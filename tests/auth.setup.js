import { test as setup } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';

const authFile = 'playwright/.auth/user.json';

setup('authenticate', async ({ page }) => {
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables for auth setup. Make sure SUPABASE_SERVICE_KEY is in .env');
  }

  // Create an admin client using the Service Role Key
  const supabaseAdmin = createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  console.log('Generating Magic Link for test user...');
  
  // Generate a magic link for the test user bypassing the need for an actual email
  const { data, error } = await supabaseAdmin.auth.admin.generateLink({
    type: 'magiclink',
    email: 'test@charterlegacy.com',
    options: {
      data: { role: 'customer' },
      redirectTo: 'http://localhost:5173/app'
    }
  });

  if (error) {
    throw new Error(`Failed to generate magic link: ${error.message}`);
  }

  console.log('Magic Link generated successfully. Navigating to establish session...');

  // The generated link automatically logs the browser in when visited
  await page.goto(data.properties.action_link);
  
  // The app will verify the magic link and redirect us to /admin/fulfillment
  await page.waitForURL('**/admin/fulfillment**', { timeout: 15000 });

  console.log('Session established. Saving storage state...');

  // Save the authenticated state so other tests can reuse it
  await page.context().storageState({ path: authFile });
});
