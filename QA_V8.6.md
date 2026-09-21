# SARKSH Foods V8.6 QA

## Completed checks
- Official uploaded master logo copied byte-for-byte into `public/assets/logos/sarksh-foods-logo.svg`.
- Approved 3D `BrandIntro.tsx` preserved byte-for-byte from V8.5.
- Approved chilli carton intro assets preserved byte-for-byte from V8.5.
- TypeScript/TSX syntax-transpile check passed across application source files.
- JavaScript/MJS syntax checks passed for production scripts and Apps Script source.
- CSS parsed successfully with PostCSS, including the new V8.6 luxury stylesheet.
- `package.json`, web manifest, Apps Script manifest and `tsconfig`/JSONC structure validated.
- GitHub Actions workflow YAML parsed successfully.
- Local `@/` imports checked for target-file existence.
- Production SEO generator tested against `https://www.sarkshfoods.in`.
- Production artifact verifier passed on the generated crawl/SEO artifact.
- Crawl-first SEO shell rendering bug fixed: browsers now replace the static crawl shell with the React application while search engines still receive semantic initial HTML.

## Environment note
The execution container cannot reach the npm registry or the deployed Apps Script endpoint, so dependency installation and live backend health could not be rerun here. The source uses the same dependency set and backend contract as V8.5. Run `npm install` and `npm run validate:prod` on the production Windows machine before pushing.
