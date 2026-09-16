import React from 'react';

export default function Badge({
  children,
  variant = 'neutral',
  size = 'md',
  className = '',
}) {
  const baseStyles =
    'inline-flex items-center font-bold tracking-tight rounded-full transition-colors select-none border';

  const variants = {
    pass: 'bg-[#ecfdf5] text-[#065f46] border-[#6ee7b7]',
    warn: 'bg-[#fffbeb] text-[#78350f] border-[#fcd34d]',
    fail: 'bg-[#fef2f2] text-[#991b1b] border-[#fca5a5]',
    info: 'bg-[#fffbeb] text-[#78350f] border-[#fcd34d]',
    neutral: 'bg-[#f8fafc] text-[#475569] border-[#cbd5e1]',
  };

  const sizes = {
    sm: 'px-2.5 py-0.5 text-[11px]',
    md: 'px-3 py-0.5 text-[12px]',
    lg: 'px-3.5 py-1 text-[13px]',
  };

  return (
    <span
      className={`${baseStyles} ${variants[variant] || variants.neutral} ${sizes[size] || sizes.md} ${className}`}
    >
      {children}
    </span>
  );
}

