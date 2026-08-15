import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, Wallet } from 'lucide-react';

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [monthlyBudget, setMonthlyBudget] = useState('15000');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await register({ name, email, password, monthlyBudget });
      if (res.success) {
        navigate('/');
      } else {
        setError(res.message || 'Registration failed');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error registering student account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '460px', margin: '2.5rem auto', width: '100%' }}>
      <div className="glass-card" style={{ padding: '2.25rem', borderRadius: 'var(--radius-lg)' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div style={{ width: '54px', height: '54px', borderRadius: '16px', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#fff', marginBottom: '1rem', boxShadow: '0 8px 24px rgba(16, 185, 129, 0.4)' }}>
            <Wallet size={28} />
          </div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800 }}>Create Student Profile</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            Set up your mobile wallets (bKash, Nagad, Bank, Cash)
          </p>
        </div>

        {error && (
          <div style={{ background: 'rgba(244, 63, 94, 0.15)', border: '1px solid rgba(244, 63, 94, 0.3)', color: 'var(--rose)', padding: '0.75rem', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input type="text" placeholder="e.g. Tanvir Hossain" value={name} onChange={(e) => setName(e.target.value)} className="form-input" required />
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input type="email" placeholder="student@university.edu" value={email} onChange={(e) => setEmail(e.target.value)} className="form-input" required />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input type="password" placeholder="Min. 6 characters" value={password} onChange={(e) => setPassword(e.target.value)} className="form-input" required />
          </div>

          <div className="form-group">
            <label className="form-label">Estimated Monthly Budget Target (৳ BDT)</label>
            <input type="number" placeholder="15000" value={monthlyBudget} onChange={(e) => setMonthlyBudget(e.target.value)} className="form-input" required />
          </div>

          <button type="submit" disabled={loading} className="btn btn-success" style={{ width: '100%', marginTop: '1rem', padding: '0.85rem' }}>
            <UserPlus size={18} /> {loading ? 'Creating Account...' : 'Register Account'}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '1.5rem' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--emerald)', fontWeight: 700, textDecoration: 'none' }}>Login Here</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
