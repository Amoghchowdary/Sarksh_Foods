# SARKSH FOODS Website V27 — Apps Script Backend (Git-ready)

The original V26 website visual files are preserved. This adds a separate Google Apps Script + Sheets persistence backend through a Node same-origin API bridge. New frontend HTML, CSS and JavaScript were **not** modified.

**Start with:** [`SETUP_V27_WINDOWS.md`](SETUP_V27_WINDOWS.md).

## Files
- `apps-script/Code.gs` — Apps Script data service (Customers, Carts, Orders, Enquiries).
- `apps-script/appsscript.json` — Apps Script manifest.
- `backend/gas-client.mjs` — private server-to-server connector.
- `backend/commerce-gas.mjs` — original account/cart API contract, now backed by Google Sheets.
- `server.mjs` — selects Apps Script only when `.env` has `SARKSH_BACKEND=apps_script`.
- `.env.example` — non-secret example. Copy to `.env`, never commit actual values.
- `tests/apps-script-bridge.test.mjs` — end-to-end backend integration test against a simulated Apps Script service.
- `tests/apps-script-storage.test.mjs` — tests the **actual** Code.gs operations using a simulated Google Sheets runtime.
- `VERIFY_V27_PRESERVATION.mjs` — SHA-256 integrity check of all original frontend files.

The live Google account setup requires you to authorize the Google project and provide the deployment URL and secret. No real account or GitHub remote has been deployed from the generation environment.
