import { fetchApi } from './client.js';

export const PredictionsApi = {
  getPredictions: (userId) => {
    const query = userId ? `?user_id=${userId}` : '';
    return fetchApi(`/predictions${query}`);
  },
  createOrUpdatePrediction: (payload) => fetchApi('/predictions', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),
  getLeaderboard: () => fetchApi('/predictions/leaderboard'),
};
