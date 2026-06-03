import { getAuthHeaders } from "../utils/getAuthHeaders";

const API_BASE_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/$/, "");

export function buildApiUrl(path) {
  if (/^https?:\/\//i.test(path)) return path;
  return `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

function shouldJsonifyBody(body) {
  if (body == null) return false;
  if (typeof body === "string") return false;
  if (typeof FormData !== "undefined" && body instanceof FormData) return false;
  if (typeof URLSearchParams !== "undefined" && body instanceof URLSearchParams) return false;
  if (typeof Blob !== "undefined" && body instanceof Blob) return false;
  if (body instanceof ArrayBuffer) return false;
  if (ArrayBuffer.isView(body)) return false;
  return true;
}

async function parseResponseData(response) {
  if (response.status === 204 || response.status === 205) return null;

  const text = await response.text();
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function getErrorMessage(data, response, errorMessage) {
  if (errorMessage) return errorMessage;
  if (data && typeof data === "object") {
    if (data.error) return data.error;
    if (data.message) return data.message;
  }
  if (typeof data === "string" && data.trim()) return data;
  return `Request failed with status ${response.status}`;
}

export async function apiFetch(
  path,
  { auth = false, body, headers, throwOnError = true, errorMessage, ...options } = {}
) {
  const requestHeaders = new Headers(headers || {});

  if (auth) {
    const authHeaders = await getAuthHeaders();
    Object.entries(authHeaders || {}).forEach(([key, value]) => {
      if (!requestHeaders.has(key)) {
        requestHeaders.set(key, value);
      }
    });
  }

  const isFormData = typeof FormData !== "undefined" && body instanceof FormData;
  if (isFormData) {
    requestHeaders.delete("Content-Type");
  }

  let requestBody = body;
  if (shouldJsonifyBody(body)) {
    requestBody = JSON.stringify(body);
    if (!requestHeaders.has("Content-Type")) {
      requestHeaders.set("Content-Type", "application/json");
    }
  }

  const response = await fetch(buildApiUrl(path), {
    ...options,
    headers: requestHeaders,
    body: requestBody,
  });

  const data = await parseResponseData(response);

  if (!response.ok) {
    if (!throwOnError) {
      return { ok: false, status: response.status, data, response };
    }

    const error = new Error(getErrorMessage(data, response, errorMessage));
    error.status = response.status;
    error.data = data;
    error.response = response;
    throw error;
  }

  if (!throwOnError) {
    return { ok: true, status: response.status, data, response };
  }

  return data;
}
export default apiFetch;
