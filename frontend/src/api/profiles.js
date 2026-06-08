import { fetchApi } from './client.js';

export const ProfilesApi = {
  getProfiles: () => fetchApi('/profiles'), // Note: this endpoint doesn't exist yet, we might just use predictions
  getLeaderboard: () => fetchApi('/predictions/leaderboard'),
};
