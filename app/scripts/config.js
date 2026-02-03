// ZENITH CONFIGURATION
const CONFIG = {
    SUPABASE_URL: window.env?.SUPABASE_URL || 'https://smsqnqfgoheqmynkgpel.supabase.co',
    SUPABASE_ANON_KEY: window.env?.SUPABASE_ANON_KEY || 'sb_publishable_F_VDMnkLAeo5UGKknSvk8Q_FrZ23LTb',
    MOCK_MODE: true, 
    FEATURES: { LEGACY_TIMER: true, FLORIDA_HUB: true, BOARD_MONITOR: true },
    COMPLIANCE: { LLC_STATUTE: 'FL-605', PLLC_STATUTE: 'FL-621', CONTRACTOR_STATUTE: 'FL-489', SUCCESSION_STATUTE: 'FL-732' },
    MOCK_ENTITIES: [
        {
            id: 'mock-med-1',
            llc_name: "Dr. Sterling Vision, PLLC",
            llc_status: "Active",
            product_type: "medical_pllc",
            privacy_shield: true,
            initials: "SV",
            ra_service: true
        },
        {
            id: 'mock-con-1',
            llc_name: "Titan Construction & Engineering",
            llc_status: "Active",
            product_type: "contractor",
            privacy_shield: true,
            initials: "TC",
            ra_service: true
        },
        {
            id: 'mock-2',
            llc_name: "Obsidian Ventures DBA",
            llc_status: "Forming",
            product_type: "standard",
            privacy_shield: true,
            initials: "OV",
            ra_service: true
        },
        {
            id: 'mock-1',
            llc_name: "Charter Legacy LLC",
            llc_status: "Active",
            product_type: "standard",
            privacy_shield: false,
            initials: "CL",
            ra_service: false
        },
        {
            id: 'mock-3',
            llc_name: "Sovereign Holdings Inc",
            llc_status: "Active",
            product_type: "standard",
            privacy_shield: true,
            initials: "SH"
        }
    ]
};
window.CONFIG = CONFIG;
