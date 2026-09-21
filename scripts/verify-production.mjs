import { access, readFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = process.cwd();
const dist = resolve(root, "dist");
const DOMAIN = "https://www.sarkshfoods.in";
const LEGACY_ORIGIN = "https://sarkshfoods.in";
const INDEXNOW_KEY = "d8b60c97f1da6c057f2fd80d68cd72ab";
const expectedRoutes = [
  "/",
  "/chilli-powder/",
  "/products/",
  "/enterprise/",
  "/about/",
  "/contact/",
  "/privacy/",
  "/pan-india/",
];

const adminRoute = "/admin/";
const accountRoute = "/account/";
const failures = [];
const read = (path) => readFile(resolve(dist, path), "utf8");

for (const route of expectedRoutes) {
  const path = route === "/" ? "index.html" : `${route.slice(1)}index.html`;
  try {
    await access(resolve(dist, path));
    const html = await read(path);
    if (!html.includes(`rel="canonical" href="${DOMAIN}${route}"`)) failures.push(`${path}: missing expected canonical ${DOMAIN}${route}`);
    if (/noindex|YOUR[-_ ]|example\.com|localhost|127\.0\.0\.1/i.test(html)) failures.push(`${path}: contains a development/noindex/placeholder value`);
    if (!html.includes('data-seo-prerender="true"')) failures.push(`${path}: missing crawl-first semantic HTML`);
    if (html.includes(`rel="canonical" href="${LEGACY_ORIGIN}`)) failures.push(`${path}: still canonicalizes to the non-www hostname`);
  } catch {
    failures.push(`${path}: missing generated route HTML`);
  }
}

for (const [path, route] of [["admin/index.html", adminRoute], ["account/index.html", accountRoute]]) {
  try {
    const html = await read(path);
    if (!/noindex,nofollow,noarchive/i.test(html)) failures.push(`${path}: private page must be noindex`);
    if (!html.includes(`rel="canonical" href="${DOMAIN}${route}"`)) failures.push(`${path}: canonical is incorrect`);
  } catch {
    failures.push(`${path}: missing generated private route`);
  }
}

const chilli = await read("chilli-powder/index.html");
for (const marker of [
  "SARKSH Foods Red Chilli Powder 1 kg",
  '"@type":"Product"',
  '"@type":"FAQPage"',
  '"@type":"Brand"',
  "SARKSH Foods Chilli Powder — Premium Red Chilli Powder 1 kg",
  "chili powder",
]) {
  if (!chilli.includes(marker)) failures.push(`chilli-powder/index.html: missing SEO marker ${marker}`);
}

const home = await read("index.html");
for (const marker of ['"@type":"OnlineStore"', '"@type":"WebSite"', "SARKSH Foods Premium Red Chilli Powder in India"]) {
  if (!home.includes(marker)) failures.push(`index.html: missing brand marker ${marker}`);
}

const robots = await read("robots.txt");
if (!robots.includes("User-agent: *\nAllow: /")) failures.push("robots.txt: production crawling is not enabled");
if (robots.includes("Disallow: /admin/") || robots.includes("Disallow: /account/")) failures.push("robots.txt: private noindex routes must remain crawlable so bots can see the noindex directive");
if (!robots.includes(`Sitemap: ${DOMAIN}/sitemap.xml`)) failures.push("robots.txt: master sitemap URL is incorrect");
if (!robots.includes(`Sitemap: ${DOMAIN}/sitemap-index.xml`)) failures.push("robots.txt: sitemap index URL is incorrect");

const sitemap = await read("sitemap.xml");
if (sitemap.includes("localhost") || sitemap.includes("example.com") || sitemap.includes(`${LEGACY_ORIGIN}/`)) failures.push("sitemap.xml: contains a non-canonical host");
for (const route of expectedRoutes) {
  if (!sitemap.includes(`<loc>${DOMAIN}${route}</loc>`)) failures.push(`sitemap.xml: missing ${route}`);
}
if (sitemap.includes(`${DOMAIN}/admin/`)) failures.push("sitemap.xml: admin route must not be listed");
if (sitemap.includes(`${DOMAIN}/account/`)) failures.push("sitemap.xml: customer account route must not be listed");
if (!sitemap.includes("<lastmod>")) failures.push("sitemap.xml: lastmod is missing");

const sitemapIndex = await read("sitemap-index.xml");
for (const file of ["sitemap-pages.xml", "sitemap-products.xml", "sitemap-images.xml"]) {
  if (!sitemapIndex.includes(`${DOMAIN}/${file}`)) failures.push(`sitemap-index.xml: missing ${file}`);
}

const imageSitemap = await read("sitemap-images.xml");
if (!imageSitemap.includes("sarksh-foods-chilli-powder-1kg-india.webp")) failures.push("sitemap-images.xml: product image missing");

const llms = await read("llms.txt");
if (!llms.includes(DOMAIN)) failures.push("llms.txt: production domain missing");
if (!llms.includes("red chilli powder") || !llms.includes("chili powder")) failures.push("llms.txt: product discovery terms missing");

const requiredFiles = [
  "404.html",
  "sitemap.xml",
  "sitemap-index.xml",
  "sitemap-pages.xml",
  "sitemap-products.xml",
  "sitemap-images.xml",
  "robots.txt",
  "llms.txt",
  "llms-full.txt",
  "brand.json",
  "product-catalog.json",
  ".well-known/site-info.json",
  "site.webmanifest",
  `${INDEXNOW_KEY}.txt`,
];
for (const file of requiredFiles) {
  try { await access(resolve(dist, file)); } catch { failures.push(`${file}: missing from production artifact`); }
}

try {
  const keyFile = (await read(`${INDEXNOW_KEY}.txt`)).trim();
  if (keyFile !== INDEXNOW_KEY) failures.push("IndexNow ownership key file content is incorrect");
} catch {
  failures.push("IndexNow ownership key file could not be read");
}

if (failures.length) {
  console.error("\nProduction artifact verification failed:\n");
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(`Production artifact verified for ${DOMAIN}.`);
