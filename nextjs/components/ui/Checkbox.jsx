import React from 'react';

export default function Checkbox({
  label,
  sublabel,
  checked = false,
  onChange,
  id,
  className = '',
  disabled = false,
  variant = 'default',
  size = 'sm',
  ...props
}) {
  const checkboxId = id || (label ? label.toLowerCase().replace(/[^a-z0-9]/g, '-') : undefined);

  const sizeClasses = {
    sm: 'w-5 h-5 rounded-[5px]',
    md: 'w-[22px] h-[22px] rounded-[6px]',
    lg: 'w-[26px] h-[26px] rounded-[6px]',
  }[size] || 'w-5 h-5 rounded-[5px]';

  const iconSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4',
  }[size] || 'w-3.5 h-3.5';

  const activeColor =
    variant === 'ink'
      ? 'bg-ink-hi border-ink-hi text-white'
      : 'bg-[#0d9488] border-[#0d9488] text-white';

  return (
    <label
      htmlFor={checkboxId}
      className={`inline-flex items-start gap-3 cursor-pointer select-none ${
        disabled ? 'opacity-50 pointer-events-none' : ''
      } ${className}`}
    >
      <div className="relative flex items-center justify-center mt-0.5 flex-shrink-0">
        <input
          id={checkboxId}
          type="checkbox"
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          className="sr-only"
          {...props}
        />
        <div
          className={`${sizeClasses} border-2 flex items-center justify-center transition-all ${
            checked
              ? activeColor
              : 'border-[#cbd5e1] bg-white hover:border-[#94a3b8]'
          }`}
        >
          {checked && (
            <svg
              className={`${iconSizes} text-white`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          )}
        </div>
      </div>

      {(label || sublabel) && (
        <div className="flex flex-col text-[15px] pt-0.5 leading-snug">
          {label && <span className="font-semibold text-ink-hi">{label}</span>}
          {sublabel && <span className="text-xs text-ink-mid">{sublabel}</span>}
        </div>
      )}
    </label>
  );
}

