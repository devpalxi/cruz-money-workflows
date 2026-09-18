'use client';

import React from 'react';
import { AlertCircle, AlertTriangle } from 'lucide-react';
import { EXCLUSION_TYPES, formatRegisterDate } from '@/lib/exclusionRegister';

/**
 * Warns venue staff that a patron is on the exclusion register.
 *
 * This never blocks the collector. The win happened and it has to be recorded -
 * what changes is whether the money moves afterwards. A live self-exclusion
 * holds the payout until it expires; a venue ban or regulatory listing is
 * information the approver weighs up.
 */
export default function ExclusionAlert({ screening, className = '' }) {
  if (!screening) return null;

  const isHold = screening.blocksPayment;
  const Icon = isHold ? AlertCircle : AlertTriangle;

  return (
    <div
      className={`p-3.5 rounded-lg border shadow-2xs flex items-start gap-2.5 ${
        isHold ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200'
      } ${className}`}
    >
      <Icon
        className={`w-4 h-4 flex-shrink-0 mt-0.5 ${isHold ? 'text-red-500' : 'text-amber-600'}`}
      />
      <div className="space-y-0.5">
        <p className={`text-[15px] font-bold m-0 ${isHold ? 'text-[#991b1b]' : 'text-ink-hi'}`}>
          {isHold
            ? 'Patron is on a gambling self-exclusion'
            : `Patron is on the exclusion register (${screening.typeLabel.toLowerCase()})`}
        </p>
        <p className="text-[13.5px] text-ink-mid m-0">
          {isHold ? (
            <>
              {screening.entry.reason}. Record this payout as normal - the funds are held until the
              exclusion ends on{' '}
              <span className="font-semibold">{formatRegisterDate(screening.expiresAt)}</span>. Only
              an Authoriser can release them sooner.
            </>
          ) : (
            <>
              {screening.entry.reason}. Matched against the{' '}
              {(screening.source || 'venue list').toLowerCase()}. This does not stop the payout - an
              Approver decides whether to proceed.
            </>
          )}
        </p>
      </div>
    </div>
  );
}

// Re-exported so pages import the alert and the type constants from one place.
export { EXCLUSION_TYPES };
