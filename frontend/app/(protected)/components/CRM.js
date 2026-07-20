'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/config';
import AddClient from './AddClient';
import ViewProfile from './ViewProfile';
import { SkeletonTable } from './Skeleton';

const projectStatuses = ['pending','project_started','employee_assigned','in_progress','working','testing','finishing_up','completed'];
const statusLabels = {pending:'Pending',project_started:'Project Started',employee_assigned:'Employee Assigned',in_progress:'In Progress',working:'Working',testing:'Testing',finishing_up:'Finishing Up',completed:'Completed'};
const stageColors = {'Discovery':'tb','Proposal':'ta','Negotiation':'ta','Active':'tg','Closed Won':'tg'};

export default function CRM({ company, onToast, onAddLead, data }) {
  const [showAdd, setShowAdd] = useState(false);
  const [viewing, setViewing] = useState(null);
  const [clients, setClients] = useState([]);
  const [projects, setProjects] = useState([]);
  const [leads, setLeads] = useState([]);
  const [selectedLead, setSelectedLead] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchClients = async () => {
    try {
      const res = await api('/clients');
      setClients(res);
    } catch {} finally {
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    try {
      const res = await api('/projects/');
      setProjects(res);
    } catch {}
  };

  const fetchLeads = async () => {
    try {
      const res = await api('/leads');
      setLeads(res);
    } catch {}
  };

  useEffect(() => { fetchClients(); fetchProjects(); fetchLeads(); }, []);

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
        <div className="card-title">Pipeline Board — Projects</div>
        <div className="table-wrap">
        <div style={{display:'grid',gridTemplateColumns:'repeat(8,1fr)',gap:12,minWidth:900}}>
          {projectStatuses.map(s => (
            <div key={s}>
              <div style={{fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:.8,color:'var(--text3)',marginBottom:8}}>
                {statusLabels[s]} <span style={{fontFamily:'var(--font-mono)'}}>({projects.filter(p => p.status === s).length})</span>
              </div>
              {projects.filter(p => p.status === s).map((p,i) => (
                <div key={i} style={{background:'var(--bg3)',border:'1px solid var(--border)',borderRadius:'var(--r)',padding:10,marginBottom:6}}>
                  <div style={{fontWeight:600,fontSize:12}}>{p.title}</div>
                  <div style={{fontSize:11,color:'var(--text2)',marginTop:2}}>{p.client || p.clientName || '—'}</div>
                  <div style={{fontSize:11,color:'var(--text2)',marginTop:1}}>{p.employee || p.assignedTo || '—'}</div>
                  <div style={{fontFamily:'var(--font-mono)',fontSize:10,color:'var(--text3)',marginTop:4}}>{p.date || p.createdAt || '—'}</div>
                </div>
              ))}
            </div>
          ))}
        </div>
        </div>{/* /table-wrap */}
      </div>

      <div className="card">
        <div className="card-title">Upwork Leads</div>
        {selectedLead && (
          <div style={{background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:'var(--r)',padding:16,marginBottom:16}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
              <strong>{selectedLead.name}</strong>
              <button className="btn btn-ghost btn-sm" onClick={() => setSelectedLead(null)}>Close</button>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,fontSize:12}}>
              <div><span style={{color:'var(--text2)'}}>Company:</span> {selectedLead.company || '—'}</div>
              <div><span style={{color:'var(--text2)'}}>Service:</span> {selectedLead.service || '—'}</div>
              <div><span style={{color:'var(--text2)'}}>Budget:</span> {selectedLead.budgetRange || '—'}</div>
              <div><span style={{color:'var(--text2)'}}>Score:</span> {selectedLead.score || '—'}</div>
              <div><span style={{color:'var(--text2)'}}>Status:</span> {selectedLead.status || '—'}</div>
            </div>
          </div>
        )}
        <div className="table-wrap"><table>
          <thead>
            <tr>
              <th>Name</th><th>Service</th><th>Budget</th><th>Score</th><th>Status</th><th>Action</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((l,i) => (
              <tr key={i}>
                <td><span style={{fontWeight:600}}>{l.name}</span></td>
                <td style={{color:'var(--text2)'}}>{l.service}</td>
                <td style={{fontFamily:'var(--font-mono)',color:'var(--green)'}}>{l.budgetRange || '—'}</td>
                <td><span className={`tag ${Number(l.score) >= 7 ? 'tg' : Number(l.score) >= 4 ? 'ta' : 'tr'}`}>{l.score ?? '—'}</span></td>
                <td style={{color:'var(--text2)'}}>{l.status || '—'}</td>
                <td><button className="btn btn-ghost btn-sm" onClick={() => setSelectedLead(l)}>View</button></td>
              </tr>
            ))}
          </tbody>
        </table></div>
      </div>

      <div className="card">
        <div className="card-title">All Clients</div>
        {loading ? (
          <div style={{ padding: '20px 0' }}><SkeletonTable rows={4} /></div>
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
