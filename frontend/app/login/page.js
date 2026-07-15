'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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

  const handlePasswordSignIn = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!email) errs.email = 'Email is required';
    if (!password) errs.password = 'Password is required';
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setLoading(true);
    try {
      const result = await signIn('credentials', { email, password, redirect: false });
      if (result.error) throw new Error(result.error);

      const session = await import('next-auth/react').then((m) => m.getSession());
      if (session?.accessToken) localStorage.setItem('token', session.accessToken);
      if (session?.user) localStorage.setItem('user', JSON.stringify(session.user));

      showToast('Welcome back!', 'success');
      setTimeout(() => router.push('/'), 600);
    } catch (err) {
      setLoading(false);
      const msg = err.message;
      showToast(msg, 'error');
      if (msg.toLowerCase().includes('email')) { setErrors((e) => ({ ...e, email: msg })); shake('email'); }
      else if (msg.toLowerCase().includes('password')) { setErrors((e) => ({ ...e, password: msg })); shake('password'); }
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

          <form className="auth-form" onSubmit={handlePasswordSignIn} autoComplete="off">
            <div className="input-group">
              <label htmlFor="email">Email</label>
              <div className="input-wrap">
                <svg className="input-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                <input type="email" id="email" placeholder="muhammad@thinkaiworks.online" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className={errors.email ? 'error' : ''} />
              </div>
              <div className={`field-error ${errors.email ? 'visible' : ''}`}>{errors.email}</div>
            </div>

            <div className="input-group">
              <label htmlFor="password">Password</label>
              <div className="input-wrap">
                <svg className="input-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
                <input type={showPassword ? 'text' : 'password'} id="password" placeholder="••••••••" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} className={errors.password ? 'error' : ''} />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.94 10.94 0 0 1 12 20C7 20 2.73 16.11 1 12c.62-1.47 1.57-2.84 2.76-4.02M10.58 10.58A2 2 0 0 0 13.42 13.42M9.88 5.09A9.12 9.12 0 0 1 12 4c5 0 9.27 3.89 11 8a18.14 18.14 0 0 1-4.22 5.5"/><path d="m1 1 22 22"/></svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                  )}
                </button>
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

        .auth-tabs {
          display: flex;
          gap: 0;
          margin-bottom: 24px;
          background: var(--card-bg);
          border-radius: 8px;
          padding: 3px;
          border: 1px solid var(--border);
        }

        .auth-tab {
          flex: 1;
          padding: 10px;
          border: none;
          background: transparent;
          color: var(--text3);
          font-size: 14px;
          font-weight: 500;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .auth-tab.active {
          background: var(--tai);
          color: #fff;
        }

        .password-toggle {
          margin-left: auto;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 34px;
          height: 34px;
          border: 0;
          border-radius: 10px;
          background: transparent;
          color: var(--text3);
          cursor: pointer;
          transition: color .2s ease, background .2s ease;
          flex-shrink: 0;
        }

        .password-toggle:hover {
          color: var(--text);
          background: rgba(255,255,255,.04);
        }
      `}</style>
    </div>
  );
}
