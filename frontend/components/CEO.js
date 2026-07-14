'use client';

import { useState, useRef, useCallback } from 'react';

const ceoReplies = {
  'What is our biggest growth opportunity right now?': 'Shukriya for asking. Looking at both companies, ThinkAIWorks has the highest upside right now. Productizing the AI chatbot into a SaaS model could add $8–12k MRR within 90 days with existing infrastructure. For EcomSkyline, tiered retainer packages will stabilize revenue and make scaling predictable. My recommendation: prioritize both this month.',
  'How are both companies performing vs last month?': 'Combined MRR is $28,400 — up 22% month-over-month. EcomSkyline is driving 64% of revenue at $18,200. ThinkAIWorks grew 31% but from a smaller base at $10,200. Conversion rates are improving (38%, up 4%). The weak spot is churn at 6% — we need to improve onboarding and client success, particularly Ayesha and Sana\'s workflows.',
  'Which employees need my attention?': 'Kamran R. in Content has the lowest AI score (61) and his attendance dropped to 82%. I recommend a 1-on-1 this week. On the positive side, Sarah K. is exceptional at 94 — consider giving her a lead role in the UK expansion. Zara T. at ThinkAIWorks is our best AI asset and should be involved in the SaaS product build.',
  'What should we prioritize this week?': 'Three priorities: (1) Close David Park — he is a $5,200 client with 91% close probability, Sarah should reach out today. (2) Address the 2 urgent support tickets for Ali Hassan and Emma R. before they escalate. (3) Have a strategy session on the ThinkAIWorks SaaS pricing model. These three actions have the highest ROI this week.',
  'How can we reduce churn?': 'Our churn is 6%, which is manageable but we can get it to 3%. The main issues are: slow onboarding (clients lose confidence in week 1), inconsistent updates, and unclear deliverables. I suggest implementing weekly automated progress reports for every active client, an onboarding checklist within 48 hours of signup, and a dedicated client success check-in at day 14.',
  'What marketing should we double down on?': 'Upwork outreach is giving us the best ROI at the lowest cost. Our open rate of 44% is double the industry average. Double the Upwork Promoted budget and test a LinkedIn campaign targeting Amazon brand owners for EcomSkyline. For ThinkAIWorks, an AI ROI calculator tool on the website will convert cold traffic. Don\'t increase Google Ads yet — the conversion tracking needs improvement first.',
};

const defaultReplies = [
  'That is a great strategic question. Based on current company data: EcomSkyline has 11 active clients generating $18,200 MRR, and ThinkAIWorks has 7 active clients at $10,200 MRR. Combined growth is 22% month over month. What specific aspect would you like to dig into?',
  'Looking at the numbers, I see clear opportunity in both companies. The key lever right now is converting our 47 open leads — our pipeline value is $84k. If we can move even 40% of that to close, we\'re looking at a very strong quarter.',
  'From a CEO perspective: our team is performing well overall, with an average score of 82. The area needing attention is client retention and our content pipeline. Would you like me to elaborate on either?',
];

export default function CEO({ company, onToast }) {
  const [msgs, setMsgs] = useState([
    { text: "Assalamu Alaikum! I'm Muhammad Ali, CEO of EcomSkyline and ThinkAIWorks. I have full visibility into both companies — revenue, team performance, pipeline, marketing, and growth strategy. What would you like to discuss today?", isAI: true },
  ]);
  const [inp, setInp] = useState('');
  const defRef = useRef(0);

  const sendMsg = useCallback((text) => {
    const msg = text || inp;
    if (!msg.trim()) return;
    setInp('');
    setMsgs(prev => [...prev, { text: msg, isAI: false }]);
    setTimeout(() => {
      const reply = ceoReplies[msg] || defaultReplies[defRef.current % defaultReplies.length];
      defRef.current += 1;
      setMsgs(prev => [...prev, { text: reply, isAI: true }]);
    }, 1100);
  }, [inp]);

  const handlePrompt = (prompt) => {
    setInp(prompt);
    sendMsg(prompt);
  };

  const quickPrompts = [
    'What is our biggest growth opportunity right now?',
    'How are both companies performing vs last month?',
    'Which employees need my attention?',
    'What should we prioritize this week?',
    'How can we reduce churn?',
    'What marketing should we double down on?',
  ];

  return (
    <div className="page active" style={{display:'flex'}}>
      <div className="ph">
        <div>
          <div className="pt">CEO — Muhammad Ali</div>
          <div className="ps">Your AI-powered CEO advisor with full company context</div>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:8}}>
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
              <div><span style={{color:'var(--text3)'}}>Combined MRR </span><span style={{fontWeight:600,color:'var(--green)'}}>$28,400</span></div>
              <div><span style={{color:'var(--text3)'}}>Active Clients </span><span style={{fontWeight:600}}>18</span></div>
              <div><span style={{color:'var(--text3)'}}>Team Members </span><span style={{fontWeight:600}}>11</span></div>
              <div><span style={{color:'var(--text3)'}}>Open Leads </span><span style={{fontWeight:600,color:'var(--amber)'}}>47</span></div>
              <div><span style={{color:'var(--text3)'}}>Growth MoM </span><span style={{fontWeight:600,color:'var(--green)'}}>+22%</span></div>
              <div><span style={{color:'var(--text3)'}}>Urgent Issues </span><span style={{fontWeight:600,color:'var(--red)'}}>2</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
