
if (typeof renderSealedVaultHelper === 'undefined') {
    // --- VAULT LOGIC (Decrypted Session) ---
    // Load from Persistence or Default
    const savedVault = localStorage.getItem('zenith_vault_items');
    var _vaultArtifacts = savedVault ? JSON.parse(savedVault) : [
        { id: 'v1', name: 'Last Will & Testament.pdf', size: '2.4 MB', date: '2025-11-02', status: 'ACTIVE', type: 'doc' },
        { id: 'v2', name: 'Deed_Aspen_Property.pdf', size: '4.1 MB', date: '2024-08-15', status: 'ACTIVE', type: 'doc' },
        { id: 'v3', name: 'Crypto_Cold_Storage.dat', size: '12 KB', date: '2025-12-10', status: 'ACTIVE', type: 'key' },
        { id: 'v4', name: 'Letter_to_Sarah.pdf', size: '1.2 MB', date: '2026-01-15', status: 'ACTIVE', type: 'doc' }
    ];
    // Ensure storage is seeded if empty
    if (!savedVault) {
        localStorage.setItem('zenith_vault_items', JSON.stringify(_vaultArtifacts));
    }

    window.renderSealedVaultHelper = function() {
        try {
            // Log Access
            if (window.LegacyAudit) LegacyAudit.logAction('ACCESS', 'SESSION_START', 'Decrypted Vault Session Active', 'CURRENT_USER');

            const controlCenter = document.getElementById('controlCenter');
            if (!controlCenter) throw new Error("Control Center DOM Element Not Found");
            
            const renderList = () => {
                 const items = _vaultArtifacts.filter(a => a.status === 'ACTIVE');
                 // alert("DEBUG: Rendering " + items.length + " items."); // Loud Debug output
                 return items.map(file => `
                    <div class="vault-row" style="display: flex; align-items: center; justify-content: space-between; padding: 1.2rem; border-bottom: 1px solid #eee; background: white;">
                        <div style="display: flex; align-items: center; gap: 1rem; flex: 1;">
                            <div style="width: 40px; height: 40px; background: ${file.type === 'key' ? 'rgba(212, 175, 55, 0.15)' : '#f8f9fb'}; border-radius: 10px; display: flex; align-items: center; justify-content: center; color: ${file.type === 'key' ? 'var(--gold-leaf, #d4af37)' : '#888'}; border: 1px solid ${file.type === 'key' ? 'rgba(212, 175, 55, 0.3)' : '#eee'};">
                                ${file.type === 'key' ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>' : '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>'}
                            </div>
                            <div>
                                <div style="font-weight: 600; color: #111; font-size: 0.95rem;">${file.name}</div>
                                <div style="font-size: 0.75rem; color: #888; margin-top: 2px;">Size: ${file.size} • Last Modified: ${file.date}</div>
                                ${file.description ? `<div style="font-size: 0.7rem; color: #0066ff; margin-top: 4px; font-weight: 500;">${file.description}</div>` : ''}
                            </div>
                        </div>
                        <div style="display: flex; gap: 8px; align-items: center;">
                             <!-- Rename (Pencil) -->
                             <button class="action-btn" onclick="promptRename('${file.id}')" title="Rename">
                                <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                             </button>
                             <!-- Info (Circle i) -->
                             <button class="action-btn" onclick="editMetadata('${file.id}')" title="Edit Info">
                                <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                             </button>
                             <!-- Archive (Box) -->
                             <button class="action-btn delete" onclick="archiveArtifact('${file.id}')" title="Archive">
                                <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="21 8 21 21 3 21 3 8"></polyline><rect x="1" y="3" width="22" height="5"></rect><line x1="10" y1="12" x2="14" y2="12"></line></svg>
                             </button>
                        </div>
                    </div>
                `).join('');
            };

            controlCenter.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                    <div>
                        <div style="font-size: 0.65rem; font-weight: 900; text-transform: uppercase; letter-spacing: 0.1em; color: var(--accent-green); display: flex; align-items: center; gap: 6px;">
                            <span style="width: 6px; height: 6px; background: var(--accent-green); border-radius: 50%; display: inline-block;"></span>
                            Decrypted Session Active
                        </div>
                        <h1 class="entity-title" style="margin-top: 0.5rem; font-size: 2.5rem;">The Vault</h1>
                    </div>
                    <button onclick="renderLegacyMode()" class="btn-zenith btn-secondary" style="background: #f5f5f5;">Lock & Exit</button>
                </div>

                <div style="background: white; border-radius: 20px; box-shadow: 0 4px 20px rgba(0,0,0,0.05); border: 1px solid #eee; border-top: 3px solid var(--gold-leaf, #d4af37);">
                    <div style="border-bottom: 1px solid rgba(0,0,0,0.05); padding: 0 1.5rem;">
                         <div style="display: flex; gap: 2rem;">
                            <button class="tab-btn active" style="padding: 1rem 0; font-weight: 700; border: none; background: none; border-bottom: 3px solid var(--gold-leaf, #d4af37); cursor: pointer; color: var(--gold-leaf, #d4af37);">Artifacts</button>
                            <button class="tab-btn" style="padding: 1rem 0; font-weight: 500; opacity: 0.5; border: none; background: none; cursor: pointer;">Directives</button>
                            <button class="tab-btn" style="padding: 1rem 0; font-weight: 500; opacity: 0.5; border: none; background: none; cursor: pointer;">Audit Log</button>
                        </div>
                    </div>
                    
                    <div id="vault-list-container" style="min-height: 100px;">
                        ${renderList()}
                    </div>

                     <div id="upload-zone" style="padding: 2rem; text-align: center; border-top: 1px dashed rgba(0,0,0,0.1); cursor: pointer; transition: background 0.2s; display: flex; flex-direction: column; align-items: center; gap: 12px;" 
                          onclick="triggerMockUpload()"
                          onmouseover="this.style.background='#fafafa'" 
                          onmouseout="this.style.background='white'">
                         <div style="width: 44px; height: 44px; background: rgba(212, 175, 55, 0.1); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: var(--gold-leaf, #d4af37);">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                         </div>
                         <div style="color: var(--gold-leaf, #d4af37); font-size: 0.9rem; font-weight: 700; letter-spacing: 0.02em;">Add Document</div>
                     </div>
                </div>
            `;
            
            // Expose helpers globally for this closure
            window.promptRename = (id) => {
                const file = _vaultArtifacts.find(f => f.id === id);
                if (typeof openCustomPrompt === 'function') {
                    openCustomPrompt(
                        'Rename Artifact',
                        'Enter new name for the artifact:',
                        file.name,
                        (newName) => {
                            if (newName && newName !== file.name) {
                                file.name = newName;
                                file.date = new Date().toISOString().split('T')[0];
                                localStorage.setItem('zenith_vault_items', JSON.stringify(_vaultArtifacts));
                                if (window.LegacyAudit) LegacyAudit.logAction('MODIFY', 'RENAME', `Renamed ${file.id} to ${newName}`, 'CURRENT_USER');
                                renderSealedVaultHelper();
                                if (typeof showToast === 'function') showToast("Artifact renamed", "success");
                            }
                        }
                    );
                }
            };
            
            window.editMetadata = (id) => {
                const file = _vaultArtifacts.find(f => f.id === id);
                if (typeof openCustomPrompt === 'function') {
                    openCustomPrompt(
                        'Edit Metadata',
                        'Enter description / metadata details:',
                        file.description || '',
                        (newDesc) => {
                            if (newDesc !== null && newDesc !== file.description) {
                                file.description = newDesc;
                                localStorage.setItem('zenith_vault_items', JSON.stringify(_vaultArtifacts));
                                if (window.LegacyAudit) LegacyAudit.logAction('MODIFY', 'METADATA', `Updated metadata for ${file.name}`, 'CURRENT_USER');
                                renderSealedVaultHelper();
                                if (typeof showToast === 'function') showToast("Metadata updated", "success");
                            }
                        }
                    );
                }
            };

            window.archiveArtifact = (id) => {
                const file = _vaultArtifacts.find(f => f.id === id);
                if (typeof openCustomConfirm === 'function') {
                    openCustomConfirm(
                        'Archive Artifact',
                        `Are you sure you want to archive "${file.name}"? This will move it to history.`,
                        (confirmed) => {
                            if (confirmed) {
                                file.status = 'ARCHIVED';
                                localStorage.setItem('zenith_vault_items', JSON.stringify(_vaultArtifacts));
                                if (window.LegacyAudit) LegacyAudit.logAction('MODIFY', 'ARCHIVE', `Archived ${file.name}`, 'CURRENT_USER');
                                renderSealedVaultHelper();
                                if (typeof showToast === 'function') showToast("Artifact archived", "success");
                            }
                        }
                    );
                }
            };

            window.triggerMockUpload = () => {
                if (typeof openCustomPrompt === 'function') {
                    openCustomPrompt(
                        'Add Artifact',
                        'Enter Filename (e.g. Trust_Amendment.pdf)',
                        '',
                        (name) => {
                            if (!name) return;
                            
                            // Sequential prompt for description
                            openCustomPrompt(
                                'Add Artifact',
                                'Enter Description / Metadata details:',
                                '',
                                (desc) => {
                                    _vaultArtifacts.push({
                                        id: 'v' + Date.now(),
                                        name: name,
                                        size: (Math.random() * 5 + 0.5).toFixed(1) + ' MB',
                                        date: new Date().toISOString().split('T')[0],
                                        status: 'ACTIVE',
                                        type: name.endsWith('.key') || name.endsWith('.dat') ? 'key' : 'doc',
                                        description: desc
                                    });
                                    localStorage.setItem('zenith_vault_items', JSON.stringify(_vaultArtifacts));
                                    
                                    if (window.LegacyAudit) LegacyAudit.logAction('UPLOAD', 'NEW_ASSET', `Uploaded ${name}`, 'CURRENT_USER');
                                    renderSealedVaultHelper();
                                    if (typeof showToast === 'function') showToast("Artifact added to vault", "success");
                                }
                            );
                        }
                    );
                }
            };
        } catch (e) {
            console.error("Critical Vault Error:", e);
            alert("CRITICAL VAULT RENDER ERROR:\n" + e.message + "\n" + e.stack);
        }
    };
}
