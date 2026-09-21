export type AppsScriptResponse = { ok?: boolean; message?: string; [key: string]: unknown };

const REQUEST_TIMEOUT_MS = 30_000;

export async function postAppsScript<T extends AppsScriptResponse>(
  endpoint: string,
  payload: Record<string, unknown>,
  label: string,
): Promise<T> {
  const url = endpoint.trim().replace(/\/$/, "");
  if (!url) throw new Error(`${label} backend URL is not configured.`);

  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "content-type": "text/plain;charset=UTF-8" },
      body: JSON.stringify(payload),
      redirect: "follow",
      cache: "no-store",
      credentials: "omit",
      signal: controller.signal,
    });

    const text = await response.text();
    let result: T;
    try {
      result = JSON.parse(text) as T;
    } catch {
      const looksLikeHtml = /^\s*</.test(text);
      throw new Error(
        looksLikeHtml
          ? `${label} service returned an HTML page instead of API data. Check that the Apps Script web app is deployed for public web access and that the current deployment URL is being used.`
          : text.slice(0, 180) || `${label} service returned an invalid response.`,
      );
    }

    if (!response.ok || !result.ok) {
      throw new Error(result.message || `${label} request failed.`);
    }
    return result;
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new Error(`${label} service took too long to respond. Please try again.`);
    }
    if (error instanceof TypeError) {
      throw new Error(`${label} service could not be reached. Check your connection and try again.`);
    }
    throw error;
  } finally {
    window.clearTimeout(timeout);
  }
}

export function requireSessionToken(value: unknown, label = "Login"): string {
  const token = typeof value === "string" ? value.trim() : "";
  if (!token) throw new Error(`${label} succeeded without a usable session. Please sign in again.`);
  return token;
}
