'use client';

const employees = [
  {name:'Sarah K.',initials:'SK',role:'Lead Manager',co:'es',score:94,tasks:42,rating:4.9,att:98,trend:'up',status:'Top'},
  {name:'Omar H.',initials:'OH',role:'Dev Lead',co:'es',score:86,tasks:38,rating:4.7,att:95,trend:'up',status:'Strong'},
  {name:'Zara T.',initials:'ZT',role:'AI Specialist',co:'tai',score:89,tasks:35,rating:4.8,att:97,trend:'up',status:'Strong'},
  {name:'Bilal M.',initials:'BM',role:'Marketing',co:'es',score:78,tasks:29,rating:4.5,att:92,trend:'stable',status:'Good'},
  {name:'Ayesha N.',initials:'AN',role:'Support',co:'both',score:82,tasks:56,rating:4.6,att:94,trend:'up',status:'Good'},
  {name:'Kamran R.',initials:'KR',role:'Content',co:'es',score:61,tasks:18,rating:3.9,att:82,trend:'down',status:'Risk'},
  {name:'Hina J.',initials:'HJ',role:'SEO Specialist',co:'es',score:75,tasks:24,rating:4.3,att:90,trend:'stable',status:'Good'},
  {name:'Usman F.',initials:'UF',role:'Automation Dev',co:'tai',score:83,tasks:31,rating:4.6,att:93,trend:'up',status:'Strong'},
  {name:'Sana K.',initials:'SK2',role:'Client Success',co:'both',score:88,tasks:48,rating:4.8,att:96,trend:'up',status:'Strong'},
];

const coColor = {es:'var(--es)',tai:'var(--tai)',both:'var(--gold)'};
const coLabel = {es:'tes',tai:'ttai',both:'tb'};

const trendMap = {up:'↑ Rising',down:'↓ Falling',stable:'→ Stable'};
const trendCls = {up:'up',down:'down',stable:'text3'};
const statusCls = {Top:'tg',Strong:'tb',Good:'ta',Risk:'tr'};

function scoreColor(s) {
  if (s >= 90) return 'var(--green)';
  if (s >= 75) return 'var(--amber)';
  return 'var(--red)';
}

const metrics = [
  { label: 'Team Size', val: '11', delta: 'Both companies', cls: 'neutral' },
  { label: 'Avg Score', val: '82', delta: '↑ 5 pts MoM', cls: 'up' },
  { label: 'Tasks Done', val: '247', delta: 'This month', cls: 'neutral' },
  { label: 'At Risk', val: '1', delta: 'Needs attention', cls: 'down' },
];

export default function Employees({ company, onToast }) {
  return (
    <div className="page active" style={{display:'flex'}}>
      <div className="ph">
        <div>
          <div className="pt">Employee Performance</div>
          <div className="ps">AI-scored · Real-time KPI tracking across both companies</div>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={() => onToast('Exporting scorecards...')}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          Export Scorecards
        </button>
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
        <div className="grid3">
          {employees.slice(0,6).map((e,i) => (
            <div key={i} className="emp-card">
              <div style={{display:'flex',alignItems:'center',gap:12}}>
                <div className="emp-avatar" style={{background:`${coColor[e.co]}20`,color:coColor[e.co]}}>{e.initials}</div>
                <div>
                  <div style={{fontWeight:600,fontSize:13}}>{e.name}</div>
                  <div style={{fontSize:11,color:'var(--text2)'}}>{e.role}</div>
                </div>
                <div style={{marginLeft:'auto',textAlign:'right'}}>
                  <div className="emp-score" style={{color:scoreColor(e.score)}}>{e.score}</div>
                  <div style={{fontSize:10,color:'var(--text3)'}}>score</div>
                </div>
              </div>
              <div style={{display:'flex',gap:6,marginTop:8}}>
                <span className={`tag ${coLabel[e.co]}`} style={{background:coColor[e.co],border:'none'}}>{e.co === 'es' ? 'Ecom' : e.co === 'tai' ? 'TAI' : 'Both'}</span>
              </div>
              <div className="emp-bar-wrap" style={{marginTop:10}}>
                <div className="emp-bar-row">
                  <span className="emp-bar-label">Tasks</span>
                  <div className="emp-bar-inner"><div className="emp-bar-fill" style={{width:`${(e.tasks/56)*100}%`,background:'var(--blue)'}}></div></div>
                  <span className="emp-bar-val">{e.tasks}</span>
                </div>
                <div className="emp-bar-row">
                  <span className="emp-bar-label">Rating</span>
                  <div className="emp-bar-inner"><div className="emp-bar-fill" style={{width:`${(e.rating/5)*100}%`,background:'var(--gold)'}}></div></div>
                  <span className="emp-bar-val">{e.rating}</span>
                </div>
                <div className="emp-bar-row">
                  <span className="emp-bar-label">Att.</span>
                  <div className="emp-bar-inner"><div className="emp-bar-fill" style={{width:`${e.att}%`,background:e.att >= 90 ? 'var(--green)' : 'var(--red)'}}></div></div>
                  <span className="emp-bar-val">{e.att}%</span>
                </div>
              </div>
              {e.status === 'Risk' && (
                <div style={{marginTop:8,fontSize:11,color:'var(--red)',fontWeight:600}}>⚠ Needs attention</div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="card-title">Full Performance Table</div>
        <table>
          <thead>
            <tr>
              <th>Employee</th><th>Company</th><th>Role</th><th>AI Score</th><th>Tasks</th><th>Client Rating</th><th>Attendance</th><th>Trend</th><th>Status</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((e,i) => (
              <tr key={i}>
                <td>
                  <div style={{display:'flex',alignItems:'center',gap:8}}>
                    <div className="emp-avatar" style={{width:28,height:28,fontSize:10,background:`${coColor[e.co]}20`,color:coColor[e.co]}}>{e.initials}</div>
                    <span style={{fontWeight:600}}>{e.name}</span>
                  </div>
                </td>
                <td><span className={`tag ${coLabel[e.co]}`} style={{background:coColor[e.co],border:'none'}}>{e.co === 'es' ? 'Ecom' : e.co === 'tai' ? 'TAI' : 'Both'}</span></td>
                <td style={{color:'var(--text2)'}}>{e.role}</td>
                <td style={{fontFamily:'var(--font-mono)',fontWeight:500,color:scoreColor(e.score)}}>{e.score}</td>
                <td style={{fontFamily:'var(--font-mono)'}}>{e.tasks}</td>
                <td>{'⭐'.repeat(Math.round(e.rating))}</td>
                <td style={{fontFamily:'var(--font-mono)'}}>{e.att}%</td>
                <td className={trendCls[e.trend]} style={{fontFamily:'var(--font-mono)',fontWeight:500}}>{trendMap[e.trend]}</td>
                <td><span className={`tag ${statusCls[e.status]}`}>{e.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
