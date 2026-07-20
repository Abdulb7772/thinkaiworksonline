export function SkeletonCard({ count = 1, height }) {
  return Array.from({ length: count }).map((_, i) => (
    <div key={i} className="card" style={{ padding: 16 }}>
      <div className="sk sk-line" style={{ width: '40%', height: 16 }} />
      <div className="sk sk-line" style={{ width: '80%' }} />
      <div className="sk sk-line" style={{ width: '30%' }} />
      {height && <div className="sk" style={{ height, width: '100%', marginTop: 8 }} />}
    </div>
  ));
}

export function SkeletonMetrics({ count = 4 }) {
  return Array.from({ length: count }).map((_, i) => (
    <div key={i} className="metric" style={{ border: '1px solid var(--border)', padding: 16 }}>
      <div className="sk sk-line" style={{ width: '50%', height: 12 }} />
      <div className="sk sk-line" style={{ width: '30%', height: 24, marginTop: 4 }} />
    </div>
  ));
}

export function SkeletonTable({ rows = 4 }) {
  return Array.from({ length: rows }).map((_, i) => (
    <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
      <div className="sk sk-circle" />
      <div style={{ flex: 1 }}>
        <div className="sk sk-line" style={{ width: '50%' }} />
        <div className="sk sk-line" style={{ width: '30%' }} />
      </div>
    </div>
  ));
}
