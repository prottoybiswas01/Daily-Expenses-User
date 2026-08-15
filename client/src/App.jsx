import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { FinancialProvider } from './context/FinancialContext';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import TopUpModal from './components/TopUpModal';
import TransferModal from './components/TransferModal';
import AddTransactionModal from './components/AddTransactionModal';
import GuardianModal from './components/GuardianModal';

import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import TransactionsPage from './pages/TransactionsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import SavingsPage from './pages/SavingsPage';
import GuardianViewPage from './pages/GuardianViewPage';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

const AppContent = () => {
  const [isTopUpOpen, setIsTopUpOpen] = useState(false);
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [isTransactionOpen, setIsTransactionOpen] = useState(false);
  const [isGuardianOpen, setIsGuardianOpen] = useState(false);
  const [initialTransferWallet, setInitialTransferWallet] = useState('bkash');

  return (
    <div className="app-container">
      <Navbar
        onOpenTopUp={() => setIsTopUpOpen(true)}
        onOpenTransaction={() => setIsTransactionOpen(true)}
        onOpenGuardian={() => setIsGuardianOpen(true)}
      />

      <main className="main-content">
        <Routes>
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <HomePage
                  onOpenTopUp={() => setIsTopUpOpen(true)}
                  onOpenTransfer={() => setIsTransferOpen(true)}
                  onOpenTransaction={() => setIsTransactionOpen(true)}
                  setInitialTransferWallet={setInitialTransferWallet}
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/transactions"
            element={
              <ProtectedRoute>
                <TransactionsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/analytics"
            element={
              <ProtectedRoute>
                <AnalyticsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/savings"
            element={
              <ProtectedRoute>
                <SavingsPage />
              </ProtectedRoute>
            }
          />

          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/guardian-view/:accessCode" element={<GuardianViewPage />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <Footer />

      {/* Global Modals */}
      <TopUpModal isOpen={isTopUpOpen} onClose={() => setIsTopUpOpen(false)} />
      <TransferModal isOpen={isTransferOpen} onClose={() => setIsTransferOpen(false)} initialFromWallet={initialTransferWallet} />
      <AddTransactionModal isOpen={isTransactionOpen} onClose={() => setIsTransactionOpen(false)} />
      <GuardianModal isOpen={isGuardianOpen} onClose={() => setIsGuardianOpen(false)} />
    </div>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <FinancialProvider>
        <AppContent />
      </FinancialProvider>
    </AuthProvider>
  );
};

export default App;
