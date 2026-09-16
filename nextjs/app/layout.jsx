import './globals.css';

export const metadata = {
  title: 'Riverside Hotel — Payouts & Compliance Platform',
  description: 'Manage, audit, and coordinate transaction disbursements and KYC compliance across venues.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-surface-page text-ink-hi antialiased flex flex-col">
        {children}
      </body>
    </html>
  );
}
