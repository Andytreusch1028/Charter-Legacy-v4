# Charter Legacy Test Credentials

These credentials can be used to test the various access levels, roles, and portals natively across the platform without needing a developer bypass.

## 🏢 Backstage Staff Access (`/staff`)

These accounts are used for the internal administration nodes and are protected by backend Row Level Security (RLS) via their `user_metadata` claims.

### 1. Executive Admin (AI Growth Console)

Has ultimate override authority, comprehensive analytics, and node assignments.

- **Email:** `executive@charterlegacy.com`
- **Passcode:** `password123`
- _Role Claim:_ `executive`

### 2. Fulfillment Operator (RA Sentry Node)

Restricted to document processing, ingestion queues, and mail forwarding.

- **Email:** `fulfillment@charterlegacy.com`
- **Passcode:** `password123`
- _Role Claim:_ `fulfillment`

### 3. Compliance Auditor

Restricted read-only access to specific ledgers for compliance review (often injected into executive paths based on email constraints).

- **Email:** `auditor@charterlegacy.com`
- **Passcode:** `password123`
- _Role Claim:_ `auditor`

---

## 🧑‍💼 Front-Facing Customer Access (`/app`)

These represent the standard public users. They log in via the customer-facing portals on the main site.

### Standard Zenith Client

A standard business owner interacting with the Zenith Dashboard, Company Core, and Registered Agent document views. No administrative rights.

- **Email:** `client@charterlegacy.com`
- **Passcode:** `password123`
- _Role Claim:_ `customer`
