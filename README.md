# SARKSH Foods V8.4 — Customer Portal Production Candidate

Production domain: **https://sarkshfoods.in**

V8.4 preserves the approved SARKSH Foods storefront, SEO, GitHub Pages workflow, Google Sheets/Drive backend, admin dashboard and 3D brand intro while adding the customer-account layer.

## V8.4 additions

- `/account/` customer portal
- customer registration and sign-in
- salted, iterated password hashing in Apps Script; plain-text passwords are never stored
- hashed customer/admin session tokens
- saved delivery addresses with default-address support
- product ordering from the customer portal
- past deliveries and full order history
- one-click reorder using a saved address
- password reset code by email; reset secrets are stored only as hashes
- payment section prepared for Razorpay, intentionally disabled in this release
- registered Customers view in Admin
- expanded Google Sheets database for Customers, Addresses, Sessions and Password Resets
- no Google Cloud OAuth Client ID requirement
- Apps Script generated-password admin access instead of Google Identity Services

Authorized admin email:

`amoghchowdaryamaraneni@gmail.com`

## Production backend

The website is wired to:

`https://script.google.com/macros/s/AKfycbw_nR3t5gJfE5BOB4F1NduKDL1Mm10ad73BbnXRygL9pWDm-EwqmcegcVyswZimIYTtgA/exec`

After replacing the Apps Script code with the V8.4 `apps-script/Code.gs`, update the existing Web App deployment to a new version so the `/exec` URL remains unchanged.

Then run these two functions once from the Apps Script editor:

1. `setupProductionBackend()` — upgrades/creates the required Sheets and Drive structure.
2. `initializeAdminAccess()` — generates a strong admin password, stores only its salted hash, and emails the initial password to the configured admin address.

## Local test

```powershell
npm install
npm run dev
```

- Storefront: `http://localhost:5173/`
- Customer portal: `http://localhost:5173/account/`
- Admin: `http://localhost:5173/admin/`

## Production preflight

After the V8.4 Apps Script deployment is active:

```powershell
npm run typecheck
npm run backend:health
npm run build
npm run preview
```

`backend:health` deliberately fails if the live Apps Script backend is still V8.2/V8.3, if customer-account storage has not been configured, or if admin password access has not been initialized.

## GitHub Pages

`.github/workflows/deploy-pages.yml` builds for `https://sarkshfoods.in`, verifies the backend, validates the production artifact and deploys `dist/` through GitHub Pages.

No Google OAuth variable is required.

Optional repository variable:

`GOOGLE_SITE_VERIFICATION`

See `apps-script/DEPLOYMENT.md`, `ADMIN_BACKEND_SETUP.md`, `PRODUCTION_CHECKLIST.md` and `GITHUB_PAGES_DOMAIN_SETUP.md`.
