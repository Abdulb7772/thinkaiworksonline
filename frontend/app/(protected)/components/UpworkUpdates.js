'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { api } from '@/lib/config';
import { SkeletonTable } from './Skeleton';

const COLS = [
  { key: 'platform', label: 'Platform' },
  { key: 'profile', label: 'Profile' },
  { key: 'niche', label: 'Niche' },
  { key: 'clientName', label: 'Client Name' },
  { key: 'description', label: 'Description' },
  { key: 'pInvite', label: 'P/Invite' },
  { key: 'doi', label: 'DOI' },
  { key: 'status', label: 'Status (V/I)' },
  { key: 'fu1', label: 'FU1' },
  { key: 'fu2', label: 'FU2 Today' },
  { key: 'response', label: 'Response' },
];
const cellStyle = { padding: '6px 10px', background: 'transparent', border: 'none', color: 'var(--text)', fontFamily: 'var(--font-body)', fontSize: 13, outline: 'none', width: '100%', boxSizing: 'border-box' };

function Row({ entry, onSave, onDelete }) {
  const [values, setValues] = useState(entry);
  const dirty = useRef(false);

  const set = (key) => (e) => {
    dirty.current = true;
    setValues((v) => ({ ...v, [key]: e.target.value }));
  };

  const save = async () => {
    if (!dirty.current) return;
    dirty.current = false;
    await onSave(values);
  };

  return (
    <tr style={{ borderBottom: '1px solid var(--border2)' }}>
      {COLS.map((c) =>
        c.key === 'status' ? (
          <td key={c.key} style={{ padding: '2px 8px', borderRight: '1px solid var(--border)', width: 70, textAlign: 'center' }}>
            <button
              type="button"
              onClick={() => { dirty.current = true; setValues((v) => ({ ...v, status: v.status === 'V' ? 'I' : 'V' })); setTimeout(save, 0); }}
              style={{
                width: 34, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer',
                fontSize: 11, fontWeight: 700, fontFamily: 'var(--font-mono)',
                color: values.status === 'V' ? 'var(--green)' : 'var(--red)',
                background: values.status === 'V' ? 'rgba(34,212,122,0.12)' : 'rgba(255,79,109,0.12)',
              }}
              title="Toggle V/I"
            >
              {values.status === 'V' ? 'V' : 'I'}
            </button>
          </td>
        ) : (
          <td key={c.key} style={{ padding: '2px 8px', borderRight: '1px solid var(--border)' }}>
            <input value={values[c.key] ?? ''} onChange={set(c.key)} onBlur={save} placeholder="—" style={cellStyle} />
          </td>
        )
      )}
      <td style={{ padding: '2px 8px', textAlign: 'center' }}>
        <button
          type="button"
          onClick={() => onDelete(values)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text3)', fontSize: 14 }}
          title="Delete row"
        >
          ✕
        </button>
      </td>
    </tr>
  );
}

export default function UpworkUpdates({ onToast }) {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);

  const fetchEntries = useCallback(async () => {
    try {
      const data = await api('/updates');
      setEntries(data || []);
    } catch {
      onToast?.('Failed to load updates', 'error');
    } finally {
      setLoading(false);
    }
  }, [onToast]);

  useEffect(() => { fetchEntries(); }, [fetchEntries]);

  const saveRow = async (values) => {
    try {
      await api(`/updates/${values._id}`, { method: 'PUT', body: JSON.stringify(values) });
    } catch (err) {
      onToast?.(err.message || 'Failed to save row', 'error');
    }
  };

  const addRow = async () => {
    setSavingId('new');
    try {
      const entry = await api('/updates', { method: 'POST' });
      setEntries((prev) => [...prev, entry]);
      onToast?.('Row added', 'success');
    } catch (err) {
      onToast?.(err.message || 'Failed to add row', 'error');
    } finally {
      setSavingId(null);
    }
  };

  const deleteRow = async (values) => {
    if (!window.confirm('Delete this row?')) return;
    try {
      await api(`/updates/${values._id}`, { method: 'DELETE' });
      setEntries((prev) => prev.filter((e) => e._id !== values._id));
      onToast?.('Row deleted', 'success');
    } catch (err) {
      onToast?.(err.message || 'Failed to delete row', 'error');
    }
  };

  const colsWithStatus = COLS;

  return (
    <div className="page active" style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
      <div className="ph">
        <div>
          <div className="pt">Upwork Updates</div>
          <div className="ps">Daily outreach tracking — follow-ups and client responses</div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span className="tag tb">{entries.length} rows</span>
          <button className="btn btn-es" onClick={addRow} disabled={savingId === 'new'}>
            {savingId === 'new' ? 'Adding...' : '+ Add Row'}
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '20px 0' }}><SkeletonTable rows={6} /></div>
      ) : (
        <div className="card" style={{ padding: 0 }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg3)' }}>
                  {colsWithStatus.map((c) => (
                    <th key={c.key} style={{ padding: '10px 8px', textAlign: 'left', fontWeight: 600, color: 'var(--text3)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.5px', borderRight: '1px solid var(--border)', whiteSpace: 'nowrap' }}>
                      {c.label}
                    </th>
                  ))}
                  <th style={{ padding: '10px 8px', width: 40 }} />
                </tr>
              </thead>
              <tbody>
                {entries.map((e) => (
                  <Row key={e._id} entry={e} onSave={saveRow} onDelete={deleteRow} />
                ))}
              </tbody>
            </table>
            {entries.length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text3)', fontSize: 13 }}>
                No rows yet — click “Add Row” to start tracking
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}