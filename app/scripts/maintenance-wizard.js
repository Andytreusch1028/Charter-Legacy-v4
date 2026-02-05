class MaintenanceWizard {
    constructor() {
        this.currentStep = 1;
        this.totalSteps = 6; 
        this.entityData = null;
        this.updates = {};
        this.managers = [];
        this.addons = {
            certStatus: false,
            certCopy: false
        };
        this.baseFee = 138.75;
        
        this.init();
    }

    async init() {
        const urlParams = new URLSearchParams(window.location.search);
        const entityId = urlParams.get('entity_id');
        const entityName = urlParams.get('entity');
        
        this.entityData = CONFIG.MOCK_ENTITIES.find(e => e.id === entityId);
        
        if (!this.entityData && entityName) {
            this.entityData = CONFIG.MOCK_ENTITIES.find(e => e.llc_name === entityName);
        }

        if (!this.entityData) {
            this.entityData = CONFIG.MOCK_ENTITIES[3]; // Default Fallback
        }

        this.managers = JSON.parse(JSON.stringify(this.entityData.managers || []));
        
        this.setupUI();
        this.bindEvents();
        this.loadInitialData();
        this.renderManagers();
        this.updateTotal();
        this.updateProgress();
        this.startAuditPulse();
    }

    // --- UX Elevators ---
    updateProgress() {
        const progress = ((this.currentStep - 1) / (this.totalSteps - 1)) * 100;
        document.getElementById('progressFill').style.width = `${progress}%`;
    }

    startAuditPulse() {
        // Add skeleton classes to signify "Digital Scrivening"
        const values = document.querySelectorAll('#step1 .data-value');
        values.forEach(v => v.classList.add('skeleton'));
        
        setTimeout(() => {
            values.forEach(v => v.classList.remove('skeleton'));
            // Populate actual data
            document.getElementById('currentDocNum').textContent = this.entityData.document_number || 'L123456789';
        }, 1200);
    }
    
    setupUI() {
        document.getElementById('entityDisplayName').textContent = this.entityData.llc_name;
        
        const urlParams = new URLSearchParams(window.location.search);
        const action = urlParams.get('action');
        
        if (action === 'amendment') {
            document.getElementById('filingDisplayName').textContent = 'Articles of Amendment';
            this.baseFee = 25.00;
            this.updateTotal();

            // Show name change field
            const nameContainer = document.getElementById('nameChangeContainer');
            if (nameContainer) nameContainer.style.display = 'block';

            // Update Step 1 context
            const statusVal = document.querySelector('#step1 .data-value.active');
            if (statusVal) {
                statusVal.textContent = 'AMENDMENT INTENT (ACTIVE)';
                statusVal.style.color = 'var(--gold-leaf)';
            }

            const pulseText = document.querySelector('#step1 div[style*="background: rgba(198, 163, 85, 0.05)"] div:last-child');
            if (pulseText) {
                pulseText.textContent = 'Articles of Amendment are used to modify the fundamental record of the entity, such as its name or core structure. This is a sovereign modification to the public record.';
            }
        } else if (action === 'reinstatement') {
            document.getElementById('filingDisplayName').textContent = 'Articles of Reinstatement';
            this.baseFee = 600.00; // Mock: Penalty + Back Fees
            this.updateTotal();
            
            // Update Step 1 context
            const statusVal = document.querySelector('#step1 .data-value.active');
            if (statusVal) {
                statusVal.textContent = 'DISSOLVED (ADMIN)';
                statusVal.style.color = '#FF3B30'; // Sovereign Warning Red
            }
            
            const pulseText = document.querySelector('#step1 div[style*="background: rgba(198, 163, 85, 0.05)"] div:last-child');
            if (pulseText) {
                pulseText.textContent = 'This entity was administratively dissolved for failure to file annual reports. Reinstatement requires payment of all past-due fees and a $100 penalty.';
            }
        } else if (action === 'dissolution') {
            document.getElementById('filingDisplayName').textContent = 'Articles of Dissolution';
            this.baseFee = 25.00;
            this.updateTotal();

            // Update Step 1 context
            const statusVal = document.querySelector('#step1 .data-value.active');
            if (statusVal) {
                statusVal.textContent = 'DISSOLVING (ACTIVE)';
                statusVal.style.color = '#FF9500'; // Sovereign Amber
            }

            const pulseText = document.querySelector('#step1 div[style*="background: rgba(198, 163, 85, 0.05)"] div:last-child');
            if (pulseText) {
                pulseText.innerHTML = `
                    <div style="font-weight: 700; color: #FF9500; margin-bottom: 8px;">Institutional Wind-down</div>
                    Articles of Dissolution are final and permanent. By proceeding, you are authorizing the legal termination of this entity. Ensure all final tax obligations and wind-down activities are complete.
                `;
            }
        } else if (action === 'statement_of_change') {
            document.getElementById('filingDisplayName').textContent = 'Statement of Change';
            this.baseFee = 25.00;
            this.updateTotal();

            // Update Step 1 context
            const statusVal = document.querySelector('#step1 .data-value.active');
            if (statusVal) {
                statusVal.textContent = 'UPDATE INTENT (ACTIVE)';
                statusVal.style.color = 'var(--gold-leaf)';
            }

            const pulseText = document.querySelector('#step1 div[style*="background: rgba(198, 163, 85, 0.05)"] div:last-child');
            if (pulseText) {
                pulseText.textContent = 'This filing updates the Registered Agent or Registered Office on record with the State. A Statement of Change is required if the agent resigns or the office address changes.';
            }

            // Focused UX: Statement of Change usually doesn't involve manager updates
            this.hideStep(3); // Hide Management Slate
        } else if (action === 'correction') {
            document.getElementById('filingDisplayName').textContent = 'Articles of Correction';
            this.baseFee = 0.00; // Institutional Discount per Service Catalog
            this.updateTotal();

            // Show correction container
            const correctionContainer = document.getElementById('correctionContainer');
            if (correctionContainer) correctionContainer.style.display = 'block';

            // Update Step 1 context
            const statusVal = document.querySelector('#step1 .data-value.active');
            if (statusVal) {
                statusVal.textContent = 'CORRECTION INTENT (ACTIVE)';
                statusVal.style.color = 'var(--gold-leaf)';
            }

            const pulseText = document.querySelector('#step1 div[style*="background: rgba(198, 163, 85, 0.05)"] div:last-child');
            if (pulseText) {
                pulseText.textContent = 'Articles of Correction are used to surgically fix inaccuracies or defects in a previously filed document. This is a remedial filing to ensure the public record accurately reflects the Sovereign intent.';
            }

            // Auto-populate entity identification
            const nameField = document.getElementById('inputCorrectionEntityName');
            const docNumField = document.getElementById('inputCorrectionDocNum');
            if (nameField) nameField.value = this.entityData.llc_name || '';
            if (docNumField) docNumField.value = this.entityData.document_number || '';

            // Auto-populate filing date
            this.syncFilingDate(true);
        }
    }

    syncFilingDate(isAuto = false) {
        const dateField = document.getElementById('inputOriginalFilingDate');
        const formationDate = this.entityData.formation_date;
        
        if (formationDate) {
            dateField.value = formationDate;
            dateField.style.borderColor = 'var(--success)';
            dateField.style.boxShadow = '0 0 0 4px rgba(52, 199, 89, 0.1)';
            
            // Visual confirmation (only if manual)
            if (!isAuto && typeof event !== 'undefined' && event && event.currentTarget) {
                const syncBtn = event.currentTarget;
                const originalHtml = syncBtn.innerHTML;
                syncBtn.innerHTML = '<span style="color: var(--success)">✓ Synced</span>';
                setTimeout(() => {
                    syncBtn.innerHTML = originalHtml;
                }, 2000);
            }
            
            this.calculateDiff();
        } else if (!isAuto) {
            alert("Institutional records do not contain a formation date for this entity. Please use the Sunbiz lookup.");
        }
    }

    openSunbizLookup() {
        const docNum = this.entityData.document_number || '';
        if (docNum) {
            // Established direct record pattern for Florida Sunbiz
            const url = `https://search.sunbiz.org/Inquiry/CorporationSearch/SearchResultDetail?inquiryType=DocumentNumber&searchTerm=${docNum}`;
            window.open(url, '_blank');
        } else {
            // Fallback to name search
            const url = `https://search.sunbiz.org/Inquiry/CorporationSearch/ByName`;
            window.open(url, '_blank');
        }
    }

    hideStep(stepNumber) {
        const step = document.getElementById(`step${stepNumber}`);
        if (step) {
            step.dataset.hidden = "true";
        }
    }

    loadInitialData() {
        document.getElementById('inputPrincipal').value = this.entityData.principal_address || '';
        document.getElementById('inputMailing').value = this.entityData.mailing_address || '';
        document.getElementById('inputAgentName').value = this.entityData.agent_name || '';
        document.getElementById('inputAgentAddress').value = this.entityData.agent_address || '';
        document.getElementById('inputFein').value = this.entityData.fein || '';
        document.getElementById('inputEmail').value = this.entityData.electronic_mail || '';
    }

    bindEvents() {
        document.getElementById('btnNext').addEventListener('click', () => this.nextStep());
        document.getElementById('btnBack').addEventListener('click', () => this.prevStep());
        document.getElementById('btnFinalPay').addEventListener('click', () => this.finishWizard());

        const fields = ['inputPrincipal', 'inputMailing', 'inputAgentName', 'inputAgentAddress', 'inputFein', 'inputEmail', 'agentSignature', 'inputNewName', 'inputOriginalFilingDate', 'inputErrorDescription', 'inputCorrectionText', 'inputCorrectionDocType', 'inputCorrectionReason'];
        fields.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.addEventListener('change', () => this.calculateDiff());
        });
    }

    // --- Statutory Address Logic ---
    syncMailingAddress() {
        const sync = document.getElementById('syncMailing').checked;
        const principal = document.getElementById('inputPrincipal').value;
        const mailingField = document.getElementById('inputMailing');
        
        if (sync) {
            mailingField.value = principal;
            mailingField.readOnly = true;
            mailingField.style.opacity = '0.5';
        } else {
            mailingField.readOnly = false;
            mailingField.style.opacity = '1';
        }
        this.calculateDiff();
    }

    // --- Registered Agent Gating ---
    checkRAUpdate() {
        const currentName = this.entityData.agent_name || '';
        const currentAddr = this.entityData.agent_address || '';
        const newName = document.getElementById('inputAgentName').value;
        const newAddr = document.getElementById('inputAgentAddress').value;
        const container = document.getElementById('raAcceptanceContainer');

        if (newName !== currentName || newAddr !== currentAddr) {
            container.style.display = 'block';
        } else {
            container.style.display = 'none';
        }
        this.calculateDiff();
    }

    // --- Manager Slate Logic ---
    renderManagers() {
        const container = document.getElementById('managerList');
        const titles = ['AMBR', 'MGR', 'MGRM', 'AUTHORIZED PERSON'];
        
        container.innerHTML = this.managers.map((m, index) => `
            <div class="manager-card">
                <div class="manager-header">
                    <span class="manager-title">Position #${index + 1}</span>
                    <button class="btn-remove" onclick="window.MaintenanceWizard.removeManager(${index})">Remove</button>
                </div>
                <div style="display: grid; grid-template-columns: 140px 1fr; gap: 15px; margin-bottom: 15px;">
                    <div class="input-group" style="margin-bottom: 0;">
                        <label class="input-label">Title</label>
                        <select class="input-field" onchange="window.MaintenanceWizard.updateManager(${index}, 'title', this.value)">
                            ${titles.map(t => `<option value="${t}" ${m.title === t ? 'selected' : ''}>${t}</option>`).join('')}
                        </select>
                    </div>
                    <div class="input-group" style="margin-bottom: 0;">
                        <label class="input-label">FullName</label>
                        <input type="text" class="input-field" value="${m.name}" onchange="window.MaintenanceWizard.updateManager(${index}, 'name', this.value)">
                    </div>
                </div>
                <div class="input-group" style="margin-bottom: 0;">
                    <label class="input-label">Street Address</label>
                    <input type="text" class="input-field" value="${m.address}" onchange="window.MaintenanceWizard.updateManager(${index}, 'address', this.value)">
                </div>
            </div>
        `).join('');
    }

    addManager() {
        this.managers.push({ title: 'AMBR', name: '', address: '' });
        this.renderManagers();
        this.calculateDiff();
    }

    removeManager(index) {
        this.managers.splice(index, 1);
        this.renderManagers();
        this.calculateDiff();
    }

    updateManager(index, field, value) {
        this.managers[index][field] = value;
        this.calculateDiff();
    }

    // --- Fee & Add-ons ---
    toggleAddon(key) {
        this.addons[key] = !this.addons[key];
        const el = document.getElementById(`check${key.charAt(0).toUpperCase() + key.slice(1)}`);
        el.parentNode.classList.toggle('selected');
        this.updateTotal();
    }

    updateTotal() {
        let total = this.baseFee;
        if (this.addons.certStatus) total += 5.00;
        if (this.addons.certCopy) total += 30.00;
        document.getElementById('displayTotal').textContent = `$${total.toFixed(2)}`;
    }

    // --- Diff Engine ---
    calculateDiff() {
        const diff = {};
        const fields = {
            llc_name: 'inputNewName',
            principal_address: 'inputPrincipal',
            mailing_address: 'inputMailing',
            agent_name: 'inputAgentName',
            agent_address: 'inputAgentAddress',
            fein: 'inputFein',
            electronic_mail: 'inputEmail'
        };

        for (const [key, id] of Object.entries(fields)) {
            const el = document.getElementById(id);
            if (el) {
                const val = el.value;
                if (val !== (this.entityData[key] || '')) {
                    diff[key] = { old: this.entityData[key] || 'Not Set', new: val };
                }
            }
        }

        // Correction specific diffs
        const correctionFields = {
            original_entity_name: 'inputCorrectionEntityName',
            document_number: 'inputCorrectionDocNum',
            document_to_correct: 'inputCorrectionDocType',
            original_filing_date: 'inputOriginalFilingDate',
            nature_of_correction: 'inputCorrectionReason',
            error_description: 'inputErrorDescription',
            correction_text: 'inputCorrectionText'
        };

        for (const [label, id] of Object.entries(correctionFields)) {
            const el = document.getElementById(id);
            if (el && el.value) {
                diff[label] = { old: 'N/A', new: el.value };
            }
        }

        const raSigEl = document.getElementById('agentSignature');
        const raSig = raSigEl ? raSigEl.value : '';
        if (raSig) {
            diff['agent_acceptance'] = { old: 'NOT REQUIRED', new: 'SIGNED: ' + raSig };
        }

        const oldManagers = JSON.stringify(this.entityData.managers || []);
        const newManagers = JSON.stringify(this.managers);
        if (oldManagers !== newManagers) {
            diff['management_slate'] = { old: `${(this.entityData.managers || []).length} Persons`, new: `${this.managers.length} Persons` };
        }

        this.updates = diff;
        this.renderDiff();
    }

    renderDiff() {
        const container = document.getElementById('diffContainer');
        const keys = Object.keys(this.updates);
        
        if (keys.length === 0) {
            container.innerHTML = '<div style="background: #F9F9FB; padding: 24px; border-radius: 12px; text-align: center; color: rgba(0,0,0,0.4); font-weight: 700; font-size: 0.85rem;">No changes detected. Record is current.</div>';
            return;
        }

        container.innerHTML = keys.map(key => `
            <div style="background: #F9F9FB; border: 1px solid #E5E5EA; border-radius: 12px; padding: 16px; margin-bottom: 12px;">
                <div style="font-size: 0.6rem; font-weight: 900; color: var(--gold-leaf); text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 8px;">Update: ${key.replace('_', ' ')}</div>
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="font-size: 0.8rem; color: rgba(0,0,0,0.4); text-decoration: line-through;">${this.updates[key].old}</span>
                    <span style="font-size: 0.85rem; font-weight: 800; color: var(--success);">${this.updates[key].new}</span>
                </div>
            </div>
        `).join('');
    }

    nextStep() {
        if (this.currentStep === 2) {
            const raSig = document.getElementById('agentSignature');
            if (document.getElementById('raAcceptanceContainer').style.display === 'block' && (!raSig || raSig.value.length < 3)) {
                alert('Statutory Agent Acceptance Required');
                return;
            }
        }
        if (this.currentStep === 4) {
            if (document.getElementById('signature').value.length < 3) {
                alert('Statutory Signature Required');
                return;
            }
        }

        if (this.currentStep < 7) {
            let next = this.currentStep + 1;
            while (next < 7 && document.getElementById(`step${next}`).dataset.hidden === "true") {
                next++;
            }
            this.goToStep(next);
        }
    }

    prevStep() {
        if (this.currentStep > 1) {
            let prev = this.currentStep - 1;
            while (prev > 1 && document.getElementById(`step${prev}`).dataset.hidden === "true") {
                prev--;
            }
            this.goToStep(prev);
        }
    }

    goToStep(step) {
        document.querySelectorAll('.wizard-step').forEach(s => s.classList.remove('active'));
        
        // Short delay for the transition animation
        setTimeout(() => {
            const nextStepEl = document.getElementById(`step${step}`);
            if (nextStepEl) nextStepEl.classList.add('active');
            this.currentStep = step;
            this.updateProgress();

            const btnNext = document.getElementById('btnNext');
            const actionBar = document.getElementById('actionBar');

            if (step === 6) { btnNext.style.display = 'none'; }
            else if (step === 7) { actionBar.style.display = 'none'; }
            else { btnNext.style.display = 'block'; actionBar.style.display = 'flex'; }

            if (step === 4) this.calculateDiff();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 50);
    }

    async generateStatutoryPdf() {
        try {
            const { PDFDocument, PDFName } = PDFLib;
            
            const response = await fetch('cr2e062.pdf');
            const pdfBytes = await response.arrayBuffer();
            const pdfDoc = await PDFDocument.load(pdfBytes);
            const form = pdfDoc.getForm();

            const data = {
                llc_name: this.entityData.llc_name,
                doc_num: this.entityData.document_number,
                original_date: document.getElementById('inputOriginalFilingDate')?.value || '',
                doc_type: document.getElementById('inputCorrectionDocType')?.options[document.getElementById('inputCorrectionDocType').selectedIndex]?.text || '',
                reason_key: document.getElementById('inputCorrectionReason')?.value || '',
                error_desc: document.getElementById('inputErrorDescription')?.value || '',
                correction: document.getElementById('inputCorrectionText')?.value || '',
                signature: document.getElementById('signature')?.value || ''
            };

            // 1. Cover Letter
            try { form.getTextField('Name of Limited Liability Company').setText(data.llc_name); } catch(e) {}
            form.getTextField('Name of Person').setText(data.signature);
            form.getTextField('FirmCompany').setText(data.llc_name);
            form.getTextField('Address').setText(this.entityData.principal_address || '');
            form.getTextField('CityState and Zip Code').setText(this.entityData.principal_city || 'DELAND, FL');
            form.getTextField('Email address to be used for future annual report notification').setText(this.entityData.electronic_mail || '');
            
            try { form.getCheckBox('25 Filing Fee').check(); } catch(e) {}

            // 2. Articles of Correction
            form.getTextField('FIRST The name of the limited liability company is').setText(data.llc_name);
            form.getTextField('The Florida Document number of the limited liability company is').setText(data.doc_num);
            form.getTextField('Pursuant to section 6050209 FS this document is being submitted to correct a previously filed document').setText(data.doc_type);
            try { form.getTextField('undefined').setText(data.original_date); } catch(e) {}

            // Robust Checkbox Logic via Annotations
            const page2 = pdfDoc.getPages()[1];
            const annots = page2.node.Annots();
            
            const setCheckboxByY = (targetY, check) => {
                if (!annots) return;
                annots.asArray().forEach(ref => {
                    const annot = pdfDoc.context.lookup(ref);
                    const rect = annot.get(PDFName.of('Rect'));
                    if (rect) {
                        const y = rect.get(1).numberValue; // Y coordinate
                        const x = rect.get(0).numberValue; // X coordinate
                        // Target the checkbox column (x ~ 37) and the specific section Y
                        if (Math.abs(x - 37) < 5 && Math.abs(y - targetY) < 10) {
                            annot.set(PDFName.of('AS'), check ? PDFName.of('Yes') : PDFName.of('Off'));
                            annot.set(PDFName.of('V'), check ? PDFName.of('Yes') : PDFName.of('Off'));
                        }
                    }
                });
            };

            // Clear all three first
            setCheckboxByY(545, false);
            setCheckboxByY(410, false);
            setCheckboxByY(276, false);

            if (data.reason_key === 'incorrect_statement') {
                setCheckboxByY(545, true);
                form.getTextField('statement are as follows 1').setText(data.error_desc);
                form.getTextField('statement are as follows 2').setText(data.correction);
            } else if (data.reason_key === 'defectively_signed') {
                setCheckboxByY(410, true);
                form.getTextField('as follows 1').setText(data.error_desc);
                form.getTextField('as follows 2').setText(data.correction);
            } else if (data.reason_key === 'defective_transmission') {
                setCheckboxByY(276, true);
                form.getTextField('The electronic transmission of the record was defective').setText(data.error_desc + '\n' + data.correction);
            }

            form.flatten();

            const pdfOutputBytes = await pdfDoc.save();
            const blob = new Blob([pdfOutputBytes], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            
            const previewContainer = document.getElementById('statutoryInstrumentPreview');
            if (previewContainer) {
                previewContainer.innerHTML = `
                    <div style="text-align: center; padding: 40px;">
                        <div style="font-size: 3rem; margin-bottom: 20px;">📄</div>
                        <h3 style="color: var(--obsidian-ink); margin-bottom: 12px;">Official Sunbiz Document Ready</h3>
                        <p style="color: rgba(0,0,0,0.5); margin-bottom: 30px; font-weight: 500;">The official Florida <strong>Articles of Correction (CR2E062)</strong> <br> has been programmatically generated with 10/10 statutory fidelity.</p>
                        <a href="${url}" download="Articles_of_Correction_${data.doc_num}.pdf" class="btn-next" style="display: inline-block; background: var(--gold-leaf); color: white; text-decoration: none; padding: 12px 30px; border-radius: 8px; font-weight: 800;">Download Official PDF</a>
                    </div>
                `;
            }

            return url;
        } catch (error) {
            console.error('PDF Generation Error:', error);
            alert('Error generating statutory PDF.');
        }
    }

    renderDocumentPreview() {
        const content = document.getElementById('instrumentContent');
        if (!content) return;

        const docType = document.getElementById('inputCorrectionDocType')?.options[document.getElementById('inputCorrectionDocType').selectedIndex]?.text || '[NOT SELECTED]';
        const reasonKey = document.getElementById('inputCorrectionReason')?.value || '';
        const errorDesc = document.getElementById('inputErrorDescription')?.value || '[NO DESCRIPTION]';
        const correction = document.getElementById('inputCorrectionText')?.value || '[NO CORRECTION]';
        const originalDate = document.getElementById('inputOriginalFilingDate')?.value || '[DATE MISSING]';
        const signature = document.getElementById('signature')?.value || '[UNSIGNED]';

        content.innerHTML = `
            <div style="margin-bottom: 24px;">
                <div style="font-weight: bold; margin-bottom: 4px;">FIRST: The name of the limited liability company is:</div>
                <div style="border-bottom: 1px dotted #000; padding: 4px 0; min-height: 24px;">${this.entityData.llc_name}</div>
            </div>

            <div style="margin-bottom: 24px;">
                <div style="font-weight: bold; margin-bottom: 4px;">SECOND: The date the document to be corrected was filed:</div>
                <div style="border-bottom: 1px dotted #000; padding: 4px 0; min-height: 24px;">${originalDate}</div>
            </div>

            <div style="margin-bottom: 24px;">
                <div style="font-weight: bold; margin-bottom: 4px;">THIRD: The Florida Document Number is:</div>
                <div style="border-bottom: 1px dotted #000; padding: 4px 0; min-height: 24px;">${this.entityData.document_number}</div>
            </div>

            <div style="margin-bottom: 24px;">
                <div style="font-weight: bold; margin-bottom: 4px;">FOURTH: The document to be corrected is:</div>
                <div style="border-bottom: 1px dotted #000; padding: 4px 0; min-height: 24px;">${docType}</div>
            </div>

            <div style="margin-bottom: 24px;">
                <div style="font-weight: bold; margin-bottom: 12px;">FIFTH: Nature of Correction (check one):</div>
                <div style="margin-left: 20px;">
                    <div style="margin-bottom: 8px;">
                        <span style="display: inline-block; width: 14px; height: 14px; border: 1px solid #000; vertical-align: middle; margin-right: 8px; text-align: center; line-height: 14px;">${reasonKey === 'incorrect_statement' ? 'X' : ''}</span>
                        Contains an incorrect statement.
                    </div>
                    <div style="margin-bottom: 8px;">
                        <span style="display: inline-block; width: 14px; height: 14px; border: 1px solid #000; vertical-align: middle; margin-right: 8px; text-align: center; line-height: 14px;">${reasonKey === 'defectively_signed' ? 'X' : ''}</span>
                        Was defectively signed.
                    </div>
                    <div style="margin-bottom: 8px;">
                        <span style="display: inline-block; width: 14px; height: 14px; border: 1px solid #000; vertical-align: middle; margin-right: 8px; text-align: center; line-height: 14px;">${reasonKey === 'defective_transmission' ? 'X' : ''}</span>
                        The electronic transmission of the record was defective.
                    </div>
                </div>
            </div>

            <div style="margin-bottom: 24px;">
                <div style="font-weight: bold; margin-bottom: 4px;">SIXTH: The incorrect statement and the reason it is incorrect OR the manner in which the execution was defective:</div>
                <div style="border-bottom: 1px dotted #000; padding: 4px 0; white-space: pre-wrap; min-height: 60px;">${errorDesc}</div>
            </div>

            <div style="margin-bottom: 40px;">
                <div style="font-weight: bold; margin-bottom: 4px;">SEVENTH: The corrected information/statement is:</div>
                <div style="border-bottom: 1px dotted #000; padding: 4px 0; white-space: pre-wrap; min-height: 60px;">${correction}</div>
            </div>

            <div style="display: flex; gap: 40px; margin-top: 100px;">
                <div style="flex: 2;">
                    <div style="border-bottom: 1px solid #000; padding-bottom: 4px; font-style: italic;">${signature}</div>
                    <div style="font-size: 0.75rem; text-transform: uppercase; font-weight: bold; margin-top: 4px;">Signature of authorized representative</div>
                </div>
                <div style="flex: 1;">
                    <div style="border-bottom: 1px solid #000; padding-bottom: 4px;">${new Date().toLocaleDateString()}</div>
                    <div style="font-size: 0.75rem; text-transform: uppercase; font-weight: bold; margin-top: 4px;">Date Signed</div>
                </div>
            </div>
        `;
    }

    async finishWizard() {
        const btn = document.getElementById('btnFinalPay');
        btn.disabled = true;
        btn.textContent = 'Generating Statutory PDF...';
        
        // Generate actual PDF
        await this.generateStatutoryPdf();
        
        setTimeout(() => { 
            this.goToStep(7); 
        }, 1500);
    }
}

document.addEventListener('DOMContentLoaded', () => { window.MaintenanceWizard = new MaintenanceWizard(); });
