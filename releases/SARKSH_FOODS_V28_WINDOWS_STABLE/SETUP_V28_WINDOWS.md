# SARKSH FOODS V28 — Apps Script + Google Sheets backend, Windows + Git

**Scope:** Change backend only. The V26 homepage, Story, Products, Recipes, Blog, Quality, cart/account screens, CSS and image assets are kept byte-for-byte intact.

## Architecture

Browser (existing design and account UI) → **same-origin HTTPS Node server** → authenticated **Apps Script Web App** → private **Google Sheet**.

- Browser calls existing `/api/...` endpoints. No URL, secret, or password hash is exposed in browser source.
- The Node bridge handles password hashing (scrypt), session cookies, CSRF, validation and rate limits. No plaintext customer passwords are stored in Sheets.
- Apps Script stores Customers, Carts, Orders, Enquiries. New customer/cart/order/enquiry writes use `LockService`.
- **GitHub Pages alone is static and cannot run Node.** For real public customer accounts, deploy the Node server to a Node-capable HTTPS host. GitHub stores the source; a Git push alone does not activate the live backend.
- **Payments are NOT enabled.** This build accepts quotation/order requests only; prices and live gateway integration remain disabled.

## Step 1 — Requirements

Install **Node.js 20 LTS or newer**, Git for Windows, a Google account (Apps Script + Sheets) and GitHub access. Open PowerShell:

```powershell
node --version
npm --version
git --version
```

Extract `SARKSH_FOODS_WEBSITE_V28_APPS_SCRIPT_BACKEND.zip` to your Desktop. Navigate to the extracted `SARKSH_FOODS_V28_APPS_SCRIPT_GIT_READY` folder:

```powershell
cd "$HOME\Desktop\SARKSH_FOODS_V28_APPS_SCRIPT_GIT_READY"
npm install
npm run check
npm test
```

**Expected:** `V21 source QA passed`, and all 4 backend/local tests pass. `npm install` is retained for your normal workflow; this site needs no runtime npm dependencies.

## Step 1B — Windows verification and source preservation

In a new PowerShell window, ensure the Node.js installation is 20+ and check V28:

```powershell
npm install
npm run check
npm test
npm run doctor
```

Expected: all **5 tests** pass. V28 no longer uses `child_process.spawn()` for HTTP integration testing, removing the Windows `spawn node.exe ENOENT` error. This check does not connect to Google unless you separately configure `.env`.

**Default:** without a `.env`, or with `SARKSH_BACKEND=local-preview`, the website runs in local preview mode, *not* Google Sheets mode. The Apps Script bridge must be configured before production integration.

## Step 2 — Create the Google Apps Script project

Enable **Google Apps Script API** under <https://script.google.com/home/usersettings> if prompted by `clasp`.

```powershell
npm install --global @google/clasp
clasp --version
clasp login
cd .\apps-script
clasp create --type standalone --title "SARKSH FOODS Backend V28"
clasp status
clasp push
clasp open-script
```

- `clasp login` opens a browser: choose the correct Google account and authorize.
- `clasp create` generates a local `.clasp.json` linking this folder to the new script. It is ignored by Git; do not commit it.
- If your `clasp` version asks to overwrite a starter file, keep the **provided** `Code.gs` and `appsscript.json`; run `clasp push` again. Run `clasp status` to confirm both files are recognized.
- If create fails inside a populated folder, create a blank Apps Script project manually at <https://script.google.com>, copy the provided `Code.gs` and manifest, and use the Google editor instead. Do not create a second different backend by accident.

## Step 3 — Generate a private backend secret

In PowerShell (in any directory):

```powershell
$gasSecret = node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
$gasSecret
```

Copy the **64-character hex string**. Do not paste it into chat, GitHub or public code.

In your Apps Script project: **Project Settings → Script properties → Add script property**:

- **Property:** `SERVICE_SECRET`
- **Value:** the generated 64-character string

Do not put this property in `appsscript.json` or `Code.gs`.

## Step 4 — Initialize the private Google Sheet

In the Apps Script editor:

1. Choose function **`setupSarkshFoods`** from the function dropdown.
2. Click **Run** and accept the Google Sheets authorization requests for your own account.
3. Inspect **Execution log** for the new private Sheet URL.
4. Open that Sheet; confirm tabs and headers **Customers**, **Carts**, **Orders**, **Enquiries**.
5. In **Project Settings → Script properties**, confirm `SHEET_ID` was automatically created.
6. Keep the Google Sheet **private**. Do not set public sharing or enable anonymous read access to it.

Running setup again is safe if the existing sheet headers match the manifest. Never manually rename the backend columns.

## Step 5 — Deploy the Web App

Apps Script editor: **Deploy → New deployment → Select type: Web app**.

- Description: `SARKSH FOODS V28 private Sheets backend`
- Execute as: **Me**
- Who has access: **Anyone** (Node server authenticates using `SERVICE_SECRET` on every request)

Click **Deploy**. Copy the URL ending in **`/exec`** (not `/dev`, not the editor URL).

**Important:** Apps Script's Content Service sends JSON using a redirect to `script.googleusercontent.com`. The supplied Node adapter follows it automatically. Do not call this private API directly from GitHub Pages or add the secret to browser JavaScript. Official docs: <https://developers.google.com/apps-script/guides/content>.

## Step 6 — Configure the Node bridge locally

Return to the website root:

```powershell
cd ..
Copy-Item .env.example .env
notepad .env
```

In `.env` set the actual values:

```dotenv
SARKSH_BACKEND=apps_script
SARKSH_GAS_URL=https://script.google.com/macros/s/YOUR_ACTUAL_DEPLOYMENT_ID/exec
SARKSH_GAS_SECRET=YOUR_64_CHARACTER_SECRET
PORT=5242
HOST=127.0.0.1
COOKIE_SECURE=false
```

Use the **same secret** from Step 3. Do not use quotation marks around the values. `.env` is Git-ignored. Do not commit credentials or customer data.

## Step 7 — Verify the real Google connection

Close any old process using port 5242. Run:

```powershell
npm run check
npm test
npm run dev
```

In a **second** PowerShell window:

```powershell
Invoke-RestMethod http://127.0.0.1:5242/api/health
Invoke-RestMethod http://127.0.0.1:5242/api/catalog
```

The health response **must** include:

```json
{"ok":true,"site":"SARKSH FOODS V28","backend":"apps_script","connected":true}
```

If it returns `503` or `connected:false`, inspect the deployment URL, matching secret, Apps Script executions, and Script properties. **Do not proceed to Git or production until real Google connection succeeds.**

## Step 8 — Test every customer workflow in the browser

Visit <http://127.0.0.1:5242> and perform these steps in order:

1. Check **Homepage**, **Our Story**, **Products**, **Recipes**, **Blog**, **Quality** — no visual change or broken images.
2. Open Products, add **Chilli Powder** and **Turmeric Powder** to Cart.
3. Click **Cart → Continue in customer portal**.
4. Register a **new test email** with a password at least 10 characters long. The selected products must merge into the customer cart.
5. Open **Account**; confirm profile shows your test email. Save address, city, state, PIN and phone.
6. Return to Cart; increase and decrease quantities; refresh browser to confirm persistence.
7. Open `account.html?checkout=1`, submit the **order request** with valid delivery details. Confirm status `awaiting_pricing_and_availability` and **no payment**.
8. Check **Order history** and confirm the cart is now cleared.
9. **Sign out**, then sign in again. Check order history remains.
10. Open Contact and send a test enquiry of at least 10 characters.
11. In your private Sheet, verify the corresponding `Customers`, `Carts`, `Orders`, `Enquiries` records were created.
12. Test **mobile viewport** and desktop viewport; confirm menus and account buttons remain operable.

The automated `npm test` uses a simulated Apps Script server and **does not** prove connectivity to your real Google account. Step 7 and the Sheet check in Step 8 are mandatory for live acceptance.

## Step 9 — Push source to GitHub (no force push)

The connected GitHub account did not expose an existing SARKSH FOODS repository. Create a **private** repository yourself, or identify the intended existing one. **Do not use `git push --force`.**

For a brand-new **empty** repository, in the website folder:

```powershell
git init -b main
git remote add origin "https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git"
git status --short
git check-ignore .env apps-script/.clasp.json
git add .
git diff --cached --check
git commit -m "SARKSH FOODS V28: add Apps Script Sheets backend and Node bridge"
git push -u origin main
```

**Replace the placeholder** GitHub URL with your actual repository. If the repository **already has commits**, clone it first, copy the V28 files into the clone (excluding the clone's `.git`), review `git diff`, commit and `git push` to a branch; do **not** overwrite the existing remote history.

Verify GitHub after push:

```powershell
git remote -v
git log -1 --oneline
git status --short
git ls-remote --heads origin main
```

`git status --short` should be empty. You should see your commit in GitHub's web UI.

### For existing repositories — safer PowerShell alternative

```powershell
cd "$HOME\Desktop"
git clone "https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git" Sarksh-Foods-Deploy
$src = "$HOME\Desktop\SARKSH_FOODS_V28_APPS_SCRIPT_GIT_READY"
$dst = "$HOME\Desktop\Sarksh-Foods-Deploy"
robocopy $src $dst /E /XD .git node_modules data /XF .env .clasp.json .clasprc.json
if ($LASTEXITCODE -ge 8) { throw "Robocopy failed: $LASTEXITCODE" }
cd $dst
git switch -c feature/v28-apps-script-backend
git add .
git diff --cached --check
git commit -m "Add V28 Apps Script backend without frontend redesign"
git push -u origin feature/v28-apps-script-backend
```

This puts the change on a reviewable branch. Merge using GitHub's Pull Request interface after review. **Never copy a `.env` file or `.git` directory from the source folder.**

## Step 10 — Public hosting / go-live checklist

The GitHub push stores your code; it does **not** deploy Apps Script automatically and GitHub Pages cannot execute Node. To activate customer accounts on a public URL, deploy this website server to an HTTPS Node host and set the same private environment values there:

`SARKSH_BACKEND=apps_script`, `SARKSH_GAS_URL`, `SARKSH_GAS_SECRET`, `COOKIE_SECURE=true`, `HOST=0.0.0.0`, `PORT=<provided by host>`.

Point the public domain at the Node host, **not** at a static GitHub Pages deployment, for account/cart/order operations. Test HTTPS cookies, login, session persistence, and enquiry records again after deployment.

**Production limitations to resolve before real customer launch:** This V28 bridge keeps login sessions in Node memory (a restart logs everyone out); no email verification/password reset, no durable centralized rate-limiter, no backups or deletion policy, and no payment gateway. Sheets is suitable for a controlled MVP, not high-volume commerce. Add persistent session storage, account recovery, privacy controls, monitoring, backups, and security review before exposing real customer data.

## Troubleshooting

- **SARKSH FOODS V25/V26 shown in old terminal:** close the old server first. V28 uses default port `5242`.
- **`503` on `/api/health`:** check Apps Script deployment access, Script properties, URL and secret; verify OAuth authorization ran.
- **`clasp push` says API disabled:** enable Apps Script API under Google Apps Script user settings and re-run `clasp login`.
- **CORS errors from GitHub Pages:** you are trying to use the static site as the backend. Use the Node host for all account operations.
- **`git push` rejected (non-fast-forward):** do not force. Clone the latest repository and submit a branch/PR.
- **`npm install` says zero packages:** expected; the website runtime is dependency-free.
- **Order not priced:** intentional. Only a quotation request is recorded; no money has been collected.
