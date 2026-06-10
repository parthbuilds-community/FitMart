import apiClient from "../../lib/apiClient";
 || 'http://localhost:5000';

/**
 * Fetch all bug reports
 * @param {string} token - Firebase ID token
 * @returns {Promise<Array>} Array of bug objects
 */
export async function getBugs(token) {
  const res = await apiClient(`/api/bugs`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  
  if (!res.ok) {
    let body = null;
    try { body = res; } catch { body = await res.text(); }
    throw new Error(body?.message || body || `Failed to fetch bugs (${res.status})`);
  }
  
  const data = res;
  return data.bugs || [];
}

/**
 * Update bug status
 * @param {string} id - Bug ID
 * @param {string} status - New status (open, in-progress, resolved)
 * @param {string} token - Firebase ID token
 * @returns {Promise<Object>} Updated bug object
 */
export async function patchBugStatus(id, status, token) {
  const res = await apiClient(`/api/bugs/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ status })
  });
  
  if (!res.ok) {
    let body = null;
    try { body = res; } catch { body = await res.text(); }
    throw new Error(body?.message || body || `Failed to update bug status (${res.status})`);
  }
  
  return res;
}
