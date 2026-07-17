'use client';

import { useState, useEffect, useRef } from 'react';
import { api } from '@/lib/config';

export default function Chat({ onToast }) {
  const [conversations, setConversations] = useState([]);
  const [activeUser, setActiveUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [role, setRole] = useState('admin');
  const [currentUser, setCurrentUser] = useState(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem('user') || '{}');
    setRole(u.role);
    setCurrentUser(u);
  }, []);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const data = await api('/chat/');
        setConversations(data.filter(c => c.lastMessage || c.user));
      } catch {}
    };
    fetchConversations();
    const interval = setInterval(fetchConversations, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!activeUser) return;
    const fetchMessages = async () => {
      try {
        const data = await api(`/chat/${activeUser._id}`);
        setMessages(data);
      } catch {}
    };
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [activeUser]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async (e) => {
    e.preventDefault();
    if (!text.trim() || !activeUser) return;
    try {
      await api('/chat/', { method: 'POST', body: JSON.stringify({ receiver: activeUser._id, message: text.trim() }) });
      setText('');
      const data = await api(`/chat/${activeUser._id}`);
      setMessages(data);
    } catch (err) {
      onToast?.(err.message, 'error');
    }
  };

  return (
    <div className="page active" style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
      <div className="ph">
        <div>
          <div className="pt">Chat</div>
          <div className="ps">{role === 'admin' ? 'Chat with employees about daily tasks' : 'Chat with admin about your tasks'}</div>
        </div>
      </div>

      <div className="card" style={{ display: 'flex', gap: 0, padding: 0, overflow: 'hidden', minHeight: 400 }}>
        <div style={{ width: 260, borderRight: '1px solid var(--border)', flexShrink: 0 }}>
          <div style={{ padding: '14px 16px', fontWeight: 600, borderBottom: '1px solid var(--border)', fontSize: 13, color: 'var(--text2)' }}>CONTACTS</div>
          <div style={{ overflow: 'auto', maxHeight: 360 }}>
            {conversations.length === 0 && (
              <div style={{ padding: 24, textAlign: 'center', color: 'var(--text3)', fontSize: 13 }}>No conversations yet</div>
            )}
            {conversations.map(c => (
              <div
                key={c.user._id}
                onClick={() => setActiveUser(c.user)}
                style={{
                  padding: '12px 16px', cursor: 'pointer', borderBottom: '1px solid var(--border)',
                  background: activeUser?._id === c.user._id ? 'var(--accent-bg)' : 'transparent',
                }}
              >
                <div style={{ fontWeight: 500, color: 'var(--text1)', fontSize: 14 }}>{c.user.name}</div>
                <div style={{ fontSize: 12, color: 'var(--text3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {c.lastMessage ? c.lastMessage.message : 'No messages yet'}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {!activeUser ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, color: 'var(--text3)' }}>
              Select a contact to start chatting
            </div>
          ) : (
            <>
              <div style={{ padding: '14px 18px', fontWeight: 600, borderBottom: '1px solid var(--border)', fontSize: 14 }}>
                {activeUser.name}
              </div>
              <div style={{ flex: 1, overflow: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {messages.length === 0 && (
                  <div style={{ textAlign: 'center', color: 'var(--text3)', padding: 40 }}>No messages yet. Say hello!</div>
                )}
                {messages.map(msg => (
                  <div key={msg._id} style={{ display: 'flex', justifyContent: msg.sender?._id === currentUser?._id ? 'flex-end' : 'flex-start' }}>
                    <div style={{
                      maxWidth: '75%', padding: '10px 14px', borderRadius: 12, fontSize: 14, lineHeight: 1.4,
                      background: msg.sender?._id === currentUser?._id ? 'var(--accent)' : 'var(--bg2)',
                      color: msg.sender?._id === currentUser?._id ? '#fff' : 'var(--text1)',
                      borderBottomRightRadius: msg.sender?._id === currentUser?._id ? 4 : 12,
                      borderBottomLeftRadius: msg.sender?._id !== currentUser?._id ? 4 : 12,
                    }}>
                      <div>{msg.message}</div>
                      <div style={{ fontSize: 11, marginTop: 4, opacity: 0.6 }}>
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>
              <form onSubmit={send} style={{ display: 'flex', gap: 8, padding: '12px 16px', borderTop: '1px solid var(--border)' }}>
                <input
                  type="text"
                  placeholder="Type a message..."
                  value={text}
                  onChange={e => setText(e.target.value)}
                  style={{ flex: 1 }}
                />
                <button type="submit" className="btn btn-tai" disabled={!text.trim()}>Send</button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
