# SARKSH Foods V8.5 — Indexing & Login Reliability Patch

Primary production origin: **https://www.sarkshfoods.in**

V8.5 keeps the approved V8.4 storefront, customer portal, private Google Sheets/Drive backend, admin portal and 3D brand intro intact. This release concentrates on two production issues: **search-engine indexability/canonical consistency** and **customer/admin login reliability**.

## What V8.5 fixes

### 1. One production hostname

GitHub Pages currently serves the custom domain as `www.sarkshfoods.in`, while V8.4 generated canonical URLs, sitemap URLs and production checks for `sarkshfoods.in`.

V8.5 standardizes every public SEO signal on:

`https://www.sarkshfoods.in`

The apex host is treated only as a legacy/redirecting origin. This prevents competing canonical signals and keeps browser-scoped account/admin sessions on one hostname.

### 2. Customer/admin login hardening

- one canonical production hostname for browser sessions;
- safe `localStorage` / `sessionStorage` wrappers so blocked storage reports a useful error instead of failing unpredictably;
- shared Apps Script request transport with a 30-second timeout;
- clearer errors when Apps Script returns HTML, an invalid deployment page or a network failure;
- returned session tokens are validated before they are stored;
- login email addresses are normalized before submission.

The Apps Script backend remains **version 8.4**. V8.5 does not replace Google Sheets/Drive and does not introduce a new database.

## Search-engine files generated at build time

Production builds generate:

- `/robots.txt`
- `/sitemap.xml`
- `/sitemap-index.xml`
- `/sitemap-pages.xml`
- `/sitemap-products.xml`
- `/sitemap-images.xml`
- `/llms.txt`
- `/llms-full.txt`
- `/brand.json`
- `/product-catalog.json`
- `/.well-known/site-info.json`
- a public IndexNow ownership key file for participating search engines

The generated public HTML also contains crawl-first semantic content and structured data for the SARKSH Foods brand, OnlineStore/Organization, WebSite, WebPage, breadcrumbs and the chilli-powder Product entity. No fake price, rating, review or availability data is generated.

## Product/brand SEO focus

The site deliberately binds the entity **SARKSH Foods** to:

- SARKSH Foods Chilli Powder
- red chilli powder
- chilli powder / chili powder
- 1 kg chilli powder
- premium chilli powder in India
- household and commercial chilli-powder buying intent

The preferred product URL is:

`https://www.sarkshfoods.in/chilli-powder/`

`/products/chilli-powder/` remains functional but canonicalizes to `/chilli-powder/`.

## Production backend

The website remains wired to the existing Apps Script endpoint:

`https://script.google.com/macros/s/AKfycbw_nR3t5gJfE5BOB4F1NduKDL1Mm10ad73BbnXRygL9pWDm-EwqmcegcVyswZimIYTtgA/exec`

Expected backend health remains:

- backend version `8.4`
- Google Sheets configured
- Google Drive configured
- customer accounts configured
- admin hashed-password access configured

No Apps Script redeployment is required for the V8.5 frontend/indexing/login-origin patch. After GitHub Pages deploys successfully, the workflow also sends the changed public URLs to IndexNow for Bing and other participating engines. Google discovery continues through crawlable HTML, sitemaps and Search Console URL Inspection. The included Apps Script source only aligns future seeded URLs with the `www` hostname.

## Local production preflight

PowerShell:

```powershell
cd "C:\Users\MYPC\Desktop\Sarksh Foods\sarksh_foods_brand_v8_5"

$env:SITE_URL="https://www.sarkshfoods.in"
$env:VITE_API_BASE_URL="https://script.google.com/macros/s/AKfycbw_nR3t5gJfE5BOB4F1NduKDL1Mm10ad73BbnXRygL9pWDm-EwqmcegcVyswZimIYTtgA/exec"

npm install
npm run typecheck
npm run backend:health
npm run build:prod
npm run verify:prod
```

For ordinary local development:

```powershell
npm run dev
```

- Storefront: `http://localhost:5173/`
- Customer portal: `http://localhost:5173/account/`
- Admin: `http://localhost:5173/admin/`

## GitHub Pages

`.github/workflows/deploy-pages.yml` builds and validates for `https://www.sarkshfoods.in`, checks the V8.4 backend, generates the crawler artifacts, verifies canonical URLs/private-route controls and deploys `dist/` using GitHub Pages.

No Google OAuth variable is required.

Optional repository variable:

`GOOGLE_SITE_VERIFICATION`

See `SEO_STRATEGY.md`, `PRODUCTION_CHECKLIST.md`, `GITHUB_PAGES_DOMAIN_SETUP.md`, `CUSTOMER_PORTAL_SETUP.md` and `ADMIN_BACKEND_SETUP.md`.
