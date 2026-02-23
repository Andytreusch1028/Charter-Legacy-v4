const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function seedWill() {
  console.log('--- SEEDING WILL DATA ---');
  
  // 1. Get user ID for imalive.nowwhat@gmail.com
  const { data: { users }, error: authError } = await supabase.auth.admin.listUsers();
  if (authError) {
    console.error('Error listing users:', authError);
    return;
  }
  
  const user = users.find(u => u.email === 'imalive.nowwhat@gmail.com');
  if (!user) {
    console.error('User not found: imalive.nowwhat@gmail.com');
    return;
  }
  
  console.log(`Found user: ${user.id}`);

  // 2. Insert Will record
  const { data: willData, error: willError } = await supabase
    .from('wills')
    .upsert({
      user_id: user.id,
      will_status: 'Executed',
      executed_date: '2025-12-12',
      legacy_timer_active: true,
      successor_count: 3
    })
    .select();

  if (willError) {
    console.error('Error seeding will:', willError);
  } else {
    console.log('Will seeded successfully:', willData);
  }

  // 3. Update profile to include 'will' type if needed
  const { error: profileError } = await supabase
    .from('profiles')
    .update({ user_type: 'will' }) // Or maybe it should be 'llc' AND 'will'? The check says IN ('llc', 'will')
    .eq('id', user.id);

  if (profileError) {
    console.error('Error updating profile:', profileError);
  } else {
    console.log('Profile updated to include will.');
  }
}

seedWill();
