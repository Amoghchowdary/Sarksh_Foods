# SARKSH Foods Admin & Database Setup

Production admin URL: **https://sarkshfoods.in/admin/**

Authorized administrator: **amoghchowdaryamaraneni@gmail.com**

## Production architecture

Customer website (GitHub Pages)
→ Google Apps Script Web App
→ Google Sheets database + Google Drive media
→ Admin email notification

Admin portal (GitHub Pages)
→ Google Identity Services sign-in
→ Google ID token
→ Apps Script server-side token validation
→ Products / orders / enquiries / website monitor

## Required production values

1. `VITE_API_BASE_URL` — fixed production endpoint in the GitHub Actions workflow
2. `GOOGLE_OAUTH_CLIENT_ID` — GitHub Actions variable
3. `GOOGLE_CLIENT_ID` — Apps Script Script Property (same value)
4. `ADMIN_EMAIL` — Apps Script Script Property (`amoghchowdaryamaraneni@gmail.com`)

## Admin modules

### Overview
- Active/total products
- New orders
- New enquiries
- Website availability
- Direct links to the production Sheet and Drive folder

### Products
- Product name / slug / category / pack size
- Active / Draft / Archived
- Stock/order label
- Short description
- Featured flag
- Product media upload to Google Drive

### Orders
- Customer, product, quantity, buyer type, contact and delivery details
- New → Contacted → Confirmed → Closed / Cancelled

### Enquiries
- Contact details and requirement
- New → Contacted → Resolved → Closed

### Websites
- Multiple SARKSH website records
- Production/staging label
- HTTPS availability check
- HTTP status
- Response time
- Last checked timestamp

## Google Drive visibility

Product images uploaded through Admin are stored in `Product Media`. They are made viewable by link so the admin interface can display them. Do not upload confidential internal documents into the public product-media folder; use the separate `Documents` folder for internal material.
