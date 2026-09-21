# SARKSH Foods V8.8 QA

## Scope
V8.8 is intentionally a homepage-composition release on top of V8.7. The production backend, customer portal, admin portal, SEO/indexing system, Apps Script contract and protected assets are preserved.

## Static QA completed
- 27 TS/TSX source files parsed with the TypeScript compiler syntax pipeline.
- JavaScript/MJS scripts passed Node syntax checks.
- Apps Script source passed JavaScript syntax validation.
- 15 CSS files parsed with no stylesheet parse errors.
- package.json, tsconfig.json and appsscript.json parsed successfully.
- GitHub Actions workflow parsed successfully as YAML.
- 60 local TypeScript/TSX imports were checked; no missing local imports were found.
- Official SARKSH Foods SVG logo is byte-for-byte identical to V8.7.
- BrandIntro.tsx is byte-for-byte identical to V8.7.
- Main chilli-powder hero photograph is byte-for-byte identical to V8.7.
- Homepage contains exactly one **Shop Products** CTA and one **Business Orders** CTA.
- V8.7 hero quotation was removed from the landing page to match the approved cinematic reference composition.
- `TRADITION / IN EVERY / PINCH` reference-side message is present.

## Build note
External npm package retrieval is unavailable in the artifact environment, so the final `npm install`, TypeScript dependency resolution, Vite production build and production artifact verification must be run on the user's Windows environment before Git push. The project includes the existing `validate:prod` command for that purpose.
