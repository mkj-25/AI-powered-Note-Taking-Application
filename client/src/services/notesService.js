import api from './api';

export const getNotes = async (workspaceId, params = {}) => {
  const res = await api.get('/notes', { params: { workspaceId, ...params } });
  return res.data;
};

export const getNote = async (id) => {
  const res = await api.get(`/notes/${id}`);
  return res.data;
};

export const createNote = async (data) => {
  const res = await api.post('/notes', data);
  return res.data;
};

export const updateNote = async (id, data) => {
  const res = await api.put(`/notes/${id}`, data);
  return res.data;
};

export const deleteNote = async (id) => {
  const res = await api.delete(`/notes/${id}`);
  return res.data;
};

// Backend route: POST /notes/:id/favorite
export const toggleFavorite = async (id) => {
  const res = await api.post(`/notes/${id}/favorite`);
  return res.data;
};

// Backend route: POST /notes/:id/pin
export const togglePin = async (id) => {
  const res = await api.post(`/notes/${id}/pin`);
  return res.data;
};
