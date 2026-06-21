import { apiClient } from '../../lib/apiClient';

/**
 * Fetch all bug reports
 * @param {string} token - Firebase ID token
 * @returns {Promise<Array>} Array of bug objects
 */
export async function getBugs(token) {
  if (token) {
    return await apiClient.get('/api/bugs', { auth: false, headers: { Authorization: `Bearer ${token}` } });
  }
  return await apiClient.get('/api/bugs');
}

/**
 * Update bug status
 * @param {string} id - Bug ID
 * @param {string} status - New status (open, in-progress, resolved)
 * @param {string} token - Firebase ID token
 * @returns {Promise<Object>} Updated bug object
 */
export async function patchBugStatus(id, status, token) {
  if (token) {
    return await apiClient.request(`/api/bugs/${id}`, {
      method: 'PATCH', auth: false,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status })
    });
  }
  return await apiClient.request(`/api/bugs/${id}`, {
    method: 'PATCH', body: { status }
  });
}
