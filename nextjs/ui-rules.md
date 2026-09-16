# Riverside Payouts — Component Rules & Registry (ui-rules.md)

This rulebook defines every shared UI component and pattern in `nextjs/components/`. All AI agents and developers MUST read and adhere to these component rules before constructing or modifying any page.

---

## 1. Core Rule: Zero Inconsistency
1. **Never create page-local custom button, badge, or input styles**. Always import from `@/components/ui/*` or `@/components/shared/*`.
2. **Follow Theme strictly**: Unified Teal (`#0d9488` / `hover:bg-[#0b7a6f]`) for all primary actions across both Admin and Super Admin suites, crisp `#ffffff` cards, `#f4f7f9` / `#f7fafc` page background.
3. **Monospace Tabular Numerals**: Apply `font-mono` / `tabular-nums` to all monetary values (`$1,250.00`), payout IDs (`PAY-89214`), account numbers, and machine numbers.
4. **Pills vs Buttons vs Role Badges**:
   - **Status Pills** (read-only operational status): `rounded-full` (`border-radius: 9999px`), `px-3.5 py-1 text-[13px] font-bold border`.
   - **Action Buttons** (clickable): `rounded-md` (`border-radius: 6px`), `h-[38px] px-4 min-w-[160px] text-[15px] font-bold border cursor-pointer`.
   - **Portal Navigation Role Badges** (left nav bar only): `rounded-md` (`border-radius: 6px`), Cobalt Blue `bg-[#eff6ff] text-[#1d4ed8] border border-[#bfdbfe] px-2 py-0.5 text-[10.5px] font-bold uppercase tracking-wider`.
   - **Data Table Roles** (user rosters/tables): Clean typography (`text-[13px] font-semibold text-[#102a43]`). **NEVER render table roles as pills.**
5. **Strict No Card-in-Card Rule (Banned Nested Containers)**:
   - **NEVER nest shaded boxes, inner cards, or bordered sub-containers inside a main card surface**.
   - No grey container backgrounds (`no bg-[#f8fafc]` inside white cards).
   - Relational association panels use a subtle dashed border on pure white (`border border-dashed border-[#cbd5e1] bg-white rounded-lg p-4`).
   - Feedback banners use the **Tinted Callout Pattern**: a soft tinted background plus a matching colored hairline border, no left-edge stripe (`bg-red-50 border border-red-200`, `bg-amber-50 border border-amber-200`, `bg-teal-50 border border-teal-200`), `rounded-lg p-3.5`. Keep the tint soft - never a saturated fill.
6. **Sentence case, no ALL-CAPS, no em/en dashes** (see DESIGN.md §3 Casing Rule):
   - Every piece of user-facing text is sentence case — headings, labels, table headers, buttons, pills, badges, tags, tooltips, toasts, empty states. Only acronyms stay uppercase (ID, BSB, AML, PEP, TTR, SMR, AUSTRAC, …).
   - Do not apply `uppercase` / `tracking-wider` to capitalised labels anywhere (eyebrows, section labels, table `<th>`, tags, nav badges). Differentiate small labels with size/weight/colour, e.g. `text-[13px] font-semibold text-[#475569]`.
   - Never use `—` or `–` in copy or generated output (narratives, CSV, exports). Use `-`, comma, colon, or parentheses. Avoid other non-ASCII symbols in copy (`>=` not `≥`).
   - This overrides the `uppercase tracking-wider` shown in rule 4 for nav role badges and any label styling in `components/ui/Input.jsx` / `Select.jsx`; those are sentence case with no caps transform.
7. **Minimal separators**: inside a card, prefer whitespace over rules. Use at most one hairline (`border-[#edf2f7]`) to divide a header band from its body; do not put a divider between every row of a key–value list. No decorative rule lines next to labels.

---

## 2. Component Inventory

### 2.1 Buttons (`components/ui/Button.jsx`, `.btn-action-req`)
- **Action Buttons (`.btn-action-req`)**:
  - `Action required` (Warn): `border-[#d97706] text-[#b45309] bg-transparent hover:bg-[#fffbeb] rounded-md h-[38px] px-4 min-w-[160px] text-[15px] font-bold cursor-pointer`.
  - `Blacklist match` (Fail): `border-[#ef4444] text-[#dc2626] bg-transparent hover:bg-[#fef2f2] rounded-md h-[38px] px-4 min-w-[160px] text-[15px] font-bold cursor-pointer`.
  - `View resolution` (Secondary): `border-slate-300 bg-white text-slate-800 hover:bg-slate-50 rounded-md h-[38px] px-4 min-w-[150px] text-[15px] font-bold cursor-pointer`.
- **Primary / Secondary / Danger Buttons**:
  - `primary`: Solid Teal (`bg-[#0d9488]` with `hover:bg-[#0b7a6f]` text-white). Main submit / forward action across all user and admin roles.
  - `secondary`: Clean white with border (`bg-white border border-[#d9e2ec] hover:bg-slate-50 text-[#102a43]`).
  - `danger`: Red action (`bg-[#fef2f2] border border-[#fca5a5] text-[#991b1b] hover:bg-red-100` or solid `bg-red-600`).
  - Standard Sizing: Height `44px` for full submit buttons, `38px` for action buttons, radius `rounded-md` (`6px`).
  - **Placement (Collector flow)**: the primary CTA lives outside the `<Card>`, on the page background with a `mt-6` gap below it - never the last element inside the card. It advances the step, it doesn't save the card's content, so it isn't scoped to the card. Applies even when a step has only one card. A dialog/modal's own confirm-cancel buttons stay inside that modal.
- **No icons on buttons by default**: buttons are text only. The Collector flow uses no button icons at all. Elsewhere, add a leading icon only when the design explicitly calls for one - utility/secondary actions where the glyph aids scanning (`Export CSV`, `Copy`, `Refresh`) - never on a primary submit/forward CTA. A transient loading spinner (e.g. `RefreshCw` while a request is in flight) is not a decorative icon and is allowed.
- **Text-link actions** (inline secondary actions styled as links, not buttons - `Back`, `Edit`, `View history`, `Search a different member`, `Clear filters`): text only, `font-semibold`. On touch (Collector is mostly iPad), underline permanently so the affordance doesn't depend on a hover state. Two standard sizes, same color logic for both:
  - **Small inline actions** (`Edit` next to a value, `View history`, `Search a different member or card`): `text-[13px] font-semibold text-[#475569] hover:text-[#0f172a] underline`.
  - **Primary page-level Back link**: `text-[15px] font-bold text-[#0f172a] hover:text-black underline` (paired with `<ArrowLeft className="w-4 h-4 text-brand" />` - the icon may stay brand-colored as a static accent, only link *hover* must not be brand-tinted).
  Never tint the hover with brand teal on either size - teal is reserved for actions (primary buttons, selected states, focus rings), not link hover feedback; using it on plain text reads as a consumer app, not a finance one.
- **List/dropdown row hover** (country selectors, document-type lists, address suggestions): neutral `hover:bg-slate-50 hover:text-[#0f172a]`, not a brand tint (`hover:bg-brand/10 hover:text-brand`). Reserve the brand-teal `ring`/`bg-[#f0fdfa]` treatment for a row's *selected* state (Segmented Choice Rail, Tactile Choice Chips), never for hover.
- **Field focus is neutral, not brand-colored**: text inputs, selects, and textareas indicate focus with `focus:border-ink-hi focus:ring-2 focus:ring-slate-200` (dark border + a soft neutral ring) - never `focus:border-brand focus:ring-brand/20`. This is the standard, expected way a browser/OS shows "this field is active"; teal stays reserved for actions and true selected states (a checked checkbox, an active segmented option, a chosen choice chip), which are a different signal from "you're currently typing here." Applies to `components/ui/Input.jsx` and `Select.jsx` and every raw `<input>`/`<select>`/`<textarea>` styled inline across the app.

### 2.2 Badges & Status Pills (`components/ui/Badge.jsx`, `StatusPill.jsx`)
- **Geometry**: `border-radius: 9999px` (`rounded-full`), `border: 1px solid`, `font-weight: 700`.
- **3-Tier Operational Status System (`pill-colors.css`)**:
  - `pass` (Green): `bg-[#ecfdf5] text-[#065f46] border-[#6ee7b7]` (Pass, Clear, Match, Active, Payment Completed)
  - `warn & pending` (Amber): `bg-[#fffbeb] text-[#78350f] border-[#fcd34d]` (Payment Delayed, Under review, Processing, Pending, Manual verification, Close match, Medium risk, Awaiting Approval)
  - `fail` (Red): `bg-[#fef2f2] text-[#991b1b] border-[#fca5a5]` (Fail, Hit, No match, High risk, Rejected)
  - `neutral` (Slate): `bg-[#f8fafc] text-[#475569] border-[#cbd5e1]` (Skipped, Inactive)
- **Status Pills vs Role Badges Rule**:
  - Operational statuses use circular pills (`rounded-full`).
  - Blue is removed from status pills and dedicated exclusively to **Portal Navigation Role Badges** in the left nav bar (`rounded-md`, Cobalt Blue).
  - In data tables, roles are plain text (`text-[13px] font-semibold text-[#102a43]`).
- **No Dots Rule**: Status pills are clean text-only badges. Never render leading indicator dots inside status pills.
- **Not for progress**: pills are for operational status only, never for a step/progress indicator (`Step 2 of 4`). Render those as plain text (`text-[13px] font-semibold text-[#475569]`) next to the section header - the sub-progress bar already carries the visual, the pill was redundant chrome.

### 2.3 Choice Groups & Segmented Controls
- **Segmented Choice Rail (Single-Select)**:
  - Seamless flush joined rail: `inline-flex rounded-lg shadow-2xs`.
  - Sibling architecture: First button has `rounded-l-lg`, middle has `-ml-px`, last has `-ml-px rounded-r-lg`.
  - Active button: `relative z-10 bg-[#f0fdfa] text-[#0d9488] font-bold ring-1 ring-inset ring-[#0d9488]`.
  - Inactive button: `relative bg-white text-[#627d98] hover:text-[#102a43] hover:bg-[#f8fafc] ring-1 ring-inset ring-[#cbd5e1]`.
  - Zero container padding, zero double borders, razor-sharp solid corner curves with no fading.
- **Tactile Choice Chips (Multi-Select)**:
  - Clean text labels with trailing circular indicator. **No icons**.
  - Selected state: `bg-white text-[#0d9488] font-bold border-[#0d9488] shadow-xs`. **Zero colored background when selected**.
  - Check indicator: Circular filled badge (`bg-[#0d9488] text-white` with `<Check className="w-2.5 h-2.5 stroke-[3]" />`).
  - Unselected state: `bg-white text-[#627d98] border-[#cbd5e1] shadow-2xs` with empty circular outline.
- **Segmented Boolean Toggle**:
  - Symmetrical joined switch (`rounded-l-lg` and `-ml-px rounded-r-lg shadow-2xs`).
  - `False` (Active): `relative z-10 rounded-l-lg ring-1 ring-inset ring-[#dc2626] bg-[#fef2f2] text-[#dc2626] font-bold` with crimson micro-dot.
  - `True` (Active): `relative z-10 -ml-px rounded-r-lg ring-1 ring-inset ring-[#0d9488] bg-[#f0fdfa] text-[#0d9488] font-bold` with teal micro-dot.
  - Inactive side: `relative bg-white text-[#627d98] hover:text-[#102a43] hover:bg-[#f8fafc] ring-1 ring-inset ring-[#cbd5e1]`.

### 2.4 Relational Association Panels & Feedback Banners
- **Relational Panels (Entity Linking)**:
  - Sits directly on white card.
  - Unconnected State: `border border-dashed border-[#cbd5e1] bg-white rounded-lg p-4` with document icon, clear explanatory text, and ghost button (`+ Connect agreement`).
  - Connected State: `border border-[#cbd5e1] bg-white rounded-lg shadow-2xs p-4` with status pill and manage button.
- **Tinted Callout Feedback Banners**:
  - `rounded-lg p-3.5 shadow-2xs` with a soft tinted background and a matching colored hairline border. No `border-l-[3px]` left-edge stripe.
  - Red (`bg-red-50 border border-red-200`, text `text-red-700`, icon `text-red-500`): errors, validation failures, statutory ceiling and blacklist blocks.
  - Amber (`bg-amber-50 border border-amber-200`, text `text-amber-900`, icon `text-amber-600`): compliance, exclusion, and review notices.
  - Teal (`bg-teal-50 border border-teal-200`, text `text-teal-800`, icon `text-teal-600`): AUSTRAC and operational sync notices, success confirmations.
  - Keep tints soft (the `-50` step). Never a saturated fill.

### 2.5 Form Controls (`components/ui/Input.jsx`, `Select.jsx`, `Checkbox.jsx`, `Toggle.jsx`)
- **Input & Select**:
  - Border: `border-[#d9e2ec] focus:border-ink-hi focus:ring-2 focus:ring-slate-200 outline-none` - focus is neutral ink, never brand teal.
  - Height: `h-[42px]` default; `h-12` (48px, `size="lg"`) for Collector touch-friendly inputs. Keep input text at `16px` (`text-base`) in Collector mode. Do not use `h-14` / `56px`.
  - Background: `bg-white`.
- **Collector sizing ceiling**: In `app/collector/**`, primary CTA is `h-12 text-[16px] font-semibold` full-width; field labels are `text-[14px] font-semibold`; card padding is `padding="md"` (`p-6`). The Collector flow reads one notch gentler than the admin suite, not large-print - no `h-[52px]`, `text-[18px]`, `text-[15.5px]` labels, `font-bold` CTAs, or `padding="lg"`.
- **Collector fields stack, never side by side**: In `app/collector/**`, form fields are always one per row in a single vertical column (`space-y-5`). Do not put two or three fields in a `sm:grid-cols-2` / `sm:grid-cols-3` row, including address parts (unit, street number, suburb, state, postcode) - a straight top-to-bottom read is easier on the floor.
- **Segmented Risk Selector (`RiskSelector`)**:
  - Low (Green), Medium (Amber), High (Red).
  - Active button jumps with distinct border and text color.

### 2.6 Layout & Navigation
- **AdminShell (`components/layout/AdminShell.jsx`)**:
  - Fixed `236px` left sidebar with `pl-[236px]` desktop content container.
  - Navigation role badge: Cobalt Blue squircle (`rounded-md text-[10.5px] font-bold bg-[#eff6ff] text-[#1d4ed8] border border-[#bfdbfe] uppercase tracking-wider`).

### 2.7 Club Membership Lookup Panel (`components/shared/MemberLookupPanel.jsx`)
- **Integration Lookup Surface**:
  - Container: Approver/Authoriser double-bezel accordion shell (`bg-white/50 border border-[#e2e8f0] rounded-[10px] p-[3px]` enclosing an inner `bg-white rounded-[7px] overflow-hidden`).
  - Header: Accordion section header (`px-5 sm:px-6 py-4 border-b border-[#edf2f7]`) featuring `<CreditCard>` icon, title `Club membership database connected (${systemName})`, status pill (`Live API Connected` or `Transitional Iframe`), and `<Button variant="ghost" size="sm" icon={X}>Cancel</Button>`.
  - Search Form: Clean inputs (`h-11 sm:h-12`) with `border-[#e2e8f0] focus:border-ink-hi` and primary action `<Button variant="primary" size="sm">Find member</Button>`.
  - Member Match Review: 2-column key-value grid matching approver Section 2 (`Member identification`) layout with `border border-[#e2e8f0] rounded-[6px] bg-[#f8fafc]/40`, `font-mono tabular-nums` IDs, official `Active / Financial` pill, and compact `<Button variant="primary" size="sm">Use these details</Button>` aligned bottom-right.
  - Page-Bottom Scenario Selector: Prototype mode switcher (`Direct API (${systemName})` / `Embedded Console (Iframe)`) and single demo patron preset (`MEM-10884 (Sarah Jenkins)`) situated in the prototype toolbar at the very bottom of the page in `/collector/payout-details`.
  - Embedded Iframe Console Mode: Browser-style top bar with session URL, lock badge, external launch link, and a realistic embedded floor terminal simulator (`MAX GAMING TERMINAL v4.2`) with live member queries and direct `Import` action to push patron data to Cruz Money.
- **Props**:
  - `systemName`: string (e.g. `'Max Gaming'`, `'LMO'`)
  - `isIframe`: boolean (initial default mode)
  - `mode`: `'api' | 'iframe'` (controlled mode from page)
  - `onModeChange`: function `(mode) => void`
  - `iframeUrl`: string (vendor console URL)
  - `onSelectMember`: function `(member) => void`
  - `onClose`: function `() => void`
- **When to use**: Floor Collector payout workflow (`/collector/payout-details`) to look up and prefill patron identity and contact details directly from club membership systems (via Direct API or Transitional Iframe).
- **When NOT to use**: Do not use for internal staff user search or admin roster filtering (use standard data table search inputs).

---

## 3. Review Checklist for Agents
- [ ] Are all static status indicators rendered as `rounded-full` (`border-radius: 9999px`) pills?
- [ ] Are role badges restricted to navigation headers (`rounded-md`, Cobalt Blue), never rendered as pills in tables?
- [ ] Are user roles in tables rendered as clean typography (`text-[13px] font-semibold text-[#102a43]`)?
- [ ] Are there zero nested grey card containers (`no bg-[#f8fafc]`) inside main white cards?
- [ ] Do choice chips have pure white backgrounds when selected, with zero category icons?
- [ ] Do segmented rails use ring-inset borders with crisp unclipped corners?
- [ ] Are all financial amounts and IDs wrapped in `font-mono` / `tabular-nums`?
- [ ] Is every user-facing string sentence case, with no `uppercase` / `tracking-wider` caps styling anywhere (labels, `<th>`, tags, badges)?
- [ ] Is the copy free of em/en dashes (`—` / `–`) and other non-ASCII typographic symbols, including generated text and CSV/exports?
- [ ] Inside cards, are rows separated by spacing rather than a hairline between every row?
