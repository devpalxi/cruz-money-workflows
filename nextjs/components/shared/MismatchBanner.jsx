'use client';

import React from 'react';
import { AlertTriangle } from 'lucide-react';
import Checkbox from '@/components/ui/Checkbox';

export default function MismatchBanner({
  title = 'Identity mismatch warning',
  description,
  confirmed = false,
  onConfirmChange,
  confirmLabel = 'I confirm this discrepancy has been manually verified and approved',
  className = '',
}) {
  return (
    <div
      className={`rounded-lg border border-amber-200 bg-amber-50 shadow-2xs p-4 sm:p-5 flex flex-col gap-3.5 transition-all ${className}`}
    >
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-[#f59e0b] flex-shrink-0 mt-0.5" />
        <div className="flex flex-col gap-1">
          <h4 className="text-sm font-bold text-[#102a43]">{title}</h4>
          {description && <p className="text-xs text-[#627d98] leading-relaxed">{description}</p>}
        </div>
      </div>

      {onConfirmChange && (
        <div className="pt-2 border-t border-state-warn-border/60">
          <Checkbox
            checked={confirmed}
            onChange={(e) => onConfirmChange(e.target.checked)}
            label={confirmLabel}
          />
        </div>
      )}
    </div>
  );
}
