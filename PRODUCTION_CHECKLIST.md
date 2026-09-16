# SARKSH Foods V8.4 Production Checklist

## Upgrade Apps Script

- [ ] Replace Apps Script `Code.gs` with V8.4 `apps-script/Code.gs`
- [ ] Replace/update `appsscript.json`
- [ ] Run `setupProductionBackend()` once
- [ ] Confirm new Sheets exist: Customers, Customer Addresses, Customer Sessions, Password Resets, Admin Sessions
- [ ] Run `initializeAdminAccess()` once
- [ ] Confirm admin-password email arrives
- [ ] Deploy a new version of the existing Apps Script Web App
- [ ] Keep the same production `/exec` URL
- [ ] Run `npm run backend:health` and confirm backend version 8.4

## Customer-account QA

- [ ] Create a test customer account
- [ ] Confirm Customers sheet stores hash/salt, never raw password
- [ ] Sign out and sign in again
- [ ] Save Home address
- [ ] Save a second address and change default
- [ ] Place an order from `/account/`
- [ ] Confirm Bookings row contains Customer ID and Address ID
- [ ] Change order status in Admin to Delivered
- [ ] Confirm it appears under Past deliveries
- [ ] Reorder from customer history
- [ ] Request password reset and confirm email code works
- [ ] Confirm reset code is not stored raw in Sheets

## Admin QA

- [ ] `/admin/` accepts the generated admin password
- [ ] Products load
- [ ] Orders load and statuses include Packed / Out for delivery / Delivered
- [ ] Customers view loads without password/hash fields
- [ ] Enquiries load
- [ ] Website monitoring works
- [ ] Sheets and Drive shortcuts open only for the signed-in Google owner account

## Payments

- [ ] Razorpay remains disabled in V8.4
- [ ] No card number/CVV fields exist
- [ ] Payment panel clearly states online payments are not active

## GitHub Pages

- [ ] GitHub Pages source = GitHub Actions
- [ ] Custom domain = `sarkshfoods.in`
- [ ] Optional variable `GOOGLE_SITE_VERIFICATION` configured
- [ ] Push to `main`
- [ ] GitHub Actions build passes
- [ ] HTTPS enforced after certificate issuance

## SEO/privacy

- [ ] `/account/` is `noindex,nofollow,noarchive`
- [ ] `/admin/` is `noindex,nofollow,noarchive`
- [ ] robots.txt disallows `/account/` and `/admin/`
- [ ] neither private route is present in sitemap.xml
- [ ] public product SEO remains unchanged
- [ ] Privacy page describes customer accounts, hashed passwords, private Sheets/Drive and payment policy
