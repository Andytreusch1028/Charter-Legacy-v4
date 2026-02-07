// Operating Agreement Builder - Scrivening Engine (Phase 1: Enhanced)
console.log("OA Builder: Initializing Scrivening Engine...");

// ============================================================================
// STATE MANAGEMENT
// ============================================================================

let currentStep = 1;
let selectedTemplate = null;
let members = [];
let currentEntityId = null;
let sourceContext = null; // 'formation' | 'dashboard' | 'catalog'
let autoSaveInterval = null;

// ============================================================================
// TEMPLATE DEFINITIONS (Loaded Dynamically)
// ============================================================================

let templates = {};

/**
 * Load templates from CONFIG (mock mode) or API (production)
 */
function loadTemplates() {
    console.log("Loading templates from CONFIG...");
    
    if (window.CONFIG && window.CONFIG.MOCK_OA_TEMPLATES) {
        const activeTemplates = window.CONFIG.MOCK_OA_TEMPLATES.filter(t => t.status === 'active');
        
        activeTemplates.forEach(tpl => {
            templates[tpl.template_type] = {
                name: tpl.template_type === 'solo' ? 'Solo' : 
                      tpl.template_type === 'multi' ? 'Multi-Rider' : 'Managed Node',
                description: tpl.template_type === 'solo' ? 'Single-Member LLC Operating Agreement' :
                            tpl.template_type === 'multi' ? 'Multi-Member LLC Operating Agreement' :
                            'Manager-Managed LLC Operating Agreement',
                content: tpl.content,
                attorney_name: tpl.attorney_name,
                attorney_bar_number: tpl.attorney_bar_number,
                attorney_review_date: tpl.attorney_review_date,
                fl_statute_version: tpl.fl_statute_version,
                version: tpl.version
            };
        });
        
        console.log(`Loaded ${Object.keys(templates).length} active templates`);
        
        // Display attorney credentials
        displayAttorneyCredentials();
    } else {
        console.warn("No templates found in CONFIG, using fallback");
        loadFallbackTemplates();
    }
}

/**
 * Display attorney credentials in UI
 */
function displayAttorneyCredentials() {
    const credentialsContainer = document.getElementById('attorney-credentials');
    if (!credentialsContainer) return;
    
    // Use solo template for credentials (all should have same attorney)
    const soloTemplate = templates.solo;
    if (!soloTemplate) return;
    
    credentialsContainer.innerHTML = `
        <div style="font-size: 0.75rem; color: #666; text-align: center; margin-top: 1rem; padding-top: 1rem; border-top: 1px solid #eee;">
            <strong>Templates prepared by ${soloTemplate.attorney_name}</strong><br>
            Florida Bar #${soloTemplate.attorney_bar_number} | 
            Last reviewed: ${new Date(soloTemplate.attorney_review_date).toLocaleDateString()} | 
            ${soloTemplate.fl_statute_version}
        </div>
    `;
}

/**
 * Fallback templates if CONFIG not available
 */
function loadFallbackTemplates() {
    console.warn("Using fallback templates");
    templates = {
        solo: {
            name: "Solo",
            description: "Single-Member LLC Operating Agreement",
            content: "OPERATING AGREEMENT\nOF\n{{LLC_NAME}}\n\n[Fallback template - please configure templates in admin panel]"
        },
        multi: {
            name: "Multi-Rider",
            description: "Multi-Member LLC Operating Agreement",
            content: "OPERATING AGREEMENT\nOF\n{{LLC_NAME}}\n\n[Fallback template - please configure templates in admin panel]"
        },
        managed: {
            name: "Managed Node",
            description: "Manager-Managed LLC Operating Agreement",
            content: "OPERATING AGREEMENT\nOF\n{{LLC_NAME}}\n\n[Fallback template - please configure templates in admin panel]"
        }
    };
}

// ============================================================================
// ENHANCED PLACEHOLDER SYSTEM
// ============================================================================

/**
 * Parse template placeholders with type annotations
 * Supports: {{NAME:auto}}, {{NAME:input}}, {{NAME:optional}}
 */
function parseTemplatePlaceholders(content) {
    const regex = /{{([^:}]+)(?::([^}]+))?}}/g;
    const placeholders = [];
    const seen = new Set();
    let match;
    
    while ((match = regex.exec(content)) !== null) {
        const [fullMatch, name, type = 'auto'] = match;
        const cleanName = name.trim();
        
        // Avoid duplicates
        if (!seen.has(cleanName)) {
            placeholders.push({
                placeholder: fullMatch,
                name: cleanName,
                type: type.trim(),
                value: null
            });
            seen.add(cleanName);
        }
    }
    
    console.log(`Parsed ${placeholders.length} unique placeholders`);
    return placeholders;
}

/**
 * Auto-fill placeholders from entity data
 */
function autoFillPlaceholders(placeholders, entity) {
    if (!entity) return placeholders;
    
    return placeholders.map(p => {
        if (p.type === 'auto') {
            // Map placeholder names to entity fields
            const dataMap = {
                'LLC_NAME': entity.llc_name,
                'FORMATION_DATE': entity.formation_date,
                'EFFECTIVE_DATE': new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
                'PRINCIPAL_ADDRESS': entity.principal_address,
                'MEMBER_NAME': entity.members?.[0]?.name,
                'MEMBER_ADDRESS': entity.members?.[0]?.address,
                'OWNERSHIP_PERCENTAGE': entity.members?.[0]?.percentage,
                'MEMBER_LIST': generateMemberList(entity.members),
                'MEMBER_SIGNATURES': generateMemberSignatures(entity.members),
                'MANAGER_SLATE': generateManagerSlate(entity.members), // Reuse members for now as managers
                'BANK_NAME': '{{BANK_NAME:input}}', // Default to input if not auto-filled
                'SIGNER_LIST': generateSignerList(entity.members),
                'EXECUTION_NAME': entity.members?.[0]?.name,
                'SECRETARY_NAME': '{{SECRETARY_NAME:input}}',
                'MEMBER_UNITS': '{{MEMBER_UNITS:input}}',
                'CERTIFICATE_NUMBER': '{{CERTIFICATE_NUMBER:input}}'
            };
            
            p.value = dataMap[p.name] || '';
            
            if (p.value) {
                console.log(`Auto-filled ${p.name}: ${p.value.substring(0, 50)}...`);
            }
        }
        return p;
    });
}

/**
 * Generate member list for multi-member templates
 */
function generateMemberList(members) {
    if (!members || members.length === 0) return '';
    
    return members.map(m => 
        `   ${m.name} - ${m.percentage}% ownership`
    ).join('\n');
}

/**
 * Generate member signatures for multi-member templates
 */
function generateMemberSignatures(members) {
    if (!members || members.length === 0) return '';
    
    return members.map(m => 
        `\n_________________________________\n${m.name}, Member (${m.percentage}%)`
    ).join('\n');
}

/**
 * Generate manager slate for Statement of Authority
 */
function generateManagerSlate(members) {
    if (!members || members.length === 0) return 'No Authorized Persons defined.';
    
    return members.map(m => 
        `   SIGNER: ${m.name}\n   OFFICE: Manager / Authorized Person\n   ADDRESS: ${m.address || 'On Record'}`
    ).join('\n\n');
}

/**
 * Generate signer list for Banking Resolutions
 */
function generateSignerList(members) {
    if (!members || members.length === 0) return 'No Signers defined.';
    
    return members.map(m => 
        `   - ${m.name} (Authorized Signatory)`
    ).join('\n');
}

/**
 * Format placeholder name for display
 * CAPITAL_CONTRIBUTION → Capital Contribution
 */
function formatPlaceholderLabel(name) {
    return name
        .replace(/_/g, ' ')
        .split(' ')
        .map(w => w.charAt(0) + w.slice(1).toLowerCase())
        .join(' ');
}

/**
 * Generate dynamic form fields for :input placeholders
 */
function generateDynamicInputFields(placeholders) {
    const container = document.getElementById('dynamic-fields-container');
    if (!container) {
        console.warn('Dynamic fields container not found');
        return;
    }
    
    const inputPlaceholders = placeholders.filter(p => p.type === 'input' || p.type === 'optional');
    
    if (inputPlaceholders.length === 0) {
        container.innerHTML = '<p style="color: #666; font-style: italic;">No additional information required.</p>';
        return;
    }
    
    container.innerHTML = '<h3 style="font-size: 1.2rem; font-weight: 700; margin-bottom: 1.5rem;">Additional Information</h3>';
    
    inputPlaceholders.forEach(p => {
        const formGroup = document.createElement('div');
        formGroup.className = 'form-group';
        
        const isOptional = p.type === 'optional';
        const label = formatPlaceholderLabel(p.name);
        
        formGroup.innerHTML = `
            <label class="form-label">
                ${label}
                ${isOptional ? '<span style="color: #999; font-weight: 400;">(Optional)</span>' : ''}
            </label>
            <input 
                type="text" 
                class="form-input" 
                id="input_${p.name}"
                placeholder="Enter ${label.toLowerCase()}"
                ${isOptional ? '' : 'required'}
            >
        `;
        
        container.appendChild(formGroup);
    });
    
    console.log(`Generated ${inputPlaceholders.length} dynamic input fields`);
}

/**
 * Collect user inputs from dynamic fields
 */
function collectUserInputs(placeholders) {
    const inputs = {};
    
    placeholders
        .filter(p => p.type === 'input' || p.type === 'optional')
        .forEach(p => {
            const input = document.getElementById(`input_${p.name}`);
            if (input) {
                inputs[p.name] = input.value || (p.type === 'optional' ? 'N/A' : '[NOT PROVIDED]');
            }
        });
    
    return inputs;
}

/**
 * Replace all placeholders in template content
 */
function replacePlaceholders(content, placeholders, userInputs = {}) {
    let result = content;
    
    placeholders.forEach(p => {
        let value;
        
        if (p.type === 'auto') {
            value = p.value || '[AUTO-FILL ERROR]';
        } else {
            value = userInputs[p.name] || '[NOT PROVIDED]';
        }
        
        // Replace all occurrences (with and without type annotation)
        result = result.replace(new RegExp(`{{${p.name}(?::[^}]+)?}}`, 'g'), value);
    });
    
    return result;
}

// ============================================================================
// TEMPLATE SELECTION
// ============================================================================

function selectTemplate(templateType) {
    selectedTemplate = templateType;
    
    // Update UI
    document.querySelectorAll('.template-card').forEach(card => {
        card.classList.remove('selected');
    });
    event.currentTarget.classList.add('selected');
    
    // Enable continue button
    document.getElementById('btn-next-1').disabled = false;
    
    console.log(`Template selected: ${templateType}`);
}

function nextStep() {
    if (currentStep === 1 && !selectedTemplate) {
        alert('Please select a template first.');
        return;
    }
    
    if (currentStep === 2) {
        // Validate entity information
        const llcName = document.getElementById('llc-name').value;
        const formationDate = document.getElementById('formation-date').value;
        const principalAddress = document.getElementById('principal-address').value;
        
        if (!llcName || !formationDate || !principalAddress) {
            alert('Please fill in all required fields.');
            return;
        }
    }
    
    if (currentStep === 3) {
        // Validate members
        if (selectedTemplate !== 'solo' && members.length === 0) {
            alert('Please add at least one member.');
            return;
        }
        
        // Validate percentages
        if (selectedTemplate !== 'solo') {
            const totalPercentage = members.reduce((sum, m) => sum + parseFloat(m.percentage || 0), 0);
            if (Math.abs(totalPercentage - 100) > 0.01) {
                alert(`Total ownership must equal 100%. Current total: ${totalPercentage.toFixed(2)}%`);
                return;
            }
        }
    }
    
    // Hide current step
    document.getElementById(`step-${currentStep}`).classList.remove('active');
    document.getElementById(`progress-${currentStep}`).classList.remove('active');
    
    // Show next step
    currentStep++;
    document.getElementById(`step-${currentStep}`).classList.add('active');
    document.getElementById(`progress-${currentStep}`).classList.add('active');
    
    // Initialize step-specific logic
    if (currentStep === 3) {
        initializeMemberStep();
    } else if (currentStep === 4) {
        generatePreview();
    }
}

function prevStep() {
    // Hide current step
    document.getElementById(`step-${currentStep}`).classList.remove('active');
    document.getElementById(`progress-${currentStep}`).classList.remove('active');
    
    // Show previous step
    currentStep--;
    document.getElementById(`step-${currentStep}`).classList.add('active');
    document.getElementById(`progress-${currentStep}`).classList.add('active');
}

function initializeMemberStep() {
    const title = document.getElementById('step-3-title');
    const description = document.getElementById('step-3-description');
    const addButton = document.getElementById('btn-add-member');
    
    if (selectedTemplate === 'solo') {
        title.textContent = 'Member Information';
        description.textContent = 'Provide your information as the sole member.';
        addButton.style.display = 'none';
        
        // Add single member row
        members = [];
        addMember();
    } else if (selectedTemplate === 'statement_of_authority') {
        title.textContent = 'Authorized Persons';
        description.textContent = 'Identify the individuals with authority to bind the entity.';
        addButton.style.display = 'block';
        if (members.length === 0) addMember(); else renderMembers();
    } else if (selectedTemplate === 'banking_resolution') {
        title.textContent = 'Account Signatories';
        description.textContent = 'Identify the individuals authorized to open and manage the bank account.';
        addButton.style.display = 'block';
        if (members.length === 0) addMember(); else renderMembers();
    } else if (selectedTemplate === 'membership_certificate') {
        title.textContent = 'Certificate Holder';
        description.textContent = 'Identify the individual to whom this certificate is being issued.';
        addButton.style.display = 'none'; // Only one person per certificate
        
        // Add single row for the holder
        members = [];
        addMember();
    } else {
        title.textContent = 'Member Configuration';
        description.textContent = 'Add members and define ownership percentages. Total must equal 100%.';
        addButton.style.display = 'block';
        
        // Start with one member
        if (members.length === 0) {
            addMember();
        } else {
            renderMembers();
        }
    }
    
    // Parse template and generate dynamic input fields
    if (templates[selectedTemplate] && templates[selectedTemplate].content) {
        const placeholders = parseTemplatePlaceholders(templates[selectedTemplate].content);
        generateDynamicInputFields(placeholders);
        console.log(`Step 3 initialized with ${placeholders.length} placeholders`);
    }
}

function addMember() {
    const memberIndex = members.length;
    members.push({
        name: '',
        address: '',
        percentage: selectedTemplate === 'solo' ? 100 : 0,
        capital: 0
    });
    
    renderMembers();
}

function renderMembers() {
    const container = document.getElementById('members-container');
    container.innerHTML = '';
    
    members.forEach((member, index) => {
        const row = document.createElement('div');
        row.className = 'member-row';
        
        row.innerHTML = `
            <div class="form-group" style="margin-bottom: 0;">
                <label class="form-label">Member Name</label>
                <input type="text" class="form-input" value="${member.name}" onchange="updateMember(${index}, 'name', this.value)" placeholder="e.g., John Doe">
            </div>
            <div class="form-group" style="margin-bottom: 0;">
                <label class="form-label">Address</label>
                <input type="text" class="form-input" value="${member.address}" onchange="updateMember(${index}, 'address', this.value)" placeholder="e.g., 123 Main St, Miami, FL">
            </div>
            <div class="form-group" style="margin-bottom: 0;">
                <label class="form-label">Ownership %</label>
                <input type="number" class="form-input" value="${member.percentage}" onchange="updateMember(${index}, 'percentage', this.value)" ${selectedTemplate === 'solo' ? 'readonly' : ''} min="0" max="100" step="0.01">
            </div>
            ${selectedTemplate !== 'solo' && members.length > 1 ? `
                <button class="btn-remove" onclick="removeMember(${index})">Remove</button>
            ` : '<div></div>'}
        `;
        
        container.appendChild(row);
    });
}

function updateMember(index, field, value) {
    members[index][field] = value;
    console.log(`Updated member ${index}:`, members[index]);
}

function removeMember(index) {
    members.splice(index, 1);
    renderMembers();
}

function generatePreview() {
    console.log("Generating preview with enhanced placeholder system...");
    
    // Get template content
    const templateContent = templates[selectedTemplate].content;
    
    // Parse placeholders
    const placeholders = parseTemplatePlaceholders(templateContent);
    
    // Create entity object from form data
    const llcNameInput = document.getElementById('llc-name');
    const formationDateInput = document.getElementById('formation-date');
    const principalAddressInput = document.getElementById('principal-address');
    
    const entity = {
        llc_name: llcNameInput ? llcNameInput.value : '',
        formation_date: formationDateInput ? formationDateInput.value : '',
        principal_address: principalAddressInput ? principalAddressInput.value : '',
        members: members
    };
    
    // Auto-fill placeholders
    const filledPlaceholders = autoFillPlaceholders(placeholders, entity);
    
    // Collect user inputs from dynamic fields
    const userInputs = collectUserInputs(filledPlaceholders);
    
    // Format formation date
    if (entity.formation_date) {
        const formattedDate = new Date(entity.formation_date).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
        
        // Update FORMATION_DATE placeholder value
        const formationDatePlaceholder = filledPlaceholders.find(p => p.name === 'FORMATION_DATE');
        if (formationDatePlaceholder) {
            formationDatePlaceholder.value = formattedDate;
        }
    }
    
    // Replace all placeholders
    const finalContent = replacePlaceholders(templateContent, filledPlaceholders, userInputs);
    
    // Render preview
    const previewContainer = document.getElementById('preview-content');
    previewContainer.innerHTML = `<pre style="white-space: pre-wrap; font-family: Georgia, serif; font-size: 0.9rem; line-height: 1.8;">${finalContent}</pre>`;
    
    console.log("Preview generated successfully");
}

function exportDocument() {
    // Mark OA as completed
    if (currentEntityId) {
        updateEntityOAStatus(currentEntityId, 'completed');
    }
    
    // For now, trigger print dialog
    // In production, this would generate a proper PDF
    window.print();
    
    // After export, handle exit
    setTimeout(() => {
        handleExit(true);
    }, 1000);
}

// ============================================================================
// PHASE 1: CORE ENHANCEMENTS
// ============================================================================

/**
 * Initialize OA Builder with pre-population and draft resume
 */
function initializeOABuilder() {
    console.log("OA Builder: Phase 1 initialization...");
    
    // Extract URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    currentEntityId = urlParams.get('entity_id');
    sourceContext = urlParams.get('source') || 'dashboard';
    
    console.log(`Source: ${sourceContext}, Entity ID: ${currentEntityId}`);
    
    // Pre-populate from entity data
    if (currentEntityId && window.CONFIG && window.CONFIG.MOCK_ENTITIES) {
        const entity = window.CONFIG.MOCK_ENTITIES.find(e => e.id === currentEntityId);
        
        if (entity) {
            console.log("Pre-populating from entity:", entity.llc_name);
            
            // Pre-fill entity information
            const llcNameInput = document.getElementById('llc-name');
            const formationDateInput = document.getElementById('formation-date');
            const principalAddressInput = document.getElementById('principal-address');
            
            if (llcNameInput) llcNameInput.value = entity.llc_name || '';
            if (formationDateInput) formationDateInput.value = entity.formation_date || new Date().toISOString().split('T')[0];
            if (principalAddressInput) principalAddressInput.value = entity.principal_address || '';
            
            // Pre-populate members if available
            if (entity.members && entity.members.length > 0) {
                members = entity.members.map(m => ({
                    name: m.name || '',
                    address: m.address || '',
                    percentage: m.percentage || 0,
                    capital: m.capital || 0
                }));
                console.log(`Pre-populated ${members.length} members`);
            }
        }
    }
    
    // Load saved draft if exists
    loadDraftProgress();
    
    // Start auto-save
    startAutoSave();
    
    // Update back button
    updateBackButton();
}

/**
 * Load saved draft from localStorage
 */
function loadDraftProgress() {
    if (!currentEntityId) return;
    
    const draftKey = `oa_draft_${currentEntityId}`;
    const savedDraft = localStorage.getItem(draftKey);
    
    if (savedDraft) {
        try {
            const draft = JSON.parse(savedDraft);
            console.log("Loaded draft from:", new Date(draft.last_saved).toLocaleString());
            
            // Restore state
            if (draft.template) {
                selectedTemplate = draft.template;
            }
            
            if (draft.step && draft.step > 1) {
                currentStep = draft.step;
                // Navigate to saved step
                document.getElementById(`step-${currentStep}`).classList.add('active');
                document.getElementById(`progress-${currentStep}`).classList.add('active');
            }
            
            if (draft.entity_info) {
                const { llc_name, formation_date, principal_address } = draft.entity_info;
                if (llc_name) document.getElementById('llc-name').value = llc_name;
                if (formation_date) document.getElementById('formation-date').value = formation_date;
                if (principal_address) document.getElementById('principal-address').value = principal_address;
            }
            
            if (draft.members && draft.members.length > 0) {
                members = draft.members;
            }
            
            // Show resume notification
            showResumeNotification(draft.last_saved);
            
        } catch (e) {
            console.error("Failed to load draft:", e);
        }
    }
}

/**
 * Auto-save draft every 30 seconds
 */
function startAutoSave() {
    // Clear existing interval
    if (autoSaveInterval) {
        clearInterval(autoSaveInterval);
    }
    
    // Auto-save every 30 seconds
    autoSaveInterval = setInterval(() => {
        saveDraft();
    }, 30000);
    
    console.log("Auto-save enabled (every 30 seconds)");
}

/**
 * Save current progress to localStorage
 */
function saveDraft() {
    if (!currentEntityId) return;
    
    const llcNameInput = document.getElementById('llc-name');
    const formationDateInput = document.getElementById('formation-date');
    const principalAddressInput = document.getElementById('principal-address');
    
    const draftData = {
        entity_id: currentEntityId,
        template: selectedTemplate,
        step: currentStep,
        entity_info: {
            llc_name: llcNameInput ? llcNameInput.value : '',
            formation_date: formationDateInput ? formationDateInput.value : '',
            principal_address: principalAddressInput ? principalAddressInput.value : ''
        },
        members: members,
        last_saved: new Date().toISOString()
    };
    
    const draftKey = `oa_draft_${currentEntityId}`;
    localStorage.setItem(draftKey, JSON.stringify(draftData));
    
    console.log("Draft saved at", new Date().toLocaleTimeString());
}

/**
 * Update entity OA status (mock implementation)
 */
function updateEntityOAStatus(entityId, status) {
    // In production, this would be an API call
    // For now, just update localStorage
    const statusKey = `oa_status_${entityId}`;
    localStorage.setItem(statusKey, status);
    console.log(`OA status updated: ${status}`);
}

/**
 * Handle exit based on source context
 */
function handleExit(completed = false) {
    // Save draft before exit
    if (!completed) {
        saveDraft();
        updateEntityOAStatus(currentEntityId, 'in_progress');
    }
    
    // Clear auto-save interval
    if (autoSaveInterval) {
        clearInterval(autoSaveInterval);
    }
    
    // Redirect based on source
    if (sourceContext === 'formation') {
        if (completed) {
            window.location.href = `/app/formation-wizard.html?step=6&oa_completed=true&entity_id=${currentEntityId}`;
        } else {
            window.location.href = `/app/formation-wizard.html?step=5&oa_deferred=true&entity_id=${currentEntityId}`;
        }
    } else {
        // Dashboard or catalog
        const successParam = completed ? '&oa_completed=true' : '';
        window.location.href = `/app/obsidian-zenith.html?entity_id=${currentEntityId}${successParam}`;
    }
}

/**
 * Update back button based on source
 */
function updateBackButton() {
    const backBtn = document.querySelector('.back-link');
    if (!backBtn) return;
    
    if (sourceContext === 'formation') {
        backBtn.innerHTML = '← Back to Formation';
        backBtn.onclick = () => handleExit(false);
    } else if (sourceContext === 'catalog') {
        backBtn.innerHTML = '← Back to Dashboard';
        backBtn.onclick = () => handleExit(false);
    } else {
        backBtn.innerHTML = '← Back to Dashboard';
        backBtn.onclick = () => handleExit(false);
    }
}

/**
 * Show resume notification
 */
function showResumeNotification(lastSaved) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #4CAF50;
        color: white;
        padding: 16px 24px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        font-size: 0.9rem;
        animation: slideIn 0.3s ease-out;
    `;
    
    const savedDate = new Date(lastSaved);
    const timeAgo = getTimeAgo(savedDate);
    
    notification.innerHTML = `
        <strong>✓ Draft Restored</strong><br>
        <span style="opacity: 0.9; font-size: 0.85rem;">Last saved ${timeAgo}</span>
    `;
    
    document.body.appendChild(notification);
    
    // Remove after 5 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 5000);
}

/**
 * Get time ago string
 */
function getTimeAgo(date) {
    const seconds = Math.floor((new Date() - date) / 1000);
    
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    return `${Math.floor(seconds / 86400)} days ago`;
}

/**
 * Save and exit (for "Save & Exit" button)
 */
function saveAndExit() {
    saveDraft();
    updateEntityOAStatus(currentEntityId, 'in_progress');
    handleExit(false);
}

// ============================================================================
// OA BUILDER INITIALIZATION
// ============================================================================

/**
 * Initialize OA Builder with Phase 1 & 2 enhancements
 */
function initializeOABuilder() {
    console.log("OA Builder: Initialization...");
    
    const urlParams = new URLSearchParams(window.location.search);
    currentEntityId = urlParams.get('entity_id');
    sourceContext = urlParams.get('source') || 'dashboard';
    
    console.log(`Source: ${sourceContext}, Entity ID: ${currentEntityId}`);
    
    // Check for pending OA from formation wizard
    const pendingOA = localStorage.getItem('pending_oa_entity');
    if (pendingOA && sourceContext === 'formation') {
        console.log("Detected pending OA from formation wizard");
        const entityData = JSON.parse(pendingOA);
        prePopulateFromFormation(entityData);
        localStorage.removeItem('pending_oa_entity');
    } else if (currentEntityId) {
        // Load from mock entities
        prePopulateFromEntity(currentEntityId);
    }
    
    loadDraftProgress();
    startAutoSave();
    updateBackButton();
}

/**
 * Pre-populate from formation wizard data
 */
function prePopulateFromFormation(entityData) {
    console.log("Pre-populating from formation wizard...", entityData);
    
    // Fill Step 2 fields
    const llcNameInput = document.getElementById('llc-name');
    const formationDateInput = document.getElementById('formation-date');
    const principalAddressInput = document.getElementById('principal-address');
    
    if (llcNameInput) llcNameInput.value = entityData.llc_name || '';
    if (formationDateInput) formationDateInput.value = entityData.formation_date || '';
    if (principalAddressInput) principalAddressInput.value = entityData.principal_address || '';
    
    // Pre-populate members
    if (entityData.members && entityData.members.length > 0) {
        members = entityData.members.map(m => ({
            name: m.name || '',
            address: m.address || '',
            percentage: m.percentage || 0,
            capital: 0
        }));
        
        // Auto-select template based on member count
        if (members.length === 1) {
            selectTemplate('solo');
            console.log("Auto-selected Solo template (1 member)");
        } else {
            selectTemplate('multi');
            console.log(`Auto-selected Multi-Rider template (${members.length} members)`);
        }
    }
    
    console.log(`Pre-populated with ${members.length} members from formation`);
}

// ============================================================================
// INITIALIZATION
// ============================================================================

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    console.log('OA Builder loaded successfully.');
    loadTemplates(); // Load templates from CONFIG
    initializeOABuilder();
});

// Save draft before page unload
window.addEventListener('beforeunload', () => {
    saveDraft();
});
