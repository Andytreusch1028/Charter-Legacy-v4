# Charter Legacy - Launch Checklist

## ✅ COMPLETED (Ready to Deploy)

### Frontend Development

- [x] Landing page (charterlegacy.com)
  - [x] Hero section with privacy messaging
  - [x] Trust section (comparison, ROI, Legacy Timer demo)
  - [x] Product selection (Rule of Three)
  - [x] Pricing transparency
  - [x] Mobile-first responsive design
- [x] App subdomain (app.charterlegacy.com)
  - [x] Authentication page (Magic Link)
  - [x] LLC dashboard
  - [x] Will dashboard
  - [x] Offline page
- [x] PWA Capabilities
  - [x] Manifest.json
  - [x] Service worker
  - [x] App icons (192px, 512px)
  - [x] Offline support

### Branding & Design

- [x] Final logo (CL monogram - no shield)
- [x] Obsidian aesthetic (White Charter palette)
- [x] "Legacy Timer" messaging (empathetic language)
- [x] "Florida Hub" branding (flexible location)

### Backend Integration

- [x] Supabase setup guide created
- [x] Database schema designed (users, LLCs, wills)
- [x] Authentication code updated (Magic Link)
- [x] Dashboard code updated (data loading)
- [x] Security configured (Row Level Security)

---

## 🔄 YOUR ACTION ITEMS (Next 1-2 Hours)

### Step 1: Create Supabase Account (5 minutes)

1. Go to https://supabase.com
2. Sign up (free tier)
3. Create new project named "charter-legacy"
4. Choose region closest to your users
5. Save database password

### Step 2: Configure Authentication (5 minutes)

1. Dashboard → Authentication → Providers
2. Enable "Email" provider
3. Disable password authentication
4. Configure redirect URL: `https://app.charterlegacy.com`
5. (Optional) Customize email templates with Charter branding

### Step 3: Set Up Database (5 minutes)

1. Dashboard → SQL Editor
2. Open `SUPABASE-SETUP.md` (this project)
3. Copy the SQL schema (lines 30-90)
4. Paste into SQL Editor
5. Run query

### Step 4: Get API Keys (2 minutes)

1. Dashboard → Settings → API
2. Copy:
   - Project URL: `https://[your-project].supabase.co`
   - anon/public key: `eyJ...`
3. Open `app/config.js`
4. Replace placeholders with your values
5. Save file

### Step 5: Test Locally (15 minutes)

1. Refresh browser on `http://localhost:8000/app/auth.html`
2. Enter your email
3. Check email for magic link
4. Click link
5. Should redirect to dashboard

**If it doesn't work:**

- Check browser console for errors
- Verify API keys in `config.js`
- Check Supabase logs in Dashboard

### Step 6: Add Test Data (5 minutes)

1. Supabase Dashboard → SQL Editor
2. Run this (replace `[your-user-id]` with your actual auth user ID):

```sql
-- Get your user ID from Authentication → Users tab, copy the ID

-- Create profile
INSERT INTO profiles (id, first_name, last_name, user_type)
VALUES ('[your-user-id]', 'Your Name', 'LastName', 'llc');

-- Add test LLC
INSERT INTO llcs (user_id, product_type, llc_name, next_deadline, deadline_type)
VALUES ('[your-user-id]', 'founders_shield', 'My Test LLC', '2026-05-01', 'Annual Report');
```

3. Refresh dashboard - should see your data!

---

## 📋 TESTING CHECKLIST

### Local Testing

- [ ] Magic Link email arrives
- [ ] Magic Link redirects to dashboard
- [ ] Dashboard loads user data
- [ ] LLC dashboard shows correct info
- [ ] Will dashboard shows correct info (if applicable)
- [ ] Mobile menu works
- [ ] Sign out works

### Browser Testing

- [ ] Chrome (desktop)
- [ ] Chrome (mobile simulation)
- [ ] Firefox
- [ ] Safari (if on Mac)
- [ ] Edge

### PWA Testing

- [ ] Open in Chrome mobile
- [ ] See "Add to Home Screen" prompt
- [ ] Install PWA
- [ ] Launch from home screen (fullscreen mode)
- [ ] Test offline mode (disconnect wifi)

### Mobile Device Testing

- [ ] Test on actual iPhone (borrow if needed)
- [ ] Test on actual Android device
- [ ] Verify touch targets are finger-friendly
- [ ] Verify text is readable without zoom

---

## 🚀 DEPLOYMENT (After Testing)

### Domain Setup

1. Purchase domains:
   - `charterlegacy.com`
   - `app.charterlegacy.com` (subdomain)

2. Point DNS to hosting provider

### Hosting Options

**Option A: Netlify (Recommended for speed)**

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy landing
netlify deploy --dir=landing --prod

# Deploy app
netlify deploy --dir=app --prod
```

**Option B: Vercel**

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

**Option C: Traditional Server**

- Upload via FTP/SFTP
- Configure nginx/Apache
- Set up SSL certificates (Let's Encrypt)

### SSL Certificates

- Required for PWA (HTTPS only)
- Use Let's Encrypt (free) or hosting provider's SSL
- Configure for both domains

### Final Checks

- [ ] Landing page loads on production domain
- [ ] App subdomain works
- [ ] SSL certificate valid (green padlock)
- [ ] Magic Link emails arrive
- [ ] Dashboard data loads
- [ ] PWA installs on mobile

---

## 📊 LAUNCH DAY

### Pre-Launch (1 hour before)

- [ ] Create social media posts (if applicable)
- [ ] Prepare launch announcement
- [ ] Double-check all links work
- [ ] Test payment processing (if live)

### Launch

- [ ] Announce on social media
- [ ] Send email to waitlist (if you have one)
- [ ] Monitor error logs
- [ ] Watch analytics for traffic

### Post-Launch (First 24 hours)

- [ ] Monitor Supabase logs for errors
- [ ] Check email deliverability
- [ ] Respond to support requests
- [ ] Fix any critical bugs

---

## 🎯 SUCCESS METRICS

### Week 1

- Magic Link success rate > 95%
- Dashboard load time < 2 seconds
- Mobile responsiveness: No reported issues
- PWA installs: Track in analytics

### Month 1

- Lighthouse scores: All 90+
- User feedback: Collect and iterate
- Conversion rate: Landing → signup
- Retention: Dashboard logins per week

---

## 📱 PHASE 2: NATIVE COMPANION APP (Zenith Vault)

_Note: The native app is a post-launch retention tool, NOT a top-of-funnel acquisition tool._

### 1. App Scope & Requirements

- [ ] Read-only access to Heritage Vault (PDF viewing)
- [ ] Push Notifications for Privacy Shield Breaches
- [ ] Push Notifications for Registered Agent Service of Process
- [ ] Biometric Authentication (FaceID / TouchID) requirement for launch

### 2. Development Stack

- [ ] Evaluate React Native vs. Swift/Kotlin based on internal resource bandwidth
- [ ] Ensure Supabase Auth works seamlessly across Web and Native using identical JWT sessions
- [ ] Replicate Obsidian CSS aesthetics accurately in mobile native components

### 3. Apple App Store / Google Play Compliance

- [ ] Write UPL-safe descriptions for App Store submissions (avoiding terms like "Legal Services" or "Drafting")
- [ ] Ensure no digital goods/subscriptions are sold _inside_ the native app to avoid 30% platform tax (all commerce stays on Web)
- [ ] Prepare highly polished dark-mode screenshots for the app stores

---

## 📞 SUPPORT RESOURCES

### Supabase

- Docs: https://supabase.com/docs
- Discord: https://discord.supabase.com
- Status: https://status.supabase.com

### Deployment

- Netlify Docs: https://docs.netlify.com
- Vercel Docs: https://vercel.com/docs

### Your Stack

- Frontend: HTML/CSS/JS (Vanilla)
- Backend: Supabase (PostgreSQL + Auth + Storage)
- Hosting: Netlify/Vercel (or your choice)
- Domain: (your registrar)

---

## ✅ CURRENT STATUS

**Frontend:** ✅ 100% Complete  
**Backend:** ✅ Integration code complete, awaiting your Supabase setup  
**Design:** ✅ Final logo locked in  
**Documentation:** ✅ All guides created

**NEXT STEP:** Execute Supabase setup (Step 1-6 above)  
**TIME ESTIMATE:** 30-60 minutes  
**THEN:** Test locally, deploy to production

---

**You're 95% done. Ship it!**
