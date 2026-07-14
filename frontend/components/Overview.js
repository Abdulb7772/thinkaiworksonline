'use client';

const defaultEsMetrics = [
  { label: 'Monthly Revenue', val: '$18,200', delta: '\u2191 22% MoM', cls: 'up', co: 'es' },
  { label: 'Active Clients', val: '11', delta: '\u2191 2 new', cls: 'up', co: '' },
  { label: 'Upwork Leads', val: '28', delta: 'This month', cls: 'neutral', co: '' },
  { label: 'Avg Project Value', val: '$1,650', delta: '\u2191 $200', cls: 'up', co: '' },
];

const defaultTaiMetrics = [
  { label: 'Monthly Revenue', val: '$10,200', delta: '\u2191 31% MoM', cls: 'up', co: 'tai' },
  { label: 'Active Clients', val: '7', delta: '\u2191 1 new', cls: 'up', co: '' },
  { label: 'AI Projects Live', val: '12', delta: '4 in build', cls: 'neutral', co: '' },
  { label: 'Avg Project Value', val: '$3,200', delta: '\u2191 $800', cls: 'up', co: '' },
];

const defaultLeads = [
  { name: 'David Park', service: 'Amazon FBA', budget: '$3k\u20137k', score: 91, co: 'es', status: 'New' },
  { name: 'Emma Richardson', service: 'Shopify Dev', budget: '$1k\u20133k', score: 77, co: 'es', status: 'Contacted' },
  { name: 'Tariq Sultan', service: 'AI Chatbot', budget: '$5k+', score: 88, co: 'tai', status: 'New' },
];

const defaultSchedule = [
  { time: '10:00 AM', title: 'Discovery Call \u2014 David Park', type: 'Video Call', co: 'es' },
  { time: '2:00 PM', title: 'Project Review \u2014 Emma R.', type: 'Internal', co: 'es' },
  { time: '4:30 PM', title: 'AI Demo \u2014 Tariq Sultan', type: 'Video Call', co: 'tai' },
];

const defaultPerformers = [
  { name: 'Sarah K.', role: 'Lead Manager', score: 94, co: 'es' },
  { name: 'Zara T.', role: 'AI Specialist', score: 89, co: 'tai' },
  { name: 'Omar H.', role: 'Dev Lead', score: 86, co: 'es' },
];

const chartData = [12, 15, 11, 18, 22, 19, 28];
const chartLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'T'];

export default function Overview({ company, data, onToast }) {
  const metrics = data?.metrics || (company === 'es' ? defaultEsMetrics : defaultTaiMetrics);
  const leads = data?.overviewLeads || defaultLeads;
  const schedule = data?.schedule || defaultSchedule;
  const performers = data?.performers || defaultPerformers;
  const maxVal = Math.max(...chartData);
  const companyName = company === 'es' ? 'EcomSkyline' : 'ThinkAIWorks';

  const getInitials = (name) =>
    name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div className="page active" style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
      <div className="ph">
        <div>
          <div className="pt">Command Center</div>
          <div className="ps">Viewing: {companyName} \u00b7 All systems operational</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-ghost btn-sm">Export Report</button>
          <button id="primary-btn" className={`btn btn-${company === 'es' ? 'es' : 'tai'} btn-sm`}>+ New Client</button>
        </div>
      </div>

      <div className="grid4">
        {metrics.map((m, i) => (
          <div key={i} className={`metric ${m.co || company}`}>
            <div className="m-label">{m.label}</div>
            <div className="m-val">{m.val}</div>
            <div className={`m-delta ${m.cls}`}>{m.delta}</div>
          </div>
        ))}
      </div>

      <div className="grid2">
        <div className="card">
          <div className="card-title">
            <span>Recent Upwork Leads</span>
            <span className="tag tes">Auto-synced</span>
          </div>
          {leads.map((lead, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0',
              borderBottom: i < leads.length - 1 ? '1px solid var(--border)' : 'none',
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: '50%',
                background: lead.co === 'tai' ? 'var(--tai3)' : 'var(--es3)',
                border: `1px solid ${lead.co === 'tai' ? 'rgba(124,92,252,.2)' : 'rgba(0,229,200,.2)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 700, flexShrink: 0,
                color: lead.co === 'tai' ? 'var(--tai)' : 'var(--es)',
                fontFamily: 'var(--font-head)',
              }}>
                {getInitials(lead.name)}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 13 }}>{lead.name}</div>
                <div style={{ fontSize: 11, color: 'var(--text2)' }}>
                  {lead.service} · {lead.budget}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {lead.co && <span className={`tag t${lead.co}`}>{lead.co === 'es' ? 'ES' : 'TAI'}</span>}
                <span style={{
                  fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 500,
                  color: 'var(--green)',
                }}>
                  {lead.score}%
                </span>
                <button className="btn btn-ghost btn-sm" onClick={() => onToast?.('Lead added to CRM ✓', 'success')}>Add to CRM</button>
              </div>
            </div>
          ))}
        </div>

        <div className="card">
          <div className="card-title">
            <span>Today&apos;s Schedule</span>
          </div>
          {schedule.map((evt, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0',
              borderBottom: i < schedule.length - 1 ? '1px solid var(--border)' : 'none',
            }}>
              <div style={{
                fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text2)', minWidth: 44,
              }}>
                {evt.time}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 500, fontSize: 13 }}>{evt.title}</div>
                <div style={{ fontSize: 11, color: 'var(--text3)' }}>{evt.type}</div>
              </div>
              {evt.co && <span className={`tag t${evt.co}`}>{evt.co === 'es' ? 'ES' : 'TAI'}</span>}
            </div>
          ))}
        </div>
      </div>

      <div className="grid2">
        <div className="card">
          <div className="card-title">
            <span>Revenue \u2014 Last 7 Days</span>
          </div>
          <div className="bar-chart" style={{ marginTop: 12 }}>
            {chartData.map((v, i) => (
              <div key={i} className="b-col">
                <div
                  className="b-bar"
                  style={{
                    height: `${(v / maxVal) * 100}%`,
                    background: i === chartData.length - 1 ? 'var(--es)' : 'var(--border2)',
                  }}
                />
                <span className="b-lbl">{chartLabels[i]}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-title">
            <span>Top Performers This Week</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {performers.map((p, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 24, textAlign: 'center',
                  fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 600, color: 'var(--text2)',
                }}>
                  {String(i + 1).padStart(2, '0')}
                </div>
                <div style={{
                  width: 36, height: 36, borderRadius: '50%',
                  background: p.co === 'tai' ? 'var(--tai3)' : 'var(--es3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: 700, flexShrink: 0,
                  color: p.co === 'tai' ? 'var(--tai)' : 'var(--es)',
                }}>
                  {getInitials(p.name)}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 500, fontSize: 13 }}>{p.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text3)' }}>{p.role}</div>
                </div>
                <div style={{
                  fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 600,
                  color: p.score >= 90 ? 'var(--green)' : p.score >= 80 ? 'var(--amber)' : 'var(--text2)',
                }}>
                  {p.score}%
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
