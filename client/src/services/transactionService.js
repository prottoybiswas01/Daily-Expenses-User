import API from './api';

export const getTransactionsApi = async (params = {}) => {
  const response = await API.get('/transactions', { params });
  return response.data;
};

export const addTransactionApi = async (data) => {
  const response = await API.post('/transactions', data);
  return response.data;
};

export const deleteTransactionApi = async (id) => {
  const response = await API.delete(`/transactions/${id}`);
  return response.data;
};

export const getSummaryApi = async () => {
  const response = await API.get('/transactions/summary');
  return response.data;
};
