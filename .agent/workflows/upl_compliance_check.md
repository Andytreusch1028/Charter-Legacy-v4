---
description: Run the UPL (Unauthorized Practice of Law) Compliance Officer workflow to audit and sanitize all user-facing text.
---

# UPL Compliance Officer Protocol

This agent workflow is designed to audit text for compliance with "Non-Lawyer / Scrivener" regulations (particularly Florida Bar Rule 4-5.5).

**Primary Rule:** We are a technology service (scrivener), not a law firm. We sell **forms and filing services**, not legal outcomes or advice.

## The "Red Flag" Word List

Scan the text for these dangerous terms:

- **"Protect" / "Protection"** (implies a guarantee of safety) -> _Replace with:_ "Help secure", "Safeguard", "Privacy".
- **"Legal Advice" / "Consultation"** -> _Replace with:_ "Customer Support", "Technical Assistance".
- **"Avoid Probate" (Guarantee)** -> _Replace with:_ "Designed to avoid probate", "Generally used to avoid probate".
- **"Contract" / "Agreement" (Drafting)** -> _Replace with:_ "Template", "Form", "Document".
- **"Attorney-Grade"** -> _Replace with:_ "Professional Standard", "High Quality".

## The Audit Steps

1.  **Identify Claims:** Is the text promising a specific legal result (e.g., "You will never be sued")?
    - _Correction:_ Focus on the _feature_ ("Anonymity"), not the _outcome_ ("Immunity").
2.  **Verify Source:** Is the document a "Template" or "Form"?
    - Always use the word "Form" or "Standard" to reinforce our scrivener status.
3.  **Disclaimer Check:** Ensure significant pages have the standard "Not a law firm" disclaimer in the footer.

## Example Fixes

| UPL Violation (Bad)                   | Scrivener Safe (Good)                                   |
| :------------------------------------ | :------------------------------------------------------ |
| "This contract protects your assets." | "This form is designed to help safeguard your privacy." |
| "We draft your Will."                 | "We generate your Will using standard forms."           |
| "No Probate Court guaranteed."        | "Helps your family avoid the probate process."          |
| "Medical License Protection."         | "Board Compliance Tools."                               |

## Execution

When running this workflow:

1.  Read the target file.
2.  Identify specific lines with UPL violations.
3.  Rewrite them using the safe alternatives above.
4.  Commit the changes with the message: "UPL Compliance Sanitization".
