# SARKSH Foods V8.2 — Google Sheets + Google Drive Production Backend

This backend is designed for the static GitHub Pages frontend at **https://sarkshfoods.in**.

## What the backend stores

Google Sheets is the operational database. `setupProductionBackend()` creates these sheets:

- `Products`
- `Bookings`
- `Enquiries`
- `Websites`
- `Audit Log`

Google Drive is the file layer. The setup function creates:

- `SARKSH Foods Production/`
  - `Product Media/`
  - `Documents/`
  - `Exports/`
  - `SARKSH Foods Production Database` (Google Sheet)

The admin portal is **https://sarkshfoods.in/admin/** and is restricted to:

`amoghchowdaryamaraneni@gmail.com`

## 1. Create the Apps Script project

1. Go to Google Apps Script and create a standalone project.
2. Replace `Code.gs` with the project copy in `apps-script/Code.gs`.
3. Open **Project Settings → Show "appsscript.json" manifest file in editor**.
4. Replace the manifest with `apps-script/appsscript.json`.

## 2. Create the Google OAuth Web Client ID

The admin portal uses **Google Identity Services**. Create an OAuth 2.0 **Web application** client in Google Cloud Console.

Authorized JavaScript origins:

- `https://sarkshfoods.in`
- `https://www.sarkshfoods.in` (only if you will serve this hostname)
- `http://localhost:5173` (local admin testing)

Copy the Client ID. It looks similar to:

`1234567890-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx.apps.googleusercontent.com`

The same Client ID must be configured in both Apps Script and GitHub Actions.

## 3. Configure Apps Script properties

In Apps Script → **Project Settings → Script Properties**, add:

- `GOOGLE_CLIENT_ID` = the OAuth Web Client ID from step 2
- `ADMIN_EMAIL` = `amoghchowdaryamaraneni@gmail.com`

Do not put an OAuth client secret in the website. Google Identity Services only needs the public Web Client ID.

## 4. Create the Sheets/Drive database

From the Apps Script editor, select and run:

`setupProductionBackend`

Authorize the requested Google Sheets, Google Drive, mail, and external-request permissions.

The function creates the complete database and Drive folder structure and seeds:

- SARKSH Foods Chilli Powder — 1 kg
- https://sarkshfoods.in as the first monitored website

The function stores the generated IDs in Script Properties automatically:

- `SPREADSHEET_ID`
- `DRIVE_ROOT_FOLDER_ID`
- `PRODUCT_MEDIA_FOLDER_ID`
- `DOCUMENTS_FOLDER_ID`
- `EXPORTS_FOLDER_ID`

It also locks the admin Google account to the verified Google Account `sub` value on the first successful admin login (`ADMIN_GOOGLE_SUB`).

## 5. Deploy as a Web App

Deploy → **New deployment** → **Web app**.

Recommended settings:

- Execute as: **Me**
- Who has access: **Anyone**

Public access is required because website order/enquiry forms are public. Admin actions are not public: every `admin.*` API action independently verifies a Google ID token and the authorized admin account.

Copy the production `/exec` URL, for example:

`https://script.google.com/macros/s/AKfycbw_nR3t5gJfE5BOB4F1NduKDL1Mm10ad73BbnXRygL9pWDm-EwqmcegcVyswZimIYTtgA/exec`

Do not use the `/dev` URL for the live website.

## 6. GitHub production configuration

Repository → Settings → Secrets and variables → Actions.

### Secret

`VITE_API_BASE_URL` (already wired to the production `/exec` endpoint)

Value: the Apps Script `/exec` URL.

### Variable

`GOOGLE_OAUTH_CLIENT_ID`

Value: the exact OAuth Web Client ID used in Apps Script.

Optional variable:

`GOOGLE_SITE_VERIFICATION`

## 7. Backend behavior

### Public requests

- `booking` → writes to `Bookings`
- `enquiry` → writes to `Enquiries`
- both generate SARKSH references
- both send a best-effort notification email to `amoghchowdaryamaraneni@gmail.com`

### Admin requests

The `/admin/` portal can:

- view dashboard metrics
- add/edit products
- upload product images to Google Drive
- monitor order requests and change status
- monitor enquiries and change status
- add/edit websites
- check website HTTP status and response time
- open the live Google Sheet and Drive folder

Admin changes are recorded in `Audit Log`.

## 8. Security model

- The customer API does not expose GET endpoints for bookings or enquiries.
- Admin records require a Google Identity Services ID token.
- Apps Script validates the token server-side against Google's token verification endpoint.
- The token audience must equal `GOOGLE_CLIENT_ID`.
- The verified Gmail address must equal `amoghchowdaryamaraneni@gmail.com`.
- The Google Account subject is locked after the first successful admin login.
- `/admin/` is `noindex,nofollow,noarchive`, excluded from sitemap.xml, and disallowed in robots.txt.
- Uploaded product images are restricted to JPG/PNG/WebP and 4.5 MB.

## 9. Updating the Apps Script backend later

When `Code.gs` changes:

1. Update the Apps Script source.
2. Deploy → Manage deployments.
3. Edit the existing production deployment.
4. Create/select a new version.
5. Deploy.

The `/exec` URL normally stays the same, so the GitHub secret does not need to change.

## Monitoring additional domains

Apps Script versioned deployments require URL-fetch allowlisting. `appsscript.json` already allows the Google token-verification endpoint and `sarkshfoods.in`.

Before using **Check now** for another website domain, add that domain prefix to `urlFetchWhitelist` in `appsscript.json`, for example:

`https://example.com/`

Then create a new Apps Script deployment version. This is an Apps Script security requirement, not an admin-portal limitation.
