# SARKSH Foods V8.7 QA

## Static validation completed

- TypeScript / TSX syntax: PASS
- CSS parsing: PASS
- JSON parsing: PASS
- GitHub Actions YAML parsing: PASS
- JavaScript / MJS syntax: PASS
- Apps Script JavaScript syntax: PASS
- Internal `@/` imports: PASS
- Hero CTA count: PASS — exactly 2 (`Shop Products`, `Business Orders`)
- Official logo integrity: PASS — SHA-256 matches the uploaded master vector exactly
- BrandIntro component integrity: PASS — mechanism/source unchanged from V8.6
- Apps Script backend source integrity: PASS — unchanged from V8.6
- SEO generator integrity: PASS — unchanged from V8.6

## Production validation to run on Windows

The execution environment used to prepare this package cannot retrieve npm dependencies from the public registry, so the final dependency-aware TypeScript/Vite production build should be run on the deployment workstation before Git commit:

```powershell
npm install
npm run typecheck
npm run backend:health

$env:SITE_URL="https://www.sarkshfoods.in"
$env:VITE_API_BASE_URL="https://script.google.com/macros/s/AKfycbw_nR3t5gJfE5BOB4F1NduKDL1Mm10ad73BbnXRygL9pWDm-EwqmcegcVyswZimIYTtgA/exec"

npm run build:prod
npm run verify:prod
```

Expected backend remains version `8.4`.
