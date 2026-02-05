# Charter Legacy Icon Standards

## Icon Library

All custom icons are stored in `/assets/icons-obsidian.svg` as an SVG sprite.

### Available Icons

| ID                  | Purpose                | Usage               |
| ------------------- | ---------------------- | ------------------- |
| `icon-vault`        | Vault/Storage          | Navigation          |
| `icon-documents`    | Documents              | Navigation          |
| `icon-shield`       | Protection/Security    | Page titles, badges |
| `icon-playbook`     | Playbook/Guide         | Navigation          |
| `icon-menu`         | Menu toggle            | UI controls         |
| `icon-check`        | Success/Complete       | Status              |
| `icon-close`        | Close/Cancel           | Modals, alerts      |
| `icon-building`     | RA/Company             | Categories, sources |
| `icon-chart`        | Tax/Financial          | Categories          |
| `icon-scales`       | Legal                  | Categories          |
| `icon-pen`          | Edit action            | CRUD buttons        |
| `icon-coins`        | Financial              | Categories          |
| `icon-folder`       | Category/Files         | Categories          |
| `icon-user`         | User/Personal          | Sources, profiles   |
| `icon-gear`         | Settings/Manage        | UI controls         |
| `icon-eye`          | View action            | CRUD buttons        |
| `icon-trash`        | Delete action          | CRUD buttons        |
| `icon-plus`         | Add/Create action      | CRUD buttons        |
| `icon-download`     | Download action        | File actions        |
| `icon-upload`       | Upload action          | File actions        |
| `icon-briefcase`    | Business/Corporate     | Categories          |
| `icon-pie-chart`    | Analytics/Equity       | Categories          |
| `icon-bar-chart`    | Performance/Growth     | Categories          |
| `icon-trending-up`  | Market/Progress        | Categories          |
| `icon-globe`        | Global/Relocation      | Categories          |
| `icon-credit-card`  | Banking/Expense        | Categories          |
| `icon-database`     | Servers/Digital Assets | Categories          |
| `icon-server`       | Tech Infrastructure    | Categories          |
| `icon-book`         | Heritage/Trusts        | Categories          |
| `icon-home`         | Property/Estate        | Categories          |
| `icon-award`        | Excellence/Legacy      | Categories          |
| `icon-star`         | VIP/Key Status         | Categories          |
| `icon-heart`        | Family/Philanthropy    | Categories          |
| `icon-anchor`       | Stability/Long-term    | Categories          |
| `icon-compass`      | Strategy/Direction     | Categories          |
| `icon-mountain`     | Resilience/Scale       | Categories          |
| `icon-tree`         | Family Tree/Growth     | Categories          |
| `icon-feather`      | Customary/Written      | Categories          |
| `icon-target`       | Goals/Milestones       | Categories          |
| `icon-flag`         | Jurisdiction/Territory | Categories          |
| `icon-map`          | Global Presence        | Categories          |
| `icon-user-check`   | Keyholder/Trustee      | Categories          |
| `icon-landmark`     | Institutional/Bank     | Categories          |
| `icon-shield-check` | Verified/Protected     | Categories          |

---

## CRUD Button Rules

### Icon-Only Buttons (Secondary Actions)

**View, Edit, Delete** buttons use **icon-only** with hover tooltips.

```html
<button class="action-btn view" onclick="..." title="View">
  <svg
    class="btn-icon"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
  >
    <!-- Eye icon path -->
  </svg>
</button>
```

**Styling:**

- Size: 36x36px square
- Icon: 16x16px centered
- Title attribute for accessibility tooltip

### Icon + Text Buttons (Primary Actions)

**Upload Document, Add Keyholder** use **icon + text**.

```html
<button class="btn-primary" onclick="...">
  <svg class="btn-icon">...</svg>
  Upload Document
</button>
```

---

## Page Title Badge

Gold gradient badge for page headers:

```css
.page-title-icon {
  width: 52px;
  height: 52px;
  background: linear-gradient(145deg, #d4af37 0%, #b8972e 50%, #9a7b24 100%);
  border-radius: 14px;
  box-shadow:
    0 4px 16px rgba(212, 175, 55, 0.35),
    0 2px 4px rgba(0, 0, 0, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
}

.page-icon {
  width: 28px;
  height: 28px;
  stroke: white;
  stroke-width: 2;
  fill: none;
}
```

---

## Icon Usage in JavaScript

Use **inline SVGs** for dynamically rendered content (not external sprite references, which have CORS issues):

```javascript
// ✅ CORRECT - Inline SVG
<svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
    <circle cx="12" cy="12" r="3"></circle>
</svg>

// ❌ AVOID - External reference (CORS issues in dynamic content)
<svg><use href="/assets/icons-obsidian.svg#icon-eye"></use></svg>
```

---

## Icon Paths Reference

### Eye (View)

```svg
<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
<circle cx="12" cy="12" r="3"></circle>
```

### Pen (Edit)

```svg
<path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
```

### Trash (Delete)

```svg
<polyline points="3 6 5 6 21 6"></polyline>
<path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
```

### Plus (Add)

```svg
<line x1="12" y1="5" x2="12" y2="19"></line>
<line x1="5" y1="12" x2="19" y2="12"></line>
```

### Upload

```svg
<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
<polyline points="17 8 12 3 7 8"></polyline>
<line x1="12" y1="3" x2="12" y2="15"></line>
```

---

## Design Principles

1. **Icon-only for CRUD** — Secondary actions (View/Edit/Delete) use compact 36x36px icon buttons
2. **Icon+Text for CTAs** — Primary actions keep text labels for emphasis
3. **Inline SVGs in JS** — Avoid external sprite references in dynamic content
4. **Gold gradient badges** — Page title badges use premium gold gradient
5. **Consistency** — Same icons across all pages (Document Vault, Dashboard, RA Portal)
