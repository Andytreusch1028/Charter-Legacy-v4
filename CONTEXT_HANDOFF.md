# Charter Legacy — Context Handoff

## 🎯 Current Goal
**Client Dashboard: Wiring live statuses to UI rings (and Entity cards)**

We were working on pulling live data from Supabase and wiring it to the "UI rings" or "Entity cards" on the client-facing dashboard. 

---

## ✅ Completed in Previous Session
1. **Certificate of Status Wizard & Dissolution Wizard** 
   - Wired eager status syncs to the `llcs` table (e.g., `'Requesting Certificate'`, `'Dissolving'`).
   - Passed dynamic cent amounts to the `create-payment-intent` Edge Function.
2. **Payment Intent Edge Function (`create-payment-intent`)**
   - Added support and IDs for Certificate of Status, DBA Renewal, and Reinstatement.
3. **RA Sentry (Staff Console)**
   - Wired `FormationQueueList.jsx` and `useFormationQueue.js` to fetch live pending `marketing_queue` orders.
   - Merged these orders smoothly into the unified Fulfillment Portal feed, bypassing mock data.
4. **Security Hardening**
   - Scrubbed leaked JWT Playwright tokens from Git history using `git filter-branch` and updated `.gitignore`.

---

## 🚧 Current Blocker / Context for Next Agent
The final task on our checklist is to **"Wire live statuses to UI rings on the Client Dashboard"**. 

However, we hit a roadblock identifying exactly *which* React component renders these "UI Rings". 

**What we tried:**
- Investigated `DashboardZenith.jsx`, `useDashboardData.js`, `ActiveProtectionTriad.jsx`, `EntityShieldConsole.jsx`, `SentinelStatusBoard.jsx`, and `BusinessSelector.jsx`.
- Grep-searched the codebase for `Ring`, `circle`, `strokeDasharray`, and strings like `"Entity Card"` or `"Client Dashboard"`.
- Attempted to use Playwright tools to view the application visually (the automated headless browser is unsupported on the local Windows machine, and a custom script captured a blank page, possibly due to client-side loading states/hydration.)

**What the Next Agent Needs from the User:**
To proceed immediately without guessing, the next agent should ask the user to provide:
1. The **exact filename** (e.g., `StatusWidget.jsx`) where the rings/cards are located.
2. OR: **Specific text** that appears inside or right next to those rings (so the agent can safely grep search for it).

---

## 🛠️ State Reference
- **Local Dev Server Hook:** We know `useDashboardData.js` is responsible for fetching the entities/DBAs from Supabase and pushing real-time updates over channels. 
- **Workspace:** `C:\Charter-Legacy v4\`
- **Language/Framework:** React / Vite.

*Instructions: Paste this document precisely into the new conversation to instantly align the agent on the exact current state and blocker.*
