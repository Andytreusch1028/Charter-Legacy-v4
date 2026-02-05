// Admin OA Template Management
console.log("Admin Template Manager: Initializing...");

let allTemplates = [];
let currentTemplate = null;
let currentTab = 'solo';

// ============================================================================
// INITIALIZATION
// ============================================================================

function initializeTemplateManager() {
    console.log("Loading templates from CONFIG...");
    
    if (window.CONFIG && window.CONFIG.MOCK_OA_TEMPLATES) {
        allTemplates = window.CONFIG.MOCK_OA_TEMPLATES;
        console.log(`Loaded ${allTemplates.length} templates`);
    }
    
    renderTemplateList();
    setupEventListeners();
}

// ============================================================================
// RENDERING
// ============================================================================

function renderTemplateList() {
    const container = document.getElementById('template-list');
    if (!container) return;
    
    // Group templates by type
    const grouped = {
        solo: allTemplates.filter(t => t.template_type === 'solo'),
        multi: allTemplates.filter(t => t.template_type === 'multi'),
        managed: allTemplates.filter(t => t.template_type === 'managed')
    };
    
    container.innerHTML = `
        <div class="template-tabs">
            <button class="tab-btn ${currentTab === 'solo' ? 'active' : ''}" onclick="switchTab('solo')">Solo</button>
            <button class="tab-btn ${currentTab === 'multi' ? 'active' : ''}" onclick="switchTab('multi')">Multi-Rider</button>
            <button class="tab-btn ${currentTab === 'managed' ? 'active' : ''}" onclick="switchTab('managed')">Managed Node</button>
        </div>
        
        <div class="template-versions">
            ${renderVersionList(grouped[currentTab])}
        </div>
        
        <button class="btn-primary" onclick="showCreateForm()">+ Create New Version</button>
    `;
}

function renderVersionList(templates) {
    if (!templates || templates.length === 0) {
        return '<p style="color: #666; padding: 2rem; text-align: center;">No templates found</p>';
    }
    
    // Sort by version descending
    const sorted = templates.sort((a, b) => b.version - a.version);
    
    return sorted.map(tpl => `
        <div class="version-card ${tpl.status === 'active' ? 'active' : ''}">
            <div class="version-header">
                <div>
                    <span class="version-number">v${tpl.version}</span>
                    <span class="status-badge status-${tpl.status}">${tpl.status.toUpperCase()}</span>
                </div>
                <div class="version-actions">
                    <button class="btn-icon" onclick="viewTemplate('${tpl.id}')" title="View">👁️</button>
                    ${tpl.status === 'draft' ? `<button class="btn-icon" onclick="editTemplate('${tpl.id}')" title="Edit">✏️</button>` : ''}
                    ${tpl.status === 'draft' ? `<button class="btn-icon" onclick="activateTemplate('${tpl.id}')" title="Activate">✓</button>` : ''}
                    ${tpl.status === 'active' ? `<button class="btn-icon" onclick="archiveTemplate('${tpl.id}')" title="Archive">📦</button>` : ''}
                </div>
            </div>
            <div class="version-meta">
                <div><strong>Attorney:</strong> ${tpl.attorney_name}</div>
                <div><strong>Bar #:</strong> ${tpl.attorney_bar_number}</div>
                <div><strong>Reviewed:</strong> ${new Date(tpl.attorney_review_date).toLocaleDateString()}</div>
                <div><strong>FL Statute:</strong> ${tpl.fl_statute_version}</div>
            </div>
            ${tpl.change_summary ? `<div class="change-summary">${tpl.change_summary}</div>` : ''}
        </div>
    `).join('');
}

// ============================================================================
// ACTIONS
// ============================================================================

function switchTab(tab) {
    currentTab = tab;
    renderTemplateList();
}

function viewTemplate(templateId) {
    const template = allTemplates.find(t => t.id === templateId);
    if (!template) return;
    
    currentTemplate = template;
    
    const modal = document.getElementById('template-modal');
    const content = document.getElementById('modal-content');
    
    content.innerHTML = `
        <h2>Template Preview: ${template.template_type} v${template.version}</h2>
        
        <div class="template-metadata">
            <div><strong>Status:</strong> <span class="status-badge status-${template.status}">${template.status.toUpperCase()}</span></div>
            <div><strong>Attorney:</strong> ${template.attorney_name}, ${template.attorney_bar_number}</div>
            <div><strong>Review Date:</strong> ${new Date(template.attorney_review_date).toLocaleDateString()}</div>
            <div><strong>FL Statute:</strong> ${template.fl_statute_version}</div>
        </div>
        
        <div class="template-preview">
            <pre>${template.content}</pre>
        </div>
        
        <button class="btn-secondary" onclick="closeModal()">Close</button>
    `;
    
    modal.style.display = 'flex';
}

function showCreateForm() {
    const modal = document.getElementById('template-modal');
    const content = document.getElementById('modal-content');
    
    // Get next version number
    const existingVersions = allTemplates.filter(t => t.template_type === currentTab);
    const nextVersion = existingVersions.length > 0 
        ? Math.max(...existingVersions.map(t => t.version)) + 1 
        : 1;
    
    content.innerHTML = `
        <h2>Create New Template: ${currentTab} v${nextVersion}</h2>
        
        <form id="template-form" onsubmit="saveTemplate(event)">
            <div class="form-group">
                <label>Template Content</label>
                <textarea id="template-content" rows="20" required placeholder="OPERATING AGREEMENT
OF
{{LLC_NAME}}

..."></textarea>
                <small>Use placeholders: {{LLC_NAME}}, {{FORMATION_DATE}}, {{PRINCIPAL_ADDRESS}}, {{MEMBER_NAME}}, {{MEMBER_LIST}}, {{MEMBER_SIGNATURES}}</small>
            </div>
            
            <div class="form-row">
                <div class="form-group">
                    <label>Attorney Name</label>
                    <input type="text" id="attorney-name" required placeholder="e.g., Jane Smith, Esq.">
                </div>
                <div class="form-group">
                    <label>Bar Number</label>
                    <input type="text" id="attorney-bar" required placeholder="e.g., FL12345">
                </div>
            </div>
            
            <div class="form-group">
                <label>Review Date</label>
                <input type="date" id="review-date" required value="${new Date().toISOString().split('T')[0]}">
            </div>
            
            <div class="form-group">
                <label>FL Statute Version</label>
                <input type="text" id="statute-version" required placeholder="e.g., Chapter 605 (2026)">
            </div>
            
            <div class="form-group">
                <label>Change Summary</label>
                <textarea id="change-summary" rows="3" required placeholder="Describe what changed from the previous version..."></textarea>
            </div>
            
            <div class="form-actions">
                <button type="button" class="btn-secondary" onclick="closeModal()">Cancel</button>
                <button type="submit" class="btn-primary">Save & Activate</button>
            </div>
        </form>
    `;
    
    modal.style.display = 'flex';
}

function saveTemplate(event) {
    event.preventDefault();
    
    const existingVersions = allTemplates.filter(t => t.template_type === currentTab);
    const nextVersion = existingVersions.length > 0 
        ? Math.max(...existingVersions.map(t => t.version)) + 1 
        : 1;
    
    const newTemplate = {
        id: `tpl-${currentTab}-v${nextVersion}`,
        template_type: currentTab,
        version: nextVersion,
        status: 'active',
        content: document.getElementById('template-content').value,
        attorney_name: document.getElementById('attorney-name').value,
        attorney_bar_number: document.getElementById('attorney-bar').value,
        attorney_review_date: document.getElementById('review-date').value,
        fl_statute_version: document.getElementById('statute-version').value,
        change_summary: document.getElementById('change-summary').value,
        created_at: new Date().toISOString(),
        activated_at: new Date().toISOString()
    };
    
    // Archive previous active template
    const previousActive = allTemplates.find(t => t.template_type === currentTab && t.status === 'active');
    if (previousActive) {
        previousActive.status = 'archived';
        previousActive.archived_at = new Date().toISOString();
    }
    
    // Add new template
    allTemplates.push(newTemplate);
    
    // Update CONFIG (in production, this would be an API call)
    window.CONFIG.MOCK_OA_TEMPLATES = allTemplates;
    
    console.log(`Created template: ${newTemplate.id}`);
    
    closeModal();
    renderTemplateList();
    
    showNotification(`Template v${nextVersion} created and activated!`, 'success');
}

function activateTemplate(templateId) {
    if (!confirm('Activate this template? This will archive the current active version.')) return;
    
    const template = allTemplates.find(t => t.id === templateId);
    if (!template) return;
    
    // Archive current active
    const currentActive = allTemplates.find(t => t.template_type === template.template_type && t.status === 'active');
    if (currentActive) {
        currentActive.status = 'archived';
        currentActive.archived_at = new Date().toISOString();
    }
    
    // Activate new
    template.status = 'active';
    template.activated_at = new Date().toISOString();
    
    window.CONFIG.MOCK_OA_TEMPLATES = allTemplates;
    
    renderTemplateList();
    showNotification(`Template v${template.version} activated!`, 'success');
}

function archiveTemplate(templateId) {
    if (!confirm('Archive this template? Users will no longer see it.')) return;
    
    const template = allTemplates.find(t => t.id === templateId);
    if (!template) return;
    
    template.status = 'archived';
    template.archived_at = new Date().toISOString();
    
    window.CONFIG.MOCK_OA_TEMPLATES = allTemplates;
    
    renderTemplateList();
    showNotification(`Template v${template.version} archived!`, 'warning');
}

// ============================================================================
// UTILITIES
// ============================================================================

function closeModal() {
    const modal = document.getElementById('template-modal');
    modal.style.display = 'none';
}

function setupEventListeners() {
    // Close modal on outside click
    const modal = document.getElementById('template-modal');
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });
    }
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#4CAF50' : type === 'warning' ? '#FF9800' : '#2196F3'};
        color: white;
        padding: 16px 24px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        animation: slideIn 0.3s ease-out;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// ============================================================================
// INITIALIZATION
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('Admin Template Manager loaded');
    initializeTemplateManager();
});
