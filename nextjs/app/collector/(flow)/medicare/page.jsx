'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ArrowLeft,
  ChevronDown,
  Calendar,
  Search,
  Check,
  Edit2,
  AlertCircle,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Checkbox from '@/components/ui/Checkbox';

function MedicareDetailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fromSummary = searchParams.get('from') === 'summary';

  const [subPage, setSubPage] = useState(0);

  // Subpage 0: Medicare details
  const [medicareNumber, setMedicareNumber] = useState('2948102941');
  const [irn, setIrn] = useState('1');
  const [cardColor, setCardColor] = useState('Green');
  const [cardColorOpen, setCardColorOpen] = useState(false);
  const [cardExpiry, setCardExpiry] = useState('11/2028');

  // Subpage 1: Personal details
  const [firstName, setFirstName] = useState('Sarah');
  const [middleInitial, setMiddleInitial] = useState('J');
  const [lastName, setLastName] = useState('Jenkins');
  const [dob, setDob] = useState('14/08/1988');

  // Subpage 2: Address
  const [addressSearch, setAddressSearch] = useState('142 Pacific Hwy, North Sydney NSW 2060');
  const [unitNumber, setUnitNumber] = useState('');
  const [streetNumber, setStreetNumber] = useState('142');
  const [streetName, setStreetName] = useState('Pacific Hwy');
  const [suburb, setSuburb] = useState('North Sydney');
  const [addrState, setAddrState] = useState('NSW');
  const [postcode, setPostcode] = useState('2060');

  // Subpage 3: Review, Consent & IDV
  const [consentConfirmed, setConsentConfirmed] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState('idle');
  const [simulatedResult, setSimulatedResult] = useState('pass');

  const cardColors = ['Green', 'Blue', 'Yellow'];

  useEffect(() => {
    try {
      const saved = JSON.parse(sessionStorage.getItem('payoutFormData') || '{}');
      if (saved.medicareNumber) setMedicareNumber(saved.medicareNumber);
      if (saved.irn) setIrn(saved.irn);
      if (saved.cardColor) setCardColor(saved.cardColor);
      if (saved.cardExpiry) setCardExpiry(saved.cardExpiry);
      if (saved.firstName) setFirstName(saved.firstName);
      if (saved.middleName) setMiddleInitial(saved.middleName.charAt(0));
      if (saved.lastName) setLastName(saved.lastName);
      if (saved.dob) setDob(saved.dob);
      if (saved.streetNumber) setStreetNumber(saved.streetNumber);
      if (saved.streetName) setStreetName(saved.streetName);
      if (saved.suburb) setSuburb(saved.suburb);
      if (saved.addrState) setAddrState(saved.addrState);
      if (saved.postcode) setPostcode(saved.postcode);
    } catch (e) {}
  }, []);

  const persist = (patch) => {
    try {
      const current = JSON.parse(sessionStorage.getItem('payoutFormData') || '{}');
      sessionStorage.setItem('payoutFormData', JSON.stringify({ ...current, ...patch }));
    } catch (e) {}
  };

  const isPage0Valid = medicareNumber.trim() !== '' && irn.trim() !== '' && cardColor && cardExpiry.trim() !== '';
  const isPage1Valid = firstName.trim() !== '' && lastName.trim() !== '' && dob.trim() !== '';
  const isPage2Valid = streetNumber.trim() !== '' && streetName.trim() !== '' && suburb.trim() !== '' && postcode.trim() !== '';

  const handleSubNext = () => {
    if (subPage === 0 && isPage0Valid) {
      persist({ medicareNumber, irn, cardColor, cardExpiry });
      setSubPage(1);
    } else if (subPage === 1 && isPage1Valid) {
      persist({ firstName, middleInitial, lastName, dob });
      setSubPage(2);
    } else if (subPage === 2 && isPage2Valid) {
      persist({ unitNumber, streetNumber, streetName, suburb, addrState, postcode });
      setSubPage(3);
    }
  };

  const handleRunVerification = () => {
    if (!consentConfirmed) return;
    setIsVerifying(true);
    setVerificationStatus('running');

    setTimeout(() => {
      setIsVerifying(false);
      if (simulatedResult === 'pass') {
        setVerificationStatus('pass');
        persist({
          secondaryDoc: 'medicare',
          secondaryIdvStatus: 'pass',
          medicareNumber,
          irn,
          cardColor,
        });
      } else {
        setVerificationStatus('fail');
        persist({ secondaryIdvStatus: 'fail' });
      }
    }, 1200);
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header Row */}
          <div className="flex items-center gap-6 mb-4">
            <button
              type="button"
              onClick={() => {
                if (subPage > 0) setSubPage(subPage - 1);
                else router.push('/collector/secondary-id');
              }}
              className="inline-flex items-center gap-1.5 text-[15px] font-bold text-ink-hi hover:text-black transition-colors underline cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 text-brand" />
              <span>Back</span>
            </button>
            <h1 className="text-xl sm:text-2xl font-bold text-ink-hi">Secondary ID</h1>
          </div>

          <Card padding="md" className="border-border shadow-card mb-6">
            {/* Document Context Header */}
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-bold text-ink-hi">Medicare card</h2>
              <span className="text-[13px] font-semibold text-ink-mid">
                Step {subPage + 1} of 4
              </span>
            </div>

            {/* Sub-progress bar */}
            <div className="flex gap-1.5 mb-7">
              {[0, 1, 2, 3].map((stepIdx) => (
                <div
                  key={stepIdx}
                  className={`h-1.5 flex-1 rounded-full transition-colors ${
                    stepIdx <= subPage
                      ? 'bg-brand'
                      : 'bg-slate-200'
                  }`}
                />
              ))}
            </div>

            {/* Subpage 0: Medicare details */}
            {subPage === 0 && (
              <div className="space-y-6">
                <h3 className="text-[13px] font-semibold text-ink-mid">
                  Medicare details
                </h3>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[14px] font-semibold text-ink-hi">
                    Medicare card number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={medicareNumber}
                    maxLength={10}
                    placeholder="10 digit card number"
                    onChange={(e) => setMedicareNumber(e.target.value)}
                    className="h-12 px-4 bg-white border border-border rounded-md text-base text-ink-hi font-mono focus:border-ink-hi focus:ring-2 focus:ring-slate-200 outline-none"
                  />
                </div>

                <div className="space-y-5">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[14px] font-semibold text-ink-hi">
                      Individual Reference Number (IRN) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={irn}
                      maxLength={1}
                      placeholder="1"
                      onChange={(e) => setIrn(e.target.value)}
                      className="h-12 px-4 bg-white border border-border rounded-md text-base text-ink-hi font-mono focus:border-ink-hi focus:ring-2 focus:ring-slate-200 outline-none"
                    />
                  </div>

                  {/* Card Colour */}
                  <div className="relative flex flex-col gap-1.5">
                    <label className="text-[14px] font-semibold text-ink-hi">
                      Card colour <span className="text-red-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setCardColorOpen(!cardColorOpen)}
                      className="h-12 px-4 bg-white border border-border rounded-md text-base text-ink-hi flex items-center justify-between text-left focus:border-ink-hi focus:ring-2 focus:ring-slate-200 outline-none"
                    >
                      <span>{cardColor}</span>
                      <ChevronDown className="w-4 h-4 text-ink-lo" />
                    </button>

                    {cardColorOpen && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-border rounded-md shadow-lg z-30 py-1">
                        {cardColors.map((color) => (
                          <button
                            key={color}
                            type="button"
                            onClick={() => {
                              setCardColor(color);
                              setCardColorOpen(false);
                            }}
                            className={`w-full px-4 py-2.5 text-left text-sm hover:bg-slate-50 hover:text-ink-hi ${
                              cardColor === color ? 'font-bold text-brand bg-brand/5' : 'text-ink-hi'
                            }`}
                          >
                            {color}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[14px] font-semibold text-ink-hi">
                    Card expiry date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={cardExpiry}
                    placeholder="MM/YYYY"
                    onChange={(e) => setCardExpiry(e.target.value)}
                    className="h-12 px-4 bg-white border border-border rounded-md text-base text-ink-hi font-mono focus:border-ink-hi focus:ring-2 focus:ring-slate-200 outline-none"
                  />
                </div>
              </div>
            )}

            {/* Subpage 1: Personal Details */}
            {subPage === 1 && (
              <div className="space-y-6">
                <h3 className="text-[13px] font-semibold text-ink-mid">
                  Personal details
                </h3>

                <div className="space-y-5">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[14px] font-semibold text-ink-hi">
                      First name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={firstName}
                      placeholder="First name"
                      onChange={(e) => setFirstName(e.target.value)}
                      className="h-12 px-4 bg-white border border-border rounded-md text-base text-ink-hi focus:border-ink-hi focus:ring-2 focus:ring-slate-200 outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[14px] font-semibold text-ink-hi">
                      Middle initial
                    </label>
                    <input
                      type="text"
                      value={middleInitial}
                      maxLength={1}
                      placeholder="e.g. J"
                      onChange={(e) => setMiddleInitial(e.target.value)}
                      className="h-12 px-4 bg-white border border-border rounded-md text-base text-ink-hi uppercase focus:border-ink-hi focus:ring-2 focus:ring-slate-200 outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-5">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[14px] font-semibold text-ink-hi">
                      Last name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={lastName}
                      placeholder="Last name"
                      onChange={(e) => setLastName(e.target.value)}
                      className="h-12 px-4 bg-white border border-border rounded-md text-base text-ink-hi focus:border-ink-hi focus:ring-2 focus:ring-slate-200 outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[14px] font-semibold text-ink-hi">
                      Date of birth <span className="text-red-500">*</span>
                    </label>
                    <div className="relative flex items-center">
                      <input
                        type="text"
                        value={dob}
                        placeholder="DD/MM/YYYY"
                        onChange={(e) => setDob(e.target.value)}
                        className="h-12 w-full px-4 pr-12 bg-white border border-border rounded-md text-base text-ink-hi font-mono focus:border-ink-hi focus:ring-2 focus:ring-slate-200 outline-none"
                      />
                      <Calendar className="w-5 h-5 text-ink-lo absolute right-4 pointer-events-none" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Subpage 2: Address */}
            {subPage === 2 && (
              <div className="space-y-6">
                <h3 className="text-[13px] font-semibold text-ink-mid">
                  Address details
                </h3>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[14px] font-semibold text-ink-hi">
                    Search address
                  </label>
                  <div className="relative flex items-center">
                    <Search className="w-5 h-5 text-ink-lo absolute left-4 pointer-events-none" />
                    <input
                      type="text"
                      value={addressSearch}
                      placeholder="Start typing address..."
                      onChange={(e) => setAddressSearch(e.target.value)}
                      className="h-12 w-full pl-12 pr-4 bg-white border border-border rounded-md text-base text-ink-hi focus:border-ink-hi focus:ring-2 focus:ring-slate-200 outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-5">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[14px] font-semibold text-ink-hi">
                      Street number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={streetNumber}
                      onChange={(e) => setStreetNumber(e.target.value)}
                      className="h-12 px-4 bg-white border border-border rounded-md text-base text-ink-hi font-mono focus:border-ink-hi focus:ring-2 focus:ring-slate-200 outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[14px] font-semibold text-ink-hi">
                      Street name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={streetName}
                      onChange={(e) => setStreetName(e.target.value)}
                      className="h-12 px-4 bg-white border border-border rounded-md text-base text-ink-hi focus:border-ink-hi focus:ring-2 focus:ring-slate-200 outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-5">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[14px] font-semibold text-ink-hi">
                      Suburb <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={suburb}
                      onChange={(e) => setSuburb(e.target.value)}
                      className="h-12 px-4 bg-white border border-border rounded-md text-base text-ink-hi focus:border-ink-hi focus:ring-2 focus:ring-slate-200 outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[14px] font-semibold text-ink-hi">
                      State <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={addrState}
                      onChange={(e) => setAddrState(e.target.value)}
                      className="h-12 px-4 bg-white border border-border rounded-md text-base text-ink-hi font-mono focus:border-ink-hi focus:ring-2 focus:ring-slate-200 outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[14px] font-semibold text-ink-hi">
                      Postcode <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={postcode}
                      onChange={(e) => setPostcode(e.target.value)}
                      className="h-12 px-4 bg-white border border-border rounded-md text-base text-ink-hi font-mono focus:border-ink-hi focus:ring-2 focus:ring-slate-200 outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Subpage 3: Review & Consent */}
            {subPage === 3 && (
              <div className="space-y-6">
                <h3 className="text-[13px] font-semibold text-ink-mid">
                  Review Medicare card details
                </h3>

                {/* Summary Block 1: Medicare Card Details */}
                <div className="space-y-1.5">
                  <h4 className="text-[16px] font-bold text-ink-hi mb-1">Medicare card details</h4>
                  <div className="flex flex-col">
                    <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3 py-1.5 text-[15px]">
                      <span className="text-ink-mid font-medium">Card number</span>
                      <span className="font-bold text-ink-hi text-right font-mono">{medicareNumber}</span>
                      <button
                        type="button"
                        onClick={() => setSubPage(0)}
                        className="text-ink-mid hover:text-ink-hi underline font-semibold text-[13px] inline-flex items-center gap-1 cursor-pointer justify-self-end"
                      >
                        <Edit2 className="w-3.5 h-3.5 text-ink-mid" />
                        <span>Edit</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3 py-1.5 text-[15px]">
                      <span className="text-ink-mid font-medium">IRN</span>
                      <span className="font-bold text-ink-hi text-right font-mono">{irn}</span>
                      <button
                        type="button"
                        onClick={() => setSubPage(0)}
                        className="text-ink-mid hover:text-ink-hi underline font-semibold text-[13px] inline-flex items-center gap-1 cursor-pointer justify-self-end"
                      >
                        <Edit2 className="w-3.5 h-3.5 text-ink-mid" />
                        <span>Edit</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3 py-1.5 text-[15px]">
                      <span className="text-ink-mid font-medium">Card colour</span>
                      <span className="font-bold text-ink-hi text-right">{cardColor}</span>
                      <button
                        type="button"
                        onClick={() => setSubPage(0)}
                        className="text-ink-mid hover:text-ink-hi underline font-semibold text-[13px] inline-flex items-center gap-1 cursor-pointer justify-self-end"
                      >
                        <Edit2 className="w-3.5 h-3.5 text-ink-mid" />
                        <span>Edit</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3 py-1.5 text-[15px]">
                      <span className="text-ink-mid font-medium">Expiry date</span>
                      <span className="font-bold text-ink-hi text-right font-mono">{cardExpiry}</span>
                      <button
                        type="button"
                        onClick={() => setSubPage(0)}
                        className="text-ink-mid hover:text-ink-hi underline font-semibold text-[13px] inline-flex items-center gap-1 cursor-pointer justify-self-end"
                      >
                        <Edit2 className="w-3.5 h-3.5 text-ink-mid" />
                        <span>Edit</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Summary Block 2: Your Details */}
                <div className="space-y-1.5">
                  <h4 className="text-[16px] font-bold text-ink-hi mb-1">Your details</h4>
                  <div className="flex flex-col">
                    <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3 py-1.5 text-[15px]">
                      <span className="text-ink-mid font-medium">Full name</span>
                      <span className="font-bold text-ink-hi text-right">
                        {firstName} {middleInitial} {lastName}
                      </span>
                      <button
                        type="button"
                        onClick={() => setSubPage(1)}
                        className="text-ink-mid hover:text-ink-hi underline font-semibold text-[13px] inline-flex items-center gap-1 cursor-pointer justify-self-end"
                      >
                        <Edit2 className="w-3.5 h-3.5 text-ink-mid" />
                        <span>Edit</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3 py-1.5 text-[15px]">
                      <span className="text-ink-mid font-medium">Date of birth</span>
                      <span className="font-bold text-ink-hi text-right font-mono">{dob}</span>
                      <button
                        type="button"
                        onClick={() => setSubPage(1)}
                        className="text-ink-mid hover:text-ink-hi underline font-semibold text-[13px] inline-flex items-center gap-1 cursor-pointer justify-self-end"
                      >
                        <Edit2 className="w-3.5 h-3.5 text-ink-mid" />
                        <span>Edit</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3 py-1.5 text-[15px]">
                      <span className="text-ink-mid font-medium">Address</span>
                      <span className="font-bold text-ink-hi text-right">
                        {unitNumber ? `${unitNumber}/` : ''}{streetNumber} {streetName}, {suburb} {addrState} {postcode}
                      </span>
                      <button
                        type="button"
                        onClick={() => setSubPage(2)}
                        className="text-ink-mid hover:text-ink-hi underline font-semibold text-[13px] inline-flex items-center gap-1 cursor-pointer justify-self-end flex-shrink-0"
                      >
                        <Edit2 className="w-3.5 h-3.5 text-ink-mid" />
                        <span>Edit</span>
                      </button>
                    </div>
                  </div>
                </div>
                {/* Customer Consent */}
                <div className="space-y-3">
                  <h4 className="text-[16px] font-bold text-ink-hi">Customer consent</h4>
                  <div className="py-1 text-xs sm:text-sm text-ink-mid leading-relaxed max-h-48 overflow-y-auto">
                    You have obtained consent from your customer to the collection, use and disclosure of their personal information in accordance with your privacy policy, and for the purposes of verifying their identity, they consent to: (a) the verification of their personal information with a credit bureau header files (for verification only); (b) against records held by official document issuers or official record holders via third party systems; and c) your verification agent(s) acting as a nominated intermediary in accordance with Australian Privacy Principles. They consent to the use by third parties of the results of any verification checks on their identity for the purposes of monitoring and improving the verification services.
                  </div>
                  <Checkbox
                    checked={consentConfirmed}
                    onChange={(e) => setConsentConfirmed(e.target.checked)}
                    label="The customer confirms their consent to proceed."
                  />
                </div>

                {/* Verification result states */}
                {verificationStatus === 'running' && (
                  <div className="p-3.5 rounded-lg bg-teal-50 border border-teal-200 flex items-center gap-3">
                    <div className="w-4 h-4 border-2 border-slate-300 border-t-brand rounded-full animate-spin flex-shrink-0" />
                    <span className="text-[14px] font-semibold text-ink-hi">
                      Verifying identity...
                    </span>
                  </div>
                )}

                {verificationStatus === 'pass' && (
                  <div className="p-3.5 rounded-lg bg-teal-50 border border-teal-200 text-left">
                    <div className="text-[15px] font-bold text-ink-hi flex items-center gap-2">
                      <Check className="w-4 h-4 text-teal-600 stroke-[3]" />
                      Medicare card verified
                    </div>
                  </div>
                )}

                {verificationStatus === 'fail' && (
                  <div className="p-3.5 sm:p-4 rounded-lg bg-red-50 border border-red-200 text-left space-y-3">
                    <p className="text-[16px] font-bold text-[#991b1b] m-0 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-[#991b1b] flex-shrink-0" />
                      Validation failed
                    </p>
                    <div className="space-y-2 text-sm">
                      <button
                        type="button"
                        onClick={() => {
                          setVerificationStatus('idle');
                          setSubPage(0);
                        }}
                        className="block font-bold text-ink-hi underline hover:text-black cursor-pointer text-left"
                      >
                        Edit details and re-run
                      </button>
                      <button
                        type="button"
                        onClick={() => router.push(fromSummary ? '/collector/summary' : '/collector/bank-account')}
                        className="block font-bold text-ink-hi hover:text-black underline text-left"
                      >
                        Skip secondary ID and continue
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </Card>

          {/* Actions */}
          {subPage === 0 && (
            <div className="mt-6">
              <Button
                size="lg"
                disabled={!isPage0Valid}
                onClick={handleSubNext}
                className="w-full h-12 text-[16px] font-semibold"
              >
                Next
              </Button>
            </div>
          )}
          {subPage === 1 && (
            <div className="mt-6">
              <Button
                size="lg"
                disabled={!isPage1Valid}
                onClick={handleSubNext}
                className="w-full h-12 text-[16px] font-semibold"
              >
                Next
              </Button>
            </div>
          )}
          {subPage === 2 && (
            <div className="mt-6">
              <Button
                size="lg"
                disabled={!isPage2Valid}
                onClick={handleSubNext}
                className="w-full h-12 text-[16px] font-semibold"
              >
                Next
              </Button>
            </div>
          )}
          {subPage === 3 && verificationStatus === 'pass' && (
            <div className="mt-6">
              <Button
                size="lg"
                onClick={() => {
                  persist({
                    idvStatus: 'pass',
                    secondaryDocType: 'medicare',
                    medicareNumber,
                    irn,
                    cardColor,
                    cardExpiry,
                  });
                  router.push(fromSummary ? '/collector/summary' : '/collector/bank-account');
                }}
                className="w-full h-12 text-[16px] font-semibold"
              >
                Next
              </Button>
            </div>
          )}
          {subPage === 3 && verificationStatus === 'idle' && (
            <div className="mt-6">
              <Button
                size="lg"
                disabled={!consentConfirmed || isVerifying}
                onClick={handleRunVerification}
                className="w-full h-12 text-[16px] font-semibold"
              >
                Run verification
              </Button>
            </div>
          )}

          {/* Prototype simulation */}
          <div className="mt-8 flex items-center gap-3 p-3 rounded-lg border border-dashed border-border bg-surface-card flex-wrap text-xs">
            <span className="font-semibold text-ink-mid flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-brand" />
              Simulate Medicare IDV:
            </span>
            <button
              type="button"
              onClick={() => {
                setSimulatedResult('pass');
                setVerificationStatus('idle');
              }}
              className={`px-3 py-1.5 rounded-md font-semibold transition-colors ${
                simulatedResult === 'pass'
                  ? 'bg-slate-800 text-white'
                  : 'bg-white border border-border text-ink-mid hover:bg-slate-50'
              }`}
            >
              Simulate pass
            </button>
            <button
              type="button"
              onClick={() => {
                setSimulatedResult('fail');
                setVerificationStatus('idle');
              }}
              className={`px-3 py-1.5 rounded-md font-semibold transition-colors ${
                simulatedResult === 'fail'
                  ? 'bg-slate-800 text-white'
                  : 'bg-white border border-border text-ink-mid hover:bg-slate-50'
              }`}
            >
              Simulate fail
            </button>
          </div>
    </div>
  );
}

export default function MedicareDetailPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-ink-mid">Loading Medicare form...</div>}>
      <MedicareDetailContent />
    </Suspense>
  );
}
