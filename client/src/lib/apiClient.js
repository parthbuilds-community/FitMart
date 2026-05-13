import { getAuthHeaders } from "../utils/getAuthHeaders";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export async function apiRequest(endpoint, options = {}) {
  const { auth = false, headers = {}, body, ...restOptions } = options;

  const authHeaders = auth ? await getAuthHeaders() : {};

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...restOptions,
    headers: {
      "Content-Type": "application/json",
      ...authHeaders,
      ...headers,
    },
    body: body && typeof body !== "string" ? JSON.stringify(body) : body,
  });

  let data = null;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    throw new Error(data?.message || data?.error || `API request failed with status ${response.status}`);
  }

  return data;
}

export function getApiUrl(endpoint) {
  return `${API_BASE_URL}${endpoint}`;
}