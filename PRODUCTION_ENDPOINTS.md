# SARKSH Foods V8.4 Production Endpoints

## Public website

`https://sarkshfoods.in`

## Customer portal

`https://sarkshfoods.in/account/`

Private customer page; excluded from search indexing.

## Admin portal

`https://sarkshfoods.in/admin/`

Private administration page; excluded from search indexing.

## Google Apps Script backend

`https://script.google.com/macros/s/AKfycbw_nR3t5gJfE5BOB4F1NduKDL1Mm10ad73BbnXRygL9pWDm-EwqmcegcVyswZimIYTtgA/exec`

The URL is a public API endpoint, not a database credential. Sensitive customer/admin operations require backend-issued session tokens. Google Sheets and Drive remain private.

## Health check

```powershell
npm run backend:health
```

V8.4 production expects backend version `8.4`, database/Drive configuration, customer-account storage and initialized admin hashed-password access.
