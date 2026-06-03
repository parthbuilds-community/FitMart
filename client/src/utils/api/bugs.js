import { apiFetch } from '../../lib/apiClient';

/**
 * Fetch all bug reports
 * @param {string} token - Firebase ID token
 * @returns {Promise<Array>} Array of bug objects
 */
export async function getBugs(token) {
  const data = await apiFetch('/api/bugs', {
    headers: { Authorization: `Bearer ${token}` }
  });

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
  return await apiFetch(`/api/bugs/${id}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: { status }
  });
}
