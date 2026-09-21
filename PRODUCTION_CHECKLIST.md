# SARKSH Foods V9.0 Production Checklist

## Backend — keep intact

- [x] Apps Script production endpoint is live
- [x] Backend health reports version `8.4`
- [x] Google Sheets database configured
- [x] Google Drive storage configured
- [x] Customer accounts configured
- [x] Admin hashed-password access configured
- [ ] Do not create a second database for V9.0
- [ ] Do not redeploy Apps Script unless backend code itself changes

## V9.0 public experience

- [ ] Homepage uses a full-width red background with no exposed side bars
- [ ] Product photograph and the three product tiles align inside one visual stage
- [ ] Header, sections, cards and footer use one red/white customer-facing system
- [ ] Homepage remains clear at desktop, tablet and mobile widths
- [ ] Products, Chilli Powder, Business Orders, About, Contact, Pan-India and Privacy pages match the same public theme
- [ ] Public wording uses customer-friendly language
- [ ] Official logo remains unchanged
- [ ] 3D opening animation remains unchanged

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

Expected backend remains `8.4`; website package is V9.0 (`0.9.0`).

## Customer account checks

- [ ] Sign in at `https://www.sarkshfoods.in/account/`
- [ ] Refresh and confirm the session remains active
- [ ] Add/edit a delivery address
- [ ] Place a test order and confirm it appears in the private Bookings sheet
- [ ] Test sign out and forgot-password flow
- [ ] Confirm `/account/` remains `noindex,nofollow,noarchive`

## GitHub Pages / domain

- [ ] Pages source = GitHub Actions
- [ ] Primary custom domain = `www.sarkshfoods.in`
- [ ] `www` CNAME points to `AmoghChowdary.github.io`
- [ ] Apex has only GitHub Pages A records (`185.199.108.153`, `.109.153`, `.110.153`, `.111.153`)
- [ ] HTTPS enforced

## SEO / indexing

- [ ] `/robots.txt` loads
- [ ] `/sitemap.xml` loads and uses `https://www.sarkshfoods.in/...`
- [ ] `/sitemap-index.xml`, `/sitemap-pages.xml`, `/sitemap-products.xml` and `/sitemap-images.xml` load
- [ ] `/brand.json` and `/product-catalog.json` load
- [ ] `/llms.txt`, `/llms-full.txt` and `/.well-known/site-info.json` load
- [ ] `/chilli-powder/` canonical uses the `www` domain
- [ ] `/account/` and `/admin/` remain noindex
- [ ] No fabricated price, rating, review or stock information is added

## Search Console

- [ ] Submit `https://www.sarkshfoods.in/sitemap.xml`
- [ ] Request indexing for `/`, `/chilli-powder/`, `/products/` and `/about/`
- [ ] Confirm the selected canonical is the `www` URL
