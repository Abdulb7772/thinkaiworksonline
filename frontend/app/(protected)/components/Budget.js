'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/config';
import { SkeletonCard } from './Skeleton';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function Budget({ company, onToast, data }) {
  const budgetItems = data?.budget?.items || [];
  const userRole = typeof window !== 'undefined' ? (JSON.parse(localStorage.getItem('user') || '{}').role || 'admin') : 'admin';
  const totals = data?.budget?.totals || {};
  const spend = totals.spend || 0;

  const [vals, setVals] = useState(budgetItems.map(b => b.value || 0));
  const total = vals.reduce((a, b) => a + b, 0);

  const [projects, setProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const p = await api('/projects/');
        setProjects(p);
      } catch {} finally {
        setLoadingProjects(false);
      }
    })();
  }, []);

  const updateVal = (i, v) => {
    const next = [...vals];
    next[i] = Number(v);
    setVals(next);
  };

  const totalRevenue = projects.reduce((sum, p) => sum + (p.payment || 0), 0);
  const rev = totalRevenue;
  const roi = totals.roi || (spend > 0 ? Math.round((rev / spend) * 100) + '%' : '—');

  const now = new Date();
  const [dpMonth, setDpMonth] = useState(now.getMonth());
  const [dpYear, setDpYear] = useState(now.getFullYear());

  const daysInMonth = new Date(dpYear, dpMonth + 1, 0).getDate();
  const dailyProfit = Array.from({ length: daysInMonth }, () => 0);
  const maxProfit = Math.max(...dailyProfit, 1);

  const prevMonth = () => {
    if (dpMonth === 0) { setDpMonth(11); setDpYear(y => y - 1); }
    else setDpMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (dpMonth === 11) { setDpMonth(0); setDpYear(y => y + 1); }
    else setDpMonth(m => m + 1);
  };

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
          <div className="card-title" style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <span>Daily Profit — {MONTHS[dpMonth]} {dpYear}</span>
            <div style={{display:'flex',gap:6}}>
              <button className="btn btn-sm btn-ghost" onClick={prevMonth} style={{padding:'4px 10px',fontSize:16,lineHeight:1}}>&lsaquo;</button>
              <button className="btn btn-sm btn-ghost" onClick={nextMonth} style={{padding:'4px 10px',fontSize:16,lineHeight:1}}>&rsaquo;</button>
            </div>
          </div>
          <div style={{marginTop:12}}>
            {dpMonth === now.getMonth() && dpYear === now.getFullYear() && dailyProfit.every(v => v === 0) ? (
              <div style={{textAlign:'center',padding:'30px 0',color:'var(--text3)',fontSize:13}}>Daily profit data will appear here once calculated</div>
            ) : (
              <>
                <div className="bar-chart" style={{height:120}}>
                  {dailyProfit.map((v, i) => (
                    <div key={i} className="b-col" title={`Day ${i + 1}: $${v}`}>
                      <div className="b-bar" style={{height:`${(v / maxProfit) * 100}%`,background:'var(--es)',minHeight:v > 0 ? 4 : 0,opacity:v > 0 ? 1 : 0.3}}></div>
                    </div>
                  ))}
                </div>
                <div style={{display:'flex',justifyContent:'space-between',marginTop:6,fontSize:9,color:'var(--text3)',fontFamily:'var(--font-mono)'}}>
                  <span>1</span><span>{Math.ceil(daysInMonth / 4)}</span><span>{Math.ceil(daysInMonth / 2)}</span><span>{Math.ceil(daysInMonth * 3 / 4)}</span><span>{daysInMonth}</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>)}
    </div>
  );
}
