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

`https://script.google.com/macros/s/AKfycbw_nR3t5gJfE5BOB4F1NduKDL1Mm10ad73BbnXRygL9pWDm-EwqmcegcVyswZimIYTtgA/exec`

The endpoint is an application gateway, not a database credential. Sensitive customer/admin operations require backend-issued session tokens. Google Sheets and Google Drive remain private.

## Health check

```powershell
npm run backend:health
```

V8.5 intentionally expects backend version `8.4`, with database/Drive configuration, customer-account storage and initialized admin hashed-password access.
