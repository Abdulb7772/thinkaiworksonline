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
  { key: 'date', label: 'Date' },
  { key: 'status', label: 'Status' },
  { key: 'fu1', label: 'FU1' },
  { key: 'fu2', label: 'FU2 Today' },
  { key: 'response', label: 'Response' },
];

const SPECIAL = { platform: 'select', pInvite: 'select', date: 'date' };
const TEXT_COLS = COLS.filter((c) => !SPECIAL[c.key]);
const MIN_WIDTH = { platform: 110, pInvite: 70, date: 150 };
const cellStyle = { padding: '6px 10px', background: 'transparent', border: 'none', color: 'var(--text)', fontFamily: 'var(--font-body)', fontSize: 13, outline: 'none', boxSizing: 'border-box' };
const controlStyle = {...cellStyle, background: 'var(--bg3)', border: '1px solid var(--border2)', borderRadius: 'var(--r)', padding: '6px 8px', colorScheme: 'dark' };
const emptyForm = () => Object.fromEntries(COLS.map((c) => [c.key, SPECIAL[c.key] === 'select' ? (c.key === 'platform' ? 'Upwork' : 'P') : c.key === 'date' ? todayStr() : '']));
const withDefaults = (row) => {
  const copy = { ...row };
  COLS.forEach((c) => { if (!String(copy[c.key] ?? '').trim()) copy[c.key] = 'N/A'; });
  return copy;
};

function todayStr() {
  const d = new Date();
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

function EntryModal({ initial, onClose, onSave }) {
  const [form, setForm] = useState(initial);
  const [busy, setBusy] = useState(false);
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await onSave(form);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={onClose}>
      <div className="card" style={{ maxWidth: 620, width: '92%', maxHeight: '88vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
        <div className="card-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>{initial._id ? 'Edit Update' : 'Add Update'}</span>
          <button type="button" className="btn btn-sm btn-ghost" onClick={onClose} style={{ color: 'var(--text3)' }}>✕</button>
        </div>
        <form onSubmit={submit}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginTop: 16 }}>
            <div className="form-field">
              <label>Platform</label>
              <select value={form.platform || 'Upwork'} onChange={(e) => setForm((f) => ({ ...f, platform: e.target.value }))}>
                <option>Upwork</option>
                <option>Fiverr</option>
              </select>
            </div>
            <div className="form-field">
              <label>P/Invite</label>
              <select value={form.pInvite || 'P'} onChange={(e) => setForm((f) => ({ ...f, pInvite: e.target.value }))}>
                <option>P</option>
                <option>I</option>
              </select>
            </div>
            <div className="form-field">
              <label>Date</label>
              <input type="date" value={form.date || ''} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} />
            </div>
            {TEXT_COLS.map((c) => (
              <div className="form-field" key={c.key}>
                <label>{c.label}</label>
                <input type="text" value={form[c.key] ?? ''} onChange={set(c.key)} />
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 20, justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-es" disabled={busy}>{busy ? 'Saving...' : 'Save'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Row({ entry, onSave, onDelete, onEdit, onAddBelow, showAdd, colWidths }) {
  const [values, setValues] = useState(entry);
  const dirty = useRef(false);

  const set = (key) => (e) => {
    dirty.current = true;
    setValues((v) => ({ ...v, [key]: e.target.value }));
  };

  const save = async (next) => {
    if (next && next !== values) dirty.current = false;
    else if (!dirty.current) return;
    dirty.current = false;
    await onSave(withDefaults(next || values));
  };

  const commitControl = (key, val) => {
    const next = { ...values, [key]: val };
    setValues(next);
    save(next);
  };

  const inputStyle = (key) => ({ ...cellStyle, width: (colWidths[key] ?? 60) + 26 + 'px' });

  return (
    <>
      <tr>
        {COLS.map((c) => {
          if (c.key === 'platform' || c.key === 'pInvite') {
            const options = c.key === 'platform' ? ['Upwork', 'Fiverr'] : ['P', 'I'];
            return (
              <td key={c.key} style={{ padding: '2px 8px', borderRight: '1px solid var(--border)' }}>
                <select value={values[c.key] || options[0]} onChange={(e) => commitControl(c.key, e.target.value)} style={controlStyle}>
                  {options.map((o) => <option key={o}>{o}</option>)}
                </select>
              </td>
            );
          }
          if (c.key === 'date') {
            return (
              <td key={c.key} style={{ padding: '2px 8px', borderRight: '1px solid var(--border)' }}>
                <input type="date" value={values[c.key] || ''} onChange={(e) => commitControl(c.key, e.target.value)} style={{ ...controlStyle, width: '150px' }} />
              </td>
            );
          }
          return (
            <td
              key={c.key}
              style={{ padding: '2px 8px', borderRight: '1px solid var(--border)', cursor: 'text' }}
              onClick={(e) => { if (e.target !== e.currentTarget) return; e.currentTarget.querySelector('input')?.focus(); }}
            >
              <input value={values[c.key] ?? ''} onChange={set(c.key)} onBlur={() => save()} placeholder="—" style={inputStyle(c.key)} />
            </td>
          );
        })}
        <td style={{ padding: '2px 8px', whiteSpace: 'nowrap' }}>
          <div style={{ display: 'flex', gap: 4 }}>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => onEdit(values)}>Edit</button>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => onDelete(values)} style={{ color: 'var(--red)' }}>Delete</button>
          </div>
        </td>
      </tr>
      {showAdd && (
        <tr>
          <td colSpan={13} style={{ padding: 0, borderBottom: '1px solid var(--border2)' }}>
            <button
              type="button"
              onClick={() => onAddBelow(entry._id)}
              style={{
                width: '100%', background: 'transparent', border: 'none', padding: '3px 0', cursor: 'pointer',
                color: 'var(--text3)', fontSize: 15, fontWeight: 700, lineHeight: 1, transition: 'color .15s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--es)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text3)')}
              title="Add row below"
            >
              +
            </button>
          </td>
        </tr>
      )}
    </>
  );
}

export default function UpworkUpdates({ onToast }) {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [addBelowId, setAddBelowId] = useState(null);
  const [colWidths, setColWidths] = useState({});

  const fetchEntries = useCallback(async () => {
    try {
      const data = await api('/updates');
      setEntries(data || []);
      setAddBelowId(data?.length ? data[data.length - 1]._id : null);
    } catch {
      onToast?.('Failed to load updates', 'error');
    } finally {
      setLoading(false);
    }
  }, [onToast]);

  useEffect(() => { fetchEntries(); }, [fetchEntries]);

  useEffect(() => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx.font = "13px 'Cabinet Grotesk', sans-serif";
    const widths = {};
    COLS.forEach((c) => {
      if (MIN_WIDTH[c.key]) return;
      let max = ctx.measureText(c.label).width;
      entries.forEach((e) => {
        const w = ctx.measureText(String(e[c.key] ?? '')).width;
        if (w > max) max = w;
      });
      widths[c.key] = Math.ceil(max);
    });
    setColWidths(widths);
  }, [entries]);

  const saveRow = async (values) => {
    const normalized = withDefaults(values);
    try {
      if (normalized._id) {
        await api(`/updates/${normalized._id}`, { method: 'PUT', body: JSON.stringify(normalized) });
        setEntries((prev) => prev.map((e) => (e._id === normalized._id ? { ...e, ...normalized } : e)));
        onToast?.('Update saved', 'success');
      } else {
        const entry = await api('/updates', { method: 'POST', body: JSON.stringify(normalized) });
        setEntries((prev) => [...prev, entry]);
        setAddBelowId(entry._id);
        onToast?.('Update added', 'success');
      }
      setModal(null);
    } catch (err) {
      onToast?.(err.message || 'Failed to save update', 'error');
      throw err;
    }
  };

  const addBelow = async (id) => {
    const idx = entries.findIndex((e) => e._id === id);
    if (idx === -1) return;
    const prevOrder = entries[idx]?.order ?? 0;
    const nextOrder = entries[idx + 1]?.order ?? prevOrder + 1;
    const order = (prevOrder + nextOrder) / 2;
    try {
      const entry = await api('/updates', {
        method: 'POST',
        body: JSON.stringify(withDefaults({ order, platform: 'Upwork', pInvite: 'P', date: todayStr() })),
      });
      setEntries((prev) => [...prev, entry].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)));
      setAddBelowId(entry._id);
    } catch (err) {
      onToast?.(err.message || 'Failed to add row', 'error');
    }
  };

  const deleteRow = async (values) => {
    onToast?.('Delete this row?', 'confirm', async () => {
      try {
        await api(`/updates/${values._id}`, { method: 'DELETE' });
        setEntries((prev) => {
          const next = prev.filter((e) => e._id !== values._id);
          if (addBelowId === values._id) setAddBelowId(next.length ? next[next.length - 1]._id : null);
          return next;
        });
        onToast?.('Row deleted', 'success');
      } catch (err) {
        onToast?.(err.message || 'Failed to delete row', 'error');
      }
    });
  };

  return (
    <div className="page active" style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
      <div className="ph">
        <div>
          <div className="pt">Upwork Updates</div>
          <div className="ps">Daily outreach tracking — follow-ups and client responses</div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span className="tag tb">{entries.length} rows</span>
          <button className="btn btn-es" onClick={() => setModal(emptyForm())}>+ Add Row</button>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '20px 0' }}><SkeletonTable rows={6} /></div>
      ) : (
        <div className="card" style={{ padding: 0 }}>
          <div style={{ overflowX: 'auto' }}>
            <table className="updates-table" style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, fontSize: 13 }}>
              <thead>
                <tr>
                  {COLS.map((c, i) => (
                    <th key={c.key} style={{
                      padding: '10px 8px', textAlign: 'left', fontWeight: 600, color: 'var(--text3)', fontSize: 11,
                      textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap',
                      background: 'var(--bg3)', borderBottom: '1px solid var(--border)', borderRight: '1px solid var(--border)',
                      borderTopLeftRadius: i === 0 ? 'var(--r2)' : 0,
                    }}>
                      {c.label}
                    </th>
                  ))}
                  <th style={{
                    padding: '10px 8px', whiteSpace: 'nowrap', fontWeight: 600, color: 'var(--text3)', fontSize: 11,
                    textTransform: 'uppercase', letterSpacing: '0.5px', background: 'var(--bg3)', borderBottom: '1px solid var(--border)',
                    borderTopRightRadius: 'var(--r2)',
                  }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((e) => (
                  <Row key={e._id} entry={e} onSave={saveRow} onDelete={deleteRow} onEdit={(v) => setModal(v)} onAddBelow={addBelow} showAdd={e._id === addBelowId} colWidths={colWidths} />
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

      {modal && <EntryModal initial={modal} onClose={() => setModal(null)} onSave={saveRow} />}

      <style>{`
        .updates-table tbody tr:hover { background: var(--bg3); }
        .updates-table tbody tr:hover td:first-child { border-top-left-radius: var(--r); border-bottom-left-radius: var(--r); }
        .updates-table tbody tr:hover td:last-child { border-top-right-radius: var(--r); border-bottom-right-radius: var(--r); }
      `}</style>
    </div>
  );
}