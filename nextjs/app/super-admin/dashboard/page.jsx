'use client';

import React from 'react';
import Link from 'next/link';
import AdminShell from '@/components/layout/AdminShell';
import { initialClients, initialVenues, initialPayouts } from '@/lib/mockData';

export default function SuperAdminDashboardPage() {
  const activeVenues = initialVenues.filter((v) => v.status === 'Active');
  const totalVolume = initialPayouts.reduce((sum, p) => sum + parseFloat(p.amount), 0);

  const alerts = [
    { count: 7, label: 'Failed payments', status: 'danger', link: '/super-admin/payouts' },
    { count: 4, label: 'Draft SMRs', status: 'warning', link: '/super-admin/smr' },
    { count: 1, label: 'Inactive venues', status: 'danger', link: '/super-admin/venue' },
    { count: 1, label: 'Blocked users', status: 'warning', link: '/admin/users' },
  ];

  const chartBars = [
    { month: 'Mar', value: 58 },
    { month: 'Apr', value: 72 },
    { month: 'May', value: 64 },
    { month: 'Jun', value: 88 },
    { month: 'Jul', value: 78 },
    { month: 'Aug', value: 100 },
  ];

  const recentActivity = [
    { action: 'Disbursement threshold updated', entity: 'Riverside RSL Club', actor: 'J. Chen', time: '12m ago', dot: 'bg-[#1a6b6b]' },
    { action: 'SMR Draft created for PEP match', entity: 'Northside Leagues Club', actor: 'D. Walsh', time: '1h ago', dot: 'bg-[#f5a623]' },
    { action: 'New venue registered and provisioned', entity: 'Harbourview Hotel', actor: 'System', time: '3h ago', dot: 'bg-[#147d64]' },
    { action: 'Payment rejected by bank gateway', entity: 'Riverside Grand Bistro', actor: 'System', time: '5h ago', dot: 'bg-[#b42318]' },
  ];

  return (
    <AdminShell role="SUPER ADMIN">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5 mb-7">
        <div>
          <h1 className="text-[28px] font-bold text-[#102a43] tracking-tight m-0 leading-tight">
            Platform dashboard
          </h1>
          <p className="text-[14.5px] text-[#627d98] mt-2 mb-0 max-w-[68ch] leading-relaxed">
            Monitor clients, venues, payouts, compliance activity, and operational risk from one place.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Link
            href="/super-admin/payouts"
            className="inline-flex items-center justify-center min-h-[40px] px-4 rounded-md text-[13px] font-bold text-[#102a43] bg-white border border-[#d9e2ec] hover:bg-[#f4f7f9] transition-colors"
          >
            Review payouts
          </Link>
          <Link
            href="/super-admin/clients?create=1"
            className="inline-flex items-center justify-center min-h-[40px] px-4 rounded-md text-[13px] font-bold text-white bg-[#0d9488] hover:bg-[#0b7a6f] transition-colors"
          >
            Create client
          </Link>
        </div>
      </div>

      {/* 4-Stat Platform Snapshot Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mb-6" aria-label="Platform snapshot">
        {/* Stat 1 */}
        <div className="bg-white border border-[#d9e2ec] rounded-[10px] p-[18px]">
          <div className="text-[#627d98] text-[12px] font-bold">Total clients</div>
          <div className="mt-2 text-[26px] font-bold font-mono text-[#102a43] leading-none">
            {initialClients.length}
          </div>
          <div className="mt-2 text-[#147d64] text-[12px] font-medium">+1 this month</div>
        </div>

        {/* Stat 2 */}
        <div className="bg-white border border-[#d9e2ec] rounded-[10px] p-[18px]">
          <div className="text-[#627d98] text-[12px] font-bold">Active venues</div>
          <div className="mt-2 text-[26px] font-bold font-mono text-[#102a43] leading-none">
            {activeVenues.length}
          </div>
          <div className="mt-2 text-[#627d98] text-[12px]">
            of <span className="font-semibold text-[#102a43]">{initialVenues.length}</span> total venues
          </div>
        </div>

        {/* Stat 3 */}
        <div className="bg-white border border-[#d9e2ec] rounded-[10px] p-[18px]">
          <div className="text-[#627d98] text-[12px] font-bold">Payout volume</div>
          <div className="mt-2 text-[26px] font-bold font-mono text-[#102a43] leading-none">
            ${totalVolume.toLocaleString('en-AU', { maximumFractionDigits: 0 })}
          </div>
          <div className="mt-2 text-[#147d64] text-[12px] font-medium">+12.4% versus July</div>
        </div>

        {/* Stat 4 */}
        <div className="bg-white border border-[#d9e2ec] rounded-[10px] p-[18px]">
          <div className="text-[#627d98] text-[12px] font-bold">Open SMRs</div>
          <div className="mt-2 text-[26px] font-bold font-mono text-[#102a43] leading-none">8</div>
          <div className="mt-2 text-[#996300] text-[12px] font-medium">Requires review</div>
        </div>
      </section>

      {/* Attention Required Card Section */}
      <section className="bg-white border border-[#d9e2ec] rounded-[10px] overflow-hidden mb-6">
        <div className="flex justify-between items-center gap-3.5 px-5 py-4 border-b border-[#d9e2ec]">
          <div>
            <h2 className="text-[16px] font-bold text-[#102a43] m-0">Attention required</h2>
            <p className="text-[13px] text-[#627d98] mt-1 mb-0">Items that need a Super Admin decision.</p>
          </div>
          <Link href="/super-admin/payouts" className="text-[#0d9488] text-[13px] font-bold hover:underline">
            View all
          </Link>
        </div>

        <div className="p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {alerts.map((item, idx) => (
              <Link
                key={idx}
                href={item.link}
                className="block border border-[#d9e2ec] rounded-[8px] p-3.5 bg-white hover:border-[#0d9488] transition-all no-underline"
              >
                <strong className="block text-[20px] font-bold font-mono text-[#102a43]">{item.count}</strong>
                <span className="block mt-1.5 text-[12px] text-[#627d98]">{item.label}</span>
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold mt-2.5 border
                    ${
                      item.status === 'danger'
                        ? 'bg-[#fef2f2] text-[#991b1b] border-[#fca5a5]'
                        : 'bg-[#fffbeb] text-[#78350f] border-[#fcd34d]'
                    }`}
                >
                  Review
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Chart & Recent Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-4.5">
        {/* Payout Volume Chart */}
        <section className="bg-white border border-[#d9e2ec] rounded-[10px] overflow-hidden">
          <div className="flex justify-between items-center gap-3.5 px-5 py-4 border-b border-[#d9e2ec]">
            <div>
              <h2 className="text-[16px] font-bold text-[#102a43] m-0">Payout volume</h2>
              <p className="text-[13px] text-[#627d98] mt-1 mb-0">Mock monthly volume across all venues.</p>
            </div>
            <span className="inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold bg-[#f0fdfa] text-[#0d9488]">
              Last 6 months
            </span>
          </div>

          <div className="p-5">
            <div className="flex items-end gap-2.5 h-[190px] pt-5">
              {chartBars.map((bar, i) => (
                <div
                  key={i}
                  className="flex-1 min-w-[20px] bg-[#0d9488] rounded-t-[4px] relative group"
                  style={{ height: `${bar.value}%` }}
                >
                  <span className="absolute top-[calc(100%+8px)] w-full text-center text-[#627d98] text-[11px] font-medium block">
                    {bar.month}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Recent Activity */}
        <section className="bg-white border border-[#d9e2ec] rounded-[10px] overflow-hidden">
          <div className="flex justify-between items-center gap-3.5 px-5 py-4 border-b border-[#d9e2ec]">
            <div>
              <h2 className="text-[16px] font-bold text-[#102a43] m-0">Recent activity</h2>
              <p className="text-[13px] text-[#627d98] mt-1 mb-0">Latest platform events.</p>
            </div>
            <Link href="/super-admin/dashboard#audit" className="text-[#0d9488] text-[13px] font-bold hover:underline">
              Audit log
            </Link>
          </div>

          <div className="p-5">
            <div className="flex flex-col">
              {recentActivity.map((item, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-[10px_1fr_auto] gap-3 items-start py-3.5 border-b border-[#edf1f4] last:border-b-0"
                >
                  <span className={`w-2 h-2 mt-1.5 rounded-full ${item.dot}`} />
                  <div>
                    <div className="font-bold text-[13px] text-[#102a43]">{item.action}</div>
                    <div className="text-[12px] text-[#627d98] mt-0.5">
                      {item.entity} &middot; {item.actor}
                    </div>
                  </div>
                  <span className="text-[11px] text-[#627d98] whitespace-nowrap">{item.time}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </AdminShell>
  );
}
