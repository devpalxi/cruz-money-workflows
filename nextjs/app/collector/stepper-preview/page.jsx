'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, ChevronDown, X, Check, Menu } from 'lucide-react';
import AppHeader from '@/components/layout/AppHeader';
import { COLLECTOR_STEPS } from '@/components/layout/Stepper';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

// TEMPORARY comparison page - not part of the real Collector flow.
// Delete this file (app/collector/stepper-preview/) once a direction is picked.

const CURRENT_STEP = 4; // "Primary ID" - used across every mockup below

// Grouping the 8 raw steps into named sections, used by Option 5 - mirrors
// how TurboTax/H&R Block show progress against a handful of sections rather
// than every individual step once the count gets past ~5-6.
const STEP_GROUPS = [
  { name: 'Payout details', lines: ['Payout', 'details'], steps: [1, 2] },
  { name: 'Identity', lines: ['Identity', 'verification'], steps: [3, 4, 5] },
  { name: 'Payment method', lines: ['Payment', 'method'], steps: [6, 7] },
  { name: 'Summary', lines: ['Final', 'summary'], steps: [8] },
];

// Forced two-line label for each of the 8 raw steps, used by Option 8 - same
// deliberate-break approach as Option 9's groups, so every tab reads as two
// lines consistently instead of only wrapping when a title happens to be
// too long.
const STEP_LINES = {
  1: ['New payout', 'details'],
  2: ['Payment', 'breakdown'],
  3: ['Email', 'address'],
  4: ['Primary', 'ID'],
  5: ['Secondary', 'ID'],
  6: ['Bank', 'account'],
  7: ['Cheque', 'details'],
  8: ['Final', 'summary'],
};

function MockPageBody({ children }) {
  return (
    <div className="flex-1 w-full max-w-[1080px] mx-auto px-4 sm:px-6 py-8">
      <main className="w-full max-w-2xl mx-auto">
        <div className="flex items-center gap-6 mb-6">
          <button className="inline-flex items-center gap-1.5 text-[15px] font-bold text-ink-hi hover:text-black transition-colors underline cursor-pointer">
            <ArrowLeft className="w-4 h-4 text-brand" />
            <span>Back</span>
          </button>
          <h1 className="text-xl sm:text-2xl font-bold text-ink-hi">Primary ID</h1>
        </div>
        {children}
        <Card padding="md" className="border-border shadow-card mb-6 space-y-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-[14px] font-semibold text-ink-hi">Document type</label>
            <div className="h-12 px-4 bg-white border border-border rounded-md flex items-center text-base text-ink-hi">
              Australian driver licence
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[14px] font-semibold text-ink-hi">Licence number</label>
            <div className="h-12 px-4 bg-white border border-border rounded-md flex items-center text-base text-ink-hi font-mono">
              12345678
            </div>
          </div>
        </Card>
        <div className="mt-6">
          <Button size="lg" className="w-full h-12 text-[16px] font-semibold">Next</Button>
        </div>
      </main>
    </div>
  );
}

// ---- Option 1: drop the sidebar, rely on AppHeader's horizontal nav only ----
function Option1() {
  return <MockPageBody />;
}

// ---- Option 2: no sidebar + "Step X of Y" line and thin progress bar ----
function Option2() {
  const pct = Math.round((CURRENT_STEP / COLLECTOR_STEPS.length) * 100);
  return (
    <MockPageBody>
      <div className="mb-5 -mt-1">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[13px] font-semibold text-ink-mid">
            Step {CURRENT_STEP} of {COLLECTOR_STEPS.length} &middot; Primary ID
          </span>
          <span className="text-[13px] font-semibold text-ink-lo">{pct}%</span>
        </div>
        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full bg-brand rounded-full transition-all" style={{ width: `${pct}%` }} />
        </div>
      </div>
    </MockPageBody>
  );
}

// ---- Option 3: no sidebar + a step-chip trigger that opens the full list on
// demand. The trigger itself carries real info (mini progress ring + "4 of
// 8"), not a bare "Steps" label, and the panel reuses the same circle/check
// treatment as the real vertical stepper for continuity, in a proper
// elevated card with a pointer connecting it to the trigger ----
function Option3() {
  const [open, setOpen] = useState(false);
  const total = COLLECTOR_STEPS.length;
  return (
    <div className="flex-1 w-full max-w-[1080px] mx-auto px-4 sm:px-6 py-8">
      <main className="w-full max-w-2xl mx-auto">
        <div className="flex items-center gap-6 mb-6">
          <button className="inline-flex items-center gap-1.5 text-[15px] font-bold text-ink-hi hover:text-black transition-colors underline cursor-pointer">
            <ArrowLeft className="w-4 h-4 text-brand" />
            <span>Back</span>
          </button>
          <h1 className="text-xl sm:text-2xl font-bold text-ink-hi">Primary ID</h1>

          <div className="relative ml-auto">
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className={`inline-flex items-center gap-2 h-9 pl-1.5 pr-3 rounded-full border transition-colors ${
                open
                  ? 'border-ink-hi bg-slate-50'
                  : 'border-border bg-white hover:bg-slate-50 hover:border-border-mid'
              }`}
            >
              <span className="w-6 h-6 rounded-full border-[2.5px] border-[#1a202c] bg-white flex items-center justify-center text-[10px] font-bold text-ink-hi flex-shrink-0">
                {CURRENT_STEP}
              </span>
              <span className="text-[13px] font-semibold text-ink-hi whitespace-nowrap">
                Step {CURRENT_STEP} of {total}
              </span>
              <ChevronDown className={`w-3.5 h-3.5 text-ink-mid transition-transform ${open ? 'rotate-180' : ''}`} />
            </button>

            {open && (
              <>
                {/* Pointer connecting the panel to the trigger */}
                <div className="absolute right-5 top-[38px] w-3 h-3 bg-surface-card border-l border-t border-border rotate-45 z-20" />
                <div className="absolute right-0 top-[46px] z-20 w-[280px] bg-surface-card border border-border rounded-xl shadow-modal overflow-hidden">
                  <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                    <span className="text-[13.5px] font-bold text-ink-hi">Payout creation steps</span>
                    <button type="button" onClick={() => setOpen(false)} className="p-0.5 rounded text-ink-mid hover:text-ink-hi hover:bg-slate-100">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <ol className="py-1.5">
                    {COLLECTOR_STEPS.map((s) => {
                      const isDone = s.step < CURRENT_STEP;
                      const isActive = s.step === CURRENT_STEP;
                      return (
                        <li key={s.step}>
                          <div
                            className={`flex items-center gap-2.5 px-4 py-2 ${
                              isDone ? 'cursor-pointer hover:bg-slate-50' : ''
                            }`}
                          >
                            <span
                              className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                                isDone
                                  ? 'bg-[#6b6b6b] text-white'
                                  : isActive
                                  ? 'border-[3px] border-[#1a202c] bg-white'
                                  : 'border-2 border-[#cccccc] bg-white'
                              }`}
                            >
                              {isDone && <Check className="w-3 h-3 stroke-[3]" />}
                            </span>
                            <span className={`text-[13.5px] ${isActive ? 'font-bold text-ink-hi' : isDone ? 'font-medium text-ink-mid' : 'text-ink-lo'}`}>
                              {s.title}
                            </span>
                          </div>
                        </li>
                      );
                    })}
                  </ol>
                </div>
              </>
            )}
          </div>
        </div>

        <Card padding="md" className="border-border shadow-card mb-6 space-y-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-[14px] font-semibold text-ink-hi">Document type</label>
            <div className="h-12 px-4 bg-white border border-border rounded-md flex items-center text-base text-ink-hi">
              Australian driver licence
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[14px] font-semibold text-ink-hi">Licence number</label>
            <div className="h-12 px-4 bg-white border border-border rounded-md flex items-center text-base text-ink-hi font-mono">
              12345678
            </div>
          </div>
        </Card>
        <div className="mt-6">
          <Button size="lg" className="w-full h-12 text-[16px] font-semibold">Next</Button>
        </div>
      </main>
    </div>
  );
}

// ---- Option 4: segmented progress bar (Instagram-story-style) instead of 8
// separate labeled circles - one continuous bar of equal segments, filled as
// steps complete, with the current step named once above it rather than
// repeated in 8 tiny labels ----
function Option4() {
  const total = COLLECTOR_STEPS.length;
  return (
    <MockPageBody>
      <div className="mb-6 -mt-1">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[13px] font-semibold text-ink-mid">Step {CURRENT_STEP} of {total}</span>
          <span className="text-[13px] font-bold text-ink-hi">Primary ID</span>
        </div>
        <div className="flex gap-1">
          {COLLECTOR_STEPS.map((s) => {
            const isDone = s.step < CURRENT_STEP;
            const isActive = s.step === CURRENT_STEP;
            return (
              <div key={s.step} className="h-[5px] flex-1 rounded-full bg-slate-200 overflow-hidden">
                <div
                  className="h-full bg-brand rounded-full transition-all"
                  style={{ width: isDone ? '100%' : isActive ? '55%' : '0%' }}
                />
              </div>
            );
          })}
        </div>
      </div>
    </MockPageBody>
  );
}

// ---- Option 5: grouped sections (TurboTax/H&R Block-style), progress shown
// against a handful of named sections rather than all 8 raw steps ----
function Option5() {
  const activeGroupIndex = STEP_GROUPS.findIndex((g) => g.steps.includes(CURRENT_STEP));
  return (
    <MockPageBody>
      <div className="mb-6 -mt-1">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[13px] font-bold text-ink-hi">{STEP_GROUPS[activeGroupIndex].name}</span>
          <span className="text-[12px] font-semibold text-ink-lo">Step {CURRENT_STEP} of {COLLECTOR_STEPS.length}</span>
        </div>
        <div className="flex gap-1">
          {STEP_GROUPS.map((g, i) => {
            const isDone = i < activeGroupIndex;
            const isActive = i === activeGroupIndex;
            return (
              <div key={g.name} className="h-1.5 flex-1 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${isDone || isActive ? 'bg-brand' : ''}`}
                  style={{ width: isDone ? '100%' : isActive ? '50%' : '0%' }}
                />
              </div>
            );
          })}
        </div>
      </div>
    </MockPageBody>
  );
}

// ---- Option 6: minimal counter + bar, no repeated step name (the H1 already
// says it) - closest to Uber/Instacart driver-onboarding style ----
function Option6() {
  const pct = Math.round((CURRENT_STEP / COLLECTOR_STEPS.length) * 100);
  return (
    <MockPageBody>
      <div className="mb-6 -mt-1 flex items-center gap-2.5">
        <span className="text-[12px] font-bold text-ink-lo tabular-nums flex-shrink-0">
          {CURRENT_STEP}/{COLLECTOR_STEPS.length}
        </span>
        <div className="h-1.5 flex-1 bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full bg-brand rounded-full transition-all" style={{ width: `${pct}%` }} />
        </div>
      </div>
    </MockPageBody>
  );
}

// ---- Option 7: collapsible left drawer, opened via a hamburger icon. Same
// full vertical step list as the original sidebar (circle + connector line +
// full titles), but off-canvas by default so it costs zero width until
// summoned, and slides over the content rather than pushing it (so reopening
// it doesn't yank the form width around) ----
function Option7() {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex-1 w-full max-w-[1080px] mx-auto px-4 sm:px-6 py-8">
      <main className="w-full max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="p-2 -ml-2 rounded-md text-ink-mid hover:text-ink-hi hover:bg-slate-100 transition-colors flex-shrink-0"
            aria-label="Show payout steps"
          >
            <Menu className="w-5 h-5" />
          </button>
          <button className="inline-flex items-center gap-1.5 text-[15px] font-bold text-ink-hi hover:text-black transition-colors underline cursor-pointer">
            <ArrowLeft className="w-4 h-4 text-brand" />
            <span>Back</span>
          </button>
          <h1 className="text-xl sm:text-2xl font-bold text-ink-hi">Primary ID</h1>
          <span className="ml-auto text-[13px] font-semibold text-ink-lo whitespace-nowrap">
            Step {CURRENT_STEP} of {COLLECTOR_STEPS.length}
          </span>
        </div>

        <Card padding="md" className="border-border shadow-card mb-6 space-y-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-[14px] font-semibold text-ink-hi">Document type</label>
            <div className="h-12 px-4 bg-white border border-border rounded-md flex items-center text-base text-ink-hi">
              Australian driver licence
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[14px] font-semibold text-ink-hi">Licence number</label>
            <div className="h-12 px-4 bg-white border border-border rounded-md flex items-center text-base text-ink-hi font-mono">
              12345678
            </div>
          </div>
        </Card>
        <div className="mt-6">
          <Button size="lg" className="w-full h-12 text-[16px] font-semibold">Next</Button>
        </div>
      </main>

      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-slate-900/50 z-30 transition-opacity ${
          open ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setOpen(false)}
      />

      {/* Drawer */}
      <div
        className={`fixed top-0 left-0 h-full w-[280px] bg-surface-card border-r border-border shadow-modal z-40 transition-transform duration-200 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <span className="text-[14px] font-bold text-ink-hi">Payout creation steps</span>
          <button type="button" onClick={() => setOpen(false)} className="p-1 rounded text-ink-mid hover:text-ink-hi hover:bg-slate-100">
            <X className="w-4 h-4" />
          </button>
        </div>
        <nav className="p-5">
          <ol className="space-y-0 relative list-none m-0 p-0">
            {COLLECTOR_STEPS.map((s, i) => {
              const isDone = s.step < CURRENT_STEP;
              const isActive = s.step === CURRENT_STEP;
              const isLast = i === COLLECTOR_STEPS.length - 1;
              return (
                <li key={s.step} className="relative pb-6 last:pb-0 flex items-center gap-3">
                  {!isLast && (
                    <div
                      aria-hidden="true"
                      className={`absolute left-[9px] top-[22px] w-[2px] h-[calc(100%-4px)] ${
                        isDone ? 'bg-[#a8a8a8]' : 'bg-[#dcdcdc]'
                      }`}
                    />
                  )}
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center relative z-10 flex-shrink-0 ${
                      isDone
                        ? 'bg-[#6b6b6b] text-white'
                        : isActive
                        ? 'border-[3px] border-[#1a202c] bg-white'
                        : 'border-2 border-[#cccccc] bg-white'
                    }`}
                  >
                    {isDone && <Check className="w-3 h-3 stroke-[3] text-white" />}
                  </div>
                  <span
                    className={`text-[14.5px] leading-tight ${
                      isActive ? 'font-bold text-[#1a202c] text-[15.5px]' : isDone ? 'font-medium text-[#718096]' : 'font-normal text-[#718096]'
                    }`}
                  >
                    {s.title}
                  </span>
                </li>
              );
            })}
          </ol>
        </nav>
      </div>
    </div>
  );
}

// ---- Shared segment tab used by Options 8 and 9: a label with a thin
// underline progress bar beneath it, matching the reference screenshot ----
function SegmentTab({ label, lines, isActive, isDone, className = '', innerRef, onClick }) {
  const textClass = `text-[13px] leading-snug transition-colors ${
    isActive
      ? 'font-bold text-ink-hi'
      : isDone
      ? 'font-semibold text-ink-mid group-hover:text-ink-hi'
      : 'font-medium text-ink-lo group-hover:text-ink-mid'
  }`;

  return (
    <button
      type="button"
      ref={innerRef}
      onClick={onClick}
      className={`text-left group cursor-pointer ${className}`}
    >
      {/* Fixed-height label area (room for two lines) so the bar below sits
          on the same baseline whether a label wraps or not. When `lines` is
          given, the break is forced deliberately (not left to text-wrap) so
          every tab reads as two lines consistently, regardless of whether
          its own label would otherwise fit on one. */}
      <div className="min-h-[36px] flex flex-col items-start justify-start">
        {lines ? (
          lines.map((line, i) => (
            <span key={i} className={textClass}>{line}</span>
          ))
        ) : (
          <span className={`${textClass} whitespace-nowrap`}>{label}</span>
        )}
      </div>
      <div className="mt-1.5 h-[3px] w-20 rounded-full bg-slate-200 overflow-hidden">
        <div className={`h-full rounded-full ${isDone || isActive ? 'bg-brand' : ''}`} />
      </div>
    </button>
  );
}

// ---- Option 8: the reference pattern applied to all 8 raw steps. Sits
// full-width (up to the same max-w-[1080px] the rest of the page uses) above
// the page's own Back/title row, since it represents the whole flow's steps,
// not just this page's content. Responsive: on iPad-and-up widths (md+)
// there's room to spread the 8 tabs evenly across that width with no
// scrolling; below that (phones / very narrow views) it falls back to a
// horizontally scrollable strip at each tab's natural width, auto-centering
// the current step and fading the trailing edge to hint more content.
// Clickable exactly as before either way. ----
function Option8() {
  const [current, setCurrent] = useState(CURRENT_STEP);
  const activeRef = useRef(null);

  useEffect(() => {
    activeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }, [current]);

  return (
    <div className="flex-1 w-full">
      <div className="relative w-full max-w-[1080px] mx-auto px-4 sm:px-6 pt-6 pb-2 border-b border-border">
        <div className="flex gap-6 md:gap-4 md:justify-between overflow-x-auto md:overflow-visible pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {COLLECTOR_STEPS.map((s) => (
            <SegmentTab
              key={s.step}
              innerRef={s.step === current ? activeRef : undefined}
              lines={STEP_LINES[s.step]}
              isActive={s.step === current}
              isDone={s.step < current}
              onClick={() => setCurrent(s.step)}
              className="flex-shrink-0 md:flex-1 md:min-w-0"
            />
          ))}
        </div>
        {/* Fade hinting there's more to scroll to - only relevant below md, where it scrolls */}
        <div className="pointer-events-none absolute right-0 top-0 bottom-1 w-10 bg-gradient-to-l from-surface-page to-transparent md:hidden" />
      </div>
      <MockPageBody />
    </div>
  );
}

// ---- Option 9: same visual, applied to the 4 grouped sections instead of
// all 8 raw steps - fits in one row with no scrolling, same reason the
// reference screenshot looks clean at 4 items. Also sits full-width above
// the page's own Back/title row. ----
function Option9() {
  const [activeGroupIndex, setActiveGroupIndex] = useState(
    STEP_GROUPS.findIndex((g) => g.steps.includes(CURRENT_STEP))
  );
  return (
    <div className="flex-1 w-full">
      <div className="w-full max-w-[1080px] mx-auto px-4 sm:px-6 pt-6 pb-2 border-b border-border">
        <div className="flex gap-10">
          {STEP_GROUPS.map((g, i) => (
            <SegmentTab
              key={g.name}
              lines={g.lines}
              isActive={i === activeGroupIndex}
              isDone={i < activeGroupIndex}
              onClick={() => setActiveGroupIndex(i)}
              className="flex-1"
            />
          ))}
        </div>
      </div>
      <MockPageBody />
    </div>
  );
}

const OPTIONS = [
  { id: 1, label: 'Option 1 - No sidebar', desc: 'Drop the vertical rail entirely, rely on AppHeader\'s horizontal nav only.', Comp: Option1 },
  { id: 2, label: 'Option 2 - Step label + progress bar', desc: 'No sidebar, plus a "Step X of Y · [name]" line and thin progress bar above the title.', Comp: Option2 },
  { id: 3, label: 'Option 3 - Step chip popover', desc: 'A step-chip trigger ("● 4  Step 4 of 8") opens the full list in a proper elevated panel with a pointer, reusing the real stepper\'s circle/check styling.', Comp: Option3 },
  { id: 4, label: 'Option 4 - Segmented progress bar', desc: 'One continuous bar of 8 equal segments (Instagram-story style) instead of 8 separate labeled circles - the step name is stated once, not repeated 8 times.', Comp: Option4 },
  { id: 5, label: 'Option 5 - Grouped sections', desc: 'Groups the 8 steps into 4 named sections (Payout details, Identity, Payment method, Summary), TurboTax/H&R Block-style. Progress bar shows section progress, not raw step count.', Comp: Option5 },
  { id: 6, label: 'Option 6 - Minimal counter', desc: 'Just "4/8" + a thin bar, no repeated step name since the page title already says it. Closest to Uber/Instacart driver-onboarding.', Comp: Option6 },
  { id: 7, label: 'Option 7 - Collapsible hamburger drawer', desc: 'Hamburger icon opens the exact same full vertical stepper as the original sidebar, sliding in over the content instead of sitting permanently. Zero width cost until opened, and reopening doesn\'t resize the form.', Comp: Option7 },
  { id: 8, label: 'Option 8 - Labeled tabs, 8 steps (scrolling)', desc: 'The insurance-flow reference pattern applied to all 8 raw steps - has to scroll horizontally to fit, with the current step auto-centered and a fade hinting more content.', Comp: Option8 },
  { id: 9, label: 'Option 9 - Labeled tabs, grouped (recommended)', desc: 'Same reference pattern, applied to the 4 grouped sections instead - fits in one row with no scrolling, which is why the reference looks clean at 4 items in the first place.', Comp: Option9 },
];

export default function StepperPreviewPage() {
  const [active, setActive] = useState(1);
  const current = OPTIONS.find((o) => o.id === active);
  const Comp = current.Comp;

  return (
    <>
      <AppHeader role="COLLECTOR" />

      <div className="w-full max-w-[1080px] mx-auto px-4 sm:px-6 pt-6">
        <div className="p-3.5 rounded-lg bg-amber-50 border border-amber-200 mb-4">
          <p className="text-[13.5px] text-ink-mid m-0">
            <strong className="text-ink-hi">Temporary preview page.</strong> Not part of the real flow - for comparing
            stepper layout options only. Delete <code className="font-mono">app/collector/stepper-preview/</code> once a direction is confirmed.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap mb-2">
          {OPTIONS.map((o) => (
            <button
              key={o.id}
              type="button"
              onClick={() => setActive(o.id)}
              className={`px-3 py-1.5 rounded-md text-[13px] font-semibold transition-colors ${
                active === o.id
                  ? 'bg-slate-800 text-white'
                  : 'bg-white border border-border text-ink-mid hover:bg-slate-50'
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>
        <p className="text-[13px] text-ink-mid mb-1">{current.desc}</p>
      </div>

      <div className="border-t border-border mt-2">
        <Comp />
      </div>
    </>
  );
}
