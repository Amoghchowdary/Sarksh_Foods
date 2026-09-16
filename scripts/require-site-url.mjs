const SITE_URL = "https://sarkshfoods.in";
const PRODUCTION_API_URL = "https://script.google.com/macros/s/AKfycbw_nR3t5gJfE5BOB4F1NduKDL1Mm10ad73BbnXRygL9pWDm-EwqmcegcVyswZimIYTtgA/exec";
const siteUrl = (process.env.SITE_URL || "").trim().replace(/\/$/, "");
const apiUrl = (process.env.VITE_API_BASE_URL || "").trim();
const googleClientId = (process.env.VITE_GOOGLE_CLIENT_ID || "").trim();

const placeholderPattern = /(YOUR[-_ ]|example\.com|localhost|127\.0\.0\.1)/i;
const validHttps = (value) => /^https:\/\/[A-Za-z0-9.-]+(?::\d+)?(?:\/.*)?$/.test(value);
const errors = [];

if (siteUrl !== SITE_URL) {
  errors.push(`SITE_URL must be exactly ${SITE_URL} for the production build.`);
}

if (!validHttps(apiUrl) || placeholderPattern.test(apiUrl) || apiUrl !== PRODUCTION_API_URL) {
  errors.push(`VITE_API_BASE_URL must be exactly ${PRODUCTION_API_URL} for this production deployment.`);
}

if (!/^\d+-[A-Za-z0-9_-]+\.apps\.googleusercontent\.com$/.test(googleClientId) || placeholderPattern.test(googleClientId)) {
  errors.push(
    "VITE_GOOGLE_CLIENT_ID must be the real Google Identity Services OAuth Web Client ID used by the admin portal.",
  );
}

if (errors.length) {
  console.error("\nProduction environment is incomplete:\n");
  for (const error of errors) console.error(`- ${error}`);
  console.error("\nFor local UI/build verification without the live backend, run: npm run build\n");
  process.exit(1);
}

console.log(`Production domain verified: ${SITE_URL}`);
