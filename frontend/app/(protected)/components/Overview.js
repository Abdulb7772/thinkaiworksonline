'use client';

import { useState } from 'react';
import { api } from '@/lib/config';
import AddClient from './AddClient';

const chartLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'T'];

export default function Overview({ data, leads, onToast, onAddLead }) {
  const [showAdd, setShowAdd] = useState(false);
  const userRole = typeof window !== 'undefined' ? (JSON.parse(localStorage.getItem('user') || '{}').role || 'admin') : 'admin';
  const metrics = data?.overviewMetrics?.tai || [];
  const overviewLeads = leads || data?.overviewLeads || [];
  const schedule = data?.schedule || [];
  const performers = data?.performers || [];
  const chartData = data?.revChart?.data || [];
  const maxVal = Math.max(...chartData, 1);

  const stagePercent = (stage) => {
    const map = { 'Discovery': 10, 'Proposal': 30, 'Negotiation': 60, 'Active': 90, 'Closed Won': 100 };
    return map[stage] || 0;
  };

  const addToCRM = async (lead) => {
    try {
      await api('/clients', {
        method: 'POST',
        body: JSON.stringify({ name: lead.name, service: lead.service, stage: 'Discovery' }),
      });
      onToast?.(lead.name + ' added to CRM ✓', 'success');
    } catch (err) {
      onToast?.(err.message, 'error');
    }
  };
  const companyName = 'ThinkAIWorks';

  const getInitials = (name) =>
    name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  const allClients = data?.customers || [];
  const [clientPage, setClientPage] = useState(0);
  const pageSize = 4;
  const totalPages = Math.ceil(allClients.length / pageSize);
  const pagedClients = allClients.slice(clientPage * pageSize, (clientPage + 1) * pageSize);

  return (
    <div className="page active" style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
      <div className="ph">
        <div>
          <div className="pt">Command Center</div>
          <div className="ps">Viewing: {companyName} \u00b7 All systems operational</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {userRole === 'admin' && (
            <button id="primary-btn" className="btn btn-tai btn-sm" onClick={() => setShowAdd(true)}>+ New Client</button>
          )}
        </div>
      </div>

      {showAdd && (
        <AddClient
          onClose={() => setShowAdd(false)}
          onToast={onToast}
          onAddLead={onAddLead}
        />
      )}

      <div className="grid4">
        {metrics.map((m, i) => (
          <div key={i} className={`metric ${m.co || 'tai'}`}>
            <div className="m-label">{m.label}</div>
            <div className="m-val">{m.val}</div>
            <div className={`m-delta ${m.cls}`}>{m.delta}</div>
          </div>
        ))}
      </div>

      <div className="grid2">
        <div className="card">
          <div className="card-title">
            <span>Recent Upwork Leads</span>
            <span className="tag tes">Auto-synced</span>
          </div>
          {overviewLeads.length === 0 ? (
            <div style={{textAlign:'center',padding:'20px 0',color:'var(--text3)',fontSize:13}}>No leads yet</div>
          ) : overviewLeads.map((lead, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0',
              borderBottom: i < overviewLeads.length - 1 ? '1px solid var(--border)' : 'none',
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: '50%',
                background: lead.co === 'tai' ? 'var(--tai3)' : 'var(--es3)',
                border: `1px solid ${lead.co === 'tai' ? 'rgba(124,92,252,.2)' : 'rgba(0,229,200,.2)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 700, flexShrink: 0,
                color: lead.co === 'tai' ? 'var(--tai)' : 'var(--es)',
                fontFamily: 'var(--font-head)',
              }}>
                {getInitials(lead.name)}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 13 }}>{lead.name}</div>
                <div style={{ fontSize: 11, color: 'var(--text2)' }}>
                  {lead.service} · {lead.budget}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {lead.co && <span className={`tag t${lead.co}`}>{lead.co === 'es' ? 'ES' : 'TAI'}</span>}
                <span style={{
                  fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 500,
                  color: lead.stage === 'Closed Won' ? 'var(--green)' : lead.stage === 'Active' ? 'var(--es)' : lead.stage === 'Negotiation' ? 'var(--amber)' : lead.stage === 'Proposal' ? 'var(--blue)' : 'var(--text3)',
                }}>
                  {lead.stage ? stagePercent(lead.stage) + '%' : (lead.score || 0) + '%'}
                </span>
                {userRole === 'admin' && <button className="btn btn-ghost btn-sm" onClick={() => addToCRM(lead)}>Add to CRM</button>}
              </div>
            </div>
          ))}
        </div>

        <div className="card">
          <div className="card-title">
            <span>Today&apos;s Schedule</span>
          </div>
          {schedule.map((evt, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0',
              borderBottom: i < schedule.length - 1 ? '1px solid var(--border)' : 'none',
            }}>
              <div style={{
                fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text2)', minWidth: 44,
              }}>
                {evt.time}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 500, fontSize: 13 }}>{evt.title}</div>
                <div style={{ fontSize: 11, color: 'var(--text3)' }}>{evt.type}</div>
              </div>
              {evt.co && <span className={`tag t${evt.co}`}>{evt.co === 'es' ? 'ES' : 'TAI'}</span>}
            </div>
          ))}
        </div>
      </div>

      <div className="grid2">
        <div className="card">
          <div className="card-title">
            <span>Revenue \u2014 Last 7 Days</span>
          </div>
          <div className="bar-chart" style={{ marginTop: 12 }}>
            {chartData.map((v, i) => (
              <div key={i} className="b-col">
                <div
                  className="b-bar"
                  style={{
                    height: `${(v / maxVal) * 100}%`,
                    background: i === chartData.length - 1 ? 'var(--es)' : 'var(--border2)',
                  }}
                />
                <span className="b-lbl">{chartLabels[i]}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-title">
            <span>Top Performers This Week</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {performers.map((p, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 24, textAlign: 'center',
                  fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 600, color: 'var(--text2)',
                }}>
                  {String(i + 1).padStart(2, '0')}
                </div>
                <div style={{
                  width: 36, height: 36, borderRadius: '50%',
                  background: p.co === 'tai' ? 'var(--tai3)' : 'var(--es3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: 700, flexShrink: 0,
                  color: p.co === 'tai' ? 'var(--tai)' : 'var(--es)',
                }}>
                  {getInitials(p.name)}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 500, fontSize: 13 }}>{p.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text3)' }}>{p.role}</div>
                </div>
                <div style={{
                  fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 600,
                  color: p.score >= 90 ? 'var(--green)' : p.score >= 80 ? 'var(--amber)' : 'var(--text2)',
                }}>
                  {p.score}%
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {(userRole === 'admin' || userRole === 'employee') && (
        <div className="card" style={{marginTop:4}}>
          <div className="card-title">
            <span>Registered Clients</span>
            <span className="tag tb">{allClients.length} total</span>
          </div>
          {allClients.length === 0 ? (
            <div style={{textAlign:'center',padding:'24px 0',color:'var(--text3)',fontSize:13}}>No clients registered yet</div>
          ) : (
            <>
              <div style={{overflowX:'auto'}}>
                <table style={{width:'100%',borderCollapse:'collapse',fontSize:13}}>
                  <thead>
                    <tr style={{borderBottom:'1px solid var(--border)',color:'var(--text3)',fontSize:11,textTransform:'uppercase',letterSpacing:'0.5px'}}>
                      <th style={{padding:'8px 12px',textAlign:'left',fontWeight:600}}>Name</th>
                      <th style={{padding:'8px 12px',textAlign:'left',fontWeight:600}}>Email</th>
                      <th style={{padding:'8px 12px',textAlign:'left',fontWeight:600}}>Registered</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pagedClients.map((c, i) => (
                      <tr key={i} style={{borderBottom:'1px solid var(--border2)'}}>
                        <td style={{padding:'10px 12px',fontWeight:600}}>{c.name}</td>
                        <td style={{padding:'10px 12px',color:'var(--text2)'}}>{c.email || '—'}</td>
                        <td style={{padding:'10px 12px',color:'var(--text3)',fontSize:12}}>
                          {c.createdAt ? new Date(c.createdAt).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}) : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {totalPages > 1 && (
                <div style={{display:'flex',justifyContent:'center',alignItems:'center',gap:12,padding:'12px 0 4px'}}>
                  <button
                    className="btn btn-ghost btn-sm"
                    disabled={clientPage === 0}
                    onClick={() => setClientPage(clientPage - 1)}
                    style={{fontSize:12}}
                  >
                    ‹ Prev
                  </button>
                  <span style={{fontSize:12,color:'var(--text3)',fontFamily:'var(--font-mono)'}}>
                    {clientPage + 1} / {totalPages}
                  </span>
                  <button
                    className="btn btn-ghost btn-sm"
                    disabled={clientPage >= totalPages - 1}
                    onClick={() => setClientPage(clientPage + 1)}
                    style={{fontSize:12}}
                  >
                    Next ›
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
