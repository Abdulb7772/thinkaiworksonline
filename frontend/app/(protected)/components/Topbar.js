'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Topbar({ activePage, onNavigate, data, leads, onMenuToggle }) {
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

  const leadCount = leads?.length ?? data?.crmMetrics?.[0]?.val ?? 0;
  const todayMeetings = data?.meetings?.filter(m => {
    if (!m.date) return false;
    const d = new Date(m.date);
    const now = new Date();
    return d.toDateString() === now.toDateString();
  }).length ?? 0;
  const mrr = data?.overviewMetrics?.es?.[0]?.val ?? '$28,400';
  const mrrTai = data?.overviewMetrics?.tai?.[0]?.val;
  const combinedMrr = mrrTai ? mrr + ' · ' + mrrTai : mrr;

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    import('next-auth/react').then(({ signOut }) => signOut({ redirect: false })).catch(() => {});
    window.location.href = '/login';
  };

  return (
    <div className="topbar">
      {/* Hamburger — only visible on mobile via CSS */}
      <button
        className="hamburger-btn"
        onClick={onMenuToggle}
        aria-label="Open navigation menu"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="3" y1="6"  x2="21" y2="6"/>
          <line x1="3" y1="12" x2="21" y2="12"/>
          <line x1="3" y1="18" x2="21" y2="18"/>
        </svg>
      </button>

      <div className="brands">
        <div className="brand-pill tai active-tai" style={{cursor:'default'}}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/></svg>
          ThinkAIWorks
        </div>
      </div>

      {/* Live stats — hidden on mobile via CSS (.topbar-center { display: none }) */}
      <div className="topbar-center">
        <div className="live-stat"><div className="dot" style={{ background: 'var(--green)' }}></div><span>{leadCount} new Upwork leads</span></div>
        <div className="live-stat"><div className="dot" style={{ background: 'var(--amber)' }}></div><span>{todayMeetings} meetings today</span></div>
        <div className="live-stat"><div className="dot" style={{ background: 'var(--blue)' }}></div><span>MRR {combinedMrr}</span></div>
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
