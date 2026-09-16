import React from 'react';

export default function Input({
  label,
  sublabel,
  error,
  icon: Icon,
  className = '',
  size = 'md',
  id,
  type = 'text',
  ...props
}) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  const sizes = {
    sm: 'h-9 px-3 text-xs',
    md: 'h-11 px-3.5 text-sm',
    lg: 'h-12 px-4 text-base', // Touch-friendly Collector field
  };

  return (
    <div className="w-full flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="text-[13px] font-semibold text-ink-mid flex items-center justify-between"
        >
          <span>{label}</span>
          {sublabel && <span className="text-[11px] font-normal text-ink-lo">{sublabel}</span>}
        </label>
      )}

      <div className="relative flex items-center">
        {Icon && (
          <div className="absolute left-3.5 text-ink-lo pointer-events-none">
            <Icon className="w-4 h-4" />
          </div>
        )}

        <input
          id={inputId}
          type={type}
          className={`w-full bg-white border ${
            error ? 'border-red-400 focus:border-red-500 focus:ring-red-100' : 'border-border focus:border-ink-hi focus:ring-slate-200'
          } rounded-md text-ink-hi placeholder:text-ink-lo focus:outline-none focus:ring-3 transition-all ${
            Icon ? 'pl-10' : ''
          } ${sizes[size] || sizes.md} ${className}`}
          {...props}
        />
      </div>

      {error && <span className="text-xs text-red-600 font-medium">{error}</span>}
    </div>
  );
}
