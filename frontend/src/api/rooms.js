import { fetchApi } from './client.js';

export const RoomsApi = {
  getRooms: () => fetchApi('/rooms'),
  createRoom: (name, userId, userName) => fetchApi('/rooms', {
    method: 'POST',
    body: JSON.stringify({ name, userId, userName }),
  }),
  joinRoom: (code, userId, userName) => fetchApi(`/rooms/join`, {
    method: 'POST',
    body: JSON.stringify({ code, userId, userName }),
  }),
  leaveRoom: (id, userId) => fetchApi(`/rooms/${id}/leave`, {
    method: 'POST',
    body: JSON.stringify({ userId })
  }),
};
