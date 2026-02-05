# 🔐 Successor’s Security Brief: Sharded-Access Protocol

**Project:** Charter Legacy v3.0.0  
**Architect:** Andy Treusch  
**Status:** Confidential / Technical Reference

## 1. The Core Philosophy: "Zero-Knowledge"

The primary directive of this system is that the server is never "all-knowing." No single entity—not the hosting provider (Bluehost), not the database admin, and not the developer—should be able to decrypt the user’s personal legacy payloads (Ethical Wills, Private Letters, or Credentials).

## 2. Key Architecture (The 1-of-2 Rule)

We utilize a **Local-First Decryption model**. Decryption keys are never stored in a single location.

- **Shard A (Server-Side):** Stored in the `legacy_vault_metadata` table. It is useless on its own.
- **Shard C (Client-Side):** Exists only as a physical QR code held by the Legacy Contact.
- **The Master Key (K):** Is only reconstituted in the survivor’s browser memory at the moment of access.

### The Math

`K = ShardA ⊕ ShardC`

## 3. Critical Security Constraints for the Developer

If you are modifying the codebase, you must not violate these "Hard Rules":

1.  **No Server-Side Logging of Shard C:** The endpoint that verifies the trigger must never receive or log the contents of the QR code.
2.  **Memory Volatility:** Once the Master Key (K) is used to decrypt the payload, it must be cleared from the JavaScript state immediately. Do not cache the key in `localStorage` or `sessionStorage`.
3.  **Transport Security:** All key-shuttling between the client and server must occur over TLS 1.3.

## 4. The Recovery "Trapdoor"

**There is no password reset for the Legacy Vault.** If the survivor loses the physical QR code (Shard C), the data is cryptographically lost forever. This is a deliberate design choice to ensure statutory-grade privacy.

> **Note to Successor:** If a family member asks for a "backdoor" to access the data without the key, you must inform them that the laws of mathematics prevent it. This protects the estate from unauthorized access or legal coercion.

## 5. Maintenance Procedures

- **Library Audits:** Regularly audit the `qrcode.react` and `crypto-js` (or Web Crypto API) implementations for vulnerabilities.
- **Trigger Verification:** Ensure the "Dead Man’s Switch" logic has multiple redundancies. A failure in the trigger logic is a failure of the entire brand promise.
- **API Key Rotation:** Rotate the server-side signing keys for the Sunbiz Legal Doc transition portal every 90 days.
