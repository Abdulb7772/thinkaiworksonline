'use client';

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

const ALLOWED_MIMES = ['image/jpeg','image/png','image/webp','image/gif','application/pdf'];
const ALLOWED_EXTS = ['jpg','jpeg','png','webp','gif','pdf'];

export function isAllowedFile(file) {
  if (ALLOWED_MIMES.includes(file.type)) return true;
  const ext = file.name.split('.').pop()?.toLowerCase();
  return ALLOWED_EXTS.includes(ext);
}

export async function uploadFile(file) {
  if (!isAllowedFile(file)) {
    throw new Error('Only images and PDF files are allowed.');
  }

  const formData = new FormData();
  formData.append('file', file);

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const headers = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}/api/upload`, {
    method: 'POST',
    headers,
    body: formData,
  });

  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.message || data?.error || 'Upload failed');
  return data;
}

const EXT_MAP = {
  jpg:'image',jpeg:'image',png:'image',gif:'image',webp:'image',
  pdf:'pdf',
};

export function getFileType(file) {
  const ext = (file.name || file.original_filename || '').split('.').pop()?.toLowerCase();
  return EXT_MAP[ext] || 'other';
}

export function formatFileSize(bytes) {
  if (!bytes && bytes !== 0) return '';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1048576).toFixed(1) + ' MB';
}
