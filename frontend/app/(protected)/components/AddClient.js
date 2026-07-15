'use client';

import { useState } from 'react';
import { api } from '@/lib/config';

const stages = ['Discovery', 'Proposal', 'Negotiation', 'Active', 'Closed Won'];

export default function AddClient({ onClose, onSaved, onToast, onAddLead }) {
  const [form, setForm] = useState({
    name: '',
    company: 'ThinkAIWorks',
    service: '',
    value: '',
    stage: 'Discovery',
    assignedTo: '',
    lastContact: '',
  });
  const [saving, setSaving] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name) return;
    setSaving(true);
    try {
      const client = await api('/clients', {
        method: 'POST',
        body: JSON.stringify(form),
      });
      onSaved?.(client);
      onAddLead?.({ name: client.name, budget: client.value || '—', service: client.service || '—', stage: client.stage || 'Discovery', age: 'Just now' });
      onToast?.('Client added successfully', 'success');
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
          <div className="modal-title">Add New Client</div>
          <button className="modal-close" onClick={onClose}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <form className="intake-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-field">
              <label>Client Name *</label>
              <input type="text" placeholder="e.g. John Doe" value={form.name} onChange={set('name')} required />
            </div>
            <div className="form-field">
              <label>Company</label>
              <div style={{padding:'9px 12px',background:'var(--bg3)',border:'1px solid var(--border2)',borderRadius:'var(--r)',fontSize:13,color:'var(--tai)'}}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{marginRight:6,verticalAlign:'middle'}}><circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/></svg>
                ThinkAIWorks
              </div>
            </div>
          </div>

          <div className="form-row">
            <div className="form-field">
              <label>Service</label>
              <input type="text" placeholder="e.g. Amazon FBA" value={form.service} onChange={set('service')} />
            </div>
            <div className="form-field">
              <label>Value</label>
              <input type="text" placeholder="e.g. $5,200" value={form.value} onChange={set('value')} />
            </div>
          </div>

          <div className="form-row">
            <div className="form-field">
              <label>Stage</label>
              <select value={form.stage} onChange={set('stage')}>
                {stages.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div className="form-field">
              <label>Assigned To</label>
              <input type="text" placeholder="e.g. Sarah K." value={form.assignedTo} onChange={set('assignedTo')} />
            </div>
          </div>

          <div className="form-field">
            <label>Last Contact</label>
            <input type="text" placeholder="e.g. Today, Yesterday, 2d ago" value={form.lastContact} onChange={set('lastContact')} />
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
            <button type="button" className="btn btn-ghost" onClick={onClose} style={{ flex: 1 }}>Cancel</button>
            <button type="submit" className="btn btn-es" disabled={saving || !form.name} style={{ flex: 1 }}>
              {saving ? 'Saving...' : 'Add Client'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
