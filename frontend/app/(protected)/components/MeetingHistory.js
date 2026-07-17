'use client';

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/config';

export default function MeetingHistory({ company, onToast }) {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = useCallback(async () => {
    try {
      const data = await api('/meetings/history');
      setMeetings(data || []);
    } catch {
      onToast?.('Failed to load meeting history', 'error');
    } finally {
      setLoading(false);
    }
  }, [onToast]);

  useEffect(() => { fetchHistory(); }, [fetchHistory]);

  const formatDate = (d) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' });
  };

  return (
    <div className="page active" style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
      <div className="ph">
        <div>
          <div className="pt">Meeting History</div>
          <div className="ps">Completed and cancelled meetings</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <span className="tag tb">{meetings.length} total</span>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text3)', fontSize: 13 }}>Loading...</div>
      ) : meetings.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '40px 0' }}>
          <div style={{ color: 'var(--text3)', fontSize: 13 }}>No meeting history yet</div>
        </div>
      ) : (
        <div className="card" style={{ padding: 0 }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text3)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600 }}>Title</th>
                  <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600 }}>Scheduled</th>
                  <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600 }}>Status</th>
                  <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600 }}>Type</th>
                  <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600 }}>Creator</th>
                </tr>
              </thead>
              <tbody>
                {meetings.map((m, i) => {
                  const isCancelled = !!m.cancelledAt;
                  return (
                    <tr key={m._id || i} style={{ borderBottom: '1px solid var(--border2)' }}>
                      <td style={{ padding: '10px 14px', fontWeight: 600 }}>{m.title}</td>
                      <td style={{ padding: '10px 14px', color: 'var(--text2)' }}>{formatDate(m.datetime)}</td>
                      <td style={{ padding: '10px 14px' }}>
                        {isCancelled ? (
                          <span style={{ color: 'var(--red)', fontWeight: 600, fontSize: 12 }}>
                            ✕ Cancelled
                          </span>
                        ) : (
                          <span style={{ color: 'var(--green)', fontWeight: 600, fontSize: 12 }}>
                            ✓ Completed
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '10px 14px', color: 'var(--text2)' }}>{m.type || '—'}</td>
                      <td style={{ padding: '10px 14px', color: 'var(--text2)' }}>{m.creatorEmail || '—'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
