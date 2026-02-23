---
description: Autonomous Infinite-Loop Debugging Workflow (Obsidian Debugger)
---

# Obsidian Debugger Protocol

Use this workflow to resolve complex bugs, UI regressions, or logic errors that require autonomous iteration and verification.

## 1. Safety & Contextual Analysis

- **Git Check**: Run `git branch -vv` to verify if the branch tracks a remote.
- **Auto-Tracking**: If no remote is tracked, run `git push -u origin <current_branch>`.
- **Pre-Flight Snapshot**: Commit any pending changes with `[PRE-DEBUG SNAPSHOT]` to ensure a clean state for rollbacks.
- **Dependency Audit**: Inspect `package.json` and recent commits to identify potential breaking changes in the environment.

## 2. The Execution Loop (Infinite until flawlessness)

### Phase A: Surgical Fix

- Identify the root cause using codebase search and training data.
- Apply the fix to the target files.

### Phase B: Verification (The Chrome Loop)

- Open the local dev environment via `browser_subagent`.
- Navigate to the affected page.
- **CRITICAL**: Check the Chrome Console for ANY errors or warnings.
- Interact with the UI to verify the specific logic/fix.
- If failure is detected (errors or UI incorrect):
  - Capture the console logs.
  - Return to Phase A.

### Phase C: Qodo Cleanup

- Once verification passes, refactor the modified code for readability and performance.
- Apply Qodo-inspired patterns (dry code, robust typing, error boundaries).

## 3. Deployment & Archival

- **Final Push**: Sync the verified fix back to GitHub.
- **Audit Logging**: Write a summary of the fix to `debug_audit.md` in the artifacts folder.
- **Rollback Procedure**: If iterations exceed a reasonable limit without progress, run `git reset --hard [PRE-DEBUG SHA]` to restore original state.

## Success Criteria

- [ ] No errors in Chrome Console.
- [ ] Logic/UI verified via browser interaction.
- [ ] Code is cleaned and pushed to remote.
