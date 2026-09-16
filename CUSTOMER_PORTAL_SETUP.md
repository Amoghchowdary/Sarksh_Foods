# SARKSH Foods V8.4 — Customer Portal setup

## Architecture

The storefront and customer portal run on GitHub Pages at `https://sarkshfoods.in`. All structured customer/order data remains in the private SARKSH Foods Google Sheet, and uploaded source media remains in private Google Drive. The Apps Script web app is the only application gateway. Customers are never granted Google Sheet or Drive permissions.

## V8.4 customer features

- Customer registration and sign-in
- Salted, iterated password hashes with a private Apps Script pepper; raw passwords are not stored
- Hashed server-side session records
- Password reset by short-lived email code; reset codes are stored only as hashes
- Saved Home/Office/other delivery addresses and default address
- Products from the private Products sheet
- Order placement using a saved address
- Order history, completed deliveries and reorder
- Payment area prepared for a later Razorpay integration; no card/CVV data is stored in this release

## Upgrade the existing Apps Script deployment

1. Open the Apps Script project that currently serves the production endpoint.
2. Replace `Code.gs` with `apps-script/Code.gs` from V8.4.
3. Replace the manifest settings with `apps-script/appsscript.json` if required.
4. Run `setupProductionBackend()` once. It upgrades the existing spreadsheet in place by adding the new customer/account sheets and missing columns; it does not require a new database.
5. Run `initializeAdminAccess()` once. The generated initial admin password is emailed to the configured admin address; only its salted hash is stored.
6. Use **Deploy → Manage deployments → Edit** on the existing web-app deployment and create a **new version**. Keeping the existing deployment means the `/exec` URL remains unchanged.
7. Re-run `npm run backend:health`. It should report backend version `8.4`, Sheets configured, Drive configured, customer accounts configured and admin password configured.

## Database additions

V8.4 adds or upgrades these sheets inside the existing private production spreadsheet:

- Customers
- Customer Addresses
- Customer Sessions
- Password Resets
- Admin Sessions
- Bookings (adds Customer ID, Address ID, Payment Method, Payment Status)

Existing Products, Bookings, Enquiries, Websites and Audit Log data is preserved.

## Private Drive rule

Product source media uploaded in Admin stays private in Drive. V8.4 does not call `setSharing(...ANYONE_WITH_LINK...)`. Public/customer-facing product images should be deployed as normal website assets (or another approved public CDN) and referenced by the optional public storefront image URL.

## Test sequence

1. Open `/account/` locally.
2. Create a customer account.
3. Add a default address.
4. Place a product order.
5. Confirm the row in Bookings and the admin email notification.
6. In Admin, move the order through Packed → Out for delivery → Delivered.
7. Refresh the customer portal and confirm it appears under Past deliveries.
8. Reorder it.
9. Test password change and forgot-password reset.
10. Push only after all tests pass.

## Razorpay

Razorpay is intentionally deferred. The Payments screen is a non-transactional placeholder. When payments are enabled later, order/payment IDs and status may be stored in Sheets, but card numbers, CVV and other payment credentials must remain with Razorpay and must never be stored in Google Sheets or Drive.
