'use client';
import { getFileType, canPreview, formatFileSize } from '../utils/files';

const FILE_ICONS = {
  image: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>,
  video: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>,
  audio: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>,
  pdf: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="16" x2="16" y2="16"/></svg>,
  document: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
  spreadsheet: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="16" y2="17"/><line x1="8" y1="21" x2="16" y2="21"/></svg>,
  presentation: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="15" x2="15" y2="15"/><line x1="12" y1="12" x2="12" y2="18"/></svg>,
  text: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="10" y1="12" x2="14" y2="12"/><line x1="10" y1="16" x2="14" y2="16"/></svg>,
  archive: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="21 8 21 21 3 21 3 8"/><rect x="1" y="3" width="22" height="5" rx="2"/><line x1="10" y1="12" x2="14" y2="12"/></svg>,
  other: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>,
};

export default function FileViewer({ file, context }) {
  const type = getFileType(file);
  const preview = canPreview(type);
  const sizeStr = formatFileSize(file.bytes);

  if (type === 'image') {
    return (
      <a href={file.url} target="_blank" rel="noopener noreferrer" style={{ display:'inline-block', maxWidth: context === 'chat' ? 240 : 300 }}>
        <img src={file.url} alt={file.name} loading="lazy" style={{ width:'100%', borderRadius:8, border:'1px solid var(--border)', display:'block' }} />
      </a>
    );
  }

  if (type === 'video') {
    return (
      <video controls preload="metadata" style={{ maxWidth: context === 'chat' ? 240 : '100%', maxHeight:360, borderRadius:8, border:'1px solid var(--border)', display:'block' }} src={file.url}>
        <a href={file.url} target="_blank" rel="noopener noreferrer">Open video</a>
      </video>
    );
  }

  if (type === 'audio') {
    return (
      <audio controls preload="metadata" style={{ maxWidth:260, display:'block', height:40 }} src={file.url}>
        <a href={file.url} target="_blank" rel="noopener noreferrer">Open audio</a>
      </audio>
    );
  }

  if (type === 'pdf') {
    return (
      <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
        <object data={file.url} type="application/pdf" style={{ width:'100%', height: context === 'chat' ? 300 : 500, borderRadius:8, border:'1px solid var(--border)' }}>
          <iframe src={file.url} style={{ width:'100%', height:'100%', border:'none' }} title={file.name}>
            <p>PDF cannot be displayed. <a href={file.url} target="_blank" rel="noopener noreferrer">Open in new tab</a></p>
          </iframe>
        </object>
        <a href={file.url} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-tai" style={{ alignSelf:'flex-start', textDecoration:'none', fontSize:12, padding:'6px 14px' }}>Open in New Tab</a>
      </div>
    );
  }

  return (
    <div style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 12px', background:'var(--bg3)', borderRadius:'var(--r)', border:'1px solid var(--border)', maxWidth:320 }}>
      <span style={{ color:'var(--tai)', flexShrink:0 }}>{FILE_ICONS[type] || FILE_ICONS.other}</span>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontSize:12, fontWeight:500, color:'var(--text1)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{file.name}</div>
        {sizeStr && <div style={{ fontSize:10, color:'var(--text3)' }}>{sizeStr}</div>}
      </div>
      <a href={file.url} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline" style={{ fontSize:10, padding:'3px 8px', textDecoration:'none' }}>Open</a>
      <a href={file.url} download={file.name} className="btn btn-sm btn-ghost" style={{ fontSize:10, padding:'3px 8px', textDecoration:'none' }}>Download</a>
    </div>
  );
}
