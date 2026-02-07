/**
 * Vault Transition Helper
 * Provides smooth navigation from dashboard to heir portal
 */

window.VaultTransition = {
    /**
     * Navigate to heir portal with transition
     * @param {string} willId - Optional will ID to pass through
     * @param {string} heirId - Optional heir ID to pass through
     */
    enter: function(willId = null, heirId = null) {
        let url = '/app/vault-transition.html';
        const params = new URLSearchParams();
        
        if (willId) params.append('will_id', willId);
        if (heirId) params.append('heir_id', heirId);
        
        if (params.toString()) {
            url += '?' + params.toString();
        }
        
        window.location.href = url;
    },
    
    /**
     * Direct navigation (skip transition)
     * @param {string} willId - Optional will ID
     * @param {string} heirId - Optional heir ID
     */
    direct: function(willId = null, heirId = null) {
        let url = '/app/heir-portal.html';
        const params = new URLSearchParams();
        
        if (willId) params.append('will_id', willId);
        if (heirId) params.append('heir_id', heirId);
        
        if (params.toString()) {
            url += '?' + params.toString();
        }
        
        window.location.href = url;
    }
};

// Example usage in dashboard:
// <button onclick="VaultTransition.enter('will-001', 'heir-001')">Access Will</button>
