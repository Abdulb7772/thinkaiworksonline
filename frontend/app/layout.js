'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import '../styles/globals.css';
import SessionProvider from '@/lib/SessionProvider';

export default function RootLayout({ children }) {
  const pathname = usePathname();
  const [booted, setBooted] = useState(false);

  useEffect(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    import('next-auth/react')
      .then(({ signOut }) => signOut({ redirect: false }))
      .catch(() => {});

    setBooted(true);
  }, []);

  return (
    <html lang="en">
      <head>
        <title>ThinkAIWorks — Command Hub</title>
        <meta name="description" content="Dashboard for ThinkAIWorks" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Clash+Display:wght@400;500;600;700&family=Cabinet+Grotesk:wght@300;400;500;700;800&family=JetBrains+Mono:wght@300;400;500&display=swap" rel="stylesheet" />
        <link rel="icon" href="/img/logo.jpeg" />
        <link rel="apple-touch-icon" sizes="180x180" href="/img/logo.jpeg" />
      </head>
      <body style={{ margin: 0, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <div style={{ flex: 1 }}>
          {pathname === '/' ? children : booted ? <SessionProvider>{children}</SessionProvider> : null}
        </div>
        <footer style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 32px', background: '#0b0d17', borderTop: '1px solid #1e2340', fontFamily: 'Cabinet Grotesk, sans-serif' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <img src="/img/logo.jpeg" alt="ThinkAI Works" style={{ width: 36, height: 36, borderRadius: 8, objectFit: 'cover' }} />
            <span style={{ color: '#eceef5', fontWeight: 600, fontSize: 15 }}>ThinkAI Works</span>
          </div>
          <div style={{ color: '#4a5070', fontSize: 13 }}>&copy; {new Date().getFullYear()} ThinkAI Works. All rights reserved.</div>
          <div style={{ color: '#4a5070', fontSize: 11 }}>Created by Muhammad Abdul Basit</div>
        </footer>
      </body>
    </html>
  );
}
