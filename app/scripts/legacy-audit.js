/**
 * Charter Legacy: Audit Ledger (Idempotent)
 */
if (!window.LegacyAudit) {
    const LegacyAudit = {
        _logs: [
            { id: 'log_001', type: 'SYSTEM', action: 'INIT_PROTOCOL', desc: 'Cryptographic Shards Generated', timestamp: new Date(Date.now() - 86400000).toISOString(), user: 'OWNER' },
            { id: 'log_002', type: 'SECURITY', action: 'VAULT_SEAL', desc: 'Vault Sealed with Shard A', timestamp: new Date(Date.now() - 86350000).toISOString(), user: 'SYSTEM' },
        ],

        // Add a new entry
        logAction: function(type, action, description, user) {
            const entry = {
                id: 'log_' + Date.now().toString(36),
                type: type, // SYSTEM, SECURITY, ACCESS, EDIT
                action: action,
                desc: description,
                timestamp: new Date().toISOString(),
                user: user || 'CURRENT_USER'
            };
            this._logs.unshift(entry);
            console.log(`[AUDIT] ${type}: ${description}`);
            return entry;
        },

        // Get all logs
        getLogs: function() {
            return this._logs;
        },

        // Verify Integrity (Mock)
        verifyLedger: function() {
            return true; // In prod, check hash chain
        }
    };

    window.LegacyAudit = LegacyAudit;
    console.log("Legacy Audit Ledger: Online");
} else {
    console.log("Legacy Audit Ledger: Already Online (Skipped Re-init)");
}
