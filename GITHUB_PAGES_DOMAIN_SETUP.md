# GitHub Pages production setup — V13

Canonical public host: `https://www.sarkshfoods.in`

GitHub Pages source: GitHub Actions.

Repository secret:
- `VITE_API_BASE_URL` = deployed Apps Script Web App `/exec` URL

Repository variables:
- `GOOGLE_SITE_VERIFICATION` = optional Search Console token
- `INDEXNOW_KEY` = optional 8–128 character hexadecimal IndexNow key

Do not store the Apps Script URL in tracked source files or examples. V13 injects it only during the build.

DNS:
- `www` should CNAME to the GitHub Pages hostname
- apex records should point only to GitHub Pages and redirect/canonicalize to `www`
