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
            ra_service: true,
            formation_date: "2023-01-15",
            license_expiry: "2026-06-30"
        },
        {
            id: 'mock-con-1',
            llc_name: "Titan Construction & Engineering",
            llc_status: "Active",
            product_type: "contractor",
            privacy_shield: true,
            initials: "TC",
            ra_service: true,
            formation_date: "2022-05-20",
            license_expiry: "2026-08-31"
        },
        {
            id: 'mock-2',
            llc_name: "Obsidian Ventures DBA",
            llc_status: "Forming",
            product_type: "standard",
            privacy_shield: true,
            initials: "OV",
            ra_service: true,
            formation_date: "2026-01-10"
        },
        {
            id: 'mock-1',
            llc_name: "Charter Legacy LLC",
            llc_status: "Active",
            product_type: "standard",
            privacy_shield: false,
            initials: "CL",
            ra_service: false,
            document_number: "L06000122026",
            principal_address: "123 MAIN ST, DELAND, FL 32724",
            mailing_address: "P.O. BOX 100, DELAND, FL 32724",
            agent_name: "STEVE THE RA",
            agent_address: "123 MAIN ST, DELAND, FL 32724",
            fein: "83-0470449",
            electronic_mail: "compliance@charterlegacy.com",
            formation_date: "2006-12-22",
            managers: [
                { title: "AMBR", name: "STEVEN SCHWARTZ", address: "123 MAIN ST, DELAND, FL 32724" },
                { title: "AMBR", name: "ALEX ROSS", address: "123 MAIN ST, DELAND, FL 32724" }
            ]
        },
        {
            id: 'mock-3',
            llc_name: "Sovereign Holdings Inc",
            llc_status: "Active",
            product_type: "standard",
            privacy_shield: true,
            initials: "SH",
            formation_date: "2020-02-02"
        }
    ]
};
window.CONFIG = CONFIG;
