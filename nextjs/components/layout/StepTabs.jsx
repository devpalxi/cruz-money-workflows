'use client';

import React, { useRef, useEffect } from 'react';
import Link from 'next/link';
import { COLLECTOR_STEPS } from './Stepper';

// Forced two-line label for each step, so every tab reads as two lines
// consistently instead of only wrapping when a title happens to be too long.
const STEP_LINES = {
  1: ['New payout', 'details'],
  2: ['Payment', 'breakdown'],
  3: ['Email', 'address'],
  4: ['Primary', 'ID'],
  5: ['Secondary', 'ID'],
  6: ['Bank', 'account'],
  7: ['Cheque', 'details'],
  8: ['Final', 'summary'],
};

function SegmentTab({ step, isActive, isDone, innerRef, className = '' }) {
  const textClass = `text-[13px] leading-snug transition-colors ${
    isActive
      ? 'font-bold text-ink-hi'
      : isDone
      ? 'font-semibold text-ink-mid group-hover:text-ink-hi'
      : 'font-medium text-ink-lo'
  }`;

  const content = (
    <>
      {/* Fixed-height label area (room for two lines) so bars line up on one
          baseline regardless of label length */}
      <div className="min-h-[36px] flex flex-col items-start justify-start">
        {STEP_LINES[step.step].map((line, i) => (
          <span key={i} className={textClass}>
            {line}
          </span>
        ))}
      </div>
      <div className="mt-1.5 h-[3px] w-full rounded-full bg-slate-200 overflow-hidden">
        <div className={`h-full rounded-full ${isDone || isActive ? 'bg-brand' : ''}`} />
      </div>
    </>
  );

  // Only completed steps are navigable - same rule the vertical Stepper
  // sidebar already follows (isDone renders a Link, active/upcoming don't).
  if (isDone) {
    return (
      <Link ref={innerRef} href={step.path} className={`text-left group cursor-pointer ${className}`}>
        {content}
      </Link>
    );
  }

  return (
    <div ref={innerRef} className={`text-left ${className}`}>
      {content}
    </div>
  );
}

// Horizontal, labeled-segment step indicator - the "Option 8" alternative to
// the vertical Stepper sidebar. Spreads evenly across the row on iPad-and-up
// widths (md+); below that it falls back to a horizontally scrollable strip
// at each tab's natural width, auto-centering the current step.
export default function StepTabs({ currentStep, completedThrough }) {
  const activeRef = useRef(null);

  useEffect(() => {
    activeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }, [currentStep]);

  return (
    <div className="relative w-full max-w-[1080px] mx-auto px-4 sm:px-6 pt-6 pb-2 border-b border-border">
      <div className="flex gap-6 md:gap-4 md:justify-between overflow-x-auto md:overflow-visible pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        {COLLECTOR_STEPS.map((s) => {
          const isDone = completedThrough !== undefined ? s.step <= completedThrough : s.step < currentStep;
          const isActive = completedThrough !== undefined ? false : s.step === currentStep;
          return (
            <SegmentTab
              key={s.step}
              step={s}
              isActive={isActive}
              isDone={isDone}
              innerRef={isActive ? activeRef : undefined}
              className="flex-shrink-0 md:flex-1 md:min-w-0"
            />
          );
        })}
      </div>
      {/* Fade hinting there's more to scroll to - only relevant below md, where it scrolls */}
      <div className="pointer-events-none absolute right-0 top-0 bottom-1 w-10 bg-gradient-to-l from-surface-page to-transparent md:hidden" />
    </div>
  );
}
