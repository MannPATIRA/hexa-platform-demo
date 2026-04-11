/**
 * Base URL for the standalone Hexa API (no trailing slash).
 * Browser: NEXT_PUBLIC_API_URL; server: same or API_URL.
 * Local split setup: API on port 4000, web on 3000.
 */
export function getApiBaseUrl(): string {
  if (typeof window !== "undefined") {
    return (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000").replace(/\/$/, "");
  }
  const fromEnv =
    process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
  return fromEnv.replace(/\/$/, "");
}

export function apiUrl(path: string): string {
  const base = getApiBaseUrl();
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}${p}`;
}
