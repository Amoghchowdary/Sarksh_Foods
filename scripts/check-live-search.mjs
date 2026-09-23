const SITE = "https://www.sarkshfoods.in";
const paths = ["/", "/chilli-powder/", "/robots.txt", "/sitemap.xml", "/llms.txt", "/product-catalog.json", "/.well-known/site-info.json"];
const failures = [];
for (const path of paths) {
  try {
    const response = await fetch(`${SITE}${path}`, { redirect: "follow", headers: { "user-agent": "SARKSH-Foods-V13-Live-Search-Check" } });
    if (!response.ok) failures.push(`${path}: HTTP ${response.status}`);
    else console.log(`${path}: ${response.status}`);
  } catch (error) {
    failures.push(`${path}: ${error instanceof Error ? error.message : String(error)}`);
  }
}
if (failures.length) {
  console.error("Live search check warnings:");
  failures.forEach((x) => console.error(`- ${x}`));
  process.exit(1);
}
console.log("Live crawl endpoints are reachable.");
