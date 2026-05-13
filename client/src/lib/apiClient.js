import { getAuthHeaders } from "../utils/getAuthHeaders";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

async function request(endpoint, options = {}) {
  const {
    method = "GET",
    body,
    headers = {},
    auth = false,
  } = options;

  const authHeaders = auth ? await getAuthHeaders() : {};
  const isFormData = body instanceof FormData;

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method,
    credentials: "include",
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...authHeaders,
      ...headers,
    },
    body:
      body == null
        ? undefined
        : isFormData
        ? body
        : JSON.stringify(body),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || data.error || "Something went wrong");
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

  patch: (endpoint, body, options = {}) =>
    request(endpoint, { ...options, method: "PATCH", body }),

  delete: (endpoint, options = {}) =>
    request(endpoint, { ...options, method: "DELETE" }),
};