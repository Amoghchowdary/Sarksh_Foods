# QA — SARKSH Foods V13

## Finalized design integrity
The following V11.2 design-critical files were SHA-256 compared before and after V13 production work and remained unchanged:

- `src/routes/index.tsx` — `1ddfada08800852c2980f8229a7b02a7dddb894c5fd9e073a0042fffe8a58714`
- `src/components/site/Header.tsx` — `7f4db81e89055f6e72d0a352b44d673c93fe0a966df27110e190723764beeff8`
- `src/components/site/Footer.tsx` — `38e2f487d78ca105498948f64b7c8eea35e935c637eae2bf952b1396f7476aad`
- `src/components/site/BrandIntro.tsx` — `ead6d33d5dbddfaea7efe031cd644150b2c9789fadabfc30699421240e9534e6`
- `src/styles.css` — `df100872d2805fa65d6de073d26017ba1d02832a11a700445926348b68ecb9cc`
- `src/commercial-v11-2-reference.css` — `2173530c1a4d56be9ae8f4e2d3ad85006e121f48f585e95a75db6bf8cba0c32f`
- `public/assets/home-approved-reference-v11-2.webp` — `8cba3bbf53fb544170c5b71d0d3285f89195459b2fdbbb31894b5d2379180992`
- `public/assets/home-approved-reference-v11-2-2x.webp` — `b6c694edc8fc50a876069fd140a013abbb873330b565954944a34e7e20647f21`
- `public/assets/home-approved-reference-v11-2-4x.webp` — `745736b51c7786db6f743d087499d9db1c6504013c32d151f7c6e049ef6aa4c9`
- `public/assets/logos/sarksh-foods-logo.svg` — `ef9f0176849e8bf5133b04b9845dd63081b6ec85426382d10c028149907b3a7b`

Changed design-critical files: none.

## Public Git security
- `apps-script/` absent from public package
- `data/` absent from public package
- real `.env` files absent
- `.env.production.example` contains placeholders only
- hardcoded production Apps Script deployment URL absent
- public workflow injects backend URL from GitHub Actions secret
- security audit script included

## Search/discovery
- canonical host set to `https://www.sarkshfoods.in`
- SEO/AEO/GEO generator upgraded
- page/product/image sitemaps + sitemap index
- Product/Organization/Brand/FAQ/Breadcrumb/ItemList/Service JSON-LD
- crawl-first semantic HTML
- `robots.txt` with search/AI crawler access
- `llms.txt`, `llms-full.txt`, `ai.txt`
- `brand.json`, `product-catalog.json`, `entity.json`
- `.well-known/site-info.json`, `.well-known/security.txt`
- optional IndexNow automation
