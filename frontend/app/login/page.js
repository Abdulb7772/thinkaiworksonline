'use client';

import { useState } from 'react';
import { api } from '@/lib/config';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const shake = (id) => {
    const el = document.getElementById(id);
    if (el) el.style.animation = 'none';
    setTimeout(() => {
      if (el) el.style.animation = 'shake 0.4s ease';
    }, 10);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!email) errs.email = 'Email is required';
    if (!password) errs.password = 'Password is required';
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setLoading(true);
    try {
      const data = await api('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      showToast(`Welcome back, ${data.user.name}!`, 'success');
      setTimeout(() => router.push('/'), 600);
    } catch (err) {
      setLoading(false);
      const msg = err.message;
      showToast(msg, 'error');
      if (msg.toLowerCase().includes('email')) { setErrors(e => ({ ...e, email: msg })); shake('email'); }
      else if (msg.toLowerCase().includes('password')) { setErrors(e => ({ ...e, password: msg })); shake('password'); }
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
      <div className="bg-grid" />
      <div className="bg-glow es" />
      <div className="bg-glow tai" />

      <div className="auth-container">
        <div className="auth-card">
          <div className="brand-row">
            <div className="brand-icon es">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
            </div>
            <div className="brand-divider" />
            <div className="brand-icon tai">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/></svg>
            </div>
          </div>
          <h1 className="auth-title">Welcome back</h1>
          <p className="auth-subtitle">Sign in to your Command Hub</p>

          <form className="auth-form" onSubmit={handleSubmit} autoComplete="off">
            <div className="input-group">
              <label htmlFor="email">Email</label>
              <div className="input-wrap">
                <svg className="input-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                <input type="email" id="email" placeholder="muhammad@thinkaiworks.online" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} className={errors.email ? 'error' : ''} />
              </div>
              <div className={`field-error ${errors.email ? 'visible' : ''}`}>{errors.email}</div>
            </div>

            <div className="input-group">
              <label htmlFor="password">Password</label>
              <div className="input-wrap">
                <svg className="input-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
                <input type="password" id="password" placeholder="••••••••" autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} className={errors.password ? 'error' : ''} />
              </div>
              <div className={`field-error ${errors.password ? 'visible' : ''}`}>{errors.password}</div>
            </div>

            <button type="submit" className={`auth-btn ${loading ? 'loading' : ''}`} style={{ background: 'var(--tai)', color: '#fff' }} disabled={loading}>
              <span className="btn-text">Sign In</span>
              <div className="spinner" />
            </button>
          </form>

          <div className="auth-footer">
            Don&apos;t have an account? <Link href="/signup">Create one</Link>
          </div>

          <div className="demo-badge">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
            Demo: <strong>admin@thinkaiworks.online</strong> / <strong>password123</strong>
          </div>
        </div>
      </div>

      {toast && (
        <div className={`toast ${toast.type}`}>
          <span>{toast.type === 'success' ? '✓ ' : 'ℹ '}{toast.msg}</span>
        </div>
      )}

      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
          20%, 40%, 60%, 80% { transform: translateX(4px); }
        }
      `}</style>
    </div>
  );
}
