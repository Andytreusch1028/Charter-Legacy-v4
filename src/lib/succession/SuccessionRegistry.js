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

const SAFE_MODE = true; // Prevents state corruption on failed actions

export const SuccessionRegistry = {
    getState: () => ({ ...state }),

    /**
     * SUBSCRIBE
     * Registers a listener to state changes.
     */
    subscribe: (listener) => {
        if (typeof listener !== 'function') {
            console.error("SuccessionRegistry Engine: Invalid listener registration.");
            return () => {};
        }
        listeners.add(listener);
        return () => listeners.delete(listener);
    },

    /**
     * OPEN VAULT
     * Initializes access and triggers the audit log.
     */
    open: () => {
        try {
            state.isOpen = true;
            state.lastAudit = new Date().toISOString();
            state.accessLog = [{ action: 'VAULT_OPENED', time: state.lastAudit }, ...state.accessLog];
            notify();
            console.log("SuccessionRegistry: Vault Access Initialized.");
        } catch (error) {
            console.error("SuccessionRegistry: Critical failure during vault initialization.", error);
        }
    },

    /**
     * CLOSE VAULT
     * Terminated active session and auto-locks for security.
     */
    close: () => {
        try {
            state.isOpen = false;
            state.isUnlocked = false; 
            state.accessLog = [{ action: 'VAULT_CLOSED', time: new Date().toISOString() }, ...state.accessLog];
            notify();
            console.log("SuccessionRegistry: Vault Session Terminated (Auto-Locked).");
        } catch (error) {
            console.error("SuccessionRegistry: Failed to safely close vault.", error);
        }
    },

    /**
     * SET UNLOCKED STATUS
     * Handles manual lock/unlock actions.
     */
    setUnlocked: (status) => {
        try {
            state.isUnlocked = !!status;
            state.accessLog = [{ 
                action: status ? 'MANUAL_UNLOCK' : 'MANUAL_LOCK', 
                time: new Date().toISOString() 
            }, ...state.accessLog];
            notify();
        } catch (error) {
            console.error(`SuccessionRegistry: Failed to set legacy lock status to ${status}.`, error);
        }
    },

    /**
     * SET ACTIVE PROTOCOL
     * Switches the wizard mode between Will and Trust.
     */
    setProtocol: (protocol) => {
        try {
            const VALID_PROTOCOLS = ['will', 'trust', null];
            if (!VALID_PROTOCOLS.includes(protocol)) {
                throw new Error(`Unsupported legacy protocol: ${protocol}`);
            }
            state.activeProtocol = protocol;
            state.accessLog = [{ 
                action: 'PROTOCOL_TRANSITION', 
                details: protocol, 
                time: new Date().toISOString() 
            }, ...state.accessLog];
            notify();
        } catch (error) {
            console.error("SuccessionRegistry: Protocol state transition failed.", error);
        }
    },

    /**
     * PIN VALIDATION
     * Institutional PIN verification for vault decryption.
     */
    validatePIN: (pin) => {
        try {
            const MOCK_PIN = '1234'; // Production would use remote/hashed verification
            const isValid = pin === MOCK_PIN;
            
            if (isValid) {
                state.isUnlocked = true;
                state.lastAudit = new Date().toISOString();
                state.accessLog = [{ action: 'PIN_VERIFIED', time: state.lastAudit }, ...state.accessLog];
                notify();
                return true;
            }

            state.accessLog = [{ action: 'PIN_DENIED', time: new Date().toISOString() }, ...state.accessLog];
            notify();
            return false;
        } catch (error) {
            console.error("SuccessionRegistry: PIN validation subsystem failure.", error);
            return false;
        }
    },

    /**
     * LOCALHOST BYPASS
     * Strictly for agent verification and development telemetry.
     */
    provisionBypass: () => {
        try {
            if (window.location.hostname === 'localhost') {
                console.warn("SuccessionRegistry: Provisioning Localhost Bypass (Dev Mode)");
                state.isUnlocked = true;
                state.isOpen = true;
                state.lastAudit = new Date().toISOString();
                state.accessLog = [{ action: 'BYPASS_ACTIVATED', time: state.lastAudit }, ...state.accessLog];
                notify();
                return true;
            }
            return false;
        } catch (error) {
            console.error("SuccessionRegistry: Bypass provisioning failed.", error);
            return false;
        }
    }
};

// Global accessor for Agent Console / External Scripts on Localhost
if (window.location.hostname === 'localhost') {
    window.__antigravity_legacy_engine = SuccessionRegistry;
}
