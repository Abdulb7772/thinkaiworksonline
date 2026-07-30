'use client';
import { api } from '@/lib/config';

export async function uploadFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const res = await api('/upload', {
          method: 'POST',
          body: JSON.stringify({ file: reader.result, name: file.name }),
        });
        resolve(res);
      } catch (err) { reject(err); }
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

const EXT_MAP = {
  jpg:'image',jpeg:'image',png:'image',gif:'image',webp:'image',svg:'image',
  mp4:'video',mpg:'video',mpeg:'video',mov:'video',avi:'video',webm:'video',
  mp3:'audio',wav:'audio',wma:'audio',ogg:'audio',
  pdf:'pdf',
  doc:'document',docx:'document',
  xls:'spreadsheet',xlsx:'spreadsheet',
  ppt:'presentation',pptx:'presentation',
  txt:'text',csv:'text',
  zip:'archive',rar:'archive',gz:'archive','7z':'archive',
};

export function getFileType(file) {
  if (file.resource_type && file.resource_type !== 'raw') return file.resource_type;
  const ext = (file.name || file.original_filename || '').split('.').pop()?.toLowerCase();
  return EXT_MAP[ext] || 'other';
}

export function canPreview(type) {
  return ['image','video','pdf','audio'].includes(type);
}

export function formatFileSize(bytes) {
  if (!bytes && bytes !== 0) return '';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1048576).toFixed(1) + ' MB';
}

export function openFileInNewTab(url) {
  const a = document.createElement('a');
  a.href = url;
  a.target = '_blank';
  a.rel = 'noopener noreferrer';
  a.click();
}
