'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Check,
  Copy,
  Download,
  RotateCw,
  Search,
  Filter,
  Plus,
  Trash2,
  Building2,
  ShieldCheck,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Clock,
  Banknote,
  FileText,
  Mail,
  User,
  Sliders,
  ChevronDown
} from 'lucide-react';
import AppHeader from '@/components/layout/AppHeader';

export default function DesignSystemPage() {
  const [copiedKey, setCopiedKey] = useState(null);
  const [activeChoice, setActiveChoice] = useState('bank_transfer');
  const [multiChoice, setMultiChoice] = useState(['cash', 'bank_transfer']);
  const [booleanVal, setBooleanVal] = useState(false);
  const [mechanicalToggle, setMechanicalToggle] = useState(true);
  const [sampleSearch, setSampleSearch] = useState('');
  const [sampleText, setSampleText] = useState('Sample text');

  const handleToggleMultiChoice = (id) => {
    setMultiChoice((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const copyToClipboard = (key, text) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#102a43] pb-24">
      {/* Top Header */}
      <AppHeader role="ADMIN" />

      <main className="max-w-[1180px] mx-auto px-4 sm:px-6 pt-8 space-y-12">
        
        {/* Navigation & Title */}
        <div className="space-y-3">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-[14px] font-bold text-[#0d9488] hover:underline"
          >
            <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
            <span>Back to Index Hub</span>
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#d9e2ec] pb-6">
            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#f0fdfa] text-[#0d9488] border border-[#a7f3d0] mb-2">
                Design Tokens & Components
              </div>
              <h1 className="text-[34px] font-bold text-[#102a43] tracking-tight m-0 leading-tight">
                Design System & UI Library
              </h1>
              <p className="text-[15px] text-[#627d98] mt-1.5 mb-0 max-w-[72ch] leading-relaxed">
                Centralized reference for buttons, semantic pill badges, form controls, dossier grids, and card patterns used throughout Riverside Payouts.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[12px] font-mono font-bold px-2.5 py-1 rounded bg-[#edf2f7] text-[#475569]">
                v1.2.0 • Standardized
              </span>
            </div>
          </div>
        </div>

        {/* ─────────────────────────────────────────────────────────────
            SECTION 1: BUTTONS & INTERACTIVE CONTROLS
        ───────────────────────────────────────────────────────────── */}
        <section className="bg-white border border-[#d9e2ec] rounded-[10px] shadow-xs p-7 space-y-8">
          <div>
            <h2 className="text-[20px] font-bold text-[#102a43] m-0">1. Buttons & Action Triggers</h2>
            <p className="text-[13.5px] text-[#627d98] mt-1 mb-0">
              Primary, secondary, danger, ghost, segmented choice buttons, and action requirement states.
            </p>
          </div>

          {/* Primary & Secondary Action Buttons */}
          <div className="space-y-3">
            <h3 className="text-[13px] font-bold text-[#627d98] uppercase tracking-wider">Standard Action Buttons</h3>
            <div className="flex flex-wrap items-center gap-3">
              <button type="button" className="h-11 px-6 rounded-md text-[15px] font-bold bg-[#0d9488] hover:bg-[#0b7a6f] text-white transition-colors cursor-pointer border-none shadow-xs">
                Primary Button
              </button>

              <button type="button" className="h-11 px-6 rounded-md text-[15px] font-bold bg-[#0d9488] hover:bg-[#0b7a6f] text-white transition-colors cursor-pointer border-none shadow-xs inline-flex items-center gap-2">
                <FileText className="w-4.5 h-4.5" />
                <span>With Leading Icon</span>
              </button>

              <button type="button" disabled className="h-11 px-6 rounded-md text-[15px] font-bold bg-[#0d9488] text-white opacity-50 cursor-not-allowed border-none shadow-xs">
                Disabled Primary
              </button>

              <button type="button" className="h-11 px-5 rounded-md text-[15px] font-bold bg-white text-[#1a202c] border border-[#d9e2ec] hover:bg-[#f4f4f4] transition-colors cursor-pointer">
                Secondary Button
              </button>

              <button type="button" className="h-11 px-5 rounded-md text-[15px] font-bold bg-transparent text-[#475569] hover:bg-[#edf2f7] hover:text-[#102a43] transition-colors cursor-pointer border-none">
                Ghost Button
              </button>

              <button type="button" className="h-11 px-6 rounded-md text-[15px] font-bold bg-[#ef4444] hover:bg-[#dc2626] text-white transition-colors cursor-pointer border-none shadow-xs">
                Danger Primary
              </button>

              <button type="button" className="h-11 px-5 rounded-md text-[15px] font-bold bg-white text-[#ef4444] border border-[#fca5a5] hover:bg-[#fef2f2] transition-colors cursor-pointer">
                Danger Secondary
              </button>
            </div>
          </div>

          {/* Compact / Toolbar Buttons */}
          <div className="space-y-3 pt-3 border-t border-[#edf1f4]">
            <h3 className="text-[13px] font-bold text-[#627d98] uppercase tracking-wider">Toolbar & Utility Buttons (38px height)</h3>
            <div className="flex flex-wrap items-center gap-2.5">
              <button type="button" className="h-[38px] px-3.5 rounded-md text-[13px] font-bold bg-white text-[#102a43] border border-[#d9e2ec] hover:bg-[#f4f7f9] transition-colors cursor-pointer inline-flex items-center gap-1.5 shadow-xs">
                <Download className="w-4 h-4 text-[#627d98]" />
                <span>Export CSV</span>
              </button>

              <button type="button" className="h-[38px] px-3.5 rounded-md text-[13px] font-bold bg-white text-[#102a43] border border-[#d9e2ec] hover:bg-[#f4f7f9] transition-colors cursor-pointer inline-flex items-center gap-1.5 shadow-xs">
                <RotateCw className="w-4 h-4 text-[#627d98]" />
                <span>Refresh</span>
              </button>

              <button type="button" className="h-[38px] px-3 rounded-md text-[13px] font-bold border border-[#0d9488] bg-[#f0fdfa] text-[#0d9488] inline-flex items-center gap-2 cursor-pointer">
                <Filter className="w-4 h-4" />
                <span>Filters</span>
                <span className="w-5 h-5 rounded-full text-[11px] font-bold bg-[#0d9488] text-white inline-flex items-center justify-center">
                  3
                </span>
              </button>

              <button type="button" className="h-8 px-3 rounded text-[12px] font-bold bg-[#f0fdfa] text-[#0d9488] border border-[#a7f3d0] hover:bg-[#ccfbf1] transition-colors cursor-pointer inline-flex items-center gap-1">
                <Plus className="w-3.5 h-3.5" />
                <span>Add Relation</span>
              </button>

              <button type="button" className="p-2 rounded hover:bg-[#fef2f2] text-[#627d98] hover:text-[#ef4444] transition-colors cursor-pointer bg-transparent border-none">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Segmented Choice Buttons & Boolean Toggles */}
          <div className="space-y-5 pt-6 border-t border-[#edf1f4]">
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
              <div>
                <h3 className="text-[14px] font-bold text-[#102a43] tracking-tight">
                  Choice Groups & Segmented Boolean Toggles
                </h3>
                <p className="text-[12.5px] text-[#627d98] mt-0.5 mb-0">
                  Precision segmented tracks and tactile option chips adhering to Deep Teal brand tokens with responsive state indicators.
                </p>
              </div>
              <span className="text-[11px] font-mono font-medium text-[#0d9488] bg-[#f0fdfa] border border-[#99f6e4] px-2.5 py-0.5 rounded-full self-start">
                Interactive Preview
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8 pt-2">
              
              {/* Variant A: Single-Select Segmented Rail */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-[12.5px] font-bold text-[#102a43]">
                    Segmented Choice Rail (Single-select)
                  </label>
                  <span className="text-[11.5px] font-mono text-[#627d98]">
                    Selected: <span className="font-bold text-[#0d9488]">{activeChoice}</span>
                  </span>
                </div>
                <div className="inline-flex rounded-lg shadow-2xs w-full sm:w-auto">
                  {[
                    { id: 'cash', label: 'Cash', icon: Banknote },
                    { id: 'bank_transfer', label: 'Bank transfer', icon: Building2 },
                    { id: 'cheque', label: 'Cheque', icon: FileText }
                  ].map((item, index) => {
                    const Icon = item.icon;
                    const isPressed = activeChoice === item.id;
                    const isFirst = index === 0;
                    const isLast = index === 2;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setActiveChoice(item.id)}
                        className={`flex-1 sm:flex-initial h-[38px] px-4 text-[13px] font-semibold transition-all inline-flex items-center justify-center gap-2 cursor-pointer select-none ${
                          isFirst ? 'rounded-l-lg' : '-ml-px'
                        } ${isLast ? 'rounded-r-lg' : ''} ${
                          isPressed
                            ? 'relative z-10 bg-[#f0fdfa] text-[#0d9488] font-bold ring-1 ring-inset ring-[#0d9488]'
                            : 'relative bg-white text-[#627d98] hover:text-[#102a43] hover:bg-[#f8fafc] ring-1 ring-inset ring-[#cbd5e1]'
                        }`}
                      >
                        <Icon className={`w-4 h-4 ${isPressed ? 'text-[#0d9488]' : 'text-[#94a3b8]'}`} />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
                <p className="text-[12px] text-[#64748b] leading-relaxed">
                  Ideal for mutually exclusive single selections like views, tabs, or payment methods.
                </p>
              </div>

              {/* Variant B: Multi-Select Tactile Chips */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-[12.5px] font-bold text-[#102a43]">
                    Tactile Choice Chips (Multi-select)
                  </label>
                  <span className="text-[11.5px] font-mono text-[#627d98]">
                    Active: <span className="font-bold text-[#0d9488]">{multiChoice.length}</span>
                  </span>
                </div>
                <div className="flex flex-wrap gap-2.5 pt-0.5">
                  {[
                    { id: 'cash', label: 'Cash' },
                    { id: 'bank_transfer', label: 'Bank transfer' },
                    { id: 'cheque', label: 'Cheque' }
                  ].map((item) => {
                    const isSelected = multiChoice.includes(item.id);
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleToggleMultiChoice(item.id)}
                        className={`h-[38px] px-3.5 rounded-lg text-[13px] font-semibold transition-all inline-flex items-center gap-2 cursor-pointer select-none border ${
                          isSelected
                            ? 'bg-white text-[#0d9488] font-bold border-[#0d9488] shadow-xs'
                            : 'bg-white text-[#627d98] hover:text-[#102a43] hover:border-[#94a3b8] hover:bg-[#f8fafc] border-[#cbd5e1] shadow-2xs'
                        }`}
                      >
                        <span>{item.label}</span>
                        <span className={`w-4 h-4 rounded-full flex items-center justify-center transition-all ${
                          isSelected
                            ? 'bg-[#0d9488] text-white'
                            : 'border border-[#cbd5e1] bg-white'
                        }`}>
                          {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                        </span>
                      </button>
                    );
                  })}
                </div>
                <p className="text-[12px] text-[#64748b] leading-relaxed">
                  Click to toggle. Multiple options can be enabled simultaneously (e.g. venue payout types).
                </p>
              </div>

              {/* Variant C: Segmented Boolean Toggle */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-[12.5px] font-bold text-[#102a43]">
                    Segmented Boolean Toggle
                  </label>
                  <span className="text-[11.5px] font-mono text-[#627d98]">
                    Value: <span className="font-bold text-[#0d9488]">{String(booleanVal)}</span>
                  </span>
                </div>
                <div className="inline-flex h-[38px] rounded-lg shadow-2xs select-none min-w-[200px]">
                  <button
                    type="button"
                    onClick={() => setBooleanVal(false)}
                    className={`flex-1 px-4 text-[12.5px] font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer rounded-l-lg ${
                      !booleanVal
                        ? 'relative z-10 bg-[#fef2f2] text-[#dc2626] font-bold ring-1 ring-inset ring-[#dc2626]'
                        : 'relative bg-white text-[#627d98] hover:text-[#102a43] hover:bg-[#f8fafc] ring-1 ring-inset ring-[#cbd5e1]'
                    }`}
                  >
                    {!booleanVal && <span className="w-1.5 h-1.5 rounded-full bg-[#dc2626]"></span>}
                    <span>False</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setBooleanVal(true)}
                    className={`flex-1 px-4 text-[12.5px] font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer -ml-px rounded-r-lg ${
                      booleanVal
                        ? 'relative z-10 bg-[#f0fdfa] text-[#0d9488] font-bold ring-1 ring-inset ring-[#0d9488]'
                        : 'relative bg-white text-[#627d98] hover:text-[#102a43] hover:bg-[#f8fafc] ring-1 ring-inset ring-[#cbd5e1]'
                    }`}
                  >
                    {booleanVal && <span className="w-1.5 h-1.5 rounded-full bg-[#0d9488]"></span>}
                    <span>True</span>
                  </button>
                </div>
                <p className="text-[12px] text-[#64748b] leading-relaxed">
                  Clean joined segmented switch with semantic state coloring (Red for False, Teal for True).
                </p>
              </div>

              {/* Variant D: Modern Mechanical Boolean Toggle */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-[12.5px] font-bold text-[#102a43]">
                    Mechanical Switch Toggle
                  </label>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold border ${
                    mechanicalToggle
                      ? 'bg-[#ecfdf5] text-[#065f46] border-[#a7f3d0]'
                      : 'bg-[#f8fafc] text-[#64748b] border-[#cbd5e1]'
                  }`}>
                    {mechanicalToggle ? 'Active / True' : 'Inactive / False'}
                  </span>
                </div>
                <div className="flex items-center gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => setMechanicalToggle(!mechanicalToggle)}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                      mechanicalToggle ? 'bg-[#0d9488]' : 'bg-[#cbd5e1]'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                        mechanicalToggle ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                  <span className="text-[13px] font-medium text-[#102a43]">
                    {mechanicalToggle ? 'Enabled in platform policy' : 'Disabled in platform policy'}
                  </span>
                </div>
                <p className="text-[12px] text-[#64748b] leading-relaxed">
                  Standard switch control used across settings forms and table permission rows.
                </p>
              </div>

            </div>
          </div>
        </section>

        {/* ─────────────────────────────────────────────────────────────
            SECTION 2: SEMANTIC PILL SHAPES & BADGES
        ───────────────────────────────────────────────────────────── */}
        <section className="bg-white border border-[#d9e2ec] rounded-[10px] shadow-xs p-7 space-y-8">
          <div>
            <h2 className="text-[20px] font-bold text-[#102a43] m-0">2. Semantic Pill Shapes & Badges</h2>
            <p className="text-[13.5px] text-[#627d98] mt-1 mb-0">
              Strictly compliant with <code className="text-[#0d9488] font-mono text-[12.5px]">deploy/pill-colors.css</code> — always <code className="text-[#0d9488] font-mono text-[12.5px]">rounded-full (rounded-[999px])</code>, 1px solid border, 700 font weight.
            </p>
          </div>

          {/* Core Semantic Status Pills */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Green */}
            <div className="p-4 rounded-lg bg-[#f8fafc] border border-[#d9e2ec] space-y-3">
              <div className="text-[12px] font-bold uppercase tracking-wider text-[#065f46]">
                Green / Pass / Completed
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border whitespace-nowrap bg-[#ecfdf5] text-[#065f46] border-[#6ee7b7]">
                  Pass
                </span>
                <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border whitespace-nowrap bg-[#ecfdf5] text-[#065f46] border-[#6ee7b7]">
                  Clear
                </span>
                <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border whitespace-nowrap bg-[#ecfdf5] text-[#065f46] border-[#6ee7b7]">
                  Match
                </span>
                <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border whitespace-nowrap bg-[#ecfdf5] text-[#065f46] border-[#6ee7b7]">
                  Active
                </span>
                <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border whitespace-nowrap bg-[#ecfdf5] text-[#065f46] border-[#6ee7b7]">
                  Payment Completed
                </span>
              </div>
            </div>

            {/* Amber */}
            <div className="p-4 rounded-lg bg-[#f8fafc] border border-[#d9e2ec] space-y-3">
              <div className="text-[12px] font-bold uppercase tracking-wider text-[#78350f]">
                Amber / Warn / Review &amp; Pending
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border whitespace-nowrap bg-[#fffbeb] text-[#78350f] border-[#fcd34d]">
                  Payment Delayed
                </span>
                <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border whitespace-nowrap bg-[#fffbeb] text-[#78350f] border-[#fcd34d]">
                  Under review
                </span>
                <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border whitespace-nowrap bg-[#fffbeb] text-[#78350f] border-[#fcd34d]">
                  Processing
                </span>
                <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border whitespace-nowrap bg-[#fffbeb] text-[#78350f] border-[#fcd34d]">
                  Pending
                </span>
                <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border whitespace-nowrap bg-[#fffbeb] text-[#78350f] border-[#fcd34d]">
                  Manual verification
                </span>
                <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border whitespace-nowrap bg-[#fffbeb] text-[#78350f] border-[#fcd34d]">
                  Close match
                </span>
                <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border whitespace-nowrap bg-[#fffbeb] text-[#78350f] border-[#fcd34d]">
                  Medium risk
                </span>
                <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border whitespace-nowrap bg-[#fffbeb] text-[#78350f] border-[#fcd34d]">
                  Awaiting Approval
                </span>
              </div>
            </div>

            {/* Red */}
            <div className="p-4 rounded-lg bg-[#f8fafc] border border-[#d9e2ec] space-y-3">
              <div className="text-[12px] font-bold uppercase tracking-wider text-[#991b1b]">
                Red / Fail / High Risk
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border whitespace-nowrap bg-[#fef2f2] text-[#991b1b] border-[#fca5a5]">
                  Fail
                </span>
                <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border whitespace-nowrap bg-[#fef2f2] text-[#991b1b] border-[#fca5a5]">
                  Hit
                </span>
                <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border whitespace-nowrap bg-[#fef2f2] text-[#991b1b] border-[#fca5a5]">
                  No match
                </span>
                <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border whitespace-nowrap bg-[#fef2f2] text-[#991b1b] border-[#fca5a5]">
                  High risk
                </span>
                <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border whitespace-nowrap bg-[#fef2f2] text-[#991b1b] border-[#fca5a5]">
                  Rejected
                </span>
              </div>
            </div>
          </div>

          {/* Role Badges & Table Role Typography */}
          <div className="space-y-6 pt-4 border-t border-[#edf1f4]">
            
            {/* 1. Navigation Role Badges (Left Nav Bar only) */}
            <div className="space-y-2.5">
              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                <h3 className="text-[13.5px] font-bold text-[#102a43] tracking-tight">
                  Portal Navigation Role Badges (Left nav bar only)
                </h3>
                <span className="text-[11px] font-mono text-[#627d98]">
                  Location: <span className="font-bold text-[#102a43]">AdminSidebar header only</span>
                </span>
              </div>
              <p className="text-[12px] text-[#64748b] mt-0.5 mb-2 leading-relaxed">
                Role badges in the navigation bar use a unified Cobalt Blue palette (<code className="font-mono text-[11px] text-[#1d4ed8]">bg-[#eff6ff] text-[#1d4ed8] border-[#bfdbfe]</code>) with a <code className="font-mono text-[11px] text-[#0d9488]">rounded-md (6px)</code> radius, deliberately distinguishing administrative portal tags from circular (<code className="font-mono text-[11px] text-[#0d9488]">rounded-full</code>) operational status pills.
              </p>
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-md text-[10.5px] font-bold bg-[#eff6ff] text-[#1d4ed8] border border-[#bfdbfe] uppercase tracking-wider shadow-2xs">
                    SUPER ADMIN
                  </span>
                  <span className="text-[11.5px] text-[#627d98] font-medium">Cobalt Blue (6px squircle radius)</span>
                </div>
                <div className="flex items-center gap-2 sm:ml-6">
                  <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-md text-[10.5px] font-bold bg-[#eff6ff] text-[#1d4ed8] border border-[#bfdbfe] uppercase tracking-wider shadow-2xs">
                    ADMIN
                  </span>
                  <span className="text-[11.5px] text-[#627d98] font-medium">Cobalt Blue (6px squircle radius)</span>
                </div>
              </div>
            </div>

            {/* 2. Data Table Roles (No Pills Rule) */}
            <div className="space-y-2 pt-4 border-t border-[#edf1f4]">
              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                <h3 className="text-[13.5px] font-bold text-[#102a43] tracking-tight">
                  Data Table Roles (No pills rule)
                </h3>
                <span className="text-[11px] font-mono text-[#dc2626] font-bold">
                  Rule: Do NOT render table roles as pills
                </span>
              </div>
              <p className="text-[12px] text-[#64748b] mt-0.5 mb-2 leading-relaxed">
                Inside data tables and user rosters, user roles must render as clean, legible typography (<code className="font-mono text-[11px] text-[#0d9488]">text-[13px] font-semibold text-[#102a43]</code>), preserving pill badges strictly for operational statuses (e.g. Active, Suspended, Invited).
              </p>
              
              {/* Sample Table Row Demonstration */}
              <div className="border border-[#cbd5e1] rounded-lg overflow-hidden bg-white shadow-2xs">
                <table className="w-full text-left border-collapse text-[13px]">
                  <thead>
                    <tr className="bg-[#f8fafc] border-b border-[#cbd5e1]">
                      <th className="py-2.5 px-4 font-bold text-[11px] uppercase tracking-wider text-[#627d98]">User Name</th>
                      <th className="py-2.5 px-4 font-bold text-[11px] uppercase tracking-wider text-[#627d98]">User Role (Clean Typography)</th>
                      <th className="py-2.5 px-4 font-bold text-[11px] uppercase tracking-wider text-[#627d98]">Account Status (Pill Badge)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#edf1f4]">
                    <tr>
                      <td className="py-2.5 px-4 font-bold text-[#102a43]">Marcus Vance</td>
                      <td className="py-2.5 px-4 font-semibold text-[#102a43]">Venue Admin</td>
                      <td className="py-2.5 px-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#ecfdf5] text-[#065f46] border border-[#a7f3d0]">
                          Active
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-4 font-bold text-[#102a43]">Sarah Jenkins</td>
                      <td className="py-2.5 px-4 font-semibold text-[#102a43]">Authoriser</td>
                      <td className="py-2.5 px-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#ecfdf5] text-[#065f46] border border-[#a7f3d0]">
                          Active
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-4 font-bold text-[#102a43]">David Ross</td>
                      <td className="py-2.5 px-4 font-semibold text-[#102a43]">Approver</td>
                      <td className="py-2.5 px-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#fffbeb] text-[#78350f] border border-[#fcd34d]">
                          Invited
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-4 font-bold text-[#102a43]">Elena Rostova</td>
                      <td className="py-2.5 px-4 font-semibold text-[#102a43]">Collector</td>
                      <td className="py-2.5 px-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#fef2f2] text-[#991b1b] border border-[#fca5a5]">
                          Suspended
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </section>

        {/* ─────────────────────────────────────────────────────────────
            SECTION 3: FORM INPUTS & NUMERICAL FIELDS
        ───────────────────────────────────────────────────────────── */}
        <section className="bg-white border border-[#d9e2ec] rounded-[10px] shadow-xs p-7 space-y-8">
          <div>
            <h2 className="text-[20px] font-bold text-[#102a43] m-0">3. Form Controls & Tabular Numerals</h2>
            <p className="text-[13.5px] text-[#627d98] mt-1 mb-0">
              High-readability text fields, monospace financial inputs, AUD prefix currency components, and select dropdowns.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Standard Text Input */}
            <div className="space-y-1">
              <label className="text-[12px] font-bold text-[#627d98]">Standard Input <span className="text-[#dc2626]">*</span></label>
              <input
                type="text"
                value={sampleText}
                onChange={(e) => setSampleText(e.target.value)}
                className="w-full h-10 px-3 border border-[#d9e2ec] rounded-md text-[13.5px] text-[#102a43] bg-white outline-none focus:border-[#0d9488]"
              />
              <span className="text-[11.5px] text-[#627d98]">Helper hint text.</span>
            </div>

            {/* Currency Input with Prefix */}
            <div className="space-y-1">
              <label className="text-[12px] font-bold text-[#627d98]">Currency Input (AUD)</label>
              <div className="flex h-10 border border-[#d9e2ec] rounded-md overflow-hidden bg-white focus-within:border-[#0d9488]">
                <span className="px-3 bg-[#f8fafc] text-[#627d98] border-r border-[#d9e2ec] text-[12px] font-bold font-mono flex items-center select-none">
                  AUD
                </span>
                <input
                  type="text"
                  defaultValue="25,000.00"
                  className="flex-1 px-3 text-[14px] font-mono font-bold text-[#102a43] outline-none border-none"
                />
              </div>
              <span className="text-[11.5px] text-[#627d98]">Tabular numerals applied.</span>
            </div>

            {/* Search Input */}
            <div className="space-y-1">
              <label className="text-[12px] font-bold text-[#627d98]">Search Box with Icon</label>
              <div className="relative">
                <Search className="w-4 h-4 text-[#627d98] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="search"
                  value={sampleSearch}
                  onChange={(e) => setSampleSearch(e.target.value)}
                  placeholder="Search payout ID, venue..."
                  className="h-10 w-full border border-[#d9e2ec] rounded-md bg-white text-[#102a43] pl-9 pr-3 text-[13.5px] outline-none focus:border-[#0d9488]"
                />
              </div>
            </div>

            {/* Select Dropdown */}
            <div className="space-y-1">
              <label className="text-[12px] font-bold text-[#627d98]">Select Dropdown</label>
              <div className="relative">
                <select className="h-10 w-full border border-[#d9e2ec] rounded-md bg-white text-[#102a43] pl-3 pr-8 text-[13.5px] font-medium outline-none focus:border-[#0d9488] appearance-none cursor-pointer">
                  <option>Riverside RSL Club</option>
                  <option>Riverside Grand Bistro</option>
                  <option>Northside Leagues Club</option>
                </select>
                <ChevronDown className="w-4 h-4 text-[#627d98] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Read-only Monospace ID */}
            <div className="space-y-1">
              <label className="text-[12px] font-bold text-[#627d98]">Readonly Reference ID</label>
              <input
                type="text"
                readOnly
                value="TXN-2026-0889"
                className="w-full h-10 px-3 border border-[#d9e2ec] rounded-md text-[13.5px] font-mono font-bold text-[#0d9488] bg-[#f8fafc] cursor-default outline-none"
              />
            </div>

            {/* Disabled State */}
            <div className="space-y-1">
              <label className="text-[12px] font-bold text-[#627d98]">Disabled Field</label>
              <input
                type="text"
                disabled
                value="Super Admin View Only"
                className="w-full h-10 px-3 border border-[#d9e2ec] rounded-md text-[13.5px] text-[#627d98] bg-[#f8fafc] cursor-not-allowed outline-none"
              />
            </div>

          </div>
        </section>

        {/* ─────────────────────────────────────────────────────────────
            SECTION 4: DOSSIER GRID & COPYABLE CELL PATTERNS
        ───────────────────────────────────────────────────────────── */}
        <section className="bg-white border border-[#d9e2ec] rounded-[10px] shadow-xs overflow-hidden">
          <div className="p-6 border-b border-[#edf1f4] bg-[#f8fafc]">
            <h2 className="text-[18px] font-bold text-[#0f172a] m-0">4. Detail Dossier Grid (AUSTRAC & User Profiles)</h2>
            <p className="text-[13px] text-[#475569] mt-0.5 mb-0">
              2-column split with <code className="font-mono text-[12px]">14.5px</code> labels, <code className="font-mono text-[12px]">16px</code> values, and inline copy buttons.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2">
            {[
              { label: 'Reporting Entity Name', value: 'Riverside RSL Club', key: 'dossier_venue' },
              { label: 'Australian Business Number (ABN)', value: '12 345 678 901', key: 'dossier_abn', mono: true },
              { label: 'Designated Service', value: 'Electronic gaming machine (EGM) - payout of winnings', key: 'dossier_service' },
              { label: 'Internal Transaction ID', value: 'TX-570', key: 'dossier_tx', mono: true },
              { label: 'Jackpot Payout Amount', value: '$25,000.00 AUD', key: 'dossier_amt', mono: true },
              { label: 'ID Verification Result', value: 'Pass (Digital ID Match Verified)', key: 'dossier_idv' }
            ].map((item, idx) => (
              <div
                key={idx}
                className={`p-3.5 px-4 relative flex flex-col justify-center min-h-[64px] border-b border-[#edf2f7] ${
                  idx % 2 === 0 ? 'sm:border-r border-[#edf2f7]' : ''
                }`}
              >
                <div className="text-[14.5px] font-bold text-[#475569]">{item.label}</div>
                <div className={`text-[16px] font-medium text-[#0f172a] pr-10 ${item.mono ? 'font-mono text-[15.5px] tabular-nums' : ''}`}>
                  {item.value}
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard(item.key, item.value)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-md flex items-center justify-center text-[#475569] hover:bg-[#edf2f7] hover:text-[#0f172a] transition-colors cursor-pointer bg-transparent border-none"
                  title="Copy value"
                >
                  {copiedKey === item.key ? <Check className="w-4 h-4 text-[#059669]" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* ─────────────────────────────────────────────────────────────
            SECTION 5: RELATIONAL PANELS & FEEDBACK BANNERS
        ───────────────────────────────────────────────────────────── */}
        <section className="bg-white border border-[#d9e2ec] rounded-[10px] shadow-xs p-7 space-y-6">
          <div>
            <h2 className="text-[20px] font-bold text-[#102a43] m-0">5. Relational Panels &amp; Feedback Banners</h2>
            <p className="text-[13.5px] text-[#627d98] mt-1 mb-0">
              Minimalist relational association cards, left-accent compliance notices, and system status callouts.
            </p>
          </div>

          {/* Part A: Relational Association Panels */}
          <div className="space-y-3">
            <h3 className="text-[13px] font-bold text-[#627d98] uppercase tracking-wider">
              Relational Association Cards (Empty &amp; Linked States)
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              
              {/* Unconnected State */}
              <div className="p-4 rounded-lg border border-dashed border-[#cbd5e1] bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 transition-colors hover:border-[#94a3b8]">
                <div className="flex items-start sm:items-center gap-3">
                  <div className="w-9 h-9 rounded-md bg-[#f8fafc] border border-[#e2e8f0] flex items-center justify-center shrink-0 text-[#627d98]">
                    <FileText className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <div className="text-[13px] font-bold text-[#102a43]">No PayTo agreement connected</div>
                    <div className="text-[12px] text-[#627d98] leading-tight mt-0.5">Connect an agreement record to activate automated venue payouts.</div>
                  </div>
                </div>
                <button
                  type="button"
                  className="h-8 px-3 rounded-md text-[12px] font-semibold text-[#0d9488] border border-[#0d9488] hover:bg-[#f0fdfa] transition-colors cursor-pointer inline-flex items-center gap-1.5 shrink-0 self-start sm:self-auto"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Connect agreement</span>
                </button>
              </div>

              {/* Connected State */}
              <div className="p-4 rounded-lg border border-[#cbd5e1] bg-white shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
                <div className="flex items-start sm:items-center gap-3">
                  <div className="w-9 h-9 rounded-md bg-[#f0fdfa] border border-[#ccfbf1] flex items-center justify-center shrink-0 text-[#0d9488]">
                    <CheckCircle2 className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] font-bold text-[#102a43]">PayTo Agreement #AGR-88219</span>
                      <span className="inline-flex items-center px-2 py-0.2 rounded-full text-[10.5px] font-bold bg-[#ecfdf5] text-[#065f46] border border-[#a7f3d0]">Active</span>
                    </div>
                    <div className="text-[12px] text-[#627d98] leading-tight mt-0.5">National Australia Bank (BSB: 083-004 • A/C: •••• 9102)</div>
                  </div>
                </div>
                <button
                  type="button"
                  className="h-8 px-3 rounded-md text-[12px] font-semibold text-[#627d98] border border-[#cbd5e1] hover:text-[#102a43] hover:border-[#94a3b8] hover:bg-[#f8fafc] transition-colors cursor-pointer shrink-0 self-start sm:self-auto"
                >
                  Manage link
                </button>
              </div>

            </div>
          </div>

          {/* Part B: Left-Accent Minimal Feedback Banners */}
          <div className="space-y-3 pt-4 border-t border-[#edf1f4]">
            <h3 className="text-[13px] font-bold text-[#627d98] uppercase tracking-wider">
              Left-Accent Minimal Feedback Banners
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* Amber / Review Banner */}
              <div className="p-4 rounded-lg border border-[#cbd5e1] border-l-[3px] border-l-[#f59e0b] bg-white shadow-2xs flex items-start gap-3">
                <AlertTriangle className="w-4 h-4 text-[#f59e0b] shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <div className="text-[13px] font-bold text-[#102a43]">Compliance Exclusion Notice</div>
                  <p className="text-[12px] text-[#627d98] m-0 leading-relaxed">
                    Patron matches venue exclusion register. Dual management approval required before disbursement.
                  </p>
                </div>
              </div>

              {/* Teal / System Sync Banner */}
              <div className="p-4 rounded-lg border border-[#cbd5e1] border-l-[3px] border-l-[#0d9488] bg-white shadow-2xs flex items-start gap-3">
                <ShieldCheck className="w-4 h-4 text-[#0d9488] shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <div className="text-[13px] font-bold text-[#102a43]">AUSTRAC Sync Operational</div>
                  <p className="text-[12px] text-[#627d98] m-0 leading-relaxed">
                    Statutory threshold calibrated to $5,000 AUD. Automated threshold dispatch active.
                  </p>
                </div>
              </div>

              {/* Red / Critical Action Banner */}
              <div className="p-4 rounded-lg border border-[#cbd5e1] border-l-[3px] border-l-[#dc2626] bg-white shadow-2xs flex items-start gap-3">
                <AlertCircle className="w-4 h-4 text-[#dc2626] shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <div className="text-[13px] font-bold text-[#102a43]">Statutory Ceiling Exceeded</div>
                  <p className="text-[12px] text-[#627d98] m-0 leading-relaxed">
                    Cash payout exceeds statutory $2,000 limit. Remaining balance must disburse via EFT or cheque.
                  </p>
                </div>
              </div>

            </div>
          </div>
        </section>

      </main>
    </div>
  );
}
