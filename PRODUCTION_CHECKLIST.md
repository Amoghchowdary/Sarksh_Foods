# V13 Production Checklist

## Local
- `npm install`
- `npm run typecheck`
- `npm run security:audit`
- visually verify the finalized V11.2 homepage and all routes
- test customer account, order, enquiry and admin flows against the private Apps Script backend

## Production environment
- `SITE_URL=https://www.sarkshfoods.in`
- `VITE_API_BASE_URL` supplied privately
- optional `GOOGLE_SITE_VERIFICATION`
- optional `INDEXNOW_KEY`

## Build
- `npm run validate:prod`
- confirm no Apps Script source or real `.env` files exist in the public repo package

## GitHub
- set `VITE_API_BASE_URL` under Settings → Secrets and variables → Actions → Secrets
- use GitHub Actions as Pages source
- deploy `main`

## Search
- submit `https://www.sarkshfoods.in/sitemap.xml` in Search Console
- request indexing for key pages
- verify Product/FAQ structured data
- confirm `robots.txt`, `llms.txt` and product/entity JSON are public
