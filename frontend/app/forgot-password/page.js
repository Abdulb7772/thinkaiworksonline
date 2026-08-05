'use client';

import { useState } from 'react';
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

  const sendCode = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) });
      setMsg('If an account exists, a verification code was sent.');
      setStep(2);
    } catch (err) {
      setMsg(err.message || 'Failed to send code');
    } finally { setLoading(false); }
  };

  const confirmReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api('/auth/forgot-password/confirm', { method: 'POST', body: JSON.stringify({ email, otp, newPassword }) });
      setMsg('Password reset. You can now sign in.');
      setTimeout(() => router.push('/login'), 1200);
    } catch (err) {
      setMsg(err.message || 'Failed to reset password');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="auth-card" style={{ width: 480 }}>
        <h2>Forgot Password</h2>
        {step === 1 && (
          <form onSubmit={sendCode}>
            <div className="input-group">
              <label>Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <button type="submit" className={`auth-btn ${loading ? 'loading' : ''}`}>Send verification code</button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={confirmReset}>
            <div className="input-group">
              <label>Verification Code</label>
              <input value={otp} onChange={(e) => setOtp(e.target.value)} required />
            </div>
            <div className="input-group">
              <label>New Password</label>
              <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
            </div>
            <button type="submit" className={`auth-btn ${loading ? 'loading' : ''}`}>Reset password</button>
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
