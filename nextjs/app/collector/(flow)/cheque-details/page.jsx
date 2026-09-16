'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { getDisbursementFlags } from '@/lib/payoutFlow';

function ChequeDetailsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fromSummary = searchParams.get('from') === 'summary';

  const [payeeName, setPayeeName] = useState('');
  const [chequeNumber, setChequeNumber] = useState('');
  const [payeeTouched, setPayeeTouched] = useState(false);
  const [chequeTouched, setChequeTouched] = useState(false);
  const [hasCheque, setHasCheque] = useState(true);

  useEffect(() => {
    try {
      const saved = JSON.parse(sessionStorage.getItem('payoutFormData') || '{}');
      if (saved.chequePayeeName) setPayeeName(saved.chequePayeeName);
      if (saved.chequeNumber) setChequeNumber(saved.chequeNumber);

      const flags = getDisbursementFlags(saved.disbursementMethod);
      setHasCheque(flags.hasCheque);
    } catch (e) {}
  }, []);

  const persist = (patch) => {
    try {
      const current = JSON.parse(sessionStorage.getItem('payoutFormData') || '{}');
      sessionStorage.setItem('payoutFormData', JSON.stringify({ ...current, ...patch }));
    } catch (e) {}
  };

  const isPayeeValid = payeeName.trim() !== '';
  const isChequeValid = chequeNumber.trim() !== '';
  const isFormValid = isPayeeValid && isChequeValid;

  const handleNext = () => {
    if (!isFormValid) return;
    persist({
      chequePayeeName: payeeName.trim(),
      chequeNumber: chequeNumber.trim(),
    });
    router.push('/collector/summary');
  };

  const handleSkip = () => {
    router.push('/collector/summary');
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header Row */}
          <div className="flex items-center gap-6 mb-6">
            <Link
              href={fromSummary ? '/collector/summary' : '/collector/bank-account'}
              className="inline-flex items-center gap-1.5 text-[15px] font-bold text-ink-hi hover:text-black transition-colors underline cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 text-brand" />
              <span>{fromSummary ? 'Back to summary' : 'Back'}</span>
            </Link>
            <h1 className="text-xl sm:text-2xl font-bold text-ink-hi">Cheque details</h1>
          </div>

          {!hasCheque && (
            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#cbd5e1] mb-6">
              <p className="text-[14px] text-ink-mid m-0">
                Cheque wasn&apos;t selected as a payment method for this payout, so this step isn&apos;t required.
              </p>
            </div>
          )}

          {hasCheque && (
          <Card padding="md" className="border-border shadow-card mb-6 space-y-6">
            {/* Payee Name */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="payeeName" className="text-[14px] font-semibold text-ink-hi">
                Name the cheque is written for <span className="text-red-500">*</span>
              </label>
              <input
                id="payeeName"
                type="text"
                value={payeeName}
                placeholder="Full name"
                onChange={(e) => setPayeeName(e.target.value)}
                onBlur={() => setPayeeTouched(true)}
                className={`h-12 px-4 bg-white border rounded-md text-base text-ink-hi focus:outline-none focus:ring-2 transition-all ${
                  payeeTouched && !isPayeeValid
                    ? 'border-red-400 focus:border-red-500 focus:ring-red-100'
                    : 'border-border focus:border-ink-hi focus:ring-slate-200'
                }`}
              />
              {payeeTouched && !isPayeeValid && (
                <div className="flex items-center gap-1.5 text-xs text-red-600 font-medium mt-0.5">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>Enter the name the cheque is written for.</span>
                </div>
              )}
            </div>

            {/* Cheque Number */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="chequeNumber" className="text-[14px] font-semibold text-ink-hi">
                Cheque number <span className="text-red-500">*</span>
              </label>
              <input
                id="chequeNumber"
                type="text"
                inputMode="numeric"
                value={chequeNumber}
                placeholder="000000"
                maxLength={9}
                onChange={(e) => setChequeNumber(e.target.value.replace(/[^0-9]/g, '').slice(0, 9))}
                onBlur={() => setChequeTouched(true)}
                className={`h-12 px-4 bg-white border rounded-md text-base text-ink-hi font-mono focus:outline-none focus:ring-2 transition-all ${
                  chequeTouched && !isChequeValid
                    ? 'border-red-400 focus:border-red-500 focus:ring-red-100'
                    : 'border-border focus:border-ink-hi focus:ring-slate-200'
                }`}
              />
              {chequeTouched && !isChequeValid && (
                <div className="flex items-center gap-1.5 text-xs text-red-600 font-medium mt-0.5">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>Enter the cheque number.</span>
                </div>
              )}
            </div>
          </Card>
          )}

          {/* Actions */}
          {hasCheque && (
            <div className="mt-6">
              <Button
                size="lg"
                disabled={!isFormValid}
                onClick={handleNext}
                className="w-full h-12 text-[16px] font-semibold"
              >
                {fromSummary ? 'Save and return to summary' : 'Next'}
              </Button>
            </div>
          )}

          {!hasCheque && (
            <div className="mt-6">
              <Button
                size="lg"
                onClick={handleSkip}
                className="w-full h-12 text-[16px] font-semibold"
              >
                {fromSummary ? 'Return to summary' : 'Skip and continue'}
              </Button>
            </div>
          )}
    </div>
  );
}

export default function ChequeDetailsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-ink-mid">Loading cheque details...</div>}>
      <ChequeDetailsContent />
    </Suspense>
  );
}
