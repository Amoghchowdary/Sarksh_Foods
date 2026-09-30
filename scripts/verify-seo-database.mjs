import { access, readFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = process.cwd();
const database = JSON.parse(await readFile(resolve(root, "src", "data", "seo-database.json"), "utf8"));
const failures = [];
const warnings = [];

if (database.version !== "14.0.0") failures.push(`SEO database version must be 14.0.0; found ${database.version}`);
if (!Array.isArray(database.pages) || database.pages.length < 10) failures.push("SEO database must contain the complete public/private page registry");
if (!Array.isArray(database.faq) || database.faq.length < 5) failures.push("FAQ database must contain at least five useful questions");

const paths = new Set();
const titles = new Set();
for (const page of database.pages || []) {
  if (!page.path?.startsWith("/") || (page.path !== "/" && !page.path.endsWith("/"))) failures.push(`Invalid canonical path format: ${page.path}`);
  if (paths.has(page.path)) failures.push(`Duplicate page path: ${page.path}`);
  paths.add(page.path);
  if (!page.title || page.title.length < 15) failures.push(`${page.path}: title missing or too short`);
  if (titles.has(page.title)) failures.push(`${page.path}: duplicate title: ${page.title}`);
  titles.add(page.title);
  if (!page.description || (!page.noindex && page.description.length < 70)) failures.push(`${page.path}: meta description missing or too short`);
  if (!page.noindex && !page.primaryKeyword) failures.push(`${page.path}: primary keyword/intention mapping missing`);
  if (page.path !== "/" && !page.noindex && page.canonicalPath === page.path) failures.push(`${page.path}: redundant canonicalPath`);
}

for (const privatePath of ["/account/", "/admin/"]) {
  const page = database.pages.find((p) => p.path === privatePath);
  if (!page?.noindex || !page?.noSitemap) failures.push(`${privatePath}: private route must be noindex and excluded from sitemaps`);
}

for (const requiredPath of ["/", "/chilli-powder/", "/products/", "/chilli-powder-brands-india/", "/red-chilli-powder-buying-guide/", "/faq/", "/enterprise/", "/pan-india/", "/about/", "/contact/"]) {
  if (!paths.has(requiredPath)) failures.push(`Required V14 SEO route missing from database: ${requiredPath}`);
}

const routeFiles = {
  "/chilli-powder-brands-india/": "src/routes/chilli-powder-brands-india.tsx",
  "/red-chilli-powder-buying-guide/": "src/routes/red-chilli-powder-buying-guide.tsx",
  "/faq/": "src/routes/faq.tsx",
};
for (const [route, file] of Object.entries(routeFiles)) {
  try { await access(resolve(root, file)); } catch { failures.push(`${route}: route component missing at ${file}`); }
}

for (const item of database.faq || []) {
  if (!item.id || !item.question || !item.answer) failures.push("FAQ item is missing id/question/answer");
  if ((item.answer || "").length < 35) failures.push(`FAQ answer too thin: ${item.question}`);
}

const bestAnswer = database.faq.find((item) => /best chilli powder brand/i.test(item.question || ""));
if (!bestAnswer) failures.push("FAQ should answer the 'best chilli powder brand' comparison query transparently");
if (bestAnswer && /SARKSH Foods is (the )?best/i.test(bestAnswer.answer)) failures.push("Unsupported best-brand claim detected in FAQ answer");

const merchant = database.product?.merchant || {};
if (!merchant.price || !merchant.availability) {
  warnings.push("Merchant Offer schema is intentionally disabled until a real public price and availability are configured.");
} else if (!merchant.priceCurrency) {
  failures.push("Merchant price is configured but priceCurrency is missing");
}

if (!Array.isArray(database.site?.sameAs) || database.site.sameAs.length === 0) {
  warnings.push("Organization sameAs is empty. Add verified official social/profile URLs when available to strengthen entity reconciliation.");
}

if (failures.length) {
  console.error("\nV14 SEO database verification failed:\n");
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(`V14 SEO database verified: ${database.pages.length} registered pages, ${database.faq.length} FAQ answers.`);
warnings.forEach((warning) => console.warn(`WARNING: ${warning}`));
