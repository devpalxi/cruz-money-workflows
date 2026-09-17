// Shared disbursement-method routing helpers for the Collector flow.
// disbursementMethod is a "+"-joined label built from any combination of
// atomic methods (Cash / Bank transfer / Cheque) - see payout-details.jsx.
//
// Bank account and Cheque details are always part of the flow - the
// collector visits both regardless of what was selected on the first step.
// Whichever method wasn't picked shows a "not required, you can skip this"
// message on that step instead of the step being skipped over entirely.
// getDisbursementFlags is what each of those pages (and the summary) uses to
// decide whether to show its real form or the skip message.

import { getPatronCoverage } from './verificationLink';

export function getDisbursementFlags(disbursementMethod) {
  const method = disbursementMethod || '';
  return {
    hasCash: method.includes('Cash'),
    hasBank: method.includes('Bank transfer'),
    hasCheque: method.includes('Cheque'),
  };
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

// Where the collector goes once Secondary ID is done or skipped.
export function getStepAfterSecondary(form = readPayoutForm()) {
  return getPatronCoverage(form).bank ? '/collector/cheque-details' : '/collector/bank-account';
}

// Where "Back" from bank account should return to, given which secondary ID
// document (if any) was collected.
export function getStepBeforeBank(secondaryDoc, form = readPayoutForm()) {
  if (getPatronCoverage(form).secondary) return '/collector/email-address';
  return secondaryDoc === 'medicare' ? '/collector/medicare' : '/collector/secondary-id';
}

// Where "Back" from Cheque details should return to.
export function getStepBeforeCheque(form = readPayoutForm()) {
  if (!getPatronCoverage(form).bank) return '/collector/bank-account';
  return getStepBeforeBank(form.secondaryDoc, form);
}
