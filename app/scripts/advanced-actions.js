/**
 * Advanced Corporate Actions: Mergers and Conversions
 * Logic for coordinating complex statutory metamorphoses.
 */

let currentStep = 1;
let totalSteps = 5;
let entityData = null;
let selectedAbsorbedEntities = [];

document.addEventListener('DOMContentLoaded', () => {
    initWizard();
});

function initWizard() {
    console.log("Advanced Actions: Initializing...");
    
    // Determine context (Conversion or Merger)
    const isMerger = document.getElementById('mergerWizard') !== null;
    const isConversion = document.getElementById('conversionWizard') !== null;
    
    // Set default date
    const dateInput = document.getElementById('effectiveDate') || document.getElementById('mergerEffectiveDate');
    if (dateInput) dateInput.value = new Date().toISOString().split('T')[0];
    
    // Load source entity from URL or MOCK
    const urlParams = new URLSearchParams(window.location.search);
    const entityId = urlParams.get('entity_id');
    entityData = window.CONFIG.MOCK_ENTITIES.find(e => e.id === entityId) || window.CONFIG.MOCK_ENTITIES[0];
    
    if (isConversion) {
        currentStep = 1;
        totalSteps = 4;
        hydrateConversion();
    } else if (isMerger) {
        currentStep = 1;
        totalSteps = 4;
        hydrateMerger();
    }
    
    updateProgress();
    bindEvents();
}

/**
 * --- HYDRATION: CONVERSION ---
 */
function hydrateConversion() {
    document.getElementById('currentName').textContent = entityData.llc_name;
    document.getElementById('currentType').textContent = entityData.product_type === 'medical_pllc' ? 'Florida Professional LLC' : 'Florida LLC';
    
    document.getElementById('planOldName').textContent = entityData.llc_name;
    
    // Sync names to plan preview
    const newNameInput = document.getElementById('newName');
    newNameInput.addEventListener('input', (e) => {
        document.getElementById('planNewName').textContent = e.target.value || '[New Name]';
    });
}

/**
 * --- HYDRATION: MERGER ---
 */
function hydrateMerger() {
    const survivorSelect = document.getElementById('survivingEntity');
    const absorptionContainer = document.getElementById('absorptionList');
    
    // Populate survivor list with current entities
    window.CONFIG.MOCK_ENTITIES.forEach(e => {
        const opt = document.createElement('option');
        opt.value = e.id;
        opt.textContent = e.llc_name;
        if (e.id === entityData.id) opt.selected = true;
        survivorSelect.appendChild(opt);
        
        // Populate absorption options (excluding survivor by default)
        if (e.id !== entityData.id) {
            renderAbsorbedOption(e, absorptionContainer);
        }
    });
    
    survivorSelect.addEventListener('change', (e) => {
        const newSurvivorId = e.target.value;
        absorptionContainer.innerHTML = '';
        window.CONFIG.MOCK_ENTITIES.forEach(ent => {
            if (ent.id !== newSurvivorId) {
                renderAbsorbedOption(ent, absorptionContainer);
            }
        });
        updateMergerPlan();
    });
    
    updateMergerPlan();
}

function renderAbsorbedOption(entity, container) {
    const div = document.createElement('div');
    div.className = 'entity-option';
    if (selectedAbsorbedEntities.includes(entity.id)) div.classList.add('selected');
    
    div.innerHTML = `
        <div class="selection-indicator">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4">
                <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
        </div>
        <div class="entity-info">
            <div style="font-weight: 800; font-size: 1rem;">${entity.llc_name}</div>
            <div style="font-size: 0.75rem; opacity: 0.5;">${entity.document_number || 'L123456789'} &bull; Florida LLC</div>
        </div>
    `;
    
    div.onclick = () => {
        if (selectedAbsorbedEntities.includes(entity.id)) {
            selectedAbsorbedEntities = selectedAbsorbedEntities.filter(id => id !== entity.id);
            div.classList.remove('selected');
        } else {
            selectedAbsorbedEntities.push(entity.id);
            div.classList.add('selected');
        }
        updateMergerPlan();
    };
    
    container.appendChild(div);
}

function updateMergerPlan() {
    const survivorId = document.getElementById('survivingEntity').value;
    const survivor = window.CONFIG.MOCK_ENTITIES.find(e => e.id === survivorId);
    const absorbed = window.CONFIG.MOCK_ENTITIES.filter(e => selectedAbsorbedEntities.includes(e.id));
    
    const preview = document.getElementById('mergerPlanPreview');
    if (!preview) return;
    
    const absorbedNames = absorbed.length > 0 ? absorbed.map(a => a.llc_name).join(', ') : '[Selected Entities]';
    
    preview.innerHTML = `
        <h3 style="text-align: center; text-transform: uppercase;">Agreement and Plan of Merger</h3>
        <p style="font-size: 0.95rem; line-height: 1.6;">
            This Plan of Merger is adopted to merge <strong>${absorbedNames}</strong> into <strong>${survivor.llc_name}</strong> (the "Surviving Entity").
            <br><br>
            1. SURVIVAL: Upon the effective date, the separate existence of the absorbed entities shall cease, and they shall be merged into the Surviving Entity.
            <br>
            2. TRANSFER: All assets, rights, duties, and liabilities of the absorbed entities shall be vested in the Surviving Entity by operation of law.
            <br>
            3. AMENDMENT: The Articles of Organization of the Surviving Entity shall remain unchanged.
        </p>
    `;
}

/**
 * --- NAVIGATION ---
 */
function nextStep() {
    if (currentStep < totalSteps) {
        document.getElementById(`step${currentStep}`).classList.remove('active');
        currentStep++;
        document.getElementById(`step${currentStep}`).classList.add('active');
        updateProgress();
        
        if (currentStep === totalSteps) {
            document.getElementById('actionBar').style.display = 'none';
        }
    }
}

function prevStep() {
    if (currentStep > 1) {
        document.getElementById(`step${currentStep}`).classList.remove('active');
        currentStep--;
        document.getElementById(`step${currentStep}`).classList.add('active');
        updateProgress();
        document.getElementById('actionBar').style.display = 'flex';
    }
}

function updateProgress() {
    const fill = document.getElementById('progressFill');
    if (fill) fill.style.width = `${(currentStep / totalSteps) * 100}%`;
}

function bindEvents() {
    // Shared finish logic
    window.prevStep = prevStep;
    window.nextStep = nextStep;
}
