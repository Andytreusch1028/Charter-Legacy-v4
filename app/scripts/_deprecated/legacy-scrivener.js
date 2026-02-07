/**
 * Legacy Scrivener: Personal Artifact Automation
 * Specialized logic for generating Wills, POA, and Health Directives.
 */

let currentStep = 1;
let selectedTemplateId = null;
let selectedTemplate = null;

document.addEventListener('DOMContentLoaded', () => {
    initializeWizard();
});

/**
 * Initialize the wizard state and render initial templates
 */
function initializeWizard() {
    console.log("Legacy Scrivener: Initializing...");
    
    // Set default date
    document.getElementById('effective-date').value = new Date().toISOString().split('T')[0];
    
    renderTemplates();
}

/**
 * Render the template cards from CONFIG
 */
function renderTemplates() {
    const grid = document.getElementById('template-grid');
    if (!grid) return;
    
    const templates = window.CONFIG.MOCK_LEGACY_TEMPLATES || [];
    grid.innerHTML = '';
    
    templates.forEach(tpl => {
        const card = document.createElement('div');
        card.className = 'template-card';
        card.onclick = () => selectTemplate(tpl.id);
        
        card.innerHTML = `
            <div class="template-icon">
                ${getIconForTemplate(tpl.template_type)}
            </div>
            <div class="template-name">${tpl.title}</div>
            <div class="template-description">${tpl.description}</div>
        `;
        
        grid.appendChild(card);
    });
}

/**
 * Helper to get SVG icons for cards
 */
function getIconForTemplate(type) {
    if (type === 'last_will') {
        return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>`;
    } else if (type === 'durable_poa') {
        return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="17" y1="11" x2="23" y2="11"></line></svg>`;
    } else {
        return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 12h-4l-3 9L9 3l-3 9H2"></path></svg>`;
    }
}

/**
 * Handle template selection
 */
function selectTemplate(id) {
    selectedTemplateId = id;
    selectedTemplate = window.CONFIG.MOCK_LEGACY_TEMPLATES.find(t => t.id === id);
    
    // Update UI
    document.querySelectorAll('.template-card').forEach(card => {
        card.classList.remove('selected');
    });
    event.currentTarget.classList.add('selected');
    
    document.getElementById('btn-next').disabled = false;
    console.log(`Selected Template: ${selectedTemplate.title}`);
}

/**
 * Navigation Logic
 */
function nextStep() {
    if (currentStep < 4) {
        currentStep++;
        updateUIForStep();
    } else {
        completeGeneration();
    }
}

function prevStep() {
    if (currentStep > 1) {
        currentStep--;
        updateUIForStep();
    }
}

/**
 * Update the wizard UI based on the current step
 */
function updateUIForStep() {
    // Hide all panes
    document.querySelectorAll('.step-pane').forEach(p => p.classList.remove('active'));
    document.getElementById(`step-${currentStep}`).classList.add('active');
    
    // Update indicator
    document.getElementById('stepIndicator').textContent = `Step ${currentStep} of 4`;
    document.getElementById('btn-back').style.display = currentStep === 1 ? 'none' : 'flex';
    document.getElementById('btn-next').textContent = currentStep === 4 ? 'Download Archive' : 'Continue';

    // Step-specific updates
    switch(currentStep) {
        case 2:
            document.getElementById('stepTitle').textContent = "Personal Particulars";
            const label = selectedTemplate.template_type === 'last_will' ? 'Testator Full Name' : 'Principal Full Name';
            document.getElementById('principal-label').textContent = label;
            break;
        case 3:
            document.getElementById('stepTitle').textContent = "Designated Parties";
            generateDynamicFields();
            break;
        case 4:
            document.getElementById('stepTitle').textContent = "Review Your Legacy";
            generatePreview();
            break;
    }
}

/**
 * Generate fields based on template content requirements
 */
function generateDynamicFields() {
    const container = document.getElementById('dynamic-parties-container');
    if (!container) return;
    
    container.innerHTML = '';
    
    const type = selectedTemplate.template_type;
    let fields = [];
    
    if (type === 'last_will') {
        fields = [
            { id: 'executor-name', label: 'Primary Executor', placeholder: 'Person who will manage the estate' },
            { id: 'successor-executor-name', label: 'Successor Executor', placeholder: 'Backup if primary is unavailable' },
            { id: 'guardian-name', label: 'Guardian for Minors', placeholder: 'Person who will care for children' },
            { id: 'beneficiary-slate', label: 'Beneficiaries', placeholder: 'e.g. My spouse, children, or specific organizations', area: true }
        ];
    } else if (type === 'durable_poa') {
        fields = [
            { id: 'agent-name', label: 'Primary Agent', placeholder: 'Person who will make decisions for you' },
            { id: 'successor-agent-name', label: 'Successor Agent', placeholder: 'Backup agent' }
        ];
    } else if (type === 'living_will') {
        fields = [
            { id: 'surrogate-name', label: 'Health Care Surrogate', placeholder: 'Person who will make medical decisions' }
        ];
    }
    
    fields.forEach(f => {
        const group = document.createElement('div');
        group.className = 'form-group';
        
        if (f.area) {
            group.innerHTML = `
                <label class="form-label">${f.label}</label>
                <textarea id="input_${f.id.toUpperCase()}" class="form-input" style="height: 100px;" placeholder="${f.placeholder}"></textarea>
            `;
        } else {
            group.innerHTML = `
                <label class="form-label">${f.label}</label>
                <input type="text" id="input_${f.id.toUpperCase()}" class="form-input" placeholder="${f.placeholder}">
            `;
        }
        
        container.appendChild(group);
    });
}

/**
 * Perform placeholder replacement and render the document
 */
function generatePreview() {
    let content = selectedTemplate.content;
    
    // Core data
    const dataMap = {
        'TESTATOR_NAME': document.getElementById('principal-name').value,
        'PRINCIPAL_NAME': document.getElementById('principal-name').value,
        'TESTATOR_COUNTY': document.getElementById('residence-county').value,
        'EFFECTIVE_DATE': formatDate(document.getElementById('effective-date').value)
    };
    
    // Dynamic data from Step 3
    document.querySelectorAll('[id^="input_"]').forEach(input => {
        const key = input.id.replace('input_', '');
        dataMap[key] = input.value || `[${key.replace(/_/g, ' ')}]`;
    });
    
    // Replace logic
    let result = content;
    Object.keys(dataMap).forEach(key => {
        const regex = new RegExp(`{{${key}}}`, 'g');
        result = result.replace(regex, dataMap[key]);
    });
    
    document.getElementById('artifact-preview').textContent = result;
}

/**
 * Format date for document (e.g. February 4, 2026)
 */
function formatDate(dateStr) {
    if (!dateStr) return '___________';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

/**
 * Finalize and (simulatedly) download
 */
function completeGeneration() {
    alert("Legacy Artifact Generated.\n\nSimulating Secure Package Creation:\n1. Generating lawyer-grade PDF\n2. Encrypting for Sovereign Vault\n3. Registering with Heir Portal Monitor\n4. Preparing Hardcopy Archive for mailing.");
    window.location.href = 'obsidian-zenith.html';
}
