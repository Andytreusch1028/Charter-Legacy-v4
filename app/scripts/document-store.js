// Document Store: Unified document management with category CRUD
// Supabase-ready schema using localStorage for MVP

const DocumentStore = (function() {
    const DOCS_KEY = 'zenith_documents';
    const CATS_KEY = 'zenith_categories';
    const RA_DOCS_KEY = 'ra_documents'; // From RA Portal

    // Default categories (system + user defaults)
    const DEFAULT_CATEGORIES = [
        { id: 'cat-ra', name: 'RA Filings', is_system: true, is_protected: true, icon: 'building' },
        { id: 'cat-tax', name: 'Tax Documents', is_system: false, is_protected: false, icon: 'chart' },
        { id: 'cat-legal', name: 'Legal / Contracts', is_system: false, is_protected: false, icon: 'scales' },
        { id: 'cat-minutes', name: 'Minutes & Resolutions', is_system: false, is_protected: false, icon: 'pen' },
        { id: 'cat-financial', name: 'Financial Records', is_system: false, is_protected: false, icon: 'coins' },
        { id: 'cat-medical', name: 'Medical Credentials', is_system: false, is_protected: false, icon: 'shield-check' },
        { id: 'cat-uncategorized', name: 'Uncategorized', is_system: true, is_protected: true, icon: 'folder' }

    ];

    // Mock documents for demo
    const MOCK_DOCUMENTS = [
        {
            id: 'doc-1',
            llc_id: 'mock-1',
            name: 'Articles of Organization.pdf',
            category_id: 'cat-ra',
            source: 'ra_upload',
            file_size: 245000,
            file_type: 'application/pdf',
            uploaded_at: '2025-11-15T10:30:00Z',
            uploaded_by: null
        },
        {
            id: 'doc-2',
            llc_id: 'mock-1',
            name: '2025 Annual Report.pdf',
            category_id: 'cat-ra',
            source: 'ra_upload',
            file_size: 189000,
            file_type: 'application/pdf',
            uploaded_at: '2025-12-01T14:22:00Z',
            uploaded_by: null
        },
        {
            id: 'doc-3',
            llc_id: 'mock-1',
            name: 'Operating Agreement v3.pdf',
            category_id: 'cat-legal',
            source: 'user_upload',
            file_size: 512000,
            file_type: 'application/pdf',
            uploaded_at: '2025-10-20T09:15:00Z',
            uploaded_by: 'mock-user-id'
        },
        {
            id: 'doc-4',
            llc_id: 'mock-1',
            name: 'Q4 Board Minutes.pdf',
            category_id: 'cat-minutes',
            source: 'user_upload',
            file_size: 98000,
            file_type: 'application/pdf',
            uploaded_at: '2026-01-05T16:45:00Z',
            uploaded_by: 'mock-user-id'
        },
        {
            id: 'doc-5',
            llc_id: 'mock-1',
            name: '2025 Tax Return.pdf',
            category_id: 'cat-tax',
            source: 'user_upload',
            file_size: 1250000,
            file_type: 'application/pdf',
            uploaded_at: '2026-01-28T11:00:00Z',
            uploaded_by: 'mock-user-id'
        }
    ];

    // Initialize store
    function init() {
        // Migration: Check if categories use old emoji icons and need update
        const existingCats = JSON.parse(localStorage.getItem(CATS_KEY) || '[]');
        if (existingCats.length > 0) {
            // If first category has an emoji icon (contains emoji), reset to new icons
            const firstIcon = existingCats[0]?.icon || '';
            const isOldFormat = firstIcon.length > 2 || /[\u{1F300}-\u{1F9FF}]/u.test(firstIcon);
            if (isOldFormat) {
                console.log('[DocumentStore] Migrating categories to SVG icons...');
                localStorage.removeItem(CATS_KEY);
            }
        }

        // Initialize categories if not exist
        if (!localStorage.getItem(CATS_KEY)) {
            localStorage.setItem(CATS_KEY, JSON.stringify(DEFAULT_CATEGORIES));
        }
        // Initialize documents if not exist
        if (!localStorage.getItem(DOCS_KEY)) {
            localStorage.setItem(DOCS_KEY, JSON.stringify(MOCK_DOCUMENTS));
        }
        // Merge RA documents if they exist
        mergeRADocuments();
    }

    // Merge RA documents from ra-portal into unified store
    function mergeRADocuments() {
        const raDocs = JSON.parse(localStorage.getItem(RA_DOCS_KEY) || '[]');
        if (raDocs.length === 0) return;

        const docs = getDocuments();
        const existingIds = new Set(docs.map(d => d.id));

        raDocs.forEach(raDoc => {
            // Convert RA doc format to unified format
            const docId = `ra-${raDoc.id || raDoc.name.replace(/\s+/g, '-').toLowerCase()}`;
            if (!existingIds.has(docId)) {
                docs.push({
                    id: docId,
                    llc_id: raDoc.llc_id || 'mock-1',
                    name: raDoc.name || raDoc.title,
                    category_id: 'cat-ra',
                    source: 'ra_upload',
                    file_size: raDoc.size || 0,
                    file_type: raDoc.type || 'application/pdf',
                    uploaded_at: raDoc.date || new Date().toISOString(),
                    uploaded_by: null
                });
            }
        });

        localStorage.setItem(DOCS_KEY, JSON.stringify(docs));
    }

    // Generate UUID
    function generateId() {
        return 'doc-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    }

    // --- DOCUMENT CRUD ---

    function getDocuments(filters = {}) {
        const docs = JSON.parse(localStorage.getItem(DOCS_KEY) || '[]');
        let filtered = [...docs];

        if (filters.category_id) {
            filtered = filtered.filter(d => d.category_id === filters.category_id);
        }
        if (filters.source) {
            filtered = filtered.filter(d => d.source === filters.source);
        }
        if (filters.llc_id) {
            filtered = filtered.filter(d => d.llc_id === filters.llc_id);
        }

        // Sort by date descending
        filtered.sort((a, b) => new Date(b.uploaded_at) - new Date(a.uploaded_at));
        return filtered;
    }

    function getDocument(id) {
        const docs = getDocuments();
        return docs.find(d => d.id === id);
    }

    function addDocument(doc) {
        const docs = getDocuments();
        
        // Data layer protection: Ensure file type is allowed
        const allowedTypes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'image/png',
            'image/jpeg',
            'text/plain'
        ];

        const fileType = doc.file_type || 'application/pdf';
        if (!allowedTypes.includes(fileType)) {
            console.error('[DocumentStore] Rejected invalid file type:', fileType);
            return null;
        }

        const newDoc = {
            id: generateId(),
            llc_id: doc.llc_id || 'mock-1',
            name: doc.name,
            category_id: doc.category_id || 'cat-uncategorized',
            source: 'user_upload',
            file_size: doc.file_size || 0,
            file_type: fileType,
            uploaded_at: new Date().toISOString(),
            uploaded_by: 'mock-user-id'
        };
        docs.push(newDoc);
        localStorage.setItem(DOCS_KEY, JSON.stringify(docs));
        return newDoc;
    }

    function updateDocument(id, updates) {
        const docs = getDocuments();
        const doc = docs.find(d => d.id === id);
        if (!doc) return null;
        
        // Only allow updates to user-uploaded docs
        if (doc.source !== 'user_upload') {
            console.warn('Cannot edit RA-uploaded documents');
            return null;
        }

        Object.assign(doc, updates);
        localStorage.setItem(DOCS_KEY, JSON.stringify(docs));
        return doc;
    }

    function deleteDocument(id) {
        const docs = getDocuments();
        const doc = docs.find(d => d.id === id);
        if (!doc) return false;

        // Only allow delete of user-uploaded docs
        if (doc.source !== 'user_upload') {
            console.warn('Cannot delete RA-uploaded documents');
            return false;
        }

        const filtered = docs.filter(d => d.id !== id);
        localStorage.setItem(DOCS_KEY, JSON.stringify(filtered));
        return true;
    }

    // --- CATEGORY CRUD ---

    function getCategories() {
        return JSON.parse(localStorage.getItem(CATS_KEY) || '[]');
    }

    function getCategory(id) {
        return getCategories().find(c => c.id === id);
    }

    function addCategory(name, icon = '📄') {
        const cats = getCategories();
        const newCat = {
            id: 'cat-' + Date.now(),
            name: name,
            is_system: false,
            is_protected: false,
            icon: icon
        };
        cats.push(newCat);
        localStorage.setItem(CATS_KEY, JSON.stringify(cats));
        return newCat;
    }

    function updateCategory(id, updates) {
        const cats = getCategories();
        const cat = cats.find(c => c.id === id);
        if (!cat) return null;

        // Cannot update protected categories
        if (cat.is_protected) {
            console.warn('Cannot update protected category');
            return null;
        }

        Object.assign(cat, updates);
        localStorage.setItem(CATS_KEY, JSON.stringify(cats));
        return cat;
    }

    function deleteCategory(id) {
        const cats = getCategories();
        const cat = cats.find(c => c.id === id);
        if (!cat) return { success: false, orphaned: 0 };

        // Cannot delete protected categories
        if (cat.is_protected) {
            console.warn('Cannot delete protected category');
            return { success: false, orphaned: 0 };
        }

        // Move orphaned documents to Uncategorized
        const docs = getDocuments();
        let orphanCount = 0;
        docs.forEach(doc => {
            if (doc.category_id === id) {
                doc.category_id = 'cat-uncategorized';
                orphanCount++;
            }
        });
        localStorage.setItem(DOCS_KEY, JSON.stringify(docs));

        // Remove category
        const filtered = cats.filter(c => c.id !== id);
        localStorage.setItem(CATS_KEY, JSON.stringify(filtered));

        return { success: true, orphaned: orphanCount };
    }

    // --- PERMISSIONS ---

    function canEdit(doc) {
        return doc && doc.source === 'user_upload';
    }

    function canDelete(doc) {
        return doc && doc.source === 'user_upload';
    }

    // --- UTILITIES ---

    function formatFileSize(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    }

    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric' 
        });
    }

    function getRecentDocuments(limit = 3) {
        return getDocuments().slice(0, limit);
    }

    // Initialize on load
    init();

    // Public API
    return {
        // Documents
        getDocuments,
        getDocument,
        addDocument,
        updateDocument,
        deleteDocument,
        getRecentDocuments,
        
        // Categories
        getCategories,
        getCategory,
        addCategory,
        updateCategory,
        deleteCategory,
        
        // Permissions
        canEdit,
        canDelete,
        
        // Utilities
        formatFileSize,
        formatDate,
        
        // Re-init (for testing)
        init
    };
})();

// Expose globally
window.DocumentStore = DocumentStore;
