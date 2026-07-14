'use client';

const metrics = [
  { label: 'Total Leads', val: '47', delta: '↑ 6 this week', cls: 'up', co: 'es' },
  { label: 'Active Clients', val: '18', delta: '↑ 2 new', cls: 'up', co: '' },
  { label: 'Conversion Rate', val: '38%', delta: '↑ 4% MoM', cls: 'up', co: '' },
  { label: 'Pipeline Value', val: '$84k', delta: '↑ $12k', cls: 'up', co: '' },
];

const clients = [
  {name:'David Park',co:'ES',svc:'Amazon FBA',val:'$5,200',stage:'Discovery',assignee:'Sarah K.',last:'Today'},
  {name:'Emma Richardson',co:'ES',svc:'Shopify Dev',val:'$2,800',stage:'Proposal',assignee:'Omar H.',last:'Yesterday'},
  {name:'Tariq Sultan',co:'TAI',svc:'AI Chatbot',val:'$6,000',stage:'Negotiation',assignee:'Zara T.',last:'Today'},
  {name:'Ali Hassan',co:'ES',svc:'PPC Ads',val:'$1,400',stage:'Active',assignee:'Bilal M.',last:'2d ago'},
  {name:'Jennifer Lee',co:'TAI',svc:'AI Automation',val:'$8,500',stage:'Active',assignee:'Zara T.',last:'Today'},
  {name:'Mark Hudson',co:'ES',svc:'FBA Management',val:'$3,200',stage:'Closed Won',assignee:'Sarah K.',last:'1w ago'},
];

const stages = ['Discovery','Proposal','Negotiation','Active','Closed Won'];
const stageColors = {'Discovery':'tb','Proposal':'ta','Negotiation':'ta','Active':'tg','Closed Won':'tg'};

export default function CRM({ company, onToast }) {
  return (
    <div className="page active" style={{display:'flex'}}>
      <div className="ph">
        <div>
          <div className="pt">CRM Pipeline</div>
          <div className="ps">Linked with Upwork · Auto-updates on client activity</div>
        </div>
        <button className="btn btn-es" onClick={() => onToast('CRM synced with Upwork · 3 records updated ✓')}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
          Sync Upwork
        </button>
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
        <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:12}}>
          {stages.map(s => (
            <div key={s}>
              <div style={{fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:.8,color:'var(--text3)',marginBottom:8}}>
                {s} <span style={{fontFamily:'var(--font-mono)'}}>({clients.filter(c => c.stage === s).length})</span>
              </div>
              {clients.filter(c => c.stage === s).map((c,i) => (
                <div key={i} style={{background:'var(--bg3)',border:'1px solid var(--border)',borderRadius:'var(--r)',padding:10,marginBottom:6}}>
                  <div style={{fontWeight:600,fontSize:12}}>{c.name}</div>
                  <div style={{fontSize:11,color:'var(--text2)',marginTop:2}}>{c.svc}</div>
                  <div style={{fontFamily:'var(--font-mono)',fontSize:12,color:'var(--green)',marginTop:4}}>{c.val}</div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="card-title">All Clients</div>
        <table>
          <thead>
            <tr>
              <th>Client</th><th>Company</th><th>Service</th><th>Value</th><th>Stage</th><th>Assigned To</th><th>Last Contact</th><th>Action</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((c,i) => (
              <tr key={i}>
                <td><span style={{fontWeight:600}}>{c.name}</span></td>
                <td><span className={`tag ${c.co === 'ES' ? 'tes' : 'ttai'}`}>{c.co === 'ES' ? 'EcomSkyline' : 'ThinkAIWorks'}</span></td>
                <td style={{color:'var(--text2)'}}>{c.svc}</td>
                <td style={{fontFamily:'var(--font-mono)',color:'var(--green)'}}>{c.val}</td>
                <td><span className={`tag ${stageColors[c.stage]}`}>{c.stage}</span></td>
                <td style={{color:'var(--text2)'}}>{c.assignee}</td>
                <td style={{fontFamily:'var(--font-mono)',fontSize:11,color:'var(--text3)'}}>{c.last}</td>
                <td><button className="btn btn-ghost btn-sm" onClick={() => onToast('Viewing ' + c.name)}>View</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
