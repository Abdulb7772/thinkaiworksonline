'use client';

const services = ['Amazon FBA Management', 'Shopify Development', 'AI Automation', 'Email Marketing', 'PPC Advertising', 'Product Research', 'AI Chatbot Build', 'Data Analysis'];
const budgetRanges = ['$500–$1,000', '$1,000–$3,000', '$3,000–$7,000', '$7,000+'];
const priorities = ['High', 'Medium', 'Low'];
const employees = ['Sarah K. (Lead Manager)', 'Omar H. (Dev Lead)', 'Zara T. (AI Specialist)', 'Bilal M. (Marketing)', 'Ayesha N. (Support)'];

const pendingLeads = [
  {name:'David Park',budget:'$3k–7k',service:'Amazon FBA',score:91,age:'12m ago'},
  {name:'Emma Richardson',budget:'$1k–3k',service:'Shopify Dev',score:77,age:'1h ago'},
  {name:'Tariq Sultan',budget:'$5k+',service:'AI Chatbot',score:88,age:'3h ago'},
];

export default function Upwork({ company, onToast }) {
  const handleSubmit = () => {
    const name = document.getElementById('cl-name')?.value || 'New Client';
    onToast(name + ' added to CRM · Meeting scheduled · Team notified ✓');
  };

  return (
    <div className="page active" style={{display:'flex'}}>
      <div className="ph">
        <div>
          <div className="pt">Upwork Client Intake</div>
          <div className="ps">New leads auto-upload to CRM · AI qualifies & assigns</div>
        </div>
        <button className="btn btn-es" onClick={handleSubmit}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 14.66V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h5.34"/><polygon points="18 2 22 6 12 16 8 16 8 12 18 2"/></svg>
          ↑ Submit to CRM
        </button>
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
                <select id="cl-service">
                  {services.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div className="form-field">
                <label>Company (Assign To)</label>
                <select id="cl-company">
                  <option>EcomSkyline</option>
                  <option>ThinkAIWorks</option>
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-field">
                <label>Budget Range</label>
                <select id="cl-budget">
                  {budgetRanges.map(b => <option key={b}>{b}</option>)}
                </select>
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
                {employees.map(e => <option key={e}>{e}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div style={{display:'flex',flexDirection:'column',gap:16}}>
          <div className="card">
            <div className="card-title">
              Pending Upwork Leads
              <span className="nbadge red">3</span>
            </div>
            <div style={{display:'flex',flexDirection:'column',gap:8}}>
              {pendingLeads.map((l,i) => (
                <div key={i} style={{background:'var(--bg3)',border:'1px solid var(--border)',borderRadius:'var(--r)',padding:12}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
                    <div>
                      <div style={{fontWeight:600}}>{l.name}</div>
                      <div style={{fontSize:11,color:'var(--text2)',marginTop:2}}>{l.service} · {l.budget}</div>
                    </div>
                    <span style={{fontFamily:'var(--font-mono)',color:'var(--green)',fontSize:12}}>{l.score}% match</span>
                  </div>
                  <div style={{display:'flex',gap:6,marginTop:10}}>
                    <button className="btn btn-es btn-sm" onClick={() => onToast(l.name + ' added to CRM pipeline ✓')}>Add to CRM</button>
                    <button className="btn btn-ghost btn-sm" onClick={() => onToast('Viewing profile...')}>View Profile</button>
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
    </div>
  );
}
