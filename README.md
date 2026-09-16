# SARKSH Foods V8.3 Production

Production domain: **https://sarkshfoods.in**

V8.3 keeps the approved SARKSH Foods customer-facing design and adds the production data/control layer:

- GitHub Pages + GitHub Actions deployment
- Google Apps Script API
- Google Sheets operational database
- Google Drive product-media storage
- Google Sign-In protected `/admin/` portal
- admin email notifications
- Products / Orders / Enquiries / Websites monitoring
- product image uploads to Drive
- website health checks
- admin audit logging
- production SEO and sitemap generation

Authorized admin account:

`amoghchowdaryamaraneni@gmail.com`


## Production backend

The production Google Apps Script endpoint is already wired into the GitHub Actions deployment:

`https://script.google.com/macros/s/AKfycbw_nR3t5gJfE5BOB4F1NduKDL1Mm10ad73BbnXRygL9pWDm-EwqmcegcVyswZimIYTtgA/exec`

Do not add it as a GitHub secret. The remaining required production configuration for the admin portal is `GOOGLE_OAUTH_CLIENT_ID`.

## Local website test

```powershell
npm install
npm run dev
```

Customer site: `http://localhost:5173/`

Admin route: `http://localhost:5173/admin/`

The admin route requires:

- the deployed Apps Script endpoint already wired into the production workflow
- a Google OAuth Web Client ID in `VITE_GOOGLE_CLIENT_ID`
- `http://localhost:5173` listed as an Authorized JavaScript origin in Google Cloud

## Local production build verification

```powershell
npm run typecheck
npm run backend:health
npm run build
npm run preview
```

## GitHub Pages production

The workflow is `.github/workflows/deploy-pages.yml`.

Configure:

- Production Apps Script endpoint is already wired into `.github/workflows/deploy-pages.yml`
- GitHub Variable `GOOGLE_OAUTH_CLIENT_ID`
- optional GitHub Variable `GOOGLE_SITE_VERIFICATION`

The workflow builds with `SITE_URL=https://sarkshfoods.in`, validates SEO, verifies `/admin/` remains noindex, and deploys `dist/` to GitHub Pages.

See:

- `apps-script/DEPLOYMENT.md`
- `ADMIN_BACKEND_SETUP.md`
- `GITHUB_PAGES_DOMAIN_SETUP.md`
- `PRODUCTION_CHECKLIST.md`
- `SEO_STRATEGY.md`
