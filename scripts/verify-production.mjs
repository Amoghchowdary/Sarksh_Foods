import { readFile, access } from "node:fs/promises";
import { resolve } from "node:path";

const root = process.cwd();
const dist = resolve(root, "dist");
const DOMAIN = "https://sarkshfoods.in";
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
const failures = [];
const read = (path) => readFile(resolve(dist, path), "utf8");

for (const route of expectedRoutes) {
  const path = route === "/" ? "index.html" : `${route.slice(1)}index.html`;
  try {
    await access(resolve(dist, path));
    const html = await read(path);
    if (!html.includes(`rel="canonical" href="${DOMAIN}${route}"`)) {
      failures.push(`${path}: missing expected canonical ${DOMAIN}${route}`);
    }
    if (/noindex|YOUR[-_ ]|example\.com|localhost|127\.0\.0\.1/i.test(html)) {
      failures.push(`${path}: contains a development/noindex/placeholder value`);
    }
  } catch {
    failures.push(`${path}: missing generated route HTML`);
  }
}

try {
  const adminHtml = await read("admin/index.html");
  if (!/noindex,nofollow,noarchive/i.test(adminHtml)) failures.push("admin/index.html: admin page must be noindex");
  if (!adminHtml.includes(`rel="canonical" href="${DOMAIN}${adminRoute}"`)) failures.push("admin/index.html: canonical is incorrect");
} catch {
  failures.push("admin/index.html: missing generated admin route");
}

const chilli = await read("chilli-powder/index.html");
for (const marker of [
  "Premium Red Chilli Powder 1 kg in India",
  '"@type":"Product"',
  '"@type":"FAQPage"',
  "SARKSH Foods Chilli Powder 1 kg",
]) {
  if (!chilli.includes(marker)) failures.push(`chilli-powder/index.html: missing SEO marker ${marker}`);
}

const robots = await read("robots.txt");
if (!robots.includes("User-agent: *\nAllow: /")) failures.push("robots.txt: production crawling is not enabled");
if (!robots.includes("Disallow: /admin/")) failures.push("robots.txt: admin route is not excluded from crawling");
if (!robots.includes(`Sitemap: ${DOMAIN}/sitemap.xml`)) failures.push("robots.txt: sitemap URL is incorrect");

const sitemap = await read("sitemap.xml");
if (sitemap.includes("localhost") || sitemap.includes("example.com")) failures.push("sitemap.xml: contains a non-production host");
for (const route of expectedRoutes) {
  if (!sitemap.includes(`<loc>${DOMAIN}${route}</loc>`)) failures.push(`sitemap.xml: missing ${route}`);
}
if (sitemap.includes(`${DOMAIN}/admin/`)) failures.push("sitemap.xml: admin route must not be listed");

const llms = await read("llms.txt");
if (!llms.includes(DOMAIN)) failures.push("llms.txt: production domain missing");

const bundleFiles = ["404.html", "sitemap.xml", "robots.txt", "llms.txt", "site.webmanifest"];
for (const file of bundleFiles) {
  try { await access(resolve(dist, file)); } catch { failures.push(`${file}: missing from production artifact`); }
}

if (failures.length) {
  console.error("\nProduction artifact verification failed:\n");
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(`Production artifact verified for ${DOMAIN}.`);
