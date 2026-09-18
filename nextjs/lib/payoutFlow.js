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
// entirely for a small cash-only payout.

import { getPatronCoverage } from './verificationLink';
import { computeComplianceGate } from './complianceGate';

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
 * A cash-only payout under the AML threshold has no account to collect: no
 * money moves electronically, so there is nothing for CoP to check and
 * nothing the record needs. The step is removed rather than shown as "not
 * required". At or above the threshold the account is still collected even
 * when the whole win is handed over in cash, because the AUSTRAC record wants
 * it. Every other combination keeps the step as it always was.
 */
export function needsBankStep(form = readPayoutForm()) {
  const { hasCash, hasBank, hasCheque } = getDisbursementFlags(form.disbursementMethod);
  const cashOnly = hasCash && !hasBank && !hasCheque;
  if (!cashOnly) return true;

  const { isAMLThresholdMet } = computeComplianceGate(rawAmount(form.winAmount), {
    venueState: form.venueState,
  });
  return isAMLThresholdMet;
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
  if (getPatronCoverage(form).secondary) return '/collector/email-address';
  return secondaryDoc === 'medicare' ? '/collector/medicare' : '/collector/secondary-id';
}

// Where "Back" from Cheque details should return to.
export function getStepBeforeCheque(form = readPayoutForm()) {
  if (needsBankStep(form) && !getPatronCoverage(form).bank) return '/collector/bank-account';
  return getStepBeforeBank(form.secondaryDoc, form);
}
