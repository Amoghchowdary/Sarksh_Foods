# Safe GitHub push — SARKSH FOODS V28

The existing repository `Amoghchowdary/Sarksh_Foods` uses a Vite frontend. To avoid replacing production, commit this entire Node/Apps Script V28 package inside a `releases/` subfolder on a feature branch.

## Windows PowerShell

```powershell
$Source = 'C:\Users\MYPC\Desktop\Sarksh Foods\SARKSH_FOODS_V28_WINDOWS_STABLE'
$Parent = 'C:\Users\MYPC\Desktop\Sarksh Foods'
cd $Source
npm run check
npm test
npm run doctor

cd $Parent
git clone https://github.com/Amoghchowdary/Sarksh_Foods.git SARKSH_FOODS_GIT_DEPLOY
cd "$Parent\SARKSH_FOODS_GIT_DEPLOY"
git fetch origin
git switch main
git pull --ff-only origin main
git switch -c feature/sarksh-v28-windows-stable

$Destination = Join-Path (Get-Location) 'releases\SARKSH_FOODS_V28_WINDOWS_STABLE'
New-Item -ItemType Directory -Force -Path $Destination | Out-Null
robocopy "$Source" "$Destination" /E /XD .git node_modules data /XF .env .env.local .env.production
if ($LASTEXITCODE -ge 8) { throw 'Robocopy failed' }

# Never stage secrets or customer data.
git add releases/SARKSH_FOODS_V28_WINDOWS_STABLE
git diff --cached --check
git status --short
git diff --cached --stat
git commit -m "Add SARKSH FOODS V28 Windows-stable Apps Script integration"
git push -u origin feature/sarksh-v28-windows-stable
```

If the clone folder already exists, open it instead of cloning again. If the branch name already exists, choose a distinct new branch rather than force-push.

This pushes source for review; it does **not** deploy Node APIs to GitHub Pages. Do not merge into `main` until integration and hosting arrangements are reviewed.
