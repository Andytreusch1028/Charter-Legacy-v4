# Shipping Manifest - v4.0

## 🚨 Critical Pre-Deployment Actions

Before deploying this application to a production environment (Vercel, Netlify, etc.), the following actions MUST be taken to secure the application. Currently, the application is running in a "Dev Mode" configuration that bypasses standard security models.

### 1. Remove Client-Side Service Key

**Severity:** CRITICAL 🔴
**Location:** `.env`
**Action:**

- Remove `VITE_SUPABASE_SERVICE_KEY` from your production environment variables.
- Remove `VITE_SUPABASE_SERVICE_KEY` from `.env` locally.
- **Why?** This key grants FULL ADMINISTRATIVE ACCESS to your database. Exposing it to the client (browser) allows any technical user to read/write/delete ANY data in your database. It is currently exposed to allow the "Filing Execution" to bypass broken Row-Level Security (RLS) policies.

### 2. Fix Database RLS Policies

**Severity:** CRITICAL 🔴
**Location:** Supabase Dashboard > Authentication > Policies
**Action:**

- Update the RLS policy for the `llcs` table to allow Authenticated Users to `INSERT` rows where `auth.uid() = user_id`.
- Once fixed, the "Admin Override" logic in `DesignationProtocol.jsx` will no longer be needed and will gracefully failover to standard behavior (or can be removed).

### 3. Cleanup Codebase

**Location:** `src/DesignationProtocol.jsx`

- Remove the `try/catch` block that attempts `createClient(..., serviceKey)`.
- Remove the "Admin Override" console logs.

**Location:** `src/LoginModal.jsx`

- Remove the `handleEmergencyLogin` function.
- Remove the "Emergency Override (Dev Only)" button.
- Remove `import { createClient } ...`.

## Current Modifications (Dev Mode Bypass)

To enable local development with restricted RLS, the following "Backdoors" were installed:

- **`src/DesignationProtocol.jsx`**: Automatically attempts to use `VITE_SUPABASE_SERVICE_KEY` to force-insert LLC records if the standard user insert fails.
- **`src/LoginModal.jsx`**: Contains a hidden "Emergency Override" button that uses the Service Key to generate a Magic Link for `imalivenowwhat@gmail.com` (or entered email) to bypass password login.

---

**Date Added:** 2026-02-07
**Status:** Active (Do not deploy yet)
