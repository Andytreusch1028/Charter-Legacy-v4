/**
 * TinyFish Headless CLI / Server util
 * Reusable utility to trigger the TinyFish.ai Web Agent from Node.js or Deno backend environments.
 * 
 * Usage:
 * node tinyfish-runner.js "https://sunbiz.org" "Form an LLC named Test LLC..."
 */
import fetch from 'node-fetch';

const TINYFISH_ENDPOINT = 'https://agent.tinyfish.ai/v1/automation/run-sse';

export async function runTinyFishAutomation(url, goal, apiKey) {
    if (!apiKey) {
        throw new Error("TinyFish API key is required.");
    }

    console.log(`[TinyFish] Initiating Protocol...`);
    console.log(`[TinyFish] Target: ${url}`);
    
    try {
        const response = await fetch(TINYFISH_ENDPOINT, {
            method: 'POST',
            headers: {
                'X-API-Key': apiKey,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ url, goal })
        });

        if (!response.ok) {
            const err = await response.text();
            throw new Error(`TinyFish API Error (${response.status}): ${err}`);
        }

        // Handle SSE Stream manually if you need to print logs
        const stream = response.body;
        stream.on('data', chunk => {
            const lines = chunk.toString().split('\n');
            for (const line of lines) {
                if (line.trim().startsWith('data: ')) {
                    try {
                        const eventData = JSON.parse(line.replace('data: ', ''));
                        console.log(`[${eventData.event.toUpperCase()}]`, eventData.message || JSON.stringify(eventData.payload));
                    } catch (e) {
                         // unparsed
                    }
                }
            }
        });

        return new Promise((resolve, reject) => {
            stream.on('end', () => resolve({ success: true }));
            stream.on('error', (err) => reject(err));
        });

    } catch (err) {
        console.error('[TinyFish] Fatal Error:', err);
        throw err;
    }
}

// CLI Execution Support
if (process.argv[1] && process.argv[1].includes('tinyfish-runner.js')) {
    const url = process.argv[2];
    const goal = process.argv[3];
    const key = process.env.TINYFISH_API_KEY || 'sk-tinyfish-_900RKNoZIA38xSHqFNhUl957VIGUMXw';
    
    if (!url || !goal) {
        console.error("Usage: node tinyfish-runner.js <url> <goal>");
        process.exit(1);
    }
    
    runTinyFishAutomation(url, goal, key)
        .then(() => console.log('Done.'))
        .catch(e => console.error(e));
}
