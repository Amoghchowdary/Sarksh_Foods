import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const SITE = "https://www.sarkshfoods.in";
const key = (process.env.INDEXNOW_KEY || "").trim();
if (!/^[A-Fa-f0-9]{8,128}$/.test(key)) {
  console.log("IndexNow skipped: INDEXNOW_KEY is not configured.");
  process.exit(0);
}
const database = JSON.parse(await readFile(resolve(process.cwd(), "src", "data", "seo-database.json"), "utf8"));
const urls = database.pages
  .filter((p) => !p.noindex && !p.noSitemap && !p.canonicalPath)
  .map((p) => `${SITE}${p.path}`);
const payload = {
  host: "www.sarkshfoods.in",
  key,
  keyLocation: `${SITE}/${key}.txt`,
  urlList: urls,
};
try {
  const response = await fetch("https://api.indexnow.org/indexnow", {
    method: "POST",
    headers: { "content-type": "application/json; charset=utf-8" },
    body: JSON.stringify(payload),
  });
  if (![200, 202].includes(response.status)) throw new Error(`HTTP ${response.status}`);
  console.log(`IndexNow submitted ${urls.length} V14 URLs to participating engines (not Google).`);
} catch (error) {
  console.error(`IndexNow submission failed: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
}
