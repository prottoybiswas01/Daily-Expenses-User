import React, { useState } from 'react';
import { useFinancial } from '../context/FinancialContext';
import { useAuth } from '../context/AuthContext';
import { Search, Filter, Download, ArrowUpRight, ArrowDownRight, Trash2, Calendar } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const CATEGORIES = [
  { id: 'all', name: 'All Categories' },
  { id: 'cat_food', name: 'Food & Dining (খাবার)' },
  { id: 'cat_tuition', name: 'Tuition & Academic (টিউশন)' },
  { id: 'cat_rent', name: 'Mess & Hall Rent (মেস ভাড়া)' },
  { id: 'cat_transit', name: 'Transportation (যাতায়াত)' },
  { id: 'cat_mobile', name: 'Mobile Data' },
  { id: 'cat_snack', name: 'Tea & Snacks (চা-নাস্তা)' },
  { id: 'cat_allowance', name: 'Allowance (পারিবারিক খরচ)' },
  { id: 'cat_entertainment', name: 'Entertainment (বিনোদন)' },
  { id: 'cat_health', name: 'Medical (চিকিৎসা)' },
  { id: 'cat_other', name: 'Miscellaneous (অন্যান্য)' }
];

const TransactionsPage = () => {
  const { user } = useAuth();
  const { transactions, filters, setFilters, deleteTransaction } = useFinancial();
  const [search, setSearch] = useState('');

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setFilters(prev => ({ ...prev, search: e.target.value }));
  };

  const handleCategoryChange = (e) => {
    setFilters(prev => ({ ...prev, category: e.target.value }));
  };

  const handleWalletChange = (e) => {
    setFilters(prev => ({ ...prev, walletId: e.target.value }));
  };

  const handleTypeChange = (e) => {
    setFilters(prev => ({ ...prev, type: e.target.value }));
  };

  // PDF Export statement generator
  const exportPDFStatement = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.setTextColor(99, 102, 241);
    doc.text('Daily Expenses & Student Budget Statement', 14, 20);

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Student Name: ${user?.name || 'Student'}`, 14, 28);
    doc.text(`Generated Date: ${new Date().toLocaleDateString()}`, 14, 34);

    const tableRows = transactions.map((t, idx) => [
      idx + 1,
      t.date,
      t.title,
      t.walletId.toUpperCase(),
      t.type === 'income' ? 'Income' : 'Expense',
      `BDT ${t.amount.toLocaleString()}`
    ]);

    doc.autoTable({
      head: [['#', 'Date', 'Title / Description', 'Wallet', 'Type', 'Amount (BDT)']],
      body: tableRows,
      startY: 42,
      theme: 'grid',
      headStyles: { fillColor: [99, 102, 241] }
    });

    doc.save(`Expenses_Statement_${user?.name || 'Student'}_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Top Controls Header */}
      <div className="glass-card" style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Transaction Statement & Audit</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              Search, filter, and export your expense records
            </p>
          </div>
          <button onClick={exportPDFStatement} className="btn btn-secondary" style={{ fontSize: '0.85rem' }}>
            <Download size={16} /> Export PDF Statement
          </button>
        </div>

        {/* Filter Toolbar */}
        <div className="grid-4" style={{ gap: '0.75rem' }}>
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
            <input type="text" placeholder="Search item or note..." value={search} onChange={handleSearchChange} className="form-input" style={{ paddingLeft: '2.2rem' }} />
          </div>

          <div>
            <select value={filters.category} onChange={handleCategoryChange} className="form-select">
              {CATEGORIES.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div>
            <select value={filters.walletId} onChange={handleWalletChange} className="form-select">
              <option value="all">All Wallets</option>
              <option value="bkash">bKash (বিকাশ)</option>
              <option value="nagad">Nagad (নগদ)</option>
              <option value="bank">Bank Account</option>
              <option value="cash">Cash in Hand</option>
            </select>
          </div>

          <div>
            <select value={filters.type} onChange={handleTypeChange} className="form-select">
              <option value="all">All Types</option>
              <option value="expense">Expenses Only</option>
              <option value="income">Income / Top-Ups Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Transactions Data Table */}
      <div className="glass-card" style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '650px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              <th style={{ padding: '0.75rem 1rem' }}>Date</th>
              <th style={{ padding: '0.75rem 1rem' }}>Transaction Item</th>
              <th style={{ padding: '0.75rem 1rem' }}>Wallet</th>
              <th style={{ padding: '0.75rem 1rem' }}>Type</th>
              <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Amount</th>
              <th style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {transactions.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                  No matching transaction records found.
                </td>
              </tr>
            ) : (
              transactions.map((tx) => (
                <tr key={tx._id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background 0.2s' }}>
                  <td style={{ padding: '0.85rem 1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Calendar size={14} /> {tx.date}
                    </div>
                  </td>
                  <td style={{ padding: '0.85rem 1rem' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.92rem' }}>{tx.title}</div>
                    {tx.note && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{tx.note}</div>}
                  </td>
                  <td style={{ padding: '0.85rem 1rem', fontSize: '0.85rem', textTransform: 'uppercase', fontWeight: 600 }}>
                    {tx.walletId}
                  </td>
                  <td style={{ padding: '0.85rem 1rem' }}>
                    <span className={`badge ${tx.type === 'income' ? 'badge-income' : 'badge-expense'}`}>
                      {tx.type === 'income' ? <ArrowDownRight size={12} /> : <ArrowUpRight size={12} />} {tx.type}
                    </span>
                  </td>
                  <td style={{ padding: '0.85rem 1rem', textAlign: 'right', fontWeight: 800, fontSize: '1rem', color: tx.type === 'income' ? 'var(--emerald)' : 'var(--text-main)' }}>
                    {tx.type === 'income' ? '+' : '-'}৳ {tx.amount.toLocaleString()}
                  </td>
                  <td style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>
                    <button onClick={() => deleteTransaction(tx._id)} className="btn btn-secondary" style={{ padding: '0.35rem', borderRadius: 'var(--radius-md)' }} title="Remove Record">
                      <Trash2 size={14} color="var(--rose)" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
};

export default TransactionsPage;
