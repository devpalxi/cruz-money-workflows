'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Mail, CreditCard, AlertCircle, Sparkles, UserCheck } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { findReturningPlayer, returningPlayersDatabase } from '@/lib/mockReturningPlayers';

function EmailAddressContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fromSummary = searchParams.get('from') === 'summary';

  const [email, setEmail] = useState('');
  const [emailTouched, setEmailTouched] = useState(false);
  const [membership, setMembership] = useState('');
  const [membershipTouched, setMembershipTouched] = useState(false);
  const [prefillSource, setPrefillSource] = useState('');

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isEmailValid = emailPattern.test(email.trim());
  const isMembershipValid = membership.trim() !== '';

  const isFormValid = isEmailValid && isMembershipValid;

  useEffect(() => {
    try {
      const saved = JSON.parse(sessionStorage.getItem('payoutFormData') || '{}');
      if (saved.email) setEmail(saved.email);
      if (saved.membership) setMembership(saved.membership);
      if (saved.prefillSource) setPrefillSource(saved.prefillSource);
    } catch (e) {}
  }, []);

  const persist = (patch) => {
    try {
      const current = JSON.parse(sessionStorage.getItem('payoutFormData') || '{}');
      sessionStorage.setItem('payoutFormData', JSON.stringify({ ...current, ...patch }));
    } catch (e) {}
  };

  const handleNext = () => {
    if (!isFormValid) return;
    const cleanEmail = email.trim();
    const cleanMem = membership.trim();

    // Check returning player match in database
    const match = findReturningPlayer(cleanEmail);

    if (match) {
      persist({
        email: cleanEmail,
        membership: cleanMem,
        returningPlayerMatch: true,
        returningPlayerData: match,
      });
    } else {
      persist({
        email: cleanEmail,
        membership: cleanMem,
        returningPlayerMatch: false,
        returningPlayerData: null,
      });
    }

    if (fromSummary) {
      router.push('/collector/summary');
    } else {
      router.push('/collector/primary-id');
    }
  };

  const applyPreset = (presetEmail, presetMem) => {
    setEmail(presetEmail);
    setMembership(presetMem);
    setEmailTouched(false);
    setMembershipTouched(false);
    persist({ email: presetEmail, membership: presetMem });
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header Row */}
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
              onClick={() => router.push(fromSummary ? '/collector/summary' : '/collector/before-you-start')}
              className="inline-flex items-center gap-1.5 text-[15px] font-bold text-ink-hi hover:text-black transition-colors underline cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 text-brand" />
              <span>Back</span>
            </button>
            <h1 className="text-xl sm:text-2xl font-bold text-ink-hi">Email address</h1>
          </div>

          <Card padding="md" className="border-border shadow-card">
            <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
              {/* Email field */}
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="email"
                  className="text-[14px] font-semibold text-ink-hi flex items-center gap-1"
                >
                  Email <span className="text-red-500">*</span>
                </label>

                <input
                  id="email"
                  type="email"
                  value={email}
                  placeholder="name@example.com"
                  onChange={(e) => {
                    setEmail(e.target.value);
                    persist({ email: e.target.value });
                  }}
                  onBlur={() => setEmailTouched(true)}
                  className={`h-12 w-full px-4 bg-white border rounded-md text-base text-ink-hi placeholder:text-ink-lo focus:outline-none focus:ring-2 transition-all ${
                    emailTouched && !isEmailValid
                      ? 'border-red-400 focus:border-red-500 focus:ring-red-100'
                      : 'border-border focus:border-ink-hi focus:ring-slate-200'
                  }`}
                />

                {emailTouched && !isEmailValid && (
                  <div className="flex items-center gap-1.5 text-xs text-red-600 font-medium mt-0.5">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>
                      {email.trim() === ''
                        ? 'Email is required.'
                        : 'Enter a valid email address.'}
                    </span>
                  </div>
                )}
              </div>

              {/* Membership number */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="membership"
                    className="text-[14px] font-semibold text-ink-hi flex items-center gap-1"
                  >
                    Membership number <span className="text-red-500">*</span>
                  </label>
                  {prefillSource && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#f0fdfa] text-[#0d9488] border border-[#99f6e4]">
                      Prefilled from {prefillSource}
                    </span>
                  )}
                </div>

                <input
                  id="membership"
                  type="text"
                  value={membership}
                  placeholder="Membership number"
                  onChange={(e) => {
                    setMembership(e.target.value);
                    persist({ membership: e.target.value });
                  }}
                  onBlur={() => setMembershipTouched(true)}
                  className={`h-12 w-full px-4 bg-white border rounded-md text-base text-ink-hi font-mono placeholder:font-sans placeholder:text-ink-lo focus:outline-none focus:ring-2 transition-all ${
                    membershipTouched && !isMembershipValid
                      ? 'border-red-400 focus:border-red-500 focus:ring-red-100'
                      : 'border-border focus:border-ink-hi focus:ring-slate-200'
                  }`}
                />

                {membershipTouched && !isMembershipValid && (
                  <div className="flex items-center gap-1.5 text-xs text-red-600 font-medium mt-0.5">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>Membership number is required.</span>
                  </div>
                )}
              </div>
            </form>
          </Card>

          {/* Actions */}
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

          {/* Prototype Quick-Test Toolbar */}
          <div className="mt-8 p-3 rounded-lg border border-dashed border-border bg-surface-card text-xs space-y-2">
            <div className="flex items-center gap-1 font-semibold text-ink-mid">
              <Sparkles className="w-3.5 h-3.5 text-brand" />
              <span>Prototype Test Presets (Returning Player Lookup):</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => applyPreset('sarah.jenkins@example.com', 'MEM-10884')}
                className="px-2.5 py-1.5 rounded-md bg-white border border-border hover:border-brand text-ink-hi font-medium hover:text-brand transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <UserCheck className="w-3.5 h-3.5 text-teal-600" />
                <span>Sarah Jenkins (Licence match)</span>
              </button>
              <button
                type="button"
                onClick={() => applyPreset('david.chen@gmail.com', 'MEM-99102')}
                className="px-2.5 py-1.5 rounded-md bg-white border border-border hover:border-brand text-ink-hi font-medium hover:text-brand transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <UserCheck className="w-3.5 h-3.5 text-teal-600" />
                <span>David Chen (Passport match)</span>
              </button>
              <button
                type="button"
                onClick={() => applyPreset('new.winner@example.com', 'MEM-77881')}
                className="px-2.5 py-1.5 rounded-md bg-slate-100 border border-transparent hover:bg-slate-200 text-ink-mid font-medium transition-colors"
              >
                New Player (No match)
              </button>
            </div>
          </div>
    </div>
  );
}

export default function EmailAddressPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-ink-mid">Loading email step...</div>}>
      <EmailAddressContent />
    </Suspense>
  );
}
