'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  ChevronDown,
  Pencil,
  AlertTriangle,
  Smartphone,
  Check,
  AlertCircle,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { getDisbursementFlags } from '@/lib/payoutFlow';
import {
  getLink,
  resendLink,
  cancelLink,
  buildVerifyUrl,
  formatExpiry,
  LINK_STATUS,
  LINK_STATUS_LABELS,
} from '@/lib/verificationLink';

function SummaryContent() {
  const router = useRouter();

  // Accordion open states
  const [openSections, setOpenSections] = useState({
    payment: true,
    member: true,
    paymentMethod: true,
  });

  // Modal state
  const [submitModalOpen, setSubmitModalOpen] = useState(false);
  const [switchModalOpen, setSwitchModalOpen] = useState(false);

  // Patron self-service verification, when the collector sent a link instead
  // of collecting ID and bank details at the counter.
  const [verificationMode, setVerificationMode] = useState('manual');
  const [verificationToken, setVerificationToken] = useState(null);
  const [linkRecord, setLinkRecord] = useState(null);
  const [resendNotice, setResendNotice] = useState(false);

  // This page is prerendered, so a timestamp produced during render would be
  // baked in at build time and never match the client's clock - React throws a
  // hydration error and the whole page falls back. Fill it in after mount.
  const [renderedAt, setRenderedAt] = useState('');

  useEffect(() => {
    setRenderedAt(
      new Date().toLocaleDateString('en-AU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    );
  }, []);

  // Prototype toggle states
  const [idProtoState, setIdProtoState] = useState('realData'); // 'realData' | 'noId' | 'withId' | 'allId'
  const [copProtoState, setCopProtoState] = useState('match'); // 'match' | 'close' | 'fail'

  // Stored form data
  const [formData, setFormData] = useState({
    payoutType: 'EGM',
    venue: 'Riverside RSL Club',
    disbursementMethod: 'Cash + Bank transfer',
    winAmount: '100.00',
    txnId: '-',
    machine: 'EGM-003',
    cashAmount: '234.00',
    bankAmount: '1,999,766.00',
    email: 'uat@palxi.com',
    membership: '1234',
    firstName: 'test',
    middleName: '',
    lastName: 'test',
    fullName: 'test test',
    docType: 'noId',
    otherDocType: '',
    docsProvided: false,
    manualVerify: false,
    state: 'NSW',
    licNumber: '12345678',
    cardNumber: '123456789',
    passNumber: 'PA1234567',
    passExpiryText: '14/03/2029',
    medicareSelected: false,
    medicareNumber: '2950 12345 1',
    irn: '1',
    cardColor: 'Green',
    cardExpiryText: '05/2028',
    streetNumber: '',
    streetName: '',
    suburb: '',
    addrState: '',
    postcode: '',
    accountName: 'Test Testerson',
    bsb: '062-000',
    accountNumber: '12345678',
    copResult: 'match',
    copStatus: 'match',
    notes: 'test',
    chequePayeeName: 'Test Testerson',
    chequeNumber: '000123',
  });

  useEffect(() => {
    try {
      const saved = JSON.parse(sessionStorage.getItem('payoutFormData') || '{}');
      if (Object.keys(saved).length > 0) {
        setFormData((prev) => ({
          ...prev,
          ...saved,
          fullName:
            saved.firstName || saved.lastName
              ? [saved.firstName, saved.middleName, saved.lastName].filter(Boolean).join(' ')
              : prev.fullName,
        }));
        if (saved.copResult === 'close' || saved.copStatus === 'closeMatch') {
          setCopProtoState('close');
        } else if (saved.copResult === 'fail' || saved.copStatus === 'noMatch') {
          setCopProtoState('fail');
        } else {
          setCopProtoState('match');
        }
        setIdProtoState('realData');
      } else {
        setIdProtoState('noId');
      }
      if (saved.verificationMode) setVerificationMode(saved.verificationMode);
      if (saved.verificationToken) setVerificationToken(saved.verificationToken);
    } catch (e) {}
  }, []);

  // The patron is verifying in another tab or on their own phone, so poll the
  // shared link record rather than waiting for a page reload.
  useEffect(() => {
    if (verificationMode !== 'link' || !verificationToken) return undefined;
    const read = () => setLinkRecord(getLink(verificationToken));
    read();
    const interval = setInterval(read, 2000);
    return () => clearInterval(interval);
  }, [verificationMode, verificationToken]);

  const isLinkMode = verificationMode === 'link' && Boolean(verificationToken);
  const patronVerified = linkRecord?.status === LINK_STATUS.COMPLETED;
  const patronPending = isLinkMode && !patronVerified;
  const patronResult = linkRecord?.result || null;

  // The patron flow and the prototype toggle name CoP outcomes differently;
  // normalise to the labels this page already renders.
  const effectiveCop =
    patronVerified && patronResult
      ? { closeMatch: 'close', noMatch: 'fail' }[patronResult.copResult] || 'match'
      : copProtoState;

  const handleResend = () => {
    const next = resendLink(verificationToken);
    setLinkRecord(next);
    setResendNotice(true);
    setTimeout(() => setResendNotice(false), 2500);
  };

  const handleSwitchToManual = () => {
    cancelLink(verificationToken);
    try {
      const current = JSON.parse(sessionStorage.getItem('payoutFormData') || '{}');
      sessionStorage.setItem(
        'payoutFormData',
        JSON.stringify({ ...current, verificationMode: 'manual', verificationToken: null })
      );
    } catch (e) {}
    setSwitchModalOpen(false);
    router.push('/collector/primary-id');
  };

  const toggleSection = (key) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleConfirmSubmit = () => {
    sessionStorage.removeItem('payoutFormData');
    setSubmitModalOpen(false);
    router.push('/?submitted=true');
  };

  // Compute active view data based on ID Prototype State
  const getActiveData = () => {
    if (idProtoState === 'noId') {
      return {
        ...formData,
        docTypeLabel: 'No ID document',
        showConfirmation: true,
        docsProvided: 'No',
        manualVerify: 'No',
        showLicence: false,
        showPassport: false,
        showMedicare: false,
        street: '-',
        suburb: '-',
        state: '-',
        postcode: '-',
        hasAddress: false,
      };
    }
    if (idProtoState === 'withId') {
      return {
        ...formData,
        docTypeLabel: 'Driver licence, Medicare card',
        showConfirmation: false,
        showLicence: true,
        licState: 'NSW',
        licNumber: '12345678',
        licCard: '123456789',
        showPassport: false,
        showMedicare: true,
        medicareNumber: '2950 12345 1',
        medicareIrn: '1',
        medicareColor: 'Green',
        medicareExpiry: '05/2028',
        street: '12 Example Street',
        suburb: 'Sydney',
        state: 'NSW',
        postcode: '2000',
        hasAddress: true,
      };
    }
    if (idProtoState === 'allId') {
      return {
        ...formData,
        docTypeLabel: 'Passport, Medicare card',
        showConfirmation: false,
        showLicence: false,
        showPassport: true,
        passNumber: 'PA1234567',
        passExpiry: '14/03/2029',
        showMedicare: true,
        medicareNumber: '2950 12345 1',
        medicareIrn: '1',
        medicareColor: 'Green',
        medicareExpiry: '05/2028',
        street: '12 Example Street',
        suburb: 'Sydney',
        state: 'NSW',
        postcode: '2000',
        hasAddress: true,
      };
    }
    if (idProtoState === 'reused') {
      return {
        ...formData,
        fullName: 'Sarah Jane Jenkins',
        email: 'sarah.jenkins@example.com',
        membership: 'MEM-10884',
        docTypeLabel: 'Driver licence, Medicare card',
        isReusedId: true,
        reuseDate: '12 Apr 2026',
        showConfirmation: false,
        showLicence: true,
        licState: 'NSW',
        licNumber: '20984124',
        licCard: '981245781',
        showPassport: false,
        showMedicare: true,
        medicareNumber: '2950 12345 1',
        medicareIrn: '1',
        medicareColor: 'Green',
        medicareExpiry: '05/2028',
        street: '4/12 Riverside Avenue',
        suburb: 'Parramatta',
        state: 'NSW',
        postcode: '2150',
        hasAddress: true,
      };
    }

    // Real Data calculation
    const docTypeLabels = {
      licence: 'Driver licence',
      passport: 'Passport',
      otherKyc: formData.otherDocType || 'Other document',
      noId: 'No ID document',
    };
    const parts = [];
    if (formData.docType && docTypeLabels[formData.docType]) {
      parts.push(docTypeLabels[formData.docType]);
    }
    if (formData.medicareSelected) {
      parts.push('Medicare card');
    }
    let docTypeLabel = parts.join(', ') || 'No ID document';

    const showConfirmation = formData.docType === 'noId' || formData.docType === 'otherKyc';
    const street = [formData.streetNumber, formData.streetName].filter(Boolean).join(' ') || formData.street || '-';
    const suburb = formData.suburb || '-';
    const state = formData.addrState || formData.state || '-';
    const postcode = formData.postcode || '-';
    const hasAddress = Boolean(formData.streetNumber || formData.streetName || formData.street);

    return {
      ...formData,
      docTypeLabel,
      isReusedId: Boolean(formData.idvReused || formData.idvStatus === 'reused'),
      reuseDate: formData.idvReuseDate || '12/04/2026',
      showConfirmation,
      docsProvided: formData.docsProvided ? 'Yes' : 'No',
      manualVerify: formData.manualVerify ? 'Yes' : 'No',
      showLicence: formData.docType === 'licence',
      licState: formData.state || '-',
      licNumber: formData.licNumber || '-',
      licCard: formData.cardNumber || '-',
      showPassport: formData.docType === 'passport',
      passNumber: formData.passNumber || '-',
      passExpiry: formData.passExpiryText || formData.passExpiry || '-',
      showMedicare: Boolean(formData.medicareSelected),
      medicareNumber: formData.medicareNumber || '-',
      medicareIrn: formData.irn || '-',
      medicareColor: formData.cardColor || '-',
      medicareExpiry: formData.cardExpiryText || formData.medicareExpiry || '-',
      street,
      suburb,
      state,
      postcode,
      hasAddress,
    };
  };

  const view = getActiveData();
  const { hasBank, hasCheque } = getDisbursementFlags(view.disbursementMethod);

  // Determine Primary ID Edit destination
  const getPrimaryIdEditUrl = () => {
    if (formData.idvReused || formData.idvStatus === 'reused') return '/collector/primary-id?from=summary';
    if (formData.docType === 'passport') return '/collector/passport-detail?from=summary';
    if (formData.docType === 'otherKyc') return '/collector/other-documents?from=summary';
    if (formData.docType === 'noId') return '/collector/no-id?from=summary';
    return '/collector/licence-detail?from=summary';
  };

  return (
    <>
      <div className="max-w-2xl mx-auto">
          {/* Header Row */}
          <div className="flex items-end justify-between gap-4 mb-6">
            <div className="flex items-center gap-6">
              <Link
                href="/collector/cheque-details?from=summary"
                className="inline-flex items-center gap-1.5 text-[15px] font-bold text-ink-hi hover:text-black transition-colors underline cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4 text-brand" />
                <span>Back</span>
              </Link>
              <h1 className="text-xl sm:text-2xl font-bold text-ink-hi">Summary</h1>
            </div>
            <p className="text-[14px] text-ink-mid m-0 whitespace-nowrap">{renderedAt}</p>
          </div>

          {/* Patron self-service verification state */}
          {isLinkMode && linkRecord && (
            <div className="mb-6">
              {patronVerified ? (
                <div className="p-3.5 rounded-lg bg-teal-50 border border-teal-200 shadow-2xs flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-teal-600 stroke-[3] flex-shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <p className="text-[15px] font-bold text-ink-hi m-0">
                      Patron verification complete
                    </p>
                    <p className="text-[13.5px] text-ink-mid m-0">
                      {linkRecord.payout?.patronName} verified their identity and bank details on
                      their phone. This payout is ready to submit for approval.
                    </p>
                  </div>
                </div>
              ) : linkRecord.status === LINK_STATUS.STAFF_ACTION ? (
                <div className="p-3.5 rounded-lg bg-red-50 border border-red-200 shadow-2xs space-y-2">
                  <div className="flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                    <div className="space-y-0.5">
                      <p className="text-[15px] font-bold text-[#991b1b] m-0">
                        Patron could not be verified electronically
                      </p>
                      <p className="text-[13.5px] text-ink-mid m-0">
                        Their documents failed both electronic checks. You need to verify their ID
                        in person before this payout can go to approval.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSwitchModalOpen(true)}
                    className="text-[13px] font-semibold text-ink-mid hover:text-ink-hi underline cursor-pointer"
                  >
                    Verify at the counter instead
                  </button>
                </div>
              ) : (
                <div className="p-3.5 rounded-lg bg-amber-50 border border-amber-200 shadow-2xs space-y-2.5">
                  <div className="flex items-start gap-2.5">
                    <Smartphone className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div className="space-y-0.5">
                      <p className="text-[15px] font-bold text-ink-hi m-0">
                        Waiting on patron verification
                      </p>
                      <p className="text-[13.5px] text-ink-mid m-0">
                        {LINK_STATUS_LABELS[linkRecord.status]}. Sent to{' '}
                        <span className="font-mono">{linkRecord.payout?.mobile}</span>
                        {linkRecord.status === LINK_STATUS.EXPIRED
                          ? '. Send a new link to let them continue.'
                          : `. The link stops working at ${formatExpiry(linkRecord.expiresAt)}.`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 flex-wrap">
                    <button
                      type="button"
                      onClick={handleResend}
                      className="text-[13px] font-semibold text-ink-mid hover:text-ink-hi underline cursor-pointer"
                    >
                      Resend link
                    </button>
                    <button
                      type="button"
                      onClick={() => setSwitchModalOpen(true)}
                      className="text-[13px] font-semibold text-ink-mid hover:text-ink-hi underline cursor-pointer"
                    >
                      Switch to manual verification
                    </button>
                    <button
                      type="button"
                      onClick={() => window.open(buildVerifyUrl(verificationToken), '_blank')}
                      className="text-[13px] font-semibold text-ink-mid hover:text-ink-hi underline cursor-pointer"
                    >
                      Open patron view
                    </button>
                    {resendNotice && (
                      <span className="text-[13px] font-semibold text-teal-700">Link resent</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Single Content Card with Hairline Accordion Dividers */}
          <div className="bg-white border border-[#e2e3ea] rounded-[10px] p-6 sm:p-7 shadow-sm">
            <div className="divide-y divide-[#eceef2]">
              {/* Section 1: Payment Breakdown */}
              <div className="pb-4 first:pt-0">
                <div
                  onClick={() => toggleSection('payment')}
                  className="flex items-center justify-between cursor-pointer py-4 first:pt-0 select-none group"
                >
                  <span
                    className={`text-[16px] font-bold transition-colors ${
                      openSections.payment ? 'text-ink-hi' : 'text-ink-mid'
                    }`}
                  >
                    Payment breakdown
                  </span>
                  <div className="flex items-center gap-4 flex-shrink-0">
                    <Link
                      href="/collector/payment-breakdown?from=summary"
                      onClick={(e) => e.stopPropagation()}
                      className="text-ink-mid hover:text-ink-hi underline font-semibold text-[13px] inline-flex items-center gap-1 transition-colors"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </Link>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform duration-150 ${
                        openSections.payment ? 'rotate-180 text-ink-hi' : 'text-ink-mid'
                      }`}
                    />
                  </div>
                </div>

                {openSections.payment && (
                  <div className="space-y-1 text-[15px] pt-1">
                    <div className="flex justify-between items-center py-1">
                      <span className="text-ink-mid font-medium">Payout type</span>
                      <span className="font-bold text-ink-hi">{view.payoutType || 'EGM'}</span>
                    </div>
                    <div className="flex justify-between items-center py-1">
                      <span className="text-ink-mid font-medium">Venue</span>
                      <span className="font-bold text-ink-hi">{view.venue || 'Riverside RSL Club'}</span>
                    </div>
                    <div className="flex justify-between items-center py-1">
                      <span className="text-ink-mid font-medium">Win amount</span>
                      <span className="font-bold text-ink-hi tabular-nums">
                        <span className="text-ink-mid font-medium mr-1">AUD</span>
                        {view.winAmount || '100.00'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-1">
                      <span className="text-ink-mid font-medium">Internal transaction ID</span>
                      <span className="font-bold text-ink-hi tabular-nums font-mono">{view.txnId || '-'}</span>
                    </div>
                    <div className="flex justify-between items-center py-1">
                      <span className="text-ink-mid font-medium">Machine ID</span>
                      <span className="font-bold text-ink-hi tabular-nums font-mono">{view.machine || 'EGM-003'}</span>
                    </div>
                    <div className="flex justify-between items-center py-1">
                      <span className="text-ink-mid font-medium">Cash amount</span>
                      <span className="font-bold text-ink-hi tabular-nums">
                        <span className="text-ink-mid font-medium mr-1">AUD</span>
                        {view.cashAmount || '234.00'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-1">
                      <span className="text-ink-mid font-medium">Transfer amount</span>
                      <span className="font-bold text-ink-hi tabular-nums">
                        <span className="text-ink-mid font-medium mr-1">AUD</span>
                        {view.bankAmount || '1,999,766.00'}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Section 2: Member Identification */}
              <div className="py-4">
                <div
                  onClick={() => toggleSection('member')}
                  className="flex items-center justify-between cursor-pointer py-4 select-none group"
                >
                  <span
                    className={`text-[16px] font-bold transition-colors ${
                      openSections.member ? 'text-ink-hi' : 'text-ink-mid'
                    }`}
                  >
                    Member identification
                  </span>
                  <div className="flex items-center gap-4 flex-shrink-0">
                    {!isLinkMode && (
                      <Link
                        href={getPrimaryIdEditUrl()}
                        onClick={(e) => e.stopPropagation()}
                        className="text-ink-mid hover:text-ink-hi underline font-semibold text-[13px] inline-flex items-center gap-1 transition-colors"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </Link>
                    )}
                    <ChevronDown
                      className={`w-4 h-4 transition-transform duration-150 ${
                        openSections.member ? 'rotate-180 text-ink-hi' : 'text-ink-mid'
                      }`}
                    />
                  </div>
                </div>

                {openSections.member && (
                  <div className="space-y-1 text-[15px] pt-1">
                    <div className="flex justify-between items-center py-1">
                      <span className="text-ink-mid font-medium">Membership number</span>
                      <span className="font-bold text-ink-hi tabular-nums font-mono">{view.membership || '1234'}</span>
                    </div>
                    <div className="flex justify-between items-center py-1">
                      <span className="text-ink-mid font-medium">Email</span>
                      <span className="font-bold text-ink-hi">{view.email || 'uat@palxi.com'}</span>
                    </div>
                    <div className="flex justify-between items-center py-1">
                      <span className="text-ink-mid font-medium">Full name</span>
                      <span className="font-bold text-ink-hi">{view.fullName || 'test test'}</span>
                    </div>
                    {patronPending ? (
                      <div className="py-2">
                        <span className="text-[14px] text-ink-lo">
                          The patron is capturing their identity documents on their phone. Their
                          details will appear here once verification is complete.
                        </span>
                      </div>
                    ) : (
                      <>
                    <div className="flex justify-between items-center py-1">
                      <span className="text-ink-mid font-medium">Document type</span>
                      <span className="font-bold text-ink-hi">
                        {patronVerified && patronResult ? patronResult.docLabel : view.docTypeLabel}
                      </span>
                    </div>

                    {patronVerified && (
                      <>
                        <div className="flex justify-between items-center py-1">
                          <span className="text-ink-mid font-medium">Verification method</span>
                          <span className="font-bold text-ink-hi flex items-center gap-1.5">
                            Patron self-service
                            <Badge variant="pass" size="sm">{patronResult?.idvPath}</Badge>
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-1">
                          <span className="text-ink-mid font-medium">Face match</span>
                          <span className="font-bold text-ink-hi">Matched</span>
                        </div>
                      </>
                    )}

                    {view.isReusedId && (
                      <div className="flex justify-between items-center py-1">
                        <span className="text-ink-mid font-medium">Verification method</span>
                        <span className="font-bold text-ink-hi flex items-center gap-1.5">
                          Verified {view.reuseDate}
                          <Badge variant="pass" size="sm">Reused</Badge>
                        </span>
                      </div>
                    )}

                    <div className="flex justify-between items-start py-1">
                      <span className="text-ink-mid font-medium">Notes</span>
                      <span className="font-bold text-ink-hi text-right max-w-[60%] break-words whitespace-pre-wrap">
                        {view.notes || '-'}
                      </span>
                    </div>

                    {/* Identity Confirmation (No ID / Manual KYC) */}
                    {view.showConfirmation && (
                      <>
                        <p className="text-[13px] font-semibold text-ink-mid pt-4 pb-1 m-0">
                          Identity confirmation
                        </p>
                        <div className="flex justify-between items-center py-1">
                          <span className="text-ink-mid font-medium">Identity documents provided to staff member</span>
                          <span className="font-bold text-ink-hi">{view.docsProvided}</span>
                        </div>
                        <div className="flex justify-between items-center py-1">
                          <span className="text-ink-mid font-medium">Identity manually verified</span>
                          <span className="font-bold text-ink-hi">{view.manualVerify}</span>
                        </div>
                      </>
                    )}

                    {/* Driver Licence Subsection */}
                    {view.showLicence && (
                      <>
                        <p className="text-[13px] font-semibold text-ink-mid pt-4 pb-1 m-0">
                          Driver licence
                        </p>
                        <div className="flex justify-between items-center py-1">
                          <span className="text-ink-mid font-medium">State of issue</span>
                          <span className="font-bold text-ink-hi">{view.licState}</span>
                        </div>
                        <div className="flex justify-between items-center py-1">
                          <span className="text-ink-mid font-medium">Licence number</span>
                          <span className="font-bold text-ink-hi tabular-nums font-mono">{view.licNumber}</span>
                        </div>
                        <div className="flex justify-between items-center py-1">
                          <span className="text-ink-mid font-medium">Card number</span>
                          <span className="font-bold text-ink-hi tabular-nums font-mono">{view.licCard}</span>
                        </div>
                      </>
                    )}

                    {/* Passport Subsection */}
                    {view.showPassport && (
                      <>
                        <p className="text-[13px] font-semibold text-ink-mid pt-4 pb-1 m-0">
                          Passport
                        </p>
                        <div className="flex justify-between items-center py-1">
                          <span className="text-ink-mid font-medium">Passport number</span>
                          <span className="font-bold text-ink-hi tabular-nums font-mono">{view.passNumber}</span>
                        </div>
                        <div className="flex justify-between items-center py-1">
                          <span className="text-ink-mid font-medium">Expiry date</span>
                          <span className="font-bold text-ink-hi tabular-nums">{view.passExpiry}</span>
                        </div>
                      </>
                    )}

                    {/* Medicare Card Subsection */}
                    {view.showMedicare && (
                      <>
                        <p className="text-[13px] font-semibold text-ink-mid pt-4 pb-1 m-0">
                          Medicare card
                        </p>
                        <div className="flex justify-between items-center py-1">
                          <span className="text-ink-mid font-medium">Card number</span>
                          <span className="font-bold text-ink-hi tabular-nums font-mono">{view.medicareNumber}</span>
                        </div>
                        <div className="flex justify-between items-center py-1">
                          <span className="text-ink-mid font-medium">IRN</span>
                          <span className="font-bold text-ink-hi tabular-nums font-mono">{view.medicareIrn}</span>
                        </div>
                        <div className="flex justify-between items-center py-1">
                          <span className="text-ink-mid font-medium">Card colour</span>
                          <span className="font-bold text-ink-hi">{view.medicareColor}</span>
                        </div>
                        <div className="flex justify-between items-center py-1">
                          <span className="text-ink-mid font-medium">Expiry date</span>
                          <span className="font-bold text-ink-hi tabular-nums">{view.medicareExpiry}</span>
                        </div>
                      </>
                    )}

                    {/* Address Subsection */}
                    <p className="text-[13px] font-semibold text-ink-mid pt-4 pb-1 m-0">
                      Address
                    </p>
                    <div className="flex justify-between items-center py-1">
                      <span className="text-ink-mid font-medium">Street</span>
                      <span className={`font-bold text-ink-hi ${!view.hasAddress ? 'text-ink-mid font-normal' : ''}`}>
                        {view.street}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-1">
                      <span className="text-ink-mid font-medium">Suburb</span>
                      <span className={`font-bold text-ink-hi ${!view.hasAddress ? 'text-ink-mid font-normal' : ''}`}>
                        {view.suburb}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-1">
                      <span className="text-ink-mid font-medium">State</span>
                      <span className={`font-bold text-ink-hi ${!view.hasAddress ? 'text-ink-mid font-normal' : ''}`}>
                        {view.state}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-1">
                      <span className="text-ink-mid font-medium">Postcode</span>
                      <span className={`font-bold text-ink-hi tabular-nums ${!view.hasAddress ? 'text-ink-mid font-normal' : ''}`}>
                        {view.postcode}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-1">
                      <span className="text-ink-mid font-medium">Country of issue</span>
                      <span className="font-bold text-ink-hi">Australia</span>
                    </div>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Section 3: Payment method details - always shown; whichever method wasn't picked shows a "not required" note instead of its fields */}
              <div className="pt-4">
                <div
                  onClick={() => toggleSection('paymentMethod')}
                  className="flex items-center justify-between cursor-pointer py-4 select-none group"
                >
                  <span
                    className={`text-[16px] font-bold transition-colors ${
                      openSections.paymentMethod ? 'text-ink-hi' : 'text-ink-mid'
                    }`}
                  >
                    Payment method details
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform duration-150 flex-shrink-0 ${
                      openSections.paymentMethod ? 'rotate-180 text-ink-hi' : 'text-ink-mid'
                    }`}
                  />
                </div>

                {openSections.paymentMethod && (
                  <div className="space-y-1 text-[15px] pt-1">
                    <div className="flex justify-between items-center py-1">
                      <span className="text-ink-mid font-medium">Payment method</span>
                      <div className="flex items-center gap-1.5 flex-wrap justify-end">
                        {(view.disbursementMethod || 'Cash + Bank transfer')
                          .split('+')
                          .map((m) => m.trim())
                          .filter(Boolean)
                          .map((method) => (
                            <Badge key={method} variant="neutral" size="sm">{method}</Badge>
                          ))}
                      </div>
                    </div>

                    {/* Bank account subsection */}
                    <div className="flex items-center justify-between pt-4 pb-1">
                      <p className="text-[13px] font-semibold text-ink-mid m-0">
                        Bank account
                        {!hasBank && <span className="ml-1 font-normal text-ink-lo">(not required)</span>}
                      </p>
                      {hasBank && !isLinkMode && (
                        <Link
                          href="/collector/bank-account?from=summary"
                          className="text-ink-mid hover:text-ink-hi underline font-semibold text-[13px] inline-flex items-center gap-1 transition-colors"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </Link>
                      )}
                    </div>
                    {hasBank && patronPending ? (
                      <div className="py-1">
                        <span className="text-[14px] text-ink-lo">
                          The patron is entering their bank details on their phone. They will appear
                          here once their account has been checked.
                        </span>
                      </div>
                    ) : hasBank ? (
                      <>
                        <div className="flex justify-between items-center py-1">
                          <span className="text-ink-mid font-medium">Account name</span>
                          <span className="font-bold text-ink-hi">
                            {(patronVerified && patronResult?.accountName) || view.accountName || 'Test Testerson'}
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-1">
                          <span className="text-ink-mid font-medium">BSB number</span>
                          <span className="font-bold text-ink-hi tabular-nums font-mono">
                            {(patronVerified && patronResult?.bsb) || view.bsb || '062-000'}
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-1">
                          <span className="text-ink-mid font-medium">Account number</span>
                          <span className="font-bold text-ink-hi tabular-nums font-mono">
                            {(patronVerified && patronResult?.accountNumber) || view.accountNumber || '12345678'}
                          </span>
                        </div>

                        {/* Inline CoP Validation */}
                        <div className="flex justify-between items-center py-1">
                          <span className="text-ink-mid font-medium">CoP validation</span>
                          <Badge variant={effectiveCop === 'match' ? 'pass' : effectiveCop === 'close' ? 'warn' : 'fail'} size="sm">
                            {effectiveCop === 'match'
                              ? 'Match'
                              : effectiveCop === 'close'
                              ? 'Close match'
                              : 'No match'}
                          </Badge>
                        </div>

                        {/* Close Match Note */}
                        {effectiveCop === 'close' && (
                          <div className="mt-2 p-3.5 rounded-lg bg-amber-50 border border-amber-200 space-y-1">
                            <p className="text-[15px] font-bold text-ink-hi m-0 flex items-center gap-2">
                              <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                              Close match - flagged for approver.
                            </p>
                            <p className="text-[13.5px] text-ink-mid m-0">
                              {view.accountName
                                ? `Entered name "${view.accountName}" differs from registered account name. The payee confirmed to proceed.`
                                : 'Entered name differs from registered account name. The payee confirmed to proceed.'}
                            </p>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="py-1">
                        <span className="text-[14px] text-ink-lo">
                          Bank transfer wasn&apos;t selected as a payment method for this payout.
                        </span>
                      </div>
                    )}

                    {/* Cheque subsection */}
                    <div className="flex items-center justify-between pt-4 pb-1">
                      <p className="text-[13px] font-semibold text-ink-mid m-0">
                        Cheque
                        {!hasCheque && <span className="ml-1 font-normal text-ink-lo">(not required)</span>}
                      </p>
                      {hasCheque && (
                        <Link
                          href="/collector/cheque-details?from=summary"
                          className="text-ink-mid hover:text-ink-hi underline font-semibold text-[13px] inline-flex items-center gap-1 transition-colors"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </Link>
                      )}
                    </div>
                    {hasCheque ? (
                      <>
                        <div className="flex justify-between items-center py-1">
                          <span className="text-ink-mid font-medium">Name the cheque is written for</span>
                          <span className="font-bold text-ink-hi">{view.chequePayeeName || '-'}</span>
                        </div>
                        <div className="flex justify-between items-center py-1">
                          <span className="text-ink-mid font-medium">Cheque number</span>
                          <span className="font-bold text-ink-hi tabular-nums font-mono">{view.chequeNumber || '-'}</span>
                        </div>
                      </>
                    ) : (
                      <div className="py-1">
                        <span className="text-[14px] text-ink-lo">
                          Cheque wasn&apos;t selected as a payment method for this payout.
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6">
            <Button
              size="lg"
              disabled={!isLinkMode && copProtoState === 'fail'}
              onClick={() => setSubmitModalOpen(true)}
              className="w-full h-12 text-[16px] font-semibold"
            >
              {patronPending ? 'Submit and wait for verification' : 'Submit'}
            </Button>
          </div>

          {/* Prototype Simulation Toggles matching deploy/13-summary.html */}
          <div className="mt-8 space-y-2">
            {/* CoP Toggle */}
            <div className="flex items-center gap-2 p-3 rounded-lg border border-dashed border-border bg-surface-card flex-wrap text-xs">
              <span className="font-semibold text-ink-mid">
                Prototype preview only:
              </span>
              <button
                type="button"
                onClick={() => setCopProtoState('match')}
                className={`px-2.5 py-1 rounded font-semibold transition-colors ${
                  copProtoState === 'match'
                    ? 'bg-slate-800 text-white'
                    : 'bg-slate-100 text-ink-mid hover:bg-slate-200'
                }`}
              >
                CoP: Match
              </button>
              <button
                type="button"
                onClick={() => setCopProtoState('close')}
                className={`px-2.5 py-1 rounded font-semibold transition-colors ${
                  copProtoState === 'close'
                    ? 'bg-slate-800 text-white'
                    : 'bg-slate-100 text-ink-mid hover:bg-slate-200'
                }`}
              >
                CoP: Close match
              </button>
              <button
                type="button"
                onClick={() => setCopProtoState('fail')}
                className={`px-2.5 py-1 rounded font-semibold transition-colors ${
                  copProtoState === 'fail'
                    ? 'bg-slate-800 text-white'
                    : 'bg-slate-100 text-ink-mid hover:bg-slate-200'
                }`}
              >
                CoP: No match
              </button>
            </div>

            {/* ID Sandbox Toggle */}
            <div className="flex items-center gap-2 p-3 rounded-lg border border-dashed border-border bg-surface-card flex-wrap text-xs">
              <span className="font-semibold text-ink-mid">
                Prototype preview only:
              </span>
              <button
                type="button"
                onClick={() => setIdProtoState('realData')}
                className={`px-2.5 py-1 rounded font-semibold transition-colors ${
                  idProtoState === 'realData'
                    ? 'bg-slate-800 text-white'
                    : 'bg-slate-100 text-ink-mid hover:bg-slate-200'
                }`}
              >
                Real data
              </button>
              <button
                type="button"
                onClick={() => setIdProtoState('noId')}
                className={`px-2.5 py-1 rounded font-semibold transition-colors ${
                  idProtoState === 'noId'
                    ? 'bg-slate-800 text-white'
                    : 'bg-slate-100 text-ink-mid hover:bg-slate-200'
                }`}
              >
                ID: Not provided
              </button>
              <button
                type="button"
                onClick={() => setIdProtoState('withId')}
                className={`px-2.5 py-1 rounded font-semibold transition-colors ${
                  idProtoState === 'withId'
                    ? 'bg-slate-800 text-white'
                    : 'bg-slate-100 text-ink-mid hover:bg-slate-200'
                }`}
              >
                ID: Provided (Driver licence and Medicare)
              </button>
              <button
                type="button"
                onClick={() => setIdProtoState('allId')}
                className={`px-2.5 py-1 rounded font-semibold transition-colors ${
                  idProtoState === 'allId'
                    ? 'bg-slate-800 text-white'
                    : 'bg-slate-100 text-ink-mid hover:bg-slate-200'
                }`}
              >
                ID: Provided (Passport and Medicare)
              </button>
              <button
                type="button"
                onClick={() => setIdProtoState('reused')}
                className={`px-2.5 py-1 rounded font-semibold transition-colors ${
                  idProtoState === 'reused'
                    ? 'bg-slate-800 text-white'
                    : 'bg-slate-100 text-ink-mid hover:bg-slate-200'
                }`}
              >
                ID: Reused (Returning player)
              </button>
            </div>
          </div>
      </div>

      {/* Submit Confirmation Modal (matching deploy/13-summary.html) */}
      {submitModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSubmitModalOpen(false);
          }}
        >
          <div
            className="bg-surface-card border border-border rounded-xl shadow-modal max-w-[440px] w-full p-7 space-y-5 animate-in fade-in zoom-in-95 duration-150"
            role="dialog"
            aria-modal="true"
            aria-labelledby="submitModalTitle"
          >
            <h2 id="submitModalTitle" className="text-xl font-bold text-ink-hi m-0">
              {patronPending ? 'Submit and wait for verification?' : 'Submit for approval?'}
            </h2>
            <p className="text-[15px] text-ink-mid leading-relaxed m-0">
              {patronPending
                ? 'This payout will be recorded as pending verification. It moves to approval automatically once the patron finishes on their phone.'
                : 'Once submitted, this payout moves to Approval and can no longer be viewed or edited.'}
            </p>

            <div className="flex gap-4 pt-2">
              <Button
                variant="secondary"
                size="md"
                onClick={() => setSubmitModalOpen(false)}
                className="flex-1 text-[16px] font-semibold"
              >
                Cancel
              </Button>
              <Button
                size="md"
                onClick={handleConfirmSubmit}
                className="flex-1 text-[16px] font-semibold"
              >
                Submit
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Switch to manual verification */}
      {switchModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSwitchModalOpen(false);
          }}
        >
          <div
            className="bg-surface-card border border-border rounded-xl shadow-modal max-w-[440px] w-full p-7 space-y-5"
            role="dialog"
            aria-modal="true"
            aria-labelledby="switchModalTitle"
          >
            <h2 id="switchModalTitle" className="text-xl font-bold text-ink-hi m-0">
              Verify at the counter instead?
            </h2>
            <p className="text-[15px] text-ink-mid leading-relaxed m-0">
              The patron&apos;s link will stop working immediately and anything they entered will be
              discarded. You will collect their ID and bank details here instead.
            </p>

            <div className="flex gap-4 pt-2">
              <Button
                variant="secondary"
                size="md"
                onClick={() => setSwitchModalOpen(false)}
                className="flex-1 text-[16px] font-semibold"
              >
                Cancel
              </Button>
              <Button
                size="md"
                onClick={handleSwitchToManual}
                className="flex-1 text-[16px] font-semibold"
              >
                Switch to manual
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function SummaryPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-ink-mid">Loading payout summary...</div>}>
      <SummaryContent />
    </Suspense>
  );
}

