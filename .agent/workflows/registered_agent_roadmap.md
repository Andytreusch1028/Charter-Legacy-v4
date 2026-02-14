---
description: Build Plan for Registered Agent Console Finalization
---

# Registered Agent Console Finalization Roadmap

## Phase 1: Backend Integration (The "Wiring" Phase)

- [ ] **Wire Config Toggles to Supabase**: Create a `registered_agent_config` table and link the toggle states (Auto-Dispose, Priority Forwarding, etc.) to the user's account.
- [ ] **Implement Data Broker Shield Logic**: Create a mock function `initiate_broker_removal()` that triggers when the shield is activated, logging a visible "Removal Request Queued" event in the Activity Log.
- [ ] **SMS Interrupt Handler**: Connect the SMS toggle to the notification preference center (mock or real if Twilio is active).

## Phase 2: Content & Intelligence (The "Scrivener" Phase)

- [ ] **Populate Document Feed**: Replace hardcoded mock documents with a dynamic feed that pulls from a `documents` table.
- [ ] **Enhance Messaging AI**: Script 3-4 distinct "Agent Personas" (Legal Liaison, Filing Clerk, Privacy Officer) for the secure chat to ensure variety and realism.

## Phase 3: Stress Testing (The "Fire Drill" Phase)

- [ ] **Simulate "Service of Process"**: Create a button in the dev tools to simulate a critical legal notice arriving. Verify that "Priority Forwarding" triggers an immediate (mock) alert.
- [ ] **UPL Compliance Audit**: Review all new tooltips and descriptions (especially Data Broker Shield) to ensure they claim _mechanical assistance_ and not _legal guarantees_.

## Phase 4: Polish & Deployment (The "Sovereign" Phase)

- [ ] **Animation Refinement**: Smooth out the expansion transition of the Data Broker Shield card.
- [ ] **Mobile Responsiveness**: Verify the new "Active/Off" toggle labels don't break layout on iPhone SE/smaller screens.
