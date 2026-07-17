'use client';

import { useState, useRef, useCallback } from 'react';
import { api } from '@/lib/config';

const coColor = {es:'var(--es)',tai:'var(--tai)',both:'var(--gold)'};

function StarRating({ value, onChange }) {
  const ref = useRef(null);
  const uid = useRef(String(Math.random()).slice(2));
  const [hover, setHover] = useState(null);

  const val = hover ?? value;

  const handleMove = useCallback((e) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const raw = (x / rect.width) * 5;
    const rounded = Math.round(raw * 2) / 2;
    setHover(Math.max(0, Math.min(5, rounded)));
  }, []);

  const handleLeave = useCallback(() => setHover(null), []);

  const handleClick = useCallback(() => {
    if (hover !== null && onChange) onChange(hover);
  }, [hover, onChange]);

  return (
    <div ref={ref} style={{display:'inline-flex',gap:2,cursor:onChange ? 'pointer' : 'default',position:'relative'}} {...(onChange ? {onMouseMove:handleMove, onMouseLeave:handleLeave, onClick:handleClick} : {})}>
      {[0,1,2,3,4].map(i => {
        const start = i;
        const end = i + 1;
        const fill = Math.max(0, Math.min(1, (val - start) / (end - start)));
        const clipId = `${uid.current}-${i}`;
        return (
          <svg key={i} width="20" height="20" viewBox="0 0 20 20" style={{flexShrink:0}}>
            <defs>
              <clipPath id={clipId}>
                <rect x="0" y="0" width={fill * 20} height="20" />
              </clipPath>
            </defs>
            <path d="M10 1l2.39 4.84 5.34.78-3.87 3.77.91 5.32L10 13.27l-4.77 2.51.91-5.32L2.27 6.62l5.34-.78L10 1z" fill="var(--border2)" stroke="none" />
            <path d="M10 1l2.39 4.84 5.34.78-3.87 3.77.91 5.32L10 13.27l-4.77 2.51.91-5.32L2.27 6.62l5.34-.78L10 1z" fill="var(--amber)" stroke="none" clipPath={`url(#${clipId})`} />
          </svg>
        );
      })}
    </div>
  );
}

export default function EmployeeRatings({ data, onToast, onRefresh }) {
  const [ratings, setRatings] = useState({});
  const [saving, setSaving] = useState(false);
  const employees = data?.employees || [];

  const setRating = (id, val) => setRatings({ ...ratings, [id]: val });

  const saveAll = async () => {
    const ids = Object.keys(ratings);
    if (!ids.length) { onToast('No changes to save', 'error'); return; }
    setSaving(true);
    try {
      await Promise.all(ids.map(id =>
        api(`/employees/${id}`, { method: 'PUT', body: JSON.stringify({ rating: ratings[id] }) })
      ));
      onToast('Ratings saved', 'success');
      setRatings({});
      onRefresh?.();
    } catch (err) {
      onToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const currentRating = (e) => ratings[e._id] ?? e.rating ?? 0;

  return (
    <div className="page active" style={{display:'flex'}}>
      <div className="ph">
        <div>
          <div className="pt">Employee Ratings</div>
          <div className="ps">Rate client satisfaction · 1–5 stars</div>
        </div>
        <button className="btn btn-tai btn-sm" onClick={saveAll} disabled={saving || !Object.keys(ratings).length}>
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div className="card">
        {employees.length === 0 ? (
          <div style={{textAlign:'center',padding:'20px 0',color:'var(--text3)',fontSize:13}}>No employees found</div>
        ) : (
          <div className="table-wrap"><table>
            <thead>
              <tr>
                <th>Employee</th><th>Role</th><th>Current Rating</th><th>Set Rating</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((e) => (
                <tr key={e._id}>
                  <td>
                    <div style={{display:'flex',alignItems:'center',gap:8}}>
                      <div className="emp-avatar" style={{width:28,height:28,fontSize:10,background:`${coColor[e.co] || 'var(--border2)'}20`,color:coColor[e.co] || 'var(--text2)'}}>{e.initials}</div>
                      <span style={{fontWeight:600}}>{e.name}</span>
                    </div>
                  </td>
                  <td style={{color:'var(--text2)'}}>{e.role}</td>
                  <td><StarRating value={e.rating || 0} /></td>
                  <td><StarRating value={currentRating(e)} onChange={(v) => setRating(e._id, v)} /></td>
                </tr>
              ))}
            </tbody>
          </table></div>
        )}
      </div>
    </div>
  );
}
