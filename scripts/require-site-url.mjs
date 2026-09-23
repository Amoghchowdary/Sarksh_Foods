const SITE_URL = "https://www.sarkshfoods.in";
const siteUrl = (process.env.SITE_URL || "").trim().replace(/\/$/, "");
const apiUrl = (process.env.VITE_API_BASE_URL || "").trim();

const placeholderPattern = /(__SET_|YOUR[-_ ]|example\.com|localhost|127\.0\.0\.1|REPLACE)/i;
const appsScriptPattern = /^https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]{20,}\/exec$/;
const errors = [];

if (siteUrl !== SITE_URL) {
  errors.push(`SITE_URL must be exactly ${SITE_URL} for production.`);
}
if (!appsScriptPattern.test(apiUrl) || placeholderPattern.test(apiUrl)) {
  errors.push("VITE_API_BASE_URL must be supplied securely at build time as a valid Apps Script /exec URL.");
}

if (errors.length) {
  console.error("\nProduction environment is incomplete:\n");
  errors.forEach((error) => console.error(`- ${error}`));
  console.error("\nFor local interface testing, run npm run dev. For production validation, set the environment values first.\n");
  process.exit(1);
}

console.log(`Production domain verified: ${SITE_URL}`);
console.log("Backend endpoint supplied at build time: yes");
