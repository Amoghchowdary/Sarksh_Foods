const API_URL = "https://script.google.com/macros/s/AKfycbw_nR3t5gJfE5BOB4F1NduKDL1Mm10ad73BbnXRygL9pWDm-EwqmcegcVyswZimIYTtgA/exec";

try {
  const response = await fetch(API_URL, {
    method: "GET",
    redirect: "follow",
    headers: { "user-agent": "SARKSH-Foods-Production-Preflight/8.3" },
  });

  const text = await response.text();
  let payload;
  try {
    payload = JSON.parse(text);
  } catch {
    throw new Error(`Backend returned non-JSON content (HTTP ${response.status}).`);
  }

  if (!response.ok || payload?.ok !== true) {
    throw new Error(payload?.message || `Backend health check failed with HTTP ${response.status}.`);
  }
  if (!payload.databaseConfigured) {
    throw new Error("Backend is reachable, but the Google Sheets database is not configured. Run setupProductionBackend() in Apps Script.");
  }
  if (!payload.driveConfigured) {
    throw new Error("Backend is reachable, but Google Drive storage is not configured. Run setupProductionBackend() in Apps Script.");
  }

  console.log(`Backend healthy: ${payload.service || "SARKSH Foods API"}`);
  console.log(`Version: ${payload.version || "unknown"}`);
  console.log("Google Sheets database: configured");
  console.log("Google Drive storage: configured");
} catch (error) {
  console.error(`Backend health check failed: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
}
