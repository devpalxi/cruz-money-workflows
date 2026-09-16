'use client';

import React, { useState, useEffect } from 'react';
import { Download, ArrowLeft, Check, FileDown, CreditCard, ShieldCheck, X } from 'lucide-react';
import AdminShell from '@/components/layout/AdminShell';
import Button from '@/components/ui/Button';
import ApiCallTelemetryView from '@/components/shared/ApiCallTelemetryView';

/* ─── Venue-specific mock profiles matching deploy/billing.html ─── */
const VENUE_BILLING_PROFILES = {
  'Riverside RSL Club': {
    venueName: 'Riverside RSL Club',
    orgName: 'Riverside Group',
    plan: 'PAYG',
    status: 'Paid',
    statusVariant: 'paid',
    started: '01 Jul 2026',
    nextInvoice: '01 Aug 2026',
    monthlyChargeEst: '$412.50',
    period: '1 Aug – 31 Aug 2026',
    elapsedDays: '11 days elapsed in current cycle (35%)',
    elapsedPct: '35%',
    cardholder: 'Jonathan Chen',
    payoutsCount: 84,
    payoutsTotal: '$42.00',
    kycCount: 84,
    kycTotal: '$84.00',
    reportsCount: 6,
    reportsTotal: '$30.00',
    machinesCount: 12,
    machinesTotal: '$30.00',
    totalPeriod: '$186.00',
    history: [
      { inv: 'INV-0042', period: 'Jul 2026', amount: '$412.50', status: 'Paid', statusVariant: 'paid' },
      { inv: 'INV-0031', period: 'Jun 2026', amount: '$388.00', status: 'Paid', statusVariant: 'paid' },
      { inv: 'INV-0020', period: 'May 2026', amount: '$405.00', status: 'Paid', statusVariant: 'paid' },
    ],
  },
  'Northside Leagues Club': {
    venueName: 'Northside Leagues Club',
    orgName: 'Northside Hospitality',
    plan: 'PAYG',
    status: 'Pending',
    statusVariant: 'pending',
    started: '15 Jul 2026',
    nextInvoice: '15 Aug 2026',
    monthlyChargeEst: '$87.00',
    period: '15 Jul – 15 Aug 2026',
    elapsedDays: '28 days elapsed in current cycle (93%)',
    elapsedPct: '93%',
    cardholder: 'Sarah Jenkins',
    payoutsCount: 42,
    payoutsTotal: '$21.00',
    kycCount: 38,
    kycTotal: '$38.00',
    reportsCount: 2,
    reportsTotal: '$10.00',
    machinesCount: 8,
    machinesTotal: '$20.00',
    totalPeriod: '$89.00',
    history: [
      { inv: 'INV-0049', period: 'Jul 2026', amount: '$87.00', status: 'Pending', statusVariant: 'pending' },
      { inv: 'INV-0038', period: 'Jun 2026', amount: '$65.00', status: 'Paid', statusVariant: 'paid' },
    ],
  },
  'Harbourview Hotel': {
    venueName: 'Harbourview Hotel',
    orgName: 'Harbourview Group',
    plan: 'PAYG',
    status: 'Paid',
    statusVariant: 'paid',
    started: '01 Aug 2026',
    nextInvoice: '01 Sep 2026',
    monthlyChargeEst: '$234.00',
    period: '1 Aug – 31 Aug 2026',
    elapsedDays: '11 days elapsed in current cycle (35%)',
    elapsedPct: '35%',
    cardholder: 'Marcus Vance',
    payoutsCount: 60,
    payoutsTotal: '$30.00',
    kycCount: 55,
    kycTotal: '$55.00',
    reportsCount: 4,
    reportsTotal: '$20.00',
    machinesCount: 6,
    machinesTotal: '$15.00',
    totalPeriod: '$120.00',
    history: [
      { inv: 'INV-0045', period: 'Jul 2026', amount: '$234.00', status: 'Paid', statusVariant: 'paid' },
      { inv: 'INV-0034', period: 'Jun 2026', amount: '$210.00', status: 'Paid', statusVariant: 'paid' },
    ],
  },
  'Riverside Grand Bistro': {
    venueName: 'Riverside Grand Bistro',
    orgName: 'Riverside Group',
    plan: 'PAYG',
    status: 'Failed',
    statusVariant: 'failed',
    started: '10 Jul 2026',
    nextInvoice: '10 Aug 2026',
    monthlyChargeEst: '$22.50',
    period: '10 Jul – 10 Aug 2026',
    elapsedDays: '31 days elapsed in cycle (100%)',
    elapsedPct: '100%',
    cardholder: 'Elena Rostova',
    payoutsCount: 15,
    payoutsTotal: '$7.50',
    kycCount: 15,
    kycTotal: '$15.00',
    reportsCount: 0,
    reportsTotal: '$0.00',
    machinesCount: 0,
    machinesTotal: '$0.00',
    totalPeriod: '$22.50',
    history: [
      { inv: 'INV-0051', period: 'Jul 2026', amount: '$22.50', status: 'Failed', statusVariant: 'failed' },
    ],
  },
  'Riverside Lounge & Bar': {
    venueName: 'Riverside Lounge & Bar',
    orgName: 'Riverside Group',
    plan: 'PAYG',
    status: 'No Activity',
    statusVariant: 'neutral',
    started: '-',
    nextInvoice: '-',
    monthlyChargeEst: '$0.00',
    period: '1 Aug – 31 Aug 2026',
    elapsedDays: '0 days elapsed',
    elapsedPct: '0%',
    cardholder: 'Jonathan Chen',
    payoutsCount: 0,
    payoutsTotal: '$0.00',
    kycCount: 0,
    kycTotal: '$0.00',
    reportsCount: 0,
    reportsTotal: '$0.00',
    machinesCount: 0,
    machinesTotal: '$0.00',
    totalPeriod: '$0.00',
    history: [],
  },
};

const TIER_DETAILS = {
  'tier-1': {
    id: 'tier-1',
    name: 'Tier 1',
    monthlyPrice: '$0',
    rateDisplay: '3 months free, then $12/payout',
    headline: 'Starter Compliance',
    badge: 'Standard',
  },
  'tier-2': {
    id: 'tier-2',
    name: 'Tier 2',
    monthlyPrice: '$249',
    rateDisplay: '$6/payout',
    headline: 'High Velocity',
    badge: 'Recommended',
  },
  'tier-3': {
    id: 'tier-3',
    name: 'Tier 3',
    monthlyPrice: '$699',
    rateDisplay: '$4/payout',
    headline: 'Enterprise Scale',
    badge: 'Enterprise',
  },
};

function StatusBadge({ variant, children }) {
  const styles = {
    paid: 'bg-[#ecfdf5] text-[#059669] border-[#a7f3d0]',
    active: 'bg-[#ecfdf5] text-[#059669] border-[#a7f3d0]',
    pending: 'bg-[#fffbeb] text-[#b45309] border-[#fde68a]',
    failed: 'bg-[#fff5f5] text-[#e53e3e] border-[#fed7d7]',
    neutral: 'bg-[#f1f5f9] text-[#475569] border-[#e2e8f0]',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[12px] font-bold border ${styles[variant] || styles.neutral}`}>
      {children}
    </span>
  );
}

export default function BillingView({ role = 'ADMIN' }) {
  const isSuperAdmin = role === 'SUPER ADMIN';
  
  // State for drill-down vs overview in Super Admin
  const [selectedVenueKey, setSelectedVenueKey] = useState(
    isSuperAdmin ? null : 'Riverside RSL Club'
  );
  
  // Active tab in Venue Drill-down view
  const [activeTab, setActiveTab] = useState('usage'); // 'usage' | 'history' | 'payment' | 'plan'
  const [toastMsg, setToastMsg] = useState(null);

  // Active plan per venue
  const [venuePlans, setVenuePlans] = useState({
    'Riverside RSL Club': 'tier-1',
    'Northside Leagues Club': 'tier-2',
    'Harbourview Hotel': 'tier-2',
    'Riverside Grand Bistro': 'tier-1',
    'Riverside Lounge & Bar': 'tier-1',
  });

  const [pendingPlan, setPendingPlan] = useState(null);

  // Close confirmation modal on ESC
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && pendingPlan) {
        setPendingPlan(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [pendingPlan]);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleInitiatePlanChange = (venueName, newTierId, newTierName) => {
    if (isSuperAdmin) return;
    const currentTierId = venuePlans[venueName] || 'tier-1';
    setPendingPlan({
      venueName,
      currentTierId,
      targetTierId: newTierId,
      targetTierName: newTierName,
    });
  };

  const handleConfirmPlanChange = () => {
    if (!pendingPlan) return;
    const { venueName, targetTierId, targetTierName } = pendingPlan;
    setVenuePlans((prev) => ({
      ...prev,
      [venueName]: targetTierId,
    }));
    setPendingPlan(null);
    showToast(`Plan successfully switched to ${targetTierName}.`);
  };

  const currentProfile = selectedVenueKey
    ? VENUE_BILLING_PROFILES[selectedVenueKey] || VENUE_BILLING_PROFILES['Riverside RSL Club']
    : null;

  return (
    <AdminShell role={role}>
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0f172a] text-white px-4 py-3 rounded-lg shadow-xl text-[14px] font-bold flex items-center gap-2 border border-slate-700 animate-in fade-in slide-in-from-bottom-2">
          <span>✓ {toastMsg}</span>
        </div>
      )}

      {/* ─── CASE A: Super Admin Platform Overview (When no venue is selected) ─── */}
      {isSuperAdmin && !selectedVenueKey && (
        <>
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-7">
            <div>
              <h1 className="text-[28px] font-bold text-[#102a43] tracking-tight m-0 leading-tight">
                Billing &amp; Subscriptions
              </h1>
              <p className="text-[14.5px] text-[#627d98] mt-1.5 mb-0 max-w-[72ch] leading-relaxed font-sans">
                Platform monthly recurring revenue, subscription plans, and venue invoice statuses.
              </p>
            </div>
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => showToast('Platform billing CSV report generated.')}
                className="inline-flex items-center justify-center min-h-[40px] px-4 rounded-md text-[13.5px] font-bold text-[#102a43] bg-white border border-[#d9e2ec] hover:bg-[#f4f7f9] transition-colors cursor-pointer gap-2 font-sans"
              >
                <Download className="w-4 h-4 text-[#627d98]" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          {/* 4 Stat Cards */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mb-6">
            <div className="bg-white border border-[#d9e2ec] rounded-[10px] p-[18px]">
              <div className="text-[#627d98] text-[12px] font-bold uppercase tracking-wider font-sans">Total MRR</div>
              <div className="mt-2 text-[26px] font-bold font-mono text-[#102a43] leading-none">$756.00</div>
              <div className="mt-2 text-[#059669] text-[12.5px] font-bold flex items-center gap-1 font-sans">
                <span>↑ +12% vs last month</span>
              </div>
            </div>

            <div className="bg-white border border-[#d9e2ec] rounded-[10px] p-[18px]">
              <div className="text-[#627d98] text-[12px] font-bold uppercase tracking-wider font-sans">Active Venues</div>
              <div className="mt-2 text-[26px] font-bold font-mono text-[#102a43] leading-none">4</div>
              <div className="mt-2 text-[#059669] text-[12.5px] font-bold font-sans">+1 onboarded this month</div>
            </div>

            <div className="bg-white border border-[#d9e2ec] rounded-[10px] p-[18px]">
              <div className="text-[#627d98] text-[12px] font-bold uppercase tracking-wider font-sans">Outstanding Invoices</div>
              <div className="mt-2 text-[26px] font-bold font-mono text-[#102a43] leading-none">1</div>
              <div className="mt-2 text-[#b45309] text-[12.5px] font-bold font-sans">$87.00 pending payment</div>
            </div>

            <div className="bg-white border border-[#d9e2ec] rounded-[10px] p-[18px]">
              <div className="text-[#627d98] text-[12px] font-bold uppercase tracking-wider font-sans">Failed Payments</div>
              <div className="mt-2 text-[26px] font-bold font-mono text-[#e53e3e] leading-none">1</div>
              <div className="mt-2 text-[#e53e3e] text-[12.5px] font-bold font-sans">$22.50 action required</div>
            </div>
          </section>

          {/* Super Admin Venues Table Section */}
          <section className="bg-white border border-[#d9e2ec] rounded-[10px] overflow-hidden shadow-sm">
            <div className="p-5 border-b border-[#edf1f4]">
              <h2 className="text-[17px] font-bold text-[#102a43] m-0 font-sans">Venues Subscription Overview</h2>
              <p className="text-[13px] text-[#627d98] mt-1 mb-0 font-sans">
                Click any venue row to drill down into its feature usage, invoices, and billing configuration.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] border-collapse">
                <thead>
                  <tr className="border-b border-[#d9e2ec] bg-[#f8fafb]">
                    <th className="text-left px-5 py-3 text-[#627d98] text-[12px] font-bold font-sans">Venue</th>
                    <th className="text-left px-5 py-3 text-[#627d98] text-[12px] font-bold font-sans">Plan</th>
                    <th className="text-left px-5 py-3 text-[#627d98] text-[12px] font-bold font-sans">Monthly Charge (Est)</th>
                    <th className="text-left px-5 py-3 text-[#627d98] text-[12px] font-bold font-sans">Billing Started</th>
                    <th className="text-left px-5 py-3 text-[#627d98] text-[12px] font-bold font-sans">Next Invoice</th>
                    <th className="text-left px-5 py-3 text-[#627d98] text-[12px] font-bold font-sans">Payment Status</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(VENUE_BILLING_PROFILES).map(([key, v]) => (
                    <tr
                      key={key}
                      onClick={() => {
                        setSelectedVenueKey(key);
                        setActiveTab('usage');
                      }}
                      className="hover:bg-[#f0fdfa] transition-colors cursor-pointer border-b border-[#edf1f4] last:border-b-0 group"
                    >
                      <td className="px-5 py-3.5">
                        <div className="font-bold text-[14.5px] text-[#102a43] group-hover:text-[#0d9488] transition-colors font-sans">{v.venueName}</div>
                        <div className="text-[12.5px] text-[#627d98] font-sans">{v.orgName}</div>
                      </td>
                      <td className="px-5 py-3.5 text-[14px] font-medium text-[#102a43] font-sans">{v.plan}</td>
                      <td className="px-5 py-3.5 font-mono text-[14px] font-bold text-[#102a43]">{v.monthlyChargeEst}</td>
                      <td className="px-5 py-3.5 font-mono text-[13.5px] text-[#627d98]">{v.started}</td>
                      <td className="px-5 py-3.5 font-mono text-[13.5px] text-[#627d98]">{v.nextInvoice}</td>
                      <td className="px-5 py-3.5">
                        <StatusBadge variant={v.statusVariant}>{v.status}</StatusBadge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}

      {/* ─── CASE B: Venue Billing Workspace (Admin view or Super Admin drill-down) ─── */}
      {currentProfile && (!isSuperAdmin || selectedVenueKey) && (
        <>
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-7">
            <div>
              {isSuperAdmin && (
                <button
                  type="button"
                  onClick={() => setSelectedVenueKey(null)}
                  className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-ink-mid hover:text-ink-hi cursor-pointer bg-transparent border-none p-0 mb-2 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
                  <span>Back to all venues</span>
                </button>
              )}
              <h1 className="text-[28px] font-bold text-ink-hi tracking-tight m-0 leading-tight">
                {currentProfile.venueName} venue billing
              </h1>
              <p className="text-[14px] text-ink-mid mt-1.5 mb-0 max-w-[68ch] leading-relaxed">
                Usage breakdown, monthly invoices, payment methods, and subscription details for {currentProfile.orgName}.
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <Button
                variant="secondary"
                size="sm"
                icon={Download}
                onClick={() => showToast('Itemized statement PDF downloading.')}
              >
                Download statement
              </Button>
            </div>
          </div>

          {/* Top Horizontal Tabs & Content Container */}
          <section className="bg-surface-card border border-border rounded-lg p-6 shadow-card">

            {/* Top Navigation Tabs */}
            <nav className="flex items-center gap-8 border-b border-border mb-7 overflow-x-auto" aria-label="Venue billing sections">
              <button
                type="button"
                onClick={() => setActiveTab('usage')}
                className={`pb-3.5 -mb-px text-[15px] transition-all cursor-pointer border-b-2 bg-transparent whitespace-nowrap
                  ${activeTab === 'usage'
                    ? 'border-brand text-brand font-bold'
                    : 'border-transparent text-ink-mid hover:text-ink-hi font-semibold'}`}
              >
                Usage &amp; charges
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('history')}
                className={`pb-3.5 -mb-px text-[15px] transition-all cursor-pointer border-b-2 bg-transparent whitespace-nowrap
                  ${activeTab === 'history'
                    ? 'border-brand text-brand font-bold'
                    : 'border-transparent text-ink-mid hover:text-ink-hi font-semibold'}`}
              >
                Billing history
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('payment')}
                className={`pb-3.5 -mb-px text-[15px] transition-all cursor-pointer border-b-2 bg-transparent whitespace-nowrap
                  ${activeTab === 'payment'
                    ? 'border-brand text-brand font-bold'
                    : 'border-transparent text-ink-mid hover:text-ink-hi font-semibold'}`}
              >
                Payment method
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('plan')}
                className={`pb-3.5 -mb-px text-[15px] transition-all cursor-pointer border-b-2 bg-transparent whitespace-nowrap
                  ${activeTab === 'plan'
                    ? 'border-brand text-brand font-bold'
                    : 'border-transparent text-ink-mid hover:text-ink-hi font-semibold'}`}
              >
                Plan &amp; subscription
              </button>
            </nav>

            {/* Tab Content Panels (Full Width) */}
            <div className="w-full">

              {/* ── Tab 1: Usage & charges ── */}
              {activeTab === 'usage' && (
                <div className="space-y-8">
                  {/* Billing cycle progress - always visible, sets the frame for everything below */}
                  <div>
                    <div className="flex flex-wrap justify-between items-baseline gap-x-3 gap-y-1 mb-2">
                      <h2 className="text-[17px] font-bold text-ink-hi m-0">Usage &amp; charges this cycle</h2>
                      <span className="font-mono text-[13px] text-ink-mid">{currentProfile.period}</span>
                    </div>
                    <div className="w-full h-1.5 bg-border rounded-full overflow-hidden mb-1.5">
                      <div
                        className="h-full bg-brand rounded-full transition-all duration-300"
                        style={{ width: currentProfile.elapsedPct }}
                      />
                    </div>
                    <div className="text-[12.5px] text-ink-mid">{currentProfile.elapsedDays}</div>
                  </div>

                  {/* Step 1: what this venue is billed for, by feature */}
                  <div>
                    <h3 className="text-[15px] font-bold text-ink-hi mb-3">Charges this cycle</h3>

                    <div className="border border-border rounded-lg overflow-hidden">
                      <div className="overflow-x-auto">
                      <table className="w-full min-w-[640px] border-collapse">
                        <thead>
                          <tr className="bg-surface-th border-b border-border">
                            <th className="text-left px-5 py-3.5 text-ink-mid text-[12px] font-semibold">Compliance and operational feature</th>
                            <th className="text-left px-5 py-3.5 text-ink-mid text-[12px] font-semibold">Volume/units used</th>
                            <th className="text-left px-5 py-3.5 text-ink-mid text-[12px] font-semibold">Unit rate</th>
                            <th className="text-right px-5 py-3.5 text-ink-mid text-[12px] font-semibold">Subtotal</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          <tr>
                            <td className="px-5 py-3.5">
                              <div className="font-bold text-[14px] text-ink-hi">Payout processing (PAYG)</div>
                            </td>
                            <td className="px-5 py-3.5 text-[13.5px] text-ink-hi">
                              <span className="font-mono tabular-nums">{currentProfile.payoutsCount}</span> disbursements
                            </td>
                            <td className="px-5 py-3.5 text-[13.5px] text-ink-mid"><span className="font-mono tabular-nums">$0.50</span>/payout</td>
                            <td className="px-5 py-3.5 font-mono text-[14px] font-bold text-ink-hi text-right">{currentProfile.payoutsTotal}</td>
                          </tr>
                                                    {/* 8 Granular Verification & Compliance Rows from feature/dineth */}
                          <tr>
                            <td className="px-5 py-3.5">
                              <div className="font-bold text-[14px] text-ink-hi">Primary ID verification (DVS / credit bureau)</div>
                            </td>
                            <td className="px-5 py-3.5 text-[13.5px] text-ink-hi">
                              <span className="font-mono tabular-nums">{Math.round((currentProfile.kycCount || 0) * 0.85)}</span> checks
                            </td>
                            <td className="px-5 py-3.5 text-[13.5px] text-ink-mid"><span className="font-mono tabular-nums">$1.00</span>/check</td>
                            <td className="px-5 py-3.5 font-mono text-[14px] font-bold text-ink-hi text-right">
                              ${(Math.round((currentProfile.kycCount || 0) * 0.85) * 1.0).toFixed(2)}
                            </td>
                          </tr>
                          <tr>
                            <td className="px-5 py-3.5">
                              <div className="font-bold text-[14px] text-ink-hi">Primary ID retry check</div>
                            </td>
                            <td className="px-5 py-3.5 text-[13.5px] text-ink-hi">
                              <span className="font-mono tabular-nums">{Math.round((currentProfile.kycCount || 0) * 0.08)}</span> checks
                            </td>
                            <td className="px-5 py-3.5 text-[13.5px] text-ink-mid"><span className="font-mono tabular-nums">$0.50</span>/retry</td>
                            <td className="px-5 py-3.5 font-mono text-[14px] font-bold text-ink-hi text-right">
                              ${(Math.round((currentProfile.kycCount || 0) * 0.08) * 0.5).toFixed(2)}
                            </td>
                          </tr>
                          <tr>
                            <td className="px-5 py-3.5">
                              <div className="font-bold text-[14px] text-ink-hi">Secondary ID verification</div>
                            </td>
                            <td className="px-5 py-3.5 text-[13.5px] text-ink-hi">
                              <span className="font-mono tabular-nums">{Math.round((currentProfile.kycCount || 0) * 0.18)}</span> checks
                            </td>
                            <td className="px-5 py-3.5 text-[13.5px] text-ink-mid"><span className="font-mono tabular-nums">$1.00</span>/check</td>
                            <td className="px-5 py-3.5 font-mono text-[14px] font-bold text-ink-hi text-right">
                              ${(Math.round((currentProfile.kycCount || 0) * 0.18) * 1.0).toFixed(2)}
                            </td>
                          </tr>
                          <tr>
                            <td className="px-5 py-3.5">
                              <div className="font-bold text-[14px] text-ink-hi">PEP screening (Politically Exposed Persons)</div>
                            </td>
                            <td className="px-5 py-3.5 text-[13.5px] text-ink-hi">
                              <span className="font-mono tabular-nums">{currentProfile.kycCount || 0}</span> checks
                            </td>
                            <td className="px-5 py-3.5 text-[13.5px] text-ink-mid"><span className="font-mono tabular-nums">$0.20</span>/check</td>
                            <td className="px-5 py-3.5 font-mono text-[14px] font-bold text-ink-hi text-right">
                              ${((currentProfile.kycCount || 0) * 0.2).toFixed(2)}
                            </td>
                          </tr>
                          <tr>
                            <td className="px-5 py-3.5">
                              <div className="font-bold text-[14px] text-ink-hi">Sanctions screening</div>
                            </td>
                            <td className="px-5 py-3.5 text-[13.5px] text-ink-hi">
                              <span className="font-mono tabular-nums">{currentProfile.kycCount || 0}</span> checks
                            </td>
                            <td className="px-5 py-3.5 text-[13.5px] text-ink-mid"><span className="font-mono tabular-nums">$0.20</span>/check</td>
                            <td className="px-5 py-3.5 font-mono text-[14px] font-bold text-ink-hi text-right">
                              ${((currentProfile.kycCount || 0) * 0.2).toFixed(2)}
                            </td>
                          </tr>
                          <tr>
                            <td className="px-5 py-3.5">
                              <div className="font-bold text-[14px] text-ink-hi">Adverse media screening</div>
                            </td>
                            <td className="px-5 py-3.5 text-[13.5px] text-ink-hi">
                              <span className="font-mono tabular-nums">{currentProfile.kycCount || 0}</span> checks
                            </td>
                            <td className="px-5 py-3.5 text-[13.5px] text-ink-mid"><span className="font-mono tabular-nums">$0.25</span>/check</td>
                            <td className="px-5 py-3.5 font-mono text-[14px] font-bold text-ink-hi text-right">
                              ${((currentProfile.kycCount || 0) * 0.25).toFixed(2)}
                            </td>
                          </tr>
                          <tr>
                            <td className="px-5 py-3.5">
                              <div className="font-bold text-[14px] text-ink-hi">Confirmation of Payee (CoP)</div>
                            </td>
                            <td className="px-5 py-3.5 text-[13.5px] text-ink-hi">
                              <span className="font-mono tabular-nums">{currentProfile.payoutsCount || 0}</span> lookups
                            </td>
                            <td className="px-5 py-3.5 text-[13.5px] text-ink-mid"><span className="font-mono tabular-nums">$0.35</span>/lookup</td>
                            <td className="px-5 py-3.5 font-mono text-[14px] font-bold text-ink-hi text-right">
                              ${((currentProfile.payoutsCount || 0) * 0.35).toFixed(2)}
                            </td>
                          </tr>
                          <tr>
                            <td className="px-5 py-3.5">
                              <div className="font-bold text-[14px] text-ink-hi">CoP retry check</div>
                            </td>
                            <td className="px-5 py-3.5 text-[13.5px] text-ink-hi">
                              <span className="font-mono tabular-nums">{Math.round((currentProfile.payoutsCount || 0) * 0.06)}</span> lookups
                            </td>
                            <td className="px-5 py-3.5 text-[13.5px] text-ink-mid"><span className="font-mono tabular-nums">$0.35</span>/retry</td>
                            <td className="px-5 py-3.5 font-mono text-[14px] font-bold text-ink-hi text-right">
                              ${(Math.round((currentProfile.payoutsCount || 0) * 0.06) * 0.35).toFixed(2)}
                            </td>
                          </tr>
                          <tr>
                            <td className="px-5 py-3.5">
                              <div className="font-bold text-[14px] text-ink-hi">AUSTRAC SMR report generator</div>
                            </td>
                            <td className="px-5 py-3.5 text-[13.5px] text-ink-hi">
                              <span className="font-mono tabular-nums">{currentProfile.reportsCount}</span> reports
                            </td>
                            <td className="px-5 py-3.5 text-[13.5px] text-ink-mid"><span className="font-mono tabular-nums">$5.00</span>/filing</td>
                            <td className="px-5 py-3.5 font-mono text-[14px] font-bold text-ink-hi text-right">{currentProfile.reportsTotal}</td>
                          </tr>
                          <tr>
                            <td className="px-5 py-3.5">
                              <div className="font-bold text-[14px] text-ink-hi">Connected EGM telemetry module</div>
                            </td>
                            <td className="px-5 py-3.5 text-[13.5px] text-ink-hi">
                              <span className="font-mono tabular-nums">{currentProfile.machinesCount}</span> machines
                            </td>
                            <td className="px-5 py-3.5 text-[13.5px] text-ink-mid"><span className="font-mono tabular-nums">$2.50</span>/unit/mo</td>
                            <td className="px-5 py-3.5 font-mono text-[14px] font-bold text-ink-hi text-right">{currentProfile.machinesTotal}</td>
                          </tr>
                          <tr className="bg-surface-th font-bold">
                            <td colSpan={3} className="px-5 py-4 text-[14.5px] text-ink-hi">
                              Estimated current billing cycle total
                            </td>
                            <td className="px-5 py-4 font-mono text-[16px] font-bold text-brand text-right">
                              {currentProfile.totalPeriod}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                      </div>
                    </div>
                  </div>

                  {/* Step 2: why the identity-verification portion of that bill is cheaper than it looks */}
                  <div>
                    <h3 className="text-[15px] font-bold text-ink-hi mb-1">Verification savings analysis</h3>
                    <p className="text-[13px] text-ink-mid mt-0 mb-4">
                      How the flat per-payout verification rate compares to paying for each identity check separately, with the payout-by-payout evidence behind it.
                    </p>
                    <ApiCallTelemetryView currentProfile={currentProfile} />
                  </div>
                </div>
              )}

              {/* ── Tab 2: Billing History ── */}
              {activeTab === 'history' && (
                <div>
                  <div className="flex justify-between items-center mb-5">
                    <div>
                      <h2 className="text-[17px] font-bold text-[#102a43] m-0 font-sans">Billing History &amp; Tax Invoices</h2>
                      <p className="text-[13px] text-[#627d98] mt-1 mb-0 font-sans">
                        Download itemized PDF receipts for auditing and financial reconciliation.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => showToast('Venue ledger CSV exported.')}
                      className="h-[36px] px-3.5 rounded-[6px] text-[13px] font-bold bg-white border border-[#d9e2ec] text-[#102a43] hover:bg-slate-50 transition-colors cursor-pointer font-sans"
                    >
                      Export Ledger
                    </button>
                  </div>

                  <div className="border border-[#d9e2ec] rounded-[8px] overflow-hidden">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-[#f8fafb] border-b border-[#d9e2ec]">
                          <th className="text-left px-5 py-3.5 text-[#627d98] text-[12px] font-bold font-sans">Tax Invoice #</th>
                          <th className="text-left px-5 py-3.5 text-[#627d98] text-[12px] font-bold font-sans">Billing Period</th>
                          <th className="text-left px-5 py-3.5 text-[#627d98] text-[12px] font-bold font-sans">Invoice Amount</th>
                          <th className="text-left px-5 py-3.5 text-[#627d98] text-[12px] font-bold font-sans">Status</th>
                          <th className="text-right px-5 py-3.5 text-[#627d98] text-[12px] font-bold font-sans">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentProfile.history.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="px-5 py-8 text-center text-[#627d98] text-[14px] italic font-sans">
                              No billing history records for this venue yet.
                            </td>
                          </tr>
                        ) : (
                          currentProfile.history.map((h, i) => (
                            <tr key={i} className="border-b border-[#edf1f4] last:border-b-0 hover:bg-[#fbfdfd]">
                              <td className="px-5 py-4 font-mono text-[14px] font-bold text-[#0d9488]">{h.inv}</td>
                              <td className="px-5 py-4 font-mono text-[13.5px] text-[#102a43]">{h.period}</td>
                              <td className="px-5 py-4 font-mono text-[14px] font-bold text-[#102a43]">{h.amount}</td>
                              <td className="px-5 py-4">
                                <StatusBadge variant={h.statusVariant}>{h.status}</StatusBadge>
                              </td>
                              <td className="px-5 py-4 text-right">
                                <button
                                  type="button"
                                  onClick={() => showToast(`Downloading invoice PDF for ${h.inv}`)}
                                  className="h-[32px] px-3 rounded-[5px] text-[12px] font-bold bg-white border border-[#d9e2ec] text-[#102a43] hover:bg-slate-50 transition-colors cursor-pointer font-sans"
                                >
                                  Download PDF
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ── Tab 3: Payment Method ── */}
              {activeTab === 'payment' && (
                <div>
                  <div className="mb-5">
                    <h2 className="text-[17px] font-bold text-[#102a43] m-0 font-sans">Payment Method &amp; Direct Debit</h2>
                    <p className="text-[13px] text-[#627d98] mt-1 mb-0 font-sans">
                      Primary payment source used for automated end-of-cycle settlement.
                    </p>
                  </div>

                  {/* Credit Card UI Component */}
                  <div className="p-6 border border-[#d9e2ec] rounded-[8px] bg-white max-w-[500px] shadow-sm">
                    <div className="flex items-center justify-between mb-5">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[12px] font-bold bg-[#ecfdf5] text-[#059669] border border-[#a7f3d0]">
                        Primary Payment Method
                      </span>
                      <span className="font-bold text-[14px] text-[#102a43] font-sans">Mastercard</span>
                    </div>

                    <div className="font-mono text-[20px] font-bold tracking-[0.12em] text-[#102a43] mb-4">
                      &bull;&bull;&bull;&bull; &bull;&bull;&bull;&bull; &bull;&bull;&bull;&bull; 4242
                    </div>

                    <div className="flex justify-between text-[13px] text-[#627d98] font-sans">
                      <div>Expires: <strong className="text-[#102a43] font-mono">08/28</strong></div>
                      <div>Cardholder: <strong className="text-[#102a43]">{currentProfile.cardholder}</strong></div>
                    </div>

                    <div className="flex items-center gap-3 mt-6 pt-4 border-t border-[#edf1f4]">
                      <button
                        type="button"
                        onClick={() => showToast('Update card workflow opened.')}
                        className="h-[38px] px-4 rounded-[6px] text-[13.5px] font-bold bg-white border border-[#d9e2ec] text-[#102a43] hover:bg-slate-50 transition-colors cursor-pointer font-sans"
                      >
                        Update Card
                      </button>
                      <button
                        type="button"
                        onClick={() => showToast('Direct debit credentials opened.')}
                        className="h-[38px] px-4 rounded-[6px] text-[13.5px] font-bold bg-white border border-[#d9e2ec] text-[#102a43] hover:bg-slate-50 transition-colors cursor-pointer font-sans"
                      >
                        Set Direct Debit
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* ── Tab 4: Plan & Subscription ── */}
              {activeTab === 'plan' && (
                <div>
                  <div className="mb-6">
                    <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
                      <h2 className="text-[20px] sm:text-[22px] font-bold text-[#102a43] m-0 font-sans tracking-tight">
                        Subscription + usage, three tiers
                      </h2>
                    </div>
                    <p className="text-[13.5px] text-[#627d98] mt-1.5 mb-0 font-sans max-w-[70ch]">
                      Configure monthly base plan and per-payout compliance rates. {isSuperAdmin ? 'Venue plans are managed by venue administrators.' : 'Select a tier below to update this venue’s subscription.'}
                    </p>
                  </div>

                  {/* 3-Tier Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mt-4">
                    
                    {/* TIER 1 */}
                    <div className={`p-6 rounded-[10px] bg-white border flex flex-col justify-between transition-all
                      ${venuePlans[currentProfile.venueName] === 'tier-1'
                        ? 'border-2 border-[#0d9488] shadow-md ring-1 ring-[#0d9488]/20'
                        : 'border-[#d9e2ec] shadow-sm hover:border-[#cbd5e1]'}`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-[12.5px] font-bold text-[#627d98] uppercase tracking-wider font-sans">
                            Tier 1
                          </span>
                          {venuePlans[currentProfile.venueName] === 'tier-1' && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11.5px] font-bold bg-[#ecfdf5] text-[#059669] border border-[#a7f3d0]">
                              Active Plan
                            </span>
                          )}
                        </div>

                        <div className="text-[18px] font-bold text-[#102a43] leading-snug font-sans mb-4">
                          3 months free, then <span className="font-mono">$12</span>/payout
                        </div>

                        <div className="pt-4 border-t border-[#edf1f4] flex flex-col gap-2.5 text-[13.5px] text-[#486581] font-sans mb-6">
                          <div className="flex items-start gap-2">
                            <Check className="w-4 h-4 text-[#0d9488] flex-shrink-0 mt-0.5" />
                            <span className="font-medium text-[#102a43]">Basic IDV + Basic AML</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <Check className="w-4 h-4 text-[#0d9488] flex-shrink-0 mt-0.5" />
                            <span>No monthly fee</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <div className="text-[26px] font-mono font-bold text-[#102a43] mb-4">
                          $0<span className="text-[13.5px] font-normal text-[#627d98] font-sans">/mo</span>
                        </div>

                        {venuePlans[currentProfile.venueName] === 'tier-1' ? (
                          !isSuperAdmin ? (
                            <button
                              type="button"
                              disabled
                              className="w-full h-[40px] rounded-[6px] text-[13.5px] font-bold bg-slate-100 border border-[#d9e2ec] text-[#627d98] cursor-not-allowed font-sans"
                            >
                              Active Plan
                            </button>
                          ) : null
                        ) : !isSuperAdmin ? (
                          <button
                            type="button"
                            onClick={() => handleInitiatePlanChange(currentProfile.venueName, 'tier-1', 'Tier 1')}
                            className="w-full h-[40px] rounded-[6px] text-[13.5px] font-bold bg-white border-2 border-[#0d9488] text-[#0d9488] hover:bg-[#f0fdfa] cursor-pointer transition-colors font-sans"
                          >
                            Select Tier 1
                          </button>
                        ) : null}
                      </div>
                    </div>

                    {/* TIER 2 */}
                    <div className={`p-6 rounded-[10px] flex flex-col justify-between transition-all relative
                      ${venuePlans[currentProfile.venueName] === 'tier-2'
                        ? 'border-2 border-[#0d9488] bg-[#f0fdfa]/40 shadow-md ring-1 ring-[#0d9488]/30'
                        : !isSuperAdmin
                        ? 'border border-[#0d9488]/60 bg-[#f8fafb] shadow-sm hover:border-[#0d9488]'
                        : 'border border-[#d9e2ec] bg-white shadow-sm'}`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <span className="text-[12.5px] font-bold text-[#102a43] uppercase tracking-wider font-sans">
                              Tier 2
                            </span>
                            {!isSuperAdmin && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-[#0d9488] text-white tracking-wide uppercase font-sans">
                                Recommended
                              </span>
                            )}
                          </div>
                          {venuePlans[currentProfile.venueName] === 'tier-2' && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11.5px] font-bold bg-[#ecfdf5] text-[#059669] border border-[#a7f3d0]">
                              Active Plan
                            </span>
                          )}
                        </div>

                        <div className="text-[18px] font-bold text-[#102a43] leading-snug font-sans mb-4">
                          <span className="font-mono">$249</span>/mo + <span className="font-mono">$6</span>/payout
                        </div>

                        <div className="pt-4 border-t border-[#edf1f4] flex flex-col gap-2.5 text-[13.5px] text-[#486581] font-sans mb-6">
                          <div className="flex items-start gap-2">
                            <Check className="w-4 h-4 text-[#0d9488] flex-shrink-0 mt-0.5" />
                            <span className="font-medium text-[#102a43]">Advanced IDV + Advanced AML</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <Check className="w-4 h-4 text-[#0d9488] flex-shrink-0 mt-0.5" />
                            <span>Best balance of depth and unit cost</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <div className="text-[26px] font-mono font-bold text-[#102a43] mb-4">
                          $249<span className="text-[13.5px] font-normal text-[#627d98] font-sans">/mo</span>
                        </div>

                        {venuePlans[currentProfile.venueName] === 'tier-2' ? (
                          !isSuperAdmin ? (
                            <button
                              type="button"
                              disabled
                              className="w-full h-[40px] rounded-[6px] text-[13.5px] font-bold bg-slate-100 border border-[#d9e2ec] text-[#627d98] cursor-not-allowed font-sans"
                            >
                              Active Plan
                            </button>
                          ) : null
                        ) : !isSuperAdmin ? (
                          <button
                            type="button"
                            onClick={() => handleInitiatePlanChange(currentProfile.venueName, 'tier-2', 'Tier 2')}
                            className="w-full h-[40px] rounded-[6px] text-[13.5px] font-bold bg-[#0d9488] hover:bg-[#0b7a6f] text-white border-none cursor-pointer transition-colors font-sans shadow-sm"
                          >
                            Select Tier 2
                          </button>
                        ) : null}
                      </div>
                    </div>

                    {/* TIER 3 */}
                    <div className={`p-6 rounded-[10px] bg-white border flex flex-col justify-between transition-all
                      ${venuePlans[currentProfile.venueName] === 'tier-3'
                        ? 'border-2 border-[#0d9488] shadow-md ring-1 ring-[#0d9488]/20'
                        : 'border-[#d9e2ec] shadow-sm hover:border-[#cbd5e1]'}`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-[12.5px] font-bold text-[#627d98] uppercase tracking-wider font-sans">
                            Tier 3
                          </span>
                          {venuePlans[currentProfile.venueName] === 'tier-3' && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11.5px] font-bold bg-[#ecfdf5] text-[#059669] border border-[#a7f3d0]">
                              Active Plan
                            </span>
                          )}
                        </div>

                        <div className="text-[18px] font-bold text-[#102a43] leading-snug font-sans mb-4">
                          <span className="font-mono">$699</span>/mo + <span className="font-mono">$4</span>/payout
                        </div>

                        <div className="pt-4 border-t border-[#edf1f4] flex flex-col gap-2.5 text-[13.5px] text-[#486581] font-sans mb-6">
                          <div className="flex items-start gap-2">
                            <Check className="w-4 h-4 text-[#0d9488] flex-shrink-0 mt-0.5" />
                            <span className="font-medium text-[#102a43]">Advanced IDV + Advanced AML</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <Check className="w-4 h-4 text-[#0d9488] flex-shrink-0 mt-0.5" />
                            <span>Integrations + automatic risk ratings &amp; escalations</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <Check className="w-4 h-4 text-[#0d9488] flex-shrink-0 mt-0.5" />
                            <span>Best fit for high-volume/high-risk payouts</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <div className="text-[26px] font-mono font-bold text-[#102a43] mb-4">
                          $699<span className="text-[13.5px] font-normal text-[#627d98] font-sans">/mo</span>
                        </div>

                        {venuePlans[currentProfile.venueName] === 'tier-3' ? (
                          !isSuperAdmin ? (
                            <button
                              type="button"
                              disabled
                              className="w-full h-[40px] rounded-[6px] text-[13.5px] font-bold bg-slate-100 border border-[#d9e2ec] text-[#627d98] cursor-not-allowed font-sans"
                            >
                              Active Plan
                            </button>
                          ) : null
                        ) : !isSuperAdmin ? (
                          <button
                            type="button"
                            onClick={() => handleInitiatePlanChange(currentProfile.venueName, 'tier-3', 'Tier 3')}
                            className="w-full h-[40px] rounded-[6px] text-[13.5px] font-bold bg-white border-2 border-[#0d9488] text-[#0d9488] hover:bg-[#f0fdfa] cursor-pointer transition-colors font-sans"
                          >
                            Select Tier 3
                          </button>
                        ) : null}
                      </div>
                    </div>

                  </div>

                  {/* Footnote / Baseline comparison */}
                  <div className="mt-6 p-4 rounded-lg bg-[#f8fafb] border border-[#d9e2ec] text-[13.5px] text-[#486581] font-sans flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      Current model: <strong className="text-[#102a43] font-mono font-bold">$4.40</strong> for standalone ID verification and <strong className="text-[#102a43] font-mono font-bold">$8.90</strong> for combined services.
                    </div>
                    <span className="text-[12px] text-[#829ab1] font-medium font-sans">
                      All rates in AUD ex. GST
                    </span>
                  </div>
                </div>
              )}

            </div>
          </section>
        </>
      )}
      {/* ─── CONFIRM PLAN CHANGE MODAL ─── */}
      {pendingPlan && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/65 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setPendingPlan(null)}
        >
          <div
            className="bg-white rounded-[12px] border border-[#d9e2ec] max-w-lg w-full p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150 font-sans"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-[#edf1f4]">
              <div>
                <h3 className="text-[18px] font-bold text-[#102a43] m-0">
                  Confirm Plan Change
                </h3>
                <p className="text-[13px] text-[#627d98] mt-1 mb-0">
                  Updating subscription tier for <strong className="text-[#102a43]">{pendingPlan.venueName}</strong>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPendingPlan(null)}
                className="text-[#64748b] hover:text-[#102a43] p-1.5 rounded-md hover:bg-slate-100 transition-colors cursor-pointer bg-transparent border-none"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Plan Comparison Box */}
            <div className="my-5 p-4 rounded-lg bg-[#f8fafb] border border-[#d9e2ec]">
              <div className="grid grid-cols-2 gap-4 items-center">
                {/* From Plan */}
                <div className="p-3.5 bg-white rounded-md border border-[#e2e8f0]">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-[#64748b]">Current Plan</div>
                  <div className="text-[16px] font-bold text-[#102a43] mt-1">
                    {TIER_DETAILS[pendingPlan.currentTierId]?.name || 'Tier 1'}
                  </div>
                  <div className="text-[13px] font-mono text-[#627d98] mt-0.5">
                    {TIER_DETAILS[pendingPlan.currentTierId]?.monthlyPrice}/mo
                  </div>
                </div>

                {/* To Plan */}
                <div className="p-3.5 bg-[#f0fdfa] rounded-md border border-[#99f6e4] ring-1 ring-[#0d9488]/20">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#0d9488]">New Plan</span>
                    <span className="text-[10px] font-bold uppercase tracking-wide bg-[#0d9488] text-white px-1.5 py-0.5 rounded">
                      Selected
                    </span>
                  </div>
                  <div className="text-[16px] font-bold text-[#102a43] mt-1">
                    {TIER_DETAILS[pendingPlan.targetTierId]?.name}
                  </div>
                  <div className="text-[13px] font-mono font-bold text-[#0d9488] mt-0.5">
                    {TIER_DETAILS[pendingPlan.targetTierId]?.monthlyPrice}/mo
                  </div>
                </div>
              </div>

              {/* Rate Detail */}
              <div className="mt-3.5 pt-3 border-t border-[#edf1f4] flex items-center justify-between text-[12.5px] text-[#486581]">
                <span>New per-payout compliance rate:</span>
                <span className="font-mono font-bold text-[#102a43]">
                  {TIER_DETAILS[pendingPlan.targetTierId]?.rateDisplay}
                </span>
              </div>
            </div>

            {/* Billing Note */}
            <div className="text-[13px] text-[#627d98] space-y-1.5 mb-6">
              <p className="m-0 leading-relaxed">
                • Changes take effect immediately upon confirmation.
              </p>
              <p className="m-0 leading-relaxed">
                • Next invoice on <strong className="text-[#102a43] font-mono">{currentProfile?.nextInvoice || '01 Sep 2026'}</strong> will reflect prorated subscription charges.
              </p>
              <p className="m-0 leading-relaxed">
                • Automatic settlement via <strong className="text-[#102a43]">Mastercard •••• 4242</strong>.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#edf1f4]">
              <button
                type="button"
                onClick={() => setPendingPlan(null)}
                className="h-[40px] px-4 rounded-[6px] text-[13.5px] font-bold text-[#475569] bg-white border border-[#d9e2ec] hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmPlanChange}
                className="h-[40px] px-5 rounded-[6px] text-[13.5px] font-bold text-white bg-[#0d9488] hover:bg-[#0b7a6f] transition-colors cursor-pointer shadow-sm"
              >
                Confirm &amp; Switch Plan
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
