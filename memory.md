# Memory — Approver/Authoriser Payout Details & Post-Approval Split Edit

Last updated: 2026-09-16

## What was built

- **Total amount on Approver/Authoriser payout details** ([`nextjs/app/approver/[scenario]/page.jsx`](file:///d:/DN-75/Edu/DN/Palxi/Project%203/nextjs/app/approver/%5Bscenario%5D/page.jsx), [`nextjs/app/authoriser/[scenario]/page.jsx`](file:///d:/DN-75/Edu/DN/Palxi/Project%203/nextjs/app/authoriser/%5Bscenario%5D/page.jsx)):
  - Added a `formatTotalAmount(cashAmount, transferAmount)` helper (parses the `"AUD X,XXX.XX"` mock strings, sums, reformats) and a new "Total amount" grid cell inserted right after "Transfer amount" in the Payout details panel, on both pages.
  - Moved "Payout type" from a full-width row (`col-span-2`) into the right column so it sits beside "Disbursement policy".
  - Stripped the "Venue policy: " prefix from every `disbursementPolicy` value in both files (10 entries in approver, 8 in authoriser) — now shows just "Cash + Bank transfer" / "Bank transfer only".

- **Post-approval cash/EFT split edit + audit log** ([`nextjs/components/views/WinnerDetailView.jsx`](file:///d:/DN-75/Edu/DN/Palxi/Project%203/nextjs/components/views/WinnerDetailView.jsx), used by `/admin/winners/[id]` and `/super-admin/winners/[id]`):
  - Added an "Edit split" text-link next to "Total payout prize", visible only when `payoutStatus` is `Awaiting Approval`, `Pending Authorisation`, or `Payment Delayed` (hidden once `Payment Completed`/`Failed`/`Rejected`).
  - Modal lets an Admin redistribute `cashDisbursed`/`eftDisbursed`; the two must still sum to the fixed `winAmount` (live-validated, Save disabled otherwise); a reason is required.
  - Added a "Disbursement audit history" block (flat, hairline-divided list, no nested card) showing every edit: admin, timestamp, old split → new split, reason. Empty state: "No changes recorded."
  - Verified end-to-end in-browser: edited WIN-89201 ($500/$1000 → $200/$1300), confirmed audit entry recorded and edit link correctly hidden on a `Payment Completed` record (WIN-89204).

## Decisions made

- **Data model disconnect discovered**: the Approver/Authoriser scenario pages read from a hardcoded `SCENARIOS` const local to each file — not connected to `WinnersContext`/`initialWinners` (the Admin Winners dataset). They represent the pre-approval stage. Any post-approval editing feature belongs on the Winners detail page (`WinnerDetailView.jsx`), which is the only place with a real, mutable, shared payout record.
- **Split edit is redistribute-only**: cash/EFT can be rebalanced but must still sum to the original `winAmount` — changing the total prize amount itself is out of scope (it was already risk-assessed at approval).
- **Status-gated editability**: once `payoutStatus` reaches `Payment Completed`, `Failed`, or `Rejected`, the split is locked — editing after funds have moved was judged a reconciliation/compliance risk, not a correction.
- **Reused existing UI patterns** rather than inventing new chrome for the audit log: same modal shell as the Blacklist modal, same mandatory-justification pattern, flat hairline-divided rows per the "No Card-in-Card" rule (per `agent.md` §4's New UI Pattern Permission Gate).
- **"House ID" proposal dropped**: doesn't exist anywhere in the system (mock data, Machine registry, Strapi schema, glossary) — user confirmed not to integrate it.
- Two other proposals discussed but explicitly NOT implemented (exploratory only, flagged for others to investigate): a patron self-service SMS/mobile KYC intake flow, and pre-submit-only editing being extended (superseded by the split-edit feature above, which covers the post-submit gap).

## Problems solved

- Confirmed via code read that the "street number blocks alpha characters" bug report does not reproduce anywhere in this repo (all `streetNumber` inputs are plain `type="text"`, no regex/numeric restriction, in both `nextjs/` and `deploy/`) — likely a backend/Strapi-only issue, not a frontend one.
- Clarified the difference between `/admin/dashboard` (`PayoutsView.jsx`, reads `initialPayouts`, operational/compliance triage table, all statuses) vs `/admin/winners` (`WinnersView.jsx`/`WinnerDetailView.jsx`, reads `initialWinners` via `WinnersContext`, patron-centric register with real per-record drill-down and disbursement/bank detail).

## Current state

- All 40 Next.js routes compile cleanly with 0 errors (`npm run build` exits 0).
- `WinnerDetailView.jsx` changed on disk after my last edit (via Fast Refresh/dev tooling, not authored this session) — it now also imports `ArrowUpRight`/`AlertCircle` and has a more robust `winner` lookup (matches by id, payoutId, machineId, machineName, or fullName, with `decodeURIComponent`/trim handling). This looked like an unrelated improvement already present when re-read; not verified against a specific prior session, worth a quick sanity check next time this file is touched.
- `.claude/launch.json` was created temporarily for in-browser verification and then deleted — it does not exist in the repo currently. A dev server was already running on port 3000 outside this session's control.
- Fully compliant with `agent.md`, `DESIGN.md`, and `ui-rules.md`.

## Next session starts with

- No pending build task. If asked to continue, check whether the user wants the two exploratory proposals (patron self-service mobile KYC, and any further payout-register/house-ID exploration) turned into real specs, or wants something new.

## Open questions

- None blocking. Two proposals remain explicitly exploratory/unscoped: (1) patron self-service SMS+mobile ID/bank capture flow, (2) whether "House ID" should ever be introduced as a new field if a future requirement surfaces it from the real backend.
