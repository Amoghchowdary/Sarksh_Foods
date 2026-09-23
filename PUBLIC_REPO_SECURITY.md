# V13 Public Repository Security Model

## JSON files
JSON is not automatically sensitive. Public configuration JSON such as `package.json`, `tsconfig.json`, `site.webmanifest`, public product/entity data, and structured-data outputs are safe to publish when they contain no credentials.

Never publish credential JSON such as service-account keys, OAuth client-secret downloads, Firebase admin credentials, or exported secret/config files.

## Environment files
Real `.env`, `.env.local`, `.env.production`, and `*.local` files are private and ignored by Git.

`.env.production.example` is safe only because it contains placeholders and no deployed endpoint, token, password, secret, Sheet ID, Drive ID, or private key.

## Apps Script
The Apps Script source is intentionally excluded from the public repository and shipped separately as a private local-only package.

The deployed Apps Script web-app URL can be hidden from Git source by using a GitHub Actions secret, but a browser must know the endpoint to call it, so the deployed endpoint can still be discovered from browser network traffic. Do not use the URL itself as a security boundary.

Backend security must remain server-side: validate actions, require authenticated sessions for customer/admin private operations, store password material and peppers only in Script Properties/Sheets as appropriate, and keep Sheets/Drive private.

## Build guard
`npm run security:audit` fails if common secret files, Apps Script source, real environment files, or a hardcoded Apps Script deployment URL are found in the public repository.
