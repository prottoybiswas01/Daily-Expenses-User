import API from './api';

export const getSavingsGoalsApi = async () => {
  const response = await API.get('/savings');
  return response.data;
};

export const addSavingsGoalApi = async (data) => {
  const response = await API.post('/savings', data);
  return response.data;
};

export const depositSavingsApi = async (id, amount) => {
  const response = await API.put(`/savings/${id}/deposit`, { amount });
  return response.data;
};

export const deleteSavingsGoalApi = async (id) => {
  const response = await API.delete(`/savings/${id}`);
  return response.data;
};
