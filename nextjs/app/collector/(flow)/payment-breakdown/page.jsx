'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Banknote, Building, FileText, AlertCircle, Sparkles } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { getEffectiveCashCap } from '@/lib/complianceGate';

function PaymentBreakdownContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fromSummary = searchParams.get('from') === 'summary';

  // Total winnings from step 1
  const [totalWinnings, setTotalWinnings] = useState(1250.0);
  const [disbursementMethod, setDisbursementMethod] = useState('Cash + Bank transfer');

  const [cashAmount, setCashAmount] = useState('500.00');
  const [confirmCash, setConfirmCash] = useState('');
  const [bankAmount, setBankAmount] = useState('750.00');
  const [chequeAmount, setChequeAmount] = useState('0.00');

  const [cashCapError, setCashCapError] = useState(false);
  const [cashOverStateCap, setCashOverStateCap] = useState(false);
  const [bankCapError, setBankCapError] = useState(false);
  const [chequeCapError, setChequeCapError] = useState(false);
  const [cashMismatchError, setCashMismatchError] = useState(false);

  // Regional limits state
  const [venueState, setVenueState] = useState('NSW');
  const [effectiveCashCap, setEffectiveCashCap] = useState(null);

  // Determine which sections are active. disbursementMethod is a "+"-joined
  // label built from any combination of atomic methods (see payout-details),
  // so membership is checked by substring rather than enumerating every combo.
  const hasCash = disbursementMethod.includes('Cash');
  const hasBank = disbursementMethod.includes('Bank transfer');
  const hasCheque = disbursementMethod.includes('Cheque');

  // Helper formatting
  const sanitizeDecimal = (val) => {
    let v = String(val || '').replace(/[^0-9.]/g, '');
    const parts = v.split('.');
    if (parts.length > 2) v = parts[0] + '.' + parts.slice(1).join('');
    const dotIndex = v.indexOf('.');
    if (dotIndex !== -1 && v.length - dotIndex - 1 > 2) {
      v = v.slice(0, dotIndex + 3);
    }
    return v;
  };

  const formatCurrency = (val) => {
    if (!val || val === '.') return val;
    const num = parseFloat(String(val).replace(/,/g, ''));
    if (isNaN(num)) return val;
    return num.toLocaleString('en-AU', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const rawNum = (val) => parseFloat(String(val || '').replace(/,/g, '')) || 0;

  const persist = (patch) => {
    try {
      const current = JSON.parse(sessionStorage.getItem('payoutFormData') || '{}');
      sessionStorage.setItem('payoutFormData', JSON.stringify({ ...current, ...patch }));
    } catch (e) {}
  };

  // Restore stored session data on mount
  useEffect(() => {
    try {
      const saved = JSON.parse(sessionStorage.getItem('payoutFormData') || '{}');
      const win = rawNum(saved.winAmount) || 1250.0;
      setTotalWinnings(win);

      const st = saved.venueState || 'NSW';
      setVenueState(st);

      const cap = getEffectiveCashCap({
        venueState: st,
        noEFTLimit: saved.noEFTLimit != null ? saved.noEFTLimit : 99999,
        qldCashLimitOverride: saved.qldCashLimitOverride || 1000,
      });
      setEffectiveCashCap(cap);

      const method = saved.disbursementMethod || 'Cash + Bank transfer';
      setDisbursementMethod(method);

      if (saved.confirmCash) setConfirmCash(saved.confirmCash);

      // disbursementMethod is a "+"-joined label built from any combination of
      // atomic methods, so the default split is derived from membership rather
      // than an enumerated list of combo strings (which can't scale as methods
      // are added).
      const methodHasCash = method.includes('Cash');
      const methodHasBank = method.includes('Bank transfer');
      const methodHasCheque = method.includes('Cheque');
      const activeCount = [methodHasCash, methodHasBank, methodHasCheque].filter(Boolean).length;

      let c = 0;
      let b = 0;
      let ch = 0;
      if (activeCount <= 1) {
        if (methodHasCash) c = win;
        else if (methodHasBank) b = win;
        else if (methodHasCheque) ch = win;
      } else if (methodHasCash) {
        c = Math.min(500, win);
        const remainder = Math.max(0, win - c);
        if (methodHasBank && methodHasCheque) {
          b = remainder / 2;
          ch = remainder / 2;
        } else if (methodHasBank) {
          b = remainder;
        } else if (methodHasCheque) {
          ch = remainder;
        }
      } else {
        // Bank transfer + Cheque, no cash
        b = win / 2;
        ch = win / 2;
      }

      const cAmt = saved.cashAmount || c.toFixed(2);
      const bAmt = saved.bankAmount || b.toFixed(2);
      const chAmt = saved.chequeAmount || ch.toFixed(2);
      setCashAmount(cAmt);
      setBankAmount(bAmt);
      setChequeAmount(chAmt);
      if (methodHasCash && cap !== null && parseFloat(cAmt) > cap) {
        setCashOverStateCap(true);
      }
    } catch (e) {}
  }, []);

  // Prototype / Dropdown Method Switcher
  const handleMethodChange = (newMethod) => {
    setDisbursementMethod(newMethod);

    // Derive the default split from method membership rather than an
    // enumerated list of combo strings - see the equivalent logic on load.
    const win = totalWinnings;
    const methodHasCash = newMethod.includes('Cash');
    const methodHasBank = newMethod.includes('Bank transfer');
    const methodHasCheque = newMethod.includes('Cheque');
    const activeCount = [methodHasCash, methodHasBank, methodHasCheque].filter(Boolean).length;

    let c = 0;
    let b = 0;
    let ch = 0;
    if (activeCount <= 1) {
      if (methodHasCash) c = win;
      else if (methodHasBank) b = win;
      else if (methodHasCheque) ch = win;
    } else if (methodHasCash) {
      c = Math.min(500, win);
      const remainder = Math.max(0, win - c);
      if (methodHasBank && methodHasCheque) {
        b = remainder / 2;
        ch = remainder / 2;
      } else if (methodHasBank) {
        b = remainder;
      } else if (methodHasCheque) {
        ch = remainder;
      }
    } else {
      // Bank transfer + Cheque, no cash
      b = win / 2;
      ch = win / 2;
    }

    const cAmt = c.toFixed(2);
    const bAmt = b.toFixed(2);
    const chAmt = ch.toFixed(2);
    setCashAmount(cAmt);
    setConfirmCash('');
    setBankAmount(bAmt);
    setChequeAmount(chAmt);
    setCashOverStateCap(methodHasCash && effectiveCashCap !== null && parseFloat(cAmt) > effectiveCashCap);
    persist({
      disbursementMethod: newMethod,
      cashAmount: cAmt,
      confirmCash: '',
      bankAmount: bAmt,
      chequeAmount: chAmt,
    });

    setCashCapError(false);
    setBankCapError(false);
    setChequeCapError(false);
    setCashMismatchError(false);
  };

  // Handle an amount field change with auto-balancing. Whichever fields are
  // active (cash/bank/cheque - any combination of the three) besides the one
  // just edited absorb the remainder, split evenly across them, so this works
  // the same whether one, two, or all three methods are active.
  const activeFields = [
    hasCash && 'cash',
    hasBank && 'bank',
    hasCheque && 'cheque',
  ].filter(Boolean);

  const setFieldAmount = (field, amt) => {
    if (field === 'cash') {
      setCashAmount(amt);
      setCashCapError(false);
      setCashOverStateCap(effectiveCashCap !== null && parseFloat(amt) > effectiveCashCap);
    } else if (field === 'bank') {
      setBankAmount(amt);
      setBankCapError(false);
    } else {
      setChequeAmount(amt);
      setChequeCapError(false);
    }
  };

  const handleAmountChange = (field, val) => {
    const clean = sanitizeDecimal(val);
    const num = parseFloat(clean || '0');
    const amountKey = `${field}Amount`;

    const exceedsTotal = num > totalWinnings;
    const exceedsState = field === 'cash' && effectiveCashCap !== null && num > effectiveCashCap;

    if (field === 'cash') {
      setCashAmount(clean);
      setCashCapError(exceedsTotal);
      setCashOverStateCap(exceedsState);
    } else if (field === 'bank') {
      setBankAmount(clean);
      setBankCapError(exceedsTotal);
    } else {
      setChequeAmount(clean);
      setChequeCapError(exceedsTotal);
    }

    if (exceedsTotal || exceedsState) {
      persist({ [amountKey]: clean });
      return;
    }

    const others = activeFields.filter((f) => f !== field);
    if (others.length === 0) {
      persist({ [amountKey]: clean });
      return;
    }

    const remaining = Math.max(0, totalWinnings - num);
    const share = (remaining / others.length).toFixed(2);
    const patch = { [amountKey]: clean };
    others.forEach((f) => {
      setFieldAmount(f, share);
      patch[`${f}Amount`] = share;
    });
    persist(patch);
  };

  // Validate confirm cash match
  useEffect(() => {
    if (!hasCash) {
      setCashMismatchError(false);
      return;
    }
    if (!confirmCash) {
      setCashMismatchError(false);
      return;
    }
    const mismatch = rawNum(cashAmount) !== rawNum(confirmCash);
    setCashMismatchError(mismatch);
  }, [cashAmount, confirmCash, hasCash]);

  // Form validity calculation
  const totalAllocated =
    (hasCash ? rawNum(cashAmount) : 0) +
    (hasBank ? rawNum(bankAmount) : 0) +
    (hasCheque ? rawNum(chequeAmount) : 0);

  const sumMatches = Math.abs(totalAllocated - totalWinnings) < 0.01;

  // A selected method needs its own allocation, unless another active method
  // already covers the full amount (e.g. cash absorbs 100%, leaving a
  // selected bank/cheque legitimately at $0.00). Generalized across whichever
  // combination of methods is active, not just cash + one other.
  const fieldAmounts = { cash: cashAmount, bank: bankAmount, cheque: chequeAmount };
  const isAmountAllocated = (field) =>
    rawNum(fieldAmounts[field]) > 0 ||
    activeFields.some((f) => f !== field && rawNum(fieldAmounts[f]) === totalWinnings);

  const isFormValid =
    !cashCapError &&
    !cashOverStateCap &&
    !bankCapError &&
    !chequeCapError &&
    sumMatches &&
    (!hasCash || (confirmCash.trim() !== '' && !cashMismatchError && rawNum(cashAmount) > 0)) &&
    (!hasBank || isAmountAllocated('bank')) &&
    (!hasCheque || isAmountAllocated('cheque'));

  const handleNext = () => {
    if (!isFormValid) return;
    persist({
      disbursementMethod,
      venueState,
      effectiveCashCap,
      cashAmount: hasCash ? formatCurrency(cashAmount) : '0.00',
      confirmCash: hasCash ? formatCurrency(confirmCash) : '',
      bankAmount: hasBank ? formatCurrency(bankAmount) : '0.00',
      chequeAmount: hasCheque ? formatCurrency(chequeAmount) : '0.00',
    });

    if (fromSummary) {
      router.push('/collector/summary');
    } else {
      router.push('/collector/before-you-start');
    }
  };

  const formattedTotal = formatCurrency(totalWinnings.toFixed(2));

  return (
    <div className="max-w-2xl mx-auto">
      {fromSummary && (
            <Link
              href="/collector/summary"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-mid hover:text-ink-hi underline mb-2 transition-colors"
            >
              &larr; Back to summary
            </Link>
          )}

          <div className="flex items-center gap-6 mb-6">
            <button
              type="button"
              onClick={() => router.push(fromSummary ? '/collector/summary' : '/collector/payout-details')}
              className="inline-flex items-center gap-1.5 text-[15px] font-bold text-ink-hi hover:text-black transition-colors underline cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 text-brand" />
              <span>Back</span>
            </button>
            <h1 className="text-xl sm:text-2xl font-bold text-ink-hi">Payment breakdown</h1>
          </div>

          {/* Total winnings - fixed context */}
          <Card padding="md" className="border-border shadow-none mb-4">
            <label className="text-[14px] font-semibold text-ink-hi">Total winnings</label>
            <div className="mt-1.5 flex items-center gap-2 h-12 px-4 rounded-md border border-border bg-slate-50">
              <span className="text-[17px] font-bold text-ink-mid font-mono select-none">$</span>
              <input
                type="text"
                value={formattedTotal}
                readOnly
                className="flex-1 min-w-0 h-full bg-transparent text-base font-mono text-ink-hi cursor-default focus:outline-none"
              />
              <span className="text-[13px] font-semibold text-ink-lo font-mono select-none">AUD</span>
            </div>
            <p className="text-[13px] text-ink-mid mt-1.5">
              Fixed from the win amount entered in the previous step.
            </p>
          </Card>

          <form onSubmit={(e) => e.preventDefault()} className="space-y-4 mb-6">
            {hasCash && (
              <Card padding="md" className="border-border shadow-none">
                <div className="flex items-center gap-3 mb-4">
                  <Banknote className="w-5 h-5 text-ink-hi flex-shrink-0" />
                  <h2 className="text-[16px] font-bold text-ink-hi">Cash amount</h2>
                </div>

                <div className="space-y-3">
                  <div>
                    <div
                      className={`flex items-center gap-2 h-12 px-4 rounded-md border bg-white ${
                        cashCapError || cashOverStateCap
                          ? 'border-red-400 focus-within:border-red-500 focus-within:ring-2 focus-within:ring-red-100'
                          : 'border-border focus-within:border-ink-hi focus-within:ring-2 focus-within:ring-slate-200'
                      }`}
                    >
                      <span className="text-[17px] font-bold text-ink-hi font-mono select-none">$</span>
                      <input
                        type="text"
                        inputMode="decimal"
                        value={cashAmount}
                        placeholder="0.00"
                        onChange={(e) => handleAmountChange('cash', e.target.value)}
                        onBlur={() => setCashAmount(formatCurrency(cashAmount))}
                        className="flex-1 min-w-0 h-full bg-transparent text-base font-mono text-ink-hi focus:outline-none"
                      />
                      <span className="text-[13px] font-semibold text-ink-lo font-mono select-none">AUD</span>
                    </div>
                    {cashCapError && (
                      <div className="flex items-center gap-1.5 text-xs text-red-600 font-medium mt-1.5">
                        <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                        <span>Cash amount cannot exceed total winnings ({formattedTotal} AUD).</span>
                      </div>
                    )}
                    {cashOverStateCap && !cashCapError && (
                      <div className="flex items-start gap-1.5 text-xs text-red-600 font-medium mt-1.5">
                        <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                        <span>
                          Cash amount exceeds the {venueState} statutory limit of{' '}
                          <span className="font-mono font-bold">${effectiveCashCap.toLocaleString('en-AU', { minimumFractionDigits: 2 })} AUD</span>.
                          The remainder must be paid by bank transfer or cheque.
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[13px] font-medium text-ink-mid">Confirm cash amount</label>
                    <div
                      className={`flex items-center gap-2 h-12 px-4 rounded-md border bg-white ${
                        cashMismatchError
                          ? 'border-red-400 focus-within:border-red-500 focus-within:ring-2 focus-within:ring-red-100'
                          : 'border-border focus-within:border-ink-hi focus-within:ring-2 focus-within:ring-slate-200'
                      }`}
                    >
                      <span className="text-[17px] font-bold text-ink-hi font-mono select-none">$</span>
                      <input
                        type="text"
                        inputMode="decimal"
                        value={confirmCash}
                        placeholder="0.00"
                        onChange={(e) => {
                          const val = sanitizeDecimal(e.target.value);
                          setConfirmCash(val);
                          persist({ confirmCash: val });
                        }}
                        onBlur={() => setConfirmCash(formatCurrency(confirmCash))}
                        className="flex-1 min-w-0 h-full bg-transparent text-base font-mono text-ink-hi focus:outline-none"
                      />
                      <span className="text-[13px] font-semibold text-ink-lo font-mono select-none">AUD</span>
                    </div>
                    {cashMismatchError && (
                      <div className="flex items-center gap-1.5 text-xs text-red-600 font-medium mt-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>Cash amounts do not match.</span>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            )}

            {hasBank && (
              <Card padding="md" className="border-border shadow-none">
                <div className="flex items-center gap-3 mb-4">
                  <Building className="w-5 h-5 text-ink-hi flex-shrink-0" />
                  <h2 className="text-[16px] font-bold text-ink-hi">Bank transfer</h2>
                </div>

                <div
                  className={`flex items-center gap-2 h-12 px-4 rounded-md border bg-white ${
                    bankCapError
                      ? 'border-red-400 focus-within:border-red-500 focus-within:ring-2 focus-within:ring-red-100'
                      : 'border-border focus-within:border-ink-hi focus-within:ring-2 focus-within:ring-slate-200'
                  }`}
                >
                  <span className="text-[17px] font-bold text-ink-hi font-mono select-none">$</span>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={bankAmount}
                    placeholder="0.00"
                    onChange={(e) => handleAmountChange('bank', e.target.value)}
                    onBlur={() => setBankAmount(formatCurrency(bankAmount))}
                    className="flex-1 min-w-0 h-full bg-transparent text-base font-mono text-ink-hi focus:outline-none"
                  />
                  <span className="text-[13px] font-semibold text-ink-lo font-mono select-none">AUD</span>
                </div>
                {bankCapError && (
                  <div className="flex items-center gap-1.5 text-xs text-red-600 font-medium mt-1.5">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>Bank transfer amount cannot exceed total winnings ({formattedTotal} AUD).</span>
                  </div>
                )}
              </Card>
            )}

            {hasCheque && (
              <Card padding="md" className="border-border shadow-none">
                <div className="flex items-center gap-3 mb-4">
                  <FileText className="w-5 h-5 text-ink-hi flex-shrink-0" />
                  <h2 className="text-[16px] font-bold text-ink-hi">Cheque</h2>
                </div>

                <div
                  className={`flex items-center gap-2 h-12 px-4 rounded-md border bg-white ${
                    chequeCapError
                      ? 'border-red-400 focus-within:border-red-500 focus-within:ring-2 focus-within:ring-red-100'
                      : 'border-border focus-within:border-ink-hi focus-within:ring-2 focus-within:ring-slate-200'
                  }`}
                >
                  <span className="text-[17px] font-bold text-ink-hi font-mono select-none">$</span>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={chequeAmount}
                    placeholder="0.00"
                    onChange={(e) => handleAmountChange('cheque', e.target.value)}
                    onBlur={() => setChequeAmount(formatCurrency(chequeAmount))}
                    className="flex-1 min-w-0 h-full bg-transparent text-base font-mono text-ink-hi focus:outline-none"
                  />
                  <span className="text-[13px] font-semibold text-ink-lo font-mono select-none">AUD</span>
                </div>
                {chequeCapError && (
                  <div className="flex items-center gap-1.5 text-xs text-red-600 font-medium mt-1.5">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>Cheque amount cannot exceed total winnings ({formattedTotal} AUD).</span>
                  </div>
                )}
              </Card>
            )}

            <div className="pt-2">
              <Button
                size="lg"
                disabled={!isFormValid}
                onClick={handleNext}
                className="w-full h-12 text-[16px] font-semibold"
              >
                {fromSummary ? 'Save and return to summary' : 'Next'}
              </Button>
            </div>
          </form>

          <div className="space-y-3">
            {/* Disbursement Method Switcher */}
            <div className="flex items-center gap-2.5 p-3 rounded-lg border border-dashed border-border bg-white flex-wrap text-xs">
              <span className="font-semibold text-ink-mid flex items-center gap-1 mr-1">
                <Sparkles className="w-3.5 h-3.5 text-brand" />
                Disbursement method:
              </span>
              <div className="inline-flex rounded-lg shadow-2xs">
                {[
                  'Cash',
                  'Bank transfer',
                  'Cheque',
                  'Cash + Bank transfer',
                  'Cash + Cheque',
                  'Bank transfer + Cheque',
                  'Cash + Bank transfer + Cheque',
                ].map((method, idx, arr) => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => handleMethodChange(method)}
                    className={`h-[32px] px-2.5 text-xs transition-all cursor-pointer ${
                      idx === 0 ? 'rounded-l-lg' : '-ml-px'
                    } ${idx === arr.length - 1 ? 'rounded-r-lg' : ''} ${
                      disbursementMethod === method
                        ? 'relative z-10 bg-[#f0fdfa] text-[#0d9488] font-bold ring-1 ring-inset ring-[#0d9488]'
                        : 'relative bg-white text-ink-mid hover:text-ink-hi hover:bg-[#f8fafc] ring-1 ring-inset ring-[#cbd5e1] font-semibold'
                    }`}
                  >
                    {method}
                  </button>
                ))}
              </div>
            </div>
          </div>
    </div>
  );
}

export default function PaymentBreakdownPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-ink-mid">Loading payment breakdown...</div>}>
      <PaymentBreakdownContent />
    </Suspense>
  );
}
