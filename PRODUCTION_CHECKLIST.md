# SARKSH Foods V8.5 Production Checklist

## Existing backend — keep intact

- [x] Apps Script production endpoint is live
- [x] Backend health reports version `8.4`
- [x] Google Sheets database configured
- [x] Google Drive storage configured
- [x] Customer accounts configured
- [x] Admin hashed-password access configured
- [ ] Do **not** create a second database for this patch
- [ ] Do **not** redeploy Apps Script merely for V8.5 SEO/login-origin changes

## Login/session regression QA

- [ ] Open `https://www.sarkshfoods.in/account/`
- [ ] Create/sign in to a test customer
- [ ] Refresh the page and confirm the session remains active
- [ ] Navigate storefront → account and confirm the same session remains active
- [ ] Confirm `https://sarkshfoods.in/account/` redirects to the `www` origin
- [ ] Sign out and sign back in
- [ ] Test forgot-password flow
- [ ] Open `/admin/`, sign in, refresh and confirm the admin session remains active
- [ ] Confirm blocked browser storage returns a readable error rather than a blank/broken portal

## Production build

```powershell
$env:SITE_URL="https://www.sarkshfoods.in"
$env:VITE_API_BASE_URL="https://script.google.com/macros/s/AKfycbw_nR3t5gJfE5BOB4F1NduKDL1Mm10ad73BbnXRygL9pWDm-EwqmcegcVyswZimIYTtgA/exec"

npm install
npm run typecheck
npm run backend:health
npm run build:prod
npm run verify:prod
```

Expected backend remains `8.4`; frontend package is V8.5 (`0.8.6`).

## GitHub Pages / DNS

- [ ] Pages source = GitHub Actions
- [ ] Primary custom domain = `www.sarkshfoods.in`
- [ ] `www` CNAME points to `AmoghChowdary.github.io`
- [ ] Apex has only GitHub Pages A records (`185.199.108.153`, `.109.153`, `.110.153`, `.111.153`)
- [ ] No legacy apex A record such as `2.57.91.91`
- [ ] `https://sarkshfoods.in/...` redirects to `https://www.sarkshfoods.in/...`
- [ ] HTTPS enforced after GitHub certificate provisioning

## SEO/indexing artifact QA

- [ ] `/robots.txt` loads
- [ ] `/sitemap.xml` loads and uses only `https://www.sarkshfoods.in/...`
- [ ] `/sitemap-index.xml` loads
- [ ] `/sitemap-pages.xml` loads
- [ ] `/sitemap-products.xml` loads
- [ ] `/sitemap-images.xml` loads
- [ ] `/brand.json` loads
- [ ] `/product-catalog.json` loads
- [ ] `/llms.txt` and `/llms-full.txt` load
- [ ] `/.well-known/site-info.json` loads
- [ ] IndexNow key file loads from the site root
- [ ] post-deploy `Notify participating search engines` workflow job completes or reports only a non-blocking IndexNow error
- [ ] `/chilli-powder/` canonical is `https://www.sarkshfoods.in/chilli-powder/`
- [ ] public pages do not contain an apex canonical
- [ ] `/account/` and `/admin/` remain `noindex,nofollow,noarchive`
- [ ] `robots.txt` does not block those noindex pages, so crawlers can read the directive

## Search Console

- [ ] Submit `https://www.sarkshfoods.in/sitemap.xml`
- [ ] Optionally submit `https://www.sarkshfoods.in/sitemap-index.xml`
- [ ] Inspect/test/request indexing for `/`
- [ ] Inspect/test/request indexing for `/chilli-powder/`
- [ ] Inspect/test/request indexing for `/products/`
- [ ] Inspect/test/request indexing for `/about/`
- [ ] Confirm inspected canonical is the `www` URL
- [ ] Do not request indexing for `/account/` or `/admin/`

## Product/brand presentation

- [ ] homepage H1/lead binds SARKSH Foods to red chilli powder/chili powder
- [ ] chilli product page H1 is `SARKSH Foods Chilli Powder`
- [ ] official logo remains unchanged
- [ ] 3D intro remains unchanged
- [ ] no fabricated rating, review, price or stock schema

## Payments

- [ ] Razorpay remains deferred
- [ ] no card/CVV fields exist
- [ ] no payment credentials are stored in Sheets/Drive
