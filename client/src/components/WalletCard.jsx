import React from 'react';
import { Smartphone, Wallet, Landmark, Banknote, ArrowRightLeft } from 'lucide-react';

const WalletCard = ({ wallet, onTransfer }) => {
  const getIcon = (id) => {
    switch (id) {
      case 'bkash': return <Smartphone size={22} color="#e2136e" />;
      case 'nagad': return <Wallet size={22} color="#f7921e" />;
      case 'bank': return <Landmark size={22} color="#2563eb" />;
      case 'cash': return <Banknote size={22} color="#10b981" />;
      default: return <Wallet size={22} color="#6366f1" />;
    }
  };

  const getBorderGradient = (id) => {
    switch (id) {
      case 'bkash': return 'linear-gradient(135deg, rgba(226,19,110,0.2) 0%, rgba(226,19,110,0.05) 100%)';
      case 'nagad': return 'linear-gradient(135deg, rgba(247,146,30,0.2) 0%, rgba(247,146,30,0.05) 100%)';
      case 'bank': return 'linear-gradient(135deg, rgba(37,99,235,0.2) 0%, rgba(37,99,235,0.05) 100%)';
      default: return 'linear-gradient(135deg, rgba(16,185,129,0.2) 0%, rgba(16,185,129,0.05) 100%)';
    }
  };

  return (
    <div className="glass-card" style={{ background: getBorderGradient(wallet.walletId), padding: '1.25rem', borderRadius: 'var(--radius-lg)', position: 'relative', overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {getIcon(wallet.walletId)}
          </div>
          <div>
            <h4 style={{ fontSize: '1rem', fontWeight: 700 }}>{wallet.name}</h4>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Wallet Account</span>
          </div>
        </div>
        <button onClick={() => onTransfer(wallet.walletId)} className="btn btn-secondary" style={{ padding: '0.4rem 0.6rem', fontSize: '0.75rem', borderRadius: 'var(--radius-md)' }} title="Transfer to another wallet">
          <ArrowRightLeft size={14} /> Transfer
        </button>
      </div>

      <div style={{ marginTop: '0.5rem' }}>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Available Balance</div>
        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.1rem' }}>
          ৳ {(wallet.balance || 0).toLocaleString()}
        </div>
      </div>
    </div>
  );
};

export default WalletCard;
