'use client';

const metrics = [
  { label: 'Growth Score', val: '74', delta: '/100', cls: 'up', co: 'es' },
  { label: 'MoM Growth', val: '22%', delta: 'Combined', cls: 'up', co: '' },
  { label: 'Churn Rate', val: '6%', delta: '↓ from 11%', cls: 'up', co: '' },
  { label: 'AI Opportunities', val: '8', delta: 'Identified', cls: 'neutral', co: 'tai' },
];

const esSuggestions = [
  {n:1,title:'Launch Tiered Retainer Packages',detail:'Offer Bronze/Silver/Gold FBA management tiers. Predictable MRR, easier upsell. Est. +$4k MRR.',impact:'High',effort:'Low',color:'var(--green)'},
  {n:2,title:'Expand to UK & EU Amazon Markets',detail:'Your FBA expertise translates directly to Amazon.co.uk and Amazon.de. 3x addressable market.',impact:'High',effort:'Medium',color:'var(--amber)'},
  {n:3,title:'Partner with Shopify App Developers',detail:'Referral partnerships with complementary tools drives warm inbound leads with zero ad spend.',impact:'Medium',effort:'Low',color:'var(--green)'},
  {n:4,title:'Build a YouTube Channel on FBA Tactics',detail:'Short-form content drives organic Upwork leads. Competitors with channels get 3x inbound rate.',impact:'Medium',effort:'Medium',color:'var(--amber)'},
];

const taiSuggestions = [
  {n:1,title:'Productize AI Chatbot as a SaaS',detail:'Package your chatbot work into a monthly subscription. $99–299/mo recurring vs one-time builds.',impact:'High',effort:'Medium',color:'var(--green)'},
  {n:2,title:'Target Logistics & Courier Companies',detail:'Highly underserved by AI automation. Your RCC-style dashboard is a repeatable product.',impact:'High',effort:'Low',color:'var(--green)'},
  {n:3,title:'Create AI Automation Templates',detail:'Sell pre-built automation workflows on Gumroad or Upwork as digital products. Passive revenue.',impact:'Medium',effort:'Low',color:'var(--amber)'},
  {n:4,title:'Launch AI ROI Calculator for Prospects',detail:'Interactive tool on website showing how much AI saves companies. Converts cold traffic to calls.',impact:'High',effort:'Low',color:'var(--green)'},
];

const roadmap = [
  {q:'Q3 Month 1',items:['Launch EcomSkyline tiered packages','Build ThinkAIWorks chatbot SaaS MVP','Hire 1 additional AI dev'],co:'both'},
  {q:'Q3 Month 2',items:['Expand FBA to UK market','Launch AI automation template store','Run first LinkedIn ad campaign'],co:'both'},
  {q:'Q3 Month 3',items:['Onboard first 5 SaaS chatbot subscribers','Target logistics niche with TAI','Review and adjust marketing budget'],co:'both'},
];

export default function Growth({ company, onToast }) {
  const impClass = (v) => v === 'High' ? 'tg' : 'ta';

  return (
    <div className="page active" style={{display:'flex'}}>
      <div className="ph">
        <div>
          <div className="pt">Growth Engine</div>
          <div className="ps">AI-generated suggestions · Both companies · Ranked by impact</div>
        </div>
        <button className="btn btn-gold btn-sm" onClick={() => onToast('AI suggestions refreshed!')}>
          ⚡ Refresh AI Suggestions
        </button>
      </div>

      <div className="grid4">
        {metrics.map((m,i) => (
          <div key={i} className={`metric ${m.co}`}>
            <div className="m-label">{m.label}</div>
            <div className="m-val">{m.val}</div>
            <div className={`m-delta ${m.cls}`}>{m.delta}</div>
          </div>
        ))}
      </div>

      <div className="grid2">
        <div className="card">
          <div className="card-title">
            EcomSkyline Growth Suggestions
            <span className="tag tes">AI-generated</span>
          </div>
          {esSuggestions.map((s,i) => (
            <div key={i} className="suggestion-card">
              <div className="sug-num" style={{background:s.color}}>{s.n}</div>
              <div style={{flex:1}}>
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:8,marginBottom:4}}>
                  <span style={{fontWeight:600,fontSize:13}}>{s.title}</span>
                  <div style={{display:'flex',gap:4}}>
                    <span className={`tag ${impClass(s.impact)}`}>{s.impact}</span>
                    <span className="tag tb">{s.effort}</span>
                  </div>
                </div>
                <div style={{fontSize:12,color:'var(--text2)'}}>{s.detail}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="card">
          <div className="card-title">
            ThinkAIWorks Growth Suggestions
            <span className="tag ttai">AI-generated</span>
          </div>
          {taiSuggestions.map((s,i) => (
            <div key={i} className="suggestion-card">
              <div className="sug-num" style={{background:s.color}}>{s.n}</div>
              <div style={{flex:1}}>
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:8,marginBottom:4}}>
                  <span style={{fontWeight:600,fontSize:13}}>{s.title}</span>
                  <div style={{display:'flex',gap:4}}>
                    <span className={`tag ${impClass(s.impact)}`}>{s.impact}</span>
                    <span className="tag tb">{s.effort}</span>
                  </div>
                </div>
                <div style={{fontSize:12,color:'var(--text2)'}}>{s.detail}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="card-title">Combined Growth Roadmap</div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:16}}>
          {roadmap.map((q,i) => (
            <div key={i} style={{background:'var(--bg3)',borderRadius:'var(--r2)',border:'1px solid var(--border)',padding:16}}>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:12}}>
                <span style={{fontFamily:'var(--font-mono)',fontWeight:600,fontSize:14}}>{q.q}</span>
                <span className="tag tb">{q.items.length} items</span>
              </div>
              <div style={{display:'flex',flexDirection:'column',gap:8}}>
                {q.items.map((item,j) => (
                  <div key={j} style={{padding:'8px 10px',background:'var(--surface)',borderRadius:'var(--r)',border:'1px solid var(--border)'}}>
                    <span className="tag tb" style={{fontSize:11}}>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
