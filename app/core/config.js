// Supabase Configuration
// Replace these with your actual Supabase project values

// PBP Reference: @ANTIGRAVITY.config_root
// PBP Reference: @IDENTITY.upl_mode ("STRICT_NON_DISCRETIONARY")
// Compliance: All keys must match .antigravity/permissions.yaml rules

const CONFIG = {
    // Identity Pulse (PBP @STYLE.white_charter.authentication)
    SUPABASE_URL: window.env?.SUPABASE_URL || 'https://smsqnqfgoheqmynkgpel.supabase.co',
    SUPABASE_ANON_KEY: window.env?.SUPABASE_ANON_KEY || 'sb_publishable_F_VDMnkLAeo5UGKknSvk8Q_FrZ23LTb',
    
    // VERIFICATION: Live Mode enabled (Turbo Mode)
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
    },

    // Mock Entities for Cross-Page Context
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
            privacy_shield: true,
            initials: "OV",
            ra_service: true
        },
        {
            id: 'mock-1',
            llc_name: "Charter Legacy LLC",
            llc_status: "Active",
            privacy_shield: false,
            initials: "CL",
            ra_service: false
        },
        {
            id: 'mock-3',
            llc_name: "Sovereign Holdings Inc",
            llc_status: "Active",
            privacy_shield: true,
            initials: "SH"
        },
        {
            id: 'mock-dissolved-1',
            llc_name: "Ghost Operations LLC",
            llc_status: "Inact/Admin Dissolved",
            product_type: "llc",
            privacy_shield: false,
            initials: "GO",
            ra_service: false,
            document_number: "L09000012345",
            principal_address: "123 Forgotten Way, Orlando, FL 32801",
            mailing_address: "123 Forgotten Way, Orlando, FL 32801",
            agent_name: "John Doe",
            agent_address: "123 Forgotten Way, Orlando, FL 32801"
        }
    ],

    // Phase 3: Internal Governance Templates (PBP @STYLE.institutional.scrivening)
    MOCK_OA_TEMPLATES: [
        {
            id: 'tpl-solo-v1',
            template_type: 'solo',
            version: 1,
            status: 'active',
            attorney_name: 'Sovereign Counsel, LLP',
            attorney_bar_number: 'FL-998877',
            attorney_review_date: '2026-01-15',
            fl_statute_version: 'Chapter 605 (2026)',
            content: `OPERATING AGREEMENT OF {{LLC_NAME}}
            
ARTICLE I: FORMATION
The Company was formed on {{FORMATION_DATE}} under the laws of the State of Florida. The Principal Office is located at {{PRINCIPAL_ADDRESS}}.

ARTICLE II: SINGLE-MEMBER GOVERNANCE
{{MEMBER_NAME}} (the "Sole Member") holds 100% of the membership interest. The Company shall be Member-Managed.

ARTICLE III: CAPITAL CONTRIBUTIONS
The Sole Member has contributed capital to the Company as set forth in the Company's books and records.

ARTICLE IV: DISSOLUTION
The Company shall dissolve only upon the written intent of the Sole Member or as otherwise required by law.

[EXECUTION HEREOF]
RECORDS SECURED BY CHARTER LEGACY SOVEREIGN PROTOCOL.
{{MEMBER_SIGNATURES}}`
        },
        {
            id: 'tpl-multi-v1',
            template_type: 'multi',
            version: 1,
            status: 'active',
            attorney_name: 'Sovereign Counsel, LLP',
            attorney_bar_number: 'FL-998877',
            attorney_review_date: '2026-01-15',
            fl_statute_version: 'Chapter 605 (2026)',
            content: `OPERATING AGREEMENT OF {{LLC_NAME}}
            
ARTICLE I: THE PARTNERSHIP
This Multi-Member Operating Agreement is entered into as of {{EFFECTIVE_DATE}}. The members listed below (the "Members") hereby organize as a Florida Limited Liability Company.

ARTICLE II: OWNERSHIP & UNITS
Ownership is divided into Units as follows:
{{MEMBER_LIST}}

ARTICLE III: VOTING RIGHTS
Each Member shall have voting rights proportional to their membership percentage. A Majority in Interest (greater than 50%) is required for major institutional acts.

ARTICLE IV: DISTRIBUTIONS
Profits and losses shall be allocated according to the membership percentages defined herein.

[SOVEREIGN AUTHENTICATION]
{{MEMBER_SIGNATURES}}`
        },
        {
            id: 'tpl-soa-v1',
            template_type: 'statement_of_authority',
            version: 1,
            status: 'active',
            attorney_name: 'Sovereign Counsel, LLP',
            attorney_bar_number: 'FL-998877',
            attorney_review_date: '2026-02-01',
            fl_statute_version: 'FL 605.0302',
            content: `STATEMENT OF AUTHORITY: {{LLC_NAME}}
            
To Whom It May Concern:
Pursuant to Florida Statute 605.0302, {{LLC_NAME}} (the "Company") hereby grants the following authority to the Authorized Persons listed below.

AUTHORIZED AGENTS:
{{MANAGER_SLATE}}

SCOPE OF AUTHORITY:
The individuals listed above are authorized to execute instruments transferring real property and to enter into binding contracts on behalf of the Company.

NOTICE: This Statement of Authority remains in effect until cancelled by a subsequent filing with the Department of State.

CERTIFIED BY:
{{EXECUTION_NAME}}, Manager / Member`
        },
        {
            id: 'tpl-bank-res-v1',
            template_type: 'banking_resolution',
            version: 1,
            status: 'active',
            attorney_name: 'Sovereign Counsel, LLP',
            attorney_bar_number: 'FL-998877',
            attorney_review_date: '2026-02-01',
            fl_statute_version: 'Institutional Protocol v4',
            content: `CORPORATE RESOLUTION TO OPEN BANK ACCOUNT
            
ENTITY: {{LLC_NAME}}
DATE: {{EFFECTIVE_DATE}}

WHEREAS, the Members of the Company have determined it is in the best interest of the Company to establish a banking relationship with {{BANK_NAME}} ("the Bank").

RESOLVED, that the Company open such accounts as necessary to facilitate operations. The following persons are hereby authorized as Signers on said accounts:

SIGNATORY LIST:
{{SIGNER_LIST}}

FURTHER RESOLVED, that the Bank is authorized to rely on the signatures of the above persons until notified in writing of a change in status.

ATTEST:
{{SECRETARY_NAME}}, Secretary / Authorized Person`
        },
        {
            id: 'tpl-minutes-v1',
            template_type: 'organizational_minutes',
            version: 1,
            status: 'active',
            attorney_name: 'Sovereign Counsel, LLP',
            attorney_bar_number: 'FL-998877',
            attorney_review_date: '2026-02-01',
            fl_statute_version: 'Chapter 605 Records Management',
            content: `MINUTES OF THE ORGANIZATIONAL MEETING OF {{LLC_NAME}}
            
The organizational meeting of the Members of {{LLC_NAME}} was held on {{EFFECTIVE_DATE}} at {{PRINCIPAL_ADDRESS}}.

1. ADOPTION OF OPERATING AGREEMENT: The Members reviewed and adopted the Operating Agreement as the governing document of the Company.
2. ELECTION OF OFFICERS: The following individuals were elected to serve in the roles listed:
{{MANAGER_SLATE}}
3. FISCAL YEAR: The fiscal year of the Company shall end on December 31 of each year.

There being no further business, the meeting was adjourned.

RECORDED BY:
_________________________________
{{SECRETARY_NAME:input}}, Acting Secretary`
        },
        {
            id: 'tpl-incumbency-v1',
            template_type: 'incumbency_certificate',
            version: 1,
            status: 'active',
            attorney_name: 'Sovereign Counsel, LLP',
            attorney_bar_number: 'FL-998877',
            attorney_review_date: '2026-02-01',
            fl_statute_version: 'Institutional Protocol v4',
            content: `CERTIFICATE OF INCUMBENCY: {{LLC_NAME}}
            
I, {{SECRETARY_NAME:input}}, the duly elected and acting Secretary of {{LLC_NAME}} (the "Company"), hereby certify that the following persons are the qualified and acting officers/managers of the Company, holding the offices set forth opposite their names:

OFFICERS & MANAGERS:
{{MANAGER_SLATE}}

I further certify that the signatures appearing next to their names are their true and genuine signatures.

IN WITNESS WHEREOF, I have hereunto set my hand and the seal of the Company this {{EFFECTIVE_DATE}}.

SIGNATURE:
_________________________________
{{SECRETARY_NAME:input}}`
        },
        {
            id: 'tpl-member-cert-v1',
            template_type: 'membership_certificate',
            version: 1,
            status: 'active',
            attorney_name: 'Sovereign Counsel, LLP',
            attorney_bar_number: 'FL-998877',
            attorney_review_date: '2026-02-01',
            fl_statute_version: 'Institutional Protocol v4',
            content: `MEMBERSHIP INTEREST CERTIFICATE
            
COMPANY: {{LLC_NAME}}
CERTIFICATE NUMBER: {{CERTIFICATE_NUMBER:input}}
UNITS / PERCENTAGE: {{MEMBER_UNITS:input}}

THIS IS TO CERTIFY THAT {{MEMBER_NAME}} is the registered holder of the above-mentioned Membership Interests in {{LLC_NAME}}, a Florida Limited Liability Company.

The interests represented by this certificate are subject to the terms and conditions of the Operating Agreement of the Company.

IN WITNESS WHEREOF, the Company has caused this Certificate to be executed by its authorized officer this {{EFFECTIVE_DATE}}.

_________________________________
Authorized Signatory`
        }
    ],
    MOCK_MINUTES_ENTRIES: [
        {
            id: 'min-1',
            entity_id: 'mock-pllc-1',
            meeting_date: '2026-02-01',
            recording_date: '2026-02-01',
            recorder: 'Dr. Sarah Jenkins',
            attendees: 'Dr. Sarah Jenkins, Mark Sterling (Counsel)',
            body: `The organizational meeting of Zenith Medical PLLC was held to adopt the custom medical Operating Agreement. 
            
RESOLVED, that the Operating Agreement presented to the meeting is hereby adopted as the governing document of the Company.
            
RESOLVED, that Dr. Sarah Jenkins is elected as the Lead Manager and Medical Director of the Company.`,
            status: 'saved'
        }
    ],
    MOCK_LEGACY_TEMPLATES: [
        {
            id: 'tpl-will-v1',
            template_type: 'last_will',
            version: 1,
            status: 'active',
            title: 'Last Will and Testament',
            description: 'The cornerstone of your legacy. Defines asset distribution and appoints guardians for minor children.',
            content: `LAST WILL AND TESTAMENT OF {{TESTATOR_NAME}}

I, {{TESTATOR_NAME}}, a resident of {{TESTATOR_COUNTY}} County, Florida, declare this to be my Last Will and Testament, revoking all prior wills and codicils.

1. EXECUTOR APPOINTMENT: I appoint {{EXECUTOR_NAME}} as the Personal Representative of my estate. If {{EXECUTOR_NAME}} is unable to serve, I appoint {{SUCCESSOR_EXECUTOR_NAME}} as successor.

2. GUARDIANSHIP: In the event I have minor children at my death, I appoint {{GUARDIAN_NAME}} as the Guardian of the person and property of such children.

3. DISPOSITION OF ASSETS: I give, devise, and bequeath all of my property, real and personal, to {{BENEFICIARY_SLATE}}.

4. POWERS: My Personal Representative shall have all powers granted under the Florida Probate Code to manage and distribute my estate.

IN WITNESS WHEREOF, I have hereunto set my hand this {{EFFECTIVE_DATE}}.

_________________________________
{{TESTATOR_NAME}}, Testator`
        },
        {
            id: 'tpl-poa-v1',
            template_type: 'durable_poa',
            version: 1,
            status: 'active',
            title: 'Durable Power of Attorney',
            description: 'Grants authority to a trusted agent to manage your financial and legal affairs if you become incapacitated.',
            content: `DURABLE POWER OF ATTORNEY

I, {{PRINCIPAL_NAME}}, appoint {{AGENT_NAME}} as my attorney-in-fact (Agent). If {{AGENT_NAME}} is unable to serve, I appoint {{SUCCESSOR_AGENT_NAME}} as successor.

This Power of Attorney is durable and shall not be affected by my subsequent incapacity.

My Agent is authorized to act on my behalf in all matters, including but not limited to:
1. Banking and financial transactions.
2. Real estate management and sale.
3. Legal proceedings and government benefits.

Executed this {{EFFECTIVE_DATE}}.

_________________________________
{{PRINCIPAL_NAME}}, Principal`
        },
        {
            id: 'tpl-living-will-v1',
            template_type: 'living_will',
            version: 1,
            status: 'active',
            title: 'Living Will & Health Care Surrogate',
            description: 'Formal instructions for end-of-life care and designation of a health care surrogate.',
            content: `LIVING WILL AND HEALTH CARE SURROGATE DESIGNATION

I, {{PRINCIPAL_NAME}}, willfully and voluntarily make this declaration.

1. END-OF-LIFE DIRECTIVE: If at any time I am incapacitated and have a terminal condition, end-stage condition, or am in a persistent vegetative state, I direct that life-prolonging procedures be withheld or withdrawn.

2. HEALTH CARE SURROGATE: I designate {{SURROGATE_NAME}} as my Health Care Surrogate to make health care decisions for me if I am unable to do so.

Executed this {{EFFECTIVE_DATE}}.

_________________________________
{{PRINCIPAL_NAME}}, Principal`
        }
    ]
};

window.CONFIG = CONFIG;

// DO NOT commit real keys to git!
// For production, use environment variables or a .env file

// export default CONFIG; // Removed to prevent SyntaxError in non-module script
