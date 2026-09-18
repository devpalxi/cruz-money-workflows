'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Check } from 'lucide-react';
import { getDisbursementFlags, needsBankStep } from '@/lib/payoutFlow';
import { getPatronCoverage } from '@/lib/verificationLink';

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
  // Cheque details stays in the list whether or not it applies, marked "not
  // required" when it doesn't. Bank account is different: a small cash-only
  // payout has no bank step at all, so it is dropped from the list rather
  // than shown greyed out. `null` means the form hasn't been read yet.
  const [disbursementMethod, setDisbursementMethod] = useState(null);
  const [showsBankStep, setShowsBankStep] = useState(true);
  const [patronCoverage, setPatronCoverage] = useState({ id: false, secondary: false, bank: false });

  // Re-read on every route change: this component lives in the flow layout,
  // which persists across client-side navigation, so a mount-only read would
  // keep showing choices the collector has since changed.
  const pathname = usePathname();

  useEffect(() => {
    try {
      const saved = JSON.parse(sessionStorage.getItem('payoutFormData') || '{}');
      setDisbursementMethod(saved.disbursementMethod || '');
      setShowsBankStep(needsBankStep(saved));
      setPatronCoverage(getPatronCoverage(saved));
    } catch (e) {
      setDisbursementMethod('');
    }
  }, [pathname]);

  const { hasBank, hasCheque } = getDisbursementFlags(disbursementMethod);
  const steps = showsBankStep
    ? COLLECTOR_STEPS
    : COLLECTOR_STEPS.filter((s) => s.path !== '/collector/bank-account');

  // Steps the patron is completing on their own phone, depending on the link
  // type the collector chose. Cheque details stay with staff either way - a
  // cheque is handed over at the counter.
  const PATRON_STEP_COVERAGE = {
    '/collector/primary-id': 'id',
    '/collector/secondary-id': 'secondary',
    '/collector/bank-account': 'bank',
  };

  const isWithPatron = (path) => Boolean(patronCoverage[PATRON_STEP_COVERAGE[path]]);

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
        {steps.map((item, index) => {
          const skipped = isStepSkipped(item.path);
          const isDone = !skipped && (completedThrough !== undefined ? item.step <= completedThrough : item.step < currentStep);
          const isActive = !skipped && (completedThrough !== undefined ? false : item.step === currentStep);
          const isLast = index === steps.length - 1;

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
