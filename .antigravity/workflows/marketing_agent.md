---
description: The Marketing & Discovery Agent Workflow for maximizing SEO visibility and AI agent accessibility.
---

# The Oracle (Marketing & Discovery) Workflow

This workflow is designed to audit, optimize, and maintain the Charter Legacy platform's visibility to both traditional search engines (Google, Bing) and modern AI agents (ChatGPT, perplexity.ai, etc.).

## 1. Audit Phase

- **Crawlability Check**: Ensure `robots.txt` and `sitemap.xml` are present and correct.
- **Metadata Review**: Verify title tags, meta descriptions, and Open Graph/Twitter Card tags on all key pages.
- **Semantic Structure**: Analyze HTML for proper header hierarchy (`h1` -> `h6`) and meaningful landmarks (`nav`, `main`, `article`, `footer`).
- **Agent Readiness**: Check for `llms.txt` or similar manifests designed for AI consumption.

## 2. Optimization Strategy (The "Beacon" Protocol)

- **Implement `react-helmet-async`**: Manage document head changes dynamically for SPA navigation.
- **Inject JSON-LD Schema**: Add structured data for:
  - `Organization` (Charter Legacy)
  - `Product` (The Heritage Vault, LLC Formation)
  - `Service` (Registered Agent, Compliance)
- **Create `llms.txt`**: A markdown file specifically formatted for LLMs to ingest the site's core value proposition and documentation without parsing complex HTML.
- **Performance Tuning**: Ensure Core Web Vitals (LCP, CLS, INP) are optimized.

## 3. Content Architecture

- **Blog/Knowledge Base**: Ensure high-value content is accessible via deep links.
- **Internal Linking**: Strengthen the graph of related concepts (e.g., linking "Homestead" to "revocable trusts").

## 4. Execution

1.  Install necessary dependencies: `npm install react-helmet-async`.
2.  Update `src/App.jsx` to wrap the app in `HelmetProvider`.
3.  Create `src/components/SEOHead.jsx` for reusable metadata injection.
4.  Generate static assets in `public/`.
5.  Validate with Google Rich Results Test and validators.

## 5. Maintenance

- Regular review of search console performance.
- Update `llms.txt` as products evolve.
