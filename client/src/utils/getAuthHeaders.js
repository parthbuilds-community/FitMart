// src/utils/getAuthHeaders.js

import { auth } from "../auth/firebase";

/**
 * Returns authentication headers for API requests.
 * In development mode, prefers a local dev token if present.
 * Otherwise, uses Firebase authentication token if user is logged in.
 * @returns {Promise<{Content-Type: string, Authorization?: string}>} Headers object with optional Bearer token
 */
export async function getAuthHeaders() {
  // Development: prefer a local dev token if present
  if (import.meta.env.MODE === 'development') {
    const devToken = localStorage.getItem('dev_token');
    if (devToken) {
      return { "Content-Type": "application/json", "Authorization": `Bearer ${devToken}` };
    }
  }

  const user = auth.currentUser;
  if (!user) return { "Content-Type": "application/json" };
  const token = await user.getIdToken();
  return {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`,
  };
}