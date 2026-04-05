import { supabase } from './supabase';

/**
 * seedTestData
 * Generates a diverse set of test customers, LLCs, and audit logs.
 */
export const seedTestData = async () => {
    try {
        console.log("🚀 Initializing Robust Fleet Seeding...");
        
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Authentication required for seeding.");

        // 1. Strict Session Anchoring (Satisfy Row-Level Security)
        const targetUserId = user.id;
        const targetEmail = user.email || 'operator@system';

        console.log(`📍 Targeting Profile: ${targetEmail} (${targetUserId})`);

        // 2. Ensure current user profile exists with a name
        const { error: profileError } = await supabase
            .from('profiles')
            .upsert({
                id: targetUserId,
                first_name: "Executive",
                last_name: "Operative",
                user_type: "staff"
            });
        
        if (profileError) console.error("❌ Profile Sync Error:", profileError);

        // 3. Create LLC Entities (The "Prime Fleet" - 100% Compliant)
        const testEntities = [
            { name: "Vanguard Equity Partners LLC", status: "Active" },
            { name: "Silveridian Growth Holdings LLC", status: "Active" },
            { name: "Silverstone Estate Assets LLC", status: "Pending" },
            { name: "Nexus Prime Holdings L.L.C.", status: "Active" }
        ];

        const createdEntities = [];
        let logCount = 0;
        let errors = [];

        for (const ent of testEntities) {
            // 1. Manual Check (Avoid assuming unique constraints)
            const { data: existing } = await supabase
                .from('llcs')
                .select('*')
                .eq('user_id', targetUserId)
                .eq('llc_name', ent.name)
                .maybeSingle();

            if (existing) {
                createdEntities.push(existing);
                continue;
            }

            // 2. Insert if not found
            const { data, error } = await supabase
                .from('llcs')
                .insert({
                    user_id: targetUserId,
                    llc_name: ent.name,
                    llc_status: ent.status,
                    filing_status: "ACTIVE"
                })
                .select()
                .single();
            
            if (error) {
                console.error(`❌ LLC Seed Error (${ent.name}):`, error);
                errors.push(`${ent.name}: ${error.message}`);
                continue;
            }
            if (data) createdEntities.push(data);
        }

        console.log(`🏢 Seeded ${createdEntities.length} LLC Entities.`);

        // 4. Seed Virtual Clients (High-Density Test Data)
        const virtualClients = [
            { first: "Julian", last: "Vane", email: "julian@vane.com", type: "client" },
            { first: "Elena", last: "Cassidy", email: "elena@cassidy.com", type: "will" },
            { first: "Marcus", last: "Drax", email: "marcus@drax.com", type: "client" }
        ];

        for (const vc of virtualClients) {
            // Check if profile exists by email (dummy check using maybe id if we had it, but we'll just insert/ignore)
            // For simplicity, we'll use a fixed namespace of IDs or just insert new ones
            const { data: profile } = await supabase
                .from('profiles')
                .insert({
                    first_name: vc.first,
                    last_name: vc.last,
                    user_type: vc.type
                })
                .select()
                .single();
            
            if (profile) {
                // Seed at least one LLC per virtual client
                await supabase.from('llcs').insert({
                    user_id: profile.id,
                    llc_name: `${vc.last} Capital Group`,
                    filing_status: "Active"
                });
            }
        }

        // 5. Generate Audit Logs (The "System Ledger" Feed)
        const actions = [
            { action: 'FILE_RECEIVED', outcome: 'SUCCESS', actor: 'USER' },
            { action: 'COMPLIANCE_REVIEW', outcome: 'SUCCESS', actor: 'SYSTEM' },
            { action: 'DOC_EXTRACTION', outcome: 'SUCCESS', actor: 'SYSTEM' },
            { action: 'TRANSITION_COMPLETE', outcome: 'SUCCESS', actor: 'SYSTEM' },
            { action: 'MANUAL_OVERRIDE_TRIGGERED', outcome: 'FAILURE', actor: 'USER' }
        ];

        for (const entity of createdEntities) {
            for (let i = 0; i < 4; i++) {
                const template = actions[Math.floor(Math.random() * actions.length)];
                const { error } = await supabase
                    .from('ra_document_audit')
                    .insert({
                        user_id: targetUserId,
                        llc_id: entity.id,
                        action: template.action,
                        actor_type: template.actor === 'USER' ? 'USER' : 'CHARTER_ADMIN',
                        actor_email: template.actor === 'USER' ? targetEmail : 'system@charterlegacy.com',
                        outcome: template.outcome,
                        created_at: new Date(Date.now() - (Math.random() * 86400000 * 5))
                    });
                
                if (error) {
                    errors.push(`Audit Log: ${error.message}`);
                } else {
                    logCount++;
                }
            }
        }

        const summary = `Seeded ${createdEntities.length} LLCs and ${logCount} Audit Logs. Profile synced for ${targetEmail}.`;
        
        if (errors.length > 0) {
            return { 
                success: false, 
                message: `${summary} Errors: ${errors.slice(0, 2).join(', ')}` 
            };
        }

        return { success: true, message: summary };

    } catch (err) {
        return { success: false, message: `Fatal: ${err.message}` };
    }
};
