'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/config';
import Topbar from '@/components/Topbar';
import Sidebar from '@/components/Sidebar';
import Ticker from '@/components/Ticker';
import Toast from '@/components/Toast';
import Overview from '@/components/Overview';
import Upwork from '@/components/Upwork';
import CRM from '@/components/CRM';
import Meetings from '@/components/Meetings';
import Employees from '@/components/Employees';
import Outreach from '@/components/Outreach';
import Support from '@/components/Support';
import Budget from '@/components/Budget';
import Growth from '@/components/Growth';
import CEO from '@/components/CEO';

export default function Dashboard() {
  const router = useRouter();
  const [activePage, setActivePage] = useState('overview');
  const [company, setCompany] = useState('es');
  const [data, setData] = useState(null);
  const [toast, setToast] = useState(null);
  const [tickerItems, setTickerItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { router.replace('/login'); return; }
    fetchData();
  }, [router]);

  const fetchData = async () => {
    try {
      const res = await api('/dashboard/app-data');
      setData(res);
      setTickerItems(res?.tickerItems || [
        'EcomSkyline revenue up 22% MoM',
        'ThinkAIWorks AI chatbot project active',
        'Employee of the week: Sarah K.'
      ]);
    } catch {
      setTickerItems(['Welcome to Command Hub']);
    } finally {
      setLoading(false);
    }
  };

  const showToast = useCallback((msg, type = 'success') => {
    setToast({ msg, type });
  }, []);

  const sections = {
    overview: { comp: Overview, props: { data } },
    upwork: { comp: Upwork, props: {} },
    crm: { comp: CRM, props: {} },
    meetings: { comp: Meetings, props: {} },
    employees: { comp: Employees, props: {} },
    outreach: { comp: Outreach, props: {} },
    support: { comp: Support, props: {} },
    budget: { comp: Budget, props: {} },
    growth: { comp: Growth, props: {} },
    ceo: { comp: CEO, props: {} },
  };

  const Section = sections[activePage]?.comp;

  return (
    <>
      <Ticker items={tickerItems} />

      <div className="shell">
        <Topbar
          company={company}
          onSwitchCompany={setCompany}
          activePage={activePage}
          onNavigate={setActivePage}
        />

        <Sidebar
          activePage={activePage}
          onNavigate={setActivePage}
          company={company}
          onSwitchCompany={setCompany}
        />

        <main className="main">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text3)' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 14 }}>Loading...</div>
            </div>
          ) : (
            Section && (
              <div className={`page active`}>
                <Section
                  company={company}
                  onToast={showToast}
                  {...sections[activePage].props}
                />
              </div>
            )
          )}
        </main>
      </div>

      {toast && (
        <Toast
          message={toast.msg}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </>
  );
}
