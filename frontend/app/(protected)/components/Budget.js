'use client';

import { useState } from 'react';
import { SkeletonCard } from './Skeleton';

export default function Budget({ company, onToast, data }) {
  const budgetItems = data?.budget?.items || [];
  const userRole = typeof window !== 'undefined' ? (JSON.parse(localStorage.getItem('user') || '{}').role || 'admin') : 'admin';
  const trendData = data?.revTrend || [];
  const totals = data?.budget?.totals || {};
  const rev = totals.rev || 28400;
  const spend = totals.spend || 0;
  const roi = totals.roi || (spend > 0 ? Math.round((rev / spend) * 100) + '%' : '—');

  const [vals, setVals] = useState(budgetItems.map(b => b.value || 0));
  const total = vals.reduce((a, b) => a + b, 0);

  const updateVal = (i, v) => {
    const next = [...vals];
    next[i] = Number(v);
    setVals(next);
  };

  const esRevenue = data?.overviewMetrics?.es?.[0]?.val || '$18,200';
  const taiRevenue = data?.overviewMetrics?.tai?.[0]?.val || '$10,200';

  return (
    <div className="page active" style={{display:'flex',flexDirection:'column',gap:22}}>
      {!data ? <SkeletonCard count={4} /> : (<>
      <div className="ph">
        <div>
          <div className="pt">Budget & Revenue</div>
          <div className="ps">Marketing spend · Revenue tracking · ROI calculator</div>
        </div>
      </div>
      <div className="grid4">
        <div className="metric es">
          <div className="m-label">Total Revenue</div>
          <div className="m-val" style={{color:'var(--es)'}}>${rev.toLocaleString()}</div>
          <div className="m-delta up">Current</div>
        </div>
        <div className="metric">
          <div className="m-label">Marketing Spend</div>
          <div className="m-val">${total.toLocaleString()}</div>
          <div className="m-delta neutral">{(rev > 0 ? (total / rev * 100).toFixed(1) : 0)}% of rev</div>
        </div>
        <div className="metric">
          <div className="m-label">Marketing ROI</div>
          <div className="m-val" style={{color:'var(--green)'}}>{roi}</div>
          <div className="m-delta up">Strong</div>
        </div>
        <div className="metric">
          <div className="m-label">Net Profit</div>
          <div className="m-val">${(rev - total).toLocaleString()}</div>
          <div className="m-delta up">{rev > 0 ? ((rev - total) / rev * 100).toFixed(1) + '% margin' : ''}</div>
        </div>
      </div>
      <div className="grid2">
        <div className="card">
          <div className="card-title">Marketing Budget Allocator</div>
          {budgetItems.length === 0 ? (
            <div style={{textAlign:'center',padding:'20px 0',color:'var(--text3)',fontSize:13}}>No budget items configured</div>
          ) : (
            <div>
              {budgetItems.map((b, i) => (
                <div key={i} className="budget-slider-row">
                  <span className="bs-label">{b.label}</span>
                  <input type="range" className="bs-input" min="0" max={b.max || 5000} value={vals[i]} step="50" onChange={e => updateVal(i, e.target.value)} disabled={userRole !== 'admin'} />
                  <span className="bs-val">${vals[i].toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}
          <div style={{marginTop:16,padding:14,background:'var(--bg3)',borderRadius:'var(--r)',border:'1px solid var(--border)'}}>
            <div style={{display:'flex',justifyContent:'space-between',fontSize:13,marginBottom:6}}>
              <span style={{color:'var(--text2)'}}>Total Allocated</span>
              <span style={{fontFamily:'var(--font-mono)',color:'var(--es)'}}>${total.toLocaleString()}</span>
            </div>
            <div style={{display:'flex',justifyContent:'space-between',fontSize:13}}>
              <span style={{color:'var(--text2)'}}>Projected ROI</span>
              <span style={{fontFamily:'var(--font-mono)',color:'var(--green)'}}>{total > 0 ? Math.round((rev / total) * 100) + '%' : '—'}</span>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card-title">Revenue Split — Both Companies</div>
          <div style={{display:'flex',flexDirection:'column',gap:10}}>
            <div>
              <div style={{display:'flex',justifyContent:'space-between',fontSize:12,marginBottom:4}}><span style={{color:'var(--text2)'}}>EcomSkyline</span><span style={{fontFamily:'var(--font-mono)',color:'var(--es)'}}>{esRevenue} · {rev > 0 ? Math.round((parseInt(String(esRevenue).replace(/[^0-9]/g,'')) / rev) * 100) : 64}%</span></div>
              <div className="progress"><div className="progress-fill" style={{width:`${rev > 0 ? Math.round((parseInt(String(esRevenue).replace(/[^0-9]/g,'')) / rev) * 100) : 64}%`,background:'var(--es)'}}></div></div>
            </div>
            <div>
              <div style={{display:'flex',justifyContent:'space-between',fontSize:12,marginBottom:4}}><span style={{color:'var(--text2)'}}>ThinkAIWorks</span><span style={{fontFamily:'var(--font-mono)',color:'var(--tai)'}}>{taiRevenue} · {rev > 0 ? Math.round((parseInt(String(taiRevenue).replace(/[^0-9]/g,'')) / rev) * 100) : 36}%</span></div>
              <div className="progress"><div className="progress-fill" style={{width:`${rev > 0 ? Math.round((parseInt(String(taiRevenue).replace(/[^0-9]/g,'')) / rev) * 100) : 36}%`,background:'var(--tai)'}}></div></div>
            </div>
          </div>
          <div style={{marginTop:18}}>
            <div className="card-title" style={{marginBottom:12}}>Monthly Revenue Trend</div>
            <div className="bar-chart" id="rev-trend-chart">
              {trendData.map((v, i) => (
                <div key={i} className="b-col">
                  <div className="b-bar" style={{height:`${rev > 0 ? (v / rev) * 100 : 10}%`,background:i === trendData.length - 1 ? 'var(--es)' : 'var(--border2)',minHeight:4}}></div>
                </div>
              ))}
            </div>
            <div style={{display:'flex',justifyContent:'space-between',marginTop:6,fontSize:9,color:'var(--text3)',fontFamily:'var(--font-mono)'}}>
              <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span>
            </div>
          </div>
        </div>
      </div>
    </>)}
    </div>
  );
}
