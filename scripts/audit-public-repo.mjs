import { readdir, readFile, stat } from "node:fs/promises";
import { resolve, relative } from "node:path";

const root = process.cwd();
const forbiddenDirs = ["apps-script", "private-backend", "private", "secrets", "credentials", "data"];
const forbiddenEnv = [".env", ".env.local", ".env.production", ".env.production.local"];
const sensitiveFilePatterns = [
  /client_secret.*\.json$/i,
  /credentials.*\.json$/i,
  /service[-_]?account.*\.json$/i,
  /google-credentials.*\.json$/i,
  /firebase-admin.*\.json$/i,
  /secrets.*\.json$/i,
  /\.(pem|key|p12|pfx)$/i,
];
const textLeakPatterns = [
  { re: /https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]{20,}\/exec/g, label: "hardcoded Apps Script deployment URL" },
  { re: /AKfy[A-Za-z0-9_-]{20,}/g, label: "Apps Script deployment token" },
  { re: /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/g, label: "private key" },
  { re: /"type"\s*:\s*"service_account"/g, label: "Google service-account credential" },
  { re: /ADMIN_PASSWORD_(?:HASH|SALT)/g, label: "admin password material" },
  { re: /AUTH_PEPPER|SESSION_PEPPER/g, label: "backend pepper material" },
];

const failures = [];
for (const name of forbiddenDirs) {
  try {
    if ((await stat(resolve(root, name))).isDirectory()) failures.push(`private directory present: ${name}/`);
  } catch {}
}
for (const name of forbiddenEnv) {
  try { await stat(resolve(root, name)); failures.push(`private environment file present: ${name}`); } catch {}
}

async function walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (["node_modules", "dist", ".git"].includes(entry.name)) continue;
    const full = resolve(dir, entry.name);
    const rel = relative(root, full).replaceAll("\\", "/");
    if (entry.isDirectory()) {
      await walk(full);
      continue;
    }
    if (rel === "scripts/audit-public-repo.mjs") continue;
    if (sensitiveFilePatterns.some((re) => re.test(entry.name))) {
      failures.push(`sensitive filename present: ${rel}`);
      continue;
    }
    const ext = entry.name.split(".").pop()?.toLowerCase();
    if (!["ts","tsx","js","mjs","json","md","html","css","yml","yaml","txt","xml","example"].includes(ext || "")) continue;
    let text;
    try { text = await readFile(full, "utf8"); } catch { continue; }
    for (const item of textLeakPatterns) {
      item.re.lastIndex = 0;
      if (item.re.test(text)) failures.push(`${rel}: contains ${item.label}`);
    }
  }
}
await walk(root);

if (failures.length) {
  console.error("\nPublic repository security audit failed:\n");
  failures.forEach((x) => console.error(`- ${x}`));
  process.exit(1);
}
console.log("Public repository security audit passed.");
console.log("- no Apps Script source");
console.log("- no real .env files");
console.log("- no hardcoded Apps Script deployment URL");
console.log("- no common credential/private-key files");
