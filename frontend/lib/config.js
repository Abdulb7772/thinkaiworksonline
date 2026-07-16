export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export const api = async (path, options = {}) => {
  let token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  if (!token && typeof window !== 'undefined') {
    try {
      const { getSession } = await import('next-auth/react');
      const session = await getSession();
      token = session?.accessToken;
    } catch {}
  }

  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const response = await fetch(`${API_BASE_URL}/api${path}`, { ...options, headers });
  const contentType = response.headers.get('content-type') || '';

  let data = null;
  if (contentType.includes('application/json')) {
    data = await response.json().catch(() => null);
  } else {
    const text = await response.text();
    if (!response.ok) {
      throw new Error(text || `Request failed (${response.status})`);
    }
    return text;
  }

  if (!response.ok) throw new Error(data?.error || `Request failed (${response.status})`);
  return data;
};
