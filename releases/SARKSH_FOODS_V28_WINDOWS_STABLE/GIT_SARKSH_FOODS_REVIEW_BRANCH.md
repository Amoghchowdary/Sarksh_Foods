# SARKSH FOODS V27 — Safe GitHub integration (verified 31 October 2026)

**Existing public repository:** https://github.com/Amoghchowdary/Sarksh_Foods

**Critical:** GitHub `main` currently contains a Vite/React/TypeScript application with existing Apps Script/customer portal documentation. The V27 folder is a separate standalone HTML/Node project from V26. Do not overwrite `main` or replace existing Apps Script production files. Create a review branch and place this complete V27 release under `releases/` so the public site stays unchanged.

## Before Git

1. Extract the V27 ZIP.
2. Run from extracted website folder: `npm install; npm run check; npm test`.
3. Complete Google Apps Script setup and health test using `SETUP_V27_WINDOWS.md` if you intend live Sheets integration. The simulated tests alone are not live verification.
4. Never commit `.env`, `.clasp.json`, `.clasprc.json`, `data/` or customer data. `Code.gs` is source, not a credential file.

## PowerShell: clone and create review branch

```powershell
$Source = Join-Path $HOME 'Desktop\Sarksh Foods\SARKSH_FOODS_V27_APPS_SCRIPT_GIT_READY'
$Deploy = Join-Path $HOME 'Desktop\Sarksh Foods\Sarksh_Foods_V27_Git_Review'
if (!(Test-Path "$Source\package.json")) { throw "V27 folder not found at $Source. Set `$Source to your actual extraction path." }
if (Test-Path $Deploy) { throw "Review clone already exists: $Deploy. Choose a new folder." }
git clone https://github.com/Amoghchowdary/Sarksh_Foods.git "$Deploy"
if ($LASTEXITCODE -ne 0) { throw 'Clone failed' }
Set-Location $Deploy
git switch -c feature/v27-apps-script-backend
if ($LASTEXITCODE -ne 0) { throw 'Could not create branch' }
$Target = Join-Path $Deploy 'releases\SARKSH_FOODS_V27_APPS_SCRIPT_GIT_READY'
New-Item -ItemType Directory -Force $Target | Out-Null
robocopy "$Source" "$Target" /E /XD .git node_modules data /XF .env .clasp.json .clasprc.json '*.zip'
if ($LASTEXITCODE -ge 8) { throw "Robocopy failed with $LASTEXITCODE" }
git add releases/SARKSH_FOODS_V27_APPS_SCRIPT_GIT_READY
git diff --cached --check
if ($LASTEXITCODE -ne 0) { throw 'Whitespace/diff check failed' }
git status --short
# Review changes before continuing.
git commit -m "Add SARKSH FOODS V27 Apps Script backend in isolated release"
git push -u origin feature/v27-apps-script-backend
```

**After pushing:** open https://github.com/Amoghchowdary/Sarksh_Foods/compare/main...feature/v27-apps-script-backend to inspect and open a pull request. A PR in this form is a **source release**; it does not connect the active Vite site to the new Node BFF and does not deploy a live backend. Do not merge as a production backend replacement without mapping existing React API contracts and production storage migration.

## Verify Git and code

```powershell
git remote -v
git branch --show-current
git status --short
git log -1 --oneline
git ls-remote --heads origin feature/v27-apps-script-backend
```

In GitHub check `releases/SARKSH_FOODS_V27_APPS_SCRIPT_GIT_READY/apps-script/Code.gs`, `backend/gas-client.mjs`, `backend/commerce-gas.mjs` and no `.env` file. Confirm existing root `index.html`, `src/`, `public/`, `package.json` were not changed.

## Important hosting and security

GitHub Pages is static; Node sessions and API endpoints require HTTPS Node hosting. Real customers must not be migrated from the existing production Sheets backend into a new sheet without a deliberate migration. No payments are enabled; this V27 service currently records order requests, not paid orders.
