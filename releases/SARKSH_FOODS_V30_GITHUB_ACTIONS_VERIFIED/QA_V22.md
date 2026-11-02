# QA — V22

- Existing V21 files modified: `recipes.html`, `blog.html`, `quality.html` only.
- New files: `css/editorial-v22.css`, `js/editorial-v22.js`, `README_V22.md`, this QA.
- SHA-256 equality checked and passed for: `index.html`, `js/app.js`, `js/hero-v17.js`, `css/styles.css`, `css/hero-v15.css`, `server.mjs`.
- `node --check js/editorial-v22.js` passed.
- Isolated Chromium checks passed: recipes index shows 4 cards; journal index shows 3 cards; quality page has its updated content; recipe/article detail views render; checklist increments (1 of 10); no JS errors / horizontal overflow at 1440px.
- Full browser navigation to localhost and file:// was blocked by environment browser policy, so end-to-end live-browser navigation was not certified.
- All food photos are externally hosted Unsplash URL placeholders with a local fallback; CDN imagery was not verified by a live external-network request.
