# SARKSH Foods V13 — Public Production Repository

This repository is intentionally limited to the public website, public assets, build tooling, and public search-discovery files.

## Finalized design
V13 preserves the finalized V11.2 homepage and public design. The production work in V13 is security, deployment, SEO/AEO/GEO, crawlability, and indexing support.

## What belongs in this public repository
- React/Vite frontend source
- Public product/brand images and icons
- `package.json`, `tsconfig.json`, Vite configuration
- GitHub Actions workflow
- SEO/AEO/GEO generation scripts
- Generated public sitemaps, `robots.txt`, `llms.txt`, structured-data files and crawler-discovery resources in the deployed artifact

## What must NOT be committed
- Google Apps Script source
- Real `.env` or `.env.production`
- Apps Script deployment URL hardcoded in source
- Google Sheet/Drive IDs
- passwords, password hashes, salts, peppers, tokens
- service-account JSON or OAuth/client secret files
- customer/order/enquiry local data

The production Apps Script endpoint is injected during GitHub Actions through the repository secret `VITE_API_BASE_URL`.

Important: because this is a browser application, the deployed API endpoint can still be observed in browser network traffic. The endpoint is not treated as an authentication secret. Security is enforced by the Apps Script backend's server-side validation, hashed credentials, sessions, and authorization checks.

## Required GitHub configuration
Repository secret:
- `VITE_API_BASE_URL` — deployed Apps Script `/exec` URL

Repository variables:
- `GOOGLE_SITE_VERIFICATION` — optional
- `INDEXNOW_KEY` — optional 8–128 character hexadecimal key for automated IndexNow submission

## Local development
For public UI-only local testing:

```powershell
npm install
npm run typecheck
npm run dev
```

For live-backend testing, set `VITE_API_BASE_URL` in the shell before starting Vite.

## Production validation
```powershell
$env:SITE_URL="https://www.sarkshfoods.in"
$env:VITE_API_BASE_URL="<private Apps Script deployment URL>"
npm run validate:prod
```
