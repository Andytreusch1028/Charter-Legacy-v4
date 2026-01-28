# Charter Legacy - Your LLC. Your Privacy.

> Premium business formation and estate planning with privacy-first approach

---

## 🎯 Project Overview

Charter Legacy is a sovereign business formation and legacy planning service focused on privacy, empowerment, and generational wealth transfer.

### Products

1. **Founder's Shield** ($249) - LLC formation with Privacy Shield
2. **Licensed Professional** ($499-$599) - Medical PLLC or Trade Professional LLC
3. **The Legacy Will** ($399) - Will with Legacy Timer (automatic successor access)

---

## 📁 Project Structure

```
Charter-Legacy v4/
├── landing/                  # Marketing domain (charterlegacy.com)
│   ├── index.html           # Landing page
│   ├── styles/landing.css   # Mobile-first responsive CSS
│   └── scripts/landing.js   # CTA handlers
│
├── app/                     # Product domain (app.charterlegacy.com)
│   ├── auth.html           # Magic Link authentication
│   ├── dashboard-llc.html  # LLC customer dashboard
│   ├── dashboard-will.html # Will customer dashboard
│   ├── offline.html        # PWA offline page
│   ├── manifest.json       # PWA manifest
│   ├── service-worker.js   # Offline caching
│   ├── config.js           # Supabase credentials
│   ├── styles/app.css      # Dashboard styles
│   └── scripts/
│       ├── auth.js         # Supabase Magic Link auth
│       └── dashboard.js    # Dashboard data loading
│
├── assets/                  # Shared assets
│   ├── logo-charter-legacy.svg  # Final monogram logo
│   ├── icon-192.png        # PWA icon (192x192)
│   ├── icon-512.png        # PWA icon (512x512)
│   └── apple-touch-icon.png
│
├── AIL/                     # AI Intent Language (PBP)
│   └── charter-legacy.pbp.yaml
│
├── .antigravity/           # Configuration & product data
│   └── product-nodes.json
│
└── Documentation/
    ├── BUILD.md            # Production build guide
    ├── SUPABASE-SETUP.md   # Backend setup instructions
    ├── LAUNCH-CHECKLIST.md # Pre-launch checklist
    └── README.md           # This file
```

---

## 🚀 Quick Start

### 1. Local Development

```bash
# Serve landing page
python -m http.server 8000 --directory landing
# Open http://localhost:8000

# Serve app pages
python -m http.server 8001 --directory app
# Open http://localhost:8001/auth.html
```

### 2. Backend Setup

Follow [`SUPABASE-SETUP.md`](file:///C:/Charter-Legacy%20v4/SUPABASE-SETUP.md) to:

- Create Supabase project
- Enable Magic Link authentication
- Run database schema
- Add your API keys to `app/config.js`

### 3. Testing

See [`LAUNCH-CHECKLIST.md`](file:///C:/Charter-Legacy%20v4/LAUNCH-CHECKLIST.md) for:

- Local testing procedures
- Browser compatibility tests
- PWA installation tests
- Mobile device testing

---

## 🎨 Design System

### Colors (White Charter Palette)

- **Canvas:** `#FFFFFF` - Pure white background
- **Obsidian Ink:** `#1D1D1F` - Primary text/buttons
- **Gold Leaf:** `#D4AF37` - Accents/highlights
- **Charcoal:** `#2C2C2E` - Secondary text
- **Mist:** `#F5F5F7` - Borders/dividers

### Typography

- **Font:** System fonts (-apple-system, BlinkMacSystemFont, 'Segoe UI')
- **Fluid sizing:** clamp() for responsive text
- **Base:** 16px

### Radius

- **Small:** 12px (inputs, small cards)
- **Medium:** 24px (larger cards)
- **Large:** 52px (primary CTAs - hardware-like)

### Logo

- **Design:** CL monogram (no shield)
- **Style:** Luxury brand aesthetic
- **Files:** SVG + PNG (192px, 512px)

---

## 🛠 Tech Stack

### Frontend

- **HTML5** - Semantic structure
- **CSS3** - Mobile-first responsive
- **Vanilla JavaScript** - No frameworks, lightweight
- **PWA** - Manifest + Service Worker

### Backend

- **Supabase** - PostgreSQL database + Auth + Storage
- **Authentication:** Magic Link (no passwords)
- **Database:** PostgreSQL with Row Level Security
- **Storage:** Document vault (future)

### Deployment

- **Hosting:** Netlify/Vercel (recommended) or traditional server
- **Domains:** charterlegacy.com + app.charterlegacy.com
- **SSL:** Required (Let's Encrypt or hosting provider)

---

## 📱 Mobile-First Design

- **Breakpoints:** 320px → 768px → 1024px
- **Touch targets:** 44px minimum (Apple HIG)
- **PWA capabilities:** Add to Home Screen, offline support
- **Tested on:** Chrome, Safari, Firefox, Edge

---

## 🔐 Security

- **No passwords:** Magic Link authentication only
- **Row Level Security:** Users can only access their own data
- **HTTPS required:** SSL on both domains
- **API keys:** Client-safe (anon key with limited permissions)
- **Session tokens:** Auto-expire

---

## 🧪 Testing

### Automated

- Lighthouse audit (target: 90+ all metrics)
- Browser compatibility tests

### Manual

- Magic Link flow end-to-end
- Dashboard data loading
- PWA installation
- Offline mode
- Mobile device testing (iPhone, Android)

---

## 📊 Success Metrics

### Performance

- Lighthouse scores: 90+ (Performance, Accessibility, SEO, PWA)
- Page load: < 2 seconds
- Magic Link success rate: > 95%

### User Experience

- Mobile responsiveness: 100% (no horizontal scroll)
- Touch target compliance: 100% (min 44px)
- PWA install rate: Track in analytics

---

## 🚢 Deployment

See [`BUILD.md`](file:///C:/Charter-Legacy%20v4/BUILD.md) for:

- Asset optimization
- Deployment structure
- Environment configuration
- Backend integration
- Monitoring setup

---

## 📝 Documentation

- **BUILD.md** - Production build and deployment
- **SUPABASE-SETUP.md** - Backend setup (Supabase)
- **LAUNCH-CHECKLIST.md** - Pre-launch verification
- **assets/LOGO-FINAL.md** - Logo usage guidelines

---

## 🎯 Brand Voice

### Key Messages

- "Your LLC. Your privacy. Not your home address on Google."
- "Legacy Timer: Your family gets access automatically"
- "Florida Hub protection" (not DeLand - flexible)
- Focus on **legacy and sovereignty**, not security

### Language Guidelines

- Empathetic (Legacy Timer, not Dead Man's Switch)
- Confident (monogram logo, no shield)
- Premium (White Charter aesthetic)
- UPL-compliant (no legal advice)

---

## 👥 Support

### For Development Issues

- Check browser console for errors
- Review Supabase logs
- Test with sample data first

### For Deployment Issues

- Verify DNS settings
- Check SSL certificate
- Test cross-domain navigation

---

## 📄 License

Proprietary - Charter Legacy LLC

---

## ✅ Status

**Frontend:** ✅ Complete  
**Backend Integration:** ✅ Code complete (awaiting Supabase setup)  
**Design:** ✅ Final logo locked in  
**Documentation:** ✅ Complete

**Next Step:** Execute Supabase setup → Test → Deploy

---

**Built with precision. Shipped with confidence.**
