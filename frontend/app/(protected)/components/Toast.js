'use client';

import { useEffect } from 'react';

export default function Toast({ message, type, onClose, onConfirm }) {
  useEffect(() => {
    if (onConfirm) return;
    const timer = setTimeout(() => onClose?.(), 3000);
    return () => clearTimeout(timer);
  }, [onClose, onConfirm]);

  if (!message) return null;

  return (
    <>
      {onConfirm && (
        <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 9998, background: 'rgba(0,0,0,.5)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)', animation: 'fadeIn .15s ease' }} />
      )}
      <div className={`toast ${onConfirm ? 'confirm' : type === 'success' ? 'success' : 'info'}`}>
      <span style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
        <span>{onConfirm ? '⚠' : type === 'success' ? '✓' : 'ℹ'}</span>
        {message}
      </span>
      {onConfirm && (
        <span style={{ display: 'flex', gap: 6, marginLeft: 14, flexShrink: 0 }}>
          <button className="btn btn-sm btn-tai" style={{ padding: '2px 10px', fontSize: 11 }} onClick={() => { onConfirm(); onClose(); }}>Yes</button>
          <button className="btn btn-sm btn-ghost" style={{ padding: '2px 10px', fontSize: 11 }} onClick={onClose}>No</button>
        </span>
      )}
      </div>
    </>
  );
}
