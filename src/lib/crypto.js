
/**
 * Charter Legacy - Zero-Knowledge Cryptographic Utility
 * Uses Web Crypto API (SubtleCrypto) for AES-GCM 256-bit encryption.
 */

const ITERATIONS = 100000;
const KEY_LEN = 256;
const SALT_LEN = 16;
const IV_LEN = 12;

/**
 * Derives an AES-GCM key from a passphrase and salt.
 */
async function deriveKey(passphrase, salt) {
    const encoder = new TextEncoder();
    const baseKey = await crypto.subtle.importKey(
        'raw',
        encoder.encode(passphrase),
        { name: 'PBKDF2' },
        false,
        ['deriveBits', 'deriveKey']
    );

    return crypto.subtle.deriveKey(
        {
            name: 'PBKDF2',
            salt: salt,
            iterations: ITERATIONS,
            hash: 'SHA-256'
        },
        baseKey,
        { name: 'AES-GCM', length: KEY_LEN },
        true,
        ['encrypt', 'decrypt']
    );
}

/**
 * Encrypts plaintext using a passphrase.
 * Returns a base64 encoded bundle: salt:iv:ciphertext
 */
export async function encryptData(plaintext, passphrase) {
    const encoder = new TextEncoder();
    const salt = crypto.getRandomValues(new Uint8Array(SALT_LEN));
    const iv = crypto.getRandomValues(new Uint8Array(IV_LEN));
    
    const key = await deriveKey(passphrase, salt);
    const encrypted = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv: iv },
        key,
        encoder.encode(plaintext)
    );

    const saltBase64 = btoa(String.fromCharCode(...salt));
    const ivBase64 = btoa(String.fromCharCode(...iv));
    const ciphertextBase64 = btoa(String.fromCharCode(...new Uint8Array(encrypted)));

    return `${saltBase64}:${ivBase64}:${ciphertextBase64}`;
}

/**
 * Decrypts a base64 encoded bundle using a passphrase.
 */
export async function decryptData(bundle, passphrase) {
    if (!bundle || typeof bundle !== 'string') {
        console.error("Decryption failed: Invalid or missing encrypted bundle", bundle);
        throw new Error("Missing encrypted data");
    }
    try {
        const [saltBase64, ivBase64, ciphertextBase64] = bundle.split(':');
        
        const salt = new Uint8Array([...atob(saltBase64)].map(c => c.charCodeAt(0)));
        const iv = new Uint8Array([...atob(ivBase64)].map(c => c.charCodeAt(0)));
        const ciphertext = new Uint8Array([...atob(ciphertextBase64)].map(c => c.charCodeAt(0)));

        const key = await deriveKey(passphrase, salt);
        const decrypted = await crypto.subtle.decrypt(
            { name: 'AES-GCM', iv: iv },
            key,
            ciphertext
        );

        return new TextDecoder().decode(decrypted);
    } catch (err) {
        console.error("Decryption failed:", err);
        throw new Error("Invalid decryption key or corrupted data");
    }
}
