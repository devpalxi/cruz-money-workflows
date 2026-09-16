'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  UploadCloud,
  Check,
  ChevronDown,
  AlertCircle,
  Sparkles,
  RefreshCw,
  CreditCard,
  UserCheck,
} from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import MemberLookupPanel from '@/components/shared/MemberLookupPanel';
import { initialVenues } from '@/lib/mockData';
import { getEffectiveCashCap } from '@/lib/complianceGate';
import { getVenueIntegrationSettings, MOCK_CLUB_MEMBERS } from '@/lib/mockMembershipDatabase';

export default function PayoutDetailsPage() {
  const router = useRouter();
  const fileInputRef = useRef(null);

  // Form states
  const [dateTime] = useState('24/07/2026 09:49 am');
  const [docketFile, setDocketFile] = useState(null);
  const [docketThumb, setDocketThumb] = useState(null);
  const [docketStatus, setDocketStatus] = useState('Add docket photo');
  const [docketSub, setDocketSub] = useState('');
  const [isReadingOcr, setIsReadingOcr] = useState(false);

  const [payoutType, setPayoutType] = useState('EGM');
  const [payoutTypeOpen, setPayoutTypeOpen] = useState(false);

  const [venue, setVenue] = useState('Riverside RSL Club');
  const [venueOpen, setVenueOpen] = useState(false);

  const [disbursementMethods, setDisbursementMethods] = useState(['Cash', 'Bank transfer']);

  const [machine, setMachine] = useState('');
  const [machineOpen, setMachineOpen] = useState(false);

  const [winAmount, setWinAmount] = useState('');
  const [confirmAmount, setConfirmAmount] = useState('');
  const [amountError, setAmountError] = useState(false);

  const [txnId, setTxnId] = useState('');

  // Club Membership System Integration state
  const [showMemberLookup, setShowMemberLookup] = useState(false);
  const [prefilledMember, setPrefilledMember] = useState(null);
  const [presetMember, setPresetMember] = useState(null);
  const [integrationMode, setIntegrationMode] = useState('api');
  const [integrationConfig, setIntegrationConfig] = useState({
    system: 'Max Gaming',
    connectionStatus: 'Connected',
    writeBackEnabled: true,
  });

  // Prototype toggle options
  const [amountOption, setAmountOption] = useState('A'); // A: simple, B: preview
  const [docketOption, setDocketOption] = useState('A'); // A: manual, B: simulated

  const machines = [
    'EGM-001',
    'EGM-002',
    'EGM-003',
    'EGM-014',
    'EGM-021',
    'EGM-034',
    'EGM-045',
    'EGM-052',
  ];

  // Atomic disbursement methods - selectable in any combination. Adding a new
  // method here (e.g. a future 'Voucher') never requires enumerating every
  // possible combo string; the label is built from whatever is selected.
  const disbursementOptions = ['Cash', 'Bank transfer', 'Cheque'];

  const disbursementMethodLabel = disbursementOptions
    .filter((m) => disbursementMethods.includes(m))
    .join(' + ');

  const toggleDisbursementMethod = (method) => {
    setDisbursementMethods((prev) => {
      const next = prev.includes(method) ? prev.filter((m) => m !== method) : [...prev, method];
      const label = disbursementOptions.filter((m) => next.includes(m)).join(' + ');
      persist({ disbursementMethod: label, disbursementMethods: next });
      return next;
    });
  };

  // Helper: number sanitization & formatting
  const sanitizeDecimal = (val) => {
    let v = val.replace(/[^0-9.]/g, '');
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
    const num = parseFloat(val.replace(/,/g, ''));
    if (isNaN(num)) return val;
    return num.toLocaleString('en-AU', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const rawNum = (val) => parseFloat((val || '').replace(/,/g, '')) || 0;

  // Restore saved state from sessionStorage
  useEffect(() => {
    try {
      const saved = JSON.parse(sessionStorage.getItem('payoutFormData') || '{}');
      if (saved.payoutType) setPayoutType(saved.payoutType);
      if (saved.venue) setVenue(saved.venue);
      if (Array.isArray(saved.disbursementMethods)) {
        setDisbursementMethods(saved.disbursementMethods);
      } else if (saved.disbursementMethod) {
        // Legacy combo string (e.g. "Cash + Bank transfer") - split back into atomic methods.
        setDisbursementMethods(
          saved.disbursementMethod.split('+').map((m) => m.trim()).filter(Boolean)
        );
      }
      if (saved.machine) setMachine(saved.machine);
      if (saved.winAmount) setWinAmount(saved.winAmount);
      if (saved.confirmAmount) setConfirmAmount(saved.confirmAmount);
      if (saved.txnId) setTxnId(saved.txnId);
      if (saved.prefilledMember) setPrefilledMember(saved.prefilledMember);
      if (saved.docketThumb) {
        setDocketThumb(saved.docketThumb);
        setDocketStatus('Uploaded');
        setDocketSub(saved.docketName ? `${saved.docketName} - click to replace` : '');
      }
      const currentVenue = saved.venue || 'Riverside RSL Club';
      const matched = initialVenues.find((item) => item.name === currentVenue);
      const venueState = saved.venueState || matched?.state || 'NSW';
      const effectiveCashCap = saved.effectiveCashCap ?? getEffectiveCashCap({ venueState, noEFTLimit: 99999 });
      persist({ venue: currentVenue, venueState, effectiveCashCap });
    } catch (e) {}

    // Load venue integration settings from localStorage
    const cfg = getVenueIntegrationSettings('venue-riverside-rsl');
    if (cfg) {
      setIntegrationConfig(cfg);
      if (cfg.iframeEnabled) setIntegrationMode('iframe');
    }
  }, []);

  // Save changes to sessionStorage
  const persist = (patch) => {
    try {
      const current = JSON.parse(sessionStorage.getItem('payoutFormData') || '{}');
      sessionStorage.setItem('payoutFormData', JSON.stringify({ ...current, ...patch }));
    } catch (e) {}
  };

  const handleSelectMember = (member) => {
    setPrefilledMember(member);
    setShowMemberLookup(false);
    persist({
      prefilledMember: member,
      membership: member.memberNumber,
      memberNumber: member.memberNumber,
      fullName: member.fullName,
      firstName: member.firstName,
      middleName: member.middleName,
      lastName: member.lastName,
      dob: member.dob,
      email: member.email,
      phone: member.phone,
      membershipTier: member.membershipTier,
      prefillSource: member.system || integrationConfig.system || 'Max Gaming',
      unitNumber: member.address?.unitNumber || '',
      streetNumber: member.address?.streetNumber || '',
      streetName: member.address?.streetName || '',
      suburb: member.address?.suburb || '',
      addrState: member.address?.state || 'NSW',
      postcode: member.address?.postcode || '',
      addressSearch: member.address?.formatted || '',
      docType: member.idDocOnFile?.type || 'licence',
      licNumber: member.idDocOnFile?.number || '',
      accountName: member.bankDetailsOnFile?.accountName || member.fullName,
      bsb: member.bankDetailsOnFile?.bsb || '',
      accountNumber: member.bankDetailsOnFile?.accountNumber || '',
    });
  };

  const handleClearMember = () => {
    setPrefilledMember(null);
    setPresetMember(null);
    persist({
      prefilledMember: null,
      membership: '',
      memberNumber: '',
      prefillSource: null,
    });
  };

  // Validate win amounts on change
  useEffect(() => {
    if (!confirmAmount) {
      setAmountError(false);
      return;
    }
    const mismatch = rawNum(winAmount) !== rawNum(confirmAmount);
    setAmountError(mismatch);
  }, [winAmount, confirmAmount]);

  // Trigger simulated OCR
  const applySimulatedOcr = () => {
    setPayoutType('EGM');
    setVenue('Riverside RSL Club');
    setDisbursementMethods(['Cash', 'Bank transfer']);
    setMachine('EGM-021');
    const formattedWin = formatCurrency('1250.00');
    setWinAmount(formattedWin);
    setTxnId('TXN-88213');

    persist({
      payoutType: 'EGM',
      venue: 'Riverside RSL Club',
      disbursementMethod: 'Cash + Bank transfer',
      disbursementMethods: ['Cash', 'Bank transfer'],
      machine: 'EGM-021',
      winAmount: formattedWin,
      txnId: 'TXN-88213',
    });
  };

  const handleDocketOptionChange = (option) => {
    setDocketOption(option);
    if (option === 'B') {
      const dummyPath = '/dummy-docket.png';
      setDocketThumb(dummyPath);
      setDocketStatus('Uploaded');
      setDocketSub('dummy-docket.png - click to replace');
      persist({
        docketThumb: dummyPath,
        docketName: 'dummy-docket.png',
        docketProvided: true,
      });
      applySimulatedOcr();
    } else {
      setDocketThumb(null);
      setDocketStatus('Add docket photo');
      setDocketSub('');
      setMachine('');
      setWinAmount('');
      setConfirmAmount('');
      setTxnId('');
      persist({
        docketThumb: null,
        docketName: null,
        docketProvided: false,
        machine: '',
        winAmount: '',
        confirmAmount: '',
        txnId: '',
      });
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setDocketFile(file);
    setDocketStatus('Uploaded');
    setDocketSub(`${file.name} - click to replace`);

    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        setDocketThumb(reader.result);
        persist({ docketThumb: reader.result, docketName: file.name, docketProvided: true });
      };
      reader.readAsDataURL(file);
    } else {
      setDocketThumb(null);
      persist({ docketThumb: null, docketName: file.name, docketProvided: true });
    }

    if (/dummy-docket/i.test(file.name)) {
      setIsReadingOcr(true);
      setDocketStatus('Reading docket...');
      setTimeout(() => {
        setIsReadingOcr(false);
        setDocketStatus('Uploaded');
        applySimulatedOcr();
      }, 700);
    }
  };

  // Validation state for Next button
  const isFormValid =
    (docketThumb || docketFile || docketOption === 'B') &&
    machine.trim() !== '' &&
    disbursementMethods.length > 0 &&
    rawNum(winAmount) > 0 &&
    confirmAmount.trim() !== '' &&
    rawNum(winAmount) === rawNum(confirmAmount) &&
    txnId.trim() !== '';

  const handleNext = () => {
    if (!isFormValid) return;
    const matched = initialVenues.find((item) => item.name === venue);
    const venueState = matched?.state || (venue === 'Northside Leagues Club' ? 'QLD' : venue === 'Harbourview Hotel' ? 'VIC' : 'NSW');
    const effectiveCashCap = getEffectiveCashCap({
      venueState,
      noEFTLimit: 99999,
      qldCashLimitOverride: 1000,
      requireIDVBelowAMLThreshold: false,
    });
    persist({
      payoutType,
      venue,
      venueState,
      effectiveCashCap,
      disbursementMethod: disbursementMethodLabel,
      disbursementMethods,
      machine,
      winAmount,
      confirmAmount,
      txnId,
    });
    router.push('/collector/payment-breakdown');
  };

  const filteredMachines = machines.filter((m) =>
    m.toLowerCase().includes(machine.toLowerCase())
  );

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header row */}
          <div className="flex items-center gap-6 mb-6">
            <button
              type="button"
              onClick={() => router.back()}
              className="inline-flex items-center gap-1.5 text-[15px] font-bold text-ink-hi hover:text-black transition-colors underline cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 text-brand" />
              <span>Back</span>
            </button>
            <h1 className="text-xl sm:text-2xl font-bold text-ink-hi">New payout details</h1>
          </div>

          {/* Form Card */}
          <Card padding="md" className="border-border shadow-card mb-6">
            <div className="space-y-6">
              {/* 1. Date & Time */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[14px] font-semibold text-ink-hi flex items-center gap-1">
                  Payout date and time <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={dateTime}
                  readOnly
                  className="h-12 px-4 bg-slate-50 border border-border rounded-md text-base text-ink-hi cursor-default font-mono focus:outline-none"
                />
              </div>

              {/* 2. Upload Payout Docket */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[14px] font-semibold text-ink-hi flex items-center gap-1">
                  Upload payout docket <span className="text-red-500">*</span>
                </label>
                <p className="text-[13.5px] text-ink-mid mb-1">
                  We&apos;ll read the docket photo and fill in the fields below.
                </p>

                <div
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-lg p-5 flex items-center gap-4 cursor-pointer transition-all ${
                    docketThumb || docketFile
                      ? 'border-border bg-white'
                      : 'border-border hover:border-brand/50 hover:bg-slate-50'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={handleFileUpload}
                    className="hidden"
                  />

                  {docketThumb ? (
                    <div className="relative w-14 h-14 rounded border border-border overflow-hidden bg-white flex-shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={docketThumb}
                        alt="Docket thumbnail"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-brand text-white flex items-center justify-center">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </div>
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-slate-100 text-ink-mid flex items-center justify-center flex-shrink-0">
                      <UploadCloud className="w-6 h-6 text-ink-mid" />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-ink-hi flex items-center gap-2">
                      {docketStatus}
                      {isReadingOcr && (
                        <RefreshCw className="w-3.5 h-3.5 text-brand animate-spin" />
                      )}
                    </div>
                    <div className="text-xs text-ink-mid truncate">
                      {docketSub || 'Click to select an image or PDF docket'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Club Membership Integration Prefill Action */}
              <div id="member-lookup-section">
                {showMemberLookup ? (
                  /* Expanded Lookup Panel matching approver/authoriser style */
                  <MemberLookupPanel
                    systemName={integrationConfig.system || 'Max Gaming'}
                    isIframe={integrationMode === 'iframe'}
                    mode={integrationMode}
                    onModeChange={setIntegrationMode}
                    iframeUrl={integrationConfig.iframeUrl}
                    presetMember={presetMember || prefilledMember}
                    onSelectMember={handleSelectMember}
                    onClose={() => {
                      setShowMemberLookup(false);
                      setPresetMember(null);
                    }}
                  />
                ) : prefilledMember ? (
                  /* Applied Prefill Flat Row */
                  <div className="py-3.5 border-y border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <UserCheck className="w-5 h-5 text-ink-hi flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[14.5px] font-bold text-ink-hi">
                            {prefilledMember.fullName}
                          </span>
                          <span className="font-mono text-[13px] text-ink-mid">
                            ({prefilledMember.memberNumber})
                          </span>
                          <Badge variant="pass" size="sm">
                            {prefilledMember.membershipStatus || 'Active/Financial'}
                          </Badge>
                          {prefilledMember.membershipTier && (
                            <Badge variant="neutral" size="sm">{prefilledMember.membershipTier}</Badge>
                          )}
                          <Badge variant="neutral" size="sm">
                            Via {prefilledMember.system || integrationConfig.system || 'Max Gaming'}
                          </Badge>
                        </div>
                        <p className="text-[12.5px] text-ink-mid mt-0.5 mb-0">
                          Member profile details loaded. Patron email, address, and verified identity details will auto-populate subsequent steps.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 self-end sm:self-center flex-shrink-0">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          setPresetMember(prefilledMember);
                          setShowMemberLookup(true);
                        }}
                      >
                        Change
                      </Button>
                      <Button
                        variant="dangerSecondary"
                        size="sm"
                        onClick={handleClearMember}
                      >
                        Clear
                      </Button>
                    </div>
                  </div>
                ) : (
                  /* Clean Integrated Flat Prompt Row (No card nesting) */
                  <div className="py-3 flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-start gap-3">
                        <CreditCard className="w-5 h-5 text-ink-hi flex-shrink-0 mt-0.5" />
                        <span className="text-[14px] font-semibold text-ink-hi">
                          Club membership database connected ({integrationConfig.system || 'Max Gaming'})
                        </span>
                      </div>
                      <span className="text-[12.5px] text-ink-mid block mt-1">
                        Search patron to prefill winner details and skip manual re-entry.
                      </span>
                    </div>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        setPresetMember(null);
                        setShowMemberLookup(true);
                      }}
                      className="flex-shrink-0"
                    >
                      Look up member
                    </Button>
                  </div>
                )}
              </div>

              {/* 3. Payout Type & Venue Row */}
              <div className="space-y-5">
                {/* Payout Type */}
                <div className="relative flex flex-col gap-1.5">
                  <label className="text-[14px] font-semibold text-ink-hi flex items-center gap-1">
                    Payout type <span className="text-red-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setPayoutTypeOpen(!payoutTypeOpen);
                      setVenueOpen(false);
                      setDisbursementMethodOpen(false);
                      setMachineOpen(false);
                    }}
                    className="h-12 px-4 bg-white border border-border rounded-md text-base text-ink-hi flex items-center justify-between text-left focus:border-ink-hi focus:ring-2 focus:ring-slate-200 outline-none"
                  >
                    <span>{payoutType}</span>
                    <ChevronDown className="w-4 h-4 text-ink-lo" />
                  </button>

                  {payoutTypeOpen && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-border rounded-md shadow-lg z-30 py-1">
                      {['EGM', 'Table Game', 'MyCash'].map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => {
                            setPayoutType(type);
                            setPayoutTypeOpen(false);
                            persist({ payoutType: type });
                          }}
                          className={`w-full px-4 py-2.5 text-left text-sm hover:bg-slate-50 hover:text-ink-hi ${
                            payoutType === type ? 'font-bold text-brand bg-brand/5' : 'text-ink-hi'
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Venue */}
                <div className="relative flex flex-col gap-1.5">
                  <label className="text-[14px] font-semibold text-ink-hi flex items-center gap-1">
                    Venue <span className="text-red-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setVenueOpen(!venueOpen);
                      setPayoutTypeOpen(false);
                      setDisbursementMethodOpen(false);
                      setMachineOpen(false);
                    }}
                    className="h-12 px-4 bg-white border border-border rounded-md text-base text-ink-hi flex items-center justify-between text-left focus:border-ink-hi focus:ring-2 focus:ring-slate-200 outline-none"
                  >
                    <span className="truncate">{venue}</span>
                    <ChevronDown className="w-4 h-4 text-ink-lo" />
                  </button>

                  {venueOpen && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-border rounded-md shadow-lg z-30 py-1">
                      {[
                        'Riverside RSL Club',
                        'Northside Leagues Club',
                        'Harbourview Hotel',
                      ].map((v) => (
                        <button
                          key={v}
                          type="button"
                          onClick={() => {
                            setVenue(v);
                            setVenueOpen(false);
                            const matched = initialVenues.find((item) => item.name === v);
                            const venueState = matched?.state || (v === 'Northside Leagues Club' ? 'QLD' : v === 'Harbourview Hotel' ? 'VIC' : 'NSW');
                            const effectiveCashCap = getEffectiveCashCap({
                              venueState,
                              noEFTLimit: 99999,
                              qldCashLimitOverride: 1000,
                              requireIDVBelowAMLThreshold: false,
                            });
                            persist({ venue: v, venueState, effectiveCashCap });
                          }}
                          className={`w-full px-4 py-2.5 text-left text-sm hover:bg-slate-50 hover:text-ink-hi ${
                            venue === v ? 'font-bold text-brand bg-brand/5' : 'text-ink-hi'
                          }`}
                        >
                          {v}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* 4. Disbursement Method */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[14px] font-semibold text-ink-hi flex items-center gap-1">
                  Disbursement method <span className="text-red-500">*</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {disbursementOptions.map((method) => {
                    const selected = disbursementMethods.includes(method);
                    return (
                      <button
                        key={method}
                        type="button"
                        onClick={() => toggleDisbursementMethod(method)}
                        aria-pressed={selected}
                        className={`inline-flex items-center gap-2 h-11 px-4 rounded-full border text-[14px] transition-colors ${
                          selected
                            ? 'bg-white text-[#0d9488] font-bold border-[#0d9488] shadow-xs'
                            : 'bg-white text-[#627d98] font-semibold border-[#cbd5e1] shadow-2xs hover:text-ink-hi'
                        }`}
                      >
                        <span
                          className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${
                            selected ? 'bg-[#0d9488]' : 'border border-[#cbd5e1]'
                          }`}
                        >
                          {selected && <Check className="w-2.5 h-2.5 stroke-[3] text-white" />}
                        </span>
                        {method}
                      </button>
                    );
                  })}
                </div>
                <p className="text-[13px] text-ink-mid">
                  Select one or more.
                </p>
              </div>

              {/* 5. Machine Combobox */}
              <div className="relative flex flex-col gap-1.5">
                <label className="text-[14px] font-semibold text-ink-hi flex items-center gap-1">
                  Machine <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={machine}
                    placeholder="Click to browse, or type to search"
                    onClick={() => {
                      setMachineOpen(true);
                      setDisbursementMethodOpen(false);
                    }}
                    onChange={(e) => {
                      setMachine(e.target.value);
                      setMachineOpen(true);
                      persist({ machine: e.target.value });
                    }}
                    className="h-12 w-full px-4 bg-white border border-border rounded-md text-base text-ink-hi font-mono placeholder:font-sans placeholder:text-ink-lo focus:border-ink-hi focus:ring-2 focus:ring-slate-200 outline-none"
                  />
                  <ChevronDown className="w-4 h-4 text-ink-lo absolute right-4 top-5 pointer-events-none" />
                </div>

                {machineOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-border rounded-md shadow-lg z-30 max-h-48 overflow-y-auto py-1">
                    {filteredMachines.length > 0 ? (
                      filteredMachines.map((m) => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => {
                            setMachine(m);
                            setMachineOpen(false);
                            persist({ machine: m });
                          }}
                          className={`w-full px-4 py-2.5 text-left text-sm font-mono hover:bg-slate-50 hover:text-ink-hi ${
                            machine === m ? 'font-bold text-brand bg-brand/5' : 'text-ink-hi'
                          }`}
                        >
                          {m}
                        </button>
                      ))
                    ) : (
                      <div className="px-4 py-2.5 text-xs text-ink-lo">No machines found</div>
                    )}
                  </div>
                )}
              </div>

              {/* 6. Win Amount & Confirm Win Amount */}
              <div className="space-y-5">
                {/* Win Amount */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[14px] font-semibold text-ink-hi flex items-center gap-1">
                    Win amount <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center gap-2 h-12 px-4 rounded-md border border-border bg-white focus-within:border-ink-hi focus-within:ring-2 focus-within:ring-slate-200">
                    <span className="text-[17px] font-bold text-ink-hi font-mono select-none">$</span>
                    <input
                      type="text"
                      inputMode="decimal"
                      value={winAmount}
                      placeholder="0.00"
                      onChange={(e) => {
                        const val = sanitizeDecimal(e.target.value);
                        setWinAmount(val);
                      }}
                      onBlur={() => {
                        const formatted = formatCurrency(winAmount);
                        setWinAmount(formatted);
                        persist({ winAmount: formatted });
                      }}
                      className="flex-1 min-w-0 h-full bg-transparent text-base font-mono text-ink-hi focus:outline-none"
                    />
                    <span className="text-[13px] font-semibold text-ink-lo font-mono select-none">AUD</span>
                  </div>
                  {amountOption === 'B' && rawNum(winAmount) > 0 && (
                    <div className="text-[18px] font-bold text-ink-hi font-mono mt-1">
                      AUD {formatCurrency(winAmount)}
                    </div>
                  )}
                </div>

                {/* Confirm Win Amount */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] font-medium text-ink-mid">Confirm win amount</label>
                  <div
                    className={`flex items-center gap-2 h-12 px-4 rounded-md border bg-white ${
                      amountError
                        ? 'border-red-400 focus-within:border-red-500 focus-within:ring-2 focus-within:ring-red-100'
                        : 'border-border focus-within:border-ink-hi focus-within:ring-2 focus-within:ring-slate-200'
                    }`}
                  >
                    <span className="text-[17px] font-bold text-ink-hi font-mono select-none">$</span>
                    <input
                      type="text"
                      inputMode="decimal"
                      value={confirmAmount}
                      placeholder="0.00"
                      onChange={(e) => {
                        const val = sanitizeDecimal(e.target.value);
                        setConfirmAmount(val);
                      }}
                      onBlur={() => {
                        const formatted = formatCurrency(confirmAmount);
                        setConfirmAmount(formatted);
                        persist({ confirmAmount: formatted });
                      }}
                      className="flex-1 min-w-0 h-full bg-transparent text-base font-mono text-ink-hi focus:outline-none"
                    />
                    <span className="text-[13px] font-semibold text-ink-lo font-mono select-none">AUD</span>
                  </div>

                  {amountOption === 'B' && rawNum(confirmAmount) > 0 && (
                    <div className="text-[18px] font-bold text-ink-hi font-mono mt-1">
                      AUD {formatCurrency(confirmAmount)}
                    </div>
                  )}

                  {amountError && (
                    <div className="flex items-center gap-1.5 text-xs text-red-600 font-medium mt-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>Win amounts do not match.</span>
                    </div>
                  )}
                </div>
              </div>

              {/* 7. Internal Transaction ID */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[14px] font-semibold text-ink-hi flex items-center gap-1">
                  Internal transaction ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={txnId}
                  placeholder="Internal transaction ID"
                  onChange={(e) => {
                    setTxnId(e.target.value);
                    persist({ txnId: e.target.value });
                  }}
                  className="h-12 px-4 bg-white border border-border rounded-md text-base text-ink-hi font-mono placeholder:font-sans placeholder:text-ink-lo focus:border-ink-hi focus:ring-2 focus:ring-slate-200 outline-none"
                />
              </div>

            </div>
          </Card>

          {/* Actions */}
          <div className="mt-6">
            <Button
              size="lg"
              disabled={!isFormValid}
              onClick={handleNext}
              className="w-full h-12 text-[16px] font-semibold"
            >
              Next
            </Button>
          </div>

          {/* Prototype Options Toolbar */}
          <div className="mt-8 space-y-3">
            {/* Membership Integration Scenario Toolbar */}
            <div className="flex items-center justify-between gap-3 p-3 rounded-lg border border-dashed border-border bg-surface-card flex-wrap text-xs">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="font-semibold text-ink-mid flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-brand" />
                  Membership integration scenario:
                </span>
                <div className="inline-flex rounded-md border border-border p-0.5 bg-white">
                  <button
                    type="button"
                    onClick={() => {
                      setIntegrationMode('api');
                      setShowMemberLookup(true);
                      setTimeout(() => {
                        document.getElementById('member-lookup-section')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      }, 50);
                    }}
                    className={`px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer ${
                      integrationMode === 'api'
                        ? 'bg-slate-800 text-white'
                        : 'bg-slate-100 text-ink-mid hover:bg-slate-200'
                    }`}
                  >
                    Direct API ({integrationConfig.system || 'Max Gaming'})
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIntegrationMode('iframe');
                      setShowMemberLookup(true);
                      setTimeout(() => {
                        document.getElementById('member-lookup-section')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      }, 50);
                    }}
                    className={`px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer ${
                      integrationMode === 'iframe'
                        ? 'bg-slate-800 text-white'
                        : 'bg-slate-100 text-ink-mid hover:bg-slate-200'
                    }`}
                  >
                    Embedded Console (Iframe)
                  </button>
                </div>
              </div>

              {/* Single Demo Patron Preset */}
              <div className="flex items-center gap-2">
                <span className="font-semibold text-ink-mid">Demo patron:</span>
                <button
                  type="button"
                  onClick={() => {
                    setPrefilledMember(null);
                    setIntegrationMode('api');
                    setShowMemberLookup(true);
                    setPresetMember({ ...MOCK_CLUB_MEMBERS[0] });
                    setTimeout(() => {
                      document.getElementById('member-lookup-section')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }, 50);
                  }}
                  className="font-mono text-xs px-3 py-1 rounded-full border border-border bg-white text-ink-mid hover:border-brand hover:text-brand hover:bg-brand/5 transition-colors cursor-pointer"
                  title="Display Sarah Jenkins details in lookup"
                >
                  MEM-10884 (Sarah Jenkins)
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg border border-dashed border-border bg-surface-card flex-wrap text-xs">
              <span className="font-semibold text-ink-mid flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-brand" />
                Docket upload:
              </span>
              <button
                type="button"
                onClick={() => handleDocketOptionChange('A')}
                className={`px-3 py-1.5 rounded-md font-semibold transition-colors ${
                  docketOption === 'A'
                    ? 'bg-slate-800 text-white'
                    : 'bg-slate-100 text-ink-mid hover:bg-slate-200'
                }`}
              >
                Option A: Manual upload
              </button>
              <button
                type="button"
                onClick={() => handleDocketOptionChange('B')}
                className={`px-3 py-1.5 rounded-md font-semibold transition-colors ${
                  docketOption === 'B'
                    ? 'bg-slate-800 text-white'
                    : 'bg-slate-100 text-ink-mid hover:bg-slate-200'
                }`}
              >
                Option B: Simulated OCR (pre-fill)
              </button>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg border border-dashed border-border bg-surface-card flex-wrap text-xs">
              <span className="font-semibold text-ink-mid flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-brand" />
                Win amount preview:
              </span>
              <button
                type="button"
                onClick={() => setAmountOption('A')}
                className={`px-3 py-1.5 rounded-md font-semibold transition-colors ${
                  amountOption === 'A'
                    ? 'bg-slate-800 text-white'
                    : 'bg-slate-100 text-ink-mid hover:bg-slate-200'
                }`}
              >
                Option A: Simple
              </button>
              <button
                type="button"
                onClick={() => setAmountOption('B')}
                className={`px-3 py-1.5 rounded-md font-semibold transition-colors ${
                  amountOption === 'B'
                    ? 'bg-slate-800 text-white'
                    : 'bg-slate-100 text-ink-mid hover:bg-slate-200'
                }`}
              >
                Option B: Live AUD preview
              </button>
            </div>
          </div>
    </div>
  );
}
