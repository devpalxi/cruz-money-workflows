'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import {
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  Camera,
  Check,
  Clock,
  ShieldCheck,
  Sparkles,
  UserRound,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Checkbox from '@/components/ui/Checkbox';
import {
  getLink,
  updateLink,
  LINK_STATUS,
  MAX_ID_ATTEMPTS,
  MAX_COP_ATTEMPTS,
} from '@/lib/verificationLink';

const STAGES = [
  { key: 'consent', label: 'Consent' },
  { key: 'id', label: 'ID' },
  { key: 'face', label: 'Photo' },
  { key: 'bank', label: 'Bank' },
  { key: 'review', label: 'Review' },
];

const DOC_TYPES = [
  { value: 'licence', label: 'Licence' },
  { value: 'passport', label: 'Passport' },
  { value: 'medicare', label: 'Medicare' },
];

const DOC_LABELS = {
  licence: 'Driver licence',
  passport: 'Passport',
  medicare: 'Medicare card',
};

// Stand-in for what DVS would return once FrankieOne has read the document.
function simulateExtraction(docType, patronName) {
  if (docType === 'passport') {
    return [
      { label: 'Full name', value: patronName },
      { label: 'Passport number', value: 'PA1234567', mono: true },
      { label: 'Expiry date', value: '14/03/2029', mono: true },
      { label: 'Country of issue', value: 'Australia' },
    ];
  }
  if (docType === 'medicare') {
    return [
      { label: 'Full name', value: patronName },
      { label: 'Card number', value: '2950 12345 1', mono: true },
      { label: 'IRN', value: '1', mono: true },
      { label: 'Card colour', value: 'Green' },
      { label: 'Expiry date', value: '05/2028', mono: true },
    ];
  }
  return [
    { label: 'Full name', value: patronName },
    { label: 'State of issue', value: 'NSW' },
    { label: 'Licence number', value: '20984124', mono: true },
    { label: 'Card number', value: '981245781', mono: true },
    { label: 'Date of birth', value: '04/09/1987', mono: true },
  ];
}

function normaliseDigits(value, max) {
  return value.replace(/[^0-9]/g, '').slice(0, max);
}

function formatBsb(value) {
  const digits = normaliseDigits(value, 6);
  return digits.length > 3 ? `${digits.slice(0, 3)}-${digits.slice(3)}` : digits;
}

function formatAccountNumber(value) {
  return normaliseDigits(value, 9).replace(/(\d{3})(?=\d)/g, '$1-');
}

function DetailRow({ label, value, mono = false }) {
  return (
    <div className="flex justify-between items-start gap-4 py-1.5">
      <span className="text-[14px] text-ink-mid font-medium flex-shrink-0">{label}</span>
      <span
        className={`text-[14px] font-bold text-ink-hi text-right break-words ${
          mono ? 'font-mono tabular-nums' : ''
        }`}
      >
        {value}
      </span>
    </div>
  );
}

function CaptureTile({ id, title, hint, facing, previewUrl, onCapture }) {
  return (
    <label
      htmlFor={id}
      className="block border border-dashed border-border-mid rounded-lg bg-white p-5 cursor-pointer hover:border-brand transition-colors"
    >
      <input
        id={id}
        type="file"
        accept="image/*"
        capture={facing}
        className="sr-only"
        onChange={(e) => {
          const file = e.target.files && e.target.files[0];
          if (file) onCapture(file);
        }}
      />
      {previewUrl ? (
        <div className="space-y-3">
          <img
            src={previewUrl}
            alt=""
            className="w-full rounded-md border border-border object-cover max-h-52"
          />
          <p className="text-[13.5px] font-semibold text-ink-mid m-0 text-center underline">
            Retake photo
          </p>
        </div>
      ) : (
        <div className="flex flex-col items-center text-center gap-2 py-3">
          {facing === 'user' ? (
            <UserRound className="w-7 h-7 text-brand" />
          ) : (
            <Camera className="w-7 h-7 text-brand" />
          )}
          <span className="text-[15px] font-semibold text-ink-hi">{title}</span>
          <span className="text-[13.5px] text-ink-mid">{hint}</span>
        </div>
      )}
    </label>
  );
}

function Checking({ message }) {
  return (
    <div className="p-3.5 rounded-lg bg-teal-50 border border-teal-200 flex items-center gap-3">
      <div className="w-4 h-4 border-2 border-slate-300 border-t-brand rounded-full animate-spin flex-shrink-0" />
      <span className="text-[14.5px] font-semibold text-ink-hi">{message}</span>
    </div>
  );
}

function TerminalScreen({ tone, icon: Icon, title, body, children }) {
  const tones = {
    pass: 'bg-teal-50 border-teal-200 text-teal-600',
    warn: 'bg-amber-50 border-amber-200 text-amber-600',
    fail: 'bg-red-50 border-red-200 text-red-500',
  };
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center px-5 py-16 gap-4">
      <div className={`w-14 h-14 rounded-full border flex items-center justify-center ${tones[tone]}`}>
        <Icon className="w-7 h-7" />
      </div>
      <h1 className="text-[22px] font-bold text-ink-hi m-0">{title}</h1>
      <p className="text-[15px] text-ink-mid m-0 max-w-[36ch] leading-relaxed">{body}</p>
      {children}
    </div>
  );
}

export default function VerifyPage() {
  const params = useParams();
  const token = params?.token;

  const [record, setRecord] = useState(undefined);
  const [step, setStep] = useState('welcome');

  const [consent, setConsent] = useState({ general: false, docs: false, creditheader: false });

  const [docType, setDocType] = useState('licence');
  const [idPhase, setIdPhase] = useState('select');
  const [idPreview, setIdPreview] = useState(null);
  const [idAttempts, setIdAttempts] = useState(0);

  const [facePhase, setFacePhase] = useState('capture');
  const [facePreview, setFacePreview] = useState(null);

  const [accountName, setAccountName] = useState('');
  const [bsb, setBsb] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [bankPhase, setBankPhase] = useState('form');
  const [copResult, setCopResult] = useState(null);
  const [copAttempts, setCopAttempts] = useState(0);

  // Prototype simulation switches, standing in for DVS and Zepto responses.
  const [simId, setSimId] = useState('pass');
  const [simFace, setSimFace] = useState('pass');
  const [simCop, setSimCop] = useState('match');

  useEffect(() => {
    const found = getLink(token);
    setRecord(found);
    if (!found) return;
    if (found.status === LINK_STATUS.COMPLETED) setStep('done');
    else if (found.status === LINK_STATUS.STAFF_ACTION) setStep('staff');
    else if (found.status === LINK_STATUS.EXPIRED) setStep('expired');
    else if (found.status === LINK_STATUS.CANCELLED) setStep('cancelled');
    if (found.payout?.patronName) setAccountName(found.payout.patronName);
  }, [token]);

  const patronName = record?.payout?.patronName || '';
  const extracted = useMemo(
    () => simulateExtraction(docType, patronName),
    [docType, patronName]
  );

  const stageIndex = STAGES.findIndex((s) => s.key === step);
  const isFlowStep = stageIndex >= 0;

  const setPreview = (setter, current, file) => {
    if (current) URL.revokeObjectURL(current);
    setter(file ? URL.createObjectURL(file) : null);
  };

  const consentGiven = consent.general && consent.docs && consent.creditheader;

  const handleStart = () => {
    updateLink(token, { status: LINK_STATUS.IN_PROGRESS });
    setStep('consent');
  };

  const handleRunIdCheck = () => {
    setIdPhase('checking');
    setTimeout(() => {
      const attempt = idAttempts + 1;
      setIdAttempts(attempt);
      if (simId === 'pass') {
        setIdPhase('passed');
      } else if (attempt >= MAX_ID_ATTEMPTS) {
        updateLink(token, {
          status: LINK_STATUS.STAFF_ACTION,
          result: { idvPath: 'IDV3', idAttempts: attempt, reason: 'Electronic ID checks failed' },
        });
        setStep('staff');
      } else {
        setIdPhase('failed');
      }
    }, 1400);
  };

  const handleTryAnotherDocument = () => {
    setPreview(setIdPreview, idPreview, null);
    setIdPhase('select');
  };

  const handleRunFaceCheck = () => {
    setFacePhase('checking');
    setTimeout(() => {
      if (simFace === 'pass') {
        setStep('bank');
      } else {
        setFacePhase('failed');
      }
    }, 1400);
  };

  const handleRunCop = () => {
    setBankPhase('checking');
    setTimeout(() => {
      const attempt = copAttempts + 1;
      setCopAttempts(attempt);
      setCopResult(simCop);
      setBankPhase('result');
    }, 1400);
  };

  const handleSubmit = () => {
    updateLink(token, {
      status: LINK_STATUS.COMPLETED,
      completedAt: Date.now(),
      result: {
        idvPath: idAttempts > 1 ? 'IDV2' : 'IDV1',
        docType,
        docLabel: DOC_LABELS[docType],
        livenessPassed: true,
        accountName,
        bsb,
        accountNumber,
        copResult,
        copAttempts,
        copEscalated: copResult === 'noMatch',
      },
    });
    setStep('done');
  };

  const isBankFormValid =
    accountName.trim() !== '' &&
    normaliseDigits(bsb, 6).length === 6 &&
    normaliseDigits(accountNumber, 9).length >= 6;

  const copExhausted = copResult === 'noMatch' && copAttempts >= MAX_COP_ATTEMPTS;

  if (record === undefined) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 text-[14px] text-ink-mid">
        Loading your payout...
      </div>
    );
  }

  if (!record) {
    return (
      <TerminalScreen
        tone="fail"
        icon={AlertCircle}
        title="This link is not valid"
        body="Check the message you received, or ask a staff member at the venue to send it again."
      />
    );
  }

  if (step === 'expired') {
    return (
      <TerminalScreen
        tone="warn"
        icon={Clock}
        title="This link has expired"
        body="For your security the link only stays open for a short time. A staff member at the venue can send you a new one."
      />
    );
  }

  if (step === 'cancelled') {
    return (
      <TerminalScreen
        tone="warn"
        icon={AlertTriangle}
        title="This link was closed"
        body="A staff member has taken over your verification at the counter. Please see them to finish your payout."
      />
    );
  }

  if (step === 'staff') {
    return (
      <TerminalScreen
        tone="warn"
        icon={AlertTriangle}
        title="Please return to the counter"
        body="We could not verify your documents electronically. A staff member needs to check your ID in person to continue. Nothing you entered has been lost."
      />
    );
  }

  if (step === 'done') {
    return (
      <TerminalScreen
        tone="pass"
        icon={Check}
        title="All done"
        body="Your details have been sent to the venue for approval. You can close this page. Staff will let you know when your payout has been released."
      >
        <Badge variant="pass" size="lg">Submitted for approval</Badge>
      </TerminalScreen>
    );
  }

  const payout = record.payout || {};

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      {/* Top bar */}
      <header className="px-4 py-3 border-b border-border bg-white">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[13px] text-ink-mid m-0 truncate">{payout.venue}</p>
            <p className="text-[15px] font-bold text-ink-hi m-0">Verify your payout</p>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-[11.5px] text-ink-mid m-0">Total win</p>
            <p className="text-[15px] font-bold text-ink-hi m-0 font-mono tabular-nums">
              {payout.winAmount ? `AUD ${payout.winAmount}` : '-'}
            </p>
          </div>
        </div>
      </header>

      {/* Progress */}
      {isFlowStep && (
        <div className="px-4 pt-3 pb-1 bg-white">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[13px] font-semibold text-ink-mid">
              {STAGES[stageIndex].label}
            </span>
            <span className="text-[13px] font-semibold text-ink-mid tabular-nums">
              Step {stageIndex + 1} of {STAGES.length}
            </span>
          </div>
          <div className="h-1 w-full rounded-full bg-border overflow-hidden">
            <div
              className="h-full bg-brand transition-all duration-300"
              style={{ width: `${((stageIndex + 1) / STAGES.length) * 100}%` }}
            />
          </div>
        </div>
      )}

      <main className="flex-1 px-4 py-5 space-y-5">
        {step === 'welcome' && (
          <>
            <div className="space-y-2">
              <h1 className="text-[22px] font-bold text-ink-hi m-0">Hello {payout.firstName}</h1>
              <p className="text-[15px] text-ink-mid m-0 leading-relaxed">
                Before {payout.venue} can release your payout, we need to confirm who you are and
                where the money should go. This takes about 5 minutes.
              </p>
            </div>

            <div className="border border-dashed border-border-mid rounded-lg bg-white p-4 space-y-3">
              <h2 className="text-[13px] font-semibold text-ink-mid m-0">What you will need</h2>
              <div className="flex items-start gap-3">
                <Camera className="w-5 h-5 text-ink-hi flex-shrink-0 mt-0.5" />
                <span className="text-[15px] text-ink-hi">
                  An Australian driver licence, passport, or Medicare card
                </span>
              </div>
              <div className="flex items-start gap-3">
                <UserRound className="w-5 h-5 text-ink-hi flex-shrink-0 mt-0.5" />
                <span className="text-[15px] text-ink-hi">
                  A moment to take a photo of your face
                </span>
              </div>
              <div className="flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-ink-hi flex-shrink-0 mt-0.5" />
                <span className="text-[15px] text-ink-hi">
                  Your BSB and account number for the transfer
                </span>
              </div>
            </div>

            <div className="divide-y divide-[#eceef2]">
              <DetailRow label="Paid to" value={payout.patronName} />
              {payout.cashAmount && (
                <DetailRow label="Cash at the venue" value={`AUD ${payout.cashAmount}`} mono />
              )}
              {payout.bankAmount && (
                <DetailRow label="To your bank account" value={`AUD ${payout.bankAmount}`} mono />
              )}
            </div>
          </>
        )}

        {step === 'consent' && (
          <>
            <div className="space-y-2">
              <h1 className="text-[20px] font-bold text-ink-hi m-0">Your consent</h1>
              <p className="text-[15px] text-ink-mid m-0 leading-relaxed">
                We check your identity against official government records. Australian law requires
                your permission first, so please confirm all three below.
              </p>
            </div>

            <div className="space-y-4">
              <Checkbox
                size="md"
                checked={consent.general}
                onChange={(e) => setConsent({ ...consent, general: e.target.checked })}
                label="I agree to my identity being verified"
                sublabel="The venue and its verification provider may confirm who you are."
              />
              <Checkbox
                size="md"
                checked={consent.docs}
                onChange={(e) => setConsent({ ...consent, docs: e.target.checked })}
                label="I agree to my documents being checked"
                sublabel="Your ID is checked against the government Document Verification Service."
              />
              <Checkbox
                size="md"
                checked={consent.creditheader}
                onChange={(e) => setConsent({ ...consent, creditheader: e.target.checked })}
                label="I agree to a credit header check"
                sublabel="This confirms your name and address only. It is not a credit application and does not affect your credit score."
              />
            </div>
          </>
        )}

        {step === 'id' && (
          <>
            <div className="space-y-2">
              <h1 className="text-[20px] font-bold text-ink-hi m-0">Scan your ID</h1>
              <p className="text-[15px] text-ink-mid m-0 leading-relaxed">
                {idPhase === 'failed'
                  ? 'That document could not be verified. You have one more try, so please use a different document.'
                  : 'Choose a document, then take a clear photo of it with all four corners visible.'}
              </p>
            </div>

            {idPhase === 'failed' && (
              <div className="p-3.5 rounded-lg bg-red-50 border border-red-200 space-y-1">
                <p className="text-[15px] font-bold text-[#991b1b] m-0 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  We could not verify that document
                </p>
                <p className="text-[13.5px] text-ink-mid m-0">
                  This can happen if the photo was blurry, or the details do not match the issuing
                  record. Try a different document.
                </p>
              </div>
            )}

            {(idPhase === 'select' || idPhase === 'failed') && (
              <>
                <div className="flex w-full">
                  {DOC_TYPES.map((doc, index) => {
                    const isActive = docType === doc.value;
                    const isFirst = index === 0;
                    const isLast = index === DOC_TYPES.length - 1;
                    return (
                      <button
                        key={doc.value}
                        type="button"
                        onClick={() => setDocType(doc.value)}
                        className={`flex-1 h-11 text-[14px] transition-colors cursor-pointer ${
                          isFirst ? 'rounded-l-lg' : isLast ? '-ml-px rounded-r-lg' : '-ml-px'
                        } ${
                          isActive
                            ? 'relative z-10 bg-[#f0fdfa] text-[#0d9488] font-bold ring-1 ring-inset ring-[#0d9488]'
                            : 'relative bg-white text-[#627d98] hover:text-[#102a43] hover:bg-[#f8fafc] ring-1 ring-inset ring-[#cbd5e1]'
                        }`}
                      >
                        {doc.label}
                      </button>
                    );
                  })}
                </div>

                <CaptureTile
                  id="idCapture"
                  facing="environment"
                  title={`Photograph your ${DOC_LABELS[docType].toLowerCase()}`}
                  hint="Lay it flat, avoid glare, and keep all four corners in frame"
                  previewUrl={idPreview}
                  onCapture={(file) => {
                    setPreview(setIdPreview, idPreview, file);
                    setIdPhase('captured');
                  }}
                />
              </>
            )}

            {idPhase === 'captured' && (
              <>
                <CaptureTile
                  id="idCaptureRetake"
                  facing="environment"
                  title="Photograph your document"
                  hint="Tap to retake"
                  previewUrl={idPreview}
                  onCapture={(file) => setPreview(setIdPreview, idPreview, file)}
                />
                <p className="text-[13px] font-semibold text-ink-mid m-0">
                  Check these details match your document
                </p>
                <div className="divide-y divide-[#eceef2]">
                  {extracted.map((row) => (
                    <DetailRow key={row.label} label={row.label} value={row.value} mono={row.mono} />
                  ))}
                </div>
              </>
            )}

            {idPhase === 'checking' && <Checking message="Checking your document..." />}

            {idPhase === 'passed' && (
              <div className="p-3.5 rounded-lg bg-teal-50 border border-teal-200 flex items-center gap-2.5">
                <Check className="w-4 h-4 text-[#0d9488] stroke-[3] flex-shrink-0" />
                <span className="text-[14.5px] font-bold text-ink-hi">
                  Your {DOC_LABELS[docType].toLowerCase()} has been verified.
                </span>
              </div>
            )}
          </>
        )}

        {step === 'face' && (
          <>
            <div className="space-y-2">
              <h1 className="text-[20px] font-bold text-ink-hi m-0">Take a photo of your face</h1>
              <p className="text-[15px] text-ink-mid m-0 leading-relaxed">
                This confirms you are the person on the document you just scanned. Look straight at
                the camera in good light, with nothing covering your face.
              </p>
            </div>

            {facePhase === 'failed' && (
              <div className="p-3.5 rounded-lg bg-amber-50 border border-amber-200 space-y-1">
                <p className="text-[15px] font-bold text-ink-hi m-0 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                  That photo did not match
                </p>
                <p className="text-[13.5px] text-ink-mid m-0">
                  Try again in brighter light, facing the camera directly.
                </p>
              </div>
            )}

            {facePhase === 'checking' ? (
              <Checking message="Matching your photo to your ID..." />
            ) : (
              <CaptureTile
                id="faceCapture"
                facing="user"
                title="Take a selfie"
                hint="Your face fully visible, looking at the camera"
                previewUrl={facePreview}
                onCapture={(file) => {
                  setPreview(setFacePreview, facePreview, file);
                  setFacePhase('capture');
                }}
              />
            )}
          </>
        )}

        {step === 'bank' && (
          <>
            <div className="space-y-2">
              <h1 className="text-[20px] font-bold text-ink-hi m-0">Your bank account</h1>
              <p className="text-[15px] text-ink-mid m-0 leading-relaxed">
                {payout.bankAmount
                  ? `AUD ${payout.bankAmount} will be transferred to this account. We check the name against bank records before anything is sent.`
                  : 'We check the account name against bank records before anything is sent.'}
              </p>
            </div>

            {bankPhase === 'checking' ? (
              <Checking message="Checking your account details..." />
            ) : (
              <div className="space-y-5">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="accountName" className="text-[14px] font-semibold text-ink-hi">
                    Account name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="accountName"
                    type="text"
                    value={accountName}
                    placeholder="Name on the account"
                    onChange={(e) => {
                      setAccountName(e.target.value);
                      setBankPhase('form');
                    }}
                    className="h-12 w-full px-4 bg-white border border-border rounded-md text-base text-ink-hi placeholder:text-ink-lo focus:border-ink-hi focus:ring-2 focus:ring-slate-200 outline-none transition-all"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="bsb" className="text-[14px] font-semibold text-ink-hi">
                    BSB <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="bsb"
                    type="text"
                    inputMode="numeric"
                    value={bsb}
                    placeholder="000-000"
                    maxLength={7}
                    onChange={(e) => {
                      setBsb(formatBsb(e.target.value));
                      setBankPhase('form');
                    }}
                    className="h-12 w-full px-4 bg-white border border-border rounded-md text-base text-ink-hi font-mono placeholder:font-sans placeholder:text-ink-lo focus:border-ink-hi focus:ring-2 focus:ring-slate-200 outline-none transition-all"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="accountNumber" className="text-[14px] font-semibold text-ink-hi">
                    Account number <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="accountNumber"
                    type="text"
                    inputMode="numeric"
                    value={accountNumber}
                    placeholder="123-456-789"
                    maxLength={11}
                    onChange={(e) => {
                      setAccountNumber(formatAccountNumber(e.target.value));
                      setBankPhase('form');
                    }}
                    className="h-12 w-full px-4 bg-white border border-border rounded-md text-base text-ink-hi font-mono placeholder:font-sans placeholder:text-ink-lo focus:border-ink-hi focus:ring-2 focus:ring-slate-200 outline-none transition-all"
                  />
                </div>
              </div>
            )}

            {bankPhase === 'result' && copResult === 'match' && (
              <div className="p-3.5 rounded-lg bg-teal-50 border border-teal-200 flex items-center gap-2.5">
                <Check className="w-4 h-4 text-[#0d9488] stroke-[3] flex-shrink-0" />
                <span className="text-[14.5px] font-bold text-ink-hi">
                  Account name matches bank records.
                </span>
              </div>
            )}

            {bankPhase === 'result' && copResult === 'closeMatch' && (
              <div className="p-3.5 rounded-lg bg-amber-50 border border-amber-200 space-y-1">
                <p className="text-[15px] font-bold text-ink-hi m-0 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                  Close match
                </p>
                <p className="text-[13.5px] text-ink-mid m-0">
                  The name you entered is slightly different from the one your bank has. You can
                  continue, and the venue will check it before releasing the money.
                </p>
              </div>
            )}

            {bankPhase === 'result' && copResult === 'noMatch' && (
              <div className="p-3.5 rounded-lg bg-red-50 border border-red-200 space-y-1">
                <p className="text-[15px] font-bold text-[#991b1b] m-0 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  These details do not match
                </p>
                <p className="text-[13.5px] text-ink-mid m-0">
                  {copExhausted
                    ? 'We could not match this account after several tries. You can still submit, and a staff member will review it before any money is sent.'
                    : `Please check the name, BSB and account number and try again. Attempt ${copAttempts} of ${MAX_COP_ATTEMPTS}.`}
                </p>
              </div>
            )}
          </>
        )}

        {step === 'review' && (
          <>
            <div className="space-y-2">
              <h1 className="text-[20px] font-bold text-ink-hi m-0">Check your details</h1>
              <p className="text-[15px] text-ink-mid m-0 leading-relaxed">
                Make sure everything below is right before you submit.
              </p>
            </div>

            <div>
              <h2 className="text-[13px] font-semibold text-ink-mid m-0 pb-1">Your payout</h2>
              <div className="divide-y divide-[#eceef2]">
                <DetailRow label="Venue" value={payout.venue} />
                <DetailRow label="Total win" value={`AUD ${payout.winAmount || '-'}`} mono />
                {payout.cashAmount && (
                  <DetailRow label="Cash at the venue" value={`AUD ${payout.cashAmount}`} mono />
                )}
                {payout.bankAmount && (
                  <DetailRow label="To your bank account" value={`AUD ${payout.bankAmount}`} mono />
                )}
              </div>
            </div>

            <div>
              <h2 className="text-[13px] font-semibold text-ink-mid m-0 pb-1 pt-2">Your identity</h2>
              <div className="divide-y divide-[#eceef2]">
                <DetailRow label="Document" value={DOC_LABELS[docType]} />
                {extracted.map((row) => (
                  <DetailRow key={row.label} label={row.label} value={row.value} mono={row.mono} />
                ))}
                <DetailRow label="Face photo" value="Matched" />
              </div>
            </div>

            <div>
              <h2 className="text-[13px] font-semibold text-ink-mid m-0 pb-1 pt-2">Your bank account</h2>
              <div className="divide-y divide-[#eceef2]">
                <DetailRow label="Account name" value={accountName} />
                <DetailRow label="BSB" value={bsb} mono />
                <DetailRow label="Account number" value={accountNumber} mono />
                <div className="flex justify-between items-center py-1.5">
                  <span className="text-[14px] text-ink-mid font-medium">Account check</span>
                  <Badge
                    variant={
                      copResult === 'match' ? 'pass' : copResult === 'closeMatch' ? 'warn' : 'fail'
                    }
                    size="sm"
                  >
                    {copResult === 'match'
                      ? 'Match'
                      : copResult === 'closeMatch'
                      ? 'Close match'
                      : 'No match'}
                  </Badge>
                </div>
              </div>
            </div>

            {copResult === 'noMatch' && (
              <div className="p-3.5 rounded-lg bg-amber-50 border border-amber-200">
                <p className="text-[13.5px] text-ink-mid m-0">
                  Because your account name could not be matched, a staff member will review this
                  before any money is sent.
                </p>
              </div>
            )}
          </>
        )}

        {/* Prototype simulation switches. Not part of the patron product UI. */}
        <div className="mt-8 p-3 rounded-lg border border-dashed border-border bg-surface-page space-y-2 text-xs">
          <div className="flex items-center gap-1 font-semibold text-ink-mid">
            <Sparkles className="w-3.5 h-3.5 text-brand" />
            <span>Prototype preview only, simulate results:</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {[
              ['ID pass', () => setSimId('pass'), simId === 'pass'],
              ['ID fail', () => setSimId('fail'), simId === 'fail'],
              ['Face pass', () => setSimFace('pass'), simFace === 'pass'],
              ['Face fail', () => setSimFace('fail'), simFace === 'fail'],
              ['CoP match', () => setSimCop('match'), simCop === 'match'],
              ['CoP close', () => setSimCop('closeMatch'), simCop === 'closeMatch'],
              ['CoP no match', () => setSimCop('noMatch'), simCop === 'noMatch'],
            ].map(([label, onClick, active]) => (
              <button
                key={label}
                type="button"
                onClick={onClick}
                className={`px-2.5 py-1 rounded font-semibold transition-colors ${
                  active ? 'bg-slate-800 text-white' : 'bg-white border border-border text-ink-mid hover:bg-slate-50'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </main>

      {/* Sticky action bar. On a phone the flow CTA has to stay reachable
          without scrolling, so this is the documented mobile exception to the
          "CTA sits below the card on the page background" rule. */}
      <footer
        className="sticky bottom-0 bg-white border-t border-border px-4 pt-3"
        style={{ paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom, 0px))' }}
      >
        {step === 'welcome' && (
          <Button size="lg" onClick={handleStart} className="w-full h-12 text-[16px] font-semibold">
            Get started
          </Button>
        )}

        {step === 'consent' && (
          <Button
            size="lg"
            disabled={!consentGiven}
            onClick={() => setStep('id')}
            className="w-full h-12 text-[16px] font-semibold"
          >
            I agree, continue
          </Button>
        )}

        {step === 'id' && (
          <>
            {idPhase === 'captured' && (
              <Button
                size="lg"
                onClick={handleRunIdCheck}
                className="w-full h-12 text-[16px] font-semibold"
              >
                Verify my document
              </Button>
            )}
            {idPhase === 'passed' && (
              <Button
                size="lg"
                onClick={() => setStep('face')}
                className="w-full h-12 text-[16px] font-semibold"
              >
                Continue
              </Button>
            )}
            {idPhase === 'failed' && (
              <Button
                size="lg"
                onClick={handleTryAnotherDocument}
                className="w-full h-12 text-[16px] font-semibold"
              >
                Try another document
              </Button>
            )}
            {(idPhase === 'select' || idPhase === 'checking') && (
              <Button size="lg" disabled className="w-full h-12 text-[16px] font-semibold">
                Verify my document
              </Button>
            )}
          </>
        )}

        {step === 'face' && (
          <Button
            size="lg"
            disabled={!facePreview || facePhase === 'checking'}
            onClick={handleRunFaceCheck}
            className="w-full h-12 text-[16px] font-semibold"
          >
            {facePhase === 'failed' ? 'Try again' : 'Continue'}
          </Button>
        )}

        {step === 'bank' && (
          <>
            {bankPhase === 'result' && (copResult === 'match' || copResult === 'closeMatch' || copExhausted) ? (
              <Button
                size="lg"
                onClick={() => setStep('review')}
                className="w-full h-12 text-[16px] font-semibold"
              >
                Continue
              </Button>
            ) : (
              <Button
                size="lg"
                disabled={!isBankFormValid || bankPhase === 'checking'}
                onClick={handleRunCop}
                className="w-full h-12 text-[16px] font-semibold"
              >
                {bankPhase === 'result' ? 'Check again' : 'Check my account'}
              </Button>
            )}
          </>
        )}

        {step === 'review' && (
          <div className="space-y-2">
            <Button
              size="lg"
              onClick={handleSubmit}
              className="w-full h-12 text-[16px] font-semibold"
            >
              Confirm and submit
            </Button>
            <button
              type="button"
              onClick={() => {
                setBankPhase('form');
                setStep('bank');
              }}
              className="w-full inline-flex items-center justify-center gap-1.5 text-[13px] font-semibold text-ink-mid hover:text-ink-hi underline cursor-pointer py-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Go back and change something</span>
            </button>
          </div>
        )}
      </footer>
    </div>
  );
}
