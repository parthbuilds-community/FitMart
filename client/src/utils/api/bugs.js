const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

/**
 * Fetch bug reports with optional search, filter, and pagination
 * @param {string} token - Firebase ID token
 * @param {Object} [options] - Query options
 * @param {string} [options.search] - Search term (searches title + description)
 * @param {string} [options.status] - Status filter: open | in-progress | resolved
 * @param {number} [options.page=1] - Page number
 * @param {number} [options.limit=20] - Results per page (max 50)
 * @returns {Promise<{bugs: Array, pagination: {page: number, limit: number, total: number}}>}
 */
export async function getBugs(token, options = {}) {
  const params = new URLSearchParams();
  if (options.search) params.set('search', options.search);
  if (options.status) params.set('status', options.status);
  params.set('page', String(options.page || 1));
  params.set('limit', String(options.limit || 20));
  const qs = params.toString();
  const url = `${API}/api/bugs${qs ? '?' + qs : ''}`;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` }
  });
  
  if (!res.ok) {
    let body = null;
    try { body = await res.json(); } catch { body = await res.text(); }
    throw new Error(body?.message || body || `Failed to fetch bugs (${res.status})`);
  }
  
  return await res.json();
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
