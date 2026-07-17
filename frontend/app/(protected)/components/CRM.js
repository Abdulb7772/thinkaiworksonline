'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/config';
import AddClient from './AddClient';
import ViewProfile from './ViewProfile';

const stages = ['Discovery','Proposal','Negotiation','Active','Closed Won'];
const stageColors = {'Discovery':'tb','Proposal':'ta','Negotiation':'ta','Active':'tg','Closed Won':'tg'};

export default function CRM({ company, onToast, onAddLead, data }) {
  const [showAdd, setShowAdd] = useState(false);
  const [viewing, setViewing] = useState(null);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchClients = async () => {
    try {
      const res = await api('/clients');
      setClients(res);
    } catch {} finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchClients(); }, []);

  const metrics = data?.crmMetrics || [];

  return (
    <div className="page active" style={{display:'flex'}}>
      {showAdd && (
        <AddClient
          onClose={() => setShowAdd(false)}
          onSaved={(c) => { fetchClients(); }}
          onToast={onToast}
          onAddLead={onAddLead}
        />
      )}
      {viewing && <ViewProfile item={viewing} onClose={() => setViewing(null)} />}
      <div className="ph">
        <div>
          <div className="pt">CRM Pipeline</div>
          <div className="ps">Linked with Upwork · Auto-updates on client activity</div>
        </div>
        <div style={{display:'flex',gap:8}}>
          <button className="btn btn-tai" onClick={() => setShowAdd(true)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Add Client
          </button>
          <button className="btn btn-es" onClick={() => onToast('CRM synced with Upwork · 3 records updated ✓')}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
            Sync Upwork
          </button>
        </div>
      </div>

      <div className="grid4">
        {metrics.map((m,i) => (
          <div key={i} className={`metric ${m.co}`}>
            <div className="m-label">{m.label}</div>
            <div className="m-val" style={m.co ? {color:'var(--'+m.co+')'} : undefined}>{m.val}</div>
            <div className={`m-delta ${m.cls}`}>{m.delta}</div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="card-title">Pipeline Board</div>
        <div className="table-wrap">
        <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:12,minWidth:640}}>
          {stages.map(s => (
            <div key={s}>
              <div style={{fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:.8,color:'var(--text3)',marginBottom:8}}>
                {s} <span style={{fontFamily:'var(--font-mono)'}}>({clients.filter(c => c.stage === s).length})</span>
              </div>
              {clients.filter(c => c.stage === s).map((c,i) => (
                <div key={i} style={{background:'var(--bg3)',border:'1px solid var(--border)',borderRadius:'var(--r)',padding:10,marginBottom:6}}>
                  <div style={{fontWeight:600,fontSize:12}}>{c.name}</div>
                  <div style={{fontSize:11,color:'var(--text2)',marginTop:2}}>{c.service}</div>
                  <div style={{fontFamily:'var(--font-mono)',fontSize:12,color:'var(--green)',marginTop:4}}>{c.value}</div>
                </div>
              ))}
            </div>
          ))}
        </div>
        </div>{/* /table-wrap */}
      </div>

      <div className="card">
        <div className="card-title">All Clients</div>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--text3)', fontSize: 13 }}>Loading clients...</div>
        ) : (
          <div className="table-wrap"><table>
            <thead>
              <tr>
                <th>Client</th><th>Company</th><th>Service</th><th>Value</th><th>Stage</th><th>Assigned To</th><th>Last Contact</th><th>Action</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((c,i) => (
                <tr key={i}>
                  <td><span style={{fontWeight:600}}>{c.name}</span></td>
                  <td><span className={`tag ${(c.company || 'EcomSkyline') === 'EcomSkyline' ? 'tes' : 'ttai'}`}>{c.company || 'EcomSkyline'}</span></td>
                  <td style={{color:'var(--text2)'}}>{c.service}</td>
                  <td style={{fontFamily:'var(--font-mono)',color:'var(--green)'}}>{c.value || '—'}</td>
                  <td><span className={`tag ${stageColors[c.stage] || 'tb'}`}>{c.stage || 'Discovery'}</span></td>
                  <td style={{color:'var(--text2)'}}>{c.assignedTo || '—'}</td>
                  <td style={{fontFamily:'var(--font-mono)',fontSize:11,color:'var(--text3)'}}>{c.lastContact || '—'}</td>
                  <td><button className="btn btn-ghost btn-sm" onClick={() => setViewing(c)}>View</button></td>
                </tr>
              ))}
            </tbody>
          </table></div>
        )}
      </div>
    </div>
  );
}
