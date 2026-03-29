/**
 * scanner-storage.js
 * Persistent storage for FileSystemDirectoryHandle using IndexedDB.
 */

const DB_NAME = 'CharterLegacyScannerDB';
const STORE_NAME = 'config';
const HANDLE_KEY = 'active_scanner_handle';

/**
 * Initialize IndexedDB and return the database instance.
 */
function openDB() {
    return new Promise((resolve, reject) => {
        try {
            const request = indexedDB.open(DB_NAME, 1);
            request.onupgradeneeded = (event) => {
                const dbInstance = event.target.result;
                if (!dbInstance.objectStoreNames.contains(STORE_NAME)) {
                    dbInstance.createObjectStore(STORE_NAME);
                }
            };
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        } catch (e) {
            reject(e);
        }
    });
}

/**
 * Save the FileSystemDirectoryHandle to IndexedDB.
 */
export async function saveScannerHandle(handle) {
    try {
        const db = await openDB();
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        await store.put(handle, HANDLE_KEY);
        return true;
    } catch (error) {
        console.error('Failed to save scanner handle to IndexedDB:', error);
        return false;
    }
}

/**
 * Load the FileSystemDirectoryHandle from IndexedDB.
 */
export async function loadScannerHandle() {
    try {
        const db = await openDB();
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const handle = await new Promise((resolve, reject) => {
            const request = store.get(HANDLE_KEY);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
        return handle;
    } catch (error) {
        console.warn('No scanner handle found in IndexedDB or failed to load:', error);
        return null;
    }
}

/**
 * Clear the saved scanner handle.
 */
export async function clearScannerHandle() {
    try {
        const db = await openDB();
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        await store.delete(HANDLE_KEY);
        return true;
    } catch (error) {
        console.error('Failed to clear scanner handle:', error);
        return false;
    }
}
