import React, { useState, useEffect } from 'react';
import { generateSharedLinkApi, resendSharedLinkApi, getSharedLinksApi, revokeSharedLinkApi } from '../services/guardianService';
import { X, ShieldCheck, Copy, Check, Trash2, Mail, Send, AlertTriangle } from 'lucide-react';

const GuardianModal = ({ isOpen, onClose }) => {
  const [recipientName, setRecipientName] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [links, setLinks] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [resendingId, setResendingId] = useState(null);
  const [copiedCode, setCopiedCode] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [error, setError] = useState('');

  const fetchLinks = async () => {
    try {
      const res = await getSharedLinksApi();
      if (res.success) setLinks(res.data);
    } catch (err) {
      console.error('Failed to load shared links:', err);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchLinks();
      setSuccessMsg('');
      setError('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleGenerate = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!recipientName || !recipientEmail) {
      setError('Please provide parent/guardian name and email');
      return;
    }

    setSubmitting(true);
    try {
      const res = await generateSharedLinkApi({ recipientName, recipientEmail });
      if (res.success) {
        setRecipientName('');
        setRecipientEmail('');
        
        if (res.emailError) {
          setError(res.emailError);
        } else if (res.emailSent) {
          setSuccessMsg(`Access link created & invitation email sent via Resend to ${recipientEmail}!`);
        } else {
          setSuccessMsg(`Access code generated for ${recipientEmail}.`);
        }

        await fetchLinks();
      } else {
        setError(res.message || 'Failed to generate link');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error creating access link');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = async (id, email) => {
    setResendingId(id);
    setError('');
    setSuccessMsg('');
    try {
      const res = await resendSharedLinkApi(id);
      if (res.success) {
        setSuccessMsg(`Resend email sent successfully to ${email}!`);
      } else {
        setError(res.message || 'Failed to resend email');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error resending access email');
    } finally {
      setResendingId(null);
    }
  };

  const handleRevoke = async (id) => {
    try {
      const res = await revokeSharedLinkApi(id);
      if (res.success) {
        setSuccessMsg('Access link revoked successfully');
        fetchLinks();
      }
    } catch (err) {
      console.error('Error revoking link:', err);
    }
  };

  const copyToClipboard = (accessCode) => {
    const fullUrl = `${window.location.origin}/guardian-view/${accessCode}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedCode(accessCode);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" style={{ maxWidth: '640px' }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShieldCheck color="var(--emerald)" size={24} />
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Guardian Observer Access</h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Send automated Resend email invitation links to your parents or guardian</p>
            </div>
          </div>
          <button onClick={onClose} className="btn btn-secondary" style={{ padding: '0.4rem' }}>
            <X size={18} />
          </button>
        </div>

        {error && (
          <div style={{ background: 'rgba(244, 63, 94, 0.15)', border: '1px solid rgba(244, 63, 94, 0.3)', color: 'var(--rose)', padding: '0.75rem', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', marginBottom: '1rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
            <AlertTriangle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>{error}</div>
          </div>
        )}

        {successMsg && (
          <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', color: 'var(--emerald)', padding: '0.75rem', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', marginBottom: '1rem' }}>
            {successMsg}
          </div>
        )}

        <form onSubmit={handleGenerate} style={{ marginBottom: '1.5rem', background: 'rgba(0,0,0,0.15)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
          <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--emerald)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Mail size={16} /> + Generate New Link & Send Resend Email
          </h4>
          <div className="grid-2" style={{ gap: '0.75rem' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <input type="text" placeholder="Guardian Name (e.g. Abba, Amma)" value={recipientName} onChange={(e) => setRecipientName(e.target.value)} className="form-input" required />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <input type="email" placeholder="Guardian Email Address" value={recipientEmail} onChange={(e) => setRecipientEmail(e.target.value)} className="form-input" required />
            </div>
          </div>
          <button type="submit" disabled={submitting} className="btn btn-success" style={{ width: '100%', marginTop: '0.75rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
            <Send size={15} /> {submitting ? 'Generating & Sending Email...' : 'Generate & Send Resend Email'}
          </button>
        </form>

        <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.75rem' }}>Active & Past Guardian Access Links</h4>
        <div style={{ maxHeight: '220px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {links.length === 0 ? (
            <div style={{ fontSize: '0.85rem', color: 'var(--text-dim)', textAlign: 'center', padding: '1.5rem' }}>No guardian links generated yet</div>
          ) : (
            links.map((link) => (
              <div key={link._id} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-color)', padding: '0.75rem', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>{link.recipientName} ({link.recipientEmail})</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Code: <strong style={{ color: 'var(--primary)' }}>{link.accessCode}</strong> • <span style={{ color: link.status === 'Active' ? 'var(--emerald)' : 'var(--rose)' }}>{link.status}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.35rem' }}>
                  {link.status === 'Active' && (
                    <button onClick={() => handleResend(link._id, link.recipientEmail)} disabled={resendingId === link._id} className="btn btn-secondary" style={{ padding: '0.35rem 0.6rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.2rem' }} title="Resend email via Resend">
                      <Mail size={13} color="var(--primary)" /> {resendingId === link._id ? 'Sending...' : 'Resend Email'}
                    </button>
                  )}
                  {link.status === 'Active' && (
                    <button onClick={() => copyToClipboard(link.accessCode)} className="btn btn-secondary" style={{ padding: '0.35rem 0.6rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                      {copiedCode === link.accessCode ? <Check size={13} color="var(--emerald)" /> : <Copy size={13} />} Link
                    </button>
                  )}
                  {link.status === 'Active' && (
                    <button onClick={() => handleRevoke(link._id)} className="btn btn-danger" style={{ padding: '0.35rem 0.6rem', fontSize: '0.75rem' }} title="Revoke access">
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default GuardianModal;
