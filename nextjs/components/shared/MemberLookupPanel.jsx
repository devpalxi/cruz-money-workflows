'use client';

import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  User,
  Calendar,
  AlertCircle,
  RefreshCw,
  X,
  ExternalLink,
  Lock,
  Terminal,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import StatusPill from '@/components/ui/StatusPill';
import { lookupMemberByCard, lookupMemberByNameAndDob, MOCK_CLUB_MEMBERS } from '@/lib/mockMembershipDatabase';

export default function MemberLookupPanel({
  systemName = 'Max Gaming',
  isIframe = false,
  mode,
  onModeChange,
  iframeUrl = '',
  presetMember = null,
  onSelectMember,
  onClose,
}) {
  // Mode: 'api' (Direct REST API) | 'iframe' (Embedded Terminal / Webview)
  const [lookupMode, setLookupMode] = useState(mode || (isIframe ? 'iframe' : 'api'));

  useEffect(() => {
    if (mode) {
      setLookupMode(mode);
    }
  }, [mode]);

  // Direct API States
  const [searchType, setSearchType] = useState('card'); // 'card' | 'nameDob'
  const [cardQuery, setCardQuery] = useState(presetMember ? presetMember.memberNumber : '');
  const [nameQuery, setNameQuery] = useState('');
  const [dobQuery, setDobQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [resultMember, setResultMember] = useState(presetMember || null);
  const [searchError, setSearchError] = useState('');

  // Iframe Console States
  const [iframeSelectedMember, setIframeSelectedMember] = useState(presetMember || MOCK_CLUB_MEMBERS[0]);
  const [iframeSearchTerm, setIframeSearchTerm] = useState('');

  useEffect(() => {
    if (presetMember) {
      setCardQuery(presetMember.memberNumber);
      setSearchType('card');
      setResultMember(presetMember);
      setSearchError('');
      setIframeSelectedMember(presetMember);
      setLookupMode('api');
    }
  }, [presetMember]);

  // Handle Card / Name Search in API mode
  const handleSearch = (e) => {
    if (e) e.preventDefault();
    setIsSearching(true);
    setSearchError('');

    setTimeout(() => {
      let found = null;
      if (searchType === 'card') {
        found = lookupMemberByCard(cardQuery, systemName);
      } else {
        found = lookupMemberByNameAndDob(nameQuery, dobQuery);
      }

      if (found) {
        setResultMember(found);
        setSearchError('');
      } else {
        setResultMember(null);
        setSearchError(`No member record found in ${systemName} matching "${searchType === 'card' ? cardQuery : nameQuery}".`);
      }
      setIsSearching(false);
    }, 300);
  };

  // Quick Preset Selection for easy demoing
  const applyPreset = (member) => {
    setLookupMode('api');
    setCardQuery(member.memberNumber);
    setSearchType('card');
    setResultMember(member);
    setSearchError('');
    setIframeSelectedMember(member);
  };

  // Confirm and Prefill
  const handleConfirm = () => {
    if (resultMember && onSelectMember) {
      onSelectMember(resultMember);
    }
  };

  const filteredIframeMembers = MOCK_CLUB_MEMBERS.filter((m) => {
    if (!iframeSearchTerm.trim()) return true;
    const clean = iframeSearchTerm.toLowerCase();
    return (
      m.fullName.toLowerCase().includes(clean) ||
      m.memberNumber.toLowerCase().includes(clean) ||
      m.cardBarcode.includes(clean)
    );
  });

  return (
    <div className="border border-[#e2e8f0] rounded-lg bg-white overflow-hidden animate-in fade-in">
      {/* Header Row */}
      <div className="w-full flex items-center justify-between gap-3 px-5 sm:px-6 pt-5 pb-0 flex-wrap">
        <div className="flex items-center gap-2.5 min-w-0">
          <CreditCard className="w-5 h-5 flex-shrink-0 text-[#0f172a]" />
          <span className="text-[14px] font-semibold text-[#0f172a] truncate">
            Club membership database connected ({systemName})
          </span>
        </div>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="p-1 rounded-md text-ink-mid hover:text-ink-hi hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Content Body */}
      <div className="px-5 sm:px-6 pt-4 pb-5 space-y-4 font-sans">
          {/* ───────────────────────────────────────────────────────────── */}
          {/* SCENARIO 1: DIRECT API GATEWAY                                */}
          {/* ───────────────────────────────────────────────────────────── */}
          {lookupMode === 'api' ? (
            resultMember ? (
              /* Member Details View: Approver/Authoriser Section 2 Style */
              <div className="space-y-4 animate-in fade-in">
                <div className="flex items-start justify-between gap-3">
                  <h4 className="text-[16px] sm:text-[17px] font-bold text-[#0f172a] m-0 leading-tight">
                    {resultMember.fullName}
                  </h4>

                  <StatusPill variant="pass" className="flex-shrink-0">
                    {resultMember.membershipStatus || 'Active/Financial'}
                  </StatusPill>
                </div>

                {/* Key-value rows: label column left, value left-aligned beside it */}
                <dl className="text-[14.5px]">
                  <div className="flex gap-4 py-1.5">
                    <dt className="w-[38%] shrink-0 text-[#475569] font-medium">Membership number</dt>
                    <dd className="flex-1 min-w-0 m-0 font-mono tabular-nums font-semibold text-[#0f172a]">{resultMember.memberNumber}</dd>
                  </div>
                  <div className="flex gap-4 py-1.5">
                    <dt className="w-[38%] shrink-0 text-[#475569] font-medium">Tier</dt>
                    <dd className="flex-1 min-w-0 m-0 font-semibold text-[#0f172a]">{resultMember.membershipTier}</dd>
                  </div>
                  <div className="flex gap-4 py-1.5">
                    <dt className="w-[38%] shrink-0 text-[#475569] font-medium">Date of birth</dt>
                    <dd className="flex-1 min-w-0 m-0 font-mono tabular-nums font-semibold text-[#0f172a]">{resultMember.dob}</dd>
                  </div>
                  <div className="flex gap-4 py-1.5">
                    <dt className="w-[38%] shrink-0 text-[#475569] font-medium">Contact</dt>
                    <dd className="flex-1 min-w-0 m-0 font-medium text-[#0f172a] break-words">{resultMember.email} · {resultMember.phone}</dd>
                  </div>
                  <div className="flex gap-4 py-1.5">
                    <dt className="w-[38%] shrink-0 text-[#475569] font-medium">Residential address</dt>
                    <dd className="flex-1 min-w-0 m-0 font-medium text-[#0f172a] break-words">{resultMember.address?.formatted || ''}</dd>
                  </div>
                </dl>

                {/* Prefill audit notice */}
                <div className="text-[13px] text-[#475569]">
                  Member details prefilled from {systemName} club database.
                </div>

                {/* Actions: primary confirm full-width, back to search de-emphasised below */}
                <div className="pt-1 space-y-2.5">
                  <Button
                    variant="primary"
                    size="md"
                    onClick={handleConfirm}
                    className="w-full h-12"
                  >
                    Use these details
                  </Button>
                  <button
                    type="button"
                    onClick={() => {
                      setResultMember(null);
                      setSearchError('');
                    }}
                    className="w-full text-[13px] font-semibold text-[#475569] hover:text-[#0f172a] hover:underline transition-colors cursor-pointer"
                  >
                    Search a different member or card
                  </button>
                </div>
              </div>
            ) : (
              /* Search UI when no member is selected */
              <div className="space-y-4">
                {/* Search Method Tabs */}
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => {
                      setSearchType('card');
                      setResultMember(null);
                      setSearchError('');
                    }}
                    className={`pb-2 text-sm font-bold transition-colors cursor-pointer border-b-2 ${
                      searchType === 'card'
                        ? 'border-brand text-brand'
                        : 'border-transparent text-ink-mid hover:text-ink-hi'
                    }`}
                  >
                    By card number/barcode
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSearchType('nameDob');
                      setResultMember(null);
                      setSearchError('');
                    }}
                    className={`pb-2 text-sm font-bold transition-colors cursor-pointer border-b-2 ${
                      searchType === 'nameDob'
                        ? 'border-brand text-brand'
                        : 'border-transparent text-ink-mid hover:text-ink-hi'
                    }`}
                  >
                    By name &amp; date of birth
                  </button>
                </div>

                {/* Search Input Container - inputs stacked, full-width Find member below */}
                <div className="space-y-3">
                  {searchType === 'card' ? (
                    <input
                      type="text"
                      value={cardQuery}
                      onChange={(e) => setCardQuery(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleSearch(e);
                        }
                      }}
                      placeholder="Enter member number or card barcode (e.g. MEM-10884)"
                      className="w-full h-12 px-4 rounded-md border border-border bg-white text-base font-mono text-ink-hi placeholder:font-sans placeholder:text-ink-lo outline-none focus:border-ink-hi focus:ring-2 focus:ring-slate-200 transition-all"
                    />
                  ) : (
                    <>
                      <div className="relative">
                        <User className="w-5 h-5 text-ink-lo absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={nameQuery}
                          onChange={(e) => setNameQuery(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleSearch(e);
                            }
                          }}
                          placeholder="Patron full name (e.g. Sarah Jenkins)"
                          className="w-full h-12 pl-11 pr-4 rounded-md border border-border bg-white text-base text-ink-hi placeholder:text-ink-lo outline-none focus:border-ink-hi focus:ring-2 focus:ring-slate-200 transition-all"
                        />
                      </div>
                      <div className="relative">
                        <Calendar className="w-5 h-5 text-ink-lo absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={dobQuery}
                          onChange={(e) => setDobQuery(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleSearch(e);
                            }
                          }}
                          placeholder="DD/MM/YYYY (e.g. 14/08/1988)"
                          className="w-full h-12 pl-11 pr-4 rounded-md border border-border bg-white text-base font-mono text-ink-hi placeholder:font-sans placeholder:text-ink-lo outline-none focus:border-ink-hi focus:ring-2 focus:ring-slate-200 transition-all"
                        />
                      </div>
                    </>
                  )}

                  <Button
                    type="button"
                    variant="primary"
                    size="md"
                    disabled={
                      (searchType === 'card' ? !cardQuery.trim() : !nameQuery.trim()) || isSearching
                    }
                    onClick={handleSearch}
                    icon={isSearching ? RefreshCw : undefined}
                    className={`w-full h-12 ${isSearching ? '[&_svg]:animate-spin' : ''}`}
                  >
                    {isSearching ? 'Searching...' : 'Find member'}
                  </Button>
                </div>

                {/* Search Error Message */}
                {searchError && (
                  <div className="p-3.5 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                    <span>{searchError}</span>
                  </div>
                )}
              </div>
            )
          ) : (
        /* ───────────────────────────────────────────────────────────── */
        /* SCENARIO 2: EMBEDDED IFRAME CONSOLE (LOOK-UP ONLY)            */
        /* ───────────────────────────────────────────────────────────── */
        <div className="space-y-4">
          {/* Informative Callout Banner */}
          <div className="p-3.5 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900 leading-relaxed">
            <strong className="font-bold text-amber-950">Look-up only console:</strong> External {systemName} cash-desk portal embedded for floor verification. Because this is an external third-party webpage, it is strictly for viewing and verifying patron details. No automated actions or data imports can be performed from inside this iframe.
          </div>

          {/* Simulated Iframe Terminal Viewport */}
          <div className="border border-border rounded-lg overflow-hidden bg-white shadow-xs">
            {/* Terminal Browser Window Bar */}
            <div className="flex items-center justify-between px-3.5 py-2 bg-slate-100 border-b border-border text-xs text-ink-mid">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-400 inline-block" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" />
              </div>

              <div className="flex items-center gap-1.5 bg-white px-3 py-1 rounded border border-border text-[11px] font-mono text-ink-mid">
                <Lock className="w-3 h-3 text-emerald-600" />
                <span>{iframeUrl || `https://console.${systemName.toLowerCase().replace(/\s+/g, '')}.com.au/embed/lookup?venue=riverside`}</span>
              </div>

              <a
                href={iframeUrl || '#'}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-xs font-semibold text-brand hover:underline"
              >
                <span>Full screen</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            {/* Terminal Viewport Canvas */}
            <div className="p-4 sm:p-5 bg-slate-900 text-slate-100 space-y-4">
              {/* Simulated Terminal Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-700 pb-3">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-emerald-400" />
                  <span className="font-mono text-xs font-bold text-slate-200">
                    {systemName.toUpperCase()} FLOOR TERMINAL v4.2
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                    READ-ONLY EMBED
                  </span>
                </div>
                <span className="text-[11px] font-mono text-slate-400">
                  VENUE: RIVERSIDE RSL CLUB
                </span>
              </div>

              {/* Console Search Input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={iframeSearchTerm}
                  onChange={(e) => setIframeSearchTerm(e.target.value)}
                  placeholder="Query member in terminal (name, card #, barcode)..."
                  className="flex-1 h-9 px-3 rounded bg-slate-800 border border-slate-700 font-mono text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                />
                {iframeSearchTerm && (
                  <button
                    type="button"
                    onClick={() => setIframeSearchTerm('')}
                    className="h-9 px-3 rounded bg-slate-800 border border-slate-700 text-xs text-slate-300 hover:text-white"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Terminal Members Table / List (Read-Only) */}
              <div className="space-y-2">
                <span className="text-[11px] font-mono text-slate-400 block">
                  Console Member Records ({filteredIframeMembers.length} available)
                </span>

                <div className="divide-y divide-slate-800 border border-slate-800 rounded bg-slate-950/60 max-h-52 overflow-y-auto">
                  {filteredIframeMembers.map((m) => {
                    const isSelected = iframeSelectedMember?.memberNumber === m.memberNumber;
                    return (
                      <div
                        key={m.memberNumber}
                        onClick={() => setIframeSelectedMember(m)}
                        className={`p-3 flex items-center justify-between gap-3 text-xs cursor-pointer transition-colors ${
                          isSelected ? 'bg-slate-800/90 text-white' : 'hover:bg-slate-900/60 text-slate-300'
                        }`}
                      >
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-white text-sm">{m.fullName}</span>
                            <span className="font-mono text-[11px] text-emerald-400">
                              {m.memberNumber}
                            </span>
                            <span className="text-[11px] text-slate-400">({m.membershipTier})</span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                              {m.membershipStatus}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono mt-1">
                            DOB: {m.dob} • Barcode: {m.cardBarcode} • {m.address.formatted}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Terminal Status Footer */}
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-2 border-t border-slate-800">
                <span>Console Status: SECURE READ-ONLY EMBED</span>
                <span>Third-party portal, no automated actions available</span>
              </div>
            </div>
          </div>

          {/* Cruz Money Footer Action */}
          <div className="flex items-center justify-between">
            <div className="text-xs text-ink-mid flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-ink-mid flex-shrink-0" />
              <span>Visual check only: Once verified in the external portal, close console to continue.</span>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={onClose}
            >
              Done viewing
            </Button>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
