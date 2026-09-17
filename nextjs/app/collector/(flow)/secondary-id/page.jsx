'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, ChevronRight } from 'lucide-react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { getStepAfterSecondary, getStepBeforeSecondary } from '@/lib/payoutFlow';

function SecondaryIdContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fromSummary = searchParams.get('from') === 'summary';

  // Resolved after mount: the target depends on sessionStorage, which the
  // server render cannot see.
  const [backHref, setBackHref] = useState('/collector/primary-id');
  useEffect(() => {
    setBackHref(getStepBeforeSecondary());
  }, []);

  const persist = (patch) => {
    try {
      const current = JSON.parse(sessionStorage.getItem('payoutFormData') || '{}');
      sessionStorage.setItem('payoutFormData', JSON.stringify({ ...current, ...patch }));
    } catch (e) {}
  };

  // Only one document type is offered, so selecting it is the action - no separate confirm step
  const handleSelectMedicare = () => {
    persist({ secondaryDoc: 'medicare' });
    router.push(`/collector/medicare${fromSummary ? '?from=summary' : ''}`);
  };

  const handleSkip = () => {
    persist({ secondaryDoc: 'none', secondarySkipped: true });
    // Bank account is always the next step - it shows its own "not
    // required" message when Bank transfer wasn't selected.
    router.push(fromSummary ? '/collector/summary' : getStepAfterSecondary());
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header Row */}
          <div className="flex items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-6">
              <Link
                href={backHref}
                className="inline-flex items-center gap-1.5 text-[15px] font-bold text-ink-hi hover:text-black transition-colors underline cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4 text-brand" />
                <span>Back</span>
              </Link>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl sm:text-2xl font-bold text-ink-hi">Secondary ID</h1>
                <Badge variant="neutral" size="sm">Optional</Badge>
              </div>
            </div>
          </div>

          <Card padding="md" className="border-border shadow-card mb-6">
            <p className="text-sm text-ink-mid leading-relaxed mb-5">
              Adding a secondary ID increases the verification match strength and helps verify
              identity automatically when primary ID verification requires additional evidence.
            </p>

            <div className="space-y-2">
              <label className="text-[14px] font-semibold text-ink-hi">
                ID document type
              </label>
              <button
                type="button"
                onClick={handleSelectMedicare}
                className="w-full h-14 px-5 rounded-md border border-[#cbd5e1] hover:border-brand bg-white hover:bg-slate-50 text-left transition-all flex items-center justify-between cursor-pointer"
              >
                <div>
                  <span className="block font-semibold text-base text-ink-hi">Medicare card</span>
                  <span className="block text-xs text-ink-mid mt-0.5">
                    Green, blue, or yellow Australian Medicare cards
                  </span>
                </div>
                <ChevronRight className="w-5 h-5 text-ink-lo flex-shrink-0" />
              </button>
            </div>
          </Card>

          {/* Actions */}
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={handleSkip}
              className="text-[13px] font-semibold text-ink-mid hover:text-ink-hi underline"
            >
              Skip this step
            </button>
          </div>
    </div>
  );
}

export default function SecondaryIdLandingPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-ink-mid">Loading secondary ID...</div>}>
      <SecondaryIdContent />
    </Suspense>
  );
}
