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
  History,
  X,
  ChevronRight,
} from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Checkbox from '@/components/ui/Checkbox';
import { isOccupationCaptureEnabled } from '@/lib/venueCompliance';

function LicenceDetailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fromSummary = searchParams.get('from') === 'summary';

  // Subpage step: 0: Licence, 1: Personal, 2: Address, 3: Review & Consent
  const [subPage, setSubPage] = useState(0);

  // Subpage 0: Licence details
  const [state, setState] = useState('NSW');
  const [stateOpen, setStateOpen] = useState(false);
  const [licNumber, setLicNumber] = useState('20984124');
  const [cardNumber, setCardNumber] = useState('981245781');

  // Subpage 1: Personal details
  const [firstName, setFirstName] = useState('Sarah');
  const [middleName, setMiddleName] = useState('Jane');
  const [lastName, setLastName] = useState('Jenkins');
  const [dob, setDob] = useState('14/08/1988');
  const [occupation, setOccupation] = useState('');
  // Venue-level setting, so the field only appears for venues that have adopted
  // the initial CDD rules. Read after mount because it lives in localStorage.
  const [occupationEnabled, setOccupationEnabled] = useState(false);

  // Subpage 2: Address
  const [addressSearch, setAddressSearch] = useState('');
  const [unitNumber, setUnitNumber] = useState('');
  const [streetNumber, setStreetNumber] = useState('');
  const [streetName, setStreetName] = useState('');
  const [suburb, setSuburb] = useState('');
  const [addrState, setAddrState] = useState('');
  const [postcode, setPostcode] = useState('');
  const [showAddressFields, setShowAddressFields] = useState(false);
  const [addressListOpen, setAddressListOpen] = useState(false);

  // Subpage 3: Consent & Verification
  const [consentConfirmed, setConsentConfirmed] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState('idle'); // 'idle' | 'running' | 'pass' | 'fail'
  const [simulatedResult, setSimulatedResult] = useState('pass'); // 'pass' | 'fail'

  // Fail bypass states
  const [bypassValidation, setBypassValidation] = useState(false);
  const [manualVerified, setManualVerified] = useState(false);

  // History modal
  const [historyOpen, setHistoryOpen] = useState(false);

  const states = ['NSW', 'VIC', 'QLD', 'WA', 'SA', 'TAS', 'ACT', 'NT'];

  const sampleAddresses = [
    { display: '4/12 Riverside Avenue, Parramatta NSW 2150', unit: '4', streetNum: '12', street: 'Riverside Avenue', suburb: 'Parramatta', state: 'NSW', postcode: '2150' },
    { display: '88 George Street, Sydney NSW 2000', unit: '', streetNum: '88', street: 'George Street', suburb: 'Sydney', state: 'NSW', postcode: '2000' },
    { display: '15 Beach Road, Bondi NSW 2026', unit: '', streetNum: '15', street: 'Beach Road', suburb: 'Bondi', state: 'NSW', postcode: '2026' },
    { display: '2/40 Church Street, Richmond VIC 3121', unit: '2', streetNum: '40', street: 'Church Street', suburb: 'Richmond', state: 'VIC', postcode: '3121' },
    { display: '101 Elizabeth Street, Melbourne VIC 3000', unit: '', streetNum: '101', street: 'Elizabeth Street', suburb: 'Melbourne', state: 'VIC', postcode: '3000' },
    { display: '12/250 Wentworth Avenue East, Kingsford NSW 2032', unit: '12', streetNum: '250', street: 'Wentworth Avenue East', suburb: 'Kingsford', state: 'NSW', postcode: '2032' },
  ];

  useEffect(() => {
    try {
      const saved = JSON.parse(sessionStorage.getItem('payoutFormData') || '{}');
      if (saved.state) setState(saved.state);
      if (saved.licNumber) setLicNumber(saved.licNumber);
      if (saved.cardNumber) setCardNumber(saved.cardNumber);
      if (saved.firstName) setFirstName(saved.firstName);
      if (saved.middleName) setMiddleName(saved.middleName);
      if (saved.lastName) setLastName(saved.lastName);
      if (saved.dob) setDob(saved.dob);
      if (saved.occupation) setOccupation(saved.occupation);
      setOccupationEnabled(isOccupationCaptureEnabled(saved.venueId));
      if (saved.addressSearch && saved.addressSearch.trim()) {
        setAddressSearch(saved.addressSearch);
        if (saved.unitNumber !== undefined) setUnitNumber(saved.unitNumber);
        if (saved.streetNumber) setStreetNumber(saved.streetNumber);
        if (saved.streetName) setStreetName(saved.streetName);
        if (saved.suburb) setSuburb(saved.suburb);
        if (saved.addrState) setAddrState(saved.addrState);
        if (saved.postcode) setPostcode(saved.postcode);
        setShowAddressFields(true);
      } else {
        setShowAddressFields(false);
      }
    } catch (e) {}
  }, []);

  const persist = (patch) => {
    try {
      const current = JSON.parse(sessionStorage.getItem('payoutFormData') || '{}');
      sessionStorage.setItem('payoutFormData', JSON.stringify({ ...current, ...patch }));
    } catch (e) {}
  };

  const handleSelectAddress = (a) => {
    setAddressSearch(a.display);
    setUnitNumber(a.unit);
    setStreetNumber(a.streetNum);
    setStreetName(a.street);
    setSuburb(a.suburb);
    setAddrState(a.state);
    setPostcode(a.postcode);
    setShowAddressFields(true);
    setAddressListOpen(false);
    persist({
      addressSearch: a.display,
      unitNumber: a.unit,
      streetNumber: a.streetNum,
      streetName: a.street,
      suburb: a.suburb,
      addrState: a.state,
      postcode: a.postcode,
    });
  };

  // Subpage validation
  const isPage0Valid = state && licNumber.trim() !== '' && cardNumber.trim() !== '';
  const isPage1Valid = firstName.trim() !== '' && lastName.trim() !== '' && dob.trim() !== '';
  const isPage2Valid = showAddressFields && streetNumber.trim() !== '' && streetName.trim() !== '' && suburb.trim() !== '' && postcode.trim() !== '';

  const handleSubNext = () => {
    if (subPage === 0 && isPage0Valid) {
      persist({ state, licNumber, cardNumber });
      setSubPage(1);
    } else if (subPage === 1 && isPage1Valid) {
      persist({ firstName, middleName, lastName, dob, occupation: occupation.trim() });
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
          idvStatus: 'pass',
          docType: 'licence',
          state,
          licNumber,
          cardNumber,
          firstName,
          lastName,
          dob,
        });
      } else {
        setVerificationStatus('fail');
        persist({ idvStatus: 'fail', docType: 'licence' });
      }
    }, 1200);
  };

  const handleBypassContinue = () => {
    if (!bypassValidation || !manualVerified) return;
    persist({
      idvStatus: 'manual_bypass',
      manualVerified: true,
      bypassValidation: true,
    });
    if (fromSummary) {
      router.push('/collector/summary');
    } else {
      router.push('/collector/secondary-id');
    }
  };

  return (
    <>
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

          <div className="flex items-end justify-between gap-4 mb-4">
            <div className="flex items-end gap-6">
              <button
                type="button"
                onClick={() => {
                  if (subPage > 0) setSubPage(subPage - 1);
                  else router.push('/collector/primary-id');
                }}
                className="inline-flex items-center gap-1.5 text-[15px] font-semibold text-ink-hi hover:text-black transition-colors underline cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4 text-brand" />
                <span>Back</span>
              </button>
              <h1 className="text-xl sm:text-2xl font-bold text-ink-hi">Primary ID</h1>
            </div>

            <button
              type="button"
              onClick={() => setHistoryOpen(true)}
              className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-ink-mid hover:text-ink-hi underline transition-colors cursor-pointer"
            >
              <History className="w-3.5 h-3.5" />
              <span>View history</span>
            </button>
          </div>

          <Card padding="md" className="border-border shadow-card mb-6">
            {/* Document Context Header */}
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-bold text-ink-hi">Driver licence</h2>
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

            {/* Subpage 0: Licence details */}
            {subPage === 0 && (
              <div className="space-y-6">
                <h3 className="text-[13px] font-semibold text-ink-mid">
                  Licence details
                </h3>

                <div className="space-y-5">
                  {/* State */}
                  <div className="relative flex flex-col gap-1.5">
                    <label className="text-[14px] font-semibold text-ink-hi flex items-center gap-1">
                      State / Territory <span className="text-red-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setStateOpen(!stateOpen)}
                      className="h-12 px-4 bg-white border border-border rounded-md text-base text-ink-hi flex items-center justify-between text-left focus:border-ink-hi focus:ring-2 focus:ring-slate-200 outline-none font-mono"
                    >
                      <span>{state}</span>
                      <ChevronDown className="w-4 h-4 text-ink-lo" />
                    </button>

                    {stateOpen && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-border rounded-md shadow-lg z-30 max-h-48 overflow-y-auto py-1">
                        {states.map((st) => (
                          <button
                            key={st}
                            type="button"
                            onClick={() => {
                              setState(st);
                              setStateOpen(false);
                            }}
                            className={`w-full px-4 py-2 text-left text-sm font-mono hover:bg-slate-50 hover:text-ink-hi ${
                              state === st ? 'font-bold text-brand bg-brand/5' : 'text-ink-hi'
                            }`}
                          >
                            {st}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Licence Number */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[14px] font-semibold text-ink-hi flex items-center gap-1">
                      Licence number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={licNumber}
                      placeholder="e.g. 20984124"
                      onChange={(e) => setLicNumber(e.target.value)}
                      className="h-12 px-4 bg-white border border-border rounded-md text-base text-ink-hi font-mono focus:border-ink-hi focus:ring-2 focus:ring-slate-200 outline-none"
                    />
                  </div>
                </div>

                {/* Card Number */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[14px] font-semibold text-ink-hi flex items-center gap-1">
                    Card number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={cardNumber}
                    placeholder="e.g. 981245781"
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="h-12 px-4 bg-white border border-border rounded-md text-base text-ink-hi font-mono focus:border-ink-hi focus:ring-2 focus:ring-slate-200 outline-none"
                  />
                </div>
              </div>
            )}

            {/* Subpage 1: Personal details */}
            {subPage === 1 && (
              <div className="space-y-6">
                <h3 className="text-[13px] font-semibold text-ink-mid">
                  Personal details
                </h3>

                <div className="space-y-5">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[14px] font-semibold text-ink-hi flex items-center gap-1">
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
                      Middle name
                    </label>
                    <input
                      type="text"
                      value={middleName}
                      placeholder="Middle name"
                      onChange={(e) => setMiddleName(e.target.value)}
                      className="h-12 px-4 bg-white border border-border rounded-md text-base text-ink-hi focus:border-ink-hi focus:ring-2 focus:ring-slate-200 outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-5">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[14px] font-semibold text-ink-hi flex items-center gap-1">
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
                    <label className="text-[14px] font-semibold text-ink-hi flex items-center gap-1">
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

                  {occupationEnabled && (
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[14px] font-semibold text-ink-hi flex items-center gap-1">
                        Occupation <span className="text-[13px] font-normal text-ink-lo">(optional)</span>
                      </label>
                      <input
                        type="text"
                        value={occupation}
                        placeholder="What does the patron do for work?"
                        onChange={(e) => setOccupation(e.target.value)}
                        className="h-12 px-4 bg-white border border-border rounded-md text-base text-ink-hi focus:border-ink-hi focus:ring-2 focus:ring-slate-200 outline-none"
                      />
                      <p className="text-[13px] text-ink-mid m-0">
                        Self-reported. Kept on file in case enhanced due diligence is needed later.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Subpage 2: Address */}
            {subPage === 2 && (
              <div className="space-y-6">
                <h3 className="text-[13px] font-semibold text-ink-mid">
                  Address details
                </h3>

                {/* Search Address Combobox */}
                <div className="relative flex flex-col gap-1.5">
                  <label className="text-[14px] font-semibold text-ink-hi flex items-center gap-1">
                    Search address <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Search className="w-5 h-5 text-ink-lo absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      value={addressSearch}
                      placeholder="Start typing an address..."
                      onChange={(e) => {
                        const val = e.target.value;
                        setAddressSearch(val);
                        setAddressListOpen(val.trim().length > 0);
                        if (val.trim() === '') {
                          setShowAddressFields(false);
                        }
                      }}
                      onFocus={() => {
                        if (addressSearch.trim().length > 0) setAddressListOpen(true);
                      }}
                      className="h-12 w-full pl-12 pr-4 bg-white border border-border rounded-md text-base text-ink-hi focus:border-ink-hi focus:ring-2 focus:ring-slate-200 outline-none"
                    />

                    {/* Dropdown panel */}
                    {addressListOpen && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-border rounded-md shadow-lg z-30 max-h-56 overflow-y-auto py-1">
                        {sampleAddresses.filter((a) =>
                          a.display.toLowerCase().includes(addressSearch.toLowerCase())
                        ).length > 0 ? (
                          sampleAddresses
                            .filter((a) =>
                              a.display.toLowerCase().includes(addressSearch.toLowerCase())
                            )
                            .map((a, idx) => (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => handleSelectAddress(a)}
                                className="w-full px-4 py-3 text-left text-sm text-ink-hi hover:bg-slate-50 hover:text-ink-hi transition-colors border-b border-border/50 last:border-0"
                              >
                                {a.display}
                              </button>
                            ))
                        ) : (
                          <div className="px-4 py-3 text-sm text-ink-mid">
                            No matching addresses
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Progressive Detailed Address Fields */}
                {showAddressFields && (
                  <div className="space-y-5 pt-2">
                    <div className="space-y-5">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[14px] font-semibold text-ink-hi">
                          Unit number
                        </label>
                        <input
                          type="text"
                          value={unitNumber}
                          placeholder="Unit number"
                          onChange={(e) => {
                            setUnitNumber(e.target.value);
                            persist({ unitNumber: e.target.value });
                          }}
                          className="h-12 px-4 bg-white border border-border rounded-md text-base text-ink-hi focus:border-ink-hi focus:ring-2 focus:ring-slate-200 outline-none"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[14px] font-semibold text-ink-hi flex items-center gap-1">
                          Street number <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={streetNumber}
                          placeholder="Street number"
                          onChange={(e) => {
                            setStreetNumber(e.target.value);
                            persist({ streetNumber: e.target.value });
                          }}
                          className="h-12 px-4 bg-white border border-border rounded-md text-base text-ink-hi font-mono focus:border-ink-hi focus:ring-2 focus:ring-slate-200 outline-none"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[14px] font-semibold text-ink-hi flex items-center gap-1">
                        Street name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={streetName}
                        placeholder="Street name"
                        onChange={(e) => {
                          setStreetName(e.target.value);
                          persist({ streetName: e.target.value });
                        }}
                        className="h-12 px-4 bg-white border border-border rounded-md text-base text-ink-hi focus:border-ink-hi focus:ring-2 focus:ring-slate-200 outline-none"
                      />
                    </div>

                    <div className="space-y-5">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[14px] font-semibold text-ink-hi flex items-center gap-1">
                          Suburb <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={suburb}
                          placeholder="Suburb"
                          onChange={(e) => {
                            setSuburb(e.target.value);
                            persist({ suburb: e.target.value });
                          }}
                          className="h-12 px-4 bg-white border border-border rounded-md text-base text-ink-hi focus:border-ink-hi focus:ring-2 focus:ring-slate-200 outline-none"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[14px] font-semibold text-ink-hi flex items-center gap-1">
                          State <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={addrState}
                          placeholder="State"
                          onChange={(e) => {
                            setAddrState(e.target.value);
                            persist({ addrState: e.target.value });
                          }}
                          className="h-12 px-4 bg-white border border-border rounded-md text-base text-ink-hi font-mono focus:border-ink-hi focus:ring-2 focus:ring-slate-200 outline-none"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[14px] font-semibold text-ink-hi flex items-center gap-1">
                          Postcode <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={postcode}
                          placeholder="Postcode"
                          onChange={(e) => {
                            setPostcode(e.target.value);
                            persist({ postcode: e.target.value });
                          }}
                          className="h-12 px-4 bg-white border border-border rounded-md text-base text-ink-hi font-mono focus:border-ink-hi focus:ring-2 focus:ring-slate-200 outline-none"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Subpage 3: Review & Consent */}
            {subPage === 3 && (
              <div className="space-y-6">
                <h3 className="text-[13px] font-semibold text-ink-mid">
                  Review and consent
                </h3>

                {/* Summary Block 1: Driver Licence Details */}
                <div className="space-y-1.5">
                  <h4 className="text-[16px] font-bold text-ink-hi mb-1">Driver licence details</h4>
                  <div className="flex flex-col">
                    <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3 py-1.5 text-[15px]">
                      <span className="text-ink-mid font-medium">Licence number</span>
                      <span className="font-bold text-ink-hi text-right font-mono">{licNumber}</span>
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
                      <span className="text-ink-mid font-medium">Card number</span>
                      <span className="font-bold text-ink-hi text-right font-mono">{cardNumber}</span>
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
                      <span className="text-ink-mid font-medium">State of issue</span>
                      <span className="font-bold text-ink-hi text-right">{state}</span>
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
                        {firstName} {middleName} {lastName}
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
                    <span className="text-[14px] font-semibold text-ink-hi">Verifying identity...</span>
                  </div>
                )}

                {verificationStatus === 'pass' && (
                  <div className="p-3.5 rounded-lg bg-teal-50 border border-teal-200 text-left">
                    <div className="text-[15px] font-bold text-ink-hi flex items-center gap-2">
                      <Check className="w-4 h-4 text-teal-600 stroke-[3]" />
                      Driver licence verified
                    </div>
                  </div>
                )}

                {verificationStatus === 'fail' && (
                  <div className="space-y-4">
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
                        <Link
                          href={`/collector/primary-id${fromSummary ? '?from=summary' : ''}`}
                          className="block font-bold text-ink-hi hover:text-black underline text-left"
                        >
                          Try a different primary ID document
                        </Link>
                      </div>
                    </div>

                    {/* Bypass option */}
                    <div className="space-y-3">
                      <Checkbox
                        checked={bypassValidation}
                        onChange={(e) => {
                          setBypassValidation(e.target.checked);
                          if (!e.target.checked) setManualVerified(false);
                        }}
                        label="I want to bypass identity validation"
                      />

                      <div className={`transition-opacity ${bypassValidation ? 'opacity-100' : 'opacity-45 pointer-events-none'}`}>
                        <Checkbox
                          checked={manualVerified}
                          disabled={!bypassValidation}
                          onChange={(e) => setManualVerified(e.target.checked)}
                          label="I have manually verified the customer's identity document and confirm it is valid"
                        />
                      </div>
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
                    docType: 'licence',
                    state,
                    licNumber,
                    cardNumber,
                    firstName,
                    middleName,
                    lastName,
                    dob,
                    unitNumber,
                    streetNumber,
                    streetName,
                    suburb,
                    addrState,
                    postcode,
                  });
                  if (fromSummary) {
                    router.push('/collector/summary');
                  } else {
                    router.push('/collector/secondary-id');
                  }
                }}
                className="w-full h-12 text-[16px] font-semibold"
              >
                Next
              </Button>
            </div>
          )}
          {subPage === 3 && verificationStatus === 'fail' && (
            <div className="mt-6">
              <Button
                size="lg"
                disabled={!bypassValidation || !manualVerified}
                onClick={handleBypassContinue}
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

          {/* Prototype Simulation Toggle */}
          <div className="mt-8 flex items-center gap-3 p-3 rounded-lg border border-dashed border-border bg-surface-card flex-wrap text-xs">
            <span className="font-semibold text-ink-mid flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-brand" />
              Simulate IDV result:
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
            >Simulate pass</button>
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
            >Simulate fail (bypass flow)</button>
          </div>
      </div>

      {/* History modal */}
      {historyOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6">
          <div className="bg-surface-card border border-border rounded-xl shadow-modal max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-base font-bold text-ink-hi">Verification run history</h3>
              <button
                type="button"
                onClick={() => setHistoryOpen(false)}
                className="p-1 text-ink-mid hover:text-ink-hi"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-ink-mid">
              Previous IDV attempts for this session.
            </p>
            <div className="space-y-2">
              <div className="p-3 rounded border border-border flex items-center justify-between text-xs">
                <span className="font-mono">24/07/2026 09:50 am</span>
                <Badge variant="pass" size="sm">Pass</Badge>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function LicenceDetailPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-ink-mid">Loading licence details...</div>}>
      <LicenceDetailContent />
    </Suspense>
  );
}
