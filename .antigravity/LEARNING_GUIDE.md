# Charter Legacy PBP - Learning System Guide

## Overview

The **@LEARNING** section enables the PBP to self-improve by capturing mistakes and successes, storing them in `.antigravity/learnings.json`, and applying learned patterns to future code generation.

---

## How It Works

### **1. Learning Categories** (6 types)

| Category                    | What It Captures                                            |
| --------------------------- | ----------------------------------------------------------- |
| `upl_violations`            | Forbidden phrases used ("I recommend", "You should")        |
| `design_inconsistencies`    | Hardcoded values instead of CSS variables                   |
| `privacy_failures`          | DeLand Hub defaults not applied, P.O. Box allowed           |
| `workflow_improvements`     | Successful patterns (progressive disclosure, Rule of Three) |
| `statutory_clarifications`  | Edge cases in FL-605 interpretation                         |
| `performance_optimizations` | Faster generation techniques, better code quality           |

---

### **2. The Learning Cycle** (5 Steps)

```
1. DETECT → Identify deviation from PBP specs
2. CATEGORIZE → Classify into one of 6 categories
3. DOCUMENT → Record mistake/success + correction/pattern + impact + prevention rule
4. STORE → Append to .antigravity/learnings.json
5. APPLY → Reference learnings.json before next generation
```

---

### **3. Capture Triggers**

The system logs a learning when:

- ✅ User says "that's wrong" or provides a correction
- ✅ Generated code fails UPL/design/privacy validation
- ✅ User says "perfect" without edits (captures successful pattern)
- ✅ Statutory edge case discovered during review
- ✅ Performance improvement validated

---

### **4. Pre-Generation Checklist**

Before generating code, AI must:

1. **UPL Scan** - Review `upl_violations` entries → block forbidden phrases
2. **Design Check** - Review `design_inconsistencies` → use `var(--token)`, not literals
3. **Privacy Audit** - Review `privacy_failures` → confirm DeLand Hub defaults
4. **Pattern Reuse** - Review `workflow_improvements` → apply successful patterns
5. **Statute Reference** - Review `statutory_clarifications` → avoid past errors

---

## Example Learning Entries

### **Mistake: UPL Violation**

```json
{
  "id": "learning-002",
  "category": "upl_violations",
  "date": "2026-01-22",
  "mistake": "AI output included phrase 'I recommend using member-managed structure'",
  "correction": "Replace with: 'Florida Statute 605.0407 states that LLCs are member-managed unless articles specify otherwise. Here are both options: [comparison table]'",
  "impact": "Critical - UPL violation risk",
  "prevention_rule": "Run forbidden phrase regex scan on ALL text output before display. Block if match found."
}
```

### **Success: Workflow Improvement**

```json
{
  "id": "learning-003",
  "category": "workflow_improvements",
  "date": "2026-01-25",
  "success": "Added progressive disclosure to LLC formation wizard - reduced user confusion by 70%",
  "pattern": "Break complex forms into single-question steps. Rule of Three enforcement = better UX.",
  "impact": "High - Significantly improved completion rate",
  "reuse_guidance": "Apply progressive disclosure pattern to all multi-step forms. Never show more than 3 fields at once."
}
```

---

## How to Use

### **As a Developer (Feeding Learnings)**

**Scenario 1: AI makes a mistake**

```
You: "That's wrong - you used 'I recommend' which violates UPL guardrails."

Action: Log to learnings.json
{
  "category": "upl_violations",
  "mistake": "Used forbidden phrase 'I recommend'",
  "correction": "Use mandatory pattern: 'Florida Statute X states...'",
  "prevention_rule": "Regex scan before output"
}
```

**Scenario 2: AI does something great**

```
You: "Perfect! The progressive disclosure made this so much cleaner."

Action: Log to learnings.json
{
  "category": "workflow_improvements",
  "success": "Used progressive disclosure pattern",
  "pattern": "One question at a time, Rule of Three",
  "reuse_guidance": "Apply to all complex forms"
}
```

### **As Antigravity (Consuming Learnings)**

**Before generating code:**

1. Read `.antigravity/learnings.json`
2. Check relevant categories for this task
3. Apply `prevention_rule` from past mistakes
4. Reuse `pattern` from past successes

**Example:**

```
Task: Generate LLC formation component

Pre-check learnings.json:
- upl_violations: "Avoid 'I recommend'" ✓
- design_inconsistencies: "Use var(--radius-primary), not 52px" ✓
- privacy_failures: "Always default to DeLand Hub" ✓
- workflow_improvements: "Use progressive disclosure" ✓

Generate code with learnings applied → Output is better
```

---

## Meta-Learning (Long-Term Improvement)

### **Monthly Analysis**

- Count occurrences of each error type
- Identify recurring patterns
- Synthesize new prevention rules

### **Rule Synthesis**

If a mistake happens 3+ times:
→ Convert to automated pre-check
→ Add to `@UPL_GUARDRAILS` or `@STYLE` section
→ Make it impossible to repeat

### **Effectiveness Tracking**

```json
"meta": {
  "total_learnings": 47,
  "last_applied": "2026-01-27",
  "effectiveness_score": 0.85  // 85% reduction in errors over time
}
```

---

## Integration with Existing PBP

### **learnings.json** referenced in:

- `@ANTIGRAVITY.learnings` - Wired to configuration system
- `@LEARNING` - Full specification of learning process
- `@UPL_GUARDRAILS.audit` - Validation against past violations

### **Workflow:**

1. User prompts Antigravity with PBP
2. Antigravity reads `learnings.json` pre-generation
3. Applies prevention rules + successful patterns
4. Generates code
5. User reviews → provides feedback
6. New learnings stored → cycle repeats

---

## Benefits

✅ **Continuous Improvement** - AI gets smarter with every iteration  
✅ **Mistake Prevention** - Same errors never repeat  
✅ **Pattern Reuse** - Successful techniques applied automatically  
✅ **UPL Safety** - Forbidden phrases blocked proactively  
✅ **Design Consistency** - Token violations caught early  
✅ **Privacy Enforcement** - DeLand Hub defaults never forgotten

---

## Philosophy

> **"Every mistake is a lesson. Every success is a pattern. Store both."**

The learning system treats failures as **valuable data**, not just problems to fix. Each correction makes the next generation better. Over time, the PBP becomes increasingly aligned with Charter Legacy's standards, reducing the need for manual corrections.

---

**Status:** ✅ Active  
**File:** `.antigravity/learnings.json`  
**Current Learnings:** 0 (ready to capture first entries)
