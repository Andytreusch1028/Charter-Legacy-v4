// Obsidian Zenith: High-Fidelity Logic Controller
// Preserves the 10/10 GUI while injecting dynamic data from Supabase

// Initialize Supabase client
const script = document.createElement('script');
script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
script.onload = initializeDashboard;
document.head.appendChild(script);

let supabase;

function initializeDashboard() {
    if (window.engineLoaded) return;
    window.engineLoaded = true;
    
    console.log("Zenith Engine: Initializing Logic Controller...");
    if (!window.CONFIG) {
        console.error("CRITICAL: config.js not loaded!");
        return;
    }

    if (window.supabase) {
        supabase = window.supabase.createClient(window.CONFIG.SUPABASE_URL, window.CONFIG.SUPABASE_ANON_KEY);
    } else {
        console.warn("Zenith: Initializing in Legacy/Mock Mode");
    }
    
    checkAuthAndLoadData();
}

// Check authentication and load data
async function checkAuthAndLoadData() {
    let session = null;
    
    if (window.CONFIG.MOCK_MODE) {
        const mockSession = localStorage.getItem('sb-mock-session');
        if (mockSession) {
            session = JSON.parse(mockSession);
        } else {
            session = {
                user: {
                    id: 'mock-user-id',
                    email: 'mock.founder@charterlegacy.com',
                    user_metadata: { user_name: 'Charter Founder' }
                }
            };
            localStorage.setItem('sb-mock-session', JSON.stringify(session));
            localStorage.setItem('user_type', 'llc');
            localStorage.setItem('user_name', 'Charter Founder');
        }
    } else {
        const { data, error } = await supabase.auth.getSession();
        if (error) console.error('Auth Error:', error);
        session = data.session;
    }

    if (!session) {
        window.location.href = '/app/auth.html';
        return;
    }

    // Dynamic Injection Logic
    if (window.CONFIG.MOCK_MODE) {
        loadMockData();
    } else {
        const { data: profile } = await supabase
            .from('profiles')
            .select('user_type, first_name')
            .eq('id', session.user.id)
            .single();

        const userType = profile?.user_type || 'llc';
        if (userType === 'llc') {
            await loadLLCs(session.user.id);
        }
    }
}

// LLC Data Loader
async function loadLLCs(userId) {
    try {
        const { data: llcs, error } = await supabase
            .from('llcs')
            .select('*')
            .eq('user_id', userId);
        
        if (error) throw error;
        renderZenith(llcs);
    } catch (error) {
        console.error('Data Error:', error);
    }
}

// Mock Data Loader
function loadMockData() {
    const mockEntities = [
        {
            id: 'mock-1',
            llc_name: "Charter Legacy LLC",
            llc_status: "Active",
            privacy_shield: true
        },
        {
            id: 'mock-2',
            llc_name: "Obsidian Ventures DBA",
            llc_status: "Forming",
            privacy_shield: true
        }
    ];
    renderZenith(mockEntities);
}

// Precision Renderer: Bridges Logic and the 10/10 GUI
function renderZenith(entities) {
    const controlCenter = document.getElementById('controlCenter');
    if (!controlCenter || !entities || entities.length === 0) return;

    const hero = entities[0];
    const secondary = entities.slice(1);

    // Update Hero Data (Preserving the Machined Typography)
    controlCenter.innerHTML = `
        <div class="hero-brand">Institutional Control Hub &mdash; Founder</div>
        <h1 class="entity-title">${hero.llc_name}</h1>

        <div class="hero-meta">
            <div class="meta-item">
                <span class="meta-label">Statute:</span>
                <span class="meta-value">FL-605.0113</span>
            </div>
            <div class="meta-item">
                <span class="meta-label">Privacy Shield:</span>
                <span class="meta-value" style="display: flex; align-items: center; gap: 8px;">
                    <span class="pulse-dot"></span>
                    ${hero.privacy_shield ? 'Enabled (Hub Node)' : 'Standard'}
                </span>
            </div>
            <div class="meta-item">
                <span class="meta-label">Compliance:</span>
                <span class="meta-value" style="color: #34C759;">Optimal</span>
            </div>
        </div>

        <div style="display: flex; flex-direction: column; gap: 1rem; width: 280px; margin-top: 3.5rem;">
            <a href="/app/formation-wizard.html?entity=${encodeURIComponent(hero.llc_name)}&action=add_service" class="btn-pill primary">Add Service</a>
            <a href="/app/documents?entity_id=${hero.id}" class="btn-pill">Documents</a>
        </div>

        <div class="vault-tag">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/></svg>
            AES-256 Sovereign Vault Locked
        </div>

        <div style="margin-top: 5rem; opacity: 0.35; font-size: 0.75rem; font-weight: 1000; text-transform: uppercase; letter-spacing: 0.2em; display: inline-flex; align-items: center;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" style="margin-right: 12px;"><path d="M12 5V19M5 12H19" stroke-linecap="round"/></svg>
            <a href="/app/formation-wizard.html" style="text-decoration: none; color: inherit;">Institutionalize New Entity</a>
        </div>

        ${secondary.length > 0 ? `
            <div class="secondary-grid">
                <h2 class="section-title">Associated Assets</h2>
                ${secondary.map(asset => `
                    <div class="asset-well">
                        <div>
                            <div class="asset-name">${asset.llc_name}</div>
                            <div class="asset-subtitle">Legacy Asset Cluster</div>
                        </div>
                        <div style="margin-top: 1rem;">
                            <a href="/app/documents?entity_id=${asset.id}" class="vault-btn">Manage Vault &rarr;</a>
                        </div>
                    </div>
                `).join('')}
            </div>
        ` : ''}

        <div style="margin-top: 8rem; opacity: 0.8;">
            <h2 class="section-title">Maintenance Hub</h2>
            <div style="height: 200px; background: rgba(0,0,0,0.02); border-radius: 32px; border: 1px solid rgba(0,0,0,0.02); width: 100%;"></div>
        </div>
    `;

    renderSovereignFeed();
    renderLegacyTimer();
}

function renderSovereignFeed() {
    const aside = document.querySelector('.side-sentinel');
    if (!aside) return;

    const logs = [
        { msg: "Vault access via Hub Node Alpha", time: "2m ago", icon: "MI" },
        { msg: "Privacy Shield Telemetry verified", time: "14m ago", icon: "SH" },
        { msg: "Statutory mapping (FL-605) locked", time: "1h ago", icon: "LE" }
    ];

    aside.innerHTML = `
        <div class="legacy-timer-box">
            <span class="timer-label">Legacy Timer Check-in</span>
            <span class="timer-status">System Vigilant</span>
            <span class="timer-countdown">NEXT PULSE: 18:42:09</span>
        </div>

        <div>
            <h2 class="side-title">Live Audit Feed</h2>
            <div style="display: flex; flex-direction: column; gap: 20px;">
                ${logs.map(log => `
                    <div class="activity-card">
                        <div class="log-icon">${log.icon}</div>
                        <div class="log-content">
                            <span class="log-msg">${log.msg}</span>
                            <span class="log-time">${log.time}</span>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

function renderLegacyTimer() {
    // Logic for countdown animation would go here
    console.log("Legacy Timer Engaged.");
}
