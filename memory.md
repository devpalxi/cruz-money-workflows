# Memory — Blacklist on Winners page, cash-only bank step, two-approver scenarios

Last updated: 2026-09-21

Work is on branch `feature/dineth`. Everything below was built after commit `9f04fa4` and is **not committed** as far as this session knows (the user commits manually). Last build: 43 routes, 0 errors.

## What was built

### 1. Blacklist merged into the Winners page
- Deleted `app/admin/blacklist` and `app/super-admin/blacklist`, and the "Venue Blacklist" links in `AdminSidebar.jsx` and `AppHeader.jsx`.
- `WinnersView.jsx` now has two tabs: **Winners** and **Blacklist**. The Blacklist tab is `components/views/ExclusionRegisterPanel.jsx` (new); rows are clickable. The tab reads `?tab=blacklist` so the back link returns to it.
- `lib/WinnersContext.jsx` holds a shared `blacklist` (seeded from `initialBlacklist`) beside `winners`. Winner list, winner detail and the Blacklist tab all read and write it.
- A winner's "blacklisted" status is worked out live with `screenPatron` (name + DOB). The old `isBlacklisted` / `blacklistDetails` fields were deleted from `initialWinners` in `mockData.js`.
- `WinnerDetailView.jsx`: "Add to blacklist" writes a real register entry (exclusion type, expiry for self-exclusions; source defaults to State register for self, Venue list otherwise). "Remove" deletes the entry.
- Winners list has a filter by type: All / Active (clear) / Any blacklist type / Self-exclusion / Venue ban.
- The **regulatory** exclusion type was removed. Its 3 entries (bl-002, bl-003, bl-005) are now `venue_ban`. Only `self` and `venue_ban` exist.
- The "N payouts held on self-exclusion" card was removed from `PayoutsView.jsx` for every role, with its dead code.

### 2. Blacklist detail page and release date changes
- `components/views/BlacklistDetailView.jsx` (new), routes `app/admin/winners/blacklist/[id]` and `app/super-admin/winners/blacklist/[id]`. Shows patron details, exclusion details, release date history, linked winner records. Actions: Edit details, Change release date (self-exclusions only), Remove from blacklist.
- `components/shared/ReleaseDateModal.jsx` (new, shared with the winner page). Needs a written reason; the change is logged on the entry as `releaseDateHistory` (who, when, old, new, reason). Moving the date earlier is allowed.
- `WinnerDetailView.jsx` shows a Funds release date row, a Change release date button and the history.
- `lib/exclusionRegister.js` gained `isoToRegisterDate`, `registerDateToIso`, `isoToDobText`, `applyReleaseDateChange`.
- Bug fixed: entries added from the Blacklist tab stored DOB as `1985-02-08` instead of `08/02/1985`, so they never matched a winner.

### 3. Bank step removed for small cash-only payouts
- `lib/payoutFlow.js`: `needsBankStep(form)` is false only when cash is the **only** method and the win is under $5,000 (`AML_THRESHOLD` via `computeComplianceGate`, which is now finally used). $5,000 or more keeps the step.
- Applied in `Stepper.jsx`, `AppHeader.jsx` (row dropped, not greyed), `getStepAfterSecondary`, `getStepBeforeCheque`, `getCollectorResumePath` (takes a `needsBank` argument, passed in to avoid an import cycle), the summary page section, and `bank-account/page.jsx` (redirects to cheque details).
- Cheque was already fully built (step 1 selector, step 2 amount, details step); no change.

### 4. Second AML approver (conditional, UI scenarios only)
- `lib/riskEngine.js`: new `foreignPayment` signal (medium trigger) and `secondApproverConditions`; returns `requiresSecondApprover`. A condition only counts while its signal is switched on.
- `VenueSettingsView.jsx`: "Foreign Payment" toggle added to the signal list.
- Approver page (`app/approver/[scenario]/page.jsx`): routing banner ("2 approver sign-offs required", approver 1 or 2 of 2); a **First approval** accordion section below Collector (second approver only); presets `foreign-payment` and `second-approval` (#588 Sofia Almeida); confirmation wording differs for approver 1 and 2. The Reject payout button was added then removed at the user's request.
- Authoriser page (`app/authoriser/[scenario]/page.jsx`): new preset `foreign-payment` whose "Approver resolution" keeps the common blocks and shows collapsible **Approver 1** (D.Walsh) and **Approver 2** (T.Nguyen) sections (`ApproverSection`). Driven by `approverResolution.approvals` in the scenario data; scenarios without it keep the single layout.

### 5. Approver blacklist popup is view only
- `BlacklistModal` (approver page) now shows only the blacklisted person's record, read from the shared blacklist by name (`screenPatron`). The comparison table, resolution status, notes and evidence upload are gone; only a Close button remains.
- The blacklist row button reads **View resolution**. The "Funds cannot be released: gambling self-exclusion" notice (and its venue ban version) moved from the page into the popup. Approve now has a tooltip hint when disabled for an exclusion.
- `blacklist-match` (John Patron) is not on the register, so it carries its own `blacklistRecord` in the scenario data.

## Decisions made

- **This is a screens-only prototype.** Do not build enforcement, stored approvals or real state machines for scenarios. The user said so explicitly.
- **One blacklist, one source of truth**: the shared `blacklist` in `WinnersContext`, checked live with `screenPatron`. No separate flag on winners.
- **Foreign payment forces two approvers without being called High risk.** The rating stays honest; the second approver is a separate condition.
- **Two approvals show on the authoriser page only where the scenario data carries them**, not from the engine. The user chose a separate scenario over engine-driven.
- **Approver cannot resolve a blacklist match**; that popup is view only. The user said earlier that an Authoriser can approve self-excluded payouts, so early release and date changes were left unrestricted.
- **Cash-only + under $5,000 removes the bank step**; at or above $5,000 it stays for the AUSTRAC record.

## Problems solved

- Risk engine test caught that switching the Foreign Payment signal off still forced a second approver with no trigger visible. Fixed: the condition requires its signal to be on.
- No Python in this shell. Use `node -e` for scripted edits, and splice large blocks by line markers.
- Node ESM cannot import the lib files directly. Working pattern: copy them into the scratchpad `harness/` folder as `.mjs` and rewrite the import specifier with `sed`.
- Disabled buttons do not reliably show their own tooltip, so the hint sits on a wrapping `<span title>`.

## Current state

Everything above builds clean and was checked with offline Node scripts, **not in a browser** (agent.md forbids browser verification). Known gaps, all deliberate:

- `dual-hit`, `no-id`, `blacklist-match`, `high-value` and `self-exclusion` on the authoriser page still show one approver, though the engine rates each as needing two.
- The Payouts dashboard "Releases <date>" note reads fixed sample payouts, so it does not follow a release date changed on a winner or blacklist page.
- All changes live only in browser session state and reset on reload.
- The dev-only `StepTabs.jsx` still shows every step, including the removed bank step.
- Approver and authoriser review screens still read hardcoded `SCENARIOS`, not `initialPayouts` (the older structural gap).
- Approver preset labels reuse numbers 11 and 12 ("11. Self-exclusion hold", "12. Venue ban", "11. Foreign payment", "12. Foreign payment (2nd approver)").
- EFT/cash columns still skip CSV export and the empty-state width.

## Next session starts with

Nothing is mid-flight. Ask the user what they want next. The most valuable structural piece is still wiring the approver and authoriser screens to `initialPayouts`. Smaller options: renumber the approver presets, add occupation to the remaining ID paths, bring `StepTabs.jsx` in line.

## Open questions

- Should the other engine-rated two-approver payouts on the authoriser page also show two approvers?
- Should `Draft` payouts be hidden from Approver and Authoriser queues (same reasoning as the earlier Pending verification removal)?
- The float-account funding alert (PayTo/Zepto insufficient funds) is still deferred and needs a notification surface.

## Standing constraints

From `agent.md` and the user:

- **Never run `git commit` or `git push`.** The user commits manually.
- **`deploy/` is read-only reference.**
- **Always run `npm run build`** and **post a Build Summary** after changes.
- **Do not open a browser to verify.** Use builds and offline Node scripts.
- **Never run `npm run build` while `next dev` is running.**
- Ask before introducing UI patterns not in `DESIGN.md` / `ui-rules.md`.
- The user prefers **simple English** and uses `/architect` before building features: align terms, decide one question at a time, present a plan, wait for "build it".
