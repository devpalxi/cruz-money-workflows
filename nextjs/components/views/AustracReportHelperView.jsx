'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Copy,
  Check,
  CheckCircle2,
  X,
  ExternalLink,
  Sparkles,
  Pencil
} from 'lucide-react';
import AdminShell from '@/components/layout/AdminShell';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Checkbox from '@/components/ui/Checkbox';
import { curatedAustracEntries } from '@/components/views/AustracReportsView';

const AUSTRAC_ONLINE_URL = 'https://online.austrac.gov.au';

export default function AustracReportHelperView({ txId, role = 'ADMIN' }) {
  const isSuperAdmin = role === 'SUPER ADMIN';

  // Find transaction data or fallback to first entry
  const selectedTx = curatedAustracEntries.find((e) => e.id === txId) || curatedAustracEntries[0];

  const [toastMessage, setToastMessage] = useState(null);
  const [copiedKey, setCopiedKey] = useState(null);

  // Developer option (prototype toolbar at the bottom): lay field rows out in two columns
  const [twoColumnFields, setTwoColumnFields] = useState(false);

  // AUSTRAC Submission Reference State
  const [austracRefNumber, setAustracRefNumber] = useState('');
  const [tempRefInput, setTempRefInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && selectedTx?.id) {
      const saved = localStorage.getItem(`cruz_austrac_ref_${selectedTx.id}`);
      if (saved) {
        setAustracRefNumber(saved);
        setIsSubmitted(true);
      }
    }
  }, [selectedTx?.id]);

  const handleSaveReference = () => {
    const trimmed = tempRefInput.trim();
    if (!trimmed) return;
    setAustracRefNumber(trimmed);
    setIsSubmitted(true);
    setIsSubmitting(false);
    if (typeof window !== 'undefined' && selectedTx?.id) {
      localStorage.setItem(`cruz_austrac_ref_${selectedTx.id}`, trimmed);
    }
    showToast(`AUSTRAC reference "${trimmed}" recorded.`);
  };

  const handleClearReference = () => {
    setAustracRefNumber('');
    setIsSubmitted(false);
    setIsSubmitting(false);
    if (typeof window !== 'undefined' && selectedTx?.id) {
      localStorage.removeItem(`cruz_austrac_ref_${selectedTx.id}`);
    }
    showToast('AUSTRAC reference removed.');
  };

  // Report Helper State (PART E & G)
  const [selectedIndicators, setSelectedIndicators] = useState([
    'sub-threshold amount',
    'minimal active play relative to payout',
    'name mismatch on bank account'
  ]);
  const [generatedNarrative, setGeneratedNarrative] = useState('');
  const [isNarrativeVisible, setIsNarrativeVisible] = useState(false);

  const [selectedActions, setSelectedActions] = useState([
    'Payout was withheld pending further investigation',
    'Internal escalation to AML Compliance Officer'
  ]);
  const [generatedActions, setGeneratedActions] = useState('');
  const [isActionsVisible, setIsActionsVisible] = useState(false);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleCopyText = (key, text) => {
    if (!text || text === '-') return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    showToast('Copied to clipboard.');
    setTimeout(() => setCopiedKey(null), 1500);
  };

  // Generate Narrative in Part E
  const handleGenerateNarrative = () => {
    if (!selectedTx) return;
    const patronName = [selectedTx.firstName, selectedTx.middleName, selectedTx.lastName].filter(Boolean).join(' ');
    const indicatorsText = selectedIndicators.map((i) => `- ${i}`).join('\n');
    const text = `SUSPICIOUS MATTER REPORT NARRATIVE
==================================
Date of Occurrence: ${selectedTx.date || '2026-07-14'}
Entity: ${selectedTx.venue}
Designated Service: EGM Gaming Machine Payout ($${parseFloat(selectedTx.amount).toFixed(2)})
Origin Machine: ${selectedTx.machine}

Customer Information:
Name: ${patronName}
DOB: ${selectedTx.dob || 'Not provided'}
Address: ${selectedTx.address || 'Not provided'}
Bank Account: ${selectedTx.accountName} (BSB: ${selectedTx.bsb}, Acc: ${selectedTx.accountNo})

Grounds for Suspicion:
${indicatorsText || '- Unusual transaction profile requiring regulatory notice'}

Confirmation of Payee (COP) Result: ${selectedTx.cop}
PEP Flag: ${selectedTx.pep} | Sanctions Check: ${selectedTx.sanctions}

The matter is submitted in accordance with Section 41 of the Anti-Money Laundering and Counter-Terrorism Financing Act 2006.`;

    setGeneratedNarrative(text);
    setIsNarrativeVisible(true);
    showToast('AUSTRAC narrative summary generated.');
  };

  // Generate Actions in Part G
  const handleGenerateActions = () => {
    if (!selectedTx) return;
    const actionsText = selectedActions.map((a) => `• ${a}`).join('\n');
    const text = `COMPLIANCE ACTIONS UNDERTAKEN:
${actionsText || '• Payout was withheld pending further verification'}

Escalation Record:
- Reviewed by: Jonathan Chen (AML Compliance Officer)
- Action Timestamp: ${selectedTx.created}
- Notification Reference: SMR-REF-${selectedTx.id}`;

    setGeneratedActions(text);
    setIsActionsVisible(true);
    showToast('Actions summary generated.');
  };

  // Mock records store names in all caps; show them in normal case in the UI
  const toTitleCase = (s) => (s || '').toLowerCase().replace(/\b[a-z]/g, (c) => c.toUpperCase());
  const patronFullName = toTitleCase(
    [selectedTx.firstName, selectedTx.middleName, selectedTx.lastName].filter(Boolean).join(' ')
  );
  const isTtrLodged = parseFloat(selectedTx.amount) >= 10000;
  const fmtAmount = (n) => Number(n).toLocaleString('en-AU', { minimumFractionDigits: 2 });

  // ---- Field definitions (mirror AUSTRAC Online Parts A to H) ----
  const partA = [
    { label: 'Report type', value: 'Manual selection required (e.g. Suspicious Matter Report)', manual: true },
    austracRefNumber
      ? { key: 'a_ref', label: 'Report reference no.', value: austracRefNumber, mono: true }
      : { label: 'Report reference no.', value: 'Generated by AUSTRAC Online upon submission', manual: true }
  ];

  const partB = [
    { key: 'b_name', label: 'Entity name', value: selectedTx.venue },
    { key: 'b_abn', label: 'ABN', value: '12 345 678 901', mono: true },
    { key: 'b_id', label: 'AUSTRAC reporting entity ID', value: 'RE-00987-AB', mono: true },
    { key: 'b_service', label: 'Designated service', value: 'Electronic gaming machine (EGM) payout of winnings' },
    { key: 'b_addr', label: 'Principal place of business', value: '123 Riverside Drive, Riverside NSW 2150' },
    { key: 'b_contact', label: 'Contact officer', value: 'J. Doe, AML/CTF Compliance Officer, compliance@riversidersl.com.au' }
  ];

  const partC = [
    { key: 'c_date', label: 'Transaction date', value: selectedTx.date || '2026-07-14', mono: true },
    { key: 'c_win', label: 'Win amount', value: `$${fmtAmount(selectedTx.amount)}`, mono: true },
    { key: 'c_cash', label: 'Cash amount', value: `$${fmtAmount(selectedTx.cashAmount || 0)}`, mono: true },
    { key: 'c_bank', label: 'Transfer amount', value: `$${fmtAmount(selectedTx.amount)}`, mono: true },
    { key: 'c_machine', label: 'Machine ID', value: selectedTx.machine, mono: true },
    { key: 'c_txn', label: 'Internal transaction ID', value: selectedTx.id, mono: true }
  ];

  const partD = [
    { key: 'd_name', label: 'Full name', value: patronFullName },
    selectedTx.dob
      ? { key: 'd_dob', label: 'Date of birth', value: selectedTx.dob, mono: true }
      : { label: 'Date of birth', value: 'Not on file, manual lookup required', manual: true },
    { label: 'Nationality', value: 'Manual lookup required', manual: true },
    { key: 'd_addr', label: 'Address', value: selectedTx.address },
    { key: 'd_mem', label: 'Membership number', value: selectedTx.membership || 'MB-001', mono: true },
    { key: 'd_email', label: 'Email', value: selectedTx.email || 'Not provided', manual: !selectedTx.email },
    selectedTx.occupation
      ? { key: 'd_occupation', label: 'Occupation (self-reported)', value: selectedTx.occupation }
      : { label: 'Occupation (self-reported)', value: 'Not collected, manual lookup required', manual: true },
    { key: 'd_acc', label: 'Bank account name', value: toTitleCase(selectedTx.accountName) },
    { key: 'd_bsb', label: 'BSB number', value: selectedTx.bsb, mono: true },
    { key: 'd_accno', label: 'Account number', value: selectedTx.accountNo, mono: true }
  ];

  const partF = [
    {
      key: 'f_ttr',
      label: 'TTR lodged?',
      value: isTtrLodged
        ? 'Yes, generated automatically for amounts of $10,000 or more'
        : 'No, amount is below the $10,000 threshold'
    },
    { label: 'Prior SMRs for same person?', value: 'Manual AUSTRAC lookup required', manual: true }
  ];

  const partH = [
    { key: 'h_name', label: 'Authorised officer name', labelWrap: 'Authorised\nofficer name', value: 'J. Doe' },
    { key: 'h_title', label: 'Authorised officer title', labelWrap: 'Authorised\nofficer title', value: 'AML/CTF Compliance Officer' }
  ];

  const jumpTo = (id) => {
    const el = document.getElementById(id === 'lodge' ? 'lodge' : `part-${id}`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // ---- Field row: the entire row is a click-to-copy target ----
  const renderRow = (f, idx, twoCol = false) => {
    const isManual = !!f.manual;
    const flash = f.key && copiedKey === f.key;

    const interactive = !isManual
      ? {
          role: 'button',
          tabIndex: 0,
          title: 'Copy',
          onClick: () => handleCopyText(f.key, f.value),
          onKeyDown: (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleCopyText(f.key, f.value);
            }
          }
        }
      : {};

    return (
      <div
        key={f.key || `${f.label}-${idx}`}
        {...interactive}
        className={`group flex flex-col sm:flex-row sm:items-center gap-1 outline-none transition-colors ${
          twoCol ? 'sm:gap-3 px-4 py-2.5' : 'sm:gap-4 px-5 py-3'
        } ${
          isManual
            ? ''
            : 'cursor-pointer hover:bg-[#f8fafc] focus-visible:bg-[#f8fafc] focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#0d9488]'
        }`}
      >
        <div className={`shrink-0 ${twoCol ? 'sm:w-[124px]' : 'sm:w-[190px]'}`}>
          <span
            className={`text-[13px] font-semibold leading-snug text-[#475569] ${
              twoCol && f.labelWrap ? 'whitespace-pre-line' : ''
            }`}
          >
            {twoCol && f.labelWrap ? f.labelWrap : f.label}
          </span>
        </div>

        <div
          className={`flex-1 min-w-0 break-words text-[15px] ${
            isManual ? 'text-[#94a3b8]' : 'font-medium text-[#0f172a]'
          } ${f.mono ? 'font-mono text-[14px] tabular-nums' : ''}`}
        >
          {f.value}
        </div>

        <div className={`shrink-0 self-start sm:self-auto flex sm:justify-center ${twoCol ? 'sm:w-[52px]' : 'sm:w-[74px]'}`}>
          {isManual ? (
            <span className="text-[12px] font-semibold text-[#94a3b8]">Manual</span>
          ) : (
            <span
              className={`inline-flex items-center gap-1.5 text-[12px] font-semibold ${
                flash ? 'text-[#475569]' : 'text-[#94a3b8] group-hover:text-[#475569]'
              }`}
            >
              {flash ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {!twoCol && <span className="w-[46px] text-left">{flash ? 'Copied' : 'Copy'}</span>}
            </span>
          )}
        </div>
      </div>
    );
  };

  const renderSection = (id, letter, title, fields) => (
    <section id={`part-${id}`} className="scroll-mt-6 pt-4 pb-2">
      <header className="px-5 pb-1.5">
        <h2 className="text-[13.5px] font-bold text-[#0f172a] m-0">
          <span className="font-mono text-[#94a3b8] mr-2">{letter}</span>
          {title}
        </h2>
      </header>
      <div
        className={
          twoColumnFields
            ? 'grid sm:grid-cols-2 sm:[&>*:nth-child(even)]:border-l sm:[&>*:nth-child(even)]:border-[#edf2f7]'
            : ''
        }
      >
        {fields.map((f, i) => renderRow(f, i, twoColumnFields))}
      </div>
    </section>
  );

  return (
    <AdminShell role={role}>
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0f172a] text-white px-4 py-3 rounded-lg shadow-xl border border-slate-700 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-5 h-5 text-teal-400 flex-shrink-0" />
          <span className="text-[13.5px] font-medium">{toastMessage}</span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white ml-2 cursor-pointer bg-transparent border-none"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="max-w-[900px] mx-auto pb-24">
        {/* Page title */}
        <div className="mb-4">
          <Link
            href="/admin/austrac"
            className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#475569] hover:text-[#0f172a] transition-colors no-underline mb-2"
          >
            <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
            <span>Back to AUSTRAC transactions</span>
          </Link>
          <h1 className="text-[22px] font-bold text-[#0f172a] tracking-tight m-0 leading-tight">
            AUSTRAC report helper
          </h1>
          <p className="text-[13.5px] text-[#475569] mt-1 mb-0 leading-relaxed">
            Copy each field into the matching field on AUSTRAC Online, then record the reference it returns at the bottom.
          </p>
        </div>

        <div className="bg-white border border-[#e2e8f0] rounded-[10px] overflow-hidden divide-y divide-[#e2e8f0]">
          {/* Report header */}
          <div className="px-5 py-3.5 flex items-center gap-x-4 gap-y-2 flex-wrap">
            <div className="flex items-center gap-2 text-[13px] min-w-0">
              <span className="font-mono font-bold text-[#0d9488] tabular-nums">{selectedTx.id}</span>
              <span className="text-[#cbd5e1]">·</span>
              <span className="font-semibold text-[#0f172a] truncate">{patronFullName}</span>
              <span className="text-[#cbd5e1] hidden sm:inline">·</span>
              <span className="font-mono tabular-nums text-[#475569] hidden sm:inline">
                ${fmtAmount(selectedTx.amount)}
              </span>
            </div>

            <div className="flex items-center gap-2.5 ml-auto">
              <a
                href={AUSTRAC_ONLINE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center h-8 px-3 rounded-md text-xs font-semibold gap-1.5 bg-white border border-[#e2e8f0] text-[#0f172a] hover:bg-slate-50 hover:border-[#cbd5e1] transition-colors no-underline whitespace-nowrap"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>AUSTRAC</span>
              </a>

              <button
                type="button"
                onClick={() => jumpTo('lodge')}
                className="inline-flex items-center bg-transparent border-none p-0 cursor-pointer"
                title="Go to lodgement step"
              >
                <Badge variant={isSubmitted ? 'pass' : 'neutral'} size="sm">
                  {isSubmitted ? 'Lodged' : 'Not lodged'}
                </Badge>
              </button>
            </div>
          </div>

          {renderSection('A', 'A', 'Report details', partA)}
          {renderSection('B', 'B', 'Reporting entity', partB)}
          {renderSection('C', 'C', 'Transaction details', partC)}
          {renderSection('D', 'D', 'Subject details', partD)}

          {/* PART E: Grounds for suspicion (narrative generator) */}
          <section id="part-E" className="scroll-mt-6 px-5 pt-4 pb-5 space-y-5">
              <h2 className="text-[13.5px] font-bold text-[#0f172a] m-0">
                <span className="font-mono text-[#94a3b8] mr-2">E</span>
                Grounds for suspicion
              </h2>

              <div className="space-y-3">
                <span className="text-[13px] text-[#475569] block">
                  Select suspicious matter indicators to include in the narrative:
                </span>
                <div className="space-y-3 pt-1">
                  {[
                    { id: 'sub-threshold amount', label: 'Payout amount just below TTR threshold ($10k)' },
                    { id: 'minimal active play relative to payout', label: 'Minimal play relative to payout amount' },
                    { id: 'name mismatch on bank account', label: 'Bank account name mismatch' },
                    { id: 'failure to provide identification', label: 'Refusal or failure to provide identification' },
                    { id: 'patron income inconsistent with activity', label: 'Patron income inconsistent with activity level' },
                    { id: 'multiple large payouts in short period', label: 'Multiple large payouts over a short period' }
                  ].map((ind) => {
                    const isChecked = selectedIndicators.includes(ind.id);
                    return (
                      <div key={ind.id} className="flex items-center">
                        <Checkbox
                          size="sm"
                          variant="brand"
                          checked={isChecked}
                          onChange={() => {
                            if (isChecked) {
                              setSelectedIndicators(selectedIndicators.filter((i) => i !== ind.id));
                            } else {
                              setSelectedIndicators([...selectedIndicators, ind.id]);
                            }
                          }}
                          label={ind.label}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-end pt-3 border-t border-[#e2e8f0]">
                <Button variant="primary" onClick={handleGenerateNarrative}>
                  Generate narrative
                </Button>
              </div>

              {isNarrativeVisible && (
                <div className="mt-5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-semibold text-[#475569]">
                      Generated narrative
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsNarrativeVisible(false)}
                      className="p-1 rounded-md text-[#94a3b8] hover:text-[#0f172a] hover:bg-slate-100 transition-colors"
                      aria-label="Close generated narrative"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="relative">
                    <textarea
                      rows={8}
                      value={generatedNarrative}
                      onChange={(e) => setGeneratedNarrative(e.target.value)}
                      className="w-full p-4 pr-11 font-sans text-[15px] leading-relaxed rounded-md border border-[#e2e8f0] outline-none focus:border-[#0f172a] focus:ring-2 focus:ring-slate-200"
                    />
                    <button
                      type="button"
                      onClick={() => handleCopyText('narrative', generatedNarrative)}
                      className="absolute top-3 right-3 p-1.5 rounded-md text-[#94a3b8] hover:text-[#0f172a] hover:bg-slate-100 transition-colors"
                      aria-label="Copy narrative"
                    >
                      {copiedKey === 'narrative' ? (
                        <Check className="w-4 h-4 text-[#0d9488]" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              )}
            </section>

          {renderSection('F', 'F', 'Related reports', partF)}

          {/* PART G: Actions taken (actions generator) */}
          <section id="part-G" className="scroll-mt-6 px-5 pt-4 pb-5 space-y-5">
              <h2 className="text-[13.5px] font-bold text-[#0f172a] m-0">
                <span className="font-mono text-[#94a3b8] mr-2">G</span>
                Actions taken
              </h2>

              <div className="space-y-3">
                <span className="text-[13px] text-[#475569] block">
                  Select the actions taken in response to the suspicion:
                </span>
                <div className="space-y-3 pt-1">
                  {[
                    'Payout was processed normally',
                    'Payout was withheld pending further investigation',
                    'Law enforcement was notified directly',
                    'Patron was asked to leave the premises',
                    'Internal escalation to AML Compliance Officer'
                  ].map((act) => {
                    const isChecked = selectedActions.includes(act);
                    return (
                      <div key={act} className="flex items-center">
                        <Checkbox
                          size="sm"
                          variant="brand"
                          checked={isChecked}
                          onChange={() => {
                            if (isChecked) {
                              setSelectedActions(selectedActions.filter((a) => a !== act));
                            } else {
                              setSelectedActions([...selectedActions, act]);
                            }
                          }}
                          label={act}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-end pt-3 border-t border-[#e2e8f0]">
                <Button variant="primary" onClick={handleGenerateActions}>
                  Generate actions
                </Button>
              </div>

              {isActionsVisible && (
                <div className="mt-5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-semibold text-[#475569]">
                      Generated actions
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsActionsVisible(false)}
                      className="p-1 rounded-md text-[#94a3b8] hover:text-[#0f172a] hover:bg-slate-100 transition-colors"
                      aria-label="Close generated actions"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="relative">
                    <textarea
                      rows={5}
                      value={generatedActions}
                      onChange={(e) => setGeneratedActions(e.target.value)}
                      className="w-full p-4 pr-11 font-sans text-[15px] leading-relaxed rounded-md border border-[#e2e8f0] outline-none focus:border-[#0f172a] focus:ring-2 focus:ring-slate-200"
                    />
                    <button
                      type="button"
                      onClick={() => handleCopyText('actions', generatedActions)}
                      className="absolute top-3 right-3 p-1.5 rounded-md text-[#94a3b8] hover:text-[#0f172a] hover:bg-slate-100 transition-colors"
                      aria-label="Copy actions"
                    >
                      {copiedKey === 'actions' ? (
                        <Check className="w-4 h-4 text-[#0d9488]" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              )}
            </section>

          {renderSection('H', 'H', 'Declaration', partH)}

          {/* Lodgement step - set apart from the data sections with extra space */}
          <section id="lodge" className="scroll-mt-6 mt-4 pt-5 pb-5">
              <header className="px-5 pb-3">
                <h2 className="text-[13.5px] font-bold text-[#0f172a] m-0">Lodge and record reference</h2>
                <p className="text-[13px] text-[#475569] mt-1 mb-0">
                  After lodging on AUSTRAC Online, record the official reference ID it returns.
                </p>
              </header>

              <div className="px-5">
                {!isSubmitted && !isSubmitting && (
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-lg border border-[#e2e8f0] bg-white">
                    <div className="flex-1 text-[14px] text-[#475569]">
                      Have you completed and submitted this report on AUSTRAC Online? Record the official
                      confirmation reference below.
                    </div>
                    <Button
                      variant="primary"
                      className="w-full sm:w-auto whitespace-nowrap"
                      onClick={() => {
                        setIsSubmitting(true);
                        setTempRefInput('');
                      }}
                    >
                      I have submitted to AUSTRAC
                    </Button>
                  </div>
                )}

                {isSubmitting && (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSaveReference();
                    }}
                    className="p-4 rounded-lg border border-[#e2e8f0] bg-white space-y-4"
                  >
                    <div className="space-y-1.5">
                      <label htmlFor="austrac-ref-input" className="block text-[13.5px] font-bold text-[#0f172a]">
                        AUSTRAC reference number <span className="text-[#dc2626]">*</span>
                      </label>
                      <input
                        id="austrac-ref-input"
                        type="text"
                        autoFocus
                        value={tempRefInput}
                        onChange={(e) => setTempRefInput(e.target.value)}
                        placeholder="e.g. SMR-2026-89412 or AU-99812-TX"
                        className="w-full h-10 px-3.5 font-mono text-[14px] font-semibold text-[#0f172a] bg-white border border-[#cbd5e1] rounded-[6px] outline-none focus:border-[#0f172a] focus:ring-2 focus:ring-slate-200 transition-all placeholder:text-[#94a3b8] placeholder:font-sans placeholder:font-normal"
                      />
                      <p className="text-[13px] text-[#475569] m-0">
                        Enter the official confirmation or lodgement reference issued by AUSTRAC Online.
                      </p>
                    </div>

                    <div className="flex items-center justify-between gap-3 pt-3 border-t border-[#e2e8f0] flex-wrap">
                      {austracRefNumber ? (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="text-[#dc2626] hover:bg-[#fef2f2] hover:text-[#dc2626]"
                          onClick={handleClearReference}
                        >
                          Remove reference
                        </Button>
                      ) : (
                        <span />
                      )}
                      <div className="flex items-center gap-3">
                        <Button type="button" variant="secondary" onClick={() => setIsSubmitting(false)}>
                          Cancel
                        </Button>
                        <Button type="submit" variant="primary" disabled={!tempRefInput.trim()}>
                          Save AUSTRAC ID
                        </Button>
                      </div>
                    </div>
                  </form>
                )}

                {isSubmitted && !isSubmitting && (
                  <div className="flex items-start justify-between gap-4 p-4 rounded-lg border border-[#e2e8f0] bg-white">
                    <div className="space-y-1.5 min-w-0">
                      <div className="flex items-center gap-3 flex-wrap">
                        <Badge variant="pass" size="lg">Lodged with AUSTRAC</Badge>
                        <span className="font-mono text-[16px] font-bold text-[#0f172a] tabular-nums">
                          {austracRefNumber}
                        </span>
                      </div>
                      <p className="text-[13.5px] text-[#475569] m-0">
                        Official reference recorded in audit trail. Part A report details updated.
                      </p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleCopyText('bottom_ref', austracRefNumber)}
                        className="p-1.5 rounded-md text-[#94a3b8] hover:text-[#0f172a] hover:bg-slate-100 transition-colors"
                        aria-label="Copy reference"
                        title="Copy reference"
                      >
                        {copiedKey === 'bottom_ref' ? (
                          <Check className="w-4 h-4 text-[#0d9488]" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsSubmitting(true);
                          setTempRefInput(austracRefNumber);
                        }}
                        className="p-1.5 rounded-md text-[#94a3b8] hover:text-[#0f172a] hover:bg-slate-100 transition-colors"
                        aria-label="Edit reference"
                        title="Edit reference"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* Developer options - prototype toolbar */}
          <div className="mt-6 flex items-center gap-3 p-3 rounded-lg border border-dashed border-[#cbd5e1] bg-white flex-wrap text-xs">
            <span className="font-semibold text-[#475569] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#0d9488]" />
              Developer option
            </span>
            <span className="text-[#475569]">Field layout</span>
            <div className="inline-flex rounded-md border border-[#e2e8f0] p-0.5 bg-white">
              <button
                type="button"
                onClick={() => setTwoColumnFields(false)}
                className={`px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer ${
                  !twoColumnFields
                    ? 'bg-[#0f172a] text-white'
                    : 'bg-[#f1f5f9] text-[#475569] hover:bg-[#e2e8f0]'
                }`}
              >
                One column
              </button>
              <button
                type="button"
                onClick={() => setTwoColumnFields(true)}
                className={`px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer ${
                  twoColumnFields
                    ? 'bg-[#0f172a] text-white'
                    : 'bg-[#f1f5f9] text-[#475569] hover:bg-[#e2e8f0]'
                }`}
              >
                Two columns
              </button>
            </div>
          </div>
        </div>
    </AdminShell>
  );
}
