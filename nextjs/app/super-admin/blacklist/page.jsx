'use client';

import React, { useState, useMemo } from 'react';
import { Search, Plus, X } from 'lucide-react';
import AdminShell from '@/components/layout/AdminShell';
import { initialBlacklist } from '@/lib/mockData';

export default function SuperAdminBlacklistPage() {
  const [blacklist, setBlacklist] = useState(initialBlacklist);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // Form states
  const [name, setName] = useState('');
  const [alias, setAlias] = useState('');
  const [dob, setDob] = useState('');
  const [state, setState] = useState('NSW');
  const [reason, setReason] = useState('');
  const [severity, setSeverity] = useState('High');

  const filteredBlacklist = useMemo(() => {
    return blacklist.filter((item) => {
      const matchesSearch =
        searchQuery === '' ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.alias.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.reason.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesSeverity =
        selectedSeverity === 'all' || item.severity === selectedSeverity;

      return matchesSearch && matchesSeverity;
    });
  }, [blacklist, searchQuery, selectedSeverity]);

  const handleOpenAdd = () => {
    setEditingItem(null);
    setName('');
    setAlias('');
    setDob('');
    setState('NSW');
    setReason('');
    setSeverity('High');
    setModalOpen(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (editingItem) {
      setBlacklist((prev) =>
        prev.map((i) =>
          i.id === editingItem.id ? { ...i, name, alias, dob, state, reason, severity } : i
        )
      );
    } else {
      const newItem = {
        id: `bl-${Date.now()}`,
        name,
        alias: alias || 'None',
        dob,
        state,
        reason,
        severity,
        addedDate: new Date().toLocaleDateString('en-AU', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        }),
        status: 'Active',
      };
      setBlacklist((prev) => [newItem, ...prev]);
    }
    setModalOpen(false);
  };

  return (
    <AdminShell role="SUPER ADMIN">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5 mb-7">
        <div>
          <h1 className="text-[28px] font-bold text-[#102a43] tracking-tight m-0 leading-tight">
            Venue Blacklist
          </h1>
          <p className="text-[14.5px] text-[#627d98] mt-2 mb-0 max-w-[68ch] leading-relaxed">
            Global blacklisted patrons, self-exclusion registers, and statutory multi-venue exclusion orders.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleOpenAdd}
            className="inline-flex items-center justify-center min-h-[40px] px-4 rounded-md text-[13px] font-bold text-white bg-[#0d9488] hover:bg-[#0b7a6f] transition-colors cursor-pointer"
          >
            + Add Blacklisted Patron
          </button>
        </div>
      </div>

      {/* Main Table Section */}
      <section className="bg-white border border-[#d9e2ec] rounded-[10px] overflow-hidden">
        <div className="p-5">
          {/* Toolbar */}
          <div className="flex items-center gap-2.5 flex-wrap mb-4">
            <div className="relative flex-1 min-w-[230px]">
              <Search className="w-4 h-4 text-[#627d98] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search blacklisted patrons by name, alias, reason..."
                className="min-h-[42px] h-[42px] w-full border border-[#d9e2ec] rounded-[6px] bg-white text-[#102a43] pl-9 pr-3 text-[13.5px] outline-none focus:border-[#0d9488]"
              />
            </div>

            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              className="min-h-[42px] h-[42px] min-w-[160px] border border-[#d9e2ec] rounded-[6px] bg-white text-[#102a43] px-3 text-[13.5px] outline-none focus:border-[#0d9488]"
            >
              <option value="all">All Severities</option>
              <option value="High">High Severity</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>

            <span className="text-[12px] text-[#627d98]">
              {filteredBlacklist.length} record{filteredBlacklist.length === 1 ? '' : 's'}
            </span>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse">
              <thead>
                <tr>
                  <th className="text-left px-4 py-3 bg-[#f8fafb] text-[#627d98] border-b border-[#d9e2ec] text-[11px] font-bold tracking-wide">
                    Patron Name / ID
                  </th>
                  <th className="text-left px-4 py-3 bg-[#f8fafb] text-[#627d98] border-b border-[#d9e2ec] text-[11px] font-bold tracking-wide">
                    Known Aliases
                  </th>
                  <th className="text-left px-4 py-3 bg-[#f8fafb] text-[#627d98] border-b border-[#d9e2ec] text-[11px] font-bold tracking-wide">
                    Date of Birth
                  </th>
                  <th className="text-left px-4 py-3 bg-[#f8fafb] text-[#627d98] border-b border-[#d9e2ec] text-[11px] font-bold tracking-wide">
                    Exclusion Reason
                  </th>
                  <th className="text-left px-4 py-3 bg-[#f8fafb] text-[#627d98] border-b border-[#d9e2ec] text-[11px] font-bold tracking-wide">
                    Severity
                  </th>
                  <th className="text-left px-4 py-3 bg-[#f8fafb] text-[#627d98] border-b border-[#d9e2ec] text-[11px] font-bold tracking-wide">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredBlacklist.map((item) => (
                  <tr key={item.id} className="hover:bg-[#fbfdfd] transition-colors">
                    <td className="px-4 py-3.5 border-b border-[#edf1f4]">
                      <div className="font-bold text-[13.5px] text-[#102a43]">{item.name}</div>
                      <div className="text-[12px] font-mono text-[#627d98] mt-0.5">{item.id}</div>
                    </td>
                    <td className="px-4 py-3.5 border-b border-[#edf1f4] text-[13px] text-[#102a43]">
                      {item.alias}
                    </td>
                    <td className="px-4 py-3.5 border-b border-[#edf1f4] font-mono text-[12.5px] text-[#102a43]">
                      {item.dob}
                    </td>
                    <td className="px-4 py-3.5 border-b border-[#edf1f4] text-[13px] text-[#102a43]">
                      {item.reason}
                    </td>
                    <td className="px-4 py-3.5 border-b border-[#edf1f4]">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold border ${
                          item.severity === 'High'
                            ? 'bg-[#fef2f2] text-[#991b1b] border-[#fca5a5]'
                            : item.severity === 'Medium'
                            ? 'bg-[#fffbeb] text-[#78350f] border-[#fcd34d]'
                            : 'bg-[#ecfdf5] text-[#065f46] border-[#6ee7b7]'
                        }`}
                      >
                        {item.severity}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 border-b border-[#edf1f4]">
                      <span className="inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold bg-[#ecfdf5] text-[#065f46] border border-[#6ee7b7]">
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredBlacklist.length === 0 && (
            <div className="py-10 text-center text-[#627d98] text-[13.5px]">
              No blacklist records found.
            </div>
          )}
        </div>
      </section>

      {/* Add Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/55 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[14px] border border-[#d9e2ec] max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#edf1f4]">
              <h3 className="text-[17px] font-bold text-[#102a43]">
                {editingItem ? 'Edit Blacklisted Patron' : 'Add Blacklisted Patron'}
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="text-[#627d98] hover:text-[#102a43] p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-[12px] font-bold text-[#627d98]">Full Legal Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full h-10 px-3 border border-[#d9e2ec] rounded-md text-[13.5px] text-[#102a43] outline-none focus:border-[#0d9488]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[12px] font-bold text-[#627d98]">Known Alias</label>
                  <input
                    type="text"
                    value={alias}
                    onChange={(e) => setAlias(e.target.value)}
                    className="w-full h-10 px-3 border border-[#d9e2ec] rounded-md text-[13.5px] text-[#102a43] outline-none focus:border-[#0d9488]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[12px] font-bold text-[#627d98]">Date of Birth *</label>
                  <input
                    type="date"
                    required
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="w-full h-10 px-3 border border-[#d9e2ec] rounded-md text-[13.5px] text-[#102a43] outline-none focus:border-[#0d9488]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[12px] font-bold text-[#627d98]">Exclusion Reason *</label>
                <textarea
                  rows={2}
                  required
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full p-2.5 border border-[#d9e2ec] rounded-md text-[13.5px] text-[#102a43] outline-none focus:border-[#0d9488]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#edf1f4]">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="h-10 px-4 rounded-md text-[13px] font-bold border border-[#d9e2ec] text-[#102a43] hover:bg-[#f4f7f9]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-10 px-5 rounded-md text-[13px] font-bold bg-[#0d9488] text-white hover:bg-[#0b7a6f]"
                >
                  Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
