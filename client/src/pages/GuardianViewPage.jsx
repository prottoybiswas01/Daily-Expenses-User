import React, { useState, useEffect } from 'react';
import { useParams } from 'react';
import { getGuardianViewDataApi } from '../services/guardianService';
import { ShieldCheck, Eye, Wallet, Calendar, AlertCircle } from 'lucide-react';

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
