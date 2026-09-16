'use client';

import React from 'react';

export default function RiskSegmentToggle({
  value = 'low',
  onChange,
  className = '',
}) {
  const options = [
    {
      id: 'low',
      label: 'Low',
      activeClass: 'border-state-pass-border text-state-pass-text bg-state-pass-bg ring-1 ring-state-pass-border',
      dotClass: 'bg-state-pass-dot',
    },
    {
      id: 'medium',
      label: 'Medium',
      activeClass: 'border-state-warn-border text-state-warn-text bg-state-warn-bg ring-1 ring-state-warn-border',
      dotClass: 'bg-state-warn-dot',
    },
    {
      id: 'high',
      label: 'High',
      activeClass: 'border-state-fail-border text-state-fail-text bg-state-fail-bg ring-1 ring-state-fail-border',
      dotClass: 'bg-state-fail-dot',
    },
  ];

  return (
    <div className={`inline-flex rounded-lg border border-border-mid bg-surface-card p-1 gap-1 shadow-subtle ${className}`}>
      {options.map((opt) => {
        const isSelected = value === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => onChange && onChange(opt.id)}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-md transition-all ${
              isSelected
                ? `${opt.activeClass} shadow-sm z-10`
                : 'text-ink-mid hover:bg-slate-50 border border-transparent'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${opt.dotClass}`} />
            <span>{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}
