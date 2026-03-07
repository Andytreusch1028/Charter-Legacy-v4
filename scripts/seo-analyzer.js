import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error("Missing Supabase credentials in .env");
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const OLLAMA_URL = 'http://127.0.0.1:11434/api/generate';
const DEFAULT_MODEL = 'llama3';

async function generateNextIteration(winningPayload, losingPayload) {
    const prompt = `
You are an expert SEO and AI Agent Optimization Strategist working for Charter Legacy.
We just concluded an A/B test. 

WINNING VARIATION (Champion): 
${JSON.stringify(winningPayload, null, 2)}

LOSING VARIATION: 
${JSON.stringify(losingPayload, null, 2)}

TASKS:
1. Provide a single sentence "ai_rationale" explaining why the Champion outperformed the Loser.
2. Generate a NEW Challenger variation (Variation C) to beat the Champion. Keep what worked, but mutate elements to improve it.
3. Keep the "Answer Capsule" (answer_capsule) to exactly 120-150 characters with no links/HTML.

CRITICAL UPL RULES (Do Not Practice Law):
- You CANNOT use the words: bulletproof, guaranteed, legal advice, lawyer, immune, 100%.
- You MUST use safe phrasing like: "helps secure", "designed for privacy", "statutory shield".

OUTPUT FORMAT (JSON ONLY):
{
  "ai_rationale": "One sentence explanation...",
  "title": "New Challenger Title...",
  "description": "New challenger meta description...",
  "keywords": "new, keyword, challenger",
  "answer_capsule": "New 120-150 char answer...",
  "schema": {
     "@context": "https://schema.org",
     "@type": "WebPage" ... include Product/Offer
  }
}
`;

    const response = await fetch(OLLAMA_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: DEFAULT_MODEL, prompt: prompt, stream: false })
    });

    if (!response.ok) throw new Error("Local AI unreachable.");
    const data = await response.json();
    const jsonMatch = data.response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("AI returned non-JSON.");
    return JSON.parse(jsonMatch[0]);
}

async function runAnalysis() {
    console.log("🚀 Starting Agentic SEO Analysis Engine...");
    
    // Find all routes actively testing (title_b is not null)
    const { data: routes, error: routeErr } = await supabase
        .from('seo_discoverability')
        .select('*')
        .not('title_b', 'is', null);

    if (routeErr || !routes) {
        console.error("Failed to fetch routes:", routeErr);
        return;
    }

    console.log(`📡 Found ${routes.length} active A/B tests to evaluate.`);

    for (const route of routes) {
        console.log(`\nEvaluating route: ${route.route}`);
        
        // Fetch telemetry since last analysis
        const { data: telemetry } = await supabase
            .from('seo_analytics')
            .select('*')
            .eq('route', route.route)
            .gte('created_at', route.last_analyzed_at || '1970-01-01');

        if (!telemetry || telemetry.length === 0) {
            console.log(`   ⏳ Not enough telemetry data yet. Skipping.`);
            continue;
        }

        let aData = { views: 0, conversions: 0, revenue: 0 };
        let bData = { views: 0, conversions: 0, revenue: 0 };

        for (const row of telemetry) {
            if (row.variation === 'A') {
                aData.views += row.views;
                aData.conversions += (row.conversions || 0);
                aData.revenue += Number(row.revenue || 0);
            } else if (row.variation === 'B') {
                bData.views += row.views;
                bData.conversions += (row.conversions || 0);
                bData.revenue += Number(row.revenue || 0);
            }
        }

        console.log(`   📊 Variation A: ${aData.views} views, ${aData.conversions} conv, $${aData.revenue}`);
        console.log(`   📊 Variation B: ${bData.views} views, ${bData.conversions} conv, $${bData.revenue}`);

        if ((aData.views + bData.views) === 0) {
            console.log(`   ⏳ No views logged yet. Skipping.`);
            continue;
        }

        // Determine Winner: Revenue > Conversions > Views
        let winner = 'A';
        if (bData.revenue > aData.revenue) {
            winner = 'B';
        } else if (bData.revenue === aData.revenue) {
            if (bData.conversions > aData.conversions) {
                winner = 'B';
            } else if (bData.conversions === aData.conversions && bData.views > aData.views) {
                winner = 'B';
            }
        }

        console.log(`   🏆 WINNER: Variation ${winner}!`);

        const payloadA = {
            title: route.title, description: route.description, keywords: route.keywords, 
            answer_capsule: route.answer_capsule, schema: route.json_payload
        };
        const payloadB = {
            title: route.title_b, description: route.description_b, keywords: route.keywords_b, 
            answer_capsule: route.answer_capsule_b, schema: route.json_payload_b
        };

        const winningPayload = winner === 'A' ? payloadA : payloadB;
        const losingPayload = winner === 'A' ? payloadB : payloadA;

        console.log(`   🤖 Asking Local AI to summarize and generate Challenger...`);
        let aiResult;
        try {
            aiResult = await generateNextIteration(winningPayload, losingPayload);
        } catch (err) {
            console.error(`   ❌ AI generation failed: ${err.message}`);
            continue;
        }

        console.log(`   ✅ AI Rationale: "${aiResult.ai_rationale}"`);

        // Update active database row
        const updatePayload = {
            title: winningPayload.title,
            description: winningPayload.description,
            keywords: winningPayload.keywords,
            answer_capsule: winningPayload.answer_capsule,
            json_payload: winningPayload.schema,
            title_b: aiResult.title,
            description_b: aiResult.description,
            keywords_b: aiResult.keywords,
            answer_capsule_b: aiResult.answer_capsule,
            json_payload_b: aiResult.schema,
            last_analyzed_at: new Date().toISOString()
        };

        await supabase.from('seo_discoverability')
            .update(updatePayload)
            .eq('id', route.id);

        // Log to telemetry
        await supabase.from('ai_optimization_log')
            .insert([{
                route: route.route,
                previous_json_payload: losingPayload.schema || {},
                new_json_payload: aiResult.schema || {},
                ai_rationale: aiResult.ai_rationale
            }]);

        console.log(`   💾 Database updated. Challenger loaded into Variation B slot.`);
    }

    console.log("\n🏁 Analysis Loop Complete.");
}

runAnalysis();
