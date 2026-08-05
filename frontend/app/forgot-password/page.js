'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/config';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);
  const [sentTo, setSentTo] = useState(null);
  const [count, setCount] = useState(0);
  const timerRef = useRef(null);
  const OTP_SECONDS = 60;

  const sendCode = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    try {
      const resp = await api('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) });
      setMsg(resp.message || 'If an account exists, a verification code was sent.');
      if (resp.sentTo) setSentTo(resp.sentTo);
      setStep(2);
      setCount(OTP_SECONDS);
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => setCount((c) => c - 1), 1000);
    } catch (err) {
      setMsg(err.message || 'Failed to send code');
    } finally { setLoading(false); }
  };

  const confirmReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    try {
      await api('/auth/forgot-password/confirm', { method: 'POST', body: JSON.stringify({ email, otp, newPassword }) });
      setMsg('Password reset. You can now sign in.');
      setTimeout(() => router.push('/login'), 1200);
    } catch (err) {
      setMsg(err.message || 'Failed to reset password');
    } finally { setLoading(false); }
  };

  useEffect(() => {
    if (count <= 0 && timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, [count]);

  const resend = async () => {
    if (!email) return setMsg('Enter your email first');
    setLoading(true);
    setMsg(null);
    try {
      const resp = await api('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) });
      setMsg(resp.message || 'Verification code resent.');
      if (resp.sentTo) setSentTo(resp.sentTo);
      setCount(OTP_SECONDS);
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => setCount((c) => c - 1), 1000);
    } catch (err) {
      setMsg(err.message || 'Failed to resend');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="auth-card" style={{ width: 520, padding: 28, borderRadius: 12 }}>
        <h2 style={{ margin: 0, marginBottom: 8 }}>Forgot password</h2>
        <p style={{ marginTop: 0, marginBottom: 18, color: '#6b7280' }}>
          Enter your primary or secondary email. A verification code will be sent to your primary email.
        </p>

        {step === 1 && (
          <form onSubmit={sendCode}>
            <div className="input-group">
              <label>Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="primary@email.com or login@email.com" required />
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <button type="submit" className={`auth-btn ${loading ? 'loading' : ''}`} style={{ flex: 1 }}>Send verification code</button>
              <Link href="/login"><button type="button" className="auth-btn" style={{ background: '#eef2ff', color: '#111' }}>Back</button></Link>
            </div>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={confirmReset}>
            <div style={{ marginBottom: 10, color: '#374151' }}>
              {sentTo ? (<span>Verification code sent to your primary email <strong>{sentTo}</strong></span>) : <span>Verification code sent to your primary email</span>}
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }}>
              <div style={{ flex: 1 }}>
                <label>Verification Code</label>
                <input value={otp} onChange={(e) => setOtp(e.target.value)} inputMode="numeric" required />
              </div>
              <div style={{ width: 120 }}>
                <label>&nbsp;</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button type="button" onClick={resend} className="auth-btn" disabled={count > 0}>{count > 0 ? `Resend (${count}s)` : 'Resend'}</button>
                </div>
              </div>
            </div>

            <div className="input-group">
              <label>New Password</label>
              <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <button type="submit" className={`auth-btn ${loading ? 'loading' : ''}`} style={{ flex: 1 }}>Reset password</button>
              <Link href="/login"><button type="button" className="auth-btn" style={{ background: '#eef2ff', color: '#111' }}>Cancel</button></Link>
            </div>
          </form>
        )}

        <div style={{ marginTop: 12 }}>
          <Link href="/login">Back to sign in</Link>
        </div>
        {msg && <div style={{ marginTop: 12 }}>{msg}</div>}
      </div>
    </div>
  );
}