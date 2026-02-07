/**
 * Minutes Ledger Platform: High-Fidelity Logic Controller
 * Manages continuous record-keeping, dictation, and formatting of corporate meetings.
 */

let currentEntityId = null;
let allMinutes = [];
let activeEntryId = null;
let isDictating = false;

document.addEventListener('DOMContentLoaded', () => {
    initializeLedger();
    setupWaveform();
});

/**
 * Initialize the ledger
 */
function initializeLedger() {
    const urlParams = new URLSearchParams(window.location.search);
    currentEntityId = urlParams.get('entity_id');
    
    console.log(`Minutes Ledger: Entity ID = ${currentEntityId}`);
    
    loadMinutes();
    renderMinutesList();
    
    // Select first entry by default if available
    if (allMinutes.length > 0) {
        selectEntry(allMinutes[0].id);
    } else {
        createNewEntry();
    }
}

/**
 * Load minutes from storage/config
 */
function loadMinutes() {
    // 1. Load from CONFIG (Static/Mock)
    const mockMinutes = window.CONFIG.MOCK_MINUTES_ENTRIES || [];
    
    // 2. Load from LocalStorage (User/Durable)
    const storedMinutes = localStorage.getItem(`minutes_${currentEntityId}`);
    const parsedStored = storedMinutes ? JSON.parse(storedMinutes) : [];
    
    // Combine (Preference to stored)
    allMinutes = [...parsedStored];
    
    // Only add mock if it matches entity and isn't already there
    mockMinutes.forEach(mock => {
        if ((mock.entity_id === currentEntityId || !currentEntityId) && !allMinutes.find(m => m.id === mock.id)) {
            allMinutes.push(mock);
        }
    });
    
    console.log(`Loaded ${allMinutes.length} minutes entries.`);
}

/**
 * Render the sidebar list
 */
function renderMinutesList() {
    const container = document.getElementById('minutes-list');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (allMinutes.length === 0) {
        container.innerHTML = '<div style="text-align:center; padding: 2rem; opacity:0.3; font-size:0.8rem; font-weight:700;">NO ENTRIES FOUND</div>';
        return;
    }
    
    allMinutes.sort((a, b) => new Date(b.meeting_date) - new Date(a.meeting_date)).forEach(entry => {
        const item = document.createElement('div');
        item.className = `minutes-item ${entry.id === activeEntryId ? 'active' : ''}`;
        item.onclick = () => selectEntry(entry.id);
        
        item.innerHTML = `
            <div class="item-date">${formatDisplayDate(entry.meeting_date)}</div>
            <div class="item-title">${entry.body ? entry.body.substring(0, 60).replace(/\n/g, ' ') + '...' : 'Untitled Meeting'}</div>
        `;
        
        container.appendChild(item);
    });
}

/**
 * Format date for display (Feb 1, 2026)
 */
function formatDisplayDate(dateStr) {
    if (!dateStr) return 'TBD';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

/**
 * Select an entry for editing
 */
function selectEntry(id) {
    activeEntryId = id;
    const entry = allMinutes.find(m => m.id === id);
    
    if (entry) {
        document.getElementById('display-title').textContent = `Meeting: ${formatDisplayDate(entry.meeting_date)}`;
        document.getElementById('meeting-date').value = entry.meeting_date;
        document.getElementById('recording-date').value = entry.recording_date;
        document.getElementById('recorder-name').value = entry.recorder;
        document.getElementById('attendees').value = entry.attendees;
        document.getElementById('minutes-body').value = entry.body;
    }
    
    renderMinutesList();
}

/**
 * Start a fresh entry
 */
function createNewEntry() {
    const today = new Date().toISOString().split('T')[0];
    const newId = `min-${Date.now()}`;
    
    activeEntryId = newId;
    
    document.getElementById('display-title').textContent = "New Meeting Minutes";
    document.getElementById('meeting-date').value = today;
    document.getElementById('recording-date').value = today;
    document.getElementById('recorder-name').value = "";
    document.getElementById('attendees').value = "";
    document.getElementById('minutes-body').value = "";
    
    // Don't save yet, just clear fields
}

/**
 * Save current entry to storage
 */
function saveCurrentEntry() {
    const entry = {
        id: activeEntryId,
        entity_id: currentEntityId,
        meeting_date: document.getElementById('meeting-date').value,
        recording_date: document.getElementById('recording-date').value,
        recorder: document.getElementById('recorder-name').value,
        attendees: document.getElementById('attendees').value,
        body: document.getElementById('minutes-body').value,
        status: 'saved'
    };
    
    // Update or Add
    const index = allMinutes.findIndex(m => m.id === activeEntryId);
    if (index !== -1) {
        allMinutes[index] = entry;
    } else {
        allMinutes.push(entry);
    }
    
    // Save to LocalStorage
    const userEntries = allMinutes.filter(m => m.id.startsWith('min-')); // Only save generated IDs, keep mock in config (simulating DB separation)
    localStorage.setItem(`minutes_${currentEntityId}`, JSON.stringify(userEntries));
    
    console.log(`Saved entry ${activeEntryId}`);
    
    showNotification("Minutes saved successfully to Ledger.", "success");
    renderMinutesList();
}

/**
 * Toggle simulated dictation
 */
function toggleDictation() {
    isDictating = !isDictating;
    const btn = document.getElementById('mic-btn');
    const status = document.getElementById('mic-status');
    const waveform = document.getElementById('waveform');
    
    if (isDictating) {
        btn.classList.add('active');
        status.textContent = "Processing Audio (Natural Language Engine)...";
        waveform.style.opacity = "1";
        
        // Simulate text appearing
        setTimeout(() => {
            if (isDictating) {
                const area = document.getElementById('minutes-body');
                const text = "\n[DICTATED]: Members reviewed the annual financial audit. Dr. Sarah Jenkins proposed that the company expand its medical services to include elective surgery protocols. Mark Sterling second. Motion carried unanimously.";
                area.value += text;
                area.scrollTop = area.scrollHeight;
            }
        }, 3000);
    } else {
        btn.classList.remove('active');
        status.textContent = "Tap to dictate (AI Scrivener)";
        waveform.style.opacity = "0.3";
    }
}

/**
 * Setup visual bars for the waveform
 */
function setupWaveform() {
    const waveform = document.getElementById('waveform');
    if (!waveform) return;
    
    for (let i = 0; i < 20; i++) {
        const bar = document.createElement('div');
        bar.className = 'wave-bar';
        bar.style.height = `${Math.random() * 80 + 20}%`;
        waveform.appendChild(bar);
    }
    
    // Animate bars
    setInterval(() => {
        if (isDictating) {
            document.querySelectorAll('.wave-bar').forEach(bar => {
                bar.style.height = `${Math.random() * 80 + 20}%`;
            });
        }
    }, 150);
}

/**
 * Simple notification helper
 */
function showNotification(message, type = 'info') {
    // In a real app, this would use a toast library.
    // For now, we'll use a premium log style alert if we had one, or a simple alert.
    console.log(`NOTIFICATION (${type.toUpperCase()}): ${message}`);
    
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        bottom: 30px;
        left: 50%;
        transform: translateX(-50%);
        background: #1a1a1a;
        color: white;
        padding: 12px 24px;
        border-radius: 30px;
        font-size: 0.8rem;
        font-weight: 700;
        z-index: 9999;
        box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        animation: toastIn 0.3s ease-out;
    `;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.5s';
        setTimeout(() => toast.remove(), 500);
    }, 3000);
}

// Add animation
const style = document.createElement('style');
style.textContent = `
    @keyframes toastIn {
        from { transform: translate(-50%, 20px); opacity: 0; }
        to { transform: translate(-50%, 0); opacity: 1; }
    }
`;
document.head.appendChild(style);
