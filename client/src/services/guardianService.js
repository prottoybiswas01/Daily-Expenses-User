import API from './api';

export const generateSharedLinkApi = async (data) => {
  const response = await API.post('/guardian/generate', data);
  return response.data;
};

export const getSharedLinksApi = async () => {
  const response = await API.get('/guardian/links');
  return response.data;
};

export const revokeSharedLinkApi = async (id) => {
  const response = await API.delete(`/guardian/links/${id}`);
  return response.data;
};

export const getGuardianViewDataApi = async (accessCode) => {
  const response = await API.get(`/guardian/view/${accessCode}`);
  return response.data;
};
