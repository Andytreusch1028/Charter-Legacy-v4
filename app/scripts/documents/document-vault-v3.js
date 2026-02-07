let currentFilter = { category: null, source: null };
let selectedFile = null;
let currentIconPickerTarget = null; // 'new' or catId
let confirmCallback = null;
let promptCallback = null;
const AVAILABLE_ICONS = [
    'folder', 'documents', 'chart', 'scales', 'pen', 'coins', 'building', 'user', 'vault', 'shield', 'gear', 'archive', 'search', 'mail', 'key', 'lock',
    'eye', 'trash', 'plus', 'download', 'upload',
    'briefcase', 'pie-chart', 'bar-chart', 'trending-up', 'globe', 'credit-card', 'database', 'server',
    'book', 'home', 'award', 'star', 'heart', 'anchor', 'compass', 'mountain', 'tree', 'feather',
    'target', 'flag', 'map', 'user-check', 'landmark', 'shield-check'
];
const ALLOWED_EXTENSIONS = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.png', '.jpg', '.jpeg', '.txt'];

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    console.log(`Document Vault v3.0 Initialized. Icon Library: ${AVAILABLE_ICONS.length} glyphs.`);
    renderAll();
});

function renderAll() {
    renderStats();
    renderFilters();
    renderDocuments();
}

// --- STATS ---

function renderStats() {
    const docs = DocumentStore.getDocuments();
    
    const totalDocs = docs.length;
    const raDocs = docs.filter(d => d.source === 'ra_upload').length;
    const userDocs = docs.filter(d => d.source === 'user_upload').length;
    const totalSize = docs.reduce((sum, d) => sum + (d.file_size || 0), 0);

    document.getElementById('statsBar').innerHTML = `
        <div class="stat-item highlight">
            <div class="stat-icon-wrap"><svg class="stat-icon-svg"><use href="/assets/icons-obsidian.svg?v=3#icon-documents"></use></svg></div>
            <div class="stat-content">
                <span class="stat-value">${totalDocs}</span>
                <span class="stat-label">Total Documents</span>
            </div>
        </div>
        <div class="stat-item">
            <div class="stat-icon-wrap"><svg class="stat-icon-svg"><use href="/assets/icons-obsidian.svg?v=3#icon-building"></use></svg></div>
            <div class="stat-content">
                <span class="stat-value">${raDocs}</span>
                <span class="stat-label">RA Filings</span>
            </div>
        </div>
        <div class="stat-item">
            <div class="stat-icon-wrap"><svg class="stat-icon-svg"><use href="/assets/icons-obsidian.svg?v=3#icon-user"></use></svg></div>
            <div class="stat-content">
                <span class="stat-value">${userDocs}</span>
                <span class="stat-label">Your Uploads</span>
            </div>
        </div>
        <div class="stat-item">
            <div class="stat-icon-wrap"><svg class="stat-icon-svg"><use href="/assets/icons-obsidian.svg?v=3#icon-vault"></use></svg></div>
            <div class="stat-content">
                <span class="stat-value">${DocumentStore.formatFileSize(totalSize)}</span>
                <span class="stat-label">Total Size</span>
            </div>
        </div>
    `;
}

// --- FILTERS ---

function renderFilters() {
    const categories = DocumentStore.getCategories();
    
    let html = `
        <div class="filter-section">
            <div class="filter-row">
                <span class="filter-label">Category</span>
                <div class="filter-pill ${!currentFilter.category ? 'active' : ''}" onclick="setFilter('category', null)">All</div>
    `;

    categories.forEach(cat => {
        const isActive = currentFilter.category === cat.id;
        const iconSvg = `<svg class="filter-icon"><use href="/assets/icons-obsidian.svg?v=3#icon-${cat.icon}"></use></svg>`;
        html += `<div class="filter-pill ${isActive ? 'active' : ''}" onclick="setFilter('category', '${cat.id}')">${iconSvg} ${cat.name}</div>`;
    });

    html += `
                <span class="manage-categories-btn" onclick="openCategoryModal()"><svg class="filter-icon"><use href="/assets/icons-obsidian.svg?v=3#icon-gear"></use></svg> Manage</span>
            </div>
            <div class="filter-row">
                <span class="filter-label">Source</span>
                <div class="filter-pill ${!currentFilter.source ? 'active' : ''}" onclick="setFilter('source', null)">All</div>
                <div class="filter-pill ${currentFilter.source === 'ra_upload' ? 'active' : ''}" onclick="setFilter('source', 'ra_upload')"><svg class="filter-icon"><use href="/assets/icons-obsidian.svg?v=3#icon-building"></use></svg> RA Only</div>
                <div class="filter-pill ${currentFilter.source === 'user_upload' ? 'active' : ''}" onclick="setFilter('source', 'user_upload')"><svg class="filter-icon"><use href="/assets/icons-obsidian.svg?v=3#icon-user"></use></svg> My Uploads</div>
            </div>
        </div>
    `;

    document.getElementById('filterBar').innerHTML = html;
}

function setFilter(type, value) {
    currentFilter[type] = value;
    renderFilters();
    renderDocuments();
}

// --- DOCUMENT LIST ---

function renderDocuments() {
    const filters = {};
    if (currentFilter.category) filters.category_id = currentFilter.category;
    if (currentFilter.source) filters.source = currentFilter.source;

    const docs = DocumentStore.getDocuments(filters);
    const categories = DocumentStore.getCategories();

    if (docs.length === 0) {
        document.getElementById('documentList').innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📁</div>
                <h3 class="empty-state-title">No documents found</h3>
                <p class="empty-state-desc">Upload your first document or adjust filters</p>
                <button class="btn-primary" onclick="openUploadModal()">Upload Document</button>
            </div>
        `;
        return;
    }

    let html = '';
    docs.forEach(doc => {
        const cat = categories.find(c => c.id === doc.category_id) || { name: 'Uncategorized', icon: '📁' };
        const canEdit = DocumentStore.canEdit(doc);
        const canDelete = DocumentStore.canDelete(doc);
        const isRA = doc.source === 'ra_upload';

        html += `
            <div class="document-item">
                <div class="document-info">
                    <div class="document-icon ${getFileIconClass(doc.file_type)}">${getFileIconEmoji(doc.file_type)}</div>
                    <div class="document-details">
                        <div class="document-name">${doc.name}</div>
                        <div class="document-meta">
                            <span class="source-badge ${isRA ? 'ra' : 'user'}">
                                <svg class="category-icon-svg"><use href="/assets/icons-obsidian.svg?v=3#icon-${isRA ? 'building' : 'user'}"></use></svg>
                                ${isRA ? 'RA' : 'YOU'}
                            </span>
                            <span class="category-badge"><svg class="category-icon-svg"><use href="/assets/icons-obsidian.svg?v=3#icon-${cat.icon}"></use></svg> ${cat.name}</span>
                            <span>${DocumentStore.formatFileSize(doc.file_size)}</span>
                            <span>${DocumentStore.formatDate(doc.uploaded_at)}</span>
                        </div>
                    </div>
                </div>
                <div class="document-actions">
                    <button class="action-btn view" onclick="viewDocument('${doc.id}')" title="View"><svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg></button>
                    ${canEdit ? `<button class="action-btn" onclick="openEditModal('${doc.id}')" title="Edit"><svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg></button>` : ''}
                    ${canDelete ? `<button class="action-btn delete" onclick="confirmDelete('${doc.id}')" title="Delete"><svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg></button>` : ''}
                </div>
            </div>
        `;
    });

    document.getElementById('documentList').innerHTML = html;
}

function getFileIconClass(fileType) {
    if (!fileType) return 'default';
    if (fileType.includes('pdf')) return 'pdf';
    if (fileType.includes('word') || fileType.includes('doc')) return 'doc';
    if (fileType.includes('excel') || fileType.includes('sheet') || fileType.includes('xls')) return 'xls';
    if (fileType.includes('image') || fileType.includes('png') || fileType.includes('jpg')) return 'img';
    return 'default';
}

function getFileIconEmoji(fileType) {
    if (!fileType) return '📄';
    if (fileType.includes('pdf')) return 'PDF';
    if (fileType.includes('word') || fileType.includes('doc')) return 'DOC';
    if (fileType.includes('excel') || fileType.includes('sheet') || fileType.includes('xls')) return 'XLS';
    if (fileType.includes('image') || fileType.includes('png') || fileType.includes('jpg')) return 'IMG';
    return '📄';
}

function getFileIcon(fileType) {
    // Legacy function for backward compatibility
    return getFileIconEmoji(fileType);
}

// --- UPLOAD MODAL ---

function openUploadModal() {
    selectedFile = null;
    document.getElementById('fileInput').value = '';
    document.getElementById('docName').value = '';
    document.getElementById('selectedFileDisplay').innerHTML = '';
    populateCategoryDropdown('docCategory');
    document.getElementById('uploadModal').classList.add('active');
}

function closeUploadModal() {
    document.getElementById('uploadModal').classList.remove('active');
}

function populateCategoryDropdown(selectId, selectedValue = null) {
    const categories = DocumentStore.getCategories().filter(c => c.id !== 'cat-ra'); // Exclude RA category for user uploads
    const optionsContainer = document.getElementById(selectId + 'Options');
    const triggerValue = document.getElementById(selectId + 'TriggerValue');
    const hiddenInput = document.getElementById(selectId);
    
    if (!optionsContainer) return;

    let optionsHtml = '';
    categories.forEach(cat => {
        const isSelected = cat.id === selectedValue;
        optionsHtml += `
            <div class="select-option ${isSelected ? 'selected' : ''}" onclick="selectCategoryOption('${selectId}', '${cat.id}', '${cat.icon}', '${cat.name}')">
                <svg class="category-icon-svg"><use href="/assets/icons-obsidian.svg?v=3#icon-${cat.icon}"></use></svg>
                <span>${cat.name}</span>
            </div>
        `;
    });
    
    optionsContainer.innerHTML = optionsHtml;

    // Set initial value
    if (selectedValue) {
        const cat = categories.find(c => c.id === selectedValue);
        if (cat) {
            hiddenInput.value = cat.id;
            triggerValue.innerHTML = `
                <svg class="category-icon-svg"><use href="/assets/icons-obsidian.svg?v=3#icon-${cat.icon}"></use></svg>
                <span>${cat.name}</span>
            `;
            return;
        }
    }

    // Default if no selection
    if (categories.length > 0) {
        const first = categories[0];
        hiddenInput.value = first.id;
        triggerValue.innerHTML = `
            <svg class="category-icon-svg"><use href="/assets/icons-obsidian.svg?v=3#icon-${first.icon}"></use></svg>
            <span>${first.name}</span>
        `;
    }
}

function toggleCustomSelect(event, selectorId) {
    event.stopPropagation();
    const selector = document.getElementById(selectorId);
    const wasActive = selector.classList.contains('active');
    
    // Close all other custom selects first
    document.querySelectorAll('.custom-select').forEach(s => s.classList.remove('active'));
    
    if (!wasActive) {
        selector.classList.add('active');
        
        // Close on outside click
        const closeDropdown = (e) => {
            if (!selector.contains(e.target)) {
                selector.classList.remove('active');
                document.removeEventListener('click', closeDropdown);
            }
        };
        setTimeout(() => document.addEventListener('click', closeDropdown), 0);
    }
}

function selectCategoryOption(selectId, catId, icon, name) {
    const hiddenInput = document.getElementById(selectId);
    const triggerValue = document.getElementById(selectId + 'TriggerValue');
    const selector = document.getElementById(selectId + 'Selector');
    
    hiddenInput.value = catId;
    triggerValue.innerHTML = `
        <svg class="category-icon-svg"><use href="/assets/icons-obsidian.svg?v=3#icon-${icon}"></use></svg>
        <span>${name}</span>
    `;
    
    selector.classList.remove('active');
    
    // Refresh options to show selection
    const categories = DocumentStore.getCategories().filter(c => c.id !== 'cat-ra');
    const optionsContainer = document.getElementById(selectId + 'Options');
    let optionsHtml = '';
    categories.forEach(cat => {
        const isSelected = cat.id === catId;
        optionsHtml += `
            <div class="select-option ${isSelected ? 'selected' : ''}" onclick="selectCategoryOption('${selectId}', '${cat.id}', '${cat.icon}', '${cat.name}')">
                <svg class="category-icon-svg"><use href="/assets/icons-obsidian.svg?v=3#icon-${cat.icon}"></use></svg>
                <span>${cat.name}</span>
            </div>
        `;
    });
    optionsContainer.innerHTML = optionsHtml;
}

function handleFileSelect(event) {
    const file = event.target.files[0];
    if (!file) return;

    if (!isValidFileType(file)) {
        showToast('Invalid file type. Please upload documents or images.', 'error');
        event.target.value = '';
        return;
    }

    selectedFile = file;
    document.getElementById('docName').value = file.name;

    document.getElementById('selectedFileDisplay').innerHTML = `
        <div class="selected-file">
            <span class="selected-file-icon">${getFileIcon(file.type)}</span>
            <span class="selected-file-name">${file.name}</span>
            <span class="selected-file-remove" onclick="removeSelectedFile()">✕</span>
        </div>
    `;
}

function isValidFileType(file) {
    const fileName = file.name.toLowerCase();
    return ALLOWED_EXTENSIONS.some(ext => fileName.endsWith(ext));
}

function removeSelectedFile() {
    selectedFile = null;
    document.getElementById('fileInput').value = '';
    document.getElementById('selectedFileDisplay').innerHTML = '';
    document.getElementById('docName').value = '';
}

function uploadDocument() {
    const name = document.getElementById('docName').value.trim();
    const categoryId = document.getElementById('docCategory').value;

    if (!name) {
        showToast('Please enter a document name', 'error');
        return;
    }

    const newDoc = DocumentStore.addDocument({
        name: name,
        category_id: categoryId,
        file_size: selectedFile ? selectedFile.size : Math.floor(Math.random() * 500000) + 50000,
        file_type: selectedFile ? selectedFile.type : 'application/pdf'
    });

    closeUploadModal();
    showToast('Document uploaded successfully!', 'success');
    renderAll();
}

// --- EDIT MODAL ---

function openEditModal(docId) {
    const doc = DocumentStore.getDocument(docId);
    if (!doc || !DocumentStore.canEdit(doc)) return;

    document.getElementById('editDocId').value = doc.id;
    document.getElementById('editDocName').value = doc.name;
    populateCategoryDropdown('editDocCategory', doc.category_id);
    document.getElementById('editModal').classList.add('active');
}

function closeEditModal() {
    document.getElementById('editModal').classList.remove('active');
}

function saveDocumentEdit() {
    const docId = document.getElementById('editDocId').value;
    const name = document.getElementById('editDocName').value.trim();
    const categoryId = document.getElementById('editDocCategory').value;

    if (!name) {
        showToast('Please enter a document name', 'error');
        return;
    }

    DocumentStore.updateDocument(docId, {
        name: name,
        category_id: categoryId
    });

    closeEditModal();
    showToast('Document updated!', 'success');
    renderAll();
}

// --- DELETE ---

function confirmDelete(docId) {
    const doc = DocumentStore.getDocument(docId);
    if (!doc) return;

    openCustomConfirm(
        'Delete Document',
        `Are you sure you want to delete "${doc.name}"? This action cannot be undone.`,
        (confirmed) => {
            if (confirmed) {
                DocumentStore.deleteDocument(docId);
                showToast('Document deleted', 'success');
                renderAll();
            }
        }
    );
}

// --- VIEW ---

function viewDocument(docId) {
    // In production, this would open the actual file
    // For now, show a toast
    const doc = DocumentStore.getDocument(docId);
    showToast(`Opening ${doc.name}...`, 'success');
}

// --- CATEGORY MANAGER ---

function openCategoryModal() {
    renderCategoryList();
    document.getElementById('categoryModal').classList.add('active');
}

function closeCategoryModal() {
    document.getElementById('categoryModal').classList.remove('active');
    renderFilters(); // Refresh filters in case categories changed
}

function renderCategoryList() {
    const categories = DocumentStore.getCategories();
    const docs = DocumentStore.getDocuments();

    let html = '';
    categories.forEach(cat => {
        const docCount = docs.filter(d => d.category_id === cat.id).length;
        const isProtected = cat.is_protected;

        html += `
            <div class="category-item ${isProtected ? 'protected' : ''}">
                <span class="category-icon" ${!isProtected ? `onclick="toggleIconPicker(event, '${cat.id}')"` : ''}>
                    <svg class="category-icon-svg"><use href="/assets/icons-obsidian.svg?v=3#icon-${cat.icon}"></use></svg>
                </span>
                <span class="category-name">${cat.name}</span>
                <span class="category-count">${docCount} docs</span>
                ${!isProtected ? `
                    <div class="category-actions">
                        <button onclick="editCategory('${cat.id}')" title="Rename"><svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg></button>
                        <button onclick="deleteCategory('${cat.id}')" title="Delete" style="color: var(--accent-red);"><svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg></button>
                    </div>
                ` : '<span style="font-size: 0.7rem; color: var(--text-secondary);">Protected</span>'}
            </div>
        `;
    });

    document.getElementById('categoryList').innerHTML = html;
}

// --- ICON PICKER LOGIC ---

function toggleIconPicker(event, target) {
    event.stopPropagation();
    const picker = document.getElementById('iconPicker');
    
    // If clicking same target, close it
    if (currentIconPickerTarget === target && picker.classList.contains('active')) {
        picker.classList.remove('active');
        return;
    }

    currentIconPickerTarget = target;
    renderIconPicker();
    
    // Position the picker
    const rect = event.currentTarget.getBoundingClientRect();
    const modalRect = document.querySelector('#categoryModal .modal').getBoundingClientRect();
    
    picker.style.top = (rect.bottom - modalRect.top + 10) + 'px';
    picker.style.left = (rect.left - modalRect.left) + 'px';
    picker.classList.add('active');

    // Close on outside click
    const closePicker = (e) => {
        if (!picker.contains(e.target) && !event.currentTarget.contains(e.target)) {
            picker.classList.remove('active');
            document.removeEventListener('click', closePicker);
        }
    };
    setTimeout(() => document.addEventListener('click', closePicker), 0);
}

function renderIconPicker() {
    const picker = document.getElementById('iconPicker');
    let currentIcon = '';

    if (currentIconPickerTarget === 'new') {
        currentIcon = document.getElementById('newCategoryIcon').value;
    } else if (currentIconPickerTarget.startsWith('quick-')) {
        const baseId = currentIconPickerTarget.replace('quick-', '');
        const idParts = baseId.split('');
        // baseId is like docCategory or editDocCategory
        // the ID for the hidden input is quickDocCategoryIcon or quickEditDocCategoryIcon
        // We need to capitalize the first letter for the editDocCategory case
        const capitalized = baseId.charAt(0).toUpperCase() + baseId.slice(1);
        currentIcon = document.getElementById('quick' + capitalized + 'Icon').value;
    } else {
        const cat = DocumentStore.getCategory(currentIconPickerTarget);
        currentIcon = cat ? cat.icon : 'folder';
    }

    let html = '';
    AVAILABLE_ICONS.forEach(icon => {
        const isSelected = icon === currentIcon;
        html += `
            <div class="icon-option ${isSelected ? 'selected' : ''}" onclick="selectIcon('${icon}')">
                <svg class="category-icon-svg"><use href="/assets/icons-obsidian.svg?v=3#icon-${icon}"></use></svg>
            </div>
        `;
    });
    picker.innerHTML = html;
}

function selectIcon(icon) {
    if (currentIconPickerTarget === 'new') {
        document.getElementById('newCategoryIcon').value = icon;
        document.getElementById('newCategoryIconPreview').innerHTML = `<use href="/assets/icons-obsidian.svg?v=3#icon-${icon}"></use>`;
    } else if (currentIconPickerTarget.startsWith('quick-')) {
        const baseId = currentIconPickerTarget.replace('quick-', '');
        const capitalized = baseId.charAt(0).toUpperCase() + baseId.slice(1);
        document.getElementById('quick' + capitalized + 'Icon').value = icon;
        document.getElementById('quick' + capitalized + 'IconPreview').innerHTML = `<use href="/assets/icons-obsidian.svg?v=3#icon-${icon}"></use>`;
    } else {
        DocumentStore.updateCategory(currentIconPickerTarget, { icon: icon });
        renderCategoryList();
        renderFilters();
        showToast('Icon updated!', 'success');
    }
    document.getElementById('iconPicker').classList.remove('active');
}

function addNewCategory() {
    const nameInput = document.getElementById('newCategoryName');
    const name = nameInput.value.trim();
    const icon = document.getElementById('newCategoryIcon').value;

    if (!name) {
        nameInput.classList.add('error');
        showToast('Please enter a category name', 'error');
        setTimeout(() => nameInput.classList.remove('error'), 1000);
        return;
    }

    DocumentStore.addCategory(name, icon);
    nameInput.value = '';
    // Reset icon to default
    document.getElementById('newCategoryIcon').value = 'folder';
    document.getElementById('newCategoryIconPreview').innerHTML = `<use href="/assets/icons-obsidian.svg#icon-folder"></use>`;
    
    renderCategoryList();
    renderFilters();
    showToast('Category added!', 'success');
}

function editCategory(catId) {
    const cat = DocumentStore.getCategory(catId);
    if (!cat) return;

    openCustomPrompt(
        'Rename Category',
        'Enter new category name:',
        cat.name,
        (newName) => {
            if (newName && newName.trim()) {
                DocumentStore.updateCategory(catId, { name: newName.trim() });
                renderCategoryList();
                renderFilters();
                showToast('Category updated!', 'success');
            }
        }
    );
}

function deleteCategory(catId) {
    const cat = DocumentStore.getCategory(catId);
    if (!cat) return;

    openCustomConfirm(
        'Delete Category',
        `Delete category "${cat.name}"? Documents in this category will be moved to Uncategorized.`,
        (confirmed) => {
            if (confirmed) {
                const result = DocumentStore.deleteCategory(catId);
                if (result.success) {
                    renderCategoryList();
                    if (result.orphaned > 0) {
                        showToast(`${result.orphaned} document(s) moved to Uncategorized`, 'success');
                    } else {
                        showToast('Category deleted!', 'success');
                    }
                }
            }
        }
    );
}

// --- QUICK CREATE ---

function toggleQuickCategory(baseId) {
    const box = document.getElementById(baseId + 'QuickBox');
    const isVisible = box.style.display === 'block';
    
    // Close all other quick boxes
    document.querySelectorAll('.quick-create-box').forEach(b => b.style.display = 'none');
    
    if (!isVisible) {
        box.style.display = 'block';
        const capitalized = baseId.charAt(0).toUpperCase() + baseId.slice(1);
        document.getElementById('quick' + capitalized + 'Name').focus();
    }
}

function saveQuickCategory(baseId) {
    const capitalized = baseId.charAt(0).toUpperCase() + baseId.slice(1);
    const nameInput = document.getElementById('quick' + capitalized + 'Name');
    const name = nameInput.value.trim();
    const icon = document.getElementById('quick' + capitalized + 'Icon').value;

    if (!name) {
        showToast('Please enter a category name', 'error');
        nameInput.focus();
        return;
    }

    const newCat = DocumentStore.addCategory(name, icon);
    
    // Reset and hide
    nameInput.value = '';
    document.getElementById(baseId + 'QuickBox').style.display = 'none';
    
    // Refresh the dropdown and select the new one
    populateCategoryDropdown(baseId, newCat.id);
    
    showToast('Category added!', 'success');
    renderFilters(); // Refresh filters in background
}

// --- CUSTOM DIALOGS ---

function openCustomConfirm(title, message, callback) {
    document.getElementById('confirmTitle').textContent = title;
    document.getElementById('confirmMessage').textContent = message;
    confirmCallback = callback;
    document.getElementById('customConfirmModal').classList.add('active');
}

function handleConfirmAction(confirmed) {
    document.getElementById('customConfirmModal').classList.remove('active');
    if (confirmCallback) {
        confirmCallback(confirmed);
        confirmCallback = null;
    }
}

function openCustomPrompt(title, label, initialValue, callback) {
    document.getElementById('promptTitle').textContent = title;
    document.getElementById('promptLabel').textContent = label;
    const input = document.getElementById('promptInput');
    input.value = initialValue || '';
    promptCallback = callback;
    document.getElementById('customPromptModal').classList.add('active');
    setTimeout(() => input.focus(), 100);
}

function handlePromptAction(confirmed) {
    document.getElementById('customPromptModal').classList.remove('active');
    if (promptCallback) {
        if (confirmed) {
            promptCallback(document.getElementById('promptInput').value);
        } else {
            promptCallback(null);
        }
        promptCallback = null;
    }
}

// --- TOAST ---

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = 'toast ' + type;
    toast.classList.add('show');

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// --- DRAG AND DROP ---

const dropZone = document.getElementById('fileDropZone');
if (dropZone) {
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('dragover');
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('dragover');
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            const file = files[0];
            
            if (!isValidFileType(file)) {
                showToast('Invalid file type. Please upload documents or images.', 'error');
                return;
            }

            selectedFile = file;
            document.getElementById('docName').value = file.name;
            document.getElementById('selectedFileDisplay').innerHTML = `
                <div class="selected-file">
                    <span class="selected-file-icon">${getFileIcon(file.type)}</span>
                    <span class="selected-file-name">${file.name}</span>
                    <span class="selected-file-remove" onclick="removeSelectedFile()">✕</span>
                </div>
            `;
        }
    });
}
