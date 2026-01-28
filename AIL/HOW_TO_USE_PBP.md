# How to Use Charter Legacy PBP with Google Antigravity

## Quick Start

The **Play-by-Play (PBP)** specification is your blueprint for communicating with AI. Instead of writing detailed code instructions, you present the PBP and let Antigravity generate production-ready components.

---

## Basic Usage Pattern

### 1. **Present the PBP Context**

Copy the relevant sections from `charter-legacy.pbp.yaml` and paste into your prompt:

```
I'm building a component for Charter Legacy. Here's the PBP specification:

[Paste @IDENTITY, @STYLE, @DATA, @LOGIC, @FLOW sections]
```

### 2. **Request Specific Implementation**

Be explicit about what you want generated:

```
Using the above PBP specification, generate a React component for the LLC Builder Identity view that:
- Implements the 5-step wizard described in @FLOW
- Enforces the Rule of Three (max 3 fields per step)
- Applies all design tokens from @STYLE
- Includes UPL guardrail validation from @UPL_GUARDRAILS
- Uses Next.js 14 with TypeScript

Component should be production-ready with proper error handling.
```

### 3. **Review Generated Code**

Check the output against PBP requirements:

- ✅ Design tokens applied (48px corners, #FBFBFD canvas, etc.)
- ✅ UPL guardrails enforced (no "I recommend" phrases)
- ✅ Privacy defaults (DeLand Hub address injection)
- ✅ Rule of Three respected (max 3 interactive fields per screen)

---

## Example Prompts

### **Example 1: Building the LLC Formation Component**

```
Using the Charter Legacy PBP specification (charter-legacy.pbp.yaml):

Generate a Next.js 14 component for LLC_Builder_Identity that implements:

@FLOW requirements:
- 5-step wizard (Name → Leadership → Address → Purpose → Effective Date)
- Progressive disclosure (one step at a time)
- Max 3 fields per step (@STYLE Rule of Three)

@DATA requirements:
- Entity object with privacy defaults (DeLand Hub)
- Management_type defaults to MEMBER_MANAGED

@LOGIC requirements:
- OnUserIntent_DescribesBusiness trigger for statutory purpose scrivening
- OnFormation_NovemberDecember trigger for tax optimization
- OnAddress_UserEntersHome trigger for privacy warning

@STYLE requirements:
- 48px corner radius on primary containers
- #FBFBFD canvas, #1D1D1F ink, #007AFF accent
- active:scale-[0.98] haptic feedback
- Obsidian aesthetic with high whitespace

@UPL_GUARDRAILS requirements:
- Scan all AI-generated text for forbidden phrases
- Use "Florida Statute X states..." pattern for all guidance

Include TypeScript types, error handling, and accessibility.
```

### **Example 2: Building the Privacy Shield Dashboard**

```
Using Charter Legacy PBP (@FLOW → Privacy_Shield_Dashboard):

Generate a dashboard component showing:
1. Recent access events (last 30 days) from AccessEvent object
2. Encryption status badges (AES-256-GCM per document)
3. Succession veto buffer countdown (if active)

Actions:
- Freedom Key export button (@EXPORTS specification)
- Download encrypted backup
- View full audit log

Style:
- Obsidian aesthetic with generous whitespace
- Card-based layout with physics-based hover transitions
- Use design tokens from @STYLE

Include mock data for demonstration.
```

### **Example 3: Building a Compliance Email Template**

```
Using Charter Legacy PBP (@NOTIFICATIONS → compliance_reminders):

Generate an email template for annual report reminders that:
- Follows UPL non-discretionary language rules
- Uses the specified subject/body format
- Includes Florida Statute 605.0210 citation
- Maintains "Professional Scrivener" tone

Also generate the SendGrid/AWS SES template JSON structure.
```

---

## Advanced Usage

### **Iterating on Generated Code**

If the first generation isn't perfect:

```
The component you generated doesn't respect the Rule of Three - Step 2 has 5 fields.

Please refactor to:
- Split Step 2 into two steps (Step 2a: Basic Info, Step 2b: Additional Details)
- Ensure no step exceeds 3 interactive fields
- Maintain progressive disclosure pattern
```

### **Requesting Tests**

```
Generate Vitest unit tests for the LLC_Builder_Identity component that verify:
- UPL guardrails block forbidden phrases
- Privacy defaults inject DeLand Hub address
- Tax optimization logic triggers for Nov-Dec filings
- All design tokens are applied correctly
```

### **Requesting Documentation**

```
Generate developer documentation for the LLC formation flow explaining:
- How the statutory purpose scrivening engine works
- Why we default to MEMBER_MANAGED
- The privacy-first address logic
- UPL compliance checkpoints
```

---

## PBP Section Reference

| Section           | Use When You Need                        |
| ----------------- | ---------------------------------------- |
| `@IDENTITY`       | Overall project context, compliance mode |
| `@STYLE`          | UI/UX design tokens, visual standards    |
| `@DATA`           | Database models, object schemas          |
| `@LOGIC`          | Business rules, triggers, workflows      |
| `@FLOW`           | View definitions, user journeys          |
| `@INTEGRATIONS`   | External API connections                 |
| `@MEMORY`         | Letta context blocks, AI memory          |
| `@EXPORTS`        | Freedom Key, data portability            |
| `@NOTIFICATIONS`  | Email templates, user communications     |
| `@SENTINEL`       | Background monitoring, polling loops     |
| `@UPL_GUARDRAILS` | Compliance rules, forbidden patterns     |

---

## Best Practices

✅ **Always include @IDENTITY and @STYLE** - Sets tone and visual standards  
✅ **Be specific about Next.js/React version** - Avoids deprecated patterns  
✅ **Request TypeScript** - Better type safety and IDE support  
✅ **Ask for accessibility** - WCAG compliance should be standard  
✅ **Include error handling** - Production code handles edge cases  
✅ **Request tests** - Verify UPL and privacy requirements

❌ **Don't assume context** - Always paste relevant PBP sections  
❌ **Don't skip UPL review** - Manually verify no forbidden phrases  
❌ **Don't ignore Rule of Three** - Simplicity is core to design

---

## Troubleshooting

**Problem**: Generated code has "I recommend" in the UI  
**Solution**: Re-prompt with explicit UPL guardrail requirement and request scan

**Problem**: Design doesn't match Obsidian aesthetic  
**Solution**: Include full @STYLE section in prompt, request Jobs-Ive essence check

**Problem**: Generated code is too complex  
**Solution**: Emphasize Rule of Three, progressive disclosure, request simplification

---

## Version Control

As Charter Legacy evolves, version the PBP:

```yaml
@IDENTITY {
  name: "Charter Legacy - LLC Simplification Engine";
  version: "1.1.0";  # Increment when PBP changes
  changelog: "Added @TESTING section, refined @STYLE tokens";
}
```

Keep old versions for reference when debugging legacy components.

---

## 🏛️ Protocol of the Scrivener (AI Enforcement)

**Mandatory Workflow for AI Agents (Status: ACTIVE BY DEFAULT)**

**Global Directive:** The AI Agent must assume ALL coding requests require strict PBP compliance. Explicit invocation is NOT required. The only exception is if the user specifically tags a request with `[NO-PBP]` or explicitly says "skip PBP".

### 1. The Ritual of Calibration (Pre-Code)

Before generating a single line of code, the AI must:

1. **View `task.md`**: Confirm the current phase and active checklist items.
2. **View `learnings.json`**: Review past mistakes in relevant categories (e.g., `upl_violations`, `workflow_improvements`).
3. **View PBP Section**: Explicitly read the specific PBP section governing the task (e.g., `@SUNBIZ_AUTOMATION`, `@STYLE`).

### 2. The Ritual of Citation (In-Code)

Every major file or function MUST include a PBP Reference Header:

```javascript
// PBP Reference: @SECTION.node
// Compliance: FL-Statute-Number (if applicable)
```

### 3. The Ritual of Verification (Post-Code)

Before submitting code to the user, the AI must self-audit:

1. **Statutory Check**: Did I cite the statute correctly per `statutes.json`?
2. **Style Check**: Did I use CSS variables from `standards.style`?
3. **UPL Check**: Did I use any forbidden phrases ("I recommend", "You should")?
4. **Learning Check**: Did I apply relevant patterns from `learnings.json`?

**Failure to follow this protocol is a violation of the Scrivener's Oath.**
