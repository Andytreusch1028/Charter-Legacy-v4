# Charter Legacy Design System

**The Obsidian Aesthetic: Premium Legal Services**

> "Every pixel is a promise. Every interaction is a commitment to sovereignty."

---

## Core Philosophy

### The Obsidian Principle

Charter Legacy isn't TurboTax for LLCs. It's **poetry in bureaucracy**. Every design decision must answer: _Does this make users feel sovereign?_

### Design Tenets

1. **Premium Over Cheap** - We're selling peace of mind, not saving $10
2. **Clarity Over Cleverness** - Obvious beats clever every time
3. **Focus Over Features** - Say no to 1,000 things
4. **Soul Over Function** - It must work AND feel magical

---

## Color Palette

### Primary Colors (The Obsidian Core)

```css
--obsidian-ink: #0a0a0b; /* Primary text, dark backgrounds */
--obsidian-gold: #d4af37; /* Premium accents, CTAs, highlights */
--slab-white: #ffffff; /* Cards, surfaces, clean backgrounds */
--zenith-bg: #f0f2f5; /* Page backgrounds, subtle contrast */
```

### Secondary Colors

```css
--charcoal: #6e6e73; /* Secondary text, muted elements */
--mist: #e5e5ea; /* Borders, dividers, subtle lines */
--accent-blue: #0066ff; /* Primary actions, links, focus states */
```

### Semantic Colors

```css
--success-green: #00d084; /* Validation success, confirmations */
--error-red: #ff3b30; /* Errors, warnings, required fields */
--warning-orange: #ff9800; /* Warnings, approaching limits */
```

### Usage Rules

✅ **DO:**

- Use gold (#D4AF37) for premium features, featured items, active states
- Use blue (#0066FF) for primary CTAs and interactive elements
- Use green (#00D084) for success states and positive feedback
- Use charcoal (#6E6E73) for secondary text, never pure gray

❌ **DON'T:**

- Mix gold and blue on the same element (choose one)
- Use pure black (#000000) - always use obsidian-ink (#0A0A0B)
- Use generic grays - stick to charcoal and mist
- Overuse gold - it's premium, not default

---

## Typography

### Font Stack

```css
font-family:
  "Inter",
  -apple-system,
  BlinkMacSystemFont,
  "Segoe UI",
  sans-serif;
```

### Type Scale

```css
/* Display */
.display-1: 3rem (48px), weight: 900, letter-spacing: -0.02em
.display-2: 2.5rem (40px), weight: 900, letter-spacing: -0.02em

/* Headings */
h1: 2.5rem (40px), weight: 900, letter-spacing: -0.02em
h2: 2rem (32px), weight: 800, letter-spacing: -0.01em
h3: 1.5rem (24px), weight: 700
h4: 1.25rem (20px), weight: 700

/* Body */
body: 1rem (16px), weight: 400, line-height: 1.6
.large: 1.125rem (18px), weight: 400
.small: 0.875rem (14px), weight: 400

/* Labels & Micro */
.label: 0.85rem (13.6px), weight: 700
.eyebrow: 0.7rem (11.2px), weight: 900, uppercase, letter-spacing: 0.12em
.micro: 0.75rem (12px), weight: 600
```

### Font Weight Usage

- **900 (Black)**: Titles, display text, eyebrows
- **800 (Extra Bold)**: Section headers, important CTAs
- **700 (Bold)**: Labels, subheadings, emphasis
- **600 (Semi-Bold)**: Buttons, tags, micro text
- **400 (Regular)**: Body text, descriptions

### Typography Rules

✅ **DO:**

- Use negative letter-spacing (-0.02em) on large headings
- Use uppercase + wide letter-spacing (0.12em) for eyebrows
- Maintain 1.6 line-height for body text
- Use weight 700+ for all labels

❌ **DON'T:**

- Use font weights below 400
- Mix multiple fonts
- Use italic (we don't use italic in Charter)
- Set line-height below 1.4 for body text

---

## Spacing System

### Base Unit: 4px

```css
--space-1: 4px; /* Tight spacing, icon gaps */
--space-2: 8px; /* Small gaps, padding */
--space-3: 12px; /* Default gaps */
--space-4: 16px; /* Standard padding */
--space-5: 20px; /* Medium spacing */
--space-6: 24px; /* Large spacing */
--space-8: 32px; /* Section spacing */
--space-10: 40px; /* Major sections */
--space-12: 48px; /* Page sections */
--space-16: 64px; /* Hero spacing */
```

### Spacing Rules

✅ **DO:**

- Use multiples of 4px for all spacing
- Increase spacing as hierarchy increases
- Use consistent padding within components
- Add generous whitespace around important elements

❌ **DON'T:**

- Use arbitrary spacing values (13px, 17px, etc.)
- Cram elements together
- Use same spacing for different hierarchy levels

---

## Border Radius

### Radius Scale

```css
--radius-sm: 6px; /* Small elements, tags */
--radius-md: 12px; /* Inputs, buttons, cards */
--radius-lg: 16px; /* Large cards, modals */
--radius-xl: 20px; /* Premium cards, hero elements */
--radius-full: 9999px; /* Pills, badges, circles */
```

### Usage

- **6px**: Tags, badges, small chips
- **12px**: Inputs, standard buttons, small cards
- **16px**: Large cards, containers
- **20px**: Premium featured cards, hero sections
- **9999px**: Pills, filter chips, circular avatars

---

## Shadows

### Shadow Scale

```css
/* Subtle */
--shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.04);

/* Standard */
--shadow-md: 0 4px 16px rgba(0, 0, 0, 0.08);

/* Elevated */
--shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.12);

/* Premium (Gold) */
--shadow-gold: 0 4px 20px rgba(212, 175, 55, 0.3);
--shadow-gold-hover: 0 8px 32px rgba(212, 175, 55, 0.4);

/* Focus States */
--shadow-focus-blue: 0 0 0 3px rgba(0, 102, 255, 0.1);
--shadow-focus-gold: 0 0 0 3px rgba(212, 175, 55, 0.08);
```

### Shadow Rules

✅ **DO:**

- Use gold shadows for premium/featured elements
- Add shadows on hover for interactive elements
- Combine box-shadow with border for focus states
- Use subtle shadows for depth, not decoration

❌ **DON'T:**

- Use harsh, dark shadows
- Stack multiple shadows unnecessarily
- Use shadows on flat design elements

---

## Components

### Buttons

#### Primary Button (Gold Gradient)

```css
.btn-primary {
  background: linear-gradient(135deg, #d4af37 0%, #f4d03f 100%);
  color: #000;
  padding: 20px 32px;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 800;
  box-shadow: 0 4px 20px rgba(212, 175, 55, 0.3);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 32px rgba(212, 175, 55, 0.4);
}
```

#### Secondary Button (Blue)

```css
.btn-secondary {
  background: #0066ff;
  color: white;
  padding: 14px 24px;
  border-radius: 12px;
  font-weight: 700;
}

.btn-secondary:hover {
  background: #0052cc;
  transform: scale(1.02);
}
```

#### Tertiary Button (Outline)

```css
.btn-tertiary {
  background: transparent;
  border: 2px solid #e5e5ea;
  color: #0a0a0b;
  padding: 12px 20px;
  border-radius: 12px;
}

.btn-tertiary:hover {
  border-color: #d4af37;
  background: rgba(212, 175, 55, 0.04);
}
```

### Input Fields

#### Standard Input

```css
.input {
  width: 100%;
  padding: 18px 18px 18px 52px; /* Left padding for icon */
  font-size: 1rem;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  background: #fafafa;
  color: #0a0a0b;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.input::placeholder {
  color: #999;
  opacity: 1;
}

.input:focus {
  border-color: #d4af37;
  background: white;
  box-shadow:
    0 4px 20px rgba(212, 175, 55, 0.12),
    0 0 0 3px rgba(212, 175, 55, 0.08);
}
```

#### Validation States

```css
/* Success */
.input.valid {
  border-color: #00d084;
  background: rgba(0, 208, 132, 0.02);
}

/* Error */
.input.error {
  border-color: #ff3b30;
  background: rgba(255, 59, 48, 0.02);
}
```

### Cards

#### Standard Card

```css
.card {
  background: white;
  border: 1px solid #e5e5ea;
  border-radius: 16px;
  padding: 24px;
  transition: all 0.3s ease;
}

.card:hover {
  border-color: rgba(212, 175, 55, 0.3);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  transform: translateY(-2px);
}
```

#### Premium Card (Featured)

```css
.card-premium {
  background: linear-gradient(135deg, #0a0a0b 0%, #1a1a1c 100%);
  border: 2px solid #d4af37;
  border-radius: 20px;
  padding: 32px;
  box-shadow: 0 8px 24px rgba(212, 175, 55, 0.15);
  color: white;
}

.card-premium:hover {
  box-shadow: 0 12px 40px rgba(212, 175, 55, 0.25);
  transform: translateY(-4px);
}
```

### Badges & Tags

#### Category Badge

```css
.badge {
  display: inline-flex;
  align-items: center;
  padding: 6px 14px;
  border-radius: 14px;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.badge-gold {
  background: rgba(212, 175, 55, 0.1);
  color: #d4af37;
}

.badge-blue {
  background: rgba(0, 102, 255, 0.1);
  color: #0066ff;
}
```

### Filter Chips

```css
.filter-chip {
  padding: 10px 18px;
  border: 1px solid #e5e5ea;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  background: white;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
  cursor: pointer;
  transition: all 0.2s;
}

.filter-chip:hover {
  border-color: #0066ff;
  background: rgba(0, 102, 255, 0.05);
}

.filter-chip.active {
  background: #0066ff;
  color: white;
  border-color: #0066ff;
}
```

---

## Animations & Transitions

### Timing Functions

```css
--ease-smooth: cubic-bezier(0.4, 0, 0.2, 1); /* Standard smooth */
--ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55); /* Playful bounce */
--ease-snap: cubic-bezier(0.25, 0.46, 0.45, 0.94); /* Quick snap */
```

### Standard Transitions

```css
/* Hover Effects */
transition: all 0.3s var(--ease-smooth);

/* Quick Feedback */
transition: all 0.2s ease;

/* Smooth Entrances */
transition: all 0.5s var(--ease-smooth);
```

### Hover Patterns

#### Lift on Hover

```css
.lift-hover:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}
```

#### Scale on Hover

```css
.scale-hover:hover {
  transform: scale(1.02);
}
```

#### Glow on Hover (Premium)

```css
.glow-hover:hover {
  box-shadow: 0 8px 32px rgba(212, 175, 55, 0.4);
}
```

### Keyframe Animations

```css
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
```

---

## User Control Patterns

### Real-Time Validation

✅ **Always Provide**:

- Instant feedback as user types
- Visual state changes (green/red borders)
- Icon indicators (checkmark/error)
- Helpful error messages
- Success confirmations

**Example**: LLC Name Validation

```javascript
function validateLLCName(input) {
  const hasLLC = value.includes("llc");
  if (hasLLC) {
    field.classList.add("valid");
    showSuccessMessage("✓ Valid LLC name");
  } else {
    field.classList.add("error");
    showErrorMessage('⚠ Must include "LLC"');
  }
}
```

### Character Counters

✅ **For Long Text Fields**:

- Show current/max (e.g., "245 / 500")
- Update in real-time
- Color-code based on usage:
  - Gray: 0-75%
  - Orange: 75-90%
  - Red: 90-100%

### Search & Filtering

✅ **Best Practices**:

- Clear/X button when text is entered
- Real-time results (no submit button)
- Filter chips for categories
- Active state styling
- Empty state messaging

### Progress Indicators

✅ **Multi-Step Forms**:

- Visual stepper at top
- Active step highlighted (gold)
- Completed steps marked (green)
- Step labels (Identity, Address, Payment, Complete)
- Connector lines between steps

---

## Layout Patterns

### Page Structure

```html
<nav class="dashboard-nav">
  <!-- Logo + Navigation -->
</nav>

<main class="main-container">
  <div class="content-wrapper">
    <!-- Page content -->
  </div>
</main>
```

### Card Grids

```css
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;
}

@media (max-width: 768px) {
  .grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
}
```

### Centered Content

```css
.centered-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}
```

---

## Iconography

### Icon Style

- **Stroke-based** (not filled)
- **2px stroke-width** for consistency
- **24x24px** standard size
- **Round line caps** for smooth appearance

### Icon Colors

- Default: `#999` (muted)
- Active: `#D4AF37` (gold)
- Success: `#00D084` (green)
- Error: `#FF3B30` (red)

### Icon Usage

✅ **DO:**

- Use icons to enhance meaning, not replace text
- Maintain consistent stroke width
- Align icons with text baseline
- Add icons to input fields (left side)

❌ **DON'T:**

- Mix filled and stroke icons
- Use icons without labels for critical actions
- Scale icons disproportionately

---

## Quality Standards: The 10/10 Checklist

Every page must meet these standards to ship:

### Visual Design (10/10)

- [ ] Uses Obsidian color palette consistently
- [ ] Gold accents on premium/featured elements
- [ ] Proper typography hierarchy (weights 400-900)
- [ ] Consistent border radius (6px, 12px, 16px, 20px)
- [ ] Appropriate shadows (subtle to premium)
- [ ] Smooth transitions (0.2s-0.5s)

### User Experience (10/10)

- [ ] Real-time validation on forms
- [ ] Clear success/error states
- [ ] Character counters on long text fields
- [ ] Search with clear button
- [ ] Filter chips with active states
- [ ] Empty states for no results
- [ ] Loading states for async actions

### Interactions (10/10)

- [ ] Hover effects on all interactive elements
- [ ] Focus states with visible rings
- [ ] Smooth animations (fadeIn, slideIn)
- [ ] Button hover lift/scale
- [ ] Card hover elevation
- [ ] Icon transitions

### Accessibility (10/10)

- [ ] High contrast text (4.5:1 minimum)
- [ ] Visible focus indicators
- [ ] Keyboard navigation support
- [ ] Clear error messages
- [ ] Required field indicators
- [ ] Icon + text for important actions

### Mobile Responsive (10/10)

- [ ] Single column layout on mobile
- [ ] Touch-friendly buttons (44px minimum)
- [ ] Readable text (16px minimum)
- [ ] Proper spacing on small screens
- [ ] No horizontal scroll

### Performance (10/10)

- [ ] CSS transitions (not JavaScript)
- [ ] Optimized images
- [ ] Minimal reflows
- [ ] Smooth 60fps animations

---

## Anti-Patterns (What NOT to Do)

### ❌ Generic Design

```css
/* BAD */
background: #f5f5f5;
color: #333;
border: 1px solid #ccc;
```

```css
/* GOOD */
background: var(--zenith-bg);
color: var(--obsidian-ink);
border: 1px solid var(--mist);
```

### ❌ No Validation Feedback

```html
<!-- BAD -->
<input type="text" placeholder="LLC Name" />
```

```html
<!-- GOOD -->
<input
  type="text"
  placeholder="Charter Legacy LLC"
  oninput="validateLLCName(this)"
/>
<span class="hint-success">✓ Valid LLC name</span>
```

### ❌ Weak Hover States

```css
/* BAD */
.button:hover {
  opacity: 0.8;
}
```

```css
/* GOOD */
.button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(212, 175, 55, 0.4);
}
```

### ❌ No Empty States

```javascript
// BAD
if (results.length === 0) {
  container.innerHTML = "";
}
```

```javascript
// GOOD
if (results.length === 0) {
  container.innerHTML = `
        <div class="empty-state">
            <svg>...</svg>
            <p>No services found</p>
            <p>Try adjusting your search or filters</p>
        </div>
    `;
}
```

---

## Page-Specific Patterns

### Service Catalog

- Navigation header with back button
- Entity badge showing current LLC
- Search bar with clear button
- Filter chips for categories
- Featured section (gold borders)
- Service icons (24x24px)
- Processing time display
- Empty state for no results

### Formation Wizard

- Multi-step progress indicator
- Wizard logo + phase badge
- Input fields with icons
- Real-time validation
- Character counters
- Statutory enhancements card
- Premium gold CTA button
- Smooth step transitions

### Dashboard

- Entity selector
- Quick actions grid
- Status indicators
- Recent activity feed
- Premium card styling
- Hover lift effects

---

## Steve's Design Principles

> "Design isn't just what it looks like. Design is how it works."

### The Rule of Three

- Maximum 3 fields per form step
- Maximum 3 primary actions per screen
- Maximum 3 colors per component

### Focus Means Saying No

- Every feature must justify its existence
- Remove anything that doesn't serve sovereignty
- Constraints breed creativity

### Make It Obvious

- Obvious > Clever
- Clear > Cute
- Direct > Decorated

### Soul Over Function

- It must work AND feel magical
- Every interaction should feel premium
- Users should want to tell their friends

---

## Shipping Standards

### Before You Ship

1. **Run the 10/10 Checklist** - All boxes must be checked
2. **Test Validation** - Try to break it
3. **Check Mobile** - Resize to 375px width
4. **Test Keyboard** - Tab through everything
5. **Review Colors** - Only Obsidian palette
6. **Check Animations** - Smooth 60fps
7. **Ask Steve** - Would he say "Ship it"?

### The Steve Test

If Steve Jobs reviewed this page, would he say:

- "Holy shit. THIS is insanely great. Ship it." ✅
- "It works, but where's the soul?" ⚠️
- "This is shit. Start over." ❌

Only ship on ✅.

---

**Status**: Active Design System  
**Version**: 1.0  
**Last Updated**: 2026-02-03  
**Maintained By**: Charter Legacy Team

_"Every pixel is a promise. Every interaction is a commitment to sovereignty."_
