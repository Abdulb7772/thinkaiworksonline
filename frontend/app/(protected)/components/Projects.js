'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/config';

const STATUSES = ['assigned', 'working', 'in_progress', 'in_testing', 'completed'];

export default function Projects({ onToast }) {
  const [projects, setProjects] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [role, setRole] = useState('admin');
  const [showForm, setShowForm] = useState(false);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', clients: [], startDate: '', completionDate: '' });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem('user') || '{}');
    if (u.role) setRole(u.role);
  }, []);

  const fetch = async () => {
    try {
      const [p, c] = await Promise.all([
        api('/projects/'),
        api('/projects/customers/list'),
      ]);
      setProjects(p);
      setCustomers(c);
    } catch {}
  };

  useEffect(() => { fetch(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.title) { onToast?.('Title is required', 'error'); return; }
    setSaving(true);
    try {
      await api('/projects/', { method: 'POST', body: JSON.stringify({ ...form, clients: form.clients.map(c => c.value) }) });
      onToast?.('Project created', 'success');
      setForm({ title: '', description: '', clients: [], startDate: '', completionDate: '' });
      setShowForm(false);
      fetch();
    } catch (err) {
      onToast?.(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await api(`/projects/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) });
      onToast?.(`Status changed to ${status}`, 'success');
      fetch();
    } catch (err) {
      onToast?.(err.message, 'error');
    }
  };

  const deleteProject = async (id) => {
    setDeleting(id);
    try {
      await api(`/projects/${id}`, { method: 'DELETE' });
      onToast?.('Project deleted', 'success');
      fetch();
    } catch (err) {
      onToast?.(err.message, 'error');
    } finally {
      setDeleting(null);
    }
  };

  const toggleClient = (id) => {
    setForm(f => {
      const exists = f.clients.find(c => c.value === id);
      return { ...f, clients: exists ? f.clients.filter(c => c.value !== id) : [...f.clients, { value: id }] };
    });
  };

  return (
    <div className="page active" style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
      <div className="ph">
        <div>
          <div className="pt">Projects</div>
          <div className="ps">{role === 'admin' ? 'Manage projects and assign clients' : 'View your projects'}</div>
        </div>
      </div>

      {role === 'admin' && (
        <div className="card" style={{ maxWidth: 520 }}>
          <div className="card-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>{showForm ? 'New Project' : 'Projects'}</span>
            <button className="btn btn-sm btn-tai" onClick={() => setShowForm(!showForm)}>
              {showForm ? 'Cancel' : '+ New Project'}
            </button>
          </div>

          {showForm && (
            <form className="intake-form" onSubmit={handleCreate}>
              <div className="form-field">
                <label>Title *</label>
                <input type="text" placeholder="Project name" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
              </div>
              <div className="form-field">
                <label>Description</label>
                <textarea placeholder="Project details" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} />
              </div>
              <div className="form-field">
                <label>Assign Clients</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
                  {customers.map(c => (
                    <label key={c._id} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 6, background: form.clients.find(x => x.value === c._id) ? 'var(--accent)' : 'var(--bg2)', color: form.clients.find(x => x.value === c._id) ? '#fff' : 'var(--text1)', cursor: 'pointer', fontSize: 13, border: '1px solid var(--border)' }}>
                      <input type="checkbox" checked={!!form.clients.find(x => x.value === c._id)} onChange={() => toggleClient(c._id)} style={{ display: 'none' }} />
                      {c.name}
                    </label>
                  ))}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <div className="form-field" style={{ flex: 1 }}>
                  <label>Start Date</label>
                  <input type="date" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} />
                </div>
                <div className="form-field" style={{ flex: 1 }}>
                  <label>Completion Date</label>
                  <input type="date" value={form.completionDate} onChange={e => setForm({ ...form, completionDate: e.target.value })} />
                </div>
              </div>
              <button type="submit" className="btn btn-tai" disabled={saving} style={{ alignSelf: 'flex-start' }}>
                {saving ? 'Creating...' : 'Create Project'}
              </button>
            </form>
          )}
        </div>
      )}

      {projects.map(project => (
        <div key={project._id} className="card">
          <div className="card-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span>{project.title}</span>
              <span className={`badge ${project.status === 'completed' ? 'badge-green' : project.status === 'assigned' ? 'badge-amber' : 'badge-blue'}`} style={{ marginLeft: 10, fontSize: 11 }}>
                {project.status.replace(/_/g, ' ')}
              </span>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              {role === 'admin' && (
                <button className="btn btn-sm btn-ghost" style={{color:'var(--red)'}} onClick={() => deleteProject(project._id)} disabled={deleting === project._id}>
                  {deleting === project._id ? '...' : '✕'}
                </button>
              )}
              <button className="btn btn-sm btn-outline" onClick={() => setSelected(selected?._id === project._id ? null : project)}>
                {selected?._id === project._id ? 'Hide' : 'Details'}
              </button>
            </div>
          </div>

          <div style={{ fontSize: 13, color: 'var(--text3)', marginBottom: 8 }}>
            {project.clients?.length > 0 && (
              <span>Clients: {project.clients.map(c => c.name).join(', ')} &middot; </span>
            )}
            {project.startDate && <span>Start: {project.startDate} &middot; </span>}
            {project.completionDate && <span>End: {project.completionDate}</span>}
          </div>

          {role === 'admin' && (
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {STATUSES.map(s => (
                <button
                  key={s}
                  className={`btn btn-sm ${project.status === s ? 'btn-tai' : 'btn-outline'}`}
                  onClick={() => updateStatus(project._id, s)}
                  style={{ fontSize: 11, textTransform: 'capitalize' }}
                >
                  {s.replace(/_/g, ' ')}
                </button>
              ))}
            </div>
          )}

          {selected?._id === project._id && (
            <div style={{ marginTop: 16, padding: 14, background: 'var(--bg2)', borderRadius: 10, border: '1px solid var(--border)' }}>
              <div style={{ fontWeight: 600, marginBottom: 6, color: 'var(--text1)' }}>Description</div>
              <div style={{ color: 'var(--text2)', fontSize: 14, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{project.description || 'No description'}</div>
            </div>
          )}
        </div>
      ))}

      {projects.length === 0 && (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--text3)' }}>No projects yet</div>
      )}
    </div>
  );
}
