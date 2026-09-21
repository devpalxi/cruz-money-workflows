// Shared disbursement-method routing helpers for the Collector flow.
// disbursementMethod is a "+"-joined label built from any combination of
// atomic methods (Cash / Bank transfer / Cheque) - see payout-details.jsx.
//
// Cheque details is always part of the flow - the collector visits it
// regardless of what was selected on the first step, and it shows a "not
// required, you can skip this" message when cheque wasn't picked.
// getDisbursementFlags is what that page (and the summary) uses to decide
// whether to show its real form or the skip message.
//
// Bank account is the exception: needsBankStep below drops it from the flow
// entirely when no bank transfer is used and the win is under the AML threshold.

import { getPatronCoverage } from './verificationLink';
import { computeComplianceGate, getIdvThreshold, STATE_LABELS } from './complianceGate';
import { getStateIdvThresholds } from './idvThresholds';
import { getVenueComplianceCapture } from './venueCompliance';

export function getDisbursementFlags(disbursementMethod) {
  const method = disbursementMethod || '';
  return {
    hasCash: method.includes('Cash'),
    hasBank: method.includes('Bank transfer'),
    hasCheque: method.includes('Cheque'),
  };
}

// Amounts are persisted formatted ("1,250.00"), so they need the separators
// stripped before they can be compared.
function rawAmount(value) {
  return parseFloat(String(value || '').replace(/,/g, '')) || 0;
}

/**
 * Whether the Bank account step belongs in this payout's flow.
 *
 * The account is only needed when money moves electronically (bank transfer),
 * so CoP has something to check. A payout with no bank transfer (cash only,
 * cheque only, or cash plus cheque) under the AML threshold has no account to
 * collect, so the step is removed rather than shown as "not required". At or
 * above the threshold the account is still collected, because the AUSTRAC
 * record wants it. An empty method keeps the step as it always was.
 */
export function needsBankStep(form = readPayoutForm()) {
  const { hasCash, hasBank, hasCheque } = getDisbursementFlags(form.disbursementMethod);
  if (hasBank || !(hasCash || hasCheque)) return true;

  const { isAMLThresholdMet } = computeComplianceGate(rawAmount(form.winAmount), {
    venueState: form.venueState,
  });
  return isAMLThresholdMet;
}

// A winner paid cleanly inside the venue window (default 90 days) only needs
// the bank check. "Clean" means ID and screening were clear on that payout,
// not a manual ID or No-ID.
export function isRecentClearWinner(player, windowDays = 90) {
  if (!player) return false;
  return player.lastPayoutClear === true && Number(player.lastPayoutDaysAgo) <= windowDays;
}

/**
 * What checks this payout needs.
 *
 * - At or above the state threshold: ID, screening and CoP.
 * - Below it, or a recent clean returning winner: CoP only.
 * A venue set to "require ID on all payouts" is always at or above.
 * `reason` says why ID was skipped so the screens can show it: null (ID needed),
 * 'threshold' or 'returning'.
 */
export function getPayoutRequirements(form = readPayoutForm(), config = {}) {
  const capture = config.capture || getVenueComplianceCapture();
  const stateThresholds = config.stateThresholds || getStateIdvThresholds();
  const venueState = form.venueState || 'NSW';
  const amount = rawAmount(form.winAmount);
  const threshold = getIdvThreshold(venueState, stateThresholds, {
    idvPolicy: capture.idvPolicy,
    idvSkipThreshold: capture.idvSkipThreshold,
  });
  const windowDays = capture.returningWinnerWindowDays ?? 90;
  const returning = form.returningPlayerMatch ? form.returningPlayerData : null;

  let reason = null;
  // No amount yet means the payout can't be judged, so ID stays required.
  if (amount > 0 && amount < threshold) reason = 'threshold';
  else if (isRecentClearWinner(returning, windowDays)) reason = 'returning';

  const requiresIdv = reason === null;
  return {
    requiresIdv,
    requiresScreening: requiresIdv,
    requiresCop: true,
    reason,
    threshold,
    venueState,
    windowDays,
    note:
      reason === 'threshold'
        ? `Under the ID threshold of $${threshold.toLocaleString('en-AU')} for ${STATE_LABELS[venueState] || venueState}`
        : reason === 'returning'
        ? `Paid cleanly ${returning.lastPayoutDaysAgo} days ago (inside ${windowDays} days)`
        : '',
  };
}

// Primary and Secondary ID (and the screening that goes with them) are removed
// from the flow when the rules above don't ask for them.
export function needsIdStep(form = readPayoutForm()) {
  return getPayoutRequirements(form).requiresIdv;
}

// Where Email address goes next: Primary ID, or straight past the ID steps.
export function getStepAfterEmail(form = readPayoutForm()) {
  return needsIdStep(form) ? '/collector/primary-id' : getStepAfterSecondary(form);
}

export function readPayoutForm() {
  try {
    return JSON.parse(sessionStorage.getItem('payoutFormData') || '{}');
  } catch (e) {
    return {};
  }
}

// Steps the patron covered on their phone are passed over entirely, not shown
// with a "not required" message - the collector never had anything to do there.
// Each helper below walks the fixed step order and skips those.

// Where "Back" from Secondary ID returns to. If the patron did their ID on
// their phone there is no Primary ID page to go back to.
export function getStepBeforeSecondary(form = readPayoutForm()) {
  return getPatronCoverage(form).id ? '/collector/email-address' : '/collector/primary-id';
}

// Where the collector goes once Secondary ID is done or skipped. The bank
// account step is passed over when the patron already covered it, and when
// the payout doesn't have one at all.
export function getStepAfterSecondary(form = readPayoutForm()) {
  const skipsBank = getPatronCoverage(form).bank || !needsBankStep(form);
  return skipsBank ? '/collector/cheque-details' : '/collector/bank-account';
}

// Where "Back" from bank account should return to, given which secondary ID
// document (if any) was collected.
export function getStepBeforeBank(secondaryDoc, form = readPayoutForm()) {
  if (!needsIdStep(form)) return '/collector/email-address';
  if (getPatronCoverage(form).secondary) return '/collector/email-address';
  return secondaryDoc === 'medicare' ? '/collector/medicare' : '/collector/secondary-id';
}

// Where "Back" from Cheque details should return to.
export function getStepBeforeCheque(form = readPayoutForm()) {
  if (needsBankStep(form) && !getPatronCoverage(form).bank) return '/collector/bank-account';
  return getStepBeforeBank(form.secondaryDoc, form);
}
