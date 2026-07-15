'use client';

import { useState } from 'react';
import CreateCampaign from './CreateCampaign';

export default function Outreach({ company, onToast, data, onRefresh }) {
  const [showLaunch, setShowLaunch] = useState(false);
  const campaigns = data?.campaigns || [];

  const metrics = [
    { label: 'Prospects Found', val: '1,240', delta: 'Upwork + LinkedIn', cls: 'neutral', co: 'es' },
    { label: 'Emails Sent', val: String(campaigns.reduce((s, c) => s + (c.sent || 0), 0)), delta: 'All campaigns', cls: 'up', co: '' },
    { label: 'Open Rate', val: campaigns.length ? Math.round(campaigns.reduce((s, c) => s + parseInt(c.opens || '0'), 0) / campaigns.length) + '%' : '—', delta: 'Average', cls: 'up', co: '' },
    { label: 'Booked Calls', val: '23', delta: 'All time', cls: 'up', co: '' },
  ];

  return (
    <div className="page active" style={{display:'flex',flexDirection:'column',gap:22}}>
      <div className="ph">
        <div>
          <div className="pt">AI Outreach System</div>
          <div className="ps">Automated prospect research · Personalized emails · Follow-up sequences</div>
        </div>
        <button className="btn btn-es" onClick={() => setShowLaunch(true)}>{'⚡'} Launch Campaign</button>
      </div>
      <div className="grid4">
        {metrics.map((m,i) => (
          <div key={i} className={`metric ${m.co}`}>
            <div className="m-label">{m.label}</div>
            <div className="m-val" style={m.co ? {color:`var(--${m.co})`} : {}}>{m.val}</div>
            <div className={`m-delta ${m.cls}`}>{m.delta}</div>
          </div>
        ))}
      </div>
      <div className="grid2">
        <div className="card">
          <div className="card-title">Active Campaigns</div>
          {campaigns.length === 0 ? (
            <div style={{textAlign:'center',padding:'20px 0',color:'var(--text3)',fontSize:13}}>No campaigns yet</div>
          ) : (
            <div style={{display:'flex',flexDirection:'column',gap:8}}>
              {campaigns.map((c,i) => (
                <div key={i} style={{background:'var(--bg3)',border:'1px solid var(--border)',borderRadius:'var(--r)',padding:14}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
                    <div>
                      <div style={{fontWeight:600,fontSize:13}}>{c.name}</div>
                      <span className={`tag ${c.co==='es'?'tes':'ttai'}`} style={{marginTop:4}}>{c.co==='es'?'EcomSkyline':'ThinkAIWorks'}</span>
                    </div>
                    <span className="tag tg">{c.status === 'active' ? 'Active' : c.status}</span>
                  </div>
                  <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8,fontSize:11}}>
                    <div><div style={{color:'var(--text3)'}}>Sent</div><div style={{fontFamily:'var(--font-mono)',fontSize:14}}>{c.sent}</div></div>
                    <div><div style={{color:'var(--text3)'}}>Opens</div><div style={{fontFamily:'var(--font-mono)',fontSize:14,color:'var(--amber)'}}>{c.opens}</div></div>
                    <div><div style={{color:'var(--text3)'}}>Replies</div><div style={{fontFamily:'var(--font-mono)',fontSize:14,color:'var(--green)'}}>{c.replies}</div></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="card">
          <div className="card-title">Sample Outreach Email — EcomSkyline</div>
          <div className="email-preview">
            <div className="to">TO: Mark Hudson · Amazon Seller · mark@...  |  SCORE: 88% match</div>
            <div className="subj">Subject: Scaling your Amazon FBA revenue — here's how we do it</div>
            <div style={{color:'var(--text)'}}>Hi Mark,</div><br />
            <div>I came across your store and noticed you're doing well in the kitchen niche. We've scaled 14 similar stores from $20k to $80k+ monthly revenue using our Amazon FBA system at EcomSkyline.</div><br />
            <div>Key things we handle: <span style={{color:'var(--es)'}}>inventory forecasting, PPC optimization, supplier negotiations, and listing SEO</span>.</div><br />
            <div>Would a 20-minute strategy call make sense? I can show you exactly what we'd do for your store.</div><br />
            <div style={{color:'var(--text3)'}}>— EcomSkyline Team, Powered by AI Outreach</div>
          </div>
          <div style={{display:'flex',gap:8,marginTop:12}}>
            <button className="btn btn-ghost btn-sm">Edit</button>
            <button className="btn btn-es btn-sm" onClick={() => onToast('Outreach email sent to 47 Amazon sellers ✓','success')}>Send to Segment</button>
          </div>
        </div>
      </div>
      <div className="card">
        <div className="card-title">AI Outreach — ThinkAIWorks Sample</div>
        <div className="email-preview">
          <div className="to">TO: Jennifer Lee · Head of Ops · Retail Co · jen@...  |  SCORE: 92% match</div>
          <div className="subj">Subject: Cut 40% of your ops workload with AI — we've done it for 8 companies</div>
          <div style={{color:'var(--text)'}}>Hi Jennifer,</div><br />
          <div>Your company is scaling fast — and typically that means ops complexity grows faster than headcount. We specialize in AI automation at ThinkAIWorks: chatbots, workflow automation, and custom AI tools.</div><br />
          <div>We recently helped a logistics company <span style={{color:'var(--tai)'}}>automate 60% of their customer support tickets</span> and save 120 hours per month.</div><br />
          <div>Could we do a quick 15-minute call this week?</div>
        </div>
        <button className="btn btn-tai btn-sm" style={{marginTop:12}} onClick={() => onToast('ThinkAIWorks campaign queued · 63 prospects in sequence ✓','info')}>Send to ThinkAIWorks Segment</button>
      </div>

      {showLaunch && (
        <CreateCampaign
          onClose={() => setShowLaunch(false)}
          onSaved={onRefresh}
          onToast={onToast}
        />
      )}
    </div>
  );
}
