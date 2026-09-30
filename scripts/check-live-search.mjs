const SITE = "https://www.sarkshfoods.in";
const paths = [
  "/", "/chilli-powder/", "/chilli-powder-brands-india/", "/red-chilli-powder-buying-guide/", "/faq/",
  "/robots.txt", "/sitemap.xml", "/sitemap-pages.xml", "/sitemap.txt", "/seo-database.json", "/indexing-manifest.json",
  "/llms.txt", "/product-catalog.json", "/.well-known/site-info.json"
];
const failures = [];
const bodies = new Map();
for (const path of paths) {
  try {
    const response = await fetch(`${SITE}${path}`, {
      redirect: "follow",
      headers: { "user-agent": "SARKSH-Foods-V14-Live-Search-Check" },
    });
    const body = await response.text();
    bodies.set(path, body);
    if (!response.ok) failures.push(`${path}: HTTP ${response.status}`);
    else if (!body.trim()) failures.push(`${path}: empty response body`);
    else console.log(`${path}: ${response.status}`);
  } catch (error) {
    failures.push(`${path}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

const sitemapIndex = bodies.get("/sitemap.xml") || "";
for (const child of ["sitemap-pages.xml", "sitemap-products.xml", "sitemap-images.xml"]) {
  if (!sitemapIndex.includes(`${SITE}/${child}`)) failures.push(`/sitemap.xml: missing ${child}`);
}
if (!/<sitemapindex[\s>]/i.test(sitemapIndex)) failures.push("/sitemap.xml: sitemap index root element missing");

const pageSitemap = bodies.get("/sitemap-pages.xml") || "";
const locs = [...pageSitemap.matchAll(/<loc>(.*?)<\/loc>/gi)].map((match) => match[1]);
if (!/<urlset[\s>]/i.test(pageSitemap)) failures.push("/sitemap-pages.xml: urlset root element missing");
if (locs.length < 10) failures.push(`/sitemap-pages.xml: expected at least 10 public canonical URLs; found ${locs.length}`);
for (const required of [
  `${SITE}/`, `${SITE}/chilli-powder/`, `${SITE}/products/`, `${SITE}/chilli-powder-brands-india/`,
  `${SITE}/red-chilli-powder-buying-guide/`, `${SITE}/faq/`, `${SITE}/enterprise/`, `${SITE}/pan-india/`,
  `${SITE}/about/`, `${SITE}/contact/`,
]) {
  if (!locs.includes(required)) failures.push(`/sitemap-pages.xml: missing ${required}`);
}

const robots = bodies.get("/robots.txt") || "";
if (!robots.includes(`Sitemap: ${SITE}/sitemap.xml`)) failures.push("/robots.txt: canonical sitemap declaration missing");
if (/Disallow:\s*\/\s*$/m.test(robots)) failures.push("/robots.txt: site-wide crawl block detected");

if (failures.length) {
  console.error("Live search check failed:");
  failures.forEach((x) => console.error(`- ${x}`));
  process.exit(1);
}
console.log(`V14 live crawl endpoints are reachable; sitemap exposes ${locs.length} public canonical pages.`);
