'use client';

import React, { useState } from 'react';
import { Save, Check, ShieldCheck, Scale, Info, Building2 } from 'lucide-react';
import AdminShell from '@/components/layout/AdminShell';
import SegmentedBooleanToggle from '@/components/ui/SegmentedBooleanToggle';

export default function SuperAdminAdministrationPage() {
  const [activeTab, setActiveTab] = useState('settings');
  const [savedNotice, setSavedNotice] = useState(false);

  // Settings
  const [defaultDelay, setDefaultDelay] = useState('24 hours');
  const [defaultApprovers, setDefaultApprovers] = useState('2 approvers');
  const [defaultRisk, setDefaultRisk] = useState('Require manual review');
  const [defaultRetention, setDefaultRetention] = useState('7 years');
  const [notes, setNotes] = useState('All mock settings are stored in this browser session for UI demonstration.');

  // Compliance platform defaults state
  const [defaultRequireSub5kIDV, setDefaultRequireSub5kIDV] = useState(false);
  const [defaultAllowCash, setDefaultAllowCash] = useState(true);
  const [defaultSuspiciousAnalysis, setDefaultSuspiciousAnalysis] = useState(true);
  const [defaultSkipIdThreshold, setDefaultSkipIdThreshold] = useState(500);
  const [complianceSavedNotice, setComplianceSavedNotice] = useState(false);

  // Notifications state
  const [notifications, setNotifications] = useState([
    { event: 'Failed payment', subtext: 'Immediate operational alert', recipients: 'Super Admin, client billing', channel: 'Email', enabled: true },
    { event: 'SMR ready for review', subtext: 'Compliance workflow update', recipients: 'Super Admin, venue admin', channel: 'Email', enabled: true },
    { event: 'Machine inactive', subtext: 'Operational status update', recipients: 'Venue admin', channel: 'Email', enabled: false },
  ]);

  const auditEvents = [
    { time: '12m ago', actor: 'J. Chen', action: 'Disbursement threshold updated', entity: 'Riverside RSL Club' },
    { time: '1h ago', actor: 'D. Walsh', action: 'SMR Draft created for PEP match', entity: 'Northside Leagues Club' },
    { time: '3h ago', actor: 'System', action: 'New venue registered and provisioned', entity: 'Harbourview Hotel' },
    { time: '5h ago', actor: 'System', action: 'Payment rejected by bank gateway', entity: 'Riverside Grand Bistro' },
  ];

  const handleSave = (e) => {
    e.preventDefault();
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
  };

  const handleSaveCompliance = (e) => {
    e.preventDefault();
    setComplianceSavedNotice(true);
    setTimeout(() => setComplianceSavedNotice(false), 3000);
  };

  const toggleNotification = (idx) => {
    setNotifications((prev) =>
      prev.map((n, i) => (i === idx ? { ...n, enabled: !n.enabled } : n))
    );
  };

  const statutoryCashLimits = [
    { state: 'NSW', name: 'New South Wales', act: 'Gaming Machines Act 2001', limit: '$5,000.00 AUD', status: 'Enforced' },
    { state: 'VIC', name: 'Victoria', act: 'Gambling Regulation Act 2003', limit: '$2,000.00 AUD', status: 'Enforced' },
    { state: 'ACT', name: 'Australian Capital Territory', act: 'Gaming Machine Act 2004', limit: '$1,200.00 AUD', status: 'Enforced' },
    { state: 'NT', name: 'Northern Territory', act: 'Gaming Control Act 1993', limit: '$500.00 AUD', status: 'Enforced' },
    { state: 'SA', name: 'South Australia', act: 'Gaming Machines Act 1992', limit: '$2,000.00 AUD', status: 'Enforced' },
    { state: 'TAS', name: 'Tasmania', act: 'Gaming Control Act 1993', limit: '$1,500.00 AUD', status: 'Enforced' },
    { state: 'QLD', name: 'Queensland', act: 'Gaming Machine Act 1991', limit: 'Venue ICS default ($1,000.00 AUD)', status: 'Venue-set' },
    { state: 'WA', name: 'Western Australia', act: 'Casino Control Act 1984', limit: 'N/A (EGMs prohibited in clubs/pubs)', status: 'Exempt' },
  ];

  const venueIntegrations = [
    {
      venue: 'Riverside RSL Club',
      client: 'Riverside Leagues Ltd',
      system: 'Max Gaming',
      mode: 'REST API v1',
      writeBack: 'Yes',
      status: 'Connected',
      lastSync: 'Today, 10:14 AEST'
    },
    {
      venue: 'Northside Leagues Club',
      client: 'Northside Group',
      system: 'LMO',
      mode: 'REST API v2',
      writeBack: 'Yes',
      status: 'Connected',
      lastSync: 'Today, 09:40 AEST'
    },
    {
      venue: 'Harbourview Hotel',
      client: 'Harbour Hospitality',
      system: 'Max Gaming',
      mode: 'REST API v1',
      writeBack: 'No',
      status: 'Connected',
      lastSync: 'Yesterday, 21:15 AEST'
    },
    {
      venue: 'St George Motor Boat Club',
      client: 'St George Leisure',
      system: 'Custom / Legacy',
      mode: 'Embedded Iframe',
      writeBack: 'No',
      status: 'Connected',
      lastSync: '14/07/2026 14:00 AEST'
    },
    {
      venue: 'Dee Why RSL',
      client: 'Northern Beaches Ent.',
      system: 'None',
      mode: 'Manual entry',
      writeBack: 'No',
      status: 'Not configured',
      lastSync: '—'
    }
  ];

  return (
    <AdminShell role="SUPER ADMIN">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5 mb-7">
        <div>
          <h1 className="text-[28px] font-bold text-[#102a43] tracking-tight m-0 leading-tight">
            Administration
          </h1>
          <p className="text-[14.5px] text-[#627d98] mt-2 mb-0 max-w-[68ch] leading-relaxed">
            Configure platform defaults, notification behavior, and review Super Admin activity.
          </p>
        </div>
      </div>

      {savedNotice && (
        <div className="p-3.5 rounded-lg bg-white border border-[#cbd5e1] border-l-[3px] border-l-[#0d9488] shadow-2xs text-[13px] font-bold text-[#102a43] flex items-center gap-2.5 mb-5">
          <Check className="w-4 h-4 text-[#0d9488]" />
          <span>Global platform configuration updated successfully.</span>
        </div>
      )}

      {complianceSavedNotice && (
        <div className="p-3.5 rounded-lg bg-white border border-[#cbd5e1] border-l-[3px] border-l-[#0d9488] shadow-2xs text-[13px] font-bold text-[#102a43] flex items-center gap-2.5 mb-5">
          <Check className="w-4 h-4 text-[#0d9488]" />
          <span>Platform compliance policies updated successfully.</span>
        </div>
      )}

      {/* Main Container */}
      <section className="bg-white border border-[#d9e2ec] rounded-[10px] overflow-hidden">
        {/* Tabs Bar */}
        <div className="flex border-b border-[#d9e2ec] px-5 pt-3 gap-6 text-[13.5px]">
          {['settings', 'compliance', 'notifications', 'integrations', 'audit'].map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setActiveTab(t)}
              className={`pb-3 font-bold border-b-2 transition-colors cursor-pointer capitalize
                ${
                  activeTab === t
                    ? 'border-[#0d9488] text-[#0d9488]'
                    : 'border-transparent text-[#627d98] hover:text-[#102a43]'
                }`}
            >
              {t === 'settings'
                ? 'Global Settings'
                : t === 'compliance'
                ? 'Compliance & AML'
                : t === 'notifications'
                ? 'Notifications'
                : t === 'integrations'
                ? 'Club Integrations'
                : 'Audit Log'}
            </button>
          ))}
        </div>

        <div className="p-6">
          {activeTab === 'settings' && (
            <form onSubmit={handleSave} className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl text-xs">
              <div className="space-y-1">
                <label className="text-[12px] font-bold text-[#627d98]">Default Payout Delay</label>
                <select
                  value={defaultDelay}
                  onChange={(e) => setDefaultDelay(e.target.value)}
                  className="w-full h-10 px-3 border border-[#d9e2ec] rounded-md text-[13.5px] text-[#102a43] outline-none focus:border-[#0d9488]"
                >
                  <option>24 hours</option>
                  <option>12 hours</option>
                  <option>48 hours</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[12px] font-bold text-[#627d98]">Required Approvers</label>
                <select
                  value={defaultApprovers}
                  onChange={(e) => setDefaultApprovers(e.target.value)}
                  className="w-full h-10 px-3 border border-[#d9e2ec] rounded-md text-[13.5px] text-[#102a43] outline-none focus:border-[#0d9488]"
                >
                  <option>2 approvers</option>
                  <option>1 approver</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[12px] font-bold text-[#627d98]">High-Risk Review Policy</label>
                <select
                  value={defaultRisk}
                  onChange={(e) => setDefaultRisk(e.target.value)}
                  className="w-full h-10 px-3 border border-[#d9e2ec] rounded-md text-[13.5px] text-[#102a43] outline-none focus:border-[#0d9488]"
                >
                  <option>Require manual review</option>
                  <option>Allow authoriser review</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[12px] font-bold text-[#627d98]">Audit Retention</label>
                <select
                  value={defaultRetention}
                  onChange={(e) => setDefaultRetention(e.target.value)}
                  className="w-full h-10 px-3 border border-[#d9e2ec] rounded-md text-[13.5px] text-[#102a43] outline-none focus:border-[#0d9488]"
                >
                  <option>7 years</option>
                  <option>5 years</option>
                  <option>10 years</option>
                </select>
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="text-[12px] font-bold text-[#627d98]">Platform Notes</label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full p-3 border border-[#d9e2ec] rounded-md text-[13.5px] text-[#102a43] outline-none focus:border-[#0d9488]"
                />
              </div>

              <div className="sm:col-span-2 pt-2">
                <button
                  type="submit"
                  className="inline-flex items-center justify-center min-h-[40px] px-4 rounded-md text-[13px] font-bold text-white bg-[#0d9488] hover:bg-[#0b7a6f] transition-colors cursor-pointer gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Settings</span>
                </button>
              </div>
            </form>
          )}

          {activeTab === 'compliance' && (
            <div className="space-y-8">
              {/* Top Intro */}
              <div>
                <h2 className="text-[18px] font-bold text-[#102a43] m-0">
                  Compliance and AML policies
                </h2>
                <p className="text-[13.5px] text-[#627d98] mt-1 mb-0 max-w-[72ch] leading-relaxed">
                  Super Admin platform-level regulatory policies, statutory state gaming cash limits, and baseline compliance defaults provisioned for new venues.
                </p>
              </div>

              {/* 1. National AUSTRAC AML Threshold */}
              <div className="border border-[#d9e2ec] rounded-lg overflow-hidden bg-white">
                <div className="p-4 border-b border-[#d9e2ec] bg-[#f8fafb] flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#0d9488]" />
                    <h3 className="text-[14px] font-bold text-[#102a43] m-0">
                      National AUSTRAC AML threshold (statutory)
                    </h3>
                  </div>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#ecfdf5] text-[#065f46] border border-[#a7f3d0]">
                    Statutory fixed
                  </span>
                </div>
                <div className="p-5 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <span className="text-[13px] font-medium text-[#627d98] block">Federal AML identification & screening threshold</span>
                      <span className="text-[22px] font-bold font-mono text-[#102a43] block mt-0.5">$5,000.00 AUD</span>
                    </div>
                    <div className="max-w-md text-[12.5px] text-[#627d98] leading-relaxed">
                      Under the <em>Anti-Money Laundering and Counter-Terrorism Financing Act 2006</em>, all gaming machine and venue payouts of $5,000.00 AUD or higher strictly require Customer Due Diligence (CDD): DVS electronic identity verification, PEP & sanctions watchlist screening, and Confirmation of Payee.
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. Platform Default Rules for New Venues */}
              <form onSubmit={handleSaveCompliance} className="border border-[#d9e2ec] rounded-lg overflow-hidden bg-white">
                <div className="p-4 border-b border-[#d9e2ec] bg-[#f8fafb] flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-[#0d9488]" />
                    <h3 className="text-[14px] font-bold text-[#102a43] m-0">
                      Platform defaults for new venue onboarding
                    </h3>
                  </div>
                  <span className="text-[12px] text-[#627d98]">Applies to newly created venues</span>
                </div>

                <div className="p-5 space-y-5">
                  <div className="space-y-3">
                    {/* Toggle 1: Default Sub-$5,000 IDV policy */}
                    <div className="flex items-center justify-between p-3.5 border border-[#e2e8f0] rounded-lg bg-white">
                      <div>
                        <span className="text-[13.5px] font-semibold text-[#102a43] block">
                          Default require IDV & screening below $5,000 AML threshold
                        </span>
                        <span className="text-[12px] text-[#627d98] block mt-0.5">
                          When enabled, new venues will default to requiring identity verification and watchlist screening for all payouts, even under $5,000 AUD.
                        </span>
                      </div>
                      <SegmentedBooleanToggle
                        value={defaultRequireSub5kIDV}
                        onChange={(val) => setDefaultRequireSub5kIDV(val)}
                        trueLabel="Enabled"
                        falseLabel="Disabled"
                      />
                    </div>

                    {/* Toggle 2: Default Allow Cash / No-EFT */}
                    <div className="flex items-center justify-between p-3.5 border border-[#e2e8f0] rounded-lg bg-white">
                      <div>
                        <span className="text-[13.5px] font-semibold text-[#102a43] block">
                          Default allow cash / No-EFT payouts
                        </span>
                        <span className="text-[12px] text-[#627d98] block mt-0.5">
                          Permit floor staff to disburse cash portions up to the venue's legal limit by default.
                        </span>
                      </div>
                      <SegmentedBooleanToggle
                        value={defaultAllowCash}
                        onChange={(val) => setDefaultAllowCash(val)}
                        trueLabel="Enabled"
                        falseLabel="Disabled"
                      />
                    </div>

                    {/* Toggle 3: Default Suspicious Transaction Analysis */}
                    <div className="flex items-center justify-between p-3.5 border border-[#e2e8f0] rounded-lg bg-white">
                      <div>
                        <span className="text-[13.5px] font-semibold text-[#102a43] block">
                          Default suspicious transaction analysis (AML engine)
                        </span>
                        <span className="text-[12px] text-[#627d98] block mt-0.5">
                          Enable automated heuristic risk scoring and SMR preparation by default on new venues.
                        </span>
                      </div>
                      <SegmentedBooleanToggle
                        value={defaultSuspiciousAnalysis}
                        onChange={(val) => setDefaultSuspiciousAnalysis(val)}
                        trueLabel="Enabled"
                        falseLabel="Disabled"
                      />
                    </div>

                    {/* Input: Default Skip ID Threshold */}
                    <div className="p-3.5 border border-[#e2e8f0] rounded-lg bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <span className="text-[13.5px] font-semibold text-[#102a43] block">
                          Default skip ID threshold (AUD)
                        </span>
                        <span className="text-[12px] text-[#627d98] block mt-0.5">
                          Default dollar cutoff below which venues with skip ID enabled may bypass IDV.
                        </span>
                      </div>
                      <div className="relative w-40 flex-shrink-0">
                        <span className="absolute left-3 top-2 text-[13.5px] text-[#627d98] font-mono select-none">$</span>
                        <input
                          type="number"
                          min="0"
                          step="50"
                          value={defaultSkipIdThreshold}
                          onChange={(e) => setDefaultSkipIdThreshold(Number(e.target.value))}
                          className="w-full h-9 pl-7 pr-3 border border-[#cbd5e1] rounded-md text-[13.5px] font-mono text-[#102a43] outline-none focus:border-[#0d9488]"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      className="inline-flex items-center justify-center min-h-[40px] px-4 rounded-md text-[13px] font-bold text-white bg-[#0d9488] hover:bg-[#0b7a6f] transition-colors cursor-pointer gap-1.5"
                    >
                      <Save className="w-4 h-4" />
                      <span>Save Platform Defaults</span>
                    </button>
                  </div>
                </div>
              </form>

              {/* 3. Statutory State & Territory Cash Limits Reference */}
              <div className="border border-[#d9e2ec] rounded-lg overflow-hidden bg-white">
                <div className="p-4 border-b border-[#d9e2ec] bg-[#f8fafb] flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <Scale className="w-4 h-4 text-[#0d9488]" />
                    <h3 className="text-[14px] font-bold text-[#102a43] m-0">
                      Australian state and territory gaming cash limits
                    </h3>
                  </div>
                  <span className="text-[12px] text-[#627d98]">Enforced by Cruz Money compliance engine</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full min-w-[700px] border-collapse">
                    <thead>
                      <tr>
                        <th className="text-left px-4 py-3 bg-[#f8fafb] text-[#627d98] border-b border-[#d9e2ec] text-[11px] font-bold tracking-wide uppercase">
                          Jurisdiction
                        </th>
                        <th className="text-left px-4 py-3 bg-[#f8fafb] text-[#627d98] border-b border-[#d9e2ec] text-[11px] font-bold tracking-wide uppercase">
                          Statutory Legislation
                        </th>
                        <th className="text-left px-4 py-3 bg-[#f8fafb] text-[#627d98] border-b border-[#d9e2ec] text-[11px] font-bold tracking-wide uppercase">
                          Cash Limit
                        </th>
                        <th className="text-left px-4 py-3 bg-[#f8fafb] text-[#627d98] border-b border-[#d9e2ec] text-[11px] font-bold tracking-wide uppercase">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {statutoryCashLimits.map((item) => (
                        <tr key={item.state} className="hover:bg-[#fbfdfd] transition-colors">
                          <td className="px-4 py-3.5 border-b border-[#edf1f4] text-[13px] font-bold text-[#102a43]">
                            {item.name} ({item.state})
                          </td>
                          <td className="px-4 py-3.5 border-b border-[#edf1f4] text-[13px] text-[#627d98] italic">
                            {item.act}
                          </td>
                          <td className="px-4 py-3.5 border-b border-[#edf1f4] text-[13px] font-mono font-semibold text-[#102a43]">
                            {item.limit}
                          </td>
                          <td className="px-4 py-3.5 border-b border-[#edf1f4]">
                            <span
                              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold border ${
                                item.status === 'Enforced'
                                  ? 'bg-[#ecfdf5] text-[#065f46] border-[#a7f3d0]'
                                  : item.status === 'Venue-set'
                                  ? 'bg-[#fffbeb] text-[#78350f] border-[#fcd34d]'
                                  : 'bg-[#f8fafc] text-[#475569] border-[#cbd5e1]'
                              }`}
                            >
                              {item.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="p-4 bg-white border-t border-[#d9e2ec] flex items-start gap-2.5 text-[12.5px] text-[#627d98]">
                  <Info className="w-4 h-4 text-[#0d9488] shrink-0 mt-0.5" />
                  <span>
                    The platform compliance engine automatically blocks venues from configuring payout cash limits higher than their statutory state ceiling, and prevents floor collectors from submitting transactions where the cash component exceeds the legal limit.
                  </span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] border-collapse">
                <thead>
                  <tr>
                    <th className="text-left px-4 py-3 bg-[#f8fafb] text-[#627d98] border-b border-[#d9e2ec] text-[11px] font-bold tracking-wide">
                      Event
                    </th>
                    <th className="text-left px-4 py-3 bg-[#f8fafb] text-[#627d98] border-b border-[#d9e2ec] text-[11px] font-bold tracking-wide">
                      Recipients
                    </th>
                    <th className="text-left px-4 py-3 bg-[#f8fafb] text-[#627d98] border-b border-[#d9e2ec] text-[11px] font-bold tracking-wide">
                      Channel
                    </th>
                    <th className="text-left px-4 py-3 bg-[#f8fafb] text-[#627d98] border-b border-[#d9e2ec] text-[11px] font-bold tracking-wide">
                      Status
                    </th>
                    <th className="text-right px-4 py-3 bg-[#f8fafb] text-[#627d98] border-b border-[#d9e2ec] text-[11px] font-bold tracking-wide">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {notifications.map((n, idx) => (
                    <tr key={n.event} className="hover:bg-[#fbfdfd] transition-colors">
                      <td className="px-4 py-3.5 border-b border-[#edf1f4]">
                        <div className="font-bold text-[13.5px] text-[#102a43]">{n.event}</div>
                        <div className="text-[12px] text-[#627d98] mt-0.5">{n.subtext}</div>
                      </td>
                      <td className="px-4 py-3.5 border-b border-[#edf1f4] text-[13px] text-[#102a43]">
                        {n.recipients}
                      </td>
                      <td className="px-4 py-3.5 border-b border-[#edf1f4] text-[13px] text-[#102a43]">
                        {n.channel}
                      </td>
                      <td className="px-4 py-3.5 border-b border-[#edf1f4]">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold border ${
                            n.enabled
                              ? 'bg-[#ecfdf5] text-[#065f46] border-[#6ee7b7]'
                              : 'bg-[#fffbeb] text-[#78350f] border-[#fcd34d]'
                          }`}
                        >
                          {n.enabled ? 'Enabled' : 'Paused'}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 border-b border-[#edf1f4] text-right">
                        <button
                          type="button"
                          onClick={() => toggleNotification(idx)}
                          className="px-3 py-1 text-[12px] font-bold rounded border border-[#d9e2ec] hover:bg-[#f4f7f9] text-[#102a43] cursor-pointer"
                        >
                          {n.enabled ? 'Disable' : 'Enable'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'integrations' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#edf1f4]">
                <div>
                  <h3 className="text-[17px] font-bold text-[#102a43] m-0">Club membership system integrations</h3>
                  <p className="text-[13px] text-[#627d98] mt-0.5 mb-0">
                    Network-wide registry of venue gaming machine &amp; cash-desk databases (Max Gaming, LMO) and write-back synchronization.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[12px] font-bold text-[#627d98]">Total Connected:</span>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#ecfdf5] text-[#065f46] border border-[#a7f3d0]">
                    4 Active Venues
                  </span>
                </div>
              </div>

              {/* Vendor Ownership & Protocol Architecture Card */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg bg-[#f8fafb] border border-[#d9e2ec]">
                  <span className="text-[11px] font-bold text-[#627d98] uppercase tracking-wider block">Vendor Negotiations</span>
                  <span className="text-[13.5px] font-bold text-[#102a43] block mt-1">Akila / Craig / Brien</span>
                  <span className="text-[12px] text-[#627d98] block mt-0.5">Commercial integration agreements</span>
                </div>
                <div className="p-4 rounded-lg bg-[#f8fafb] border border-[#d9e2ec]">
                  <span className="text-[11px] font-bold text-[#627d98] uppercase tracking-wider block">Primary Supported Systems</span>
                  <span className="text-[13.5px] font-bold text-[#102a43] block mt-1">Max Gaming &amp; LMO</span>
                  <span className="text-[12px] text-[#627d98] block mt-0.5">Direct REST API prefill &amp; DVS push</span>
                </div>
                <div className="p-4 rounded-lg bg-[#f8fafb] border border-[#d9e2ec]">
                  <span className="text-[11px] font-bold text-[#627d98] uppercase tracking-wider block">Transitional Fallback</span>
                  <span className="text-[13.5px] font-bold text-[#102a43] block mt-1">Embedded Iframe Console</span>
                  <span className="text-[12px] text-[#627d98] block mt-0.5">Avoids tab switching for non-API systems</span>
                </div>
              </div>

              {/* Venue Table */}
              <div className="overflow-x-auto border border-[#d9e2ec] rounded-lg">
                <table className="w-full min-w-[760px] border-collapse">
                  <thead>
                    <tr>
                      <th className="text-left px-4 py-3 bg-[#f8fafb] text-[#627d98] border-b border-[#d9e2ec] text-[11px] font-bold tracking-wide uppercase">
                        Venue &amp; Client
                      </th>
                      <th className="text-left px-4 py-3 bg-[#f8fafb] text-[#627d98] border-b border-[#d9e2ec] text-[11px] font-bold tracking-wide uppercase">
                        Membership System
                      </th>
                      <th className="text-left px-4 py-3 bg-[#f8fafb] text-[#627d98] border-b border-[#d9e2ec] text-[11px] font-bold tracking-wide uppercase">
                        Protocol Mode
                      </th>
                      <th className="text-left px-4 py-3 bg-[#f8fafb] text-[#627d98] border-b border-[#d9e2ec] text-[11px] font-bold tracking-wide uppercase">
                        Write-Back
                      </th>
                      <th className="text-left px-4 py-3 bg-[#f8fafb] text-[#627d98] border-b border-[#d9e2ec] text-[11px] font-bold tracking-wide uppercase">
                        Status
                      </th>
                      <th className="text-left px-4 py-3 bg-[#f8fafb] text-[#627d98] border-b border-[#d9e2ec] text-[11px] font-bold tracking-wide uppercase">
                        Last Sync
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {venueIntegrations.map((row, idx) => (
                      <tr key={idx} className="hover:bg-[#fbfdfd] transition-colors">
                        <td className="px-4 py-3.5 border-b border-[#edf1f4]">
                          <div className="font-bold text-[13.5px] text-[#102a43]">{row.venue}</div>
                          <div className="text-[12px] text-[#627d98]">{row.client}</div>
                        </td>
                        <td className="px-4 py-3.5 border-b border-[#edf1f4] text-[13px] font-semibold text-[#102a43]">
                          {row.system}
                        </td>
                        <td className="px-4 py-3.5 border-b border-[#edf1f4] text-[12.5px] text-[#486581]">
                          {row.mode}
                        </td>
                        <td className="px-4 py-3.5 border-b border-[#edf1f4] text-[13px] font-medium text-[#102a43]">
                          {row.writeBack === 'Yes' ? 'Enabled' : 'Disabled'}
                        </td>
                        <td className="px-4 py-3.5 border-b border-[#edf1f4]">
                          {row.status === 'Connected' ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#ecfdf5] text-[#065f46] border border-[#a7f3d0]">
                              Connected
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#f8fafc] text-[#475569] border border-[#cbd5e1]">
                              Not configured
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3.5 border-b border-[#edf1f4] text-[12px] font-mono text-[#627d98]">
                          {row.lastSync}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'audit' && (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] border-collapse">
                <thead>
                  <tr>
                    <th className="text-left px-4 py-3 bg-[#f8fafb] text-[#627d98] border-b border-[#d9e2ec] text-[11px] font-bold tracking-wide">
                      Time
                    </th>
                    <th className="text-left px-4 py-3 bg-[#f8fafb] text-[#627d98] border-b border-[#d9e2ec] text-[11px] font-bold tracking-wide">
                      Actor
                    </th>
                    <th className="text-left px-4 py-3 bg-[#f8fafb] text-[#627d98] border-b border-[#d9e2ec] text-[11px] font-bold tracking-wide">
                      Action
                    </th>
                    <th className="text-left px-4 py-3 bg-[#f8fafb] text-[#627d98] border-b border-[#d9e2ec] text-[11px] font-bold tracking-wide">
                      Entity
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {auditEvents.map((evt, idx) => (
                    <tr key={idx} className="hover:bg-[#fbfdfd] transition-colors">
                      <td className="px-4 py-3.5 border-b border-[#edf1f4] text-[12px] font-mono text-[#627d98]">
                        {evt.time}
                      </td>
                      <td className="px-4 py-3.5 border-b border-[#edf1f4] font-bold text-[13px] text-[#102a43]">
                        {evt.actor}
                      </td>
                      <td className="px-4 py-3.5 border-b border-[#edf1f4] text-[13px] text-[#102a43]">
                        {evt.action}
                      </td>
                      <td className="px-4 py-3.5 border-b border-[#edf1f4] text-[13px] text-[#627d98]">
                        {evt.entity}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </AdminShell>
  );
}
