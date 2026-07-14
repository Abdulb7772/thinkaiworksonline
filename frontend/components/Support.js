'use client';

import { useState } from 'react';

const tickets = [
  {id:'#T-441',client:'Ali Hassan',issue:'Invoice discrepancy — charged twice',priority:'High',co:'es',status:'Open'},
  {id:'#T-442',client:'Emma R.',issue:'Project deliverable delayed by 2 days',priority:'High',co:'es',status:'Open'},
  {id:'#T-443',client:'Jennifer Lee',issue:'AI chatbot not responding on weekends',priority:'Medium',co:'tai',status:'In Progress'},
  {id:'#T-444',client:'Mark Hudson',issue:'Need additional report format',priority:'Low',co:'es',status:'Open'},
];

const supportReplies = [
  "I understand your concern. Let me check your account details right now and get this resolved within the next 2 hours.",
  "Thanks for reaching out. This is a known issue on our end — our dev team has a fix deploying today. I'll personally follow up once it's live.",
  "I've escalated this to our senior team. You'll receive a detailed update within 1 business hour. We apologize for the inconvenience.",
  "Great question! For this type of request, the best approach is to send us your preferences and we'll customize accordingly within 24 hours.",
];

export default function Support({ company, onToast }) {
  const [msgs, setMsgs] = useState([
    { text: "Hi! I'm the EcomSkyline support assistant. How can I help you today?", isAI: true },
  ]);
  const [inp, setInp] = useState('');
  const [supportIdx, setSupportIdx] = useState(0);
  const [loading, setLoading] = useState(false);

  const metrics = [
    { label: 'Open Tickets', val: '4', delta: '2 urgent', cls: 'down', co: '' },
    { label: 'AI Resolved', val: '28', delta: 'This week', cls: 'up', co: '' },
    { label: 'Avg Response', val: '4m', delta: '\u2193 vs 2hr manual', cls: 'up', co: '' },
    { label: 'CSAT Score', val: '4.7', delta: '\u2191 /5.0', cls: 'up', co: '' },
  ];

  const sendMsg = () => {
    if (!inp.trim() || loading) return;
    const txt = inp;
    setInp('');
    setMsgs(prev => [...prev, { text: txt, isAI: false }]);
    setLoading(true);
    setTimeout(() => {
      setMsgs(prev => [...prev, { text: supportReplies[supportIdx % supportReplies.length], isAI: true }]);
      setSupportIdx(prev => prev + 1);
      setLoading(false);
    }, 900);
  };

  const priorityIcon = (p) => p === 'High' ? '\uD83D\uDD34' : p === 'Medium' ? '\uD83D\uDFE1' : '\uD83D\uDD35';

  return (
    <div className="page active" style={{display:'flex',flexDirection:'column',gap:22}}>
      <div className="ph">
        <div>
          <div className="pt">Customer Support AI</div>
          <div className="ps">AI-first triage · Auto-respond · Escalation management</div>
        </div>
        <span className="tag tg" style={{fontSize:13,padding:'7px 14px'}}>{'\u25CF'} AI Online</span>
      </div>
      <div className="grid4">
        {metrics.map((m,i) => (
          <div key={i} className={`metric ${m.co}`}>
            <div className="m-label">{m.label}</div>
            <div className="m-val" style={m.label === 'Open Tickets' ? {color:'var(--red)'} : {}}>{m.val}</div>
            <div className={`m-delta ${m.cls}`}>{m.delta}</div>
          </div>
        ))}
      </div>
      <div className="grid2">
        <div className="card">
          <div className="card-title">Open Tickets</div>
          <div>
            {tickets.map((t,i) => (
              <div key={i} className="alert-row">
                <div className="alert-icon" style={{background:t.priority==='High'?'rgba(255,79,109,.1)':t.priority==='Medium'?'rgba(255,170,44,.1)':'rgba(74,158,255,.1)'}}>{priorityIcon(t.priority)}</div>
                <div style={{flex:1}}>
                  <div style={{display:'flex',alignItems:'center',gap:8}}>
                    <span style={{fontWeight:600,fontSize:13}}>{t.client}</span>
                    <span style={{fontFamily:'var(--font-mono)',fontSize:10,color:'var(--text3)'}}>{t.id}</span>
                    <span className={`tag ${t.co==='es'?'tes':'ttai'}`}>{t.co.toUpperCase()}</span>
                  </div>
                  <div style={{fontSize:12,color:'var(--text2)',marginTop:2}}>{t.issue}</div>
                </div>
                <div style={{display:'flex',flexDirection:'column',gap:4,alignItems:'flex-end'}}>
                  <span className={`tag ${t.status==='Open'?'tr':'ta'}`}>{t.status}</span>
                  <button className="btn btn-ghost btn-sm" onClick={() => onToast(`AI drafted response for ${t.id} · Ready to send \u2713`,'success')}>AI Reply</button>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="card">
          <div className="card-title">AI Support Chat</div>
          <div className="chat-container" style={{height:340}}>
            <div className="chat-header" style={{background:'var(--surface2)'}}>
              <div style={{width:34,height:34,borderRadius:'50%',background:'rgba(0,229,200,.15)',border:'1px solid rgba(0,229,200,.3)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:14}}>{'\uD83E\uDD16'}</div>
              <div><div style={{fontWeight:600,fontSize:13}}>EcomSkyline Support AI</div><div style={{fontSize:11,color:'var(--text3)'}}>Powered by AI · 24/7</div></div>
              <span className="tag tg" style={{marginLeft:'auto'}}>Online</span>
            </div>
            <div className="chat-messages" id="support-chat-msgs">
              {msgs.map((m,i) => (
                <div key={i} className={`chat-msg ${m.isAI ? 'ai' : 'user'}`}>
                  {m.isAI && <div className="msg-who">Support AI</div>}
                  <div className="msg-bubble" style={m.isAI ? {background:'var(--surface2)'} : {}}>{m.text}</div>
                </div>
              ))}
            </div>
            <div className="chat-input-area">
              <input className="chat-inp" placeholder="Type a support message..." value={inp} onChange={e => setInp(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') sendMsg(); }} />
              <button className="btn btn-es btn-sm" onClick={sendMsg}>Send</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
