// Charter Legacy - Dashboard with Supabase Integration

// Initialize Supabase client
const script = document.createElement('script');
script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
script.onload = initializeDashboard;
document.head.appendChild(script);

let supabase;

function initializeDashboard() {
    const CONFIG = window.CONFIG;
    if (!CONFIG) {
        console.error("CRITICAL: config.js not loaded!");
        return;
    }
    supabase = window.supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);
    checkAuthAndLoadData();
}

// Mobile Menu Toggle
const menuBtn = document.getElementById('menuBtn');
const menuOverlay = document.getElementById('menuOverlay');
const menuClose = document.getElementById('menuClose');

menuBtn?.addEventListener('click', () => {
    menuOverlay.style.display = 'block';
    document.body.style.overflow = 'hidden';
});

menuClose?.addEventListener('click', () => {
    menuOverlay.style.display = 'none';
    document.body.style.overflow = 'auto';
});

menuOverlay?.addEventListener('click', (e) => {
    if (e.target === menuOverlay) {
        menuOverlay.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
});

// Check authentication and load data
async function checkAuthAndLoadData() {
    // Verify Session (Identity Pulse)
    let session = null;
    
    // VERIFICATION: Mock Mode Session (PBP @TESTING)
    if (CONFIG.MOCK_MODE) {
        const mockSession = localStorage.getItem('sb-mock-session');
        if (mockSession) {
            session = JSON.parse(mockSession);
        } else {
            // Create a dummy mock session if none exists
            session = {
                user: {
                    id: 'mock-user-id',
                    email: 'mock.user@example.com',
                    user_metadata: {
                        user_name: 'Mock Founder'
                    }
                }
            };
            localStorage.setItem('sb-mock-session', JSON.stringify(session));
            localStorage.setItem('user_type', 'llc'); // Default to LLC for mock
            localStorage.setItem('user_name', 'Mock Founder');
        }
    } else {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
            console.error('Error getting session:', error);
        }
        session = data.session;

        // TURBO FALLBACK: If real session fails (outage/bypass), check local mock session
        if (!session) {
            const mockSession = localStorage.getItem('sb-mock-session');
            if (mockSession) {
                session = JSON.parse(mockSession);
                console.log("Turbo Bypass Session Active:", session.user.id);
            }
        }
    }

    if (!session) {
        window.location.href = '/app/auth.html'; // Redirect to Auth
        return;
    }

    // PBP @FLOW.Privacy_Shield_Dashboard: "Audit log grid with high whitespace"
    const userEmailElement = document.getElementById('user-email');
    if (userEmailElement) {
        userEmailElement.textContent = session.user.email + (CONFIG.MOCK_MODE ? ' (MOCK)' : '');
    }
    
    // Load Data (PBP @DATA.Entity)
    if (CONFIG.MOCK_MODE) {
        loadMockData();
        const userName = localStorage.getItem('user_name') || 'Founder';
        const userNameElement = document.getElementById('userName');
        if (userNameElement) userNameElement.textContent = userName;
    } else {
        // Fetch real profile from Supabase
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('user_type, first_name')
            .eq('id', session.user.id)
            .single();
            
        if (profileError) {
            console.error('Error fetching profile:', profileError);
        }

        const userType = profile?.user_type || 'llc';
        const userName = profile?.first_name || 'Founder';
        
        const userNameElement = document.getElementById('userName');
        if (userNameElement) userNameElement.textContent = userName;

        if (userType === 'llc') {
            await loadLLCDashboard(session.user.id);
        } else if (userType === 'will') {
            await loadWillDashboard(session.user.id);
        }
    }
}

// Load Mock Data (PBP @TESTING)
function loadMockData() {
    console.log("STATUTORY AUDIT: Populating high-fidelity mock data...");
    const dashboardContent = document.querySelector('.dashboard-content-grid');
    if (!dashboardContent) return;

    const mockLLCs = [
        {
            llc_name: 'Charter Legacy Holdings LLC',
            llc_status: 'ACTIVE',
            annual_report_due: false
        },
        {
            llc_name: 'Sovereign Scrivener LLC',
            llc_status: 'FORMING',
            annual_report_due: false
        }
    ];

    dashboardContent.innerHTML = mockLLCs.map(llc => `
        <div class="llc-card" style="border-radius: var(--radius-secondary);">
            <div class="llc-card-header">
                <h3>${llc.llc_name}</h3>
                <span class="status-badge ${llc.llc_status.toLowerCase()}">${llc.llc_status}</span>
            </div>
            <div class="compliance-status">
                <span>✅ Compliant (Statutory Audit)</span>
            </div>
            <div class="llc-card-actions">
                <button class="btn-secondary bt-sm" onclick="alert('Audit Mode: Real vault access disabled during maintenance.')">View Documents</button>
            </div>
        </div>
    `).join('');
}

// Protocol: Ritual of Citation Confirmed

// Load LLC Dashboard Data
async function loadLLCDashboard(userId) {
    try {
        // Fetch LLC data
        const { data: llcs, error } = await supabase
            .from('llcs')
            .select('*')
            .eq('user_id', userId);
        
        if (error) throw error;
        
        const dashboardContent = document.querySelector('.dashboard-content-grid');
        if (llcs && llcs.length > 0) {
            // Render PBP Card Layout
            dashboardContent.innerHTML = llcs.map(llc => `
                <div class="llc-card" style="border-radius: var(--radius-secondary);">
                    <h3>${llc.llc_name}</h3>
                    <p>Status: ${llc.llc_status || 'Forming'}</p>
                    <!-- PBP @FLOW: Compliance Heartbeat -->
                    <div class="compliance-status">
                        <span>${llc.annual_report_due ? '⚠ Report Due' : '✅ Compliant'}</span>
                    </div>
                </div>
            `).join('');
        } else {
            dashboardContent.innerHTML = `
                <div class="empty-state" style="text-align: center; padding: var(--spacing-xl) 0;">
                    <svg class="icon-xl" style="width: 80px; height: 80px; opacity: 0.1; margin-bottom: var(--spacing-md);"><use href="#icon-shield"></use></svg>
                    <h2 style="margin-bottom: var(--spacing-sm)">No Entities Found</h2>
                    <p style="opacity: 0.7; margin-bottom: var(--spacing-lg)">You haven't initiated your Founder's Shield yet.</p>
                    <a href="/app/formation-wizard.html" class="btn-primary" style="display: inline-block; width: auto;">Begin Formation</a>
                </div>
            `;
        }

        // PBP @FLOW.Privacy_Shield_Dashboard: "Audit log grid with high whitespace"
        // This part of the spec is handled by the card layout above, implying visual separation.
        
        // PBP @LOGIC: OnAnnualReport_60DaysBeforeDue check would go here
        // For now, we just display '⚠ Report Due' if annual_report_due is true.
        // More complex logic would involve date comparisons.

    } catch (error) {
        console.error('Error loading LLC data:', error);
    }
}

// Load Will Dashboard Data
async function loadWillDashboard(userId) {
    try {
        // Fetch will data
        const { data: willData, error } = await supabase
            .from('wills')
            .select('*')
            .eq('user_id', userId)
            .single();
        
        if (error) throw error;
        
        if (willData) {
            // Update will status
            if (willData.executed_date) {
                const executedDate = new Date(willData.executed_date);
                updateStatusValue('willStatus', `Executed on ${formatDate(executedDate)}`);
            }
            
            // Update Legacy Timer status
            updateStatusValue('legacyTimerStatus', willData.legacy_timer_active ? 'Active' : 'Inactive');
            
            // Update last check-in
            if (willData.last_checkin) {
                const lastCheckin = new Date(willData.last_checkin);
                const daysAgo = Math.floor((Date.now() - lastCheckin.getTime()) / (1000 * 60 * 60 * 24));
                updateStatusValue('lastCheckIn', `${daysAgo} days ago`);
            }
        }
    } catch (error) {
        console.error('Error loading will data:', error);
    }
}

// Helper: Update status value in dashboard
function updateStatusValue(className, value) {
    const elements = document.querySelectorAll(`.${className}`);
    elements.forEach(el => {
        el.textContent = value;
    });
}

// Helper: Format date
function formatDate(date) {
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
}

// Sign out handler
window.addEventListener('load', () => {
    const logoutLinks = document.querySelectorAll('a[href="/app/logout"]');
    logoutLinks.forEach(link => {
        link.addEventListener('click', async (e) => {
            e.preventDefault();
            await supabase.auth.signOut();
            localStorage.clear();
            window.location.href = '/app/auth.html';
        });
    });
});

// PWA: Install prompt
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    console.log('PWA install available');
});

window.addEventListener('appinstalled', () => {
    console.log('PWA installed successfully');
    deferredPrompt = null;
});

// Service Worker Registration
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
            .then(registration => console.log('ServiceWorker registered:', registration.scope))
            .catch(error => console.log('ServiceWorker registration failed:', error));
    });
}
