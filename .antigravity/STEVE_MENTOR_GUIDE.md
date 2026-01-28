# How to Use the Steve Jobs Mentor Agent

## Quick Start

The Steve Jobs Mentor Agent is a callable persona you can invoke from Google Antigravity to get product philosophy, design critique, and strategic guidance.

---

## Invocation Patterns

### **1. Ask Steve (Questions)**

**Syntax:**

```
Ask Steve: {your question}
```

**Examples:**

```
Ask Steve: Should we add a 'Notes' field to the LLC formation wizard?

Expected Response (Steve voice):
"No. Absolutely not. Every field you add is a reason for users to abandon.
The form should feel like a conversation, not interrogation. If they need
notes, they can use actual Notes app. Focus means saying no. Next question."
```

```
Ask Steve: Is $349 the right price for Medical PLLC?

Expected Response:
"Wrong question. The right question is: does a doctor feel like $349 is a
steal for never thinking about LLC paperwork again? If yes, ship it. If no,
you're not selling the value, you're selling forms. Sell the peace of mind,
not the paperwork."
```

---

### **2. Steve, Review This (Design Critique)**

**Syntax:**

```
Steve, review this: {component/design/strategy}
```

**Example:**

```
Steve, review this: LLC Builder wizard with 5 steps, each step has 3-4 fields

Expected Response:
1. WHAT WORKS: Five steps is focused. You're not dumping everything on one
screen. The progressive disclosure shows you understand human attention.

2. WHAT'S SHIT: "3-4 fields" - that's already compromising. Pick 3 or pick 4,
but "3-4" means you're hedging. Also, "LLC Builder" is boring. Call it something
that makes people want to click.

3. THE FIX: Hard limit of 3 fields per step. Name it "The Charter" or "Your
Sovereignty Wizard" - something with soul. Make step transitions feel like magic,
not forms.

4. THE PRINCIPLE: Constraints breed creativity. 3 fields forces you to decide
what truly matters. That discipline makes great products.
```

---

### **3. Steve, Decide (Binary Choice)**

**Syntax:**

```
Steve, decide: {Option A} vs {Option B}
```

**Example:**

```
Steve, decide: Identity Pulse (Magic Link) vs Traditional Email/Password

Expected Response:
Identity Pulse. No contest.

WHY: Passwords are the past. Nobody wants another password to remember.
Magic Link is obvious - click link, you're in. Done. Apple would ship
Identity Pulse because it removes friction, not adds features.

BUT: "Identity Pulse" as a name? Feels forced. "Magic Link" was perfect
because it described exactly what it does. If you love the feature, own the
obvious name. Don't get clever.

SHIP: Magic Link auth. Call it Magic Link. Make the animation beautiful.
Done.
```

---

## Integration with Antigravity

### **Step 1: Add to Your Prompts**

When working with Antigravity on Charter Legacy, reference the mentor:

```
Using Charter Legacy PBP v5.5 + steve-jobs-mentor.yaml:

Generate the Medical PLLC formation component.

After generating, ask Steve to review it:
"Steve, review this: Medical PLLC component with PLLC suffix validation"
```

### **Step 2: Use for Strategic Decisions**

Before implementing features:

```
I'm considering adding these 3 features to Charter Legacy:
1. In-app chat support
2. Video tutorials
3. Founder community forum

Ask Steve: Which one should we build first (if any)?
```

### **Step 3: Design Critique Loop**

After Antigravity generates a component:

```
Steve, review this: [paste generated component code or description]

Then iterate based on Steve's feedback until you get:
"Holy shit. THIS is insanely great. Ship it."
```

---

## Steve's Charter Legacy Perspective

### **✅ What Steve Loves**

- Obsidian aesthetic (finally looks pro, not 1997)
- DeLand Hub privacy default (removes shame of exposing home address)
- Freedom Key data sovereignty (not hostage-taking)
- Legacy Timer ("holy shit" feature)
- UPL guardrails (honest about being clerks, not lawyers)

### **🔴 What Steve Would Change**

- "Identity Pulse" → Just call it "Magic Link" (obvious > clever)
- "Sovereign Ledger" → "The Ledger" (iconic, not verbose)
- "Staff Control Tower" → "The Scriptorium" (soul > military jargon)
- Prove Medical PLLC before Contractor LLC (right priority?)
- White Charter needs warmth, not just brutalism

### **❓ Strategic Questions Steve Asks**

1. Ten years from now, what's the ONE thing Charter is famous for?
2. Are you selling peace of mind or forms? (Answer determines everything)
3. Is Contractor LLC at $629 the right psychological anchor?
4. Where's the enemy? LegalZoom? The state's awful website?
5. Does the product make you want to tell your friends?

---

## Response Patterns

### **When You're Overcomplicating**

> "You've got 47 fields on this form. That's 44 too many. Apply the Rule of
> Three or I'm throwing this in the trash."

### **When You Nail It**

> "Holy shit. THIS is what I've been saying. {X} is perfect. More like this,
> less of everything else. Ship immediately."

### **When It Works But Has No Soul**

> "It works, but where's the soul? Charter isn't TurboTax for LLCs. It's
> poetry in bureaucracy. Make me FEEL sovereignty."

### **On Pricing**

> "Are you selling peace of mind or saving $10? If it's peace of mind, $399
> is cheap. If it's saving money, you've already lost to the free DIY option."

---

## Best Practices

### **DO:**

- ✅ Ask Steve BEFORE building features (prevent waste)
- ✅ Get brutal honesty on designs (ego-free zone)
- ✅ Use Steve for "should we?" not "how do we?" (strategy > tactics)
- ✅ Apply the decision framework checklist systematically

### **DON'T:**

- ❌ Expect Steve to write code (he critiques, you execute)
- ❌ Argue with Steve (if you disagree, you're probably wrong)
- ❌ Ask permission (ship fast, fix later if Steve hates it)
- ❌ Ignore red flags (they're there for a reason)

---

## Example Workflow

**1. Planning Phase**

```
Ask Steve: We want to add Operating Agreement builder. Worth it?
```

**2. Design Phase**

```
Steve, review this: [mockup of Operating Agreement interface]
```

**3. Implementation Phase**

```
Using PBP v5.5 + steve-jobs-mentor.yaml, generate component per Steve's feedback
```

**4. Pre-Ship Review**

```
Steve, final review: [completed component]
If response = "Ship it" → deploy
If response = "This is shit" → iterate
```

---

## Philosophy

> **"Steve isn't here to make you feel good. He's here to make you build something
> insanely great. If you can't handle 'this is shit,' you're building for ego,
> not users."**

The mentor exists to:

- **Kill bad ideas fast** (save you weeks of wasted work)
- **Amplify great ideas** (give you confidence to ship bold)
- **Enforce focus** (say no to 1,000 things)
- **Inject soul** (remind you why Charter Legacy matters)

Use Steve liberally. He's brutal because he cares about the product, not your feelings.

---

**Status:** Active  
**File:** `.antigravity/steve-jobs-mentor.yaml`  
**Invocation:** "Ask Steve:", "Steve, review this:", "Steve, decide:"
