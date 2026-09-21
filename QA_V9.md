# SARKSH Foods V9.0 QA Report

## Completed in build environment

- [x] TS/TSX source syntax parsed successfully across 28 files.
- [x] JavaScript/MJS syntax checks passed.
- [x] Apps Script syntax check passed.
- [x] CSS parsing passed.
- [x] Required JSON, JSONC and GitHub Actions YAML parsing passed.
- [x] Local source imports resolve to existing project files.
- [x] Obsolete V8.6–V8.9 homepage CSS/reference-image implementation is no longer imported or referenced.
- [x] Official SARKSH Foods logo is byte-for-byte unchanged.
- [x] 3D opening animation component is byte-for-byte unchanged.
- [x] Main product photograph is byte-for-byte unchanged.
- [x] Package excludes `node_modules` and `dist`.
- [x] Public copy was revised to avoid internal development terminology.

## Production validation to run on the deployment machine

The build environment cannot retrieve npm packages from the public registry, so run the normal production commands after extraction:

```powershell
npm install
npm run typecheck
npm run backend:health

$env:SITE_URL="https://www.sarkshfoods.in"
$env:VITE_API_BASE_URL="https://script.google.com/macros/s/AKfycbw_nR3t5gJfE5BOB4F1NduKDL1Mm10ad73BbnXRygL9pWDm-EwqmcegcVyswZimIYTtgA/exec"

npm run validate:prod
```

Expected backend version remains `8.4`; V9.0 changes the public website experience and does not require a new database.
