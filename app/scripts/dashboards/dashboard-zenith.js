// Obsidian Zenith: High-Fidelity Logic Controller
console.log("ZENITH ENGINE: VERSION FORCE_RESET_999 LOADED");
console.log("Zenith Diagnostic: CONFIG Status =", typeof window.CONFIG !== 'undefined' ? 'DEFINED' : 'UNDEFINED');
// Preserves the 10/10 GUI while injecting dynamic data from Supabase

// Initialize Supabase client (Bypassed in MOCK_MODE for reliability)
if (window.CONFIG && !window.CONFIG.MOCK_MODE) {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
    script.setAttribute('crossorigin', 'anonymous');
    script.onload = () => {
        console.log("Zenith: Supabase CDN Loaded Successfully.");
        initializeDashboard();
    };
    script.onerror = (e) => {
        console.warn("Zenith: Supabase CDN failed. Forcing Legacy Mode.", e);
        initializeDashboard();
    };
    document.head.appendChild(script);
} else {
    console.log("Zenith: Mock Mode detected - skipping Supabase load.");
    setTimeout(initializeDashboard, 50); // Small delay to ensure other scripts are parsed
}

let supabase;
let _allEntities = [];
let _currentEntityId = null;
let _viewMode = 'LIVING'; // 'LIVING' or 'LEGACY'
let _currentSuccessorId = 'succ-1';

const _mockSuccessors = [
    {
        id: 'succ-1',
        name: 'Sarah Jenkins',
        relation: 'Spouse',
        initials: 'SJ',
        access: 'Full Administrative',
        status: 'Authorized',
        instructions: 'Grant full immediate access to all financial accounts and digital vaults upon verification of death certificate.'
    },
    {
        id: 'succ-2',
        name: 'James Peterson',
        relation: 'Business Partner',
        initials: 'JP',
        access: 'Operational Only',
        status: 'Restricted',
        instructions: 'Grant access to Operating Agreements and Client Lists only. No access to personal banking or family vaults.'
    }
];

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
    if (window.CONFIG.MOCK_MODE) {
        _allEntities = window.CONFIG.MOCK_ENTITIES;
    }
    
    const urlParams = new URLSearchParams(window.location.search);
    const entityId = urlParams.get('entity_id');
    
    if (entityId) {
        _currentEntityId = entityId;
    } else {
        _currentEntityId = _allEntities[0].id;
    }
    
    renderZenith(_allEntities);
}

// Precision Renderer: Bridges Logic and the 10/10 GUI
function renderZenith(entities) {
    _allEntities = entities; // Update global store
    const controlCenter = document.getElementById('controlCenter');
    if (!controlCenter) return;

    // Mode Dispatcher
    if (_viewMode === 'LEGACY') {
        renderLegacyMode();
        return;
    }

    if (!entities || entities.length === 0) return;

    // Use current ID or default to first
    if (!_currentEntityId) _currentEntityId = entities[0].id;
    const hero = entities.find(e => e.id === _currentEntityId) || entities[0];

    // Logic: Calculate Compliance Pulse (Phase 6)
    const pulse = window.ComplianceEngine.getCompliancePulse(hero);

    // LOGIC LINK: If we are the Registered Agent, Address Privacy is guaranteed.
    const isProtected = hero.ra_service || hero.privacy_shield;

    // Update Hero Data (Preserving the Machined Typography & Zero Logic Duplication)
    controlCenter.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
            <div class="switch-gear-wrap" onclick="toggleFleetView()">
                <div class="brand-eyebrow" style="margin-bottom: 0;">Corporate Command Center &mdash; Founder</div>
                <svg class="switch-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M7 15l5 5 5-5M7 9l5-5 5 5" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </div>
            
            <!-- Protocol Switch (Sovereign) -->
            <div class="protocol-switch" onclick="toggleLegacyMode()" title="Switch Protocol">
                <div class="switch-track">
                    <div class="switch-knob"></div>
                </div>
                <span class="switch-label">SOVEREIGN</span>
            </div>
        </div>
        
        <div style="display: flex; align-items: center; gap: 2rem; margin-top: 3.5rem;">
            <div style="display: flex; flex-direction: column; align-items: center; gap: 12px;">
                <div style="width: 80px; height: 80px; background: ${
                    hero.product_type === 'medical_pllc' ? 'linear-gradient(135deg, #007AFF 0%, #0055CC 100%)' : 
                    hero.product_type === 'contractor' ? 'linear-gradient(135deg, #FF6B00 0%, #CC5500 100%)' :
                    'linear-gradient(135deg, #1a1a1a 0%, #333 100%)'
                }; border-radius: 20px; display: flex; align-items: center; justify-content: center; color: white; font-size: 1.8rem; font-weight: 900; letter-spacing: 0.05em; box-shadow: 0 8px 24px rgba(0,0,0,0.12); position: relative;">
                    ${hero.initials || hero.llc_name.split(' ').map(w => w[0]).join('').substring(0,2).toUpperCase()}
                </div>
                ${hero.product_type === 'medical_pllc' ? `
                    <div style="font-size: 0.55rem; font-weight: 900; color: var(--gold-leaf, #d4af37); text-transform: uppercase; letter-spacing: 0.15em; border: 1px solid rgba(212,175,55,0.3); padding: 2px 6px; border-radius: 4px;">VIP Professional</div>
                ` : hero.product_type === 'contractor' ? `
                    <div style="font-size: 0.55rem; font-weight: 900; color: #FF6B00; text-transform: uppercase; letter-spacing: 0.15em; border: 1px solid rgba(255,107,0,0.3); padding: 2px 6px; border-radius: 4px;">Verified Trade</div>
                ` : ''}
            </div>
            <div>
                <h1 class="entity-title" style="margin: 0; font-size: 2.8rem; letter-spacing: -0.02em;">${hero.llc_name}</h1>
                <div style="font-size: 0.9rem; color: #888; margin-top: 0.4rem; font-weight: 500; display: flex; align-items: center; gap: 8px;">
                    ${hero.product_type === 'medical_pllc' ? '<span style="color: var(--accent-blue, #007AFF);">Florida Medical PLLC</span> • Stat. FL-621.02' : 
                      hero.product_type === 'contractor' ? '<span style="color: #FF6B00;">Florida Contractor LLC</span> • Stat. FL-489' : 
                      'Florida LLC'} 
                    <span style="width: 4px; height: 4px; background: #ccc; border-radius: 50%;"></span>
                    <span style="color: var(--accent-green, #00c853); font-weight: 700;">${hero.llc_status || 'Active'}</span>
                </div>
            </div>
        </div>


        <!-- HERO STATS STRIP (Consolidated) -->
        <div style="display: flex; gap: 3rem; margin-top: 3rem; padding: 1.5rem 0; border-top: 1px solid #eee; border-bottom: 1px solid #eee;">
            <div>
                <div style="font-size: 0.6rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.15em; color: #aaa; margin-bottom: 0.5rem;">Privacy Guard</div>
                <div style="display: flex; align-items: center; gap: 8px;">
                    <div style="width: 8px; height: 8px; background: ${isProtected ? 'var(--accent-green, #00c853)' : '#d32f2f'}; border-radius: 50%; box-shadow: 0 0 8px ${isProtected ? 'var(--accent-green, #00c853)' : '#d32f2f'};"></div>
                    <span style="font-size: 0.95rem; font-weight: 700; color: #111;">${isProtected ? 'Secured' : 'Exposed'}</span>
                </div>
            </div>
            
            <div>
                <div style="font-size: 0.6rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.15em; color: #aaa; margin-bottom: 0.5rem;">State Standing</div>
                <div style="display: flex; align-items: center; gap: 8px;">
                    <div style="width: 8px; height: 8px; background: var(--accent-green, #00c853); border-radius: 50%; box-shadow: 0 0 8px var(--accent-green, #00c853);"></div>
                    <span style="font-size: 0.95rem; font-weight: 700; color: #111;">Optimal</span>
                </div>
            </div>

            ${hero.product_type === 'medical_pllc' ? `
                <div>
                    <div style="font-size: 0.6rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.15em; color: #aaa; margin-bottom: 0.5rem;">Compliance Tools</div>
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--accent-green, #00c853)" stroke-width="3"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                        <span style="font-size: 0.95rem; font-weight: 700; color: #111;">Active</span>
                    </div>
                </div>
                <div>
                    <div style="font-size: 0.6rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.15em; color: #aaa; margin-bottom: 0.5rem;">Renewal Gate</div>
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <span style="font-size: 0.95rem; font-weight: 700; color: #555;">Oct 2026</span>
                    </div>
                </div>
            ` : hero.product_type === 'contractor' ? `
                <div>
                    <div style="font-size: 0.6rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.15em; color: #aaa; margin-bottom: 0.5rem;">DBPR License</div>
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#FF6B00" stroke-width="3"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path></svg>
                        <span style="font-size: 0.95rem; font-weight: 700; color: #111;">Active</span>
                    </div>
                </div>
                <div>
                    <div style="font-size: 0.6rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.15em; color: #aaa; margin-bottom: 0.5rem;">Renewal Period</div>
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <span style="font-size: 0.95rem; font-weight: 700; color: #555;">Aug 2026</span>
                    </div>
                </div>
            ` : ''}
        </div>

        <!-- ACTION BUTTONS -->
        <div class="action-cluster" style="margin-top: 2.5rem; display: flex; gap: 1.2rem; align-items: center;">
            <a href="/app/service-catalog.html?entity_id=${hero.id}" class="btn-zenith btn-primary" style="background: var(--gold-leaf, #d4af37); border-color: var(--gold-leaf, #d4af37); color: black; box-shadow: 0 4px 12px rgba(212,175,55,0.3); transition: all 0.2s; text-decoration: none; font-weight: 800; padding: 12px 24px;" onmouseover="this.style.boxShadow='0 6px 16px rgba(212,175,55,0.4)'; this.style.transform='translateY(-1px)';" onmouseout="this.style.boxShadow='0 4px 12px rgba(212,175,55,0.3)'; this.style.transform='translateY(0)';">Add New Service</a>
            <a href="/app/oa-builder.html?entity_id=${hero.id}" class="btn-zenith btn-secondary" style="border: 1px solid #ddd; background: transparent; transition: all 0.2s; text-decoration: none; font-weight: 600; padding: 12px 24px;" onmouseover="this.style.background='rgba(0,0,0,0.03)';" onmouseout="this.style.background='transparent';">Draft Operating Agreement</a>
            <a href="/app/minutes-ledger.html?entity_id=${hero.id}" class="btn-zenith btn-secondary" style="border: 1px solid #ddd; background: transparent; transition: all 0.2s; text-decoration: none; font-weight: 600; padding: 12px 24px;" onmouseover="this.style.background='rgba(0,0,0,0.03)';" onmouseout="this.style.background='transparent';">Minutes Ledger</a>
            <a href="/app/legacy-builder.html" class="btn-zenith btn-secondary" style="border: 1px solid #ddd; background: transparent; transition: all 0.2s; text-decoration: none; font-weight: 600; padding: 12px 24px;" onmouseover="this.style.background='rgba(0,0,0,0.03)';" onmouseout="this.style.background='transparent';">Personal Estate Plan</a>
        </div>

        <!-- COMPLIANCE PULSE (PHASE 6) -->
        <div style="margin-top: 3.5rem; background: rgba(0,0,0,0.01); border-radius: 20px; padding: 2rem; border: 1px solid rgba(0,0,0,0.03);">
            <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 2rem;">
                <div>
                    <div style="font-size: 0.65rem; font-weight: 900; text-transform: uppercase; letter-spacing: 0.25em; color: #aaa; margin-bottom: 0.75rem;">Compliance Pulse</div>
                    <div style="font-size: 2.2rem; font-weight: 900; color: var(--obsidian-ink); display: flex; align-items: center; gap: 16px; letter-spacing: -0.02em;">
                        ${pulse.healthScore}% 
                        <span style="font-size: 0.75rem; font-weight: 800; color: ${pulse.pulseColor}; text-transform: uppercase; letter-spacing: 0.12em; background: ${pulse.pulseColor}15; padding: 6px 14px; border-radius: 8px; border: 1px solid ${pulse.pulseColor}30;">
                            ${pulse.healthScore === 100 ? 'Optimal' : pulse.healthScore > 80 ? 'Good' : pulse.healthScore > 50 ? 'Action Required' : 'Critical'}
                        </span>
                    </div>
                </div>
                <div style="width: 160px; height: 8px; background: #eee; border-radius: 4px; overflow: hidden; box-shadow: inset 0 1px 2px rgba(0,0,0,0.05);">
                    <div style="width: ${pulse.healthScore}%; height: 100%; background: ${pulse.pulseColor}; transition: width 1s cubic-bezier(0.65, 0, 0.35, 1); box-shadow: 0 0 12px ${pulse.pulseColor}66;"></div>
                </div>
            </div>

            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1.5rem;">
                ${pulse.alerts.length > 0 ? pulse.alerts.map(alert => `
                    <div class="compliance-alert-card" style="background: white; border: 1px solid #eee; border-radius: 18px; padding: 1.5rem; display: flex; flex-direction: column; gap: 14px; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); cursor: pointer;" 
                         onmouseover="this.style.borderColor='${alert.type === 'critical' ? '#FF3B30' : alert.type === 'warning' ? '#FF9500' : '#ddd'}'; this.style.boxShadow='0 12px 24px rgba(0,0,0,0.06)'; this.style.transform='translateY(-2px)';" 
                         onmouseout="this.style.borderColor='#eee'; this.style.boxShadow='none'; this.style.transform='translateY(0)';"
                         onclick="${alert.link ? `window.open('${alert.link}', '_blank')` : `window.location.href='/app/maintenance-wizard.html?entity_id=${hero.id}&action=${alert.action}'`}">
                        <div style="display: flex; align-items: center; justify-content: space-between;">
                            <div style="display: flex; align-items: center; gap: 10px;">
                                <div style="width: 10px; height: 10px; background: ${alert.type === 'critical' ? '#FF3B30' : alert.type === 'warning' ? '#FF9500' : '#007AFF'}; border-radius: 50%; box-shadow: 0 0 8px ${alert.type === 'critical' ? '#FF3B3066' : alert.type === 'warning' ? '#FF950066' : '#007AFF66'};"></div>
                                <span style="font-size: 0.7rem; font-weight: 900; text-transform: uppercase; letter-spacing: 0.1em; color: ${alert.type === 'critical' ? '#FF3B30' : alert.type === 'warning' ? '#FF9500' : '#111'};">${alert.title}</span>
                            </div>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ccc" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                        </div>
                        <p style="font-size: 0.9rem; line-height: 1.6; color: #555; margin: 0; font-weight: 500;">${alert.text}</p>
                        <div style="font-size: 0.75rem; font-weight: 800; color: var(--accent-blue, #007AFF); text-transform: uppercase; letter-spacing: 0.05em; margin-top: 4px;">${alert.cta}</div>
                    </div>
                `).join('') : `
                    <div style="grid-column: 1 / -1; padding: 3rem; border: 2px dashed #eee; border-radius: 18px; text-align: center; color: #aaa; background: rgba(255,255,255,0.5);">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-bottom: 16px; opacity: 0.3;"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                        <div style="font-size: 0.9rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em;">Statutory Integrity Verified</div>
                        <p style="font-size: 0.8rem; margin-top: 8px; opacity: 0.6;">No critical filings active at this interval.</p>
                    </div>
                `}
            </div>
        </div>

        <!-- STRATEGIC ACTIONS (PHASE 5) -->
        <div style="margin-top: 3.5rem; background: linear-gradient(135deg, #fdfdfd 0%, #f7f7f7 100%); border: 1px solid #eee; border-radius: 20px; padding: 2rem; box-shadow: 0 4px 12px rgba(0,0,0,0.02);">
            <div style="font-size: 0.65rem; font-weight: 900; text-transform: uppercase; letter-spacing: 0.3em; color: #bbb; margin-bottom: 1.5rem;">Strategic Actions Zone (Critical)</div>
            <div style="display: flex; gap: 2.5rem; align-items: center;">
                <a href="/app/merger-wizard.html?entity_id=${hero.id}" style="font-size: 0.9rem; font-weight: 800; color: var(--obsidian-ink); text-decoration: none; display: flex; align-items: center; gap: 10px; transition: all 0.2s;" onmouseover="this.style.color='var(--gold-leaf, #d4af37)'; this.style.transform='translateX(4px)';" onmouseout="this.style.color='var(--obsidian-ink)'; this.style.transform='translateX(0)';">
                    <div style="width: 32px; height: 32px; background: white; border-radius: 8px; border: 1px solid #eee; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 4px rgba(0,0,0,0.03);">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M11 21v-7a2 2 0 0 0-2-2H2"/><path d="M19 21v-7a2 2 0 0 0-2-2h-6"/><path d="M11 3v4a2 2 0 0 0 2 2h9"/></svg>
                    </div>
                    Articles of Merger
                </a>
                <a href="/app/conversion-wizard.html?entity_id=${hero.id}" style="font-size: 0.9rem; font-weight: 800; color: var(--obsidian-ink); text-decoration: none; display: flex; align-items: center; gap: 10px; transition: all 0.2s;" onmouseover="this.style.color='var(--gold-leaf, #d4af37)'; this.style.transform='translateX(4px)';" onmouseout="this.style.color='var(--obsidian-ink)'; this.style.transform='translateX(0)';">
                    <div style="width: 32px; height: 32px; background: white; border-radius: 8px; border: 1px solid #eee; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 4px rgba(0,0,0,0.03);">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
                    </div>
                    Entity Conversion
                </a>
                <a href="/app/maintenance-wizard.html?entity_id=${hero.id}&action=dissolution" style="font-size: 0.9rem; font-weight: 800; color: #FF3B30; text-decoration: none; display: flex; align-items: center; gap: 10px; transition: all 0.2s; opacity: 0.8;" onmouseover="this.style.opacity='1'; this.style.transform='translateX(4px)';" onmouseout="this.style.opacity='0.8'; this.style.transform='translateX(0)';" onclick="return confirm('WARNING: Dissolution is a permanent statutory action. Proceed to wind-down plan?')">
                    <div style="width: 32px; height: 32px; background: #fff5f5; border-radius: 8px; border: 1px solid #fee2e2; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 4px rgba(255,0,0,0.03);">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18.36 6.64a9 9 0 1 1-12.73 0"/><line x1="12" y1="2" x2="12" y2="12"/></svg>
                    </div>
                    Dissolve Entity
                </a>
            </div>
        </div>

        <!-- VAULT TAG -->
        <div class="vault-tag" style="margin-top: 3rem; display: inline-flex; align-items: center; gap: 12px; background: #fafafa; padding: 10px 16px; border-radius: 8px; border: 1px solid #eee; cursor: pointer; transition: all 0.2s;" onclick="window.location.href='/app/document-vault.html'" onmouseover="this.style.borderColor='var(--gold-leaf, #d4af37)'; this.style.background='white';" onmouseout="this.style.borderColor='#eee'; this.style.background='#fafafa';">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style="opacity: 0.4;"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/></svg>
            <span style="font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; opacity: 0.6;">Corporate Vault</span>
            <span style="font-size: 0.7rem; font-weight: 600; color: var(--gold-leaf, #d4af37);">Decrypted Access →</span>
        </div>

        <!-- FORM NEW COMPANY -->
        <div style="margin-top: 2rem; display: flex; gap: 24px; align-items: center;">
            <div style="display: inline-flex; align-items: center; cursor: pointer; opacity: 0.5; transition: opacity 0.2s;" onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0.5'" onclick="window.location.href='/app/formation-wizard.html'">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="margin-right: 8px;"><path d="M12 5V19M5 12H19" stroke-linecap="round"/></svg>
                <span style="font-size: 0.7rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em;">Standard LLC</span>
            </div>
            <div style="display: inline-flex; align-items: center; cursor: pointer; opacity: 0.5; transition: opacity 0.2s; color: var(--gold-leaf, #d4af37);" onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0.5'" onclick="window.location.href='/app/formation-pllc-wizard.html'">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="margin-right: 8px;"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
                <span style="font-size: 0.7rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em;">Professional PLLC</span>
            </div>
        </div>
    `;

    renderSovereignFeed();
    renderLegacyTimer();
    updateToggleUI();
}

function toggleLegacyMode() {
    _viewMode = _viewMode === 'LIVING' ? 'LEGACY' : 'LIVING';
    // Visual transition handled by render
    renderZenith(_allEntities);
}

// Legacy Setup State
let _legacySetupComplete = false;
let _tempMasterKey = null;
let _tempShardA = null;
let _tempShardC = null;

function renderLegacySetupWizard() {
    controlCenter.innerHTML = `
        <div style="max-width: 600px; margin: 0 auto; text-align: center;">
            <div style="font-size: 0.8rem; font-weight: 900; color: var(--gold-leaf, #d4af37); text-transform: uppercase; letter-spacing: 0.2em; margin-bottom: 1rem;">Legacy Vault Setup</div>
            <h1 style="font-size: 2.5rem; letter-spacing: -0.05em; margin-bottom: 1.5rem;">Mint Your Legacy Key</h1>
            <p style="opacity: 0.5; line-height: 1.6; margin-bottom: 3rem; max-width: 450px; margin-left: auto; margin-right: auto;">
                You are about to generate a <strong>Cryptographic Shard</strong>. This ensures that even we cannot read your private letters. 
                <br><br>
                The system will generate a Master Key locally on your device, split it into two pieces, and then <strong>permanently forget</strong> the Master Key.
            </p>

            <div id="wizardStage">
                <button class="btn-zenith btn-primary" onclick="runKeyGeneration()" style="background: var(--gold-leaf, #d4af37); border-color: var(--gold-leaf, #d4af37); color: black; min-width: 200px;">
                    Generate Keys
                </button>
            </div>
        </div>
    `;
}

async function runKeyGeneration() {
    const stage = document.getElementById('wizardStage');
    if (!stage) return;

    stage.innerHTML = `
        <div style="display: flex; flex-direction: column; align-items: center; gap: 20px;">
            <div class="spinner"></div> 
            <div style="font-size: 0.9rem; font-weight: 600; animation: pulse 1.5s infinite;">Forging Cryptographic Shards...</div>
        </div>
    `;

    // Simulate compute time for "weight"
    await new Promise(r => setTimeout(r, 2000));

    // 1. Generate Keys via Crypto Engine
    if (window.LegacyCrypto) {
        _tempMasterKey = LegacyCrypto.generateMasterKey();
        _tempShardA = LegacyCrypto.generateShardA(); // In prod, fetch from server
        _tempShardC = LegacyCrypto.deriveShardC(_tempMasterKey, _tempShardA);
        
        console.log("Keys Generated. Wiping Master Key from view, keeping only for specific print step.");
    }

    // 2. Show Result
    renderPrintStep();
}

function renderPrintStep() {
    const shardCHex = window.LegacyCrypto ? LegacyCrypto.toHex(_tempShardC) : "ERROR_NO_CRYPTO_ENGINE";

    // Inject Print Styles
    const styleId = 'zenith-print-styles';
    if (!document.getElementById(styleId)) {
        const css = `
            @media print {
                body * { visibility: hidden; }
                .zenith-print-context, .zenith-print-context * { visibility: visible; }
                .zenith-print-context { 
                    position: absolute; 
                    left: 0; 
                    top: 0; 
                    width: 100%; 
                    margin: 0;
                    padding: 40px;
                    background: white;
                    color: black !important;
                    font-family: sans-serif;
                }
                .no-print { display: none !important; }
                .print-only { display: block !important; }
                
                /* Reset colors for print */
                h1, h3, div { color: black !important; }
            }
            .print-only { display: none; }
        `;
        const style = document.createElement('style');
        style.id = styleId;
        style.type = 'text/css';
        style.appendChild(document.createTextNode(css));
        document.head.appendChild(style);
    }

    controlCenter.innerHTML = `
        <div class="zenith-print-context" style="max-width: 650px; margin: 0 auto; text-align: center;">
            
            <!-- Header -->
            <div style="margin-bottom: 3rem;">
                 <div style="font-size: 0.8rem; font-weight: 900; color: var(--gold-leaf, #d4af37); text-transform: uppercase; letter-spacing: 0.2em; margin-bottom: 1rem;">Official Recovery Document</div>
                 <h1 style="font-size: 2.5rem; margin-bottom: 0.5rem; color: black;">Legacy Access Key</h1>
                 <p class="no-print" style="opacity: 0.7;">This QR code is the physical key to your vault. Print it and store it safely.</p>
            </div>

            <!-- The Artifact (QR) -->
            <div style="border: 2px solid #000; padding: 2rem; display: inline-block; margin-bottom: 3rem; text-align: center; width: 100%; max-width: 400px;">
                <div style="width: 180px; height: 180px; background: white; border: 4px solid #000; display: flex; align-items: center; justify-content: center; margin: 0 auto 1.5rem auto;">
                     <!-- Actual QR would go here, using SVG icon for now -->
                     <svg width="80" height="80" viewBox="0 0 24 24" fill="black"><path d="M3 3h18v18H3V3zm16 16V5H5v14h14zM7 7h10v10H7V7zm2 2v6h6V9H9z"/></svg>
                </div>
                <div style="font-family: 'Courier New', monospace; font-size: 1rem; font-weight: bold; color: black; letter-spacing: 2px; word-break: break-all;">
                    ${shardCHex.substring(0, 16)}...
                </div>
                <div style="font-size: 0.6rem; text-transform: uppercase; margin-top: 10px; font-weight: 700;">Shard C // Client-Side Key</div>
            </div>

            <!-- Print-Only Instructions -->
            <div class="print-only" style="text-align: left; border-top: 2px solid black; padding-top: 2rem; margin-top: 1rem;">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 40px;">
                    <div>
                        <h3 style="font-weight: 900; text-transform: uppercase; margin-bottom: 10px; font-size: 0.9rem;">Instructions</h3>
                        <p style="font-size: 0.9rem; line-height: 1.6;">
                            1. Store this sheet in a waterproof, fireproof safety deposit box.<br>
                            2. Do not scan or save this sheet to any cloud drive.<br>
                            3. Inform your Legacy Contact of its physical location.
                        </p>
                    </div>
                    <div>
                        <h3 style="font-weight: 900; text-transform: uppercase; margin-bottom: 10px; font-size: 0.9rem;">Urgent Warning</h3>
                        <p style="font-size: 0.9rem; line-height: 1.6; font-weight: bold;">
                            This is the ONLY copy of your key. Charter Legacy does NOT store this key. If this document is lost, your vault is permanently inaccessible.
                        </p>
                    </div>
                </div>
            </div>

            <!-- On-Screen Controls -->
            <div class="no-print" style="display: flex; justify-content: center; gap: 15px; margin-top: 2rem;">
                <button class="btn-zenith btn-secondary" onclick="window.print()">Print Recovery Sheet</button>
                <button class="btn-zenith btn-primary" onclick="finalizeSetup()" style="background: var(--gold-leaf, #d4af37); border-color: var(--gold-leaf, #d4af37); color: black;">
                    Confirm & Wipe Memory
                </button>
            </div>
        </div>
    `;
}

function finalizeSetup() {
    // Wipe keys
    if (window.LegacyCrypto) {
        LegacyCrypto.wipeKey(_tempMasterKey);
        LegacyCrypto.wipeKey(_tempShardA);
        LegacyCrypto.wipeKey(_tempShardC);
    }
    _tempMasterKey = null;
    _tempShardA = null;
    _tempShardC = null;
    
    _legacySetupComplete = true;
    renderLegacyMode();
}


function updateToggleUI() {
    const label = document.querySelector('.switch-label');
    const track = document.querySelector('.switch-track');
    
    if (_viewMode === 'LEGACY') {
        if (label) label.textContent = 'LEGACY';
        if (track) track.classList.add('active');
        document.body.classList.add('legacy-mode');
    } else {
        if (label) label.textContent = 'SOVEREIGN';
        if (track) track.classList.remove('active');
        document.body.classList.remove('legacy-mode');
    }
}

function renderLegacyMode() {
    const activeSuccessor = _mockSuccessors.find(s => s.id === _currentSuccessorId) || _mockSuccessors[0];

    controlCenter.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center;">
            <div class="brand-eyebrow" style="margin-bottom: 0;">Succession Protocol &mdash; Active</div>
            
             <!-- Protocol Switch (Legacy) -->
            <div class="protocol-switch" onclick="toggleLegacyMode()" title="Switch Protocol">
                <div class="switch-track active">
                    <div class="switch-knob"></div>
                </div>
                <span class="switch-label">LEGACY</span>
            </div>
        </div>
        
        <h1 class="entity-title" style="color: var(--gold-leaf, #d4af37); white-space: normal; overflow: visible; line-height: 1.1; margin-top: 0;">${activeSuccessor.name}</h1>

        <div class="hero-meta">
            <div class="stat-item">
                <span class="stat-label">Relation</span>
                <span class="stat-value active">${activeSuccessor.relation}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Access Level</span>
                <div class="stat-value active" style="display: flex; align-items: center; gap: 8px;">
                     <div class="heartbeat-dot" style="background: var(--gold-leaf, #d4af37); box-shadow: 0 0 10px var(--gold-leaf, #d4af37);"></div>
                    ${activeSuccessor.access}
                </div>
            </div>
            
            <div class="stat-item">
                <span class="stat-label">Auth Status</span>
                 <div class="stat-value">${activeSuccessor.status}</div>
            </div>
        </div>

        <div style="background: rgba(212, 175, 55, 0.05); border: 1px solid rgba(212, 175, 55, 0.2); border-radius: 12px; padding: 1.5rem; margin-top: 1rem; margin-bottom: 3rem;">
            <div style="font-size: 0.65rem; font-weight: 900; text-transform: uppercase; letter-spacing: 0.2em; color: var(--gold-leaf, #d4af37); margin-bottom: 0.8rem;">Directives</div>
            <p style="font-size: 0.9rem; line-height: 1.5; opacity: 0.8;">${activeSuccessor.instructions}</p>
        </div>

        <div class="action-cluster" style="margin-top: 3.5rem;">
            <button onclick="renderStepUpAuth(renderSealedVaultHelper)" class="btn-zenith btn-primary" style="background: var(--gold-leaf, #d4af37); border-color: var(--gold-leaf, #d4af37); color: black;">Enter Vault</button>
            <button onclick="renderStepUpAuth(() => renderSuccessorEditor('${activeSuccessor.id}'))" class="btn-zenith btn-secondary">Edit Permissions</button>
        </div>
    `;

    // Sidebar Update
    const aside = document.querySelector('.side-sentinel');
    if (aside) {
        aside.innerHTML = `
            <div class="sentinel-fixed">
                <div id="legacyTimerContainer"></div>

                <div class="fleet-section" style="margin-top: 40px;">
                    <h2 class="side-title">Designated Successors</h2>
                    <div style="font-size: 0.6rem; font-weight: 700; opacity: 0.25; margin-top: -1.5rem; margin-bottom: 1.5rem; text-transform: uppercase; letter-spacing: 0.2em;">Keyholders</div>
                    <div class="fleet-grid">
                        ${_mockSuccessors.map(s => `
                            <div class="fleet-node ${s.id === _currentSuccessorId ? 'active' : ''}" 
                                 title="${s.name} (${s.relation})" 
                                 onclick="switchSuccessor('${s.id}')"
                                 style="${s.id === _currentSuccessorId ? 'background: var(--gold-leaf, #d4af37); border-color: var(--gold-leaf, #d4af37); box-shadow: 0 0 15px rgba(212, 175, 55, 0.4); border: 1px solid white;' : ''}">
                                ${s.initials}
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>

            <div class="sentinel-scroll">
                <h2 class="side-title">Activation Protocol</h2>
                <div style="display: flex; flex-direction: column; gap: 20px;">
                    <div class="activity-card">
                        <div class="log-icon" style="color: var(--gold-leaf, #d4af37); background: rgba(212, 175, 55, 0.1);">01</div>
                        <div class="log-content">
                            <span class="log-msg">System Check</span>
                            <span class="log-time" style="color: var(--accent-green);">PASSED &bull; TODAY</span>
                        </div>
                    </div>
                    <div class="activity-card" style="opacity: 0.6;">
                        <div class="log-icon">07</div>
                        <div class="log-content">
                            <span class="log-msg">Inactivity Warning</span>
                            <span class="log-time">PENDING &bull; DAY 7</span>
                        </div>
                    </div>
                     <div class="activity-card" style="opacity: 0.3;">
                        <div class="log-icon">15</div>
                        <div class="log-content">
                            <span class="log-msg">Transfer of Control</span>
                            <span class="log-time">LOCKED &bull; DAY 15</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
        renderLegacyTimer();
    }

    // Logic: If Setup not complete, show nudge
    if (!_legacySetupComplete) {
        const actionCluster = document.querySelector('.action-cluster');
        if (actionCluster) {
            actionCluster.innerHTML = `
                <div style="background: rgba(212, 175, 55, 0.1); border: 1px dashed var(--gold-leaf, #d4af37); padding: 1.5rem; border-radius: 12px; text-align: left;">
                    <h3 style="color: var(--gold-leaf, #d4af37); margin-bottom: 0.5rem;">Protect Your Legacy</h3>
                    <p style="font-size: 0.9rem; margin-bottom: 1rem; opacity: 0.8;">Complete the final step to guarantee that your stories and assets will reach your family when the time comes.</p>
                    <button class="btn-zenith btn-primary" onclick="renderLegacySetupWizard()" style="background: var(--gold-leaf, #d4af37); border-color: var(--gold-leaf, #d4af37); color: black;">Start Setup</button>
                </div>
            `;
        }
    }
}

// --- SECURITY GATE (Step-Up Auth) ---
function renderStepUpAuth(onSuccess) {
    const modalId = 'zenith-auth-modal';
    if (document.getElementById(modalId)) return; // Prevent double open

    const modal = document.createElement('div');
    modal.id = modalId;
    modal.style.cssText = `
        position: fixed; inset: 0; background: rgba(0,0,0,0.8); backdrop-filter: blur(10px);
        display: flex; align-items: center; justify-content: center; z-index: 10000;
        animation: fadeIn 0.3s ease-out;
    `;

    modal.innerHTML = `
        <div style="background: white; width: 100%; max-width: 400px; padding: 2rem; border-radius: 12px; text-align: center; box-shadow: 0 20px 50px rgba(0,0,0,0.5);">
            <div style="width: 40px; height: 40px; background: #000; color: #fff; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1.5rem auto;">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
            </div>
            <h2 style="margin: 0 0 0.5rem 0; font-size: 1.5rem;">Vault Locked</h2>
            <p style="margin: 0 0 1.5rem 0; opacity: 0.6; font-size: 0.9rem;">Please confirm your identity to proceed.</p>
            
            <input type="password" id="auth-password" placeholder="Enter Password" 
                style="width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 8px; margin-bottom: 1rem; font-size: 1rem; outline: none;">
            
            <button id="auth-submit" class="btn-zenith btn-primary" style="width: 100%; background: black; color: white; border: none;">Unlock Vault</button>
            <button onclick="document.getElementById('${modalId}').remove()" style="background: none; border: none; margin-top: 1rem; color: #666; cursor: pointer; font-size: 0.8rem;">Cancel</button>
        </div>
    `;

    document.body.appendChild(modal);

    const input = modal.querySelector('#auth-password');
    const submit = modal.querySelector('#auth-submit');

    const attemptAuth = () => {
        const val = input.value;
        if (val === 'password' || val === 'admin') { // Mock Auth
            // Success
            modal.remove();
            if (window.LegacyAudit) LegacyAudit.logAction('ACCESS', 'VAULT_UNLOCK', 'User successfully authenticated via Step-Up Auth', 'USER');
            onSuccess();
        } else {
            // Shake animation
            input.style.borderColor = 'red';
            input.animate([
                { transform: 'translateX(0)' },
                { transform: 'translateX(-10px)' },
                { transform: 'translateX(10px)' },
                { transform: 'translateX(0)' }
            ], { duration: 300 });
        }
    };

    submit.onclick = attemptAuth;
    input.onkeypress = (e) => { if (e.key === 'Enter') attemptAuth(); };
    input.focus();
}

function renderSealedVaultHelper() {
    // Audit Log: Record Access
    if (window.LegacyAudit) LegacyAudit.logAction('ACCESS', 'SESSION_START', 'Authorized access to Sealed Vault', 'USER');

    const mockArtifacts = [
        { name: 'Last Will & Testament.pdf', size: '2.4 MB', date: '2025-11-02', type: 'doc' },
        { name: 'Deed_Aspen_Property.pdf', size: '4.1 MB', date: '2024-08-15', type: 'doc' },
        { name: 'Crypto_Cold_Storage.dat', size: '12 KB', date: '2025-12-10', type: 'key' },
        { name: 'Letter_to_Sarah.mp4', size: '145 MB', date: '2026-01-15', type: 'video' }
    ];

    const logs = window.LegacyAudit ? LegacyAudit.getLogs() : [];

    controlCenter.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
            <div>
                <div style="font-size: 0.6rem; font-weight: 900; color: var(--accent-green); text-transform: uppercase; letter-spacing: 0.2em; display: flex; align-items: center; gap: 6px;">
                    <div style="width: 6px; height: 6px; background: var(--accent-green); border-radius: 50%; box-shadow: 0 0 8px var(--accent-green);"></div>
                    Decrypted Session Active
                </div>
                <h1 style="font-size: 2rem; margin-top: 0.5rem;">The Vault</h1>
            </div>
            <button class="btn-zenith btn-secondary" onclick="location.reload()">Lock & Exit</button>
        </div>

        <div style="display: flex; gap: 20px; border-bottom: 1px solid rgba(0,0,0,0.1); margin-bottom: 2rem;">
            <div style="padding-bottom: 10px; border-bottom: 2px solid black; font-weight: 700; cursor: pointer;">Artifacts</div>
            <div style="padding-bottom: 10px; color: #999; cursor: pointer;" onclick="alert('Feature coming in next sprint')">Directives</div>
            <div style="padding-bottom: 10px; color: #999; cursor: pointer;" onclick="renderAuditView()">Audit Log</div>
        </div>

        <div style="background: white; border-radius: 12px; border: 1px solid rgba(0,0,0,0.05); overflow: hidden;">
            ${mockArtifacts.map(file => `
                <div style="display: flex; align-items: center; justify-content: space-between; padding: 1.5rem; border-bottom: 1px solid rgba(0,0,0,0.05); transition: background 0.2s;" onmouseover="this.style.background='#f9f9f9'" onmouseout="this.style.background='white'">
                    <div style="display: flex; align-items: center; gap: 15px;">
                        <div style="width: 40px; height: 40px; background: #eee; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 1.2rem;">
                            ${file.type === 'doc' ? '📄' : file.type === 'key' ? '🔑' : '🎬'}
                        </div>
                        <div>
                            <div style="font-weight: 700; font-size: 0.9rem;">${file.name}</div>
                            <div style="font-size: 0.7rem; opacity: 0.5;">Size: ${file.size} • Last Modified: ${file.date}</div>
                        </div>
                    </div>
                    <button style="border: none; background: none; opacity: 0.3; cursor: pointer; font-weight: 900;">•••</button>
                </div>
            `).join('')}
            
            <div style="padding: 1.5rem; text-align: center; border-top: 1px dashed rgba(0,0,0,0.1); color: #888; cursor: pointer;" onclick="alert('Upload Encrypted Asset')">
                + Upload New Asset to Vault
            </div>
        </div>
    `;

    // Sidebar update is handled by the main render call context, or we can force it here if needed.
    // For now, let's just make sure the side sentinel is showing logs if we are in vault mode.
    // But since this replaces controlCenter, the side sentinel is outside.
    // I added side-sentinel update logic in the previous "Debug" version, so I should add it here too.
    
     const aside = document.querySelector('.side-sentinel');
    if (aside) {
        aside.innerHTML = `
            <h2 class="side-title">Live Audit Feed</h2>
            <div class="sentinel-scroll">
                ${logs.slice(0, 5).map(log => `
                    <div class="activity-card" style="margin-bottom: 1rem; padding: 1rem; border-left: 3px solid ${log.type === 'SECURITY' ? '#000' : '#ddd'};">
                        <div class="log-content">
                            <div class="log-msg" style="font-size: 0.75rem;">${log.action}</div>
                            <div class="log-time" style="font-size: 0.6rem;">${log.timestamp.split('T')[1].substring(0,8)}</div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }
}

function renderAuditView() {
    const logs = window.LegacyAudit ? LegacyAudit.getLogs() : [];
    controlCenter.innerHTML = `
        <div style="margin-bottom: 2rem;">
            <button onclick="renderSealedVaultHelper()" style="background:none; border:none; font-weight:700; opacity:0.5; margin-bottom:1rem; cursor:pointer;">← Back to Files</button>
            <h1 style="font-size: 2rem;">Immutable Audit Ledger</h1>
        </div>
        <div style="background: black; color: white; border-radius: 12px; padding: 2rem; font-family: monospace; height: 500px; overflow-y: auto;">
            ${logs.map(log => `
                <div style="margin-bottom: 1rem; padding-bottom: 1rem; border-bottom: 1px solid rgba(255,255,255,0.1);">
                    <div style="color: #666; font-size: 0.7rem;">[${log.timestamp}] • ID: ${log.id}</div>
                    <div style="color: var(--gold-leaf, #d4af37); font-weight: bold;">${log.action}</div>
                    <div style="opacity: 0.8;">${log.desc}</div>
                    <div style="color: #666; font-size: 0.7rem; margin-top: 4px;">USER: ${log.user} | TYPE: ${log.type}</div>
                </div>
            `).join('')}
        </div>
    `;
}


function switchSuccessor(id) {
    _currentSuccessorId = id;
    renderLegacyMode();
}

function renderSuccessorEditor(id) {
    const successor = _mockSuccessors.find(s => s.id === id);
    if (!successor) return;

    controlCenter.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2rem;">
            <div class="brand-eyebrow" style="margin-bottom: 0; cursor: pointer;" onclick="renderLegacyMode()">&larr; Back to Protocol</div>
        </div>

        <h1 class="entity-title" style="color: var(--gold-leaf, #d4af37); font-size: 2.5rem;">Edit Permissions</h1>
        
        <div style="background: white; padding: 2rem; border-radius: 20px; box-shadow: 0 4px 20px rgba(0,0,0,0.05);">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 1.5rem;">
                <div style="display: flex; flex-direction: column; gap: 8px;">
                    <label style="font-size: 0.7rem; font-weight: 700; text-transform: uppercase;">Full Name</label>
                    <input type="text" id="editName" value="${successor.name}" style="padding: 12px; border-radius: 8px; border: 1px solid #ddd; font-weight: 600;">
                </div>
                <div style="display: flex; flex-direction: column; gap: 8px;">
                    <label style="font-size: 0.7rem; font-weight: 700; text-transform: uppercase;">Relation</label>
                    <input type="text" id="editRelation" value="${successor.relation}" style="padding: 12px; border-radius: 8px; border: 1px solid #ddd; font-weight: 600;">
                </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 1.5rem;">
                <div style="display: flex; flex-direction: column; gap: 8px;">
                    <label style="font-size: 0.7rem; font-weight: 700; text-transform: uppercase;">Access Level</label>
                    <select id="editAccess" style="padding: 12px; border-radius: 8px; border: 1px solid #ddd; font-weight: 600;">
                        <option value="Full Administrative" ${successor.access === 'Full Administrative' ? 'selected' : ''}>Full Administrative</option>
                        <option value="Operational Only" ${successor.access === 'Operational Only' ? 'selected' : ''}>Operational Only</option>
                        <option value="Read Only" ${successor.access === 'Read Only' ? 'selected' : ''}>Read Only</option>
                        <option value="Financial Only" ${successor.access === 'Financial Only' ? 'selected' : ''}>Financial Only</option>
                    </select>
                </div>
                <div style="display: flex; flex-direction: column; gap: 8px;">
                    <label style="font-size: 0.7rem; font-weight: 700; text-transform: uppercase;">Auth Status</label>
                    <select id="editStatus" style="padding: 12px; border-radius: 8px; border: 1px solid #ddd; font-weight: 600;">
                        <option value="Authorized" ${successor.status === 'Authorized' ? 'selected' : ''}>Authorized</option>
                        <option value="Restricted" ${successor.status === 'Restricted' ? 'selected' : ''}>Restricted</option>
                        <option value="Pending" ${successor.status === 'Pending' ? 'selected' : ''}>Pending</option>
                    </select>
                </div>
            </div>

            <div style="display: flex; flex-direction: column; gap: 8px; margin-bottom: 2rem;">
                <label style="font-size: 0.7rem; font-weight: 700; text-transform: uppercase;">Directives</label>
                <textarea id="editInstructions" rows="4" style="padding: 12px; border-radius: 8px; border: 1px solid #ddd; font-weight: 500; font-family: inherit; line-height: 1.5;">${successor.instructions}</textarea>
            </div>

            <div style="display: flex; gap: 1rem;">
                <button onclick="saveSuccessor('${successor.id}')" class="btn-zenith btn-primary" style="background: var(--gold-leaf, #d4af37); border-color: var(--gold-leaf, #d4af37); color: black;">Save Changes</button>
                <button onclick="renderLegacyMode()" class="btn-zenith btn-secondary">Cancel</button>
            </div>
        </div>
    `;
}

function saveSuccessor(id) {
    const successor = _mockSuccessors.find(s => s.id === id);
    if (!successor) return;

    // Update Data
    successor.name = document.getElementById('editName').value;
    successor.relation = document.getElementById('editRelation').value;
    successor.access = document.getElementById('editAccess').value;
    successor.status = document.getElementById('editStatus').value;
    successor.instructions = document.getElementById('editInstructions').value;

    // Return to View
    renderLegacyMode();
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

    const hero = _allEntities.find(e => e.id === _currentEntityId);
    const isMedical = hero && hero.product_type === 'medical_pllc';

    const logs = [
        { msg: "Secure Document Access", time: "2m ago", icon: "MI" },
        { msg: "Privacy Guard Check", time: "14m ago", icon: "SH" },
        { msg: isMedical ? "Board Credential Sync" : "Compliance Baseline Verified", time: "1h ago", icon: isMedical ? "MD" : "LE" }
    ];


    aside.innerHTML = `
        <div class="sentinel-fixed">
            <div id="legacyTimerContainer"></div>

            <div class="fleet-section" style="margin-top: 40px;">
                <h2 class="side-title">Institutional Portfolio</h2>
                <div style="font-size: 0.6rem; font-weight: 700; opacity: 0.25; margin-top: -1.5rem; margin-bottom: 1.5rem; text-transform: uppercase; letter-spacing: 0.2em;">Switch Businesses</div>
                <div class="fleet-grid">
                    ${_allEntities.map(entity => {
                        const pulse = window.ComplianceEngine.getCompliancePulse(entity);
                        return `
                        <div class="fleet-node ${entity.id === _currentEntityId ? 'active' : ''}" 
                             onclick="switchHero('${entity.id}')"
                             title="${entity.llc_name}"
                             style="position: relative;">
                            ${entity.initials || entity.llc_name.substring(0, 2).toUpperCase()}
                            <div style="position: absolute; top: -2px; right: -2px; width: 8px; height: 8px; background: ${pulse.pulseColor}; border: 2px solid white; border-radius: 50%; box-shadow: 0 0 6px ${pulse.pulseColor}66;"></div>
                        </div>
                        `;
                    }).join('')}
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
