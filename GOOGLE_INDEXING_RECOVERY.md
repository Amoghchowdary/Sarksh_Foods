# SARKSH Foods — Google indexing recovery

This release fixes technical discovery gaps but Google indexing still requires Search Console submission and is not instantaneous.

## Required Search Console actions

1. Verify the **Domain property** `sarkshfoods.in` in Google Search Console (DNS verification is preferred).
2. Submit `https://www.sarkshfoods.in/sitemap.xml` in **Sitemaps**.
3. Inspect and request indexing for these canonical URLs:
   - `https://www.sarkshfoods.in/`
   - `https://www.sarkshfoods.in/chilli-powder/`
   - `https://www.sarkshfoods.in/products/`
   - `https://www.sarkshfoods.in/about/`
   - `https://www.sarkshfoods.in/contact/`
4. In URL Inspection, run **Test live URL** and confirm:
   - Page fetch: Successful
   - Crawl allowed: Yes
   - Indexing allowed: Yes
   - User-declared canonical: the same `www.sarkshfoods.in` URL
5. Check **Page indexing** for reasons such as `Discovered - currently not indexed`, `Crawled - currently not indexed`, DNS/server errors, robots blocking, or duplicate/canonical selection.

## GitHub repository variables

Under **Settings → Secrets and variables → Actions → Variables**, set:

- `GOOGLE_SITE_VERIFICATION` — only if using Search Console HTML meta-tag verification. Domain-property DNS verification does not need this variable.
- `INDEXNOW_KEY` — optional override for Bing and other IndexNow participants. The workflow already falls back to the public IndexNow key published by this repository. IndexNow does **not** submit ordinary pages to Google.

## What this hotfix changes

- Adds `<lastmod>` to XML sitemap URLs.
- Publishes a plain-text `sitemap.txt` in addition to the XML sitemap index.
- References `sitemap.txt` from `robots.txt`.
- Wires `INDEXNOW_KEY` into both the production build and post-deploy IndexNow job.
- Adds a post-deploy live crawl-endpoint check.
- Extends production verification to check sitemap freshness/discovery markers.

These changes improve crawl discovery and observability. They cannot guarantee or force Google indexing or ranking.
