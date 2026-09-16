const configuredBase = (import.meta.env.VITE_API_BASE_URL || "").trim().replace(/\/$/, "");

export type ApiResult = {
  ok?: boolean;
  id?: string;
  message?: string;
};

export type ApiSuccessResult = {
  ok: true;
  id: string;
  message?: string;
};

async function parseResult(response: Response): Promise<ApiResult> {
  const text = await response.text();
  if (!text) return { ok: response.ok };
  try {
    return JSON.parse(text) as ApiResult;
  } catch {
    return { ok: response.ok, message: text.slice(0, 200) };
  }
}

export async function submitWebsiteRequest(
  type: "booking" | "enquiry",
  payload: Record<string, unknown>,
): Promise<ApiSuccessResult> {
  const response = configuredBase
    ? await fetch(configuredBase, {
        method: "POST",
        headers: { "content-type": "text/plain;charset=UTF-8" },
        body: JSON.stringify({ action: type, ...payload }),
        redirect: "follow",
      })
    : await fetch(type === "booking" ? "/api/bookings" : "/api/enquiries", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });

  const result = await parseResult(response);
  if (!response.ok || !result.ok || !result.id) {
    throw new Error(result.message || "The request could not be saved.");
  }

  // The guard above establishes a strict success contract for every caller.
  // Returning a fresh object lets TypeScript know that id is always present.
  return {
    ok: true,
    id: result.id,
    ...(result.message ? { message: result.message } : {}),
  };
}
