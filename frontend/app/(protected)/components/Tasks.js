'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/config';
import { SkeletonCard } from './Skeleton';

export default function Tasks({ onToast }) {
  const [tasks, setTasks] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState('admin');
  const [form, setForm] = useState({ title: '', description: '', assignedTo: '', date: '' });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 5;

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem('user') || '{}');
    if (u.role) setRole(u.role);
  }, []);

  const fetch = async () => {
    try {
      const [t, e] = await Promise.all([
        api('/tasks/'),
        api('/tasks/employees'),
      ]);
      setTasks(t);
      setEmployees(e);
    } catch {} finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetch(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.title || !form.assignedTo || !form.date) {
      onToast?.('Please fill all required fields', 'error');
      return;
    }
    setSaving(true);
    try {
      await api('/tasks/', { method: 'POST', body: JSON.stringify(form) });
      onToast?.('Task assigned', 'success');
      setForm({ title: '', description: '', assignedTo: '', date: '' });
      fetch();
    } catch (err) {
      onToast?.(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await api(`/tasks/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) });
      onToast?.(`Task marked ${status}`, 'success');
      fetch();
    } catch (err) {
      onToast?.(err.message, 'error');
    }
  };

  const deleteTask = async (id) => {
    setDeleting(id);
    try {
      await api(`/tasks/${id}`, { method: 'DELETE' });
      onToast?.('Task deleted', 'success');
      fetch();
    } catch (err) {
      onToast?.(err.message, 'error');
    } finally {
      setDeleting(null);
    }
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="page active" style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
      <div className="ph">
        <div>
          <div className="pt">Daily Tasks</div>
          <div className="ps">Assign and track daily tasks for employees</div>
        </div>
      </div>

      {role === 'admin' && (
        <div className="card" style={{ maxWidth: 520 }}>
          <div className="card-title">Assign New Task</div>
          <form className="intake-form" onSubmit={handleCreate}>
            <div className="form-field">
              <label>Title *</label>
              <input type="text" placeholder="e.g. Complete report" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
            </div>
            <div className="form-field">
              <label>Description</label>
              <textarea placeholder="Optional details" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} />
            </div>
            <div className="form-field">
              <label>Assign To *</label>
              <select value={form.assignedTo} onChange={e => setForm({ ...form, assignedTo: e.target.value })} required>
                <option value="">Select employee</option>
                {employees.map(emp => (
                  <option key={emp._id} value={emp._id}>{emp.name} ({emp.notificationEmail || emp.email})</option>
                ))}
              </select>
            </div>
            <div className="form-field">
              <label>Date *</label>
              <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} min={today} required />
            </div>
            <button type="submit" className="btn btn-tai" disabled={saving} style={{ alignSelf: 'flex-start' }}>
              {saving ? 'Assigning...' : 'Assign Task'}
            </button>
          </form>
        </div>
      )}

      <div className="card">
        <div className="card-title">{role === 'admin' ? 'All Tasks' : 'My Tasks'}</div>
        {loading ? (
          <SkeletonCard count={3} />
        ) : tasks.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--text3)' }}>No tasks yet</div>
        ) : (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {tasks.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE).map(task => (
                <div key={task._id} onClick={() => setSelectedTask(task)} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 16, padding: '14px 18px', background: 'var(--bg2)', borderRadius: 10, border: '1px solid var(--border)', transition: 'border-color .15s' }} onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'} onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, color: 'var(--text1)', marginBottom: 2 }}>{task.title}</div>
                    <div style={{ fontSize: 13, color: 'var(--text3)' }}>
                      {task.assignedTo?.name} &middot; {task.date}
                      {task.description && <span> &middot; <span style={{ color: 'var(--text2)' }}>{task.description}</span></span>}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    <span className={`badge ${task.status === 'done' ? 'badge-green' : task.status === 'in_progress' ? 'badge-blue' : task.status === 'in_testing' ? 'badge-purple' : 'badge-amber'}`}>
                      {task.status === 'in_progress' ? 'In Progress' : task.status === 'in_testing' ? 'In Testing' : task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                    </span>
                    {role === 'admin' && (
                      <button className="btn btn-sm btn-ghost" style={{color:'var(--red)'}} onClick={e => { e.stopPropagation(); deleteTask(task._id); }} disabled={deleting === task._id}>
                        {deleting === task._id ? '...' : '✕'}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {tasks.length > PAGE_SIZE && (
              <div style={{display:'flex',justifyContent:'center',alignItems:'center',gap:8,padding:'12px 0 4px'}}>
                <button className="btn btn-ghost btn-sm" disabled={page === 0} onClick={() => setPage(p => p - 1)}>‹ Prev</button>
                {Array.from({length:Math.ceil(tasks.length / PAGE_SIZE)},(_,i)=>i).map(p => (
                  <button key={p} className={`btn btn-sm ${p === page ? 'btn-tai' : 'btn-ghost'}`} onClick={() => setPage(p)} style={{minWidth:30}}>{p + 1}</button>
                ))}
                <button className="btn btn-ghost btn-sm" disabled={page >= Math.ceil(tasks.length / PAGE_SIZE) - 1} onClick={() => setPage(p => p + 1)}>Next ›</button>
              </div>
            )}
          </>
        )}
      </div>

      {selectedTask && (
        <div className="modal-overlay" onClick={() => setSelectedTask(null)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 480 }}>
            <div className="modal-head">
              <div className="modal-title">Task Details</div>
              <button className="modal-close" onClick={() => setSelectedTask(null)}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            <div style={{ padding: '4px 0' }}>
              <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 4 }}>{selectedTask.title}</div>
              <div style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 16 }}>
                Assigned to <strong>{selectedTask.assignedTo?.name}</strong> &middot; Due {selectedTask.date}
              </div>

              {selectedTask.description && (
                <div style={{ padding: '12px 14px', background: 'var(--bg3)', borderRadius: 8, border: '1px solid var(--border)', fontSize: 14, color: 'var(--text2)', marginBottom: 16, whiteSpace: 'pre-wrap' }}>
                  {selectedTask.description}
                </div>
              )}

              <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 8, color: 'var(--text1)' }}>Status</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {['pending', 'in_progress', 'in_testing', 'done'].map(s => {
                  const userId = JSON.parse(localStorage.getItem('user') || '{}').id;
                  const isAssigned = String(selectedTask.assignedTo?._id) === String(userId);
                  const flow = ['pending', 'in_progress', 'in_testing', 'done'];
                  const idx = flow.indexOf(selectedTask.status);
                  const sIdx = flow.indexOf(s);
                  const canClick = role === 'admin' || (isAssigned && sIdx === idx + 1);
                  return (
                    <button
                      key={s}
                      className={`btn btn-sm ${selectedTask.status === s ? 'btn-tai' : 'btn-outline'}`}
                      onClick={canClick ? () => { updateStatus(selectedTask._id, s); setSelectedTask(null); } : undefined}
                      style={{ opacity: selectedTask.status === s ? 1 : 0.55, cursor: canClick ? 'pointer' : 'not-allowed', textTransform: 'capitalize' }}
                    >
                      {s === 'in_progress' ? 'In Progress' : s === 'in_testing' ? 'In Testing' : s}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
