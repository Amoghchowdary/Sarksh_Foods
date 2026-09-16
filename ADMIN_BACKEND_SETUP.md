# SARKSH Foods V8.4 Admin & Customer Database Setup

## Private data model

The Google Sheet and Google Drive folders stay private inside the SARKSH Foods Google account. Customers and public visitors never receive direct Sheet or Drive permissions.

Public/customer website → Apps Script API → private Google Sheets / Drive.

## Sheets

`setupProductionBackend()` maintains:

- Products
- Bookings
- Enquiries
- Websites
- Audit Log
- Customers
- Customer Addresses
- Customer Sessions
- Password Resets
- Admin Sessions

Existing Bookings data is preserved. V8.4 adds customer/account/payment columns to the end of the existing booking schema.

## Admin access without Google Cloud Console

Run `initializeAdminAccess()` once in Apps Script.

The backend:

1. generates a strong temporary/admin password,
2. emails it to `amoghchowdaryamaraneni@gmail.com`,
3. stores only a unique salt + iterated password hash in Script Properties,
4. never writes the raw password to Sheets, Drive, GitHub or the frontend.

Admin login URL:

`https://sarkshfoods.in/admin/`

Admin sessions expire after 8 hours and only a hash of each session token is stored in the `Admin Sessions` sheet.

## Customer authentication

Customer registration requires name, mobile, email and password.

The password is never stored directly. Each account receives a unique salt; the backend derives a password hash using repeated SHA-256 with a private server-side pepper stored in Apps Script Script Properties.

Customer sessions expire after 30 days. Only hashed session tokens are stored.

Password-reset codes are emailed to the customer, expire after 15 minutes and are stored only as hashes.

## Customer portal

`https://sarkshfoods.in/account/`

Modules:

- Products
- Past deliveries
- Order history
- Saved addresses
- Payments placeholder for future Razorpay integration
- Account/password controls

Online payment is deliberately disabled in V8.4. No card details or Razorpay credentials are stored in Google Sheets.

## Admin modules

- Overview
- Products
- Orders
- Customers
- Enquiries
- Websites

Password hashes, salts and session hashes are never returned to the admin frontend.
