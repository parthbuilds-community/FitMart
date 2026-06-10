import { getAuthHeaders } from '../utils/getAuthHeaders';

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

/**
 * A shared HTTP client wrapper that bakes in the API base URL,
 * automatically injects auth headers, serializes JSON payloads,
 * and standardizes error handling.
 */
export async function apiClient(endpoint, options = {}) {
  // Prevent double-prefixing if endpoint already contains API_BASE or is a full URL
  const url = endpoint.startsWith('http') 
    ? endpoint 
    : `${API_BASE}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

  const headers = await getAuthHeaders();

  const config = {
    ...options,
    headers: {
      ...headers,
      ...options.headers,
    },
  };

  // Automatically stringify JSON bodies
  if (
    config.body &&
    typeof config.body === 'object' &&
    !(config.body instanceof FormData)
  ) {
    config.body = JSON.stringify(config.body);
  }

  const response = await fetch(url, config);

  if (!response.ok) {
    let errData;
    try {
      errData = await response.json();
    } catch {
      errData = {};
    }
    throw new Error(errData.error || errData.message || `API Error: ${response.status} ${response.statusText}`);
  }

  // Parse JSON if response is JSON, otherwise return text
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    return response.json();
  }

  return response.text();
}

export default apiClient;
