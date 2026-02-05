// Charter Legacy - Supabase Authentication
// PBP Reference: @FLOW.view.LLC_Builder_Identity
// PBP Reference: @STYLE.white_charter.authentication ("Identity Pulse")

// DEBUG: Immediate check to see if file loads
// auth.js - Identity Pulse Authentication

// Initialize from global CONFIG
if (typeof window.CONFIG === 'undefined') {
    console.error("CRITICAL ERROR: config.js not loaded!");
    // Attempt to visual signal if DOM is ready (fallback)
    window.onload = function() {
        const btn = document.getElementById('submitBtn');
        if (btn) {
            btn.textContent = "Error: Config Failed";
            btn.style.backgroundColor = "red";
            btn.disabled = true;
        }
    };
}

const supabaseUrl = window.CONFIG?.SUPABASE_URL;
const supabaseKey = window.CONFIG?.SUPABASE_ANON_KEY;

// Load Supabase client from CDN
const script = document.createElement('script');
script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
script.onload = initializeAuth;
document.head.appendChild(script);

let _supabase = null;

function initializeAuth() {
    if (window.supabase) {
        _supabase = window.supabase.createClient(supabaseUrl, supabaseKey);
        console.log("Supabase initialized via CDN callback");
    }
}

document.addEventListener('DOMContentLoaded', () => {


    const loginForm = document.getElementById('authForm'); 
    const emailInput = document.getElementById('email');
    const magicLinkBtn = document.getElementById('submitBtn'); 
    const statusMsg = document.getElementById('successMessage'); 

    if (!loginForm) alert("ERROR: authForm missing");
    if (!magicLinkBtn) alert("ERROR: submitBtn missing");

    // Enforce PBP Style Tokens
    if (magicLinkBtn) {
        magicLinkBtn.style.borderRadius = 'var(--radius-primary)'; 
    }
    
    // Attach Listener
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
    

            const email = emailInput.value;

            if (magicLinkBtn) magicLinkBtn.textContent = 'Verifying Pulse...';
            console.log("IDENTITY PULSE: Checking statutory configuration...");

            try {
                // SAFETY: fail gracefully if config missed
                if (typeof window.CONFIG === 'undefined') {
                    throw new Error("Configuration not loaded. Please refresh the page.");
                }

                // VERIFICATION: Check for Mock Mode
                const targetUrl = 'dashboard-llc.html'; // Define targetUrl for mock mode
                console.log("STATUTORY AUDIT: checking mode...", window.CONFIG.MOCK_MODE);
                if (window.CONFIG.MOCK_MODE) {
                    alert("AUDIT MODE ACTIVE: Bypassing Maintenance Pulse.");
                    if (magicLinkBtn) magicLinkBtn.textContent = 'Audit Mode Authenticated...';
                    console.log("Attempting redirect to:", targetUrl);
                    
                    // Simulate session storage
                    localStorage.setItem('sb-mock-session', JSON.stringify({
                        user: { id: 'mock-user-123', email: email }
                    }));
                    localStorage.setItem('user_type', 'llc'); 
                    localStorage.setItem('user_name', 'Mock Founder');

                    // Force Redirect
                    setTimeout(() => {
                         if (magicLinkBtn) magicLinkBtn.textContent = 'Redirecting to Dashboard...';
                        window.location.href = 'dashboard-llc.html';
                    }, 1000);
                    return;
                }

                // ... Real Auth Logic ...
                if (!_supabase) {
                    alert("Supabase client not loaded yet!");
                    return;
                }
                
                const { error } = await _supabase.auth.signInWithOtp({
                    email,
                    options: { emailRedirectTo: window.location.origin + '/app/dashboard-llc.html' },
                });

                if (error) {
                    if (error.message.includes('Email rate limit exceeded')) {
                        throw new Error("Security Pulse is cooling down. Please wait a few minutes before trying again, or contact support to upgrade your limits.");
                    }
                    throw error;
                }
                
                if (statusMsg) {
                    statusMsg.style.display = 'block';
                    const emailDisplay = document.getElementById('emailDisplay');
                    if (emailDisplay) emailDisplay.textContent = email;
                    const authForm = document.getElementById('authForm');
                    if (authForm) authForm.style.display = 'none';
                }

            } catch (error) {
                console.error("FULL AUTH ERROR:", error);
                if (magicLinkBtn) magicLinkBtn.textContent = 'Try Again';
                
                // TURBO BYPASS: Allow local dev to skip during outages
                if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                    const bypass = confirm("SMTP Handshake Failed. This is likely due to the 'Supabase Technical Issue' banner. Skip to Dashboard for testing?");
                    if (bypass) {
                        localStorage.setItem('sb-mock-session', JSON.stringify({
                            user: { id: '3bb383fd-80f0-4d1f-b877-35d677e240e0', email: 'test@charterlegacy.com' }
                        }));
                        window.location.href = 'dashboard-llc.html';
                    }
                } else {
                    alert(error.message);
                }
            }
        });
    }
});
