'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/config';
import MultiEmailSelector from './MultiEmailSelector';

const types = ['Internal', 'Video', 'Client Meeting'];

export default function CreateMeeting({ onClose, onSaved, onToast }) {
  const [form, setForm] = useState({
    title: '',
    datetime: '',
    type: 'Video',
    company: 'ThinkAIWorks',
    creatorEmail: '',
    meetingLink: '',
  });
  const [clients, setClients] = useState([]);
  const [attendees, setAttendees] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    try {
      const u = JSON.parse(localStorage.getItem('user') || '{}');
      if (u.email) setForm((f) => ({ ...f, creatorEmail: u.email }));
    } catch {}
  }, []);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const now = new Date().toISOString().slice(0, 16);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title) return;
    if (!clients.length) {
      onToast?.('Add at least one client', 'error');
      return;
    }
    if (!attendees.length) {
      onToast?.('Add at least one attendee', 'error');
      return;
    }
    setSaving(true);

    try {
      const payload = {
        title:        form.title,
        datetime:     form.datetime,
        type:         form.type,
        company:      form.company,
        creatorEmail: form.creatorEmail.trim(),
        meetingLink:  form.meetingLink.trim(),
        clients,
        attendees,
      };

      const meeting = await api('/meetings', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      onSaved?.(meeting);
      onToast?.('Meeting created — reminder emails will be sent 10 min before', 'success');
      onClose();
    } catch (err) {
      onToast?.(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 620 }}>
        <div className="modal-head">
          <div className="modal-title">Create Meeting</div>
          <button className="modal-close" onClick={onClose}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <form className="intake-form" onSubmit={handleSubmit}>
          {/* Row 1: Title + Type */}
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

          {/* Row 2: Date & Time + Company */}
          <div className="form-row">
            <div className="form-field">
              <label>Date & Time</label>
              <input type="datetime-local" value={form.datetime} onChange={set('datetime')} min={now} />
            </div>
            <div className="form-field">
              <label>Company</label>
              <div style={{padding:'9px 12px',background:'var(--bg3)',border:'1px solid var(--border2)',borderRadius:'var(--r)',fontSize:13,color:'var(--tai)'}}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{marginRight:6,verticalAlign:'middle'}}><circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/></svg>
                ThinkAIWorks
              </div>
            </div>
          </div>

          {/* Clients */}
          <div className="form-field" style={{ marginTop: 4 }}>
            <MultiEmailSelector
              label="Client"
              placeholder="Search clients or type an email..."
              apiEndpoint="/meetings/contacts"
              listKey="clients"
              selected={clients}
              onChange={setClients}
              required
            />
          </div>

          {/* Attendees */}
          <div className="form-field" style={{ marginTop: 4 }}>
            <MultiEmailSelector
              label="Attendees / Employees"
              placeholder="Search employees or type an email..."
              apiEndpoint="/meetings/contacts"
              listKey="employees"
              selected={attendees}
              onChange={setAttendees}
              required
            />
          </div>

          {/* Email & Links section */}
          <div style={{
            marginTop: 12,
            padding: '14px 16px',
            background: 'rgba(124,92,252,0.06)',
            border: '1px solid rgba(124,92,252,0.18)',
            borderRadius: 'var(--r)',
          }}>
            <div style={{display:'flex',alignItems:'center',gap:7,marginBottom:12}}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--tai)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 17H2a3 3 0 0 0 3-3V9a7 7 0 0 1 14 0v5a3 3 0 0 0 3 3zm-8.27 4a2 2 0 0 1-3.46 0"/></svg>
              <span style={{fontSize:11,fontWeight:700,color:'var(--tai)',textTransform:'uppercase',letterSpacing:'0.5px'}}>
                Notifications & Links
              </span>
            </div>

            <div className="form-row" style={{marginTop:0}}>
              <div className="form-field">
                <label style={{color:'var(--text2)'}}>Creator Email</label>
                <input
                  type="email"
                  value={form.creatorEmail}
                  readOnly
                  style={{fontSize:13,color:'var(--tai)',cursor:'default',background:'var(--bg)'}}
                />
              </div>
              <div className="form-field">
                <label style={{color:'var(--text2)'}}>Meeting Link</label>
                <input
                  type="url"
                  placeholder="https://zoom.us/j/..."
                  value={form.meetingLink}
                  onChange={set('meetingLink')}
                  style={{fontSize:13}}
                />
              </div>
            </div>
          </div>

          {/* Actions */}
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
