const host = "www.sarkshfoods.in";
const key = "d8b60c97f1da6c057f2fd80d68cd72ab";
const keyLocation = `https://${host}/${key}.txt`;
const paths = [
  "/",
  "/chilli-powder/",
  "/products/",
  "/enterprise/",
  "/about/",
  "/contact/",
  "/pan-india/",
];
const urlList = paths.map((path) => `https://${host}${path}`);

const response = await fetch("https://api.indexnow.org/indexnow", {
  method: "POST",
  headers: { "content-type": "application/json; charset=utf-8" },
  body: JSON.stringify({ host, key, keyLocation, urlList }),
});

if (!response.ok) {
  const body = await response.text().catch(() => "");
  throw new Error(`IndexNow returned HTTP ${response.status}${body ? `: ${body.slice(0, 200)}` : ""}`);
}

console.log(`IndexNow accepted ${urlList.length} SARKSH Foods URLs.`);
