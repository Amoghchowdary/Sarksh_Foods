const API_URL = (process.env.VITE_API_BASE_URL || "").trim();
const appsScriptPattern = /^https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]{20,}\/exec$/;

if (!appsScriptPattern.test(API_URL)) {
  console.error("Backend health check failed: VITE_API_BASE_URL is not configured.");
  process.exit(1);
}

try {
  const response = await fetch(API_URL, {
    method: "GET",
    redirect: "follow",
    headers: { "user-agent": "SARKSH-Foods-V13-Production-Preflight" },
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
  if (!payload.databaseConfigured) throw new Error("Google Sheets database is not configured.");
  if (!payload.driveConfigured) throw new Error("Google Drive storage is not configured.");
  if (String(payload.version || "") !== "8.4") throw new Error(`Unexpected backend version ${payload.version || "unknown"}.`);
  if (!payload.customerAccountsConfigured) throw new Error("Customer account database is not configured.");
  if (!payload.adminPasswordConfigured) throw new Error("Admin password is not initialized.");

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
