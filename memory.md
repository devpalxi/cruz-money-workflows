# Memory — Countdown column, cash/EFT split, link types, occupation capture, exclusion screening

Last updated: 2026-09-19

All work is on branch `feature/dineth`, committed through `9f04fa4`. Working tree clean.

## What was built

### 1. Time to payment countdown (`67ae477`)

Replaced the invented `paymentEta` with a real countdown to when a payout may be dispatched via PayTo.

- **`nextjs/lib/mockData.js`** — `paymentDueInMinutes` seeded via `NO_PAYMENT_DUE` + `DUE_MINUTES_SPREAD`, standing in for `delayUntil - now`.
- **`nextjs/components/views/PayoutsView.jsx`** — `formatTimeToPayment` (`30min` / `2hrs` / `Overdue`), a hydration-safe `clock` state set in `useEffect`, and `timeToPaymentLabel` / `renderTimeToPayment`. Refresh re-reads the clock and subtracts time spent on the page.
- Column is on **all four** payout dashboards, not just the review roles. `Payment Completed` reads `Settled`; drafts, failures and rejections read `—`.

### 2. EFT and Cash amount columns (`d204eba`)

- **`mockData.js`** — `cashAmount` + `eftAmount` per payout via `CASH_SPLIT_SPREAD`, always summing exactly to `amount`. Cash is clamped to the win, so a small win is all cash and a `0` in the spread gives an EFT-only row.
- **`PayoutsView.jsx`** — both added as **optional** columns (off by default) in the existing Optional columns menu, right-aligned in `ink-mid` so the total stays dominant.
- **Deliberately skipped at the user's instruction:** CSV export, empty-state colSpan, skeleton cells and table min-width. The empty state under-spans by up to 2 cells when these columns are on. Still outstanding.

### 3. Patron link types (`8c672a1`)

The "Send link to patron" flow became four choices instead of all-or-nothing.

- **`nextjs/lib/verificationLink.js`** — `LINK_TYPES` (`id`, `id_secondary`, `id_secondary_bank`, `id_bank`), `getLinkType`, `getCollectorResumePath`, `getPatronCoverage`. Links issued before this change have no type and fall back to the full set.
- **`nextjs/lib/payoutFlow.js`** — `getStepBeforeSecondary`, `getStepAfterSecondary`, `getStepBeforeBank`, `getStepBeforeCheque`, so collector pages skip whatever the patron covered.
- **`email-address/page.jsx`** — the 4-option selector (bank options disabled when Bank transfer wasn't selected), link type stored on the record, **Continue gated on link status**, and a `storage` event listener instead of polling.
- **`verify/[token]/page.jsx`** — stages derived from the link type, a new **Secondary ID** step (Medicare capture, re-runnable pass/fail), Medicare removed from primary options when secondary is included.
- **`Stepper.jsx`, `summary/page.jsx`** — skip and source sections by link type rather than "link mode = everything".

### 4. Occupation capture (`9a66c5c`)

- **`nextjs/lib/venueCompliance.js`** (new) — localStorage-backed venue setting, `isOccupationCaptureEnabled`, `formatOccupation`. **Off by default.**
- **`VenueSettingsView.jsx`** — *Capture patron occupation* toggle under Payout & compliance controls.
- **`licence-detail` / `passport-detail`** — optional free-text field on the Personal details step.
- **`verify/[token]`** — same question on the ID step after the document passes.
- **Approver review** — an Occupation row in Member identification on **every** payout, reading *Not collected* when absent.
- **AUSTRAC helper** — reads the real value, keeping the manual-lookup flag when blank.

### 5. Pending verification removed from review queues (`b31f190`)

`HIDDEN_FROM_REVIEW_QUEUE` in `PayoutsView.jsx` filters those rows out for Approver and Authoriser, and drops the status from their filter menu. The old `isReviewable` gate and its `—` placeholder are gone — every visible row in a review queue now has a Review link. Admin and Super Admin still see them.

### 6. Gambling exclusion screening (`5be8963`, `a51a47f`, `9f04fa4`)

The largest piece. Register entries now carry an **exclusion type**, a **source**, and (self-exclusions only) an **expiry**.

- **`nextjs/lib/exclusionRegister.js`** (new) — `EXCLUSION_TYPES` (`self` / `venue_ban` / `regulatory`), `screenPatron`, `getExclusionHold`, `EXCLUSION_HOLD_STATUS`, date helpers. **Takes the register as an argument and does not import `mockData`** — `mockData` imports this, so importing back would be a cycle.
- **`components/shared/ExclusionAlert.jsx`** (new) — the collector banner, red for a hold, amber otherwise.
- **`mockData.js`** — three more register entries (incl. one already-expired), and `withExclusionHold` applied to `initialPayouts`. Screening runs against a **fixed date** (`EXCLUSION_SCREENING_NOW = 2026-07-14`) so prerendered pages match the client.
- **Both blacklist pages** — Type, Source, Expires columns; the expiry input only appears for self-exclusions.
- **Collector** — banner on payout details (member-lookup only), both ID detail pages (name + DOB), and summary.
- **Approver** — Approve disabled for a live self-exclusion, with a **Refer to Authoriser** button in its place; note mandatory for other types. New `self-exclusion` and `venue-ban` presets.
- **Authoriser** — override panel with a mandatory reason; Authorise disabled until filled. New `self-exclusion` preset.
- **PayoutsView** — red `Exclusion hold` pill, `Releases <date>` in the Time to payment column, a held-funds tile above the table that filters on click, and a status filter option.

## Decisions made

- **Exclusion holds are applied at submission, automatically.** Screening is a lookup, not a judgement, and doing it up front closes the window where money could be released before anyone reviewed it.
- **`Exclusion hold` is its own status**, not `Payment Delayed` with a flag — a gambling-harm hold must not read as a slow payment.
- **Releasing a hold returns the payout to `Awaiting Approval`**, not to approved. Lifting the block is not approval.
- **The collector is warned, never blocked.** The win happened and needs recording; only the money is held.
- **The self-exclusion override belongs to the Authoriser alone**, with a written reason.
- **An expired self-exclusion releases on its own**, so a stale entry can't strand funds.
- **Occupation is optional even when the venue toggle is on**, and the approver row is **not gated on risk** — risk is selected at the bottom of the review page, so a row appearing after that decision would never be read.
- **Continue unlocks via the cross-tab `storage` event**, not polling.

## Problems solved

- **`setDisbursementMethodOpen is not defined`** — the disbursement dropdown became a checkbox group but three "close the other dropdowns" handlers still called the removed setter. Fixed twice: the file was reverted on disk between attempts, so check the editor doesn't hold a stale buffer.
- **Import cycle** — `exclusionRegister` originally imported `initialBlacklist`; `mockData` needs `screenPatron`. Resolved by passing the register in as an argument.
- **Hydration (React #418)** — both the countdown clock and exclusion screening read a date. The clock is set in `useEffect`; screening uses a fixed constant.
- **Back links reading sessionStorage during render** would mismatch between server and client. Resolved by computing them after mount.
- **Bash heredocs mangle backslashes and some quoting** in this environment. Write Python helper scripts into the scratchpad with the Write tool and run them by path instead.
- **`node -e` can't import the lib files directly** (ESM needs explicit extensions). The working pattern is a `.mjs` harness in the scratchpad that copies the files and rewrites the import specifier.

## Current state

Everything above builds clean: **43/43 routes, 0 errors, 0 warnings**, and is committed. Verified offline across all fixtures — 10 held payouts totalling $110,000, every exclusion type resolving correctly per role, all four link types routing correctly.

Known gaps, all deliberate:

- **The EFT/cash step 3 work was skipped at the user's request.** CSV export omits both columns, the empty-state colSpan and skeleton rows are short by up to 2 cells when they're enabled, and the table min-width wasn't widened.
- **The approver and authoriser review screens still read from hardcoded `SCENARIOS` fixtures, not `initialPayouts`.** This is the single biggest structural gap. `scenarioForPayout` picks the closest-matching scenario, so a row does not open its own record — the detail shown is the scenario's. **Refer to Authoriser is presentational** for the same reason: it shows a confirmation but doesn't move the payout between queues.
- **Occupation is not captured on the `medicare`, `other-documents` or `no-id` paths** — they have no Personal details step. Those payouts reach the approver as *Not collected*.
- **The Admin dashboard shows only 1 held payout ($24,000)** because the rest sit at other venues. Correct, not a bug — Super Admin shows all 10.
- **Already-issued verification links keep whatever they were created with**, including the old empty `winAmount` and no link type.

## Next session starts with

Nothing is mid-flight. The user was last asking for written overviews of the exclusion feature, not code.

The highest-value next piece is **wiring the approver and authoriser review screens to `initialPayouts`** instead of the `SCENARIOS` fixtures. That one change would make Refer to Authoriser real, let a row open its own record, and remove the `scenarioForPayout` guesswork. It is also the prerequisite for anything that needs a payout to actually change state.

Smaller, self-contained options if that's too big: finish the EFT/cash step 3 cleanup, or add occupation to the three remaining ID paths.

## Open questions

- **`Draft` still appears in the Approver and Authoriser queues** (5 rows). By the same reasoning that removed `Pending verification` — the collector hasn't submitted it — drafts arguably don't belong there either. Flagged to the user, not yet decided. One-word change to `HIDDEN_FROM_REVIEW_QUEUE`.
- **The float-account funding alert** triggered by a PayTo/Zepto insufficient-funds error was explicitly deferred as separate follow-up work during the countdown feature. Still open, and needs a notification surface the prototype doesn't have.
- **State-based exclusion registers** are modelled as a `source` field only. There is no separate state register integration.

## Standing constraints

From `agent.md` §6 and the user directly:

- **Never run `git commit` or `git push`** — the user commits manually.
- **`deploy/` is read-only reference.**
- **Always run `npm run build`** and **always post a Build Summary** after building.
- **Do not open a browser to verify.** Verify with builds and offline Node scripts against the fixtures.
- **Never run `npm run build` while `next dev` is running.**
