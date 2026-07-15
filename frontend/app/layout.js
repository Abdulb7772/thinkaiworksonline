import '../styles/globals.css';
import SessionProvider from '@/lib/SessionProvider';

export const metadata = {
  title: 'ThinkAIWorks — Command Hub',
  description: 'Dashboard for ThinkAIWorks',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Clash+Display:wght@400;500;600;700&family=Cabinet+Grotesk:wght@300;400;500;700;800&family=JetBrains+Mono:wght@300;400;500&display=swap" rel="stylesheet" />
        <link rel="icon" href="/img/logo.jpeg" />
        <link rel="apple-touch-icon" sizes="180x180" href="/img/logo.jpeg" />
      </head>
      <body>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
