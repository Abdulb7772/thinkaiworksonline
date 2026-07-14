'use client';

import { useState } from 'react';

const budgetItems = [
  {label:'Upwork Promoted',val:800,max:3000},
  {label:'LinkedIn Ads',val:600,max:3000},
  {label:'Google Ads',val:1200,max:3000},
  {label:'Content / SEO',val:400,max:2000},
  {label:'Email Tools',val:200,max:1000},
  {label:'AI Tools & SaaS',val:300,max:1500},
  {label:'Events / Webinars',val:700,max:2000},
];

const trendData = [14200,16800,18400,21000,24500,28400];

export default function Budget({ company, onToast }) {
  const [vals, setVals] = useState(budgetItems.map(b => b.val));

  const total = vals.reduce((a, b) => a + b, 0);
  const roi = total > 0 ? Math.round((total * 6.8 / total) * 100) : 0;

  const updateVal = (i, v) => {
    const next = [...vals];
    next[i] = Number(v);
    setVals(next);
  };

  return (
    <div className="page active" style={{display:'flex',flexDirection:'column',gap:22}}>
      <div className="ph">
        <div>
          <div className="pt">Budget & Revenue</div>
          <div className="ps">Marketing spend · Revenue tracking · ROI calculator</div>
        </div>
      </div>
      <div className="grid4">
        <div className="metric es">
          <div className="m-label">Total Revenue</div>
          <div className="m-val" style={{color:'var(--es)'}}>$28,400</div>
          <div className="m-delta up">{'\u2191'} 22% MoM</div>
        </div>
        <div className="metric">
          <div className="m-label">Marketing Spend</div>
          <div className="m-val" id="b-spend">{'$'}{total.toLocaleString()}</div>
          <div className="m-delta neutral">{(total / 28400 * 100).toFixed(1)}% of rev</div>
        </div>
        <div className="metric">
          <div className="m-label">Marketing ROI</div>
          <div className="m-val" style={{color:'var(--green)'}}>{roi}%</div>
          <div className="m-delta up">Strong</div>
        </div>
        <div className="metric">
          <div className="m-label">Net Profit</div>
          <div className="m-val">{'$'}{(28400 - total).toLocaleString()}</div>
          <div className="m-delta up">{(28400 - total) / 28400 * 100 > 0 ? '66.5% margin' : ''}</div>
        </div>
      </div>
      <div className="grid2">
        <div className="card">
          <div className="card-title">Marketing Budget Allocator</div>
          <div>
            {budgetItems.map((b, i) => (
              <div key={i} className="budget-slider-row">
                <span className="bs-label">{b.label}</span>
                <input type="range" className="bs-input" min="0" max={b.max} value={vals[i]} step="50" onChange={e => updateVal(i, e.target.value)} />
                <span className="bs-val">{'$'}{vals[i].toLocaleString()}</span>
              </div>
            ))}
          </div>
          <div style={{marginTop:16,padding:14,background:'var(--bg3)',borderRadius:'var(--r)',border:'1px solid var(--border)'}}>
            <div style={{display:'flex',justifyContent:'space-between',fontSize:13,marginBottom:6}}>
              <span style={{color:'var(--text2)'}}>Total Allocated</span>
              <span style={{fontFamily:'var(--font-mono)',color:'var(--es)'}}>{'$'}{total.toLocaleString()}</span>
            </div>
            <div style={{display:'flex',justifyContent:'space-between',fontSize:13}}>
              <span style={{color:'var(--text2)'}}>Projected ROI</span>
              <span style={{fontFamily:'var(--font-mono)',color:'var(--green)'}}>{roi}%</span>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card-title">Revenue Split — Both Companies</div>
          <div style={{display:'flex',flexDirection:'column',gap:10}}>
            <div>
              <div style={{display:'flex',justifyContent:'space-between',fontSize:12,marginBottom:4}}><span style={{color:'var(--text2)'}}>EcomSkyline</span><span style={{fontFamily:'var(--font-mono)',color:'var(--es)'}}>$18,200 · 64%</span></div>
              <div className="progress"><div className="progress-fill" style={{width:'64%',background:'var(--es)'}}></div></div>
            </div>
            <div>
              <div style={{display:'flex',justifyContent:'space-between',fontSize:12,marginBottom:4}}><span style={{color:'var(--text2)'}}>ThinkAIWorks</span><span style={{fontFamily:'var(--font-mono)',color:'var(--tai)'}}>$10,200 · 36%</span></div>
              <div className="progress"><div className="progress-fill" style={{width:'36%',background:'var(--tai)'}}></div></div>
            </div>
          </div>
          <div style={{marginTop:18}}>
            <div className="card-title" style={{marginBottom:12}}>Monthly Revenue Trend</div>
            <div className="bar-chart" id="rev-trend-chart">
              {trendData.map((v, i) => (
                <div key={i} className="b-col">
                  <div className="b-bar" style={{height:`${(v / 28400) * 100}%`,background:i === 5 ? 'var(--es)' : i === 4 ? 'var(--tai)' : 'var(--border2)',minHeight:4}}></div>
                </div>
              ))}
            </div>
            <div style={{display:'flex',justifyContent:'space-between',marginTop:6,fontSize:9,color:'var(--text3)',fontFamily:'var(--font-mono)'}}>
              <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
