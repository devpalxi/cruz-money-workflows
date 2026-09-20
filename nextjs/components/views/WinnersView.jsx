'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Search,
  Download,
  ShieldCheck,
  CheckCircle2,
  X,
  ArrowUpRight
} from 'lucide-react';
import AdminShell from '@/components/layout/AdminShell';
import ExclusionRegisterPanel from '@/components/views/ExclusionRegisterPanel';
import { initialWinners, initialBlacklist, initialVenues } from '@/lib/mockData';
import { useWinners } from '@/lib/WinnersContext';
import { screenPatron, EXCLUSION_TYPES, EXCLUSION_TYPE_LABELS } from '@/lib/exclusionRegister';

export default function WinnersView({ role = 'ADMIN', defaultVenue = 'Riverside RSL Club' }) {
  const isSuperAdmin = role === 'SUPER ADMIN';
  const router = useRouter();

  // Try to use shared WinnersContext, fallback to local state if ever mounted standalone
  let winnersContext;
  try {
    winnersContext = useWinners();
  } catch {
    winnersContext = null;
  }

  const [localWinners, setLocalWinners] = useState(initialWinners);
  const [localBlacklist, setLocalBlacklist] = useState(initialBlacklist);
  const winners = winnersContext ? winnersContext.winners : localWinners;
  const setWinners = winnersContext ? winnersContext.setWinners : setLocalWinners;
  const blacklist = winnersContext ? winnersContext.blacklist : localBlacklist;
  const setBlacklist = winnersContext ? winnersContext.setBlacklist : setLocalBlacklist;

  const [activeTab, setActiveTab] = useState('winners'); // 'winners' | 'register'

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVenue, setSelectedVenue] = useState(isSuperAdmin ? 'all' : defaultVenue);
  const [selectedRisk, setSelectedRisk] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedBlacklist, setSelectedBlacklist] = useState('all');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Whether a winner is blacklisted is worked out live against the shared
  // register (name + DOB), the same check payouts are screened with -
  // there is no separate stored flag to go stale.
  const isWinnerBlacklisted = (w) => !!screenPatron({ name: w.fullName, dob: w.dob }, blacklist);

  // Filtered Winners List
  const filteredWinners = useMemo(() => {
    return winners.filter((w) => {
      if (!isSuperAdmin && w.venue !== defaultVenue) return false;
      if (isSuperAdmin && selectedVenue !== 'all' && w.venue !== selectedVenue) return false;

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        q === '' ||
        w.fullName.toLowerCase().includes(q) ||
        w.memberNumber.toLowerCase().includes(q) ||
        w.id.toLowerCase().includes(q) ||
        w.payoutId.toLowerCase().includes(q) ||
        w.machineId.toLowerCase().includes(q) ||
        w.venue.toLowerCase().includes(q);

      const matchesRisk = selectedRisk === 'all' || w.riskRating === selectedRisk;
      const matchesStatus = selectedStatus === 'all' || w.payoutStatus === selectedStatus;
      const screening = screenPatron({ name: w.fullName, dob: w.dob }, blacklist);
      const blacklisted = !!screening;
      // Beyond "any blacklist", the filter can pick one exclusion type, so a
      // venue can pull up just its self-exclusions or just its venue bans.
      const matchesBlacklist =
        selectedBlacklist === 'all' ||
        (selectedBlacklist === 'blacklisted' && blacklisted) ||
        (selectedBlacklist === 'active' && !blacklisted) ||
        (blacklisted && screening.type === selectedBlacklist);

      return matchesSearch && matchesRisk && matchesStatus && matchesBlacklist;
    });
  }, [
    winners,
    blacklist,
    isSuperAdmin,
    defaultVenue,
    selectedVenue,
    searchQuery,
    selectedRisk,
    selectedStatus,
    selectedBlacklist,
  ]);

  const totalPages = Math.ceil(filteredWinners.length / itemsPerPage) || 1;
  const paginatedWinners = filteredWinners.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Summary Metrics
  const metrics = useMemo(() => {
    const pool = isSuperAdmin
      ? selectedVenue === 'all'
        ? winners
        : winners.filter((w) => w.venue === selectedVenue)
      : winners.filter((w) => w.venue === defaultVenue);

    const totalWinAmount = pool.reduce((sum, item) => sum + item.winAmount, 0);
    const blacklistedCount = pool.filter((w) => isWinnerBlacklisted(w)).length;
    const verifiedCount = pool.filter((w) => w.idvStatus === 'Pass').length;
    const verificationRate = pool.length > 0 ? Math.round((verifiedCount / pool.length) * 100) : 0;

    return {
      totalCount: pool.length,
      totalAmount: totalWinAmount,
      blacklistedCount,
      verificationRate,
    };
  }, [winners, blacklist, isSuperAdmin, selectedVenue, defaultVenue]);

  // Navigate to Detail Page
  const handleRowClick = (winner) => {
    const targetUrl = isSuperAdmin
      ? `/super-admin/winners/${winner.id}`
      : `/admin/winners/${winner.id}`;
    router.push(targetUrl);
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = 'Winner ID,Payout ID,Full Name,Member #,Venue,Terminal,Win Amount,Cash,EFT,Date,IDV Status,Risk,Blacklisted\n';
    const rows = filteredWinners
      .map(
        (w) =>
          `"${w.id}","${w.payoutId}","${w.fullName}","${w.memberNumber}","${w.venue}","${w.machineId}",${w.winAmount.toFixed(2)},${w.cashDisbursed.toFixed(2)},${w.eftDisbursed.toFixed(2)},"${w.winTimestamp}","${w.idvStatus}","${w.riskRating}",${isWinnerBlacklisted(w) ? 'Yes' : 'No'}`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `winners-report-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Winners dataset exported to CSV.');
  };

  // Status Badges
  const getRiskBadge = (risk) => {
    switch (risk) {
      case 'Low':
        return 'bg-[#ecfdf5] text-[#065f46] border-[#a7f3d0]';
      case 'Medium':
        return 'bg-[#fffbeb] text-[#78350f] border-[#fde68a]';
      case 'High':
        return 'bg-[#fef2f2] text-[#991b1b] border-[#fca5a5]';
      default:
        return 'bg-[#f8fafc] text-[#475569] border-[#cbd5e1]';
    }
  };

  const getIdvBadge = (status) => {
    switch (status) {
      case 'Pass':
        return 'bg-[#ecfdf5] text-[#065f46] border-[#a7f3d0]';
      case 'Manual verification':
        return 'bg-[#fffbeb] text-[#78350f] border-[#fde68a]';
      case 'Fail':
        return 'bg-[#fef2f2] text-[#991b1b] border-[#fca5a5]';
      default:
        return 'bg-[#f8fafc] text-[#475569] border-[#cbd5e1]';
    }
  };

  return (
    <AdminShell role={role}>
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#102a43] text-white px-4 py-3 rounded-lg shadow-xl border border-slate-700 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-5 h-5 text-teal-400 flex-shrink-0" />
          <span className="text-[13.5px] font-medium">{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white ml-2 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Clean Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5 mb-7">
        <div>
          <h1 className="text-[28px] font-bold text-[#102a43] tracking-tight m-0 leading-tight">
            Winners
          </h1>
          <p className="text-[14.5px] text-[#627d98] mt-2 mb-0 max-w-[68ch] leading-relaxed">
            {isSuperAdmin
              ? 'Multi-venue jackpot disbursements, identity verification audits, and venue exclusion registers.'
              : `Manage jackpot winning transactions, patron identity verification, and blacklist records for ${defaultVenue}.`}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleExportCSV}
            className="inline-flex items-center justify-center min-h-[40px] px-4 rounded-md text-[13px] font-bold text-[#102a43] bg-white border border-[#d9e2ec] hover:bg-[#f4f7f9] transition-colors cursor-pointer gap-2"
          >
            <Download className="w-4 h-4 text-[#627d98]" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Tab Switcher */}
      <nav className="flex items-center gap-7 border-b border-[#d9e2ec] mb-6" aria-label="Winners sections">
        <button
          type="button"
          onClick={() => setActiveTab('winners')}
          className={`pb-3 -mb-px text-[14px] transition-all cursor-pointer border-b-2 bg-transparent whitespace-nowrap
            ${activeTab === 'winners'
              ? 'border-[#0d9488] text-[#0d9488] font-bold'
              : 'border-transparent text-[#627d98] hover:text-[#102a43] font-semibold'}`}
        >
          Winners
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('register')}
          className={`pb-3 -mb-px text-[14px] transition-all cursor-pointer border-b-2 bg-transparent whitespace-nowrap
            ${activeTab === 'register'
              ? 'border-[#0d9488] text-[#0d9488] font-bold'
              : 'border-transparent text-[#627d98] hover:text-[#102a43] font-semibold'}`}
        >
          Blacklist
        </button>
      </nav>

      {activeTab === 'register' ? (
        <section className="bg-white border border-[#d9e2ec] rounded-[10px] overflow-hidden">
          <div className="p-5">
            <ExclusionRegisterPanel
              blacklist={blacklist}
              setBlacklist={setBlacklist}
              isSuperAdmin={isSuperAdmin}
            />
          </div>
        </section>
      ) : (
      <>
      {/* 4-Stat Metric Snapshot Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mb-6" aria-label="Winners summary">
        <div className="bg-white border border-[#d9e2ec] rounded-[10px] p-[18px]">
          <div className="text-[#627d98] text-[12px] font-bold">Total winners</div>
          <div className="mt-2 text-[26px] font-bold font-mono text-[#102a43] leading-none">
            {metrics.totalCount}
          </div>
          <div className="mt-2 text-[#627d98] text-[12px]">Recorded winning patrons</div>
        </div>

        <div className="bg-white border border-[#d9e2ec] rounded-[10px] p-[18px]">
          <div className="text-[#627d98] text-[12px] font-bold">Total disbursed</div>
          <div className="mt-2 text-[26px] font-bold font-mono text-[#102a43] leading-none">
            ${metrics.totalAmount.toLocaleString('en-AU', { minimumFractionDigits: 2 })}
          </div>
          <div className="mt-2 text-[#627d98] text-[12px]">Combined cash and EFT</div>
        </div>

        <div className="bg-white border border-[#d9e2ec] rounded-[10px] p-[18px]">
          <div className="text-[#627d98] text-[12px] font-bold">Blacklisted patrons</div>
          <div className="mt-2 text-[26px] font-bold font-mono text-[#102a43] leading-none">
            {metrics.blacklistedCount}
          </div>
          <div className="mt-2 text-[#991b1b] text-[12px] font-medium">Exclusion orders active</div>
        </div>

        <div className="bg-white border border-[#d9e2ec] rounded-[10px] p-[18px]">
          <div className="text-[#627d98] text-[12px] font-bold">IDV pass rate</div>
          <div className="mt-2 text-[26px] font-bold font-mono text-[#102a43] leading-none">
            {metrics.verificationRate}%
          </div>
          <div className="mt-2 text-[#147d64] text-[12px] font-medium">Automated DVS verified</div>
        </div>
      </section>

      {/* Main Table Section */}
      <section className="bg-white border border-[#d9e2ec] rounded-[10px] overflow-hidden">
        <div className="p-5">
          {/* Toolbar */}
          <div className="flex items-center gap-2.5 flex-wrap mb-4">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="w-4 h-4 text-[#627d98] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search by winner name, member ID, payout ID, terminal..."
                className="min-h-[40px] h-[40px] w-full border border-[#d9e2ec] rounded-[6px] bg-white text-[#102a43] pl-9 pr-3 text-[13.5px] outline-none focus:border-[#0d9488]"
              />
            </div>

            {/* Super Admin Venue Selector */}
            {isSuperAdmin && (
              <select
                value={selectedVenue}
                onChange={(e) => {
                  setSelectedVenue(e.target.value);
                  setCurrentPage(1);
                }}
                className="min-h-[40px] h-[40px] min-w-[180px] border border-[#d9e2ec] rounded-[6px] bg-white text-[#102a43] px-3 text-[13px] outline-none focus:border-[#1a6b6b]"
              >
                <option value="all">All venues</option>
                {initialVenues.map((v) => (
                  <option key={v.id} value={v.name}>
                    {v.name}
                  </option>
                ))}
              </select>
            )}

            {/* Risk Filter */}
            <select
              value={selectedRisk}
              onChange={(e) => {
                setSelectedRisk(e.target.value);
                setCurrentPage(1);
              }}
              className="min-h-[40px] h-[40px] min-w-[120px] border border-[#d9e2ec] rounded-[6px] bg-white text-[#102a43] px-3 text-[13px] outline-none focus:border-[#0d9488]"
            >
              <option value="all">All risks</option>
              <option value="Low">Low risk</option>
              <option value="Medium">Medium risk</option>
              <option value="High">High risk</option>
            </select>

            {/* Blacklist Filter */}
            <select
              value={selectedBlacklist}
              onChange={(e) => {
                setSelectedBlacklist(e.target.value);
                setCurrentPage(1);
              }}
              className="min-h-[40px] h-[40px] min-w-[150px] border border-[#d9e2ec] rounded-[6px] bg-white text-[#102a43] px-3 text-[13px] outline-none focus:border-[#0d9488]"
            >
              <option value="all">All exclusion states</option>
              <option value="active">Active (clear)</option>
              <option value="blacklisted">Any blacklist type</option>
              {Object.values(EXCLUSION_TYPES).map((type) => (
                <option key={type} value={type}>
                  {EXCLUSION_TYPE_LABELS[type]}
                </option>
              ))}
            </select>

            {/* Payout Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="min-h-[40px] h-[40px] min-w-[150px] border border-[#d9e2ec] rounded-[6px] bg-white text-[#102a43] px-3 text-[13px] outline-none focus:border-[#0d9488]"
            >
              <option value="all">All payout states</option>
              <option value="Payment Completed">Payment Completed</option>
              <option value="Awaiting Approval">Awaiting Approval</option>
              <option value="Pending Authorisation">Pending Authorisation</option>
              <option value="Failed">Failed</option>
            </select>

            <span className="text-[12px] text-[#627d98] ml-auto">
              {filteredWinners.length} winner{filteredWinners.length === 1 ? '' : 's'}
            </span>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[960px] border-collapse">
              <thead>
                <tr>
                  <th className="text-left px-4 py-3 bg-[#f8fafb] text-[#627d98] border-b border-[#d9e2ec] text-[11px] font-bold tracking-wide">
                    Payout ID
                  </th>
                  <th className="text-left px-4 py-3 bg-[#f8fafb] text-[#627d98] border-b border-[#d9e2ec] text-[11px] font-bold tracking-wide">
                    Patron / Winner
                  </th>
                  {isSuperAdmin && (
                    <th className="text-left px-4 py-3 bg-[#f8fafb] text-[#627d98] border-b border-[#d9e2ec] text-[11px] font-bold tracking-wide">
                      Venue
                    </th>
                  )}
                  <th className="text-left px-4 py-3 bg-[#f8fafb] text-[#627d98] border-b border-[#d9e2ec] text-[11px] font-bold tracking-wide">
                    EGM terminal
                  </th>
                  <th className="text-left px-4 py-3 bg-[#f8fafb] text-[#627d98] border-b border-[#d9e2ec] text-[11px] font-bold tracking-wide">
                    Win amount
                  </th>
                  <th className="text-left px-4 py-3 bg-[#f8fafb] text-[#627d98] border-b border-[#d9e2ec] text-[11px] font-bold tracking-wide">
                    IDV status
                  </th>
                  <th className="text-left px-4 py-3 bg-[#f8fafb] text-[#627d98] border-b border-[#d9e2ec] text-[11px] font-bold tracking-wide">
                    AML risk
                  </th>
                  <th className="text-left px-4 py-3 bg-[#f8fafb] text-[#627d98] border-b border-[#d9e2ec] text-[11px] font-bold tracking-wide">
                    Blacklist status
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedWinners.map((winner) => (
                  <tr
                    key={winner.id}
                    onClick={() => handleRowClick(winner)}
                    className="hover:bg-[#f0fdfa] cursor-pointer transition-colors group"
                  >
                    {/* Payout ID */}
                    <td className="px-4 py-3.5 border-b border-[#edf1f4]">
                      <span className="font-mono font-bold text-[13px] text-[#0d9488]">
                        {winner.payoutId}
                      </span>
                    </td>

                    {/* Patron Name */}
                    <td className="px-4 py-3.5 border-b border-[#edf1f4]">
                      <span className="font-bold text-[13.5px] text-[#102a43] group-hover:text-[#0d9488] transition-colors">
                        {winner.fullName}
                      </span>
                    </td>

                    {/* Venue (Super Admin) */}
                    {isSuperAdmin && (
                      <td className="px-4 py-3.5 border-b border-[#edf1f4] text-[13px] font-semibold text-[#102a43]">
                        {winner.venue}
                      </td>
                    )}

                    {/* Terminal */}
                    <td className="px-4 py-3.5 border-b border-[#edf1f4]">
                      <span className="font-mono text-[13px] font-bold text-[#102a43]">
                        {winner.machineId}
                      </span>
                    </td>

                    {/* Amount */}
                    <td className="px-4 py-3.5 border-b border-[#edf1f4] text-left">
                      <span className="font-mono text-[13.5px] font-bold text-[#102a43]">
                        ${winner.winAmount.toLocaleString('en-AU', { minimumFractionDigits: 2 })}
                      </span>
                    </td>

                    {/* IDV */}
                    <td className="px-4 py-3.5 border-b border-[#edf1f4]">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold border ${getIdvBadge(
                          winner.idvStatus
                        )}`}
                      >
                        {winner.idvStatus}
                      </span>
                    </td>

                    {/* Risk */}
                    <td className="px-4 py-3.5 border-b border-[#edf1f4]">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold border ${getRiskBadge(
                          winner.riskRating
                        )}`}
                      >
                        {winner.riskRating}
                      </span>
                    </td>

                    {/* Blacklist Status */}
                    <td className="px-4 py-3.5 border-b border-[#edf1f4]">
                      {isWinnerBlacklisted(winner) ? (
                        <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold bg-[#fef2f2] text-[#991b1b] border border-[#fca5a5]">
                          Blacklisted
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold bg-[#ecfdf5] text-[#065f46] border border-[#a7f3d0]">
                          Clear
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredWinners.length === 0 && (
            <div className="py-12 text-center text-[#627d98]">
              <p className="text-[14.5px] font-bold text-[#102a43] mb-1">No winning records found</p>
              <p className="text-[13px] m-0">Try adjusting your search criteria or clearing filters.</p>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 border-t border-[#edf1f4] mt-4 text-xs">
              <span className="text-[#627d98]">
                Page {currentPage} of {totalPages} ({filteredWinners.length} total winners)
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="px-3 py-1.5 rounded border border-[#d9e2ec] text-[#102a43] font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#f4f4f4]"
                >
                  Previous
                </button>
                <button
                  type="button"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="px-3 py-1.5 rounded border border-[#d9e2ec] text-[#102a43] font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#f4f4f4]"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </section>
      </>
      )}
    </AdminShell>
  );
}
