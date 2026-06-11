// src/utils/getAuthHeaders.js
// Returns { Authorization: "Bearer <token>" } for authenticated API calls.
// Import this wherever you make cart/user API requests.

import { auth } from "../auth/firebase";

export async function getAuthHeaders() {
  // Development: prefer a local dev token if present
  if (import.meta.env.MODE === 'development') {
    const devToken = localStorage.getItem('dev_token');
    if (devToken) {
      return { "Content-Type": "application/json", "Authorization": `Bearer ${devToken}` };
    }
  }

  const user = auth?.currentUser;
  if (!user) return { "Content-Type": "application/json" };
  const token = await user.getIdToken();
  return {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`,
  };
}