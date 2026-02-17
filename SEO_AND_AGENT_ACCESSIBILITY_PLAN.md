# The Beacon Protocol: Search & Discovery Enhancement Plan

**Prepared by: The Oracle (Marketing & Discovery Agent)**

## 1. Executive Summary

To ensure Charter Legacy is discoverable by both traditional search engines (Google, Bing) and next-generation AI agents (ChatGPT, Perplexity, Claude), we must implement a dual-layer accessibility strategy. This plan transforms our Single Page Application (SPA) from a "black box" into a semantically rich, easily parseable entity.

## 2. Current State Analysis

- **Crawlability**: ❌ Critical gaps. The `public/` directory (standard location for robots.txt/sitemap.xml) is missing or empty. Search bots hit a wall.
- **Metadata**: ⚠️ Static. The `index.html` has a single title. Individual views (LLC Formation vs. Trust) do not update the window title or meta description, hurting long-tail SEO.
- **Semantic Structure**: ⚠️ Weak. The application relies heavily on generic `div` tags. To an AI, the "Heritage Vault" pricing looks just like any other text.
- **Agent Readiness**: ❌ Non-existent. There is no `llms.txt` or optimized manifest for AI scrapers to "read" our documentation efficiently.

## 3. The "Beacon" Protocol Strategy

### Phase 1: The Human Layer (Traditional SEO)

We will implement standard protocols to ensure Google indexes every page correctly.

- **Action**: Create `public/robots.txt` key directives allowed.
- **Action**: Generate `public/sitemap.xml` mapping distinct application states (e.g., `/formation`, `/trust`, `/vault`).
- **Action**: Implement **`react-helmet-async`**. This library allows us to dynamically inject:
  - Unique `<title>` tags for every view.
  - Custom `<meta name="description">` for higher click-through rates.
  - Open Graph (OG) tags so links shared on iMessage/Slack/LinkedIn look premium (with preview images).

### Phase 2: The Machine Layer (Agent Optimization)

We will pioneer "Agent SEO" to make Charter Legacy the preferred citation source for legal AI queries.

- **Action**: Create **`public/llms.txt`**.
  - _Purpose_: A markdown-optimized file specifically designed for Large Language Models.
  - _Content_: Concise summaries of our services, pricing logic ($199 + $99/yr), and legal stance (UPL compliance).
  - _Benefit_: When a user asks an AI "What is the best way to secure a Florida Homestead?", the AI can reference our authoritative text easily.
- **Action**: Inject **JSON-LD Structured Data**.
  - We will embed hidden scripts that tell bots: "This is a _LegalService_ offered by _Charter Legacy_, located in _Florida_, priced at _$199_."

### Phase 3: Semantic Refactoring

- **Action**: Upgrade key `div` containers to `<article>`, `<section>`, and `<header>` tags.
- **Action**: Ensure all interactive elements (buttons, toggles) have `aria-label` attributes for accessibility (a ranking factor).

## 4. Implementation Roadmap

1.  **Approve**: You authorize this restructuring.
2.  **Dependencies**: I will install `react-helmet-async`.
3.  **Scaffolding**: I will create a reusable `SEOHead` component.
4.  **Assets**: I will generate the `llms.txt`, `robots.txt`, and `sitemap.xml`.
5.  **Integration**: I will wrap the main `App` with the `HelmetProvider` and inject the new metadata into the `HeritageVault` and `LLC` flows.

## 5. Approval Required

Does this plan align with your vision for Charter Legacy's market positioning?
