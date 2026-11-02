# SARKSH FOODS V23 — Verification Report

## Scope

V23 adds customer registration/login, saved cart, order-request checkout inside a customer portal, and India geography on the Story page. V22 editorial image references were corrected with dish-specific illustrations when a reliably matched photograph is unavailable.

## Homepage source preservation

The following were SHA-256 compared with the V22 release. All match byte-for-byte:

| File | Identical to V22 |
|---|---|
| `js/app.js` | YES |
| `js/hero-v17.js` | YES |
| `css/hero-v15.css` | YES |
| `css/styles.css` | YES |
| `assets/golden-valley-v20-motion.webp` | YES |
| `assets/sarksh-original-logo.webp` | YES |
| `assets/sarksh-original-emblem.webp` | YES |
| `assets/range-forest-dark-soil-v21.webp` | YES |


`index.html` was extended to load the commerce stylesheet and script. It does not change the hero render function or its artistic assets. Live header Cart/Account controls and compact Add-to-cart buttons are deliberately added to the product cards.

## API test suite

`npm test` passed using a separate temporary data directory and port. Tests covered:

- All site aliases (`/`, `/story`, `/products`, `/recipes`, `/blog`, `/quality`, `/cart`, `/account`) returned HTTP 200.
- Guest cart API denied until login.
- Registration, session cookie creation and logged-in profile.
- Authenticated cart modification rejected without CSRF token.
- Product validation and cart merge.
- Profile changes, order request saved with `paymentStatus:not_started` and no total.
- Saved cart restored after logout and login.
- Payments disabled in catalog config.

## Isolated Chromium visual checks

Products, guest Cart, Account, Story and mobile variants rendered in headless Chromium. No horizontal overflow or JavaScript errors were reported. Guest product-button -> cart badge interaction passed. Actual external URL navigation was denied by browser policy; therefore a full end-to-end browser checkout and external image/map loading were **not** visually verified. API tests validate persistence and business behavior separately.

## Imagery

- The unrelated chilli-spice image formerly used for the curry recipe was replaced by an Unsplash curry-plate photograph URL.
- Podi ghee rice, golden turmeric milk and bitter gourd stir-fry use local illustrated assets designed for those exact dishes rather than unrelated photos.
- Additional ingredient illustration assets support blog/quality fallbacks. Unsplash and OpenStreetMap resources require network access and their external availability was not verified in-browser.

## Payment / data caveats

- Account passwords use scrypt hashes; session cookie is HttpOnly/SameSite.
- This local JSON-backed backend is **not** a public, audited payments application. Enable gateway, verified prices, shipping and checkout charges only after receiving actual production configuration and completing a security review.
- Customer data is stored locally in `data/` at runtime; that directory is excluded from source control and this archive.

## Map source

Story page embeds © OpenStreetMap contributors and includes a link to the Survey of India official outline maps. No restricted Survey of India map data is copied to commercial project assets.
