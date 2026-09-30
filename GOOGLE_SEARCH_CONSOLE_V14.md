# Google Search Console — V14 Launch Procedure

After V14 is live:

1. Use the verified `sarkshfoods.in` Search Console property.
2. Submit `https://www.sarkshfoods.in/sitemap.xml` in **Sitemaps**.
3. Inspect these URLs one by one using **URL Inspection**:
   - `https://www.sarkshfoods.in/`
   - `https://www.sarkshfoods.in/chilli-powder/`
   - `https://www.sarkshfoods.in/chilli-powder-brands-india/`
   - `https://www.sarkshfoods.in/red-chilli-powder-buying-guide/`
   - `https://www.sarkshfoods.in/faq/`
4. For each URL, use **Test Live URL**. Confirm:
   - HTTP fetch succeeds
   - crawl is allowed
   - indexing is allowed
   - canonical points to the exact `www.sarkshfoods.in` URL
5. If the live test is valid and the URL is not indexed, use **Request indexing** once.
6. Monitor **Page indexing** for the exact exclusion reason. Do not repeatedly request indexing for the same unchanged URL.
7. Review the Product / Merchant listings enhancement reports only after real Offer data is published.

## What V14 does not do
- It does not use Google's restricted Indexing API for ordinary food/product pages.
- It does not treat IndexNow as a Google submission API. IndexNow is for participating search engines; Google discovery is handled by crawlable links, sitemaps and Search Console.
- It does not fabricate reviews, ratings, prices or “best brand” claims.
