// Sovereign RA Portal: Logic Controller
// Handles the "Digital Mailroom", Secure Upload, and Shield Status

// Initialize Supabase client
if (window.CONFIG && !window.CONFIG.MOCK_MODE) {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
    script.onload = initializeRAPortal;
    document.head.appendChild(script);
} else {
    // Mock Mode Bootstrap
    setTimeout(initializeRAPortal, 50);
}

let supabase;

function initializeRAPortal() {
    console.log("RA Portal: Initializing Secure Link...");
    
    // Entity Context Extraction
    const urlParams = new URLSearchParams(window.location.search);
    const entityId = urlParams.get('entity_id');
    
    if (entityId && window.CONFIG && window.CONFIG.MOCK_ENTITIES) {
        const entity = window.CONFIG.MOCK_ENTITIES.find(e => e.id === entityId);
        if (entity) {
            const backBtn = document.getElementById('backToDashboard');
            if (backBtn) {
                backBtn.innerHTML = `← Back to Dashboard for ${entity.llc_name}`;
                backBtn.onclick = () => window.location.href = `/app/obsidian-zenith.html?entity_id=${entityId}`;
            }
        }
    }
    
    // Simulate data load
    setupFreedomKey();
    loadMailroomData();
    renderVaultItems();
    startComplianceClock();
}

function setupFreedomKey() {
    const btn = document.getElementById('btnFreedomKey');
    if (!btn) return;

    btn.addEventListener('click', async () => {
        const originalText = btn.innerHTML;
        btn.innerHTML = `<div class="heartbeat-dot" style="background:black"></div> Generating Key...`;
        btn.disabled = true;

        try {
            await generateFreedomKey();
            btn.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg> Key Generated`;
            
            setTimeout(() => {
                btn.innerHTML = originalText;
                btn.disabled = false;
            }, 3000);
        } catch (e) {
            console.error(e);
            btn.innerHTML = "Error Generating Key";
            setTimeout(() => {
                 btn.innerHTML = originalText;
                 btn.disabled = false;
            }, 3000);
        }
    });
}

async function generateFreedomKey() {
    if (!window.JSZip) {
        alert("System Error: Archival Engine not loaded.");
        return;
    }

    const zip = new JSZip();
    const folderName = `Charter_Legacy_Archive_${new Date().toISOString().split('T')[0]}`;
    const root = zip.folder(folderName);

    // Organization folders based on spec
    const folders = {
        OFFICIAL: root.folder("01_OFFICIAL_STATE_IRS"),
        INTERNAL: root.folder("02_INTERNAL_GOVERNANCE"),
        AUDIT: root.folder("03_AUDIT_LOGS"),
        CONTEXT: root.folder("04_STRATEGIC_CONTEXT")
    };

    // Add files to zip
    _vaultItems.forEach(item => {
        const targetFolder = folders[item.classification] || root;
        // Mock content generation
        const content = `[OFFICIAL RECORD - CHARTER LEGACY]\n\nDocument: ${item.name}\nDate: ${item.date}\nClassification: ${item.classification}\n\nThis is a certified copy of the institutional record.`;
        targetFolder.file(item.name, content);
    });

    // Generate and download
    const blob = await zip.generateAsync({type:"blob"});
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${folderName}.zip`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
}

function setupAddressWidget() {
    const btn = document.getElementById('copyAddressBtn');
    if (!btn) return;
    
    btn.addEventListener('click', () => {
        navigator.clipboard.writeText("1201 N Orange St, Suite 700, Wilmington, DE 19801");
        const originalText = btn.innerHTML;
        btn.innerHTML = `<span style="color: var(--accent-green)">Copied to Clipboard</span>`;
        setTimeout(() => {
            btn.innerHTML = originalText;
        }, 2000);
    });
}

function startComplianceClock() {
    const clock = document.getElementById('complianceClock');
    if (!clock) return;
    
    // Set deadline: May 1st of current year/next year
    const now = new Date();
    let deadline = new Date(now.getFullYear(), 4, 1); // Month is 0-indexed (4 = May)
    if (now > deadline) deadline.setFullYear(deadline.getFullYear() + 1);
    
    const days = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));
    
    clock.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 2px;">
            <span>Good Standing</span>
            <span style="font-size: 0.65rem; opacity: 0.6; font-weight: 700;">FL ANNUAL REPORT: ${days} DAYS</span>
        </div>
    `;
}

// Local mock state for vault items
// Local mock state for vault items with Asset Classification (Spec: The Soul Vault)
let _vaultItems = [
    {
        name: 'Writ_of_Garnishment_Case_22-CA-993.pdf',
        date: 'Just Now',
        status: 'Action Required',
        classification: 'OFFICIAL',
        auditLog: [
            { date: 'Just Now', event: 'Served to Registered Agent' },
            { date: 'Just Now', event: 'Urgent Alert Dispatched' }
        ]
    },
    {
        name: 'Articles_of_Organization.pdf',
        date: 'Jan 01, 2026',
        status: 'Filed',
        classification: 'OFFICIAL',
        auditLog: [
            { date: 'Jan 01 09:00 AM', event: 'Checked In by Founder' },
            { date: 'Jan 01 09:05 AM', event: 'Encrypted by System' },
            { date: 'Jan 01 02:00 PM', event: 'Filed with State (Auto-Agent)' }
        ]
    },
    {
        name: 'EIN_Assignment_Letter.pdf',
        date: 'Jan 02, 2026',
        status: 'Filed',
        classification: 'OFFICIAL',
        auditLog: [
             { date: 'Jan 02 10:00 AM', event: 'Received from IRS' },
             { date: 'Jan 02 10:01 AM', event: 'Auto-Vaulted by Sentinel' }
        ]
    },
    {
        name: 'Tax_Receipt_Q4_2025.pdf',
        date: 'Jan 15, 2026',
        status: 'Verified',
        classification: 'OFFICIAL',
        auditLog: [
            { date: 'Jan 15 02:30 PM', event: 'Payment Confirmed' },
            { date: 'Jan 15 02:31 PM', event: 'Receipt Generated' }
        ]
    },
    {
        name: 'Operating_Agreement_Signed.pdf',
        date: 'Jan 10, 2026',
        status: 'Executed',
        classification: 'INTERNAL',
        auditLog: [
            { date: 'Jan 10 09:00 AM', event: 'Drafted by Counsel' },
             { date: 'Jan 10 04:00 PM', event: 'Signed by Members' },
             { date: 'Jan 10 04:05 PM', event: 'Cryptographically Sealed' }
        ]
    },
    {
        name: 'Initial_Resolutions.docx',
        date: 'Jan 10, 2026',
        status: 'Ratified',
        classification: 'INTERNAL',
        auditLog: [
            { date: 'Jan 10 05:00 PM', event: 'Ratified by Board' }
        ]
    },
    {
        name: 'Publication_Affidavit.pdf',
        date: 'Jan 15, 2026',
        status: 'Verified',
        classification: 'AUDIT',
        auditLog: [
            { date: 'Jan 15 11:00 AM', event: 'Publication Confirmed' }
        ]
    },
    {
        name: 'Sentinel_Access_Log_Q1.csv',
        date: 'Jan 28, 2026',
        status: 'Live',
        classification: 'AUDIT',
        auditLog: [
            { date: 'Jan 28 12:00 AM', event: 'Log Rotated' }
        ]
    },
    {
        name: 'Strategy_Memo_Alpha.md',
        date: 'Jan 05, 2026',
        status: 'Draft',
        classification: 'CONTEXT',
        auditLog: [
            { date: 'Jan 05 08:30 AM', event: 'Created by Founder' }
        ]
    }
];

function renderVaultItems() {
    const list = document.getElementById('vaultList');
    if (!list) return;

    // Zero State Check (Phase 8)
    if (_vaultItems.length === 0) {
        list.innerHTML = `
            <div class="vault-empty-state">
                <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
                <div class="empty-title">Secure Vault Ready</div>
                <div class="empty-subtitle">Your institutional archive is empty. Upload documents to begin the Chain of Custody.</div>
            </div>
        `;
        return;
    }

    list.innerHTML = _vaultItems.map((item, index) => `
        <div class="vault-item-row" id="vaultItem-${index}" onclick="toggleVaultItem(${index})">
            <div class="vault-main-content">
                <div style="display: flex; align-items: center; gap: 16px;">
                    <div style="width: 40px; height: 40px; background: rgba(255,255,255,0.1); border-radius: 10px; display: flex; align-items: center; justify-content: center;">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                    </div>
                    <div style="display: flex; flex-direction: column; gap: 4px;">
                        <span class="vault-filename" onclick="viewDocument(${index}); event.stopPropagation();" style="font-size: 0.9rem; font-weight: 700; color: white;">${item.name}</span>
                        <div style="display: flex; align-items: center; gap: 8px;">
                             <span style="font-size: 0.65rem; font-weight: 600; opacity: 0.5; color: white;">${item.date}</span>
                             <span style="font-size: 0.6rem; font-weight: 800; padding: 2px 6px; border-radius: 4px; text-transform: uppercase; letter-spacing: 0.05em;" class="badge-${item.classification.toLowerCase()}">${item.classification}</span>
                        </div>
                    </div>
                </div>
                
                <div style="display: flex; align-items: center; gap: 16px;">
                    <div style="font-size: 0.7rem; font-weight: 800; color: rgba(255,255,255,0.4); text-transform: uppercase; letter-spacing: 0.1em;">${item.status}</div>
                    
                    <!-- Actions -->
                    <div class="action-group" onclick="event.stopPropagation()" style="display: flex; gap: 8px;">
                        <button class="action-btn view" title="View Document" onclick="viewDocument(${index})">
                            <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                        </button>
                         <button class="action-btn" title="View Chain of Custody" onclick="toggleVaultItem(${index})">
                            <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                        </button>
                    </div>
                </div>
            </div>

            <!-- Audit Log (Chain of Custody) -->
            <div class="vault-audit-container">
                <div style="font-size: 0.65rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; color: rgba(255,255,255,0.4); margin-bottom: 12px;">Chain of Custody</div>
                ${item.auditLog ? item.auditLog.map(log => `
                     <div class="audit-entry">
                        <span class="audit-timestamp">[${log.date}]</span> ${log.event}
                    </div>
                `).join('') : '<div style="font-size: 0.7rem; opacity: 0.3;">No audit history.</div>'}
            </div>
        </div>
    `).join('');
}

function toggleVaultItem(index) {
    const row = document.getElementById(`vaultItem-${index}`);
    if (row) {
        row.classList.toggle('expanded');
    }
}

// deleteVaultItem removed for Phase 13 (Read-Only Vault)

function viewDocument(index) {
    const item = _vaultItems[index];
    
    // CHAIN OF CUSTODY UPDATE: Log access
    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const dateString = now.toLocaleDateString([], { month: 'short', day: '2-digit' });
    
    item.auditLog.push({ 
        date: `${dateString} ${timeString}`, 
        event: 'Accessed by Authorized User' 
    });
    
    // Re-render to show new log if (when) user returns
    renderVaultItems();

    const fileName = item.name;

    // IF REAL FILE: Open actual content
    if (item.fileData) {
        const url = URL.createObjectURL(item.fileData);
        window.open(url, '_blank');
        return;
    }

    // IF MOCK: Generate specific realistic content
    let specificContent = "";
    if (fileName.includes("EIN")) {
        specificContent = `
            <h3>DEPARTMENT OF THE TREASURY</h3>
            <h4>INTERNAL REVENUE SERVICE</h4>
            <p><strong>CINCINNATI, OH 45999</strong></p>
            <br>
            <p><strong>RE: ISSUANCE OF EMPLOYER IDENTIFICATION NUMBER (EIN)</strong></p>
            <p>We have assigned your entity the EIN listed above. This number will be used to identify your business accounts, tax returns, and other official documents.</p>
            <p><strong>IMPORTANT:</strong> Keep this notice in your permanent records. You will need this number for all federal tax filings.</p>
            <ul>
                <li>Form 941 (Employer's Quarterly Federal Tax Return)</li>
                <li>Form 940 (Employer's Annual Federal Unemployment Tax Return)</li>
                <li>Form 1120 (U.S. Corporation Income Tax Return)</li>
            </ul>
        `;
    } else if (fileName.includes("Writ")) {
        specificContent = `
            <h3>CIRCUIT COURT OF THE ELEVENTH JUDICIAL CIRCUIT</h3>
            <h4>IN AND FOR MIAMI-DADE COUNTY, FLORIDA</h4>
            <br>
            <p><strong>CASE NO:</strong> 22-CA-993</p>
            <p><strong>PLAINTIFF:</strong> APEX CREDITORS, INC.</p>
            <p><strong>DEFENDANT:</strong> CHARTER LEGACY LLC</p>
            <br>
            <h4>WRIT OF GARNISHMENT</h4>
            <p><strong>TO THE STATE OF FLORIDA:</strong></p>
            <p>YOU ARE HEREBY COMMANDED to garnish the goods, chattels, rights, credits, moneys, and effects of the Defendant in your hands or possession.</p>
            <br>
            <p><strong>NOTICE TO DEFENDANT:</strong> You have 20 days to file a claim of exemption or other defense.</p>
            <div style="border: 2px solid red; color: red; padding: 10px; margin-top: 20px; font-weight: bold; text-align: center;">
                SERVED UPON REGISTERED AGENT: JAN 29, 2026
            </div>
        `;
    } else if (fileName.includes("Tax_Receipt")) {
        specificContent = `
            <h3>DEPARTMENT OF REVENUE</h3>
            <h4>TAX RECEIPT / CONFIRMATION</h4>
            <br>
            <p><strong>TAXPAYER ID:</strong> XX-XXX9928</p>
            <p><strong>PERIOD:</strong> Q4 2025</p>
            <br>
            <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
                <tr style="border-bottom: 1px solid black;">
                    <th style="text-align: left; padding: 8px;">DESCRIPTION</th>
                    <th style="text-align: right; padding: 8px;">AMOUNT</th>
                </tr>
                <tr>
                    <td style="padding: 8px;">Estimated Tax Payment</td>
                    <td style="text-align: right; padding: 8px;">$1,250.00</td>
                </tr>
                <tr style="font-weight: bold; border-top: 2px solid black;">
                    <td style="padding: 8px;">TOTAL PAID</td>
                    <td style="text-align: right; padding: 8px;">$1,250.00</td>
                </tr>
            </table>
            <br>
            <p><strong>STATUS:</strong> PROCESSED</p>
            <p><strong>CONFIRMATION:</strong> #9928-TX-Q4</p>
        `;
    } else if (fileName.includes("Articles")) {
         specificContent = `
            <h3>STATE OF DELAWARE</h3>
            <h4>CERTIFICATE OF FORMATION</h4>
            <p>I, THE UNDERSIGNED, being the Secretary of State of the State of Delaware, do hereby certify that the attached ARTICLES OF ORGANIZATION were received and filed in this office on this date.</p>
            <br>
            <p><strong>ENTITY NAME:</strong> CHARTER LEGACY LLC</p>
            <p><strong>FILE NUMBER:</strong> 9928-1029-22</p>
            <br>
            <p>The entity is formed strictly for lawful purposes under the Delaware Limited Liability Company Act. The company shall have perpetual existence.</p>
            <br>
            <br>
            <div style="border: 4px double black; padding: 20px; text-align: center; font-weight: bold;">
                OFFICIAL SEAL OF THE STATE OF DELAWARE
            </div>
        `;
    } else if (fileName.includes("Agreement")) {
         specificContent = `
            <h3>LIMITED LIABILITY COMPANY OPERATING AGREEMENT</h3>
            <p><strong>THIS OPERATING AGREEMENT</strong> is made and entered into effective as of Jan 10, 2026, by and among the members listed in Schedule A.</p>
            <br>
            <h4>ARTICLE I: FORMATION</h4>
            <p>The Members hereby form a Limited Liability Company ("Company") subject to the provisions of the State Limited Liability Company Act.</p>
            <br>
            <h4>ARTICLE II: CAPITAL CONTRIBUTIONS</h4>
            <p>Initial capital contributions satisfy the requirements for membership interest. No Member shall be obligated to make additional capital contributions unless unanimously agreed.</p>
            <br>
            <h4>ARTICLE III: MANAGEMENT</h4>
            <p>The Company shall be Member-Managed. All decisions regarding the day-to-day operations shall be made by majority vote of the Membership Interests.</p>
        `;
    } else {
        specificContent = `
            <h3>CONFIDENTIAL INTERNAL MEMORANDUM</h3>
            <p><strong>CLASSIFICATION:</strong> ${item.classification}</p>
            <br>
            <p>This document contains proprietary information regarding the strategic operations of the entity. Unauthorized distribution is strictly prohibited.</p>
            <p>Content has been cryptographically verified and stored in the Sovereign Vault.</p>
            <br>
            <p><em>(Original content redacted for preview security)</em></p>
        `;
    }

    // Generate a rich HTML mock to simulate a real secure document viewer
    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <title>SECURE VIEWER: ${fileName}</title>
        <style>
            body { background: #505050; margin: 0; padding: 40px; font-family: 'Inter', sans-serif; display: flex; justify-content: center; }
            .page { background: white; width: 8.5in; height: 11in; padding: 1in; box-shadow: 0 10px 30px rgba(0,0,0,0.5); position: relative; }
            .watermark { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-45deg); font-size: 6rem; color: rgba(0,0,0,0.03); font-weight: 900; pointer-events: none; white-space: nowrap; }
            .header { border-bottom: 2px solid #000; padding-bottom: 20px; margin-bottom: 40px; display: flex; justify-content: space-between; align-items: flex-end; }
            .logo { font-weight: 900; font-size: 1.5rem; letter-spacing: -0.05em; }
            .meta { font-family: monospace; font-size: 0.8rem; text-align: right; }
            .content { font-family: 'Georgia', serif; line-height: 1.6; text-align: justify; font-size: 11pt; }
            .signature { margin-top: 60px; font-family: 'Cursive', serif; font-size: 1.5rem; }
        </style>
    </head>
    <body>
        <div class="page">
            <div class="watermark">OFFICIAL COPY</div>
            <div class="header">
                <div class="logo">CHARTER LEGACY.</div>
                <div class="meta">
                    REF: ${Math.random().toString(36).substr(2, 9).toUpperCase()}<br>
                    DATE: ${new Date().toLocaleDateString()}
                </div>
            </div>
            <div class="content">
                ${specificContent}
                
                <div class="signature">
                    Authorized Signature<br>
                    <span style="font-family: monospace; font-size: 0.8rem; letter-spacing: 2px;">// SYSTEM_VERIFIED</span>
                </div>
            </div>
        </div>
    </body>
    </html>
    `;
    
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    
    const viewer = window.open(url, '_blank');
    if (viewer) {
        viewer.addEventListener('unload', () => URL.revokeObjectURL(url));
    }
}

// Upload logic removed for Phase 11 (Pristine Vault)

function loadMailroomData() {
    const feed = document.getElementById('mailroomFeed');
    if (!feed) return;
    
    // In production, this fetches from 'ra_mail_queue' table
    // Here we render the high-fidelity mock data
    
    const mailItems = [
        {
            type: 'alert',
            badge: 'Service of Process',
            date: 'Just Now',
            summary: '<strong>Urgent: Writ of Garnishment.</strong> Received from Circuit Court (Miami-Dade). Appearance required within 20 days.',
            action: 'View Summons (PDF)',
            onClick: 'viewDocument(0)' // Maps to the new first item in Vault
        },
        {
            type: 'notice',
            badge: 'Official Notice',
            date: 'Today, 9:41 AM',
            summary: '<strong>Annual Report Filing Open.</strong> The Florida Division of Corporations is now accepting filings. Deadline: May 1st.',
            action: 'View Document →'
        },
        {
            type: 'archive',
            badge: 'Filed',
            date: 'Jan 15',
            summary: '<strong>Tax Receipt.</strong> Confirmation of payment for Q4 Estimated Taxes.',
            action: 'Download PDF →',
            onClick: 'viewDocument(2)' // Maps to the new Tax Receipt item (Index 2: Writ=0, Articles=1, Tax=2)
        }
    ];
    
    feed.innerHTML = mailItems.map(item => `
        <div class="mail-card" style="border-left: ${item.type === 'alert' ? '4px solid #FF3B30' : '1px solid rgba(0,0,0,0.01)'}">
            <div class="mail-header">
                <span class="mail-badge" style="${getBadgeStyle(item.type)}">${item.badge}</span>
                <span class="mail-date">${item.date}</span>
            </div>
            <div class="mail-summary">${item.summary}</div>
            <div class="mail-action" style="${item.type === 'alert' ? 'color: #FF3B30;' : ''}" onclick="${item.onClick || ''}">
                ${item.type === 'archive' ? '<svg class="btn-icon" style="width:12px; height:12px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>' : '<svg class="btn-icon" style="width:12px; height:12px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>'}
                ${item.action.replace('→', '')}
            </div>
        </div>
    `).join('');
}

function getBadgeStyle(type) {
    if (type === 'alert') return 'background: #FF3B30; color: white;';
    if (type === 'archive') return 'background: #8E8E93; color: white;';
    return 'background: var(--obsidian-ink); color: white;';
}
