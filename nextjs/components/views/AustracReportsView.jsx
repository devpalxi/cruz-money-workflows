'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import {
  Search,
  Filter,
  Download,
  RotateCw,
  CheckCircle2,
  X,
  ChevronDown
} from 'lucide-react';
import AdminShell from '@/components/layout/AdminShell';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Checkbox from '@/components/ui/Checkbox';

// Curated AUSTRAC dataset matching deploy/austrac-transactions.html lines 247-262
export const curatedAustracEntries = [
  {
    id: 'TX-570',
    created: 'Jul 13, 2026 06:31AM',
    venue: 'Riverside RSL Club',
    idv: 'Fail',
    pep: 'Clear',
    sanctions: 'Clear',
    cop: 'No match',
    risk: 'High',
    amount: 25000,
    status: 'Payment Delayed',
    firstName: 'MARCUS',
    middleName: 'J',
    lastName: 'BRODY',
    dob: '14/05/1988',
    phone: '+61 412 901 234',
    address: '12 Wharf Rd, Parramatta NSW 2150',
    membership: 'MB-9921',
    occupation: 'Cash-intensive business owner',
    email: 'm.brody@gmail.com',
    accountName: 'MARCUS BRODY',
    bsb: '082-901',
    accountNo: '44810294',
    machine: 'EGM-002',
    cashAmount: '0.00',
    bankAmount: '25000.00',
    date: '2026-07-13',
    scenarioKey: 'high-value',
    austracStatus: 'Not submitted',
    austracRef: ''
  },
  {
    id: 'TX-567',
    created: 'Jul 09, 2026 12:31PM',
    venue: 'Riverside RSL Club',
    idv: 'Manual verification',
    pep: 'Clear',
    sanctions: 'Clear',
    cop: 'Close match',
    risk: 'Medium',
    amount: 5600,
    status: 'Pending Authorisation',
    firstName: 'ELENA',
    middleName: '',
    lastName: 'ROSTOVA',
    dob: '22/11/1991',
    phone: '+61 401 556 778',
    address: '44 Station St, Westmead NSW 2145',
    membership: 'ER-1102',
    occupation: 'Electrician',
    email: 'elena.r@outlook.com',
    accountName: 'ELENA ROSTOVA',
    bsb: '062-111',
    accountNo: '19283746',
    machine: 'EGM-014',
    cashAmount: '0.00',
    bankAmount: '5600.00',
    date: '2026-07-09',
    scenarioKey: 'single-hit',
    austracStatus: 'Not submitted',
    austracRef: ''
  },
  {
    id: 'TX-566',
    created: 'Jul 09, 2026 10:22AM',
    venue: 'Riverside RSL Club',
    idv: 'Manual verification',
    pep: 'Pending',
    sanctions: 'Clear',
    cop: 'Close match',
    risk: 'High',
    amount: 18500,
    status: 'Awaiting Approval',
    firstName: 'DAVID',
    middleName: 'L',
    lastName: 'CHEN',
    dob: '03/08/1985',
    phone: '+61 433 889 102',
    address: '88 Church St, Parramatta NSW 2150',
    membership: 'DC-8819',
    email: 'david.chen@gmail.com',
    accountName: 'DAVID CHEN',
    bsb: '082-901',
    accountNo: '77291034',
    machine: 'EGM-021',
    cashAmount: '0.00',
    bankAmount: '18500.00',
    date: '2026-07-09',
    scenarioKey: 'name-mismatch',
    austracStatus: 'Not submitted',
    austracRef: ''
  },
  {
    id: 'TX-563',
    created: 'Jul 09, 2026 09:13AM',
    venue: 'Riverside Grand Bistro',
    idv: 'Fail',
    pep: 'Hit',
    sanctions: 'Clear',
    cop: 'No match',
    risk: 'High',
    amount: 25000,
    status: 'Failed',
    firstName: 'ARTHUR',
    middleName: '',
    lastName: 'PENDELTON',
    dob: '19/02/1974',
    phone: '+61 422 109 456',
    address: '5 Victoria Ave, Castle Hill NSW 2154',
    membership: 'AP-3391',
    occupation: 'Retired',
    email: 'arthur.p@yahoo.com',
    accountName: 'ARTHUR PENDELTON',
    bsb: '032-001',
    accountNo: '88192019',
    machine: 'EGM-003',
    cashAmount: '0.00',
    bankAmount: '25000.00',
    date: '2026-07-09',
    scenarioKey: 'single-hit',
    austracStatus: 'Not submitted',
    austracRef: ''
  },
  {
    id: 'TX-562',
    created: 'Jul 09, 2026 06:57AM',
    venue: 'Riverside RSL Club',
    idv: 'Fail',
    pep: 'Clear',
    sanctions: 'Hit',
    cop: 'No match',
    risk: 'High',
    amount: 35000,
    status: 'Rejected',
    firstName: 'SERGEI',
    middleName: '',
    lastName: 'VOLKOV',
    dob: '30/09/1980',
    phone: '+61 409 334 556',
    address: '19 George St, Sydney NSW 2000',
    membership: 'SV-4401',
    occupation: 'Registered nurse',
    email: 'volkov@mail.com',
    accountName: 'SERGEI VOLKOV',
    bsb: '012-003',
    accountNo: '99201928',
    machine: 'EGM-045',
    cashAmount: '0.00',
    bankAmount: '35000.00',
    date: '2026-07-09',
    scenarioKey: 'dual-hit',
    austracStatus: 'Not submitted',
    austracRef: ''
  },
  {
    id: 'TX-560',
    created: 'Jul 08, 2026 12:50PM',
    venue: 'Riverside Lounge & Bar',
    idv: 'Manual verification',
    pep: 'Clear',
    sanctions: 'Clear',
    cop: 'Close match',
    risk: 'Medium',
    amount: 9800,
    status: 'Awaiting Approval',
    firstName: 'CHLOE',
    middleName: 'M',
    lastName: 'BENNETT',
    dob: '12/04/1993',
    phone: '+61 411 998 223',
    address: '302 Crown St, Wollongong NSW 2500',
    membership: 'CB-1092',
    email: 'chloe.b@gmail.com',
    accountName: 'CHLOE BENNETT',
    bsb: '082-901',
    accountNo: '11029384',
    machine: 'EGM-052',
    cashAmount: '0.00',
    bankAmount: '9800.00',
    date: '2026-07-08',
    scenarioKey: 'manual-kyc',
    austracStatus: 'Not submitted',
    austracRef: ''
  },
  {
    id: 'TX-556',
    created: 'Jul 07, 2026 12:17PM',
    venue: 'Riverside RSL Club',
    idv: 'Manual verification',
    pep: 'Pending',
    sanctions: 'Clear',
    cop: 'Close match',
    risk: 'High',
    amount: 14200,
    status: 'Awaiting Approval',
    firstName: 'LUCAS',
    middleName: '',
    lastName: 'VANCE',
    dob: '08/01/1989',
    phone: '+61 425 443 221',
    address: '77 High St, Penrith NSW 2750',
    membership: 'LV-7728',
    occupation: 'Cash-intensive business owner',
    email: 'lucas.vance@live.com',
    accountName: 'LUCAS VANCE',
    bsb: '062-888',
    accountNo: '55401928',
    machine: 'EGM-001',
    cashAmount: '0.00',
    bankAmount: '14200.00',
    date: '2026-07-07',
    scenarioKey: 'single-hit',
    austracStatus: 'Not submitted',
    austracRef: ''
  },
  {
    id: 'TX-554',
    created: 'Jul 07, 2026 07:50AM',
    venue: 'Riverside Leisure Center',
    idv: 'Fail',
    pep: 'Hit',
    sanctions: 'Clear',
    cop: 'Close match',
    risk: 'High',
    amount: 25000,
    status: 'Awaiting Approval',
    firstName: 'TARIQ',
    middleName: '',
    lastName: 'MANSOOR',
    dob: '25/07/1982',
    phone: '+61 431 002 991',
    address: '10 Campbell St, Blacktown NSW 2148',
    membership: 'TM-9941',
    occupation: 'Electrician',
    email: 'tariq.m@gmail.com',
    accountName: 'TARIQ MANSOOR',
    bsb: '032-111',
    accountNo: '33910293',
    machine: 'EGM-034',
    cashAmount: '0.00',
    bankAmount: '25000.00',
    date: '2026-07-07',
    scenarioKey: 'dual-hit',
    austracStatus: 'Submitted',
    austracRef: 'SMR-2026-89102'
  },
  {
    id: 'TX-553',
    created: 'Jul 07, 2026 07:06AM',
    venue: 'Riverside RSL Club',
    idv: 'Fail',
    pep: 'Clear',
    sanctions: 'Hit',
    cop: 'No match',
    risk: 'High',
    amount: 28000,
    status: 'Failed',
    firstName: 'VIKTOR',
    middleName: '',
    lastName: 'REZNOV',
    dob: '15/12/1979',
    phone: '+61 450 119 228',
    address: '82 Pacific Hwy, North Sydney NSW 2060',
    membership: 'VR-1928',
    email: 'viktor.r@gmail.com',
    accountName: 'VIKTOR REZNOV',
    bsb: '012-444',
    accountNo: '66718290',
    machine: 'EGM-002',
    cashAmount: '0.00',
    bankAmount: '28000.00',
    date: '2026-07-07',
    scenarioKey: 'dual-hit',
    austracStatus: 'Not submitted',
    austracRef: ''
  },
  {
    id: 'TX-551',
    created: 'Jul 06, 2026 12:59PM',
    venue: 'Riverside RSL Club',
    idv: 'Manual verification',
    pep: 'Clear',
    sanctions: 'Clear',
    cop: 'Close match',
    risk: 'Medium',
    amount: 7450,
    status: 'Draft',
    firstName: 'SARAH',
    middleName: 'A',
    lastName: 'JENKINS',
    dob: '18/06/1990',
    phone: '+61 402 887 112',
    address: '14 Macquarie St, Liverpool NSW 2170',
    membership: 'SJ-6612',
    occupation: 'Retired',
    email: 'sarah.j@gmail.com',
    accountName: 'SARAH JENKINS',
    bsb: '082-901',
    accountNo: '44501928',
    machine: 'EGM-014',
    cashAmount: '0.00',
    bankAmount: '7450.00',
    date: '2026-07-06',
    scenarioKey: 'name-mismatch',
    austracStatus: 'Submitted',
    austracRef: 'SMR-2026-88419'
  },
  {
    id: 'TX-548',
    created: 'Jul 06, 2026 10:15AM',
    venue: 'Riverside Grand Bistro',
    idv: 'Manual verification',
    pep: 'Pending',
    sanctions: 'Clear',
    cop: 'Match',
    risk: 'High',
    amount: 11000,
    status: 'Awaiting Approval',
    firstName: 'DAMIAN',
    middleName: '',
    lastName: 'CROSS',
    dob: '04/10/1987',
    phone: '+61 403 776 554',
    address: '91 Church St, Parramatta NSW 2150',
    membership: 'DC-9921',
    occupation: 'Registered nurse',
    email: 'damian.cross@gmail.com',
    accountName: 'DAMIAN CROSS',
    bsb: '062-000',
    accountNo: '11293840',
    machine: 'EGM-021',
    cashAmount: '0.00',
    bankAmount: '11000.00',
    date: '2026-07-06',
    scenarioKey: 'single-hit',
    austracStatus: 'Not submitted',
    austracRef: ''
  },
  {
    id: 'TX-542',
    created: 'Jul 05, 2026 03:40PM',
    venue: 'Riverside RSL Club',
    idv: 'Pass',
    pep: 'Clear',
    sanctions: 'Clear',
    cop: 'Close match',
    risk: 'Medium',
    amount: 6800,
    status: 'Pending Authorisation',
    firstName: 'RACHEL',
    middleName: '',
    lastName: 'ADAMS',
    dob: '29/03/1992',
    phone: '+61 404 332 110',
    address: '22 River Rd, Parramatta NSW 2150',
    membership: 'RA-5519',
    email: 'rachel.a@gmail.com',
    accountName: 'RACHEL ADAMS',
    bsb: '082-901',
    accountNo: '99201948',
    machine: 'EGM-003',
    cashAmount: '0.00',
    bankAmount: '6800.00',
    date: '2026-07-05',
    scenarioKey: 'all-clear',
    austracStatus: 'Submitted',
    austracRef: 'SMR-2026-87220'
  },
  {
    id: 'TX-539',
    created: 'Jul 05, 2026 11:20AM',
    venue: 'Riverside RSL Club',
    idv: 'Fail',
    pep: 'Hit',
    sanctions: 'Clear',
    cop: 'No match',
    risk: 'High',
    amount: 15000,
    status: 'Rejected',
    firstName: 'IVAN',
    middleName: '',
    lastName: 'PETROV',
    dob: '11/09/1983',
    phone: '+61 405 998 112',
    address: '50 Pitt St, Sydney NSW 2000',
    membership: 'IP-8821',
    occupation: 'Cash-intensive business owner',
    email: 'ivan.p@mail.com',
    accountName: 'IVAN PETROV',
    bsb: '012-999',
    accountNo: '44102938',
    machine: 'EGM-045',
    cashAmount: '0.00',
    bankAmount: '15000.00',
    date: '2026-07-05',
    scenarioKey: 'dual-hit',
    austracStatus: 'Not submitted',
    austracRef: ''
  },
  {
    id: 'TX-535',
    created: 'Jul 04, 2026 05:10PM',
    venue: 'Riverside RSL Club',
    idv: 'Manual verification',
    pep: 'Clear',
    sanctions: 'Clear',
    cop: 'Close match',
    risk: 'Medium',
    amount: 8200,
    status: 'Payment Completed',
    firstName: 'JAMES',
    middleName: 'W',
    lastName: 'THORNTON',
    dob: '07/02/1986',
    phone: '+61 406 221 889',
    address: '102 Riverside Dr, Parramatta NSW 2150',
    membership: 'JT-4401',
    occupation: 'Electrician',
    email: 'j.thornton@gmail.com',
    accountName: 'JAMES THORNTON',
    bsb: '082-901',
    accountNo: '77819203',
    machine: 'EGM-001',
    cashAmount: '0.00',
    bankAmount: '8200.00',
    date: '2026-07-04',
    scenarioKey: 'all-clear',
    austracStatus: 'Submitted',
    austracRef: 'SMR-2026-86114'
  }
];

// Mock records store names in all caps; show them in normal case in the UI
const toTitleCase = (s) => (s || '').toLowerCase().replace(/\b[a-z]/g, (c) => c.toUpperCase());

export default function AustracReportsView({ role = 'ADMIN' }) {
  const isSuperAdmin = role === 'SUPER ADMIN';
  const [entries, setEntries] = useState(curatedAustracEntries);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVenue, setSelectedVenue] = useState('all');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // AUSTRAC Relevant Filter Checkbox States
  const [selectedPep, setSelectedPep] = useState([]);
  const [selectedSanctions, setSelectedSanctions] = useState([]);
  const [selectedRisks, setSelectedRisks] = useState([]);
  const [selectedAustracStatus, setSelectedAustracStatus] = useState([]);

  // Load and synchronize entries with localStorage
  const loadEntriesWithStorage = () => {
    const updated = curatedAustracEntries.map((item) => {
      if (typeof window !== 'undefined') {
        const savedRef = localStorage.getItem(`cruz_austrac_ref_${item.id}`);
        if (savedRef) {
          return {
            ...item,
            austracStatus: 'Submitted',
            austracRef: savedRef
          };
        }
      }
      return item;
    });
    setEntries(updated);
  };

  useEffect(() => {
    loadEntriesWithStorage();
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Filter logic: AUSTRAC relevant
  const filteredEntries = useMemo(() => {
    return entries.filter((item) => {
      const q = searchQuery.toLowerCase().trim();
      const patronName = `${item.firstName || ''} ${item.lastName || ''}`.trim();
      const matchesSearch =
        !q ||
        item.id.toLowerCase().includes(q) ||
        item.venue.toLowerCase().includes(q) ||
        item.machine.toLowerCase().includes(q) ||
        patronName.toLowerCase().includes(q) ||
        (item.austracRef && item.austracRef.toLowerCase().includes(q));

      const matchesVenue = !isSuperAdmin || selectedVenue === 'all' || item.venue === selectedVenue;
      const matchesPep = selectedPep.length === 0 || selectedPep.includes(item.pep);
      const matchesSanctions = selectedSanctions.length === 0 || selectedSanctions.includes(item.sanctions);
      const matchesRisk = selectedRisks.length === 0 || selectedRisks.includes(item.risk);
      const matchesAustracStatus =
        selectedAustracStatus.length === 0 || selectedAustracStatus.includes(item.austracStatus || 'Not submitted');

      return matchesSearch && matchesVenue && matchesPep && matchesSanctions && matchesRisk && matchesAustracStatus;
    });
  }, [entries, searchQuery, selectedVenue, isSuperAdmin, selectedPep, selectedSanctions, selectedRisks, selectedAustracStatus]);

  const activeFilterCount =
    selectedPep.length +
    selectedSanctions.length +
    selectedRisks.length +
    selectedAustracStatus.length;

  const handleClearFilters = () => {
    setSelectedPep([]);
    setSelectedSanctions([]);
    setSelectedRisks([]);
    setSelectedAustracStatus([]);
    setSelectedVenue('all');
    setSearchQuery('');
  };

  const handleSelectAllFilters = () => {
    setSelectedPep(['Clear', 'Hit', 'Pending']);
    setSelectedSanctions(['Clear', 'Hit']);
    setSelectedRisks(['Medium', 'High']);
    setSelectedAustracStatus(['Submitted', 'Not submitted']);
  };

  const handleExportCsv = () => {
    const headers = ['Payout ID,Date & time,Winner,Amount,PEP,Sanctions,Risk rating,AUSTRAC status,AUSTRAC ref'];
    const rows = filteredEntries.map((e) => {
      const winnerName = toTitleCase(`${e.firstName || ''} ${e.lastName || ''}`.trim());
      return `"${e.id}","${e.created}","${winnerName}","$${e.amount.toLocaleString()}","${e.pep}","${e.sanctions}","${e.risk}","${e.austracStatus || 'Not submitted'}","${e.austracRef || ''}"`;
    });
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `austrac-transactions-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Exported AUSTRAC transactions to CSV.');
  };

  // Map an operational rating value to a shared Badge variant (3-tier system)
  const ratingVariant = (value) => {
    switch (value) {
      case 'Clear':
      case 'Low':
      case 'Pass':
      case 'Match':
        return 'pass';
      case 'Pending':
      case 'Medium':
      case 'Manual verification':
      case 'Close match':
        return 'warn';
      case 'Hit':
      case 'High':
      case 'Fail':
      case 'No match':
        return 'fail';
      default:
        return 'neutral';
    }
  };

  return (
    <AdminShell role={role}>
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0f172a] text-white px-4 py-3 rounded-lg shadow-xl border border-slate-700 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-5 h-5 text-teal-400 flex-shrink-0" />
          <span className="text-[13.5px] font-medium">{toastMessage}</span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white ml-2 cursor-pointer bg-transparent border-none"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5 mb-6">
        <div>
          <h1 className="text-[28px] font-bold text-[#0f172a] tracking-tight m-0 leading-tight">
            {isSuperAdmin ? 'AUSTRAC / SMRs' : 'AUSTRAC transactions'}
          </h1>
          <p className="text-[14px] text-[#475569] mt-1.5 mb-0 max-w-[68ch] leading-relaxed">
            {isSuperAdmin
              ? 'Transactions flagged for AUSTRAC reporting and Suspicious Matter Reports due to High or Medium risk rating.'
              : 'Transactions flagged for AUSTRAC reporting due to High or Medium risk rating.'}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button variant="secondary" size="sm" icon={Download} onClick={handleExportCsv}>
            Export CSV
          </Button>
          <Button
            variant="secondary"
            size="sm"
            icon={RotateCw}
            onClick={() => {
              loadEntriesWithStorage();
              showToast('Transactions refreshed.');
            }}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Controls & Table Container */}
      <section className="bg-white border border-[#e2e8f0] rounded-[10px] shadow-2xs overflow-visible">
        
        {/* Toolbar */}
        <div className="p-4 sm:p-5 border-b border-[#e2e8f0] relative">
          <div className="flex items-center gap-3 flex-wrap">
            
            {/* Filter Toggle Button with Badge */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className={`h-[38px] px-3 rounded-md text-[13px] font-bold border transition-colors cursor-pointer inline-flex items-center gap-2 ${
                  isFilterOpen || activeFilterCount > 0
                    ? 'border-[#0d9488] bg-[#f0fdfa] text-[#0d9488]'
                    : 'border-[#e2e8f0] bg-white text-[#0f172a] hover:bg-[#f8fafc]'
                }`}
              >
                <Filter className="w-4 h-4" />
                <span>Filters</span>
                {activeFilterCount > 0 && (
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-full text-[11px] font-bold bg-[#0d9488] text-white">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              {/* Floating Filter Popup */}
              {isFilterOpen && (
                <div className="absolute top-[calc(100%+8px)] left-0 z-50 bg-white border border-[#e2e8f0] rounded-lg p-5 shadow-modal w-[460px] max-w-[90vw] flex flex-col gap-5 animate-in fade-in zoom-in-95 duration-100">
                  <div className="grid grid-cols-2 gap-x-5 gap-y-5">
                    {[
                      { title: 'PEP', options: ['Clear', 'Hit', 'Pending'], sel: selectedPep, set: setSelectedPep },
                      { title: 'Sanctions', options: ['Clear', 'Hit'], sel: selectedSanctions, set: setSelectedSanctions },
                      { title: 'Risk rating', options: ['High', 'Medium'], sel: selectedRisks, set: setSelectedRisks },
                      { title: 'AUSTRAC status', options: ['Submitted', 'Not submitted'], sel: selectedAustracStatus, set: setSelectedAustracStatus },
                    ].map((group) => (
                      <div key={group.title}>
                        <div className="font-semibold text-[#475569] text-[12px] mb-2">
                          {group.title}
                        </div>
                        <div className="flex flex-col gap-2">
                          {group.options.map((opt) => (
                            <Checkbox
                              key={opt}
                              size="sm"
                              variant="brand"
                              checked={group.sel.includes(opt)}
                              onChange={(e) => {
                                if (e.target.checked) group.set([...group.sel, opt]);
                                else group.set(group.sel.filter((v) => v !== opt));
                              }}
                              label={opt}
                            />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Popup Footer */}
                  <div className="flex items-center gap-2.5 pt-3.5 border-t border-[#e2e8f0]">
                    <Button variant="primary" size="sm" onClick={handleSelectAllFilters}>
                      Select all
                    </Button>
                    <Button variant="secondary" size="sm" onClick={handleClearFilters}>
                      Clear
                    </Button>
                    <Button variant="ghost" size="sm" className="ml-auto" onClick={() => setIsFilterOpen(false)}>
                      Close
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Venue Dropdown for Super Admin */}
            {isSuperAdmin && (
              <div className="relative min-w-[190px]">
                <select
                  value={selectedVenue}
                  onChange={(e) => setSelectedVenue(e.target.value)}
                  className="h-[38px] w-full border border-[#e2e8f0] rounded-md bg-white text-[#0f172a] pl-3 pr-8 text-[13px] font-medium outline-none focus:border-[#0d9488] appearance-none cursor-pointer"
                >
                  <option value="all">All venues</option>
                  <option value="Riverside RSL Club">Riverside RSL Club</option>
                  <option value="Riverside Grand Bistro">Riverside Grand Bistro</option>
                  <option value="Riverside Lounge & Bar">Riverside Lounge & Bar</option>
                  <option value="Riverside Leisure Center">Riverside Leisure Center</option>
                </select>
                <ChevronDown className="w-4 h-4 text-[#475569] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            )}

            {/* Search Input */}
            <div className="relative flex-1 min-w-[240px] max-w-sm">
              <Search className="w-4 h-4 text-[#475569] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search payout ID, venue, winner..."
                className="h-[38px] w-full border border-[#e2e8f0] rounded-md bg-white text-[#0f172a] pl-9 pr-3 text-[13.5px] outline-none focus:border-[#0d9488]"
              />
            </div>

            {/* Results Count & Clear Filters */}
            <div className="ml-auto flex items-center gap-3">
              {activeFilterCount > 0 && (
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="text-[12.5px] font-bold text-[#0d9488] hover:underline bg-transparent border-none cursor-pointer"
                >
                  Clear filters
                </button>
              )}
              <span className="text-[12.5px] text-[#475569] font-medium">
                Showing {filteredEntries.length} transaction{filteredEntries.length === 1 ? '' : 's'}
              </span>
            </div>
          </div>
        </div>

        {/* AUSTRAC Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px] border-collapse text-left text-[13px]">
            <thead>
              <tr className="bg-[#f8fafb] border-b border-[#e2e8f0] text-[#475569] text-[12px] font-semibold">
                <th className="px-4 py-3 w-[10%]">Payout ID</th>
                <th className="px-4 py-3 w-[14%]">Date &amp; time</th>
                <th className="px-4 py-3 w-[18%]">Winner</th>
                <th className="px-4 py-3 w-[11%] text-right">Amount</th>
                <th className="px-3 py-3 w-[8%] text-center">PEP</th>
                <th className="px-3 py-3 w-[8%] text-center">Sanctions</th>
                <th className="px-3 py-3 w-[8%] text-center">Risk rating</th>
                <th className="px-3 py-3 w-[11%] text-center">AUSTRAC status</th>
                <th className="px-4 py-3 w-[12%] text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e2e8f0]">
              {filteredEntries.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-[#475569]">
                    <div className="text-[14px] font-bold text-[#0f172a]">No AUSTRAC transactions match your filter criteria</div>
                    <div className="text-[12.5px] text-[#475569] mt-1">Try adjusting your search terms or filter selections.</div>
                  </td>
                </tr>
              ) : (
                filteredEntries.map((row) => {
                  const winnerFullName = toTitleCase(`${row.firstName || ''} ${row.lastName || ''}`.trim());
                  return (
                    <tr
                      key={row.id}
                      className="hover:bg-[#f0fdfa] transition-colors"
                    >
                      {/* Payout ID */}
                      <td className="px-4 py-3.5 font-mono font-bold tabular-nums text-[#0d9488]">
                        <Link
                          href={`/admin/austrac/${row.id}`}
                          className="hover:underline text-[#0d9488]"
                          title="Open AUSTRAC report helper"
                        >
                          {row.id}
                        </Link>
                      </td>

                      {/* Date & time */}
                      <td className="px-4 py-3.5 font-mono tabular-nums text-[12px] text-[#475569] whitespace-nowrap">
                        {row.created}
                      </td>

                      {/* Winner name with membership subtext */}
                      <td className="px-4 py-3.5">
                        <div className="font-bold text-[#0f172a] text-[13.5px] leading-tight">
                          {winnerFullName}
                        </div>
                        {row.membership && (
                          <div className="text-[11px] font-mono tabular-nums text-[#475569] mt-0.5">
                            {row.membership}
                          </div>
                        )}
                      </td>

                      {/* Amount */}
                      <td className="px-4 py-3.5 font-mono font-bold tabular-nums text-[#0f172a] text-right whitespace-nowrap">
                        ${row.amount.toLocaleString('en-AU', { minimumFractionDigits: 2 })}
                      </td>

                      {/* PEP */}
                      <td className="px-3 py-3.5 text-center">
                        <Badge variant={ratingVariant(row.pep)} size="sm" className="whitespace-nowrap">
                          {row.pep}
                        </Badge>
                      </td>

                      {/* Sanctions */}
                      <td className="px-3 py-3.5 text-center">
                        <Badge variant={ratingVariant(row.sanctions)} size="sm" className="whitespace-nowrap">
                          {row.sanctions}
                        </Badge>
                      </td>

                      {/* Risk rating */}
                      <td className="px-3 py-3.5 text-center">
                        <Badge variant={ratingVariant(row.risk)} size="sm" className="whitespace-nowrap">
                          {row.risk}
                        </Badge>
                      </td>

                      {/* AUSTRAC status */}
                      <td className="px-3 py-3.5 text-center">
                        <span title={row.austracRef ? `AUSTRAC reference: ${row.austracRef}` : undefined}>
                          <Badge
                            variant={row.austracStatus === 'Submitted' ? 'pass' : 'neutral'}
                            size="sm"
                            className="whitespace-nowrap"
                          >
                            {row.austracStatus || 'Not submitted'}
                          </Badge>
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5 text-center whitespace-nowrap">
                        <div className="inline-flex items-center justify-center gap-2">
                          <Link
                            href={`/authoriser/${row.scenarioKey || 'dual-hit'}`}
                            className="inline-flex items-center justify-center h-8 px-3 rounded-md text-xs font-semibold bg-surface-card border border-border hover:bg-slate-50 hover:border-border-mid text-ink-hi transition-colors no-underline"
                            title="Open Authoriser determination workspace"
                          >
                            Authoriser view
                          </Link>
                          <Link
                            href={`/admin/austrac/${row.id}`}
                            className="inline-flex items-center justify-center h-8 px-3 rounded-md text-xs font-semibold bg-brand hover:bg-brand-dark text-white transition-colors no-underline"
                            title="Open AUSTRAC report helper"
                          >
                            Report helper
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>
    </AdminShell>
  );
}
