// Supabase Configuration
// Replace these with your actual Supabase project values

// PBP Reference: @ANTIGRAVITY.config_root
// PBP Reference: @IDENTITY.upl_mode ("STRICT_NON_DISCRETIONARY")
// Compliance: All keys must match .antigravity/permissions.yaml rules

const CONFIG = {
    // Identity Pulse (PBP @STYLE.white_charter.authentication)
    SUPABASE_URL: window.env?.SUPABASE_URL || 'YOUR_SUPABASE_URL',
    SUPABASE_ANON_KEY: window.env?.SUPABASE_ANON_KEY || 'YOUR_ANON_KEY',
    
    // VERIFICATION: Mock Mode for UI Testing (PBP @TESTING)
    MOCK_MODE: true, 
    
    // Feature Flags (PBP @PRODUCTS)
    FEATURES: {
        LEGACY_TIMER: true,       // PBP: @PRODUCTS.succession_soul.premium_bundle.dead_mans_switch
        FLORIDA_HUB: true,        // PBP: @DATA.Entity.privacy.default_hub
        BOARD_MONITOR: true       // PBP: @PRODUCTS.medical_pllc.premium_bundle.board_license_monitor
    },
    
    // Statutory Constraints (PBP @IDENTITY.statutory_compliance)
    COMPLIANCE: {
        LLC_STATUTE: 'FL-605',
        PLLC_STATUTE: 'FL-621',
        CONTRACTOR_STATUTE: 'FL-489',
        SUCCESSION_STATUTE: 'FL-732'
    }
};

window.CONFIG = CONFIG;

// DO NOT commit real keys to git!
// For production, use environment variables or a .env file

// export default CONFIG; // Removed to prevent SyntaxError in non-module script
