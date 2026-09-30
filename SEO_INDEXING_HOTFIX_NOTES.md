# SARKSH Foods V13 SEO / Indexing Hotfix — 2026-09-25

No UI/design files were changed.

Technical changes:
- XML page and product sitemaps now include `lastmod`.
- `sitemap.txt` is generated with canonical public URLs.
- `robots.txt` references XML sitemap index and text sitemap.
- GitHub Actions now passes `INDEXNOW_KEY` into the production build and IndexNow submit step, with the already-published public IndexNow key as a fallback.
- Added a post-deployment live crawl endpoint verification job.
- Production verification checks the text sitemap and sitemap freshness markers.
- Added `GOOGLE_INDEXING_RECOVERY.md` with the exact Search Console recovery procedure.

Important diagnosis from the 2026-09-23 V13 GitHub Actions run:
- V13 build and GitHub Pages deployment succeeded.
- `GOOGLE_SITE_VERIFICATION` was empty in the production build.
- The IndexNow job printed `IndexNow skipped: INDEXNOW_KEY is not configured.`

IndexNow is for participating engines and does not replace Google Search Console submission for ordinary pages.
