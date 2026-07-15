'use client';

import { useState, useRef, useEffect } from 'react';
import { api } from '@/lib/config';
import CreateTicket from './CreateTicket';

export default function Support({ company, onToast, data, onRefresh }) {
  const [showTicket, setShowTicket] = useState(false);
  const tickets = data?.tickets || [];
  const [msgs, setMsgs] = useState([
    { text: "Hi! I'm the ThinkAIWorks support assistant. How can I help you today?", isAI: true },
  ]);
  const [inp, setInp] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEnd = useRef(null);

  useEffect(() => { chatEnd.current?.scrollIntoView({ behavior:'smooth' }); }, [msgs]);

  const openCount = tickets.filter(t => t.status === 'Open').length;

  const metrics = [
    { label: 'Open Tickets', val: String(openCount), delta: openCount > 0 ? 'Needs attention' : 'All clear', cls: openCount > 0 ? 'down' : 'up', co: '' },
    { label: 'AI Resolved', val: '28', delta: 'This week', cls: 'up', co: '' },
    { label: 'Avg Response', val: '4m', delta: 'AI-powered', cls: 'up', co: '' },
    { label: 'CSAT Score', val: '4.7', delta: '↑ /5.0', cls: 'up', co: '' },
  ];

  const sendMsg = async () => {
    if (!inp.trim() || loading) return;
    const txt = inp;
    setInp('');
    setMsgs(prev => [...prev, { text: txt, isAI: false }]);
    setLoading(true);
    try {
      const res = await api('/support/chat', { method: 'POST', body: JSON.stringify({ message: txt }) });
      setMsgs(prev => [...prev, { text: res.reply, isAI: true }]);
    } catch {
      setMsgs(prev => [...prev, { text: "Sorry, I'm having trouble connecting. Please try again.", isAI: true }]);
    } finally {
      setLoading(false);
    }
  };

  const priorityIcon = (p) => p === 'High' ? '🔴' : p === 'Medium' ? '🟡' : '🔵';

  return (
    <div className="page active" style={{display:'flex',flexDirection:'column',gap:22}}>
      <div className="ph">
        <div>
          <div className="pt">Customer Support AI</div>
          <div className="ps">AI-first triage · Auto-respond · Escalation management</div>
        </div>
        <div style={{display:'flex',gap:8}}>
          <button className="btn btn-ghost btn-sm" onClick={() => setShowTicket(true)}>+ New Ticket</button>
          <span className="tag tg" style={{fontSize:13,padding:'7px 14px'}}>{'●'} AI Online</span>
        </div>
      </div>
      <div className="grid4">
        {metrics.map((m,i) => (
          <div key={i} className={`metric ${m.co}`}>
            <div className="m-label">{m.label}</div>
            <div className="m-val" style={m.label === 'Open Tickets' ? {color: openCount > 0 ? 'var(--red)' : 'var(--green)'} : {}}>{m.val}</div>
            <div className={`m-delta ${m.cls}`}>{m.delta}</div>
          </div>
        ))}
      </div>
      <div className="grid2">
        <div className="card">
          <div className="card-title">Open Tickets</div>
          {tickets.length === 0 ? (
            <div style={{textAlign:'center',padding:'20px 0',color:'var(--text3)',fontSize:13}}>No tickets</div>
          ) : (
            <div>
              {tickets.map((t,i) => (
                <div key={i} className="alert-row">
                  <div className="alert-icon" style={{background:t.priority==='High'?'rgba(255,79,109,.1)':t.priority==='Medium'?'rgba(255,170,44,.1)':'rgba(74,158,255,.1)'}}>{priorityIcon(t.priority)}</div>
                  <div style={{flex:1}}>
                    <div style={{display:'flex',alignItems:'center',gap:8}}>
                      <span style={{fontWeight:600,fontSize:13}}>{t.client}</span>
                      <span style={{fontFamily:'var(--font-mono)',fontSize:10,color:'var(--text3)'}}>{t.ticketId}</span>
                      <span className={`tag ${t.co==='es'?'tes':'ttai'}`}>{t.co === 'es' ? 'ES' : 'TAI'}</span>
                    </div>
                    <div style={{fontSize:12,color:'var(--text2)',marginTop:2}}>{t.issue}</div>
                  </div>
                  <div style={{display:'flex',flexDirection:'column',gap:4,alignItems:'flex-end'}}>
                    <span className={`tag ${t.status==='Open'?'tr':'ta'}`}>{t.status}</span>
                    <button className="btn btn-ghost btn-sm" onClick={() => onToast(`AI drafted response for ${t.ticketId} · Ready to send ✓`,'success')}>AI Reply</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="card">
          <div className="card-title">AI Support Chat</div>
          <div className="chat-container" style={{height:340}}>
            <div className="chat-header" style={{background:'var(--surface2)'}}>
              <div style={{width:34,height:34,borderRadius:'50%',background:'rgba(0,229,200,.15)',border:'1px solid rgba(0,229,200,.3)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:14}}>{'🤖'}</div>
              <div><div style={{fontWeight:600,fontSize:13}}>ThinkAIWorks Support AI</div><div style={{fontSize:11,color:'var(--text3)'}}>Powered by AI · 24/7</div></div>
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
              <button className="btn btn-es btn-sm" onClick={sendMsg} disabled={loading}>{loading ? '...' : 'Send'}</button>
            </div>
            <div ref={chatEnd} />
          </div>
        </div>
      </div>

      {showTicket && (
        <CreateTicket
          onClose={() => setShowTicket(false)}
          onSaved={onRefresh}
          onToast={onToast}
        />
      )}
    </div>
  );
}
