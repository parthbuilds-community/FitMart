import { getAuthHeaders } from "../utils/getAuthHeaders";

const DEFAULT_BASE_URL = "http://localhost:5000";

export const API_BASE_URL = (
  import.meta.env.VITE_API_URL || DEFAULT_BASE_URL
).replace(/\/$/, "");

/** Build a full API URL from a path like `/products` or `cart/uid`. */
export function apiUrl(path = "") {
  let normalized = path.startsWith("/") ? path : `/${path}`;
  if (!normalized.startsWith("/api")) {
    normalized = `/api${normalized}`;
  }
  return `${API_BASE_URL}${normalized}`;
}

/**
 * Fetch wrapper with optional Firebase auth headers.
 * @param {string} path API path or absolute URL
 * @param {RequestInit & { auth?: boolean }} options
 */
export async function apiFetch(path, options = {}) {
  const { auth = false, headers: initHeaders, ...rest } = options;
  const url = path.startsWith("http") ? path : apiUrl(path);

  let headers = initHeaders;
  if (auth) {
    const authHeaders = await getAuthHeaders();
    if (rest.body instanceof FormData) {
      headers = {
        ...(authHeaders.Authorization
          ? { Authorization: authHeaders.Authorization }
          : {}),
        ...(initHeaders || {}),
      };
    } else {
      headers = { ...authHeaders, ...(initHeaders || {}) };
    }
  }

  return fetch(url, {
    credentials: "include",
    ...rest,
    headers,
  });
}
