# SARKSH Foods V8.3 Production Checklist

## Backend & database

- [ ] Create Google OAuth 2.0 Web Client ID
- [ ] Add `https://sarkshfoods.in` as Authorized JavaScript origin
- [ ] Add `http://localhost:5173` for local admin testing
- [ ] Create Apps Script project
- [ ] Add the included `Code.gs` and `appsscript.json`
- [ ] Add Apps Script property `GOOGLE_CLIENT_ID`
- [ ] Add Apps Script property `ADMIN_EMAIL=amoghchowdaryamaraneni@gmail.com`
- [ ] Run `setupProductionBackend()` once
- [ ] Confirm Google Sheet contains Products, Bookings, Enquiries, Websites, Audit Log
- [ ] Confirm Drive contains Product Media, Documents and Exports
- [ ] Deploy Apps Script as Web App (`Execute as me`, `Anyone`)
- [ ] Copy production `/exec` URL

## GitHub Actions

- [ ] Apps Script production endpoint is already configured in the workflow
- [ ] Add Variable `GOOGLE_OAUTH_CLIENT_ID`
- [ ] Optional Variable `GOOGLE_SITE_VERIFICATION`
- [ ] GitHub Pages source = GitHub Actions
- [ ] Custom domain = `sarkshfoods.in`
- [ ] DNS configured
- [ ] HTTPS enforced after certificate provisioning

## Runtime QA

- [ ] Run `npm run backend:health` and confirm Sheets + Drive are configured

- [ ] Home, product, Business, Story, Contact render on desktop/mobile
- [ ] 3D intro preserved
- [ ] Order request writes to Google Sheets
- [ ] Enquiry writes to Google Sheets
- [ ] Admin receives notification email
- [ ] `/admin/` accepts only authorized Google account
- [ ] Product list loads in Admin
- [ ] Product image uploads to Google Drive
- [ ] Order status update persists
- [ ] Enquiry status update persists
- [ ] sarkshfoods.in website check returns status/response time
- [ ] Spreadsheet and Drive shortcuts open from Admin

## SEO

- [ ] `/sitemap.xml` works
- [ ] `/robots.txt` works and disallows `/admin/`
- [ ] `/admin/` contains `noindex,nofollow,noarchive`
- [ ] Admin URL is not in sitemap
- [ ] Search Console Domain Property verified
- [ ] Sitemap submitted
- [ ] Product structured data validated
