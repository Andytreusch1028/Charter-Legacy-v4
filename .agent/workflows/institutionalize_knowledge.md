---
description: The mandatory "Checkout" process where the Archivist Agent extracts and institutionalizes wisdom from the completed task.
---

# The Archivist Protocol

**Trigger:** Immediately after completing a complex task (Verification Phase complete) and BEFORE taking on a new User Request.

## 1. The Retrospective Scan

Review the last task's Execution Logs and Artifacts. Identify:

- **Novel Patterns:** Did we solve a problem in a new, reusable way? (e.g., "Inline SVG Sprites")
- **Corrected Mistakes:** Did we break something and fix it? (e.g., "External SVG paths failing")
- **Efficiency Gains:** Did we find a shortcut?

## 2. Categorization

Map the finding to the `learnings.json` schema:

- `upl_violations`: Legal advice guardrail breaches.
- `design_inconsistencies`: Visual regressions or aesthetic failures.
- `privacy_failures`: Data leak risks.
- `workflow_improvements`: New successful patterns.
- `statutory_clarifications`: Edge cases in law.
- `performance_optimizations`: Speed/Code quality wins.

## 3. The Duplicate Check

// turbo
Execute a search to ensure this isn't already recorded.

```bash
grep -C 2 "search_term" .antigravity/learnings.json
```

## 4. Institutionalization (The Write)

Using the `replace_file_content` tool, append the new entry to `C:/Charter-Legacy v4/.antigravity/learnings.json`.

- **Format:** Strict JSON.
- **Rule:** The `prevention_rule` field is MANDATORY. It must be an actionable instruction for the future Agent.

## 5. Verification

Confirm the JSON is valid and the entry is readable.

## 6. Closure

Notify the user: "Archivist Complete. Knowledge secured: [Brief Summary]."
