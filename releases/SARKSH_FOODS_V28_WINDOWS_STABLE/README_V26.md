# SARKSH FOODS V26 — Editorial Sections Only

This update is applied on top of the approved V25 website. It modifies only:

- `recipes.html` → Recipe Collection (four complete illustrated recipes and detail pages)
- `blog.html` → Food & Wellness Journal (four complete articles and detail pages)
- `quality.html` → Our Quality Promise (real raw-ingredient photos and six quality principles)

New self-contained files: `js/editorial-v26.js`, `css/editorial-v26.css`, and locally bundled editorial WebP images. The original `js/editorial-v22.js` and `css/editorial-v22.css` are retained for traceability; only the three editorial HTML files reference V26.

The V25 homepage, Our Story, Products, cart/account/checkout, server, animation assets, and shared CSS/JS are unchanged. As a result, `npm` may still display the original V25 core package version. This is deliberate to preserve the existing runtime and functionality.

## Run on Windows
1. Extract this ZIP to a **new** folder; do not merge over a running older version.
2. Open PowerShell in `SARKSH_FOODS_V26_EDITORIAL_ONLY`.
3. Run `npm run check`, `npm test`, then `npm run dev`.
4. Open:
   - `http://127.0.0.1:5240/recipes.html`
   - `http://127.0.0.1:5240/blog.html`
   - `http://127.0.0.1:5240/quality.html`
5. Stop any previous website server using port 5240 before starting this one.

`START_WEBSITE.bat` from V25 is also included unchanged.

**Note:** Product imagery on the Products page remains as approved in V25. No live payment collection or gateway integration has been added.

**Quality claims:** This copy communicates intended operating principles. Claims such as independently certified organic, heavy-metal-free or batch-tested must only be used with the correct documentation.
