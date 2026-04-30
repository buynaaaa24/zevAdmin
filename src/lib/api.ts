/** Default matches a backend served over plain HTTP (no TLS on API). */
const DEFAULT_API = "http://103.236.194.106:5000/api";

function normalizeApiBase(raw: string): string {
  let url = raw.trim().replace(/\/+$/, "");
  if (process.env.NEXT_PUBLIC_API_ALLOW_HTTPS === "1") {
    return url;
  }
  if (url.startsWith("https://")) {
    url = `http://${url.slice("https://".length)}`;
  }
  return url.replace(/\/+$/, "");
}

/**
 * Base URL from env (same as before): may end with `/api` when the API is mounted there.
 * Callers that hit `/api/v1/...` should use {@link joinBackendRequestUrl} to avoid `/api/api/v1`.
 */
export function getApiBaseUrl(): string {
  if (typeof window !== "undefined") {
    // Use local proxy in browser to avoid CORS "Failed to fetch"
    return "/admin/api-proxy/api";
  }

  const env = process.env.NEXT_PUBLIC_API_URL;
  if (env) return normalizeApiBase(env);

  return DEFAULT_API;
}

/**
 * Join base URL with a path that starts with `/api/v1/...`.
 * If base already ends with `/api`, strips the duplicate `/api` prefix from the path.
 */
export function joinBackendRequestUrl(base: string, apiPath: string): string {
  const b = base.replace(/\/+$/, "");
  const p = apiPath.startsWith("/") ? apiPath : `/${apiPath}`;
  if (b.endsWith("/api") && p.startsWith("/api/")) {
    return `${b}${p.slice(4)}`;
  }
  return `${b}${p}`;
}

/**
 * Server-side only: optional direct URL to zev-back (Docker / loopback).
 * Does not read `API_URL` — that name is too generic on many hosts and breaks login.
 */
export function getServerApiBaseUrl(): string {
  const a = process.env.API_INTERNAL_URL?.trim();
  const b = process.env.SERVER_API_URL?.trim();
  if (a) return normalizeApiBase(a);
  if (b) return normalizeApiBase(b);
  return getApiBaseUrl();
}

/**
 * URLs to try from the admin Node process (RSC / Route Handlers). Public hostname often
 * fails from the same machine (hairpin NAT); second entry hits zev-back on loopback.
 * `apiPath` must start with `/api/v1/...`.
 */
export function getBackendUpstreamUrlCandidates(apiPath: string): string[] {
  const primary = joinBackendRequestUrl(getServerApiBaseUrl(), apiPath);
  return [primary];
}

/**
 * Public zev-front origin (no trailing slash). Used in admin for previews of
 * site-relative paths like `/images/…` that are served by the front app, not this admin host.
 */
export function getPublicFrontOrigin(): string {
  return (process.env.NEXT_PUBLIC_FRONT_ORIGIN ?? "http://localhost:5002")
    .trim()
    .replace(/\/$/, "");
}

/** See zev-front `getSocketBaseUrl` — Socket.io is not under `/api`. */
export function getSocketBaseUrl(): string {
  let u = getApiBaseUrl();
  if (u.endsWith("/api")) {
    u = u.slice(0, -4);
  }
  return u.replace(/\/+$/, "");
}
