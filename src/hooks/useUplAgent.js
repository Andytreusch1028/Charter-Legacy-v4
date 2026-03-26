import { useState, useCallback } from 'react';

/**
 * useUplAgent
 * Interface for local Ollama-based UPL Compliance checks.
 * Adaptive Rewriting Implementation.
 */
export const useUplAgent = () => {
    const [isChecking, setIsChecking] = useState(false);
    const [error, setError] = useState(null);

    const UPL_DISCLAIMER = "\n\nDISCLAIMER: Charter Legacy provides Registered Agent services only. We are not a law firm and do not provide legal advice. Please consult with a licensed attorney for legal matters.";

    const checkUplCompliance = useCallback(async (staffDraft) => {
        setIsChecking(true);
        setError(null);

        // Fail-Closed Keyword Registry
        const FORBIDDEN_KEYWORDS = [
            /defense/i, /guarantee/i, /shield/i, /protected from/i, /outcome/i,
            /attorney/i, /lawyer/i, /represent/i, /legal advice/i, /lawsuit/i,
            /liability/i, /your rights/i, /i will protect/i
        ];

        // Detection check
        const hasViolation = FORBIDDEN_KEYWORDS.some(regex => regex.test(staffDraft));
        
        const systemPrompt = `You are the Charter Legacy UPL Compliance Officer. 
Your task is to sanitize staff responses to ensure they are 100% ministerial/operational and do not constitute Unauthorized Practice of Law (UPL).

Rules:
1. NEVER provide legal advice or guarantees of legal outcomes.
2. If a staff member says 'I will protect you' or 'I guarantee', change it to 'The system will track' or 'We will monitor'.
3. Use operational terms: 'Entity Health', 'Compliance Pulse', 'Data Masking'.
4. Avoid legal terms: 'Represent', 'Defense', 'Legal Shield', 'Attorney'.
5. Convert 'The IRS will accept this' to 'This conforms to IRS standard submission formats'.

If the draft is non-compliant, REWRITE it into a safe, ministerial version.
Return ONLY the final message content clearly and concisely. No explanations.`;

        const rewritePrompt = hasViolation 
            ? `WARNING: The FOLLOWING DRAFT CONTAINS UPL VIOLATIONS. You MUST REWRITE it to be 100% compliant and ministerial. Remove all guarantees and legal advice.\n\nDraft: "${staffDraft}"`
            : `Draft: "${staffDraft}"`;

        try {
            const response = await fetch('/api/ollama/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: 'llama3:latest',
                    prompt: `${systemPrompt}\n\n${rewritePrompt}`,
                    stream: false,
                    options: { temperature: 0.1 }
                })
            });

            if (!response.ok) throw new Error("Ollama Offline");

            const data = await response.json();
            const sanitizedText = data.response?.trim() || staffDraft;
            
            // Final Safety Check on AI output
            const finalViolation = FORBIDDEN_KEYWORDS.find(regex => regex.test(sanitizedText));
            if (finalViolation) {
                return `[BLOCKED: UPL VIOLATION] Even after auto-correction, the draft contains non-compliant language ("${finalViolation.source}"). Please rewrite manually to be ministerial.`;
            }

            const isRewritten = hasViolation || sanitizedText !== staffDraft;
            const prefix = isRewritten ? "[REWRITTEN: UPL COMPLIANT] " : "";

            return prefix + sanitizedText + UPL_DISCLAIMER;

        } catch (err) {
            console.error("[UPL Agent Error] Local LLM Failure:", err);
            setError(err.message);
            return `[BLOCKED: SYSTEM OFFLINE] UPL Compliance monitor is disconnected. Messages cannot be sent safely.`;
        } finally {
            setIsChecking(false);
        }
    }, []);

    return {
        checkUplCompliance,
        isChecking,
        error,
        UPL_DISCLAIMER
    };
};
