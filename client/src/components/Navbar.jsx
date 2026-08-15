import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useFinancial } from '../context/FinancialContext';
import { Wallet, PieChart, ArrowLeftRight, PiggyBank, ShieldCheck, Sun, Moon, LogOut, PlusCircle } from 'lucide-react';

const Navbar = ({ onOpenTopUp, onOpenTransaction, onOpenGuardian }) => {
  const { user, logout, theme, toggleTheme } = useAuth();
  const { summary } = useFinancial();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="glass-card" style={{ borderRadius: 0, borderTop: 'none', borderLeft: 'none', borderRight: 'none', position: 'sticky', top: 0, zIndex: 100 }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0.85rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        
        {/* Brand Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none', color: 'var(--text-main)' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'linear-gradient(135deg, #6366f1 0%, #10b981 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', boxShadow: '0 4px 12px rgba(99, 102, 241, 0.4)' }}>
            <Wallet size={24} />
          </div>
          <div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, letterSpacing: '-0.02em', background: 'linear-gradient(90deg, #6366f1, #10b981)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Daily Expenses
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              Student Budget Tracker
            </div>
          </div>
        </Link>

        {/* Navigation Links */}
        {user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <Link to="/" className={`btn ${location.pathname === '/' ? 'btn-primary' : 'btn-secondary'}`} style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
              <Wallet size={16} /> Dashboard
            </Link>
            <Link to="/transactions" className={`btn ${location.pathname === '/transactions' ? 'btn-primary' : 'btn-secondary'}`} style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
              <ArrowLeftRight size={16} /> Transactions
            </Link>
            <Link to="/analytics" className={`btn ${location.pathname === '/analytics' ? 'btn-primary' : 'btn-secondary'}`} style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
              <PieChart size={16} /> Analytics
            </Link>
            <Link to="/savings" className={`btn ${location.pathname === '/savings' ? 'btn-primary' : 'btn-secondary'}`} style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
              <PiggyBank size={16} /> Savings
            </Link>
          </div>
        )}

        {/* Action Buttons & Profile Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {user ? (
            <>
              <button onClick={onOpenTransaction} className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
                <PlusCircle size={16} /> Add Expense
              </button>
              
              <button onClick={onOpenTopUp} className="btn btn-success" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
                + Add Money
              </button>

              <button onClick={onOpenGuardian} className="btn btn-secondary" title="Guardian Observer Access Code" style={{ padding: '0.5rem', borderRadius: 'var(--radius-md)' }}>
                <ShieldCheck size={18} color="var(--emerald)" />
              </button>

              <button onClick={toggleTheme} className="btn btn-secondary" title="Toggle Light/Dark Theme" style={{ padding: '0.5rem', borderRadius: 'var(--radius-md)' }}>
                {theme === 'dark' ? <Sun size={18} color="#f59e0b" /> : <Moon size={18} color="#6366f1" />}
              </button>

              <div style={{ borderLeft: '1px solid var(--border-color)', height: '24px', margin: '0 0.25rem' }}></div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>{user.name}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>৳ {summary.netBalance.toLocaleString()}</div>
                </div>
                <button onClick={handleLogout} className="btn btn-danger" title="Logout" style={{ padding: '0.5rem', borderRadius: 'var(--radius-md)' }}>
                  <LogOut size={16} />
                </button>
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button onClick={toggleTheme} className="btn btn-secondary" style={{ padding: '0.5rem' }}>
                {theme === 'dark' ? <Sun size={18} color="#f59e0b" /> : <Moon size={18} color="#6366f1" />}
              </button>
              <Link to="/login" className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>Login</Link>
              <Link to="/register" className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>Register</Link>
            </div>
          )}
        </div>

      </div>
    </nav>
  );
};

export default Navbar;
