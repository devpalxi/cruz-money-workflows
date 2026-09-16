'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Search, Plus, Download, X, UploadCloud, FileSpreadsheet, CheckCircle2 } from 'lucide-react';
import AdminShell from '@/components/layout/AdminShell';
import { initialMachines } from '@/lib/mockData';

const ALL_VENUES = [
  'Riverside RSL Club',
  'Riverside Bowling Club',
  'Northside Leagues Club',
  'Northside Sports Club',
  'Harbourview Hotel',
];

export default function MachinesView({ role = 'ADMIN' }) {
  const isSuperAdmin = role === 'SUPER ADMIN';
  const defaultVenue = 'Riverside RSL Club';

  // Data state
  const [machines, setMachines] = useState(initialMachines);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVenue, setSelectedVenue] = useState(isSuperAdmin ? 'all' : defaultVenue);
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Modals state
  const [detailModalRecord, setDetailModalRecord] = useState(null);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addMode, setAddMode] = useState('single'); // 'single' | 'bulk'
  const [editRecord, setEditRecord] = useState(null); // null if adding, record if editing
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [exportVenue, setExportVenue] = useState(isSuperAdmin ? 'all' : defaultVenue);

  // Single Add / Edit Form state
  const [formMachineId, setFormMachineId] = useState('');
  const [formName, setFormName] = useState('');
  const [formSerialNumber, setFormSerialNumber] = useState('');
  const [formVenue, setFormVenue] = useState(isSuperAdmin ? '' : defaultVenue);
  const [formDescription, setFormDescription] = useState('');
  const [formStatus, setFormStatus] = useState('active');

  // Bulk Upload state
  const [bulkFile, setBulkFile] = useState(null);
  const [bulkDragging, setBulkDragging] = useState(false);
  const [bulkImportSuccess, setBulkImportSuccess] = useState(false);
  const fileInputRef = useRef(null);

  // Sync role-based initial venue if role changes
  useEffect(() => {
    if (!isSuperAdmin) {
      setSelectedVenue(defaultVenue);
      setExportVenue(defaultVenue);
    } else {
      setSelectedVenue('all');
      setExportVenue('all');
    }
  }, [isSuperAdmin]);

  // Handle ESC key for modals
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setDetailModalRecord(null);
        setAddModalOpen(false);
        setExportModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Handle URL search parameter on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const query = params.get('search');
      if (query) {
        setSearchQuery(query);
      }
    }
  }, []);

  // Filtered Machines
  const filteredMachines = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return machines.filter((m) => {
      const matchesSearch =
        !q ||
        m.machineId.toLowerCase().includes(q) ||
        m.name.toLowerCase().includes(q) ||
        m.serialNumber.toLowerCase().includes(q) ||
        m.venue.toLowerCase().includes(q);

      const matchesVenue =
        selectedVenue === 'all' || m.venue.toLowerCase() === selectedVenue.toLowerCase();

      const matchesStatus =
        selectedStatus === 'all' || m.status.toLowerCase() === selectedStatus.toLowerCase();

      return matchesSearch && matchesVenue && matchesStatus;
    });
  }, [machines, searchQuery, selectedVenue, selectedStatus]);

  const isFiltered =
    searchQuery.trim() !== '' ||
    (isSuperAdmin && selectedVenue !== 'all') ||
    selectedStatus !== 'all';

  const resetFilters = () => {
    setSearchQuery('');
    if (isSuperAdmin) setSelectedVenue('all');
    setSelectedStatus('all');
  };

  // Open Add Modal
  const handleOpenAddModal = () => {
    setEditRecord(null);
    setAddMode('single');
    const nextNum = machines.length + 1;
    setFormMachineId(`EGM-${String(nextNum).padStart(3, '0')}`);
    setFormName('');
    setFormSerialNumber('');
    setFormVenue(isSuperAdmin ? '' : defaultVenue);
    setFormDescription('');
    setFormStatus('active');
    setBulkFile(null);
    setBulkImportSuccess(false);
    setAddModalOpen(true);
  };

  // Open Edit Modal from Detail Modal
  const handleOpenEditModal = (record) => {
    setDetailModalRecord(null);
    setEditRecord(record);
    setAddMode('single');
    setFormMachineId(record.machineId);
    setFormName(record.name);
    setFormSerialNumber(record.serialNumber);
    setFormVenue(record.venue);
    setFormDescription(record.description || '');
    setFormStatus(record.status || 'active');
    setAddModalOpen(true);
  };

  // Save/Update Form Submit
  const handleSaveMachine = (e) => {
    e.preventDefault();
    if (!formMachineId.trim() || !formName.trim() || !formSerialNumber.trim()) {
      alert('Please fill in Machine ID, Game Title, and Serial Number.');
      return;
    }
    if (!formVenue) {
      alert('Please select an assigned venue for this machine.');
      return;
    }

    const actor = isSuperAdmin ? 'Super Admin' : 'Venue Admin';

    if (editRecord) {
      setMachines((prev) =>
        prev.map((item) =>
          item.id === editRecord.id
            ? {
                ...item,
                machineId: formMachineId.trim(),
                name: formName.trim(),
                serialNumber: formSerialNumber.trim(),
                venue: formVenue,
                description: formDescription.trim(),
                status: formStatus,
                lastUpdatedBy: actor,
              }
            : item
        )
      );
    } else {
      const newMachine = {
        id: `m-${Date.now()}`,
        machineId: formMachineId.trim(),
        name: formName.trim(),
        serialNumber: formSerialNumber.trim(),
        venue: formVenue,
        description: formDescription.trim(),
        status: formStatus,
        createdBy: actor,
        lastUpdatedBy: actor,
      };
      setMachines((prev) => [newMachine, ...prev]);
    }

    setAddModalOpen(false);
  };

  // Bulk Template Download
  const handleDownloadTemplate = () => {
    const template =
      'Machine ID,Game Title,Serial Number,Venue,Status,Description\nEGM-021,Aristocrat Lightning Link 1,SN-AR-00501,Riverside RSL Club,Active,Optional description\n';
    const blob = new Blob([template], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'egm_machine_upload_template.csv';
    link.click();
    URL.revokeObjectURL(link.href);
  };

  // Bulk Import
  const handleImportMachines = () => {
    if (!bulkFile) return;
    setBulkImportSuccess(true);
    setTimeout(() => {
      setAddModalOpen(false);
      setBulkFile(null);
      setBulkImportSuccess(false);
    }, 900);
  };

  // Export CSV
  const exportRows = useMemo(() => {
    if (exportVenue === 'all') return machines;
    return machines.filter(
      (m) => m.venue.toLowerCase() === exportVenue.toLowerCase()
    );
  }, [machines, exportVenue]);

  const handleConfirmExport = () => {
    const escapeCsv = (val) => `"${String(val ?? '').replace(/"/g, '""')}"`;
    let csv = 'Machine ID,Game Title,Serial Number,Venue,Status\n';
    exportRows.forEach((m) => {
      csv +=
        [
          m.machineId,
          m.name,
          m.serialNumber,
          m.venue,
          m.status === 'active' ? 'Active' : 'Archived',
        ]
          .map(escapeCsv)
          .join(',') + '\n';
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    const venueSlug =
      exportVenue === 'all'
        ? 'all-venues'
        : exportVenue.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    link.download = `egm_machines_${venueSlug}_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
    setExportModalOpen(false);
  };

  return (
    <AdminShell role={role}>
      <div className="max-w-[1440px] mx-auto pb-16">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
          <div>
            <h1 className="text-[26px] font-extrabold text-[#0f172a] tracking-tight m-0 leading-tight">
              {isSuperAdmin ? 'Gaming Machines' : `${defaultVenue} — Machines`}
            </h1>
            <p className="text-[13.5px] text-[#475569] mt-1.5 mb-0 leading-normal">
              {isSuperAdmin
                ? 'Registered EGM machine registry across all venues in the network.'
                : `Registered EGM machines assigned to ${defaultVenue}.`}
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              type="button"
              onClick={() => {
                setExportVenue(isSuperAdmin ? 'all' : defaultVenue);
                setExportModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 min-h-[38px] px-4 rounded-md text-[13px] font-bold bg-white border border-[#cbd5e1] text-[#0f172a] hover:bg-[#f8fafc] transition-colors cursor-pointer shadow-xs"
            >
              <Download className="w-3.5 h-3.5 text-[#475569]" />
              Export CSV
            </button>
            <button
              type="button"
              onClick={handleOpenAddModal}
              className="inline-flex items-center gap-1.5 min-h-[38px] px-4 rounded-md text-[13px] font-bold text-white bg-[#0d9488] hover:bg-[#0b7a6f] transition-colors cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              Add machines
            </button>
          </div>
        </div>

        {/* Filter & Search Toolbar Card */}
        <div className="bg-white border border-[#e2e8f0] rounded-[8px] px-5 py-4 mb-5 shadow-xs">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3 flex-1 min-w-[280px] flex-wrap">
              {/* Search Field */}
              <div className="relative flex-1 min-w-[260px] max-w-[440px]">
                <Search className="w-4 h-4 text-[#64748b] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by Machine ID, Game Title, Serial, or Venue..."
                  className="w-full h-[38px] pl-9 pr-3.5 border border-[#cbd5e1] rounded-md bg-white text-[#0f172a] text-[13px] outline-none focus:border-[#0d9488] transition-colors"
                />
              </div>

              {/* Venue Filter (Super Admin Only) */}
              {isSuperAdmin && (
                <select
                  value={selectedVenue}
                  onChange={(e) => setSelectedVenue(e.target.value)}
                  className="h-[38px] pl-3 pr-8 border border-[#cbd5e1] rounded-md bg-white text-[#0f172a] text-[13px] font-semibold cursor-pointer outline-none focus:border-[#0d9488]"
                >
                  <option value="all">All Venues</option>
                  {ALL_VENUES.map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
              )}

              {/* Status Filter */}
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="h-[38px] pl-3 pr-8 border border-[#cbd5e1] rounded-md bg-white text-[#0f172a] text-[13px] font-semibold cursor-pointer outline-none focus:border-[#0d9488]"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            {/* Results Count & Reset */}
            <div className="flex items-center gap-3 text-[12.5px] text-[#475569]">
              <span>
                Showing {filteredMachines.length} of {machines.length} machine
                {machines.length === 1 ? '' : 's'}
              </span>
              {isFiltered && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="text-[#0d9488] font-bold hover:underline cursor-pointer bg-transparent border-0 p-0"
                >
                  Reset filters
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Content Card / Table Container */}
        <div className="bg-white border border-[#e2e8f0] rounded-[8px] overflow-hidden shadow-xs">
          {filteredMachines.length === 0 ? (
            <div className="py-14 px-5 text-center text-[#475569]">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#f8fafc] border border-[#e2e8f0] mb-3 text-[#64748b]">
                <Search className="w-5 h-5" />
              </div>
              <p className="m-0 font-bold text-[15px] text-[#0f172a]">
                No machines match your criteria
              </p>
              <p className="mt-1 text-[13px] text-[#475569]">
                Try adjusting your search query or venue filter.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-[#e2e8f0] bg-[#f8fafb]">
                    <th className="w-[16%] pl-5 pr-[18px] py-3 text-[11px] font-bold text-[#475569] tracking-wider whitespace-nowrap">
                      Machine ID
                    </th>
                    <th className="w-[34%] px-[18px] py-3 text-[11px] font-bold text-[#475569] tracking-wider whitespace-nowrap">
                      Game Title
                    </th>
                    <th className="w-[20%] px-[18px] py-3 text-[11px] font-bold text-[#475569] tracking-wider whitespace-nowrap">
                      Serial Number
                    </th>
                    <th className="w-[18%] px-[18px] py-3 text-[11px] font-bold text-[#475569] tracking-wider whitespace-nowrap">
                      Venue
                    </th>
                    <th className="w-[12%] pl-[18px] pr-5 py-3 text-[11px] font-bold text-[#475569] tracking-wider whitespace-nowrap">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#edf2f7]">
                  {filteredMachines.map((m) => {
                    const isActive = m.status === 'active';
                    return (
                      <tr
                        key={m.id}
                        onClick={() => setDetailModalRecord(m)}
                        className="cursor-pointer hover:bg-[#fbfdfd] transition-colors"
                      >
                        <td className="pl-5 pr-[18px] py-3.5 font-mono font-bold text-[13px] text-[#0d9488] whitespace-nowrap">
                          {m.machineId}
                        </td>
                        <td className="px-[18px] py-3.5 font-bold text-[13.5px] text-[#0f172a]">
                          {m.name}
                        </td>
                        <td className="px-[18px] py-3.5 font-mono text-[12.5px] text-[#475569] whitespace-nowrap">
                          {m.serialNumber}
                        </td>
                        <td className="px-[18px] py-3.5 text-[13px] text-[#0f172a] whitespace-nowrap">
                          {m.venue}
                        </td>
                        <td className="pl-[18px] pr-5 py-3.5 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-[11.5px] font-bold border whitespace-nowrap select-none ${
                              isActive
                                ? 'bg-[#ecfdf5] text-[#065f46] border-[#6ee7b7]'
                                : 'bg-[#f8fafc] text-[#475569] border-[#cbd5e1]'
                            }`}
                          >
                            {isActive ? 'Active' : 'Archived'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Machine Detail Modal */}
      {detailModalRecord && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setDetailModalRecord(null);
          }}
        >
          <div className="bg-white rounded-[12px] border border-[#e2e8f0] max-w-[480px] w-full max-h-[calc(100vh-48px)] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#e2e8f0] bg-white flex-shrink-0">
              <div>
                <h2 className="text-[18px] font-extrabold text-[#0f172a] m-0">
                  {detailModalRecord.name}
                </h2>
                <p className="font-mono text-[12.5px] font-bold text-[#0d9488] mt-0.5 mb-0">
                  {detailModalRecord.machineId}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setDetailModalRecord(null)}
                className="text-[#475569] hover:text-[#0f172a] hover:bg-[#f8fafc] p-1.5 rounded-md cursor-pointer transition-colors"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-3.5 overflow-y-auto flex-1 min-h-0">
              <div className="flex justify-between items-center pb-3 border-b border-[#edf2f7]">
                <span className="text-[12.5px] font-bold text-[#475569]">
                  Machine ID
                </span>
                <span className="font-mono text-[13.5px] font-bold text-[#0d9488]">
                  {detailModalRecord.machineId}
                </span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-[#edf2f7]">
                <span className="text-[12.5px] font-bold text-[#475569]">
                  Game Title
                </span>
                <span className="text-[13.5px] font-bold text-[#0f172a]">
                  {detailModalRecord.name}
                </span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-[#edf2f7]">
                <span className="text-[12.5px] font-bold text-[#475569]">
                  Hardware Serial
                </span>
                <span className="font-mono text-[13px] font-semibold text-[#0f172a]">
                  {detailModalRecord.serialNumber}
                </span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-[#edf2f7]">
                <span className="text-[12.5px] font-bold text-[#475569]">
                  Assigned Venue
                </span>
                <span className="text-[13.5px] font-bold text-[#0f172a]">
                  {detailModalRecord.venue}
                </span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-[#edf2f7]">
                <span className="text-[12.5px] font-bold text-[#475569]">
                  Description
                </span>
                <span className="text-[13px] text-[#475569]">
                  {detailModalRecord.description || '—'}
                </span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-[#edf2f7]">
                <span className="text-[12.5px] font-bold text-[#475569]">
                  Status
                </span>
                <span>
                  <span
                    className={`inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-[11.5px] font-bold border whitespace-nowrap select-none ${
                      detailModalRecord.status === 'active'
                        ? 'bg-[#ecfdf5] text-[#065f46] border-[#6ee7b7]'
                        : 'bg-[#f8fafc] text-[#475569] border-[#cbd5e1]'
                    }`}
                  >
                    {detailModalRecord.status === 'active' ? 'Active' : 'Archived'}
                  </span>
                </span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-[#edf2f7]">
                <span className="text-[12.5px] font-bold text-[#475569]">
                  Created by
                </span>
                <span className="text-[13px] text-[#475569]">
                  {detailModalRecord.createdBy || 'System seed'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[12.5px] font-bold text-[#475569]">
                  Last updated by
                </span>
                <span className="text-[13px] text-[#475569]">
                  {detailModalRecord.lastUpdatedBy || detailModalRecord.createdBy || 'System seed'}
                </span>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-2.5 px-6 py-3.5 bg-[#f8fafb] border-t border-[#e2e8f0] flex-shrink-0">
              <button
                type="button"
                onClick={() => handleOpenEditModal(detailModalRecord)}
                className="min-h-[38px] px-4 rounded-md text-[13px] font-bold bg-white border border-[#cbd5e1] text-[#0f172a] hover:bg-[#f8fafc] cursor-pointer transition-colors"
              >
                Edit machine
              </button>
              <button
                type="button"
                onClick={() => setDetailModalRecord(null)}
                className="min-h-[38px] px-4 rounded-md text-[13px] font-bold bg-white border border-[#cbd5e1] text-[#0f172a] hover:bg-[#f8fafc] cursor-pointer transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Machine Modal */}
      {addModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setAddModalOpen(false);
          }}
        >
          <div className="bg-white rounded-[12px] border border-[#e2e8f0] max-w-[480px] w-full max-h-[calc(100vh-48px)] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#e2e8f0] bg-white flex-shrink-0">
              <h2 className="text-[18px] font-extrabold text-[#0f172a] m-0">
                {editRecord ? 'Edit Machine' : 'Add machines'}
              </h2>
              <button
                type="button"
                onClick={() => setAddModalOpen(false)}
                className="text-[#475569] hover:text-[#0f172a] hover:bg-[#f8fafc] p-1.5 rounded-md cursor-pointer transition-colors"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Tabs (Add mode only) */}
            {!editRecord && (
              <div className="flex gap-1 px-6 pt-2 border-b border-[#e2e8f0] bg-white flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setAddMode('single')}
                  className={`min-h-[38px] px-3.5 text-[13px] font-bold border-b-2 transition-colors cursor-pointer ${
                    addMode === 'single'
                      ? 'border-[#0d9488] text-[#0b7a6f]'
                      : 'border-transparent text-[#475569] hover:text-[#0f172a]'
                  }`}
                >
                  Single machine
                </button>
                <button
                  type="button"
                  onClick={() => setAddMode('bulk')}
                  className={`min-h-[38px] px-3.5 text-[13px] font-bold border-b-2 transition-colors cursor-pointer ${
                    addMode === 'bulk'
                      ? 'border-[#0d9488] text-[#0b7a6f]'
                      : 'border-transparent text-[#475569] hover:text-[#0f172a]'
                  }`}
                >
                  Bulk upload
                </button>
              </div>
            )}

            {/* Single Form Mode */}
            {addMode === 'single' ? (
              <form onSubmit={handleSaveMachine} className="flex flex-col flex-1 min-h-0">
                <div className="p-6 space-y-3.5 overflow-y-auto flex-1 min-h-0">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[12.5px] font-bold text-[#475569]">
                      Machine ID (Asset Tag) *
                    </label>
                    <input
                      type="text"
                      required
                      value={formMachineId}
                      onChange={(e) => setFormMachineId(e.target.value)}
                      placeholder="e.g. EGM-021"
                      className="h-10 px-3 border border-[#cbd5e1] rounded-md font-mono text-[13.5px] text-[#0f172a] outline-none focus:border-[#0d9488]"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[12.5px] font-bold text-[#475569]">
                      Game Title & Model *
                    </label>
                    <input
                      type="text"
                      required
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder="e.g. Aristocrat Lightning Link 1"
                      className="h-10 px-3 border border-[#cbd5e1] rounded-md text-[13.5px] text-[#0f172a] outline-none focus:border-[#0d9488]"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[12.5px] font-bold text-[#475569]">
                      Hardware Serial Number *
                    </label>
                    <input
                      type="text"
                      required
                      value={formSerialNumber}
                      onChange={(e) => setFormSerialNumber(e.target.value)}
                      placeholder="e.g. SN-AR-00112"
                      className="h-10 px-3 border border-[#cbd5e1] rounded-md font-mono text-[13.5px] text-[#0f172a] outline-none focus:border-[#0d9488]"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[12.5px] font-bold text-[#475569]">
                      Assigned Venue *
                    </label>
                    {isSuperAdmin ? (
                      <select
                        required
                        value={formVenue}
                        onChange={(e) => setFormVenue(e.target.value)}
                        className="h-10 px-3 border border-[#cbd5e1] rounded-md text-[13.5px] text-[#0f172a] outline-none focus:border-[#0d9488] bg-white cursor-pointer"
                      >
                        <option value="" disabled>
                          Select a venue...
                        </option>
                        {ALL_VENUES.map((v) => (
                          <option key={v} value={v}>
                            {v}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        disabled
                        readOnly
                        value={formVenue || defaultVenue}
                        className="h-10 px-3 border border-[#cbd5e1] rounded-md text-[13.5px] text-[#475569] bg-[#f8fafc] cursor-not-allowed outline-none select-none"
                      />
                    )}
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[12.5px] font-bold text-[#475569]">
                      Description
                    </label>
                    <textarea
                      value={formDescription}
                      onChange={(e) => setFormDescription(e.target.value)}
                      placeholder="Optional machine description"
                      className="h-18 p-2.5 border border-[#cbd5e1] rounded-md text-[13.5px] text-[#0f172a] outline-none focus:border-[#0d9488] resize-y"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[12.5px] font-bold text-[#475569]">
                      Operational Status *
                    </label>
                    <select
                      value={formStatus}
                      onChange={(e) => setFormStatus(e.target.value)}
                      className="h-10 px-3 border border-[#cbd5e1] rounded-md text-[13.5px] text-[#0f172a] outline-none focus:border-[#0d9488] bg-white cursor-pointer"
                    >
                      <option value="active">Active</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>

                  {/* Audit fields when editing (cardless layout at bottom) */}
                  {editRecord && (
                    <div className="pt-3 border-t border-[#edf2f7] space-y-2 text-[12px]">
                      <div className="flex justify-between items-center">
                        <span className="text-[#64748b] font-bold">Created by:</span>
                        <span className="text-[#0f172a] font-semibold">{editRecord.createdBy || 'System seed'}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[#64748b] font-bold">Last updated by:</span>
                        <span className="text-[#0f172a] font-semibold">{editRecord.lastUpdatedBy || editRecord.createdBy || 'System seed'}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-2.5 px-6 py-3.5 bg-[#f8fafb] border-t border-[#e2e8f0] flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => setAddModalOpen(false)}
                    className="min-h-[38px] px-4 rounded-md text-[13px] font-bold bg-white border border-[#cbd5e1] text-[#0f172a] hover:bg-[#f8fafc] cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="min-h-[38px] px-5 rounded-md text-[13px] font-bold text-white bg-[#0d9488] hover:bg-[#0b7a6f] cursor-pointer"
                  >
                    {editRecord ? 'Update machine' : 'Save machine'}
                  </button>
                </div>
              </form>
            ) : (
              /* Bulk Upload Mode */
              <div className="flex flex-col flex-1 min-h-0">
                <div className="p-6 space-y-3.5 overflow-y-auto flex-1 min-h-0">
                  <p className="text-[13.5px] text-[#475569] leading-relaxed m-0">
                    Upload an Excel file with machine data. Use the template to keep the required columns and formatting consistent.
                  </p>

                  <button
                    type="button"
                    onClick={handleDownloadTemplate}
                    className="inline-flex items-center justify-center gap-2 min-h-[40px] px-4 rounded-md text-[13px] font-bold bg-[#f0fdfa] border border-[#99f6e4] text-[#0f766e] hover:bg-[#ccfbf1] transition-colors cursor-pointer w-full"
                  >
                    <Download className="w-4 h-4" />
                    Download upload template
                  </button>

                  {/* Dropzone */}
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setBulkDragging(true);
                    }}
                    onDragLeave={() => setBulkDragging(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setBulkDragging(false);
                      if (e.dataTransfer.files?.[0]) {
                        setBulkFile(e.dataTransfer.files[0]);
                      }
                    }}
                    onClick={() => fileInputRef.current?.click()}
                    className={`flex flex-col items-center justify-center min-h-[170px] p-6 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors ${
                      bulkDragging
                        ? 'border-[#0d9488] bg-[#f0fdfa]'
                        : 'border-[#cbd5e1] bg-[#f8fafc] hover:border-[#0d9488] hover:bg-[#f0fdfa]'
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".xlsx,.xls,.csv"
                      onChange={(e) => {
                        if (e.target.files?.[0]) setBulkFile(e.target.files[0]);
                      }}
                      className="hidden"
                    />
                    <UploadCloud className="w-8 h-8 text-[#0d9488] mb-2" />
                    <strong className="text-[14px] text-[#0f172a]">
                      Drop your .xlsx file here
                    </strong>
                    <span className="text-[12.5px] text-[#475569] mt-0.5">
                      or browse from your computer
                    </span>
                    <span className="mt-2.5 px-3 py-1 bg-white border border-[#cbd5e1] rounded text-[12px] font-bold text-[#0f172a]">
                      Browse files
                    </span>
                  </div>

                  <div className="text-center">
                    {bulkFile ? (
                      <p className="text-[12.5px] text-[#0f766e] font-bold m-0 flex items-center justify-center gap-1.5">
                        <FileSpreadsheet className="w-4 h-4" />
                        {bulkFile.name} selected
                      </p>
                    ) : (
                      <p className="text-[12.5px] text-[#64748b] m-0">
                        No file selected
                      </p>
                    )}
                  </div>

                  {bulkImportSuccess && (
                    <div className="p-3 bg-[#ecfdf5] border border-[#6ee7b7] rounded-md text-[13px] font-bold text-[#065f46] flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#10b981]" />
                      Import successful! Adding records...
                    </div>
                  )}
                </div>

                {/* Bulk Footer */}
                <div className="flex items-center justify-end gap-2.5 px-6 py-3.5 bg-[#f8fafb] border-t border-[#e2e8f0] flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => setAddModalOpen(false)}
                    className="min-h-[38px] px-4 rounded-md text-[13px] font-bold bg-white border border-[#cbd5e1] text-[#0f172a] hover:bg-[#f8fafc] cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={!bulkFile}
                    onClick={handleImportMachines}
                    className="min-h-[38px] px-5 rounded-md text-[13px] font-bold text-white bg-[#0d9488] hover:bg-[#0b7a6f] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    Import machines
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Export Machines Modal */}
      {exportModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setExportModalOpen(false);
          }}
        >
          <div className="bg-white rounded-[12px] border border-[#e2e8f0] max-w-[480px] w-full max-h-[calc(100vh-48px)] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#e2e8f0] bg-white flex-shrink-0">
              <div>
                <h2 className="text-[18px] font-extrabold text-[#0f172a] m-0">
                  Export machines
                </h2>
                <p className="text-[12.5px] text-[#475569] mt-0.5 mb-0">
                  {isSuperAdmin
                    ? 'Download a CSV roster for the selected venue.'
                    : `Download a CSV roster for ${defaultVenue}.`}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setExportModalOpen(false)}
                className="text-[#475569] hover:text-[#0f172a] hover:bg-[#f8fafc] p-1.5 rounded-md cursor-pointer transition-colors"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 overflow-y-auto flex-1 min-h-0">
              {isSuperAdmin ? (
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12.5px] font-bold text-[#475569]">
                    Venue
                  </label>
                  <select
                    value={exportVenue}
                    onChange={(e) => setExportVenue(e.target.value)}
                    className="h-10 px-3 border border-[#cbd5e1] rounded-md text-[13.5px] text-[#0f172a] outline-none focus:border-[#0d9488] bg-white cursor-pointer w-full"
                  >
                    <option value="all">All Venues</option>
                    {ALL_VENUES.map((v) => (
                      <option key={v} value={v}>
                        {v}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <p className="text-[13.5px] text-[#475569] m-0 leading-relaxed">
                  Exporting machine roster assigned to{' '}
                  <strong className="text-[#0f172a] font-bold">{defaultVenue}</strong>.
                </p>
              )}

              <div className="flex items-baseline gap-2 pt-3 border-t border-[#e2e8f0] text-[13.5px] text-[#475569]">
                <strong className="text-[22px] font-extrabold text-[#0f172a] font-mono">
                  {exportRows.length}
                </strong>
                <span>machines will be exported</span>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-2.5 px-6 py-3.5 bg-[#f8fafb] border-t border-[#e2e8f0] flex-shrink-0">
              <button
                type="button"
                onClick={() => setExportModalOpen(false)}
                className="min-h-[38px] px-4 rounded-md text-[13px] font-bold bg-white border border-[#cbd5e1] text-[#0f172a] hover:bg-[#f8fafc] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmExport}
                className="inline-flex items-center gap-1.5 min-h-[38px] px-5 rounded-md text-[13px] font-bold text-white bg-[#0d9488] hover:bg-[#0b7a6f] cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                Export CSV
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
