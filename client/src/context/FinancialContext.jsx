import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { getWalletsApi, topUpWalletApi, transferWalletsApi } from '../services/walletService';
import { getTransactionsApi, addTransactionApi, deleteTransactionApi, getSummaryApi } from '../services/transactionService';

const FinancialContext = createContext();

export const FinancialProvider = ({ children }) => {
  const { user } = useAuth();
  const [wallets, setWallets] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState({
    totalIncome: 0,
    totalExpense: 0,
    netBalance: 0,
    budget: 0,
    budgetUsedPercent: 0
  });
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ category: 'all', walletId: 'all', type: 'all', search: '' });

  const refreshData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [wRes, tRes, sRes] = await Promise.all([
        getWalletsApi(),
        getTransactionsApi(filters),
        getSummaryApi()
      ]);
      
      if (wRes.success) setWallets(wRes.data);
      if (tRes.success) setTransactions(tRes.data);
      if (sRes.success) setSummary(sRes.data);
    } catch (err) {
      console.error('[FinancialContext] Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  }, [user, filters]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const topUpWallet = async (data) => {
    const res = await topUpWalletApi(data);
    if (res.success) {
      await refreshData();
    }
    return res;
  };

  const transferWallets = async (data) => {
    const res = await transferWalletsApi(data);
    if (res.success) {
      await refreshData();
    }
    return res;
  };

  const addTransaction = async (data) => {
    const res = await addTransactionApi(data);
    if (res.success) {
      await refreshData();
    }
    return res;
  };

  const deleteTransaction = async (id) => {
    const res = await deleteTransactionApi(id);
    if (res.success) {
      await refreshData();
    }
    return res;
  };

  return (
    <FinancialContext.Provider
      value={{
        wallets,
        transactions,
        summary,
        loading,
        filters,
        setFilters,
        refreshData,
        topUpWallet,
        transferWallets,
        addTransaction,
        deleteTransaction
      }}
    >
      {children}
    </FinancialContext.Provider>
  );
};

export const useFinancial = () => useContext(FinancialContext);
