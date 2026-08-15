import React, { useState } from 'react';
import { useFinancial } from '../context/FinancialContext';
import { X, ArrowRightLeft } from 'lucide-react';

const TransferModal = ({ isOpen, onClose, initialFromWallet = 'bkash' }) => {
  const { transferWallets } = useFinancial();
  const [fromWalletId, setFromWalletId] = useState(initialFromWallet);
  const [toWalletId, setToWalletId] = useState('cash');
  const [amount, setAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const amt = parseFloat(amount);

    if (fromWalletId === toWalletId) {
      setError('Source and destination wallets must be different');
      return;
    }

    if (isNaN(amt) || amt <= 0) {
      setError('Please enter a valid transfer amount');
      return;
    }

    setSubmitting(true);
    try {
      const res = await transferWallets({
        fromWalletId,
        toWalletId,
        amount: amt
      });

      if (res.success) {
        setAmount('');
        onClose();
      } else {
        setError(res.message || 'Transfer failed');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error processing transfer');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ArrowRightLeft color="var(--primary)" size={22} />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Internal Wallet Transfer</h3>
          </div>
          <button onClick={onClose} className="btn btn-secondary" style={{ padding: '0.4rem' }}>
            <X size={18} />
          </button>
        </div>

        {error && (
          <div style={{ background: 'rgba(244, 63, 94, 0.15)', border: '1px solid rgba(244, 63, 94, 0.3)', color: 'var(--rose)', padding: '0.75rem', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', marginBottom: '1rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Transfer From</label>
            <select value={fromWalletId} onChange={(e) => setFromWalletId(e.target.value)} className="form-select">
              <option value="bkash">bKash (বিকাশ)</option>
              <option value="nagad">Nagad (নগদ)</option>
              <option value="bank">Bank Account (ব্যাংক)</option>
              <option value="cash">Cash in Hand (নগদ ক্যাশ)</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Transfer To</label>
            <select value={toWalletId} onChange={(e) => setToWalletId(e.target.value)} className="form-select">
              <option value="cash">Cash in Hand (নগদ ক্যাশ)</option>
              <option value="bkash">bKash (বিকাশ)</option>
              <option value="nagad">Nagad (নগদ)</option>
              <option value="bank">Bank Account (ব্যাংক)</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Amount (৳ BDT)</label>
            <input type="number" step="any" placeholder="e.g. 1000" value={amount} onChange={(e) => setAmount(e.target.value)} className="form-input" required />
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary" style={{ flex: 1 }}>Cancel</button>
            <button type="submit" disabled={submitting} className="btn btn-primary" style={{ flex: 1 }}>
              {submitting ? 'Transferring...' : 'Execute Transfer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransferModal;
