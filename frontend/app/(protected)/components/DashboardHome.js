'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/config';
import { SkeletonMetrics } from './Skeleton';

const today = () => new Date().toISOString().split('T')[0];

export default function DashboardHome({ data, onToast }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || '{}') : {};
  const role = user.role || 'admin';
  const isAdmin = role === 'admin';

  useEffect(() => {
    api('/tasks/').then(t => { setTasks(t.map(task => ({ ...task, assignedTo: Array.isArray(task.assignedTo) ? task.assignedTo : task.assignedTo ? [task.assignedTo] : [] }))); }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const projects = data?.projects || [];
  const allTasks = tasks;

  const projectTasks = (projectId) => allTasks.filter(t => (t.project?._id || t.project) === projectId);

  const todayStr = today();
  const approaching = allTasks.filter(t => t.status !== 'done' && t.date && t.date >= todayStr && t.date <= todayStr + 7);
  const overdue = allTasks.filter(t => t.status !== 'done' && t.date && t.date < todayStr);
  const inProgress = allTasks.filter(t => t.status === 'in_progress' || t.status === 'in_testing');
  const completed = allTasks.filter(t => t.status === 'done');
  const pending = allTasks.filter(t => t.status === 'pending');

  const adminTasks = isAdmin ? allTasks : allTasks.filter(t => (t.assignedTo || []).some(a => String(a._id || a) === String(user.id)));
  const adminProjects = isAdmin ? projects : projects.filter(p => p.employees?.some(e => (e._id || e) === user.id));
  const ongoingProjects = adminProjects.filter(p => p.status !== 'completed');
  const completedProjects = adminProjects.filter(p => p.status === 'completed');

  const urgentTasks = [...overdue, ...inProgress.filter(t => t.date && t.date <= todayStr + 2)].slice(0, 5);

  if (loading) return <div style={{padding:'40px 0'}}><SkeletonMetrics count={6} /></div>;

  return (
    <div className="page active" style={{display:'flex',flexDirection:'column',gap:22}}>
      <div className="ph">
        <div>
          <div className="pt">{isAdmin ? 'Admin Dashboard' : 'My Dashboard'}</div>
          <div className="ps">{todayStr} · {allTasks.length} total tasks</div>
        </div>
      </div>

      <div className="grid4">
        <div className="metric"><div className="m-label">Pending</div><div className="m-val">{pending.length}</div><div className="m-delta neutral">{pending.length > 0 ? 'Needs action' : 'All clear'}</div></div>
        <div className="metric"><div className="m-label">In Progress</div><div className="m-val">{inProgress.length}</div><div className="m-delta up">{inProgress.length > 0 ? 'Working' : 'None'}</div></div>
        <div className="metric"><div className="m-label">Completed Today</div><div className="m-val">{completed.filter(t => t.date === todayStr).length}</div><div className="m-delta up">{completed.length > 0 ? 'Done' : 'No completions'}</div></div>
        <div className="metric"><div className="m-label">Overdue</div><div className="m-val" style={{color:'var(--red)'}}>{overdue.length}</div><div className="m-delta down">{overdue.length > 0 ? 'Needs attention' : 'None'}</div></div>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:22}}>
        {/* Tasks assigned */}
        <div className="card">
          <div className="card-title">Tasks Assigned</div>
          {adminTasks.length === 0 ? <div style={{padding:20,textAlign:'center',color:'var(--text3)',fontSize:13}}>No tasks</div> : (
            <div style={{display:'flex',flexDirection:'column',gap:8}}>
              {adminTasks.slice(0, 8).map(t => (
                <div key={t._id} style={{display:'flex',alignItems:'center',gap:10,padding:'8px 12px',background:'var(--bg2)',borderRadius:8,border:'1px solid var(--border)',fontSize:12}}>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontWeight:600,color:'var(--text1)'}}>{t.title}</div>
                    <div style={{fontSize:11,color:'var(--text3)'}}>
                      {isAdmin && <span>{(t.assignedTo || []).map(a => a.name).join(', ')} · </span>}
                      {t.date} {t.project?.title && <span>· {t.project.title}</span>}
                    </div>
                  </div>
                  <span className={`badge ${t.status === 'done' ? 'badge-green' : t.status === 'in_progress' ? 'badge-blue' : t.status === 'in_testing' ? 'badge-purple' : 'badge-amber'}`} style={{fontSize:10,whiteSpace:'nowrap'}}>
                    {t.status === 'in_progress' ? 'In Progress' : t.status === 'in_testing' ? 'In Testing' : t.status.charAt(0).toUpperCase() + t.status.slice(1)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Ongoing Projects (admin) / My Projects (employee) */}
        <div className="card">
          <div className="card-title">{isAdmin ? 'Ongoing Projects' : 'My Projects'}</div>
          {ongoingProjects.length === 0 ? <div style={{padding:20,textAlign:'center',color:'var(--text3)',fontSize:13}}>No ongoing projects</div> : (
            <div style={{display:'flex',flexDirection:'column',gap:8}}>
              {ongoingProjects.slice(0, 5).map(p => {
                const pts = projectTasks(p._id);
                return (
                  <div key={p._id} style={{padding:'10px 12px',background:'var(--bg2)',borderRadius:8,border:'1px solid var(--border)'}}>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:4}}>
                      <span style={{fontWeight:600,fontSize:13,color:'var(--text1)'}}>{p.title}</span>
                      <span className={`badge ${p.status === 'completed' ? 'badge-green' : 'badge-blue'}`} style={{fontSize:9}}>{p.status.replace(/_/g,' ')}</span>
                    </div>
                    <div style={{fontSize:11,color:'var(--text3)'}}>
                      {pts.length} task{pts.length !== 1 ? 's' : ''}
                      {p.payment > 0 && <span> · ${p.payment.toLocaleString()}</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:22}}>
        {/* Approaching deadlines */}
        <div className="card">
          <div className="card-title" style={{color:'var(--amber)'}}>⚠ Approaching Deadlines</div>
          {approaching.length === 0 ? <div style={{padding:20,textAlign:'center',color:'var(--text3)',fontSize:13}}>All clear for the week</div> : (
            <div style={{display:'flex',flexDirection:'column',gap:6}}>
              {approaching.slice(0, 5).map(t => (
                <div key={t._id} style={{display:'flex',alignItems:'center',gap:8,padding:'8px 10px',background:'var(--bg2)',borderRadius:6,border:'1px solid var(--border)',fontSize:12}}>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontWeight:500}}>{t.title}</div>
                    <div style={{fontSize:10,color:'var(--text3)'}}>
                      {t.date} {isAdmin && <span>· {(t.assignedTo || []).map(a => a.name).join(', ')}</span>}
                    </div>
                  </div>
                  <span style={{fontSize:10,fontFamily:'var(--font-mono)',color:t.date === todayStr ? 'var(--red)' : 'var(--amber)',whiteSpace:'nowrap'}}>
                    {t.date === todayStr ? 'Today' : `${Math.ceil((new Date(t.date) - new Date()) / 86400000)}d`}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Urgent / In Progress */}
        <div className="card">
          <div className="card-title" style={{color:'var(--red)'}}>🔴 Urgent Tasks</div>
          {urgentTasks.length === 0 ? <div style={{padding:20,textAlign:'center',color:'var(--text3)',fontSize:13}}>No urgent tasks</div> : (
            <div style={{display:'flex',flexDirection:'column',gap:6}}>
              {urgentTasks.slice(0, 5).map(t => (
                <div key={t._id} style={{display:'flex',alignItems:'center',gap:8,padding:'8px 10px',background:'var(--bg2)',borderRadius:6,border:'1px solid var(--border)',fontSize:12}}>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontWeight:500}}>{t.title}</div>
                    <div style={{fontSize:10,color:'var(--text3)'}}>
                      {t.date} {isAdmin && <span>· {(t.assignedTo || []).map(a => a.name).join(', ')}</span>}
                    </div>
                  </div>
                  <span className={`badge ${t.status === 'done' ? 'badge-green' : t.status === 'in_progress' ? 'badge-blue' : t.status === 'in_testing' ? 'badge-purple' : 'badge-amber'}`} style={{fontSize:9}}>
                    {t.status === 'in_progress' ? 'In Progress' : t.status === 'in_testing' ? 'In Testing' : t.status.charAt(0).toUpperCase() + t.status.slice(1)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Completed */}
        <div className="card">
          <div className="card-title" style={{color:'var(--green)'}}>✓ Completed</div>
          {completed.length === 0 ? <div style={{padding:20,textAlign:'center',color:'var(--text3)',fontSize:13}}>No completed tasks yet</div> : (
            <div style={{display:'flex',flexDirection:'column',gap:6}}>
              {completed.slice(0, 5).map(t => (
                <div key={t._id} style={{display:'flex',alignItems:'center',gap:8,padding:'8px 10px',background:'var(--bg2)',borderRadius:6,border:'1px solid var(--border)',fontSize:12}}>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontWeight:500}}>{t.title}</div>
                    <div style={{fontSize:10,color:'var(--text3)'}}>
                      {t.date} {isAdmin && <span>· {(t.assignedTo || []).map(a => a.name).join(', ')}</span>}
                      {t.project?.title && <span> · {t.project.title}</span>}
                    </div>
                  </div>
                  <span style={{fontSize:10,color:'var(--green)'}}>✓</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Completed Projects */}
      {isAdmin && completedProjects.length > 0 && (
        <div className="card">
          <div className="card-title">Completed Projects</div>
          <div style={{display:'flex',flexDirection:'column',gap:8}}>
            {completedProjects.slice(0, 5).map(p => (
              <div key={p._id} style={{display:'flex',alignItems:'center',gap:12,padding:'10px 14px',background:'var(--bg2)',borderRadius:8,border:'1px solid var(--border)'}}>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontWeight:600,fontSize:13,color:'var(--text1)'}}>{p.title}</div>
                  <div style={{fontSize:11,color:'var(--text3)'}}>
                    ${p.payment?.toLocaleString() || 0}
                  </div>
                </div>
                <span className="badge badge-green" style={{fontSize:10}}>Completed</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
