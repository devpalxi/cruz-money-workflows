'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Filter, Download, RefreshCw, ChevronDown, Columns3 } from 'lucide-react';
import AdminShell from '@/components/layout/AdminShell';
import { initialPayouts } from '@/lib/mockData';

function formatCurrency(amount) {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: num % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(num);
}

export default function PayoutsView({ role = 'ADMIN' }) {
  const router = useRouter();
  const isSuperAdmin = role === 'SUPER ADMIN';


  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVenue, setSelectedVenue] = useState('all');
  const [filterOpen, setFilterOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // 6 filter categories
  const [selectedStatus, setSelectedStatus] = useState([]);
  const [selectedIdv, setSelectedIdv] = useState([]);
  const [selectedPep, setSelectedPep] = useState([]);
  const [selectedSanctions, setSelectedSanctions] = useState([]);
  const [selectedCop, setSelectedCop] = useState([]);
  const [selectedRisk, setSelectedRisk] = useState([]);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 20;

  // Column visibility — ID match, PEP, Sanctions, COP status are optional/hidden by default
  const [visibleCols, setVisibleCols] = useState({
    idMatch: false,
    pep: false,
    sanctions: false,
    cop: false,
  });
  const [colMenuOpen, setColMenuOpen] = useState(false);
  const colMenuRef = useRef(null);
  const colBtnRef = useRef(null);

  // Filter popup ref for outside click handling
  const filterPopupRef = useRef(null);
  const filterBtnRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        filterOpen &&
        filterPopupRef.current &&
        !filterPopupRef.current.contains(event.target) &&
        filterBtnRef.current &&
        !filterBtnRef.current.contains(event.target)
      ) {
        setFilterOpen(false);
      }
      if (
        colMenuOpen &&
        colMenuRef.current &&
        !colMenuRef.current.contains(event.target) &&
        colBtnRef.current &&
        !colBtnRef.current.contains(event.target)
      ) {
        setColMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [filterOpen, colMenuOpen]);

  // Handle URL search parameter on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const query = params.get('search');
      if (query) {
        setSearchQuery(query);
      }
    }
  }, []);

  // Venue list extracted dynamically
  const venueOptions = useMemo(() => {
    const set = new Set(initialPayouts.map((p) => p.venue));
    return ['all', ...Array.from(set)];
  }, []);

  // Filter options config
  const filterGroups = {
    status: [
      { label: 'Draft', value: 'Draft' },
      { label: 'Pending authorisation', value: 'Pending Authorisation' },
      { label: 'Awaiting', value: 'Awaiting Approval' },
      { label: 'Completed', value: 'Payment Completed' },
      { label: 'Delayed', value: 'Payment Delayed' },
      { label: 'Failed', value: 'Failed' },
      { label: 'Rejected', value: 'Rejected' },
    ],
    idv: [
      { label: 'Pass', value: 'Pass' },
      { label: 'Fail', value: 'Fail' },
      { label: 'Manual', value: 'Manual verification' },
      { label: 'None', value: 'None' },
    ],
    pep: [
      { label: 'Clear', value: 'Clear' },
      { label: 'Hit', value: 'Hit' },
      { label: 'Pending', value: 'Pending' },
      { label: 'None', value: '-' },
    ],
    sanctions: [
      { label: 'Clear', value: 'Clear' },
      { label: 'Hit', value: 'Hit' },
      { label: 'Pending', value: 'Pending' },
      { label: 'None', value: '-' },
    ],
    cop: [
      { label: 'Match', value: 'Match' },
      { label: 'Close match', value: 'Close match' },
      { label: 'No match', value: 'No match' },
      { label: 'None', value: '-' },
    ],
    risk: [
      { label: 'Low', value: 'Low' },
      { label: 'Medium', value: 'Medium' },
      { label: 'High', value: 'High' },
    ],
  };

  // Active filter count
  const activeFiltersCount =
    selectedStatus.length +
    selectedIdv.length +
    selectedPep.length +
    selectedSanctions.length +
    selectedCop.length +
    selectedRisk.length +
    (isSuperAdmin && selectedVenue !== 'all' ? 1 : 0);

  // Filtered dataset
  const filteredPayouts = useMemo(() => {
    return initialPayouts.filter((p) => {
      // Role-based venue filter for Admin vs Super Admin
      if (!isSuperAdmin && p.venue !== 'Riverside RSL Club') {
        return false;
      }
      if (isSuperAdmin && selectedVenue !== 'all' && p.venue !== selectedVenue) {
        return false;
      }

      // Search Query
      const q = searchQuery.toLowerCase().trim();
      const cleanId = String(p.id).replace(/^PAY-/, '').toLowerCase();
      const matchesSearch =
        q === '' ||
        cleanId.includes(q) ||
        p.id.toLowerCase().includes(q) ||
        p.venue.toLowerCase().includes(q) ||
        (p.accountName && p.accountName.toLowerCase().includes(q));

      // 6 Category Filters
      const matchesStatus =
        selectedStatus.length === 0 || selectedStatus.includes(p.status);
      const matchesIdv =
        selectedIdv.length === 0 ||
        selectedIdv.includes(p.idv) ||
        (selectedIdv.includes('Pass') && p.idv === 'Passed') ||
        (selectedIdv.includes('Fail') && p.idv === 'Failed') ||
        (selectedIdv.includes('Manual verification') && p.idv === 'Manual');
      const matchesPep =
        selectedPep.length === 0 || selectedPep.includes(p.pep);
      const matchesSanctions =
        selectedSanctions.length === 0 || selectedSanctions.includes(p.sanctions);
      const matchesCop =
        selectedCop.length === 0 || selectedCop.includes(p.cop);
      const matchesRisk =
        selectedRisk.length === 0 || selectedRisk.includes(p.risk);

      return (
        matchesSearch &&
        matchesStatus &&
        matchesIdv &&
        matchesPep &&
        matchesSanctions &&
        matchesCop &&
        matchesRisk
      );
    });
  }, [
    isSuperAdmin,
    selectedVenue,
    searchQuery,
    selectedStatus,
    selectedIdv,
    selectedPep,
    selectedSanctions,
    selectedCop,
    selectedRisk,
  ]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredPayouts.length / rowsPerPage) || 1;
  const paginatedPayouts = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredPayouts.slice(start, start + rowsPerPage);
  }, [filteredPayouts, currentPage, rowsPerPage]);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const clearAllFilters = () => {
    setSelectedStatus([]);
    setSelectedIdv([]);
    setSelectedPep([]);
    setSelectedSanctions([]);
    setSelectedCop([]);
    setSelectedRisk([]);
    setSelectedVenue('all');
    setSearchQuery('');
    setCurrentPage(1);
  };

  const selectAllFilters = () => {
    setSelectedStatus(filterGroups.status.map((item) => item.value));
    setSelectedIdv(filterGroups.idv.map((item) => item.value));
    setSelectedPep(filterGroups.pep.map((item) => item.value));
    setSelectedSanctions(filterGroups.sanctions.map((item) => item.value));
    setSelectedCop(filterGroups.cop.map((item) => item.value));
    setSelectedRisk(filterGroups.risk.map((item) => item.value));
    setCurrentPage(1);
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 600);
  };

  const exportCSV = () => {
    if (filteredPayouts.length === 0) return;

    const headers = [
      'PAYOUT ID',
      'CREATED',
      'VENUE',
      'ID MATCH',
      'PEP',
      'SANCTIONS',
      'COP STATUS',
      'RISK RATING',
      'AMOUNT',
      'STATUS',
    ];

    const rows = filteredPayouts.map((p) => [
      String(p.id).replace(/^PAY-/, ''),
      `"${p.created}"`,
      `"${p.venue}"`,
      `"${p.idv}"`,
      `"${p.pep}"`,
      `"${p.sanctions}"`,
      `"${p.cop}"`,
      `"${p.risk}"`,
      parseFloat(p.amount),
      `"${p.status}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `riverside_payouts_export_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ID match — text only
  const renderIdMatchPill = (idv) => {
    if (idv === 'Pass' || idv === 'Passed')
      return <span className="text-[12.5px] font-semibold text-state-pass-text whitespace-nowrap select-none">Passed</span>;
    if (idv === 'Fail' || idv === 'Failed')
      return <span className="text-[12.5px] font-semibold text-state-fail-text whitespace-nowrap select-none">Failed</span>;
    if (idv === 'Manual verification' || idv === 'Manual')
      return <span className="text-[12.5px] font-semibold text-state-warn-text whitespace-nowrap select-none">Manual</span>;
    return <span className="text-[12.5px] font-medium text-ink-lo whitespace-nowrap select-none">-</span>;
  };

  // PEP / Sanctions — text only
  const renderPepSanctionsPill = (val) => {
    if (val === 'Clear')
      return <span className="text-[12.5px] font-semibold text-state-pass-text whitespace-nowrap select-none">Clear</span>;
    if (val === 'Hit')
      return <span className="text-[12.5px] font-semibold text-state-fail-text whitespace-nowrap select-none">Hit</span>;
    if (val === 'Pending')
      return <span className="text-[12.5px] font-semibold text-state-warn-text whitespace-nowrap select-none">Pending</span>;
    return <span className="text-[12.5px] font-medium text-ink-lo whitespace-nowrap select-none">-</span>;
  };

  // COP status — text only
  const renderCopPill = (val) => {
    if (val === 'Match')
      return <span className="text-[12.5px] font-semibold text-state-pass-text whitespace-nowrap select-none">Match</span>;
    if (val === 'Close match')
      return <span className="text-[12.5px] font-semibold text-state-warn-text whitespace-nowrap select-none">Close match</span>;
    if (val === 'No match')
      return <span className="text-[12.5px] font-semibold text-state-fail-text whitespace-nowrap select-none">No match</span>;
    return <span className="text-[12.5px] font-medium text-ink-lo whitespace-nowrap select-none">-</span>;
  };

  const renderRiskBadge = (risk) => {
    if (risk === 'Low') {
      return (
        <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-[11.5px] font-bold bg-state-pass-bg text-state-pass-text border border-state-pass-border whitespace-nowrap select-none">
          Low
        </span>
      );
    }
    if (risk === 'Medium') {
      return (
        <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-[11.5px] font-bold bg-state-warn-bg text-state-warn-text border border-state-warn-border whitespace-nowrap select-none">
          Medium
        </span>
      );
    }
    return (
      <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-[11.5px] font-bold bg-state-fail-bg text-state-fail-text border border-state-fail-border whitespace-nowrap select-none">
        High
      </span>
    );
  };

  const renderStatusPill = (status) => {
    // Green tier: Completed / Paid / Settled / Authorised
    if (
      status === 'Payment Completed' ||
      status === 'Authorised' ||
      status === 'Settled' ||
      status === 'Completed' ||
      status === 'Paid'
    ) {
      return (
        <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-[11.5px] font-bold bg-state-pass-bg text-state-pass-text border border-state-pass-border whitespace-nowrap select-none">
          {status}
        </span>
      );
    }
    // Amber tier: Draft, Payment Delayed, Pending Authorisation, Awaiting Approval, Pending
    if (
      status === 'Draft' ||
      status === 'Payment Delayed' ||
      status === 'Awaiting Approval' ||
      status === 'Pending Authorisation' ||
      status === 'Pending'
    ) {
      return (
        <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-[11.5px] font-bold bg-state-warn-bg text-state-warn-text border border-state-warn-border whitespace-nowrap select-none">
          {status}
        </span>
      );
    }
    // Red tier: Failed, Rejected, Blocked
    if (status === 'Failed' || status === 'Rejected' || status === 'Blocked') {
      return (
        <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-[11.5px] font-bold bg-state-fail-bg text-state-fail-text border border-state-fail-border whitespace-nowrap select-none">
          {status}
        </span>
      );
    }
    // Neutral slate tier
    return (
      <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-[11.5px] font-bold bg-state-neutral-bg text-state-neutral-text border border-state-neutral-border whitespace-nowrap select-none">
        {status}
      </span>
    );
  };

  const toggleFilterItem = (list, setList, val) => {
    if (list.includes(val)) {
      setList(list.filter((x) => x !== val));
    } else {
      setList([...list, val]);
    }
    setCurrentPage(1);
  };

  return (
    <AdminShell role={role}>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5 mb-6">
        <div>
          <h1 className="text-[28px] font-bold text-ink-hi tracking-tight m-0 leading-tight">
            {isSuperAdmin ? 'Global payouts' : 'Payouts dashboard'}
          </h1>
          <p className="text-[14.5px] text-ink-mid mt-2 mb-0 max-w-[70ch] leading-relaxed">
            {isSuperAdmin
              ? 'Review and coordinate transaction disbursements, risk signals, and compliance checks across all venues.'
              : 'Manage, audit, and coordinate transaction disbursements across venue terminals.'}
          </p>
        </div>
      </div>

      {/* Main Table Card (Double Bezel Layout) */}
      <section className="bg-surface-card border border-border rounded-lg shadow-card relative">
        <div className="p-5">
          {/* Controls / Filter Bar */}
          <div className="flex items-center gap-2.5 flex-wrap mb-5 relative">
            {/* Filters Button */}
            <div className="relative">
              <button
                ref={filterBtnRef}
                type="button"
                onClick={() => setFilterOpen(!filterOpen)}
                className={`inline-flex items-center gap-1.5 min-h-[42px] px-3.5 border rounded-md text-[13px] font-bold transition-colors cursor-pointer
                  ${
                    filterOpen || activeFiltersCount > 0
                      ? 'bg-brand/10 text-brand border-brand'
                      : 'bg-surface-card text-ink-hi border-border hover:bg-surface-page'
                  }`}
              >
                <Filter className="w-3.5 h-3.5" />
                <span>Filters</span>
                {activeFiltersCount > 0 && (
                  <span className="w-4 h-4 rounded-full bg-brand text-white text-[10px] flex items-center justify-center font-bold">
                    {activeFiltersCount}
                  </span>
                )}
              </button>

              {/* Floating Filter Popup Menu */}
              {filterOpen && (
                <div
                  ref={filterPopupRef}
                  className="absolute left-0 top-[calc(100%+8px)] z-50 bg-surface-card border border-border rounded-lg shadow-modal p-4 w-[680px] max-w-[90vw] grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs"
                >
                  {/* Status Group */}
                  <div>
                    <div className="text-[12px] font-semibold text-ink-mid mb-2 pb-1 border-b border-border">
                      Status
                    </div>
                    <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1">
                      {filterGroups.status.map((item) => (
                        <label
                          key={item.value}
                          className="flex items-center gap-2 cursor-pointer text-[12.5px] text-ink-hi select-none"
                        >
                          <input
                            type="checkbox"
                            checked={selectedStatus.includes(item.value)}
                            onChange={() =>
                              toggleFilterItem(
                                selectedStatus,
                                setSelectedStatus,
                                item.value
                              )
                            }
                            className="rounded border-border-mid text-brand focus:ring-0 w-3.5 h-3.5 cursor-pointer"
                          />
                          <span>{item.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* ID Match Group */}
                  <div>
                    <div className="text-[12px] font-semibold text-ink-mid mb-2 pb-1 border-b border-border">
                      ID match
                    </div>
                    <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1">
                      {filterGroups.idv.map((item) => (
                        <label
                          key={item.value}
                          className="flex items-center gap-2 cursor-pointer text-[12.5px] text-ink-hi select-none"
                        >
                          <input
                            type="checkbox"
                            checked={selectedIdv.includes(item.value)}
                            onChange={() =>
                              toggleFilterItem(
                                selectedIdv,
                                setSelectedIdv,
                                item.value
                              )
                            }
                            className="rounded border-border-mid text-brand focus:ring-0 w-3.5 h-3.5 cursor-pointer"
                          />
                          <span>{item.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* PEP Group */}
                  <div>
                    <div className="text-[12px] font-semibold text-ink-mid mb-2 pb-1 border-b border-border">
                      PEP
                    </div>
                    <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1">
                      {filterGroups.pep.map((item) => (
                        <label
                          key={item.value}
                          className="flex items-center gap-2 cursor-pointer text-[12.5px] text-ink-hi select-none"
                        >
                          <input
                            type="checkbox"
                            checked={selectedPep.includes(item.value)}
                            onChange={() =>
                              toggleFilterItem(
                                selectedPep,
                                setSelectedPep,
                                item.value
                              )
                            }
                            className="rounded border-border-mid text-brand focus:ring-0 w-3.5 h-3.5 cursor-pointer"
                          />
                          <span>{item.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Sanctions Group */}
                  <div>
                    <div className="text-[12px] font-semibold text-ink-mid mb-2 pb-1 border-b border-border">
                      Sanctions
                    </div>
                    <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1">
                      {filterGroups.sanctions.map((item) => (
                        <label
                          key={item.value}
                          className="flex items-center gap-2 cursor-pointer text-[12.5px] text-ink-hi select-none"
                        >
                          <input
                            type="checkbox"
                            checked={selectedSanctions.includes(item.value)}
                            onChange={() =>
                              toggleFilterItem(
                                selectedSanctions,
                                setSelectedSanctions,
                                item.value
                              )
                            }
                            className="rounded border-border-mid text-brand focus:ring-0 w-3.5 h-3.5 cursor-pointer"
                          />
                          <span>{item.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* COP Status Group */}
                  <div>
                    <div className="text-[12px] font-semibold text-ink-mid mb-2 pb-1 border-b border-border">
                      COP status
                    </div>
                    <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1">
                      {filterGroups.cop.map((item) => (
                        <label
                          key={item.value}
                          className="flex items-center gap-2 cursor-pointer text-[12.5px] text-ink-hi select-none"
                        >
                          <input
                            type="checkbox"
                            checked={selectedCop.includes(item.value)}
                            onChange={() =>
                              toggleFilterItem(
                                selectedCop,
                                setSelectedCop,
                                item.value
                              )
                            }
                            className="rounded border-border-mid text-brand focus:ring-0 w-3.5 h-3.5 cursor-pointer"
                          />
                          <span>{item.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Risk Rating Group */}
                  <div>
                    <div className="text-[12px] font-semibold text-ink-mid mb-2 pb-1 border-b border-border">
                      Risk rating
                    </div>
                    <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1">
                      {filterGroups.risk.map((item) => (
                        <label
                          key={item.value}
                          className="flex items-center gap-2 cursor-pointer text-[12.5px] text-ink-hi select-none"
                        >
                          <input
                            type="checkbox"
                            checked={selectedRisk.includes(item.value)}
                            onChange={() =>
                              toggleFilterItem(
                                selectedRisk,
                                setSelectedRisk,
                                item.value
                              )
                            }
                            className="rounded border-border-mid text-brand focus:ring-0 w-3.5 h-3.5 cursor-pointer"
                          />
                          <span>{item.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Popup Footer */}
                  <div className="col-span-2 sm:col-span-3 pt-3 border-t border-border flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={selectAllFilters}
                      className="h-[32px] px-3.5 rounded text-[12px] font-bold text-white bg-brand hover:bg-brand-dark transition-colors cursor-pointer"
                    >
                      Select all
                    </button>
                    <button
                      type="button"
                      onClick={clearAllFilters}
                      className="h-[32px] px-3.5 rounded text-[12px] font-bold text-ink-hi bg-surface-card border border-border hover:bg-surface-page transition-colors cursor-pointer"
                    >
                      Clear
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Super Admin Venue Selector */}
            {isSuperAdmin && (
              <div className="relative min-w-[175px]">
                <select
                  value={selectedVenue}
                  onChange={(e) => {
                    setSelectedVenue(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="min-h-[42px] h-[42px] w-full appearance-none border border-border rounded-md bg-surface-card text-ink-hi pl-3 pr-8 text-[13px] font-medium outline-none focus:border-ink-hi focus:ring-2 focus:ring-slate-200"
                >
                  <option value="all">All venues</option>
                  {venueOptions
                    .filter((v) => v !== 'all')
                    .map((v) => (
                      <option key={v} value={v}>
                        {v}
                      </option>
                    ))}
                </select>
                <ChevronDown className="w-4 h-4 text-ink-mid absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            )}

            {/* Search Input */}
            <div className="relative flex-1 min-w-[180px]">
              <Search className="w-4 h-4 text-ink-mid absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search payout ID, venue..."
                className="min-h-[42px] h-[42px] w-full border border-border rounded-md bg-surface-card text-ink-hi pl-9 pr-3 text-[13px] outline-none focus:border-ink-hi focus:ring-2 focus:ring-slate-200 placeholder:text-ink-lo"
              />
            </div>

            {/* Right Action Group */}
            <div className="flex items-center gap-2.5 ml-auto flex-wrap">
              {(activeFiltersCount > 0 || searchQuery) && (
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="text-[12.5px] font-bold text-ink-mid hover:text-ink-hi transition-colors cursor-pointer bg-transparent border-0"
                >
                  Clear filters
                </button>
              )}

              <div className="hidden sm:block w-[1px] h-4 bg-border" />

              <span className="text-[12px] text-ink-mid font-medium whitespace-nowrap">
                Showing {filteredPayouts.length} results
              </span>

              {/* Columns Toggle */}
              <div className="relative">
                <button
                  ref={colBtnRef}
                  type="button"
                  onClick={() => setColMenuOpen((o) => !o)}
                  className={`inline-flex items-center gap-1.5 min-h-[36px] px-3 rounded-md text-[12.5px] font-bold border transition-colors cursor-pointer whitespace-nowrap ${
                    Object.values(visibleCols).some(Boolean)
                      ? 'bg-brand/10 text-brand border-brand'
                      : 'text-ink-hi bg-surface-card border-border hover:bg-surface-page'
                  }`}
                >
                  <Columns3 className="w-3.5 h-3.5" />
                  <span>Columns</span>
                  {Object.values(visibleCols).filter(Boolean).length > 0 && (
                    <span className="w-4 h-4 rounded-full bg-brand text-white text-[10px] flex items-center justify-center font-bold">
                      {Object.values(visibleCols).filter(Boolean).length}
                    </span>
                  )}
                </button>

                {colMenuOpen && (
                  <div
                    ref={colMenuRef}
                    className="absolute right-0 top-[calc(100%+6px)] z-50 bg-surface-card border border-border rounded-lg shadow-modal p-3 w-[190px] text-xs"
                  >
                    <div className="text-[11px] font-semibold text-ink-mid mb-2 pb-1.5 border-b border-border uppercase tracking-wide">
                      Optional columns
                    </div>
                    {[
                      { key: 'idMatch', label: 'ID match' },
                      { key: 'pep',     label: 'PEP' },
                      { key: 'sanctions', label: 'Sanctions' },
                      { key: 'cop',     label: 'COP status' },
                    ].map(({ key, label }) => (
                      <label
                        key={key}
                        className="flex items-center gap-2.5 py-1.5 cursor-pointer text-[12.5px] text-ink-hi select-none"
                      >
                        <input
                          type="checkbox"
                          checked={visibleCols[key]}
                          onChange={() =>
                            setVisibleCols((prev) => ({ ...prev, [key]: !prev[key] }))
                          }
                          className="rounded border-border-mid text-brand focus:ring-0 w-3.5 h-3.5 cursor-pointer"
                        />
                        <span>{label}</span>
                      </label>
                    ))}
                    <div className="pt-2 mt-1 border-t border-border flex gap-2">
                      <button
                        type="button"
                        onClick={() => setVisibleCols({ idMatch: true, pep: true, sanctions: true, cop: true })}
                        className="flex-1 h-[26px] rounded text-[11.5px] font-bold text-white bg-brand hover:bg-brand-dark transition-colors cursor-pointer"
                      >
                        Show all
                      </button>
                      <button
                        type="button"
                        onClick={() => setVisibleCols({ idMatch: false, pep: false, sanctions: false, cop: false })}
                        className="flex-1 h-[26px] rounded text-[11.5px] font-bold text-ink-hi bg-surface-card border border-border hover:bg-surface-page transition-colors cursor-pointer"
                      >
                        Hide all
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={exportCSV}
                className="inline-flex items-center gap-1.5 min-h-[36px] px-3 rounded-md text-[12.5px] font-bold text-ink-hi bg-surface-card border border-border hover:bg-surface-page transition-colors cursor-pointer whitespace-nowrap"
              >
                <Download className="w-3.5 h-3.5 text-ink-mid" />
                <span>Export CSV</span>
              </button>

              <button
                type="button"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="inline-flex items-center gap-1.5 min-h-[36px] px-3 rounded-md text-[12.5px] font-bold text-ink-hi bg-surface-card border border-border hover:bg-surface-page transition-colors cursor-pointer disabled:opacity-50 whitespace-nowrap"
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 text-ink-mid ${
                    isRefreshing ? 'animate-spin' : ''
                  }`}
                />
                <span>Refresh</span>
              </button>
            </div>
          </div>

          {/* 10-Column Compliance Table */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[950px] border-collapse">
              <thead>
                <tr className="border-b border-border bg-surface-th">
                  <th className="text-left px-2.5 py-3 text-ink-mid text-[11.5px] font-semibold tracking-tight whitespace-nowrap w-[55px]">
                    Payout ID
                  </th>
                  <th className="text-left px-2.5 py-3 text-ink-mid text-[11.5px] font-semibold tracking-tight whitespace-nowrap w-[145px]">
                    Created
                  </th>
                  <th className="text-left px-2.5 py-3 text-ink-mid text-[11.5px] font-semibold tracking-tight whitespace-nowrap w-[150px]">
                    Venue
                  </th>
                  {visibleCols.idMatch && (
                    <th className="text-left px-2.5 py-3 text-ink-mid text-[11.5px] font-semibold tracking-tight whitespace-nowrap w-[75px]">
                      ID match
                    </th>
                  )}
                  {visibleCols.pep && (
                    <th className="text-left px-2.5 py-3 text-ink-mid text-[11.5px] font-semibold tracking-tight whitespace-nowrap w-[65px]">
                      PEP
                    </th>
                  )}
                  {visibleCols.sanctions && (
                    <th className="text-left px-2.5 py-3 text-ink-mid text-[11.5px] font-semibold tracking-tight whitespace-nowrap w-[70px]">
                      Sanctions
                    </th>
                  )}
                  {visibleCols.cop && (
                    <th className="text-left px-2.5 py-3 text-ink-mid text-[11.5px] font-semibold tracking-tight whitespace-nowrap w-[85px]">
                      COP status
                    </th>
                  )}
                  <th className="text-left px-2.5 py-3 text-ink-mid text-[11.5px] font-semibold tracking-tight whitespace-nowrap w-[70px]">
                    Risk rating
                  </th>
                  <th className="text-right px-2.5 py-3 text-ink-mid text-[11.5px] font-semibold tracking-tight whitespace-nowrap w-[75px]">
                    Amount
                  </th>
                  <th className="text-left px-2.5 py-3 text-ink-mid text-[11.5px] font-semibold tracking-tight whitespace-nowrap w-[130px]">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {isRefreshing ? (
                  // Skeleton Loading Rows
                  Array.from({ length: 6 }).map((_, idx) => (
                    <tr key={idx} className="border-b border-border animate-pulse">
                      <td className="px-2.5 py-3 whitespace-nowrap">
                        <div className="h-4 bg-slate-200 rounded w-10" />
                      </td>
                      <td className="px-2.5 py-3 whitespace-nowrap">
                        <div className="h-4 bg-slate-200 rounded w-24" />
                      </td>
                      <td className="px-2.5 py-3 whitespace-nowrap">
                        <div className="h-4 bg-slate-200 rounded w-28" />
                      </td>
                      {visibleCols.idMatch && (
                        <td className="px-2.5 py-3 whitespace-nowrap">
                          <div className="h-4 bg-slate-200 rounded w-12" />
                        </td>
                      )}
                      {visibleCols.pep && (
                        <td className="px-2.5 py-3 whitespace-nowrap">
                          <div className="h-4 bg-slate-200 rounded w-10" />
                        </td>
                      )}
                      {visibleCols.sanctions && (
                        <td className="px-2.5 py-3 whitespace-nowrap">
                          <div className="h-4 bg-slate-200 rounded w-10" />
                        </td>
                      )}
                      {visibleCols.cop && (
                        <td className="px-2.5 py-3 whitespace-nowrap">
                          <div className="h-4 bg-slate-200 rounded w-14" />
                        </td>
                      )}
                      <td className="px-2.5 py-3 whitespace-nowrap">
                        <div className="h-5 bg-slate-200 rounded-full w-10" />
                      </td>
                      <td className="px-2.5 py-3 text-right whitespace-nowrap">
                        <div className="h-4 bg-slate-200 rounded w-14 ml-auto" />
                      </td>
                      <td className="px-2.5 py-3 whitespace-nowrap">
                        <div className="h-5 bg-slate-200 rounded-full w-20" />
                      </td>
                    </tr>
                  ))
                ) : paginatedPayouts.length > 0 ? (
                  paginatedPayouts.map((item) => {
                    const rawId = String(item.id).replace(/^PAY-/, '');
                    return (
                      <tr
                        key={item.id}
                        className="border-b border-border hover:bg-surface-hover transition-colors"
                      >
                        {/* Payout ID — tabular mono */}
                        <td className="px-2.5 py-3 font-mono font-bold text-[13px] text-ink-hi whitespace-nowrap">
                          {rawId}
                        </td>

                        {/* Created — tabular mono */}
                        <td className="px-2.5 py-3 font-mono text-[12px] text-ink-hi whitespace-nowrap">
                          {item.created}
                        </td>

                        {/* Venue — sans, prose name */}
                        <td
                          className="px-2.5 py-3 text-[12.5px] font-medium text-ink-hi whitespace-nowrap truncate max-w-[180px]"
                          title={item.venue}
                        >
                          {item.venue}
                        </td>

                        {/* ID Match */}
                        {visibleCols.idMatch && (
                          <td className="px-2.5 py-3 whitespace-nowrap">{renderIdMatchPill(item.idv)}</td>
                        )}

                        {/* PEP */}
                        {visibleCols.pep && (
                          <td className="px-2.5 py-3 whitespace-nowrap">{renderPepSanctionsPill(item.pep)}</td>
                        )}

                        {/* Sanctions */}
                        {visibleCols.sanctions && (
                          <td className="px-2.5 py-3 whitespace-nowrap">
                            {renderPepSanctionsPill(item.sanctions)}
                          </td>
                        )}

                        {/* COP Status */}
                        {visibleCols.cop && (
                          <td className="px-2.5 py-3 whitespace-nowrap">{renderCopPill(item.cop)}</td>
                        )}

                        {/* Risk Rating */}
                        <td className="px-2.5 py-3 whitespace-nowrap">{renderRiskBadge(item.risk)}</td>

                        {/* Amount — tabular mono */}
                        <td className="px-2.5 py-3 text-right font-mono text-[13px] font-bold text-ink-hi whitespace-nowrap">
                          {formatCurrency(item.amount)}
                        </td>

                        {/* Status */}
                        <td className="px-2.5 py-3 whitespace-nowrap">{renderStatusPill(item.status)}</td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan={
                        6 +
                        (visibleCols.idMatch ? 1 : 0) +
                        (visibleCols.pep ? 1 : 0) +
                        (visibleCols.sanctions ? 1 : 0) +
                        (visibleCols.cop ? 1 : 0)
                      }
                      className="text-center py-12 text-ink-mid text-[13px] font-medium whitespace-nowrap"
                    >
                      No payout transactions match your search criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Numbered Pagination Footer */}
          {totalPages > 1 && (
            <div className="pt-4 mt-2 border-t border-border flex items-center justify-center gap-1.5">
              <button
                type="button"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="h-[34px] px-3 rounded text-[12.5px] font-semibold text-ink-hi bg-surface-card border border-border hover:bg-surface-page disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors whitespace-nowrap"
              >
                &lt; Previous
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => handlePageChange(num)}
                  className={`h-[34px] min-w-[34px] px-2 rounded text-[12.5px] font-bold transition-colors cursor-pointer whitespace-nowrap
                    ${
                      currentPage === num
                        ? 'bg-brand text-white'
                        : 'bg-surface-card text-ink-hi border border-border hover:bg-surface-page'
                    }`}
                >
                  {num}
                </button>
              ))}

              <button
                type="button"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="h-[34px] px-3 rounded text-[12.5px] font-semibold text-ink-hi bg-surface-card border border-border hover:bg-surface-page disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors whitespace-nowrap"
              >
                Next &gt;
              </button>
            </div>
          )}
        </div>
      </section>
    </AdminShell>
  );
}
