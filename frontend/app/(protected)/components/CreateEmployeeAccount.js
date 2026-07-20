'use client';

import { useState } from 'react';
import { api } from '@/lib/config';

const SUB_ROLES = ['intern', 'developer', 'team lead', 'member', 'manager', 'hr', 'accountant'];

export default function CreateEmployeeAccount({ onToast }) {
  const [form, setForm] = useState({ name: '', loginEmail: '', notificationEmail: '', password: '', subRole: '' });
  const [subRoleDraft, setSubRoleDraft] = useState('');
  const [saving, setSaving] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, loginEmail, notificationEmail, password, subRole } = form;
    if (!name || !loginEmail || !notificationEmail || !password) {
      onToast?.('Please provide all fields', 'error');
      return;
    }
    if (password.length < 6) {
      onToast?.('Password must be at least 6 characters', 'error');
      return;
    }
    setSaving(true);
    try {
      await api('/auth/create-employee', {
        method: 'POST',
        body: JSON.stringify({
          name,
          loginEmail,
          sendEmailTo: notificationEmail,
          password,
          subRole: subRole || undefined,
        }),
      });
      onToast?.('Employee account created. Credentials sent via email.', 'success');
      setForm({ name: '', loginEmail: '', notificationEmail: '', password: '', subRole: '' });
      setSubRoleDraft('');
    } catch (err) {
      onToast?.(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page active" style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
      <div className="ph">
        <div>
          <div className="pt">Create Employee Account</div>
          <div className="ps">Create a new employee account — credentials will be sent to the primary email</div>
        </div>
      </div>

      <div className="card" style={{ maxWidth: 520 }}>
        <div className="card-title">Employee Details</div>
        <form className="intake-form" onSubmit={handleSubmit}>
          <div className="form-field">
            <label>Full Name</label>
            <input type="text" placeholder="e.g. John Doe" value={form.name} onChange={set('name')} required />
          </div>
          <div className="form-field">
            <label>Primary Email</label>
            <input type="email" placeholder="personal@email.com" value={form.notificationEmail} onChange={set('notificationEmail')} required />
          </div>
          <div className="form-field">
            <label>Secondary Email</label>
            <input type="email" placeholder="john@thinkaiworks.com" value={form.loginEmail} onChange={set('loginEmail')} required />
          </div>
          <div className="form-field">
            <label>Password</label>
            <input type="password" placeholder="Minimum 6 characters" value={form.password} onChange={set('password')} required minLength={6} />
          </div>
          <div className="form-field">
            <label>Sub Role</label>
            <input list="subRoleList" placeholder="Type or select a role" value={subRoleDraft} onChange={e => { setSubRoleDraft(e.target.value); setForm({ ...form, subRole: e.target.value }); }} />
            <datalist id="subRoleList">
              {SUB_ROLES.map(r => <option key={r} value={r} />)}
            </datalist>
          </div>
          <button type="submit" className="btn btn-tai" disabled={saving} style={{ alignSelf: 'flex-start' }}>
            {saving ? 'Creating...' : 'Create Account & Send Email'}
          </button>
        </form>
      </div>
    </div>
  );
}
