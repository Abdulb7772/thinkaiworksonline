'use client';

import { useEffect } from 'react';

export default function Toast({ message, type, onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => onClose?.(), 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  if (!message) return null;

  return (
    <div className={`toast ${type === 'success' ? 'success' : 'info'}`}>
      <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span>{type === 'success' ? '✓' : 'ℹ'}</span>
        {message}
      </span>
    </div>
  );
}
