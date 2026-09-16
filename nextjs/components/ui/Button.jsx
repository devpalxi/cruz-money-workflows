import React from 'react';

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  type = 'button',
  disabled = false,
  onClick,
  icon: Icon,
  iconPosition = 'left',
  ...props
}) {
  const baseStyles =
    'inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 select-none';

  const variants = {
    primary:
      'bg-brand hover:bg-brand-dark text-white shadow-subtle border border-transparent focus-visible:ring-brand font-semibold',
    secondary:
      'bg-surface-card hover:bg-slate-50 text-ink-hi border border-border hover:border-border-mid focus-visible:ring-brand',
    danger:
      'bg-red-600 hover:bg-red-700 text-white shadow-subtle border border-transparent focus-visible:ring-red-500 font-semibold',
    dangerSecondary:
      'bg-surface-card hover:bg-red-50 text-red-600 border border-red-200 hover:border-red-300 focus-visible:ring-red-400',
    ghost:
      'bg-transparent hover:bg-slate-100 text-ink-mid hover:text-ink-hi border border-transparent focus-visible:ring-slate-400',
    action:
      'bg-surface-card hover:bg-slate-50 text-ink-hi border border-border text-xs font-semibold focus-visible:ring-brand',
  };

  const sizes = {
    sm: 'h-8 px-3 text-xs rounded-md gap-1.5',
    md: 'h-11 px-5 text-sm rounded-md gap-2',
    lg: 'h-12 px-6 text-[16px] rounded-md gap-2.5',
    icon: 'h-10 w-10 p-2 rounded-md',
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${baseStyles} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
      {...props}
    >
      {Icon && iconPosition === 'left' && <Icon className="w-4 h-4 flex-shrink-0" />}
      {children}
      {Icon && iconPosition === 'right' && <Icon className="w-4 h-4 flex-shrink-0" />}
    </button>
  );
}
