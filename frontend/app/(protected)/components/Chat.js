'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { api } from '@/lib/config';
import { SkeletonTable } from './Skeleton';

export default function Chat({ onToast }) {
  const [conversations, setConversations] = useState([]);
  const [activeUser, setActiveUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [role, setRole] = useState('admin');
  const [currentUser, setCurrentUser] = useState(null);
  const bottomRef = useRef(null);
  const activeUserIdRef = useRef(null);

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem('user') || '{}');
    setRole(u.role);
    setCurrentUser({ ...u, _id: u.id });
  }, []);

  const fetchConversations = useCallback(async () => {
    try {
      const data = await api('/chat/');
      setConversations(data.filter(c => c.lastMessage || c.user));
    } catch {} finally {
      setLoading(false);
    }
  }, []);

  const fetchMessages = useCallback(async (userId) => {
    if (!userId) return;
    try {
      const data = await api(`/chat/${userId}`);
      setMessages(data);
    } catch {}
  }, []);

  useEffect(() => {
    fetchConversations();
    const interval = setInterval(fetchConversations, 10000);
    return () => clearInterval(interval);
  }, [fetchConversations]);

  useEffect(() => {
    activeUserIdRef.current = activeUser?._id;
  }, [activeUser]);

  useEffect(() => {
    if (!activeUser) return;
    fetchMessages(activeUser._id);
    const interval = setInterval(() => {
      fetchMessages(activeUserIdRef.current);
    }, 5000);
    return () => clearInterval(interval);
  }, [activeUser, fetchMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async (e) => {
    e.preventDefault();
    if (!text.trim() || !activeUser) return;
    const msgText = text.trim();
    setText('');

    const optimistic = {
      _id: 'opt-' + Date.now(),
      sender: { _id: currentUser._id, name: currentUser.name, email: currentUser.email },
      receiver: { _id: activeUser._id, name: activeUser.name, email: activeUser.email },
      message: msgText,
      createdAt: new Date().toISOString(),
    };
    setMessages(prev => [...prev, optimistic]);

    try {
      await api('/chat/', { method: 'POST', body: JSON.stringify({ receiver: activeUser._id, message: msgText }) });
      fetchConversations();
      fetchMessages(activeUser._id);
    } catch (err) {
      onToast?.(err.message, 'error');
      setMessages(prev => prev.filter(m => m._id !== optimistic._id));
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
            {loading ? (
              <div style={{ padding: 16 }}><SkeletonTable rows={4} /></div>
            ) : conversations.length === 0 && (
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
                {messages.map(msg => {
                  const isMine = msg.sender?._id === currentUser?._id || msg.sender?.id === currentUser?.id;
                  return (
                    <div key={msg._id} style={{ display: 'flex', justifyContent: isMine ? 'flex-end' : 'flex-start' }}>
                      <div style={{
                        maxWidth: '75%', padding: '10px 14px', borderRadius: 12, fontSize: 14, lineHeight: 1.4,
                        background: isMine ? 'var(--accent)' : 'var(--bg2)',
                        color: isMine ? '#fff' : 'var(--text1)',
                        borderBottomRightRadius: isMine ? 4 : 12,
                        borderBottomLeftRadius: isMine ? 12 : 4,
                      }}>
                        <div>{msg.message}</div>
                        <div style={{ fontSize: 11, marginTop: 4, opacity: 0.6 }}>
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  );
                })}
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
