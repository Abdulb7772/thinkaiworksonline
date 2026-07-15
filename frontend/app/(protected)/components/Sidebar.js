'use client';

import { useState, useEffect } from 'react';
import ChangePasswordModal from './ChangePasswordModal';

const ROLE_NAV = {
  admin: {
    sections: [
      {
        label: 'Admin',
        items: [
          { id: 'create-employee', icon: 'M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M8 7a4 4 0 100-8 4 4 0 000 8zm11 4v6m-3-3h6', label: 'Create Employee Account' },
        ],
      },
      {
        label: 'Core',
        items: [
          { id: 'overview', icon: 'M3 3h7v7H3zm11 0h7v7h-7zm0 11h7v7h-7zM3 14h7v7H3z', label: 'Command Center' },
          { id: 'upwork', icon: 'M12 4v16m8-8H4', label: 'Upwork Intake', badge: { text: '3', cls: 'red' } },
          { id: 'crm', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0', label: 'CRM Pipeline', badge: { text: '12', cls: 'blue' } },
          { id: 'meetings', icon: 'M3 4h18v18H3zm13-2v4M8 2v4M3 10h18', label: 'Meetings', badge: { text: '2', cls: 'amber' } },
        ],
      },
      {
        label: 'Intelligence',
        items: [
          { id: 'employees', icon: 'M12 8a4 4 0 100-8 4 4 0 000 8zm-8 12c0-4 3.58-7 8-7s8 3 8 7', label: 'Employee Performance' },
          { id: 'ratings', icon: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z', label: 'Employee Ratings' },
          { id: 'attendance', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', label: 'Attendance' },
          { id: 'outreach', icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z', label: 'AI Outreach', badge: { text: 'Active', cls: 'green' } },
          { id: 'support', icon: 'M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z', label: 'Customer Support', badge: { text: '4', cls: 'red' } },
        ],
      },
      {
        label: 'Finance & Growth',
        items: [
          { id: 'budget', icon: 'M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 11h.01M12 11h.01M15 11h.01M4 19h16a2 2 0 002-2V7a2 2 0 00-2-2H4a2 2 0 00-2 2v10a2 2 0 002 2z', label: 'Budget & Revenue' },
          { id: 'growth', icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6', label: 'Growth Engine' },
        ],
      },
      {
        label: 'CEO',
        items: [
          { id: 'ceo', icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z', label: 'CEO Chat (Muhammad Ali)' },
        ],
      },
    ],
  },
  customer: {
    sections: [
      {
        label: 'Core',
        items: [
          { id: 'overview', icon: 'M3 3h7v7H3zm11 0h7v7h-7zm0 11h7v7h-7zM3 14h7v7H3z', label: 'Command Center' },
          { id: 'upwork', icon: 'M12 4v16m8-8H4', label: 'Upwork Intake', badge: { text: '3', cls: 'red' } },
          { id: 'meetings', icon: 'M3 4h18v18H3zm13-2v4M8 2v4M3 10h18', label: 'Meetings', badge: { text: '2', cls: 'amber' } },
        ],
      },
      {
        label: 'Intelligence',
        items: [
          { id: 'employees', icon: 'M12 8a4 4 0 100-8 4 4 0 000 8zm-8 12c0-4 3.58-7 8-7s8 3 8 7', label: 'Employee Performance' },
          { id: 'ratings', icon: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z', label: 'Employee Ratings' },
          { id: 'outreach', icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z', label: 'AI Outreach', badge: { text: 'Active', cls: 'green' } },
          { id: 'support', icon: 'M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z', label: 'Customer Support', badge: { text: '4', cls: 'red' } },
        ],
      },
      {
        label: 'CEO',
        items: [
          { id: 'ceo', icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z', label: 'CEO Chat (Muhammad Ali)' },
        ],
      },
    ],
  },
  employee: {
    sections: [
      {
        label: 'Core',
        items: [
          { id: 'overview', icon: 'M3 3h7v7H3zm11 0h7v7h-7zm0 11h7v7h-7zM3 14h7v7H3z', label: 'Command Center' },
          { id: 'upwork', icon: 'M12 4v16m8-8H4', label: 'Upwork Intake', badge: { text: '3', cls: 'red' } },
          { id: 'crm', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0', label: 'CRM Pipeline', badge: { text: '12', cls: 'blue' } },
          { id: 'meetings', icon: 'M3 4h18v18H3zm13-2v4M8 2v4M3 10h18', label: 'Meetings', badge: { text: '2', cls: 'amber' } },
        ],
      },
      {
        label: 'Intelligence',
        items: [
          { id: 'employees', icon: 'M12 8a4 4 0 100-8 4 4 0 000 8zm-8 12c0-4 3.58-7 8-7s8 3 8 7', label: 'Employee Performance' },
          { id: 'attendance', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', label: 'Attendance' },
          { id: 'outreach', icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z', label: 'AI Outreach', badge: { text: 'Active', cls: 'green' } },
          { id: 'support', icon: 'M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z', label: 'Customer Support', badge: { text: '4', cls: 'red' } },
        ],
      },
      {
        label: 'Finance & Growth',
        items: [
          { id: 'budget', icon: 'M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 11h.01M12 11h.01M15 11h.01M4 19h16a2 2 0 002-2V7a2 2 0 00-2-2H4a2 2 0 00-2 2v10a2 2 0 002 2z', label: 'Budget & Revenue' },
          { id: 'growth', icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6', label: 'Growth Engine' },
        ],
      },
    ],
  },
};

export default function Sidebar({ activePage, onNavigate, data, leads }) {
  const [role, setRole] = useState('admin');
  const [showChangePwd, setShowChangePwd] = useState(false);

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem('user') || '{}');
    if (u.role) setRole(u.role);
  }, []);

  const upworkCount = Number(data?.crmMetrics?.[0]?.val || 0);
  const crmCount = data?.clients?.length ?? 0;
  const meetingsCount = data?.meetings?.length ?? 0;
  const outreachCount = data?.campaigns?.filter((c) => c.status === 'active')?.length ?? 0;
  const supportCount = data?.tickets?.filter((t) => t.status === 'Open')?.length ?? 0;

  const badgeTextById = {
    upwork: String(upworkCount),
    crm: String(crmCount),
    meetings: String(meetingsCount),
    outreach: String(outreachCount),
    support: String(supportCount),
  };

  const navData = ROLE_NAV[role] || ROLE_NAV.admin;

  const navClass = (id) => {
    const base = 'nav-item';
    if (id !== activePage) return base;
    return `${base} active tai-mode`;
  };

  return (
    <nav className="sidebar">
      {navData.sections.map((sect) => (
        <div key={sect.label}>
          <div className="nav-sect">{sect.label}</div>
          {sect.items.map((item) => (
            <div key={item.id} className={navClass(item.id)} onClick={() => onNavigate?.(item.id)}>
              <svg className="nav-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d={item.icon} />
              </svg>
              <span>{item.label}</span>
              {item.badge && (
                <span className={`nbadge ${item.badge.cls}`}>
                  {badgeTextById[item.id] ?? item.badge.text}
                </span>
              )}
            </div>
          ))}
        </div>
      ))}

      {role !== 'customer' && (
        <div className="nav-item" onClick={() => setShowChangePwd(true)} style={{ marginTop: 8 }}>
          <svg className="nav-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <span>Change Password</span>
        </div>
      )}

      {showChangePwd && <ChangePasswordModal onClose={() => setShowChangePwd(false)} />}

      <div className="company-switcher">
        <div className="cs-label">Company</div>
        <div className="cs-opts">
          <div className="cs-opt active-tai" style={{cursor:'default'}}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/></svg>
            ThinkAIWorks
          </div>
        </div>
      </div>
    </nav>
  );
}
