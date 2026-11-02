# SARKSH FOODS V24 — Verification Report

**Scope:** Correct recipe imagery and replace the interactive geopolitical map with an India-only Story illustration. V23 is retained as the base; no homepage redesign or commerce changes.

## Changes

- Four **dish-specific photorealistic editorial serving images**, stored locally in `/assets/` as WebP: `recipe-tomato-curry-v24.webp`, `recipe-podi-ghee-rice-v24.webp`, `recipe-golden-turmeric-milk-v24.webp`, and `recipe-bitter-gourd-fry-v24.webp`.
- Recipe index and all four detail screens use the matching local image. The unrelated stock curry photo and three cartoon recipe illustrations are no longer referenced by recipe code. Fallback does not substitute an unrelated spice picture.
- Blog and Quality media now use relevant photorealistic assets with accurate labels.
- The Story page uses only `india-country-only-v24.svg` with no neighbouring countries, geopolitical labels or OpenStreetMap iframe. This *decorative* India shape uses public-domain Natural Earth geometry; it is not suitable for legal, administrative or boundary use.
- These four recipe images are **AI-generated photorealistic editorial illustrations**, not photographs taken of food produced with actual SARKSH FOODS batches.

## Tests performed

1. `npm run check`: PASS (existing seven-page and six-product tests).
2. `npm test`: PASS (V23 customer registration, cart continuity, account access and order flow).
3. SHA-256 comparison: PASS, **21 files byte-for-byte unchanged** from V23 including `index.html`, `js/app.js`, `server.mjs`, existing commerce assets/scripts/styles, homepage scenery, logo and product-range scenery.
4. HTTP local server checks: PASS, all 15 tested page and media paths return 200 and nonempty bodies.
5. Isolated Chromium recipe index desktop: PASS, loaded dish-matched recipe photos.
6. Isolated Chromium recipe details: PASS, all four images loaded; ingredient checkboxes increment progress; no JavaScript errors and no horizontal overflow at 1280 px.
7. Isolated Chromium India Story: PASS at 1440 px and 390 px; image renders and no iframe/map labels or horizontal overflow.
8. `npm start` uses the original V23 port **5230**, and `START_WEBSITE.bat` remains unchanged.

## Environment limitations

- Direct Playwright navigation to local HTTP origins is blocked by policy. Therefore, browser layouts were tested using isolated HTML/CSS/JavaScript renders with the same bundled assets, and HTTP routes were tested separately. Full URL-to-URL browser interactions need verification after extraction on the customer's machine.
- The India silhouette is intentionally decorative, not a formal political map. For binding/official geographic borders use Survey of India licensed material and the appropriate published standards.
- The payment gateway remains not configured; V24 does not introduce payments or change prices.
