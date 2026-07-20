'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/config';
import ViewProfile from './ViewProfile';
import { SkeletonCard } from './Skeleton';

const priorities = ['High', 'Medium', 'Low'];

export default function Upwork({ company, onToast, leads, onAddLead, onRemoveLead }) {
  const [viewing, setViewing] = useState(null);
  const [employees, setEmployees] = useState([]);
  const userRole = typeof window !== 'undefined' ? (JSON.parse(localStorage.getItem('user') || '{}').role || 'admin') : 'admin';

  useEffect(() => {
    api('/tasks/employees').then(setEmployees).catch(() => {});
  }, []);
  const handleSubmit = async () => {
    const name = document.getElementById('cl-name')?.value?.trim();
    if (!name) { onToast('Enter a client name', 'error'); return; }
    const service = document.getElementById('cl-service')?.value || '—';
    try {
      await api('/clients', {
        method: 'POST',
        body: JSON.stringify({ name, service, company: 'ThinkAIWorks', stage: 'Discovery' }),
      });
      onAddLead?.({ name, budget: '—', service, stage: 'Discovery', age: 'Just now' });
      onToast(name + ' added to CRM pipeline ✓', 'success');
    } catch (err) {
      onToast(err.message, 'error');
    }
  };

  const addToCRM = async (lead) => {
    try {
      await api('/clients', {
        method: 'POST',
        body: JSON.stringify({ name: lead.name, service: lead.service, stage: 'Discovery' }),
      });
      onRemoveLead?.(lead.name);
      onToast(lead.name + ' added to CRM pipeline ✓', 'success');
    } catch (err) {
      onToast(err.message, 'error');
    }
  };

  return (
    <div className="page active" style={{display:'flex'}}>
      {!data ? <SkeletonCard count={4} /> : (<>
      {viewing && <ViewProfile item={viewing} onClose={() => setViewing(null)} />}
      <div className="ph">
        <div>
          <div className="pt">Upwork Client Intake</div>
          <div className="ps">New leads auto-upload to CRM · AI qualifies & assigns</div>
        </div>
        {userRole === 'admin' && (
          <button className="btn btn-es" onClick={handleSubmit}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 14.66V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h5.34"/><polygon points="18 2 22 6 12 16 8 16 8 12 18 2"/></svg>
            ↑ Submit to CRM
          </button>
        )}
      </div>

      <div className="grid2">
        <div className="card">
          <div className="card-title">New Client Intake Form</div>
          <div className="intake-form">
            <div className="form-row">
              <div className="form-field">
                <label>Client Name</label>
                <input type="text" id="cl-name" placeholder="e.g. John Carter" />
              </div>
              <div className="form-field">
                <label>Upwork Profile URL</label>
                <input type="text" id="cl-url" placeholder="upwork.com/..." />
              </div>
            </div>
            <div className="form-row">
              <div className="form-field">
                <label>Service Required</label>
                <input type="text" id="cl-service" placeholder="e.g. Amazon FBA Management" />
              </div>
              <div className="form-field">
                <label>Company (Assign To)</label>
                <div style={{padding:'9px 12px',background:'var(--bg3)',border:'1px solid var(--border2)',borderRadius:'var(--r)',fontSize:13,color:'var(--tai)'}}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{marginRight:6,verticalAlign:'middle'}}><circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/></svg>
                  ThinkAIWorks
                </div>
              </div>
            </div>
            <div className="form-row">
              <div className="form-field">
                <label>Budget Range</label>
                <input type="text" id="cl-budget" placeholder="e.g. $1,000–$3,000" />
              </div>
              <div className="form-field">
                <label>Priority</label>
                <select id="cl-priority">
                  {priorities.map(p => <option key={p}>{p}</option>)}
                </select>
              </div>
            </div>
            <div className="form-field">
              <label>Project Brief</label>
              <textarea id="cl-brief" placeholder="Describe what the client needs..."></textarea>
            </div>
            <div className="form-field">
              <label>Assign Employee</label>
              <select id="cl-assign">
                <option value="">Select employee</option>
                {employees.map(e => <option key={e._id} value={e._id}>{e.name}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div style={{display:'flex',flexDirection:'column',gap:16}}>
          <div className="card">
            <div className="card-title">
              Pending Upwork Leads
              <span className="nbadge red">{leads.length}</span>
            </div>
            <div style={{display:'flex',flexDirection:'column',gap:8}}>
              {leads.map((l,i) => (
                <div key={i} style={{background:'var(--bg3)',border:'1px solid var(--border)',borderRadius:'var(--r)',padding:12}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
                    <div>
                      <div style={{fontWeight:600}}>{l.name}</div>
                      <div style={{fontSize:11,color:'var(--text2)',marginTop:2}}>{l.service} · {l.budget}</div>
                    </div>
                    <span style={{fontFamily:'var(--font-mono)',color:'var(--green)',fontSize:12}}>{l.score}% match</span>
                  </div>
                  <div style={{display:'flex',gap:6,marginTop:10}}>
                    {userRole === 'admin' && <button className="btn btn-es btn-sm" onClick={() => addToCRM(l)}>Add to CRM</button>}
                    <button className="btn btn-ghost btn-sm" onClick={() => setViewing(l)}>View Profile</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card card-sm">
            <div className="card-title">
              <span style={{display:'flex',alignItems:'center',gap:6}}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/></svg>
                AI Lead Qualifier
              </span>
            </div>
            <div style={{background:'var(--bg3)',borderLeft:'3px solid var(--es)',padding:'10px 12px',borderRadius:'0 var(--r) var(--r) 0',fontSize:12,color:'var(--text2)',lineHeight:1.7}}>
              <strong style={{color:'var(--es)'}}>AI Analysis:</strong> Latest lead (David Park) has a 91% close probability. Budget $3k–7k, clear brief, previous Upwork history. Recommend assigning to Sarah K. and scheduling a discovery call within 24h.
            </div>
            <button className="btn btn-es btn-sm" style={{marginTop:10}} onClick={() => onToast('AI auto-scheduled discovery call with David Park · Calendar updated ✓')}>Auto-Schedule Discovery Call</button>
          </div>
        </div>
      </div>
    </>)}
    </div>
  );
}
