# SARKSH FOODS V26 — editorial-only verification

## Scope
The only existing page files modified are `recipes.html`, `blog.html`, `quality.html`.
New files: `js/editorial-v26.js`, `css/editorial-v26.css`, matched editorial image assets.
No existing homepage, story, product, cart, account, server, shared stylesheet, or commerce code has been modified.

## Image-to-content mapping
- South Indian Tomato Curry → ed-tomato-curry-v26.webp
- Podi Ghee Rice → recipe-podi-ghee-rice-v24.webp
- Golden Turmeric Milk → recipe-golden-turmeric-milk-v24.webp
- Bitter Gourd Stir-Fry → recipe-bitter-gourd-fry-v24.webp
- Farm-to-kitchen blog → photographed turmeric rhizomes and dried chilli diptych
- Everyday wellness blog → photographed curry leaves and dried bitter-gourd diptych
- Garam masala blog → garam masala powder photograph
- Paruppu podi blog → pulses powder photograph
- Quality raw-ingredient grid → whole dried chillies, raw turmeric rhizomes, fresh curry leaves

## Claims
All process / testing standards are described as intended quality principles rather than independently verified batch certification.

## Automated verification
- `npm run check` — passed
- `npm test` — passed
- V26 editorial JS syntax — passed
- Existing-site file SHA/content comparison — only `recipes.html`, `blog.html`, `quality.html` changed
- New CSS, JS and all editorial images returned HTTP 200 on the local Node server
- Isolated Chromium layout checks at 1440px and 390px — passed, no horizontal overflow or JS exceptions
- Recipe ingredient checkbox state — passed
- All three Quality ingredient photographs loaded in the browser — passed
- Live browser navigation to local URLs blocked by browser sandbox policy; server routes and isolated rendering tested separately
