# SARKSH FOODS V30 — verification and release report

## Reviewed input
Complete V29 GitHub Actions archive, including HTML/CSS/JS/assets, independent Node API, Google Apps Script datastore, tests, export scripts and existing GitHub Pages workflow. Compared existing repository workflow expectations: production Vite build + SEO + production backend-health stay in place.

## Confirmed fixes
- **Mobile:** measured 19px overflow at 390px and 49px overflow at 360px on the V29-style static homepage header; corrected through V30 CSS loaded by both the V30 Node server and GitHub Pages export for ≤440px.
- **Security:** rejected oversized login input before hashing, rejected foreign-origin enquiry submissions, added security response headers, and added map expiration cleanup.
- **Static deployment:** removed unused Node-commerce script and excluded all private/Node files from the Pages export.
- **SEO:** marked `/v30/` as a nonindexed duplicate-content preview (noindex), added page descriptions; the live root's SEO metadata and sitemap behavior were **not modified**.
- **DevOps:** removed `.ps1` deploy script and replaced instructions with plain PowerShell + Robocopy + Git; existing root Vite validation/deploy jobs remain in the single workflow.

## Executed checks
- `npm run check`: **PASS** (including preservation checks for 77 original approved V26 source frontend files).
- `npm test`: **6/6 PASS** (previous tests plus cross-origin, password input, size limit, private-file exposure and header test).
- `npm run security:verify`: **PASS**.
- `npm run pages:build && npm run pages:verify`: **PASS**, nine exported HTML pages, all direct local asset references and product/ingredient imagery mapped, no backend files or secrets in artifact.
- Browser sandbox: tested actual CSS and JS in isolated Chromium DOMs at widths 1440, 820, 390, 360 across 7 visual pages: **28/28 no horizontal overflow or page-script exceptions**. The environment blocks direct browser navigation to local HTTP URLs, so image-loading screenshots and live routing were **not** independently browser-tested; image paths/files were verified programmatically.
- Workflow syntax: YAML parsed and checked for main-branch trigger, Vite build, backend-health, SEO verification and V30 preview stage.

## Not verified here
- Live production Google Apps Script authorization, user registration, Sheets write/read and credentials.
- Live GitHub Actions runner output after you push, production domain/DNS, private GitHub Actions secrets, payment gateway operation.
- Real browser image paint/load performance and end-to-end behavior on real mobile devices.
- Comprehensive pentest or performance benchmarking on customer traffic.

## Release policy
This is a **verified static preview release**, not a drop-in replacement for the existing production store. The original root `/` and `/account/` continue to be built from the existing Vite source on `main`. The Node backend and Apps Script files are delivered as separately maintained sources and are **not deployed** by GitHub Pages.
