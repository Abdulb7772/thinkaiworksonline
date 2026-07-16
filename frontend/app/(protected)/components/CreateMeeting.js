'use client';

import { useState } from 'react';
import { api } from '@/lib/config';

const types = ['Internal', 'Video', 'Client Meeting'];

export default function CreateMeeting({ onClose, onSaved, onToast, clients, employees }) {
  const [form, setForm] = useState({
    title: '',
    client: '',
    datetime: '',
    attendees: '',
    type: 'Video',
    company: 'ThinkAIWorks',
  });
  const [saving, setSaving] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const now = new Date().toISOString().slice(0, 16);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title) return;
    setSaving(true);
    try {
      const meeting = await api('/meetings', {
        method: 'POST',
        body: JSON.stringify(form),
      });
      onSaved?.(meeting);
      onToast?.('Meeting created successfully', 'success');
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
          <div className="modal-title">Create Meeting</div>
          <button className="modal-close" onClick={onClose}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <form className="intake-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-field" style={{flex:2}}>
              <label>Meeting Title *</label>
              <input type="text" placeholder="e.g. Strategy Review" value={form.title} onChange={set('title')} required />
            </div>
            <div className="form-field">
              <label>Type</label>
              <select value={form.type} onChange={set('type')}>
                {types.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-field">
              <label>Client from CRM</label>
              <select value={form.client} onChange={set('client')}>
                <option value="">Select client...</option>
                {(clients || []).map((c, i) => <option key={i}>{c.name}</option>)}
              </select>
            </div>
            <div className="form-field">
              <label>Date & Time</label>
              <input type="datetime-local" value={form.datetime} onChange={set('datetime')} min={now} />
            </div>
          </div>

          <div className="form-row">
            <div className="form-field">
              <label>Attendees</label>
              <select value={form.attendees} onChange={set('attendees')}>
                <option value="">Select attendee...</option>
                {(employees || []).map((e, i) => <option key={i}>{e.name || e}</option>)}
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
            <button type="submit" className="btn btn-es" disabled={saving || !form.title} style={{ flex: 1 }}>
              {saving ? 'Creating...' : 'Create Meeting'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
