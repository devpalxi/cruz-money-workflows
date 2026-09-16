import React from 'react';

export default function StatusPill({
  children,
  variant = 'neutral',
  className = '',
}) {
  const variants = {
    pass: 'bg-[#ecfdf5] text-[#065f46] border-[#6ee7b7]',
    warn: 'bg-[#fffbeb] text-[#78350f] border-[#fcd34d]',
    fail: 'bg-[#fef2f2] text-[#991b1b] border-[#fca5a5]',
    info: 'bg-[#fffbeb] text-[#78350f] border-[#fcd34d]',
    neutral: 'bg-[#f8fafc] text-[#475569] border-[#cbd5e1]',
  };

  const currentClass = variants[variant] || variants.neutral;

  return (
    <span
      className={`inline-flex items-center justify-center px-3 py-1 rounded-full border text-[12.5px] font-bold tracking-tight select-none whitespace-nowrap ${currentClass} ${className}`}
    >
      {children}
    </span>
  );
}

