'use client';
import { getFileType, formatFileSize } from '../utils/files';

export default function FileViewer({ file, context }) {
  const type = getFileType(file);
  const url = file.url || file.secure_url || '';
  const sizeStr = formatFileSize(file.bytes);

  if (type === 'image') {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" style={{ display:'inline-block', maxWidth: context === 'chat' ? 240 : 300 }}>
        <img src={url} alt={file.name} loading="lazy" style={{ width:'100%', borderRadius:8, border:'1px solid var(--border)', display:'block' }} />
      </a>
    );
  }

  return (
    <a href={url} target="_blank" rel="noopener noreferrer" style={{ display:'inline-flex', alignItems:'center', gap:6, fontSize:13, color:'var(--tai)', textDecoration:'none', padding:'6px 10px', background:'var(--bg3)', borderRadius:'var(--r)', border:'1px solid var(--border)', maxWidth:320 }}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="16" x2="16" y2="16"/></svg>
      <span style={{ overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', flex:1 }}>{file.name}</span>
      {sizeStr && <span style={{ fontSize:10, color:'var(--text3)', flexShrink:0 }}>{sizeStr}</span>}
    </a>
  );
}
