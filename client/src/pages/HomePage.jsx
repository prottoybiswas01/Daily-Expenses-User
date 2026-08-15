import React, { useState } from 'react';
import { useFinancial } from '../context/FinancialContext';
import { useAuth } from '../context/AuthContext';
import WalletCard from '../components/WalletCard';
import { Wallet, TrendingUp, TrendingDown, DollarSign, PlusCircle, ArrowLeftRight, AlertCircle, ArrowUpRight, ArrowDownRight, Tag } from 'lucide-react';
import { Link } from 'react-router-dom';

const HomePage = ({ onOpenTopUp, onOpenTransfer, onOpenTransaction, setInitialTransferWallet }) => {
  const { user } = useAuth();
  const { wallets, transactions, summary, deleteTransaction, loading } = useFinancial();

  const handleWalletTransfer = (walletId) => {
    setInitialTransferWallet(walletId);
    onOpenTransfer();
  };

  const getCategoryBadge = (cat) => {
    const labels = {
      cat_food: 'Food (খাবার)',
      cat_tuition: 'Tuition (টিউশন)',
      cat_rent: 'Mess Rent (মেস ভাড়া)',
      cat_transit: 'Transit (যাতায়াত)',
      cat_mobile: 'Mobile Data',
      cat_snack: 'Tea & Snacks',
      cat_allowance: 'Allowance',
      cat_entertainment: 'Entertainment',
      cat_health: 'Medical',
      cat_other: 'Misc'
    };
    return labels[cat] || cat;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Top Banner & Welcome Greeting */}
      <div className="glass-card" style={{ padding: '1.75rem', borderRadius: 'var(--radius-lg)', background: 'linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(16,185,129,0.05) 100%)', border: '1px solid var(--border-glow)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
              Welcome back, {user?.name || 'Student'} 👋
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '0.2rem' }}>
              Overview of your mobile wallets, cash in hand, and daily student expenses.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button onClick={onOpenTopUp} className="btn btn-success">
              + Add Money
            </button>
            <button onClick={onOpenTransaction} className="btn btn-primary">
              <PlusCircle size={18} /> Record Expense
            </button>
          </div>
        </div>

        {/* Budget Progress Bar */}
        {summary.budget > 0 && (
          <div style={{ marginTop: '1.5rem', background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>
              <span>Monthly Budget Utilization (৳ {summary.totalExpense.toLocaleString()} / ৳ {summary.budget.toLocaleString()})</span>
              <span style={{ color: summary.budgetUsedPercent > 85 ? 'var(--rose)' : 'var(--emerald)' }}>{summary.budgetUsedPercent}% Used</span>
            </div>
            <div style={{ width: '100%', height: '10px', background: 'rgba(255,255,255,0.1)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%',
                  width: `${summary.budgetUsedPercent}%`,
                  background: summary.budgetUsedPercent > 85
                    ? 'linear-gradient(90deg, #f59e0b, #f43f5e)'
                    : 'linear-gradient(90deg, #6366f1, #10b981)',
                  borderRadius: 'var(--radius-full)',
                  transition: 'width 0.5s ease-out'
                }}
              ></div>
            </div>
          </div>
        )}
      </div>

      {/* Summary KPI Cards */}
      <div className="grid-3">
        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Total Net Balance</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(99,102,241,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Wallet size={20} color="var(--primary)" />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '0.5rem', color: 'var(--text-main)' }}>
            ৳ {summary.netBalance.toLocaleString()}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--emerald)', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.3rem' }}>
            Combined Mobile Wallets & Cash
          </span>
        </div>

        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Total Income / Deposits</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(16,185,129,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUp size={20} color="var(--emerald)" />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '0.5rem', color: 'var(--emerald)' }}>
            ৳ {summary.totalIncome.toLocaleString()}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.3rem', display: 'block' }}>
            Tuition, Allowance & Transfers
          </span>
        </div>

        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Total Expenses</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(244,63,94,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingDown size={20} color="var(--rose)" />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '0.5rem', color: 'var(--rose)' }}>
            ৳ {summary.totalExpense.toLocaleString()}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.3rem', display: 'block' }}>
            Auto-deducted from selected wallet
          </span>
        </div>
      </div>

      {/* Multi-Wallet Grid Section */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Your Accounts & Digital Wallets</h3>
          <button onClick={onOpenTransfer} className="btn btn-secondary" style={{ fontSize: '0.85rem', padding: '0.4rem 0.8rem' }}>
            <ArrowLeftRight size={15} /> Transfer Funds
          </button>
        </div>

        <div className="grid-4">
          {wallets.map((w) => (
            <WalletCard key={w._id || w.walletId} wallet={w} onTransfer={handleWalletTransfer} />
          ))}
        </div>
      </div>

      {/* Recent Transactions List */}
      <div className="glass-card" style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Recent Transactions</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Latest expenses and top-ups</p>
          </div>
          <Link to="/transactions" className="btn btn-secondary" style={{ fontSize: '0.85rem', padding: '0.4rem 0.8rem' }}>
            View All History →
          </Link>
        </div>

        {transactions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
            <AlertCircle size={32} style={{ marginBottom: '0.5rem', opacity: 0.5 }} />
            <p>No transactions recorded yet. Click <strong>Record Expense</strong> or <strong>Add Money</strong> to get started.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {transactions.slice(0, 6).map((tx) => (
              <div
                key={tx._id}
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.85rem 1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justify: 'space-between',
                  flexWrap: 'wrap',
                  gap: '0.75rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                  <div
                    style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '10px',
                      background: tx.type === 'income' ? 'rgba(16,185,129,0.15)' : 'rgba(244,63,94,0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justify: 'center'
                    }}
                  >
                    {tx.type === 'income' ? <ArrowDownRight color="var(--emerald)" size={20} /> : <ArrowUpRight color="var(--rose)" size={20} />}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{tx.title}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', gap: '0.5rem', alignItems: 'center', marginTop: '0.1rem' }}>
                      <span>{tx.date}</span> • <span style={{ textTransform: 'uppercase', fontWeight: 600, color: 'var(--primary)' }}>{tx.walletId}</span> • <span>{getCategoryBadge(tx.category)}</span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ fontSize: '1.05rem', fontWeight: 800, color: tx.type === 'income' ? 'var(--emerald)' : 'var(--text-main)' }}>
                    {tx.type === 'income' ? '+' : '-'}৳ {tx.amount.toLocaleString()}
                  </div>
                  <button onClick={() => deleteTransaction(tx._id)} className="btn btn-secondary" style={{ padding: '0.35rem', borderRadius: 'var(--radius-md)' }} title="Delete Transaction">
                    &times;
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default HomePage;
