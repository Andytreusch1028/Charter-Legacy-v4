import fs from 'fs';
import path from 'path';

/**
 * CodeGenerator — Gemini-powered autonomous code generation for the Axonix Agent.
 * 
 * Uses the Gemini API to analyze tasks, generate code changes,
 * and produce diffs that can be applied to the codebase.
 */
class CodeGenerator {
    constructor(apiKey, repoPath) {
        this.apiKey = apiKey;
        this.repoPath = repoPath;
        this.model = 'gemini-2.0-flash';
        this.apiBase = 'https://generativelanguage.googleapis.com/v1beta';
    }

    /**
     * Generate code for a task using Gemini
     */
    async generateForTask(task) {
        // 1. Gather project context
        const context = await this.gatherContext();
        
        // 2. Build the prompt
        const prompt = this.buildPrompt(task, context);
        
        // 3. Call Gemini API
        const response = await this.callGemini(prompt);
        
        // 4. Parse the response into actionable file changes
        const changes = this.parseChanges(response);
        
        return changes;
    }

    /**
     * Gather relevant project context for Gemini
     */
    async gatherContext() {
        const context = {
            projectConfig: '',
            structure: '',
            designSystem: ''
        };

        // Read project config
        try {
            const configPath = path.join(this.repoPath, '.antigravity.json');
            context.projectConfig = fs.readFileSync(configPath, 'utf-8');
        } catch { /* no config */ }

        // Read key source files for context
        const keyFiles = [
            'src/App.jsx',
            'package.json',
            'src/StaffConsole.jsx'
        ];

        context.structure = keyFiles.map(f => {
            try {
                const filePath = path.join(this.repoPath, f);
                const content = fs.readFileSync(filePath, 'utf-8');
                // Only include first 100 lines to save tokens
                const preview = content.split('\n').slice(0, 100).join('\n');
                return `--- ${f} ---\n${preview}`;
            } catch { return ''; }
        }).filter(Boolean).join('\n\n');

        return context;
    }

    /**
     * Build the prompt for Gemini
     */
    buildPrompt(task, context) {
        return `You are the Axonix Agent, an autonomous developer for the CharterLegacy application.
Your job is to implement the following task by generating the necessary code changes.

## TASK
Description: ${task.description}
Priority: ${task.priority}
Category: ${task.category}

## PROJECT CONTEXT
${context.projectConfig}

## EXISTING CODE STRUCTURE
${context.structure}

## CRITICAL RULES
1. Follow the existing Sector-based architecture pattern
2. ALL user-facing text must be UPL-compliant (no legal advice, use "ministerial" language)
3. Use the existing design system (Obsidian Aesthetic — dark theme, gold accents)
4. Maximum 3 files can be changed per task
5. Include proper imports and exports
6. React with Tailwind CSS

## RESPONSE FORMAT
Respond with ONLY a JSON array of file changes. Each change must have:
- "action": "create" | "modify"
- "filePath": relative path from project root
- "content": full file content (for create) or the modified content (for modify)
- "description": what this file does

Example:
\`\`\`json
[
  {
    "action": "create",
    "filePath": "src/components/MyComponent.jsx",
    "content": "import React from 'react';\\nexport default function MyComponent() { ... }",
    "description": "New component for feature X"
  }
]
\`\`\`

Generate the code now. Return ONLY the JSON array, no other text.`;
    }

    /**
     * Call the Gemini API
     */
    async callGemini(prompt) {
        const url = `${this.apiBase}/models/${this.model}:generateContent?key=${this.apiKey}`;
        
        const body = {
            contents: [{
                parts: [{ text: prompt }]
            }],
            generationConfig: {
                temperature: 0.3,
                maxOutputTokens: 8192,
                responseMimeType: 'text/plain'
            }
        };

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Gemini API error (${response.status}): ${error}`);
        }

        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        
        if (!text) {
            throw new Error('Gemini returned empty response');
        }

        return text;
    }

    /**
     * Parse Gemini's response into structured file changes
     */
    parseChanges(response) {
        try {
            // Extract JSON from response (handle markdown code blocks)
            let json = response;
            const jsonMatch = response.match(/```(?:json)?\s*([\s\S]*?)```/);
            if (jsonMatch) {
                json = jsonMatch[1].trim();
            }

            const changes = JSON.parse(json);
            
            if (!Array.isArray(changes)) {
                throw new Error('Response is not an array');
            }

            // Validate each change
            return changes.filter(change => {
                return change.action && change.filePath && change.content;
            }).map(change => ({
                action: change.action,
                filePath: change.filePath,
                content: change.content,
                description: change.description || 'No description'
            }));

        } catch (err) {
            throw new Error(`Failed to parse Gemini response: ${err.message}`);
        }
    }

    /**
     * Apply changes to the filesystem
     */
    applyChanges(changes) {
        const applied = [];

        for (const change of changes) {
            const fullPath = path.join(this.repoPath, change.filePath);
            const dir = path.dirname(fullPath);

            // Create directories if needed
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }

            // Write the file
            fs.writeFileSync(fullPath, change.content, 'utf-8');
            applied.push(change.filePath);
        }

        return applied;
    }

    /**
     * Format changes for Telegram display
     */
    formatChangesForTelegram(changes) {
        if (!changes || changes.length === 0) return '❓ No changes generated';
        
        return changes.map(c => {
            const icon = c.action === 'create' ? '🆕' : '✏️';
            return `${icon} \`${c.filePath}\`\n   ${c.description}`;
        }).join('\n');
    }
}

export default CodeGenerator;
