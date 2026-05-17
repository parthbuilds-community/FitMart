import { getAuthHeaders } from "../utils/getAuthHeaders";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export class ApiError extends Error {
  constructor(message, { status, data } = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

export function apiUrl(path = "") {
  if (/^https?:\/\//i.test(path)) return path;
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
}

function isFormData(body) {
  return typeof FormData !== "undefined" && body instanceof FormData;
}

function isPlainObject(body) {
  const isBlob = typeof Blob !== "undefined" && body instanceof Blob;
  const isArrayBuffer = typeof ArrayBuffer !== "undefined" && body instanceof ArrayBuffer;
  return body && typeof body === "object" && !isFormData(body) && !isBlob && !isArrayBuffer;
}

async function parseResponseBody(response) {
  const contentType = response.headers.get("content-type") || "";
  if (response.status === 204) return null;
  if (contentType.includes("application/json")) return response.json();
  const text = await response.text();
  return text || null;
}

export async function apiFetch(path, options = {}) {
  const { auth = false, headers, body, ...fetchOptions } = options;
  const requestHeaders = new Headers(auth ? await getAuthHeaders() : undefined);

  if (headers) {
    new Headers(headers).forEach((value, key) => requestHeaders.set(key, value));
  }

  let requestBody = body;
  if (isPlainObject(body)) {
    requestBody = JSON.stringify(body);
    if (!requestHeaders.has("Content-Type")) {
      requestHeaders.set("Content-Type", "application/json");
    }
  }

  if (isFormData(requestBody)) {
    requestHeaders.delete("Content-Type");
  }

  return fetch(apiUrl(path), {
    ...fetchOptions,
    headers: requestHeaders,
    body: requestBody,
  });
}

export async function apiRequest(path, options = {}) {
  const response = await apiFetch(path, options);
  const data = await parseResponseBody(response);

  if (!response.ok) {
    const message = data?.error || data?.message || `HTTP ${response.status}`;
    throw new ApiError(message, { status: response.status, data });
  }

  return data;
}
