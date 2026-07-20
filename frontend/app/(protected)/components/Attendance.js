'use client';

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/config';
import { SkeletonCard } from './Skeleton';

function todayStr() {
  const d = new Date();
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

function timeStr() {
  return new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
}

function Toggle({ checked, onChange, label, disabled = false }) {
  const isDisabled = disabled || !onChange;
  return (
    <label className={`toggle-wrap ${isDisabled ? 'disabled' : ''}`}>
      <span className="toggle-label off">Out</span>
      <span className="toggle-track">
        <input type="checkbox" checked={checked} onChange={onChange} disabled={isDisabled} readOnly={isDisabled} />
        <span className="toggle-knob" />
      </span>
      <span className="toggle-label on">In</span>
      {label && <span style={{fontSize:11,color:'var(--text2)',marginLeft:4,fontFamily:'var(--font-mono)'}}>{label}</span>}
      <style>{`
        .toggle-wrap {
          display: inline-flex; align-items: center; gap: 6px; cursor: pointer;
          user-select: none; font-family: var(--font-mono); font-size: 11px;
        }
        .toggle-wrap.disabled {
          cursor: not-allowed;
          opacity: .65;
        }
        .toggle-track {
          position: relative; width: 40px; height: 22px; border-radius: 11px;
          background: var(--red); transition: background .3s ease;
          flex-shrink: 0;
        }
        .toggle-track:has(input:checked) { background: var(--green); }
        .toggle-track input { position: absolute; opacity: 0; width: 0; height: 0; }
        .toggle-knob {
          position: absolute; top: 2px; left: 2px; width: 18px; height: 18px;
          border-radius: 50%; background: #fff;
          transition: transform .3s cubic-bezier(.4,0,.2,1);
          box-shadow: 0 1px 3px rgba(0,0,0,.25);
        }
        .toggle-track:has(input:checked) .toggle-knob { transform: translateX(18px); }
        .toggle-label { color: var(--text3); font-weight: 600; transition: color .3s ease; font-size: 10px; }
        .toggle-wrap:has(input:checked) .toggle-label.on { color: var(--green); }
      `}</style>
    </label>
  );
}

function calcDuration(checkin, checkout) {
  if (!checkin) return 0;
  const [ih, im] = checkin.split(':').map(Number);
  const start = ih * 60 + im;
  if (!checkout) return Math.round((new Date() - new Date().setHours(ih, im, 0)) / 3600000 * 10) / 10;
  const [oh, om] = checkout.split(':').map(Number);
  const end = oh * 60 + om;
  return Math.round((end - start) / 60 * 10) / 10;
}

function fmtHours(h) {
  if (h <= 0) return '—';
  const hrs = Math.floor(h);
  const mins = Math.round((h - hrs) * 60);
  return `${hrs}h ${mins}m`;
}

function shouldMarkAbsent(date, now = new Date()) {
  if (!date) return false;
  const today = todayStr();
  if (date < today) return true;
  if (date !== today) return false;
  const cutoff = new Date(`${date}T18:00:00`);
  return now >= cutoff;
}

function getStatus(emp, date, now = new Date()) {
  const raw = emp.attendanceLog?.get ? emp.attendanceLog.get(date) : emp.attendanceLog?.[date];
  if (raw) {
    const parts = raw.split('|');
    if (parts[0] === 'present') return { checkedIn: !parts[2], checkin: parts[1] || null, checkout: parts[2] || null, raw };
    if (parts[0] === 'absent') return { checkedIn: false, absent: true, raw };
  }
  if (shouldMarkAbsent(date, now)) return { checkedIn: false, absent: true, raw: null };
  return { checkedIn: false, raw: raw || null };
}

function EmployeeCard({ employee, date, isToday, saving, onToggle, onMarkAbsent, now }) {
  const status = getStatus(employee, date, now);
  const hours = status?.checkin ? calcDuration(status.checkin, status.checkout) : 0;
  const absentLabel = status?.absent ? 'Absent' : null;
  const canMarkAbsent = status?.absent && !status.raw && onMarkAbsent;
  const canToggle = isToday && !status?.absent && (!status?.raw || (status?.checkin && !status?.checkout));

  return (
    <div key={employee._id} style={{display:'flex',alignItems:'center',gap:12,padding:'10px 14px',background:'var(--bg3)',borderRadius:'var(--r)',border:'1px solid var(--border)',marginBottom:8}}>
      <div className="emp-avatar" style={{width:32,height:32,fontSize:12,background:'var(--tai3)',color:'var(--tai)',flexShrink:0}}>
        {employee.initials || employee.name?.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase()}
      </div>
      <div style={{flex:1,minWidth:0}}>
        <div style={{fontWeight:600,fontSize:13}}>{employee.name}</div>
        <div style={{fontSize:11,color:'var(--text2)'}}>{employee.role || '—'}</div>
      </div>
      <div style={{textAlign:'center',minWidth:56}}>
        <div style={{fontSize:10,color:'var(--text2)'}}>In</div>
        <div style={{fontFamily:'var(--font-mono)',fontSize:13,fontWeight:600,color:status?.checkin ? 'var(--green)' : 'var(--text3)'}}>{status?.checkin || '—'}</div>
      </div>
      <div style={{textAlign:'center',minWidth:56}}>
        <div style={{fontSize:10,color:'var(--text2)'}}>Out</div>
        <div style={{fontFamily:'var(--font-mono)',fontSize:13,fontWeight:600,color:status?.checkout ? 'var(--red)' : 'var(--text3)'}}>{status?.checkout || '—'}</div>
      </div>
      <div style={{textAlign:'center',minWidth:48}}>
        <div style={{fontSize:10,color:'var(--text2)'}}>Hrs</div>
        <div style={{fontFamily:'var(--font-mono)',fontSize:13,fontWeight:600,color:hours > 0 ? 'var(--es)' : 'var(--text3)'}}>{fmtHours(hours)}</div>
      </div>
      <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:4}}>
        {absentLabel && (
          <div style={{fontSize:10,fontWeight:700,color:'var(--red)',letterSpacing:.5}}>{absentLabel}</div>
        )}
        {onToggle ? (
          <>
            <Toggle
              checked={!!status?.checkedIn}
              onChange={canToggle ? () => onToggle(employee, status) : undefined}
              disabled={!canToggle}
              label=""
            />
            {!canToggle && status?.checkout && (
              <div style={{fontSize:10,color:'var(--text3)',fontFamily:'var(--font-mono)'}}>Completed</div>
            )}
            {canMarkAbsent && (
              <button type="button" onClick={() => onMarkAbsent(employee)}
                style={{marginTop:4,fontSize:10,color:'var(--text2)',background:'transparent',border:'none',cursor:'pointer',textDecoration:'underline'}}>
                Record absent
              </button>
            )}
          </>
        ) : (
          <div style={{fontSize:10,color:'var(--text3)',fontFamily:'var(--font-mono)'}}>View only</div>
        )}
      </div>
    </div>
  );
}

export default function Attendance({ data, onToast, onRefresh }) {
  const [now, setNow] = useState(timeStr());
  const [date, setDate] = useState(todayStr());
  const [saving, setSaving] = useState(false);

  const user = typeof window !== 'undefined' ? (JSON.parse(localStorage.getItem('user') || '{}')) : {};
  const isAdmin = user.role === 'admin';
  const employees = data?.employees || [];

  const currentEmployee = employees.find(e =>
    (e.email && e.email.toLowerCase() === (user.email || '').toLowerCase()) ||
    (e.name && user.name && e.name.toLowerCase() === user.name.toLowerCase())
  );

  const selfProfile = {
    _id: currentEmployee?._id || user.email || user.name || 'self',
    name: currentEmployee?.name || user.name || user.email || 'My Attendance',
    email: currentEmployee?.email || user.email || '',
    role: currentEmployee?.role || user.role || 'Team',
    company: currentEmployee?.company || 'ThinkAIWorks',
    attendanceLog: currentEmployee?.attendanceLog,
  };

  useEffect(() => {
    const id = setInterval(() => setNow(timeStr()), 1000);
    return () => clearInterval(id);
  }, []);

  const handleToggle = useCallback(async (emp, status) => {
    if (status?.checkout) {
      onToast?.('Attendance is already completed for today', 'error');
      return;
    }

    const t = timeStr();
    const newVal = !status?.checkedIn
      ? 'present|' + t + '|'
      : 'present|' + (status.checkin || '') + '|' + t;
    const msg = !status?.checkedIn ? 'Checked in at ' + t : 'Checked out at ' + t;

    setSaving(true);
    try {
      await api('/employees/self-attendance', {
        method: 'PUT',
        body: JSON.stringify({
          email: emp.email || user.email,
          name: emp.name || user.name,
          role: emp.role || user.role,
          company: emp.company || 'ThinkAIWorks',
          attendanceLog: { [date]: newVal },
        }),
      });
      onToast?.(msg, 'success');
      onRefresh?.();
    } catch (err) {
      onToast?.(err.message, 'error');
    } finally {
      setSaving(false);
    }
  }, [date, onToast, onRefresh]);

  const handleMarkAbsent = useCallback(async (emp) => {
    setSaving(true);
    try {
      await api('/employees/self-attendance', {
        method: 'PUT',
        body: JSON.stringify({
          email: emp.email || user.email,
          name: emp.name || user.name,
          role: emp.role || user.role,
          company: emp.company || 'ThinkAIWorks',
          attendanceLog: { [date]: 'absent||' },
        }),
      });
      onToast?.('Marked absent', 'success');
      onRefresh?.();
    } catch (err) {
      onToast?.(err.message, 'error');
    } finally {
      setSaving(false);
    }
  }, [date, onToast, onRefresh]);

  const isToday = date === todayStr();
  const currentEmployeeStatus = getStatus(selfProfile, date, new Date());

  return (
    <div className="page active" style={{display:'flex',flexDirection:'column',gap:22}}>
      {!data ? <SkeletonCard count={4} /> : (<>
      <div className="ph">
        <div>
          <div className="pt">Attendance</div>
          <div className="ps">{isAdmin ? 'Manage all employee attendance' : 'Check in / Check out — track your hours'}</div>
        </div>
        <div style={{display:'flex',gap:10,alignItems:'center'}}>
          <div style={{fontFamily:'var(--font-mono)',fontSize:20,fontWeight:600,color:'var(--tai)',letterSpacing:1}}>{now}</div>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
            style={{padding:'6px 10px',border:'1px solid var(--border2)',borderRadius:'var(--r)',background:'var(--bg2)',color:'#fff',fontSize:13,accentColor:'#fff',colorScheme:'dark'}} />
        </div>
      </div>

      {isAdmin ? (
        <>
          <div className="card" style={{maxWidth:'100%'}}>
            <div className="card-title">
              All Employees — {isToday ? 'Today' : date}
              <span className="tag tb">{employees.length} employees</span>
            </div>
            {employees.length === 0 ? (
              <div style={{padding:'16px 0',color:'var(--text3)',fontSize:13,textAlign:'center'}}>No employees found</div>
            ) : (
              <div style={{marginTop:4}}>
                {employees.map(emp => (
                  <EmployeeCard key={emp._id} employee={emp} date={date} isToday={isToday} saving={saving} now={new Date()} />
                ))}
              </div>
            )}
          </div>

          <div className="card">
            <div className="card-title">Your Attendance</div>
            <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:16}}>
              <div className="emp-avatar" style={{width:40,height:40,fontSize:14,background:'var(--tai3)',color:'var(--tai)'}}>
                {selfProfile.name?.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase()}
              </div>
              <div>
                <div style={{fontWeight:600}}>{selfProfile.name}</div>
                <div style={{fontSize:12,color:'var(--text2)'}}>{selfProfile.role || '—'}</div>
              </div>
            </div>
            {!currentEmployee && (
              <div style={{padding:'12px 14px',background:'var(--bg3)',borderRadius:'var(--r)',border:'1px solid var(--border)',color:'var(--text2)',fontSize:12,marginBottom:12}}>
                No employee record matched your account yet. You can still mark your own attendance and a record will be created.
              </div>
            )}
            {currentEmployeeStatus?.absent ? (
              <div style={{padding:'14px 16px',background:'var(--red3)',borderRadius:'var(--r)',border:'1px solid var(--red)',color:'var(--red)',fontWeight:600,fontSize:13,marginBottom:12}}>Marked Absent</div>
            ) : (
              <div style={{display:'flex',gap:24,marginBottom:16}}>
                <div>
                  <div style={{fontSize:11,color:'var(--text2)',marginBottom:2}}>Check In</div>
                  <div style={{fontFamily:'var(--font-mono)',fontSize:18,fontWeight:600,color:currentEmployeeStatus?.checkin ? 'var(--green)' : 'var(--text3)'}}>{currentEmployeeStatus?.checkin || '—'}</div>
                </div>
                <div>
                  <div style={{fontSize:11,color:'var(--text2)',marginBottom:2}}>Check Out</div>
                  <div style={{fontFamily:'var(--font-mono)',fontSize:18,fontWeight:600,color:currentEmployeeStatus?.checkout ? 'var(--red)' : 'var(--text3)'}}>{currentEmployeeStatus?.checkout || '—'}</div>
                </div>
                <div>
                  <div style={{fontSize:11,color:'var(--text2)',marginBottom:2}}>Hours</div>
                  <div style={{fontFamily:'var(--font-mono)',fontSize:18,fontWeight:600,color:currentEmployeeStatus?.checkin ? 'var(--es)' : 'var(--text3)'}}>
                    {fmtHours(currentEmployeeStatus?.checkin ? calcDuration(currentEmployeeStatus.checkin, currentEmployeeStatus.checkout) : 0)}
                  </div>
                </div>
              </div>
            )}
            <div style={{display:'flex',alignItems:'center',gap:16,padding:'12px 16px',background:'var(--bg3)',borderRadius:'var(--r)',border:'1px solid var(--border)'}}>
              <Toggle
                checked={!!currentEmployeeStatus?.checkedIn}
                onChange={isToday && !currentEmployeeStatus?.absent && (!currentEmployeeStatus?.raw || (currentEmployeeStatus?.checkin && !currentEmployeeStatus?.checkout)) ? () => handleToggle(selfProfile, currentEmployeeStatus) : undefined}
                disabled={!(isToday && !currentEmployeeStatus?.absent && (!currentEmployeeStatus?.raw || (currentEmployeeStatus?.checkin && !currentEmployeeStatus?.checkout)))}
                label={currentEmployeeStatus?.checkedIn ? 'Clocked In' : 'Clocked Out'}
              />
              {saving && <span style={{fontSize:11,color:'var(--text2)',fontFamily:'var(--font-mono)'}}>Saving...</span>}
            </div>
          </div>
        </>
      ) : (
        <div className="card">
          <div className="card-title">
            {isToday ? 'Today' : date}
            <span className="tag tb">{isToday ? 'Current' : 'Past'}</span>
          </div>

          <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:16}}>
            <div className="emp-avatar" style={{width:40,height:40,fontSize:14,background:'var(--tai3)',color:'var(--tai)'}}>
              {selfProfile.name?.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase()}
            </div>
            <div>
              <div style={{fontWeight:600}}>{selfProfile.name}</div>
              <div style={{fontSize:12,color:'var(--text2)'}}>{selfProfile.role || '—'}</div>
            </div>
          </div>

          {!currentEmployee && (
            <div style={{padding:'12px 14px',background:'var(--bg3)',borderRadius:'var(--r)',border:'1px solid var(--border)',color:'var(--text2)',fontSize:12,marginBottom:12}}>
              No employee record matched your account yet. You can still mark your own attendance and a record will be created.
            </div>
          )}

          <EmployeeCard employee={selfProfile} date={date} isToday={isToday} saving={saving} onToggle={handleToggle} onMarkAbsent={handleMarkAbsent} now={new Date()} />
        </div>
      )}
    </>)}
    </div>
  );
}
