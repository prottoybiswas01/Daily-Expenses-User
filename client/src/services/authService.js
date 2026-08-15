import API from './api';

export const registerApi = async (userData) => {
  const response = await API.post('/auth/register', userData);
  return response.data;
};

export const loginApi = async (credentials) => {
  const response = await API.post('/auth/login', credentials);
  return response.data;
};

export const demoLoginApi = async () => {
  const response = await API.post('/auth/demo');
  return response.data;
};

export const getMeApi = async () => {
  const response = await API.get('/auth/me');
  return response.data;
};

export const updateSettingsApi = async (settings) => {
  const response = await API.put('/auth/settings', settings);
  return response.data;
};
