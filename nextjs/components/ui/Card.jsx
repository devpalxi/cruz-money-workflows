import React from 'react';

export default function Card({
  children,
  className = '',
  padding = 'md',
  hover = false,
  ...props
}) {
  const paddings = {
    none: 'p-0',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  return (
    <div
      className={`bg-surface-card border border-border rounded-lg shadow-card ${
        paddings[padding] || paddings.md
      } ${hover ? 'hover:border-border-mid transition-all' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
