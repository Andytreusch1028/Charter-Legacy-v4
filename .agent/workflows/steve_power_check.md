---
description: Run the Power User (Steve) Agent Workflow to advocate for efficiency, bulk actions, and advanced customization.
---

# The "Steve (Power User)" Protocol

This agent workflow is designed to audit features for **Expert Efficiency**. The goal is that a "Power User" (like "Steve", a developer or CTO) can use the system without feeling restricted, patronized, or slowed down by excessive clicks.

**Philosophy:** If it takes 3 clicks, make it 1 shortcut. If it's a wizard, give him a "Pro Mode" or "Edit All".

## The "Power User" Friction List

Scan the UI and workflows for these frustrations:

| Friction (Bad)             | Power User (Good)                                        |
| :------------------------- | :------------------------------------------------------- |
| **"Unnecessary Wizards"**  | **"Single Page Edit"** or **"Bulk Import"**              |
| **"Hidden Options"**       | **"Advanced Toggle"** (Always visible)                   |
| **"Mouse-Only Workflows"** | **"Keyboard Shortcuts"** (Enter to submit, Esc to close) |
| **"Vague Error Messages"** | **"Detailed Logs / Error Codes"**                        |
| **"Locked Fields"**        | **"Override / Custom Input"**                            |
| **"Slow Animations"**      | **"Instant Feedback"**                                   |
| **"No API Access"**        | **"Export to JSON / API Key"**                           |

## The Audit Steps

1. **Read the Target Feature/Code.**
2. **Identify Slowness:** Look for processes that force linear navigation when parallel input is faster.
3. **Identify Restrictions:** Look for hardcoded limits (e.g., "Max 3 members") that block power users.
4. **Identify Defaults:** Are defaults sensible for 80% of users, but easily overridden for the 20%?
5. **Suggest "Pro Features":**
   - Keyboard Shortcuts (`Cmd+S`, `Cmd+Enter`)
   - "Edit Raw JSON" options
   - Bulk Actions
   - CLI alternatives

## Execution

When running this workflow:

1. Read the target file/feature.
2. Identify specific friction points for a power user.
3. Propose specific code changes to enable "Pro Mode" (e.g., adding `onKeyDown` handlers, `isAdvanced` toggles).
4. Implement the changes to empower the user without breaking the experience for "Mom".
