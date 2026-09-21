'use client';

import React, { useState, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Search,
  Plus,
  Building2,
  CheckCircle2,
  AlertCircle,
  X,
  Users,
  Cpu,
  Check
} from 'lucide-react';
import AdminShell from '@/components/layout/AdminShell';
import SegmentedBooleanToggle from '@/components/ui/SegmentedBooleanToggle';
import VenueSettingsView from '@/components/views/VenueSettingsView';
import { normaliseStatementRef, validateStatementRef, buildStatementDescription, STATEMENT_REF_MIN, STATEMENT_REF_MAX } from '@/lib/statementReference';
import { saveVenueComplianceCapture } from '@/lib/venueCompliance';
import { initialVenues, initialClients, initialUsers, initialMachines } from '@/lib/mockData';

function SuperAdminVenuesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const venueId = searchParams.get('id');
  const mode = searchParams.get('mode');

  const isListing = !venueId && mode !== 'create';
  const isCreate = mode === 'create';
  const isDetail = Boolean(venueId) && !isCreate;

  // Search state for listing
  const [searchQuery, setSearchQuery] = useState('');
  const [venuesList, setVenuesList] = useState(initialVenues);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Helper: Client Name Lookup
  const getClientName = (cId) => {
    const matched = initialClients.find((c) => c.id === cId);
    return matched ? matched.name : 'Riverside Leagues Ltd';
  };

  // Filtered venues for listing
  const filteredVenues = useMemo(() => {
    if (!searchQuery.trim()) return venuesList;
    const q = searchQuery.toLowerCase();
    return venuesList.filter((v) => {
      const orgName = getClientName(v.clientId).toLowerCase();
      const vName = (v.name || '').toLowerCase();
      const vStatus = (v.status || '').toLowerCase();
      return vName.includes(q) || orgName.includes(q) || vStatus.includes(q);
    });
  }, [venuesList, searchQuery]);

  // Status Badge Component for Directory
  const renderStatusBadge = (status) => {
    const st = (status || 'Active').toLowerCase();
    if (st === 'active') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#ecfdf5] text-[#065f46] border border-[#a7f3d0]">
          Active
        </span>
      );
    }
    if (st === 'draft' || st === 'pending') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#fffbeb] text-[#78350f] border border-[#fde68a]">
          Draft
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#fef2f2] text-[#991b1b] border border-[#fca5a5]">
        Inactive
      </span>
    );
  };

  // State for Add Venue form (mode=create)
  const [createForm, setCreateForm] = useState({
    name: '',
    shortName: '',
    statementReference: '',
    clientId: initialClients[0]?.id || 'client-riverside',
    venueEmail: 'admin@riversidersl.com.au',
    abn: '55 123 456 789',
    venueAddress: '102 Riverside Drive, Parramatta NSW 2150',
    contactName: 'Jonathan Chen',
    contactEmail: 'j.chen@riversidersl.com.au',
    contactPhone: '+61 2 9876 5432',
    approvers: 2,
    dailyLimit: 30000,
    minWaitTime: 24,
    delayUnresolvedPaymentItems: 30,
    maxPerTransaction: 5000,
    skipIdThreshold: 500,
    noEFTLimit: 500,
    idvEnabled: true,
    skipIdEnabled: true,
    suspiciousAnalysisEnabled: true,
    allowNoEFTPayout: false,
    disbursementMethods: ['cash', 'bank_transfer'],
    clientNotificationPolicy: 'default',
    status: 'Draft'
  });

  const [createDisbursementError, setCreateDisbursementError] = useState('');

  const handleToggleCreateDisbursement = (method) => {
    const current = [...createForm.disbursementMethods];
    let next;
    if (current.includes(method)) {
      next = current.filter((m) => m !== method);
    } else {
      next = [...current, method];
    }

    if (next.includes('bank_transfer') && next.includes('cheque')) {
      setCreateDisbursementError('Bank transfer and cheque cannot be enabled together.');
      return;
    }
    if (next.length === 0) {
      setCreateDisbursementError('At least one disbursement method must be enabled.');
      return;
    }

    setCreateDisbursementError('');
    setCreateForm({ ...createForm, disbursementMethods: next });
  };

  const handleCreateVenueSubmit = (e) => {
    e.preventDefault();
    if (!createForm.name.trim()) {
      showToast('Please enter a venue legal name.');
      return;
    }

    const newVenueId = `venue-${Date.now()}`;
    const statementRefError = validateStatementRef(createForm.statementReference, newVenueId);
    if (statementRefError) {
      showToast(statementRefError);
      return;
    }

    if (createForm.disbursementMethods.includes('bank_transfer') && createForm.disbursementMethods.includes('cheque')) {
      setCreateDisbursementError('Bank transfer and cheque cannot be enabled together.');
      return;
    }

    const newVenue = {
      id: newVenueId,
      clientId: createForm.clientId,
      name: createForm.name.trim(),
      shortName: createForm.shortName.trim() || createForm.name.trim().slice(0, 20),
      status: 'Active',
      IdentityVerifiedEnabled: createForm.idvEnabled,
      transactions: 0,
      volume: 0,
      lastActivity: 'Just now',
      dailyLimit: Number(createForm.dailyLimit),
      minWaitTime: Number(createForm.minWaitTime),
      delayUnresolvedPaymentItems: Number(createForm.delayUnresolvedPaymentItems),
      disbursementMethods: createForm.disbursementMethods,
      machines: 0,
      users: 1
    };

    saveVenueComplianceCapture(newVenueId, { statementReference: createForm.statementReference });
    setVenuesList([newVenue, ...venuesList]);
    showToast('Venue record created successfully.');
    setTimeout(() => router.push(`/super-admin/venue?id=${newVenueId}`), 500);
  };

  // =========================================================================
  // VIEW 2: VENUE SETTINGS & CONFIGURATION WORKSPACE (WHEN ID IS PROVIDED)
  // =========================================================================
  if (isDetail) {
    return (
      <VenueSettingsView
        role="SUPER ADMIN"
        venueId={venueId}
        onBack={() => router.push('/super-admin/venue')}
      />
    );
  }

  return (
    <AdminShell role="SUPER ADMIN">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0f172a] text-white px-4 py-3 rounded-lg shadow-xl border border-slate-700 flex items-center gap-3 text-sm font-medium animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-[#14b8a6] shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 1: ALL VENUES DIRECTORY LISTING (DEFAULT)                           */}
      {/* ========================================================================= */}
      {isListing && (
        <div className="max-w-[1200px] mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-[#0f172a] tracking-tight">All Venues</h1>
              <p className="text-sm text-[#475569] mt-1">
                Command centre for all venues across the system.
              </p>
            </div>
            <button
              type="button"
              onClick={() => router.push('/super-admin/venue?mode=create')}
              className="inline-flex items-center justify-center gap-2 h-[44px] px-5 rounded-md bg-[#0d9488] hover:bg-[#0b7a6f] text-white text-[15px] font-bold shadow-xs transition-colors cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>New venue</span>
            </button>
          </div>

          {/* Search Toolbar */}
          <div className="flex items-center gap-3 mb-5">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748b]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search venues..."
                className="w-full h-[44px] pl-10 pr-4 bg-white border border-[#e2e8f0] rounded-md text-[14.5px] text-[#0f172a] placeholder-[#94a3b8] focus:border-[#0d9488] focus:ring-1 focus:ring-[#0d9488] outline-none transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Venues Table Card */}
          <div className="bg-white border border-[#e2e8f0] rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="bg-[#fafbfc] border-b border-[#e2e8f0]">
                    <th className="py-3.5 px-5 text-[12px] font-bold text-[#475569] uppercase tracking-wider">
                      Venue
                    </th>
                    <th className="py-3.5 px-4 text-[12px] font-bold text-[#475569] uppercase tracking-wider text-center">
                      Status
                    </th>
                    <th className="py-3.5 px-4 text-[12px] font-bold text-[#475569] uppercase tracking-wider text-center">
                      Transactions
                    </th>
                    <th className="py-3.5 px-4 text-[12px] font-bold text-[#475569] uppercase tracking-wider text-center">
                      Total volume
                    </th>
                    <th className="py-3.5 px-5 text-[12px] font-bold text-[#475569] uppercase tracking-wider text-center">
                      Last activity
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e2e8f0]">
                  {filteredVenues.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-sm text-[#64748b]">
                        No venues match your search.
                      </td>
                    </tr>
                  ) : (
                    filteredVenues.map((venue) => {
                      const orgName = getClientName(venue.clientId);
                      return (
                        <tr
                          key={venue.id}
                          onClick={() => router.push(`/super-admin/venue?id=${venue.id}`)}
                          className="hover:bg-[#f0fdfa] cursor-pointer transition-colors duration-150"
                        >
                          {/* Venue Name & Org */}
                          <td className="py-4 px-5 align-middle">
                            <div className="font-bold text-[14.5px] text-[#0f172a]">
                              {venue.name}
                            </div>
                            <div className="text-xs text-[#64748b] mt-0.5 font-normal">
                              {orgName}
                            </div>
                          </td>

                          {/* Status */}
                          <td className="py-4 px-4 align-middle text-center">
                            {renderStatusBadge(venue.status)}
                          </td>

                          {/* Transactions */}
                          <td className="py-4 px-4 align-middle text-center font-mono tabular-nums text-[14px] text-slate-700">
                            {venue.transactions ?? 0}
                          </td>

                          {/* Total Volume */}
                          <td className="py-4 px-4 align-middle text-center font-mono tabular-nums text-[14px] font-semibold text-slate-800">
                            ${Number(venue.volume || 0).toLocaleString()}
                          </td>

                          {/* Last Activity */}
                          <td className="py-4 px-5 align-middle text-center text-[13.5px] text-slate-600">
                            {venue.lastActivity || '—'}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 3: ADD VENUE ONBOARDING WORKSPACE (WHEN MODE === 'CREATE')           */}
      {/* ========================================================================= */}
      {isCreate && (
        <div className="max-w-[1080px] mx-auto pb-12">
          {/* Back Button */}
          <button
            type="button"
            onClick={() => router.push('/super-admin/venue')}
            className="inline-flex items-center gap-1.5 text-[13px] font-bold text-[#0d9488] hover:text-[#0b7a6f] mb-3.5 cursor-pointer transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>All venues</span>
          </button>

          {/* Page Head */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl sm:text-[28px] font-bold text-[#0f172a] tracking-tight">
                New venue onboarding
              </h1>
              <p className="text-sm text-[#475569] mt-1">
                Create the venue record, configure operational payout rules, and link organisation relationships.
              </p>
              <div className="flex items-center gap-3 mt-2.5">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#fffbeb] text-[#78350f] border border-[#fde68a]">
                  Draft
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2.5 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => router.push('/super-admin/venue')}
                className="h-[38px] px-4 rounded-md border border-[#cbd5e1] bg-white hover:bg-slate-50 text-[#475569] text-[13.5px] font-bold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreateVenueSubmit}
                className="h-[38px] px-5 rounded-md bg-[#0d9488] hover:bg-[#0b7a6f] text-white text-[13.5px] font-bold shadow-xs transition-colors cursor-pointer"
              >
                Create venue
              </button>
            </div>
          </div>

          {/* Onboarding Form Card */}
          <form onSubmit={handleCreateVenueSubmit} className="bg-white border border-[#e2e8f0] rounded-lg shadow-sm divide-y divide-[#e2e8f0] overflow-hidden">
            {/* Section 1: Venue Identity */}
            <section className="p-6">
              <div className="mb-4">
                <h2 className="text-[16px] font-bold text-[#0f172a]">Venue identity</h2>
                <p className="text-xs text-[#475569] mt-0.5">
                  Core organisation relationship and trading name.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#475569] mb-1.5">
                    Venue legal name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={createForm.name}
                    onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                    placeholder="e.g. Riverside RSL Club"
                    className="w-full h-10 px-3 bg-white border border-[#cbd5e1] rounded-md text-[13.5px] text-[#0f172a] focus:border-[#0d9488] outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#475569] mb-1.5">Short name</label>
                  <input
                    type="text"
                    maxLength={20}
                    value={createForm.shortName}
                    onChange={(e) => setCreateForm({ ...createForm, shortName: e.target.value })}
                    placeholder="e.g. Riverside RSL"
                    className="w-full h-10 px-3 bg-white border border-[#cbd5e1] rounded-md text-[13.5px] text-[#0f172a] focus:border-[#0d9488] outline-none"
                  />
                  <span className="text-[11px] text-[#64748b] mt-1 block">Maximum 20 characters.</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#475569] mb-1.5">Statement reference <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    maxLength={STATEMENT_REF_MAX}
                    value={createForm.statementReference}
                    onChange={(e) => setCreateForm({ ...createForm, statementReference: normaliseStatementRef(e.target.value) })}
                    placeholder="e.g. RVRSL"
                    className="w-full h-10 px-3 bg-white border border-[#cbd5e1] rounded-md text-[13.5px] font-mono text-[#0f172a] focus:border-[#0d9488] outline-none"
                    required
                  />
                  <span className="text-[11px] text-[#64748b] mt-1 block">
                    {STATEMENT_REF_MIN} to {STATEMENT_REF_MAX} characters, capital letters and digits, unique. Starts the bank statement description: <span className="font-mono">{buildStatementDescription(createForm.statementReference, '12345')}</span>
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#475569] mb-1.5">Organisation / Client</label>
                  <select
                    value={createForm.clientId}
                    onChange={(e) => setCreateForm({ ...createForm, clientId: e.target.value })}
                    className="w-full h-10 px-3 bg-white border border-[#cbd5e1] rounded-md text-[13.5px] text-[#0f172a] focus:border-[#0d9488] outline-none cursor-pointer"
                  >
                    {initialClients.map((client) => (
                      <option key={client.id} value={client.id}>
                        {client.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#475569] mb-1.5">Venue email address <span className="text-red-500">*</span></label>
                  <input
                    type="email"
                    value={createForm.venueEmail}
                    onChange={(e) => setCreateForm({ ...createForm, venueEmail: e.target.value })}
                    placeholder="admin@riversidersl.com.au"
                    className="w-full h-10 px-3 bg-white border border-[#cbd5e1] rounded-md text-[13.5px] text-[#0f172a] focus:border-[#0d9488] outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#475569] mb-1.5">Australian Business Number (ABN)</label>
                  <input
                    type="text"
                    value={createForm.abn}
                    onChange={(e) => setCreateForm({ ...createForm, abn: e.target.value })}
                    placeholder="55 123 456 789"
                    className="w-full h-10 px-3 bg-white border border-[#cbd5e1] rounded-md text-[13.5px] font-mono text-[#0f172a] focus:border-[#0d9488] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#475569] mb-1.5">Venue physical address</label>
                  <input
                    type="text"
                    value={createForm.venueAddress}
                    onChange={(e) => setCreateForm({ ...createForm, venueAddress: e.target.value })}
                    placeholder="102 Riverside Drive, Parramatta NSW 2150"
                    className="w-full h-10 px-3 bg-white border border-[#cbd5e1] rounded-md text-[13.5px] text-[#0f172a] focus:border-[#0d9488] outline-none"
                  />
                </div>
              </div>
            </section>

            {/* Section 2: Payout Controls */}
            <section className="p-6">
              <div className="mb-4">
                <h2 className="text-[16px] font-bold text-[#0f172a]">Payout &amp; compliance controls</h2>
                <p className="text-xs text-[#475569] mt-0.5">
                  Threshold limits, approver counts, wait times, and disbursement methods.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Approvers Choice */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-[#475569] mb-1.5">Required number of approvers</label>
                  <div className="inline-flex rounded-lg shadow-2xs">
                    <button
                      type="button"
                      onClick={() => setCreateForm({ ...createForm, approvers: 1 })}
                      className={`h-[38px] px-4 rounded-l-lg text-[13px] font-bold cursor-pointer transition-all ${
                        createForm.approvers === 1
                          ? 'relative z-10 bg-[#f0fdfa] text-[#0d9488] ring-1 ring-inset ring-[#0d9488]'
                          : 'relative bg-white text-[#627d98] hover:text-[#102a43] hover:bg-slate-50 ring-1 ring-inset ring-[#cbd5e1]'
                      }`}
                    >
                      1 Approver
                    </button>
                    <button
                      type="button"
                      onClick={() => setCreateForm({ ...createForm, approvers: 2 })}
                      className={`h-[38px] px-4 -ml-px rounded-r-lg text-[13px] font-bold cursor-pointer transition-all ${
                        createForm.approvers === 2
                          ? 'relative z-10 bg-[#f0fdfa] text-[#0d9488] ring-1 ring-inset ring-[#0d9488]'
                          : 'relative bg-white text-[#627d98] hover:text-[#102a43] hover:bg-slate-50 ring-1 ring-inset ring-[#cbd5e1]'
                      }`}
                    >
                      2 Approvers
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#475569] mb-1.5">
                    Daily limit (AUD) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={createForm.dailyLimit}
                    onChange={(e) => setCreateForm({ ...createForm, dailyLimit: e.target.value })}
                    className="w-full h-10 px-3 font-mono bg-white border border-[#cbd5e1] rounded-md text-[13.5px] text-[#0f172a] focus:border-[#0d9488] outline-none"
                    required
                  />
                  <span className="text-[11px] text-[#64748b] mt-1 block">AUD cap per venue day.</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#475569] mb-1.5">
                    Minimum wait time (Hours) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={createForm.minWaitTime}
                    onChange={(e) => setCreateForm({ ...createForm, minWaitTime: e.target.value })}
                    className="w-full h-10 px-3 font-mono bg-white border border-[#cbd5e1] rounded-md text-[13.5px] text-[#0f172a] focus:border-[#0d9488] outline-none"
                    required
                  />
                  <span className="text-[11px] text-[#64748b] mt-1 block">Delay before payout becomes eligible.</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#475569] mb-1.5">
                    Delay unresolved items (Minutes)
                  </label>
                  <input
                    type="number"
                    min={10}
                    max={180}
                    value={createForm.delayUnresolvedPaymentItems}
                    onChange={(e) => setCreateForm({ ...createForm, delayUnresolvedPaymentItems: e.target.value })}
                    className="w-full h-10 px-3 font-mono bg-white border border-[#cbd5e1] rounded-md text-[13.5px] text-[#0f172a] focus:border-[#0d9488] outline-none"
                  />
                  <span className="text-[11px] text-[#64748b] mt-1 block">Minimum 10 / maximum 180 minutes.</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#475569] mb-1.5">
                    Max amount per transaction (AUD)
                  </label>
                  <input
                    type="number"
                    value={createForm.maxPerTransaction}
                    onChange={(e) => setCreateForm({ ...createForm, maxPerTransaction: e.target.value })}
                    className="w-full h-10 px-3 font-mono bg-white border border-[#cbd5e1] rounded-md text-[13.5px] text-[#0f172a] focus:border-[#0d9488] outline-none"
                  />
                </div>

                {/* Disbursement Methods */}
                <div className="sm:col-span-2 mt-2 pt-2 border-t border-[#e2e8f0]">
                  <label className="block text-xs font-bold text-[#475569] mb-2">Allowed disbursement methods</label>
                  <div className="flex flex-wrap gap-2">
                    {['cash', 'bank_transfer', 'cheque'].map((method) => {
                      const active = createForm.disbursementMethods.includes(method);
                      const label = method === 'bank_transfer' ? 'Bank transfer' : method === 'cash' ? 'Cash' : 'Cheque';
                      return (
                        <button
                          key={method}
                          type="button"
                          onClick={() => handleToggleCreateDisbursement(method)}
                          className={`h-[38px] px-3.5 rounded-md text-[13px] font-semibold cursor-pointer transition-all inline-flex items-center gap-2.5 ${
                            active
                              ? 'bg-white text-[#0d9488] font-bold border border-[#0d9488] shadow-xs'
                              : 'bg-white text-[#627d98] hover:text-[#102a43] border border-[#cbd5e1] hover:bg-slate-50 shadow-2xs'
                          }`}
                        >
                          <span>{label}</span>
                          <div
                            className={`w-4 h-4 rounded-full flex items-center justify-center transition-colors ${
                              active
                                ? 'bg-[#0d9488] text-white'
                                : 'border border-[#cbd5e1] bg-white'
                            }`}
                          >
                            {active && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  <span className="text-[11px] text-[#64748b] mt-1.5 block">
                    Bank transfer and cheque cannot be enabled together.
                  </span>

                  {createDisbursementError && (
                    <div className="flex items-center gap-1.5 mt-2 text-xs font-bold text-red-600">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{createDisbursementError}</span>
                    </div>
                  )}
                </div>

                {/* Compliance Toggles */}
                <div className="sm:col-span-2 space-y-3 mt-3 pt-3 border-t border-[#e2e8f0]">
                  <div className="flex items-center justify-between p-3 border border-[#e2e8f0] rounded-lg bg-white">
                    <span className="text-[13px] font-bold text-[#0f172a]">Identity Verification Enabled (IDV)</span>
                    <SegmentedBooleanToggle
                      value={createForm.idvEnabled}
                      onChange={(val) => setCreateForm({ ...createForm, idvEnabled: val })}
                      trueLabel="Enabled"
                      falseLabel="Disabled"
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 border border-[#e2e8f0] rounded-lg bg-white">
                    <span className="text-[13px] font-bold text-[#0f172a]">Allow Cash / No-EFT Payouts</span>
                    <SegmentedBooleanToggle
                      value={createForm.allowNoEFTPayout}
                      onChange={(val) => setCreateForm({ ...createForm, allowNoEFTPayout: val })}
                      trueLabel="Enabled"
                      falseLabel="Disabled"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Section 3: Notification Policy */}
            <section className="p-6">
              <div className="mb-4">
                <h2 className="text-[16px] font-bold text-[#0f172a]">Client notifications</h2>
                <p className="text-xs text-[#475569] mt-0.5">Notification routing and severity rules.</p>
              </div>

              <div className="max-w-md">
                <label className="block text-xs font-bold text-[#475569] mb-1.5">Notification policy</label>
                <select
                  value={createForm.clientNotificationPolicy}
                  onChange={(e) => setCreateForm({ ...createForm, clientNotificationPolicy: e.target.value })}
                  className="w-full h-10 px-3 bg-white border border-[#cbd5e1] rounded-md text-[13.5px] text-[#0f172a] focus:border-[#0d9488] outline-none cursor-pointer"
                >
                  <option value="default">Default client notification policy</option>
                  <option value="strict">High-priority compliance alerts</option>
                  <option value="none">Muted notifications</option>
                </select>
              </div>
            </section>

            {/* Form Footer */}
            <div className="p-4 sm:px-6 bg-[#fafbfc] border-t border-[#e2e8f0] flex items-center justify-between text-xs text-[#64748b]">
              <span>Review all operational values before creating the venue record.</span>
              <button
                type="submit"
                className="h-[38px] px-5 rounded-md bg-[#0d9488] hover:bg-[#0b7a6f] text-white text-[13.5px] font-bold shadow-xs transition-colors cursor-pointer"
              >
                Create venue
              </button>
            </div>
          </form>
        </div>
      )}
    </AdminShell>
  );
}

export default function SuperAdminVenuesPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-sm text-slate-500 font-medium">
          Loading venues...
        </div>
      }
    >
      <SuperAdminVenuesContent />
    </Suspense>
  );
}
