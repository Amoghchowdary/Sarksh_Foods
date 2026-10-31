# SARKSH FOODS V23 — Customer Portal & Editorial Imagery

## Launch (Windows)

1. Extract this ZIP to a new directory. Keep the older V22 folder untouched.
2. Install Node.js 18+ if not installed. No third-party npm packages are required.
3. Run `START_WEBSITE.bat` or `npm run check`, `npm test`, `npm start`.
4. Open **http://127.0.0.1:5230**.

## Website routes

- Homepage `/` — approved V22 hero, scenery, content and animations unchanged; Cart/Account links and product-card add-to-cart buttons are the only commerce additions.
- `/products` — add the six approved products to cart; imagery/prices are intentionally excluded from the catalogue until approved.
- `/cart` — quantity controls and pre-login cart persistence (browser localStorage).
- `/account` — registration, login, delivery profile, saved cart, previous order requests.
- `/account?checkout=1` — logged-in checkout/order-request form. A visitor is asked to log in first, then their local cart is merged into the account cart.
- `/story` — OpenStreetMap geographic overview of India with attribution and authoritative Survey of India reference link. Supplier origin pins are intentionally not invented.
- `/recipes`, `/blog`, `/quality` — existing V22 editorial views retained with dish-specific imagery updates.

## How ordering works

1. Guest adds items to cart in the home catalogue section or Products page.
2. Cart remains saved in that browser. When Checkout is clicked it opens the Customer Portal.
3. Customer registers/signs in; the cart is merged with their personal server-stored cart.
4. Customer enters delivery details and submits an **order request**, stored with status `awaiting_pricing_and_availability`.
5. Request appears in the account order history. **No payment is processed.** This is not a paid or confirmed order.

## Commercial launch requirements

- Founder-approved per-product prices, units/weights, SKU metadata, inventory, shipping cost, tax rules and refund policy.
- A verified merchant gateway account, payment-order creation on server, signed webhooks and reconciliation; enable only after receiving credentials and business approval.
- HTTPS, domain/reverse proxy, verified customer email/SMS, production database with backups and migrations, legal privacy/terms, production security audit, rate-limiting and monitoring.
- Current local accounts are stored in `data/customers-v23.json` with scrypt-hashed passwords. Session state is in server memory; restarting the server requires login again. Never expose `data/` publicly or commit it.

## Recipe pictures

- The generic spice/salad photos have been removed from recipe views.
- South Indian curry uses an Unsplash photo of a curry plate; individual recipe-specific illustrated assets are provided for podi rice, golden milk and karela stir-fry to avoid falsely portraying a different dish.
- Licensed editorial photography can replace those clearly marked illustrations later. Images sourced from Unsplash rely on network access; local recipe-specific SVG fallbacks remain available.

## Map attribution / legal note

The Story page embeds an OpenStreetMap regional map (© OpenStreetMap contributors) and links to the Survey of India official outline maps. It does **not** copy Survey of India restricted map data onto this commercial website or invent supplier sites.

## Security

CSRF tokens protect authenticated mutations; session cookie is HttpOnly/SameSite, secure when HTTPS is active; passwords are scrypt hashed. This dependency-free JSON-file backed service is suitable for local validation/prototyping, **not** a production payment/customer system without hardening.

## QA

`npm run check` verifies script syntax and the legacy page invariants. `npm test` covers login, registration, auth enforcement, CSRF protection, cart transfer, order requests, profile updates, logout/login persistence. Isolated Chromium layout checks are documented in `QA_V23.md`.
