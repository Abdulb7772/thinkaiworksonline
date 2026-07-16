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
      <body style={{ margin: 0 }}>
        {pathname === '/' ? children : booted ? <SessionProvider>{children}</SessionProvider> : null}
      </body>
    </html>
  );
}
