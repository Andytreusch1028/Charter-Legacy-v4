/**
 * TinyFish Automation Bridge
 * Standardized utility for high-fidelity web agent orchestration.
 * 
 * Target: https://agent.tinyfish.ai/v1/automation/run-sse
 */

const TINYFISH_ENDPOINT = 'https://agent.tinyfish.ai/v1/automation/run-sse';

export const tinyfish = {
    /**
     * Executes a natural language goal on a target URL using the TinyFish Web Agent.
     * 
     * @param {Object} options 
     * @param {string} options.url - The target URL to start the automation on.
     * @param {string} options.goal - The natural language goal (e.g., "File articles of organization...").
     * @param {string} options.apiKey - TinyFish API Key.
     * @param {Function} options.onEvent - Callback for SSE events (data: { event, message, payload }).
     * @param {Function} options.onError - Callback for fatal communication errors.
     * @param {AbortController} options.controller - Optional AbortController for cancellation.
     */
    run: async ({ url, goal, apiKey, onEvent, onError, controller }) => {
        if (!apiKey) {
            console.error('[TinyFish] Missing API Key');
            onError?.(new Error('TinyFish API Key required.'));
            return;
        }

        try {
            const response = await fetch(TINYFISH_ENDPOINT, {
                method: 'POST',
                headers: {
                    'X-API-Key': apiKey,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ url, goal }),
                signal: controller?.signal
            });

            if (!response.ok) {
                const errorBody = await response.text();
                throw new Error(`TinyFish API Error: ${response.status} - ${errorBody}`);
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                // Decode and add to buffer
                buffer += decoder.decode(value, { stream: true });

                // Process lines in buffer
                const lines = buffer.split('\n');
                buffer = lines.pop(); // Keep incomplete line in buffer

                for (const line of lines) {
                    const trimmed = line.trim();
                    if (trimmed.startsWith('data: ')) {
                        try {
                            const eventData = JSON.parse(trimmed.slice(6));
                            onEvent?.(eventData);
                        } catch (parseErr) {
                            console.warn('[TinyFish] Failed to parse SSE line:', trimmed, parseErr);
                        }
                    }
                }
            }
            
            // Final signal of completion
            onEvent?.({ event: 'completed', message: 'Automation stream finished.' });

        } catch (err) {
            if (err.name === 'AbortError') {
                console.log('[TinyFish] Automation cancelled by operator.');
                onEvent?.({ event: 'cancelled', message: 'Operator terminated the protocol.' });
            } else {
                console.error('[TinyFish] Fatal Stream Failure:', err);
                onError?.(err);
            }
        }
    }
};

export default tinyfish;
