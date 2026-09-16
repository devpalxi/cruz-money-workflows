import React from 'react';

export default function PageShell({
  children,
  maxWidth = 'max-w-[1440px]',
  className = '',
}) {
  return (
    <main className={`flex-1 w-full mx-auto px-4 sm:px-7 py-6 sm:py-8 ${maxWidth} ${className}`}>
      {children}
    </main>
  );
}
