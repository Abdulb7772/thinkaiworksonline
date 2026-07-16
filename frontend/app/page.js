'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SplashScreen() {
  const router = useRouter();
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => router.replace('/login'), 2000);
    requestAnimationFrame(() => setLoaded(true));
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
      background: 'var(--bg)',
    }}>
      <div className="bg-grid" />

      <div className="splash-orb es" />
      <div className="splash-orb tai" />
      <div className="splash-orb gold" />

      <div className={`splash-content ${loaded ? 'visible' : ''}`}>
        <div className="splash-logo-wrap">
          <img
            src="/img/logo.jpeg"
            alt="Command Hub"
            className="splash-logo"
          />
        </div>

        <div className="splash-brand">
          <div className="brand-icon es" style={{ width: 44, height: 44, borderRadius: 12, fontSize: 18 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
          </div>
          <div className="brand-divider" style={{ height: 32, margin: '0 10px' }} />
          <div className="brand-icon tai" style={{ width: 44, height: 44, borderRadius: 12, fontSize: 18 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/></svg>
          </div>
        </div>

        <div className="splash-title">Command Hub</div>
        <div className="splash-subtitle">ThinkAIWorks &middot; EcomSkyline</div>

        <div className="splash-loader">
          <div className="splash-loader-track">
            <div className="splash-loader-bar" />
          </div>
        </div>
      </div>
    </div>
  );
}
