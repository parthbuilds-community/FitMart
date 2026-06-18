const API = import.meta.env.VITE_API_URL;
/**
 * Fetch all bug reports
 * @param {string} token - Firebase ID token
 * @returns {Promise<Array>} Array of bug objects
 */
export async function getBugs(token) {
  const res = await fetch(`${API}/api/bugs`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  
  if (!res.ok) {
    let body = null;
    try { body = await res.json(); } catch { body = await res.text(); }
    throw new Error(body?.message || body || `Failed to fetch bugs (${res.status})`);
  }
  
  const data = await res.json();
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
  const res = await fetch(`${API}/api/bugs/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ status })
  });
  
  if (!res.ok) {
    let body = null;
    try { body = await res.json(); } catch { body = await res.text(); }
    throw new Error(body?.message || body || `Failed to update bug status (${res.status})`);
  }
  
  return await res.json();
}
