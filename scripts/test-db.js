
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY; // Using service key to bypass RLS for connection test

console.log('Testing Supabase Connection...');
console.log('URL:', supabaseUrl);
console.log('Key (first 10 chars):', supabaseKey ? supabaseKey.substring(0, 10) : 'MISSING');

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  try {
    // Try to access the 'llcs' table - just get count or one row
    const { data, error } = await supabase
      .from('llcs')
      .select('count', { count: 'exact', head: true });

    if (error) {
      console.error('Supabase Connection Failed:', error.message);
      console.error('Error Details:', error);
    } else {
      console.log('Supabase Connection Successful!');
      console.log('Table "llcs" is accessible.');
    }
  } catch (err) {
    console.error('Unexpected Error:', err.message);
  }
}

testConnection();
