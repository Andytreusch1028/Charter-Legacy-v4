/**
 * SUCCESSION REGISTRY
 * 
 * A standalone, framework-agnostic registry for managing the state of the 
 * Succession Suite (Heritage Vault). This acts as the "Engine" 
 * decoupled from the React render cycle.
 */

let state = {
    isOpen: false,
    isUnlocked: false,
    activeProtocol: null, // 'will', 'trust'
    lastAudit: null,
    accessLog: [] // Reactive log of vault interactions
};

const listeners = new Set();

const notify = () => listeners.forEach(listener => listener(state));

export const SuccessionRegistry = {
    getState: () => ({ ...state }),

    subscribe: (listener) => {
        listeners.add(listener);
        return () => listeners.delete(listener);
    },

    open: () => {
        state.isOpen = true;
        state.lastAudit = new Date().toISOString();
        state.accessLog = [{ action: 'VAULT_OPENED', time: state.lastAudit }, ...state.accessLog];
        notify();
    },

    close: () => {
        state.isOpen = false;
        state.isUnlocked = false; // Auto-lock on close for security
        state.accessLog = [{ action: 'VAULT_CLOSED', time: new Date().toISOString() }, ...state.accessLog];
        notify();
    },

    setUnlocked: (status) => {
        state.isUnlocked = status;
        state.accessLog = [{ action: status ? 'MANUAL_UNLOCK' : 'MANUAL_LOCK', time: new Date().toISOString() }, ...state.accessLog];
        notify();
    },

    setProtocol: (protocol) => {
        state.activeProtocol = protocol;
        state.accessLog = [{ action: 'PROTOCOL_SET', details: protocol, time: new Date().toISOString() }, ...state.accessLog];
        notify();
    },

    /**
     * PIN VALIDATION
     * In production, this would be a cryptographic check or an API call.
     */
    validatePIN: (pin) => {
        const MOCK_PIN = '1234';
        if (pin === MOCK_PIN) {
            state.isUnlocked = true;
            state.lastAudit = new Date().toISOString();
            state.accessLog = [{ action: 'PIN_VERIFIED', time: state.lastAudit }, ...state.accessLog];
            notify();
            return true;
        }
        state.accessLog = [{ action: 'PIN_DENIED', time: new Date().toISOString() }, ...state.accessLog];
        notify();
        return false;
    },

    /**
     * LOCALHOST BYPASS
     * Strictly for agent verification and dev mode.
     */
    provisionBypass: () => {
        if (window.location.hostname === 'localhost') {
            console.log("Legacy Registry: Provisioning Localhost Bypass");
            state.isUnlocked = true;
            state.isOpen = true;
            state.lastAudit = new Date().toISOString();
            notify();
            return true;
        }
        return false;
    }
};

// Global accessor for Agent Console / External Scripts on Localhost
if (window.location.hostname === 'localhost') {
    window.__antigravity_legacy_engine = SuccessionRegistry;
}
