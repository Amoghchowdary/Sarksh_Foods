const API_URL = "https://script.google.com/macros/s/AKfycbw_nR3t5gJfE5BOB4F1NduKDL1Mm10ad73BbnXRygL9pWDm-EwqmcegcVyswZimIYTtgA/exec";

try {
  const response = await fetch(API_URL, {
    method: "GET",
    redirect: "follow",
    headers: { "user-agent": "SARKSH-Foods-Production-Preflight/8.4" },
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

  if (String(payload.version || "") !== "8.4") {
    throw new Error(`Backend version ${payload.version || "unknown"} is active. Deploy the V8.4 Apps Script code before publishing the customer portal.`);
  }
  if (!payload.customerAccountsConfigured) {
    throw new Error("Customer account database is not configured. Run setupProductionBackend() after updating Apps Script.");
  }
  if (!payload.adminPasswordConfigured) {
    throw new Error("Admin password is not initialized. Run initializeAdminAccess() once in Apps Script.");
  }

  console.log(`Backend healthy: ${payload.service || "SARKSH Foods API"}`);
  console.log(`Version: ${payload.version || "unknown"}`);
  console.log("Google Sheets database: configured");
  console.log("Google Drive storage: configured");
  console.log("Customer accounts: configured");
  console.log("Admin hashed-password access: configured");
} catch (error) {
  console.error(`Backend health check failed: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
}
