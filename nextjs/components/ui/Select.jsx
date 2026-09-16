import React from 'react';
import { ChevronDown } from 'lucide-react';

export default function Select({
  label,
  sublabel,
  error,
  options = [],
  children,
  className = '',
  size = 'md',
  id,
  ...props
}) {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  const sizes = {
    sm: 'h-9 px-3 text-xs',
    md: 'h-11 px-3.5 text-sm',
    lg: 'h-12 px-4 text-base',
  };

  return (
    <div className="w-full flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={selectId}
          className="text-[13px] font-semibold text-ink-mid flex items-center justify-between"
        >
          <span>{label}</span>
          {sublabel && <span className="text-[11px] font-normal text-ink-lo">{sublabel}</span>}
        </label>
      )}

      <div className="relative flex items-center">
        <select
          id={selectId}
          className={`w-full bg-white border ${
            error ? 'border-red-400 focus:border-red-500 focus:ring-red-100' : 'border-border focus:border-ink-hi focus:ring-slate-200'
          } rounded-md text-ink-hi placeholder:text-ink-lo focus:outline-none focus:ring-3 appearance-none transition-all pr-10 ${
            sizes[size] || sizes.md
          } ${className}`}
          {...props}
        >
          {children ||
            options.map((opt, i) =>
              typeof opt === 'string' ? (
                <option key={i} value={opt}>
                  {opt}
                </option>
              ) : (
                <option key={opt.value || i} value={opt.value}>
                  {opt.label}
                </option>
              )
            )}
        </select>
        <ChevronDown className="w-4 h-4 text-ink-lo absolute right-3 pointer-events-none" />
      </div>

      {error && <span className="text-xs text-red-600 font-medium">{error}</span>}
    </div>
  );
}
