'use client';

import { useState, useEffect, useRef } from 'react';
import { api } from '@/lib/config';
import { SkeletonCard } from './Skeleton';
import { uploadFile } from '../utils/files';
import FileViewer from './FileViewer';

export default function Tasks({ onToast }) {
  const [tasks, setTasks] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState('admin');
  const [form, setForm] = useState({ title: '', description: '', assignedTo: [], date: '', dueTime: '', priority: 'medium', projectId: '' });
  const [formFiles, setFormFiles] = useState([]);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [editForm, setEditForm] = useState({ title: '', description: '', assignedTo: [], date: '', dueTime: '', priority: 'medium', projectId: '' });
  const [tmpEmployee, setTmpEmployee] = useState('');
  const [tmpEditEmployee, setTmpEditEmployee] = useState('');
  const fileRef = useRef(null);

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem('user') || '{}');
    if (u.role) setRole(u.role);
  }, []);

  const toArr = (v) => Array.isArray(v) ? v : v ? [v] : [];

  const fetch = async () => {
    try {
      const [t, e, p] = await Promise.all([
        api('/tasks/'),
        api('/tasks/employees'),
        api('/projects/'),
      ]);
      setTasks(t.map(task => ({ ...task, assignedTo: toArr(task.assignedTo) })));
      setEmployees(e);
      setProjects(p);
    } catch {} finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetch(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.title || !form.assignedTo.length || !form.date || !form.projectId) {
      onToast?.('Please fill all required fields', 'error');
      return;
    }
    setSaving(true);
    try {
      const body = { title: form.title, description: form.description, assignedTo: form.assignedTo, date: form.date, dueTime: form.dueTime || undefined, priority: form.priority, files: formFiles, project: form.projectId };
      await api('/tasks/', { method: 'POST', body: JSON.stringify(body) });
      onToast?.('Task assigned', 'success');
      setForm({ title: '', description: '', assignedTo: [], date: '', dueTime: '', priority: 'medium', projectId: '' });
      setFormFiles([]);
      fetch();
    } catch (err) {
      onToast?.(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setUploadingFiles(true);
    try {
      for (const f of files) {
        const uploaded = await uploadFile(f);
        setFormFiles(prev => [...prev, uploaded]);
      }
      onToast?.(`${files.length} file(s) uploaded`, 'success');
    } catch (err) {
      onToast?.(err.message, 'error');
    } finally {
      setUploadingFiles(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const removeFormFile = (idx) => {
    setFormFiles(prev => prev.filter((_, i) => i !== idx));
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

  const handleEditSave = async (e) => {
    e.preventDefault();
    if (!editForm.title || !editForm.assignedTo.length || !editForm.date || !editForm.projectId) {
      onToast?.('Please fill all required fields', 'error');
      return;
    }
    setSaving(true);
    try {
      const body = { title: editForm.title, description: editForm.description, assignedTo: editForm.assignedTo, date: editForm.date, dueTime: editForm.dueTime || undefined, priority: editForm.priority, project: editForm.projectId };
      await api(`/tasks/${editTask._id}`, { method: 'PUT', body: JSON.stringify(body) });
      onToast?.('Task updated', 'success');
      setEditTask(null);
      fetch();
    } catch (err) {
      onToast?.(err.message, 'error');
    } finally {
      setSaving(false);
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
              <label>Priority</label>
              <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
            <div className="form-field">
              <label>Assign To *</label>
              <div style={{display:'flex',gap:6}}>
                <select value={tmpEmployee} onChange={e => setTmpEmployee(e.target.value)} style={{flex:1}}>
                  <option value="">Select an employee</option>
                  {employees.map(emp => (
                    <option key={emp._id} value={emp._id}>{emp.name} ({emp.notificationEmail || emp.email})</option>
                  ))}
                </select>
                <button type="button" className="btn btn-sm btn-tai" disabled={!tmpEmployee || form.assignedTo.includes(tmpEmployee)} onClick={() => { setForm({ ...form, assignedTo: [...form.assignedTo, tmpEmployee] }); setTmpEmployee(''); }}>+</button>
              </div>
              {form.assignedTo.length > 0 && (
                <div style={{display:'flex',flexWrap:'wrap',gap:4,marginTop:6}}>
                  {form.assignedTo.map(id => {
                    const emp = employees.find(e => e._id === id);
                    return <span key={id} style={{display:'inline-flex',alignItems:'center',gap:4,padding:'2px 8px',background:'var(--tai3)',borderRadius:12,fontSize:11,color:'var(--tai)'}}>{emp?.name}<button type="button" onClick={() => setForm({ ...form, assignedTo: form.assignedTo.filter(x => x !== id) })} style={{background:'none',border:'none',color:'var(--text3)',cursor:'pointer',padding:0,fontSize:12,lineHeight:1}}>✕</button></span>;
                  })}
                </div>
              )}
            </div>
            <div className="form-field">
              <label>Date *</label>
              <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} min={today} required />
            </div>
            <div className="form-field">
              <label>Due Time</label>
              <input type="time" value={form.dueTime} onChange={e => setForm({ ...form, dueTime: e.target.value })} />
            </div>
            <div className="form-field">
              <label>Project *</label>
              <select value={form.projectId} onChange={e => setForm({ ...form, projectId: e.target.value })} required>
                <option value="">Select project</option>
                {projects.map(p => (
                  <option key={p._id} value={p._id}>{p.title}</option>
                ))}
              </select>
            </div>
            <div className="form-field">
              <label>Files</label>
              <input type="file" ref={fileRef} onChange={handleFileSelect} accept="image/*,.pdf" multiple style={{fontSize:12}} />
              {uploadingFiles && <div style={{fontSize:11,color:'var(--text3)',marginTop:4}}>Uploading...</div>}
              {formFiles.length > 0 && (
                <div style={{marginTop:6,display:'flex',flexDirection:'column',gap:4}}>
                  {formFiles.map((f,i) => (
                    <div key={i} style={{display:'flex',alignItems:'center',gap:6,fontSize:12}}>
                      <span style={{color:'var(--tai)',flex:1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{f.name}</span>
                      <button type="button" className="btn btn-sm btn-ghost" style={{color:'var(--red)',padding:'2px 6px',fontSize:10}} onClick={() => removeFormFile(i)}>✕</button>
                    </div>
                  ))}
                </div>
              )}
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
            {(() => {
              const grouped = {};
              for (const t of tasks) {
                const key = t.project?._id || 'unknown';
                if (!grouped[key]) grouped[key] = { project: t.project, tasks: [] };
                grouped[key].tasks.push(t);
              }
              return Object.entries(grouped).map(([key, group]) => (
                <div key={key} style={{ marginBottom: 24 }}>
                  <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text2)', marginBottom: 10, padding: '0 4px' }}>
                    {group.project ? (
                      <><span style={{color:'var(--accent)'}}>◆</span> {group.project.title}</>
                    ) : (
                      <span style={{color:'var(--text3)'}}>Other</span>
                    )}
                    <span style={{ fontWeight: 400, fontSize: 12, color: 'var(--text3)', marginLeft: 8 }}>{group.tasks.length} task{group.tasks.length > 1 ? 's' : ''}</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {group.tasks.map(task => (
                      <div key={task._id} onClick={() => setSelectedTask(task)} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 16, padding: '14px 18px', background: 'var(--bg2)', borderRadius: 10, border: '1px solid var(--border)', transition: 'border-color .15s' }} onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'} onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 600, color: 'var(--text1)', marginBottom: 2 }}>{task.title}</div>
                          <div style={{ fontSize: 13, color: 'var(--text3)' }}>
                            {(task.assignedTo || []).map(a => a.name).join(', ')} &middot; {task.date}{task.dueTime ? ' ' + task.dueTime : ''}
                            {task.description && <span> &middot; <span style={{ color: 'var(--text2)' }}>{task.description}</span></span>}
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                          <span className={`badge ${task.status === 'done' ? 'badge-green' : task.status === 'in_progress' ? 'badge-blue' : task.status === 'in_testing' ? 'badge-purple' : 'badge-amber'}`}>
                            {task.status === 'in_progress' ? 'In Progress' : task.status === 'in_testing' ? 'In Testing' : task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                          </span>
                          {role === 'admin' && (
                            <>
                              <button className="btn btn-sm btn-outline" style={{fontSize:10}} onClick={e => { e.stopPropagation(); setEditTask(task); setEditForm({ title: task.title, description: task.description || '', assignedTo: (task.assignedTo || []).map(a => a._id || a), date: task.date, dueTime: task.dueTime || '', priority: task.priority, projectId: task.project?._id || task.project }); }}>Edit</button>
                              <button className="btn btn-sm btn-ghost" style={{color:'var(--red)'}} onClick={e => { e.stopPropagation(); deleteTask(task._id); }} disabled={deleting === task._id}>
                                {deleting === task._id ? '...' : '✕'}
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ));
            })()}
          </>
        )}
      </div>

      {selectedTask && (
        <div className="modal-overlay" onClick={() => setSelectedTask(null)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 520 }}>
            <div className="modal-head">
              <div className="modal-title">Task Details</div>
              <button className="modal-close" onClick={() => setSelectedTask(null)}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            <div style={{ padding: '4px 0' }}>
              <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 4 }}>{selectedTask.title}</div>
              <div style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 16 }}>
                Assigned to <strong>{(selectedTask.assignedTo || []).map(a => a.name).join(', ')}</strong> &middot; Due {selectedTask.date}{selectedTask.dueTime ? ' ' + selectedTask.dueTime : ''}
              </div>

              {selectedTask.description && (
                <div style={{ padding: '12px 14px', background: 'var(--bg3)', borderRadius: 8, border: '1px solid var(--border)', fontSize: 14, color: 'var(--text2)', marginBottom: 16, whiteSpace: 'pre-wrap' }}>
                  {selectedTask.description}
                </div>
              )}

              {/* Files */}
              {selectedTask.files?.length > 0 && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 8, color: 'var(--text1)' }}>Files</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {selectedTask.files.map((f, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <FileViewer file={f} />
                        {role === 'admin' && (
                          <button className="btn btn-sm btn-ghost" style={{ color: 'var(--red)', padding: '2px 6px', fontSize: 10, flexShrink: 0 }} title="Delete file" onClick={async () => {
                            if (!window.confirm(`Delete file "${f.name}"?`)) return;
                            try {
                              const res = await api(`/tasks/${selectedTask._id}`, { method: 'PATCH', body: JSON.stringify({ deleteFile: f.public_id }) });
                              setSelectedTask(res);
                              setTasks(prev => prev.map(t => t._id === res._id ? res : t));
                              onToast?.('File deleted', 'success');
                            } catch (err) { onToast?.(err.message, 'error'); }
                          }}>✕</button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Add file button for admin or assigned employee */}
              {(role === 'admin' || (selectedTask.assignedTo || []).some(a => String(a._id || a) === String(JSON.parse(localStorage.getItem('user') || '{}').id))) && (
                <div style={{ marginBottom: 16 }}>
                  <label style={{ fontSize:12, fontWeight:600, color:'var(--text3)', display:'block', marginBottom:6 }}>Add File</label>
                  <input type="file" accept="image/*,.pdf" onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    try {
                      const uploaded = await uploadFile(file);
                      const res = await api(`/tasks/${selectedTask._id}`, {
                        method: 'PATCH',
                        body: JSON.stringify({ files: [...(selectedTask.files || []), uploaded] }),
                      });
                      setSelectedTask(res);
                      setTasks(prev => prev.map(t => t._id === res._id ? res : t));
                      onToast?.('File added', 'success');
                    } catch (err) { onToast?.(err.message, 'error'); }
                    e.target.value = '';
                  }} style={{fontSize:12}} />
                </div>
              )}

              {/* Comments */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 8, color: 'var(--text1)' }}>Comments</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 8 }}>
                  {(selectedTask.comments || []).map((c, i) => (
                    <div key={i} style={{ padding: '8px 12px', background: 'var(--bg3)', borderRadius: 8, fontSize: 13 }}>
                      <div style={{ fontWeight: 600, fontSize: 11, color: 'var(--tai)', marginBottom: 2 }}>{c.user?.name || 'Unknown'}</div>
                      <div style={{ color: 'var(--text2)' }}>{c.text}</div>
                    </div>
                  ))}
                  {(!selectedTask.comments || selectedTask.comments.length === 0) && (
                    <div style={{ fontSize: 12, color: 'var(--text3)' }}>No comments yet</div>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <input type="text" placeholder="Write a comment..." value={commentText} onChange={e => setCommentText(e.target.value)} style={{ flex: 1, padding:'8px 12px', borderRadius:'var(--r)', border:'1px solid var(--border)', background:'var(--bg2)', color:'var(--text)', fontSize:13 }} />
                  <button className="btn btn-sm btn-tai" disabled={!commentText.trim()} onClick={async () => {
                    if (!commentText.trim()) return;
                    try {
                      const res = await api(`/tasks/${selectedTask._id}`, {
                        method: 'PATCH',
                        body: JSON.stringify({ comment: commentText.trim() }),
                      });
                      setSelectedTask(res);
                      setTasks(prev => prev.map(t => t._id === res._id ? res : t));
                      setCommentText('');
                    } catch (err) { onToast?.(err.message, 'error'); }
                  }}>Send</button>
                </div>
              </div>

              <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 8, color: 'var(--text1)' }}>Status</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {['pending', 'in_progress', 'in_testing', 'done'].map(s => {
                  const userId = JSON.parse(localStorage.getItem('user') || '{}').id;
                  const isAssigned = (selectedTask.assignedTo || []).some(a => String(a._id || a) === String(userId));
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

      {editTask && (
        <div className="modal-overlay" onClick={() => setEditTask(null)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 520 }}>
            <div className="modal-head">
              <div className="modal-title">Edit Task</div>
              <button className="modal-close" onClick={() => setEditTask(null)}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <form className="intake-form" onSubmit={handleEditSave}>
              <div className="form-field">
                <label>Title *</label>
                <input type="text" value={editForm.title} onChange={e => setEditForm({ ...editForm, title: e.target.value })} required />
              </div>
              <div className="form-field">
                <label>Description</label>
                <textarea value={editForm.description} onChange={e => setEditForm({ ...editForm, description: e.target.value })} rows={3} />
              </div>
              <div className="form-field">
                <label>Priority</label>
                <select value={editForm.priority} onChange={e => setEditForm({ ...editForm, priority: e.target.value })}>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
              <div className="form-field">
                <label>Assign To *</label>
                <div style={{display:'flex',gap:6}}>
                  <select value={tmpEditEmployee} onChange={e => setTmpEditEmployee(e.target.value)} style={{flex:1}}>
                    <option value="">Select an employee</option>
                    {employees.map(emp => (
                      <option key={emp._id} value={emp._id}>{emp.name} ({emp.notificationEmail || emp.email})</option>
                    ))}
                  </select>
                  <button type="button" className="btn btn-sm btn-tai" disabled={!tmpEditEmployee || editForm.assignedTo.includes(tmpEditEmployee)} onClick={() => { setEditForm({ ...editForm, assignedTo: [...editForm.assignedTo, tmpEditEmployee] }); setTmpEditEmployee(''); }}>+</button>
                </div>
                {editForm.assignedTo.length > 0 && (
                  <div style={{display:'flex',flexWrap:'wrap',gap:4,marginTop:6}}>
                    {editForm.assignedTo.map(id => {
                      const emp = employees.find(e => e._id === id);
                      return <span key={id} style={{display:'inline-flex',alignItems:'center',gap:4,padding:'2px 8px',background:'var(--tai3)',borderRadius:12,fontSize:11,color:'var(--tai)'}}>{emp?.name}<button type="button" onClick={() => setEditForm({ ...editForm, assignedTo: editForm.assignedTo.filter(x => x !== id) })} style={{background:'none',border:'none',color:'var(--text3)',cursor:'pointer',padding:0,fontSize:12,lineHeight:1}}>✕</button></span>;
                    })}
                  </div>
                )}
              </div>
              <div className="form-field">
                <label>Date *</label>
                <input type="date" value={editForm.date} onChange={e => setEditForm({ ...editForm, date: e.target.value })} required />
              </div>
              <div className="form-field">
                <label>Due Time</label>
                <input type="time" value={editForm.dueTime} onChange={e => setEditForm({ ...editForm, dueTime: e.target.value })} />
              </div>
              <div className="form-field">
                <label>Project *</label>
                <select value={editForm.projectId} onChange={e => setEditForm({ ...editForm, projectId: e.target.value })} required>
                  <option value="">Select project</option>
                  {projects.map(p => (
                    <option key={p._id} value={p._id}>{p.title}</option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                <button type="submit" className="btn btn-tai" disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</button>
                <button type="button" className="btn btn-outline" onClick={() => setEditTask(null)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
