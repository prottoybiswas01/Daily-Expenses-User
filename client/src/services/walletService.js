import API from './api';

export const getWalletsApi = async () => {
  const response = await API.get('/wallets');
  return response.data;
};

export const topUpWalletApi = async (data) => {
  const response = await API.post('/wallets/topup', data);
  return response.data;
};

export const transferWalletsApi = async (data) => {
  const response = await API.post('/wallets/transfer', data);
  return response.data;
};
