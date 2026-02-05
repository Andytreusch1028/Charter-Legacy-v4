/**
 * Heir Dashboard
 * Manages the post-verification dashboard for heirs
 */

// Session management
let sessionTimeout;
const SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes

// Current session data
let currentWill = null;
let currentHeir = null;

/**
 * Initialize dashboard on page load
 */
window.addEventListener('DOMContentLoaded', () => {
    // Get URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const willId = urlParams.get('will_id') || 'will-001';
    const heirId = urlParams.get('heir_id') || 'heir-001';
    
    // Load dashboard data
    loadDashboard(willId, heirId);
    
    // Start session timeout
    resetSessionTimeout();
    
    // Track activity on user interaction
    document.addEventListener('click', resetSessionTimeout);
    document.addEventListener('keypress', resetSessionTimeout);
});

/**
 * Load dashboard data
 */
function loadDashboard(willId, heirId) {
    // Find will in config
    currentWill = window.CONFIG.MOCK_WILLS.find(w => w.id === willId);
    
    if (!currentWill) {
        alert('Will not found');
        window.location.href = 'heir-portal.html';
        return;
    }
    
    // Find heir
    currentHeir = currentWill.heirs.find(h => h.id === heirId);
    
    if (!currentHeir) {
        alert('Heir not found');
        window.location.href = 'heir-portal.html';
        return;
    }
    
    // Check access granted (skip in demo mode)
    const urlParams2 = new URLSearchParams(window.location.search);
    const demoMode = urlParams2.get('demo') === 'true';
    
    if (!currentHeir.access_granted && !demoMode) {
        alert('Access not yet granted. Please complete verification first.');
        window.location.href = 'heir-portal.html';
        return;
    }
    
    // Populate dashboard
    populateHeader();
    loadWillDocument();
    renderVaultItems();
    renderAttorneyContact();
    renderProbateGuidance();
    renderActivityLog();
    
    // Log dashboard access
    trackActivity('dashboard_viewed', 'Heir accessed dashboard');
}

/**
 * Populate header with heir info
 */
function populateHeader() {
    document.getElementById('heir-name').textContent = currentHeir.name;
    document.getElementById('testator-name').textContent = currentWill.testator.name;
    document.getElementById('relationship').textContent = currentHeir.relationship;
    
    // Set last accessed time
    const now = new Date();
    document.getElementById('last-accessed-time').textContent = now.toLocaleString();
}

/**
 * Load will document in PDF viewer
 */
function loadWillDocument() {
    const viewer = document.getElementById('will-viewer');
    
    // In production, this would load the actual PDF
    // For now, show a placeholder
    viewer.src = currentWill.will_document_url || 'about:blank';
    
    // If no PDF available, show message
    if (!currentWill.will_document_url) {
        viewer.style.display = 'none';
        const container = document.querySelector('.pdf-viewer-container');
        container.innerHTML = `
            <div class="placeholder-message">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                </svg>
                <h3>Will Document</h3>
                <p>The will document will be available here once uploaded.</p>
            </div>
        `;
    }
}

/**
 * Render vault items grid
 */
function renderVaultItems() {
    const grid = document.getElementById('vault-grid');
    
    if (!currentWill.vault_items || currentWill.vault_items.length === 0) {
        grid.innerHTML = '<p class="empty-state">No vault items available.</p>';
        return;
    }
    
    grid.innerHTML = currentWill.vault_items.map(item => `
        <div class="vault-item-card">
            <div class="vault-item-icon">
                ${getVaultItemIcon(item.type)}
            </div>
            <h3>${item.name}</h3>
            <p>${item.description}</p>
            <button class="btn-download-vault" onclick="downloadVaultItem('${item.id}', '${item.name}', '${item.file_url}')">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7 10 12 15 17 10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
                Download
            </button>
        </div>
    `).join('');
}

/**
 * Get icon for vault item type
 */
function getVaultItemIcon(type) {
    const icons = {
        document: '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>',
        credentials: '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>',
        image: '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>'
    };
    return icons[type] || icons.document;
}

/**
 * Render attorney contact info
 */
function renderAttorneyContact() {
    const container = document.getElementById('attorney-details');
    const attorney = currentWill.attorney_contact;
    
    if (!attorney) {
        container.innerHTML = '<p>No attorney information available.</p>';
        return;
    }
    
    container.innerHTML = `
        <div class="attorney-name">${attorney.name}</div>
        <div class="attorney-firm">${attorney.firm}</div>
        <div class="attorney-info-item">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
            </svg>
            <span>${attorney.phone}</span>
        </div>
        <div class="attorney-info-item">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                <polyline points="22,6 12,13 2,6"></polyline>
            </svg>
            <span>${attorney.email}</span>
        </div>
        <div class="attorney-info-item">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
            </svg>
            <span>${attorney.address}</span>
        </div>
    `;
    
    // Set contact button href
    document.getElementById('contact-attorney-btn').href = `mailto:${attorney.email}?subject=Estate of ${currentWill.testator.name}`;
}

/**
 * Render probate guidance
 */
function renderProbateGuidance() {
    const guidance = currentWill.probate_guidance;
    
    if (!guidance) return;
    
    // Timeline
    document.getElementById('probate-timeline').textContent = guidance.estimated_timeline;
    
    // Checklist
    const checklistContainer = document.getElementById('probate-checklist');
    checklistContainer.innerHTML = `
        <h4>Required Steps</h4>
        <ol class="probate-steps">
            ${guidance.required_steps.map(step => `<li>${step}</li>`).join('')}
        </ol>
    `;
    
    // Resources
    const resourcesContainer = document.getElementById('probate-resources');
    resourcesContainer.innerHTML = guidance.resources.map(resource => `
        <a href="${resource.url}" target="_blank" class="resource-link">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                <polyline points="15 3 21 3 21 9"></polyline>
                <line x1="10" y1="14" x2="21" y2="3"></line>
            </svg>
            ${resource.title}
        </a>
    `).join('');
}

/**
 * Render activity log
 */
function renderActivityLog() {
    const timeline = document.getElementById('activity-timeline');
    
    const activities = [
        {
            timestamp: currentHeir.access_granted_at || new Date().toISOString(),
            action: 'Access Granted',
            details: `Verified via ${currentHeir.access_method || 'death certificate'}`
        },
        ...currentWill.activity_log.slice(-5) // Last 5 activities
    ];
    
    timeline.innerHTML = activities.map(activity => `
        <div class="activity-item">
            <div class="activity-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
            </div>
            <div class="activity-content">
                <div class="activity-action">${activity.action}</div>
                <div class="activity-details">${activity.details || ''}</div>
                <div class="activity-time">${new Date(activity.timestamp).toLocaleString()}</div>
            </div>
        </div>
    `).join('');
}

/**
 * Download will document
 */
function downloadWill() {
    trackActivity('will_downloaded', 'Heir downloaded will document');
    
    // In production, generate watermarked PDF
    const url = currentWill.will_document_url;
    const filename = `Will_${currentWill.testator.name.replace(/\s/g, '_')}.pdf`;
    
    downloadFile(url, filename);
}

/**
 * Print will document
 */
function printWill() {
    trackActivity('will_printed', 'Heir printed will document');
    
    const viewer = document.getElementById('will-viewer');
    if (viewer && viewer.contentWindow) {
        viewer.contentWindow.print();
    }
}

/**
 * Download vault item
 */
function downloadVaultItem(itemId, itemName, fileUrl) {
    trackActivity('vault_item_downloaded', `Downloaded: ${itemName}`);
    
    const filename = `${itemName.replace(/\s/g, '_')}.pdf`;
    downloadFile(fileUrl, filename);
}

/**
 * Generic file download helper
 */
function downloadFile(url, filename) {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

/**
 * Track activity
 */
function trackActivity(action, details) {
    const activity = {
        timestamp: new Date().toISOString(),
        action: action,
        user: currentHeir.name,
        details: details
    };
    
    // In production, send to backend
    console.log('Activity tracked:', activity);
    
    // Add to local activity log
    currentWill.activity_log.push(activity);
}

/**
 * Reset session timeout
 */
function resetSessionTimeout() {
    clearTimeout(sessionTimeout);
    
    sessionTimeout = setTimeout(() => {
        alert('Your session has expired due to inactivity. You will be logged out.');
        logout();
    }, SESSION_TIMEOUT_MS);
}

/**
 * Logout
 */
function logout() {
    trackActivity('logged_out', 'Heir logged out');
    
    // Clear session
    clearTimeout(sessionTimeout);
    
    // Redirect to portal
    window.location.href = 'heir-portal.html';
}
