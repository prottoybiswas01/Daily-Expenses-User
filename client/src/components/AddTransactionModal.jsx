import React, { useState } from 'react';
import { useFinancial } from '../context/FinancialContext';
import { X, DollarSign } from 'lucide-react';

const CATEGORIES = [
  { id: 'cat_food', name: 'Food & Dining (খাবার)', icon: 'utensils' },
  { id: 'cat_tuition', name: 'Tuition & Academic (টিউশন ও পরালেখা)', icon: 'book' },
  { id: 'cat_rent', name: 'Mess & Hall Rent (বাসা/মেস ভাড়া)', icon: 'home' },
  { id: 'cat_transit', name: 'Transportation (যাতায়াত)', icon: 'bus' },
  { id: 'cat_mobile', name: 'Mobile & Internet (মোবাইল রিচার্জ ও ডাটা)', icon: 'mobile-alt' },
  { id: 'cat_snack', name: 'Tea & Snacks (চা-নাস্তা)', icon: 'coffee' },
  { id: 'cat_allowance', name: 'Allowance & Family Gift (পারিবারিক খরচ)', icon: 'gift' },
  { id: 'cat_entertainment', name: 'Hangout & Entertainment (আড্ডা ও বিনোদন)', icon: 'film' },
  { id: 'cat_health', name: 'Medical & Healthcare (চিকিৎসা)', icon: 'heartbeat' },
  { id: 'cat_other', name: 'Miscellaneous (অন্যান্য)', icon: 'receipt' }
];

const AddTransactionModal = ({ isOpen, onClose }) => {
  const { addTransaction } = useFinancial();
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('expense');
  const [category, setCategory] = useState('cat_food');
  const [walletId, setWalletId] = useState('bkash');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState('');
  const [flagged, setFlagged] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const amt = parseFloat(amount);
    if (!title.trim() || isNaN(amt) || amt <= 0) {
      setError('Please provide a valid transaction description and positive amount');
      return;
    }

    setSubmitting(true);
    try {
      const res = await addTransaction({
        title,
        amount: amt,
        type,
        category,
        walletId,
        date,
        note,
        flagged
      });

      if (res.success) {
        setTitle('');
        setAmount('');
        setNote('');
        setFlagged(false);
        onClose();
      } else {
        setError(res.message || 'Failed to record transaction');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error saving transaction');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <DollarSign color="var(--primary)" size={22} />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Record New Transaction</h3>
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
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', background: 'rgba(0,0,0,0.2)', padding: '0.35rem', borderRadius: 'var(--radius-md)' }}>
            <button type="button" onClick={() => setType('expense')} className={`btn ${type === 'expense' ? 'btn-danger' : 'btn-secondary'}`} style={{ flex: 1, padding: '0.5rem' }}>
              Expense (খরচ)
            </button>
            <button type="button" onClick={() => setType('income')} className={`btn ${type === 'income' ? 'btn-success' : 'btn-secondary'}`} style={{ flex: 1, padding: '0.5rem' }}>
              Income / Refund (জমা)
            </button>
          </div>

          <div className="form-group">
            <label className="form-label">Expense Title / Item Name</label>
            <input type="text" placeholder="e.g. Lunch at Canteen, Rickshaw Fare, Book Buy" value={title} onChange={(e) => setTitle(e.target.value)} className="form-input" required />
          </div>

          <div className="grid-2" style={{ gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Amount (৳ BDT)</label>
              <input type="number" step="any" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} className="form-input" required />
            </div>

            <div className="form-group">
              <label className="form-label">Paid From Wallet</label>
              <select value={walletId} onChange={(e) => setWalletId(e.target.value)} className="form-select">
                <option value="bkash">bKash (বিকাশ)</option>
                <option value="nagad">Nagad (নগদ)</option>
                <option value="bank">Bank Account (ব্যাংক)</option>
                <option value="cash">Cash in Hand (নগদ ক্যাশ)</option>
              </select>
            </div>
          </div>

          <div className="grid-2" style={{ gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} className="form-select">
                {CATEGORIES.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Date</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="form-input" required />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Notes / Remarks (Optional)</label>
            <input type="text" placeholder="e.g. Paid via bKash Merchant payment" value={note} onChange={(e) => setNote(e.target.value)} className="form-input" />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <input type="checkbox" id="flagged" checked={flagged} onChange={(e) => setFlagged(e.target.checked)} style={{ accentColor: 'var(--amber)', width: '18px', height: '18px' }} />
            <label htmlFor="flagged" style={{ fontSize: '0.85rem', color: 'var(--text-muted)', cursor: 'pointer' }}>
              Flag as Priority / Critical Expense
            </label>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary" style={{ flex: 1 }}>Cancel</button>
            <button type="submit" disabled={submitting} className={`btn ${type === 'expense' ? 'btn-primary' : 'btn-success'}`} style={{ flex: 1 }}>
              {submitting ? 'Saving...' : 'Record Transaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTransactionModal;
