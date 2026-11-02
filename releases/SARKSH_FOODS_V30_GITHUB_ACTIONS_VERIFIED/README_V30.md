# SARKSH FOODS V30 — Full-stack QA + GitHub Actions static preview

This is a verified evolution of the V29 archive. **No `.ps1` deployment script is included.** Execute the listed PowerShell commands directly.

## Exact deployment scope
- Existing production Vite + Google Apps Script website at `https://www.sarkshfoods.in/`: **not replaced**.
- V30 approved design at `https://www.sarkshfoods.in/v30/`: static, **noindex**, non-transactional GitHub Pages preview.
- Node.js backend: provided as separate `backend/` modules for local hosting and integration testing; **not runnable on GitHub Pages**.
- Google Apps Script: separate `apps-script/Code.gs` and manifest; not deployed or altered by pushing GitHub.
- Customer logins, live shopping and contact submissions from the static preview explicitly hand off to the established live production website.

## Changes since V29
1. Fixed a measured narrow-screen 360–390 px navigation overflow via an mobile CSS override served by V30 local Node and exported Pages; no desktop or approved source visual files were changed.
2. Added explicit `noindex, nofollow, noarchive`, per-page descriptions, and consistent site branding metadata to *preview HTML only*, avoiding duplicate-content competition with the main site.
3. Removed the unused Node-only commerce JavaScript from the public preview artifact and added verification that no backend or secret files are published.
4. Bounded login password input, added enquiry origin validation, and pruned expired rate/session records in the separate Node BFF.
5. Added a full negative-security HTTP regression test and response hardening headers.
6. Kept the existing Vite build, SEO and backend-health checks in a **single** updated `deploy-pages.yml` workflow, adding only the `/v30/` preview stage.
7. Removed V29 `.ps1` deployment automation from V30; supplied direct PowerShell + Robocopy + Git commands instead.

## Run tests first
```powershell
cd 'C:\Users\MYPC\Desktop\Sarksh Foods\SARKSH_FOODS_V30_GITHUB_ACTIONS_VERIFIED'
node --version
npm install
npm run check
npm test
npm run security:verify
npm run doctor
npm run pages:build
npm run pages:verify
```
For all-in-one CI use `npm run ci:v30` (does not include port doctor).

## Run locally
```powershell
npm run dev
```
Local Node URL: `http://127.0.0.1:5242/`. Close older V28/V29 servers before using the same port. This is a local Node preview; real Sheets integration needs private `.env` configuration and an authorized Apps Script deployment.

## GitHub Actions deploy
Follow `GIT_V30_DIRECT_COMMANDS.md`. It uses the **existing Git deployment folder**, Robocopy, normal Git staging and a direct push to `main`; no PR and no PS1. It does **not** force-push.

## Limitations and required production checks
- GitHub Pages cannot host the Node BFF. V30 preview never claims that its local authentication or order-request API is live.
- The root site continues to use the repository's existing `VITE_API_BASE_URL` GitHub Actions secret and existing Apps Script deployment; this release does not configure or verify those private credentials.
- The Node BFF's sessions and rate buckets are in-process memory. Multi-instance production requires shared session storage, persistent rate limiting, TLS-aware cookie configuration, backups, deployment monitoring and additional security hardening.
- Programmatic and simulated tests are passed, but no test can guarantee absolutely no defects. Run the live post-deployment checklist in the QA report after the GitHub Actions run finishes.
