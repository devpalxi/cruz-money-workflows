# Memory — Patron self-service verification & Approver/Authoriser dashboards

Last updated: 2026-09-16

## What was built

### 1. Patron self-service verification (committed as `a1621ae`)

A branch in the Collector flow that hands identity and bank verification to the patron's own phone instead of the counter.

- **`nextjs/lib/verificationLink.js`** (new) — the mock "backend". Token issue, status machine (`sent` / `in_progress` / `completed` / `staff_action` / `expired` / `cancelled`), 30-minute expiry, resend, cancel. Records live in `localStorage` keyed by token, **not** sessionStorage, because the collector terminal and the patron's page are different tabs and must read the same record.
- **`nextjs/app/verify/[token]/layout.jsx` + `page.jsx`** (new) — the patron mobile surface. Single client page with an internal step machine (welcome → consent → ID → face → bank → review → submit) rather than sub-routes, so a deep link cannot land someone in a half-finished state. Terminal screens: done, return to counter, expired, closed, invalid.
- **`nextjs/app/collector/(flow)/email-address/page.jsx`** — added phone/first/last name fields, the "Verify at the counter" vs "Send link to patron" segmented rail, and the link-sent confirmation (URL + copy + open patron view).
- **`nextjs/app/collector/(flow)/summary/page.jsx`** — three verification banners (waiting / complete / needs staff), ID and bank sections rendered as "waiting on patron", Resend link / Switch to manual verification / Open patron view actions, switch-to-manual confirm modal, 2s poll of the link record.
- **`nextjs/components/layout/Stepper.jsx`** — "(with patron)" state for steps 4-6; now re-reads sessionStorage on `pathname` change.
- **`nextjs/lib/mockData.js` + `PayoutsView.jsx`** — new `Pending verification` status (amber tier), filter option, 3 seeded records.
- **`DESIGN.md` §6 + `ui-rules.md` §2.8** — documented the patron surface and the sticky-CTA exception, per `agent.md` §4.

### 2. Approver / Authoriser dashboards (uncommitted at time of writing)

- **`nextjs/app/approver/dashboard/page.jsx`**, **`nextjs/app/authoriser/dashboard/page.jsx`** (new) — thin wrappers rendering `PayoutsView` with `role="APPROVER"` / `"AUTHORISER"`.
- **`nextjs/components/views/PayoutsView.jsx`** — two new roles; `Payment ETA` column (between Amount and Status) and `Actions` column (Review link, after Status), both gated to review roles only so admin/super-admin are untouched; role-aware `scenarioForPayout()`; CSV export mirrors visible columns.
- **`nextjs/components/layout/AdminSidebar.jsx`** — `APPROVER`/`AUTHORISER` roles with a single Dashboard link each; footer role-switcher converted from a ternary to a lookup map.
- **`nextjs/lib/mockData.js`** — `paymentEta` derived from status via `PAYMENT_ETA_BY_STATUS` and applied with `basePayouts.map(withPaymentEta)`, rather than hand-editing 96 records.
- **`nextjs/components/layout/AppHeader.jsx`** — defined the missing `superAdminNavLinks`, which was a dormant `ReferenceError` for any `role="SUPER ADMIN"` render.

## Decisions made

- **Patron record is created when the collector submits at Summary**, as `Pending verification`. The win already happened, so the audit trail starts then and an abandoned link leaves a record to chase.
- **Two electronic ID attempts, then hand back to staff.** IDV3 and the no-ID path stay staff-only because `v1-glossary.md` requires a Collector to attest to physically viewing the document — a patron cannot attest about their own.
- **The patron never gets a staff override.** The CoP bypass-with-justification that exists on `bank-account/page.jsx` is deliberately absent; CoP no-match follows the glossary rule (retry limit, then escalate to the Approver).
- **Consent moved to the patron** (`consent.general` / `consent.docs` / `consent.creditheader`) — stronger compliance than staff attesting on their behalf.
- **Capture uses `<input type="file" capture=...>`, not `getUserMedia`** — opens the real camera on a phone, degrades to a file picker, needs no HTTPS, and matches the repo's existing convention.
- **Approver/authoriser dashboards reuse `PayoutsView`, not a fork** — user specified `/admin/dashboard` as the visual reference.
- **Those dashboards show the full register, no default filter**, and their sidebar is Dashboard only (both explicitly chosen by the user over the alternatives).
- **Risk rating column kept** on the review dashboards even though the reference screenshots omit it — it is what an approver is actually assessing.
- **Screenshots supply fields, not styling.** The user's reference images use blue `Awaiting Approval` pills, ALL-CAPS headers and a `✓` in the CoP pill — all three violate `DESIGN.md`. Rendered per the design system instead.

## Problems solved

- **Authoriser has only 7 scenarios, approver has 10.** Missing: `single-hit`, `name-mismatch`, `all-clear`. A naive row-to-scenario mapping silently fell back to `dual-hit`, so a clean low-risk payout would have opened a dual sanctions-and-PEP review. `scenarioForPayout(payout, available)` now lists candidates best-first and picks the first the role actually has. Verified offline: 99/99 rows resolve to valid targets for both roles.
- **Never run `npm run build` while the user's `next dev` is running** — both write to the same `.next` and it corrupts the dev server (symptoms: stale bundles, `usePathname is not defined` from a Fast Refresh artifact). Next 16 also refuses a second `next dev` on the same directory. Use `npm run start -p 3100` against a fresh build for a parallel server instead.
- **`/collector/summary` renders on the first load in a tab and gets stuck on its Suspense fallback on every reload after that**, with React error #418 (hydration). Reproduces identically on the pre-change `HEAD` version, so it is **pre-existing, not caused by this work**. Does not affect real use — a collector reaches Summary by walking the flow (client-side navigation), which works fine.
- Fixed one genuine hydration cause in that file: it rendered `new Date()` during render on a prerendered page, so the build-time timestamp could never match the client's. Now filled in after mount via `renderedAt`.
- `Stepper` lives in the flow layout, which persists across client-side navigation — a mount-only sessionStorage read showed stale choices. Now keyed on `pathname`.

## Current state

- `npm run build` is clean: **48/48 routes, 0 errors, 0 warnings**.
- Patron verification is **verified end to end in a browser**: collector branch, link send, stepper "(with patron)", all three summary banners, the full patron flow, ID-fail-twice hand-back (records `staff_action` / IDV3), switch-to-manual (cancels link, reverts mode, returns to Primary ID), and all terminal screens.
- Approver/authoriser dashboards are **built and compiling but NOT visually verified** — the user explicitly asked not to open a browser. Statically checked: 12 `<th>` vs 12 `<td>` across data/skeleton/empty rows, `colSpan` math, and the scenario mapping run offline over all 99 records.
- Uncommitted: the dashboard work (`AdminSidebar.jsx`, `AppHeader.jsx`, `PayoutsView.jsx`, `mockData.js`, plus the two new dashboard route folders).
- `.claude/launch.json` at the project root defines `riverside-prod` (`npm --prefix nextjs run start -- -p 3100`).

## Next session starts with

Open `/approver/dashboard` and `/authoriser/dashboard` in a browser and compare against `/admin/dashboard` — that is the one piece of this session's work with no visual confirmation. Check pill colours, sentence-case headers, the two new columns, and that Review lands on a sensible review screen.

## Open questions

- **`paymentEta` is invented.** Derived from payout status (`Next business day` / `On authorisation` / `Settled` / `-`) based on the lifecycle in `v1-glossary.md`. If the field has a real backend definition, replace the seed values rather than building on them.
- **The Review link lands on canned scenario data, not the row's own payout.** The `[scenario]` pages read a hardcoded `SCENARIOS` object and are not wired to `initialPayouts`. Connecting them is the obvious next structural fix.
- **Does patron self-service change the risk rating?** Currently it does not — IDV2 still means Medium. Remote unsupervised verification is arguably riskier than a staff-witnessed one. Flagged for compliance, not implemented.
- The nav role badge in `AdminSidebar`/`AppHeader` still uses `uppercase tracking-wider`, which `DESIGN.md` §3 explicitly supersedes. Pre-existing; left alone because changing it would alter admin and super-admin visuals too.
- Two older proposals remain exploratory and unscoped: patron self-service SMS/mobile KYC beyond what was built, and whether "House ID" should ever exist as a field.
