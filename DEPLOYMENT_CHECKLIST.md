# Deployment Pre-Flight Checklist

Before building for production (`npm run build`), ensure the following items are completed to maintain security and UPL compliance.

## Security & Authentication

- [ ] **REMOVE DEV ADMIN BYPASS**: Ensure `DEV_ADMIN_BYPASS` logic is disabled or fully stripped from `App.jsx` and `StaffLogin.jsx`. The overrides must _not_ be accessible in the production environment, even if users manipulate localStorage.
- [ ] **Verify Authentication Role Setup**: Ensure Supabase `auth.users` metadata rules are correctly configured in the production environment.
- [ ] **Check Real Analytics Endpoint**: Replace mock Java backend URLs in `useHeroVariant.js` with production URLs.

## UI / Aesthetics

- [ ] Steve Jobs Check: Confirm UI elements have no overlapping visual layers when zoom levels are 150%.
- [ ] Verify standard SVG glyph stroke widths in Dashboard/Admin consoles.

## Legal / UPL

- [ ] **The Auditor Check**: Final scan for words like "legal advice", "guaranteed", or "lawyer".
- [ ] Confirm "Folklore" language retains its UPL disclaimer in the footer.
