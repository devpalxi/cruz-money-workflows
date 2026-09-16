import React from 'react';

export default function SegmentedBooleanToggle({
  value = false,
  onChange,
  disabled = false,
  trueLabel = 'True',
  falseLabel = 'False',
  className = '',
}) {
  return (
    <div className={`inline-flex rounded-lg shadow-2xs ${disabled ? 'opacity-50 pointer-events-none' : ''} ${className}`}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => onChange && onChange(false)}
        className={`h-[34px] px-3.5 rounded-l-lg text-[12.5px] transition-all inline-flex items-center gap-1.5 cursor-pointer ${
          !value
            ? 'relative z-10 rounded-l-lg ring-1 ring-inset ring-[#dc2626] bg-[#fef2f2] text-[#dc2626] font-bold'
            : 'relative bg-white text-[#627d98] hover:text-[#102a43] hover:bg-[#f8fafc] ring-1 ring-inset ring-[#cbd5e1] font-semibold'
        }`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${!value ? 'bg-[#dc2626]' : 'bg-[#94a3b8]'}`} />
        {falseLabel}
      </button>
      <button
        type="button"
        disabled={disabled}
        onClick={() => onChange && onChange(true)}
        className={`h-[34px] px-3.5 -ml-px rounded-r-lg text-[12.5px] transition-all inline-flex items-center gap-1.5 cursor-pointer ${
          value
            ? 'relative z-10 -ml-px rounded-r-lg ring-1 ring-inset ring-[#0d9488] bg-[#f0fdfa] text-[#0d9488] font-bold'
            : 'relative bg-white text-[#627d98] hover:text-[#102a43] hover:bg-[#f8fafc] ring-1 ring-inset ring-[#cbd5e1] font-semibold'
        }`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${value ? 'bg-[#0d9488]' : 'bg-[#94a3b8]'}`} />
        {trueLabel}
      </button>
    </div>
  );
}
