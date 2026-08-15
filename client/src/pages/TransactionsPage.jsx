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

  // Ultra-Premium PDF Statement generator with separated tables (Income & Expenses)
  const exportPDFStatement = () => {
    const doc = new jsPDF();

    const incomeTxs = transactions.filter(t => t.type === 'income');
    const expenseTxs = transactions.filter(t => t.type === 'expense');

    const totalIncome = incomeTxs.reduce((acc, curr) => acc + curr.amount, 0);
    const totalExpense = expenseTxs.reduce((acc, curr) => acc + curr.amount, 0);
    const netBalance = totalIncome - totalExpense;

    // Header Header Banner
    doc.setFillColor(15, 23, 42); // Dark slate banner
    doc.rect(0, 0, 210, 36, 'F');

    doc.setFontSize(18);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text('Daily Expenses & Student Financial Statement', 14, 18);

    doc.setFontSize(9);
    doc.setTextColor(148, 163, 184);
    doc.setFont('helvetica', 'normal');
    doc.text(`Student: ${user?.name || 'Student'} (${user?.email || 'N/A'})`, 14, 26);
    doc.text(`Report Date: ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`, 14, 31);

    let startY = 44;

    // Part 1: Financial Overview Summary Box
    doc.setFontSize(11);
    doc.setTextColor(30, 41, 59);
    doc.setFont('helvetica', 'bold');
    doc.text('1. Executive Financial Summary', 14, startY);
    startY += 4;

    doc.autoTable({
      head: [['Total Allowance / Income', 'Total Student Expenses', 'Net Balance']],
      body: [[
        `+ BDT ${totalIncome.toLocaleString()}`,
        `- BDT ${totalExpense.toLocaleString()}`,
        `BDT ${netBalance.toLocaleString()}`
      ]],
      startY: startY,
      theme: 'grid',
      headStyles: { fillColor: [79, 70, 229], textColor: [255, 255, 255], fontStyle: 'bold', halign: 'center' },
      bodyStyles: { fontSize: 11, fontStyle: 'bold', halign: 'center' }
    });

    startY = doc.lastAutoTable.finalY + 10;

    // Part 2: Income Transactions Table (Green / Emerald Styled)
    doc.setFontSize(11);
    doc.setTextColor(16, 185, 129);
    doc.setFont('helvetica', 'bold');
    doc.text(`2. Income & Allowance Log (${incomeTxs.length} Records)`, 14, startY);
    startY += 4;

    if (incomeTxs.length === 0) {
      doc.setFontSize(9);
      doc.setTextColor(100);
      doc.setFont('helvetica', 'normal');
      doc.text('No income transactions logged in this period.', 14, startY + 4);
      startY += 12;
    } else {
      const incomeRows = incomeTxs.map((t, idx) => [
        idx + 1,
        t.date,
        t.title,
        t.walletId.toUpperCase(),
        `+ BDT ${t.amount.toLocaleString()}`
      ]);

      doc.autoTable({
        head: [['#', 'Date', 'Source / Description', 'Wallet', 'Amount']],
        body: incomeRows,
        startY: startY,
        theme: 'striped',
        headStyles: { fillColor: [16, 185, 129], textColor: [255, 255, 255] },
        columnStyles: { 4: { halign: 'right', fontStyle: 'bold' } }
      });
      startY = doc.lastAutoTable.finalY + 10;
    }

    // Check page space for Expense Table
    if (startY > 220) {
      doc.addPage();
      startY = 20;
    }

    // Part 3: Expense Transactions Table (Rose / Red Styled)
    doc.setFontSize(11);
    doc.setTextColor(225, 29, 72);
    doc.setFont('helvetica', 'bold');
    doc.text(`3. Student Expense Log (${expenseTxs.length} Records)`, 14, startY);
    startY += 4;

    if (expenseTxs.length === 0) {
      doc.setFontSize(9);
      doc.setTextColor(100);
      doc.setFont('helvetica', 'normal');
      doc.text('No expense transactions logged in this period.', 14, startY + 4);
    } else {
      const expenseRows = expenseTxs.map((t, idx) => [
        idx + 1,
        t.date,
        t.title,
        t.walletId.toUpperCase(),
        t.note || '-',
        `- BDT ${t.amount.toLocaleString()}`
      ]);

      doc.autoTable({
        head: [['#', 'Date', 'Expense Item', 'Wallet', 'Note', 'Amount']],
        body: expenseRows,
        startY: startY,
        theme: 'striped',
        headStyles: { fillColor: [225, 29, 72], textColor: [255, 255, 255] },
        columnStyles: { 5: { halign: 'right', fontStyle: 'bold' } }
      });
    }

    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text(`Page ${i} of ${pageCount} • Daily Expenses Tracker Financial Audit`, 105, 290, { align: 'center' });
    }

    doc.save(`Financial_Statement_${user?.name || 'Student'}_${new Date().toISOString().split('T')[0]}.pdf`);
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
          <button onClick={exportPDFStatement} className="btn btn-secondary" style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Download size={16} color="var(--primary)" /> Export PDF Statement
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
