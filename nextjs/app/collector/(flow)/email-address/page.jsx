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
import { initialVenues } from '@/lib/mockData';
import {
  createLink,
  buildVerifyUrl,
  formatExpiry,
  getLink,
  getLinkType,
  getCollectorResumePath,
  LINK_TYPES,
  DEFAULT_LINK_TYPE,
  LINK_STATUS,
  LINK_STATUS_LABELS,
} from '@/lib/verificationLink';
import { getDisbursementFlags, needsBankStep, getStepAfterEmail, getPayoutRequirements, readPayoutForm } from '@/lib/payoutFlow';

const VERIFY_MODES = [
  { value: 'manual', label: 'Verify at the counter' },
  { value: 'link', label: 'Send link to patron' },
];

// The link record is a snapshot taken at send time, so an empty win amount is
// frozen into it and the patron's header has nothing to show. Payment
// breakdown already falls back to 1250 when the amount was never captured -
// match it here so the two screens cannot disagree.
const DEFAULT_WIN_AMOUNT = '1,250.00';

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

  const [linkType, setLinkType] = useState(DEFAULT_LINK_TYPE);
  // Bank link types only make sense when money is actually going to a bank
  // account. null until sessionStorage has been read.
  const [hasBank, setHasBank] = useState(null);

  const [sentLink, setSentLink] = useState(null);
  const [linkStatus, setLinkStatus] = useState(null);
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

      const bank = getDisbursementFlags(saved.disbursementMethod).hasBank;
      setHasBank(bank);
      const savedType = getLinkType(saved.linkType);
      // A saved bank type is no longer valid once Bank transfer is deselected,
      // so fall back to the fullest type that still applies.
      setLinkType(!bank && savedType.includesBank ? 'id_secondary' : savedType.value);
    } catch (e) {}
  }, []);

  // The patron's phone writes progress into localStorage. The storage event
  // fires in this tab whenever another tab changes it, so Continue unlocks the
  // moment the patron submits without polling.
  useEffect(() => {
    if (!sentLink) return undefined;
    const read = () => setLinkStatus(getLink(sentLink.token)?.status || null);
    read();
    window.addEventListener('storage', read);
    return () => window.removeEventListener('storage', read);
  }, [sentLink]);

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

  const handleLinkTypeChange = (value) => {
    setLinkType(value);
    persist({ linkType: value });
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
      // Carried so the patron's phone can read that venue's own CDD settings.
      venueId:
        form.venueId ||
        initialVenues.find((v) => v.name === (form.venue || 'Riverside RSL Club'))?.id ||
        'venue-riverside-rsl',
      payoutType: form.payoutType || 'EGM',
      machine: form.machine || '',
      winAmount: form.winAmount || DEFAULT_WIN_AMOUNT,
      cashAmount: form.cashAmount || '',
      bankAmount: form.bankAmount || '',
      disbursementMethod: form.disbursementMethod || '',
      patronName,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      membership: membership.trim(),
      mobile: cleanMobile,
      linkType,
    });

    persist({
      linkType,
      email: email.trim(),
      membership: membership.trim(),
      verificationMode: 'link',
      verificationToken: record.token,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      mobile: cleanMobile,
    });

    setSentLink(record);
    setLinkStatus(record.status);
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
      // Past the ID steps entirely when the payout doesn't need them.
      router.push(getStepAfterEmail(readPayoutForm()));
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
    const sentType = getLinkType(sentLink.payout.linkType);
    const resumePath = getCollectorResumePath(sentType.value, linkStatus, needsBankStep());
    const isStaffAction = linkStatus === LINK_STATUS.STAFF_ACTION;

    const handleContinue = () => {
      if (!resumePath) return;
      // A failed electronic ID hands verification back to the counter, so the
      // rest of the flow runs manually and the link no longer covers any step.
      if (isStaffAction) persist({ verificationMode: 'manual', verificationToken: null });
      router.push(resumePath);
    };

    const patronCovers = [
      'ID',
      sentType.includesSecondary && 'secondary ID',
      sentType.includesBank && 'bank details',
    ].filter(Boolean);
    const coversLabel =
      patronCovers.length > 1
        ? `${patronCovers.slice(0, -1).join(', ')} and ${patronCovers[patronCovers.length - 1]}`
        : patronCovers[0];
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
              {sentLink.payout.patronName} can now complete their {coversLabel} on their own phone.
              The link stops working at {formatExpiry(sentLink.expiresAt)}.
            </p>
          </div>
        </div>

        <Card padding="md" className="border-border shadow-card space-y-5">
          <div className="space-y-2">
            <h2 className="text-[13px] font-semibold text-ink-mid m-0">What happens next</h2>
            <ol className="text-[15px] text-ink-hi space-y-2 m-0 pl-5">
              <li>The patron scans their ID and takes a photo of their face.</li>
              {sentType.includesSecondary && (
                <li>They photograph their Medicare card as a secondary ID.</li>
              )}
              {sentType.includesBank && (
                <li>They enter their bank details, which are checked against bank records.</li>
              )}
              <li>They confirm everything and submit.</li>
              <li>You continue here with the steps they did not cover.</li>
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

        <div className="mt-6 space-y-2">
          {isStaffAction ? (
            <div className="p-3.5 rounded-lg bg-red-50 border border-red-200 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <p className="text-[15px] font-bold text-[#991b1b] m-0">
                  Patron could not be verified electronically
                </p>
                <p className="text-[13.5px] text-ink-mid m-0">
                  Their documents failed both electronic checks. Continue to verify their ID in
                  person at the counter.
                </p>
              </div>
            </div>
          ) : (
            <p className="text-[13.5px] text-ink-mid m-0 text-center">
              {linkStatus === LINK_STATUS.COMPLETED
                ? 'Patron verification complete.'
                : `${LINK_STATUS_LABELS[linkStatus] || LINK_STATUS_LABELS[LINK_STATUS.SENT]}. You can continue once the patron submits.`}
            </p>
          )}
          <Button
            size="lg"
            disabled={!resumePath}
            onClick={handleContinue}
            className="w-full h-12 text-[16px] font-semibold"
          >
            Continue
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
                : 'The patron completes the chosen checks on their own phone. You will skip those steps.'}
            </p>
          </div>

          {/* Patron contact details, only needed when sending them a link */}
          {verifyMode === 'link' && (
            <div className="space-y-5 pt-1">
              <div className="flex flex-col gap-2">
                <span className="text-[14px] font-semibold text-ink-hi">
                  What the patron completes <span className="text-red-500">*</span>
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {LINK_TYPES.map((type) => {
                    const isActive = linkType === type.value;
                    const isDisabled = hasBank === false && type.includesBank;
                    return (
                      <button
                        key={type.value}
                        type="button"
                        disabled={isDisabled}
                        onClick={() => handleLinkTypeChange(type.value)}
                        className={`h-12 px-3 rounded-lg text-[15px] text-left transition-colors ${
                          isDisabled
                            ? 'bg-slate-50 text-ink-lo ring-1 ring-inset ring-border cursor-not-allowed'
                            : isActive
                            ? 'bg-[#f0fdfa] text-[#0d9488] font-bold ring-1 ring-inset ring-[#0d9488] cursor-pointer'
                            : 'bg-white text-[#627d98] hover:text-[#102a43] hover:bg-[#f8fafc] ring-1 ring-inset ring-[#cbd5e1] cursor-pointer'
                        }`}
                      >
                        {type.label}
                      </button>
                    );
                  })}
                </div>
                {hasBank === false && (
                  <p className="text-[13.5px] text-ink-mid m-0">
                    Bank transfer was not selected for this payout, so bank details are not needed.
                  </p>
                )}
              </div>

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
