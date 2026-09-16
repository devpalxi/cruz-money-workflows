'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import AppHeader from '@/components/layout/AppHeader';
import Stepper, { COLLECTOR_STEPS } from '@/components/layout/Stepper';
import StepTabs from '@/components/layout/StepTabs';

const STEPPER_STYLE_KEY = 'devStepperStyle';

// Sub-routes that belong to a step but aren't the step's own canonical path
// (mirrors the equivalent mapping in AppHeader's isLinkActive). Returns the
// props Stepper should get for the current route - normally `currentStep`,
// but "before you start" sits between two completed steps with nothing yet
// active, so it needs `completedThrough` instead.
function getStepperProps(pathname) {
  if (pathname.startsWith('/collector/before-you-start')) {
    return { completedThrough: 2 };
  }
  if (
    pathname.startsWith('/collector/licence-detail') ||
    pathname.startsWith('/collector/passport-detail') ||
    pathname.startsWith('/collector/other-documents') ||
    pathname.startsWith('/collector/no-id')
  ) {
    return { currentStep: 4 }; // Primary ID
  }
  if (pathname.startsWith('/collector/medicare')) return { currentStep: 5 }; // Secondary ID

  const match = COLLECTOR_STEPS.find((s) => pathname.startsWith(s.path));
  return { currentStep: match ? match.step : 1 };
}

// Shared scaffold for every Collector flow page: header, step indicator, and
// the main content column. Individual pages only render their own content
// now - this is the single place that lays out AppHeader/Stepper/main, so
// changing that shell happens once here instead of in all 13 page files.
//
// A dev-only toggle (bottom-right pill, default "Sidebar") lets you compare
// the original vertical Stepper sidebar against the horizontal StepTabs
// alternative live, in the real flow, without affecting default behavior -
// the toggle is stored per-tab in sessionStorage and defaults to "sidebar".
export default function CollectorFlowLayout({ children }) {
  const pathname = usePathname();
  const stepperProps = getStepperProps(pathname);
  const [stepperStyle, setStepperStyle] = useState('sidebar');

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(STEPPER_STYLE_KEY);
      if (saved === 'tabs') setStepperStyle('tabs');
    } catch (e) {}
  }, []);

  const setStyle = (style) => {
    setStepperStyle(style);
    try {
      sessionStorage.setItem(STEPPER_STYLE_KEY, style);
    } catch (e) {}
  };

  const usesTabs = stepperStyle === 'tabs';

  return (
    <>
      <AppHeader role="COLLECTOR" />

      {usesTabs && <StepTabs {...stepperProps} />}

      <div className="flex-1 w-full max-w-[1080px] mx-auto px-4 sm:px-6 py-8 flex flex-col md:flex-row gap-8 lg:gap-14">
        {!usesTabs && (
          <aside className="w-full md:w-60 flex-shrink-0">
            <div className="sticky top-24">
              <Stepper {...stepperProps} />
            </div>
          </aside>
        )}

        <main className="flex-1 min-w-0">{children}</main>
      </div>

      {/* Dev-only: compare stepper styles live. Not part of the real product UI. */}
      <div className="fixed bottom-4 right-4 z-50 flex items-center gap-1 p-1 rounded-full border border-dashed border-border bg-surface-card shadow-modal text-xs">
        <button
          type="button"
          onClick={() => setStyle('sidebar')}
          className={`px-2.5 py-1 rounded-full font-semibold transition-colors ${
            !usesTabs ? 'bg-slate-800 text-white' : 'text-ink-mid hover:bg-slate-100'
          }`}
        >
          Sidebar
        </button>
        <button
          type="button"
          onClick={() => setStyle('tabs')}
          className={`px-2.5 py-1 rounded-full font-semibold transition-colors ${
            usesTabs ? 'bg-slate-800 text-white' : 'text-ink-mid hover:bg-slate-100'
          }`}
        >
          Tabs
        </button>
      </div>
    </>
  );
}
