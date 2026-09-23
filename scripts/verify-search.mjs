import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
const dist = resolve(process.cwd(), "dist");
const required = {
  "robots.txt": ["OAI-SearchBot", "ClaudeBot", "Google-Extended", "sitemap.xml"],
  "llms.txt": ["SARKSH Foods", "Chilli Powder", "23626023001557"],
  "llms-full.txt": ["Answer-ready product summary", "Common questions"],
  "product-catalog.json": ["SARKSH Foods Chilli Powder", "1 kg"],
  "entity.json": ['"@type": "Product"', '"@type": "Organization"'],
};
const failures = [];
for (const [file, markers] of Object.entries(required)) {
  let text = "";
  try { text = await readFile(resolve(dist, file), "utf8"); } catch { failures.push(`${file} missing`); continue; }
  for (const marker of markers) if (!text.includes(marker)) failures.push(`${file}: missing ${marker}`);
}
if (failures.length) {
  console.error("Search readiness verification failed:");
  failures.forEach((x) => console.error(`- ${x}`));
  process.exit(1);
}
console.log("Search readiness verified: SEO + answer-engine + AI crawler discovery files present.");
