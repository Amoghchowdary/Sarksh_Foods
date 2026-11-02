# SARKSH FOODS V24 — Recipe Imagery + India-Only Story Illustration

## Changes
- Replaced all four recipe SVG cartoons and the unrelated stock curry image with **dish-specific photorealistic images**: South Indian tomato curry, paruppu podi ghee rice, golden turmeric milk, and karela stir-fry.
- New local WebP files are used on both recipe index and recipe detail pages; the fallback is also a food photograph-style image, never a cartoon.
- The images are **AI-created photorealistic serving illustrations**, not photographs of meals made with SARKSH FOODS products. They should not be portrayed as verified product/batch photography.
- Blog and quality editorial media now use relevant photographic-style images; ingredient labels reflect what appears in the images.
- Removed the world OpenStreetMap iframe from **Our Story**. Added an **India-only decorative country silhouette**, without other countries, political/state boundaries, city labels, or map controls.
- India outline is generated from Natural Earth public-domain GIS geometry. This is a visual country illustration, *not an official/legal boundary map*, and is not a statement about any disputed region.

## Unchanged
- `index.html`, the main `js/app.js`, shared `css/styles.css`, original hero animation assets, product-range assets, commerce accounts, cart, checkout-request logic and server are unchanged from V23.

## Run
Extract to a separate folder. Run `npm run check`, `npm test`, then `npm start` from the extracted project folder. Open http://localhost:5230, not an earlier SARKSH FOODS server.

## Quality assurance
See `QA_V24.md` for source hashes, image checks, layout tests and known limitations.
