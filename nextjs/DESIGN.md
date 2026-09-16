# Riverside Payouts Design System (DESIGN.md)

This document establishes the canonical design system tokens, typography scales, color palettes, and UX patterns across all Riverside Payouts interfaces (Collector, Approver, Authoriser, Admin, Super Admin, and Venue Settings).

---

## 1. Visual Theme (Collector Theme Standard)

All pages throughout the system must follow the clean, high-contrast visual language established in **Collector-v4**:
- **Primary Hue**: Deep Teal (`#0d9488`)
- **Background**: Soft administrative neutral (`#f7fafc`)
- **Surfaces**: Crisp white cards (`#ffffff`) with subtle 1px border (`#e2e8f0`)
- **Corners**: Consistent 6px radius (`--r-md`), 8px for outer containers (`--r-lg`), 4px for inner items (`--r-sm`), pill (`9999px`) for badges
- **Shadows**: Flat layout with subtle ambient depth (`0 1px 3px rgba(15, 23, 42, 0.08)`)
- **No Card-in-Card Rule**: Never nest gray/shaded bordered boxes or sub-cards inside a card container. Use flat layouts with subtle hairline dividers (`divide-y divide-[#eceef2]`) and clean `.detail-row` key-value pairs.

---

## 2. Color Palette & State Tokens

### 2.1 Brand & Action
| Token | Hex | Role |
|-------|-----|------|
| `--primary` | `#0d9488` | Primary CTA buttons, active state accents, selected tabs |
| `--primary-dark` | `#0b7a6f` | Hover state for primary buttons |
| `--primary-light` | `#f0fdfa` | Selected item highlight background, active table row hover |
| `--primary-border` | `#99f6e4` | Border for active/selected teal surfaces |

### 2.2 Surface & Layout
| Token | Hex | Role |
|-------|-----|------|
| `--bg-page` | `#f7fafc` | Page body background |
| `--bg-card` | `#ffffff` | Panel, modal, and table container surfaces |
| `--bg-th` | `#f8f9fb` | Table header background |
| `--bg-row-alt` | `#fafbfc` | Alternating table row fill |
| `--bg-hover` | `#f0fdfa` | Interactive row/option hover |

### 2.3 Typography & Ink
| Token | Hex | Role |
|-------|-----|------|
| `--text-hi` | `#0f172a` | Slate-900: Primary titles, table values, input text (Contrast ≥ 12:1) |
| `--text-mid` | `#475569` | Slate-600: Secondary labels, helper descriptions, table headers |
| `--text-lo` | `#94a3b8` | Slate-400: Placeholder text, disabled hints, passive dividers |

### 2.4 Borders
| Token | Hex | Role |
|-------|-----|------|
| `--border` | `#e2e8f0` | Standard card, divider, and resting input borders |
| `--border-mid` | `#cbd5e1` | Emphasized container borders, inactive toggle tracks |
| `--border-focus` | `#0f172a` | Focus border for inputs and interactive controls (`focus:border-ink-hi focus:ring-2 focus:ring-slate-200`) - neutral ink, not brand teal |

### 2.5 Semantic State Rules (Consolidated 3-Tier System)
| Scenario | Background | Text | Border | Scope |
|----------|------------|------|--------|-------|
| **Pass / Active / Clear / Verified** | `#ecfdf5` | `#065f46` | `#a7f3d0` | Operational status pills only (`rounded-full`) |
| **Warn / Review / Pending / Delayed** | `#fffbeb` | `#78350f` | `#fcd34d` | Operational status pills only (`rounded-full`) |
| **Fail / High Risk / Blocked / Error** | `#fef2f2` | `#991b1b` | `#fca5a5` | Operational status pills only (`rounded-full`) |
| **Neutral / Skipped / Inactive** | `#f8fafc` | `#475569` | `#cbd5e1` | Operational status pills only (`rounded-full`) |

> [!NOTE]
> **Consolidated Operational Scale**: Delayed and review states (`Payment Delayed`, `Under review`, `Processing`) are consolidated into the Amber bucket. Blue is completely removed from operational status pills.

### 2.6 Portal Navigation Role Badges (Left Nav Bar only)
| Role Badge | Background | Text | Border | Radius | Placement |
|------------|------------|------|--------|--------|-----------|
| **`SUPER ADMIN`** | `#eff6ff` | `#1d4ed8` | `#bfdbfe` | `rounded-md` (6px) | `AdminSidebar` header only |
| **`ADMIN`** | `#eff6ff` | `#1d4ed8` | `#bfdbfe` | `rounded-md` (6px) | `AdminSidebar` header only |

> [!IMPORTANT]
> **Strict Distinction Rule**:
> - **Operational Statuses** = Circular pills (`rounded-full`, 9999px radius).
> - **Navigation Role Badges** = Cobalt Blue squircles (`rounded-md`, 6px radius) restricted to left sidebar headers.
> - **Data Table Roles** = Clean typography (`text-[13px] font-semibold text-[#102a43]`). **NEVER render user roles in tables as pills.**

---

## 3. Typography Hierarchy

- **System Stack**: `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif`
- **Tabular Mono Stack**: `'JetBrains Mono', monospace` (applied strictly to amounts, IDs, timestamps, BSB, serials)
- **Casing Rule**: Strict **Sentence case** for *all* user-facing text, with no exceptions by component type: page titles, section and card headings, form labels, table column headers, buttons, menu items, status pills and badges, tags, tooltips, toasts, empty states, and helper text. Write "Payment breakdown", not "Payment Breakdown".
  - Only acronyms keep their letters uppercase (ID, KYC, AML, CTF, BSB, EGM, PEP, TTR, SMR, ABN, DVS, COP, AUSTRAC). Everything else in a string that contains an acronym still follows sentence case ("AUSTRAC status", not "AUSTRAC Status").
  - **No ALL-CAPS styling anywhere.** Do not use `text-transform: uppercase`, the Tailwind `uppercase` utility, or letter-spaced caps (`tracking-wider` on a capitalised label) for eyebrows, section labels, table headers, tags, or nav badges. Style small labels with size, weight, and colour instead — e.g. `text-[13px] font-semibold text-[#475569]`.
  - This rule supersedes any older "uppercase" or "tracking-wider" styling mentioned elsewhere in this document or in `ui-rules.md` (including the portal nav role badges, which are also sentence case: "Admin", "Super admin").
- **Punctuation**: Do **not** use em dashes (`—`) or en dashes (`–`) in UI copy or in any text the UI generates for the user (narratives, exports, CSV headers). Use a hyphen (`-`), comma, colon, or parentheses. Likewise avoid other non-ASCII typographic symbols in copy: write `>=` or "or more" rather than `≥`, plain quotes rather than curly quotes.
- **Weights**: Standardize primary headings to `700` (Bold). Avoid `800` or `900` over-bolding.

---

## 4. Component Guidelines

- **Primary Action Buttons**: Height: `44px`, Radius: `6px`, Font size: `15px` / `16px`, Weight: `600`
  - **Collector primary CTA**: full-width, Height: `48px` (`h-12`), Font size: `16px`, Weight: `600`. Do not exceed 16px / 48px or use `700` weight - the flow should read one notch gentler than the admin suite, not large-print.
  - **Placement: outside the card, always** - the primary CTA (`Next`, `Continue`, `Submit`, `Run verification`) sits on the plain page background below the content card(s) with a `mt-6` gap, never as the last row inside a `<Card>`. It is a flow-level action ("advance this step"), not a card-level one ("save this record"), so it should not visually belong to any single card - this holds even on single-card pages, so every step in the flow behaves the same way regardless of how many cards it has. A modal's own action buttons are the one exception (they belong to that dialog).
  - **Text only, no icons by default.** The Collector flow never puts an icon on a button. Elsewhere a leading icon is allowed only on utility/secondary actions where it aids scanning (`Export CSV`, `Copy`, `Refresh`), never on a primary submit/forward CTA. A transient loading spinner is not an icon and is fine.
- **Text-link actions**: inline secondary actions styled as links (`Back`, `Edit`, `View history`, `Clear filters`) are text only, `font-semibold`, permanently underlined on touch surfaces (Collector is mostly iPad, so hover-only affordances don't work), and darken toward black/ink-hi where hover exists. Small inline actions (`Edit`, `View history`) run `text-[13px] text-[#475569]`; the page-level `Back` link runs bolder at `text-[15px] font-bold text-[#0f172a]`. Never tint a link's hover with brand teal - teal is for actions and selected states only. The same applies to dropdown/list-row hover: neutral `hover:bg-slate-50`, not a brand tint.
- **Field focus is neutral**: inputs, selects, and textareas show focus with a dark neutral border plus a soft grey ring (`focus:border-ink-hi focus:ring-2 focus:ring-slate-200`), not brand teal. Teal marks an action or a true selected state (checked, chosen, active) - "you're typing here" is a different, more common signal and should look like the standard one.
- **Form Controls (Inputs, Selects)**: Height: `44px` (standard) or `48px` (`h-12`, Collector touch-friendly mode). Keep input text at `16px` in Collector mode to avoid iOS focus-zoom.
- **Collector field labels**: `text-[14px] font-semibold text-[#0f172a]` (not `15.5px` / `700`). Section headings inside a Collector card: `text-[13px] font-semibold text-[#475569]`.
- **Collector card padding**: `p-6` (24px, `padding="md"`). Reserve `p-8` / `padding="lg"` for marketing-style surfaces, not the payout flow.
- **Checkboxes**: Sized `18px`–`20px`, checked state is brand teal `#0d9488` by default (`components/ui/Checkbox.jsx` default variant) - a checked checkbox is a true selected state, the same category as a chosen choice chip or active segmented option. The neutral ink `#0f172a` is available as the `variant="ink"` opt-out, not the default.
- **Status Pills**: Height: `24px`–`28px`, Radius: `9999px`, Padding: `3px 10px` (text only, no indicator dots)
- **Segmented Choice Rails**: Flush joined rail (`rounded-lg shadow-2xs`). Selected segment takes `relative z-10 ring-1 ring-inset ring-[#0d9488] bg-[#f0fdfa] text-[#0d9488] font-bold`. Corner items own `rounded-l-lg` / `rounded-r-lg`.
- **Tactile Choice Chips**: Pure white background on selection (`bg-white text-[#0d9488] font-bold border-[#0d9488] shadow-xs`) with circular filled check badge. No category icons.
- **Segmented Boolean Toggles**: Symmetric joined switch with red `ring-inset` for False and teal `ring-inset` for True.
- **Relational Association Panels**: Sits directly on white card with dashed border (`border border-dashed border-[#cbd5e1] rounded-lg bg-white p-4`). No nested grey cards.
- **Tinted Callout Banners**: Soft tinted background with a matching colored hairline border, no left-edge stripe. Red (`bg-red-50 border-red-200`) for errors and statutory blocks, Amber (`bg-amber-50 border-amber-200`) for compliance, Teal (`bg-teal-50 border-teal-200`) for system sync and success. Keep the tint at the `-50` step; never a saturated fill.
- **Standard modal shell**: every dialog - confirmation prompts, history/detail popups, anything in an overlay - uses the same container: `bg-surface-card border border-border rounded-xl shadow-modal` over a `bg-slate-900/50 backdrop-blur-sm` full-screen overlay. Don't invent a one-off radius, shadow, or overlay tint per modal; if a page needs a dialog, copy this shell rather than approximating it.
- **A confirm dialog acts, then leaves**: clicking its primary button performs the action and navigates away immediately. It does not show an in-modal "success" message or a timed delay before redirecting - that belongs to the destination page (a Tinted Callout Banner there), not the dialog itself.
- **`tabular-nums` / `font-mono` are for numbers and IDs only**: apply them to monetary amounts, BSBs, account/transaction/machine numbers, and dates - not to plain text fields whose value happens to be short or an acronym (a venue name, a payout type like "EGM"). When auditing a review/summary screen, check each field against what it actually contains, not its formatting alone.
- **Teal for "done"/"active" extends to progress indicators, not just controls**: a completed step in a stepper and the current step you're on are true completed/selected states, exactly like a checked checkbox or a chosen chip - they take brand teal (filled circle + white check for done, teal outline/text for active), not a separate gray scale. If a shared layout component predates this token system (built before `ink-hi`/`ink-mid`/`border-mid`/etc. existed), audit it against these tokens when you next touch it rather than assuming an established component is already compliant.


---

## 5. Flow & Multi-Step Patterns

- **Multi-select fields never enumerate combinations**: when a field lets someone pick more than one of a small set of options (e.g. Disbursement method: Cash / Bank transfer / Cheque), the UI is a genuine multi-select (Tactile Choice Chips) and the resulting label/state is *derived* from whichever atomic options are selected (joined, or checked by substring/membership) - never a hardcoded list of every possible combination. A set of `N` options has `2^N - 1` combinations; enumerating them is a bug waiting to happen the moment a new option is added, since every downstream branch (validation, defaults, dev-toolbar presets) has to be updated in lockstep or it silently falls through to the wrong case.
- **A step that conditionally applies stays in the flow - it never disappears**: if an earlier choice means a later step doesn't apply to this instance (e.g. the Bank account step when "Bank transfer" wasn't selected as a payment method), that step is never removed from the step list, skipped over automatically, or hidden from a summary/review screen. It stays visible everywhere - the stepper, any step-nav header, the final summary - and instead shows a neutral, muted "not required for this payout, you can skip this" state (plain `ink-lo` text, no red/warning color) with an explicit skip action. This is the same treatment already established for "Secondary ID (optional)"; conditionally-relevant steps just extend the same idea to steps whose relevance is determined by data rather than a user's live in-step choice.
- **A review/summary section follows the same rule**: don't hide a summary section just because its step wasn't relevant this time - show it with the same "not required" note the step itself uses, so the summary reads as a complete map of the flow, not a screen that reshapes itself per payout.
