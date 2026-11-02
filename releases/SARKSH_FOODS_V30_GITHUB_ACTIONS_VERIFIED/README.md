# SARKSH FOODS — V24 India Image Fixed

This is a complete SARKSH FOODS website release, based on the V24 build. The Story page now uses a single polished **static** India-inspired farming heritage illustration. It has no political map widgets, labels, controls, zoom, or map animations.

## Run it on Windows
1. Extract the ZIP to a new folder, not on top of V23 or earlier V24.
2. Open `SARKSH_FOODS_V24_INDIA_IMAGE_FIXED` in File Explorer.
3. Double-click `START_WEBSITE.bat` (Node.js 18+ must be installed).
4. Open `http://127.0.0.1:5240/story.html`.

Or open PowerShell in the extracted folder and run:
```powershell
npm run check
npm test
npm start
```

No third-party npm packages are needed. `npm install` reporting one audited package is expected for this dependency-free local build.

## What changed
- `assets/india-sourcing-heritage-v24.webp` / `.png`: new India-inspired landscape image.
- `js/story-map-v23.js`: replaces the old review graphic. The file name is kept for compatibility.
- `css/story-map-v23.css`: redesigned Story-section image treatment and corrected mobile responsiveness.
- `server.mjs` / `START_WEBSITE.bat`: version label V24, default port **5240** so your V23 server running on 5230 cannot be confused with this build.
- `package.json`: version 24.2.0.

Everything else including the approved homepage, product names, recipe pages and customer portal remains unchanged.

## Geographical presentation
The decorative silhouette uses the site's prior OSM-derived outline artwork, with brand imagery placed within it. It is **not** a surveyed legal boundary map. Do not make territorial/legal claims from the artwork. For publication with an authoritative Indian boundary, use a suitably licensed Survey of India reference (https://surveyofindia.gov.in/pages/political-map-of-india).

See `QA_V24_MAP_FIX.md` for verification details.
