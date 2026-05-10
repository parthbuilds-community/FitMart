import { getAuthHeaders } from "../utils/getAuthHeaders";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

async function request(endpoint, options = {}) {
  const { method = "GET", body, auth = false, headers = {} } = options;

  const authHeaders = auth ? await getAuthHeaders() : {};

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...authHeaders,
      ...headers,
    },
    credentials: "include",
    body: body ? JSON.stringify(body) : undefined,
  });

  const contentType = response.headers.get("content-type");

  const data = contentType?.includes("application/json")
    ? await response.json()
    : null;

  if (!response.ok) {
    throw new Error(data?.error || data?.message || "API request failed");
  }

  return data;
}

export const apiClient = {
  get: (endpoint, options = {}) =>
    request(endpoint, { ...options, method: "GET" }),

  post: (endpoint, body, options = {}) =>
    request(endpoint, { ...options, method: "POST", body }),

  put: (endpoint, body, options = {}) =>
    request(endpoint, { ...options, method: "PUT", body }),

  delete: (endpoint, options = {}) =>
    request(endpoint, { ...options, method: "DELETE" }),
};