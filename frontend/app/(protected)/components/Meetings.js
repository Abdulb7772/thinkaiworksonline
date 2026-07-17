'use client';

import { useState } from 'react';
import { api } from '@/lib/config';
import CreateMeeting from './CreateMeeting';

const weekdayHeaders = ['Su','Mo','Tu','We','Th','Fr','Sa'];
const days = Array.from({length:31},(_,i)=>i+1);
const coLabel = {es:'tes',tai:'ttai',both:'tb'};

const today = new Date().getDate();

function isMeetingPast(datetime) {
  if (!datetime) return true; // no datetime = treat as completable
  return new Date(datetime) < new Date();
}

export default function Meetings({ company, onToast, data, onRefresh }) {
  const [showCreate, setShowCreate] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const userRole = typeof window !== 'undefined' ? (JSON.parse(localStorage.getItem('user') || '{}').role || 'admin') : 'admin';
  const meetings = data?.meetings || [];
  const eventDays = meetings.map(m => {
    const d = m.date ? new Date(m.date) : null;
    return d ? d.getDate() : null;
  }).filter(Boolean);

  const handleDone = async (m) => {
    if (!m._id || deletingId === m._id) return;
    setDeletingId(m._id);
    try {
      await api(`/meetings/${m._id}/complete`, { method: 'PUT' });
      onToast(`"${m.title}" marked as done`, 'success');
      onRefresh?.();
    } catch (err) {
      onToast(err.message || 'Failed to remove meeting', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  const handleCancel = async (m) => {
    if (!m._id || deletingId === m._id) return;
    setDeletingId(m._id);
    try {
      await api(`/meetings/${m._id}/cancel`, { method: 'PUT' });
      onToast(`"${m.title}" cancelled`, 'success');
      onRefresh?.();
    } catch (err) {
      onToast(err.message || 'Failed to cancel meeting', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="page active" style={{display:'flex'}}>
      <div className="ph">
        <div>
          <div className="pt">Meeting Hub</div>
          <div className="ps">Create · Schedule · Auto-sync with CRM</div>
        </div>
        {userRole !== 'customer' && (
          <button className="btn btn-es" onClick={() => setShowCreate(true)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Create Meeting
          </button>
        )}
      </div>

      <div className="grid2">
        {/* Calendar */}
        <div className="card">
          <div className="card-title">
            {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}
            <div style={{display:'flex',gap:4}}>
              <button className="btn btn-ghost btn-sm" style={{padding:'3px 8px'}} onClick={() => onToast('Previous month')}>&#8249;</button>
              <button className="btn btn-ghost btn-sm" style={{padding:'3px 8px'}} onClick={() => onToast('Next month')}>&#8250;</button>
            </div>
          </div>
          <div className="cal-grid">
            {weekdayHeaders.map(d => (
              <div key={d} style={{textAlign:'center',fontSize:10,color:'var(--text3)',fontWeight:700,padding:'4px 0',textTransform:'uppercase',letterSpacing:'0.5px'}}>{d}</div>
            ))}
            {days.map(d => (
              <div
                key={d}
                className={`cal-day ${eventDays.includes(d) ? 'has-event' : ''} ${d===today ? 'today' : ''}`}
                onClick={() => onToast(`Day ${d} — ${eventDays.includes(d) ? 'Meeting scheduled' : 'No meetings'}`)}
              >
                {d}
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Meetings */}
        <div className="card">
          <div className="card-title">
            Upcoming Meetings
            <span className="tag tb">{meetings.length > 0 ? meetings.length + ' upcoming' : 'None'}</span>
          </div>
          {meetings.length === 0 ? (
            <div style={{textAlign:'center',padding:'20px 0',color:'var(--text3)',fontSize:13}}>No meetings scheduled</div>
          ) : (
            <div style={{display:'flex',flexDirection:'column',gap:10}}>
              {meetings.map((m, i) => {
                const past = isMeetingPast(m.datetime);
                const isDeleting = deletingId === m._id;
                return (
                  <div
                    key={m._id || i}
                    style={{
                      display:'flex',
                      alignItems:'center',
                      gap:14,
                      padding:'11px 14px',
                      background:'var(--bg3)',
                      borderRadius:'var(--r)',
                      border: past ? '1px solid rgba(34,212,122,0.18)' : '1px solid var(--border)',
                      transition:'border-color 0.3s ease',
                    }}
                  >
                    <div style={{fontSize:20}}>{m.type === 'Video' || m.type?.includes('Video') ? '📹' : '👥'}</div>
                    <div style={{flex:1}}>
                      <div style={{fontWeight:600,fontSize:13}}>{m.title}</div>
                      <div style={{fontSize:11,color:'var(--text2)',marginTop:2}}>{m.date} · {m.attendees}</div>
                    </div>
                    {m.co && (
                      <span className={`tag ${coLabel[m.co] || 'tb'}`}>
                        {m.co === 'es' ? 'Ecom' : m.co === 'tai' ? 'TAI' : 'Both'}
                      </span>
                    )}

                    {past ? (
                      /* Meeting time has passed — show Done button */
                      <button
                        disabled={isDeleting}
                        onClick={() => handleDone(m)}
                        style={{
                          display:'flex',
                          alignItems:'center',
                          gap:5,
                          padding:'5px 13px',
                          background: isDeleting ? 'rgba(34,212,122,0.08)' : 'rgba(34,212,122,0.14)',
                          color:'var(--green)',
                          border:'1px solid rgba(34,212,122,0.28)',
                          borderRadius:'var(--r)',
                          fontSize:12,
                          fontWeight:600,
                          cursor: isDeleting ? 'not-allowed' : 'pointer',
                          transition:'all 0.2s ease',
                          whiteSpace:'nowrap',
                        }}
                      >
                        {isDeleting ? (
                          <>
                            <span style={{
                              width:10,height:10,
                              border:'2px solid var(--green)',
                              borderTopColor:'transparent',
                              borderRadius:'50%',
                              display:'inline-block',
                              animation:'meetingSpin 0.6s linear infinite',
                            }} />
                            Removing...
                          </>
                        ) : (
                          <>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12"/>
                            </svg>
                            Done
                          </>
                        )}
                      </button>
                    ) : (
                      <>
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => onToast(`Joining ${m.title}...`)}
                          style={{fontSize:12,fontWeight:600}}
                        >
                          Join
                        </button>
                        <button
                          disabled={isDeleting}
                          onClick={() => handleCancel(m)}
                          style={{
                            display:'flex',alignItems:'center',gap:5,
                            padding:'5px 13px',
                            background: isDeleting ? 'rgba(255,79,109,0.08)' : 'rgba(255,79,109,0.14)',
                            color:'var(--red)',
                            border:'1px solid rgba(255,79,109,0.28)',
                            borderRadius:'var(--r)',
                            fontSize:12,fontWeight:600,
                            cursor: isDeleting ? 'not-allowed' : 'pointer',
                            transition:'all 0.2s ease',
                            whiteSpace:'nowrap',
                          }}
                        >
                          {isDeleting ? 'Cancelling...' : 'Cancel'}
                        </button>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {showCreate && userRole !== 'customer' && (
        <CreateMeeting
          onClose={() => setShowCreate(false)}
          onSaved={onRefresh}
          onToast={onToast}
          clients={data?.clients}
          employees={data?.employees}
        />
      )}

      <style>{`
        @keyframes meetingSpin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
