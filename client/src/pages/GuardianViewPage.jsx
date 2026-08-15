import React, { useState, useEffect } from 'react';
import { useParams } from 'react';
import { getGuardianViewDataApi } from '../services/guardianService';
import { ShieldCheck, Eye, Download, Calendar, AlertCircle } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const GuardianViewPage = () => {
  const { accessCode } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadView = async () => {
      try {
        const res = await getGuardianViewDataApi(accessCode);
        if (res.success) {
          setData(res);
        } else {
          setError(res.message || 'Invalid access link');
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Access code expired or revoked');
      } finally {
        setLoading(false);
      }
    };
    loadView();
  }, [accessCode]);

  const exportPDFStatement = () => {
    if (!data) return;
    const doc = new jsPDF();

    const transactions = data.transactions || [];
    const incomeTxs = transactions.filter(t => t.type === 'income');
    const expenseTxs = transactions.filter(t => t.type === 'expense');

    const totalIncome = data.summary.totalIncome || 0;
    const totalExpense = data.summary.totalExpense || 0;
    const netBalance = data.summary.netBalance || 0;

    // Header Banner
    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, 210, 36, 'F');

    doc.setFontSize(18);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text('Guardian Observer Financial Statement', 14, 18);

    doc.setFontSize(9);
    doc.setTextColor(148, 163, 184);
    doc.setFont('helvetica', 'normal');
    doc.text(`Student: ${data.studentName} (${data.studentEmail})`, 14, 26);
    doc.text(`Guardian Observer: ${data.guardianName} • Generated: ${new Date().toLocaleDateString('en-GB')}`, 14, 31);

    let startY = 44;

    // Executive Summary
    doc.setFontSize(11);
    doc.setTextColor(30, 41, 59);
    doc.setFont('helvetica', 'bold');
    doc.text('1. Executive Financial Summary', 14, startY);
    startY += 4;

    doc.autoTable({
      head: [['Total Remitted / Income', 'Total Student Expenses', 'Current Net Balance']],
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

    // Income Table
    doc.setFontSize(11);
    doc.setTextColor(16, 185, 129);
    doc.setFont('helvetica', 'bold');
    doc.text(`2. Income & Remittance Log (${incomeTxs.length} Records)`, 14, startY);
    startY += 4;

    if (incomeTxs.length === 0) {
      doc.setFontSize(9);
      doc.setTextColor(100);
      doc.setFont('helvetica', 'normal');
      doc.text('No income transactions recorded.', 14, startY + 4);
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

    if (startY > 220) {
      doc.addPage();
      startY = 20;
    }

    // Expense Table
    doc.setFontSize(11);
    doc.setTextColor(225, 29, 72);
    doc.setFont('helvetica', 'bold');
    doc.text(`3. Student Expense Log (${expenseTxs.length} Records)`, 14, startY);
    startY += 4;

    if (expenseTxs.length === 0) {
      doc.setFontSize(9);
      doc.setTextColor(100);
      doc.setFont('helvetica', 'normal');
      doc.text('No expense transactions recorded.', 14, startY + 4);
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

    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text(`Page ${i} of ${pageCount} • Guardian Observer Official Financial Report`, 105, 290, { align: 'center' });
    }

    doc.save(`Guardian_Statement_${data.studentName}_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
        Loading Guardian Observer Portal...
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="glass-card" style={{ maxWidth: '520px', margin: '4rem auto', padding: '2rem', textAlign: 'center', borderRadius: 'var(--radius-lg)' }}>
        <AlertCircle size={42} color="var(--rose)" style={{ marginBottom: '1rem' }} />
        <h3 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Access Code Restricted or Invalid</h3>
        <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem', fontSize: '0.9rem' }}>
          {error || 'This reference link has been revoked by the student or expired.'}
        </p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Banner */}
      <div className="glass-card" style={{ padding: '1.75rem', borderRadius: 'var(--radius-lg)', background: 'linear-gradient(135deg, rgba(16,185,129,0.15) 0%, rgba(99,102,241,0.05) 100%)', border: '1px solid var(--emerald-glow)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '0.5rem' }}>
              <ShieldCheck size={28} color="var(--emerald)" />
              <span className="badge badge-income" style={{ fontSize: '0.8rem' }}>
                <Eye size={14} /> Read-Only Observer Mode
              </span>
            </div>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800 }}>Guardian Transparency Dashboard</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
              Observer Portal for <strong>{data.guardianName}</strong> • Monitoring student account of <strong>{data.studentName}</strong> ({data.studentEmail})
            </p>
          </div>

          <button onClick={exportPDFStatement} className="btn btn-primary" style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Download size={16} /> Export PDF Statement
          </button>
        </div>
      </div>

      {/* Financial Summary KPIs */}
      <div className="grid-3">
        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Current Net Wallet Balance</span>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, marginTop: '0.25rem', color: 'var(--text-main)' }}>
            ৳ {data.summary.netBalance.toLocaleString()}
          </div>
        </div>

        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Remitted / Income</span>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, marginTop: '0.25rem', color: 'var(--emerald)' }}>
            ৳ {data.summary.totalIncome.toLocaleString()}
          </div>
        </div>

        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Student Expenses</span>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, marginTop: '0.25rem', color: 'var(--rose)' }}>
            ৳ {data.summary.totalExpense.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Student Wallets */}
      <div>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.85rem' }}>Student Wallet Balances</h3>
        <div className="grid-4">
          {data.wallets.map(w => (
            <div key={w._id} className="glass-card" style={{ padding: '1rem', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>{w.name}</div>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, marginTop: '0.25rem' }}>
                ৳ {w.balance.toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Transaction History Log */}
      <div className="glass-card" style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>Transaction History Log</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          {data.transactions.length === 0 ? (
            <div style={{ color: 'var(--text-muted)', padding: '1.5rem', textAlign: 'center' }}>No transactions recorded</div>
          ) : (
            data.transactions.map(t => (
              <div key={t._id} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{t.title}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {t.date} • {t.walletId.toUpperCase()} • {t.type}
                  </div>
                </div>
                <div style={{ fontWeight: 800, fontSize: '1rem', color: t.type === 'income' ? 'var(--emerald)' : 'var(--text-main)' }}>
                  {t.type === 'income' ? '+' : '-'}৳ {t.amount.toLocaleString()}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
};

export default GuardianViewPage;
