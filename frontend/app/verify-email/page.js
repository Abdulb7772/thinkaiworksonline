'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '@/lib/config';
import Link from 'next/link';

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  const sentTo = searchParams.get('sentTo') || email;

  const [otp, setOtp] = useState(Array(6).fill(''));
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const inputsRef = useRef([]);

  useEffect(() => {
    if (inputsRef.current[0]) inputsRef.current[0].focus();
  }, []);

  useEffect(() => {
    let interval;
    if (timer > 0 && !canResend) {
      interval = setInterval(() => {
        setTimer((t) => {
          if (t <= 1) {
            setCanResend(true);
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer, canResend]);

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    setError('');

    if (value && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }

    const filled = newOtp.join('');
    if (filled.length === 6 && /^\d{6}$/.test(filled)) {
      setTimeout(() => submitOtp(filled), 100);
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowRight' && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
    if (e.key === 'ArrowLeft' && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;
    const newOtp = [...otp];
    for (let i = 0; i < pasted.length; i++) {
      newOtp[i] = pasted[i];
    }
    setOtp(newOtp);
    const nextIndex = Math.min(pasted.length, 5);
    inputsRef.current[nextIndex]?.focus();
  };

  const submitOtp = async (code) => {
    if (code.length !== 6) {
      setError('Please enter the complete 6-digit code.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const data = await api('/auth/verify-otp', {
        method: 'POST',
        body: JSON.stringify({ email, otp: code }),
      });

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setSuccess(true);

      setTimeout(() => router.push('/dashboard'), 1200);
    } catch (err) {
      setError(err.message);
      setOtp(Array(6).fill(''));
      inputsRef.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    submitOtp(otp.join(''));
  };

  const handleResend = async () => {
    setResending(true);
    setError('');
    try {
      await api('/auth/resend-otp', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
      setOtp(Array(6).fill(''));
      setTimer(30);
      setCanResend(false);
      inputsRef.current[0]?.focus();
    } catch (err) {
      setError(err.message);
    } finally {
      setResending(false);
    }
  };

  if (!email) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
        <div className="auth-container">
          <div className="auth-card" style={{ textAlign: 'center' }}>
            <p style={{ color: 'var(--text2)', marginBottom: 16 }}>No email provided. Please sign up first.</p>
            <Link href="/signup" className="auth-btn" style={{ background: 'var(--es)', color: '#000', textDecoration: 'none', display: 'inline-block', padding: '10px 24px', borderRadius: 'var(--r)' }}>
              Go to Sign Up
            </Link>
          </div>
        </div>
      </div>
    );
  }

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
          <h1 className="auth-title">Verify your email</h1>
          <p className="auth-subtitle" style={{ wordBreak: 'break-all' }}>Code sent to {sentTo}</p>

          {success ? (
            <div style={{ textAlign: 'center', padding: '24px 0' }}>
              <div style={{
                width: 64, height: 64, borderRadius: '50%', margin: '0 auto 16px',
                background: 'rgba(34,212,122,0.14)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>
              <p style={{ color: 'var(--green)', fontSize: 16, fontWeight: 600 }}>Email verified!</p>
              <p style={{ color: 'var(--text2)', fontSize: 13, marginTop: 4 }}>Redirecting to dashboard...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ marginTop: 24 }}>
              <div style={{
                display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 20,
              }}>
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => { inputsRef.current[i] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(i, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    onPaste={i === 0 ? handlePaste : undefined}
                    autoComplete="one-time-code"
                    style={{
                      width: 48, height: 54, textAlign: 'center', fontSize: 22, fontWeight: 700,
                      fontFamily: 'var(--font-mono)',
                      background: 'var(--bg3)', border: `2px solid ${error ? 'var(--red)' : digit ? 'var(--es)' : 'var(--border2)'}`,
                      borderRadius: 'var(--r)', color: 'var(--text)', outline: 'none',
                      transition: 'border-color 0.15s',
                      caretColor: 'var(--es)',
                    }}
                    onFocus={(e) => e.target.select()}
                  />
                ))}
              </div>

              {error && (
                <div style={{
                  textAlign: 'center', padding: '10px 14px', marginBottom: 16,
                  background: 'rgba(255,79,109,0.08)', border: '1px solid rgba(255,79,109,0.2)',
                  borderRadius: 'var(--r)', color: 'var(--red)', fontSize: 13,
                }}>
                  {error}
                </div>
              )}

              <button type="submit" className={`auth-btn ${loading ? 'loading' : ''}`}
                style={{ background: 'var(--es)', color: '#000' }} disabled={loading}>
                <span className="btn-text">Verify Email</span>
                <div className="spinner" style={{ borderColor: 'rgba(0,0,0,.2)', borderTopColor: '#000' }} />
              </button>

              <div style={{ textAlign: 'center', marginTop: 20 }}>
                <p style={{ color: 'var(--text3)', fontSize: 13, marginBottom: 8 }}>
                  {canResend ? (
                    <span>Didn't receive the code?</span>
                  ) : (
                    <span>Resend code in <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--tai)', fontWeight: 600 }}>00:{timer.toString().padStart(2, '0')}</span></span>
                  )}
                </p>
                <button
                  type="button"
                  disabled={!canResend || resending}
                  onClick={handleResend}
                  style={{
                    background: 'transparent', border: '1px solid var(--border2)',
                    borderRadius: 'var(--r)', padding: '8px 20px',
                    color: canResend ? 'var(--es)' : 'var(--text3)',
                    cursor: canResend ? 'pointer' : 'not-allowed',
                    fontSize: 13, fontWeight: 600,
                    transition: 'all 0.15s',
                  }}
                >
                  {resending ? 'Sending...' : 'Resend Code'}
                </button>
              </div>
            </form>
          )}

          <div className="auth-footer" style={{ marginTop: 20 }}>
            <Link href="/signup">Use a different email</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
