import api from './api';

export const getWorkspaces = async () => {
  const res = await api.get('/workspaces');
  return res.data;
};

export const getWorkspace = async (id) => {
  const res = await api.get(`/workspaces/${id}`);
  return res.data;
};

export const createWorkspace = async (data) => {
  const res = await api.post('/workspaces', data);
  return res.data;
};

export const updateWorkspace = async (id, data) => {
  const res = await api.put(`/workspaces/${id}`, data);
  return res.data;
};

export const deleteWorkspace = async (id) => {
  const res = await api.delete(`/workspaces/${id}`);
  return res.data;
};

export const inviteMember = async (id, email) => {
  const res = await api.post(`/workspaces/${id}/invite`, { email });
  return res.data;
};
