import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const drafts = [
  {
    source_event_type: 'LLC Formation Accepted',
    raw_data: { type: 'LLC', state: 'Florida', timestamp: new Date().toISOString() },
    suggested_copy: "Just helped another ambitious entrepreneur launch their Florida LLC today! It's incredible to see the momentum building in our local business ecosystem. Setting up the legal foundation is the first big step toward generational wealth. Are you protecting your legacy? #CharterLegacy #FloridaBusiness",
    status: 'draft',
    platform: 'linkedin'
  },
  {
    source_event_type: 'BOI Compliance Filed',
    raw_data: { type: 'BOI', authority: 'FinCEN', timeframe: '24 hours' },
    suggested_copy: "🚨 Reminder: FinCEN BOI reporting is NOT optional for most small businesses.\n\nWe just cleared another 15 compliance filings this week alone for our clients. Don't risk the $500/day penalties! Let Charter Legacy handle the bureaucracy so you can focus on building. 🏢🔒\n\n#Compliance #FinCEN #SmallBusiness",
    status: 'draft',
    platform: 'x'
  },
  {
    source_event_type: 'Annual Report Renewal',
    raw_data: { entities_processed: 42, event: 'Annual Report Renewal (Bulk Aggregate)' },
    suggested_copy: "Subject: Don't miss your state filing deadline!\n\nHi everyone,\n\nWe successfully processed state renewals for over 40 of our shielded entities this week. As a reminder, maintaining your good standing is critical to preserving your corporate veil and protecting your personal assets from liability.\n\nIf you haven't filed yet, the deadline is rapidly approaching. Reach out to the Charter Legacy team today, and we'll streamline your entire renewal package.\n\nStay protected,\nCharter Legacy Team",
    status: 'draft',
    platform: 'newsletter'
  }
];

async function seed() {
  console.log("Injecting mock drafts into 'marketing_queue'...");
  let successCount = 0;
  for (const draft of drafts) {
    const { data, error } = await supabase.from('marketing_queue').insert(draft);
    if (error) {
      console.error(`❌ Error inserting draft for ${draft.platform}:`, error.message);
    } else {
      console.log(`✅ Injected ${draft.platform} draft.`);
      successCount++;
    }
  }
  console.log(`Done! Successfully injected ${successCount} drafts.`);
}

seed();
