'use client';

import { useState } from 'react';

const PAGE_SIZE = 10;

export default function Paginated({ items, children, pageSize = PAGE_SIZE }) {
  const [page, setPage] = useState(0);
  const totalPages = Math.ceil(items.length / pageSize);
  const paged = items.slice(page * pageSize, (page + 1) * pageSize);

  return (
    <>
      {children(paged)}
      {totalPages > 1 && (
        <div style={{display:'flex',justifyContent:'center',alignItems:'center',gap:8,padding:'12px 0 4px'}}>
          <button className="btn btn-ghost btn-sm" disabled={page === 0} onClick={() => setPage(p => p - 1)}>‹ Prev</button>
          {Array.from({length:Math.min(totalPages, 20)},(_,i)=>i).map(p => (
            <button key={p} className={`btn btn-sm ${p === page ? 'btn-tai' : 'btn-ghost'}`} onClick={() => setPage(p)} style={{minWidth:30}}>{p + 1}</button>
          ))}
          <button className="btn btn-ghost btn-sm" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>Next ›</button>
        </div>
      )}
    </>
  );
}
