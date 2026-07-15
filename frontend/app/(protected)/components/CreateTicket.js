'use client';

import { useState } from 'react';
import { api } from '@/lib/config';

function getUser() {
  if (typeof window === 'undefined') return { name: '', email: '' };
  try { return JSON.parse(localStorage.getItem('user') || '{}'); } catch { return {}; }
}

export default function CreateTicket({ onClose, onSaved, onToast }) {
  const user = getUser();
  const [form, setForm] = useState({
    client: user.name || '',
    email: user.email || '',
    issue: '',
    priority: 'Medium',
    company: 'ThinkAIWorks',
  });
  const [saving, setSaving] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.issue) { onToast?.('Describe the issue', 'error'); return; }
    setSaving(true);
    try {
      await api('/tickets', {
        method: 'POST',
        body: JSON.stringify({ ...form, ticketId: '#T-' + Date.now().toString().slice(-4), status: 'Open' }),
      });
      onSaved?.();
      onToast?.('Ticket created', 'success');
      onClose();
    } catch (err) {
      onToast?.(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div className="modal-title">New Support Ticket</div>
          <button className="modal-close" onClick={onClose}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <form className="intake-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-field">
              <label>Name</label>
              <input type="text" value={form.client} onChange={set('client')} placeholder="Your name" />
            </div>
            <div className="form-field">
              <label>Email</label>
              <input type="email" value={form.email} onChange={set('email')} placeholder="your@email.com" />
            </div>
          </div>

          <div className="form-field">
            <label>Issue *</label>
            <textarea placeholder="Describe what's going wrong..." value={form.issue} onChange={set('issue')} rows={4} required />
          </div>

          <div className="form-row">
            <div className="form-field">
              <label>Priority</label>
              <select value={form.priority} onChange={set('priority')}>
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
              </select>
            </div>
            <div className="form-field">
              <label>Company</label>
              <div style={{padding:'9px 12px',background:'var(--bg3)',border:'1px solid var(--border2)',borderRadius:'var(--r)',fontSize:13,color:'var(--tai)'}}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{marginRight:6,verticalAlign:'middle'}}><circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/></svg>
                ThinkAIWorks
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
            <button type="button" className="btn btn-ghost" onClick={onClose} style={{ flex: 1 }}>Cancel</button>
            <button type="submit" className="btn btn-es" disabled={saving || !form.issue} style={{ flex: 1 }}>
              {saving ? 'Creating...' : 'Create Ticket'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
