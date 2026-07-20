'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/config';

const STATUSES = ['pending', 'project_started', 'employee_assigned', 'in_progress', 'working', 'testing', 'finishing_up', 'completed'];
const today = () => new Date().toISOString().split('T')[0];

const STATUS_LABELS = {
  pending: 'Pending',
  project_started: 'Project Started',
  employee_assigned: 'Employee Assigned',
  in_progress: 'In Progress',
  working: 'Working',
  testing: 'Testing',
  finishing_up: 'Finishing Up',
  completed: 'Completed',
};

export default function Projects({ onToast }) {
  const [projects, setProjects] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [user, setUser] = useState({ role: 'admin', id: '' });
  const [showForm, setShowForm] = useState(false);
  const [editProject, setEditProject] = useState(null);
  const [editStatus, setEditStatus] = useState('');
  const [detailProject, setDetailProject] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', client: '', employee: '', startDate: '', completionDate: '' });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem('user') || '{}');
    setUser({ role: u.role || 'admin', id: u.id || '' });
  }, []);

  const fetch = async () => {
    try {
      const [p, c, e] = await Promise.all([
        api('/projects/'),
        api('/projects/customers/list'),
        api('/tasks/employees'),
      ]);
      setProjects(p);
      setCustomers(c);
      setEmployees(e);
    } catch {}
  };

  useEffect(() => { fetch(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.title) { onToast?.('Title is required', 'error'); return; }
    setSaving(true);
    try {
      await api('/projects/', {
        method: 'POST',
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          clients: form.client ? [form.client] : [],
          employees: form.employee ? [form.employee] : [],
          startDate: form.startDate,
        }),
      });
      onToast?.('Project created', 'success');
      setForm({ title: '', description: '', client: '', employee: '', startDate: '', completionDate: '' });
      setShowForm(false);
      fetch();
    } catch (err) {
      onToast?.(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    if (!editProject) return;
    setSaving(true);
    try {
      const body = {};
      if (form.title !== editProject.title) body.title = form.title;
      if (form.description !== (editProject.description || '')) body.description = form.description;
      if (form.client !== (editProject.clients?.[0]?._id || '')) body.clients = form.client ? [form.client] : [];
      if (form.employee !== (editProject.employees?.[0]?._id || '')) body.employees = form.employee ? [form.employee] : [];
      if (form.completionDate && form.startDate && form.completionDate < form.startDate) {
        onToast?.('Completion date cannot be before start date', 'error'); setSaving(false); return;
      }
      if (form.startDate !== (editProject.startDate || '')) body.startDate = form.startDate;
      if (form.completionDate !== (editProject.completionDate || '')) body.completionDate = form.completionDate;
      if (editStatus !== editProject.status) body.status = editStatus;
      if (Object.keys(body).length === 0) { onToast?.('No changes made', 'error'); setSaving(false); return; }
      await api(`/projects/${editProject._id}`, { method: 'PATCH', body: JSON.stringify(body) });
      onToast?.('Project updated', 'success');
      closeEdit();
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
      onToast?.(`Status: ${STATUS_LABELS[status]}`, 'success');
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

  const openEdit = (project) => {
    setEditProject(project);
    setEditStatus(project.status);
    setForm({
      title: project.title,
      description: project.description || '',
      client: project.clients?.[0]?._id || '',
      employee: project.employees?.[0]?._id || '',
      startDate: project.startDate || '',
      completionDate: project.completionDate || '',
    });
  };

  const closeEdit = () => { setEditProject(null); setEditStatus(''); };

  const isAssigned = (project) => {
    if (user.role === 'customer') return project.clients?.some(c => (c._id || c) === user.id);
    if (user.role === 'employee') return project.employees?.some(e => (e._id || e) === user.id);
    return false;
  };

  return (
    <div className="page active" style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
      <div className="ph">
        <div>
          <div className="pt">Projects</div>
          <div className="ps">{user.role === 'admin' ? 'Manage projects and assign clients' : user.role === 'employee' ? 'View assigned projects' : 'View your projects'}</div>
        </div>
      </div>

      {user.role === 'admin' && (
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
                <label>Assign Client</label>
                <select value={form.client} onChange={e => setForm({ ...form, client: e.target.value })}>
                  <option value="">Select a client</option>
                  {customers.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
              </div>
              <div className="form-field">
                <label>Assign Employee (optional)</label>
                <select value={form.employee} onChange={e => setForm({ ...form, employee: e.target.value })}>
                  <option value="">Select an employee</option>
                  {employees.map(e => <option key={e._id} value={e._id}>{e.name}</option>)}
                </select>
              </div>
              <div className="form-field">
                <label>Start Date</label>
                <input type="date" min={today()} value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} />
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
              <span className={`badge ${project.status === 'completed' ? 'badge-green' : project.status === 'pending' ? 'badge-amber' : 'badge-blue'}`} style={{ marginLeft: 10, fontSize: 11, textTransform: 'capitalize' }}>
                {STATUS_LABELS[project.status] || project.status.replace(/_/g, ' ')}
              </span>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              {user.role === 'admin' && (
                <>
                  <button className="btn btn-sm btn-outline" onClick={() => openEdit(project)} style={{ fontSize: 11 }}>Edit</button>
                  <button className="btn btn-sm btn-ghost" style={{ color: 'var(--red)' }} onClick={() => deleteProject(project._id)} disabled={deleting === project._id}>
                    {deleting === project._id ? '...' : '✕'}
                  </button>
                </>
              )}
              {(user.role === 'customer' || user.role === 'employee') && isAssigned(project) && (
                <button className="btn btn-sm btn-outline" onClick={() => setDetailProject(detailProject?._id === project._id ? null : project)}>
                  {detailProject?._id === project._id ? 'Hide' : 'View Details'}
                </button>
              )}
            </div>
          </div>

          <div style={{ fontSize: 13, color: 'var(--text3)', marginBottom: 8 }}>
            {project.employees?.length > 0 && (
              <span>Employee: {project.employees.map(e => e.name).join(', ')} &middot; </span>
            )}
            {project.startDate && <span>Start: {project.startDate} &middot; </span>}
            {project.completionDate && <span>End: {project.completionDate}</span>}
          </div>

          {/* Admin status controls */}
          {user.role === 'admin' && (
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {STATUSES.map(s => (
                <button key={s} className={`btn btn-sm ${project.status === s ? 'btn-tai' : 'btn-outline'}`} onClick={() => updateStatus(project._id, s)} style={{ fontSize: 11, textTransform: 'capitalize' }}>
                  {STATUS_LABELS[s]}
                </button>
              ))}
            </div>
          )}

          {/* Assigned customer / employee detail */}
          {(user.role === 'customer' || user.role === 'employee') && isAssigned(project) && detailProject?._id === project._id && (
            <div style={{ marginTop: 16, padding: 14, background: 'var(--bg2)', borderRadius: 10, border: '1px solid var(--border)' }}>
              <div style={{ fontWeight: 600, marginBottom: 6, color: 'var(--text1)' }}>Description</div>
              <div style={{ color: 'var(--text2)', fontSize: 14, lineHeight: 1.6, whiteSpace: 'pre-wrap', marginBottom: 16 }}>{project.description || 'No description'}</div>

              <div style={{ fontWeight: 600, marginBottom: 12, color: 'var(--text1)' }}>Progress</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 0, flexWrap: 'wrap' }}>
                {STATUSES.map((s, i) => {
                  const cur = STATUSES.indexOf(project.status);
                  const done = i <= cur;
                  const isLast = i === STATUSES.length - 1;
                  return (
                    <div key={s} style={{ display: 'flex', alignItems: 'center' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                        <div style={{ width: 20, height: 20, borderRadius: '50%', background: done ? 'var(--accent)' : 'var(--bg2)', border: `2px solid ${done ? 'var(--accent)' : 'var(--border)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}>
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={done ? '#fff' : 'var(--text3)'} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">{done ? <polyline points="20 6 9 17 4 12" /> : <circle cx="12" cy="12" r="1" fill="var(--text3)" />}</svg>
                        </div>
                        <span style={{ fontSize: 9, color: done ? 'var(--accent)' : 'var(--text3)', fontWeight: project.status === s ? 700 : 400, whiteSpace: 'nowrap', maxWidth: 70, textAlign: 'center', lineHeight: 1.2 }}>{STATUS_LABELS[s]}</span>
                      </div>
                      {!isLast && <div style={{ width: 24, height: 2, background: i < cur ? 'var(--accent)' : 'var(--border)', margin: '0 2px', marginBottom: 18, transition: 'all 0.2s' }} />}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>
      ))}

      {/* Admin edit modal */}
      {editProject && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={closeEdit}>
          <div className="card" style={{ maxWidth: 480, width: '90%', maxHeight: '90vh', overflow: 'auto' }} onClick={e => e.stopPropagation()}>
            <div className="card-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Edit Project</span>
              <button className="btn btn-sm btn-ghost" onClick={closeEdit} style={{ color: 'var(--text3)' }}>✕</button>
            </div>
            <form className="intake-form" onSubmit={handleEdit}>
              <div className="form-field">
                <label>Title</label>
                <input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
              </div>
              <div className="form-field">
                <label>Description</label>
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} />
              </div>
              <div className="form-field">
                <label>Client</label>
                <select value={form.client} onChange={e => setForm({ ...form, client: e.target.value })}>
                  <option value="">Select a client</option>
                  {customers.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
              </div>
              <div className="form-field">
                <label>Employee</label>
                <select value={form.employee} onChange={e => setForm({ ...form, employee: e.target.value })}>
                  <option value="">Select an employee</option>
                  {employees.map(e => <option key={e._id} value={e._id}>{e.name}</option>)}
                </select>
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <div className="form-field" style={{ flex: 1 }}>
                  <label>Start Date</label>
                  <input type="date" min={today()} value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} />
                </div>
                <div className="form-field" style={{ flex: 1 }}>
                  <label>Completion Date</label>
                  <input type="date" min={today()} value={form.completionDate} onChange={e => setForm({ ...form, completionDate: e.target.value })} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 4 }}>
                {STATUSES.map(s => (
                  <button key={s} type="button" className={`btn btn-sm ${editStatus === s ? 'btn-tai' : 'btn-outline'}`} onClick={() => setEditStatus(s)} style={{ fontSize: 10, textTransform: 'capitalize' }}>
                    {STATUS_LABELS[s]}
                  </button>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                <button type="submit" className="btn btn-tai" disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</button>
                <button type="button" className="btn btn-outline" onClick={closeEdit}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {projects.length === 0 && (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--text3)' }}>No projects yet</div>
      )}
    </div>
  );
}
