# Charter Legacy Integration & Partnership Roadmap

This document outlines the necessary third-party integrations required to fully operationalize the Charter Legacy platform. It includes contact strategies, technical implementation details, and UPL/Compliance notes for each vertical.

---

## 1. Banking & Financial Partners

**Goal:** Provide seamless business banking setup for new LLCs to ensure immediate "veil piercing" and asset protection.

### A. Mercury (Tech-Forward / Startups)

- **Why:** Best UI/UX, fully digital, API-friendly. Most "modern" choice.
- **Integration Type:** Referral Link / API (for pre-filling).
- **Partnership Program:** [Mercury Partner Program](https://mercury.com/partner)
- **Action Item:** Apply for the "Mercury for Partners" dashboard to generate unique referral links with perks (e.g., $200 bonus for user).
- **Contact:** partners@mercury.com

### B. Relay Financial (Small Business / No-Fee)

- **Why:** No minimums, no fees, great for small service businesses (landscapers, contractors).
- **Integration Type:** Referral Link.
- **Partnership Program:** [Relay Partner Program](https://relayfi.com/partners)
- **Action Item:** Register as an "Accountant/Bookkeeper" or "Formation Service" partner.
- **Contact:** support@relayfi.com (Subject: Partnership Inquiry)

### C. Chase Business (Traditional / Physical Branches)

- **Why:** Trust, physical locations, credit card ecosystem.
- **Integration Type:** Affiliate Link (via Impact Radius or similar network).
- **Note:** Direct API integration is very difficult for a startup. Stick to affiliate links.
- **Action Item:** Apply to Chase's affiliate program.

---

## 2. Registered Agent (RA) Networks

**Goal:** Automate the "accept service of process" requirement in Florida and Wyoming. You act as the front-end; they are the back-end infrastructure.

### A. Florida Registered Agent

- **Primary Strategy: Self-Filing (Vertical Integration)**
  - **Concept:** Charter Legacy _is_ the Registered Agent.
  - **Requirement:** A physical address in Florida open during business hours (User's office).
  - **Revenue:** 100% Retained ($99/yr+).
  - **Action:** Ensure the "Registered Office" address is staffed.

- **Secondary Strategy: Wholesale Partner (e.g., Northwest Registered Agent)**
  - **Why:** If you don't want your office address public.
  - **Partner:** Northwest Registered Agent (known for privacy).
  - **Program:** [Wholesale / White Label Program](https://www.northwestregisteredagent.com/registered-agent/wholesale)
  - **Contact:** sales@northwestregisteredagent.com

### B. Wyoming Registered Agent (For 'Double LLC' / Holding Co)

- **Requirement:** You _must_ have a physical address in Wyoming.
- **Partner:** **Wyoming Agents** or **Cloud Peak Law**.
- **Why:** They specialize in "Anonymous LLCS" and privacy.
- **Action:** Set up a white-label account. You pay them ~$25-50/yr, charge the user $150/yr.
- **Contact:**
  - **Wyoming Agents:** https://www.wyomingagents.com/
  - **Cloud Peak Law:** https://cloudpeaklaw.com/

---

## 3. Compliance & Filing Automation

**Goal:** Automate the generation of state forms (Articles of Organization) and federal filings (BOI).

### A. CorpNet (White Label Filing)

- **Why:** They offer a robust API to handle filings in _all 50 states_ if you expand.
- **Integration:** REST API.
- **Partner Program:** [CorpNet Partner Program](https://www.corpnet.com/partners/)
- **Action:** Use them as the back-end fulfillment engine if volume exceeds manual capacity.

### B. FinCEN BOI Reporting (Federal Compliance Guard)

- **Strategy:** Build vs. Buy.
  - **Build (Recommended):** The form is simple. We can build a direct XML submission tool or manual process.
  - **Buy:** **FileForms** or **FinCEN Filing API**.
- **Why:** High margin add-on ($149).
- **Action:** For now, keep this manual/internal. As volume scales, consider [FinCEN Filing API](https://fincenfetch.com/) (if available/reliable).

---

## 4. Mail & Virtual Office

**Goal:** Privacy. Users don't want their home address on public records.

### A. iPostal1 or Anytime Mailbox

- **Why:** Extensive network of physical addresses (not PO boxes) which are required for banking and RA.
- **Integration:** API / White Label.
- **Action:** Allow users to "rent" an address through the UI.
- **Partner Program:** [iPostal1 Partner Program](https://ipostal1.com/partner-programs.php)

---

## 5. Domain & Email (Identity)

**Goal:** "Business in a Box."

### A. Google Workspace (Reseller)

- **Why:** Professional email (`name@company.com`).
- **Integration:** Google Cloud Partner Advantage.
- **Action:** Become a reseller to provision accounts automatically.

### B. GoDaddy / Namecheap (API)

- **Why:** Domain registration.
- **Integration:** GoDaddy Reseller API.

---

## Technical Implementation Roadmap

1.  **Phase 1 (MVP - Current):**
    - **Banking:** Hardcoded "Referral Links" (Affiliate URLs) in the dashboard.
    - **RA (FL):** Internal address (manual fulfillment).
    - **RA (WY):** Manual partnership with a WY firm (email them user details).

2.  **Phase 2 (Integration):**
    - **Banking:** "One-Click Apply" (sending user data to Bank API).
    - **RA:** API submission to Northwest/CorpNet.

3.  **Phase 3 (Automation):**
    - **Webhooks:** Stripe payment -> Triggers CorpNet API -> Triggers Welcome Email -> Provision Google Workspace.

## UPL (Unauthorized Practice of Law) Check

- **Banking:** Safe. Financial referrals are not legal advice.
- **Registered Agent:** Safe. This is a statutory administrative role, not legal representation.
- **Filings:** **Caution.** Ensure we act as a "Filing Service" (scrivener) only. We input what the user tells us.
  - _Disclaimer:_ "Charter Legacy is a document filing service and does not provide legal advice or representation."
