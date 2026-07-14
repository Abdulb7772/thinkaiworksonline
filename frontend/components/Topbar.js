'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Topbar({ company, onSwitchCompany, activePage, onNavigate }) {
  const router = useRouter();
  const [time, setTime] = useState('');

  useEffect(() => {
    const tick = () => setTime(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || '{}') : {};
  const userName = user.name || '';

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  return (
    <div className="topbar">
      <div className="brands">
        <div className={`brand-pill es ${company === 'es' ? 'active-es' : ''}`} onClick={() => onSwitchCompany('es')}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 12h20M12 2l10 10-10 10"/></svg>
          EcomSkyline
        </div>
        <div className="brand-divider"></div>
        <div className={`brand-pill tai ${company === 'tai' ? 'active-tai' : ''}`} onClick={() => onSwitchCompany('tai')}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/></svg>
          ThinkAIWorks
        </div>
      </div>
      <div className="topbar-center">
        <div className="live-stat"><div className="dot" style={{ background: 'var(--green)' }}></div><span>3 new Upwork leads</span></div>
        <div className="live-stat"><div className="dot" style={{ background: 'var(--amber)' }}></div><span>2 meetings today</span></div>
        <div className="live-stat"><div className="dot" style={{ background: 'var(--blue)' }}></div><span>MRR $28,400</span></div>
      </div>
      <div className="topbar-right">
        <span id="live-clock">{time}</span>
        <div className="ceo-badge" onClick={() => onNavigate('ceo')}>
          <div className="ceo-avatar">MA</div>
          <div className="ceo-name">CEO Muhammad Ali</div>
        </div>
        <div className="user-badge" title="Logged in">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          <span>{userName}</span>
        </div>
        <button className="btn-logout" title="Sign out" onClick={logout}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/></svg>
        </button>
      </div>
    </div>
  );
}
