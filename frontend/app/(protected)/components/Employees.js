'use client';

import { useState } from 'react';
import AddEmployee from './AddEmployee';

const coColor = {es:'var(--es)',tai:'var(--tai)',both:'var(--gold)'};
const coLabel = {es:'tes',tai:'ttai',both:'tb'};
const trendMap = {up:'↑ Rising',down:'↓ Falling',stable:'→ Stable'};
const trendCls = {up:'up',down:'down',stable:'text3'};
const statusCls = {Top:'tg',Strong:'tb',Good:'ta',Risk:'tr'};
const PAGE_SIZE = 5;

function scoreColor(s) {
  if (s >= 90) return 'var(--green)';
  if (s >= 75) return 'var(--amber)';
  return 'var(--red)';
}

export default function Employees({ company, onToast, data, onRefresh }) {
  const [showAdd, setShowAdd] = useState(false);
  const [editEmployee, setEditEmployee] = useState(null);
  const userRole = typeof window !== 'undefined' ? (JSON.parse(localStorage.getItem('user') || '{}').role || 'admin') : 'admin';
  const [page, setPage] = useState(0);

  const employees = (data?.employees || []).filter(e => e.score || e.tasks || e.rating || e.attendance || e.status);
  const totalPages = Math.max(1, Math.ceil(employees.length / PAGE_SIZE));
  const pageEmployees = employees.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const teamSize = employees.length;
  const avgScore = employees.length ? Math.round(employees.reduce((s, e) => s + (e.score || 0), 0) / employees.length) : 0;
  const riskCount = employees.filter(e => e.status === 'Risk').length;

  const metrics = [
    { label: 'Team Size', val: String(teamSize), delta: 'Total employees', cls: 'neutral' },
    { label: 'Avg Score', val: String(avgScore), delta: 'Current average', cls: avgScore >= 75 ? 'up' : 'down' },
    { label: 'Tasks Done', val: String(employees.reduce((s, e) => s + (e.tasks || 0), 0)), delta: 'This month', cls: 'neutral' },
    { label: 'At Risk', val: String(riskCount), delta: riskCount > 0 ? 'Needs attention' : 'None', cls: riskCount > 0 ? 'down' : 'up' },
  ];

  const maxTasks = Math.max(...employees.map(e => e.tasks || 0), 1);

  return (
    <div className="page active" style={{display:'flex'}}>
      <div className="ph">
        <div>
          <div className="pt">Employee Performance</div>
          <div className="ps">AI-scored · Real-time KPI tracking</div>
        </div>
        <div style={{display:'flex',gap:8}}>
          {userRole === 'admin' && <button className="btn btn-tai btn-sm" onClick={() => setShowAdd(true)}>+ Add Employee</button>}
        </div>
      </div>

      <div className="grid4">
        {metrics.map((m,i) => (
          <div key={i} className={`metric ${company}`}>
            <div className="m-label">{m.label}</div>
            <div className="m-val">{m.val}</div>
            <div className={`m-delta ${m.cls}`}>{m.delta}</div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="card-title">Performance Cards</div>
        {employees.length === 0 ? (
          <div style={{textAlign:'center',padding:'20px 0',color:'var(--text3)',fontSize:13}}>No employees found</div>
        ) : (
          <div className="grid3">
            {employees.map((e,i) => (
              <div key={i} className="emp-card">
                <div style={{display:'flex',alignItems:'center',gap:12}}>
                  <div className="emp-avatar" style={{background:`${coColor[e.co] || 'var(--border2)'}20`,color:coColor[e.co] || 'var(--text2)'}}>{e.initials}</div>
                  <div>
                    <div style={{fontWeight:600,fontSize:13}}>{e.name}</div>
                    <div style={{fontSize:11,color:'var(--text2)'}}>{e.role}{e.subRole ? ` · ${e.subRole}` : ''}</div>
                  </div>
                  <div style={{marginLeft:'auto',textAlign:'right'}}>
                    <div className="emp-score" style={{color:scoreColor(e.score)}}>{e.score}</div>
                    <div style={{fontSize:10,color:'var(--text3)'}}>score</div>
                  </div>
                </div>
                <div style={{display:'flex',gap:6,marginTop:8}}>
                  <span className={`tag ${coLabel[e.co] || 'tb'}`}>{e.co === 'es' ? 'Ecom' : e.co === 'tai' ? 'TAI' : 'Both'}</span>
                </div>
                <div className="emp-bar-wrap" style={{marginTop:10}}>
                  <div className="emp-bar-row">
                    <span className="emp-bar-label">Tasks</span>
                    <div className="emp-bar-inner"><div className="emp-bar-fill" style={{width:`${Math.min((e.tasks || 0)/maxTasks*100, 100)}%`,background:'var(--blue)'}}></div></div>
                    <span className="emp-bar-val">{e.tasks || 0}</span>
                  </div>
                  <div className="emp-bar-row">
                    <span className="emp-bar-label">Rating</span>
                    <div className="emp-bar-inner"><div className="emp-bar-fill" style={{width:`${((e.rating || 0)/5)*100}%`,background:'var(--gold)'}}></div></div>
                    <span className="emp-bar-val">{e.rating || 0}</span>
                  </div>
                  <div className="emp-bar-row">
                    <span className="emp-bar-label">Att.</span>
                    <div className="emp-bar-inner"><div className="emp-bar-fill" style={{width:`${e.attendance || 0}%`,background:(e.attendance || 0) >= 90 ? 'var(--green)' : 'var(--red)'}}></div></div>
                    <span className="emp-bar-val">{e.attendance || 0}%</span>
                  </div>
                </div>
                {e.status === 'Risk' && (
                  <div style={{marginTop:8,fontSize:11,color:'var(--red)',fontWeight:600}}>⚠ Needs attention</div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card">
        <div className="card-title">Full Performance Table</div>
        {employees.length === 0 ? (
          <div style={{textAlign:'center',padding:'20px 0',color:'var(--text3)',fontSize:13}}>No employees found</div>
        ) : (
          <>
            <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Employee</th><th>Company</th><th>Role</th><th>Sub Role</th><th>AI Score</th><th>Tasks</th><th>Client Rating</th><th>Attendance</th><th>Trend</th><th>Status</th>
                </tr>
              </thead>
              <tbody>
                {pageEmployees.map((e,i) => (
                  <tr key={i}>
                    <td>
                      <div style={{display:'flex',alignItems:'center',gap:8}}>
                        <div className="emp-avatar" style={{width:28,height:28,fontSize:10,background:`${coColor[e.co] || 'var(--border2)'}20`,color:coColor[e.co] || 'var(--text2)'}}>{e.initials}</div>
                        <span style={{fontWeight:600}}>{e.name}</span>
                      </div>
                    </td>
                    <td><span className={`tag ${coLabel[e.co] || 'tb'}`}>{e.co === 'es' ? 'Ecom' : e.co === 'tai' ? 'TAI' : 'Both'}</span></td>
                    <td style={{color:'var(--text2)'}}>{e.role}</td>
                    <td style={{color:'var(--text3)',fontSize:12}}>{e.subRole || '—'}</td>
                    <td style={{fontFamily:'var(--font-mono)',fontWeight:500,color:scoreColor(e.score)}}>{e.score}</td>
                    <td style={{fontFamily:'var(--font-mono)'}}>{e.tasks || 0}</td>
                    <td>{'⭐'.repeat(Math.round(e.rating || 0))}</td>
                    <td style={{fontFamily:'var(--font-mono)'}}>{e.attendance || 0}%</td>
                    <td className={trendCls[e.trend] || 'text3'} style={{fontFamily:'var(--font-mono)',fontWeight:500}}>{trendMap[e.trend] || '→ Stable'}</td>
                    <td>
                      <span className={`tag ${statusCls[e.status] || 'ta'}`}>{e.status || 'Good'}</span>
                      {userRole === 'admin' && <button className="btn btn-ghost btn-sm" style={{marginLeft:6,padding:'2px 6px',fontSize:11}} onClick={() => setEditEmployee(e)}>✎</button>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>{/* /table-wrap */}
            {totalPages > 1 && (
              <div style={{display:'flex',justifyContent:'center',alignItems:'center',gap:8,padding:'12px 0 4px'}}>
                <button className="btn btn-ghost btn-sm" disabled={page === 0} onClick={() => setPage(p => p - 1)}>‹ Prev</button>
                {Array.from({length:totalPages},(_,i)=>i).map(p => (
                  <button key={p} className={`btn btn-sm ${p === page ? 'btn-tai' : 'btn-ghost'}`} onClick={() => setPage(p)} style={{minWidth:30}}>{p + 1}</button>
                ))}
                <button className="btn btn-ghost btn-sm" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>Next ›</button>
              </div>
            )}
          </>
        )}
      </div>

      {(showAdd || editEmployee) && (
        <AddEmployee
          editData={editEmployee}
          onClose={() => { setShowAdd(false); setEditEmployee(null); }}
          onSaved={onRefresh}
          onToast={onToast}
        />
      )}
    </div>
  );
}
