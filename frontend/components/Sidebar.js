'use client';

export default function Sidebar({ activePage, onNavigate, company, onSwitchCompany }) {
  const navClass = (id) => {
    const base = 'nav-item';
    if (id !== activePage) return base;
    return `${base} active ${company === 'es' ? 'es-mode' : 'tai-mode'}`;
  };

  return (
    <nav className="sidebar">
      <div className="nav-sect">Core</div>

      <div className={navClass('overview')} onClick={() => onNavigate?.('overview')}>
        <svg className="nav-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor"><rect x="3" y="3" width="7" height="7" rx="1" strokeWidth="1.5"/><rect x="14" y="3" width="7" height="7" rx="1" strokeWidth="1.5"/><rect x="3" y="14" width="7" height="7" rx="1" strokeWidth="1.5"/><rect x="14" y="14" width="7" height="7" rx="1" strokeWidth="1.5"/></svg>
        <span>Command Center</span>
      </div>

      <div className={navClass('upwork')} onClick={() => onNavigate?.('upwork')}>
        <svg className="nav-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 4v16m8-8H4"/></svg>
        <span>Upwork Intake</span>
        <span className="nbadge red">3</span>
      </div>

      <div className={navClass('crm')} onClick={() => onNavigate?.('crm')}>
        <svg className="nav-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0"/></svg>
        <span>CRM Pipeline</span>
        <span className="nbadge blue">12</span>
      </div>

      <div className={navClass('meetings')} onClick={() => onNavigate?.('meetings')}>
        <svg className="nav-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor"><rect x="3" y="4" width="18" height="18" rx="2" strokeWidth="1.5"/><path strokeLinecap="round" strokeWidth="1.5" d="M16 2v4M8 2v4M3 10h18"/></svg>
        <span>Meetings</span>
        <span className="nbadge amber">2</span>
      </div>

      <div className="nav-sect">Intelligence</div>

      <div className={navClass('employees')} onClick={() => onNavigate?.('employees')}>
        <svg className="nav-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="12" cy="8" r="4" strokeWidth="1.5"/><path strokeLinecap="round" strokeWidth="1.5" d="M4 20c0-4 3.58-7 8-7s8 3 8 7"/></svg>
        <span>Employee Performance</span>
      </div>

      <div className={navClass('outreach')} onClick={() => onNavigate?.('outreach')}>
        <svg className="nav-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
        <span>AI Outreach</span>
        <span className="nbadge green">Active</span>
      </div>

      <div className={navClass('support')} onClick={() => onNavigate?.('support')}>
        <svg className="nav-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/></svg>
        <span>Customer Support</span>
        <span className="nbadge red">4</span>
      </div>

      <div className="nav-sect">Finance & Growth</div>

      <div className={navClass('budget')} onClick={() => onNavigate?.('budget')}>
        <svg className="nav-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 11h.01M12 11h.01M15 11h.01M4 19h16a2 2 0 002-2V7a2 2 0 00-2-2H4a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
        <span>Budget & Revenue</span>
      </div>

      <div className={navClass('growth')} onClick={() => onNavigate?.('growth')}>
        <svg className="nav-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/></svg>
        <span>Growth Engine</span>
      </div>

      <div className="nav-sect">CEO</div>

      <div className={navClass('ceo')} onClick={() => onNavigate?.('ceo')}>
        <svg className="nav-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg>
        <span>CEO Chat (Muhammad Ali)</span>
      </div>

      <div className="company-switcher">
        <div className="cs-label">Active Company</div>
        <div className="cs-opts">
          <div
            className={`cs-opt${company === 'es' ? ' active-es' : ''}`}
            onClick={() => onSwitchCompany?.('es')}
          >
            EcomSkyline
          </div>
          <div
            className={`cs-opt${company === 'tai' ? ' active-tai' : ''}`}
            onClick={() => onSwitchCompany?.('tai')}
          >
            ThinkAIWorks
          </div>
        </div>
      </div>
    </nav>
  );
}
