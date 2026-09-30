# SARKSH Foods V14 — SEO Database + Indexing Architecture

## Objective
V14 keeps the approved V11.2/V13 visual system and adds a structured, database-driven search layer. The goal is not to manufacture rankings; it is to give search engines a stronger crawl graph, clearer entity/product data, unique intent-specific pages, and consistent metadata from one source of truth.

## What V14 changes

### 1. Central SEO database
`src/data/seo-database.json` is now the source of truth for:
- canonical pages
- page titles and descriptions
- search intent
- primary and secondary keyword mapping
- sitemap inclusion/exclusion
- schema types
- product facts
- FAQ content
- buying-guide content

Both the browser metadata (`SeoSync`) and production prerendering (`scripts/generate-seo.mjs`) use this database so they cannot silently drift apart.

### 2. New indexable content routes
V14 adds:
- `/chilli-powder-brands-india/`
- `/red-chilli-powder-buying-guide/`
- `/faq/`

These routes are linked from the public footer and are generated as crawlable static HTML during production builds.

### 3. FAQ is used correctly
The FAQ remains useful as visible, people-first content and as a semantic page. It is **not** treated as an indexing shortcut or a guaranteed FAQ rich-result mechanism.

### 4. Product / merchant readiness
The product schema is database-driven. V14 deliberately does **not** invent price, stock, SKU, GTIN, shipping or return policy.

When real public commerce data is available, populate:
`product.merchant` in `src/data/seo-database.json`.

Only then will V14 emit `Offer` markup. This keeps the site eligible for accurate merchant/product enhancements without publishing fabricated data.

### 5. Entity database
V14 publishes:
- `/brand.json`
- `/entity.json`
- `/product-catalog.json`
- `/seo-database.json`
- `/indexing-manifest.json`
- `/.well-known/site-info.json`

These are discovery/support files. Google ranking still depends on the quality, authority and relevance of public pages and external signals.

### 6. Indexing controls
V14 generates:
- `robots.txt`
- `sitemap.xml`
- `sitemap-index.xml`
- `sitemap-pages.xml`
- `sitemap-products.xml`
- `sitemap-images.xml`
- `sitemap.txt`
- accurate build/commit `lastmod` values

`/account/` and `/admin/` remain `noindex` and are excluded from sitemaps.

### 7. CI validation
Production deployment now verifies the SEO database before building. It also checks live crawl endpoints after GitHub Pages deployment.

## Important commercial SEO reality
A page cannot become the “best brand” in Google merely because the phrase is placed in FAQ or structured data. V14 answers that query transparently and builds relevant content around the buyer's comparison intent. Brand authority then needs to be earned through real product signals, customer demand, links/mentions, Merchant Center/Business Profile consistency, and indexed useful content.

## Next data required for merchant visibility
To activate accurate `Offer` / merchant-listing markup, provide only verified public values for:
- retail price
- availability
- SKU/GTIN if one exists
- shipping policy URL
- return policy URL
- official social/profile URLs for `sameAs`

Do not fill these fields with placeholders in production.
