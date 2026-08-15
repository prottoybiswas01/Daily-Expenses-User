import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Wallet, LogIn, Sparkles, ShieldCheck } from 'lucide-react';

const LoginPage = () => {
  const { login, loginDemo } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await login({ email, password });
      if (res.success) {
        navigate('/');
      } else {
        setError(res.message || 'Login failed');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleDemo = async () => {
    setError('');
    setLoading(true);
    try {
      const res = await loginDemo();
      if (res.success) {
        navigate('/');
      }
    } catch (err) {
      setError('Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '440px', margin: '3rem auto', width: '100%' }}>
      <div className="glass-card" style={{ padding: '2.25rem', borderRadius: 'var(--radius-lg)' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div style={{ width: '54px', height: '54px', borderRadius: '16px', background: 'linear-gradient(135deg, #6366f1 0%, #10b981 100%)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#fff', marginBottom: '1rem', boxShadow: '0 8px 24px rgba(99, 102, 241, 0.4)' }}>
            <Wallet size={28} />
          </div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800 }}>Student & Budget Portal</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            Login to access bKash, Nagad & Cash expense tracker
          </p>
        </div>

        {error && (
          <div style={{ background: 'rgba(244, 63, 94, 0.15)', border: '1px solid rgba(244, 63, 94, 0.3)', color: 'var(--rose)', padding: '0.75rem', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input type="email" placeholder="student@university.edu" value={email} onChange={(e) => setEmail(e.target.value)} className="form-input" required />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="form-input" required />
          </div>

          <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', marginTop: '1rem', padding: '0.85rem' }}>
            <LogIn size={18} /> {loading ? 'Logging in...' : 'Sign In'}
          </button>
        </form>

        <div style={{ margin: '1.5rem 0', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }}></div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>OR</span>
          <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }}></div>
        </div>

        {/* Demo Mode Button for Instant Evaluation */}
        <button onClick={handleDemo} disabled={loading} className="btn btn-success" style={{ width: '100%', padding: '0.85rem', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
          <Sparkles size={18} /> Explore Demo Student Account
        </button>

        <p style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '1.5rem' }}>
          Don't have an account? <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 700, textDecoration: 'none' }}>Register Here</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
