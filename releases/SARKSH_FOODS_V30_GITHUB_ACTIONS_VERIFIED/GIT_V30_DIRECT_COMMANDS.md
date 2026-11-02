# SARKSH FOODS V30 — Direct PowerShell GitHub Actions deployment (no PS1)

**Repository:** `https://github.com/Amoghchowdary/Sarksh_Foods.git`  
**Deployment:** existing GitHub Actions on `main`; V30 static preview at `/v30/`; existing live root preserved.

## 1. Verify extracted source
```powershell
$Parent = 'C:\Users\MYPC\Desktop\Sarksh Foods'
$Source = Join-Path $Parent 'SARKSH_FOODS_V30_GITHUB_ACTIONS_VERIFIED'
$Deploy = Join-Path $Parent 'SARKSH_FOODS_GIT_DEPLOY'
cd $Source
node --version
npm install
npm run ci:v30
npm run doctor
```
Stop if any check fails. Node.js 20 or newer is required.

## 2. Open your existing deployment folder (clone only if absent)
```powershell
if (!(Test-Path (Join-Path $Deploy '.git'))) {
    git clone https://github.com/Amoghchowdary/Sarksh_Foods.git $Deploy
}
cd $Deploy
git remote -v
git status
git fetch origin
git switch main
git pull --ff-only origin main
```
Confirm origin is `Amoghchowdary/Sarksh_Foods` and the working tree is clean before continuing. Do not reset or force-push.

## 3. Copy the release files into the existing repo
```powershell
$Target = Join-Path $Deploy 'releases\SARKSH_FOODS_V30_GITHUB_ACTIONS_VERIFIED'
New-Item -ItemType Directory -Path $Target -Force | Out-Null
robocopy $Source $Target /E /XD .git node_modules data dist-pages qa-previews /XF .env .env.local .env.production *.ps1 *.zip
if ($LASTEXITCODE -ge 8) { throw 'Robocopy failed; stop before pushing.' }
```
Copy the verified workflow into the **existing** workflow path:
```powershell
Copy-Item (Join-Path $Source '.github\workflows\deploy-pages.yml') (Join-Path $Deploy '.github\workflows\deploy-pages.yml') -Force
```

## 4. Stage, audit, commit and push directly to main
```powershell
cd $Deploy
git add -A -- releases/SARKSH_FOODS_V30_GITHUB_ACTIONS_VERIFIED .github/workflows/deploy-pages.yml
git diff --cached --check
git diff --cached --stat
git status --short
git diff --cached --name-only | Select-String -Pattern '(\.env$|\.ps1$|\.clasp\.json$|(^|/)data/|node_modules/|dist-pages/)' -CaseSensitive
```
The final search must show no private files or generated distribution directories. If it does, unstage them and inspect before committing.

```powershell
git commit -m 'Deploy SARKSH FOODS V30 verified Pages preview'
git push origin main
```
**Do not use** `git push --force`, `git reset --hard`, or a pull-request branch to deploy V30.

## 5. Verify GitHub Actions and live pages
1. Open `https://github.com/Amoghchowdary/Sarksh_Foods/actions`.
2. Select `Deploy SARKSH Foods to GitHub Pages` and verify the newest `main` workflow is green.
3. Open `https://www.sarkshfoods.in/v30/` and check Home, Products, Recipes, Blog, Quality and navigation on desktop and phone.
4. Check `https://www.sarkshfoods.in/` and `/account/` still serve the original Vite frontend and customer portal.
5. Verify the public preview is **not taking account registrations or payments**; its links hand off to the live root store.

If the workflow fails, **do not bypass** the original `backend:health`, SEO or TypeScript checks. Inspect the exact failed job and fix the issue before pushing again.
