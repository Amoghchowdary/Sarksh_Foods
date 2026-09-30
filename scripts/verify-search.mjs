import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
const dist = resolve(process.cwd(), "dist");
const required = {
  "robots.txt": ["Google-Extended", "sitemap.xml", "sitemap.txt"],
  "llms.txt": ["SARKSH Foods", "Chilli Powder", "chilli-powder-brands-india"],
  "llms-full.txt": ["Which is the best chilli powder brand in India?", "There is no single best brand"],
  "product-catalog.json": ["SARKSH Foods Chilli Powder", "merchantListingReady"],
  "entity.json": ['"@type": "Product"', '"@type": "Organization"'],
  "seo-database.json": ["chilli powder brands in India", "red chilli powder buying guide"],
  "indexing-manifest.json": ["indexableUrls", "primaryKeyword"],
};
const failures = [];
for (const [file, markers] of Object.entries(required)) {
  let text = "";
  try { text = await readFile(resolve(dist, file), "utf8"); } catch { failures.push(`${file} missing`); continue; }
  for (const marker of markers) if (!text.includes(marker)) failures.push(`${file}: missing ${marker}`);
}
if (failures.length) {
  console.error("V14 search readiness verification failed:");
  failures.forEach((x) => console.error(`- ${x}`));
  process.exit(1);
}
console.log("V14 search readiness verified: structured SEO database + crawl endpoints + answer-engine files present.");
