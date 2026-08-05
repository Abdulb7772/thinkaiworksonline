'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/config';

export default function ForgotPasswordResetPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState({ email: '', password: '', confirm: '', form: '' });

  useEffect(() => {
    setEmail(sessionStorage.getItem('fp_email') || '');
    setOtp(sessionStorage.getItem('fp_otp') || '');
  }, []);

  const shake = (id) => {
    const el = document.getElementById(id);
    if (el) el.style.animation = 'none';
    setTimeout(() => {
      if (el) el.style.animation = 'shake 0.4s ease';
    }, 10);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = { email: '', confirm: '', form: '' };
    if (!email || !otp) {
      errs.form = 'Your session expired. Please start over.';
      setErrors(errs);
      return;
    }
    if (!newPassword) errs.email = 'New password is required';
    else if (newPassword.length < 6) errs.email = 'Password must be at least 6 characters';
    if (confirmPassword !== newPassword) errs.confirm = 'Passwords do not match';

    setErrors(errs);
    if (errs.email) shake('newPassword');
    if (errs.confirm) shake('confirm');

    if (Object.values(errs).some(Boolean)) return;

    setLoading(true);
    try {
      await api('/auth/forgot-password/confirm', {
        method: 'POST',
        body: JSON.stringify({ email, otp, newPassword }),
      });
      sessionStorage.removeItem('fp_email');
      sessionStorage.removeItem('fp_otp');
      setSuccess(true);
      setTimeout(() => router.push('/login'), 1500);
    } catch (err) {
      const msg = err.message || 'Failed to reset password';
      setErrors((prev) => ({ ...prev, form: msg }));
      setLoading(false);
    }
  };

  if (!email && !loading && !success) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
        <div className="bg-grid" />
        <div className="auth-container">
          <div className="auth-card" style={{ textAlign: 'center' }}>
            <p style={{ color: 'var(--text2)', marginBottom: 16 }}>Your session expired. Please start the password reset again.</p>
            <Link href="/forgot-password" className="auth-btn" style={{ background: 'var(--tai)', color: '#fff', textDecoration: 'none', display: 'inline-block', padding: '10px 24px', borderRadius: 'var(--r)' }}>
              Start over
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
        <div className="bg-grid" />
        <div className="bg-glow es" />
        <div className="bg-glow tai" />
        <div className="auth-container">
          <div className="auth-card" style={{ textAlign: 'center' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', margin: '0 auto 16px', background: 'rgba(34,212,122,0.14)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <p style={{ color: 'var(--green)', fontSize: 16, fontWeight: 600 }}>Password reset!</p>
            <p style={{ color: 'var(--text2)', fontSize: 13, marginTop: 4 }}>Redirecting to sign in...</p>
          </div>
        </div>
      </div>
    );
  }

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
          <h1 className="auth-title">Reset your password</h1>
          <p className="auth-subtitle">Choose a new password for {email}</p>

          {errors.form && (
            <div style={{
              textAlign: 'center', padding: '10px 14px', marginBottom: 16,
              background: 'rgba(255,79,109,0.08)', border: '1px solid rgba(255,79,109,0.2)',
              borderRadius: 'var(--r)', color: 'var(--red)', fontSize: 13,
            }}>
              {errors.form}
            </div>
          )}

          <form className="auth-form" onSubmit={handleSubmit} autoComplete="off">
            <div className="input-group">
              <label htmlFor="newPassword">New Password</label>
              <div className="input-wrap">
                <svg className="input-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
                <input type={showPassword ? 'text' : 'password'} id="newPassword" placeholder="Min 6 characters" autoComplete="new-password" value={newPassword} onChange={(e) => { setNewPassword(e.target.value); setErrors((p) => ({ ...p, email: '', form: '' })); }} className={errors.email ? 'error' : ''} />
                <button
                  type="button"
                  className="toggle-pass"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  style={{ position: 'absolute', right: 12, background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', padding: 4, display: 'flex' }}
                >
                  {showPassword ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.94 10.94 0 0 1 12 20C7 20 2.73 16.11 1 12c.62-1.47 1.57-2.84 2.76-4.02M10.58 10.58A2 2 0 0 0 13.42 13.42M9.88 5.09A9.12 9.12 0 0 1 12 4c5 0 9.27 3.89 11 8a18.14 18.14 0 0 1-4.22 5.5"/><path d="m1 1 22 22"/></svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                  )}
                </button>
              </div>
              <div className={`field-error ${errors.email ? 'visible' : ''}`}>{errors.email}</div>
            </div>

            <div className="input-group">
              <label htmlFor="confirm">Confirm Password</label>
              <div className="input-wrap">
                <svg className="input-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
                <input type={showPassword ? 'text' : 'password'} id="confirm" placeholder="Re-enter your password" autoComplete="new-password" value={confirmPassword} onChange={(e) => { setConfirmPassword(e.target.value); setErrors((p) => ({ ...p, confirm: '', form: '' })); }} className={errors.confirm ? 'error' : ''} />
              </div>
              <div className={`field-error ${errors.confirm ? 'visible' : ''}`}>{errors.confirm}</div>
            </div>

            <button type="submit" className={`auth-btn ${loading ? 'loading' : ''}`} style={{ background: 'var(--tai)', color: '#fff' }} disabled={loading}>
              <span className="btn-text">Reset password</span>
              <div className="spinner" />
            </button>
          </form>

          <div className="auth-footer">
            Remembered it? <Link href="/login">Back to sign in</Link>
          </div>
        </div>
      </div>

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