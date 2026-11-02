# SARKSH FOODS V27 Verification Report

Date: 31 October 2026

## Scope
- V26 visual design unchanged: Homepage, Our Story, Products, Recipes, Blog, Quality, Contact, Cart, and Customer Portal.
- Added: Google Apps Script + private Google Sheets backend, Node same-origin bridge, local configuration, setup documents, integration tests.
- Updated: server.mjs (backend selection / health), package.json (V27 scripts), START_WEBSITE.bat (V27 port and version), .gitignore (secrets and clasp config).

## Automated checks performed
- `npm run check` — PASS.
- `npm test` — 4 tests passed (legacy local commerce; Apps Script backend syntax; simulated Node-to-GAS full customer workflow; actual Apps Script datastore behavior with mock Google Sheets).
- SHA-256 compare against the extracted original V26 build — **77 / 77 frontend files identical**, including original HTML, JS, CSS and images.
- New V27 preservation manifest test — PASS.
- Local HTTP server smoke tests — **12 / 12** pages/assets returned 200; health endpoint reported V27 local-preview mode.
- Apps Script sheet formula-injection escape — tested.
- CSRF checks, scrypt password hashing, cart merging and order lifecycle — tested against simulated Apps Script API.

## Not executed (requires user account)
- Real Google Apps Script/Sheets authorization and deployment; no Apps Script deployment URL supplied.
- Real remote Google Sheet read/write acceptance.
- Live GitHub push; connected GitHub repository listing returned zero accessible repositories and no target repo provided.
- End-to-end browser validation on a public HTTPS Node host.

## Release gate
This release is a **source-complete, locally tested integration build**. It is not a live deployed production service until the user completes Steps 2–10 in SETUP_V27_WINDOWS.md. No payment gateway is enabled. Browser cookies are HTTP-only and same-origin; an HTTPS Node server is required for public account/cart functionality.
