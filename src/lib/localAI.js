import { supabase } from './supabase';

const OLLAMA_URL = 'http://127.0.0.1:11434/api/generate';
const DEFAULT_MODEL = 'llama3'; // Adjust this if the user is running a different model

/**
 * Validates the generated SEO payload against UPL compliance rules.
 * @param {Object} payload The parsed JSON payload from the AI
 * @returns {Object} An object containing { isValid: boolean, error: string }
 */
const validateUPLCompliance = (payload) => {
    const jsonStr = JSON.stringify(payload).toLowerCase();
    
    const restrictedTerms = [
        "bulletproof",
        "guarantee",
        "100%",
        "legal advice",
        "lawyer",
        "attorney", // Be careful, we provide "Attorney-Grade" is bad, but generally "attorney" should be flagged unless referencing outside counsel
        "attorney-grade",
        "immune",
        "immunity"
    ];

    for (let term of restrictedTerms) {
        if (jsonStr.includes(term)) {
            return {
                isValid: false,
                error: `UPL Violation: The AI hallucinated a restricted term: "${term}". Please try generating again.`
            };
        }
    }

    return { isValid: true };
};

export const generateSEOMetadata = async (routeName) => {
    const prompt = `
You are an expert SEO and AI Agent Optimization Strategist working for Charter Legacy, a Florida business formation and asset protection technology platform.
Charter Legacy acts as a "scrivener" (technology service), NOT a law firm.

Your task is to generate highly optimized metadata for the following routing path: "${routeName}".

CRITICAL UPL RULES (Do Not Practice Law):
- You CANNOT use the words: bulletproof, guaranteed, legal advice, lawyer, immune, 100%.
- You MUST use safe phrasing like: "helps secure", "designed for privacy", "statutory shield".

REQUIREMENTS:
1. Generate an "Optimized Page Title" (max 60 characters).
2. Generate an "Optimized Meta Description" (max 160 characters).
3. Generate a comma-separated string of 3-5 "Search Keywords".
4. Generate an "Answer Capsule" (answer_capsule). This MUST be a standalone, definitive explanation of the service exactly 120-150 characters long. It should answer a common question about the route. It MUST NOT contain any links, HTML, bullet points, or lists. It must read like an authoritative dictionary definition.
5. Generate a valid JSON-LD Schema (Structured Data). Ensure the "@context" is "https://schema.org". Incorporate "Product" and "Offer" types alongside "WebPage" providing detailed Agentic Commerce data (descriptions, pricing if applicable) to fulfill Universal Commerce Protocol requirements.

OUTPUT FORMAT:
You MUST return ONLY a raw JSON object. Do not include any markdown formatting, backticks, or conversational text. The keys must be EXACTLY: "title", "description", "keywords", "answer_capsule", and "schema".

Example Output structure:
{
  "title": "Example Title | Charter Legacy",
  "description": "Example description...",
  "keywords": "keyword1, keyword2",
  "answer_capsule": "An LLC is a business structure that protects personal assets from business liabilities while offering pass-through taxation.",
  "schema": {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "...",
    "description": "..."
  }
}
`;

    try {
        const response = await fetch(OLLAMA_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: DEFAULT_MODEL,
                prompt: prompt,
                stream: false
            })
        });

        if (!response.ok) {
             throw new Error("Local AI (Ollama) is not running or unreachable on port 11434.");
        }

        const data = await response.json();
        const rawResponse = data.response;
        
        // Strip out any potential markdown blocks the LLM might hallucinate
        const jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
             throw new Error("AI returned a non-JSON response. Please try generating again.");
        }
        
        const parsedPayload = JSON.parse(jsonMatch[0]);

        // Run Local UPL Grounding Check
        const uplCheck = validateUPLCompliance(parsedPayload);
        if (!uplCheck.isValid) {
            throw new Error(uplCheck.error);
        }

        return parsedPayload;

    } catch (error) {
        console.error("Local AI Error:", error);
        throw error; // Rethrow to be handled by the UI
    }
};

export const generateHeroVariants = async (analyticsData) => {
    const prompt = `
You are a Senior Conversion Rate Optimizer (CRO) and Brand Strategist for Charter Legacy (a Florida business formation service).
Analyze the following active A/B testing analytics:
${JSON.stringify(analyticsData, null, 2)}

Identify which emotional hooks (Privacy, Ease of Use, or Legacy) are resonating.

REQUIREMENTS:
1. Propose 2 entirely new 'Challenger' Hero Titles and Subheadings.
2. Ensure they are distinctly different from the current active variants.
3. CRITICAL UPL RULES: Do NOT use the words bulletproof, guaranteed, legal advice, lawyer, immune, 100%. Use administrative terminology only. Maintain a premium, authoritative tone.
4. METRIC GRADING: You must scientifically evaluate and grade your proposed variant on a scale of 0 to 100 for the following 4 heuristics:
   - metric_value: How strong the core offer and underlying value proposition is.
   - metric_score: The estimated overall conversion likelihood.
   - metric_usability: The readability, clarity, and UX friction of the message.
   - metric_draw: The emotional magnetic pull and hook factor.

OUTPUT FORMAT:
You MUST return ONLY a raw JSON array containing exactly 2 objects. Do not include any conversational text or markdown blocks like \`\`\`json.
Each object must have the exact keys: "headline", "subheading", "target_sentiment", "metric_value", "metric_score", "metric_usability", and "metric_draw".

Example Output:
[
  {
    "headline": "A New Example Headline",
    "subheading": "An example sub down here that explains it clearly without practicing law.",
    "target_sentiment": "Efficiency",
    "metric_value": 85,
    "metric_score": 92,
    "metric_usability": 98,
    "metric_draw": 76
  },
  {
    "headline": "Secure Your Future Instantly",
    "subheading": "Bypass the bureaucracy. We handle your Florida filing securely.",
    "target_sentiment": "Peace of Mind",
    "metric_value": 90,
    "metric_score": 88,
    "metric_usability": 95,
    "metric_draw": 91
  }
]
`;

    try {
        const response = await fetch(OLLAMA_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: DEFAULT_MODEL,
                prompt: prompt,
                stream: false
            })
        });

        if (!response.ok) throw new Error("Local AI (Ollama) is unreachable.");

        const data = await response.json();
        const rawResponse = data.response;
        
        const jsonMatch = rawResponse.match(/\[[\s\S]*\]/);
        if (!jsonMatch) throw new Error("AI returned a non-JSON array response. Please try again.");
        
        let variants = JSON.parse(jsonMatch[0]);

        // Run Local UPL Grounding Check
        variants.forEach(v => {
            const uplCheck = validateUPLCompliance(v);
            if (!uplCheck.isValid) throw new Error(uplCheck.error);
        });

        return variants;

    } catch (error) {
        console.error("Local AI Hero Variant Error:", error);
        throw error;
    }
};

export const generateGrowthAnalysis = async (activeVariants) => {
    const prompt = `
You are a fractional Chief Marketing Officer (CMO) and Data Scientist for Charter Legacy (a Florida business formation service).
Analyze the following Active A/B testing variants and their current 0-100 metric grades (Value, Score, Usability, Draw).

ACTIVE VARIANTS DATA:
${JSON.stringify(activeVariants, null, 2)}

REQUIREMENTS:
1. Synthesize this data to identify which overarching emotional hooks or message structures are performing the strongest based on their metrics.
2. Provide 3 highly insightful, actionable analytical points.
3. The first point should be an observation on the current data spread.
4. The second point should be a strategic recommendation for the next batch of variants.
5. The third point should be a long-term branding or positioning forecast.
6. CRITICAL UPL RULES: Do NOT use the words bulletproof, guaranteed, legal advice, lawyer, immune, 100%. Use administrative terminology only. Maintain a premium, authoritative tone.

OUTPUT FORMAT:
You MUST return ONLY a raw JSON array containing exactly 3 objects. Do not include any conversational text or markdown blocks like \`\`\`json.
Each object must have the exact keys: "type" (must be "observation", "strategy", or "forecast"), "title" (a short 3-5 word banner), and "content" (a 2-3 sentence deep-dive analysis).

Example Output:
[
  {
    "type": "observation",
    "title": "Efficiency Hooks Dominate",
    "content": "Variants focused on speed and bypassed bureaucracy are over-indexing in the 'Draw' metric, suggesting users are highly motivated by time-saving propositions over pure legacy."
  },
  {
    "type": "strategy",
    "title": "Double Down on Speed",
    "content": "For the next iteration, maintain the administrative tone but aggressively target the concept of 'instant secure filing'. Push the 'Usability' metric higher by simplifying the subheading further."
  },
  {
    "type": "forecast",
    "title": "Transitioning to Peace of Mind",
    "content": "As foundational volume increases, we predict a shift towards 'Peace of Mind' as the primary conversion driver. Begin seeding subtle security and privacy cues into the hero section."
  }
]
`;

    try {
        const response = await fetch(OLLAMA_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: DEFAULT_MODEL,
                prompt: prompt,
                stream: false
            })
        });

        if (!response.ok) throw new Error("Local AI (Ollama) is unreachable.");

        const data = await response.json();
        const rawResponse = data.response;
        
        // Strip out any potential markdown blocks the LLM might hallucinate
        const jsonMatch = rawResponse.match(/\[[\s\S]*\]/);
        if (!jsonMatch) throw new Error("AI returned a non-JSON array response. Please try generating again.");
        
        const parsedPayload = JSON.parse(jsonMatch[0]);

        // Run Local UPL Grounding Check
        parsedPayload.forEach(insight => {
            const uplCheck = validateUPLCompliance(insight);
            if (!uplCheck.isValid) throw new Error("Insight failed UPL Check: " + uplCheck.error);
        });

        return parsedPayload;

    } catch (error) {
        console.error("Local AI Analysis Error:", error);
        throw error;
    }
};