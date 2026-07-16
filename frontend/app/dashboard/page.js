'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/config';
import Topbar from '../(protected)/components/Topbar';
import Sidebar from '../(protected)/components/Sidebar';
import Ticker from '../(protected)/components/Ticker';
import Toast from '../(protected)/components/Toast';
import Overview from '../(protected)/components/Overview';
import Upwork from '../(protected)/components/Upwork';
import CRM from '../(protected)/components/CRM';
import Meetings from '../(protected)/components/Meetings';
import Employees from '../(protected)/components/Employees';
import Outreach from '../(protected)/components/Outreach';
import Support from '../(protected)/components/Support';
import Budget from '../(protected)/components/Budget';
import Growth from '../(protected)/components/Growth';
import CEO from '../(protected)/components/CEO';
import EmployeeRatings from '../(protected)/components/EmployeeRatings';
import Attendance from '../(protected)/components/Attendance';
import CreateEmployeeAccount from '../(protected)/components/CreateEmployeeAccount';

export default function Dashboard() {
  const router = useRouter();
  const [activePage, setActivePage] = useState('overview');
  const [company, setCompany] = useState('tai');
  const [data, setData] = useState(null);
  const [toast, setToast] = useState(null);
  const [tickerItems, setTickerItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isChecking, setIsChecking] = useState(true);
  const [leads, setLeads] = useState([]);

  const addLead = (lead) => setLeads((prev) => [{ ...lead, age: 'Just now' }, ...prev]);
  const removeLead = (name) => setLeads((prev) => prev.filter((l) => l.name !== name));

  const fetchData = async () => {
    try {
      const res = await api('/dashboard/app-data');
      setData(res);
      setLeads(res?.pendingLeads || []);
      setTickerItems(res?.tickerItems || [
        'EcomSkyline revenue growing steadily',
        'ThinkAIWorks AI chatbot project active',
        'New leads in pipeline',
      ]);
    } catch {
      setTickerItems(['Welcome to Command Hub']);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { router.replace('/login'); return; }
    setIsChecking(false);
    fetchData();
  }, [router]);

  const showToast = useCallback((msg, type = 'success') => {
    setToast({ msg, type });
  }, []);

  const sections = {
    overview: { comp: Overview, props: { data, leads, onAddLead: addLead } },
    upwork: { comp: Upwork, props: { leads, onAddLead: addLead, onRemoveLead: removeLead } },
    crm: { comp: CRM, props: { data, onAddLead: addLead } },
    meetings: { comp: Meetings, props: { data, onRefresh: fetchData } },
    employees: { comp: Employees, props: { data, onRefresh: fetchData } },
    ratings: { comp: EmployeeRatings, props: { data, onRefresh: fetchData } },
    attendance: { comp: Attendance, props: { data, onRefresh: fetchData } },
    outreach: { comp: Outreach, props: { data, onRefresh: fetchData } },
    support: { comp: Support, props: { data, onRefresh: fetchData } },
    budget: { comp: Budget, props: { data } },
    growth: { comp: Growth, props: { data } },
    ceo: { comp: CEO, props: { data } },
    'create-employee': { comp: CreateEmployeeAccount, props: {} },
  };

  const Section = sections[activePage]?.comp;

  if (isChecking) return null;

  return (
    <>
      <Ticker items={tickerItems} />

      <div className="shell">
        <Topbar
          activePage={activePage}
          onNavigate={setActivePage}
          data={data}
          leads={leads}
        />

        <Sidebar
          activePage={activePage}
          onNavigate={setActivePage}
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