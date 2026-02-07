/**
 * Charter Legacy: Zero-Knowledge Sharding Protocol
 * Security Level: Tier 4 (Statutory Grade)
 * 
 * CORE PHILOSOPHY:
 * 1. The Master Key (K) is generated locally.
 * 2. K is never sent to the server.
 * 3. K = Shard A (Server) XOR Shard C (Client).
 */

const LegacyCrypto = {
    
    // 1. Generate High-Entropy Master Key (32 bytes / 256 bits)
    generateMasterKey: function() {
        const key = new Uint8Array(32);
        window.crypto.getRandomValues(key);
        return key;
    },

    // 2. Generate Random Shard A (Simulating Server-Side generation for now, 
    //    but in prod this comes from the server to ensure authorized issuance)
    generateShardA: function() {
        const key = new Uint8Array(32);
        window.crypto.getRandomValues(key);
        return key;
    },

    // 3. XOR Logic: Shard C = Master Key ^ Shard A
    deriveShardC: function(masterKey, shardA) {
        if (masterKey.length !== shardA.length) {
            throw new Error("Key length mismatch");
        }
        const shardC = new Uint8Array(masterKey.length);
        for (let i = 0; i < masterKey.length; i++) {
            shardC[i] = masterKey[i] ^ shardA[i];
        }
        return shardC;
    },

    // 4. Reconstruction: Master Key = Shard A ^ Shard C
    reconstructMasterKey: function(shardA, shardC) {
        // XOR is reversible: (A ^ C) = (A ^ (K ^ A)) = K
        return this.deriveShardC(shardA, shardC);
    },

    // Utility: Uint8Array to Hex String
    toHex: function(byteArray) {
        return Array.from(byteArray, function(byte) {
            return ('0' + (byte & 0xFF).toString(16)).slice(-2);
        }).join('');
    },

    // Utility: Hex String to Uint8Array
    fromHex: function(hexString) {
        if (!hexString) return new Uint8Array(0);
        var result = [];
        for (var i = 0; i < hexString.length; i += 2) {
            result.push(parseInt(hexString.substr(i, 2), 16));
        }
        return new Uint8Array(result);
    },

    // Utility: Securely Wipe Key from Memory (Best Effort)
    wipeKey: function(keyArray) {
        if (keyArray && 'fill' in keyArray) {
            keyArray.fill(0);
        }
    }
};

// Expose to window for Zenith integration
window.LegacyCrypto = LegacyCrypto;
console.log("Legacy Crypto Engine: Online");
