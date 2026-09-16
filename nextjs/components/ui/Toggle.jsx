import React from 'react';

export default function Toggle({
  checked = false,
  onChange,
  label,
  sublabel,
  id,
  disabled = false,
  className = '',
}) {
  const toggleId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div
      className={`flex items-center justify-between gap-4 p-3 bg-surface-card border border-border rounded-lg hover:bg-slate-50/50 transition-colors ${
        disabled ? 'opacity-50 pointer-events-none' : ''
      } ${className}`}
    >
      {(label || sublabel) && (
        <div className="flex flex-col">
          {label && <span className="text-sm font-semibold text-ink-hi">{label}</span>}
          {sublabel && <span className="text-xs text-ink-mid">{sublabel}</span>}
        </div>
      )}

      <button
        id={toggleId}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange && onChange(!checked)}
        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 ${
          checked ? 'bg-brand' : 'bg-slate-300'
        }`}
      >
        <span
          aria-hidden="true"
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );
}
