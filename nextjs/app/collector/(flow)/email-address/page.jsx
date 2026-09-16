'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ArrowLeft,
  AlertCircle,
  Sparkles,
  UserCheck,
  Check,
  Copy,
  ExternalLink,
  Smartphone,
} from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { findReturningPlayer } from '@/lib/mockReturningPlayers';
import { createLink, buildVerifyUrl, formatExpiry } from '@/lib/verificationLink';

const VERIFY_MODES = [
  { value: 'manual', label: 'Verify at the counter' },
  { value: 'link', label: 'Send link to patron' },
];

// 04xx xxx xxx, or the same number written with a +61 country code.
function normaliseMobile(value) {
  const digits = value.replace(/[^0-9]/g, '');
  if (digits.startsWith('61')) return `0${digits.slice(2)}`.slice(0, 10);
  return digits.slice(0, 10);
}

function formatMobile(value) {
  const digits = normaliseMobile(value);
  if (digits.length <= 4) return digits;
  if (digits.length <= 7) return `${digits.slice(0, 4)} ${digits.slice(4)}`;
  return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`;
}

function isMobileValid(value) {
  const digits = normaliseMobile(value);
  return digits.length === 10 && digits.startsWith('04');
}

function EmailAddressContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fromSummary = searchParams.get('from') === 'summary';

  const [email, setEmail] = useState('');
  const [emailTouched, setEmailTouched] = useState(false);
  const [membership, setMembership] = useState('');
  const [membershipTouched, setMembershipTouched] = useState(false);
  const [prefillSource, setPrefillSource] = useState('');

  const [verifyMode, setVerifyMode] = useState('manual');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [mobile, setMobile] = useState('');
  const [linkFieldsTouched, setLinkFieldsTouched] = useState(false);

  const [sentLink, setSentLink] = useState(null);
  const [copied, setCopied] = useState(false);

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isEmailValid = emailPattern.test(email.trim());
  const isMembershipValid = membership.trim() !== '';

  const isLinkDetailsValid =
    firstName.trim() !== '' && lastName.trim() !== '' && isMobileValid(mobile);

  const isFormValid =
    isEmailValid &&
    isMembershipValid &&
    (verifyMode === 'manual' || isLinkDetailsValid);

  useEffect(() => {
    try {
      const saved = JSON.parse(sessionStorage.getItem('payoutFormData') || '{}');
      if (saved.email) setEmail(saved.email);
      if (saved.membership) setMembership(saved.membership);
      if (saved.prefillSource) setPrefillSource(saved.prefillSource);
      if (saved.verificationMode) setVerifyMode(saved.verificationMode);
      if (saved.firstName) setFirstName(saved.firstName);
      if (saved.lastName) setLastName(saved.lastName);
      if (saved.mobile) setMobile(saved.mobile);
    } catch (e) {}
  }, []);

  const persist = (patch) => {
    try {
      const current = JSON.parse(sessionStorage.getItem('payoutFormData') || '{}');
      sessionStorage.setItem('payoutFormData', JSON.stringify({ ...current, ...patch }));
    } catch (e) {}
  };

  const readForm = () => {
    try {
      return JSON.parse(sessionStorage.getItem('payoutFormData') || '{}');
    } catch (e) {
      return {};
    }
  };

  const handleModeChange = (mode) => {
    setVerifyMode(mode);
    persist({ verificationMode: mode });
  };

  const handleSendLink = () => {
    if (!isFormValid) return;
    const form = readForm();
    const cleanMobile = formatMobile(mobile);
    const patronName = `${firstName.trim()} ${lastName.trim()}`;

    const record = createLink({
      venue: form.venue || 'Riverside RSL Club',
      payoutType: form.payoutType || 'EGM',
      machine: form.machine || '',
      winAmount: form.winAmount || '',
      cashAmount: form.cashAmount || '',
      bankAmount: form.bankAmount || '',
      disbursementMethod: form.disbursementMethod || '',
      patronName,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      membership: membership.trim(),
      mobile: cleanMobile,
    });

    persist({
      email: email.trim(),
      membership: membership.trim(),
      verificationMode: 'link',
      verificationToken: record.token,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      mobile: cleanMobile,
    });

    setSentLink(record);
    setCopied(false);
  };

  const handleNext = () => {
    if (!isFormValid) return;
    const cleanEmail = email.trim();
    const cleanMem = membership.trim();
    const match = findReturningPlayer(cleanEmail);

    persist({
      email: cleanEmail,
      membership: cleanMem,
      verificationMode: 'manual',
      verificationToken: null,
      returningPlayerMatch: Boolean(match),
      returningPlayerData: match || null,
    });

    if (fromSummary) {
      router.push('/collector/summary');
    } else {
      router.push('/collector/primary-id');
    }
  };

  const handleCopy = () => {
    const url = buildVerifyUrl(sentLink.token);
    try {
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {}
  };

  const applyPreset = (presetEmail, presetMem, presetFirst, presetLast, presetMobile) => {
    setEmail(presetEmail);
    setMembership(presetMem);
    setFirstName(presetFirst);
    setLastName(presetLast);
    setMobile(presetMobile);
    setEmailTouched(false);
    setMembershipTouched(false);
    setLinkFieldsTouched(false);
    persist({ email: presetEmail, membership: presetMem });
  };

  if (sentLink) {
    const verifyUrl = buildVerifyUrl(sentLink.token);
    return (
      <div className="max-w-2xl mx-auto">
        <h1 className="text-xl sm:text-2xl font-bold text-ink-hi mb-6">Verification link sent</h1>

        <div className="p-3.5 rounded-lg bg-teal-50 border border-teal-200 flex items-start gap-2.5 mb-6">
          <Smartphone className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-[15px] font-bold text-ink-hi m-0">
              Sent to {sentLink.payout.mobile}
            </p>
            <p className="text-[13.5px] text-ink-mid m-0">
              {sentLink.payout.patronName} can now verify their identity and enter bank details on
              their own phone. The link stops working at {formatExpiry(sentLink.expiresAt)}.
            </p>
          </div>
        </div>

        <Card padding="md" className="border-border shadow-card space-y-5">
          <div className="space-y-2">
            <h2 className="text-[13px] font-semibold text-ink-mid m-0">What happens next</h2>
            <ol className="text-[15px] text-ink-hi space-y-2 m-0 pl-5">
              <li>The patron scans their ID and takes a photo of their face.</li>
              <li>They enter their bank details, which are checked against bank records.</li>
              <li>They confirm everything and submit.</li>
              <li>The payout then moves to approval.</li>
            </ol>
          </div>

          <div className="space-y-2 pt-1">
            <h2 className="text-[13px] font-semibold text-ink-mid m-0">
              Prototype only, no SMS is actually sent
            </h2>
            <p className="text-[13.5px] text-ink-mid m-0">
              Open this address on a phone, or in another tab, to see what the patron sees.
            </p>
            <div className="flex items-center gap-2 flex-wrap pt-1">
              <code className="flex-1 min-w-[240px] px-3 py-2 rounded-md border border-border bg-white text-[13px] font-mono text-ink-hi break-all">
                {verifyUrl}
              </code>
              <Button variant="secondary" size="sm" icon={copied ? Check : Copy} onClick={handleCopy}>
                {copied ? 'Copied' : 'Copy'}
              </Button>
              <Button
                variant="secondary"
                size="sm"
                icon={ExternalLink}
                onClick={() => window.open(verifyUrl, '_blank')}
              >
                Open patron view
              </Button>
            </div>
          </div>
        </Card>

        <div className="mt-6">
          <Button
            size="lg"
            onClick={() => router.push('/collector/summary')}
            className="w-full h-12 text-[16px] font-semibold"
          >
            Continue to summary
          </Button>
        </div>
      </div>
    );
  }

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
                  {email.trim() === '' ? 'Email is required.' : 'Enter a valid email address.'}
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

          {/* How identity gets verified */}
          <div className="flex flex-col gap-2 pt-1">
            <span className="text-[14px] font-semibold text-ink-hi">Identity verification</span>
            <div className="flex w-full">
              {VERIFY_MODES.map((mode, index) => {
                const isActive = verifyMode === mode.value;
                const isFirst = index === 0;
                return (
                  <button
                    key={mode.value}
                    type="button"
                    onClick={() => handleModeChange(mode.value)}
                    className={`flex-1 h-12 px-3 text-[15px] transition-colors cursor-pointer ${
                      isFirst ? 'rounded-l-lg' : '-ml-px rounded-r-lg'
                    } ${
                      isActive
                        ? 'relative z-10 bg-[#f0fdfa] text-[#0d9488] font-bold ring-1 ring-inset ring-[#0d9488]'
                        : 'relative bg-white text-[#627d98] hover:text-[#102a43] hover:bg-[#f8fafc] ring-1 ring-inset ring-[#cbd5e1]'
                    }`}
                  >
                    {mode.label}
                  </button>
                );
              })}
            </div>
            <p className="text-[13.5px] text-ink-mid m-0">
              {verifyMode === 'manual'
                ? 'You collect the ID and bank details here at the counter.'
                : 'The patron completes ID and bank details on their own phone. You will skip those steps.'}
            </p>
          </div>

          {/* Patron contact details, only needed when sending them a link */}
          {verifyMode === 'link' && (
            <div className="space-y-5 pt-1">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="firstName" className="text-[14px] font-semibold text-ink-hi">
                  Patron first name <span className="text-red-500">*</span>
                </label>
                <input
                  id="firstName"
                  type="text"
                  value={firstName}
                  placeholder="First name"
                  onChange={(e) => setFirstName(e.target.value)}
                  onBlur={() => setLinkFieldsTouched(true)}
                  className="h-12 w-full px-4 bg-white border border-border rounded-md text-base text-ink-hi placeholder:text-ink-lo focus:border-ink-hi focus:ring-2 focus:ring-slate-200 outline-none transition-all"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="lastName" className="text-[14px] font-semibold text-ink-hi">
                  Patron last name <span className="text-red-500">*</span>
                </label>
                <input
                  id="lastName"
                  type="text"
                  value={lastName}
                  placeholder="Last name"
                  onChange={(e) => setLastName(e.target.value)}
                  onBlur={() => setLinkFieldsTouched(true)}
                  className="h-12 w-full px-4 bg-white border border-border rounded-md text-base text-ink-hi placeholder:text-ink-lo focus:border-ink-hi focus:ring-2 focus:ring-slate-200 outline-none transition-all"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="mobile" className="text-[14px] font-semibold text-ink-hi">
                  Mobile number <span className="text-red-500">*</span>
                </label>
                <input
                  id="mobile"
                  type="tel"
                  inputMode="numeric"
                  value={mobile}
                  placeholder="0412 345 678"
                  maxLength={12}
                  onChange={(e) => setMobile(formatMobile(e.target.value))}
                  onBlur={() => setLinkFieldsTouched(true)}
                  className={`h-12 w-full px-4 bg-white border rounded-md text-base text-ink-hi font-mono placeholder:font-sans placeholder:text-ink-lo focus:outline-none focus:ring-2 transition-all ${
                    linkFieldsTouched && mobile !== '' && !isMobileValid(mobile)
                      ? 'border-red-400 focus:border-red-500 focus:ring-red-100'
                      : 'border-border focus:border-ink-hi focus:ring-slate-200'
                  }`}
                />
                {linkFieldsTouched && mobile !== '' && !isMobileValid(mobile) && (
                  <div className="flex items-center gap-1.5 text-xs text-red-600 font-medium mt-0.5">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>Enter a 10 digit Australian mobile number starting with 04.</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </form>
      </Card>

      {/* Actions */}
      <div className="mt-6">
        <Button
          size="lg"
          disabled={!isFormValid}
          onClick={verifyMode === 'link' ? handleSendLink : handleNext}
          className="w-full h-12 text-[16px] font-semibold"
        >
          {verifyMode === 'link'
            ? 'Send verification link'
            : fromSummary
            ? 'Save and return to summary'
            : 'Next'}
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
            onClick={() =>
              applyPreset('sarah.jenkins@example.com', 'MEM-10884', 'Sarah', 'Jenkins', '0412 345 678')
            }
            className="px-2.5 py-1.5 rounded-md bg-white border border-border hover:border-brand text-ink-hi font-medium hover:text-brand transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <UserCheck className="w-3.5 h-3.5 text-teal-600" />
            <span>Sarah Jenkins (Licence match)</span>
          </button>
          <button
            type="button"
            onClick={() =>
              applyPreset('david.chen@gmail.com', 'MEM-99102', 'David', 'Chen', '0423 456 789')
            }
            className="px-2.5 py-1.5 rounded-md bg-white border border-border hover:border-brand text-ink-hi font-medium hover:text-brand transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <UserCheck className="w-3.5 h-3.5 text-teal-600" />
            <span>David Chen (Passport match)</span>
          </button>
          <button
            type="button"
            onClick={() =>
              applyPreset('new.winner@example.com', 'MEM-77881', 'Alex', 'Morgan', '0434 567 890')
            }
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
