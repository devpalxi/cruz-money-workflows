'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Check } from 'lucide-react';
import { getDisbursementFlags } from '@/lib/payoutFlow';

export const COLLECTOR_STEPS = [
  { step: 1, title: 'New payout details', path: '/collector/payout-details' },
  { step: 2, title: 'Payment breakdown', path: '/collector/payment-breakdown' },
  { step: 3, title: 'Email address', path: '/collector/email-address' },
  { step: 4, title: 'Primary ID', path: '/collector/primary-id' },
  { step: 5, title: 'Secondary ID (optional)', path: '/collector/secondary-id' },
  { step: 6, title: 'Bank account', path: '/collector/bank-account' },
  { step: 7, title: 'Cheque details', path: '/collector/cheque-details' },
  { step: 8, title: 'Summary', path: '/collector/summary' },
];

export default function Stepper({ currentStep = 1, completedThrough, className = '' }) {
  // Bank account and Cheque details always stay in the list - only the
  // method actually picked on the first step is skipped, not the step
  // itself, so both are always visible and marked "not required" when they
  // don't apply. `null` means the disbursement method hasn't been read yet.
  const [disbursementMethod, setDisbursementMethod] = useState(null);
  const [verificationMode, setVerificationMode] = useState('manual');

  // Re-read on every route change: this component lives in the flow layout,
  // which persists across client-side navigation, so a mount-only read would
  // keep showing choices the collector has since changed.
  const pathname = usePathname();

  useEffect(() => {
    try {
      const saved = JSON.parse(sessionStorage.getItem('payoutFormData') || '{}');
      setDisbursementMethod(saved.disbursementMethod || '');
      setVerificationMode(saved.verificationMode || 'manual');
    } catch (e) {
      setDisbursementMethod('');
    }
  }, [pathname]);

  const { hasBank, hasCheque } = getDisbursementFlags(disbursementMethod);

  // Steps the patron is completing on their own phone. Cheque details stay
  // with staff either way - a cheque is handed over at the counter.
  const PATRON_STEPS = [
    '/collector/primary-id',
    '/collector/secondary-id',
    '/collector/bank-account',
  ];

  const isWithPatron = (path) =>
    verificationMode === 'link' && PATRON_STEPS.includes(path);

  const isStepSkipped = (path) => {
    if (disbursementMethod === null) return false;
    if (isWithPatron(path)) return true;
    if (path === '/collector/bank-account') return !hasBank;
    if (path === '/collector/cheque-details') return !hasCheque;
    return false;
  };

  return (
    <nav aria-label="Payout creation steps" className={`w-[220px] flex-shrink-0 py-1 select-none ${className}`}>
      <ol className="space-y-0 relative list-none m-0 p-0">
        {COLLECTOR_STEPS.map((item, index) => {
          const skipped = isStepSkipped(item.path);
          const isDone = !skipped && (completedThrough !== undefined ? item.step <= completedThrough : item.step < currentStep);
          const isActive = !skipped && (completedThrough !== undefined ? false : item.step === currentStep);
          const isLast = index === COLLECTOR_STEPS.length - 1;

          return (
            <li key={item.step} className="relative pb-6 last:pb-0 flex items-center gap-3">
              {/* Vertical connector line */}
              {!isLast && (
                <div
                  aria-hidden="true"
                  className={`absolute left-[9px] top-[22px] w-[2px] h-[calc(100%-4px)] transition-colors z-0 ${
                    isDone ? 'bg-border-mid' : 'bg-border'
                  }`}
                />
              )}

              {/* Step indicator circle - done/active are true state, so they
                  take the brand teal used for every other selected/completed
                  state (checked checkbox, active segmented option, chosen
                  chip) rather than a one-off gray scale */}
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center relative z-10 transition-all flex-shrink-0 ${
                  skipped
                    ? 'border-2 border-border-mid bg-surface-page'
                    : isDone
                    ? 'bg-brand border-brand text-white'
                    : isActive
                    ? 'border-[3px] border-brand bg-white'
                    : 'border-2 border-border-mid bg-white'
                }`}
              >
                {isDone && (
                  <Check className="w-3 h-3 stroke-[3] text-white" />
                )}
              </div>

              {/* Step label / Link */}
              {isDone ? (
                <Link
                  href={item.path}
                  className="text-[14px] font-medium text-ink-mid hover:text-ink-hi hover:underline transition-colors z-10 no-underline leading-tight"
                >
                  {item.title}
                </Link>
              ) : (
                <span
                  className={`text-[14px] leading-tight z-10 transition-colors ${
                    skipped
                      ? 'font-normal text-ink-lo'
                      : isActive
                      ? 'font-bold text-brand'
                      : 'font-normal text-ink-lo'
                  }`}
                >
                  {item.title}
                  {skipped && (
                    <span className="ml-1 text-[12.5px]">
                      {isWithPatron(item.path) ? '(with patron)' : '(not required)'}
                    </span>
                  )}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
