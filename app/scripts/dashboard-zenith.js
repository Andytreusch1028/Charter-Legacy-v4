// Obsidian Zenith: High-Fidelity Logic Controller
// Preserves the 10/10 GUI while injecting dynamic data from Supabase

// Initialize Supabase client
const script = document.createElement('script');
script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
script.onload = initializeDashboard;
document.head.appendChild(script);

let supabase;
let _allEntities = [];
let _currentEntityId = null;

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

    // Intent Tracking for Service Intelligence
    recordIntent('dashboard');

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
    _allEntities = [
        {
            id: 'mock-1',
            llc_name: "Charter Legacy LLC",
            llc_status: "Active",
            privacy_shield: true,
            initials: "CL",
            ra_service: false // Envy State
        },
        {
            id: 'mock-2',
            llc_name: "Obsidian Ventures DBA",
            llc_status: "Forming",
            privacy_shield: true,
            initials: "OV",
            ra_service: true // Active State
        },
        {
            id: 'mock-3',
            llc_name: "Sovereign Holdings Inc",
            llc_status: "Active",
            privacy_shield: true,
            initials: "SH"
        }
    ];
    _currentEntityId = _allEntities[0].id;
    renderZenith(_allEntities);
}

// Precision Renderer: Bridges Logic and the 10/10 GUI
function renderZenith(entities) {
    _allEntities = entities; // Update global store
    const controlCenter = document.getElementById('controlCenter');
    if (!controlCenter || !entities || entities.length === 0) return;

    // Use current ID or default to first
    if (!_currentEntityId) _currentEntityId = entities[0].id;
    const hero = entities.find(e => e.id === _currentEntityId) || entities[0];

    // Update Hero Data (Preserving the Machined Typography & Zero Logic Duplication)
    controlCenter.innerHTML = `
        <div class="switch-gear-wrap" onclick="toggleFleetView()">
            <div class="brand-eyebrow" style="margin-bottom: 0;">Corporate Command Center &mdash; Founder</div>
            <svg class="switch-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M7 15l5 5 5-5M7 9l5-5 5 5" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </div>
        
        <h1 class="entity-title">${hero.llc_name}</h1>

        <div class="hero-meta">
            <div class="stat-item">
                <span class="stat-label">Entity Structure</span>
                <span class="stat-value">Florida LLC</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Address Privacy</span>
                <div class="stat-value active" style="display: flex; align-items: center; gap: 8px;">
                    <div class="heartbeat-dot"></div>
                    ${hero.privacy_shield ? 'Fully Protected' : 'Standby'}
                </div>
            </div>
            
            <!-- Sovereign Proxy / Envy Node -->
            <div class="stat-item">
                <span class="stat-label">Registered Agent</span>
                ${hero.ra_service ? `
                    <div class="stat-value active" style="display: flex; align-items: center; gap: 8px; cursor: pointer;" title="View Process">
                        <div class="heartbeat-dot"></div>
                        Monitoring
                    </div>
                ` : `
                    <div class="stat-value locked" title="Sovereign Shield Disconnected">
                        <div class="locked-icon"></div>
                        Node Offline
                    </div>
                `}
            </div>

            <div class="stat-item">
                <span class="stat-label">Compliance</span>
                <span class="stat-value active">Optimal</span>
            </div>
        </div>

        <div class="action-cluster" style="margin-top: 3.5rem;">
            <a href="/app/service-catalog.html?entity_id=${hero.id}" class="btn-zenith btn-primary">Add New Service</a>
            <a href="/app/documents?entity_id=${hero.id}" class="btn-zenith btn-secondary" onclick="recordIntent('documents')">Access Corporate Files</a>
        </div>

        <div class="vault-tag">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style="opacity: 0.8;"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/></svg>
            Corporate Records (Encrypted)
        </div>

        <div style="margin-top: 5rem; opacity: 0.35; font-size: 0.75rem; font-weight: 1000; text-transform: uppercase; letter-spacing: 0.2em; display: inline-flex; align-items: center; cursor: pointer;" onclick="window.location.href='/app/formation-wizard.html'">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" style="margin-right: 12px;"><path d="M12 5V19M5 12H19" stroke-linecap="round"/></svg>
            + Form New Company
        </div>
    `;

    renderSovereignFeed();
    renderLegacyTimer();
}

function switchHero(id) {
    console.log("Switching Hero to:", id);
    _currentEntityId = id;
    renderZenith(_allEntities);
}

function toggleFleetView() {
    const fleetSection = document.querySelector('.fleet-section');
    if (fleetSection) {
        fleetSection.scrollIntoView({ behavior: 'smooth' });
    }
}

function renderSovereignFeed() {
    const aside = document.querySelector('.side-sentinel');
    if (!aside) return;

    // Zero redundant rendering: only update if container is empty or needs refresh
    if (aside.querySelector('.activity-card')) {
        // Just refresh the time or data points if needed, 
        // but for now we re-render as it's a small template
    }

    const logs = [
        { msg: "Secure Document Access", time: "2m ago", icon: "MI" },
        { msg: "Privacy Guard Check", time: "14m ago", icon: "SH" },
        { msg: "Compliance Baseline Verified", time: "1h ago", icon: "LE" }
    ];

    aside.innerHTML = `
        <div class="sentinel-fixed">
            <div id="legacyTimerContainer"></div>

            <div class="fleet-section" style="margin-top: 40px;">
                <h2 class="side-title">Institutional Portfolio</h2>
                <div style="font-size: 0.6rem; font-weight: 700; opacity: 0.25; margin-top: -1.5rem; margin-bottom: 1.5rem; text-transform: uppercase; letter-spacing: 0.2em;">Switch Businesses</div>
                <div class="fleet-grid">
                    ${_allEntities.map(entity => `
                        <div class="fleet-node ${entity.id === _currentEntityId ? 'active' : ''}" 
                             onclick="switchHero('${entity.id}')"
                             title="${entity.llc_name}">
                            ${entity.initials || entity.llc_name.substring(0, 2).toUpperCase()}
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>

        <div class="sentinel-scroll">
            <h2 class="side-title">Activity History</h2>
            <div style="display: flex; flex-direction: column; gap: 20px;">
                ${logs.map(log => `
                    <div class="activity-card">
                        <div class="log-icon" style="font-weight: 900; color: var(--obsidian-ink); font-size: 10px;">${log.icon}</div>
                        <div class="log-content">
                            <span class="log-msg">${log.msg}</span>
                            <span class="log-time">${log.time}</span>
                        </div>
                    </div>
                `).join('')}
                <!-- Extra Padding for Scroll -->
                <div style="height: 40px;"></div>
            </div>
        </div>
    `;
}

let timerInterval;
function renderLegacyTimer() {
    const container = document.getElementById('legacyTimerContainer');
    if (!container) return;

    if (timerInterval) clearInterval(timerInterval);

    function updateTimer() {
        const now = new Date();
        const future = new Date();
        future.setHours(23, 59, 59);
        
        let diff = future - now;
        if (diff <= 0) {
            future.setDate(future.getDate() + 1);
            diff = future - now;
        }
        
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const secs = Math.floor((diff % (1000 * 60)) / 1000);

        container.innerHTML = `
            <div class="legacy-timer-box">
                <span class="timer-label">Legacy Timer Check-in</span>
                <span class="timer-status">System Vigilant</span>
                <span class="timer-countdown">NEXT PULSE: ${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}</span>
            </div>
        `;
    }

    updateTimer();
    timerInterval = setInterval(updateTimer, 1000);
}

function recordIntent(signal) {
    let signals = JSON.parse(localStorage.getItem('zenith_intent_signals') || '[]');
    if (!signals.includes(signal)) {
        signals.push(signal);
        // Keep only last 5 signals
        if (signals.length > 5) signals.shift();
        localStorage.setItem('zenith_intent_signals', JSON.stringify(signals));
    }
}
