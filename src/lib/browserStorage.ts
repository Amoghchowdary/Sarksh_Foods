export function readLocal(key: string): string {
  try { return window.localStorage.getItem(key) || ""; } catch { return ""; }
}

export function writeLocal(key: string, value: string): boolean {
  try { window.localStorage.setItem(key, value); return true; } catch { return false; }
}

export function removeLocal(key: string): void {
  try { window.localStorage.removeItem(key); } catch { /* storage can be blocked by browser policy */ }
}

export function readSession(key: string): string {
  try { return window.sessionStorage.getItem(key) || ""; } catch { return ""; }
}

export function writeSession(key: string, value: string): boolean {
  try { window.sessionStorage.setItem(key, value); return true; } catch { return false; }
}

export function removeSession(key: string): void {
  try { window.sessionStorage.removeItem(key); } catch { /* storage can be blocked by browser policy */ }
}
