'use client';

import { useState } from 'react';
import { api } from '@/lib/config';

const SUB_ROLES = ['intern', 'developer', 'team lead', 'member', 'manager', 'hr', 'accountant'];

export default function AddEmployee({ editData, onClose, onSaved, onToast }) {
  const isEdit = !!editData;
  const [form, setForm] = useState({
    name: editData?.name || '',
    email: editData?.email || '',
    loginEmail: editData?.loginEmail || '',
    password: '',
    role: editData?.role || '',
    subRole: editData?.subRole || '',
    score: editData?.score ?? '',
    rating: editData?.rating ?? '',
    attendance: editData?.attendance ?? '',
    status: editData?.status || '',
    company: 'ThinkAIWorks',
  });
  const [subRoleDraft, setSubRoleDraft] = useState(editData?.subRole || '');
  const [saving, setSaving] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name) return;
    setSaving(true);
    try {
      if (isEdit) {
        await api(`/employees/${editData._id}`, { method: 'PUT', body: JSON.stringify(form) });
      } else {
        await api('/employees', { method: 'POST', body: JSON.stringify(form) });
      }
      onSaved?.();
      onToast?.(isEdit ? 'Employee updated' : 'Employee added', 'success');
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
          <div className="modal-title">{isEdit ? 'Edit Employee' : 'Add Employee'}</div>
          <button className="modal-close" onClick={onClose}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <form className="intake-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-field" style={{flex:2}}>
              <label>Name *</label>
              <input type="text" placeholder="e.g. John Doe" value={form.name} onChange={set('name')} required />
            </div>
            <div className="form-field">
              <label>Email</label>
              <input type="email" placeholder="john@thinkaiworks.com" value={form.email} onChange={set('email')} />
            </div>
          </div>

          <div className="form-row">
            <div className="form-field">
              <label>Role</label>
              <input type="text" placeholder="e.g. Developer" value={form.role} onChange={set('role')} />
            </div>
            <div className="form-field">
              <label>Sub Role</label>
              <input list="editSubRoleList" placeholder="Type or select" value={subRoleDraft} onChange={e => { setSubRoleDraft(e.target.value); setForm({ ...form, subRole: e.target.value }); }} />
              <datalist id="editSubRoleList">
                {SUB_ROLES.map(r => <option key={r} value={r} />)}
              </datalist>
            </div>
          </div>

          <div className="form-field">
            <label>Company</label>
            <div style={{padding:'9px 12px',background:'var(--bg3)',border:'1px solid var(--border2)',borderRadius:'var(--r)',fontSize:13,color:'var(--tai)'}}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{marginRight:6,verticalAlign:'middle'}}><circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/></svg>
              ThinkAIWorks
            </div>
          </div>

          <div className="form-row">
            <div className="form-field">
              <label>Login Email</label>
              <input type="email" placeholder="login@example.com" value={form.loginEmail} onChange={set('loginEmail')} />
            </div>
            <div className="form-field">
              <label>{isEdit ? 'New Password (leave blank to keep)' : 'Password'}</label>
              <input type="password" placeholder="••••••••" value={form.password} onChange={set('password')} />
            </div>
          </div>

          <div className="form-row">
            <div className="form-field">
              <label>AI Score</label>
              <input type="number" min="0" max="100" placeholder="0–100" value={form.score} onChange={e => setForm({...form, score: e.target.value === '' ? '' : Number(e.target.value)})} />
            </div>
            <div className="form-field">
              <label>Rating (1–5)</label>
              <input type="number" min="1" max="5" step="0.1" placeholder="e.g. 4.5" value={form.rating} onChange={e => setForm({...form, rating: e.target.value === '' ? '' : Number(e.target.value)})} />
            </div>
          </div>

          <div className="form-row">
            <div className="form-field">
              <label>Attendance %</label>
              <input type="number" min="0" max="100" placeholder="0–100" value={form.attendance} onChange={e => setForm({...form, attendance: e.target.value === '' ? '' : Number(e.target.value)})} />
            </div>
            <div className="form-field">
              <label>Status</label>
              <select value={form.status} onChange={set('status')}>
                <option value="">Select…</option>
                <option value="Top">Top</option>
                <option value="Strong">Strong</option>
                <option value="Good">Good</option>
                <option value="Risk">Risk</option>
              </select>
            </div>
          </div>

          {isEdit && (
            <div style={{padding:'10px 14px',background:'var(--bg3)',borderRadius:'var(--r)',fontSize:12,color:'var(--text2)',marginTop:4}}>
              Trend is calculated automatically. Leave password blank to keep current.
            </div>
          )}

          <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
            <button type="button" className="btn btn-ghost" onClick={onClose} style={{ flex: 1 }}>Cancel</button>
            <button type="submit" className="btn btn-es" disabled={saving || !form.name} style={{ flex: 1 }}>
              {saving ? 'Saving...' : isEdit ? 'Update' : 'Add Employee'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
