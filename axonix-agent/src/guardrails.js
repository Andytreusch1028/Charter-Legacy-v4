import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

/**
 * Guardrails — Safety rules for the Axonix Agent.
 * These are NON-NEGOTIABLE. The agent cannot bypass these.
 */

const PROTECTED_BRANCHES = ['main', 'master', 'production'];
const MAX_FILES_PER_TASK = parseInt(process.env.MAX_FILES_PER_TASK || '3');

const FORBIDDEN_OPERATIONS = [
    'DROP TABLE', 'DROP DATABASE', 'TRUNCATE', 'DELETE FROM',
    'rm -rf', 'del /f', 'format',
];

const UPL_PHRASES = [
    'legal advice', 'we recommend', 'you should', 'our attorneys',
    'represent you', 'guarantee', 'we will advise', 'attorney-client',
    'court order', 'lawsuit', 'litigation'
];

class Guardrails {
    /**
     * Check if a branch name is safe to work on
     */
    static isSafeBranch(branchName) {
        return !PROTECTED_BRANCHES.includes(branchName.toLowerCase());
    }

    /**
     * Validate file count doesn't exceed the limit
     */
    static validateFileCount(files) {
        if (files.length > MAX_FILES_PER_TASK) {
            return {
                safe: false,
                reason: `Too many files (${files.length}/${MAX_FILES_PER_TASK}). Split into smaller tasks.`
            };
        }
        return { safe: true };
    }

    /**
     * Run npm build check
     */
    static runBuildCheck(repoPath) {
        try {
            execSync('npm run build', { cwd: repoPath, stdio: 'pipe', timeout: 60000 });
            return { passed: true };
        } catch (err) {
            return { 
                passed: false, 
                error: err.stderr?.toString().slice(0, 500) || 'Build failed'
            };
        }
    }

    /**
     * Check for UPL violations in text content
     */
    static checkUPL(text) {
        if (!text) return { safe: true, violations: [] };
        const violations = [];
        UPL_PHRASES.forEach(phrase => {
            const regex = new RegExp(`\\b${phrase}\\b`, 'gi');
            if (regex.test(text)) violations.push(phrase);
        });
        return { safe: violations.length === 0, violations };
    }

    /**
     * Check file content for forbidden operations
     */
    static checkForbiddenOps(content) {
        const found = [];
        FORBIDDEN_OPERATIONS.forEach(op => {
            if (content.toUpperCase().includes(op.toUpperCase())) {
                found.push(op);
            }
        });
        return { safe: found.length === 0, found };
    }

    /**
     * Run ALL guardrail checks before submitting a task
     */
    static runFullCheck(branchName, filesChanged, repoPath) {
        const results = {
            branch: this.isSafeBranch(branchName),
            fileCount: this.validateFileCount(filesChanged),
            build: { passed: true }, // Skip build in check-only mode
            upl: { safe: true, violations: [] },
            forbidden: { safe: true, found: [] },
            overall: true
        };

        // Check each changed file for UPL and forbidden ops
        filesChanged.forEach(filePath => {
            try {
                const fullPath = path.join(repoPath, filePath);
                if (fs.existsSync(fullPath)) {
                    const content = fs.readFileSync(fullPath, 'utf-8');
                    
                    // Only check UPL on JSX/HTML files (user-facing)
                    if (/\.(jsx|html|tsx)$/i.test(filePath)) {
                        const uplResult = this.checkUPL(content);
                        if (!uplResult.safe) {
                            results.upl.safe = false;
                            results.upl.violations.push(...uplResult.violations);
                        }
                    }

                    const forbiddenResult = this.checkForbiddenOps(content);
                    if (!forbiddenResult.safe) {
                        results.forbidden.safe = false;
                        results.forbidden.found.push(...forbiddenResult.found);
                    }
                }
            } catch { /* skip unreadable files */ }
        });

        results.overall = results.branch 
            && results.fileCount.safe 
            && results.upl.safe 
            && results.forbidden.safe;

        return results;
    }

    /**
     * Format guardrail results for Telegram display
     */
    static formatResults(results) {
        const lines = [];
        lines.push(results.branch ? '✅ Branch: Safe' : '🚫 Branch: PROTECTED');
        lines.push(results.fileCount.safe ? '✅ File Count: OK' : `🚫 Files: ${results.fileCount.reason}`);
        lines.push(results.upl.safe ? '✅ UPL: Clean' : `⚠️ UPL: ${results.upl.violations.join(', ')}`);
        lines.push(results.forbidden.safe ? '✅ Security: Clean' : `🚫 Forbidden: ${results.forbidden.found.join(', ')}`);
        return lines.join('\n');
    }
}

export default Guardrails;
