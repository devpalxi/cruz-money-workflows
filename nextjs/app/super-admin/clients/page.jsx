'use client';

import React, { useState, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, Plus, Building2 } from 'lucide-react';
import AdminShell from '@/components/layout/AdminShell';
import { initialClients } from '@/lib/mockData';

function SuperAdminClientsContent() {
  const router = useRouter();
  const [clients, setClients] = useState(initialClients);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const filteredClients = useMemo(() => {
    return clients.filter((c) => {
      const matchesStatus = !statusFilter || c.status === statusFilter;
      const q = searchQuery.trim().toLowerCase();
      const matchesQuery =
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.id.toLowerCase().includes(q) ||
        (c.contact && c.contact.toLowerCase().includes(q)) ||
        (c.email && c.email.toLowerCase().includes(q));
      return matchesStatus && matchesQuery;
    });
  }, [clients, searchQuery, statusFilter]);

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
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5 mb-6">
        <div>
          <h1 className="text-[28px] font-bold text-[#102a43] tracking-tight m-0 leading-tight">
            Clients
          </h1>
          <p className="text-[14px] text-[#627d98] mt-1.5 mb-0 max-w-[68ch] leading-relaxed">
            Manage customer organisations and the venues, users, and subscriptions they own.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/super-admin/client?mode=create"
            className="inline-flex items-center justify-center h-[38px] px-4 rounded-md text-[13px] font-bold text-white bg-[#0d9488] hover:bg-[#0b7a6f] transition-colors cursor-pointer shadow-xs gap-1.5 border-none"
          >
            <Plus className="w-4 h-4" />
            <span>Create client</span>
          </Link>
        </div>
      </div>

      {/* Main Table Section */}
      <section className="bg-white border border-[#d9e2ec] rounded-[10px] shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-[#edf1f4]">
          {/* Toolbar */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[240px] max-w-sm">
              <Search className="w-4 h-4 text-[#627d98] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search clients, contacts, or email"
                className="h-[38px] w-full border border-[#d9e2ec] rounded-md bg-white text-[#102a43] pl-9 pr-3 text-[13.5px] outline-none focus:border-[#0d9488]"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-[38px] min-w-[140px] border border-[#d9e2ec] rounded-md bg-white text-[#102a43] px-3 text-[13px] font-medium outline-none focus:border-[#0d9488]"
            >
              <option value="">All statuses</option>
              <option value="Active">Active</option>
              <option value="Draft">Draft</option>
              <option value="Inactive">Inactive</option>
            </select>

            <span className="ml-auto text-[12.5px] text-[#627d98] font-medium">
              {filteredClients.length} client{filteredClients.length === 1 ? '' : 's'}
            </span>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] border-collapse text-left text-[13px]">
            <thead>
              <tr className="bg-[#f8fafb] border-b border-[#d9e2ec] text-[#627d98] text-[11px] font-bold tracking-wider uppercase">
                <th className="px-4 py-3 w-[28%]">Client</th>
                <th className="px-4 py-3 w-[28%]">Primary contact</th>
                <th className="px-4 py-3 w-[14%]">Venues</th>
                <th className="px-4 py-3 w-[16%]">Plan</th>
                <th className="px-4 py-3 w-[14%]">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#edf1f4]">
              {filteredClients.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-[#627d98]">
                    <div className="text-[14px] font-bold text-[#102a43]">No clients match these filters</div>
                    <div className="text-[12.5px] text-[#627d98] mt-1">Try adjusting your search terms.</div>
                  </td>
                </tr>
              ) : (
                filteredClients.map((client) => (
                  <tr
                    key={client.id}
                    onClick={() => router.push(`/super-admin/client?id=${client.id}&mode=view`)}
                    className="hover:bg-[#f0fdfa] transition-colors cursor-pointer"
                  >
                    {/* Client Name & ID */}
                    <td className="px-4 py-3.5">
                      <div className="font-bold text-[13.5px] text-[#102a43]">
                        {client.name}
                      </div>
                      <div className="text-[12px] font-mono text-[#627d98] mt-0.5">
                        {client.id}
                      </div>
                    </td>

                    {/* Primary Contact & Email */}
                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-[13.5px] text-[#102a43]">
                        {client.contact || 'Not assigned'}
                      </div>
                      <div className="text-[12px] font-mono text-[#627d98] mt-0.5">
                        {client.email || ''}
                      </div>
                    </td>

                    {/* Venues Count */}
                    <td className="px-4 py-3.5 font-mono font-bold text-[13.5px] text-[#102a43]">
                      {client.venues || 0}
                    </td>

                    {/* Billing Plan */}
                    <td className="px-4 py-3.5 font-medium text-[13.5px] text-[#102a43]">
                      {client.plan || 'PAYG'}
                    </td>

                    {/* Status Badge */}
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border whitespace-nowrap ${getStatusPill(client.status)}`}>
                        {client.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </AdminShell>
  );
}

export default function SuperAdminClientsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-[#627d98]">Loading clients...</div>}>
      <SuperAdminClientsContent />
    </Suspense>
  );
}
