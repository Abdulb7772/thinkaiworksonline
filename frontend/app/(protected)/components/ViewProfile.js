'use client';

export default function ViewProfile({ item, onClose }) {
  if (!item) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{maxWidth:420}}>
        <div className="modal-head">
          <div className="modal-title">{item.name}</div>
          <button className="modal-close" onClick={onClose}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div style={{display:'flex',flexDirection:'column',gap:12}}>
          {item.service && (
            <div><span style={{color:'var(--text3)',fontSize:11,textTransform:'uppercase',letterSpacing:.8}}>Service</span><div style={{fontSize:13,marginTop:2}}>{item.service}</div></div>
          )}
          {item.budget && (
            <div><span style={{color:'var(--text3)',fontSize:11,textTransform:'uppercase',letterSpacing:.8}}>Budget</span><div style={{fontSize:13,marginTop:2}}>{item.budget}</div></div>
          )}
          {item.value && (
            <div><span style={{color:'var(--text3)',fontSize:11,textTransform:'uppercase',letterSpacing:.8}}>Value</span><div style={{fontSize:13,marginTop:2}}>{item.value}</div></div>
          )}
          {item.stage && (
            <div><span style={{color:'var(--text3)',fontSize:11,textTransform:'uppercase',letterSpacing:.8}}>Stage</span><div style={{fontSize:13,marginTop:2}}>{item.stage}</div></div>
          )}
          {item.company && (
            <div><span style={{color:'var(--text3)',fontSize:11,textTransform:'uppercase',letterSpacing:.8}}>Company</span><div style={{fontSize:13,marginTop:2}}>{item.company}</div></div>
          )}
          {item.assignedTo && (
            <div><span style={{color:'var(--text3)',fontSize:11,textTransform:'uppercase',letterSpacing:.8}}>Assigned To</span><div style={{fontSize:13,marginTop:2}}>{item.assignedTo}</div></div>
          )}
          {item.assignee && (
            <div><span style={{color:'var(--text3)',fontSize:11,textTransform:'uppercase',letterSpacing:.8}}>Assignee</span><div style={{fontSize:13,marginTop:2}}>{item.assignee}</div></div>
          )}
          {item.lastContact && (
            <div><span style={{color:'var(--text3)',fontSize:11,textTransform:'uppercase',letterSpacing:.8}}>Last Contact</span><div style={{fontSize:13,marginTop:2}}>{item.lastContact}</div></div>
          )}
          {item.last && (
            <div><span style={{color:'var(--text3)',fontSize:11,textTransform:'uppercase',letterSpacing:.8}}>Last Contact</span><div style={{fontSize:13,marginTop:2}}>{item.last}</div></div>
          )}
          {item.age && (
            <div><span style={{color:'var(--text3)',fontSize:11,textTransform:'uppercase',letterSpacing:.8}}>Age</span><div style={{fontSize:13,marginTop:2}}>{item.age}</div></div>
          )}
        </div>
      </div>
    </div>
  );
}
