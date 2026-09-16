'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle2, X, Plus, CreditCard, FileText } from 'lucide-react';
import AdminShell from '@/components/layout/AdminShell';
import SegmentedBooleanToggle from '@/components/ui/SegmentedBooleanToggle';
import { initialClients, initialVenues, initialUsers } from '@/lib/mockData';

function SuperAdminClientDetailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const clientId = searchParams.get('id');
  const mode = searchParams.get('mode') || (clientId ? 'view' : 'create');
  const isCreate = mode === 'create' || !clientId;

  const [isEditing, setIsEditing] = useState(isCreate);
  const [toastMessage, setToastMessage] = useState(null);

  const matchedClient = initialClients.find((c) => c.id === clientId) || {
    id: 'client-riverside',
    name: 'Riverside Leagues Ltd',
    contact: 'J. Chen',
    email: 'admin@riversiderg.com.au',
    venues: 3,
    plan: 'PAYG',
    status: 'Active',
    numberOfApprovals: 2,
    tenancyClientId: 'ten-riverside-01',
    clientId: 'palxi-client-8812',
    clientSecret: '••••••••••••••••',
    dailyLimit: 30000,
    minWaitTime: 24,
    delayUnresolvedPaymentItems: 10,
    acceptPartialCOPValidation: false,
    acceptNoMatchCOPValidation: false,
  };

  const [formData, setFormData] = useState({
    id: isCreate ? `client-${Date.now()}` : matchedClient.id,
    name: isCreate ? '' : matchedClient.name,
    email: isCreate ? '' : matchedClient.email,
    contact: isCreate ? '' : matchedClient.contact,
    numberOfApprovals: matchedClient.numberOfApprovals || 2,
    tenancyClientId: isCreate ? '' : matchedClient.tenancyClientId || '',
    clientId: isCreate ? '' : matchedClient.clientId || matchedClient.id,
    clientSecret: isCreate ? '' : matchedClient.clientSecret || '',
    dailyLimit: matchedClient.dailyLimit || 30000,
    minWaitTime: matchedClient.minWaitTime || 24,
    delayUnresolvedPaymentItems: matchedClient.delayUnresolvedPaymentItems || 10,
    acceptPartialCOPValidation: matchedClient.acceptPartialCOPValidation || false,
    acceptNoMatchCOPValidation: matchedClient.acceptNoMatchCOPValidation || false,
    status: isCreate ? 'Draft' : matchedClient.status,
    selectedUser: 'usr-2b3c4d',
    selectedVenue: 'venue-riverside-rsl',
    selectedNotification: 'default'
  });

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) {
      showToast('Please fill in required fields.');
      return;
    }

    setIsEditing(false);
    showToast(isCreate ? 'Client record created.' : 'Client record updated.');
    if (isCreate) {
      setTimeout(() => router.push('/super-admin/clients'), 1000);
    }
  };

  const getStatusPill = (status) => {
    switch (status) {
      case 'Active':
        return 'bg-[#ecfdf5] text-[#065f46] border-[#6ee7b7]';
      case 'Draft':
        return 'bg-[#fffbeb] text-[#78350f] border-[#fcd34d]';
      case 'Inactive':
      default:
        return 'bg-[#fef2f2] text-[#991b1b] border-[#fca5a5]';
    }
  };

  return (
    <AdminShell role="SUPER ADMIN">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#102a43] text-white px-4 py-3 rounded-lg shadow-xl border border-slate-700 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-5 h-5 text-teal-400 flex-shrink-0" />
          <span className="text-[13.5px] font-medium">{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white ml-2 cursor-pointer bg-transparent border-none"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="max-w-[1180px] mx-auto py-2 pb-16 space-y-6">
        
        {/* Back link */}
        <div>
          <Link
            href="/super-admin/clients"
            className="inline-flex items-center gap-1.5 text-[13px] font-bold text-[#0d9488] hover:text-[#0b7a6f] transition-colors"
          >
            <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
            <span>All clients</span>
          </Link>
        </div>

        {/* Header matching deploy/super-admin-client.html */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5 pb-2">
          <div>
            <h1 className="text-[28px] font-bold text-[#102a43] tracking-tight m-0 leading-tight">
              {isCreate ? 'Create client' : (formData.name || 'Client details')}
            </h1>
            <p className="text-[14px] text-[#627d98] mt-1.5 mb-0 max-w-[68ch] leading-relaxed">
              {isCreate
                ? 'Create the client record, then connect users, venues, and payout relationships.'
                : 'Review the client record and connected operational relationships.'}
            </p>
            <div className="flex items-center gap-2.5 mt-2.5">
              <span className={`inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border whitespace-nowrap ${getStatusPill(formData.status)}`}>
                {formData.status}
              </span>
              <span className="text-[12px] font-mono text-[#627d98]">
                {formData.id}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-shrink-0">
            {!isEditing ? (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="h-[38px] px-4 rounded-md text-[13px] font-bold bg-white text-[#102a43] border border-[#d9e2ec] hover:bg-[#f4f7f9] transition-colors cursor-pointer shadow-xs"
              >
                Edit client
              </button>
            ) : (
              <>
                {!isCreate && (
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="h-[38px] px-4 rounded-md text-[13px] font-bold bg-white text-[#102a43] border border-[#d9e2ec] hover:bg-[#f4f7f9] transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleSave}
                  className="h-[38px] px-5 rounded-md text-[13px] font-bold bg-[#0d9488] hover:bg-[#0b7a6f] text-white transition-colors cursor-pointer shadow-xs border-none"
                >
                  Save client
                </button>
              </>
            )}
          </div>
        </div>

        {/* Client Form Card matching deploy/super-admin-client.html */}
        <form onSubmit={handleSave} className="bg-white border border-[#d9e2ec] rounded-[10px] shadow-xs overflow-hidden divide-y divide-[#edf1f4]">
          
          {/* Section 1: Client Identity */}
          <div className="p-6 space-y-4">
            <div>
              <h2 className="text-[16px] font-bold text-[#102a43] m-0">Client identity</h2>
              <p className="text-[13px] text-[#627d98] mt-0.5 mb-0">Core client credentials and approval configuration.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[12px] font-bold text-[#627d98]">Name <span className="text-[#dc2626]">*</span></label>
                <input
                  type="text"
                  required
                  disabled={!isEditing}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Riverside Leagues Ltd"
                  className="w-full h-10 px-3 border border-[#d9e2ec] rounded-md text-[13.5px] text-[#102a43] bg-white disabled:bg-[#f8fafc] disabled:text-[#627d98] outline-none focus:border-[#0d9488]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[12px] font-bold text-[#627d98]">Number of approvals</label>
                <input
                  type="number"
                  min="1"
                  max="2"
                  disabled={!isEditing}
                  value={formData.numberOfApprovals}
                  onChange={(e) => setFormData({ ...formData, numberOfApprovals: Number(e.target.value) })}
                  className="w-full h-10 px-3 border border-[#d9e2ec] rounded-md text-[13.5px] font-mono text-[#102a43] bg-white disabled:bg-[#f8fafc] disabled:text-[#627d98] outline-none focus:border-[#0d9488]"
                />
                <span className="text-[11.5px] text-[#627d98] block">Minimum 1 / maximum 2.</span>
              </div>

              <div className="space-y-1">
                <label className="text-[12px] font-bold text-[#627d98]">Tenancy client ID</label>
                <input
                  type="text"
                  disabled={!isEditing}
                  value={formData.tenancyClientId}
                  onChange={(e) => setFormData({ ...formData, tenancyClientId: e.target.value })}
                  placeholder="e.g. ten-riverside-01"
                  className="w-full h-10 px-3 border border-[#d9e2ec] rounded-md text-[13.5px] font-mono text-[#102a43] bg-white disabled:bg-[#f8fafc] disabled:text-[#627d98] outline-none focus:border-[#0d9488]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[12px] font-bold text-[#627d98]">Email <span className="text-[#dc2626]">*</span></label>
                <input
                  type="email"
                  required
                  disabled={!isEditing}
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="e.g. admin@riversiderg.com.au"
                  className="w-full h-10 px-3 border border-[#d9e2ec] rounded-md text-[13.5px] text-[#102a43] bg-white disabled:bg-[#f8fafc] disabled:text-[#627d98] outline-none focus:border-[#0d9488]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[12px] font-bold text-[#627d98]">Client ID</label>
                <input
                  type="text"
                  disabled={!isEditing}
                  value={formData.clientId}
                  onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                  className="w-full h-10 px-3 border border-[#d9e2ec] rounded-md text-[13.5px] font-mono text-[#102a43] bg-white disabled:bg-[#f8fafc] disabled:text-[#627d98] outline-none focus:border-[#0d9488]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[12px] font-bold text-[#627d98]">Client secret</label>
                <input
                  type="password"
                  disabled={!isEditing}
                  value={formData.clientSecret}
                  onChange={(e) => setFormData({ ...formData, clientSecret: e.target.value })}
                  placeholder="••••••••••••••••"
                  className="w-full h-10 px-3 border border-[#d9e2ec] rounded-md text-[13.5px] text-[#102a43] bg-white disabled:bg-[#f8fafc] disabled:text-[#627d98] outline-none focus:border-[#0d9488]"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Bank details */}
          <div className="p-6 space-y-3">
            <div>
              <h2 className="text-[16px] font-bold text-[#102a43] m-0">Bank details</h2>
              <p className="text-[13px] text-[#627d98] mt-0.5 mb-0">Banking records connected to this client.</p>
            </div>
            <div className="p-4 rounded-lg border border-dashed border-[#cbd5e1] bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-md bg-[#f8fafc] border border-[#e2e8f0] flex items-center justify-center text-[#627d98] shrink-0 mt-0.5">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[13.5px] font-bold text-[#102a43]">No bank details added</div>
                  <p className="text-[12px] text-[#627d98] m-0">Click below to establish a verified banking relationship for settlement.</p>
                </div>
              </div>
              {isEditing && (
                <button
                  type="button"
                  onClick={() => showToast('Bank details modal opened.')}
                  className="h-8 px-3 rounded-md text-[12px] font-bold bg-[#f0fdfa] text-[#0d9488] border border-[#a7f3d0] hover:bg-[#ccfbf1] transition-colors cursor-pointer self-start sm:self-auto shrink-0"
                >
                  + Add bank details
                </button>
              )}
            </div>
          </div>

          {/* Section 3: PayTo agreement */}
          <div className="p-6 space-y-3">
            <div>
              <h2 className="text-[16px] font-bold text-[#102a43] m-0">PayTo agreement</h2>
              <p className="text-[13px] text-[#627d98] mt-0.5 mb-0">Settlement agreement records associated with this client.</p>
            </div>
            <div className="p-4 rounded-lg border border-dashed border-[#cbd5e1] bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-md bg-[#f8fafc] border border-[#e2e8f0] flex items-center justify-center text-[#627d98] shrink-0 mt-0.5">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[13.5px] font-bold text-[#102a43]">No PayTo agreement added</div>
                  <p className="text-[12px] text-[#627d98] m-0">Connect a settlement agreement to enable automated PayTo disbursements.</p>
                </div>
              </div>
              {isEditing && (
                <button
                  type="button"
                  onClick={() => showToast('PayTo agreement modal opened.')}
                  className="h-8 px-3 rounded-md text-[12px] font-bold bg-[#f0fdfa] text-[#0d9488] border border-[#a7f3d0] hover:bg-[#ccfbf1] transition-colors cursor-pointer self-start sm:self-auto shrink-0"
                >
                  + Add PayTo agreement
                </button>
              )}
            </div>
          </div>

          {/* Section 4: Relationships */}
          <div className="p-6 space-y-4">
            <div>
              <h2 className="text-[16px] font-bold text-[#102a43] m-0">Relationships</h2>
              <p className="text-[13px] text-[#627d98] mt-0.5 mb-0">Connected users, jackpots, venues, and notification policies.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[12px] font-bold text-[#627d98]">Users</label>
                <select
                  disabled={!isEditing}
                  value={formData.selectedUser}
                  onChange={(e) => setFormData({ ...formData, selectedUser: e.target.value })}
                  className="w-full h-10 px-3 border border-[#d9e2ec] rounded-md text-[13.5px] text-[#102a43] bg-white disabled:bg-[#f8fafc] disabled:text-[#627d98] outline-none focus:border-[#0d9488]"
                >
                  <option value="usr-2b3c4d">j.chen (Venue Admin)</option>
                  <option value="usr-1a2b3c">m.santos (Collector)</option>
                  <option value="usr-3c4d5e">d.walsh (Approver)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[12px] font-bold text-[#627d98]">Jackpots</label>
                <select
                  disabled={!isEditing}
                  className="w-full h-10 px-3 border border-[#d9e2ec] rounded-md text-[13.5px] text-[#102a43] bg-white disabled:bg-[#f8fafc] disabled:text-[#627d98] outline-none focus:border-[#0d9488]"
                >
                  <option value="">Connected Jackpots Policy (Default)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[12px] font-bold text-[#627d98]">Venues</label>
                <select
                  disabled={!isEditing}
                  value={formData.selectedVenue}
                  onChange={(e) => setFormData({ ...formData, selectedVenue: e.target.value })}
                  className="w-full h-10 px-3 border border-[#d9e2ec] rounded-md text-[13.5px] text-[#102a43] bg-white disabled:bg-[#f8fafc] disabled:text-[#627d98] outline-none focus:border-[#0d9488]"
                >
                  <option value="venue-riverside-rsl">Riverside RSL Club</option>
                  <option value="venue-riverside-bowling">Riverside Bowling Club</option>
                  <option value="venue-northside-leagues">Northside Leagues Club</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[12px] font-bold text-[#627d98]">Client notifications</label>
                <select
                  disabled={!isEditing}
                  value={formData.selectedNotification}
                  onChange={(e) => setFormData({ ...formData, selectedNotification: e.target.value })}
                  className="w-full h-10 px-3 border border-[#d9e2ec] rounded-md text-[13.5px] text-[#102a43] bg-white disabled:bg-[#f8fafc] disabled:text-[#627d98] outline-none focus:border-[#0d9488]"
                >
                  <option value="default">Default client notification policy</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 5: Payout controls */}
          <div className="p-6 space-y-4">
            <div>
              <h2 className="text-[16px] font-bold text-[#102a43] m-0">Payout controls</h2>
              <p className="text-[13px] text-[#627d98] mt-0.5 mb-0">Limits and unresolved payment handling for this client.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[12px] font-bold text-[#627d98]">Daily limit <span className="text-[#dc2626]">*</span></label>
                <input
                  type="number"
                  min="0"
                  required
                  disabled={!isEditing}
                  value={formData.dailyLimit}
                  onChange={(e) => setFormData({ ...formData, dailyLimit: Number(e.target.value) })}
                  className="w-full h-10 px-3 border border-[#d9e2ec] rounded-md text-[13.5px] font-mono text-[#102a43] bg-white disabled:bg-[#f8fafc] disabled:text-[#627d98] outline-none focus:border-[#0d9488]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[12px] font-bold text-[#627d98]">Minimum wait time <span className="text-[#dc2626]">*</span></label>
                <input
                  type="number"
                  min="0"
                  max="64"
                  required
                  disabled={!isEditing}
                  value={formData.minWaitTime}
                  onChange={(e) => setFormData({ ...formData, minWaitTime: Number(e.target.value) })}
                  className="w-full h-10 px-3 border border-[#d9e2ec] rounded-md text-[13.5px] font-mono text-[#102a43] bg-white disabled:bg-[#f8fafc] disabled:text-[#627d98] outline-none focus:border-[#0d9488]"
                />
                <span className="text-[11.5px] text-[#627d98] block">Minimum 0 / maximum 64.</span>
              </div>

              <div className="space-y-1">
                <label className="text-[12px] font-bold text-[#627d98]">Delay unresolved payment items</label>
                <input
                  type="number"
                  min="10"
                  max="180"
                  disabled={!isEditing}
                  value={formData.delayUnresolvedPaymentItems}
                  onChange={(e) => setFormData({ ...formData, delayUnresolvedPaymentItems: Number(e.target.value) })}
                  className="w-full h-10 px-3 border border-[#d9e2ec] rounded-md text-[13.5px] font-mono text-[#102a43] bg-white disabled:bg-[#f8fafc] disabled:text-[#627d98] outline-none focus:border-[#0d9488]"
                />
                <span className="text-[11.5px] text-[#627d98] block">Minimum 10 / maximum 180.</span>
              </div>

              <div className="space-y-1">
                <label className="text-[12px] font-bold text-[#627d98]">No EFT payout</label>
                <div className="min-h-[42px] px-3.5 py-2 border border-dashed border-[#cbd5e1] rounded-lg bg-white flex items-center justify-between">
                  <strong className="text-[12.5px] text-[#102a43]">No EFT payout record</strong>
                  {isEditing && (
                    <button
                      type="button"
                      onClick={() => showToast('EFT record action')}
                      className="h-7 px-2.5 rounded-md text-[11.5px] font-bold bg-[#f0fdfa] text-[#0d9488] border border-[#a7f3d0] hover:bg-[#ccfbf1] cursor-pointer"
                    >
                      + Add relation
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Section 6: Branding and validation */}
          <div className="p-6 space-y-4">
            <div>
              <h2 className="text-[16px] font-bold text-[#102a43] m-0">Branding and validation</h2>
              <p className="text-[13px] text-[#627d98] mt-0.5 mb-0">Client-facing brand asset and COP validation settings.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2 space-y-1">
                <label className="text-[12px] font-bold text-[#627d98]">Logo</label>
                <div className="min-h-[90px] flex flex-col items-center justify-center gap-1.5 p-4 border border-dashed border-[#cbd5e1] rounded-lg bg-white text-center">
                  <strong className="text-[13px] text-[#102a43]">No logo uploaded</strong>
                  <p className="text-[12px] text-[#627d98] m-0">Click to add an asset or drag and drop one here.</p>
                  {isEditing && (
                    <button
                      type="button"
                      onClick={() => showToast('Upload logo asset')}
                      className="h-7 px-3 rounded-md text-[11.5px] font-bold bg-[#f0fdfa] text-[#0d9488] border border-[#a7f3d0] hover:bg-[#ccfbf1] cursor-pointer mt-1"
                    >
                      + Add logo
                    </button>
                  )}
                </div>
              </div>

              {/* Segmented Boolean Toggle: Accept partial COP */}
              <div className="space-y-1">
                <label className="text-[12px] font-bold text-[#627d98]">
                  Accept partial COP validation <span className="text-[#dc2626]">*</span>
                </label>
                <div className="pt-1">
                  <SegmentedBooleanToggle
                    value={formData.acceptPartialCOPValidation}
                    onChange={(val) => setFormData({ ...formData, acceptPartialCOPValidation: val })}
                    disabled={!isEditing}
                  />
                </div>
              </div>

              {/* Segmented Boolean Toggle: Accept no-match COP */}
              <div className="space-y-1">
                <label className="text-[12px] font-bold text-[#627d98]">
                  Accept no-match COP validation <span className="text-[#dc2626]">*</span>
                </label>
                <div className="pt-1">
                  <SegmentedBooleanToggle
                    value={formData.acceptNoMatchCOPValidation}
                    onChange={(val) => setFormData({ ...formData, acceptNoMatchCOPValidation: val })}
                    disabled={!isEditing}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Footer Note */}
          <div className="p-4 sm:p-5 bg-white border-t border-[#e2e8f0] flex items-center justify-between text-[12.5px] text-[#627d98]">
            <span>{isEditing ? 'Changes are saved to this client record.' : 'Read-only client record. Select Edit client to change these fields.'}</span>
          </div>

        </form>

      </div>
    </AdminShell>
  );
}

export default function SuperAdminClientPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-[#627d98]">Loading client...</div>}>
      <SuperAdminClientDetailContent />
    </Suspense>
  );
}
