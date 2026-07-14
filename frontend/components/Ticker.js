'use client';
export default function Ticker({ items }) {
  const doubled = [...items, ...items];
  return (
    <div className="ticker">
      <span>Live</span>
      <div className="ticker-inner">
        {doubled.map((item, i) => (
          <span key={i} className="ticker-item">
            <span style={{ color: 'var(--es)' }}>●</span>{item}
          </span>
        ))}
      </div>
    </div>
  );
}
