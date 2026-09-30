# SARKSH Foods V8.5 Production Endpoints

## Primary public website

`https://www.sarkshfoods.in/`

Legacy/apex requests should redirect to the primary `www` origin.

## Product SEO page

`https://www.sarkshfoods.in/chilli-powder/`

## Customer portal

`https://www.sarkshfoods.in/account/`

Private customer page; excluded from search indexing.

## Admin portal

`https://www.sarkshfoods.in/admin/`

Private administration page; excluded from search indexing.

## Google Apps Script backend

The production Apps Script Web App endpoint is intentionally **not stored in this public repository**. Configure it as the GitHub Actions secret `VITE_API_BASE_URL`.

The endpoint is embedded into the public frontend at build time, but keeping the deployment identifier out of source history avoids accidental coupling between public source and the private backend project.

## Health check

```powershell
npm run backend:health
```

V8.5 intentionally expects backend version `8.4`, with database/Drive configuration, customer-account storage and initialized admin hashed-password access.
