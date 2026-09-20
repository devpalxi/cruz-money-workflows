'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle2, X } from 'lucide-react';
import AdminShell from '@/components/layout/AdminShell';
import ReleaseDateModal from '@/components/shared/ReleaseDateModal';
import { useWinners } from '@/lib/WinnersContext';
import {
  screenPatron,
  isExclusionExpired,
  EXCLUSION_TYPES,
  EXCLUSION_TYPE_LABELS,
  EXCLUSION_SOURCES,
  formatRegisterDate,
  registerDateToIso,
  isoToRegisterDate,
  applyReleaseDateChange,
} from '@/lib/exclusionRegister';

const STATES = ['NSW', 'VIC', 'QLD', 'SA', 'WA', 'TAS', 'ACT', 'NT'];

function DetailRow({ label, children }) {
  return (
    <div className="py-2.5 flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-6">
      <span className="w-full sm:w-[220px] flex-shrink-0 text-[14px] font-medium text-[#475569]">
        {label}
      </span>
      <div className="flex-1 text-[14.5px] text-[#102a43]">{children}</div>
    </div>
  );
}

const inputClass =
  'w-full h-9 px-3 border border-[#d9e2ec] rounded-md text-[13px] text-[#0f172a] bg-white outline-none focus:border-[#0d9488]';

export default function BlacklistDetailView({ role = 'ADMIN', entryId }) {
  const isSuperAdmin = role === 'SUPER ADMIN';
  const router = useRouter();
  const base = isSuperAdmin ? '/super-admin/winners' : '/admin/winners';
  const backHref = `${base}?tab=blacklist`;

  const { winners, blacklist, setBlacklist } = useWinners();

  const entry = useMemo(
    () => blacklist.find((e) => e.id === decodeURIComponent(String(entryId || ''))) || null,
    [blacklist, entryId]
  );

  // Winner records that match this person by name and date of birth, so the
  // register entry and the payouts it affects can be reached from each other.
  const linkedWinners = useMemo(
    () => (entry ? winners.filter((w) => screenPatron({ name: w.fullName, dob: w.dob }, [entry])) : []),
    [winners, entry]
  );

  const [toast, setToast] = useState(null);
  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const [isReleaseOpen, setIsReleaseOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [form, setForm] = useState({});

  const changedBy = isSuperAdmin ? 'J. Chen (Super Admin)' : 'J. Chen (Venue Admin)';

  if (!entry) {
    return (
      <AdminShell role={role}>
        <div className="py-12 text-center">
          <p className="text-[15px] font-bold text-[#102a43]">Blacklist record not found</p>
          <p className="text-[13.5px] text-[#627d98] mt-1">It may have been removed from the blacklist.</p>
          <Link
            href={backHref}
            className="mt-3 inline-flex items-center gap-1.5 text-[14px] font-bold text-[#0d9488] hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to blacklist
          </Link>
        </div>
      </AdminShell>
    );
  }

  const isSelf = entry.exclusionType === EXCLUSION_TYPES.SELF;
  const expired = isExclusionExpired(entry);

  const openEdit = () => {
    setForm({
      name: entry.name,
      alias: entry.alias === 'None' ? '' : entry.alias,
      dob: entry.dob,
      state: entry.state,
      exclusionType: entry.exclusionType,
      source: entry.source,
      severity: entry.severity,
      reason: entry.reason,
      expiresAt: registerDateToIso(entry.expiresAt),
    });
    setIsEditOpen(true);
  };

  const setField = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSaveEdit = (e) => {
    e.preventDefault();
    const nowSelf = form.exclusionType === EXCLUSION_TYPES.SELF;
    setBlacklist((prev) =>
      prev.map((item) =>
        item.id === entry.id
          ? {
              ...item,
              name: form.name.trim(),
              alias: form.alias.trim() || 'None',
              dob: form.dob.trim(),
              state: form.state,
              exclusionType: form.exclusionType,
              source: form.source,
              severity: form.severity,
              reason: form.reason.trim(),
              // Only a self-exclusion runs to a date; the others stay until
              // lifted, so switching type drops any date left behind.
              expiresAt: nowSelf ? isoToRegisterDate(form.expiresAt) : null,
            }
          : item
      )
    );
    setIsEditOpen(false);
    showToast('Blacklist details updated.');
  };

  const handleSaveReleaseDate = (newIso, reason) => {
    const updated = applyReleaseDateChange(entry, newIso, reason, changedBy);
    setBlacklist((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
    setIsReleaseOpen(false);
    showToast(`Release date changed to ${formatRegisterDate(updated.expiresAt)}.`);
  };

  const handleRemove = () => {
    if (!confirm(`Are you sure you want to remove ${entry.name} from the blacklist?`)) return;
    setBlacklist((prev) => prev.filter((item) => item.id !== entry.id));
    router.push(backHref);
  };

  const formValid =
    form.name?.trim() &&
    form.dob?.trim() &&
    form.reason?.trim() &&
    (form.exclusionType !== EXCLUSION_TYPES.SELF || form.expiresAt);

  return (
    <AdminShell role={role}>
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#102a43] text-white px-4 py-3 rounded-lg shadow-xl border border-slate-700 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-teal-400 flex-shrink-0" />
          <span className="text-[14px] font-medium">{toast}</span>
          <button
            onClick={() => setToast(null)}
            className="text-slate-400 hover:text-white ml-2 cursor-pointer bg-transparent border-none"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="mb-4">
        <Link
          href={backHref}
          className="inline-flex items-center gap-1.5 text-[14px] font-semibold text-[#0d9488] hover:text-[#0b7a6f] transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
          <span>Back to blacklist</span>
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-[28px] sm:text-[30px] font-bold text-[#102a43] m-0 tracking-tight leading-tight">
              {entry.name}
            </h1>
            <span
              className={`inline-flex items-center px-3 py-0.5 rounded-full text-[12px] font-bold border whitespace-nowrap ${
                isSelf
                  ? 'bg-[#fef2f2] text-[#991b1b] border-[#fca5a5]'
                  : 'bg-[#f1f5f9] text-[#334155] border-[#cbd5e1]'
              }`}
            >
              {EXCLUSION_TYPE_LABELS[entry.exclusionType] || 'Exclusion'}
            </span>
            <span className="inline-flex items-center px-3 py-0.5 rounded-full text-[12px] font-bold bg-[#ecfdf5] text-[#065f46] border border-[#a7f3d0]">
              {entry.status}
            </span>
          </div>
          <p className="text-[14px] text-[#627d98] mt-1.5 mb-0">
            <span className="font-mono">{entry.id}</span> &bull; Added {entry.addedDate} &bull; {entry.source || 'Venue list'}
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-shrink-0 flex-wrap">
          <button
            type="button"
            onClick={openEdit}
            className="h-[38px] px-4 rounded-md text-[13.5px] font-bold bg-white text-[#102a43] border border-[#d9e2ec] hover:bg-[#f4f7f9] cursor-pointer shadow-xs transition-colors"
          >
            Edit details
          </button>
          <button
            type="button"
            onClick={handleRemove}
            className="h-[38px] px-4 rounded-md text-[13.5px] font-bold bg-white text-[#991b1b] border border-[#fca5a5] hover:bg-[#fee2e2] cursor-pointer shadow-xs transition-colors"
          >
            Remove from blacklist
          </button>
        </div>
      </div>

      <section className="bg-white border border-[#d9e2ec] rounded-[10px] p-6 sm:p-7 shadow-xs">
        <div className="pb-4 border-b border-[#edf1f4]">
          <h2 className="text-[14px] font-bold uppercase tracking-[0.06em] text-[#0d9488] m-0 mb-2.5">
            Patron details
          </h2>
          <div className="divide-y divide-[#f8fafc]">
            <DetailRow label="Full legal name">
              <span className="font-bold">{entry.name}</span>
            </DetailRow>
            <DetailRow label="Known alias">{entry.alias || 'None'}</DetailRow>
            <DetailRow label="Date of birth">
              <span className="font-mono">{entry.dob}</span>
            </DetailRow>
            <DetailRow label="Jurisdiction">{entry.state}</DetailRow>
          </div>
        </div>

        <div className="py-4 border-b border-[#edf1f4]">
          <h2 className="text-[14px] font-bold uppercase tracking-[0.06em] text-[#0d9488] m-0 mb-2.5">
            Exclusion details
          </h2>
          <div className="divide-y divide-[#f8fafc]">
            <DetailRow label="Exclusion type">{EXCLUSION_TYPE_LABELS[entry.exclusionType] || 'Exclusion'}</DetailRow>
            <DetailRow label="Source">{entry.source || 'Venue list'}</DetailRow>
            <DetailRow label="Severity">
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[12px] font-bold border ${
                  entry.severity === 'High'
                    ? 'bg-[#fef2f2] text-[#991b1b] border-[#fca5a5]'
                    : entry.severity === 'Medium'
                    ? 'bg-[#fffbeb] text-[#78350f] border-[#fcd34d]'
                    : 'bg-[#ecfdf5] text-[#065f46] border-[#6ee7b7]'
                }`}
              >
                {entry.severity}
              </span>
            </DetailRow>
            <DetailRow label="Reason">{entry.reason}</DetailRow>

            {isSelf ? (
              <DetailRow label="Funds release date">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="font-mono font-bold">
                    {entry.expiresAt ? formatRegisterDate(entry.expiresAt) : 'Not set'}
                  </span>
                  {expired && (
                    <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[12px] font-bold bg-[#fffbeb] text-[#78350f] border border-[#fde68a]">
                      Expired
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => setIsReleaseOpen(true)}
                    className="h-[36px] px-3.5 rounded-md text-[13px] font-bold bg-white text-[#102a43] border border-[#d9e2ec] hover:bg-[#f4f7f9] cursor-pointer shadow-xs transition-colors"
                  >
                    Change release date
                  </button>
                </div>
              </DetailRow>
            ) : (
              <DetailRow label="Expires">
                <span className="text-[#627d98]">Indefinite - stays until it is lifted</span>
              </DetailRow>
            )}
          </div>
        </div>

        {isSelf && entry.releaseDateHistory?.length > 0 && (
          <div className="py-4 border-b border-[#edf1f4]">
            <h2 className="text-[14px] font-bold uppercase tracking-[0.06em] text-[#0d9488] m-0 mb-2.5">
              Release date history
            </h2>
            <ul className="m-0 p-0 list-none divide-y divide-[#f1f5f9]">
              {[...entry.releaseDateHistory].reverse().map((change) => (
                <li key={change.id} className="py-2.5 first:pt-0 text-[13.5px] text-[#475569]">
                  <div className="text-[#102a43] font-semibold">
                    <span className="font-mono">
                      {change.oldDate ? formatRegisterDate(change.oldDate) : 'Not set'}
                    </span>{' '}
                    &rarr; <span className="font-mono">{formatRegisterDate(change.newDate)}</span>
                  </div>
                  <div>{change.reason}</div>
                  <div className="text-[12.5px] text-[#64748b]">
                    {change.changedBy} &middot; {change.timestamp}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="pt-4">
          <h2 className="text-[14px] font-bold uppercase tracking-[0.06em] text-[#0d9488] m-0 mb-2.5">
            Linked winner records
          </h2>
          {linkedWinners.length === 0 ? (
            <p className="text-[13.5px] text-[#627d98] m-0">
              No winner records match this person yet. They will appear here if they win a payout.
            </p>
          ) : (
            <ul className="m-0 p-0 list-none divide-y divide-[#f1f5f9]">
              {linkedWinners.map((w) => (
                <li key={w.id} className="py-2.5 flex items-baseline justify-between gap-4 flex-wrap">
                  <Link
                    href={`${base}/${w.id}`}
                    className="text-[14px] font-bold text-[#0d9488] hover:underline"
                  >
                    {w.payoutId}
                  </Link>
                  <span className="text-[13.5px] text-[#475569]">
                    {w.venue} &bull; {w.winTimestamp}
                  </span>
                  <span className="font-mono text-[13.5px] font-bold text-[#102a43]">
                    ${w.winAmount.toLocaleString('en-AU', { minimumFractionDigits: 2 })}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {isReleaseOpen && (
        <ReleaseDateModal
          entry={entry}
          patronName={entry.name}
          onSave={handleSaveReleaseDate}
          onClose={() => setIsReleaseOpen(false)}
        />
      )}

      {isEditOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/65 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setIsEditOpen(false)}
        >
          <div
            className="bg-white rounded-[12px] border border-[#d9e2ec] max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#edf1f4]">
              <h3 className="text-[16px] font-bold text-[#102a43] m-0">Edit blacklist details</h3>
              <button
                type="button"
                onClick={() => setIsEditOpen(false)}
                className="text-[#64748b] hover:text-[#102a43] p-1 cursor-pointer bg-transparent border-none"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="text-[12px] font-bold text-[#64748b]">Full legal name *</label>
                <input required className={inputClass} value={form.name} onChange={setField('name')} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[12px] font-bold text-[#64748b]">Known alias</label>
                  <input className={inputClass} value={form.alias} onChange={setField('alias')} />
                </div>
                <div className="space-y-1">
                  <label className="text-[12px] font-bold text-[#64748b]">Date of birth *</label>
                  <input
                    required
                    className={`${inputClass} font-mono`}
                    value={form.dob}
                    placeholder="DD/MM/YYYY"
                    pattern="\d{2}/\d{2}/\d{4}"
                    title="Use DD/MM/YYYY"
                    onChange={setField('dob')}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[12px] font-bold text-[#64748b]">Exclusion type *</label>
                  <select className={inputClass} value={form.exclusionType} onChange={setField('exclusionType')}>
                    {Object.values(EXCLUSION_TYPES).map((value) => (
                      <option key={value} value={value}>
                        {EXCLUSION_TYPE_LABELS[value]}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[12px] font-bold text-[#64748b]">Source *</label>
                  <select className={inputClass} value={form.source} onChange={setField('source')}>
                    {Object.values(EXCLUSION_SOURCES).map((value) => (
                      <option key={value} value={value}>
                        {value}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {form.exclusionType === EXCLUSION_TYPES.SELF && (
                <div className="space-y-1">
                  <label className="text-[12px] font-bold text-[#64748b]">Funds release date *</label>
                  <input
                    type="date"
                    required
                    className={inputClass}
                    value={form.expiresAt}
                    onChange={setField('expiresAt')}
                  />
                  <p className="text-[12px] text-[#64748b] m-0">
                    To change an existing date with a recorded reason, close this and use Change release date.
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[12px] font-bold text-[#64748b]">Severity *</label>
                  <select className={inputClass} value={form.severity} onChange={setField('severity')}>
                    <option value="High">High severity</option>
                    <option value="Medium">Medium severity</option>
                    <option value="Low">Low severity</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[12px] font-bold text-[#64748b]">Jurisdiction state *</label>
                  <select className={inputClass} value={form.state} onChange={setField('state')}>
                    {STATES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[12px] font-bold text-[#64748b]">Exclusion reason *</label>
                <textarea
                  rows={2}
                  required
                  value={form.reason}
                  onChange={setField('reason')}
                  className="w-full p-2 border border-[#d9e2ec] rounded-md text-[13px] text-[#0f172a] outline-none focus:border-[#0d9488]"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2.5 border-t border-[#edf1f4]">
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  className="h-[36px] px-3.5 rounded-md text-[13px] font-bold border border-[#d9e2ec] text-[#102a43] hover:bg-[#f4f7f9] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!formValid}
                  className="h-[36px] px-4 rounded-md text-[13px] font-bold bg-[#0d9488] text-white hover:bg-[#0b7a6f] cursor-pointer border-none disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Save changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
