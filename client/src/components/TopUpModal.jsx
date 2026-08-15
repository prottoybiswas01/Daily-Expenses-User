import React, { useState } from 'react';
import { useFinancial } from '../context/FinancialContext';
import { useAuth } from '../context/AuthContext';
import { X, PlusCircle } from 'lucide-react';

const TopUpModal = ({ isOpen, onClose }) => {
  const { topUpWallet } = useFinancial();
  
  const [walletId, setWalletId] = useState('bkash');
  const [amount, setAmount] = useState('');
  const [sourceName, setSourceName] = useState('Family Allowance / Tuition');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0) {
      setError('Please enter a valid positive deposit amount');
      return;
    }

    setSubmitting(true);
    try {
      const res = await topUpWallet({
        walletId,
        amount: amt,
        sourceName
      });
      if (res.success) {
        setAmount('');
        onClose();
      } else {
        setError(res.message || 'Failed to top up wallet');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error executing deposit');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <PlusCircle color="var(--emerald)" size={22} />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Add Money / Add Allowance</h3>
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
            <label className="form-label">Target Wallet Account</label>
            <select value={walletId} onChange={(e) => setWalletId(e.target.value)} className="form-select">
              <option value="bkash">bKash (বিকাশ)</option>
              <option value="nagad">Nagad (নগদ)</option>
              <option value="bank">Bank Account (ব্যাংক)</option>
              <option value="cash">Cash in Hand (নগদ ক্যাশ)</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Amount (৳ BDT)</label>
            <input type="number" step="any" placeholder="e.g. 5000" value={amount} onChange={(e) => setAmount(e.target.value)} className="form-input" required />
          </div>

          <div className="form-group">
            <label className="form-label">Source / Reason</label>
            <input type="text" placeholder="e.g. Allowance from Abba, Tuition Fee, Freelancing" value={sourceName} onChange={(e) => setSourceName(e.target.value)} className="form-input" required />
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary" style={{ flex: 1 }}>Cancel</button>
            <button type="submit" disabled={submitting} className="btn btn-success" style={{ flex: 1 }}>
              {submitting ? 'Depositing...' : 'Confirm Deposit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TopUpModal;
