// src/utils/getAuthHeaders.js
// Returns { Authorization: "Bearer <token>" } for authenticated API calls.
// Import this wherever you make cart/user API requests.

import { auth } from "../auth/firebase";

export async function getAuthHeaders() {
  const user = auth.currentUser;
  if (!user) return { "Content-Type": "application/json" };
  const token = await user.getIdToken();
  return {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`,
  };
}