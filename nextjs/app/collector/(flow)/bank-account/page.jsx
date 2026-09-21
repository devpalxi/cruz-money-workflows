'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ArrowLeft,
  Check,
  AlertCircle,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Checkbox from '@/components/ui/Checkbox';
import { getDisbursementFlags, getStepBeforeBank, needsBankStep } from '@/lib/payoutFlow';
import { getSavedBankAccount, maskAccountNumber } from '@/lib/savedBankAccount';
import { isSavedBankReuseEnabled } from '@/lib/venueCompliance';

const SCENARIOS = {
  match: {
    label: 'Match',
    tag: '[M]',
    kind: 'match',
  },
  closeMatch: {
    label: 'Close match',
    tag: '[CM]',
    kind: 'closeMatch',
  },
  noMatchNoBypass: {
    label: 'No match (no bypass)',
    tag: '[INM]',
    kind: 'noMatch',
    bypass: false,
  },
  noMatchBypassIndividual: {
    label: 'No match (bypass, individual)',
    tag: '[INM]',
    kind: 'noMatch',
    bypass: true,
    notesPlaceholder: 'Add a note about this no match result, please avoid any sensitive information.',
  },
  noMatchBypassNonIndividual: {
    label: 'No match (bypass, non-individual)',
    tag: '[NINM]',
    kind: 'noMatch',
    bypass: true,
    notesPlaceholder: 'Add a note about this no match result, please avoid any sensitive information.',
  },
};

function BankAccountContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fromSummary = searchParams.get('from') === 'summary';

  const [accountName, setAccountName] = useState("James O'Sullivan");
  const [bsb, setBsb] = useState('062-000');
  const [accountNumber, setAccountNumber] = useState('241-325-325');
  const [bsbTouched, setBsbTouched] = useState(false);
  const [acctTouched, setAcctTouched] = useState(false);

  const [isValidating, setIsValidating] = useState(false);
  const [validationState, setValidationState] = useState('idle'); // 'idle' | 'running' | 'match' | 'closeMatch' | 'noMatch'
  const [scenario, setScenario] = useState('match');

  // Bypass state
  const [bypassConfirmed, setBypassConfirmed] = useState(false);
  const [bypassNotes, setBypassNotes] = useState('');

  const [disbursementMethod, setDisbursementMethod] = useState('');
  const [bankBackHref, setBankBackHref] = useState('/collector/secondary-id');

  // An account kept from an earlier payout (or the club system). While the
  // collector is using it the fields are read only and the number is masked;
  // CoP still runs on it every time.
  const [savedAccount, setSavedAccount] = useState(null);
  const [usingSaved, setUsingSaved] = useState(false);

  useEffect(() => {
    try {
      const saved = JSON.parse(sessionStorage.getItem('payoutFormData') || '{}');
      if (saved.accountName) {
        setAccountName(saved.accountName);
      } else if (saved.firstName && saved.lastName) {
        setAccountName(`${saved.firstName} ${saved.lastName}`);
      } else {
        setAccountName("James O'Sullivan");
      }
      if (saved.bsb) setBsb(saved.bsb);
      if (saved.accountNumber) setAccountNumber(saved.accountNumber);
      const kept = isSavedBankReuseEnabled() ? getSavedBankAccount(saved) : null;
      if (kept) {
        setSavedAccount(kept);
        // Coming back to this page after typing a different account keeps that choice.
        if (saved.bankSource !== 'entered') {
          setUsingSaved(true);
          setAccountName(kept.accountName);
          setBsb(kept.bsb);
          setAccountNumber(kept.accountNumber);
        }
      }
      setBankBackHref(getStepBeforeBank(saved.secondaryDoc, saved));
      if (saved.disbursementMethod) setDisbursementMethod(saved.disbursementMethod);
      // This payout has no bank step - reached by a stale link or a typed URL,
      // so carry on to the step that follows instead of showing a dead page.
      if (!needsBankStep(saved)) router.replace('/collector/cheque-details');
    } catch (e) {}
  }, [router]);

  const persist = (patch) => {
    try {
      const current = JSON.parse(sessionStorage.getItem('payoutFormData') || '{}');
      sessionStorage.setItem('payoutFormData', JSON.stringify({ ...current, ...patch }));
    } catch (e) {}
  };

  const handleUseSaved = () => {
    if (!savedAccount) return;
    setUsingSaved(true);
    setAccountName(savedAccount.accountName);
    setBsb(savedAccount.bsb);
    setAccountNumber(savedAccount.accountNumber);
    setBsbTouched(false);
    setAcctTouched(false);
    setValidationState('idle');
  };

  const handleUseDifferent = () => {
    setUsingSaved(false);
    setAccountName('');
    setBsb('');
    setAccountNumber('');
    setBsbTouched(false);
    setAcctTouched(false);
    setValidationState('idle');
  };

  const handleBsbChange = (e) => {
    let digits = e.target.value.replace(/[^0-9]/g, '').slice(0, 6);
    let formatted = digits.length > 3 ? `${digits.slice(0, 3)}-${digits.slice(3)}` : digits;
    setBsb(formatted);
    setValidationState('idle');
  };

  const handleAcctChange = (e) => {
    let digits = e.target.value.replace(/[^0-9]/g, '').slice(0, 9);
    let formatted = digits.replace(/(\d{3})(?=\d)/g, '$1-');
    setAccountNumber(formatted);
    setValidationState('idle');
  };

  const { hasBank } = getDisbursementFlags(disbursementMethod);

  const isBsbValid = bsb.replace(/[^0-9]/g, '').length === 6;
  const isAcctValid = accountNumber.replace(/[^0-9]/g, '').length >= 6;

  const isFormValid =
    accountName.trim() !== '' &&
    isBsbValid &&
    isAcctValid;

  const handleRunValidation = () => {
    if (!isFormValid) return;
    setIsValidating(true);
    setValidationState('running');

    setTimeout(() => {
      setIsValidating(false);
      const s = SCENARIOS[scenario];
      const baseName = accountName.replace(/\s*\[[A-Z]+\]\s*$/, '').trim() || "James O'Sullivan";
      const taggedName = `${baseName} ${s.tag}`;
      setAccountName(taggedName);
      setBypassConfirmed(false);
      setBypassNotes('');

      if (s.kind === 'match') {
        setValidationState('match');
      } else if (s.kind === 'closeMatch') {
        setValidationState('closeMatch');
      } else {
        setValidationState('noMatch');
      }
    }, 900);
  };

  const handleProceed = () => {
    let copResult = 'match';
    if (validationState === 'closeMatch') copResult = 'close';
    else if (validationState === 'noMatch') copResult = 'fail';

    persist({
      accountName,
      bsb,
      accountNumber,
      bankSource: usingSaved && savedAccount ? savedAccount.source : 'entered',
      bankSavedNote: usingSaved && savedAccount ? savedAccount.note : '',
      copStatus: validationState,
      copResult,
      bypassNotes: bypassConfirmed ? bypassNotes : '',
    });
    router.push(fromSummary ? '/collector/summary' : '/collector/cheque-details');
  };

  const handleSkip = () => {
    router.push(fromSummary ? '/collector/summary' : '/collector/cheque-details');
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header Row */}
          <div className="flex items-center gap-6 mb-6">
            <Link
              href={fromSummary ? '/collector/summary' : bankBackHref}
              className="inline-flex items-center gap-1.5 text-[15px] font-bold text-ink-hi hover:text-black transition-colors underline cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 text-brand" />
              <span>{fromSummary ? 'Back to summary' : 'Back'}</span>
            </Link>
            <h1 className="text-xl sm:text-2xl font-bold text-ink-hi">Bank account</h1>
          </div>

          {!hasBank && (
            <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-[#cbd5e1] mb-6">
              <p className="text-[14px] text-ink-mid m-0">
                Bank transfer wasn&apos;t selected as a payment method for this payout, so this step isn&apos;t required.
              </p>
            </div>
          )}

          {hasBank && savedAccount && (
            <div className="mb-6 space-y-3">
              <p className="text-[14px] font-semibold text-ink-hi m-0">Saved bank account found for this winner</p>
              <button
                type="button"
                onClick={handleUseSaved}
                aria-pressed={usingSaved}
                className={`w-full text-left p-4 rounded-md border cursor-pointer transition-colors ${
                  usingSaved ? 'border-[#99f6e4] bg-[#f0fdfa]' : 'border-border bg-white hover:border-border-mid'
                }`}
              >
                <span className="block text-[15px] font-bold text-ink-hi">Use saved account</span>
                <span className="block text-[14px] text-ink-mid mt-0.5">
                  {savedAccount.accountName}, BSB <span className="font-mono">{savedAccount.bsb}</span>, account <span className="font-mono">{maskAccountNumber(savedAccount.accountNumber)}</span>
                </span>
                <span className="block text-[13px] text-ink-mid mt-0.5">{savedAccount.note}</span>
              </button>
              <button
                type="button"
                onClick={handleUseDifferent}
                aria-pressed={!usingSaved}
                className={`w-full text-left p-4 rounded-md border cursor-pointer transition-colors ${
                  !usingSaved ? 'border-[#99f6e4] bg-[#f0fdfa]' : 'border-border bg-white hover:border-border-mid'
                }`}
              >
                <span className="block text-[15px] font-bold text-ink-hi">Enter a different account</span>
                <span className="block text-[13px] text-ink-mid mt-0.5">The details are checked as a new account.</span>
              </button>
            </div>
          )}

          {hasBank && (
          <Card padding="md" className="border-border shadow-card mb-6 space-y-6">
            {/* Account Name */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="accountName" className="text-[14px] font-semibold text-ink-hi">
                Account name <span className="text-red-500">*</span>
              </label>
              <input
                id="accountName"
                type="text"
                value={accountName}
                readOnly={usingSaved}
                placeholder="Account name"
                onChange={(e) => {
                  setAccountName(e.target.value);
                  setValidationState('idle');
                }}
                className="h-12 px-4 bg-white border border-border rounded-md text-base text-ink-hi focus:border-ink-hi focus:ring-2 focus:ring-slate-200 outline-none"
              />
            </div>

            {/* BSB */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="bsb" className="text-[14px] font-semibold text-ink-hi">
                BSB number <span className="text-red-500">*</span>
              </label>
              <input
                id="bsb"
                type="text"
                value={bsb}
                readOnly={usingSaved}
                placeholder="000-000"
                maxLength={7}
                inputMode="numeric"
                onChange={handleBsbChange}
                onBlur={() => setBsbTouched(true)}
                className={`h-12 px-4 bg-white border rounded-md text-base text-ink-hi font-mono focus:outline-none focus:ring-2 transition-all ${
                  bsbTouched && !isBsbValid
                    ? 'border-red-400 focus:border-red-500 focus:ring-red-100'
                    : 'border-border focus:border-ink-hi focus:ring-slate-200'
                }`}
              />
              {bsbTouched && !isBsbValid && (
                <div className="flex items-center gap-1.5 text-xs text-red-600 font-medium mt-0.5">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>BSB must be 6 digits.</span>
                </div>
              )}
            </div>

            {/* Account Number */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="accountNumber" className="text-[14px] font-semibold text-ink-hi">
                Account number <span className="text-red-500">*</span>
              </label>
              <input
                id="accountNumber"
                type="text"
                value={usingSaved ? maskAccountNumber(accountNumber) : accountNumber}
                readOnly={usingSaved}
                placeholder="241-325-325"
                maxLength={11}
                inputMode="numeric"
                onChange={handleAcctChange}
                onBlur={() => setAcctTouched(true)}
                className={`h-12 px-4 bg-white border rounded-md text-base text-ink-hi font-mono focus:outline-none focus:ring-2 transition-all ${
                  acctTouched && !isAcctValid
                    ? 'border-red-400 focus:border-red-500 focus:ring-red-100'
                    : 'border-border focus:border-ink-hi focus:ring-slate-200'
                }`}
              />
              {acctTouched && !isAcctValid && (
                <div className="flex items-center gap-1.5 text-xs text-red-600 font-medium mt-0.5">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>Account number must be at least 6 digits.</span>
                </div>
              )}
            </div>

            {/* Validation States */}
            {validationState === 'running' && (
              <div className="p-3.5 rounded-lg bg-teal-50 border border-teal-200 flex items-center gap-3">
                <div className="w-4 h-4 border-2 border-slate-300 border-t-brand rounded-full animate-spin flex-shrink-0" />
                <span className="text-[14px] font-semibold text-ink-hi">
                  Validating bank account...
                </span>
              </div>
            )}

            {validationState === 'match' && (
              <div className="p-3.5 rounded-lg bg-teal-50 border border-teal-200 flex items-center gap-2.5">
                <Check className="w-4 h-4 text-[#0d9488] stroke-[3] shrink-0" />
                <span className="text-[14.5px] font-bold text-ink-hi">
                  Account name matches bank records.
                </span>
              </div>
            )}

            {validationState === 'closeMatch' && (
              <div className="p-3.5 sm:p-4 rounded-lg bg-amber-50 border border-amber-200 text-left space-y-2">
                <p className="text-[15px] font-bold text-ink-hi m-0 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                  Close match detected.
                </p>
                <p className="text-[13.5px] text-ink-mid m-0">
                  The entered name &ldquo;{accountName}&rdquo; is a close match to the registered account.
                </p>
                <p className="text-[13.5px] text-ink-mid m-0">Please update the bank details.</p>
                <button
                  type="button"
                  onClick={() => setValidationState('idle')}
                  className="block font-bold text-ink-hi underline hover:text-black cursor-pointer text-left text-sm pt-2"
                >
                  Edit bank details and re-run
                </button>
              </div>
            )}

            {validationState === 'noMatch' && (
              <div className="space-y-4">
                <div className="p-3.5 sm:p-4 rounded-lg bg-red-50 border border-red-200 text-left space-y-2">
                  <p className="text-[15px] font-bold text-[#991b1b] m-0 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-[#991b1b] flex-shrink-0" />
                    The account name does not match bank records.
                  </p>
                  <p className="text-[13.5px] text-ink-mid m-0">
                    {SCENARIOS[scenario].bypass
                      ? 'You can update the bank details or proceed. If you proceed, this will be flagged for the approver.'
                      : 'Please update the account name or enter different bank account details, then re-validate.'}
                  </p>
                  <button
                    type="button"
                    onClick={() => setValidationState('idle')}
                    className="block font-bold text-ink-hi underline hover:text-black cursor-pointer text-left text-sm pt-2"
                  >
                    Edit bank details and re-run
                  </button>
                </div>

                {SCENARIOS[scenario].bypass && (
                  <div className="space-y-3 pt-2">
                    <Checkbox
                      checked={bypassConfirmed}
                      onChange={(e) => setBypassConfirmed(e.target.checked)}
                      label="I confirm the payee wishes to proceed with the entered details despite the no match result."
                    />

                    <div className="flex flex-col gap-1.5 pt-1">
                      <label htmlFor="bypassNotes" className="text-[14px] font-semibold text-ink-hi">
                        Notes
                      </label>
                      <textarea
                        id="bypassNotes"
                        rows={2}
                        value={bypassNotes}
                        placeholder={SCENARIOS[scenario].notesPlaceholder}
                        onChange={(e) => setBypassNotes(e.target.value)}
                        className="p-3 bg-white border border-border rounded-md text-base text-ink-hi focus:border-ink-hi focus:ring-2 focus:ring-slate-200 outline-none"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

          </Card>
          )}

          {/* Actions */}
          {hasBank && validationState === 'idle' && (
            <div className="mt-6">
              <Button
                size="lg"
                disabled={!isFormValid || isValidating}
                onClick={handleRunValidation}
                className="w-full h-12 text-[16px] font-semibold"
              >
                Run validation
              </Button>
            </div>
          )}

          {hasBank && validationState === 'match' && (
            <div className="mt-6">
              <Button
                size="lg"
                onClick={handleProceed}
                className="w-full h-12 text-[16px] font-semibold"
              >
                {fromSummary ? 'Save and return to summary' : 'Next'}
              </Button>
            </div>
          )}

          {hasBank && validationState === 'noMatch' && SCENARIOS[scenario].bypass && (
            <div className="mt-6">
              <Button
                size="lg"
                disabled={!bypassConfirmed}
                onClick={handleProceed}
                className="w-full h-12 text-[16px] font-semibold"
              >
                {fromSummary ? 'Save and return to summary' : 'Next'}
              </Button>
            </div>
          )}

          {!hasBank && (
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

          {/* Prototype Simulation Toggle */}
          {hasBank && (
          <div className="mt-8 flex items-center gap-2 p-3 rounded-lg border border-dashed border-border bg-surface-card flex-wrap text-xs">
            <span className="font-semibold text-ink-mid flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-brand" />
              Prototype preview only, simulate CoP result:
            </span>
            {Object.entries(SCENARIOS).map(([key, s]) => (
              <button
                key={key}
                type="button"
                onClick={() => {
                  setScenario(key);
                  setValidationState('idle');
                }}
                className={`px-2.5 py-1 rounded font-semibold transition-colors ${
                  scenario === key
                    ? 'bg-slate-800 text-white'
                    : 'bg-white border border-border text-ink-mid hover:bg-slate-50'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
          )}
    </div>
  );
}

export default function BankAccountPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-ink-mid">Loading bank account...</div>}>
      <BankAccountContent />
    </Suspense>
  );
}

