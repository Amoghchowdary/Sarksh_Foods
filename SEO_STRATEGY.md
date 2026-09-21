# SARKSH Foods V8.5 SEO / Indexing / AEO / GEO Strategy

Canonical production origin: **https://www.sarkshfoods.in**

## Indexing objective

V8.5 is designed to make the public SARKSH Foods storefront unambiguous to crawlers. It does not attempt to manipulate rankings with hidden keywords or doorway pages. The technical goal is to provide one canonical host, crawlable initial HTML, consistent brand/product entities, descriptive internal links, structured data and dedicated sitemap files.

Search Console can take time to populate a new property's Page indexing report. The operational check is therefore the live URL, response/canonical metadata, robots rules, sitemap discovery and URL Inspection—not whether the aggregate report is already populated.

## Primary search themes

Public copy and metadata naturally cover:

- SARKSH Foods
- SARKSH Foods Chilli Powder
- chilli powder / chili powder
- red chilli powder
- premium chilli powder India
- red chilli powder 1 kg
- chilli powder for household use
- bulk/commercial chilli powder enquiries
- retail, wholesale, HoReCa, distribution and institutional buying

The product and brand are always connected. Generic product keywords are not presented independently from the actual SARKSH Foods offering.

## Canonical URLs

Primary home:

`https://www.sarkshfoods.in/`

Preferred product URL:

`https://www.sarkshfoods.in/chilli-powder/`

`/products/chilli-powder/` remains usable but its canonical URL is `/chilli-powder/` so duplicate product URLs do not compete with each other.

The legacy apex hostname `https://sarkshfoods.in` is not used as a canonical URL. GitHub Pages/DNS should redirect it to the `www` custom domain. The frontend also contains an early production-host guard as a fallback.

## Crawl-first HTML

The SEO generator writes meaningful initial HTML into `#app` before React hydrates/replaces the content. Search engines therefore receive real page headings, summaries and internal links even before client-side navigation executes.

Every indexable public route receives:

- unique `<title>` and meta description;
- one canonical URL on the `www` origin;
- `index,follow` robots metadata;
- Open Graph and Twitter metadata;
- crawlable H1/summary/internal links;
- route-specific structured data.

`/account/` and `/admin/` remain private transactional routes and are marked `noindex,nofollow,noarchive`.

## Structured data

Generated JSON-LD includes, where appropriate:

- `Brand` — SARKSH Foods;
- `OnlineStore` / Organization identity;
- `WebSite`;
- `WebPage`;
- `BreadcrumbList`;
- `Product` — SARKSH Foods Chilli Powder 1 kg;
- `FAQPage` on the chilli-powder landing page;
- `Service` on enterprise/pan-India commercial pages.

The Product markup does **not** invent price, ratings, reviews or availability. Those fields should be added only when they exist as genuine visible product data.

## Crawler and machine-readable files

Production build creates:

- `robots.txt`
- `sitemap.xml` — master public URL set
- `sitemap-index.xml` — sitemap index
- `sitemap-pages.xml` — public pages
- `sitemap-products.xml` — product landing pages
- `sitemap-images.xml` — logo/product imagery
- `llms.txt`
- `llms-full.txt`
- `brand.json`
- `product-catalog.json`
- `.well-known/site-info.json`

`llms.txt` and JSON entity files are supplementary discovery aids; they are not substitutes for HTML, sitemaps, links or authority.

### IndexNow for non-Google engines

The deployment workflow hosts a public IndexNow ownership key and, after a successful Pages deployment, submits the changed public URLs to the IndexNow endpoint. This accelerates discovery for Bing and other participating engines. It is deliberately non-blocking and is **not** treated as a Google indexing mechanism or a ranking guarantee.

## Image and brand discovery

- official SARKSH Foods logo remains unchanged and crawlable;
- 512×512 favicon remains available;
- main product image uses a descriptive file name and alt text;
- image sitemap ties the product and brand image URLs to public pages;
- `Googlebot-Image` is explicitly allowed for public assets.

## Search Console launch sequence

After V8.5 is deployed and HTTPS/canonical redirects are stable:

1. Open the `sarkshfoods.in` Search Console property.
2. Submit `https://www.sarkshfoods.in/sitemap.xml`.
3. Submit `https://www.sarkshfoods.in/sitemap-index.xml` if you want the split page/product/image sitemaps surfaced explicitly.
4. Use URL Inspection → Test live URL → Request indexing for:
   - `https://www.sarkshfoods.in/`
   - `https://www.sarkshfoods.in/chilli-powder/`
   - `https://www.sarkshfoods.in/products/`
   - `https://www.sarkshfoods.in/about/`
5. Confirm Google's inspected canonical is the `www` URL.
6. Validate `/chilli-powder/` in Google's Rich Results Test after deployment.

Do not submit `/account/` or `/admin/` for indexing.

## Ranking expectations

Technical SEO makes pages crawlable and gives search engines clear brand/product meaning; it cannot guarantee first position for the highly competitive generic query `chilli powder`. Brand searches should become substantially clearer once pages are crawled and indexed. Generic product ranking additionally depends on relevance, authority, links/mentions, engagement, competition and accumulated search signals.

## Authority growth after indexing

Prioritize genuine signals:

1. consistent SARKSH Foods name/logo/product references across owned profiles;
2. retailer, distributor and partner links to the canonical domain;
3. real product reviews/mentions where available;
4. useful spice/chilli storage, usage, sourcing or recipe content based on real information;
5. unique distributor/stockist pages only when local operational information exists;
6. Search Console query data to guide future content—not guessed keyword stuffing.

## Private portal crawl control

`/account/` and `/admin/`:

- receive `noindex,nofollow,noarchive`;
- are excluded from all public sitemaps;
- remain crawlable so search engines can read the page-level `noindex`;
- are not used as product/content destinations.
