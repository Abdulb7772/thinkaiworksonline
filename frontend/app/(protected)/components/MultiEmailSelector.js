'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { api } from '@/lib/config';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const Highlight = ({ text, query }) => {
  const q = query.trim().toLowerCase();
  const idx = q ? text.toLowerCase().indexOf(q) : -1;
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <span style={{ color: 'var(--tai)', fontWeight: 700 }}>{text.slice(idx, idx + q.length)}</span>
      {text.slice(idx + q.length)}
    </>
  );
};

export default function MultiEmailSelector({
  label,
  placeholder = 'Type to search...',
  apiEndpoint,
  listKey,
  idKey = 'id',
  selected = [],
  onChange,
  allowManualEmail = true,
  required = false,
}) {
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [query, setQuery] = useState('');
  const [debounced, setDebounced] = useState('');
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const [invalid, setInvalid] = useState('');
  const rootRef = useRef(null);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    api(apiEndpoint)
      .then((data) => {
        if (!alive) return;
        const raw = Array.isArray(data) ? data : (data?.[listKey] || []);
        setOptions(raw.map(o => ({ id: o[idKey] ?? o.id ?? null, name: o.name || '', email: o.email || '' })).filter(o => o.email));
        setLoadError('');
      })
      .catch(() => { if (alive) setLoadError('Could not load options'); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [apiEndpoint, listKey, idKey]);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(query), 250);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    const onClick = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const selectedEmails = useMemo(
    () => new Set(selected.map((s) => String(s.email || '').trim().toLowerCase())),
    [selected]
  );

  const filtered = useMemo(() => {
    const q = debounced.trim().toLowerCase();
    return options
      .filter((o) => !selectedEmails.has(String(o.email || '').trim().toLowerCase()))
      .filter((o) => !q || String(o.name || '').toLowerCase().includes(q) || String(o.email || '').toLowerCase().includes(q));
  }, [options, debounced, selectedEmails]);

  const canAddManual = allowManualEmail && query.trim() && EMAIL_RE.test(query.trim());

  const addItem = (item) => {
    const email = String(item.email || '').trim().toLowerCase();
    if (!email || selectedEmails.has(email)) return;
    onChange([...selected, { ...item, email }]);
    setQuery('');
    setInvalid('');
  };

  const addManual = (raw) => {
    const email = String(raw || '').trim();
    if (!email) return;
    if (!EMAIL_RE.test(email)) {
      setInvalid('Please enter a valid email address (e.g. john@gmail.com)');
      return;
    }
    const match = options.find((o) => String(o.email || '').trim().toLowerCase() === email.toLowerCase());
    if (match) {
      addItem({ id: match.id, name: match.name, email: match.email });
    } else {
      addItem({ id: null, name: '', email, external: true });
    }
  };

  const removeItem = (email) => {
    onChange(selected.filter((s) => String(s.email).toLowerCase() !== String(email).toLowerCase()));
  };

  const onKeyDown = (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setOpen(true); setHighlight((h) => Math.min(h + 1, filtered.length - 1)); return; }
    if (e.key === 'ArrowUp') { e.preventDefault(); setHighlight((h) => Math.max(h - 1, 0)); return; }
    if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered[highlight]) {
        const o = filtered[highlight];
        addItem({ id: o.id, name: o.name, email: o.email });
      } else if (canAddManual) {
        addManual(query);
      }
      return;
    }
    if (e.key === 'Tab' || e.key === ',') {
      if (query.trim()) {
        e.preventDefault();
        addManual(query);
      }
      return;
    }
    if (e.key === 'Escape') { setOpen(false); return; }
    if (e.key === 'Backspace' && !query && selected.length) {
      removeItem(selected[selected.length - 1].email);
    }
  };

  return (
    <div ref={rootRef} style={{ position: 'relative', width: '100%' }}>
      <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 13, color: 'var(--text2)' }}>
        {label} {required && <span style={{ color: 'var(--red)' }}>*</span>}
      </label>

      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 6,
          padding: '6px 8px',
          background: 'var(--bg2)',
          border: '1px solid' + (invalid ? ' var(--red)' : ' var(--border)'),
          borderRadius: 'var(--r)',
          minHeight: 42,
          cursor: 'text',
        }}
        onClick={() => { setOpen(true); rootRef.current?.querySelector('input')?.focus(); }}
      >
        {selected.map((s) => (
          <span
            key={String(s.email).toLowerCase()}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              padding: '3px 6px 3px 10px', background: s.external ? 'var(--gold2)' : 'var(--tai3)',
              color: s.external ? 'var(--gold)' : 'var(--tai)',
              border: '1px solid' + (s.external ? ' rgba(245,200,66,.3)' : ' rgba(124,92,252,.3)'),
              borderRadius: 20, fontSize: 12, fontWeight: 600, maxWidth: '100%',
            }}
            title={s.name ? `${s.name} · ${s.email}` : s.email}
          >
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {s.name ? `${s.name} (${s.email})` : s.email}
            </span>
            <button
              type="button"
              aria-label={`Remove ${s.email}`}
              onClick={(e) => { e.stopPropagation(); removeItem(s.email); }}
              style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', padding: 0, fontSize: 11, lineHeight: 1, opacity: 0.8 }}
            >✕</button>
          </span>
        ))}
        <input
          type="text"
          value={query}
          placeholder={selected.length ? '' : placeholder}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); setHighlight(0); setInvalid(''); }}
          onKeyDown={onKeyDown}
          onFocus={() => setOpen(true)}
          autoComplete="off"
          style={{
            flex: 1, minWidth: 120, border: 'none', outline: 'none', background: 'transparent',
            color: 'var(--text)', fontSize: 13, padding: '4px 2px',
          }}
        />
      </div>

      {invalid && (
        <div style={{ color: 'var(--red)', fontSize: 11, marginTop: 4 }}>{invalid}</div>
      )}

      {open && (
        <div
          style={{
            position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0, zIndex: 30,
            background: 'var(--surface)', border: '1px solid var(--border2)', borderRadius: 'var(--r2)',
            boxShadow: '0 12px 32px rgba(0,0,0,.45)', overflow: 'hidden',
            animation: 'fadeUp .15s ease',
          }}
        >
          {loading && (
            <div style={{ padding: 14, fontSize: 12, color: 'var(--text3)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 12, height: 12, border: '2px solid var(--tai)', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'meetingSpin .6s linear infinite' }} />
              Loading...
            </div>
          )}

          {!loading && (
            <div style={{ maxHeight: 220, overflowY: 'auto' }}>
              {filtered.length === 0 && !canAddManual && (
                <div style={{ padding: 14, fontSize: 12, color: 'var(--text3)' }}>No results found</div>
              )}
              {filtered.map((o, i) => (
                <div
                  key={o.id || String(o.email)}
                  onMouseEnter={() => setHighlight(i)}
                  onClick={() => addItem({ id: o.id, name: o.name, email: o.email })}
                  style={{
                    padding: '8px 12px', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 1,
                    background: i === highlight ? 'var(--tai3)' : 'transparent',
                    transition: 'background .1s ease',
                  }}
                >
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text1)' }}>
                    <Highlight text={o.name || '—'} query={debounced} />
                  </span>
                  <span style={{ fontSize: 11.5, color: 'var(--text3)' }}>
                    <Highlight text={o.email} query={debounced} />
                  </span>
                </div>
              ))}
              {canAddManual && (
                <div
                  onMouseEnter={() => setHighlight(filtered.length)}
                  onClick={() => addManual(query)}
                  style={{
                    padding: '8px 12px', cursor: 'pointer',
                    background: highlight === filtered.length ? 'var(--tai3)' : 'transparent',
                    borderTop: '1px solid var(--border)',
                    display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5,
                  }}
                >
                  <span style={{ color: 'var(--tai)', fontWeight: 700 }}>+</span>
                  <span style={{ color: 'var(--text2)' }}>
                    Add <span style={{ color: 'var(--tai)', fontWeight: 600 }}>{query.trim()}</span> as custom email
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {loadError && (
        <div style={{ fontSize: 11, color: 'var(--red)', marginTop: 4 }}>{loadError}</div>
      )}
    </div>
  );
}
