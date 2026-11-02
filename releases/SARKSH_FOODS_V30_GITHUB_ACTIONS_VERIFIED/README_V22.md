# SARKSH FOODS V22 — Editorial Subpages Only

Starting point: V21. This release ONLY changes `recipes.html`, `blog.html`, and `quality.html`, plus two new standalone assets: `css/editorial-v22.css` and `js/editorial-v22.js`.

## Routes
- Recipes listing: http://127.0.0.1:5200/recipes.html
- Recipe detail: `recipes.html?recipe=south-indian-curry`, `?recipe=podi-ghee-rice`, `?recipe=golden-turmeric-milk`, `?recipe=bitter-gourd-stir-fry`
- Journal listing: http://127.0.0.1:5200/blog.html
- Article detail: `blog.html?article=farm-to-kitchen`, `?article=daily-wellness-rituals`, `?article=perfect-aromatics`
- Quality: http://127.0.0.1:5200/quality.html

Note: Existing V21 server serves `.html` page paths, not clean `/recipes` URL aliases. Query-string detail views preserve its routing unchanged.

## Windows launch
Extract ZIP and run `START_WEBSITE.bat`. If port 5200 is in use, stop the older server first. `npm start` and `npm run check` are available. No new npm packages are required.

## Photos
Article and recipe image placeholders use `images.unsplash.com` URLs for attractive food and ingredient visuals. They require an Internet connection; a local SARKSH chilli photo is used if an image fails. The visuals are illustrative, not photos of certified SARKSH products.

## Marketing and food safety
Quality statements are commitments or intended controls, **not** verified certifications. Publish any claim of single-origin supply, preservatives-free production, organic certification, contaminant test results, or dye-free batches only after relevant documents are available. Bitter gourd should not be marketed as treatment for diabetes, and curry leaf powder is not proven to improve hair growth or skin conditions.

## Homepage protection
Homepage HTML, app.js, original server, animation script, logo, shared CSS and all original image assets remain unchanged. The new script automatically does nothing on pages other than `recipes`, `blog`, and `quality`.
