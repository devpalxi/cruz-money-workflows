'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ArrowLeft,
  CheckCircle2,
  X,
  ArrowUpRight,
  AlertCircle
} from 'lucide-react';
import AdminShell from '@/components/layout/AdminShell';
import { useWinners } from '@/lib/WinnersContext';
import {
  screenPatron,
  EXCLUSION_TYPES,
  EXCLUSION_TYPE_LABELS,
  EXCLUSION_SOURCES,
} from '@/lib/exclusionRegister';

// Payout statuses where the cash/EFT split can still be corrected -
// once a payout has actually settled (or is terminal), the split is locked.
const SPLIT_EDITABLE_STATUSES = ['Awaiting Approval', 'Pending Authorisation', 'Payment Delayed'];

const formatMoney = (val) =>
  Number(val || 0).toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function WinnerDetailView({ role = 'ADMIN', winnerId: propWinnerId }) {
  const isSuperAdmin = role === 'SUPER ADMIN';
  const params = useParams();
  const winnerId = propWinnerId || params?.id;
  const backHref = isSuperAdmin ? '/super-admin/winners' : '/admin/winners';

  const { winners, setWinners, blacklist, setBlacklist } = useWinners();

  const winner = useMemo(() => {
    if (!winners || winners.length === 0) return null;
    const cleanId = decodeURIComponent(String(winnerId || '')).toLowerCase().trim();
    if (!cleanId) return winners[0];

    return (
      winners.find((w) => {
        const idMatch = w.id && w.id.toLowerCase() === cleanId;
        const payoutMatch = w.payoutId && w.payoutId.toLowerCase() === cleanId;
        const machineIdMatch = w.machineId && w.machineId.toLowerCase() === cleanId;
        const machineNameMatch =
          w.machineName &&
          (w.machineName.toLowerCase() === cleanId ||
            cleanId.includes(w.machineName.toLowerCase()) ||
            w.machineName.toLowerCase().includes(cleanId));
        const nameMatch = w.fullName && w.fullName.toLowerCase() === cleanId;
        return idMatch || payoutMatch || machineIdMatch || machineNameMatch || nameMatch;
      }) || winners[0]
    );
  }, [winners, winnerId]);

  // The register is the single source of truth for exclusion status - a
  // winner is "blacklisted" whenever they match an active entry, the same
  // check the Collector/Approver/Authoriser screen payouts with.
  const screening = winner ? screenPatron({ name: winner.fullName, dob: winner.dob }, blacklist) : null;
  const isBlacklisted = !!screening;

  // Modal & Form State
  const [isBlacklistModalOpen, setIsBlacklistModalOpen] = useState(false);
  const [blacklistReason, setBlacklistReason] = useState('FrankieOne PEP Match');
  const [customReason, setCustomReason] = useState('');
  const [blacklistSeverity, setBlacklistSeverity] = useState('High');
  const [blacklistAlias, setBlacklistAlias] = useState('');
  const [blacklistState, setBlacklistState] = useState('NSW');
  const [blacklistExclusionType, setBlacklistExclusionType] = useState(EXCLUSION_TYPES.REGULATORY);
  const [blacklistExpiresAt, setBlacklistExpiresAt] = useState('');
  const [toastMessage, setToastMessage] = useState(null);

  // Edit disbursement split state
  const [isEditSplitOpen, setIsEditSplitOpen] = useState(false);
  const [editCash, setEditCash] = useState('');
  const [editEft, setEditEft] = useState('');
  const [editReason, setEditReason] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleOpenBlacklistModal = () => {
    if (!winner) return;
    const parts = winner.fullName.split(' ');
    setBlacklistAlias(parts[0] + ' ' + (parts[1]?.[0] ? parts[1][0] + '.' : ''));
    setBlacklistReason('FrankieOne PEP Match');
    setCustomReason('');
    setBlacklistSeverity('High');
    setBlacklistState('NSW');
    setBlacklistExclusionType(EXCLUSION_TYPES.REGULATORY);
    setBlacklistExpiresAt('');
    setIsBlacklistModalOpen(true);
  };

  const handleSaveBlacklist = (e) => {
    e.preventDefault();
    if (!winner) return;

    const finalReason = customReason.trim() ? customReason : blacklistReason;
    const newRegisterEntry = {
      id: `bl-${Date.now()}`,
      name: winner.fullName,
      alias: blacklistAlias || 'None',
      dob: winner.dob,
      state: blacklistState,
      reason: finalReason,
      severity: blacklistSeverity,
      exclusionType: blacklistExclusionType,
      // Self-exclusions come from the state register; venue-raised bans and
      // regulatory matches are recorded as this venue's own listing.
      source: blacklistExclusionType === EXCLUSION_TYPES.SELF ? EXCLUSION_SOURCES.STATE : EXCLUSION_SOURCES.VENUE,
      expiresAt: blacklistExclusionType === EXCLUSION_TYPES.SELF ? blacklistExpiresAt || null : null,
      addedDate: new Date().toLocaleDateString('en-AU', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),
      status: 'Active',
    };

    // Written into the same register the Exclusion register tab and every
    // payout screening reads, not a field on the winner record.
    setBlacklist((prev) => [newRegisterEntry, ...prev]);

    setIsBlacklistModalOpen(false);
    showToast(`Patron ${winner.fullName} has been added to the exclusion register.`);
  };

  const handleRemoveFromBlacklist = () => {
    if (!winner || !screening) return;
    if (!confirm(`Are you sure you want to remove ${winner.fullName} from the exclusion register?`)) {
      return;
    }

    setBlacklist((prev) => prev.filter((entry) => entry.id !== screening.entry.id));

    showToast(`Exclusion order for ${winner.fullName} has been lifted.`);
  };

  const isSplitEditable = winner && SPLIT_EDITABLE_STATUSES.includes(winner.payoutStatus);

  const handleOpenEditSplit = () => {
    if (!winner) return;
    setEditCash(winner.cashDisbursed.toFixed(2));
    setEditEft(winner.eftDisbursed.toFixed(2));
    setEditReason('');
    setIsEditSplitOpen(true);
  };

  const editTotal = (parseFloat(editCash) || 0) + (parseFloat(editEft) || 0);
  const editTotalMatches = winner && Math.abs(editTotal - winner.winAmount) < 0.005;
  const canSaveEditSplit = editTotalMatches && editReason.trim() !== '';

  const handleSaveEditSplit = (e) => {
    e.preventDefault();
    if (!winner || !canSaveEditSplit) return;

    const newCash = parseFloat(editCash) || 0;
    const newEft = parseFloat(editEft) || 0;
    const auditEntry = {
      id: `audit-${Date.now()}`,
      timestamp: new Date().toLocaleString('en-AU', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      admin: 'J. Chen (Venue Admin)',
      oldSplit: `$${formatMoney(winner.cashDisbursed)} cash + $${formatMoney(winner.eftDisbursed)} EFT`,
      newSplit: `$${formatMoney(newCash)} cash + $${formatMoney(newEft)} EFT`,
      reason: editReason.trim(),
    };

    setWinners((prev) =>
      prev.map((w) => {
        if (w.id === winner.id) {
          return {
            ...w,
            cashDisbursed: newCash,
            eftDisbursed: newEft,
            auditLog: [...(w.auditLog || []), auditEntry],
          };
        }
        return w;
      })
    );

    setIsEditSplitOpen(false);
    showToast(`Disbursement split updated for ${winner.fullName}.`);
  };

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

  if (!winner) {
    return (
      <AdminShell role={role}>
        <div className="py-12 text-center">
          <p className="text-[15px] font-bold text-[#102a43]">Winner record not found</p>
          <Link
            href={backHref}
            className="mt-3 inline-flex items-center gap-1.5 text-[14px] font-bold text-[#0d9488] hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to winners
          </Link>
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell role={role}>
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#102a43] text-white px-4 py-3 rounded-lg shadow-xl border border-slate-700 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-5 h-5 text-teal-400 flex-shrink-0" />
          <span className="text-[14px] font-medium">{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white ml-2 cursor-pointer bg-transparent border-none"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Breadcrumb Bar */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <Link
          href={backHref}
          className="inline-flex items-center gap-1.5 text-[14px] font-semibold text-[#0d9488] hover:text-[#0b7a6f] transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
          <span>Back to winners</span>
        </Link>
        <div className="text-[13px] font-mono text-[#64748b]">
          Record: <span className="font-semibold text-[#102a43]">{winner.id}</span> &bull; Payout:{' '}
          <Link
            href={
              winner.payoutId === 'PAY-260701'
                ? '/authoriser/dual-hit'
                : isSuperAdmin
                ? `/super-admin/payouts?search=${winner.payoutId}`
                : `/admin/dashboard?search=${winner.payoutId}`
            }
            className="text-[#0d9488] hover:text-[#0b7a6f] hover:underline font-bold"
          >
            {winner.payoutId}
          </Link>
        </div>
      </div>

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-[28px] sm:text-[30px] font-bold text-[#102a43] m-0 tracking-tight leading-tight">
              {winner.fullName}
            </h1>
            {isBlacklisted ? (
              <span className="inline-flex items-center px-3 py-0.5 rounded-full text-[12px] font-bold bg-[#fef2f2] text-[#991b1b] border border-[#fca5a5]">
                Blacklisted patron
              </span>
            ) : (
              <span className="inline-flex items-center px-3 py-0.5 rounded-full text-[12px] font-bold bg-[#ecfdf5] text-[#065f46] border border-[#a7f3d0]">
                Active standing (clear)
              </span>
            )}
            <span className={`inline-flex items-center px-3 py-0.5 rounded-full text-[12px] font-bold border ${
              (winner.payoutStatus || 'Payment Completed') === 'Payment Completed'
                ? 'bg-[#ecfdf5] text-[#065f46] border-[#6ee7b7]'
                : (winner.payoutStatus === 'Payment Delayed' || winner.payoutStatus === 'Under review')
                ? 'bg-[#fffbeb] text-[#78350f] border-[#fcd34d]'
                : 'bg-[#f8fafc] text-[#475569] border-[#cbd5e1]'
            }`}>
              {winner.payoutStatus || 'Payment Completed'}
            </span>
          </div>
          <p className="text-[14px] text-[#627d98] mt-1.5 mb-0">
            {winner.venue} &bull; {winner.winTimestamp} &bull; Member # <span className="font-mono font-medium text-[#102a43]">{winner.memberNumber}</span>
          </p>
        </div>

        {/* Header Action Button */}
        <div className="flex-shrink-0">
          {isBlacklisted ? (
            <button
              type="button"
              onClick={handleRemoveFromBlacklist}
              className="h-[38px] px-4 rounded-md text-[13.5px] font-bold bg-white text-[#991b1b] border border-[#fca5a5] hover:bg-[#fee2e2] cursor-pointer shadow-xs transition-colors"
            >
              Remove from blacklist
            </button>
          ) : (
            <button
              type="button"
              onClick={handleOpenBlacklistModal}
              className="h-[38px] px-4 rounded-md text-[13.5px] font-bold bg-[#dc2626] text-white hover:bg-[#b91c1c] cursor-pointer shadow-xs transition-colors inline-flex items-center border-none"
            >
              + Add to blacklist
            </button>
          )}
        </div>
      </div>

      {/* Main White Background Container Matching Admin Theme */}
      <section className="bg-white border border-[#d9e2ec] rounded-[10px] p-6 sm:p-7 shadow-xs">
        
        {/* Section 1: Transaction & Disbursement Details */}
        <div className="pb-4 border-b border-[#edf1f4]">
          <h2 className="text-[14px] font-bold uppercase tracking-[0.06em] text-[#0d9488] m-0 mb-2.5">
            Transaction &amp; disbursement details
          </h2>

          <div className="divide-y divide-[#f8fafc]">
            <div className="py-2.5 flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-6">
              <span className="w-full sm:w-[220px] flex-shrink-0 text-[14px] font-medium text-[#475569]">
                Total payout prize
              </span>
              <div className="flex-1 text-[14.5px] text-[#102a43] flex items-center flex-wrap gap-2.5">
                <strong className="font-mono font-bold text-[15.5px] text-[#102a43]">
                  ${winner.winAmount.toLocaleString('en-AU', { minimumFractionDigits: 2 })}
                </strong>
                <span className="font-mono text-[#475569] text-[13.5px]">
                  (${winner.cashDisbursed.toLocaleString('en-AU', { minimumFractionDigits: 2 })} cash + ${winner.eftDisbursed.toLocaleString('en-AU', { minimumFractionDigits: 2 })} EFT)
                </span>
                {isSplitEditable && (
                  <button
                    type="button"
                    onClick={handleOpenEditSplit}
                    className="text-[13px] font-semibold text-[#475569] hover:text-[#0f172a] underline bg-transparent border-none cursor-pointer p-0"
                  >
                    Edit split
                  </button>
                )}
              </div>
            </div>

            <div className="py-2.5 flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-6">
              <span className="w-full sm:w-[220px] flex-shrink-0 text-[14px] font-medium text-[#475569]">
                Payout reference ID
              </span>
              <div className="flex-1 flex items-center gap-3 flex-wrap">
                <span className="font-mono text-[14.5px] font-semibold text-[#102a43]">
                  {winner.payoutId}
                </span>
                <Link
                  href={
                    winner.payoutId === 'PAY-260701'
                      ? '/authoriser/dual-hit'
                      : isSuperAdmin
                      ? `/super-admin/payouts?search=${winner.payoutId}`
                      : `/admin/dashboard?search=${winner.payoutId}`
                  }
                  className="inline-flex items-center gap-1 text-[12px] font-bold text-[#0d9488] bg-[#f0fdfa] border border-[#99f6e4] px-2.5 py-0.5 rounded-md hover:bg-[#ccfbf1] transition-colors"
                >
                  <span>View payout record</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            <div className="py-2.5 flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-6">
              <span className="w-full sm:w-[220px] flex-shrink-0 text-[14px] font-medium text-[#475569]">
                Gaming machine terminal
              </span>
              <div className="flex-1 flex items-center gap-3 flex-wrap">
                <span className="text-[14.5px] text-[#102a43]">
                  <span className="font-mono font-semibold">{winner.machineId}</span> &bull; {winner.machineName}
                </span>
                <Link
                  href={
                    isSuperAdmin
                      ? `/super-admin/machines?search=${encodeURIComponent(winner.machineName)}`
                      : `/admin/machines?search=${encodeURIComponent(winner.machineName)}`
                  }
                  className="inline-flex items-center gap-1 text-[12px] font-bold text-[#0d9488] bg-[#f0fdfa] border border-[#99f6e4] px-2.5 py-0.5 rounded-md hover:bg-[#ccfbf1] transition-colors"
                >
                  <span>View machine in inventory</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            <div className="py-2.5 flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-6">
              <span className="w-full sm:w-[220px] flex-shrink-0 text-[14px] font-medium text-[#475569]">
                Venue branch
              </span>
              <span className="flex-1 text-[14.5px] text-[#102a43]">
                {winner.venue}
              </span>
            </div>

            <div className="py-2.5 flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-6">
              <span className="w-full sm:w-[220px] flex-shrink-0 text-[14px] font-medium text-[#475569]">
                Attending floor collector
              </span>
              <span className="flex-1 text-[14.5px] text-[#102a43]">
                <span>{winner.collector?.name || 'M. Santos'}</span>
                <span className="font-mono text-[#475569] text-[12.5px] ml-2">(ID: {winner.collector?.id || 'usr-1a2b3c'})</span>
              </span>
            </div>

            <div className="py-2.5 flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-6">
              <span className="w-full sm:w-[220px] flex-shrink-0 text-[14px] font-medium text-[#475569]">
                Disbursement policy
              </span>
              <span className="flex-1 text-[14.5px] text-[#102a43]">
                Venue policy: Cash threshold applied + Bank EFT balance
              </span>
            </div>
          </div>

          {/* Disbursement Audit History */}
          <div className="mt-4 pt-3.5 border-t border-[#edf1f4]">
            <h3 className="text-[12.5px] font-bold uppercase tracking-[0.06em] text-[#475569] m-0 mb-2">
              Disbursement audit history
            </h3>
            {(winner.auditLog || []).length === 0 ? (
              <p className="text-[13.5px] text-[#94a3b8] m-0">No changes recorded.</p>
            ) : (
              <div className="divide-y divide-[#f8fafc]">
                {[...winner.auditLog].reverse().map((entry) => (
                  <div key={entry.id} className="py-2.5 flex flex-col gap-1">
                    <div className="flex items-center justify-between flex-wrap gap-1.5">
                      <span className="text-[13.5px] font-semibold text-[#102a43]">{entry.admin}</span>
                      <span className="text-[12.5px] text-[#94a3b8]">{entry.timestamp}</span>
                    </div>
                    <div className="text-[13px] text-[#475569] font-mono">
                      {entry.oldSplit} <span className="text-[#94a3b8]">&rarr;</span> {entry.newSplit}
                    </div>
                    <div className="text-[13px] text-[#475569]">
                      Reason: {entry.reason}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Section 2: Patron Identity & Contact Details */}
        <div className="py-4 border-b border-[#edf1f4]">
          <h2 className="text-[14px] font-bold uppercase tracking-[0.06em] text-[#0d9488] m-0 mb-2.5">
            Patron identity &amp; contact
          </h2>

          <div className="divide-y divide-[#f8fafc]">
            <div className="py-2.5 flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-6">
              <span className="w-full sm:w-[220px] flex-shrink-0 text-[14px] font-medium text-[#475569]">
                Full legal name
              </span>
              <span className="flex-1 text-[14.5px] font-semibold text-[#102a43]">
                {winner.fullName}
              </span>
            </div>

            <div className="py-2.5 flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-6">
              <span className="w-full sm:w-[220px] flex-shrink-0 text-[14px] font-medium text-[#475569]">
                Membership number
              </span>
              <span className="flex-1 font-mono text-[14.5px] text-[#102a43]">
                {winner.memberNumber}
              </span>
            </div>

            <div className="py-2.5 flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-6">
              <span className="w-full sm:w-[220px] flex-shrink-0 text-[14px] font-medium text-[#475569]">
                Date of birth
              </span>
              <span className="flex-1 font-mono text-[14.5px] text-[#102a43]">
                {winner.dob}
              </span>
            </div>

            <div className="py-2.5 flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-6">
              <span className="w-full sm:w-[220px] flex-shrink-0 text-[14px] font-medium text-[#475569]">
                Identity document
              </span>
              <div className="flex-1 flex items-center gap-2 flex-wrap text-[14.5px]">
                <span className="text-[#102a43]">{winner.idvDocType}</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[11.5px] font-bold bg-[#ecfdf5] text-[#065f46] border border-[#a7f3d0]">
                  {winner.dvsResult}
                </span>
              </div>
            </div>

            <div className="py-2.5 flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-6">
              <span className="w-full sm:w-[220px] flex-shrink-0 text-[14px] font-medium text-[#475569]">
                Email address
              </span>
              <span className="flex-1 text-[14.5px] text-[#102a43]">
                {winner.email}
              </span>
            </div>

            <div className="py-2.5 flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-6">
              <span className="w-full sm:w-[220px] flex-shrink-0 text-[14px] font-medium text-[#475569]">
                Phone number
              </span>
              <span className="flex-1 font-mono text-[14.5px] text-[#102a43]">
                {winner.phone}
              </span>
            </div>

            <div className="py-2.5 flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-6">
              <span className="w-full sm:w-[220px] flex-shrink-0 text-[14px] font-medium text-[#475569]">
                Residential address
              </span>
              <span className="flex-1 text-[14.5px] text-[#102a43]">
                {winner.address}
              </span>
            </div>
          </div>
        </div>

        {/* Section 3: Banking & Settlement Details */}
        <div className="py-4 border-b border-[#edf1f4]">
          <h2 className="text-[14px] font-bold uppercase tracking-[0.06em] text-[#0d9488] m-0 mb-2.5">
            Banking &amp; settlement
          </h2>

          <div className="divide-y divide-[#f8fafc]">
            <div className="py-2.5 flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-6">
              <span className="w-full sm:w-[220px] flex-shrink-0 text-[14px] font-medium text-[#475569]">
                Payee account name
              </span>
              <div className="flex-1 text-[14.5px] text-[#102a43]">
                <strong className="font-semibold">{winner.bankDetails?.accountName || winner.fullName}</strong>
                <span className="text-[#475569] ml-2">
                  ({winner.bankDetails?.bankName || 'Westpac Banking Corporation'})
                </span>
              </div>
            </div>

            <div className="py-2.5 flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-6">
              <span className="w-full sm:w-[220px] flex-shrink-0 text-[14px] font-medium text-[#475569]">
                BSB &amp; Account number
              </span>
              <span className="flex-1 font-mono text-[14.5px] font-semibold text-[#102a43]">
                {winner.bankDetails?.bsb || '032-001'} &bull; {winner.bankDetails?.accountNumber || '123456789'}
              </span>
            </div>

            <div className="py-2.5 flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-6">
              <span className="w-full sm:w-[220px] flex-shrink-0 text-[14px] font-medium text-[#475569]">
                Confirmation of payee (CoP)
              </span>
              <div className="flex-1 flex items-center gap-2 flex-wrap text-[14.5px]">
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11.5px] font-bold border ${
                  winner.copStatus === 'Match'
                    ? 'bg-[#ecfdf5] text-[#065f46] border-[#a7f3d0]'
                    : 'bg-[#fffbeb] text-[#78350f] border-[#fde68a]'
                }`}>
                  {winner.copStatus}
                </span>
                <span className="text-[13.5px] text-[#475569]">
                  {winner.copStatus === 'Match' ? 'Provided account name matches identity documents' : 'Name requires supervisor confirmation'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Section 4: Compliance & AML Screening */}
        <div className="py-4 border-b border-[#edf1f4]">
          <h2 className="text-[14px] font-bold uppercase tracking-[0.06em] text-[#0d9488] m-0 mb-2.5">
            Compliance &amp; AML screening
          </h2>

          <div className="divide-y divide-[#f8fafc]">
            <div className="py-2.5 flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-6">
              <span className="w-full sm:w-[220px] flex-shrink-0 text-[14px] font-medium text-[#475569]">
                Government ID validation
              </span>
              <div className="flex-1 flex items-center gap-2 flex-wrap text-[14.5px]">
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11.5px] font-bold border ${getIdvBadge(winner.idvStatus)}`}>
                  {winner.idvStatus}
                </span>
                <span className="text-[13.5px] text-[#475569]">
                  Electronic identity check via FrankieOne DVS gateway
                </span>
              </div>
            </div>

            <div className="py-2.5 flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-6">
              <span className="w-full sm:w-[220px] flex-shrink-0 text-[14px] font-medium text-[#475569]">
                PEP screening
              </span>
              <div className="flex-1 flex items-center gap-2 flex-wrap text-[14.5px]">
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11.5px] font-bold border ${
                  winner.pepStatus === 'Clear'
                    ? 'bg-[#ecfdf5] text-[#065f46] border-[#a7f3d0]'
                    : 'bg-[#fef2f2] text-[#991b1b] border-[#fca5a5]'
                }`}>
                  {winner.pepStatus}
                </span>
                <span className="text-[13.5px] text-[#475569]">
                  {winner.pepStatus === 'Clear'
                    ? 'No Politically Exposed Persons match found'
                    : 'Potential PEP hit identified in compliance watchlist'}
                </span>
              </div>
            </div>

            <div className="py-2.5 flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-6">
              <span className="w-full sm:w-[220px] flex-shrink-0 text-[14px] font-medium text-[#475569]">
                Sanctions screening
              </span>
              <div className="flex-1 flex items-center gap-2 flex-wrap text-[14.5px]">
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11.5px] font-bold border ${
                  winner.sanctionsStatus === 'Clear'
                    ? 'bg-[#ecfdf5] text-[#065f46] border-[#a7f3d0]'
                    : 'bg-[#fef2f2] text-[#991b1b] border-[#fca5a5]'
                }`}>
                  {winner.sanctionsStatus}
                </span>
                <span className="text-[13.5px] text-[#475569]">
                  {winner.sanctionsStatus === 'Clear'
                    ? 'Clear across OFAC and Australian DFAT sanctions records'
                    : 'Cross-reference match flagged in compliance check'}
                </span>
              </div>
            </div>

            <div className="py-2.5 flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-6">
              <span className="w-full sm:w-[220px] flex-shrink-0 text-[14px] font-medium text-[#475569]">
                Overall compliance risk rating
              </span>
              <div className="flex-1 flex items-center gap-2 flex-wrap text-[14.5px]">
                <span className={`inline-flex items-center px-3 py-0.5 rounded-full text-[12px] font-bold border ${getRiskBadge(winner.riskRating)}`}>
                  {winner.riskRating} risk
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Section 5: Venue Exclusion & Blacklist Status */}
        <div className="pt-4">
          <h2 className="text-[14px] font-bold uppercase tracking-[0.06em] text-[#0d9488] m-0 mb-2.5">
            Venue exclusion standing
          </h2>

          {isBlacklisted && (
            <div className="p-3.5 rounded-lg border border-red-200 bg-red-50 shadow-2xs flex items-start gap-3 mb-3.5">
              <AlertCircle className="w-4 h-4 text-[#dc2626] shrink-0 mt-0.5" />
              <div>
                <div className="text-[13px] font-bold text-[#102a43]">Venue Blacklist Exclusion Order Active</div>
                <p className="text-[12px] text-[#627d98] m-0 leading-relaxed">
                  {screening?.entry?.reason || 'Patron matches venue exclusion register. Payout disbursement blocked pending supervisor clearance.'}
                </p>
              </div>
            </div>
          )}

          <div className="divide-y divide-[#f8fafc]">
            <div className="py-2.5 flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-6">
              <span className="w-full sm:w-[220px] flex-shrink-0 text-[14px] font-medium text-[#475569]">
                Exclusion standing
              </span>
              <div className="flex-1 flex items-center gap-2.5 flex-wrap text-[14.5px]">
                {isBlacklisted ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[12px] font-bold bg-[#fef2f2] text-[#991b1b] border border-[#fca5a5]">
                    Blacklisted patron
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[12px] font-bold bg-[#ecfdf5] text-[#065f46] border border-[#a7f3d0]">
                    Clear (active standing)
                  </span>
                )}
                <span className="text-[13.5px] text-[#475569]">
                  {isBlacklisted
                    ? `Reason: ${screening?.entry?.reason || 'Exclusion order'} (${EXCLUSION_TYPE_LABELS[screening?.type] || 'Exclusion'}, ${screening?.entry?.severity || 'High'} severity)`
                    : 'No active venue exclusion orders recorded. Cleared for payouts.'}
                </span>
              </div>
            </div>

            <div className="py-3 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-6">
              <span className="w-full sm:w-[220px] flex-shrink-0 text-[14px] font-medium text-[#475569]">
                Blacklist action
              </span>
              <div className="flex-1">
                {isBlacklisted ? (
                  <button
                    type="button"
                    onClick={handleRemoveFromBlacklist}
                    className="h-[36px] px-3.5 rounded-md text-[13px] font-bold bg-white text-[#991b1b] border border-[#fca5a5] hover:bg-[#fee2e2] cursor-pointer shadow-xs transition-colors"
                  >
                    Remove from blacklist
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleOpenBlacklistModal}
                    className="h-[36px] px-3.5 rounded-md text-[13px] font-bold bg-[#dc2626] text-white hover:bg-[#b91c1c] cursor-pointer shadow-xs transition-colors inline-flex items-center border-none"
                  >
                    + Add to venue blacklist
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

      </section>

      {/* ─────────────────────────────────────────────────────────── */}
      {/* ─── ADD TO BLACKLIST CONFIRMATION MODAL ─────────────────── */}
      {/* ─────────────────────────────────────────────────────────── */}
      {isBlacklistModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/65 backdrop-blur-xs flex items-center justify-center p-4" onClick={() => setIsBlacklistModalOpen(false)}>
          <div className="bg-white rounded-[12px] border border-[#d9e2ec] max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between pb-3 border-b border-[#edf1f4]">
              <div>
                <h3 className="text-[16px] font-bold text-[#102a43] m-0">
                  Add patron to venue blacklist
                </h3>
                <p className="text-[12px] text-[#64748b] mt-0.5 mb-0">
                  Enforce venue exclusion order for {winner.fullName}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsBlacklistModalOpen(false)}
                className="text-[#64748b] hover:text-[#102a43] p-1 cursor-pointer bg-transparent border-none"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Target Patron Summary */}
            <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-[8px] p-3 text-[13px]">
              <div className="text-[11px] font-bold uppercase tracking-wider text-[#64748b] mb-1">Target patron &amp; venue</div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#102a43]">{winner.fullName}</span>
                <span className="font-mono text-[#64748b]">DOB: {winner.dob}</span>
              </div>
              <div className="text-[#64748b] mt-0.5">
                Venue: <strong className="text-[#102a43]">{winner.venue}</strong>
              </div>
            </div>

            <form onSubmit={handleSaveBlacklist} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="text-[12px] font-bold text-[#64748b]">
                  Exclusion reason category <span className="text-[#dc2626]">*</span>
                </label>
                <select
                  value={blacklistReason}
                  onChange={e => setBlacklistReason(e.target.value)}
                  className="w-full h-9 px-3 border border-[#d9e2ec] rounded-md text-[13px] text-[#0f172a] bg-white outline-none focus:border-[#dc2626]"
                >
                  <option value="FrankieOne PEP Match">FrankieOne PEP Match</option>
                  <option value="FrankieOne Sanctions Match">FrankieOne Sanctions Match</option>
                  <option value="DVS Document Fraud / Invalid ID">DVS Document Fraud / Invalid ID</option>
                  <option value="Self-exclusion order (statutory)">Self-exclusion order (statutory)</option>
                  <option value="Suspicious transaction structuring">Suspicious transaction structuring</option>
                  <option value="Venue exclusion order (disciplinary)">Venue exclusion order (disciplinary)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[12px] font-bold text-[#64748b]">
                    Exclusion type <span className="text-[#dc2626]">*</span>
                  </label>
                  <select
                    value={blacklistExclusionType}
                    onChange={e => setBlacklistExclusionType(e.target.value)}
                    className="w-full h-9 px-3 border border-[#d9e2ec] rounded-md text-[13px] text-[#0f172a] bg-white outline-none focus:border-[#dc2626]"
                  >
                    {Object.values(EXCLUSION_TYPES).map((value) => (
                      <option key={value} value={value}>
                        {EXCLUSION_TYPE_LABELS[value]}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[12px] font-bold text-[#64748b]">
                    Severity level <span className="text-[#dc2626]">*</span>
                  </label>
                  <select
                    value={blacklistSeverity}
                    onChange={e => setBlacklistSeverity(e.target.value)}
                    className="w-full h-9 px-3 border border-[#d9e2ec] rounded-md text-[13px] text-[#0f172a] bg-white outline-none focus:border-[#dc2626]"
                  >
                    <option value="High">High severity</option>
                    <option value="Medium">Medium severity</option>
                    <option value="Low">Low severity</option>
                  </select>
                </div>
              </div>

              {blacklistExclusionType === EXCLUSION_TYPES.SELF && (
                <div className="space-y-1">
                  <label className="text-[12px] font-bold text-[#64748b]">
                    Exclusion expires <span className="text-[#dc2626]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={blacklistExpiresAt}
                    placeholder="e.g. 12 Jan 2027"
                    onChange={e => setBlacklistExpiresAt(e.target.value)}
                    className="w-full h-9 px-3 border border-[#d9e2ec] rounded-md text-[13px] text-[#0f172a] outline-none focus:border-[#dc2626]"
                  />
                  <p className="text-[12px] text-[#64748b] m-0">
                    This payout is held until this date. Only an Authoriser can release it sooner.
                  </p>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[12px] font-bold text-[#64748b]">
                  Jurisdiction state <span className="text-[#dc2626]">*</span>
                </label>
                <select
                  value={blacklistState}
                  onChange={e => setBlacklistState(e.target.value)}
                  className="w-full h-9 px-3 border border-[#d9e2ec] rounded-md text-[13px] text-[#0f172a] bg-white outline-none focus:border-[#dc2626]"
                >
                  <option value="NSW">NSW</option>
                  <option value="VIC">VIC</option>
                  <option value="QLD">QLD</option>
                  <option value="SA">SA</option>
                  <option value="WA">WA</option>
                  <option value="TAS">TAS</option>
                  <option value="ACT">ACT</option>
                  <option value="NT">NT</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[12px] font-bold text-[#64748b]">Known alias</label>
                <input
                  type="text"
                  value={blacklistAlias}
                  onChange={e => setBlacklistAlias(e.target.value)}
                  placeholder="e.g. Stacy K."
                  className="w-full h-9 px-3 border border-[#d9e2ec] rounded-md text-[13px] text-[#0f172a] outline-none focus:border-[#dc2626]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[12px] font-bold text-[#64748b]">
                  Audit justification notes <span className="text-[#dc2626]">*</span>
                </label>
                <textarea
                  rows={2}
                  value={customReason}
                  onChange={e => setCustomReason(e.target.value)}
                  placeholder="Required rationale for exclusion order..."
                  className="w-full p-2 border border-[#d9e2ec] rounded-md text-[13px] text-[#0f172a] outline-none focus:border-[#dc2626]"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2.5 border-t border-[#edf1f4]">
                <button
                  type="button"
                  onClick={() => setIsBlacklistModalOpen(false)}
                  className="h-[36px] px-3.5 rounded-md text-[13px] font-bold border border-[#d9e2ec] text-[#102a43] hover:bg-[#f4f7f9] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={
                    (!customReason.trim() && !blacklistReason) ||
                    (blacklistExclusionType === EXCLUSION_TYPES.SELF && !blacklistExpiresAt.trim())
                  }
                  className="h-[36px] px-4 rounded-md text-[13px] font-bold bg-[#dc2626] text-white hover:bg-[#b91c1c] cursor-pointer border-none disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Confirm &amp; add to blacklist
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────── */}
      {/* ─── EDIT DISBURSEMENT SPLIT MODAL ───────────────────────── */}
      {/* ─────────────────────────────────────────────────────────── */}
      {isEditSplitOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/65 backdrop-blur-xs flex items-center justify-center p-4" onClick={() => setIsEditSplitOpen(false)}>
          <div className="bg-white rounded-[12px] border border-[#d9e2ec] max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between pb-3 border-b border-[#edf1f4]">
              <div>
                <h3 className="text-[16px] font-bold text-[#102a43] m-0">
                  Edit disbursement split
                </h3>
                <p className="text-[12px] text-[#64748b] mt-0.5 mb-0">
                  Redistribute cash and EFT for {winner.fullName}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsEditSplitOpen(false)}
                className="text-[#64748b] hover:text-[#102a43] p-1 cursor-pointer bg-transparent border-none"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-[8px] p-3 text-[13px]">
              <div className="text-[11px] font-bold uppercase tracking-wider text-[#64748b] mb-1">Total payout prize (fixed)</div>
              <div className="font-mono font-bold text-[15px] text-[#102a43]">
                ${formatMoney(winner.winAmount)}
              </div>
            </div>

            <form onSubmit={handleSaveEditSplit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[12px] font-bold text-[#64748b]">
                    Cash amount <span className="text-[#dc2626]">*</span>
                  </label>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={editCash}
                    onChange={e => setEditCash(e.target.value)}
                    className="w-full h-9 px-3 border border-[#d9e2ec] rounded-md text-[13px] font-mono text-[#0f172a] outline-none focus:border-[#0f172a]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[12px] font-bold text-[#64748b]">
                    EFT amount <span className="text-[#dc2626]">*</span>
                  </label>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={editEft}
                    onChange={e => setEditEft(e.target.value)}
                    className="w-full h-9 px-3 border border-[#d9e2ec] rounded-md text-[13px] font-mono text-[#0f172a] outline-none focus:border-[#0f172a]"
                  />
                </div>
              </div>

              <div className={`text-[12.5px] font-medium ${editTotalMatches ? 'text-[#475569]' : 'text-[#dc2626]'}`}>
                New total: ${formatMoney(editTotal)} {editTotalMatches ? '' : `(must equal $${formatMoney(winner.winAmount)})`}
              </div>

              <div className="space-y-1">
                <label className="text-[12px] font-bold text-[#64748b]">
                  Reason for change <span className="text-[#dc2626]">*</span>
                </label>
                <textarea
                  rows={2}
                  value={editReason}
                  onChange={e => setEditReason(e.target.value)}
                  placeholder="e.g. Cash drawer short at time of payout, remainder moved to EFT"
                  className="w-full p-2 border border-[#d9e2ec] rounded-md text-[13px] text-[#0f172a] outline-none focus:border-[#0f172a]"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2.5 border-t border-[#edf1f4]">
                <button
                  type="button"
                  onClick={() => setIsEditSplitOpen(false)}
                  className="h-[36px] px-3.5 rounded-md text-[13px] font-bold border border-[#d9e2ec] text-[#102a43] hover:bg-[#f4f7f9] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!canSaveEditSplit}
                  className="h-[36px] px-4 rounded-md text-[13px] font-bold bg-[#0d9488] text-white hover:bg-[#0b7a6f] cursor-pointer border-none disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Save split
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
