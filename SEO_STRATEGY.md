# SARKSH Foods V8.1 SEO / AEO / GEO strategy

Canonical domain: **https://sarkshfoods.in**

## Primary search themes
The site is organized around useful pages rather than repeating keyword lists:
- SARKSH Foods Chilli Powder
- chilli powder / chili powder
- red chilli powder
- premium chilli powder in India
- 1 kg chilli powder
- chilli powder for home
- bulk red chilli powder supplier India
- retail / wholesale / HoReCa / distribution / institutional chilli powder enquiries

## Product SEO
Preferred product URL:
`https://sarkshfoods.in/chilli-powder/`

It contains:
- clear product name and pack size;
- home and commercial buyer routes;
- pan-India supply positioning;
- visible common questions;
- Product and FAQ structured data based on visible page content;
- descriptive product imagery and alt text.

`/products/chilli-powder/` remains functional but points its canonical metadata to `/chilli-powder/` to consolidate duplicate signals.

Do not add fake ratings, reviews, price or availability to structured data. If a public price and stock system are introduced later, add a verified `Offer` to the Product markup for stronger merchant-search eligibility.

## Geographic SEO
`/pan-india/` is the national coverage page. It covers all states/union territories at the entity level and names representative major-city demand areas in visible content.

Do not generate hundreds of substantially similar city pages merely to rank for `chilli powder in <city>`. Create a local page only when it has genuine local value such as a distributor, stockist, delivery SLA, service boundary, local contact point or locally unique content.

The `.in` domain, `en-IN` language metadata, India `areaServed`, pan-India visible content, internal links and Search Console targeting all reinforce the India market without doorway pages.

## AI / answer-engine discoverability
- Consistent entity name: `SARKSH Foods`.
- Consistent product entity: `SARKSH Foods Chilli Powder 1 kg`.
- Organization, WebSite, WebPage, Product, FAQPage and Service structured data.
- Concise, visible question-and-answer content on the product page.
- `llms.txt` provides a compact machine-readable map of canonical facts and URLs.
- No crawler-blocking production robots directives.
- Brand facts and the FSSAI registration number are represented consistently.

`llms.txt` is supplementary, not a substitute for crawlable HTML, structured data, authoritative mentions and links.

## Image SEO
- Main product asset: `sarksh-foods-chilli-powder-1kg-india.webp`.
- Dedicated social-sharing image.
- Product-specific alt text.
- Production robots metadata allows large image previews.

## Authority growth after launch
Technical SEO creates eligibility, not authority. Prioritize:
1. verified Google Business / brand profiles where appropriate;
2. retailer, distributor and partner links to `sarkshfoods.in`;
3. genuine product reviews and mentions;
4. useful chilli/spice storage, use and sourcing content backed by real information;
5. recipe content where the product is genuinely relevant;
6. real stockist/distributor pages with unique local information;
7. brand searches, repeat visitors and direct demand.

## Measurement
In Search Console monitor:
- indexing and canonical selection;
- impressions/CTR for `SARKSH Foods`;
- `chilli powder`, `red chilli powder` and `chili powder` query groups;
- state/city query growth;
- product-page Core Web Vitals;
- rich-result / structured-data warnings;
- backlinks and referring domains.

Do not judge ranking from the first few days. Build authority and update content using actual Search Console query data.

## Private portal crawl control (V8.4)

The production administration portal is intentionally excluded from public search discovery:

- `/admin/` receives `noindex,nofollow,noarchive`
- `/admin/` is excluded from `sitemap.xml`
- `robots.txt` includes `Disallow: /admin/`
- the public SEO strategy never links the admin route as a product/content destination

This protects the crawl budget and keeps administrative surfaces out of search results while leaving the customer-facing domain fully crawlable.


### Customer account privacy

`/account/` is a transactional customer portal, not an SEO landing page. It is generated with `noindex,nofollow,noarchive`, excluded from `sitemap.xml`, and disallowed in `robots.txt`. Public product/category pages remain the SEO surfaces.
