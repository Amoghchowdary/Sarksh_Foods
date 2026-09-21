# QA — SARKSH Foods V8.9 Reference Landing

## Visual contract
- Desktop homepage uses `public/assets/home-reference-v89.png`, copied byte-for-byte from the approved reference supplied in chat.
- Shop Products and Business Orders remain real clickable links through aligned transparent hit areas.
- Homepage header uses the dark brown / gold reference treatment only on `/`.
- Mobile receives a responsive semantic fallback with the same hierarchy and two CTA routes.

## Protected elements
- `src/components/site/BrandIntro.tsx`: byte-identical to V8.8.
- `public/assets/logos/sarksh-foods-logo.svg`: byte-identical to V8.8.
- Backend/customer/admin/SEO architecture inherited from V8.8 without mechanism changes.

## Static checks completed
- Strict JSON valid; tsconfig JSONC valid.
- All CSS files parsed without syntax errors.
- Local TS/TSX import targets resolved.
- Changed TS/TSX files passed syntax-only TypeScript parsing; unresolved third-party packages are expected in the artifact container because npm package retrieval is unavailable.
- All MJS scripts pass `node --check`.
- Reference image hash matches the supplied reference exactly.

## Required Windows production preflight
Run `npm install`, `npm run typecheck`, `npm run backend:health`, set SITE_URL and VITE_API_BASE_URL, then run `npm run validate:prod` before Git push.
