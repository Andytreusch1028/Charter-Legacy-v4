---
description: The Debug & Iterate Agent Protocol for autonomous code fixing, Qodo-style cleanup, and verified regression testing.
---

# /debug-agent: The Autonomous Debugger Protocol

This workflow defines the "Infinite Loop" debugging process. When activated, the agent takes full ownership of a bug until it is resolved, verified, and the code is professionally cleaned.

## Phase 1: Pre-Flight & Safety (GitHub Backup)

Before making ANY changes, the agent MUST ensure a recovery point exists.

1. **Check Status**: Run `git status` to ensure a clean working directory.
2. **Snapshot**:
   - Create a backup branch: `git checkout -b debug-backup-[task-id]`
   - OR use `git stash` if a branch is not appropriate.
3. **Commit Current state**: If on a working branch, commit current work with `[PRE-DEBUG SNAPSHOT]`.

## Phase 2: Analysis & Environment Setup

The agent must verify the failure before attempting a fix.

1. **Environment Initialization**: Ensure the dev server is running (`npm run dev` or equivalent).
2. **Crash Capture**:
   - Use `browser_subagent` to navigate to the affected page.
   - Check for console errors (Red text) and network failures (4xx/5xx).
   - Capture a recording `debug_initial_failure`.
3. **Root Cause Identification**:
   - Trace the error from the UI back to the source code.
   - Search for relevant KIs using `knowledge_discovery`.

## Phase 3: Execution & Qodo Enhancement

The agent fixes the bug while upgrading the code quality.

1. **The Fix**: Apply the surgical fix for the identified bug.
2. **Qodo-Style Cleanup**:
   - **Readability**: Rename opaque variables to descriptive ones.
   - **Modularity**: Extract complex logic into smaller, testable functions.
   - **Robustness**: Add try/catch blocks and meaningful error logging.
   - **Linting**: Ensure the file strictly follows project linting rules.

## Phase 4: The Verification Loop (Chrome Loop)

The agent performs autonomous QA to confirm the fix.

1. **Action**: Use `browser_subagent` to re-test the exact flow that failed.
2. **Evaluation**:
   - **Success**: Flawless execution, no console errors, no regressions.
   - **Failure**: Capture logs, analyze new error, and return to Phase 2.
3. **Loop Control**: The agent will iterate up to 5 times autonomously before requesting human intervention if a "Log Jam" occurs.

## Phase 5: Rollback & Finalization

If the "Cure is worse than the disease" or the agent is stuck:

1. **Action: /rollback**:
   - `git checkout [original-branch]`
   - `git branch -D debug-backup-[task-id]`
   - Notify user of original state restoration and why the debug failed.
2. **Finalization**: If successful:
   - `git add .`
   - `git commit -m "Fixed [Issue] and applied Qodo cleanup standards. Verified via Chrome Loop."`

## Robustness Standards

- **Log Tailing**: Always check the terminal output for background crashes.
- **Side-Effect Check**: Check related modules that might be affected by the changes.
- **Knowledge Capture**: After a successful debug, run `/institutionalize_knowledge` to record the fix for future sessions.
