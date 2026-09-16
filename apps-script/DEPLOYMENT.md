# SARKSH Foods V8.4 Apps Script Deployment

This version upgrades the existing private Google Sheets/Drive backend with customer accounts and backend-managed admin authentication. Google Cloud Console OAuth is not required.

## 1. Update source

In the existing Apps Script project:

1. Replace `Code.gs` with this package's `apps-script/Code.gs`.
2. Replace/update `appsscript.json` with the included manifest.

Do not create a new Sheet manually.

## 2. Upgrade the database

Run from the Apps Script editor:

`setupProductionBackend()`

It preserves existing Sheets and adds missing columns/sheets automatically.

New sheets:

- Customers
- Customer Addresses
- Customer Sessions
- Password Resets
- Admin Sessions

It also creates private `AUTH_PEPPER` and `SESSION_PEPPER` Script Properties if absent.

## 3. Initialize admin password

Run:

`initializeAdminAccess()`

A strong generated password is emailed to:

`amoghchowdaryamaraneni@gmail.com`

Only its unique salt and iterated hash are stored. The raw password is not saved in Apps Script properties, Sheets, Drive or the website source.

If the password must be replaced later, run:

`resetAdminAccess()`

## 4. Update the existing web-app deployment

Apps Script → Deploy → Manage deployments → edit the current production Web App → select/create a new version → Deploy.

Settings remain:

- Execute as: Me
- Who has access: Anyone

`Anyone` is needed only so public customers can reach the API. It does not make Sheets/Drive public. Customer and admin private actions independently require valid backend sessions.

Keep the existing `/exec` URL:

`https://script.google.com/macros/s/AKfycbw_nR3t5gJfE5BOB4F1NduKDL1Mm10ad73BbnXRygL9pWDm-EwqmcegcVyswZimIYTtgA/exec`

## 5. Verify health

```powershell
npm run backend:health
```

Expected:

- Version: 8.4
- Google Sheets database: configured
- Google Drive storage: configured
- Customer accounts: configured
- Admin hashed-password access: configured

## Security model

- Google Sheets and Drive stay private.
- Public forms can create bookings/enquiries only.
- Customer passwords are salted and iteratively hashed; raw passwords are never stored.
- Customer/admin session tokens are stored only as hashes.
- Password reset codes are stored only as hashes and expire after 15 minutes.
- Admin password hash/salt stay in Script Properties, not the frontend.
- `/account/` and `/admin/` are excluded from sitemap/search indexing.
- Razorpay is not enabled yet and no card credentials are collected.
