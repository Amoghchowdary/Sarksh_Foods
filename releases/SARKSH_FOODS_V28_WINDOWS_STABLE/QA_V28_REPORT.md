# SARKSH FOODS V28 — Verification report

Release: V28 Windows Stable (based on V27, with the approved V26 frontend preserved)

## Root cause and correction

- On the user's Windows installation, the V27 integration test failed while spawning the separate `C:\Program Files\nodejs\node.exe` subprocess (`ENOENT`). The server itself started successfully.
- A missing executable, inaccessible working directory, or Windows process-launch restriction can surface as `ENOENT`. The exact environmental cause was not independently diagnosed on the user's PC.
- V28 removes the subprocess entirely from the Apps Script integration test. `server.mjs` exports `createAppServer()` and the test invokes the full HTTP request flow on an OS-assigned local port in-process. The `npm run dev` entry point remains unchanged.
- Additional preflight now verifies the required runtime files, Node 20+, active port availability, and configuration sourced from `.env`.

## Completed validation (Linux Node 22 environment)

1. `npm run check` — passed.
2. `npm test` — five tests passed, zero failures (Apps Script datastore simulations, authenticated customer flow, CSRF, cart merge, order requests, legacy local commerce flow).
3. `npm run doctor` — passed with port 5242 free.
4. Live local `node server.mjs` test — returned `SARKSH FOODS V28` and `backend: local-preview`.
5. HTTP status 200 checks — root + nine named HTML pages, original logo, animated hero media, frontend JS and CSS.
6. Doctor port-conflict test — correctly rejected the occupied 5242 port.
7. `VERIFY_V27_PRESERVATION.mjs` and `scripts/v28-preservation.mjs` — all 77 original approved frontend files unchanged.

## Outstanding validation

- A Windows-native test run must still be executed on the user's PC. Linux tests do not establish that every Windows installation/configuration is error-free.
- Live Google authorization and Apps Script Sheet read/write are not exercised by local simulated tests.
- Actual production deployment to a separate HTTPS Node host, GitHub integration, and live payments have not been performed.
- The existing production GitHub `main` repository is a separate Vite/TypeScript website and must not be overwritten with this HTML/Node snapshot without an integration review.
