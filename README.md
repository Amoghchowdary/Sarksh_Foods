# SARKSH Foods — V9.0 Production FMCG Website

Production website for SARKSH Foods, built around a premium red-and-white customer experience and the current 1 kg SARKSH Foods Chilli Powder range.

## V9.0 focus

V9.0 replaces the previous screenshot-led landing treatment with a real responsive homepage. The product photograph, product tiles, navigation, calls to action and content are separate interface elements so they align correctly on desktop, tablet and mobile.

The public website now uses one cohesive deep-red visual system across Home, Products, Chilli Powder, Business Orders, About, Contact, Pan-India and Privacy pages.

## Current production architecture

- React + TypeScript + TanStack Router
- GitHub Pages deployment
- Google Apps Script production service
- Private Google Sheets database
- Private Google Drive storage
- Customer accounts with saved addresses and order history
- Protected admin workspace
- Production SEO, sitemap, structured data and indexing files

## Production domain

`https://www.sarkshfoods.in`

## Local validation

```powershell
npm install
npm run typecheck
npm run backend:health

$env:SITE_URL="https://www.sarkshfoods.in"
$env:VITE_API_BASE_URL="https://script.google.com/macros/s/AKfycbw_nR3t5gJfE5BOB4F1NduKDL1Mm10ad73BbnXRygL9pWDm-EwqmcegcVyswZimIYTtgA/exec"

npm run validate:prod
```

## Customer routes

- `/` — Home
- `/products/` — Products
- `/chilli-powder/` — Chilli Powder
- `/enterprise/` — Business Orders
- `/pan-india/` — Pan-India
- `/about/` — About
- `/contact/` — Contact
- `/account/` — Customer Account
- `/privacy/` — Privacy

## Protected systems

The existing 3D opening animation, official SARKSH Foods logo, production backend contract, customer-account system, admin functions and SEO/indexing architecture are retained.
