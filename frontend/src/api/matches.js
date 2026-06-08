import { fetchApi } from './client.js';

export const MatchesApi = {
  getMatches: () => fetchApi('/matches'),
  getMatch: (id) => fetchApi(`/matches/${id}`),
  simulateMatch: (id, payload) => fetchApi(`/matches/${id}/simulate`, {
    method: 'POST',
    body: JSON.stringify(payload),
  }),
};
