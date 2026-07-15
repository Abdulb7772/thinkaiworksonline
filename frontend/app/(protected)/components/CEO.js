'use client';

import { useState, useRef, useCallback } from 'react';
import { api } from '@/lib/config';

const promptReplies = {
  'what is our biggest growth opportunity right now?': 'Shukriya for asking. ThinkAIWorks has the highest upside right now. Productizing the AI chatbot into a SaaS offer could lift MRR fast. EcomSkyline should keep tightening retainers so cash flow stays steady.',
  'how are both companies performing vs last month?': 'Combined MRR is moving up. EcomSkyline is still the bigger engine, while ThinkAIWorks is growing faster from a smaller base. The Budget and Revenue view will give you the exact numbers.',
  'which employees need my attention?': 'Check the Employee Performance page for the people who need a nudge and the ones who are carrying the team. That page stays live with the latest scores and trends.',
  'what should we prioritize this week?': 'Pipeline execution, client retention, and clearing anything blocking delivery. Close the strong leads first, keep support tight, and don’t let small issues pile up.',
  'how can we reduce churn?': 'Faster onboarding, better client updates, and a day-14 success check-in. Small consistency there saves more revenue than big speeches.',
  'what marketing should we double down on?': 'Upwork outreach is still the cleanest ROI. LinkedIn can help for higher-ticket work, but only if we keep the message sharp and the follow-up fast.',
};

const greetingReplies = [
  'Wa Alaikum Assalam. Good to see you.',
  'Hello. Good to see you.',
  'Hey. I’m here.',
  'Assalamu Alaikum. What’s up?',
];

const refusalReplies = [
  'Shukriya, but I only discuss EcomSkyline, ThinkAIWorks, and this app. Ask me about the project, team, leads, revenue, attendance, or progress.',
  'I can only help with work-related things here. If you want, ask me about the business, the app, or current project progress.',
  'I can’t help with that one. Keep it to the company or app and I’ll answer straight.',
];

const normalizeMessage = (message) => String(message || '').trim().toLowerCase().replace(/\s+/g, ' ');

const isGreetingMessage = (message) => {
  const normalized = normalizeMessage(message);
  if (!normalized) return false;
  return [
    /^hi[!.\s]*$/,
    /^hello[!.\s]*$/,
    /^hey[!.\s]*$/,
    /^yo[!.\s]*$/,
    /^assalamu alaikum[!.\s]*$/,
    /^assalam alaikum[!.\s]*$/,
    /^walikum assalam[!.\s]*$/,
    /^wa alaikum assalam[!.\s]*$/,
    /^salaam[!.\s]*$/,
  ].some((pattern) => pattern.test(normalized));
};

const isBusinessMessage = (message) => {
  const normalized = normalizeMessage(message);
  if (!normalized) return false;
  return [
    'thinkaiworks', 'ecomskyline', 'project', 'progress', 'status', 'update', 'ongoing', 'pipeline',
    'lead', 'client', 'crm', 'revenue', 'mrr', 'budget', 'campaign', 'marketing', 'employee',
    'attendance', 'meeting', 'ticket', 'support', 'churn', 'growth', 'dashboard', 'team', 'company',
    'app', 'task', 'priority', 'roadmap', 'delivery', 'launch', 'performance'
  ].some((keyword) => normalized.includes(keyword)) || /what should we|how are we|where are we|can you|should we|what is|what are|tell me about/i.test(message);
};

const buildCeoContext = (data) => {
  const activeThinkAIClients = data?.clients?.filter((client) => client.company === 'ThinkAIWorks' && client.stage === 'Active').length || 0;
  const activeEcomClients = data?.clients?.filter((client) => client.company === 'EcomSkyline' || !client.company).length || 0;
  const activeCampaigns = data?.campaigns?.filter((campaign) => campaign.status === 'active').length || 0;
  const urgentIssues = data?.tickets?.filter((ticket) => ticket.priority === 'High' && ticket.status === 'Open').length || 0;
  const openLeads = data?.crmMetrics?.[0]?.val || data?.pendingLeads?.length || 0;
  const teamSize = data?.employees?.length || 0;
  const revenue = data?.overviewMetrics?.es?.[0]?.val || '$—';

  return [
    `Revenue snapshot: ${revenue}`,
    `ThinkAIWorks active clients: ${activeThinkAIClients}`,
    `EcomSkyline active clients: ${activeEcomClients}`,
    `Open leads: ${openLeads}`,
    `Team size: ${teamSize}`,
    `Active campaigns: ${activeCampaigns}`,
    `Urgent open issues: ${urgentIssues}`,
  ].join(' | ');
};

const buildProgressReply = (data) => {
  const revenue = data?.overviewMetrics?.es?.[0]?.val || '$—';
  const growth = data?.overviewMetrics?.es?.[0]?.delta || '—';
  const activeClients = data?.overviewMetrics?.es?.[1]?.val || '—';
  const openLeads = data?.crmMetrics?.[0]?.val || '—';
  const teamSize = data?.employees?.length || '—';
  const urgentIssues = data?.tickets?.filter((ticket) => ticket.priority === 'High' && ticket.status === 'Open').length || 0;
  const activeCampaigns = data?.campaigns?.filter((campaign) => campaign.status === 'active').length || 0;

  return `Shukriya. Current progress is moving. Revenue is ${revenue} ${growth !== '—' ? `(${growth})` : ''}. Active clients are ${activeClients}, open leads are ${openLeads}, team size is ${teamSize}, and active campaigns are ${activeCampaigns}. Urgent issues sitting open: ${urgentIssues}. The main job now is to keep the pipeline moving and clear blockers fast.`;
};

const buildEmployeeCountReply = (data) => {
  const teamSize = data?.employees?.length;
  if (typeof teamSize !== 'number') return `I don’t know enough about that right now.`;
  return `We have ${teamSize} employees right now.`;
};

const buildAttendanceReply = (data) => {
  const totalEmployees = data?.employees?.length;
  if (typeof totalEmployees !== 'number') return `I don’t know enough about the attendance data right now.`;
  return `Attendance is tracked in the Attendance page. That’s where you can check who is present, who is out, and the latest hours for each employee.`;
};

const buildRatingsReply = (data) => {
  const totalEmployees = data?.employees?.length;
  if (typeof totalEmployees !== 'number') return `I don’t know enough about the ratings data right now.`;
  return `Employee ratings are on the Employee Performance page. That’s where the latest scores, trends, and status are shown.`;
};

const buildBusinessReply = (message, data) => {
  const normalized = normalizeMessage(message);
  const exact = promptReplies[normalized];
  if (exact) return exact;

  if (/how many employees|employee count|number of employees|employees do you have|right now/i.test(normalized)) {
    return buildEmployeeCountReply(data);
  }

  if (/attendance|present|absent|check in|check out|clock in|clock out/i.test(normalized)) {
    return buildAttendanceReply(data);
  }

  if (/employee ratings|ratings|performance score|employee performance|score/i.test(normalized)) {
    return buildRatingsReply(data);
  }

  if (/progress|status|update|ongoing|current/i.test(normalized)) {
    return buildProgressReply(data);
  }

  if (/revenue|mrr|budget|profit/i.test(normalized)) {
    const revenue = data?.overviewMetrics?.es?.[0]?.val || '$—';
    const growth = data?.overviewMetrics?.es?.[0]?.delta || '—';
    return `Revenue is sitting at ${revenue} with ${growth !== '—' ? growth : 'steady movement'}. The move here is to protect that base and push the higher-margin work harder.`;
  }

  if (/lead|pipeline|client|crm/i.test(normalized)) {
    const openLeads = data?.crmMetrics?.[0]?.val || '—';
    return `The pipeline is live. Open leads are ${openLeads}. Keep the strongest ones moving, and don’t let follow-up go cold.`;
  }

  if (/employee|team|attendance|performance|rating/i.test(normalized)) {
    const teamSize = data?.employees?.length || '—';
    return `The team has ${teamSize} people in the system. For performance and attendance, the Employee pages have the live detail. That’s where the truth sits.`;
  }

  if (/marketing|campaign|outreach|upwork/i.test(normalized)) {
    const activeCampaigns = data?.campaigns?.filter((campaign) => campaign.status === 'active').length || 0;
    return `Marketing is about execution right now. We have ${activeCampaigns} active campaigns in motion. Upwork outreach is still the cleanest play, but the follow-up has to stay sharp.`;
  }

  return `I don’t know enough about that right now. Ask me about revenue, leads, employees, attendance, ratings, or current project progress.`;
};

const buildHumanReply = (message, data) => {
  if (isGreetingMessage(message)) {
    return greetingReplies[Math.floor(Math.random() * greetingReplies.length)];
  }

  if (!isBusinessMessage(message)) {
    return refusalReplies[Math.floor(Math.random() * refusalReplies.length)];
  }

  return buildBusinessReply(message, data);
};

const quickPrompts = [
  'What is our biggest growth opportunity right now?',
  'How are both companies performing vs last month?',
  'Which employees need my attention?',
  'What should we prioritize this week?',
  'How can we reduce churn?',
  'What marketing should we double down on?',
];

export default function CEO({ company, onToast, data }) {
  const [msgs, setMsgs] = useState([
    { text: "Assalamu Alaikum! I'm Muhammad Ali, CEO of EcomSkyline and ThinkAIWorks. I have full visibility into both companies — revenue, team performance, pipeline, marketing, and growth strategy. What would you like to discuss today?", isAI: true },
  ]);
  const [inp, setInp] = useState('');
  const defRef = useRef(0);
  const [showCeoModal, setShowCeoModal] = useState(false);
  const [modalMsgs, setModalMsgs] = useState([
    { text: "Assalamu Alaikum! I'm Muhammad Ali, CEO of EcomSkyline and ThinkAIWorks. How can I advise you today?", isAI: true },
  ]);
  const [modalInp, setModalInp] = useState('');
  const [modalLoading, setModalLoading] = useState(false);
  const modalEnd = useRef(null);

  const combinedMrr = data?.overviewMetrics?.es?.[0]?.val || '$—';
  const activeClients = data?.overviewMetrics?.es?.[1]?.val || '—';
  const teamSize = data?.employees?.length || '—';
  const openLeads = data?.crmMetrics?.[0]?.val || '—';
  const growthMoM = data?.overviewMetrics?.es?.[0]?.delta || '—';
  const urgentIssues = data?.tickets?.filter(t => t.priority === 'High' && t.status === 'Open').length || 0;
  const ceoContext = buildCeoContext(data);

  const sendMsg = useCallback((text) => {
    const msg = text || inp;
    if (!msg.trim()) return;
    setInp('');
    setMsgs(prev => [...prev, { text: msg, isAI: false }]);
    setTimeout(() => {
      const reply = buildHumanReply(msg, data);
      defRef.current += 1;
      setMsgs(prev => [...prev, { text: reply, isAI: true }]);
    }, 700);
  }, [data, inp]);

  const handlePrompt = (prompt) => {
    setInp(prompt);
    sendMsg(prompt);
  };

  const sendModalMsg = async () => {
    if (!modalInp.trim() || modalLoading) return;
    const txt = modalInp;
    setModalInp('');
    setModalMsgs(prev => [...prev, { text: txt, isAI: false }]);
    setModalLoading(true);
    try {
      const history = modalMsgs.map(m => ({ role: m.isAI ? 'assistant' : 'user', content: m.text }));
      const res = await api('/ceo/chat', { method: 'POST', body: JSON.stringify({ message: txt, messages: [...history, { role: 'user', content: txt }], context: ceoContext }) });
      setModalMsgs(prev => [...prev, { text: res.reply, isAI: true }]);
    } catch {
      setModalMsgs(prev => [...prev, { text: 'Sorry, having trouble connecting. Try again?', isAI: true }]);
    } finally {
      setModalLoading(false);
    }
  };

  return (
    <div className="page active" style={{display:'flex'}}>
      <div className="ph">
        <div>
          <div className="pt">CEO — Muhammad Ali</div>
          <div className="ps">Your AI-powered CEO advisor with full company context</div>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:8}}>
          <button className="btn btn-gold btn-sm" onClick={() => setShowCeoModal(true)}>AI CEO Mode</button>
          <span className="tag tg" style={{fontSize:13,padding:'4px 12px'}}>
            <span style={{width:8,height:8,borderRadius:'50%',background:'var(--green)',display:'inline-block',marginRight:6}}></span>
            Available
          </span>
        </div>
      </div>

      <div className="grid2">
        <div className="card" style={{padding:0}}>
          <div className="chat-container" style={{height:520,borderRadius:'var(--r2)'}}>
            <div className="chat-header">
              <div className="ceo-chat-avatar">MA</div>
              <div>
                <div style={{fontWeight:600,fontSize:13}}>Muhammad Ali</div>
                <div style={{fontSize:11,color:'var(--text3)'}}>CEO · EcomSkyline & ThinkAIWorks</div>
              </div>
              <span className="tag ta" style={{marginLeft:'auto'}}>CEO Mode</span>
            </div>
            <div className="chat-messages" style={{paddingBottom:8}}>
              {msgs.map((m,i) => (
                <div key={i} className={`chat-msg ${m.isAI ? 'ai' : 'user'}`}>
                  {m.isAI && <div className="msg-who">Muhammad Ali</div>}
                  <div className="msg-bubble">{m.text}</div>
                </div>
              ))}
            </div>
            <div className="chat-input-area">
              <input
                className="chat-inp"
                placeholder="Ask the CEO anything..."
                value={inp}
                onChange={e => setInp(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') sendMsg(); }}
              />
              <button className="btn btn-gold btn-sm" onClick={() => sendMsg()}>Ask</button>
            </div>
          </div>
        </div>

        <div style={{display:'flex',flexDirection:'column',gap:18}}>
          <div className="card">
            <div className="card-title">Quick Prompts</div>
            <div style={{display:'flex',flexDirection:'column',gap:6}}>
              {quickPrompts.map((p,i) => (
                <button
                  key={i}
                  className="btn btn-ghost btn-sm"
                  style={{justifyContent:'flex-start',width:'100%',padding:'8px 12px'}}
                  onClick={() => handlePrompt(p)}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div className="card-sm metric" style={{borderColor:'var(--border2)'}}>
            <div className="card-title" style={{marginBottom:12}}>Dashboard Snapshot</div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,fontSize:12}}>
              <div><span style={{color:'var(--text3)'}}>Combined MRR </span><span style={{fontWeight:600,color:'var(--green)'}}>{combinedMrr}</span></div>
              <div><span style={{color:'var(--text3)'}}>Active Clients </span><span style={{fontWeight:600}}>{activeClients}</span></div>
              <div><span style={{color:'var(--text3)'}}>Team Members </span><span style={{fontWeight:600}}>{teamSize}</span></div>
              <div><span style={{color:'var(--text3)'}}>Open Leads </span><span style={{fontWeight:600,color:'var(--amber)'}}>{openLeads}</span></div>
              <div><span style={{color:'var(--text3)'}}>Growth MoM </span><span style={{fontWeight:600,color:'var(--green)'}}>{growthMoM}</span></div>
              <div><span style={{color:'var(--text3)'}}>Urgent Issues </span><span style={{fontWeight:600,color:'var(--red)'}}>{urgentIssues}</span></div>
            </div>
          </div>
        </div>
      </div>

      {showCeoModal && (
        <div className="modal-overlay" onClick={() => setShowCeoModal(false)}>
          <div className="modal" style={{maxWidth:600}} onClick={e => e.stopPropagation()}>
            <div className="modal-head">
              <div className="modal-title">CEO Mode — AI Muhammad Ali</div>
              <button className="modal-close" onClick={() => setShowCeoModal(false)}>✕</button>
            </div>
            <div className="chat-container" style={{height:400,borderRadius:'var(--r)'}}>
              <div className="chat-messages" style={{paddingBottom:8}}>
                {modalMsgs.map((m,i) => (
                  <div key={i} className={`chat-msg ${m.isAI ? 'ai' : 'user'}`}>
                    {m.isAI && <div className="msg-who">Muhammad Ali</div>}
                    <div className="msg-bubble">{m.text}</div>
                  </div>
                ))}
                <div ref={modalEnd} />
              </div>
              <div className="chat-input-area">
                <input className="chat-inp" placeholder="Ask Muhammad Ali anything..." value={modalInp} onChange={e => setModalInp(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') sendModalMsg(); }} />
                <button className="btn btn-gold btn-sm" onClick={sendModalMsg} disabled={modalLoading}>{modalLoading ? '...' : 'Ask'}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
