# SARKSH Foods V13 SEO / AEO / GEO strategy

Canonical domain: **https://www.sarkshfoods.in**

## Product search focus
Primary public entity: **SARKSH Foods Chilli Powder 1 kg**.

Search themes:
- SARKSH Foods
- SARKSH Foods Chilli Powder
- chilli powder / chili powder
- red chilli powder
- premium chilli powder India
- 1 kg chilli powder
- household chilli powder orders
- retail / wholesale / HoReCa / distribution / institutional chilli powder enquiries

Preferred product URL:
`https://www.sarkshfoods.in/chilli-powder/`

`/products/chilli-powder/` remains functional but canonicalizes to `/chilli-powder/`.

## SEO
V13 generates:
- canonical page metadata and `en-IN` hreflang;
- Organization, Brand, WebSite, WebPage, Product, FAQPage, BreadcrumbList, ItemList and Service JSON-LD;
- page, product and image sitemaps plus a sitemap index;
- large-image-preview crawler directives;
- crawl-first semantic HTML before React replaces it;
- descriptive product image metadata and stable product URLs.

No fake price, rating, review or availability is added. Verified commerce data should be added only when it exists publicly.

## AEO
Answer-engine readiness is supported by:
- visible product facts and FAQs;
- concise entity/product descriptions;
- `llms.txt` and `llms-full.txt`;
- `brand.json`, `product-catalog.json` and `entity.json`;
- consistent pack size, FSSAI registration number, product name, brand name and India coverage language.

## GEO / AI discovery
`robots.txt` keeps public content crawlable and explicitly allows known search/AI crawler tokens used by OpenAI, Anthropic and Google. V13 also publishes `ai.txt` and `/.well-known/site-info.json` as supplementary machine-readable discovery resources.

These files improve machine readability but do not guarantee citation, inclusion or ranking.

## Geographic search
`/pan-india/` is the national coverage page. Do not create hundreds of near-identical city doorway pages. Add local pages only when there is genuine local information such as a distributor, stockist, local service boundary or location-specific content.

## Private routes
`/account/` and `/admin/` are excluded from all sitemaps and receive `noindex,nofollow,noarchive`.

They are intentionally **not blocked in robots.txt**, so compliant crawlers can fetch the page-level `noindex` directive. Search privacy is not a security control; authentication remains server-side.

## Measurement
Use Google Search Console to monitor:
- Page Indexing and canonical selection;
- impressions and CTR for brand/product queries;
- product-page Core Web Vitals;
- rich-result/structured-data issues;
- query growth for chilli powder / red chilli powder / chili powder;
- external links and referring domains.

Use IndexNow for Bing and participating engines when `INDEXNOW_KEY` is configured.
