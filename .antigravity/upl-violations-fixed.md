# UPL Violations Fixed - Compliance Report

## Critical UPL Issues Identified and Resolved

### 🚨 **High Risk: Will Review Service**

**Original Violation:**

> "Will Review Service - AI-powered error detection"  
> "Ambiguous beneficiary language detection"  
> "Common DIY error flagging (wrong executor type, unclear asset distribution)"

**Why This Was UPL:**

- "Review" implies legal judgment/advice
- Analyzing "ambiguous beneficiary language" is legal interpretation
- Determining "wrong executor type" requires legal expertise
- **Risk:** Could be construed as practicing law without a license

**✅ Fixed:**

> "**Will Completion Checker**"
>
> - Missing signature fields (testator, witnesses)
> - Witness count verification (FL-732.502 requires exactly 2)
> - Blank required fields detection
> - Page numbering sequence check
> - FL-732 statutory requirement checklist (mechanical requirements only)

**UPL-Safe Principle:** Checks for **missing mechanical requirements only** - NOT legal sufficiency or quality of will provisions.

---

### ⚠️ **Moderate Risk: Compliance Checkup (Medical PLLC)**

**Original Violation:**

> "First compliance checkup included (annual report reminder + status check)"  
> "Quarterly compliance webinars"

**Why This Was Risky:**

- "Compliance checkup" implies legal compliance advice
- "Compliance webinars" could include legal interpretation

**✅ Fixed:**

> "**Annual Report Reminder Service**"
>
> - Automated email 60 days before May 1 deadline (FL-605.0210)
> - Sunbiz status verification (active/inactive - **factual only**)
> - Deadline calendar with statutory filing dates
> - Quarterly statutory update webinars (**factual changes only**)

**UPL-Safe Principle:** **Factual reminders only** - no legal advice on compliance.

---

### ⚠️ **Moderate Risk: Compliance Dashboard (Contractor LLC)**

**Original Violation:**

> "The Contractor's Edge - Compliance Dashboard"  
> "Workers' comp compliance indicator"  
> "Compliance tracking"

**Why This Was Risky:**

- "Compliance indicator" could be interpreted as legal opinion
- Determining "compliance" requires legal judgment

**✅ Fixed:**

> "**The Contractor's Status Dashboard**"
>
> - DBPR license status display (active/expired/suspended - **pulled from state database**)
> - Workers' comp filing status (filed/not filed - **factual only**)
> - Annual report filing status (filed/not filed per FL-605.0210)
> - Upcoming statutory deadlines (May 1 annual report, license renewal dates)
> - Automated deadline alerts 60 days before due dates

**UPL-Safe Principle:** **Displays facts from public records only** - no compliance opinions.

---

### ✅ **Low Risk: Medical PLLC Messaging (Softened)**

**Original:**

> "Never think about LLC paperwork again"

**Potential Issue:**

- Could imply we're taking legal responsibility

**✅ Fixed:**

> "Automated paperwork handling per FL-621 requirements"

**Principle:** More factual, less promise-based.

---

## UPL-Safe Design Pattern

### **What We CAN Do (Clerical Excellence):**

✅ Check for missing signatures  
✅ Count witnesses (FL-732.502 requires exactly 2)  
✅ Verify blank fields  
✅ Display statutory deadlines (May 1 annual report)  
✅ Pull factual data from public databases (Sunbiz, DBPR)  
✅ Send automated deadline reminders  
✅ Provide statutory text citations (e.g., "FL-605.0210 states...")  
✅ Offer comparison tables (member-managed vs manager-managed)

### **What We CANNOT Do (Practice of Law):**

❌ Review will provisions for legal sufficiency  
❌ Advise on "ambiguous beneficiary language"  
❌ Determine compliance vs. non-compliance  
❌ Interpret statutes beyond factual requirements  
❌ Recommend specific legal structures  
❌ Draft custom legal language  
❌ Provide legal opinions on "what you should do"

---

## Key Forbidden Phrases Removed

| ❌ Forbidden                   | ✅ Safe Alternative              |
| ------------------------------ | -------------------------------- |
| "Will Review"                  | "Will Completion Checker"        |
| "Compliance checkup"           | "Annual Report Reminder Service" |
| "Compliance Dashboard"         | "Status Dashboard"               |
| "Compliance indicator"         | "Filing status (factual only)"   |
| "Error detection"              | "Missing requirement detection"  |
| "Ambiguous language detection" | "Blank field detection"          |
| "Legal review"                 | "Mechanical requirement check"   |

---

## Files Updated

✅ `product-nodes.json` - All UPL-risky language replaced  
✅ `charter-legacy.pbp.yaml` - @PRODUCTS section updated  
✅ All premium_features now include `"upl_safe"` field explaining limitations

---

## UPL Safety Guardrails Added

Each premium feature now includes:

```json
"upl_safe": "Factual reminders only - no legal advice on compliance"
```

This explicitly documents:

1. What the feature does (factual)
2. What it does NOT do (legal advice)
3. Sets user expectations appropriately

---

## Compliance Philosophy

> **"We surface facts from statutes and public records. We do not interpret, advise, or determine legal sufficiency."**

**Charter Legacy = Extreme Clerical Excellence**

- We're the **best map** (facts, deadlines, statutory text)
- We're NOT the **destination** (legal strategy, interpretation, advice)
- Users consult their own counsel for legal decisions

---

**Status:** ✅ All UPL violations resolved  
**Implementation:** Complete  
**Risk Level:** Low (factual clerical services only)
