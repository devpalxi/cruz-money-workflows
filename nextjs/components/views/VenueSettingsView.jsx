'use client';

import React, { useState, useMemo, useRef, useLayoutEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  X,
  Plus,
  Trash2,
  Building2,
  Users,
  Cpu,
  CreditCard,
  FileCode,
  Sliders,
  Check,
  Pencil,
  Plug,
  Database,
  RefreshCw,
  Save,
  Eye,
  EyeOff,
  Server,
  Globe,
  Sparkles,
} from 'lucide-react';
import AdminShell from '@/components/layout/AdminShell';
import SegmentedBooleanToggle from '@/components/ui/SegmentedBooleanToggle';
import StatusPill from '@/components/ui/StatusPill';
import { initialVenues, initialClients, initialUsers, initialMachines } from '@/lib/mockData';
import { DEFAULT_VENUE_RISK_CONFIG } from '@/lib/riskEngine';
import { STATE_CASH_LIMITS, STATE_LABELS } from '@/lib/complianceGate';
import { getVenueIntegrationSettings, saveVenueIntegrationSettings } from '@/lib/mockMembershipDatabase';
import { getVenueComplianceCapture, saveVenueComplianceCapture } from '@/lib/venueCompliance';
import OcrDocketMappingView from './OcrDocketMappingView';

// Default fields analyzed directly from public/dummy-docket.png
const DEFAULT_DOCKET_FIELDS = [
  { key: "dateTime", label: "Date/Time", type: "datetime", example: "24/07/2026 09:49 AM" },
  { key: "payoutType", label: "Payout Type", type: "string", example: "EGM" },
  { key: "venue", label: "Venue", type: "string", example: "Riverside RSL Club" },
  { key: "machineNo", label: "Machine No.", type: "string", example: "EGM-021" },
  { key: "winAmount", label: "WIN AMOUNT", type: "currency", example: "AUD 1,250.00" },
  { key: "txnId", label: "Internal Txn ID", type: "string", example: "TXN-88213" },
  { key: "barcode", label: "Barcode", type: "barcode", example: "TXN-88213" }
];

export default function VenueSettingsView({
  role = 'ADMIN',
  venueId = 'venue-riverside-rsl',
  onBack = null
}) {
  const isSuperAdmin = role === 'SUPER ADMIN';
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const ocrMappingRef = useRef(null);

  // Sliding-pill (iOS-style) segmented control for the sub-$5,000 IDV policy toggle
  const sub5kSegmentRef = useRef(null);
  const sub5kAllBtnRef = useRef(null);
  const sub5kSkipBtnRef = useRef(null);
  const [sub5kThumbStyle, setSub5kThumbStyle] = useState({ left: 0, width: 0 });

  // Add / Edit field form state on OCR tab
  const [showAddFieldForm, setShowAddFieldForm] = useState(false);
  const [newField, setNewField] = useState({
    key: '',
    label: '',
    type: 'string',
    example: ''
  });
  const [editingFieldIndex, setEditingFieldIndex] = useState(null);
  const [editFieldData, setEditFieldData] = useState({
    key: '',
    label: '',
    type: 'string',
    example: ''
  });

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Find matched venue from mockData or fallback
  const matchedVenue = useMemo(() => {
    return (
      initialVenues.find((v) => v.id === venueId) || {
        id: venueId,
        clientId: 'client-riverside',
        name: 'Riverside RSL Club',
        shortName: 'Riverside RSL',
        status: 'Active',
        transactions: 84,
        volume: 145300,
        dailyLimit: 30000,
        minWaitTime: 24,
        delayUnresolvedPaymentItems: 30,
        disbursementMethods: ['cash', 'bank_transfer'],
        machines: 12,
        users: 5
      }
    );
  }, [venueId]);

  const parentClient = useMemo(() => {
    return initialClients.find((c) => c.id === matchedVenue.clientId) || {
      id: 'client-riverside',
      name: 'Riverside Leagues Ltd'
    };
  }, [matchedVenue]);

  const initialData = useMemo(() => {
    return {
      venueId: matchedVenue.id,
      venueName: matchedVenue.name || 'Riverside RSL Club',
      shortName: matchedVenue.shortName || (matchedVenue.name ? matchedVenue.name.slice(0, 20) : 'Riverside RSL'),
      orgName: parentClient.name || 'Riverside Leagues Ltd',
      clientId: parentClient.id,
      status: matchedVenue.status || 'Active',
      venueEmail: 'admin@riversidersl.com.au',
      abn: '55 123 456 789',
      venueAddress: '102 Riverside Drive, Parramatta NSW 2150',
      contactName: 'Jonathan Chen',
      contactEmail: 'j.chen@riversidersl.com.au',
      contactPhone: '+61 2 9876 5432',
      usersCount: matchedVenue.users ?? 5,
      machinesCount: matchedVenue.machines ?? 12,
      delayHours: matchedVenue.minWaitTime ?? 24,
      delayUnresolvedPaymentItems: matchedVenue.delayUnresolvedPaymentItems ?? 30,
      maxPerTransaction: 5000,
      maxDaily: matchedVenue.dailyLimit ?? 30000,
      sub5kIdvPolicy: 'skip',
      skipIdThreshold: 500,
      noEFTLimit: 500,
      allowedMethods: matchedVenue.disbursementMethods || ['cash', 'bank_transfer'],
      venueState: matchedVenue.state || 'NSW',
      qldCashLimitOverride: 1000,
      bankDetails: {
        partyName: 'Riverside RSL Club Gaming Acc',
        bsb: '082-901',
        accountNumber: '••••••7890',
        payToStatus: 'Active Agreement',
        mandateRef: 'AGR-PAYTO-88914',
        lastSync: 'Today, 08:30 AEST'
      },
      docketFields: DEFAULT_DOCKET_FIELDS,
      riskConfig: {
        ...DEFAULT_VENUE_RISK_CONFIG,
      },
      membershipIntegration: getVenueIntegrationSettings(matchedVenue.id),
      complianceCapture: getVenueComplianceCapture(matchedVenue.id),
      // Per-payout API call ceiling caps
      primaryIdvCalls: 3,
      primaryIdvRetries: 2,
      secondaryIdvCalls: 2,
      secondaryIdvRetries: 1,
      pepCalls: 1,
      sanctionsCalls: 1,
      adverseMediaCalls: 1,
      copCalls: 1,
      copRetries: 1,
    };
  }, [matchedVenue, parentClient]);

  const [formData, setFormData] = useState(initialData);
  const [savedData, setSavedData] = useState(initialData);
  const [disbursementError, setDisbursementError] = useState('');

  // Measure the active segment's position so the pill "thumb" can slide smoothly to it
  useLayoutEffect(() => {
    const activeBtn = formData.sub5kIdvPolicy === 'all' ? sub5kAllBtnRef.current : sub5kSkipBtnRef.current;
    if (activeBtn) {
      setSub5kThumbStyle({ left: activeBtn.offsetLeft, width: activeBtn.offsetWidth });
    }
  }, [formData.sub5kIdvPolicy, isEditing, activeTab]);

  // Synchronize when venueId changes
  React.useEffect(() => {
    setFormData(initialData);
    setSavedData(initialData);
    setIsEditing(false);
    setShowAddFieldForm(false);
    setEditingFieldIndex(null);
    setDisbursementError('');

    // Hydrate integration settings from localStorage (mock Strapi store)
    if (typeof window !== 'undefined') {
      const stored = getVenueIntegrationSettings(venueId);
      if (stored) {
        setFormData((prev) => ({
          ...prev,
          membershipIntegration: stored
        }));
        setSavedData((prev) => ({
          ...prev,
          membershipIntegration: stored
        }));
      }
    }
  }, [initialData, venueId]);

  // Handle Edit / Cancel / Save
  const handleStartEdit = () => {
    setFormData(savedData);
    setIsEditing(true);
    setDisbursementError('');
    setShowAddFieldForm(false);
    setEditingFieldIndex(null);
  };

  const handleCancelEdit = () => {
    setFormData(savedData);
    ocrMappingRef.current?.discard();
    setIsEditing(false);
    setShowAddFieldForm(false);
    setEditingFieldIndex(null);
    setDisbursementError('');
    showToast('Changes discarded.');
  };

  const handleToggleMethod = (method) => {
    if (!isEditing) return;
    const current = [...formData.allowedMethods];
    let next;
    if (current.includes(method)) {
      next = current.filter((m) => m !== method);
    } else {
      next = [...current, method];
    }

    if (next.includes('bank_transfer') && next.includes('cheque')) {
      setDisbursementError('Bank transfer and cheque cannot be enabled together.');
    } else if (next.length === 0) {
      setDisbursementError('At least one disbursement method must be enabled.');
    } else {
      setDisbursementError('');
    }

    setFormData({ ...formData, allowedMethods: next });
  };

  // Add field with 4 specific inputs (key, label, type, example)
  const handleConfirmAddField = (e) => {
    if (e) e.preventDefault();
    if (!newField.key.trim() || !newField.label.trim()) {
      showToast('Key and Label are required.');
      return;
    }

    const currentFields = formData.docketFields || [];
    const exists = currentFields.some(
      (f) => f.key.toLowerCase() === newField.key.trim().toLowerCase()
    );
    if (exists) {
      showToast(`Field with key "${newField.key.trim()}" already exists.`);
      return;
    }

    const updated = [
      ...currentFields,
      {
        key: newField.key.trim(),
        label: newField.label.trim(),
        type: newField.type || 'string',
        example: newField.example.trim() || '—'
      }
    ];
    setFormData({ ...formData, docketFields: updated });
    setNewField({ key: '', label: '', type: 'string', example: '' });
    setShowAddFieldForm(false);
    showToast('Field added to OCR docket schema.');
  };

  const handleStartEditField = (index) => {
    const target = (formData.docketFields || [])[index];
    if (!target) return;
    setEditingFieldIndex(index);
    setEditFieldData({ ...target });
    setShowAddFieldForm(false);
  };

  const handleSaveEditField = (index) => {
    if (!editFieldData.key.trim() || !editFieldData.label.trim()) {
      showToast('Key and Label are required.');
      return;
    }

    const currentFields = formData.docketFields || [];
    const exists = currentFields.some(
      (f, idx) => idx !== index && f.key.toLowerCase() === editFieldData.key.trim().toLowerCase()
    );
    if (exists) {
      showToast(`Field with key "${editFieldData.key.trim()}" already exists.`);
      return;
    }

    const updated = [...currentFields];
    updated[index] = {
      key: editFieldData.key.trim(),
      label: editFieldData.label.trim(),
      type: editFieldData.type || 'string',
      example: editFieldData.example.trim() || '—'
    };
    setFormData({ ...formData, docketFields: updated });
    setEditingFieldIndex(null);
    showToast('Docket field updated.');
  };

  const handleCancelEditField = () => {
    setEditingFieldIndex(null);
  };

  const handleRemoveField = (index) => {
    const updated = [...(formData.docketFields || [])];
    updated.splice(index, 1);
    setFormData({ ...formData, docketFields: updated });
    if (editingFieldIndex === index) {
      setEditingFieldIndex(null);
    }
    showToast('Field removed from docket schema.');
  };

  const handleSave = (e) => {
    if (e) e.preventDefault();

    if (!formData.venueName.trim()) {
      showToast('Venue legal name cannot be empty.');
      setActiveTab('profile');
      return;
    }

    if (formData.allowedMethods.includes('bank_transfer') && formData.allowedMethods.includes('cheque')) {
      setDisbursementError('Bank transfer and cheque cannot be enabled together.');
      setActiveTab('payouts');
      return;
    }
    if (formData.allowedMethods.length === 0) {
      setDisbursementError('At least one disbursement method must be enabled.');
      setActiveTab('payouts');
      return;
    }

    if (formData.allowedMethods.includes('cash')) {
      const statutoryCap = STATE_CASH_LIMITS[formData.venueState];
      if (statutoryCap && formData.noEFTLimit > statutoryCap) {
        showToast(`Maximum cash payout cannot exceed the ${formData.venueState} statutory ceiling of $${statutoryCap.toLocaleString('en-AU', { minimumFractionDigits: 2 })} AUD.`);
        setActiveTab('payouts');
        return;
      }
    }

    if (formData.sub5kIdvPolicy === 'skip') {
      if (formData.skipIdThreshold <= 0 || formData.skipIdThreshold >= 5000) {
        showToast('Sub-$5,000 Skip-ID threshold must be between $1 and $4,999 AUD.');
        setActiveTab('payouts');
        return;
      }
    }

    saveVenueIntegrationSettings(formData.venueId || venueId, formData.membershipIntegration);
    saveVenueComplianceCapture(formData.venueId || venueId, formData.complianceCapture);
    ocrMappingRef.current?.commit();
    setSavedData(formData);
    setIsEditing(false);
    setShowAddFieldForm(false);
    setEditingFieldIndex(null);
    setDisbursementError('');
    showToast('Venue settings saved successfully.');
  };

  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [isSavingIntegration, setIsSavingIntegration] = useState(false);
  const [integrationSavedNotice, setIntegrationSavedNotice] = useState(false);
  const [connectionTestDetails, setConnectionTestDetails] = useState(null);

  const handleTestConnection = () => {
    setIsTestingConnection(true);
    setConnectionTestDetails(null);
    setTimeout(() => {
      setIsTestingConnection(false);
      const isSuccess = Boolean(formData.membershipIntegration?.endpointUrl?.trim());
      const updated = {
        ...(formData.membershipIntegration || {}),
        connectionStatus: isSuccess ? 'Connected' : 'Connection failed',
        lastSync: isSuccess ? 'Just now (HTTP 200 OK — 38ms latency)' : 'Failed: Invalid or unreachable endpoint'
      };
      setFormData((prev) => ({
        ...prev,
        membershipIntegration: updated
      }));
      setSavedData((prev) => ({
        ...prev,
        membershipIntegration: updated
      }));
      saveVenueIntegrationSettings(formData.venueId || venueId, updated);
      if (isSuccess) {
        setConnectionTestDetails({
          status: 200,
          latency: '38ms',
          system: updated.system || 'Max Gaming',
          message: 'Handshake verified. 4 member test records indexed.'
        });
        showToast(`Connection to ${updated.system || 'Max Gaming'} API verified successfully.`);
      } else {
        setConnectionTestDetails({
          status: 500,
          latency: '—',
          system: updated.system || 'Max Gaming',
          message: 'Connection failed: API endpoint URL cannot be empty.'
        });
        showToast('Connection test failed: Please provide a valid endpoint URL.');
      }
    }, 500);
  };

  const handleSaveIntegration = () => {
    setIsSavingIntegration(true);
    setTimeout(() => {
      setIsSavingIntegration(false);
      saveVenueIntegrationSettings(formData.venueId || venueId, formData.membershipIntegration);
      setSavedData((prev) => ({
        ...prev,
        membershipIntegration: formData.membershipIntegration
      }));
      setIntegrationSavedNotice(true);
      showToast('Club membership integration saved to venue database.');
      setTimeout(() => setIntegrationSavedNotice(false), 3500);
    }, 350);
  };

  // Render Status Badge
  const renderStatusBadge = (status) => {
    const st = (status || 'Active').toLowerCase();
    if (st === 'active') {
      return (
        <span className="inline-flex items-center px-3 py-0.5 rounded-full text-[12px] font-semibold bg-[#ecfdf5] text-[#065f46] border border-[#a7f3d0]">
          Active
        </span>
      );
    }
    if (st === 'draft' || st === 'pending') {
      return (
        <span className="inline-flex items-center px-3 py-0.5 rounded-full text-[12px] font-semibold bg-[#fffbeb] text-[#78350f] border border-[#fde68a]">
          Draft
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-3 py-0.5 rounded-full text-[12px] font-semibold bg-[#fef2f2] text-[#991b1b] border border-[#fca5a5]">
        Inactive
      </span>
    );
  };

  return (
    <AdminShell role={role}>
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0f172a] text-white px-5 py-3.5 rounded-xl shadow-2xl border border-slate-700 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-5 h-5 text-[#14b8a6] flex-shrink-0" />
          <span className="text-[14px] font-medium">{toastMessage}</span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white ml-2 cursor-pointer bg-transparent border-none"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Super Admin Back Button */}
      {isSuperAdmin && onBack && (
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-[13.5px] font-bold text-[#0d9488] hover:text-[#0b7a6f] mb-4 cursor-pointer transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>All venues</span>
        </button>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3.5 flex-wrap">
            <h1 className="text-2xl sm:text-[28px] font-bold text-[#0f172a] tracking-tight m-0 leading-tight">
              {savedData.venueName}
            </h1>
            {renderStatusBadge(savedData.status)}
          </div>
          <p className="text-[14.5px] text-[#64748b] mt-1.5 mb-0 max-w-[75ch] leading-relaxed">
            Venue profile, operational payout limits, dual-authorisation rules, settlement connections, and OCR docket mapping.
          </p>
        </div>

        {/* Action Buttons (shared by every tab, including OCR docket mapping) */}
        <div className="flex items-center gap-3 flex-shrink-0 self-start sm:self-auto">
          {!isEditing ? (
            <button
              type="button"
              onClick={handleStartEdit}
              className="h-10 px-5 rounded-lg text-[14px] font-bold bg-white text-[#0f172a] border border-[#cbd5e1] hover:bg-[#f8fafc] transition-colors cursor-pointer shadow-xs"
            >
              Edit settings
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={handleCancelEdit}
                className="h-10 px-5 rounded-lg text-[14px] font-bold bg-white text-[#475569] border border-[#cbd5e1] hover:bg-[#f8fafc] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="h-10 px-6 rounded-lg text-[14px] font-bold bg-[#0d9488] hover:bg-[#0b7a6f] text-white transition-colors cursor-pointer shadow-xs border-none"
              >
                Save changes
              </button>
            </>
          )}
        </div>
      </div>

      {/* Tabbed Settings Workspace Container */}
      <section className="bg-white border border-[#e2e8f0] rounded-xl shadow-xs overflow-hidden">
        {/* Top Horizontal Navigation Bar */}
        <div className="flex border-b border-[#e2e8f0] px-8 pt-3 gap-8 text-[14px] overflow-x-auto bg-[#fafbfc]">
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`pb-3.5 font-bold border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'profile'
                ? 'border-[#0d9488] text-[#0d9488]'
                : 'border-transparent text-[#64748b] hover:text-[#0f172a]'
            }`}
          >
            Venue profile
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('payouts')}
            className={`pb-3.5 font-bold border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'payouts'
                ? 'border-[#0d9488] text-[#0d9488]'
                : 'border-transparent text-[#64748b] hover:text-[#0f172a]'
            }`}
          >
            Payout &amp; compliance
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('risk_routing')}
            className={`pb-3.5 font-bold border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'risk_routing'
                ? 'border-[#0d9488] text-[#0d9488]'
                : 'border-transparent text-[#64748b] hover:text-[#0f172a]'
            }`}
          >
            Risk &amp; routing
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('connection')}
            className={`pb-3.5 font-bold border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'connection'
                ? 'border-[#0d9488] text-[#0d9488]'
                : 'border-transparent text-[#64748b] hover:text-[#0f172a]'
            }`}
          >
            Settlement &amp; banking
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('ocr_mapping')}
            className={`pb-3.5 font-bold border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'ocr_mapping'
                ? 'border-[#0d9488] text-[#0d9488]'
                : 'border-transparent text-[#64748b] hover:text-[#0f172a]'
            }`}
          >
            OCR docket mapping
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('integrations')}
            className={`pb-3.5 font-bold border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'integrations'
                ? 'border-[#0d9488] text-[#0d9488]'
                : 'border-transparent text-[#64748b] hover:text-[#0f172a]'
            }`}
          >
            Integrations
          </button>
        </div>

        {/* Tab Content Area */}
        <div className="p-8 sm:p-10">
          {/* ─────────────────────────────────────────────────────────── */}
          {/* TAB 1: VENUE PROFILE                                        */}
          {/* ─────────────────────────────────────────────────────────── */}
          {activeTab === 'profile' && (
            <div className="space-y-8">
              <div className="pb-4 border-b border-[#e2e8f0]">
                <h2 className="text-[18px] font-bold text-[#0f172a] m-0">Venue profile</h2>
                <p className="text-[13.5px] text-[#64748b] mt-1 mb-0">
                  Core identity, legal licensing entity, operational contacts, and gaming machine assignments.
                </p>
              </div>

              {isEditing ? (
                /* Edit Mode: Form Inputs */
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
                  {/* Legal Name */}
                  <div className="space-y-1.5">
                    <label className="text-[13.5px] font-medium text-[#475569] block">
                      Venue legal name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.venueName}
                      onChange={(e) => setFormData({ ...formData, venueName: e.target.value })}
                      required
                      placeholder="e.g. Riverside RSL Club"
                      className="w-full h-11 px-3.5 border border-[#cbd5e1] rounded-lg text-[15px] text-[#0f172a] outline-none focus:border-[#0d9488]"
                    />
                  </div>

                  {/* Short Name */}
                  <div className="space-y-1.5">
                    <label className="text-[13.5px] font-medium text-[#475569] block">Short name</label>
                    <input
                      type="text"
                      maxLength={20}
                      value={formData.shortName}
                      onChange={(e) => setFormData({ ...formData, shortName: e.target.value })}
                      placeholder="e.g. Riverside RSL"
                      className="w-full h-11 px-3.5 border border-[#cbd5e1] rounded-lg text-[15px] text-[#0f172a] outline-none focus:border-[#0d9488]"
                    />
                  </div>

                  {/* Organisation / Group */}
                  <div className="space-y-1.5">
                    <label className="text-[13.5px] font-medium text-[#475569] block">Organisation / Client Group</label>
                    <select
                      value={formData.clientId}
                      onChange={(e) => {
                        const sel = initialClients.find((c) => c.id === e.target.value);
                        setFormData({
                          ...formData,
                          clientId: e.target.value,
                          orgName: sel ? sel.name : formData.orgName
                        });
                      }}
                      className="w-full h-11 px-3.5 border border-[#cbd5e1] rounded-lg text-[15px] text-[#0f172a] outline-none focus:border-[#0d9488] bg-white cursor-pointer"
                    >
                      {initialClients.map((client) => (
                        <option key={client.id} value={client.id}>
                          {client.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Status Selector */}
                  <div className="space-y-1.5">
                    <label className="text-[13.5px] font-medium text-[#475569] block">Venue operational status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full h-11 px-3.5 border border-[#cbd5e1] rounded-lg text-[15px] text-[#0f172a] outline-none focus:border-[#0d9488] bg-white cursor-pointer"
                    >
                      <option value="Active">Active</option>
                      <option value="Draft">Draft</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>

                  {/* Venue Email Address */}
                  <div className="space-y-1.5">
                    <label className="text-[13.5px] font-medium text-[#475569] block">
                      Venue email address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={formData.venueEmail}
                      onChange={(e) => setFormData({ ...formData, venueEmail: e.target.value })}
                      required
                      placeholder="admin@riversidersl.com.au"
                      className="w-full h-11 px-3.5 border border-[#cbd5e1] rounded-lg text-[15px] text-[#0f172a] outline-none focus:border-[#0d9488]"
                    />
                  </div>

                  {/* ABN */}
                  <div className="space-y-1.5">
                    <label className="text-[13.5px] font-medium text-[#475569] block">Australian Business Number (ABN)</label>
                    <input
                      type="text"
                      value={formData.abn}
                      onChange={(e) => setFormData({ ...formData, abn: e.target.value })}
                      placeholder="55 123 456 789"
                      className="w-full h-11 px-3.5 border border-[#cbd5e1] rounded-lg text-[15px] font-mono text-[#0f172a] outline-none focus:border-[#0d9488]"
                    />
                  </div>

                  {/* Venue Physical Address */}
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-[13.5px] font-medium text-[#475569] block">Venue physical address</label>
                    <input
                      type="text"
                      value={formData.venueAddress}
                      onChange={(e) => setFormData({ ...formData, venueAddress: e.target.value })}
                      placeholder="102 Riverside Drive, Parramatta NSW 2150"
                      className="w-full h-11 px-3.5 border border-[#cbd5e1] rounded-lg text-[15px] text-[#0f172a] outline-none focus:border-[#0d9488]"
                    />
                  </div>

                  {/* Contact Name */}
                  <div className="space-y-1.5">
                    <label className="text-[13.5px] font-medium text-[#475569] block">Compliance officer / Primary contact</label>
                    <input
                      type="text"
                      value={formData.contactName}
                      onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                      placeholder="Jonathan Chen"
                      className="w-full h-11 px-3.5 border border-[#cbd5e1] rounded-lg text-[15px] text-[#0f172a] outline-none focus:border-[#0d9488]"
                    />
                  </div>

                  {/* Contact Email */}
                  <div className="space-y-1.5">
                    <label className="text-[13.5px] font-medium text-[#475569] block">Contact email</label>
                    <input
                      type="email"
                      value={formData.contactEmail}
                      onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                      placeholder="j.chen@riversidersl.com.au"
                      className="w-full h-11 px-3.5 border border-[#cbd5e1] rounded-lg text-[15px] text-[#0f172a] outline-none focus:border-[#0d9488]"
                    />
                  </div>

                  {/* Contact Phone */}
                  <div className="space-y-1.5">
                    <label className="text-[13.5px] font-medium text-[#475569] block">Contact phone</label>
                    <input
                      type="tel"
                      value={formData.contactPhone}
                      onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                      placeholder="+61 2 9876 5432"
                      className="w-full h-11 px-3.5 border border-[#cbd5e1] rounded-lg text-[15px] font-mono text-[#0f172a] outline-none focus:border-[#0d9488]"
                    />
                  </div>
                </div>
              ) : (
                /* Read-Only Mode: Elegant Key-Value Specification Grid */
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-8">
                  {/* Left Column: Legal & Entity Overview */}
                  <div className="space-y-6">
                    <div className="border-b border-slate-100 pb-2">
                      <span className="text-[12px] font-bold uppercase tracking-wider text-slate-400">
                        Entity &amp; Registration
                      </span>
                    </div>

                    <div className="space-y-5">
                      <div>
                        <span className="text-[14px] font-bold text-[#0f172a] block">Venue Legal Name</span>
                        <span className="text-[14.5px] font-normal text-slate-500 block mt-1">
                          {savedData.venueName || '—'}
                        </span>
                      </div>

                      <div>
                        <span className="text-[14px] font-bold text-[#0f172a] block">Short Name</span>
                        <span className="text-[14.5px] font-normal text-slate-500 block mt-1">
                          {savedData.shortName || '—'}
                        </span>
                      </div>

                      <div>
                        <span className="text-[14px] font-bold text-[#0f172a] block">Organisation / Client Group</span>
                        <span className="text-[14.5px] font-normal text-slate-500 block mt-1">
                          {savedData.orgName || '—'}
                        </span>
                      </div>

                      <div>
                        <span className="text-[14px] font-bold text-[#0f172a] block">Australian Business Number (ABN)</span>
                        <span className="text-[14.5px] font-mono font-normal text-slate-500 block mt-1">
                          {savedData.abn || '—'}
                        </span>
                      </div>

                      <div>
                        <span className="text-[14px] font-bold text-[#0f172a] block">Physical Address</span>
                        <span className="text-[14.5px] font-normal text-slate-500 block mt-1 leading-relaxed">
                          {savedData.venueAddress || '—'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Operations & Personnel */}
                  <div className="space-y-6">
                    <div className="border-b border-slate-100 pb-2">
                      <span className="text-[12px] font-bold uppercase tracking-wider text-slate-400">
                        Liaison &amp; Operations
                      </span>
                    </div>

                    <div className="space-y-5">
                      <div>
                        <span className="text-[14px] font-bold text-[#0f172a] block">Venue System Email</span>
                        <span className="text-[14.5px] font-normal text-slate-500 block mt-1">
                          {savedData.venueEmail || '—'}
                        </span>
                      </div>

                      <div>
                        <span className="text-[14px] font-bold text-[#0f172a] block">Compliance Officer</span>
                        <span className="text-[14.5px] font-normal text-slate-500 block mt-1">
                          {savedData.contactName || '—'}
                        </span>
                      </div>

                      <div>
                        <span className="text-[14px] font-bold text-[#0f172a] block">Contact Email</span>
                        <span className="text-[14.5px] font-normal text-slate-500 block mt-1">
                          {savedData.contactEmail || '—'}
                        </span>
                      </div>

                      <div>
                        <span className="text-[14px] font-bold text-[#0f172a] block">Contact Phone</span>
                        <span className="text-[14.5px] font-mono font-normal text-slate-500 block mt-1">
                          {savedData.contactPhone || '—'}
                        </span>
                      </div>

                      <div>
                        <span className="text-[14px] font-bold text-[#0f172a] block">Assigned Operations Scale</span>
                        <span className="text-[14.5px] font-normal text-slate-500 block mt-1">
                          {savedData.usersCount} Staff Users · {savedData.machinesCount} Gaming Machines
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────── */}
          {/* TAB 2: PAYOUT & COMPLIANCE CONTROLS                         */}
          {/* ─────────────────────────────────────────────────────────── */}
          {activeTab === 'payouts' && (
            <div className="space-y-8">
              <div className="pb-4 border-b border-[#e2e8f0]">
                <h2 className="text-[18px] font-bold text-[#0f172a] m-0">Payout &amp; compliance controls</h2>
                <p className="text-[13.5px] text-[#64748b] mt-1 mb-0">
                  Operational disbursement caps, wait periods, cash limits, and AML identity verification thresholds.
                </p>
              </div>

              {/* Numeric Operational Limits — single column, one field per row */}
              <div className="space-y-3">
                {/* Minimum wait time */}
                <div className="border border-[#e2e8f0] rounded-lg bg-white p-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
                  <label className="text-[14px] font-bold text-[#0f172a] block sm:w-64 shrink-0">
                    Minimum wait time (hours) {isEditing && <span className="text-red-500">*</span>}
                  </label>
                  {isEditing ? (
                    <input
                      type="number"
                      min="0"
                      max="64"
                      value={formData.delayHours}
                      onChange={(e) => setFormData({ ...formData, delayHours: Number(e.target.value) })}
                      required
                      className="w-full sm:max-w-xs h-11 px-3.5 border border-[#cbd5e1] rounded-lg text-[15px] font-mono text-[#0f172a] outline-none focus:border-[#0d9488]"
                    />
                  ) : (
                    <div className="text-[14.5px] font-mono font-normal text-slate-500">
                      {savedData.delayHours} <span className="font-sans">hours</span>
                    </div>
                  )}
                </div>

                {/* Delay Unresolved Payment Items */}
                <div className="border border-[#e2e8f0] rounded-lg bg-white p-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
                  <label className="text-[14px] font-bold text-[#0f172a] block sm:w-64 shrink-0">
                    Retry delay interval (minutes) {isEditing && <span className="text-red-500">*</span>}
                  </label>
                  {isEditing ? (
                    <input
                      type="number"
                      min="10"
                      max="180"
                      value={formData.delayUnresolvedPaymentItems}
                      onChange={(e) => setFormData({ ...formData, delayUnresolvedPaymentItems: Number(e.target.value) })}
                      required
                      className="w-full sm:max-w-xs h-11 px-3.5 border border-[#cbd5e1] rounded-lg text-[15px] font-mono text-[#0f172a] outline-none focus:border-[#0d9488]"
                    />
                  ) : (
                    <div className="text-[14.5px] font-mono font-normal text-slate-500">
                      {savedData.delayUnresolvedPaymentItems} <span className="font-sans">minutes</span>
                    </div>
                  )}
                </div>

                {/* Max amount per transaction */}
                <div className="border border-[#e2e8f0] rounded-lg bg-white p-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
                  <label className="text-[14px] font-bold text-[#0f172a] block sm:w-64 shrink-0">
                    Max single transaction payout (AUD) {isEditing && <span className="text-red-500">*</span>}
                  </label>
                  {isEditing ? (
                    <div className="relative w-full sm:max-w-xs">
                      <span className="absolute left-3.5 top-3 text-[15px] text-[#64748b] font-mono select-none">$</span>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.maxPerTransaction}
                        onChange={(e) => setFormData({ ...formData, maxPerTransaction: Number(e.target.value) })}
                        required
                        className="w-full h-11 pl-8 pr-3.5 border border-[#cbd5e1] rounded-lg text-[15px] font-mono text-[#0f172a] outline-none focus:border-[#0d9488]"
                      />
                    </div>
                  ) : (
                    <div className="text-[14.5px] font-mono font-normal text-slate-500">
                      ${savedData.maxPerTransaction.toLocaleString('en-AU', { minimumFractionDigits: 2 })} <span className="font-sans">AUD</span>
                    </div>
                  )}
                </div>

                {/* Max daily venue disbursement cap */}
                <div className="border border-[#e2e8f0] rounded-lg bg-white p-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
                  <label className="text-[14px] font-bold text-[#0f172a] block sm:w-64 shrink-0">
                    Daily venue disbursement cap (AUD) {isEditing && <span className="text-red-500">*</span>}
                  </label>
                  {isEditing ? (
                    <div className="relative w-full sm:max-w-xs">
                      <span className="absolute left-3.5 top-3 text-[15px] text-[#64748b] font-mono select-none">$</span>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.maxDaily}
                        onChange={(e) => setFormData({ ...formData, maxDaily: Number(e.target.value) })}
                        required
                        className="w-full h-11 pl-8 pr-3.5 border border-[#cbd5e1] rounded-lg text-[15px] font-mono text-[#0f172a] outline-none focus:border-[#0d9488]"
                      />
                    </div>
                  ) : (
                    <div className="text-[14.5px] font-mono font-normal text-slate-500">
                      ${savedData.maxDaily.toLocaleString('en-AU', { minimumFractionDigits: 2 })} <span className="font-sans">AUD</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Payment Disbursement & Cash Controls */}
              <div className="pt-8 border-t border-[#e2e8f0] space-y-6">
                <div>
                  <h3 className="text-[17px] font-bold text-[#0f172a] m-0">Payment disbursement &amp; cash controls</h3>
                  <p className="text-[13.5px] text-[#64748b] mt-1 mb-0">
                    Approved payout channels and statutory state gaming cash limitations.
                  </p>
                </div>

                <div className="space-y-3">
                  {/* Allowed disbursement channels */}
                  <div className="border border-[#e2e8f0] rounded-lg bg-white p-4 space-y-1.5">
                    <label className="text-[14px] font-bold text-[#0f172a] block">
                      Allowed disbursement channels
                    </label>
                    {isEditing ? (
                      <>
                        <div className="flex gap-2.5 flex-wrap pt-0.5">
                          {['cash', 'bank_transfer', 'cheque'].map((method) => {
                            const isMethodActive = formData.allowedMethods.includes(method);
                            const label = method === 'cash' ? 'Cash' : method === 'bank_transfer' ? 'Bank transfer' : 'Cheque';
                            return (
                              <button
                                key={method}
                                type="button"
                                onClick={() => handleToggleMethod(method)}
                                aria-pressed={isMethodActive}
                                className={`h-11 px-4 rounded-full text-[14px] transition-all cursor-pointer inline-flex items-center gap-3 ${
                                  isMethodActive
                                    ? 'bg-white text-[#0d9488] font-bold border-2 border-[#0d9488] shadow-xs'
                                    : 'bg-white text-[#627d98] hover:text-[#102a43] border border-[#cbd5e1] hover:bg-[#f8fafc] shadow-2xs font-semibold'
                                }`}
                              >
                                <span>{label}</span>
                                <div
                                  className={`w-4 h-4 rounded-full flex items-center justify-center transition-colors ${
                                    isMethodActive
                                      ? 'bg-[#0d9488] text-white'
                                      : 'border border-[#cbd5e1] bg-white'
                                  }`}
                                >
                                  {isMethodActive && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                        {disbursementError && (
                          <div className="flex items-center gap-1.5 mt-2 text-xs font-bold text-red-600">
                            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                            <span>{disbursementError}</span>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="flex items-center gap-6 pt-1 flex-wrap">
                        {savedData.allowedMethods.map((m) => (
                          <StatusPill key={m} variant="pass" className="normal-case font-semibold">
                            <Check className="w-3.5 h-3.5 mr-1.5 stroke-[3]" />
                            {m === 'bank_transfer' ? 'Bank transfer' : m === 'cash' ? 'Cash' : 'Cheque'}
                          </StatusPill>
                        ))}
                      </div>
                    )}
                    {isEditing && (
                      <span className="block text-[12.5px] text-slate-500 pt-1">
                        Bank transfer and cheque cannot be enabled concurrently.
                      </span>
                    )}
                  </div>

                  {/* Maximum floor cash limit & statutory compliance */}
                  <div className="border border-[#e2e8f0] rounded-lg bg-white p-4 space-y-1.5">
                    <label className="text-[14px] font-bold text-[#0f172a] block">
                      Maximum floor cash limit (AUD) {isEditing && (formData.allowedMethods.includes('cash')) && <span className="text-red-500">*</span>}
                    </label>

                    {(isEditing ? formData.allowedMethods.includes('cash') : savedData.allowedMethods.includes('cash')) ? (
                      <div className="space-y-1.5">
                        {isEditing ? (
                          <>
                            <div className="relative max-w-sm">
                              <span className="absolute left-3.5 top-3 text-[15px] text-[#64748b] font-mono select-none">$</span>
                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={formData.noEFTLimit}
                                onChange={(e) => setFormData({ ...formData, noEFTLimit: Number(e.target.value) })}
                                className={`w-full h-11 pl-8 pr-3.5 bg-white border rounded-lg text-[15px] font-mono text-[#0f172a] outline-none ${
                                  STATE_CASH_LIMITS[savedData.venueState] && formData.noEFTLimit > STATE_CASH_LIMITS[savedData.venueState]
                                    ? 'border-red-400 focus:border-red-500'
                                    : 'border-[#cbd5e1] focus:border-[#0d9488]'
                                }`}
                              />
                            </div>
                            {STATE_CASH_LIMITS[savedData.venueState] && formData.noEFTLimit > STATE_CASH_LIMITS[savedData.venueState] ? (
                              <span className="block text-[12px] text-red-600 mt-1 font-medium">
                                Exceeds statutory ceiling (${(STATE_CASH_LIMITS[savedData.venueState]).toLocaleString('en-AU')} AUD).
                              </span>
                            ) : (
                              <div className="flex items-center gap-1.5 pt-0.5 text-[12.5px] text-slate-500">
                                <span>Statutory ceiling:</span>
                                <span className="font-mono font-semibold text-slate-800">
                                  ${STATE_CASH_LIMITS[savedData.venueState]?.toLocaleString('en-AU', { minimumFractionDigits: 2 })} AUD
                                </span>
                              </div>
                            )}
                          </>
                        ) : (
                          <>
                            <div className="text-[14.5px] font-mono font-normal text-slate-500 pt-1">
                              ${savedData.noEFTLimit.toLocaleString('en-AU', { minimumFractionDigits: 2 })} <span className="font-sans">AUD</span>
                            </div>
                            {STATE_CASH_LIMITS[savedData.venueState] && (
                              <div className="text-[13px] text-slate-500 pt-0.5">
                                Statutory ceiling: <span className="font-mono font-normal text-slate-600">${STATE_CASH_LIMITS[savedData.venueState].toLocaleString('en-AU', { minimumFractionDigits: 2 })} AUD</span>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    ) : (
                      <div className="pt-1 text-[14.5px] font-normal text-slate-500 italic">
                        Floor cash disbursements are disabled. All payouts are disbursed electronically via bank transfer or cheque.
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Identity Verification & AML Policy */}
              <div className="pt-8 border-t border-[#e2e8f0] space-y-6">
                <div>
                  <h3 className="text-[17px] font-bold text-[#0f172a] m-0">Identity verification (IDV) policy</h3>
                  <p className="text-[13.5px] text-[#64748b] mt-1 mb-0">
                    Statutory AML requirements and venue-level verification rules for patron payouts.
                  </p>
                </div>

                <div className="space-y-3">
                  {/* Federal AUSTRAC Requirement */}
                  <div className="border border-[#e2e8f0] rounded-lg bg-white p-4 space-y-1.5">
                    <label className="text-[14px] font-bold text-[#0f172a] block">
                      Federal AUSTRAC threshold (≥ $5,000 AUD)
                    </label>
                    <StatusPill variant="pass" className="normal-case font-semibold mt-1">
                      Mandatory DVS &amp; screening
                    </StatusPill>
                    <p className="text-[13px] text-slate-500 pt-1 mb-0 leading-relaxed">
                      Non-configurable federal mandate: electronic ID verification (DVS) and PEP/Sanctions screening required prior to disbursement.
                    </p>
                  </div>

                  {/* Sub-$5,000 Venue Policy */}
                  <div className="border border-[#e2e8f0] rounded-lg bg-white p-4 space-y-1.5">
                    <label className="text-[14px] font-bold text-[#0f172a] block">
                      Sub-$5,000 venue verification policy
                    </label>

                    {isEditing ? (
                      <div className="space-y-3 pt-0.5">
                        <div
                          ref={sub5kSegmentRef}
                          className="relative inline-flex rounded-full bg-[#f1f5f9] p-1"
                        >
                          {/* Sliding thumb */}
                          <div
                            className="absolute top-1 bottom-1 rounded-full bg-white shadow-sm transition-[left,width] duration-300 ease-out"
                            style={{ left: sub5kThumbStyle.left, width: sub5kThumbStyle.width }}
                          />
                          <button
                            ref={sub5kAllBtnRef}
                            type="button"
                            onClick={() => setFormData({ ...formData, sub5kIdvPolicy: 'all' })}
                            className={`relative z-10 h-10 px-4 rounded-full text-[13.5px] transition-colors duration-300 cursor-pointer ${
                              formData.sub5kIdvPolicy === 'all'
                                ? 'text-[#0d9488] font-bold'
                                : 'text-[#627d98] hover:text-[#102a43] font-semibold'
                            }`}
                          >
                            Require ID on all payouts
                          </button>
                          <button
                            ref={sub5kSkipBtnRef}
                            type="button"
                            onClick={() => setFormData({ ...formData, sub5kIdvPolicy: 'skip' })}
                            className={`relative z-10 h-10 px-4 rounded-full text-[13.5px] transition-colors duration-300 cursor-pointer ${
                              formData.sub5kIdvPolicy === 'skip'
                                ? 'text-[#0d9488] font-bold'
                                : 'text-[#627d98] hover:text-[#102a43] font-semibold'
                            }`}
                          >
                            Allow skip below threshold
                          </button>
                        </div>

                        {formData.sub5kIdvPolicy === 'skip' && (
                          <div className="space-y-1 max-w-xs pt-1">
                            <label className="text-[12.5px] font-medium text-[#475569] block">
                              Skip-ID threshold ($ AUD) <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                              <span className="absolute left-3.5 top-3 text-[15px] text-[#64748b] font-mono select-none">$</span>
                              <input
                                type="number"
                                min="1"
                                max="4999.99"
                                step="50"
                                value={formData.skipIdThreshold}
                                onChange={(e) => setFormData({ ...formData, skipIdThreshold: Number(e.target.value) })}
                                className="w-full h-11 pl-8 pr-3.5 border border-[#cbd5e1] rounded-lg text-[15px] font-mono text-[#0f172a] outline-none focus:border-[#0d9488]"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <>
                        <div className="text-[14.5px] font-normal text-slate-500 pt-1 min-h-[28px]">
                          {savedData.sub5kIdvPolicy === 'all' ? (
                            <span>Require ID on all payouts</span>
                          ) : (
                            <>
                              <span className="font-mono">${savedData.skipIdThreshold.toLocaleString('en-AU', { minimumFractionDigits: 2 })}</span> AUD threshold
                            </>
                          )}
                        </div>
                        <p className="text-[13px] text-slate-500 pt-0.5 mb-0 leading-relaxed">
                          {savedData.sub5kIdvPolicy === 'all'
                            ? 'All payouts require digital patron ID verification regardless of amount.'
                            : `Payouts below $${savedData.skipIdThreshold.toLocaleString('en-AU', { minimumFractionDigits: 2 })} AUD proceed without electronic ID check.`}
                        </p>
                      </>
                    )}
                  </div>

                  {/* Initial CDD capture - occupation */}
                  <div className="border border-[#e2e8f0] rounded-lg bg-white p-4 space-y-1.5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <label className="text-[14px] font-bold text-[#0f172a] block">
                          Capture patron occupation
                        </label>
                        <p className="text-[13px] text-slate-500 pt-1 mb-0 leading-relaxed max-w-2xl">
                          Asks the patron for their occupation while their ID details are collected,
                          and keeps it on file for any enhanced customer due diligence carried out
                          later. Self-reported and optional, so a blank answer never blocks a payout.
                          Leave this off until your venue adopts the initial CDD rules replacing IDV
                          during the March 2026 to March 2029 transition.
                        </p>
                      </div>
                      {isEditing ? (
                        <SegmentedBooleanToggle
                          value={formData.complianceCapture?.occupationCaptureEnabled ?? false}
                          onChange={(val) => {
                            setFormData((prev) => ({
                              ...prev,
                              complianceCapture: {
                                ...(prev.complianceCapture || {}),
                                occupationCaptureEnabled: val,
                              },
                            }));
                          }}
                          falseLabel="Off"
                          trueLabel="On"
                        />
                      ) : (
                        <StatusPill
                          variant={savedData.complianceCapture?.occupationCaptureEnabled ? 'pass' : 'neutral'}
                          className="normal-case font-semibold shrink-0"
                        >
                          {savedData.complianceCapture?.occupationCaptureEnabled ? 'Collected' : 'Not collected'}
                        </StatusPill>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* API Call Ceiling Configuration */}
              <div className="pt-8 border-t border-border space-y-6">
                <div>
                  <div className="flex items-center gap-2.5">
                    <h3 className="text-[17px] font-bold text-ink-hi m-0 font-sans">
                      API verification &amp; screening call ceilings
                    </h3>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11.5px] font-bold bg-brand-light text-brand border border-brand/20">
                      Per-payout limits
                    </span>
                  </div>
                  <p className="text-[13.5px] text-ink-mid mt-1 mb-0 max-w-[76ch]">
                    Configure the maximum allowable verification checks, AML screening attempts, and Confirmation of Payee queries per individual patron payout to control third-party vendor API spend.
                  </p>
                </div>

                <div className="space-y-6">
                  {/* Category 1: ID Verification (IDV) Ceilings */}
                  <div>
                    <div className="text-[12px] font-bold text-ink-mid uppercase tracking-wider mb-3 font-sans">
                      1. Identity Verification (IDV) Ceilings
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Primary ID Calls */}
                      <div className="p-4 bg-surface-card border border-border rounded-lg flex items-center justify-between gap-4">
                        <div>
                          <div className="text-[14px] font-bold text-ink-hi font-sans">Primary ID checks</div>
                          <div className="text-[12px] text-ink-mid mt-0.5 font-sans">Initial document check attempts [1–5]</div>
                        </div>
                        {isEditing ? (
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={() => setFormData({ ...formData, primaryIdvCalls: Math.max(1, (formData.primaryIdvCalls || 3) - 1) })}
                              disabled={(formData.primaryIdvCalls || 3) <= 1}
                              className="w-8 h-8 rounded-md border border-border bg-white text-ink-hi hover:bg-surface-hover disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center font-bold text-[16px] cursor-pointer"
                            >
                              –
                            </button>
                            <span className="w-8 text-center font-mono font-bold text-[15px] text-ink-hi">
                              {formData.primaryIdvCalls || 3}
                            </span>
                            <button
                              type="button"
                              onClick={() => setFormData({ ...formData, primaryIdvCalls: Math.min(5, (formData.primaryIdvCalls || 3) + 1) })}
                              disabled={(formData.primaryIdvCalls || 3) >= 5}
                              className="w-8 h-8 rounded-md border border-border bg-white text-ink-hi hover:bg-surface-hover disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center font-bold text-[16px] cursor-pointer"
                            >
                              +
                            </button>
                          </div>
                        ) : (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-[12.5px] font-mono font-bold bg-brand-light text-brand border border-brand/20">
                            {savedData.primaryIdvCalls || 3} max
                          </span>
                        )}
                      </div>

                      {/* Primary ID Retries */}
                      <div className="p-4 bg-surface-card border border-border rounded-lg flex items-center justify-between gap-4">
                        <div>
                          <div className="text-[14px] font-bold text-ink-hi font-sans">Primary ID retries</div>
                          <div className="text-[12px] text-ink-mid mt-0.5 font-sans">Same-document re-attempts [1–5]</div>
                        </div>
                        {isEditing ? (
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={() => setFormData({ ...formData, primaryIdvRetries: Math.max(1, (formData.primaryIdvRetries || 2) - 1) })}
                              disabled={(formData.primaryIdvRetries || 2) <= 1}
                              className="w-8 h-8 rounded-md border border-border bg-white text-ink-hi hover:bg-surface-hover disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center font-bold text-[16px] cursor-pointer"
                            >
                              –
                            </button>
                            <span className="w-8 text-center font-mono font-bold text-[15px] text-ink-hi">
                              {formData.primaryIdvRetries || 2}
                            </span>
                            <button
                              type="button"
                              onClick={() => setFormData({ ...formData, primaryIdvRetries: Math.min(5, (formData.primaryIdvRetries || 2) + 1) })}
                              disabled={(formData.primaryIdvRetries || 2) >= 5}
                              className="w-8 h-8 rounded-md border border-border bg-white text-ink-hi hover:bg-surface-hover disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center font-bold text-[16px] cursor-pointer"
                            >
                              +
                            </button>
                          </div>
                        ) : (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-[12.5px] font-mono font-bold bg-brand-light text-brand border border-brand/20">
                            {savedData.primaryIdvRetries || 2} max
                          </span>
                        )}
                      </div>

                      {/* Secondary ID Calls */}
                      <div className="p-4 bg-surface-card border border-border rounded-lg flex items-center justify-between gap-4">
                        <div>
                          <div className="text-[14px] font-bold text-ink-hi font-sans">Secondary ID checks</div>
                          <div className="text-[12px] text-ink-mid mt-0.5 font-sans">Alternative document checks [1–5]</div>
                        </div>
                        {isEditing ? (
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={() => setFormData({ ...formData, secondaryIdvCalls: Math.max(1, (formData.secondaryIdvCalls || 2) - 1) })}
                              disabled={(formData.secondaryIdvCalls || 2) <= 1}
                              className="w-8 h-8 rounded-md border border-border bg-white text-ink-hi hover:bg-surface-hover disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center font-bold text-[16px] cursor-pointer"
                            >
                              –
                            </button>
                            <span className="w-8 text-center font-mono font-bold text-[15px] text-ink-hi">
                              {formData.secondaryIdvCalls || 2}
                            </span>
                            <button
                              type="button"
                              onClick={() => setFormData({ ...formData, secondaryIdvCalls: Math.min(5, (formData.secondaryIdvCalls || 2) + 1) })}
                              disabled={(formData.secondaryIdvCalls || 2) >= 5}
                              className="w-8 h-8 rounded-md border border-border bg-white text-ink-hi hover:bg-surface-hover disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center font-bold text-[16px] cursor-pointer"
                            >
                              +
                            </button>
                          </div>
                        ) : (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-[12.5px] font-mono font-bold bg-brand-light text-brand border border-brand/20">
                            {savedData.secondaryIdvCalls || 2} max
                          </span>
                        )}
                      </div>

                      {/* Secondary ID Retries */}
                      <div className="p-4 bg-surface-card border border-border rounded-lg flex items-center justify-between gap-4">
                        <div>
                          <div className="text-[14px] font-bold text-ink-hi font-sans">Secondary ID retries</div>
                          <div className="text-[12px] text-ink-mid mt-0.5 font-sans">Secondary re-submission attempts [1–5]</div>
                        </div>
                        {isEditing ? (
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={() => setFormData({ ...formData, secondaryIdvRetries: Math.max(1, (formData.secondaryIdvRetries || 1) - 1) })}
                              disabled={(formData.secondaryIdvRetries || 1) <= 1}
                              className="w-8 h-8 rounded-md border border-border bg-white text-ink-hi hover:bg-surface-hover disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center font-bold text-[16px] cursor-pointer"
                            >
                              –
                            </button>
                            <span className="w-8 text-center font-mono font-bold text-[15px] text-ink-hi">
                              {formData.secondaryIdvRetries || 1}
                            </span>
                            <button
                              type="button"
                              onClick={() => setFormData({ ...formData, secondaryIdvRetries: Math.min(5, (formData.secondaryIdvRetries || 1) + 1) })}
                              disabled={(formData.secondaryIdvRetries || 1) >= 5}
                              className="w-8 h-8 rounded-md border border-border bg-white text-ink-hi hover:bg-surface-hover disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center font-bold text-[16px] cursor-pointer"
                            >
                              +
                            </button>
                          </div>
                        ) : (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-[12.5px] font-mono font-bold bg-brand-light text-brand border border-brand/20">
                            {savedData.secondaryIdvRetries || 1} max
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Category 2: AML Screening Watchlist Ceilings */}
                  <div>
                    <div className="text-[12px] font-bold text-ink-mid uppercase tracking-wider mb-3 font-sans">
                      2. AML Watchlist Screening Ceilings
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* PEP Calls */}
                      <div className="p-4 bg-surface-card border border-border rounded-lg flex items-center justify-between gap-4">
                        <div>
                          <div className="text-[14px] font-bold text-ink-hi font-sans">PEP screening</div>
                          <div className="text-[12px] text-ink-mid mt-0.5 font-sans">PEP database calls [1–2]</div>
                        </div>
                        {isEditing ? (
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={() => setFormData({ ...formData, pepCalls: Math.max(1, (formData.pepCalls || 1) - 1) })}
                              disabled={(formData.pepCalls || 1) <= 1}
                              className="w-8 h-8 rounded-md border border-border bg-white text-ink-hi hover:bg-surface-hover disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center font-bold text-[16px] cursor-pointer"
                            >
                              –
                            </button>
                            <span className="w-8 text-center font-mono font-bold text-[15px] text-ink-hi">
                              {formData.pepCalls || 1}
                            </span>
                            <button
                              type="button"
                              onClick={() => setFormData({ ...formData, pepCalls: Math.min(2, (formData.pepCalls || 1) + 1) })}
                              disabled={(formData.pepCalls || 1) >= 2}
                              className="w-8 h-8 rounded-md border border-border bg-white text-ink-hi hover:bg-surface-hover disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center font-bold text-[16px] cursor-pointer"
                            >
                              +
                            </button>
                          </div>
                        ) : (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-[12.5px] font-mono font-bold bg-brand-light text-brand border border-brand/20">
                            {savedData.pepCalls || 1} max
                          </span>
                        )}
                      </div>

                      {/* Sanctions Calls */}
                      <div className="p-4 bg-surface-card border border-border rounded-lg flex items-center justify-between gap-4">
                        <div>
                          <div className="text-[14px] font-bold text-ink-hi font-sans">Sanctions screening</div>
                          <div className="text-[12px] text-ink-mid mt-0.5 font-sans">DFAT / OFAC calls [1–2]</div>
                        </div>
                        {isEditing ? (
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={() => setFormData({ ...formData, sanctionsCalls: Math.max(1, (formData.sanctionsCalls || 1) - 1) })}
                              disabled={(formData.sanctionsCalls || 1) <= 1}
                              className="w-8 h-8 rounded-md border border-border bg-white text-ink-hi hover:bg-surface-hover disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center font-bold text-[16px] cursor-pointer"
                            >
                              –
                            </button>
                            <span className="w-8 text-center font-mono font-bold text-[15px] text-ink-hi">
                              {formData.sanctionsCalls || 1}
                            </span>
                            <button
                              type="button"
                              onClick={() => setFormData({ ...formData, sanctionsCalls: Math.min(2, (formData.sanctionsCalls || 1) + 1) })}
                              disabled={(formData.sanctionsCalls || 1) >= 2}
                              className="w-8 h-8 rounded-md border border-border bg-white text-ink-hi hover:bg-surface-hover disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center font-bold text-[16px] cursor-pointer"
                            >
                              +
                            </button>
                          </div>
                        ) : (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-[12.5px] font-mono font-bold bg-brand-light text-brand border border-brand/20">
                            {savedData.sanctionsCalls || 1} max
                          </span>
                        )}
                      </div>

                      {/* Adverse Media Calls */}
                      <div className="p-4 bg-surface-card border border-border rounded-lg flex items-center justify-between gap-4">
                        <div>
                          <div className="text-[14px] font-bold text-ink-hi font-sans">Adverse media</div>
                          <div className="text-[12px] text-ink-mid mt-0.5 font-sans">Negative news calls [1–2]</div>
                        </div>
                        {isEditing ? (
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={() => setFormData({ ...formData, adverseMediaCalls: Math.max(1, (formData.adverseMediaCalls || 1) - 1) })}
                              disabled={(formData.adverseMediaCalls || 1) <= 1}
                              className="w-8 h-8 rounded-md border border-border bg-white text-ink-hi hover:bg-surface-hover disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center font-bold text-[16px] cursor-pointer"
                            >
                              –
                            </button>
                            <span className="w-8 text-center font-mono font-bold text-[15px] text-ink-hi">
                              {formData.adverseMediaCalls || 1}
                            </span>
                            <button
                              type="button"
                              onClick={() => setFormData({ ...formData, adverseMediaCalls: Math.min(2, (formData.adverseMediaCalls || 1) + 1) })}
                              disabled={(formData.adverseMediaCalls || 1) >= 2}
                              className="w-8 h-8 rounded-md border border-border bg-white text-ink-hi hover:bg-surface-hover disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center font-bold text-[16px] cursor-pointer"
                            >
                              +
                            </button>
                          </div>
                        ) : (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-[12.5px] font-mono font-bold bg-brand-light text-brand border border-brand/20">
                            {savedData.adverseMediaCalls || 1} max
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Category 3: Confirmation of Payee (CoP) Ceilings */}
                  <div>
                    <div className="text-[12px] font-bold text-ink-mid uppercase tracking-wider mb-3 font-sans">
                      3. Confirmation of Payee (CoP) Ceilings
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* CoP Calls */}
                      <div className="p-4 bg-surface-card border border-border rounded-lg flex items-center justify-between gap-4">
                        <div>
                          <div className="text-[14px] font-bold text-ink-hi font-sans">CoP lookup attempts</div>
                          <div className="text-[12px] text-ink-mid mt-0.5 font-sans">Bank name-match queries [1–2]</div>
                        </div>
                        {isEditing ? (
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={() => setFormData({ ...formData, copCalls: Math.max(1, (formData.copCalls || 1) - 1) })}
                              disabled={(formData.copCalls || 1) <= 1}
                              className="w-8 h-8 rounded-md border border-border bg-white text-ink-hi hover:bg-surface-hover disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center font-bold text-[16px] cursor-pointer"
                            >
                              –
                            </button>
                            <span className="w-8 text-center font-mono font-bold text-[15px] text-ink-hi">
                              {formData.copCalls || 1}
                            </span>
                            <button
                              type="button"
                              onClick={() => setFormData({ ...formData, copCalls: Math.min(2, (formData.copCalls || 1) + 1) })}
                              disabled={(formData.copCalls || 1) >= 2}
                              className="w-8 h-8 rounded-md border border-border bg-white text-ink-hi hover:bg-surface-hover disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center font-bold text-[16px] cursor-pointer"
                            >
                              +
                            </button>
                          </div>
                        ) : (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-[12.5px] font-mono font-bold bg-brand-light text-brand border border-brand/20">
                            {savedData.copCalls || 1} max
                          </span>
                        )}
                      </div>

                      {/* CoP Retries */}
                      <div className="p-4 bg-surface-card border border-border rounded-lg flex items-center justify-between gap-4">
                        <div>
                          <div className="text-[14px] font-bold text-ink-hi font-sans">CoP retry attempts</div>
                          <div className="text-[12px] text-ink-mid mt-0.5 font-sans">Typo / re-entry bank lookups [1–2]</div>
                        </div>
                        {isEditing ? (
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={() => setFormData({ ...formData, copRetries: Math.max(1, (formData.copRetries || 1) - 1) })}
                              disabled={(formData.copRetries || 1) <= 1}
                              className="w-8 h-8 rounded-md border border-border bg-white text-ink-hi hover:bg-surface-hover disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center font-bold text-[16px] cursor-pointer"
                            >
                              –
                            </button>
                            <span className="w-8 text-center font-mono font-bold text-[15px] text-ink-hi">
                              {formData.copRetries || 1}
                            </span>
                            <button
                              type="button"
                              onClick={() => setFormData({ ...formData, copRetries: Math.min(2, (formData.copRetries || 1) + 1) })}
                              disabled={(formData.copRetries || 1) >= 2}
                              className="w-8 h-8 rounded-md border border-border bg-white text-ink-hi hover:bg-surface-hover disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center font-bold text-[16px] cursor-pointer"
                            >
                              +
                            </button>
                          </div>
                        ) : (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-[12.5px] font-mono font-bold bg-brand-light text-brand border border-brand/20">
                            {savedData.copRetries || 1} max
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────── */}
          {/* TAB 3: RISK & ROUTING CONTROLS                              */}
          {/* ─────────────────────────────────────────────────────────── */}
          {activeTab === 'risk_routing' && (
            <div className="space-y-8">
              <div className="pb-4 border-b border-[#e2e8f0]">
                <h2 className="text-[18px] font-bold text-[#0f172a] m-0">Risk-based approval routing &amp; engine controls</h2>
                <p className="text-[13.5px] text-[#64748b] mt-1 mb-0">
                  Dynamic maker-checker escalation policies, automatic risk scoring thresholds, and active AML signal monitors.
                </p>
              </div>

              <div className="space-y-8">
                {/* 1. Approval Routing Mode Selector */}
                <div className="space-y-3">
                  <label className="text-[14px] font-bold text-[#0f172a] block">Approval routing mode</label>
                  {isEditing ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <button
                        type="button"
                        onClick={() => setFormData({
                          ...formData,
                          riskConfig: { ...formData.riskConfig, routingMode: 'auto' }
                        })}
                        className={`p-5 rounded-xl text-left border transition-all cursor-pointer ${
                          formData.riskConfig?.routingMode === 'auto'
                            ? 'border-2 border-[#0d9488] bg-[#f0fdfa]'
                            : 'border-[#cbd5e1] bg-white hover:bg-[#f8fafc]'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[15px] font-bold text-[#0f172a]">Auto — Dynamic maker-checker</span>
                          <span className="text-[12px] font-semibold px-2.5 py-0.5 rounded-full bg-[#ecfdf5] text-[#065f46] border border-[#a7f3d0]">
                            Recommended
                          </span>
                        </div>
                        <p className="text-[13px] text-[#475569] m-0 leading-relaxed">
                          Automatically scale required approvers (1 or 2) based on real-time risk rating (PEP, sanctions, value thresholds, IDV).
                        </p>
                      </button>

                      <button
                        type="button"
                        onClick={() => setFormData({
                          ...formData,
                          riskConfig: { ...formData.riskConfig, routingMode: 'fixed' }
                        })}
                        className={`p-5 rounded-xl text-left border transition-all cursor-pointer ${
                          formData.riskConfig?.routingMode === 'fixed'
                            ? 'border-2 border-[#0d9488] bg-[#f0fdfa]'
                            : 'border-[#cbd5e1] bg-white hover:bg-[#f8fafc]'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[15px] font-bold text-[#0f172a]">Fixed — Static approver requirement</span>
                        </div>
                        <p className="text-[13px] text-[#475569] m-0 leading-relaxed">
                          Always enforce a fixed number of approver sign-offs across all payouts regardless of the assessed risk score.
                        </p>
                      </button>
                    </div>
                  ) : (
                    <div className="p-5 rounded-xl border border-[#e2e8f0] bg-slate-50/50 flex items-center justify-between">
                      <div>
                        <span className="text-[14px] font-bold text-[#0f172a] block">
                          Approval routing mode
                        </span>
                        <span className="text-[14.5px] font-normal text-slate-500 block mt-1">
                          {savedData.riskConfig?.routingMode === 'auto'
                            ? 'Auto — Dynamic maker-checker (Risk-based)'
                            : 'Fixed — Static approver requirement'}
                        </span>
                        <span className="text-[13px] text-slate-400 block mt-0.5">
                          {savedData.riskConfig?.routingMode === 'auto'
                            ? 'Required approver count is evaluated dynamically from the Automatic Risk Rating Engine verdict.'
                            : `Static policy requiring ${savedData.riskConfig?.fixedApprovers || 2} approver sign-offs.`}
                        </span>
                      </div>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-[12px] font-semibold border ${
                        savedData.riskConfig?.routingMode === 'auto'
                          ? 'bg-[#ecfdf5] text-[#065f46] border-[#a7f3d0]'
                          : 'bg-[#f8fafc] text-[#475569] border-[#cbd5e1]'
                      }`}>
                        {savedData.riskConfig?.routingMode === 'auto' ? 'Dynamic' : 'Fixed'}
                      </span>
                    </div>
                  )}
                </div>

                {/* 2A. Fixed Approver Requirement Selector (Shown when routing mode is fixed) */}
                {((isEditing ? formData.riskConfig?.routingMode : savedData.riskConfig?.routingMode) === 'fixed') && (
                  <div className="p-5 border border-[#e2e8f0] rounded-xl bg-white space-y-4">
                    <div>
                      <span className="text-[14px] font-bold text-[#0f172a] block">
                        Required number of approvers (Fixed Policy)
                      </span>
                      <span className="text-[13px] text-slate-400 block mt-0.5">
                        Mandatory sign-off count required for all transactions under this static venue policy.
                      </span>
                    </div>

                    {isEditing ? (
                      <div className="inline-flex rounded-lg shadow-2xs pt-1">
                        <button
                          type="button"
                          onClick={() => setFormData({
                            ...formData,
                            riskConfig: { ...formData.riskConfig, fixedApprovers: 1 }
                          })}
                          className={`h-10 px-5 rounded-l-lg text-[13.5px] transition-all cursor-pointer ${
                            (formData.riskConfig?.fixedApprovers ?? 2) === 1
                              ? 'relative z-10 bg-[#f0fdfa] text-[#0d9488] font-bold ring-1 ring-inset ring-[#0d9488]'
                              : 'relative bg-white text-[#627d98] hover:text-[#102a43] hover:bg-[#f8fafc] ring-1 ring-inset ring-[#cbd5e1] font-semibold'
                          }`}
                        >
                          1 Approver
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormData({
                            ...formData,
                            riskConfig: { ...formData.riskConfig, fixedApprovers: 2 }
                          })}
                          className={`h-10 px-5 -ml-px rounded-r-lg text-[13.5px] transition-all cursor-pointer ${
                            (formData.riskConfig?.fixedApprovers ?? 2) === 2
                              ? 'relative z-10 bg-[#f0fdfa] text-[#0d9488] font-bold ring-1 ring-inset ring-[#0d9488]'
                              : 'relative bg-white text-[#627d98] hover:text-[#102a43] hover:bg-[#f8fafc] ring-1 ring-inset ring-[#cbd5e1] font-semibold'
                          }`}
                        >
                          2 Approvers
                        </button>
                      </div>
                    ) : (
                      <div>
                        <span className="text-[14.5px] font-normal text-slate-500 block">
                          {(savedData.riskConfig?.fixedApprovers || 2)} Approver{(savedData.riskConfig?.fixedApprovers || 2) === 1 ? '' : 's'} required
                        </span>
                        <span className="text-[13px] text-slate-400 block mt-0.5">
                          {(savedData.riskConfig?.fixedApprovers || 2) === 1
                            ? 'Single approver sign-off is required for all payouts regardless of transaction value or risk flags.'
                            : 'Dual-control (2 independent approvers) is required for all payouts regardless of transaction value or risk flags.'}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* 2B. Dynamic Escalation Breakdown */}
                {((isEditing ? formData.riskConfig?.routingMode : savedData.riskConfig?.routingMode) === 'auto') && (
                  <div className="space-y-3.5 pt-2">
                    <label className="text-[14px] font-bold text-[#0f172a] block">
                      Approver requirement by risk tier (Dynamic Escalation Matrix)
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {/* Low Risk */}
                      <div className="p-4 border border-teal-200 rounded-xl bg-teal-50 shadow-xs flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-[14px] font-bold text-[#065f46]">Low Risk</span>
                            <span className="text-[11.5px] font-semibold px-2.5 py-0.5 rounded-full bg-[#ecfdf5] text-[#065f46] border border-[#a7f3d0]">
                              1 Approver
                            </span>
                          </div>
                          <p className="text-[13px] text-[#475569] m-0 leading-normal">
                            All clear IDV and clean AML screening. Single supervisor fast-track approval.
                          </p>
                        </div>
                        <div className="text-[13px] font-semibold text-[#065f46] mt-3 pt-2.5 border-t border-slate-100">
                          Fixed: 1 Approver
                        </div>
                      </div>

                      {/* Medium Risk */}
                      <div className="p-4 border border-amber-200 rounded-xl bg-amber-50 shadow-xs flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-[14px] font-bold text-[#78350f]">Medium Risk</span>
                            <span className="text-[11.5px] font-semibold px-2.5 py-0.5 rounded-full bg-[#fffbeb] text-[#78350f] border border-[#fde68a]">
                              {(isEditing ? formData.riskConfig?.mediumRiskApprovers : savedData.riskConfig?.mediumRiskApprovers) || 1} Approver(s)
                            </span>
                          </div>
                          <p className="text-[13px] text-[#475569] m-0 leading-normal">
                            Manual KYC, non-critical PEP 2/3, or elevated transaction value.
                          </p>
                        </div>
                        <div className="mt-3 pt-2.5 border-t border-slate-100">
                          {isEditing ? (
                            <div className="flex items-center justify-between">
                              <span className="text-[13px] font-medium text-[#78350f]">Policy choice:</span>
                              <select
                                value={formData.riskConfig?.mediumRiskApprovers || 1}
                                onChange={(e) => setFormData({
                                  ...formData,
                                  riskConfig: {
                                    ...formData.riskConfig,
                                    mediumRiskApprovers: Number(e.target.value)
                                  }
                                })}
                                className="h-8 px-2.5 border border-[#cbd5e1] rounded-md text-[13px] font-bold bg-white text-[#0f172a] outline-none"
                              >
                                <option value={1}>1 Approver</option>
                                <option value={2}>2 Approvers</option>
                              </select>
                            </div>
                          ) : (
                            <span className="text-[13px] font-semibold text-[#78350f]">
                              Venue policy: {savedData.riskConfig?.mediumRiskApprovers || 1} Approver(s)
                            </span>
                          )}
                        </div>
                      </div>

                      {/* High Risk */}
                      <div className="p-4 border border-red-200 rounded-xl bg-red-50 shadow-xs flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-[14px] font-bold text-[#991b1b]">High Risk</span>
                            <span className="text-[11.5px] font-semibold px-2.5 py-0.5 rounded-full bg-[#fef2f2] text-[#991b1b] border border-[#fca5a5]">
                              2 Approvers
                            </span>
                          </div>
                          <p className="text-[13px] text-[#475569] m-0 leading-normal">
                            PEP Class 1, active sanctions, blacklist hits, No ID, or high-value threshold.
                          </p>
                        </div>
                        <div className="text-[13px] font-semibold text-[#991b1b] mt-3 pt-2.5 border-t border-slate-100">
                          Mandatory: 2 Approvers
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. Risk Engine Dollar Thresholds */}
                <div className="space-y-4 pt-6 border-t border-[#e2e8f0]">
                  <label className="text-[14px] font-bold text-[#0f172a] block">
                    Automatic Risk Rating Engine — Value escalation thresholds
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {/* Medium Threshold */}
                    <div className="space-y-1.5">
                      <label className="text-[14px] font-bold text-[#0f172a] block">
                        Medium risk threshold ($ AUD) {isEditing && <span className="text-red-500">*</span>}
                      </label>
                      {isEditing ? (
                        <input
                          type="number"
                          min="0"
                          step="500"
                          value={formData.riskConfig?.lowThreshold || 5000}
                          onChange={(e) => setFormData({
                            ...formData,
                            riskConfig: {
                              ...formData.riskConfig,
                              lowThreshold: Number(e.target.value)
                            }
                          })}
                          className="w-full h-11 px-3.5 border border-[#cbd5e1] rounded-lg text-[15px] font-mono text-[#0f172a] outline-none focus:border-[#0d9488]"
                        />
                      ) : (
                        <div className="text-[14.5px] font-mono font-normal text-slate-500 min-h-[28px] mt-1">
                          ${(savedData.riskConfig?.lowThreshold || 5000).toLocaleString('en-AU', { minimumFractionDigits: 2 })} <span className="font-sans">AUD</span>
                        </div>
                      )}
                    </div>

                    {/* High Threshold */}
                    <div className="space-y-1.5">
                      <label className="text-[14px] font-bold text-[#0f172a] block">
                        High risk threshold ($ AUD) {isEditing && <span className="text-red-500">*</span>}
                      </label>
                      {isEditing ? (
                        <input
                          type="number"
                          min="0"
                          step="500"
                          value={formData.riskConfig?.highThreshold || 10000}
                          onChange={(e) => setFormData({
                            ...formData,
                            riskConfig: {
                              ...formData.riskConfig,
                              highThreshold: Number(e.target.value)
                            }
                          })}
                          className="w-full h-11 px-3.5 border border-[#cbd5e1] rounded-lg text-[15px] font-mono text-[#0f172a] outline-none focus:border-[#0d9488]"
                        />
                      ) : (
                        <div className="text-[14.5px] font-mono font-normal text-slate-500 min-h-[28px] mt-1">
                          ${(savedData.riskConfig?.highThreshold || 10000).toLocaleString('en-AU', { minimumFractionDigits: 2 })} <span className="font-sans">AUD</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* 4. Active Risk Engine Signals (2-Column Clean Grid) */}
                <div className="space-y-4 pt-6 border-t border-[#e2e8f0]">
                  <div>
                    <label className="text-[14px] font-bold text-[#0f172a] block">
                      Active risk rating engine signal monitors
                    </label>
                    <span className="text-[13px] text-slate-400 block mt-0.5">
                      Configure automated heuristic signal checks evaluated during patron screening.
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {[
                      { key: 'pep', label: 'Politically Exposed Person (PEP)', shortDesc: 'Class 1 (High) & Class 2/3 (Medium)' },
                      { key: 'sanctions', label: 'Sanctions Surveillance', shortDesc: 'Australian & International register checks (High)' },
                      { key: 'adverseMedia', label: 'Adverse Media Analysis', shortDesc: 'Financial crime and fraud records (High)' },
                      { key: 'valueThreshold', label: 'Value Threshold Escalation', shortDesc: 'Automatic trigger at configured dollar limits' },
                      { key: 'idvPath', label: 'IDV Path & DVS Verification', shortDesc: 'No-ID / DVS failures (High), Manual KYC (Medium)' },
                      { key: 'blacklist', label: 'Venue Blacklist Exclusion', shortDesc: 'Immediate match against active exclusion lists (High)' },
                      { key: 'cashRatio', label: 'Cash Disbursement Ratio', shortDesc: 'Cash ratio > 80% on payouts over $1,000' },
                      { key: 'documentCountry', label: 'Foreign Document Jurisdiction', shortDesc: 'Non-Australian passport / overseas identity (Medium)' },
                      { key: 'foreignPayment', label: 'Foreign Payment', shortDesc: 'Payout directed outside Australia — always requires a second approver' },
                    ].map((signal) => {
                      const isEnabled = isEditing
                        ? formData.riskConfig?.enabledSignals?.[signal.key] !== false
                        : savedData.riskConfig?.enabledSignals?.[signal.key] !== false;

                      return (
                        <div key={signal.key} className="p-3.5 border border-[#e2e8f0] rounded-xl bg-white flex items-center justify-between gap-3 shadow-xs">
                          <div className="min-w-0 pr-2">
                            <span className="text-[14px] font-bold text-[#0f172a] block truncate">{signal.label}</span>
                            <span className="text-[12.5px] font-normal text-slate-500 block mt-0.5">{signal.shortDesc}</span>
                          </div>
                          {isEditing ? (
                            <SegmentedBooleanToggle
                              value={isEnabled}
                              onChange={(val) => {
                                const currentSignals = formData.riskConfig?.enabledSignals || {};
                                setFormData({
                                  ...formData,
                                  riskConfig: {
                                    ...formData.riskConfig,
                                    enabledSignals: {
                                      ...currentSignals,
                                      [signal.key]: val
                                    }
                                  }
                                });
                              }}
                              trueLabel="Active"
                              falseLabel="Off"
                            />
                          ) : (
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                              isEnabled
                                ? 'bg-[#ecfdf5] text-[#065f46] border-[#a7f3d0]'
                                : 'bg-[#f8fafc] text-[#64748b] border-[#cbd5e1]'
                            }`}>
                              {isEnabled ? 'Active' : 'Disabled'}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────── */}
          {/* TAB 4: SETTLEMENT & BANKING CONNECTION                      */}
          {/* ─────────────────────────────────────────────────────────── */}
          {activeTab === 'connection' && (
            <div className="space-y-8">
              <div className="pb-4 border-b border-[#e2e8f0]">
                <h2 className="text-[18px] font-bold text-[#0f172a] m-0">Settlement &amp; banking connection</h2>
                <p className="text-[13.5px] text-[#64748b] mt-1 mb-0">
                  Direct debit settlement account and real-time PayTo agreement configurations for this venue.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Bank Account Details Card */}
                <div className="p-6 border border-[#e2e8f0] rounded-xl bg-white shadow-xs">
                  <div className="flex items-center justify-between mb-5">
                    <span className="text-[12.5px] font-bold text-[#475569] uppercase tracking-wider">
                      Settlement Bank Account
                    </span>
                    <span className="inline-flex items-center px-3 py-0.5 rounded-full text-[12px] font-semibold bg-[#ecfdf5] text-[#065f46] border border-[#a7f3d0]">
                      Verified
                    </span>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <span className="text-[14px] font-bold text-[#0f172a] block">Account Name</span>
                      <span className="text-[14.5px] font-normal text-slate-500 block mt-1">
                        {formData.bankDetails.partyName}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-100">
                      <div>
                        <span className="text-[14px] font-bold text-[#0f172a] block">BSB</span>
                        <span className="font-mono text-[14.5px] font-normal text-slate-500 block mt-1">
                          {formData.bankDetails.bsb}
                        </span>
                      </div>
                      <div>
                        <span className="text-[14px] font-bold text-[#0f172a] block">Account Number</span>
                        <span className="font-mono text-[14.5px] font-normal text-slate-500 block mt-1">
                          {formData.bankDetails.accountNumber}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* PayTo Agreement Card */}
                <div className="p-6 border border-[#e2e8f0] rounded-xl bg-white shadow-xs">
                  <div className="flex items-center justify-between mb-5">
                    <span className="text-[12.5px] font-bold text-[#475569] uppercase tracking-wider">
                      PayTo Agreement Mandate
                    </span>
                    <span className="inline-flex items-center px-3 py-0.5 rounded-full text-[12px] font-semibold bg-[#ecfdf5] text-[#065f46] border border-[#a7f3d0]">
                      {formData.bankDetails.payToStatus}
                    </span>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <span className="text-[14px] font-bold text-[#0f172a] block">Agreement Reference</span>
                      <span className="font-mono text-[14.5px] font-normal text-slate-500 block mt-1">
                        {formData.bankDetails.mandateRef}
                      </span>
                    </div>
                    <div className="pt-3 border-t border-slate-100">
                      <span className="text-[14px] font-bold text-[#0f172a] block">Last Status Sync</span>
                      <span className="text-[14.5px] font-normal text-slate-500 block mt-1">
                        {formData.bankDetails.lastSync}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────── */}
          {/* TAB 5: OCR DOCKET MAPPING                                   */}
          {/* Kept mounted (hidden, not unmounted) when another tab is    */}
          {/* active, so in-progress edits here survive tab switches      */}
          {/* until the shared Save changes / Cancel actions fire.        */}
          {/* ─────────────────────────────────────────────────────────── */}
          <div hidden={activeTab !== 'ocr_mapping'}>
            <OcrDocketMappingView
              ref={ocrMappingRef}
              venueName={formData.venueName}
              isEditing={isEditing}
              onSaveSchema={({ dbKeys, mappings }) => {
                const updatedFields = dbKeys.map((k) => ({
                  key: k.key,
                  label: k.label,
                  type: k.type,
                  example: mappings[k.key] || '—'
                }));
                setFormData((prev) => ({ ...prev, docketFields: updatedFields }));
                showToast('OCR docket mapping schema synchronized.');
              }}
            />
          </div>

          {/* ─────────────────────────────────────────────────────────── */}
          {/* TAB 6: CLUB MEMBERSHIP INTEGRATIONS                         */}
          {/* ─────────────────────────────────────────────────────────── */}
          {activeTab === 'integrations' && (
            <div className="space-y-8">
              {/* Tab Header with Connection Status Pill */}
              <div className="pb-4 border-b border-[#e2e8f0] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2.5">
                    <h2 className="text-[18px] font-bold text-[#0f172a] m-0">Integrations</h2>
                    <span className="text-[12px] font-semibold px-2.5 py-0.5 rounded-full bg-[#f1f5f9] text-[#475569] border border-[#e2e8f0]">
                      Club Membership &amp; Cash Desk
                    </span>
                  </div>
                  <p className="text-[13.5px] text-[#64748b] mt-1 mb-0">
                    Connect gaming machine and cash-desk membership databases (Max Gaming, LMO) to prefill winner details and push verified IDV data back.
                  </p>
                </div>
                <div>
                  {formData.membershipIntegration?.connectionStatus === 'Connected' ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-bold bg-[#ecfdf5] text-[#065f46] border border-[#a7f3d0]">
                      <Check className="w-3.5 h-3.5" />
                      Connected to {formData.membershipIntegration?.system || 'Max Gaming'}
                    </span>
                  ) : formData.membershipIntegration?.connectionStatus === 'Connection failed' ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-bold bg-[#fef2f2] text-[#991b1b] border border-[#fca5a5]">
                      <AlertCircle className="w-3.5 h-3.5" />
                      Connection failed
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-bold bg-[#f8fafc] text-[#475569] border border-[#cbd5e1]">
                      Not configured
                    </span>
                  )}
                </div>
              </div>

              {/* Status Notice Banner if Connected */}
              {formData.membershipIntegration?.connectionStatus === 'Connected' && (
                <div className="p-4 rounded-lg bg-teal-50 border border-teal-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <Plug className="w-5 h-5 text-[#0d9488] flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-[14px] font-bold text-[#0f172a] m-0">
                        {formData.membershipIntegration?.system} Active Bridge
                      </h4>
                      <p className="text-[13px] text-[#475569] mt-0.5 mb-0 leading-relaxed">
                        Floor staff can prefill winner details by scanning or typing membership cards in the Collector flow.
                        {formData.membershipIntegration?.writeBackEnabled && ' Two-way sync is active: verified identity data will be updated in the club database.'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-[12px] font-mono text-[#64748b]">
                      {formData.membershipIntegration?.lastSync || 'Today, 10:14 AEST'}
                    </span>
                  </div>
                </div>
              )}

              {/* Main Configuration Surface */}
              <div className="space-y-6">
                {/* Section 1: Vendor & API Credentials */}
                <div className="p-6 border border-[#e2e8f0] rounded-xl bg-white shadow-xs space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[#f1f5f9]">
                    <div>
                      <h3 className="text-[15px] font-bold text-[#0f172a] m-0 flex items-center gap-2">
                        <Server className="w-4 h-4 text-[#0d9488]" />
                        Club Membership Gateway Settings
                      </h3>
                      <p className="text-[13px] text-[#64748b] mt-0.5 mb-0">
                        Configure direct REST API authentication to pull patron records and verify winner eligibility.
                      </p>
                    </div>
                    <span className="text-[12px] font-mono text-[#64748b] bg-[#f8fafc] px-2.5 py-1 rounded border border-[#e2e8f0]">
                      Storage: localStorage mock (simulating Strapi)
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {/* System Vendor Selector */}
                    <div className="space-y-1.5">
                      <label className="text-[13.5px] font-medium text-[#475569] block">
                        Membership system vendor <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.membershipIntegration?.system || 'Max Gaming'}
                        onChange={(e) => {
                          const val = e.target.value;
                          setFormData((prev) => ({
                            ...prev,
                            membershipIntegration: {
                              ...(prev.membershipIntegration || {}),
                              system: val,
                              endpointUrl: val === 'Max Gaming'
                                ? 'https://api.maxgaming.com.au/v1/members'
                                : val === 'LMO'
                                ? 'https://api.lmo.com.au/members/v2'
                                : 'https://api.custom-club.com.au/members',
                              iframeUrl: val === 'Max Gaming'
                                ? 'https://console.maxgaming.com.au/embed/lookup'
                                : val === 'LMO'
                                ? 'https://console.lmo.com.au/portal/lookup'
                                : 'https://console.custom-club.com.au/lookup'
                            }
                          }));
                        }}
                        className="w-full h-11 px-3 border border-[#cbd5e1] rounded-lg text-[14.5px] text-[#0f172a] outline-none focus:border-[#0d9488] bg-white cursor-pointer"
                      >
                        <option value="Max Gaming">Max Gaming (Direct REST API)</option>
                        <option value="LMO">LMO (Direct REST API)</option>
                        <option value="Other">Other / Custom Club Vendor</option>
                      </select>
                      <p className="text-[12px] text-[#64748b]">
                        Select the gaming management or cash-desk system operational at {formData.shortName || 'this venue'}.
                      </p>
                    </div>

                    {/* API Gateway Endpoint */}
                    <div className="space-y-1.5">
                      <label className="text-[13.5px] font-medium text-[#475569] block">
                        API gateway endpoint <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="url"
                        value={formData.membershipIntegration?.endpointUrl || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setFormData((prev) => ({
                            ...prev,
                            membershipIntegration: {
                              ...(prev.membershipIntegration || {}),
                              endpointUrl: val
                            }
                          }));
                        }}
                        placeholder="https://api.maxgaming.com.au/v1/members"
                        className="w-full h-11 px-3.5 border border-[#cbd5e1] rounded-lg text-[14px] font-mono text-[#0f172a] outline-none focus:border-[#0d9488]"
                      />
                      <p className="text-[12px] text-[#64748b]">
                        Secure HTTPS endpoint for member profile retrieval and write-back synchronization.
                      </p>
                    </div>

                    {/* API Key / Token */}
                    <div className="space-y-1.5">
                      <label className="text-[13.5px] font-medium text-[#475569] block">
                        API access token / key <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type={showApiKey ? 'text' : 'password'}
                          value={formData.membershipIntegration?.apiKey || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            setFormData((prev) => ({
                              ...prev,
                              membershipIntegration: {
                                ...(prev.membershipIntegration || {}),
                                apiKey: val
                              }
                            }));
                          }}
                          placeholder="Enter API bearer token or shared secret"
                          className="w-full h-11 pl-3.5 pr-10 border border-[#cbd5e1] rounded-lg text-[14px] font-mono text-[#0f172a] outline-none focus:border-[#0d9488]"
                        />
                        <button
                          type="button"
                          onClick={() => setShowApiKey(!showApiKey)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748b] hover:text-[#0f172a] cursor-pointer"
                          title={showApiKey ? "Hide token" : "Show token"}
                        >
                          {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      <p className="text-[12px] text-[#64748b]">
                        Stored securely in venue configuration for authenticated server-to-server calls.
                      </p>
                    </div>

                    {/* Connection Test Action & Inline Pill */}
                    <div className="space-y-1.5 flex flex-col justify-end">
                      <div className="flex flex-wrap items-center gap-3">
                        <button
                          type="button"
                          onClick={handleTestConnection}
                          disabled={isTestingConnection}
                          className="h-11 px-5 rounded-lg border border-[#0d9488] text-[#0d9488] bg-[#f0fdfa] hover:bg-[#ccfbf1] text-[14px] font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50 flex-shrink-0"
                        >
                          {isTestingConnection ? (
                            <RefreshCw className="w-4 h-4 animate-spin" />
                          ) : (
                            <Plug className="w-4 h-4" />
                          )}
                          <span>Test connection</span>
                        </button>

                        {formData.membershipIntegration?.connectionStatus === 'Connected' ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-bold bg-[#ecfdf5] text-[#065f46] border border-[#a7f3d0]">
                            <Check className="w-3.5 h-3.5" /> Handshake OK (200)
                          </span>
                        ) : formData.membershipIntegration?.connectionStatus === 'Connection failed' ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-bold bg-[#fef2f2] text-[#991b1b] border border-[#fca5a5]">
                            <AlertCircle className="w-3.5 h-3.5" /> Ping failed
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-bold bg-[#f8fafc] text-[#475569] border border-[#cbd5e1]">
                            Ready to test
                          </span>
                        )}
                      </div>
                      <p className="text-[12px] text-[#64748b]">
                        {connectionTestDetails?.message || `Pings gateway. Status: ${formData.membershipIntegration?.lastSync || 'Never'}`}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Section 2: Two-way Write-back Synchronization */}
                <div className="p-6 border border-[#e2e8f0] rounded-xl bg-white shadow-xs space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h4 className="text-[15px] font-bold text-[#0f172a] m-0">
                        Two-way write-back synchronization
                      </h4>
                      <p className="text-[13px] text-[#475569] mt-0.5 mb-0">
                        Push verified DVS identity records back to the club membership database after successful identity verification.
                      </p>
                    </div>
                    <SegmentedBooleanToggle
                      value={formData.membershipIntegration?.writeBackEnabled ?? true}
                      onChange={(val) => {
                        setFormData((prev) => ({
                          ...prev,
                          membershipIntegration: {
                            ...(prev.membershipIntegration || {}),
                            writeBackEnabled: val
                          }
                        }));
                      }}
                      falseLabel="Disabled"
                      trueLabel="Enabled"
                    />
                  </div>

                  {formData.membershipIntegration?.writeBackEnabled && (
                    <div className="p-4 rounded-lg bg-amber-50 border border-amber-200 shadow-2xs text-[12.5px] text-[#78350f] leading-relaxed">
                      <strong className="font-bold">Compliance Notice:</strong> When two-way write-back is enabled, Cruz Money automatically synchronizes FrankieOne DVS-verified legal name, DOB, and confirmed residential address back to {formData.membershipIntegration?.system || 'the club database'}. Ensure your venue privacy disclosure covers automated data updates.
                    </div>
                  )}
                </div>

                {/* Section 3: Embedded Iframe Capability (Transitional Fallback) */}
                <div className="p-6 border border-[#e2e8f0] rounded-xl bg-white shadow-xs space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h4 className="text-[15px] font-bold text-[#0f172a] m-0">
                        Embedded iframe console fallback
                      </h4>
                      <p className="text-[13px] text-[#475569] mt-0.5 mb-0">
                        Embed vendor web portal inside Collector interface to avoid customer console switching for venues awaiting direct REST API negotiation.
                      </p>
                    </div>
                    <SegmentedBooleanToggle
                      value={formData.membershipIntegration?.iframeEnabled ?? false}
                      onChange={(val) => {
                        setFormData((prev) => ({
                          ...prev,
                          membershipIntegration: {
                            ...(prev.membershipIntegration || {}),
                            iframeEnabled: val
                          }
                        }));
                      }}
                      falseLabel="Disabled"
                      trueLabel="Enabled"
                    />
                  </div>

                  {formData.membershipIntegration?.iframeEnabled && (
                    <div className="space-y-4 pt-4 border-t border-[#f1f5f9]">
                      <div className="space-y-1.5">
                        <label className="text-[13px] font-medium text-[#475569] block">
                          Embedded vendor portal URL
                        </label>
                        <input
                          type="url"
                          value={formData.membershipIntegration?.iframeUrl || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            setFormData((prev) => ({
                              ...prev,
                              membershipIntegration: {
                                ...(prev.membershipIntegration || {}),
                                iframeUrl: val
                              }
                            }));
                          }}
                          placeholder="https://console.maxgaming.com.au/embed/lookup"
                          className="w-full h-11 px-3.5 border border-[#cbd5e1] rounded-lg text-[14px] font-mono text-[#0f172a] outline-none focus:border-[#0d9488]"
                        />
                        <p className="text-[12px] text-[#64748b]">
                          Transitional mode active while vendor negotiations (Akila / Craig / Brien) are finalized.
                        </p>
                      </div>

                      {/* Interactive Live Mini-Preview Sandbox */}
                      <div className="space-y-2">
                        <span className="text-[12px] font-bold text-[#475569] uppercase tracking-wider block">
                          Console Preview
                        </span>
                        <div className="h-44 rounded-lg border border-[#cbd5e1] bg-[#f8fafc] p-4 flex flex-col justify-between">
                          <div className="flex items-center justify-between border-b border-[#e2e8f0] pb-2 text-[12px]">
                            <span className="font-mono text-[#64748b] truncate max-w-[320px]">
                              {formData.membershipIntegration?.iframeUrl || 'https://console.maxgaming.com.au/embed/lookup'}
                            </span>
                            <span className="px-2 py-0.5 rounded-full bg-[#f0fdfa] text-[#0d9488] font-bold text-[11px] border border-[#99f6e4]">
                              Sandbox Frame Active
                            </span>
                          </div>
                          <div className="py-3 text-center space-y-1">
                            <p className="text-[13px] font-medium text-[#0f172a] m-0">
                              {formData.membershipIntegration?.system || 'Max Gaming'} Embedded Console Sandbox
                            </p>
                            <p className="text-[12px] text-[#64748b] m-0">
                              Floor Collectors can query member profiles within this secure frame when card scan is unavailable.
                            </p>
                          </div>
                          <div className="flex items-center justify-between text-[11.5px] text-[#64748b] pt-2 border-t border-[#e2e8f0]">
                            <span>Frame Security: X-Frame-Options ALLOW-FROM</span>
                            <span>Origin: Authenticated</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Section 4: Specifications Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                  {/* Card 1: Connected System */}
                  <div className="p-5 border border-[#e2e8f0] rounded-xl bg-white shadow-xs space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[12px] font-bold text-[#475569] uppercase tracking-wider">
                        Membership Provider
                      </span>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#f0fdfa] text-[#0d9488] border border-[#99f6e4]">
                        {formData.membershipIntegration?.system || 'Max Gaming'}
                      </span>
                    </div>
                    <div className="pt-2">
                      <span className="text-[14px] font-bold text-[#0f172a] block">Protocol Mode</span>
                      <span className="text-[13.5px] text-[#64748b] block mt-0.5">
                        Direct REST API v1 (Real-time prefill)
                      </span>
                    </div>
                    <div className="pt-2 border-t border-[#f1f5f9]">
                      <span className="text-[12.5px] font-medium text-[#64748b] block">API Gateway:</span>
                      <span className="font-mono text-[12px] text-[#0f172a] break-all block mt-0.5">
                        {formData.membershipIntegration?.endpointUrl || 'https://api.maxgaming.com.au/v1/members'}
                      </span>
                    </div>
                  </div>

                  {/* Card 2: Two-way Synchronization */}
                  <div className="p-5 border border-[#e2e8f0] rounded-xl bg-white shadow-xs space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[12px] font-bold text-[#475569] uppercase tracking-wider">
                        Two-Way Sync
                      </span>
                      {formData.membershipIntegration?.writeBackEnabled ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#ecfdf5] text-[#065f46] border border-[#a7f3d0]">
                          <Check className="w-3 h-3" /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#f8fafc] text-[#475569] border border-[#cbd5e1]">
                          Disabled
                        </span>
                      )}
                    </div>
                    <div className="pt-2">
                      <span className="text-[14px] font-bold text-[#0f172a] block">DVS Write-Back</span>
                      <span className="text-[13.5px] text-[#64748b] block mt-0.5 leading-normal">
                        {formData.membershipIntegration?.writeBackEnabled
                          ? 'Verified ID data automatically synced to venue record'
                          : 'One-way pull only (no data written back)'}
                      </span>
                    </div>
                    <div className="pt-2 border-t border-[#f1f5f9]">
                      <span className="text-[12.5px] font-medium text-[#64748b] block">Last Sync Status:</span>
                      <span className="text-[12.5px] text-[#0f172a] block mt-0.5">
                        {formData.membershipIntegration?.lastSync || 'Today, 10:14 AEST'}
                      </span>
                    </div>
                  </div>

                  {/* Card 3: Embedded Console Mode */}
                  <div className="p-5 border border-[#e2e8f0] rounded-xl bg-white shadow-xs space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[12px] font-bold text-[#475569] uppercase tracking-wider">
                        Floor Interface
                      </span>
                      {formData.membershipIntegration?.iframeEnabled ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#fffbeb] text-[#78350f] border border-[#fde68a]">
                          Iframe Transitional
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#ecfdf5] text-[#065f46] border border-[#a7f3d0]">
                          API Native Prefill
                        </span>
                      )}
                    </div>
                    <div className="pt-2">
                      <span className="text-[14px] font-bold text-[#0f172a] block">Collector Experience</span>
                      <span className="text-[13.5px] text-[#64748b] block mt-0.5 leading-normal">
                        {formData.membershipIntegration?.iframeEnabled
                          ? 'Embedded console iframe displayed in payout flow'
                          : 'Inline scanner with auto-fill into payout form'}
                      </span>
                    </div>
                    <div className="pt-2 border-t border-[#f1f5f9]">
                      <span className="text-[12.5px] font-medium text-[#64748b] block">Vendor Ownership:</span>
                      <span className="text-[12.5px] text-[#0f172a] block mt-0.5">
                        Akila / Craig / Brien Vendor Lead
                      </span>
                    </div>
                  </div>
                </div>

                {/* Save Integration Action Button */}
                <div className="p-5 rounded-xl bg-[#fafbfc] border border-[#e2e8f0] flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    {integrationSavedNotice ? (
                      <span className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#065f46] bg-[#ecfdf5] px-3.5 py-1.5 rounded-lg border border-[#a7f3d0]">
                        <CheckCircle2 className="w-4 h-4 text-[#0d9488]" />
                        Configuration committed to localStorage mock (simulating Strapi)
                      </span>
                    ) : (
                      <span className="text-[13px] text-[#64748b]">
                        Configuration is persisted in venue store (`cruz_venue_integration_{formData.venueId || venueId}`).
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={handleSaveIntegration}
                    disabled={isSavingIntegration}
                    className="w-full sm:w-auto h-11 px-6 rounded-lg bg-[#0d9488] hover:bg-[#0b7a6f] text-white font-bold text-[14px] flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs disabled:opacity-50"
                  >
                    {isSavingIntegration ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    <span>Save integration settings</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Form Footer */}
        <div className="p-5 sm:px-8 bg-[#fafbfc] border-t border-[#e2e8f0] flex flex-col sm:flex-row items-center justify-between gap-3 text-[13.5px] text-[#64748b]">
          <span>
            {isEditing
              ? 'Editing venue configuration. Click "Save changes" to commit.'
              : 'Viewing venue specifications. Click "Edit settings" to modify rules.'}
          </span>
        </div>
      </section>

      {/* Developer option - prototype toolbar, not part of the real venue flow */}
      {activeTab === 'ocr_mapping' && isEditing && (
        <div className="mt-6 flex items-center gap-3 p-3 rounded-lg border border-dashed border-[#cbd5e1] bg-white flex-wrap text-xs">
          <span className="font-semibold text-[#475569] flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#0d9488]" />
            Developer option
          </span>
          <span className="text-[#475569]">Load a sample docket instead of uploading a real one</span>
          <button
            type="button"
            onClick={() => ocrMappingRef.current?.loadSample()}
            className="px-3 py-1.5 rounded-md font-semibold bg-[#f1f5f9] text-[#475569] hover:bg-[#e2e8f0] transition-colors cursor-pointer border-none"
          >
            Sample ticket
          </button>
        </div>
      )}
    </AdminShell>
  );
}
