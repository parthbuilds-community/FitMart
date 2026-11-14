// Thin wrapper around the public program catalog endpoints.
// GET /api/programs and GET /api/programs/:id are unauthenticated.

import api from './api';

/**
 * Fetch the program catalog.
 * @param {object} [params] - page, limit, difficulty, tag, search, sort, fields
 */
export function listPrograms(params = {}) {
  return api.get('/api/programs', { params });
}

/**
 * Fetch a single program by id, with exercise references populated.
 * @param {string} id
 */
export function getProgram(id) {
  return api.get(`/api/programs/${id}`);
}