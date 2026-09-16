# Agent Instructions — Riverside Payouts Platform

This is the master instruction file for all AI agents and developers working on the Riverside Payouts project.
Read this file **in full** at the start of every session before touching any code.

---

## 0. Session Startup Protocol (MANDATORY — Read FIRST)

**At the beginning of every session, before writing or modifying any code, the agent MUST read the following files in order:**

1. `agent.md` (this file — you are reading it now)
2. `nextjs/DESIGN.md` — canonical design tokens, color system, typography, semantic states
3. `nextjs/ui-rules.md` — component inventory, pill/button rules, layout patterns
4. `memory.md` — last session summary, open questions, current state of the codebase
5. `strapi-onboarding-guide.md` — Strapi CMS integration guide, content types, API conventions
6. `v1-glossary.md` — domain terminology, field names, status values, and business logic definitions

If any of these files is missing or appears outdated, flag it to the user before proceeding.

---

## 1. Project Overview

### 1.1 What This Project Is
**Riverside Payouts** is a multi-role SaaS platform for managing gaming venue payout compliance in Australia. It covers:
- Patron identity verification (IDV) and AML screening
- Payout approval and authorisation workflows
- Admin venue management
- Super Admin multi-venue platform oversight
- AUSTRAC SMR reporting
- Venue onboarding

### 1.2 Primary Technology Stack
| Layer | Technology |
|-------|-----------|
| Frontend (production) | **Next.js 16** (App Router, JSX, Tailwind CSS) |
| Styling | Tailwind CSS + inline Tailwind utilities |
| Icons | Lucide React |
| Font (tabular/mono data) | JetBrains Mono |
| No backend in Next.js | All data is mocked; no API calls |
| Reference / visual spec | `deploy/` folder (static HTML prototypes) |

### 1.3 Critical Distinction: deploy/ vs nextjs/

| Folder | Purpose |
|--------|---------|
| `deploy/` | **Read-only visual reference** — static HTML prototypes for design spec only |
| `nextjs/` | **The actual production codebase** — all implementation work happens here |

> ⚠️ **Never modify files in `deploy/` as part of feature work.** Only use them to compare UI layouts and extract design intent.

### 1.4 Key Directories
```
Project 3/
├── agent.md                    ← This file (read every session)
├── memory.md                   ← Session memory / handoff notes
├── deploy/                     ← Visual reference HTML prototypes (read-only)
│   ├── approver_v3.html
│   ├── authoriser_v3.html
│   ├── billing.html
│   ├── dashboard.html
│   └── super-admin-*.html
└── nextjs/                     ← Production Next.js codebase
    ├── DESIGN.md               ← Design token source of truth (read every session)
    ├── ui-rules.md             ← Component rules and registry (read every session)
    ├── app/                    ← Next.js App Router pages
    │   ├── admin/              ← Admin role pages (billing, users, machines, etc.)
    │   ├── super-admin/        ← Super Admin role pages
    │   ├── approver/[scenario] ← Payout approver workflow (dynamic route)
    │   ├── authoriser/[scenario] ← Payout authoriser workflow (dynamic route)
    │   ├── collector/          ← Patron-facing collection flow
    │   └── venue/              ← Venue onboarding flow
    ├── components/
    │   ├── layout/             ← AdminShell.jsx (sidebar + shell)
    │   ├── views/              ← Full-page view components (BillingView, etc.)
    │   ├── shared/             ← Reusable cross-role components
    │   └── ui/                 ← Primitive components (Button, Badge, Input, etc.)
    └── lib/                    ← Utilities and helpers
```

### 1.5 Roles in the System
| Role | Route Prefix | Description |
|------|-------------|-------------|
| Collector | `/collector/` | Patron-facing payout data collection flow |
| Approver | `/approver/[scenario]` | First-level payout review and determination |
| Authoriser | `/authoriser/[scenario]` | Second-level payout authorisation |
| Admin | `/admin/` | Venue administrator: users, billing, machines, blacklist, AUSTRAC |
| Super Admin | `/super-admin/` | Platform-level: all venues, billing oversight, administration |

---

## 2. Standard Workflow for All Tasks

Follow this workflow for every non-trivial task (any change touching more than one file or requiring design decisions):

```
1. RESEARCH   → Read relevant deploy/ reference HTML and existing nextjs/ code
2. PLAN       → Create implementation_plan.md artifact, present to user
3. APPROVAL   → Wait for explicit user approval before writing any code
4. EXECUTE    → Make changes file by file; run `npm run build` to verify
5. SUMMARIZE  → Post a Build Summary (see Section 5 below)
6. NO COMMIT  → Never run git commit or git push; the user handles commits
```

For trivial, clearly scoped fixes (e.g. fix a typo, remove a single button), you may skip the plan and execute directly, but always post a Build Summary.

---

## 3. Design System Enforcement (STRICT)

### 3.1 Core Rule
**Every UI element built in `nextjs/` MUST comply with `nextjs/DESIGN.md` and `nextjs/ui-rules.md`.** There are no exceptions.

Before writing any JSX, ask yourself:
- Does this color, spacing, or radius exist in `DESIGN.md`?
- Does this component shape (pill, button, badge, input) match `ui-rules.md`?
- Am I using semantic state colors correctly (Pass/Warn/Fail/Info/Neutral)?

### 3.2 Design Token Quick Reference
| Token | Value | Use |
|-------|-------|-----|
| Primary | `#0d9488` | Active tabs, primary buttons, teal accents |
| Primary hover | `#0b7a6f` | Hover state for primary buttons |
| Primary light | `#f0fdfa` | Selected row / tab highlight background |
| Page background | `#f7fafc` | Body background |
| Card surface | `#ffffff` | Panels, modals, table containers |
| Border | `#e2e8f0` | Card, divider, resting input borders |
| Text primary | `#0f172a` | Titles, table values, input text |
| Text secondary | `#475569` | Labels, helper text, table headers |
| Pass (green) | `#ecfdf5` / `#065f46` / `#a7f3d0` | bg / text / border |
| Warn (amber) | `#fffbeb` / `#78350f` / `#fde68a` | bg / text / border |
| Fail (red) | `#fef2f2` / `#991b1b` / `#fca5a5` | bg / text / border |
| Info (blue) | `#eff6ff` / `#1d4ed8` / `#93c5fd` | bg / text / border |
| Neutral (slate) | `#f8fafc` / `#475569` / `#cbd5e1` | bg / text / border |

### 3.3 Typography Rules
- **Font stack**: `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif`
- **Monospace / tabular numerals**: Apply `font-mono` / `tabular-nums` to **all** monetary amounts (`$1,250.00`), payout IDs (`PAY-89214`), BSB, account numbers, machine numbers, timestamps
- **Casing**: Strict **Sentence case** for all headings and labels. Acronyms (IDV, AML, KYC, AUSTRAC, BSB, EGM, SMR) remain fully uppercase
- **Font weights**: `700` for primary headings, `600` for buttons and bold labels. Never use `800` or `900`
- **No custom web fonts** like Hanken Grotesk or Outfit — maintain consistency with Collector UI

### 3.4 Component Rules
- **Pills (read-only status)**: `rounded-full` (border-radius 999px), `px-3.5 py-1 text-[13px] font-bold border`
- **Action Buttons (interactive)**: `rounded-md` (border-radius 6px), `h-[44px] px-4 font-bold` for primary; `h-[38px]` for secondary/inline actions
- **Never invent page-local button or badge styles** — import from `components/ui/` or use established Tailwind patterns from `ui-rules.md`
- **Card borders & surfaces**: `border border-[#e2e8f0] rounded-[8px]` with `shadow-sm` ambient depth
- **No Card-in-Card Rule**: Never nest gray/shaded bordered boxes, sub-cards, or nested card containers inside a main card surface. Present detail lists with flat hairline dividers (`divide-y divide-[#eceef2]`) and `.detail-row` items.

### 3.5 Role-specific Theming
- **Admin** role: Teal primary (`#0d9488`) with standard AdminShell
- **Super Admin** role: Deep Teal (`#1a6b6b`) badge tint in AdminShell; same teal primary for actions

---

## 4. New UI Pattern Permission Gate

**If a task requires introducing a UI pattern, component shape, or design token that does NOT exist in `nextjs/DESIGN.md` or `nextjs/ui-rules.md`:**

1. **Stop before building it.**
2. **Ask the user for explicit permission.** Describe:
   - What new pattern is needed
   - Why existing patterns are insufficient
   - What it will look like (description or proposal)
3. **Wait for approval.**
4. **After building it**, update `nextjs/DESIGN.md` and/or `nextjs/ui-rules.md` to document the new pattern, so it is available in all future sessions.

> This ensures the design system stays as the single source of truth and never drifts silently.

---

## 5. Build Summary Protocol (MANDATORY — Post After Every Build)

After every implementation and successful `npm run build`, post a **Build Summary** in the following short format:

```
### ✅ Build Summary

**What was built / changed:**
- [Bullet point description of each change]

**Files modified:**
- `nextjs/path/to/file.jsx` — [what changed]
- `nextjs/path/to/another.jsx` — [what changed]

**How to manually verify:**
1. Start the dev server: `cd nextjs && npm run dev`
2. Navigate to [URL or route]
3. [Specific thing to check]
4. [Repeat for each change]

**Build result:** ✅ X/34 routes, 0 errors
**Git status:** No commits created
```

---

## 6. Hard Constraints (Non-Negotiable)

| Rule | Detail |
|------|--------|
| ❌ No git commit | Never run `git commit` or `git push`. The user commits manually. |
| ❌ No truncated output | Never emit `// ... rest unchanged` or similar placeholder comments in generated code. Always output complete file content. |
| ❌ No deploy/ modifications | The `deploy/` folder is a read-only reference. Never write to it during feature work. |
| ✅ Always run npm run build | After every code change, verify with `cd nextjs && npm run build` before reporting done. |
| ✅ Always post Build Summary | Every completed task must end with a Build Summary (Section 5). |
| ✅ Read md files first | Every session starts with reading `agent.md`, `DESIGN.md`, `ui-rules.md`, `memory.md`. |
| ✅ Ask before new UI patterns | If a pattern isn't in DESIGN.md / ui-rules.md, ask permission first (Section 4). |

---

## 7. Referencing Deploy/ Pages

The `deploy/` HTML prototypes are the **visual specification** for every page. When building or fixing a Next.js page:

1. Open the corresponding `deploy/` HTML file to verify exact layout, colors, copy, and interaction patterns.
2. Match the **visual output** faithfully, but implement it in **React/Tailwind** (not inline HTML styles).
3. Use the deploy/ file for reference on: table structure, modal content, section order, pill/badge states, button labels.
4. Do NOT copy raw CSS class names or inline styles from deploy/ HTML directly into JSX.

### Deploy → Next.js Page Mapping
| deploy/ file | nextjs/ route |
|---|---|
| `approver_v3.html` | `/approver/[scenario]` |
| `authoriser_v3.html` | `/authoriser/[scenario]` |
| `billing.html` | `/admin/billing` + `/super-admin/billing` |
| `dashboard.html` | `/admin/dashboard` |
| `super-admin-dashboard.html` | `/super-admin/dashboard` |
| `super-admin-payouts.html` | `/super-admin/payouts` |
| `super-admin-blacklist.html` | `/super-admin/blacklist` |
| `super-admin-administration.html` | `/super-admin/administration` |
| `admin-machines.html` | `/admin/machines` |
| `admin-users.html` | `/admin/users` |
| `admin-venue-blacklist.html` | `/admin/blacklist` |
| `venue-*.html` | `/venue/onboarding/[step]` |
| `1x-*.html` / `0x-*.html` | `/collector/*` steps |

---

## 8. Current Project Status (Last Updated: 2026-08-25)

### Completed & Stable Pages
- `/admin/billing` — Full venue billing with Usage, Billing history, Payment method, Plan & subscription tabs. Admin can switch tier. ✅
- `/super-admin/billing` — Multi-venue platform overview + drill-down into venue billing (view-only, no plan switching). ✅
- `/approver/[scenario]` — All scenarios implemented with PEP/Sanctions modals, Key Data tabs, audit details. ✅
- `/authoriser/[scenario]` — Mirrors approver with authoriser-specific determination panel. ✅
- `/admin/dashboard` — Payouts table with status pills and filters. ✅
- `/admin/users`, `/admin/machines`, `/admin/blacklist`, `/admin/austrac` — Implemented. ✅
- `/super-admin/dashboard`, `/super-admin/payouts`, `/super-admin/blacklist`, `/super-admin/administration` — Implemented. ✅
- `/collector/*` — Full patron-facing flow (payout details → ID collection → summary). ✅
- `/venue/onboarding/[step]` — Venue onboarding wizard. ✅

### Known Pending / In Progress
- Some Super Admin pages may need parity checks against their `deploy/` counterparts.
- `memory.md` should be updated after each session with current state.

### Design Decisions On Record
- **No nested left sidebars**: Admin/Super Admin billing uses a horizontal tab bar, not a secondary sidebar.
- **Subscription tiers**: Tier 1 (free then \$12/payout), Tier 2 (\$249/mo + \$6/payout, Recommended for Admin), Tier 3 (\$699/mo + \$4/payout).
- **Super Admin billing view**: View-only — no buttons, no Recommended badge, no Active Plan button; active plan indicated by top pill badge only.
- **Monospace numbers**: All monetary values use `font-mono` (no yellow highlights).
- **Consolidated 3-Tier Status Scale**: Blue is removed from operational status pills; delayed and review states (`Payment Delayed`, `Under review`, `Processing`) are consolidated into the Amber bucket (`#fffbeb` / `#78350f`).
- **Portal Navigation Role Badges (Left Nav Bar only)**: Unified Cobalt Blue squircle badges (`rounded-md`, 6px, `bg-[#eff6ff] text-[#1d4ed8] border-[#bfdbfe]`) reserved for navigation headers to show active session context.
- **Data Table Roles (No Pills Rule)**: Roles inside data tables (user rosters) must NEVER be rendered as pills; they render as clean typography (`text-[13px] font-semibold text-[#102a43]`).
- **Tactile Choice Chips & Segmented Rails**: Choice chips feature pure white backgrounds when selected with circular check badges (zero category icons). Segmented rails/toggles use flush button-group ring-inset architecture with sharp, solid corner curves.
- **Relational Panels & Minimal Banners**: Zero nested grey card boxes (`no bg-[#f8fafc]` inside white cards). Relational panels use dashed borders on pure white; feedback banners use the Left-Accent minimal bar architecture (`border-l-[3px]` on white), never solid saturated fills.
