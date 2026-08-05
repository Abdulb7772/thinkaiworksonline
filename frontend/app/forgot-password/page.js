'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/config';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return setError('Email is required');
    setLoading(true);
    setError('');
    try {
      const resp = await api('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) });
      sessionStorage.setItem('fp_email', email);
      router.push(`/forgot-password/verify?email=${encodeURIComponent(email)}&sentTo=${encodeURIComponent(resp.sentTo || email)}`);
    } catch (err) {
      setError(err.message || 'Failed to send code');
      setLoading(false);
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
          <h1 className="auth-title">Forgot password</h1>
          <p className="auth-subtitle">Enter your primary or secondary email. The verification code will be sent to your primary email.</p>

          <form className="auth-form" onSubmit={handleSubmit} autoComplete="off">
            <div className="input-group">
              <label htmlFor="email">Email</label>
              <div className="input-wrap">
                <svg className="input-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                <input type="email" id="email" placeholder="example@thinkaiworks.online" autoComplete="email" value={email} onChange={(e) => { setEmail(e.target.value); setError(''); }} className={error ? 'error' : ''} />
              </div>
              <div className={`field-error ${error ? 'visible' : ''}`}>{error}</div>
            </div>

            <button type="submit" className={`auth-btn ${loading ? 'loading' : ''}`} style={{ background: 'var(--tai)', color: '#fff' }} disabled={loading}>
              <span className="btn-text">Send verification code</span>
              <div className="spinner" />
            </button>
          </form>

          <div className="auth-footer">
            Remembered it? <Link href="/login">Back to sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
}