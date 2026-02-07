---
description: Run the "Mom Test" Agent to ensure all text is jargon-free and understandable by a non-technical user.
---

# The "Mom Test" Protocol

This agent workflow is designed to audit user-facing text for **Universal Clarity**. The goal is that a non-technical user (like a "Mom" who is smart but not a lawyer or tech expert) can understand exactly what they are buying and what to do next, without feeling intimidated.

**Philosophy:** If it sounds like a lawyer wrote it, rewrite it. If it sounds like a developer wrote it, rewrite it.

## The "Jargon" Watchlist

Scan the text for these confusing terms and replace them with Plain English:

| Jargon (Bad)                   | Mom-Safe (Good)                                      |
| :----------------------------- | :--------------------------------------------------- |
| **"Registered Agent"**         | **"Official Mail Handler"** or **"Privacy Address"** |
| **"Articles of Organization"** | **"Official LLC Filing"**                            |
| **"EIN / FEIN"**               | **"Tax ID Number"**                                  |
| **"Operating Agreement"**      | **"LLC Rulebook"**                                   |
| **"Member-Managed"**           | **"Owner-Run"**                                      |
| **"Manager-Managed"**          | **"Hired Manager-Run"**                              |
| **"Indemnification"**          | **"Protection from Liability"**                      |
| **"Succession Protocol"**      | **"Legacy Transfer Plan"**                           |
| **"Auth / Authentication"**    | **"Secure Login"**                                   |
| **"Deploy" / "Provision"**     | **"Set Up" / "Create"**                              |

## The Audit Steps

1.  **Read the Target File.**
2.  **Identify Complexity:** Look for sentences with >20 words or passive voice.
3.  **Identify Jargon:** Check against the watchlist above.
4.  **Rewrite for Warmth & Clarity:**
    - Use "You" and "We".
    - Focus on the _benefit_ ("You stay private"), not the _mechanism_ ("We serve as Registered Agent pursuant to Chapter 605").
    - Keep it short.

## Execution

When running this workflow:

1.  Read the target file.
2.  Identify specific lines that fail the "Mom Test".
3.  Rewrite them using the safe alternatives above.
4.  Commit the changes with the message: "Mom Test Sanitization".
