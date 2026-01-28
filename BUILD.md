# Charter Legacy - Production Build Guide

## Pre-Build Checklist

✅ **Architecture Complete**

- Two-domain structure: charterlegacy.com (landing) + app.charterlegacy.com (product)
- Mobile-first responsive design (320px → 1920px+)
- PWA capabilities (manifest, service worker, offline support)

✅ **Branding Updated**

- "Legacy Timer" (was Dead Man's Switch) - empathetic messaging
- "Florida Hub" (was DeLand Hub) - flexible branding

✅ **Assets Created**

- Obsidian Shield logo (SVG)
- PWA icons (192x192, 512x512)
- Offline page

---

## Build Process

### 1. Asset Optimization

**Icons:**

- Convert generated icons to PNG format
- Place in `/assets/` directory:
  - `icon-192.png` (192x192)
  - `icon-512.png` (512x512)
  - `apple-touch-icon.png` (180x180 for iOS)

**Optional (Production):**

- Minify CSS: `landing/styles/landing.css`, `app/styles/app.css`
- Minify JavaScript: `landing/scripts/landing.js`, `app/scripts/auth.js`, `app/scripts/dashboard.js`
- Optimize SVG logo file size

### 2. Deployment Structure

```
Production Deployment:
├── charterlegacy.com/
│   ├── index.html (landing page)
│   ├── styles/
│   │   └── landing.css
│   ├── scripts/
│   │   └── landing.js
│   └── assets/ (shared)
│       ├── logo-obsidian-shield.svg
│       ├── icon-192.png
│       └── icon-512.png
│
└── app.charterlegacy.com/
    ├── auth.html
    ├── dashboard-llc.html
    ├── dashboard-will.html
    ├── offline.html
    ├── manifest.json
    ├── service-worker.js
    ├── styles/
    │   └── app.css
    ├── scripts/
    │   ├── auth.js
    │   └── dashboard.js
    └── assets/ (shared)
```

### 3. Environment Configuration

**DNS Settings:**

- `charterlegacy.com` → Marketing server
- `app.charterlegacy.com` → Product server (or same server, different route)

**SSL Certificates:**

- Required for both domains (PWA requires HTTPS)
- Use Let's Encrypt or your hosting provider's SSL

**Server Configuration:**

- Enable CORS if domains are on different servers
- Set proper MIME types for PWA (`application/manifest+json`)
- Enable service worker scope

### 4. Backend Integration Points

**Authentication API:**

```javascript
POST /api/auth/send-magic-link
Body: { email: string }
Response: { success: boolean }

POST /api/auth/verify
Body: { token: string }
Response: {
  sessionToken: string,
  userName: string,
  userType: 'llc' | 'will'
}
```

**Dashboard Data API:**

```javascript
GET /api/dashboard/llc
Headers: { Authorization: Bearer <sessionToken> }
Response: {
  llcStatus: string,
  privacyShield: string,
  nextDeadline: string
}

GET /api/dashboard/will
Headers: { Authorization: Bearer <sessionToken> }
Response: {
  willStatus: string,
  legacyTimerStatus: string,
  lastCheckIn: string
}
```

---

## Testing Checklist

### Pre-Deployment Testing

- [ ] Test landing page on Chrome, Safari, Firefox, Edge
- [ ] Test responsive breakpoints (320px, 768px, 1024px)
- [ ] Test authentication flow end-to-end
- [ ] Test PWA installation on iOS Safari
- [ ] Test PWA installation on Android Chrome
- [ ] Test offline functionality
- [ ] Verify all "Legacy Timer" branding is consistent
- [ ] Verify all "Florida Hub" branding is consistent
- [ ] Test all CTAs route correctly (landing → app)
- [ ] Test mobile menu on dashboards

### Post-Deployment Testing

- [ ] Verify SSL certificates on both domains
- [ ] Test cross-domain navigation (charterlegacy.com → app.charterlegacy.com)
- [ ] Verify service worker registers correctly
- [ ] Test PWA manifest loads
- [ ] Verify icons display on home screen
- [ ] Test offline page appears when network fails
- [ ] Run Lighthouse audit (target: 90+ on all metrics)
- [ ] Test on actual iPhone device
- [ ] Test on actual Android device

---

## Deployment Commands

### Option 1: Static Hosting (Netlify, Vercel)

```bash
# Deploy landing
netlify deploy --dir=landing --prod --site=charterlegacy

# Deploy app
netlify deploy --dir=app --prod --site=app-charterlegacy
```

### Option 2: Traditional Server

```bash
# Upload via FTP/SFTP
scp -r landing/* user@server:/var/www/charterlegacy.com/
scp -r app/* user@server:/var/www/app.charterlegacy.com/
```

### Option 3: Docker (Full Stack)

```dockerfile
# Example: Combine frontend + backend
FROM nginx:alpine
COPY landing /usr/share/nginx/html/landing
COPY app /usr/share/nginx/html/app
COPY nginx.conf /etc/nginx/nginx.conf
```

---

## Performance Optimization (Post-Launch)

1. **Enable Compression:** Gzip/Brotli for HTML, CSS, JS
2. **CDN:** Serve static assets from CDN
3. **Lazy Loading:** Images and non-critical resources
4. **Code Splitting:** Separate vendor bundles from app code
5. **Cache Headers:** Set appropriate cache policies

---

## Monitoring (Post-Launch)

1. **Analytics:** Privacy-first analytics (aggregate only)
2. **Error Tracking:** Monitor JavaScript errors
3. **Performance:** Core Web Vitals monitoring
4. **Uptime:** Domain/server health checks

---

## Files Ready for Production

### Landing (charterlegacy.com)

✅ [landing/index.html](file:///C:/Charter-Legacy%20v4/landing/index.html)
✅ [landing/styles/landing.css](file:///C:/Charter-Legacy%20v4/landing/styles/landing.css)
✅ [landing/scripts/landing.js](file:///C:/Charter-Legacy%20v4/landing/scripts/landing.js)

### App (app.charterlegacy.com)

✅ [app/auth.html](file:///C:/Charter-Legacy%20v4/app/auth.html)
✅ [app/dashboard-llc.html](file:///C:/Charter-Legacy%20v4/app/dashboard-llc.html)
✅ [app/dashboard-will.html](file:///C:/Charter-Legacy%20v4/app/dashboard-will.html)
✅ [app/offline.html](file:///C:/Charter-Legacy%20v4/app/offline.html)
✅ [app/styles/app.css](file:///C:/Charter-Legacy%20v4/app/styles/app.css)
✅ [app/scripts/auth.js](file:///C:/Charter-Legacy%20v4/app/scripts/auth.js)
✅ [app/scripts/dashboard.js](file:///C:/Charter-Legacy%20v4/app/scripts/dashboard.js)
✅ [app/manifest.json](file:///C:/Charter-Legacy%20v4/app/manifest.json)
✅ [app/service-worker.js](file:///C:/Charter-Legacy%20v4/app/service-worker.js)

### Assets (Shared)

✅ [assets/logo-obsidian-shield.svg](file:///C:/Charter-Legacy%20v4/assets/logo-obsidian-shield.svg)
⏳ `assets/icon-192.png` (Generated, needs conversion)
⏳ `assets/icon-512.png` (Generated, needs conversion)

---

## Next Steps

1. ✅ Convert generated PNG icons and place in `/assets/`
2. 🔄 Test on local server (currently running on port 8000)
3. 🔄 Set up backend API endpoints
4. 🔄 Deploy to staging environment
5. 🔄 Run full testing suite
6. 🔄 Deploy to production

**Status:** Ready for deployment after backend API integration
