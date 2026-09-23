# V13 Search, Answer Engine and AI Discovery Checklist

After deployment:

1. Confirm these URLs return HTTP 200:
   - `/robots.txt`
   - `/sitemap.xml`
   - `/sitemap-pages.xml`
   - `/sitemap-products.xml`
   - `/sitemap-images.xml`
   - `/llms.txt`
   - `/llms-full.txt`
   - `/brand.json`
   - `/product-catalog.json`
   - `/entity.json`
   - `/.well-known/site-info.json`

2. Google Search Console:
   - use the Domain property for `sarkshfoods.in`
   - submit `https://www.sarkshfoods.in/sitemap.xml`
   - inspect and request indexing for `/`, `/chilli-powder/`, `/products/`, `/enterprise/`, `/pan-india/`
   - monitor Page Indexing, Core Web Vitals and Enhancements

3. Rich Results:
   - test `/chilli-powder/` for Product and FAQ structured data
   - fix only factual validation issues; do not invent price, ratings, reviews or availability

4. AI/answer engines:
   - `robots.txt` explicitly allows OAI-SearchBot, ChatGPT-User, GPTBot, ClaudeBot, Claude-User and Google-Extended
   - `llms.txt`, `llms-full.txt`, `brand.json`, `product-catalog.json` and `entity.json` expose concise, consistent public facts

5. Bing and participating engines:
   - set `INDEXNOW_KEY` as a GitHub repository variable
   - V13 publishes the verification key file during build and submits key public URLs after deployment

Indexing and ranking are not guaranteed by technical files alone; authority, links, relevance, user demand and search-engine evaluation still matter.
