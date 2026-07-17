'use client';

import { useState } from 'react';
import { api } from '@/lib/config';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const role = 'customer';
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const getPwdStrength = (val) => {
    if (!val) return { level: 0, label: '', bars: 0 };
    let score = 0;
    if (val.length >= 6) score++;
    if (val.length >= 10) score++;
    if (/[A-Z]/.test(val) && /[a-z]/.test(val)) score++;
    if (/\d/.test(val) && /[!@#$%^&*(),.?":{}|<>]/.test(val)) score++;
    const labels = ['', 'Weak — add more characters', 'Fair — add uppercase & numbers', 'Strong — great password', 'Very strong!'];
    return { level: Math.min(score, 4), label: labels[Math.min(score, 4)], bars: Math.min(score, 4) };
  };

  const pwd = getPwdStrength(password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!name || name.length < 2) errs.name = 'Name must be at least 2 characters';
    if (!email) errs.email = 'Email is required';
    if (!password || password.length < 6) errs.password = 'Password must be at least 6 characters';
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setLoading(true);
    try {
      await api('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password, role }),
      });
      showToast('Verification code sent! Check your email.', 'success');
      setLoading(false);
      setTimeout(() => router.push(`/verify-email?email=${encodeURIComponent(email)}`), 600);
    } catch (err) {
      setLoading(false);
      const msg = err.message;
      showToast(msg, 'error');
      if (msg.toLowerCase().includes('email') || msg.toLowerCase().includes('registered')) {
        setErrors(e => ({ ...e, email: msg }));
      }
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
      <div className="bg-grid" />
      <div className="bg-glow es" style={{ top: '-200px', left: '-200px' }} />
      <div className="bg-glow tai" style={{ bottom: '-200px', right: '-200px' }} />

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
          <h1 className="auth-title">Create account</h1>
          <p className="auth-subtitle">Join the Command Hub</p>

          <form className="auth-form" onSubmit={handleSubmit} autoComplete="off">
            <div className="input-group">
              <label htmlFor="name">Full name</label>
              <div className="input-wrap">
                <svg className="input-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                <input type="text" id="name" placeholder="Full name" autoComplete="name" value={name} onChange={e => setName(e.target.value)} className={errors.name ? 'error' : ''} />
              </div>
              <div className={`field-error ${errors.name ? 'visible' : ''}`}>{errors.name}</div>
            </div>

            <div className="input-group">
              <label htmlFor="email">Email</label>
              <div className="input-wrap">
                <svg className="input-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                <input type="email" id="email" placeholder="example@thinkaiworks.online" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} className={errors.email ? 'error' : ''} />
              </div>
              <div className={`field-error ${errors.email ? 'visible' : ''}`}>{errors.email}</div>
            </div>

            <div className="input-group">
              <label htmlFor="password">Password</label>
              <div className="input-wrap">
                <svg className="input-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
                <input type={showPassword ? 'text' : 'password'} id="password" placeholder="••••••••" autoComplete="new-password" value={password} onChange={e => setPassword(e.target.value)} className={errors.password ? 'error' : ''} />
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
              <div className="pwd-strength">
                {[0,1,2,3].map(i => (
                  <span key={i} className={i < pwd.bars ? `active ${pwd.level <= 1 ? 'weak' : pwd.level === 2 ? 'med' : 'strong'}` : ''} />
                ))}
              </div>
              <div className="pwd-strength-label" style={{ color: pwd.level <= 1 ? 'var(--red)' : pwd.level === 2 ? 'var(--amber)' : 'var(--green)' }}>{pwd.label}</div>
              <div className={`field-error ${errors.password ? 'visible' : ''}`}>{errors.password}</div>
            </div>
            <button type="submit" className={`auth-btn ${loading ? 'loading' : ''}`} style={{ background: 'var(--es)', color: '#000' }} disabled={loading}>
              <span className="btn-text">Create Account</span>
              <div className="spinner" style={{ borderColor: 'rgba(0,0,0,.2)', borderTopColor: '#000' }} />
            </button>
          </form>

          <div className="auth-footer">
            Already have an account? <Link href="/login">Sign in</Link>
          </div>

          <div className="terms-text">
            By creating an account, you agree to our <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>
          </div>
        </div>
      </div>

      <style jsx>{`
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

      {toast && (
        <div className={`toast ${toast.type}`}>
          <span>{toast.type === 'success' ? '✓ ' : 'ℹ '}{toast.msg}</span>
        </div>
      )}
    </div>
  );
}
