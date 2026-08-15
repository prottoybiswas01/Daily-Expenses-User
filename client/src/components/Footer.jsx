import React from 'react';
import { ShieldCheck, Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer style={{ background: 'var(--bg-card)', borderTop: '1px solid var(--border-color)', padding: '2rem 1.5rem', textAlign: 'center', marginTop: 'auto' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          <span>Daily Expenses & Student Budget Tracker</span> • <span>Powered by React + Node.js + MongoDB Atlas</span>
        </div>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          Crafted with <Heart size={14} color="#f43f5e" fill="#f43f5e" /> for Bangladeshi Students & Guardians <ShieldCheck size={14} color="var(--emerald)" />
        </div>
      </div>
    </footer>
  );
};

export default Footer;
