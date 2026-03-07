---
description: The Decapod Strict Mode Workflow for critical, high-risk, or complex implementation tasks requiring explicit intent, firm boundaries, and objective proof before completion.
---

# 🦀 The Decapod Strict Mode Workflow (Charter Adaptation)

This workflow is a philosophical adaptation of the Decapod Governance Kernel. It is intended for use during high-risk, complex, or promotion-relevant tasks (e.g., Stripe integration, core Supabase RLS changes, complex UI component creation).

## 🛡️ Proactive Trigger: AI Evaluation

**You (the AI Agent) are strictly responsible for determining when this workflow is necessary.**

When you receive a new task, you must silently evaluate its risk and complexity. If the task involves:

- **Financial APIs** (Stripe, Billing)
- **Security & Data Governance** (Supabase RLS, Authentication)
- **Multi-File Refactoring** (Core routing, Architectural changes)
- **High-Stakes Compliance** (UPL sanitization, Legal document rendering)

**Action:** You MUST pause and actively ask the user: _"This task involves critical infrastructure/high complexity. Would you like me to execute this using `/strict_decapod_mode` to ensure absolute safety and provability?"_

If the user says yes (or explicitly invokes `/strict_decapod_mode` or `/decapod` themselves), you MUST abandon standard rapid-iteration pair-programming and strictly follow this 4-phase protocol.

## Phase 1: Intent Crystallization (No Code is Written Here)

Before writing or modifying a single line of code, you must force the intent to crystallize. Hallucinating requirements or proceeding on "vibes" is strictly prohibited.

1. **Analyze the Request:** Read the user's prompt. Identify the core components they want to change.
2. **Draft the Specification Artifact:** Create a `.md` artifact (e.g., `decapod_spec_[timestamp].md`) that explicitly lists:
   - **The Objective:** What is the exact goal?
   - **The Boundaries:** What files will be touched? What files _must not_ be touched? Are we restricted to specific design languages (e.g., Tailwind vs. Vanilla CSS)?
   - **The Completion Criteria:** What exactly constitutes "done"? (e.g., "The button is visible on mobile and desktop, and clicking it triggers a Supabase insert without error.")
3. **Interlock (Halt):** You MUST use the `notify_user` tool to present the Specification Artifact to the user. Do not proceed to Phase 2 until they explicitly reply "approved" or "looks good." If they request changes, update the spec and halt again.

## Phase 2: Isolated Execution

Once the user approves the spec, you may begin implementation.

1. **Adhere to Boundaries:** You may _only_ modify the files listed in the approved Specification Artifact. If you discover you need to modify an out-of-bounds file, you must halt, update the spec, and request user approval again.
2. **Atomic Changes:** Make your changes logically and methodically. Do not attempt to rewrite massive unrelated sections of a file just because you have it open.
3. **Self-Correction:** If you encounter errors during implementation, resolve them, but do not deviate from the core objective defined in Phase 1.

## Phase 3: Attestation (Proof of Work)

Decapod mandates that "Completion MUST be provable. Validation liveness is mandatory." You cannot simply say "I fixed it, looks good to me."

1. **Determine the Proof Surface:** How will you prove the Completion Criteria from Phase 1 were met?
   - If it's a backend/SQL change: Provide the output of a successful test query or terminal command.
   - If it's a UI/UX change: You _must_ use the `default_api:browser_subagent` to navigate to the modified page, perform the required action, and capture the success state as a video/screenshot artifact.
   - If local execution/browser testing is impossible due to specific environment constraints, you must explicitly document the _exact manual steps_ the user must take to verify it themselves.
2. **Compile the Receipt:** Update the Specification Artifact from Phase 1 with an "Attestation Receipt" section at the bottom, linking to your proof (e.g., the browser subagent media artifact, the terminal output, or the manual steps).

## Phase 4: Final Verification

1. **Present the Proof:** Use `notify_user` to present the final Attestation Receipt to the user.
2. **Close Loop:** Only when the user acknowledges the proof is the task considered `VERIFIED` and complete.

---

**Remember:** In Decapod mode, velocity is sacrificed for absolute certainty, accountability, and traceability. Do not skip the Interlock (Halt) steps.
