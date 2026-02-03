# Feature Isolation Rules

## Core Principle

**Never modify core application files when building new features.** Each new feature must be self-contained and isolated to prevent breaking existing functionality.

---

## Mandatory Rules

### 1. **Separate Configuration Files**

- ❌ **NEVER** add feature-specific data to `config.js`
- ✅ **ALWAYS** create `feature-name-config.js` for new features
- ✅ Example: `legacy-will-config.js`, `ra-portal-config.js`

### 2. **Separate JavaScript Files**

- ❌ **NEVER** modify existing core JS files (`dashboard.js`, `auth.js`, etc.)
- ✅ **ALWAYS** create new JS files for feature logic
- ✅ Example: `heir-dashboard.js`, `vault-transition.js`

### 3. **Separate CSS Files**

- ❌ **NEVER** add feature styles to `app.css`
- ✅ **ALWAYS** create `feature-name.css` for feature-specific styles
- ✅ Example: `legacy-will.css`, `wizard-premium.css`

### 4. **Separate HTML Pages**

- ✅ Create standalone HTML pages for new features
- ✅ Link to them from main dashboard, don't embed
- ✅ Example: `heir-portal.html`, `will-management.html`

### 5. **Separate Data Structures**

- ❌ **NEVER** add mock data arrays to core config
- ✅ **ALWAYS** create separate config files with their own `window.FEATURE_CONFIG`
- ✅ Example:
  ```javascript
  // legacy-will-config.js
  const LEGACY_WILL_CONFIG = {
      MOCK_WILLS: [...],
      MOCK_HEIRS: [...]
  };
  window.LEGACY_WILL_CONFIG = LEGACY_WILL_CONFIG;
  ```

---

## File Organization Pattern

```
app/
├── scripts/
│   ├── config.js                    ← CORE - Never modify for features
│   ├── auth.js                      ← CORE - Never modify
│   ├── dashboard.js                 ← CORE - Never modify
│   │
│   ├── legacy-will-config.js        ← Feature config
│   ├── heir-dashboard.js            ← Feature logic
│   └── vault-transition.js          ← Feature logic
│
├── styles/
│   ├── app.css                      ← CORE - Never modify for features
│   ├── legacy-will.css              ← Feature styles
│   └── wizard-premium.css           ← Feature styles
│
├── dashboard-llc.html               ← CORE - Main dashboard
├── heir-portal.html                 ← Feature page
├── heir-dashboard.html              ← Feature page
└── will-management.html             ← Feature page
```

---

## Integration Pattern

### ✅ Correct Way to Add a Feature

1. **Create feature config file**:

   ```javascript
   // scripts/legacy-will-config.js
   const LEGACY_WILL_CONFIG = {
     /* feature data */
   };
   window.LEGACY_WILL_CONFIG = LEGACY_WILL_CONFIG;
   ```

2. **Create feature pages**:

   ```html
   <!-- heir-portal.html -->
   <script src="scripts/config.js"></script>
   <!-- Core config -->
   <script src="scripts/legacy-will-config.js"></script>
   <!-- Feature config -->
   <script src="scripts/heir-portal.js"></script>
   <!-- Feature logic -->
   ```

3. **Link from main dashboard**:
   ```html
   <!-- dashboard-llc.html -->
   <a href="will-management.html" class="feature-link"> Legacy Will </a>
   ```

### ❌ Wrong Way (What We Did)

1. ~~Added `MOCK_WILLS` to core `config.js`~~ ← **BROKE THE APP**
2. ~~Added `MOCK_OA_TEMPLATES` with template syntax to `config.js`~~ ← **SYNTAX ERROR**
3. ~~Modified core dashboard files~~ ← **RISKY**

---

## Testing Checklist

Before committing a new feature:

- [ ] Core dashboard still loads without errors
- [ ] Core `config.js` is unchanged
- [ ] Core CSS files are unchanged
- [ ] Core JS files are unchanged
- [ ] Feature works in isolation
- [ ] Feature can be disabled by removing its files without breaking core app

---

## Emergency Rollback

If a feature breaks the core app:

1. **Restore core config**:

   ```powershell
   git checkout HEAD -- app/scripts/config.js
   ```

2. **Remove feature files** (they're untracked, so just delete):

   ```powershell
   Remove-Item app/scripts/feature-*.js
   Remove-Item app/styles/feature-*.css
   ```

3. **Hard refresh browser**: `Ctrl + Shift + R`

---

## Feature Examples

### Good Isolation Examples:

- ✅ `heir-portal.html` + `heir-portal.js` + `legacy-will.css`
- ✅ `formation-wizard.html` + `oa-builder.js` + `wizard-premium.css`
- ✅ `ra-portal.html` + `ra-portal.js` + separate config

### Bad Examples (Avoid):

- ❌ Adding `MOCK_WILLS` to core `config.js`
- ❌ Modifying `dashboard.js` to add feature logic
- ❌ Adding feature styles to `app.css`

---

## Rationale

**Why isolate features?**

1. **Safety**: Core app continues working even if feature has bugs
2. **Debugging**: Easy to identify which feature caused an issue
3. **Rollback**: Can remove feature without affecting core
4. **Testing**: Can test feature independently
5. **Collaboration**: Multiple features can be developed in parallel
6. **Deployment**: Can deploy features incrementally

---

## Enforcement

**Before any commit:**

1. Check `git status`
2. If `config.js`, `app.css`, `dashboard.js`, or `auth.js` are modified for a feature → **STOP**
3. Refactor to use isolated files
4. Commit only when core files are unchanged

---

## Exception Cases

**Only modify core files for:**

- Bug fixes in core functionality
- Performance improvements to core
- Security patches
- Refactoring core architecture

**Never modify core files for:**

- Adding new features
- Adding mock data
- Adding feature-specific styles
- Adding feature-specific logic

---

**Last Updated**: 2026-02-03  
**Reason**: Legacy Will feature accidentally broke core dashboard by modifying `config.js`
