# SARKSH Foods — V13 deploy merge

This package merges the V13 frontend/design/search layer into the currently deployed GitHub Pages repository while preserving the existing deployment/backend mechanism.

## Source of truth
- Frontend/UI/design: `sarksh_foods_brand_v13_public.zip`
- Existing deployment/backend: `Sarksh_Foods-main.zip`

## Preserved from current deployed repository
- `.github/workflows/deploy-pages.yml`
- `apps-script/`
- existing host files in `public/` (`.htaccess`, `_headers`, current verification token where present)
- backend/deployment documentation that is not replaced by V13 equivalents

## Replaced/upgraded from V13
- complete `src/` tree
- `public/assets/`
- V13 root application/build configuration
- V13 scripts for build, SEO, verification, and search checks
- V13 QA/search/release documentation

## Deployment
Push the contents of this folder to the existing repository `main` branch. The existing GitHub Pages workflow will build and deploy `dist/` automatically.

The existing workflow still supplies the production Apps Script endpoint, so no new GitHub secret is required for this merged package.

## Version clarification
V13 is the production/security/search release. Its approved homepage visual is intentionally the locked V11.2 reference design. Therefore, after deploying V13, the homepage should visually match the approved V11.2 artwork while running the V13 code/search layer.

## Validation performed
- V13 TypeScript source check: passed.
- All V13 design-critical hashes in the merged tree exactly match the supplied V13 QA reference.
- Existing GitHub Pages workflow hash/content is preserved from the currently deployed repository.
- Supplied V13 `dist/` passes `verify:prod` and `search:verify`.
- A full local Vite rebuild in this Linux sandbox could not be completed using the uploaded Windows-oriented `node_modules` because Rolldown's Linux native optional binding was absent. GitHub Actions performs a fresh Linux `npm ci`, so it will install the correct platform binding during deployment.
