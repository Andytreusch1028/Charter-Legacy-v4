# Charter Legacy PBP - Quick Reference

## What is PBP?

**Play-by-Play (PBP)** is Charter Legacy's AI Intent Language. It's a structured specification that describes **what** to build, not **how** to build it.

## Core Philosophy

```
Traditional Code: "Make button 48px border-radius with #007AFF on click..."
PBP Code: "@STYLE { corner_radius_primary: 48px; haptic: active:scale-0.98 }"
```

You define **intent**, Antigravity generates **execution**.

---

## The 11 PBP Sections

| Section           | Purpose                          | Example                                    |
| ----------------- | -------------------------------- | ------------------------------------------ |
| `@IDENTITY`       | Project context, compliance mode | `upl_mode: "STRICT_NON_DISCRETIONARY"`     |
| `@STYLE`          | Design tokens, visual standards  | `rule_of_three: "Max 3 fields per screen"` |
| `@DATA`           | Object models, schemas           | `object 'Entity' { fields: [...] }`        |
| `@LOGIC`          | Business rules, triggers         | `trigger 'OnFormation_NovemberDecember'`   |
| `@FLOW`           | View definitions, user journeys  | `view 'LLC_Builder_Identity'`              |
| `@INTEGRATIONS`   | External APIs                    | `sunbiz_api: { polling: "24hrs" }`         |
| `@MEMORY`         | AI context blocks                | `BusinessContext: Founder intent`          |
| `@EXPORTS`        | Data portability                 | `freedom_key: { format: "ZIP" }`           |
| `@NOTIFICATIONS`  | Email templates                  | `compliance_reminders: {...}`              |
| `@SENTINEL`       | Background monitoring            | `veto_buffer: "240 hours"`                 |
| `@UPL_GUARDRAILS` | Compliance rules                 | `forbidden: ["I recommend..."]`            |

---

## Example: Generate LLC Builder Component

**Your Prompt:**

```
Using charter-legacy.pbp.yaml:

Generate the LLC_Builder_Identity component (@FLOW section).
Apply @STYLE design tokens.
Enforce @UPL_GUARDRAILS.
Use Next.js 14 + TypeScript.
```

**Antigravity Generates:**

- Complete React component (200+ lines)
- UPL-compliant UI text
- Privacy defaults (DeLand Hub)
- Design tokens applied
- TypeScript types
- Error handling

---

## Key Design Principles

✅ **Rule of Three** - Max 3 interactive fields per screen  
✅ **Progressive Disclosure** - One question at a time  
✅ **Jobs-Ive Essence** - Hardware-like simplicity  
✅ **Privacy-First** - DeLand Hub defaults  
✅ **Non-Discretionary** - Facts, not advice

---

## Files

- **charter-legacy.pbp.yaml** - Full specification
- **HOW_TO_USE_PBP.md** - Detailed usage guide
- **implementation_plan.md** - AIL development roadmap

---

## Next Steps

1. Review the PBP specification
2. Try generating a component via Antigravity
3. Validate UPL compliance in output
4. Iterate on specification as needed
