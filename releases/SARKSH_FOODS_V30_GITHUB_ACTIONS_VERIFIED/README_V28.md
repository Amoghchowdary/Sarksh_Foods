# SARKSH FOODS V28 — Windows Stable Integration

Frontend, visual assets, routes and customer UI are carried forward unchanged from the V27 package. Google Apps Script (`apps-script/Code.gs`) and the Node backend (`backend/*.mjs`) remain separate.

## Fixes
- The integration test now runs the real HTTP server in-process rather than spawning `node.exe`, eliminating the Windows `spawn ... ENOENT` dependency.
- The production HTTP server is exposed through `createAppServer()` for testing, without changing frontend routes or UI.
- Added clear port-conflict startup diagnostics.
- Added regression test for native project path and server factory.
- Updated Node version check to 20+ (matching package engines).
- Separate V28 port 5242 to avoid mistaking old V27 instance for the new one.
- Startup and health labels report V28.

## Verify locally on Windows

Open PowerShell inside extracted V28 folder:

```powershell
node --version
npm install
npm run check
npm test
npm run doctor
npm run dev
```

Visit http://127.0.0.1:5242 (unless PORT was explicitly changed).

The default backend mode is local preview. An actual live Apps Script backend requires setting `.env` with a deployed endpoint and secret (see `SETUP_V28_WINDOWS.md` for the complete V28 Google account steps).

## Non-goals and production blockers
- A local or simulated test does not prove the live Apps Script deployment works. Google authorization and real Sheet writes still need user-side testing.
- GitHub Pages cannot host the Node server. Do not push to live `main` without reviewing the existing independent Vite frontend.
- Payments and order pricing remain disabled. Customer session storage is process-local and not production-ready for multiple server replicas.

## Smoke test

After `npm run dev` prints `SARKSH FOODS V28 ready at http://127.0.0.1:5242`, open that address and check `http://127.0.0.1:5242/api/health`. If another version appears, close the older server first.

**Git workflow:** See `GIT_V28_SAFE_PUSH.md` for repository-safe feature-branch commands.
