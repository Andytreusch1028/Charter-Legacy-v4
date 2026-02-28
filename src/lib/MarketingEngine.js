/**
 * MarketingEngine Interface
 * Acts as the "Lead Dramaturg" for Charter Legacy.
 * Connects directly to the Gemini API for copy generation and
 * provides a webhook handler for dashboard publishing.
 */
export class MarketingEngine {
  constructor(geminiApiKey, publishWebhookUrl) {
    this.geminiApiKey = geminiApiKey;
    this.publishWebhookUrl = publishWebhookUrl;

    this.dramaturgPrompt = `
Role: You are the Lead Dramaturg and Marketing Strategist for Charter Legacy. Your creator is a playwright and developer in his late 60s who values depth, history, and the theatricality of human stories.

Task: Convert raw application data into a compelling narrative for social media.

Voice Guidelines:
- Avoid Clichés: Never use words like "Revolutionary," "Game-changer," "Hustle," or "Unlock your potential."
- Theatrical Tone: Use a voice that is reflective, sophisticated, and observant. Think of the tone of a stage direction or a poignant monologue—grounded but elevated.
- Focus on Continuity: Focus on the "Arc of a Life." Treat the user’s milestones not as "tasks completed," but as "chapters archived."
- Rhythm: Vary sentence length. Use the "Rule of Three" for impact.

STRICT UPL AND PRIVACY MANDATES:
- UPL COMPLIANCE: We are a scrivener/technology service, NOT a law firm. You MUST NEVER use the words "Protect," "Guarantee," "Legal Advice," "Consultation," "Attorney-Grade," or "Contract."
- INSTEAD of "Protect," use "Safeguard," "Secure," "Privacy," or "Help secure."
- INSTEAD of "Contract," use "Template," "Form," or "Standard Document."
- WE DO NOT draft documents. We generate output using standard forms.
- PRIVACY SHIELD: You MUST NEVER output the user's actual name, their company's specific name, or their precise local address. Only use generic descriptions (e.g., "A founder in Miami..."). Redact or omit PII from any generated copy.

Logic for Post Structure:
- The Hook: A quiet observation about time, memory, or legacy.
- The Event: A specific, humble mention of what happened in the Charter Legacy app.
- The Invitation: A thoughtful question to the reader rather than a loud "Call to Action."

Return your response strictly as a JSON object with two keys:
1. "headline": A short, poignant title or hook.
2. "body": The main narrative structured as requested.
`;
  }


  /**
   * Generates sophisticated marketing copy from raw milestone data.
   * @param {Object} data - The raw event data (e.g. { event: "LLC Formed", industry: "Real Estate", ... })
   * @returns {Promise<{headline: string, body: string}>} - Structured JSON copy.
   */
  async generatePost(data) {
    try {
      if (!this.geminiApiKey) {
        throw new Error("MarketingEngine error: Gemini API Key is missing.");
      }

      const payload = {
        contents: [
          {
            parts: [
              { text: this.dramaturgPrompt },
              { text: `\nHere is the raw data milestone to translate:\n${JSON.stringify(data, null, 2)}` }
            ]
          }
        ],
        generationConfig: {
            temperature: 0.7,
            response_mime_type: "application/json"
        }
      };

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${this.geminiApiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const err = await response.text();
        throw new Error(`Gemini API Error: ${err}`);
      }

      const result = await response.json();
      const rawText = result?.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!rawText) {
          throw new Error("No content generated from Gemini API.");
      }

      // Automatically parsable due to response_mime_type
      return JSON.parse(rawText);

    } catch (error) {
      console.error("MarketingEngine (Lead Dramaturg) generatePost error:", error);
      throw error;
    }
  }

  /**
   * Webhook handler that pushes approved copy to an external publishing service (e.g. Zapier, Make, custom backend).
   * Formatted to trigger when clicking "Publish" within the Charter Legacy dashboard.
   * 
   * @param {string} queueRecordId - The DB ID of the marketing_queue row
   * @param {string} approvedCopy - The final edited text to be published
   * @param {string} platform - "linkedin", "x", "newsletter", etc.
   * @returns {Promise<Object>} - The response from the target webhook
   */
  async publishToWebhook(queueRecordId, approvedCopy, platform) {
    try {
      if (!this.publishWebhookUrl) {
         throw new Error("Publishing Webhook URL is missing in the MarketingEngine configuration.");
      }

      console.log(`[MarketingEngine] 📡 Pushing approved copy to webhook for [${platform}]...`);

      const response = await fetch(this.publishWebhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${import.meta.env ? import.meta.env.VITE_WEBHOOK_SECRET : 'secret'}` 
        },
        body: JSON.stringify({
          queueRecordId,
          content: approvedCopy,
          targetPlatform: platform,
          publishedAt: new Date().toISOString()
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to fire publishing webhook. Status Code: ${response.status}`);
      }

      const data = await response.json();
      console.log("[MarketingEngine] ✅ Webhook handled broadcast with success:", data);
      return data;
      
    } catch (error) {
      console.error("[MarketingEngine] publishToWebhook error:", error);
      throw error;
    }
  }
}
