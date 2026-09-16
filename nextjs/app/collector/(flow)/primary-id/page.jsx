'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  History,
  X,
  Sparkles,
  UserCheck,
  RotateCcw,
  ExternalLink,
} from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { returningPlayersDatabase } from '@/lib/mockReturningPlayers';

function PrimaryIdContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fromSummary = searchParams.get('from') === 'summary';

  const [country, setCountry] = useState('Australia');
  const [countryOpen, setCountryOpen] = useState(false);

  // Returning player detection
  const [returningPlayer, setReturningPlayer] = useState(null);
  const [viewMode, setViewMode] = useState('auto'); // 'auto' | 'reuse' | 'manual'

  // History modal
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyFilter, setHistoryFilter] = useState('all');
  const [collapsedGroups, setCollapsedGroups] = useState(new Set());

  const docOptions = [
    { id: 'licence', label: 'Driver Licence', route: '/collector/licence-detail' },
    { id: 'passport', label: 'Passport', route: '/collector/passport-detail' },
    { id: 'otherKyc', label: 'Manual KYC documents', route: '/collector/other-documents' },
    { id: 'noId', label: 'No ID', route: '/collector/no-id' },
  ];

  const historyEntries = [
    { label: 'Australia Driver Licence IDV', datetime: '20 July 2026, 9:12 am', result: 'pass' },
    { label: 'Australia Passport IDV', datetime: '20 July 2026, 9:20 am', result: 'fail' },
    { label: 'Australia Driver Licence IDV', datetime: '22 July 2026, 2:41 pm', result: 'pass' },
    { label: 'Australia Passport IDV', datetime: '22 July 2026, 2:47 pm', result: 'skipped' },
    { label: 'Australia Driver Licence IDV', datetime: '23 July 2026, 11:05 am', result: 'fail' },
    { label: 'New Zealand Passport IDV', datetime: '23 July 2026, 11:14 am', result: 'pass' },
    { label: 'Australia Driver Licence IDV', datetime: '24 July 2026, 4:58 pm', result: 'fail' },
    { label: 'Australia Driver Licence IDV', datetime: '24 July 2026, 4:58 pm', result: 'skipped' },
    { label: 'Australia Passport IDV', datetime: '25 July 2026, 8:30 am', result: 'pass' },
    { label: 'Australia Driver Licence IDV', datetime: '26 July 2026, 12:28 am', result: 'fail' },
  ];

  useEffect(() => {
    try {
      const saved = JSON.parse(sessionStorage.getItem('payoutFormData') || '{}');
      if (saved.country) setCountry(saved.country);
      if (saved.returningPlayerMatch && saved.returningPlayerData) {
        setReturningPlayer(saved.returningPlayerData);
        if (saved.idvStatus !== 'pass' && saved.idvStatus !== 'manual_bypass') {
          setViewMode('reuse');
        }
      }
    } catch (e) {}
  }, []);

  const persist = (patch) => {
    try {
      const current = JSON.parse(sessionStorage.getItem('payoutFormData') || '{}');
      sessionStorage.setItem('payoutFormData', JSON.stringify({ ...current, ...patch }));
    } catch (e) {}
  };

  const handleDocClick = (docId) => {
    persist({ docType: docId, country, idvReused: false });
    const option = docOptions.find((d) => d.id === docId);
    if (option) {
      router.push(`${option.route}${fromSummary ? '?from=summary' : ''}`);
    }
  };

  // Fast-path IDV Reuse handler
  const handleReuseIdAndContinue = () => {
    if (!returningPlayer) return;

    const patch = {
      idvStatus: 'reused',
      idvReused: true,
      idvReuseDate: returningPlayer.verifiedDate,
      idvReuseSource: returningPlayer.verificationSource,
      firstName: returningPlayer.firstName,
      middleName: returningPlayer.middleName || '',
      lastName: returningPlayer.lastName,
      fullName: returningPlayer.fullName,
      dob: returningPlayer.dob,
      phone: returningPlayer.phone || '',
      country: returningPlayer.country || 'Australia',
      docType: returningPlayer.docType,
      state: returningPlayer.state || '',
      licNumber: returningPlayer.licNumber || '',
      cardNumber: returningPlayer.cardNumber || '',
      passNumber: returningPlayer.passNumber || '',
      passExpiryText: returningPlayer.passExpiryText || '',
      medicareSelected: Boolean(returningPlayer.medicareSelected),
      secondaryDoc: returningPlayer.secondaryDoc || 'none',
      medicareNumber: returningPlayer.medicareNumber || '',
      irn: returningPlayer.irn || '',
      cardColor: returningPlayer.cardColor || '',
      cardExpiryText: returningPlayer.cardExpiryText || '',
      unitNumber: returningPlayer.unitNumber || '',
      streetNumber: returningPlayer.streetNumber || '',
      streetName: returningPlayer.streetName || '',
      suburb: returningPlayer.suburb || '',
      addrState: returningPlayer.addrState || returningPlayer.state || '',
      postcode: returningPlayer.postcode || '',
      addressSearch: returningPlayer.addressSearch || '',
      notes: `IDV reused from previous verification (${returningPlayer.verifiedDate}).`,
    };

    persist(patch);

    if (fromSummary) {
      router.push('/collector/summary');
    } else {
      router.push('/collector/secondary-id');
    }
  };

  const setPresetPlayer = (player) => {
    if (!player) {
      setReturningPlayer(null);
      setViewMode('manual');
      persist({ returningPlayerMatch: false, returningPlayerData: null, idvReused: false });
    } else {
      setReturningPlayer(player);
      setViewMode('reuse');
      persist({
        email: player.email,
        membership: player.membership,
        returningPlayerMatch: true,
        returningPlayerData: player,
      });
    }
  };

  // Group history entries
  const groupedHistory = historyEntries.reduce((acc, entry) => {
    if (!acc[entry.label]) acc[entry.label] = [];
    acc[entry.label].push(entry);
    return acc;
  }, {});

  const toggleGroupCollapse = (label) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
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

          <div className="flex items-end justify-between gap-4 mb-6">
            <div className="flex items-end gap-6">
              <button
                type="button"
                onClick={() => router.push(fromSummary ? '/collector/summary' : '/collector/email-address')}
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

          {/* Returning Player Recognized Card */}
          {returningPlayer && viewMode === 'reuse' ? (
            <>
            <Card padding="md" className="border-border shadow-card mb-6">
              {/* Header & Title */}
              <div className="mb-5 flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <h2 className="text-[18px] font-bold text-ink-hi leading-tight">
                    Returning player recognized
                  </h2>
                  <p className="text-xs sm:text-sm text-ink-mid">
                    Hashed PII match found in venue historical payout database.
                  </p>
                </div>
                <Badge variant="pass" size="lg" className="flex-shrink-0 whitespace-nowrap">
                  Verified on file
                </Badge>
              </div>

              {/* Flat key-value rows: label column left, value left-aligned beside it */}
              <dl className="text-[15px]">
                <div className="flex gap-4 py-1.5">
                  <dt className="w-[38%] shrink-0 text-ink-mid font-medium">Full name</dt>
                  <dd className="flex-1 min-w-0 m-0 font-semibold text-ink-hi">{returningPlayer.fullName}</dd>
                </div>
                <div className="flex gap-4 py-1.5">
                  <dt className="w-[38%] shrink-0 text-ink-mid font-medium">Date of birth</dt>
                  <dd className="flex-1 min-w-0 m-0 font-mono font-semibold text-ink-hi">{returningPlayer.dob}</dd>
                </div>
                <div className="flex gap-4 py-1.5">
                  <dt className="w-[38%] shrink-0 text-ink-mid font-medium">Residential address</dt>
                  <dd className="flex-1 min-w-0 m-0 font-semibold text-ink-hi break-words">{returningPlayer.addressSearch}</dd>
                </div>
                <div className="flex gap-4 py-1.5">
                  <dt className="w-[38%] shrink-0 text-ink-mid font-medium">Primary document</dt>
                  <dd className="flex-1 min-w-0 m-0 font-semibold text-ink-hi flex items-center gap-1.5 flex-wrap">
                    <span>{returningPlayer.docTypeLabel}</span>
                    <span className="text-xs font-mono text-ink-mid font-normal">
                      ({returningPlayer.docType === 'licence' ? `••••${returningPlayer.licNumber.slice(-4)}` : `••••${returningPlayer.passNumber.slice(-4)}`})
                    </span>
                  </dd>
                </div>
                {returningPlayer.medicareSelected && (
                  <div className="flex gap-4 py-1.5">
                    <dt className="w-[38%] shrink-0 text-ink-mid font-medium">Secondary ID</dt>
                    <dd className="flex-1 min-w-0 m-0 font-semibold text-ink-hi">Australian Medicare Card on file</dd>
                  </div>
                )}
                <div className="flex gap-4 py-1.5">
                  <dt className="w-[38%] shrink-0 text-ink-mid font-medium">Verification status</dt>
                  <dd className="flex-1 min-w-0 m-0 font-semibold text-ink-hi">{returningPlayer.timeAgoText}</dd>
                </div>
                <div className="flex gap-4 py-1.5">
                  <dt className="w-[38%] shrink-0 text-ink-mid font-medium">Reuse window</dt>
                  <dd className="flex-1 min-w-0 m-0 font-semibold text-ink-hi">Active (12-month compliance policy)</dd>
                </div>
              </dl>

              {/* Explanatory Note (Flat text, no nested card) */}
              <p className="text-[13.5px] text-ink-mid leading-relaxed mt-4 mb-0">
                Reusing existing verification pre-fills all patron details and skips electronic third-party (FrankieOne) check charges.
              </p>
            </Card>

            {/* Actions */}
            <div className="mt-6 space-y-3">
              <Button
                size="lg"
                onClick={handleReuseIdAndContinue}
                className="w-full h-12 text-[16px] font-semibold"
              >
                Use verified ID on file & continue
              </Button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setViewMode('manual')}
                  className="text-[13px] font-semibold text-ink-mid hover:text-ink-hi underline transition-colors cursor-pointer"
                >
                  Need to update details or verify a new document? Enter new ID manually
                </button>
              </div>
            </div>
            </>
          ) : (
            <>
              {/* If returning player available while in manual mode, show flat banner */}
              {returningPlayer && (
                <div className="mb-6 pb-4 border-b border-border flex items-center justify-between gap-3 text-xs sm:text-sm">
                  <div className="flex items-center gap-3 flex-wrap">
                    <UserCheck className="w-5 h-5 text-ink-hi flex-shrink-0" />
                    <span className="text-ink-hi font-medium">
                      Verified ID on file is available for <strong>{returningPlayer.fullName}</strong>
                    </span>
                    <Badge variant="pass" size="sm">Verified</Badge>
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setViewMode('reuse')}
                    className="flex-shrink-0"
                  >
                    Use saved ID
                  </Button>
                </div>
              )}

              <Card padding="md" className="border-border shadow-card mb-6 space-y-7">
                {/* Country Selector */}
                <div className="relative flex flex-col gap-1.5">
                  <label className="text-[14px] font-semibold text-ink-hi flex items-center gap-1">
                    Country of document <span className="text-red-500">*</span>
                  </label>

                  <button
                    type="button"
                    onClick={() => setCountryOpen(!countryOpen)}
                    className="h-12 px-4 bg-white border border-border rounded-md text-base text-ink-hi flex items-center justify-between text-left focus:border-ink-hi focus:ring-2 focus:ring-slate-200 outline-none"
                  >
                    <span>{country}</span>
                    <ChevronDown className="w-4 h-4 text-ink-lo" />
                  </button>

                  {countryOpen && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-border rounded-md shadow-lg z-30 py-1">
                      {['Australia', 'New Zealand', 'United Kingdom', 'United States'].map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => {
                            setCountry(c);
                            setCountryOpen(false);
                            persist({ country: c });
                          }}
                          className={`w-full px-4 py-2.5 text-left text-sm hover:bg-slate-50 hover:text-ink-hi ${
                            country === c ? 'font-bold text-brand bg-brand/5' : 'text-ink-hi'
                          }`}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Document Type Selection - tap a row to continue straight to that document's flow */}
                <div className="space-y-2">
                  <label className="text-[14px] font-semibold text-ink-hi flex items-center gap-1">
                    ID document type <span className="text-red-500">*</span>
                  </label>

                  <div className="space-y-3 pt-1">
                    {docOptions.map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => handleDocClick(opt.id)}
                        className="w-full h-12 px-5 rounded-md border border-[#cbd5e1] hover:border-brand bg-white hover:bg-slate-50 text-left font-semibold text-base text-ink-hi transition-all flex items-center justify-between cursor-pointer"
                      >
                        <span>{opt.label}</span>
                        <ChevronRight className="w-5 h-5 text-ink-lo" />
                      </button>
                    ))}
                  </div>
                </div>
              </Card>
            </>
          )}

          {/* Prototype Toolbar */}
          <div className="mt-8 p-3 rounded-lg border border-dashed border-border bg-surface-card space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-ink-mid flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-brand" />
                Prototype Player Recognition Sandbox:
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setPresetPlayer(returningPlayersDatabase[0])}
                className={`px-2.5 py-1.5 rounded-md font-semibold transition-colors flex items-center gap-1.5 ${
                  returningPlayer?.id === 'RET-001' && viewMode === 'reuse'
                    ? 'bg-slate-800 text-white'
                    : 'bg-white border border-border text-ink-hi hover:bg-slate-50'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5 text-teal-600" />
                <span>Sarah Jenkins (Licence match)</span>
              </button>
              <button
                type="button"
                onClick={() => setPresetPlayer(returningPlayersDatabase[1])}
                className={`px-2.5 py-1.5 rounded-md font-semibold transition-colors flex items-center gap-1.5 ${
                  returningPlayer?.id === 'RET-002' && viewMode === 'reuse'
                    ? 'bg-slate-800 text-white'
                    : 'bg-white border border-border text-ink-hi hover:bg-slate-50'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5 text-teal-600" />
                <span>David Chen (Passport match)</span>
              </button>
              <button
                type="button"
                onClick={() => setPresetPlayer(null)}
                className={`px-2.5 py-1.5 rounded-md font-semibold transition-colors ${
                  !returningPlayer
                    ? 'bg-slate-800 text-white'
                    : 'bg-white border border-border text-ink-mid hover:bg-slate-50'
                }`}
              >
                New Player (No match)
              </button>
            </div>
          </div>
      </div>

      {/* Verification History Modal */}
      {historyOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6">
          <div className="bg-surface-card border border-border rounded-xl shadow-modal max-w-xl w-full max-h-[85vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-border flex items-center justify-between">
              <h2 className="text-lg font-bold text-ink-hi">Verification history</h2>
              <button
                type="button"
                onClick={() => setHistoryOpen(false)}
                className="p-1 rounded-md text-ink-mid hover:text-ink-hi hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Filter Chips */}
            <div className="px-6 py-3 border-b border-border bg-slate-50/50 flex items-center gap-2 flex-wrap">
              {['all', 'fail', 'pass', 'skipped'].map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setHistoryFilter(f)}
                  className={`px-3 py-1 rounded-pill text-xs font-bold capitalize transition-colors ${
                    historyFilter === f
                      ? 'bg-slate-900 text-white'
                      : 'bg-white border border-border text-ink-mid hover:bg-slate-100'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              {Object.entries(groupedHistory).map(([label, rows]) => {
                const filteredRows =
                  historyFilter === 'all'
                    ? rows
                    : rows.filter((r) => r.result === historyFilter);

                if (filteredRows.length === 0) return null;
                const isCollapsed = collapsedGroups.has(label);

                return (
                  <div key={label} className="border border-border rounded-lg overflow-hidden">
                    <button
                      type="button"
                      onClick={() => toggleGroupCollapse(label)}
                      className="w-full px-4 py-3 bg-slate-50 hover:bg-slate-100/80 flex items-center justify-between text-left"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-ink-hi">
                          {label.replace(' IDV', '')}
                        </span>
                        <span className="text-[11px] text-ink-lo">
                          &bull; {rows.length} attempt{rows.length > 1 ? 's' : ''}
                        </span>
                      </div>
                      <ChevronRight
                        className={`w-4 h-4 text-ink-lo transition-transform ${
                          isCollapsed ? '' : 'rotate-90'
                        }`}
                      />
                    </button>

                    {!isCollapsed && (
                      <div className="divide-y divide-border bg-white">
                        {filteredRows.map((r, idx) => (
                          <div
                            key={idx}
                            className="px-4 py-2.5 flex items-center justify-between text-xs"
                          >
                            <span className="font-mono text-ink-mid">{r.datetime}</span>
                            <Badge
                              variant={
                                r.result === 'pass'
                                  ? 'pass'
                                  : r.result === 'fail'
                                  ? 'fail'
                                  : 'warn'
                              }
                              size="sm"
                              dot
                            >
                              {r.result}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function PrimaryIdPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-ink-mid">Loading primary ID options...</div>}>
      <PrimaryIdContent />
    </Suspense>
  );
}
