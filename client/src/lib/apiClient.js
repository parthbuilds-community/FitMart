// src/lib/apiClient.js
import { getAuthHeaders } from "../utils/getAuthHeaders";

const BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";
export const API_BASE = BASE;

async function buildHeaders(custom = {}, useAuth = true) {
  const headers = { ...(custom || {}) };
  if (useAuth) {
    const authHeaders = await getAuthHeaders();
    Object.assign(headers, authHeaders);
  }
  if (!headers["Content-Type"]) headers["Content-Type"] = "application/json";
  return headers;
}

async function request(path, { method = "GET", body, headers = {}, auth = true, credentials = "include", ...rest } = {}) {
  const url = path.startsWith("http") ? path : `${BASE}${path}`;
  const finalHeaders = await buildHeaders(headers, auth);
  const opts = { method, headers: finalHeaders, credentials, ...rest };
  if (body !== undefined && body !== null) {
    if (body instanceof FormData) {
      // Let fetch set the correct multipart boundary
      delete opts.headers["Content-Type"];
      opts.body = body;
    } else if (typeof body === "string") {
      opts.body = body;
    } else {
      opts.body = JSON.stringify(body);
    }
  }

  const res = await fetch(url, opts);
  const text = await res.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch (e) { data = text; }
  if (!res.ok) {
    const err = new Error(data?.error || res.statusText || "API request failed");
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

export const apiClient = {
  request,
  get: (path, opts) => request(path, { method: "GET", ...opts }),
  post: (path, body, opts) => request(path, { method: "POST", body, ...opts }),
  put: (path, body, opts) => request(path, { method: "PUT", body, ...opts }),
  del: (path, body, opts) => request(path, { method: "DELETE", body, ...opts }),
};

export default apiClient;
