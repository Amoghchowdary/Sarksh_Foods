import { readFile, access } from "node:fs/promises";
import { resolve } from "node:path";

const root = process.cwd();
const dist = resolve(root, "dist");
const DOMAIN = "https://www.sarkshfoods.in";
const expectedRoutes = ["/", "/chilli-powder/", "/products/", "/enterprise/", "/about/", "/contact/", "/privacy/", "/pan-india/"];
const failures = [];
const read = (p) => readFile(resolve(dist, p), "utf8");

for (const route of expectedRoutes) {
  const path = route === "/" ? "index.html" : `${route.slice(1)}index.html`;
  try {
    await access(resolve(dist, path));
    const html = await read(path);
    if (!html.includes(`rel="canonical" href="${DOMAIN}${route}"`)) failures.push(`${path}: canonical mismatch`);
    if (/noindex|example\.com|localhost|127\.0\.0\.1/i.test(html)) failures.push(`${path}: contains noindex/development placeholder`);
    if (!html.includes('data-crawl-first="true"')) failures.push(`${path}: crawl-first semantic content missing`);
  } catch {
    failures.push(`${path}: missing generated route`);
  }
}

for (const route of ["admin", "account"]) {
  try {
    const html = await read(`${route}/index.html`);
    if (!/noindex,nofollow,noarchive/i.test(html)) failures.push(`${route}: noindex missing`);
  } catch { failures.push(`${route}: route missing`); }
}

const chilli = await read("chilli-powder/index.html");
for (const marker of ['"@type":"Product"', '"@type":"FAQPage"', "SARKSH Foods Chilli Powder 1 kg", "23626023001557"]) {
  if (!chilli.includes(marker)) failures.push(`chilli-powder: missing ${marker}`);
}

const requiredFiles = [
  "404.html", "robots.txt", "sitemap.xml", "sitemap-index.xml", "sitemap-pages.xml", "sitemap-products.xml",
  "sitemap-images.xml", "llms.txt", "llms-full.txt", "ai.txt", "brand.json", "product-catalog.json",
  "entity.json", ".well-known/site-info.json", ".well-known/security.txt", "site.webmanifest",
];
for (const file of requiredFiles) {
  try { await access(resolve(dist, file)); } catch { failures.push(`${file}: missing`); }
}

const robots = await read("robots.txt");
for (const marker of ["User-agent: *", "OAI-SearchBot", "ChatGPT-User", "ClaudeBot", "Google-Extended", `Sitemap: ${DOMAIN}/sitemap.xml`]) {
  if (!robots.includes(marker)) failures.push(`robots.txt: missing ${marker}`);
}
if (/Disallow:\s*\/(admin|account)/i.test(robots)) failures.push("robots.txt should allow crawling so page-level noindex can be read");

const sitemap = await read("sitemap.xml");
for (const file of ["sitemap-pages.xml", "sitemap-products.xml", "sitemap-images.xml"]) {
  if (!sitemap.includes(`${DOMAIN}/${file}`)) failures.push(`sitemap.xml: missing ${file}`);
}

for (const name of ["brand.json", "product-catalog.json", "entity.json"]) {
  try { JSON.parse(await read(name)); } catch { failures.push(`${name}: invalid JSON`); }
}

if (failures.length) {
  console.error("\nProduction artifact verification failed:\n");
  failures.forEach((x) => console.error(`- ${x}`));
  process.exit(1);
}
console.log(`Production artifact verified for ${DOMAIN}.`);
console.log("SEO/AEO/GEO discovery files: verified");
